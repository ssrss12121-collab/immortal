const mongoose = require('mongoose');

const BannerSchema = new mongoose.Schema({
    image: { type: String, required: true },
    title: { type: String, required: true },
    description: String,
    badgeText: String,
    videoUrl: String,
    type: { type: String, enum: ['HERO', 'AD'], default: 'HERO' },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.models.Banner || mongoose.model('Banner', BannerSchema);
