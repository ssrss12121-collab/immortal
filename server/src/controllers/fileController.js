const uploadService = require('../services/uploadService');

const fileController = {
    /**
     * Handle single file upload
     */
    async uploadFile(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ success: false, message: 'No file uploaded' });
            }

            const userId = req.user ? req.user.id : null; // Assuming auth middleware
            const savedFile = await uploadService.processUpload(req.file, userId);

            res.status(201).json({
                success: true,
                message: 'File uploaded successfully',
                data: savedFile
            });
        } catch (err) {
            console.error('File Controller Error:', err);
            res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
        }
    }
};

module.exports = fileController;
