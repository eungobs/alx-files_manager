import sha1 from 'sha1';
import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

export default class AuthController {
  static async getConnect(request, response) {
    const { authorization } = request.headers;
    const base64Credentials = authorization.split(' ')[1];
    let credentials = null;
    try {
      credentials = await atob(base64Credentials);
    } catch (err) {
      response.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const [email, password] = credentials.split(':');
    const collection = dbClient.client.db().collection('users');
    const existingUser = await collection.findOne({ email, password: sha1(password) });
    if (!existingUser) {
      response.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const token = uuidv4();
    const key = `auth_${token}`;
    const time = 24 * 60 * 60;
    const id = existingUser._id.toString();
    await redisClient.set(key, id, time);
    response.status(200).json({ token });
  }

  static async getDisconnect(request, response) {
    const token = request.headers['x-token'];
    const key = `auth_${token}`;
    const id = await redisClient.get(key);
    if (!id) {
      return response.status(401).json({ error: 'Unauthorized' });
    }
    await redisClient.del(key);
    return response.status(204).end();
  }
}
