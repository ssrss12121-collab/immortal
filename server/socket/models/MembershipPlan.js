const mongoose = require('mongoose');

const MembershipPlanSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    durationDays: { type: Number, required: true },
    challengeLimit: { type: Number, default: 0 },
    discountPercentage: { type: Number, default: 0 },
    type: { type: String, enum: ['individual', 'team'], default: 'individual' },
    features: [String],
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
});

module.exports = mongoose.models.MembershipPlan || mongoose.model('MembershipPlan', MembershipPlanSchema);
