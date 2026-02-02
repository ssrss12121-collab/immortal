const redis = require('redis');

const redisClient = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    socket: {
        reconnectStrategy: (retries) => {
            // Attempt to reconnect every 30 seconds if it's down
            return 30000;
        }
    }
});

redisClient.isAvailable = false;
let hasLoggedError = false;

redisClient.on('error', (err) => {
    // Only log the error once to prevent filling up the terminal
    if (!hasLoggedError) {
        console.warn('⚠️  Redis is currently unavailable. System is running in fallback mode.');
        hasLoggedError = true;
    }
    redisClient.isAvailable = false;
});

redisClient.on('connect', () => {
    console.log('✅ Redis Client Connected');
    redisClient.isAvailable = true;
    hasLoggedError = false; // Reset for next time if it goes down again
});

redisClient.on('ready', () => {
    redisClient.isAvailable = true;
});

redisClient.on('end', () => {
    redisClient.isAvailable = false;
});

(async () => {
    try {
        // Silently attempt connection
        await redisClient.connect().catch(() => { });
    } catch (err) {
        redisClient.isAvailable = false;
    }
})();

module.exports = redisClient;
