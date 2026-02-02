const cacheHelper = require('../redis/cacheHelper');

/**
 * Cache middleware for Express routes
 * @param {number} ttl Seconds to cache the response
 */
const cacheMiddleware = (ttl = 300) => {
    return async (req, res, next) => {
        // Only cache GET requests
        if (req.method !== 'GET') {
            return next();
        }

        const key = `cache:${req.originalUrl || req.url}`;

        try {
            const cachedData = await cacheHelper.get(key);
            if (cachedData) {
                console.log(`[Cache] Serving ${key} from Redis`);
                return res.json(cachedData);
            }

            // Override res.json to capture and cache the response
            res.sendResponse = res.json;
            res.json = (body) => {
                cacheHelper.set(key, body, ttl);
                res.sendResponse(body);
            };

            next();
        } catch (err) {
            console.error('Cache Middleware Error:', err);
            next();
        }
    };
};

module.exports = cacheMiddleware;
