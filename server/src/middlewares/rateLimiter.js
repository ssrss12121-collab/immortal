const redisClient = require('../redis/client');

/**
 * Redis-based Rate Limiter Middleware
 * @param {number} limit Max requests
 * @param {number} windowInSeconds Window size
 */
const rateLimiter = (limit = 100, windowInSeconds = 60) => {
    // Local memory fallback for when Redis is unavailable
    const localStore = new Map();

    return async (req, res, next) => {
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const key = `ratelimit:${ip}`;

        if (!redisClient.isAvailable) {
            // Fallback to simple local memory limiting
            const now = Date.now();
            const record = localStore.get(ip) || { count: 0, resetTime: now + (windowInSeconds * 1000) };

            if (now > record.resetTime) {
                record.count = 1;
                record.resetTime = now + (windowInSeconds * 1000);
            } else {
                record.count++;
            }

            localStore.set(ip, record);

            if (record.count > limit) {
                return res.status(429).json({ success: false, message: 'Too many requests. Please try again later.' });
            }
            return next();
        }

        try {
            const current = await redisClient.get(key);
            const count = current ? parseInt(current) : 0;

            if (count >= limit) {
                return res.status(429).json({ success: false, message: 'Too many requests. Please try again later.' });
            }

            const multi = redisClient.multi();
            multi.incr(key);
            if (!current) {
                multi.expire(key, windowInSeconds);
            }
            await multi.exec();

            next();
        } catch (err) {
            console.warn('Rate Limiter Error:', err.message);
            next(); // Proceed regardless of limiter error in production to avoid blocking users
        }
    };
};

module.exports = rateLimiter;
