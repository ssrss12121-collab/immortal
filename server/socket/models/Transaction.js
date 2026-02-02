const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    type: { type: String, enum: ['deposit', 'withdrawal'], required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'completed'], default: 'pending' },
    method: { type: String, required: true },
    accountNumber: String,
    accountHolderName: String,
    transactionId: String,
    screenshotUrl: String,
    processedAt: Date,
    processedBy: String,
    notes: String
}, { timestamps: true });

module.exports = mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);
