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
var port = app.get('PORT');

app.all('*', function(request, response, next) {
    console.log(request.method + " " + request.url);
    next();
});

app.use('/api/v1', require('./routes/routes_api_v1'));

app.listen(port, function() {
    console.log('Server is running on port 8080');
});

module.exports = app;
