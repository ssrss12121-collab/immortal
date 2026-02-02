const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300 }); // Default 5 minutes

const cacheService = {
    get: (key) => {
        return cache.get(key);
    },
    set: (key, value, ttl) => {
        return cache.set(key, value, ttl);
    },
    del: (key) => {
        return cache.del(key);
    },
    flush: () => {
        return cache.flushAll();
    }
};

module.exports = cacheService;
