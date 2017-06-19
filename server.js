/**
 * Created by jesse on 15-06-2017.
 */
var config = require('./config.json');

var http = require('http');
var express = require('express');
var bodyParser = require('body-parser')

var app = express();

app.use(bodyParser.urlencoded({ extended:true }));
app.use(bodyParser.json());

app.set('PORT', config.webPort);
var port = process.env.PORT || app.get('PORT');


app.use('/api/v1', require('./routes/routes_api_v1'));

//always log request method and url to console
app.all('*', function(request, response, next) {
    console.log(request.method + " " + request.url);
    next();
});

//if no existing page was found, show 404
app.all('*', function (req, res) {
    res.status(404);
    res.send('404 - PAGE NOT FOUND');
});

app.listen(port, function() {
    console.log('Server is running on port 8080');
});



module.exports = app;
