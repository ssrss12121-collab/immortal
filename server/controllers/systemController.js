const Setting = require('../models/Setting');

exports.getSettings = async (req, res) => {
    try {
        const { key } = req.params;
        const entry = await Setting.findOne({ key });
        if (!entry) {
            return res.json({ success: true, value: null });
        }
        res.json({ success: true, value: entry.value });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.updateSettings = async (req, res) => {
    try {
        const { key, value } = req.body;

        const entry = await Setting.findOneAndUpdate(
            { key },
            { value },
            { upsert: true, new: true }
        );

        res.json({ success: true, entry });
    } catch (err) {
        console.error('❌ Update Settings Error:', err);
        res.status(500).json({ success: false, message: 'Server error during settings update', error: err.message });
    }
};
