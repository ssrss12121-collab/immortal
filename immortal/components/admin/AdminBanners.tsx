
import React, { useState, useEffect, useRef } from 'react';
import { Upload, Image as ImageIcon, Save, Trash2, AlertTriangle, CheckCircle, Plus, X, Edit2, Camera } from 'lucide-react';
import { getBanners, addBanner, deleteBanner, updateBanner, Banner } from '../../utils/bannerStorage';

const AdminBanners: React.FC = () => {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [editingBannerId, setEditingBannerId] = useState<string | null>(null);

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [badgeText, setBadgeText] = useState('Event Info');
    const [bannerType, setBannerType] = useState<'HERO' | 'AD'>('HERO');
    const [videoUrl, setVideoUrl] = useState('');
    const [preview, setPreview] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const triggerFileInput = () => {
        if (fileInputRef.current) fileInputRef.current.click();
    };

    useEffect(() => {
        loadBanners();
    }, []);

    const loadBanners = async () => {
        try {
            const data = await getBanners();
            setBanners(data);
        } catch (error) {
            console.error('Failed to load banners');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
            setError(null);
        };
        reader.readAsDataURL(file);
    };

    const handleEdit = (banner: Banner) => {
        setEditingBannerId(banner.id);
        setTitle(banner.title);
        setDescription(banner.description);
        setBadgeText(banner.badgeText || 'Event Info');
        setBannerType(banner.type || 'HERO');
        setVideoUrl(banner.videoUrl || '');
        setPreview(banner.image);
        setIsAdding(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSave = async () => {
        if (!preview || !title || !description) {
            setError('All fields (Image, Title, Description) are required.');
            return;
        }

        try {
            if (editingBannerId) {
                await updateBanner(editingBannerId, {
                    image: preview,
                    title,
                    description,
                    badgeText,
                    type: bannerType,
                    videoUrl
                });
                setSuccess('Banner updated successfully!');
            } else {
                await addBanner({
                    image: preview,
                    title,
                    description,
                    badgeText,
                    type: bannerType,
                    videoUrl
                });
                setSuccess('Banner added successfully!');
            }

            resetForm();
            loadBanners();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to save banner');
        }
    };

    const resetForm = () => {
        setPreview(null);
        setTitle('');
        setDescription('');
        setBadgeText('Event Info');
        setBannerType('HERO');
        setVideoUrl('');
        setIsAdding(false);
        setEditingBannerId(null);
        setError(null);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Delete this banner?')) {
            try {
                await deleteBanner(id);
                loadBanners();
            } catch (error) {
                alert('Failed to delete banner');
            }
        }
    };

    const renderBannerCard = (banner: Banner) => (
        <div key={banner.id} className="bg-white/5 border border-white/10 p-3 sm:p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center hover:bg-white/[0.07] transition-all group relative">
            <div className="w-full md:w-56 h-32 flex-shrink-0 relative overflow-hidden rounded-lg">
                <img src={banner.image} alt={banner.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded text-[8px] font-black text-gaming-accent border border-gaming-accent/30 uppercase">
                    {banner.badgeText}
                </div>
            </div>
            <div className="flex-1 text-center md:text-left min-w-0">
                <h3 className="text-lg font-bold text-white group-hover:text-gaming-accent transition-colors">{banner.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 mt-1">{banner.description}</p>
                <div className="flex items-center justify-center md:justify-start gap-4 mt-2">
                    <p className="text-[10px] text-gray-600 font-mono">HASH: {banner.id}</p>
                    {banner.videoUrl && (
                        <span className="text-[10px] text-blue-500 font-black uppercase tracking-tighter">● VIDEO LINKED</span>
                    )}
                </div>
            </div>
            <div className="flex gap-2">
                <button
                    onClick={() => handleEdit(banner)}
                    className="p-3 bg-gaming-accent/10 hover:bg-gaming-accent/20 text-gaming-accent rounded-lg transition-all hover:scale-110 active:scale-95"
                    title="Edit"
                >
                    <Edit2 size={20} />
                </button>
                <button
                    onClick={() => handleDelete(banner.id)}
                    className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-all hover:scale-110 active:scale-95"
                    title="Delete"
                >
                    <Trash2 size={20} />
                </button>
            </div>
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in text-white">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl md:text-2xl font-bold text-white">Banner & Ads Management</h2>
                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="w-full sm:w-auto bg-gaming-accent text-black px-6 py-2.5 rounded-lg font-bold hover:bg-gaming-accent/90 transition-all flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(0,255,157,0.2)] active:scale-95"
                    >
                        <Plus size={18} /> Add New Asset
                    </button>
                )}
            </div>

            {isAdding && (
                <div className="bg-white/5 border border-white/10 p-4 sm:p-6 rounded-xl animate-in fade-in slide-in-from-top-4">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-white">
                            {editingBannerId ? 'Edit Asset Details' : 'New Asset Details'}
                        </h3>
                        <button onClick={resetForm} className="text-gray-400 hover:text-white transition-colors"><X size={20} /></button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] text-gray-500 uppercase font-black mb-1.5 tracking-widest">Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-gaming-accent focus:outline-none transition-colors"
                                    placeholder="e.g. Winter Championship"
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] text-gray-500 uppercase font-black mb-1.5 tracking-widest">Badge Text</label>
                                    <input
                                        type="text"
                                        value={badgeText}
                                        onChange={e => setBadgeText(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-gaming-accent focus:outline-none transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] text-gray-500 uppercase font-black mb-1.5 tracking-widest">Asset Type</label>
                                    <select
                                        value={bannerType}
                                        onChange={e => setBannerType(e.target.value as any)}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-gaming-accent focus:outline-none transition-colors"
                                    >
                                        <option value="HERO">Top Hero Banner</option>
                                        <option value="AD">Bottom Ad Banner</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] text-gray-500 uppercase font-black mb-1.5 tracking-widest">Video URL (Opt)</label>
                                <input
                                    type="text"
                                    value={videoUrl}
                                    onChange={e => setVideoUrl(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-gaming-accent focus:outline-none transition-colors"
                                    placeholder="YouTube or direct MP4"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] text-gray-500 uppercase font-black mb-1.5 tracking-widest">Description</label>
                                <textarea
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white h-24 focus:border-gaming-accent focus:outline-none transition-colors resize-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] text-gray-500 uppercase font-black mb-1.5 tracking-widest">Asset Preview</label>
                            <div className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center min-h-[250px] flex flex-col items-center justify-center bg-black/20 relative">
                                {preview ? (
                                    <div className="relative w-full h-full">
                                        <img src={preview} alt="Preview" className="max-h-[180px] mx-auto object-contain rounded-lg" />
                                        <button onClick={() => setPreview(null)} className="absolute -top-2 -right-2 p-2 bg-red-500 rounded-full text-white shadow-lg"><X size={16} /></button>
                                        <button onClick={triggerFileInput} className="mt-4 w-full py-2 bg-white/5 border border-white/10 rounded text-[10px] font-black uppercase tracking-widest hover:bg-white/10">Change Media</button>
                                    </div>
                                ) : (
                                    <div className="cursor-pointer" onClick={triggerFileInput}>
                                        <ImageIcon size={48} className="text-gray-600 mx-auto mb-2" />
                                        <p className="text-xs text-gray-500 font-bold uppercase">Click to Select Media</p>
                                    </div>
                                )}
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                            </div>
                        </div>
                    </div>

                    {error && <p className="text-red-500 text-xs mt-4 font-bold">{error}</p>}
                    {success && <p className="text-green-500 text-xs mt-4 font-bold">{success}</p>}

                    <div className="mt-6 flex justify-end gap-3">
                        <button onClick={resetForm} className="px-6 py-2 text-gray-500 hover:text-white font-bold uppercase text-xs">Cancel</button>
                        <button onClick={handleSave} className="bg-gaming-accent text-black px-8 py-2 rounded-lg font-black uppercase text-xs">
                            {editingBannerId ? 'Update Asset' : 'Save Asset'}
                        </button>
                    </div>
                </div>
            )}

            <div className="space-y-12">
                <section>
                    <h3 className="text-xs font-black uppercase text-gaming-accent mb-4 border-l-4 border-gaming-accent pl-2">Top Hero Banners</h3>
                    <div className="space-y-4">
                        {banners.filter(b => b.type !== 'AD').length === 0 && !isAdding && (
                            <p className="text-center py-10 bg-white/5 rounded text-gray-500 text-xs uppercase font-bold">No hero banners</p>
                        )}
                        {banners.filter(b => b.type !== 'AD').map(renderBannerCard)}
                    </div>
                </section>

                <section>
                    <h3 className="text-xs font-black uppercase text-blue-500 mb-4 border-l-4 border-blue-500 pl-2">Bottom Ad Banners</h3>
                    <div className="space-y-4">
                        {banners.filter(b => b.type === 'AD').length === 0 && !isAdding && (
                            <p className="text-center py-10 bg-white/5 rounded text-gray-500 text-xs uppercase font-bold">No ad banners</p>
                        )}
                        {banners.filter(b => b.type === 'AD').map(renderBannerCard)}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AdminBanners;
