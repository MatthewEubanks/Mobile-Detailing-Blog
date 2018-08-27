const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');
chai.use(chaiHttp);


const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('./config');

describe('static routes', function() {

	before(function () {
    return runServer(TEST_DATABASE_URL);
  });

	after(function() {
		return closeServer();
	});

	it('should get index.html', function() {
		return chai.request(app)
		.get('/')
		.then(function(res) {
			expect(res).to.have.status(200);
			expect(res).to.be.html;
		});
	});

});