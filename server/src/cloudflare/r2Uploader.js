const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const path = require('path');
const crypto = require('crypto');

const s3Client = new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});

const r2Uploader = {
    /**
     * Upload a file to Cloudflare R2
     * @param {Buffer} fileBuffer 
     * @param {string} originalName 
     * @param {string} mimeType 
     * @returns {Promise<Object>} File metadata and public URL
     */
    async upload(fileBuffer, originalName, mimeType) {
        const fileExtension = path.extname(originalName);
        const fileName = `${crypto.randomBytes(16).toString('hex')}${fileExtension}`;
        const bucketName = process.env.R2_BUCKET_NAME;

        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: fileName,
            Body: fileBuffer,
            ContentType: mimeType,
        });

        try {
            await s3Client.send(command);
            // Public URL assuming the bucket is public or has a custom domain
            // If the bucket is not public, you'd generate a signed URL or use a worker
            const publicUrl = `${process.env.R2_PUBLIC_URL}/${fileName}`;

            return {
                fileName,
                originalName,
                mimeType,
                url: publicUrl,
                key: fileName
            };
        } catch (err) {
            console.error('R2 Upload Error:', err);
            throw new Error('Failed to upload file to Cloudflare R2');
        }
    }
};

module.exports = r2Uploader;
