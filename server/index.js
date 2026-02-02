const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const morgan = require("morgan");
const compression = require("compression");
const helmet = require("helmet");
require("dotenv").config();
const redisClient = require("./src/redis/client"); // Initialize Redis
const cacheMiddleware = require("./src/middlewares/cacheMiddleware");
const rateLimiter = require("./src/middlewares/rateLimiter");

// Validate required environment variables
const requiredEnvVars = [
  "MONGODB_URI",
  "JWT_SECRET",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_ENDPOINT",
  "R2_BUCKET_NAME",
];
const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  console.error(
    "❌ Missing required environment variables:",
    missingVars.join(", "),
  );
  console.error(
    "Please check your .env file and ensure all required variables are set.",
  );
  process.exit(1);
}

// Validate JWT_SECRET strength with entropy check
function validateJWTSecret(secret) {
  if (!secret || secret.length < 64) {
    return false;
  }
  
  // Check if it's a weak/default secret
  const weakSecrets = [
    'CHANGE_THIS_IMMEDIATELY_TO_A_STRONG_SECRET',
    'your-secret-key',
    'secret',
    'test',
    'e9f2a8c7b6e5d4c3b2a10987654321fedcba987654321abcdef0123456789abc' // Example from .env
  ];
  
  if (weakSecrets.some(weak => secret.toLowerCase().includes(weak.toLowerCase()))) {
    return false;
  }
  
  // Check for minimum entropy (hex format check)
  return /^[0-9a-f]{64,}$/i.test(secret);
}

if (!validateJWTSecret(process.env.JWT_SECRET)) {
  console.error('❌ JWT_SECRET must be a 64+ character hex string with high entropy!');
  console.error('Generate with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
  process.exit(1);
}

const app = express();
const server = http.createServer(app);

// Environment-based CORS configuration
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [process.env.CLIENT_URL, 'https://immortalzone.xyz'].filter(Boolean)
  : [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173',
      /^http:\/\/localhost:\d+$/
    ];

console.log('🔒 CORS allowed origins:', allowedOrigins);

// Socket.io initialization
const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Modular Socket Handler
const socketHandler = require("./socket");
socketHandler(io);

// Performance & Security Middleware
app.use(helmet()); // Basic security headers
app.use(compression()); // Gzip payload compression
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(morgan("dev"));

// Attach Socket.io instance to request for route-based emits if needed
app.use((req, res, next) => {
  req.io = io;
  next();
});

// MongoDB Connection
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/immortal_zone";
mongoose
  .connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 10000, // Timeout after 10s instead of default 30s
    socketTimeoutMS: 45000,         // Close sockets after 45s of inactivity
  })
  .then(() => console.log("✅ [DB] Successfully connected to MongoDB Atlas"))
  .catch((err) => {
    console.error("❌ [DB] MongoDB Connection Error:", err.message);
    process.exit(1); // Exit if we can't connect
  });

// Route imports
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const tournamentRoutes = require("./routes/tournaments");
const teamRoutes = require("./routes/teams");
const transactionRoutes = require("./routes/transactions");
const adminRoutes = require("./routes/admins");
const challengeRoutes = require("./routes/challenges");
const chatRoutes = require("./routes/chat");
const notificationRoutes = require("./routes/notifications");
const contentRoutes = require("./routes/content");
const systemRoutes = require("./routes/system");
const membershipRoutes = require("./routes/memberships");
const bannerRoutes = require("./routes/banners");
const settingRoutes = require("./routes/settings");
const newsRoutes = require("./routes/news");
const mvpRoutes = require("./routes/mvps");
const archiveRoutes = require("./routes/archives");
const guildRoutes = require("./routes/guilds");
const channelRoutes = require("./routes/channels");
const groupRoutes = require("./routes/groups");
const postRoutes = require("./routes/posts");
const liveRoutes = require("./routes/live");
const socialRoutes = require("./routes/social");
const youtubeRoutes = require("./routes/youtube");
const fileRoutes = require("./src/routes/fileRoutes");

// Routes
// Core Content Routes (Prioritized)
app.use("/api/news", newsRoutes);
app.use("/api/mvps", mvpRoutes);
app.use("/api/archives", archiveRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/settings", settingRoutes);

// Other Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tournaments", tournamentRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/challenges", challengeRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/system", systemRoutes);
app.use("/api/memberships", membershipRoutes);
app.use("/api/guilds", guildRoutes);
app.use("/api/channels", channelRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/live-sessions", liveRoutes);
app.use("/api/social", socialRoutes);
app.use("/api/youtube", youtubeRoutes);
// Apply rate limiting (50 requests per minute) to file uploads
app.use("/api/files", rateLimiter(50, 60), fileRoutes);

app.get("/", (req, res) => {
  res.send("Immortal Zone API - Performance Optimized");
});

const { errorHandler, notFoundHandler } = require('./utils/errorHandler');

// 404 handler for undefined routes (before error handler)
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Production-ready server listening on port ${PORT}`);
});

module.exports = { io };
