import React, { useState, useCallback } from 'react';

interface FileUploadResponse {
    success: boolean;
    message: string;
    data?: {
        url: string;
        originalName: string;
        mimeType: string;
    };
}

const AdvancedUploader: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError(null);
        }
    };

    const handleUpload = useCallback(async () => {
        if (!file) {
            setError('Please select a file first');
            return;
        }

        setUploading(true);
        setUploadProgress(0);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/files/upload`, {
                method: 'POST',
                body: formData,
                // For progress tracking with fetch, you'd usually use XMLHttpRequest or a library like Axios
                // Keeping it simple here with fetch first
            });

            const result: FileUploadResponse = await response.json();

            if (result.success && result.data) {
                setUploadedUrl(result.data.url);
                setFile(null);
            } else {
                setError(result.message || 'Upload failed');
            }
        } catch (err) {
            console.error('Upload error:', err);
            setError('An error occurred during upload. Please try again.');
        } finally {
            setUploading(false);
        }
    }, [file]);

    return (
        <div className="p-6 bg-slate-900 rounded-xl border border-slate-800 shadow-2xl max-w-md mx-auto">
            <h2 className="text-xl font-bold text-white mb-4">Upload to Cloudflare R2</h2>

            <div className="space-y-4">
                <label className="block">
                    <span className="sr-only">Choose profile photo</span>
                    <input
                        type="file"
                        onChange={onFileChange}
                        className="block w-full text-sm text-slate-400
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-violet-50 file:text-violet-700
              hover:file:bg-violet-100"
                    />
                </label>

                {file && (
                    <div className="text-sm text-slate-300">
                        Selected: <span className="text-violet-400 font-medium">{file.name}</span>
                    </div>
                )}

                {uploading && (
                    <div className="w-full bg-slate-800 rounded-full h-2.5">
                        <div className="bg-violet-600 h-2.5 rounded-full duration-300" style={{ width: '50%' }}></div>
                    </div>
                )}

                <button
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    className={`w-full py-2 px-4 rounded-lg font-bold transition-all
            ${!file || uploading
                            ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                            : 'bg-violet-600 text-white hover:bg-violet-500 active:scale-95 shadow-lg shadow-violet-500/20'}`}
                >
                    {uploading ? 'Uploading...' : 'Upload File'}
                </button>

                {uploadedUrl && (
                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <p className="text-xs text-green-400 mb-1">Upload Successful!</p>
                        <a
                            href={uploadedUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-violet-400 hover:underline break-all"
                        >
                            View in Cloudflare R2
                        </a>
                    </div>
                )}

                {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <p className="text-sm text-red-500 font-medium">{error}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdvancedUploader;
