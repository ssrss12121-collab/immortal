const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { ign, email, password, name, age, country, district, gameRole, experience } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        // Generate Player ID
        const num = Math.floor(100000 + Math.random() * 900000);
        const playerId = `PLR${num}`;

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        user = new User({
            playerId, // Save to custom field
            ign,
            email,
            password: hashedPassword,
            name,
            age,
            country: country || 'Bangladesh',
            district,
            gameRole,
            experience,
            walletBalance: 0,
            stats: {
                matches: 0,
                kills: 0,
                wins: 0,
                kdRatio: 0,
                rankPoints: 0,
                badge: 'Bronze'
            }
        });

        await user.save();

        // Generate Token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        user.token = token;
        await user.save();

        res.status(201).json({
            success: true,
            user: {
                id: user._id,
                ign: user.ign,
                email: user.email,
                role: user.gameRole,
                country: user.country,
                district: user.district,
                experience: user.experience,
                walletBalance: user.walletBalance,
                stats: user.stats,
                token: user.token
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        user.token = token;
        await user.save();

        res.json({
            success: true,
            user: {
                id: user._id,
                ign: user.ign,
                email: user.email,
                role: user.gameRole,
                country: user.country,
                district: user.district,
                experience: user.experience,
                walletBalance: user.walletBalance,
                stats: user.stats,
                token: user.token
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.guestLogin = async (req, res) => {
    try {
        const randomId = Math.floor(10000 + Math.random() * 90000);
        const ign = `Guest_${randomId}`;
        const email = `guest_${randomId}_${Date.now()}@immortal.temp`;
        const password = `guest_pass_${randomId}_${Date.now()}`;

        // Create Guest User
        // Hash password (even for guests, to keep schema valid)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate Player ID
        const num = Math.floor(100000 + Math.random() * 900000);
        const playerId = `PLR${num}`;

        const user = new User({
            playerId,
            ign,
            email,
            password: hashedPassword,
            name: 'Guest Operator',
            age: 0,
            country: 'Unknown',
            district: 'Unknown',
            gameRole: 'Guest',
            experience: 'Beginner',
            walletBalance: 0,
            stats: {
                matches: 0,
                kills: 0,
                wins: 0,
                kdRatio: 0,
                rankPoints: 0,
                badge: 'Recruit'
            },
            isActive: true
        });

        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        user.token = token;
        await user.save();

        res.json({
            success: true,
            user: {
                id: user._id,
                ign: user.ign,
                email: user.email,
                role: user.gameRole,
                country: user.country,
                district: user.district,
                experience: user.experience,
                walletBalance: user.walletBalance,
                stats: user.stats,
                token: user.token
            }
        });

    } catch (err) {
        console.error('Guest login error:', err);
        res.status(500).json({ success: false, message: 'Guest login failed' });
    }
};
