// Match Archives are simple logs, we can use a basic schema or reuse Notification logic if needed, 
// but let's create a separate Archive model for clarity.
const mongoose = require('mongoose');

const ArchiveSchema = new mongoose.Schema({
    tournamentId: String,
    tournamentTitle: String,
    action: String,
    details: String,
    results: Object,
    timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

const Archive = mongoose.model('Archive', ArchiveSchema);

exports.getArchives = async (req, res) => {
    try {
        const archives = await Archive.find().sort({ createdAt: -1 });
        // Map _id to id for frontend compatibility
        const formattedArchives = archives.map(a => ({
            ...a.toObject(),
            id: a._id.toString()
        }));
        res.json({ success: true, archives: formattedArchives });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.addArchive = async (req, res) => {
    try {
        const entry = new Archive(req.body);
        await entry.save();
        // Map _id to id for frontend compatibility
        const formattedEntry = {
            ...entry.toObject(),
            id: entry._id.toString()
        };
        res.status(201).json({ success: true, entry: formattedEntry });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.deleteArchive = async (req, res) => {
    try {
        await Archive.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.updateArchive = async (req, res) => {
    try {
        const { id } = req.params;
        const entry = await Archive.findByIdAndUpdate(id, req.body, { new: true });
        if (!entry) return res.status(404).json({ success: false, message: 'Archive entry not found' });
        res.json({ success: true, entry });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
