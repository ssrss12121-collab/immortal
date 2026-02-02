const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' }); // Adjust path if needed

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/immortal_zone';

const fixIndexes = async () => {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected.');

        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log(`🔍 Found ${collections.length} collections.`);

        for (const col of collections) {
            console.log(`Checking ${col.name}...`);
            try {
                const indexes = await mongoose.connection.collection(col.name).indexes();
                const badIndex = indexes.find(idx => idx.name === 'id_1');

                if (badIndex) {
                    console.log(`⚠️ Found bad index "id_1" in ${col.name}. Dropping...`);
                    await mongoose.connection.collection(col.name).dropIndex('id_1');
                    console.log(`🔧 Dropped "id_1" from ${col.name}`);
                } else {
                    console.log(`✔️ No bad index in ${col.name}`);
                }
            } catch (err) {
                console.warn(`Could not check/drop index for ${col.name}: ${err.message}`);
            }
        }

        console.log('🎉 Database Fix Complete. You can now restart the server.');
        process.exit(0);

    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
};

fixIndexes();
