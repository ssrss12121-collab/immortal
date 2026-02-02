const System = require('../models/System');

exports.getSettings = async (req, res) => {
    try {
        const { key } = req.params;
        const entry = await System.findOne({ key });
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

        let entry = await System.findOne({ key });
        if (entry) {
            entry.value = value;
            entry.updatedAt = new Date();
        } else {
            entry = new System({ key, value });
        }

        await entry.save();

        res.json({ success: true, entry });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
