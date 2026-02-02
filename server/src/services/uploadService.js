const r2Uploader = require('../cloudflare/r2Uploader');
const File = require('../models/File');

const uploadService = {
    /**
     * Process and save file upload
     * @param {Object} file Express multer file object
     * @param {string} userId User ID of the uploader
     * @returns {Promise<Object>} Saved file document
     */
    async processUpload(file, userId) {
        try {
            // 1. Upload to Cloudflare R2
            const uploadResult = await r2Uploader.upload(file.buffer, file.originalname, file.mimetype);

            // 2. Save metadata to MongoDB
            const fileDoc = new File({
                fileName: uploadResult.fileName,
                originalName: uploadResult.originalName,
                mimeType: uploadResult.mimeType,
                url: uploadResult.url,
                key: uploadResult.key,
                size: file.size,
                uploadedBy: userId
            });

            await fileDoc.save();
            return fileDoc;
        } catch (err) {
            console.error('Upload Service Error:', err);
            throw err;
        }
    }
};

module.exports = uploadService;
