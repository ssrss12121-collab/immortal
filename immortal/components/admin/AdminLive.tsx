import React, { useState, useEffect } from 'react';
import { Radio, Save, Trash2, Plus, Youtube } from 'lucide-react';
import { LiveConfig } from '../../types';
import { getLiveConfig, saveLiveConfig } from '../../utils/liveStorage';
import { getEmbedUrl, getThumbnailUrl } from '../../utils/videoUtils';

const AdminLive: React.FC = () => {
    const [config, setConfig] = useState<LiveConfig>({ streams: [], archive: [] });
    const [activeTab, setActiveTab] = useState<'stream' | 'archive'>('stream');

    // New Item States
    const [newStream, setNewStream] = useState({ title: '', url: '' });
    const [newArchive, setNewArchive] = useState({ title: '', url: '' });

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        try {
            const data = await getLiveConfig();
            setConfig(data);
        } catch (error) {
            console.error('Failed to load live config', error);
        }
    };

    const handleSave = async () => {
        try {
            await saveLiveConfig(config);
            alert('Live configuration updated successfully!');
            // Notify other tabs immediately
            window.dispatchEvent(new Event('storage'));
        } catch (error) {
            alert('Failed to save configuration');
        }
    };

    const clearAll = () => {
        if (confirm('Are you sure you want to clear ALL live streams and videos? This cannot be undone.')) {
            const emptyConfig = { streams: [], archive: [] };
            setConfig(emptyConfig);
            saveLiveConfig(emptyConfig);
            alert('Configuration cleared.');
        }
    };

    // --- Stream Management ---
    const addStream = () => {
        if (!newStream.url) {
            alert('Please enter Stream URL');
            return;
        }
        const streamToAdd = {
            id: Date.now().toString(),
            title: 'Live Stream', // Default title
            url: getEmbedUrl(newStream.url),
            status: 'Offline' as const,
            viewers: '0'
        };
        setConfig({ ...config, streams: [streamToAdd, ...config.streams] });
        setNewStream({ title: '', url: '' }); // Reset form
    };

    const updateStream = (id: string, field: string, value: string) => {
        const updatedStreams = config.streams.map(stream =>
            stream.id === id ? { ...stream, [field]: value } : stream
        );
        setConfig({ ...config, streams: updatedStreams });
    };

    const removeStream = (id: string) => {
        if (confirm('Remove this stream?')) {
            setConfig({ ...config, streams: config.streams.filter(s => s.id !== id) });
        }
    };

    // --- Archive Management ---
    const addArchive = () => {
        if (!newArchive.url) {
            alert('Please enter Video URL');
            return;
        }
        const archiveToAdd = {
            id: Date.now().toString(),
            title: 'Archive Video', // Default title
            thumbnail: getThumbnailUrl(newArchive.url),
            url: getEmbedUrl(newArchive.url),
            date: '',
            duration: ''
        };
        setConfig({ ...config, archive: [archiveToAdd, ...config.archive] });
        setNewArchive({ title: '', url: '' }); // Reset form
    };

    const updateArchive = (id: string, field: string, value: string) => {
        const updatedArchive = config.archive.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        );
        setConfig({ ...config, archive: updatedArchive });
    };

    const removeArchive = (id: string) => {
        if (confirm('Remove this video from archive?')) {
            setConfig({ ...config, archive: config.archive.filter(item => item.id !== id) });
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Radio className="text-red-500" /> Live Page Management
                </h2>
                <div className="flex bg-black/40 p-1 rounded-lg border border-white/10">
                    <button
                        onClick={clearAll}
                        className="mr-2 px-3 py-2 rounded text-xs font-bold uppercase tracking-wider text-red-500 hover:bg-red-500/10 transition-all border border-red-500/20"
                    >
                        Clear All
                    </button>
                    <button
                        onClick={() => setActiveTab('stream')}
                        className={`px-4 py-2 rounded text-sm font-bold uppercase tracking-wider transition-all ${activeTab === 'stream' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        Live Streams
                    </button>
                    <button
                        onClick={() => setActiveTab('archive')}
                        className={`px-4 py-2 rounded text-sm font-bold uppercase tracking-wider transition-all ${activeTab === 'archive' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        Video Library
                    </button>
                </div>
            </div>

            {activeTab === 'stream' && (
                <div className="bg-white/5 border border-white/10 p-6 rounded-lg animate-in fade-in slide-in-from-bottom-4">
                    <div className="mb-8 bg-black/40 p-4 rounded-lg border border-white/10">
                        <h3 className="text-sm font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                            <Plus size={14} /> Add New Stream
                        </h3>
                        <div className="flex gap-4">
                            <input
                                type="text"
                                placeholder="YouTube Link (e.g. https://youtube.com/watch?v=...)"
                                value={newStream.url}
                                onChange={e => setNewStream({ ...newStream, url: e.target.value })}
                                className="flex-1 bg-black/40 border border-white/10 rounded p-2 text-white text-sm font-mono"
                            />
                            <button
                                onClick={addStream}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-bold uppercase tracking-wider transition-colors shrink-0"
                            >
                                Add Stream
                            </button>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {config.streams.length === 0 && (
                            <div className="text-center py-12 text-gray-500 border border-dashed border-white/10 rounded">
                                No active streams. Add one above to start.
                            </div>
                        )}
                        {config.streams.map(stream => (
                            <div key={stream.id} className="bg-black/40 border border-white/5 p-4 rounded flex flex-col lg:flex-row gap-6 items-start">
                                {/* Config Inputs */}
                                <div className="flex-1 space-y-4 w-full">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs text-gray-500 uppercase font-bold mb-1">Stream Title</label>
                                            <input
                                                type="text"
                                                value={stream.title}
                                                onChange={e => updateStream(stream.id, 'title', e.target.value)}
                                                className="w-full bg-black/40 border border-white/10 rounded p-2 text-white text-xs"
                                                placeholder="e.g., Weekly Tournament Finals"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 uppercase font-bold mb-1">YouTube URL</label>
                                            <input
                                                type="text"
                                                value={stream.url}
                                                onChange={e => updateStream(stream.id, 'url', e.target.value)}
                                                onBlur={e => updateStream(stream.id, 'url', getEmbedUrl(e.target.value))}
                                                className="w-full bg-black/40 border border-white/10 rounded p-2 text-white font-mono text-xs"
                                                placeholder="Paste YouTube Link"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs text-gray-500 uppercase font-bold mb-1">Status</label>
                                            <select
                                                value={stream.status}
                                                onChange={e => updateStream(stream.id, 'status', e.target.value as any)}
                                                className="w-full bg-black/40 border border-white/10 rounded p-2 text-white"
                                            >
                                                <option>Live</option>
                                                <option>Offline</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 uppercase font-bold mb-1">Viewers</label>
                                            <input
                                                type="text"
                                                value={stream.viewers}
                                                onChange={e => updateStream(stream.id, 'viewers', e.target.value)}
                                                className="w-full bg-black/40 border border-white/10 rounded p-2 text-white"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Preview */}
                                <div className="w-full lg:w-64 aspect-video bg-black border border-white/10 rounded overflow-hidden relative flex-shrink-0">
                                    <iframe
                                        className="w-full h-full opacity-50"
                                        src={getEmbedUrl(stream.url)}
                                        title="Preview"
                                        allowFullScreen
                                    ></iframe>
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <span className="bg-black/80 text-white px-2 py-1 rounded text-[10px] font-bold uppercase">Preview</span>
                                    </div>
                                </div>

                                <button onClick={() => removeStream(stream.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded self-center">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 flex justify-end">
                        <button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-bold uppercase tracking-widest flex items-center gap-2">
                            <Save size={16} /> Save All Changes
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'archive' && (
                <div className="bg-white/5 border border-white/10 p-6 rounded-lg animate-in fade-in slide-in-from-bottom-4">
                    <div className="mb-8 bg-black/40 p-4 rounded-lg border border-white/10">
                        <h3 className="text-sm font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                            <Plus size={14} /> Add New Video
                        </h3>
                        <div className="flex gap-4">
                            <input
                                type="text"
                                placeholder="YouTube Link"
                                value={newArchive.url}
                                onChange={e => setNewArchive({ ...newArchive, url: e.target.value })}
                                className="flex-1 bg-black/40 border border-white/10 rounded p-2 text-white text-sm font-mono"
                            />
                            <button
                                onClick={addArchive}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-bold uppercase tracking-wider transition-colors shrink-0"
                            >
                                Add Video
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {config.archive.length === 0 && (
                            <div className="text-center py-12 text-gray-500 border border-dashed border-white/10 rounded">
                                No videos in library. Add one above to start.
                            </div>
                        )}
                        {config.archive.map(item => (
                            <div key={item.id} className="bg-black/40 border border-white/5 p-4 rounded flex flex-col md:flex-row gap-4 items-start">
                                <div className="w-32 h-20 bg-black flex-shrink-0 rounded overflow-hidden relative group">
                                    <img src={item.thumbnail} className="w-full h-full object-cover" alt="" />
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Youtube size={20} className="text-white" />
                                    </div>
                                </div>

                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2 w-full">
                                    <input
                                        type="text"
                                        value={item.title}
                                        onChange={e => updateArchive(item.id, 'title', e.target.value)}
                                        className="bg-black/20 border border-white/10 rounded p-1.5 text-white text-xs font-bold"
                                        placeholder="Video Title"
                                    />
                                    <input
                                        type="text"
                                        value={item.date}
                                        onChange={e => updateArchive(item.id, 'date', e.target.value)}
                                        className="bg-black/20 border border-white/10 rounded p-1.5 text-gray-400 text-xs"
                                        placeholder="Date (e.g. 2 Hours Ago)"
                                    />
                                    <input
                                        type="text"
                                        value={item.duration}
                                        onChange={e => updateArchive(item.id, 'duration', e.target.value)}
                                        className="bg-black/20 border border-white/10 rounded p-1.5 text-gray-400 text-xs"
                                        placeholder="Duration (e.g. 10:42)"
                                    />
                                    <input
                                        type="text"
                                        value={item.thumbnail}
                                        onChange={e => updateArchive(item.id, 'thumbnail', e.target.value)}
                                        className="bg-black/20 border border-white/10 rounded p-1.5 text-gray-500 text-[10px] font-mono"
                                        placeholder="Thumbnail URL"
                                    />
                                    <input
                                        type="text"
                                        value={item.url}
                                        onChange={e => updateArchive(item.id, 'url', e.target.value)}
                                        onBlur={e => {
                                            const embedUrl = getEmbedUrl(e.target.value);
                                            updateArchive(item.id, 'url', embedUrl);
                                            updateArchive(item.id, 'thumbnail', getThumbnailUrl(embedUrl));
                                        }}
                                        className="bg-black/20 border border-white/10 rounded p-1.5 text-blue-400 text-[10px] font-mono"
                                        placeholder="Video URL"
                                    />
                                </div>

                                <button onClick={() => removeArchive(item.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded self-center">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 flex justify-end">
                        <button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-bold uppercase tracking-widest flex items-center gap-2">
                            <Save size={16} /> Save All Changes
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminLive;
