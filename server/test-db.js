const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
console.log('Testing connection to:', uri.replace(/:([^@]+)@/, ':****@'));

mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
    .then(async () => {
        console.log('✅ Successfully connected to MongoDB');
        try {
            const collections = await mongoose.connection.db.listCollections().toArray();
            console.log('✅ Collections found:', collections.map(c => c.name));
            process.exit(0);
        } catch (err) {
            console.error('❌ Error listing collections:', err.message);
            process.exit(1);
        }
    })
    .catch(err => {
        console.error('❌ Connection failed:', err.message);
        console.error('Stack:', err.stack);
        process.exit(1);
    });
