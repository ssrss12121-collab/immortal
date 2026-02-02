const mongoose = require('mongoose');

const systemSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true }, // e.g., 'payment_settings', 'live_config', 'featured_storage'
    value: { type: mongoose.Schema.Types.Mixed, required: true },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.System || mongoose.model('System', systemSchema);
