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

console.log('--- Database Index Fixer ---');
console.log('Connecting to:', mongodbUri.split('@').pop()); // Log only the host part for security

async function fixIndex() {
    try {
        await mongoose.connect(mongodbUri);
        console.log('✅ Connected to MongoDB');

        const db = mongoose.connection.db;
        const collection = db.collection('users');

        // Check if index exists
        const indexes = await collection.indexes();
        const hasIgnIndex = indexes.some(idx => idx.name === 'ign_1');

        if (hasIgnIndex) {
            console.log('🔍 Found "ign_1" unique index. Removing it...');
            await collection.dropIndex('ign_1');
            console.log('✅ Index "ign_1" successfully removed!');
        } else {
            console.log('✅ No "ign_1" index found. It might have been removed already.');
        }

        console.log('\nFinal Indexes:');
        const finalIndexes = await collection.indexes();
        finalIndexes.forEach(idx => console.log(` - ${idx.name}`));

        console.log('\n🚀 Success! Multiple players can now use the same IGN.');
        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error('❌ Error fixing index:', err.message);
        process.exit(1);
    }
}

fixIndex();
