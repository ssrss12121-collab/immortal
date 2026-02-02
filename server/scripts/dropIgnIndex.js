const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/immortal_zone';

async function dropIgnIndex() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const db = mongoose.connection.db;
        const collection = db.collection('users');

        // Get all indexes
        const indexes = await collection.indexes();
        console.log('\n📋 Current Indexes on users collection:');
        indexes.forEach(index => {
            console.log(`  - ${index.name}:`, index.key);
        });

        // Drop IGN unique index if it exists
        try {
            await collection.dropIndex('ign_1');
            console.log('\n✅ Successfully dropped ign_1 unique index');
        } catch (err) {
            if (err.codeName === 'IndexNotFound') {
                console.log('\n✅ No ign_1 index found - already removed or never existed');
            } else {
                throw err;
            }
        }

        // Verify final indexes
        const finalIndexes = await collection.indexes();
        console.log('\n📋 Final Indexes:');
        finalIndexes.forEach(index => {
            console.log(`  - ${index.name}:`, index.key);
        });

        console.log('\n✅ IGN field is now non-unique. Multiple players can use same IGN.');
        console.log('✅ Email field remains unique. One email = one account only.');

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

dropIgnIndex();
