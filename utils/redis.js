import redis from 'redis';
import { promisify } from 'util';

class RedisClient {
  constructor() {
    const client = redis.createClient();
    this.value = true;
    client.on('error', (err) => {
      console.log(err);
      this.value = false;
    });
    client.on('connect', () => {
      this.value = true;
    });
    this.client = client;
  }

  isAlive() {
    return this.value;
  }

  async get(key) {
    return promisify(this.client.GET).bind(this.client)(key);
  }

  async set(key, value, time) {
    this.client.set(key, value, () => {
      this.client.expire(key, time);
    });
  }

  async del(key) {
    this.client.del(key);
  }
}

const redisClient = new RedisClient();
export default redisClient;
