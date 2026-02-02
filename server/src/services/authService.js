const jwt = require('jsonwebtoken');
const cacheHelper = require('../redis/cacheHelper');
const User = require('../models/User'); // Assuming this model exists

const authService = {
    /**
     * Verify token and use Redis to cache session
     */
    async verifyAndCacheToken(token) {
        const cacheKey = `session:${token}`;

        // 1. Try to get from Redis
        const cachedSession = await cacheHelper.get(cacheKey);
        if (cachedSession) {
            return cachedSession;
        }

        // 2. If not in cache, verify JWT
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 3. Fetch user from MongoDB (Single DB rule)
            const user = await User.findById(decoded.id).select('-password').lean();
            if (!user) return null;

            // 4. Cache the result in Redis for 1 hour (Session Caching)
            await cacheHelper.set(cacheKey, user, 3600);

            return user;
        } catch (err) {
            return null;
        }
    },

    /**
     * Invalidate session (Logout)
     */
    async invalidateSession(token) {
        await cacheHelper.delete(`session:${token}`);
    }
};

module.exports = authService;
