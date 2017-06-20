/**
 * Created by Felix on 19-6-2017.
 */

var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../server.js');
var chould = chai.should();
var token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE0OTg4MTYzOTAsImlhdCI6MTQ5Nzk1MjM5MCwic3ViIjoid2l0Lmplc3NlLmRlQGdtYWlsLmNvbSJ9.ciCzGdB6ADljLQVUW9O8CouQjOxBYsdqL6-qCIaeBs0';

chai.use(chaiHttp);

describe('Film endpoints', function () {
    it('GET /api/v1/films', function (done) {
        chai.request(server)
            .get('/api/v1/films')
            .end(function (err, res) {
                res.should.have.status(200);
                res.body.should.be.a('object');
                done();
            });
    });
    it('GET /api/v1/films/1', function (done) {
        chai.request(server)
            .get('/api/v1/films/1')
            .end(function (err, res) {
                res.should.have.status(200);
                res.body.should.be.a('array');
                done();
            });
    });
});

describe('Register', function () {
    it('POST /api/v1/register', function (done) {
        chai.request(server)
            .post('/api/v1/register')
            .send({ email: 'nieuweemail12@gmail.com', password: 'test', firstname: 'Succesvolle', lastname: 'test' })
            .set('Content-Type', 'application/json')
            .end(function(err, res){
                res.should.have.status(200);
                res.body.should.be.a('object');
                done();
            });
    });
    it('POST /api/v1/register', function (done) {
        chai.request(server)
            .post('/api/v1/register')
            .send({ email: 'wit.jesse.de@gmail.com', password: 'test', firstname: 'Falende', lastname: 'test' })
            .set('Content-Type', 'application/json')
            .end(function(err, res){
                res.should.have.status(400);
                res.body.should.be.a('object');
                done();
            });
    });
});

//test login feature
describe('Login endpoint', function () {
    it('POST /api/v1/login', function (done) {
        chai.request(server)
            .post('/api/v1/login')
            .send({'email': 'wit.jesse.de@gmail.com', 'password': 'jemoeder'})
            .set('Auth', token)
            .set('Content-Type', 'application/json')
            .end(function (err, res) {
                res.should.have.status(200);
                res.body.should.be.a('object');
                done();
            });
    });
    it('POST /api/v1/login', function (done) {
        chai.request(server)
            .post('/api/v1/login')
            .send({'email': 'wit.jesse.de@gmail.com', 'password': 'foutwachtwoord'})
            .set('Auth', token)
            .set('Content-Type', 'application/json')
            .end(function (err, res) {
                res.should.have.status(401);
                res.body.should.be.a('object');
                done();
            });
    });
});

describe('Rentals', function () {
    it('GET /api/v1/rentals/7', function (done) {
        chai.request(server)
            .get('/api/v1/rentals/7')
            .set('Content-Type', 'application/json')
            .set('Auth', token)
            .end(function(err, res){
                res.should.have.status(200);
                res.body.should.be.a('object');
                done();
            });
    });
    it('POST /api/v1/rentals/7/15', function (done) {
        chai.request(server)
            .post('/api/v1/rentals/7/15')
            .send({ cusomterid: '7', inventoryid: '5'})
            .set('Content-Type', 'application/json')
            .set('Auth', token)
            .end(function(err, res){
                res.should.have.status(200);
                res.body.should.be.a('object');
                done();
            });
    });
    it('DELETE /api/v1/rentals', function (done) {
        chai.request(server)
            .delete('/api/v1/rentals/7/15')
            .send({'email': 'wit.jesse.de@gmail.com', 'password': 'jemoeder'})
            .set('Auth', token)
            .set('Content-Type', 'application/json')
            .end(function (err, res) {
                res.should.have.status(200);
                res.body.should.be.a('object');
                done();
            });
    });
});