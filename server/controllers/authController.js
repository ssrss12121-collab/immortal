const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { ign, email, password, name, age, country, district, gameRole, experience } = req.body;
        const normalizedEmail = email.toLowerCase();
        console.log('📝 [Register] Attempting registration for:', normalizedEmail);
        console.log('📊 [Register] Payload:', JSON.stringify(req.body, null, 2));

        // Validation
        const missingFields = [];
        if (!ign) missingFields.push('ign');
        if (!email) missingFields.push('email');
        if (!password) missingFields.push('password');
        if (!name) missingFields.push('name');
        if (!gameRole) missingFields.push('gameRole');
        if (!experience) missingFields.push('experience');

        if (missingFields.length > 0) {
            console.error('❌ [Register] Missing required fields:', missingFields);
            return res.status(400).json({ 
                success: false, 
                message: `Missing required fields: ${missingFields.join(', ')}` 
            });
        }

        // Check if user exists
        console.log('🔍 [Register] Checking if user exists...');
        const userCount = await User.countDocuments({ email }).maxTimeMS(8000); 
        console.log('✅ [Register] User existence check complete. Count:', userCount);
        
        if (userCount > 0) {
            console.warn('⚠️ [Register] User already exists:', email);
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        // Generate Player ID
        const num = Math.floor(100000 + Math.random() * 900000);
        const playerId = `PLR${num}`;

        // Hash password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = new User({
            playerId, // Save to custom field
            ign,
            email: normalizedEmail,
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
                playerId: user.playerId,
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
        console.log('🔐 [Login] Login attempt received');
        console.log('📦 [Login] Request body:', JSON.stringify(req.body, null, 2));
        console.log('📧 [Login] Email:', req.body.email);
        console.log('🔑 [Login] Password length:', req.body.password?.length || 0);

        const { email, password } = req.body;
        const normalizedEmail = email.toLowerCase();

        // Validation
        if (!normalizedEmail || !password) {
            console.warn('⚠️ [Login] Missing credentials');
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        console.log('🔍 [Login] Searching for user:', normalizedEmail);
        const user = await User.findOne({ email: normalizedEmail });
        
        if (!user) {
            console.warn('⚠️ [Login] User not found:', email);
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        console.log('✅ [Login] User found:', user.email);
        console.log('🔐 [Login] Comparing passwords...');

        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            console.warn('⚠️ [Login] Password mismatch for:', email);
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        console.log('✅ [Login] Password verified successfully');
        console.log('🎟️ [Login] Generating JWT token...');

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        user.token = token;
        await user.save();

        console.log('✅ [Login] Login successful for:', user.email);

        res.json({
            success: true,
            user: {
                id: user._id,
                playerId: user.playerId,
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
        console.error('❌ [Login] Error:', err.message);
        console.error('❌ [Login] Stack:', err.stack);
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
        const salt = await bcrypt.genSalt(12);
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
                playerId: user.playerId,
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
