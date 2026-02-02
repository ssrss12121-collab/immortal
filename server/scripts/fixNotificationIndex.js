const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' }); // Adjust path if necessary

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/immortaldb";

async function fixIndex() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const collection = mongoose.connection.collection('notifications');
        const indexes = await collection.indexes();
        console.log('🔍 Current Indexes:', indexes);

        const idIndex = indexes.find(idx => idx.name === 'id_1');
        if (idIndex) {
            console.log('⚠️ Found problematic index: id_1');
            await collection.dropIndex('id_1');
            console.log('✅ Successfully dropped index: id_1');
        } else {
            console.log('ℹ️ Index id_1 not found. System is already clean.');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error fixing index:', error);
        process.exit(1);
    }
}

fixIndex();
