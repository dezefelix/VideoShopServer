/**
 * Created by jesse on 15/06/2017.
 */
// API version 1
var express = require('express');
var router = express.Router();
var pool = require('../db/db_connector');
var bcrypt = require('bcrypt-nodejs');
var auth = require('../auth/authentication');
var saltRounds = 10;

//register a customer
router.post('/register', function (req, res) {

    var email = req.body.email || '';
    var password = req.body.password || '';
    var firstName = req.body.firstname || '';
    var lastName = req.body.lastname || '';

    bcrypt.genSalt(saltRounds, function (err, salt) {
        bcrypt.hash(password, salt, null, function (err, hash) {
            password = hash;

            pool.getConnection(function (err, con) {
                con.query('INSERT INTO customer (first_name, last_name, email, password, active, create_date, last_update) VALUES ' +
                    '("' + firstName + '", "' + lastName + '", "' + email + '", "' + password + '", 0, now(), now());', function (error) {
                    con.release();
                    if (error) {
                        res.status(400).json({"error": "registration failed"});
                    } else {
                        res.status(200).json({"registration": "success"});
                    }
                });
            });
        });
    });
});

//Endpoint uit de opdrachtbeschrijving aangepast, werkt anders niet.
//select all films with a query, specifying offset and limit.
router.get('/films', function (req, res) {
    var offset = req.query.offset || '';
    var count = req.query.count || '';
    var query = '';

    if (offset && count) {
        query = 'SELECT * FROM film LIMIT ' + count + ' OFFSET ' + offset + ';'
        console.log("1");
    } else if (count) {
        query = 'SELECT * FROM film LIMIT ' + count + ';';
        console.log("3");
    } else {
        query = 'SELECT * FROM film;';
        console.log("4");
    }

    pool.getConnection(function (err, connection) {
        connection.query(query, function (err, rows, fields) {
            connection.release();
            if (err) {
                res.status(400).json(({"error": "operation failed, try again"}));
            }
            res.status(200).json({"films": rows});
        });
    });
});

//select all films or one film by name
router.get('/films/:filmid?', function (req, res) {

    var filmID = req.params.filmid || '';
    var query = '';

    if (filmID) {
        query = 'SELECT * FROM film WHERE film_id = ' + filmID + ';'
    } else {
        query = 'SELECT * FROM film';
    }

    pool.getConnection(function (err, connection) {
        connection.query(query, function (err, rows, fields) {
            connection.release();
            if (err) {
                res.status(400).json(({"error": "operation failed, try again"}));
            }
            res.status(200).json(rows);
        });
    });
});

//every endpoint below, except for /login, needs JWT authorization
router.all(new RegExp("[^(\/login)]"), function (req, res, next) {

    console.log("VALIDATING TOKEN");

    var token = (req.header('Auth')) || '';

    auth.decodeToken(token, function (err, payload) {
        if (err) {
            console.log('Error handler: ' + err.message);
            res.status((err.status || 401 )).json({error: new Error("Not authorised").message});
        } else {
            next();
        }
    });
});

//login user and return a JWT
router.post('/login', function (req, res) {
    var email = req.body.email || '';
    var password = req.body.password || '';

    pool.getConnection(function (err, con) {
        con.query("SELECT * FROM customer WHERE email = '" + email + "';", function (err, rows) {
            con.release();
            if (err) {
                throw err;
            }
            var hashPass = rows[0].password;
            bcrypt.compare(password, hashPass, function (err, response) {
                if (response) {
                    res.status(200).json({
                        "token": auth.encodeToken(email),
                        "customerID": rows[0].customer_id
                    });
                } else {
                    res.status(401).json({"error": "Invalid credentials"});
                }
            });
        });
    });
});

//retrieve all rented films from a customer (referred to by customer ID)
router.get('/rentals/:customerid', function (req, res) {

    var customerId = req.params.customerid;

    var query = "SELECT rental_id, rental.inventory_id, title, rental_date, customer_id, return_date, rental_duration " +
        "FROM rental " +
        "INNER JOIN inventory " +
        "ON rental.inventory_id = inventory.inventory_id " +
        "INNER JOIN film " +
        "ON film.film_id = inventory.film_id " +
        "WHERE customer_id = " + customerId +
        " AND active = 1";

    pool.getConnection(function (err, connection) {
        connection.query(query, function (err, rows) {
            connection.release();
            if (err) {
                res.status(400).json({"Retrieve films": "failed"});
            } else {
                res.status(200).json({"rentals": rows});
            }
        });
    });
});

router.get('/getcopies/:filmid', function (req, res) {

    var filmID = req.params.filmid;

    var query = "SELECT COUNT(*) AS Amount FROM rental " +
        "INNER JOIN inventory ON rental.inventory_id = inventory.inventory_id " +
        "INNER JOIN film ON inventory.film_id = film.film_id" +
        " WHERE rental.active = 0 AND film.film_id = " + filmID + " ORDER BY rental.inventory_id;";

    pool.getConnection(function (err, connection) {
        connection.query(query, function (error, rows) {
            if (error) {
                res.status(400).json({"Retrieve films": "failed"});
            } else {
                res.status(200).json({"copies": rows});
            }
            connection.release();
        });
    });
});

//create new rental (referred to by customer ID & inventory ID)
router.post('/rentals/:customerid/:inventoryid', function (req, res) {

    var customerId = req.params.customerid;
    var inventoryId = req.params.inventoryid;

    var query = "INSERT INTO rental " +
        "VALUES (NULL, DATE_ADD(NOW(), INTERVAL 2 HOUR), " + inventoryId + ", " + customerId + ", NULL, DATE_ADD(NOW(), INTERVAL 2 HOUR));";

    pool.getConnection(function (err, connection) {
        connection.query(query, function (err, rows) {
            connection.release();
            if (err) {
                res.status(400).json({"Create rental": "failed"});
            } else {
                res.status(200).json({"Create rental": "successful"});
                console.log('Rental with customer ID "' + customerId + '" and inventory ID "' + inventoryId + '" has been created.');
            }
        });
    });
});

//update existing rental (referred to by customer ID & inventory ID)
router.put('/rentals/:customerid/:inventoryid', function (req, res) {

    var customerId = req.params.customerid;
    var inventoryId = req.params.inventoryid;

    var query = "UPDATE rental " +
        "SET return_date = DATE_ADD(NOW(), INTERVAL 2 HOUR), " +
        "active = 0 " +
        "WHERE customer_id = '" + customerId + "' AND inventory_id = '" + inventoryId + "';";

    pool.getConnection(function (err, connection) {
        connection.query(query, function (err, rows) {
            connection.release();
            if (err) {
                res.status(400).json({"Update rental": "failed"});
            } else {
                res.status(200).json({"Update rental": "successful"});
                console.log('Rental with customer ID "' + customerId + '" and inventory ID "' + inventoryId + '" has been updated.');
            }
        });
    });
});

//delete existing rental (referred to by customer ID & inventory ID)
router.delete('/rentals/:customerid/:inventoryid', function (req, res) {

    var customerId = req.params.customerid;
    var inventoryId = req.params.inventoryid;

    var query = "DELETE FROM rental WHERE customer_id = '" + customerId + "' AND inventory_id = '" + inventoryId + "';";

    pool.getConnection(function (err, connection) {
        connection.query(query, function (err, rows) {
            connection.release();
            if (err) {
                res.status(400).json({"Delete rental": "failed"});
            } else {
                res.status(200).json({"Delete rental": "successful"});
                console.log('Rental with customer ID "' + customerId + '" and inventory ID "' + inventoryId + '" has been deleted.');
            }
        });
    });
});

module.exports = router;
