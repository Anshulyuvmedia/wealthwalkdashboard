// common/util/cache.js
const redis = require('../../server/redis');

module.exports = {
    async get(key) {
        const data = await redis.get(key);
        if (!data) return null;

        try {
            return JSON.parse(data);
        } catch {
            return data;
        }
    },

    async set(key, value, ttl = 15) {
        // ttl = seconds
        await redis.set(key, JSON.stringify(value), "EX", ttl);
    },

    async del(key) {
        await redis.del(key);
    }
};
