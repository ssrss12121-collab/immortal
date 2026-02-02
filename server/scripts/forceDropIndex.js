const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/immortal_zone';

const run = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB...');

        const collection = mongoose.connection.collection('notifications');

        // List indexes before
        const indexes = await collection.indexes();
        console.log('Current Indexes:', indexes);

        try {
            await collection.dropIndex('id_1');
            console.log('✅ Dropped index "id_1"');
        } catch (e) {
            console.log('Index "id_1" not found or already dropped.');
        }

        // List indexes after
        const indexesAfter = await collection.indexes();
        console.log('Remaining Indexes:', indexesAfter);

        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
};

run();
