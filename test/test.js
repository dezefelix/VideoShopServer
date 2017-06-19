/**
 * Created by Felix on 19-6-2017.
 */

var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../server.js');
// var chould = chai.should();

chai.use(chaiHttp);

describe('Film endpoints', function () {
    it('GET /api/v1/films', function (done) {
        chai.request(server)
            .get('api/v1/films')
            .end(function (err, res) {
                res.should.have.status(200);
                res.body.should.be.a('array');
                done();
            });
    });
});