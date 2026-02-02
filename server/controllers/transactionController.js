const Transaction = require('../models/Transaction');
const User = require('../models/User');

exports.createTransaction = async (req, res) => {
    try {
        const { userId, type, amount, method, accountNumber, accountHolderName, transactionId, screenshotUrl, notes } = req.body;

        // Resolve user correctly
        const user = await User.findOne({
            $or: [
                { _id: require('mongoose').Types.ObjectId.isValid(userId) ? userId : null },
                { playerId: userId }
            ]
        });

        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        if (type === 'withdrawal') {
            if ((user.walletBalance || 0) < amount) {
                return res.status(400).json({ success: false, message: 'Insufficient balance' });
            }

            user.walletBalance -= amount;
            await user.save();
        }

        const transaction = new Transaction({
            userId: user._id,
            type,
            amount,
            method,
            accountNumber,
            accountHolderName,
            transactionId,
            screenshotUrl,
            notes,
            status: 'pending'
        });

        const saved = await transaction.save();
        res.status(201).json({ success: true, transaction: saved });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getTransactionsByUser = async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.params.userId }).sort({ createdAt: -1 });
        res.json({ success: true, transactions });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getAllTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find().sort({ createdAt: -1 }).lean();

        // Fetch unique user IDs that look like MongoDB ObjectIds
        const userIds = [...new Set(transactions.map(t => t.userId))].filter(id => id && id.length === 24);

        const users = await User.find({ _id: { $in: userIds } }, 'name ign playerId').lean();
        const userMap = users.reduce((acc, user) => {
            acc[user._id.toString()] = user;
            return acc;
        }, {});

        const result = transactions.map(t => ({
            ...t,
            id: t._id,
            userDetails: userMap[t.userId] || null
        }));

        res.json({ success: true, transactions: result });
    } catch (err) {
        console.error('Error fetching transactions:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const { id, status, processedBy, notes } = req.body;
        console.log('🔍 UPDATE STATUS CALLED:', { id, status, processedBy });

        const transaction = await Transaction.findById(id);
        if (!transaction) {
            console.log('❌ Transaction not found:', id);
            return res.status(404).json({ success: false, message: 'Transaction not found' });
        }
        console.log('✅ Transaction found:', { id: transaction._id, userId: transaction.userId, type: transaction.type, amount: transaction.amount, currentStatus: transaction.status });

        if (transaction.status !== 'pending' && transaction.status !== 'approved') {
            // Only pending or approved (for final completion) can be updated in this simple logic
        }

        transaction.status = status;
        transaction.processedBy = processedBy;
        transaction.processedAt = new Date();
        if (notes) transaction.notes = notes;

        console.log('🔍 Checking if status === completed:', { status, isMatch: status === 'completed' });
        if (status === 'completed') {
            const user = await User.findById(transaction.userId);
            if (user && transaction.type === 'deposit') {
                user.walletBalance = (user.walletBalance || 0) + transaction.amount;
                await user.save();
            }
        } else if (status === 'rejected' && transaction.type === 'withdrawal') {
            const user = await User.findById(transaction.userId);
            if (user) {
                user.walletBalance = (user.walletBalance || 0) + transaction.amount;
                await user.save();
            }
        }

        await transaction.save();
        res.json({ success: true, transaction });

    } catch (err) {
        console.error('❌ ERROR in updateStatus:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getTransactionStats = async (req, res) => {
    try {
        const transactions = await Transaction.find();

        const stats = {
            total: transactions.length,
            pendingDeposits: transactions.filter(t => t.type === 'deposit' && t.status === 'pending').length,
            pendingWithdrawals: transactions.filter(t => t.type === 'withdrawal' && t.status === 'pending').length,
            totalDeposits: transactions.filter(t => t.type === 'deposit' && t.status === 'completed').reduce((sum, t) => sum + t.amount, 0),
            totalWithdrawals: transactions.filter(t => t.type === 'withdrawal' && t.status === 'completed').reduce((sum, t) => sum + t.amount, 0),
            approvedToday: transactions.filter(t =>
                t.status === 'completed' &&
                new Date(t.processedAt).toDateString() === new Date().toDateString()
            ).length
        };

        res.json({ success: true, stats });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
