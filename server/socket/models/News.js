const mongoose = require('mongoose');

const NewsSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    type: { type: String, default: 'Update' },
    image: String,
    date: { type: String }
}, { timestamps: true });

const MVPSchema = new mongoose.Schema({
    userId: String,
    name: { type: String, required: true },
    image: String, // Matching controller's 'image' field
    avatar: String, // Keeping for compatibility
    description: String,
    role: String,
    stats: mongoose.Schema.Types.Mixed,
    kills: Number,
    tournamentTitle: String
}, { timestamps: true });

module.exports = {
    News: mongoose.models.News || mongoose.model('News', NewsSchema),
    MVP: mongoose.models.MVP || mongoose.model('MVP', MVPSchema)
};
