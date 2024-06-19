import chai from 'chai';
import chaiHttp from 'chai-http';


import { MongoClient, ObjectID } from 'mongodb';
import app from '../server'
chai.use(chaiHttp);

describe('GET /users', () => {
	let testClientDb;

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

	it('GET /users with missing email', (done) => {
		const userParam = {
			password: `${fctRandomString()}`
		}
		chai.request(app)
			.post('/users')
		        .send(userParam)
			.end(async (err, res) => {
				chai.expect(err).to.be.null;
				chai.expect(res).to.have.status(400);
				const resError = res.body.error;

				chai.expect(resError).to.equal("Missing email");

				testClientDb.collection('users')
				.find({})
				.toArray((err, docs) => {
					chai.expect(err).to.be.null;
					chai.expect(docs.length).to.equal(0);
					done();
				});
			});
	}).timeout(30000);
});
