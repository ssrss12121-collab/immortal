const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Try to find MONGODB_URI from .env file
let mongodbUri = 'mongodb://localhost:27017/immortal_db'; // fallback default

const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/MONGODB_URI=(.*)/);
    if (match && match[1]) {
        mongodbUri = match[1].trim().replace(/['"]/g, '');
    }
}

console.log('--- User Data Cleaner ---');
console.log('Target Database:', mongodbUri.split('@').pop());

async function clearUserData() {
    try {
        await mongoose.connect(mongodbUri);
        console.log('✅ Connected to MongoDB');

        const db = mongoose.connection.db;

        // 1. Delete all Users (Player accounts)
        console.log('🧹 Clearing Users collection...');
        const userResult = await db.collection('users').deleteMany({});
        console.log(`✅ Deleted ${userResult.deletedCount} users.`);

        // 2. Delete User-related collections
        const collectionsToClear = ['transactions', 'notifications', 'teams', 'challenges', 'archives'];

        for (const colName of collectionsToClear) {
            const collections = await db.listCollections({ name: colName }).toArray();
            if (collections.length > 0) {
                console.log(`🧹 Clearing ${colName} collection...`);
                const result = await db.collection(colName).deleteMany({});
                console.log(`✅ Deleted ${result.deletedCount} items from ${colName}.`);
            }
        }

        // 3. Reset Tournament participants
        console.log('🧹 Resetting tournament participants...');
        const tournamentCol = db.collection('tournaments');
        const tourneyResult = await tournamentCol.updateMany(
            {},
            { $set: { participants: [], filledSlots: 0, status: 'Open', matchResult: null } }
        );
        console.log(`✅ Reset ${tourneyResult.modifiedCount} tournaments.`);

        console.log('\n--- Status Check ---');
        const adminCount = await db.collection('admins').countDocuments();
        const bannerCount = await db.collection('banners').countDocuments();
        const newsCount = await db.collection('news').countDocuments();

        console.log(`🛡️ Admins remaining: ${adminCount} (Safe!)`);
        console.log(`📢 Banners remaining: ${bannerCount} (Safe!)`);
        console.log(`📰 News items remaining: ${newsCount} (Safe!)`);

        console.log('\n🚀 User data cleanup complete! Your Admin accounts and Site content are safe.');

        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error('❌ Error during cleanup:', err.message);
        process.exit(1);
    }
}

clearUserData();
