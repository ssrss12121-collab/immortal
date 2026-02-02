const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' }); // Adjust path if necessary

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/immortaldb";

const UserSchema = new mongoose.Schema({
    ign: String,
    email: String,
    playerId: String
}, { strict: false });

const User = mongoose.model('User', UserSchema);

async function migrate() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const usersWithoutId = await User.find({ playerId: { $exists: false } });
        console.log(`🔍 Found ${usersWithoutId.length} users without Player ID`);

        for (const user of usersWithoutId) {
            let unique = false;
            let newId = '';

            while (!unique) {
                const num = Math.floor(100000 + Math.random() * 900000);
                newId = `PLR${num}`;
                const existing = await User.findOne({ playerId: newId });
                if (!existing) unique = true;
            }

            user.playerId = newId;
            await user.save();
            console.log(`✅ Assigned ${newId} to user ${user.ign || user.email}`);
        }

        console.log('🎉 Migration complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration Error:', error);
        process.exit(1);
    }
}

migrate();
