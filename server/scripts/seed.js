const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Tournament = require('../models/Tournament');
const Admin = require('../models/Admin');
const Banner = require('../models/Banner');
const { News } = require('../models/News');
require('dotenv').config({ path: '../.env' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/immortal_zone';

const seedData = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB for seeding...');

        // Clear existing data
        await Admin.deleteMany({});
        await Tournament.deleteMany({});
        await Banner.deleteMany({});
        await News.deleteMany({});

        // Seed Super Admin
        const salt = await bcrypt.genSalt(10);
        const adminPassword = await bcrypt.hash('Zone579214', salt);
        const superAdmin = new Admin({
            username: 'Siamzone',
            email: 'siam579214@gmail.com',
            password: adminPassword,
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
        await superAdmin.save();
        console.log('✅ Super Admin created (siam579214@gmail.com / Zone579214)');

        // Seed Tournaments
        const tournaments = [
            {
                title: 'Dhaka Championship Cup',
                category: 'Squad',
                entryFee: 50,
                prizePool: 5000,
                startTime: 'Today, 8:00 PM',
                map: 'Bermuda',
                slots: 48,
                filledSlots: 32,
                status: 'Open',
                image: 'https://picsum.photos/400/200?random=1'
            },
            {
                title: 'Sniper Legends Only',
                category: 'Solo',
                entryFee: 20,
                prizePool: 1000,
                startTime: 'Tomorrow, 6:00 PM',
                map: 'Kalahari',
                slots: 100,
                filledSlots: 89,
                status: 'Open',
                image: 'https://picsum.photos/400/200?random=2'
            }
        ];
        await Tournament.insertMany(tournaments);
        console.log('✅ Initial Tournaments seeded');

        // Seed News
        const news = [
            { title: 'Team Xtreme Wins Winter Cup!', content: 'Congratulations to Team Xtreme for an amazing performance in the Winter Cup finals.', date: new Date().toLocaleDateString(), type: 'Update', image: 'https://picsum.photos/400/200?random=news1' },
            { title: 'New Ranking System Live', content: 'We have updated the ranking points calculation for fairer competition.', date: new Date().toLocaleDateString(), type: 'Update', image: 'https://picsum.photos/400/200?random=news2' }
        ];
        await News.insertMany(news);
        console.log('✅ Initial News seeded');

        // Seed Banners
        const banners = [
            { image: 'https://picsum.photos/800/400?random=101', title: 'Winter Championship', description: 'Join the epic battle!', badgeText: 'Event Info', isActive: true, order: 1 },
            { image: 'https://picsum.photos/800/400?random=102', title: 'New Ranking Rewards', description: 'Win prizes now!', badgeText: 'Update', isActive: true, order: 2 }
        ];
        await Banner.insertMany(banners);
        console.log('✅ Initial Banners seeded');

        console.log('🏁 Seeding completed successfully!');
        process.exit();
    } catch (err) {
        console.error('❌ Seeding failed:', err);
        process.exit(1);
    }
};

seedData();
