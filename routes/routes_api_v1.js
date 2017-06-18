/**
 * Created by jesse on 15/06/2017.
 */
// API version 1
var express = require('express');
var router = express.Router();
var pool = require('../db/db_connector');
var bcrypt = require('bcrypt-nodejs');
var auth = require('../auth/authentication');
const saltRounds = 10;

router.get('*', function (request, response) {
    response.status(200);
    response.json({
        "description": "Recipes REST server API version 1 is no longer supported. Please use API version 2."
    });
});

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
                        res.status(400).json({"error":"registration failed"});
                    } else {
                        res.status(200).json({"registration": "success"});
                    }
                });
            });
        });
    });
});

//select all films or one city by name
router.get('/cities/:id?', function (req, res) {

    var cityID = req.params.id || '';
    var query = '';

    if (cityID) {
        query = 'SELECT * FROM city WHERE ID = "' + cityID + '";'
    } else {
        query = 'SELECT * FROM city';
    }

    pool.getConnection(function (err, connection) {
        connection.query(query, function (err, rows, fields) {
            connection.release();
            if (err) {
                throw err
            }
            res.status(200).json(rows);
        });
    });
});

router.all(new RegExp("[^(\/login)]"), function (req, res, next) {

    console.log("VALIDATE TOKEN");

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
            bcrypt.compare(password,hashPass, function(err, response) {
                if(response) {
                    res.status(200).json({"token": auth.encodeToken(email)});

                } else {
                    res.status(401).json({"error":"Invalid credentials"});
                }
            });

        });
    });
});

router.get

module.exports = router;
