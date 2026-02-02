const Setting = require('../models/Setting');

exports.getSettings = async (req, res) => {
    try {
        const settings = await Setting.find();
        const config = {};
        settings.forEach(s => {
            config[s.key] = s.value;
        });
        res.json({ success: true, settings: config });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch settings' });
    }
};

exports.updateSetting = async (req, res) => {
    try {
        const { key, value } = req.body;
        const setting = await Setting.findOneAndUpdate(
            { key },
            { value },
            { upsert: true, new: true }
        );
        res.json({ success: true, setting });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to update setting' });
    }
};
