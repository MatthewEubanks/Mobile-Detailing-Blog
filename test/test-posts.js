const mongoose = require('mongoose');

const chai = require('chai');
const chaiHttp = require('chai-http');

const expect = chai.expect;
const {TEST_DATABASE_URL} = require('../config');
const faker = require('faker');

const {BlogPost} = require('../models');
const {app, runServer, closeServer} = require('../server');
const {User} = require('../users');

chai.use(chaiHttp);

function generatePost() {
	// Generate an object representing a Journal Entry
	return {
		title: faker.name.title(),
		content: faker.lorem.paragraph(),
        image: faker.image.imageUrl(),
        username
	};
}

function seedDB() {
	console.info('Seeding Journal Entries data');
	const seedData = [];

	for (let i=1; i<=10; i++) {
		seedData.push(generatePost());
	}
	return BlogPost.insertMany(seedData);
}

function tearDownDb() {
	console.warn('Deleting database');
	return mongoose.connection.dropDatabase();
}

const username = 'mat.eub@mail.com';
const password = "123";
let jwt;

describe('Journal entries API resource', function() {
	before(function() {
		return runServer(TEST_DATABASE_URL);
	});
	beforeEach(function() {
		return User.hashPassword(password).then(password =>
      User.create({
        username,
        password
      })
    )
		.then(function() {
			return chai.request(app)
			.post('/auth/login')
			.send({username, password});
		})
		.then(function(res) {
			jwt = res.body.authToken;
		return seedDB();
	    });
	})
	.afterEach(function() {
		return tearDownDb();
	})
	.after(function() {
		return closeServer();
    });
    describe('GET endpoint', function() {
		it('should return all existing entries', function() {
			//strategy:
			// 1.get back all entries returned by GET req to '/api/entries'
			// 2. prove result has a status 200 and correct data type
			// 3. prove the num of entries we got is equal to num in DB
			let res;
			return chai.request(app)
			.get('/posts')
			.set('Authorization', `Bearer ${jwt}`)
			.then(function(_res) {
				res=_res;
				expect(res).to.have.status(200);
				expect(res.body.entries).to.have.lengthOf.at.least(1);
				return BlogPost.count();
			})
			.then(function(count) {
				expect(res.body.entries).to.have.lengthOf(count);
			});
		});

		it('should return entries with right fields', function() {
			//Strategy: Make GET request and ensure the entries have the right fields
			let resEntry;
			return chai.request(app)
			.get('/posts/')
			.set('Authorization', `Bearer ${jwt}`)
			.then(function(res) {
				expect(res).to.have.status(200);
				expect(res).to.be.json;
				expect(res.body.entries).to.be.a('array');
				expect(res.body.entries).to.have.lengthOf.at.least(1);

				res.body.entries.forEach(function(entry) {
					expect(entry).to.be.a('object');
					expect(entry).to.include.keys('title', 'picture', 'content');
				});
				resEntry = res.body.entries[0];
				return BlogPost.findById(resEntry.id);
			})
			.then(function(entry) {
				expect(resEntry.id).to.equal(entry.id);
				expect(resEntry.title).to.equal(entry.title);
				expect(resEntry.coverPhoto).to.equal(entry.coverPhoto);
				expect(resEntry.description).to.equal(entry.description);
				expect(resEntry.memories).to.equal(entry.memories);
				expect(resEntry.words).to.equal(entry.words);
				expect(resEntry.morePhotos[0]).to.equal(entry.morePhotos[0]);
			});
		});
		
		it('should get entry by ID', function() {
			let myEntry;
			BlogPost
			.findOne()
            .then(function(_entry) {
		    myEntry = _entry;
		    return chai.request(app)
			  	  .get(`/posts/${myEntry.id}`)
			  	  .set('Authorization', `Bearer ${jwt}`)
			  	  .then(function(res) {
			  	  	expect(res).to.have.status(200);
			  	  	expect(res).to.be.json;
			  	  	expect(res.body.id).to.equal(myEntry.id);
			  	  });
			  	});
		});
	});

	describe('POST endpoint', function() {
		//strategy:
		// 1. make a POST req with data 
		// 2. Prove that the entry we get back has right keys
		// 3. Make sure it has id
		it('should add a new entry', function() {
			const newEntry = generateJournalEntries();
			return chai.request(app)
			.post('/posts/')
			.set('Authorization', `Bearer ${jwt}`)
			.send(newEntry)
			.then(function(res) {
				expect(res).to.have.status(201);
				expect(res).to.be.json;
				expect(res.body).to.be.a('object');
				expect(res.body).to.include.keys('title', 'picture', 'content');
				expect(res.body.title).to.equal(newEntry.title);
				expect(res.body.id).to.not.be.null;
				expect(res.body.travelDate).to.equal(newEntry.travelDate);
				expect(res.body.coverPhoto).to.equal(newEntry.coverPhoto);
				expect(res.body.description).to.equal(newEntry.description);
				expect(res.body.memories).to.equal(newEntry.memories);
				expect(res.body.words).to.equal(newEntry.words);
				expect(res.body.morePhotos[0]).to.equal(newEntry.morePhotos[0]);
				return BlogPost.findById(res.body.id);
			})
			.then(function(entry) {
				expect(entry.title).to.equal(newEntry.title);
				expect(entry.travelDate).to.equal(newEntry.travelDate);
				expect(entry.coverPhoto).to.equal(newEntry.coverPhoto);
				expect(entry.description).to.equal(newEntry.description);
				expect(entry.memories).to.equal(newEntry.memories);
				expect(entry.words).to.equal(newEntry.words);
				expect(entry.morePhotos[0]).to.equal(newEntry.morePhotos[0]);
			});
		});
	});

	describe('PUT endpoint', function() {
		//strategy:
		// 1. Get an existing entry from db
		// 2. Make a PUT req to update that entry
		// 3. Prove the entry returned contains data we sent
		// 4. Prove entry in db is correctly updated
		it('should update entry on PUT', function() {
			const updateData = {
				title: 'Matts Car',
				description: 'Easy Wax'
			};

			return BlogPost
			  .findOne()
			  .then(function(entry) {
			  	updateData.id = entry.id;

			  	return chai.request(app)
			  	  .put(`/posts/${entry.id}`)
			  	  .set('Authorization', `Bearer ${jwt}`)
			  	  .send(updateData);
			  })
			  .then(function(res) {
			  	expect(res).to.have.status(204);

			  	return BlogPost.findById(updateData.id);
			  })
			  .then(function(entry) {
			  	expect(entry.title).to.equal(updateData.title);
			  	expect(entry.description).to.equal(updateData.description);
			  });
		});
	});

	describe('DELETE endpoint', function() {
		//strategy;
		// 1. Get an entry
		// 2. Make a delete req for that entry id
		// 3. Prove the res has status 204
		// 4. Prove the entry with that id doesn't exist in db
		it('should delete an entry by id', function() {
			let entry;
			return BlogPost
			  .findOne()
			  .then(function(_entry) {
			  	entry=_entry;
			  	return chai.request(app)
			  	  .delete(`/posts/${entry.id}`)
			  	  .set('Authorization', `Bearer ${jwt}`);

			  })
			  .then(function(res) {
			  	expect(res).to.have.status(204);
			  	return BlogPost.findById(entry.id);
			  })
			  .then(function(_entry) {
			  	expect(_entry).to.be.null;
			  });
		});
	});
});