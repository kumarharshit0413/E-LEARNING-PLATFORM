const redis = require('redis');

const redisClient = redis.createClient({
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.on('connect', () => console.log('✅ Connected to Redis!'));

redisClient.connect();

module.exports = redisClient;
