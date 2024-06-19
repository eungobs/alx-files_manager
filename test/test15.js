import chai from 'chai';
import chaiHttp from 'chai-http';
import sha1 from 'sha1';


import { MongoClient, ObjectID } from 'mongodb';
import app from '../server'
chai.use(chaiHttp);

describe('GET /users', () => {
	let testClientDb = null;
	let initialUser = null;

	const fctRandomString = () => {
		return Math.random().toString(36).substring(2, 15);
	}

	beforeEach(() => {
		const dbInfo = {
			host: process.env.DB_HOST || 'localhost',
			port: process.env.DB_PORT || '27017',
			database: process.env.DB_DATABASE || 'files_manager'
		};
		return new Promise((resolve) => {
			MongoClient.connect(`mongodb://${dbInfo.host}:${dbInfo.port}/${dbInfo.database}`, async (err, client) => {
				testClientDb = client.db(dbInfo.database);
				await testClientDb.collection('users').deleteMany({})

				resolve();
			});
		});
	
	});

	afterEach(() => {
	});

	it('GET /users stores the password as SHA1', (done) => {
		const userParam = {
			email: `${fctRandomString()}@me.com`,
			password: `${fctRandomString()}`
		}
		chai.request(app)
			.post('/users')
		        .send(userParam)
			.end(async (err, res) => {
				chai.expect(err).to.be.null;
				chai.expect(res).to.have.status(201);
				const resUserId = res.body.id
				const resUserEmail = res.body.email
				chai.expect(resUserEmail).to.equal(userParam.email);


				testClientDb.collection('users')
				.find({})
				.toArray((err, docs) => {
					chai.expect(err).to.be.null;
					chai.expect(docs.length).to.equal(1);
					const docUser = docs[0];
					chai.expect(docUser._id.toString()).to.equal(resUserId);
					chai.expect(docUser.email).to.equal(userParam.email);
					chai.expect(docUser.password.toUpperCase()).to.equal(sha1(userParam.password).toUpperCase());
					done();
				});
			});
	}).timeout(30000);
});
