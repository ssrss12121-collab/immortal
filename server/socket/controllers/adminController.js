const Admin = require('../models/Admin');
const User = require('../models/User');
const Tournament = require('../models/Tournament');
const Transaction = require('../models/Transaction');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const admin = await Admin.findOne({ $or: [{ email }, { username: email }] });
        if (!admin) return res.status(400).json({ success: false, message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) return res.status(400).json({ success: false, message: 'Invalid credentials' });

        const token = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

        admin.lastLogin = new Date();
        await admin.save();

        res.json({
            success: true,
            admin: {
                id: admin._id,
                username: admin.username,
                email: admin.email,
                role: admin.role,
                permissions: admin.permissions,
                token
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getStats = async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        const tournamentCount = await Tournament.countDocuments();
        const pendingTransactions = await Transaction.countDocuments({ status: 'pending' });

        res.json({
            success: true,
            stats: {
                userCount,
                tournamentCount,
                pendingTransactions
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getAllAdmins = async (req, res) => {
    try {
        const admins = await Admin.find().select('-password');
        res.json({ success: true, admins });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.createAdmin = async (req, res) => {
    try {
        const { username, email, password, role, permissions } = req.body;

        let admin = await Admin.findOne({ $or: [{ email }, { username }] });
        if (admin) return res.status(400).json({ success: false, message: 'Admin already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        admin = new Admin({
            username,
            email,
            password: hashedPassword,
            role,
            permissions
        });

        await admin.save();
        res.status(201).json({ success: true, admin: { id: admin._id, username, email, role } });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
