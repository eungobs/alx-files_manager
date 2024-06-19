import sha1 from 'sha1';
import { ObjectID } from 'mongodb';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

export default class UsersController {
  static async postNew(request, response) {
    const email = request.body.email || null;
    if (!email) {
      response.status(400).json({ error: 'Missing email' });
      return;
    }

    const password = request.body.password || null;
    if (!password) {
      response.status(400).json({ error: 'Missing password' });
      return;
    }
    const collection = await dbClient.client.db().collection('users');

    const existingUser = await collection.findOne({ email });
    if (existingUser) {
      response.status(400).json({ error: 'Already exist' });
      return;
    }

    const data = await collection.insertOne({ email, password: sha1(password) });
    const userId = data.insertedId.toString();
    response.status(201).json({ email, id: userId });
  }

  static async getMe(request, response) {
    const token = request.headers['x-token'];
    const key = `auth_${token}`;
    const id = await redisClient.get(key);
    const collection = dbClient.client.db().collection('users');
    const existingUser = await collection.findOne({ _id: new ObjectID(id) });
    if (!existingUser) {
      response.status(401).json({ error: 'Unauthorized' });
      return;
    }
    response.json({ email: existingUser.email, id: existingUser._id.toString() });
  }
}
