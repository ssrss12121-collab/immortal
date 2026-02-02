const redisClient = require('./client');

const cacheHelper = {
    /**
     * Set a value in Redis with an optional TTL
     */
    async set(key, value, ttl = 3600) {
        if (!redisClient.isAvailable) return;

        try {
            const stringValue = JSON.stringify(value);
            if (ttl) {
                await redisClient.setEx(key, ttl, stringValue);
            } else {
                await redisClient.set(key, stringValue);
            }
        } catch (err) {
            console.warn('Redis Set Error:', err.message);
        }
    },

    /**
     * Get a value from Redis
     */
    async get(key) {
        if (!redisClient.isAvailable) return null;

        try {
            const data = await redisClient.get(key);
            return data ? JSON.parse(data) : null;
        } catch (err) {
            console.warn('Redis Get Error:', err.message);
            return null;
        }
    },

    /**
     * Delete a key from Redis
     */
    async delete(key) {
        if (!redisClient.isAvailable) return;

        try {
            await redisClient.del(key);
        } catch (err) {
            console.warn('Redis Delete Error:', err.message);
        }
    },

    /**
     * Delete keys matching a pattern (e.g., for invalidating categories)
     */
    async deletePattern(pattern) {
        if (!redisClient.isAvailable) return;

        try {
            const keys = await redisClient.keys(pattern);
            if (keys.length > 0) {
                await redisClient.del(keys);
            }
        } catch (err) {
            console.warn('Redis Pattern Delete Error:', err.message);
        }
    }
};

module.exports = cacheHelper;
