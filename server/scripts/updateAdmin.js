const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const AdminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ['super_admin', 'tournament_admin', 'challenge_admin', 'banner_admin', 'content_admin', 'user_admin', 'live_admin'],
        default: 'content_admin'
    },
    permissions: {
        tournaments: [String],
        canManageChallenges: { type: Boolean, default: false },
        canManageUsers: { type: Boolean, default: false },
        canManageTransactions: { type: Boolean, default: false },
        canManageBanners: { type: Boolean, default: false },
        canManageContent: { type: Boolean, default: false },
        canManageLive: { type: Boolean, default: false }
    },
    isActive: { type: Boolean, default: true },
    createdBy: String,
    lastLogin: Date
}, { timestamps: true });

const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/immortal_zone';

const run = async () => {
    try {
        console.log('Connecting to:', MONGODB_URI);
        await mongoose.connect(MONGODB_URI);

        // Clear problematic stale indexes
        try {
            await Admin.collection.dropIndex('id_1');
            console.log('🗑️ Dropped stale "id_1" index');
        } catch (e) {
            // Index might not exist, which is fine
        }

        const username = 'Siamzone';
        const email = 'siam579214@gmail.com';
        const password = 'Zone579214';

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        let admin = await Admin.findOne({
            $or: [{ email }, { username }]
        });

        if (admin) {
            console.log('Updating existing admin...');
            admin.username = username;
            admin.email = email;
            admin.password = hashedPassword;
            admin.role = 'super_admin';
            admin.permissions = {
                tournaments: ['*'],
                canManageChallenges: true,
                canManageUsers: true,
                canManageTransactions: true,
                canManageBanners: true,
                canManageContent: true,
                canManageLive: true
            };
            await admin.save();
        } else {
            console.log('Creating new admin...');
            admin = new Admin({
                username,
                email,
                password: hashedPassword,
                role: 'super_admin',
                permissions: {
                    tournaments: ['*'],
                    canManageChallenges: true,
                    canManageUsers: true,
                    canManageTransactions: true,
                    canManageBanners: true,
                    canManageContent: true,
                    canManageLive: true
                }
            });
            await admin.save();
        }

        console.log('✅ Admin credentials updated successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
};

run();
