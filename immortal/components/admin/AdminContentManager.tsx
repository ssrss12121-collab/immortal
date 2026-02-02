import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Save, X, Upload, Flame, Star, Trophy } from 'lucide-react';
import { getNews, addNews, deleteNews, updateNewsItem, getMVPs, addMVP, deleteMVP, updateMVPItem, getTerms, saveTerms } from '../../utils/newsStorage';
import { getUserById } from '../../utils/auth';
import { MVPItem, NewsItem } from '../../types';

const AdminContentManager: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'NEWS' | 'MVP' | 'TERMS'>('NEWS');
    const [news, setNews] = useState<NewsItem[]>([]);
    const [mvps, setMvps] = useState<MVPItem[]>([]);
    const [termsContent, setTermsContent] = useState('');

    // Form States
    const [isCreating, setIsCreating] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [newsForm, setNewsForm] = useState<Partial<NewsItem>>({
        title: '',
        image: `https://picsum.photos/400/200?random=${Date.now()}`,
        type: 'Update',
        content: ''
    });

    const [mvpForm, setMvpForm] = useState<Partial<MVPItem>>({
        name: '',
        userId: '',
        image: `https://picsum.photos/400/200?random=${Date.now()}`,
        description: '',
        team: '',
        role: 'Rusher',
        stats: { kills: 0, matches: 0, wins: 0 }
    });

    const handleFetchUser = async () => {
        if (!mvpForm.userId) return alert("Please enter a User ID");
        try {
            const user = await getUserById(mvpForm.userId);
            if (user) {
                setMvpForm(prev => ({
                    ...prev,
                    name: user.ign,
                    image: user.avatarUrl || prev.image,
                    role: user.role || 'Rusher',
                    stats: {
                        kills: user.stats?.kills || 0,
                        wins: user.stats?.wins || 0,
                        matches: user.stats?.matches || 0
                    },
                    team: ''
                }));
                alert("User data fetched successfully!");
            } else {
                alert("User not found!");
            }
        } catch (error) {
            alert("Error fetching user data");
        }
    };

    useEffect(() => {
        loadContent();
    }, []);

    const loadContent = async () => {
        try {
            const [newsData, mvpData, termsData] = await Promise.all([
                getNews(),
                getMVPs(),
                getTerms()
            ]);

            setNews(newsData);
            setMvps(mvpData);
            setTermsContent(termsData);
        } catch (error) {
            console.error("Failed to load content", error);
        }
    };

    // --- TERMS HANDLERS ---
    const handleSaveTerms = async () => {
        try {
            await saveTerms(termsContent);
            alert("Terms & Conditions saved successfully!");
        } catch {
            alert("Failed to save terms");
        }
    };

    // --- NEWS HANDLERS ---
    const handleSaveNews = async () => {
        if (!newsForm.title) return alert("Title required");

        try {
            if (editingId) {
                await updateNewsItem(editingId, {
                    title: newsForm.title,
                    image: newsForm.image,
                    type: newsForm.type as any,
                    content: newsForm.content || ''
                });
            } else {
                await addNews({
                    title: newsForm.title!,
                    content: newsForm.content || '',
                    image: newsForm.image!,
                    type: newsForm.type as any
                });
            }
            loadContent();
            resetForms();
        } catch (error) {
            alert("Failed to save news");
        }
    };

    const handleDeleteNews = async (id: string) => {
        if (confirm("Delete this news item?")) {
            await deleteNews(id);
            loadContent();
        }
    };

    // --- MVP HANDLERS ---
    const handleSaveMVP = async () => {
        if (!mvpForm.name) return alert("Name required");

        try {
            const payload: any = {
                userId: mvpForm.userId,
                name: mvpForm.name,
                image: mvpForm.image,
                description: mvpForm.description,
                team: mvpForm.team,
                role: mvpForm.role,
                stats: mvpForm.stats
            };

            if (editingId) {
                await updateMVPItem(editingId, payload);
            } else {
                await addMVP(payload);
            }
            loadContent();
            resetForms();
        } catch (error: any) {
            alert('Failed to save MVP: ' + error.message);
        }
    };

    const handleDeleteMVP = async (id: string) => {
        if (confirm("Delete this MVP?")) {
            await deleteMVP(id);
            loadContent();
        }
    };

    const resetForms = () => {
        setIsCreating(false);
        setEditingId(null);
        setNewsForm({ title: '', image: `https://picsum.photos/400/200?random=${Date.now()}`, type: 'Update' });
        setMvpForm({ name: '', userId: '', image: `https://picsum.photos/400/200?random=${Date.now()}`, description: '', team: '', role: 'Rusher', stats: { kills: 0, matches: 0, wins: 0 } });
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'NEWS' | 'MVP') => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (type === 'NEWS') setNewsForm(prev => ({ ...prev, image: reader.result as string }));
                else setMvpForm(prev => ({ ...prev, image: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Content Manager</h2>
                {activeTab !== 'TERMS' && !isCreating && (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="bg-gaming-accent text-black px-4 py-2 rounded-lg font-bold hover:bg-gaming-accent/90 transition-colors flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Add {activeTab === 'NEWS' ? 'News' : 'MVP'}
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-black/40 p-1 rounded-lg border border-white/10 w-fit">
                <button
                    onClick={() => { setActiveTab('NEWS'); setIsCreating(false); }}
                    className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'NEWS' ? 'bg-gaming-primary text-black' : 'text-gray-500 hover:text-white'}`}
                >
                    Intel Feed
                </button>
                <button
                    onClick={() => { setActiveTab('MVP'); setIsCreating(false); }}
                    className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'MVP' ? 'bg-gaming-primary text-black' : 'text-gray-500 hover:text-white'}`}
                >
                    MVP Spotlight
                </button>
                <button
                    onClick={() => { setActiveTab('TERMS'); setIsCreating(false); }}
                    className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'TERMS' ? 'bg-gaming-primary text-black' : 'text-gray-500 hover:text-white'}`}
                >
                    Terms & Conditions
                </button>
            </div>

            {/* MAIN CONTENT AREA */}
            {activeTab === 'TERMS' ? (
                <div className="bg-white/5 border border-white/10 p-6 rounded-lg animate-fade-in">
                    <h3 className="text-white font-bold mb-4">Edit Terms & Conditions</h3>
                    <textarea
                        value={termsContent}
                        onChange={(e) => setTermsContent(e.target.value)}
                        className="w-full h-96 bg-black/40 border border-white/10 rounded-lg p-4 text-white font-mono text-sm leading-relaxed focus:outline-none focus:border-gaming-accent mb-4"
                        placeholder="Enter terms and conditions here..."
                    />
                    <div className="flex justify-end">
                        <button onClick={handleSaveTerms} className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded font-bold flex items-center gap-2 uppercase text-xs tracking-wider">
                            <Save size={16} /> Save Changes
                        </button>
                    </div>
                </div>
            ) : (
                /* NEWS & MVP VIEWS */
                <>
                    {isCreating ? (
                        <div className="bg-white/5 border border-white/10 p-6 rounded-lg mb-6 animate-in fade-in slide-in-from-top-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-white">{editingId ? 'Edit Item' : 'New Item'}</h3>
                                <button onClick={resetForms} className="text-gray-400 hover:text-white"><X size={20} /></button>
                            </div>

                            {activeTab === 'NEWS' ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2">
                                            <label className="block text-xs text-gray-500 uppercase font-bold mb-1">Image</label>
                                            <div className="flex items-center gap-4">
                                                <img src={newsForm.image} className="w-32 h-20 object-cover rounded border border-white/10" alt="Preview" />
                                                <label className="cursor-pointer bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded text-xs font-bold uppercase flex items-center gap-2">
                                                    <Upload size={14} /> Upload
                                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'NEWS')} />
                                                </label>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 uppercase font-bold mb-1">Title</label>
                                            <input type="text" value={newsForm.title} onChange={e => setNewsForm({ ...newsForm, title: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded p-2 text-white" />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 uppercase font-bold mb-1">Type</label>
                                            <select value={newsForm.type} onChange={e => setNewsForm({ ...newsForm, type: e.target.value as any })} className="w-full bg-black/40 border border-white/10 rounded p-2 text-white">
                                                <option>Update</option>
                                                <option>Winner</option>
                                            </select>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs text-gray-500 uppercase font-bold mb-1">Content / Description</label>
                                            <textarea
                                                value={newsForm.content || ''}
                                                onChange={e => setNewsForm({ ...newsForm, content: e.target.value })}
                                                className="w-full bg-black/40 border border-white/10 rounded p-2 text-white h-24"
                                                placeholder="Enter news details..."
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <button onClick={handleSaveNews} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-bold flex items-center gap-2">
                                            <Save size={18} /> Save News
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2">
                                            <label className="block text-xs text-gray-500 uppercase font-bold mb-1">Auto-Fill from User ID</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Enter User ID"
                                                    value={mvpForm.userId || ''}
                                                    onChange={e => setMvpForm({ ...mvpForm, userId: e.target.value })}
                                                    className="flex-1 bg-black/40 border border-white/10 rounded p-2 text-white font-mono"
                                                />
                                                <button onClick={handleFetchUser} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-bold text-xs uppercase">
                                                    Fetch Data
                                                </button>
                                            </div>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs text-gray-500 uppercase font-bold mb-1">Player Image / Banner</label>
                                            <div className="flex items-center gap-4">
                                                <img src={mvpForm.image} className="w-32 h-20 object-cover rounded border border-white/10" alt="Preview" />
                                                <label className="cursor-pointer bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded text-xs font-bold uppercase flex items-center gap-2">
                                                    <Upload size={14} /> Upload
                                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'MVP')} />
                                                </label>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 uppercase font-bold mb-1">Player Name</label>
                                            <input type="text" value={mvpForm.name} onChange={e => setMvpForm({ ...mvpForm, name: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded p-2 text-white" />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 uppercase font-bold mb-1">Team Name</label>
                                            <input type="text" value={mvpForm.team} onChange={e => setMvpForm({ ...mvpForm, team: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded p-2 text-white" />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 uppercase font-bold mb-1">Role</label>
                                            <select value={mvpForm.role} onChange={e => setMvpForm({ ...mvpForm, role: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded p-2 text-white">
                                                <option>Rusher</option><option>Sniper</option><option>Supporter</option><option>Nader</option><option>IGL</option>
                                            </select>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs text-gray-500 uppercase font-bold mb-1">Description / Bio</label>
                                            <textarea value={mvpForm.description} onChange={e => setMvpForm({ ...mvpForm, description: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded p-2 text-white h-20" />
                                        </div>

                                        <div><label className="block text-xs text-gray-500 uppercase font-bold mb-1">Kills</label><input type="number" value={mvpForm.stats?.kills} onChange={e => setMvpForm({ ...mvpForm, stats: { ...mvpForm.stats!, kills: Number(e.target.value) } })} className="w-full bg-black/40 border border-white/10 rounded p-2 text-white" /></div>
                                        <div><label className="block text-xs text-gray-500 uppercase font-bold mb-1">Wins</label><input type="number" value={mvpForm.stats?.wins} onChange={e => setMvpForm({ ...mvpForm, stats: { ...mvpForm.stats!, wins: Number(e.target.value) } })} className="w-full bg-black/40 border border-white/10 rounded p-2 text-white" /></div>
                                    </div>
                                    <div className="flex justify-end">
                                        <button onClick={handleSaveMVP} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-bold flex items-center gap-2">
                                            <Save size={18} /> Save MVP
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* LIST VIEW */
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {activeTab === 'NEWS' ? news.map(item => (
                                <div key={item.id} className="bg-white/5 border border-white/10 rounded-lg overflow-hidden group">
                                    <div className="h-32 relative">
                                        <img src={item.image} className="w-full h-full object-cover" alt={item.title} />
                                        <div className="absolute top-2 right-2 flex gap-1">
                                            <button onClick={() => { setNewsForm(item); setEditingId(item.id); setIsCreating(true); }} className="p-1.5 bg-black/50 text-white rounded hover:bg-blue-600"><Edit2 size={14} /></button>
                                            <button onClick={() => handleDeleteNews(item.id)} className="p-1.5 bg-black/50 text-white rounded hover:bg-red-600"><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                    <div className="p-3">
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold ${item.type === 'Winner' ? 'bg-gaming-accent/20 text-gaming-accent' : 'bg-blue-500/20 text-blue-500'}`}>{item.type}</span>
                                        <h4 className="text-sm font-bold text-white mt-2 line-clamp-2">{item.title}</h4>
                                    </div>
                                </div>
                            )) : mvps.map(item => (
                                <div key={item.id} className="bg-white/5 border border-white/10 rounded-lg overflow-hidden group">
                                    <div className="h-32 relative">
                                        <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                                        <div className="absolute top-2 right-2 flex gap-1">
                                            <button onClick={() => { setMvpForm(item); setEditingId(item.id); setIsCreating(true); }} className="p-1.5 bg-black/50 text-white rounded hover:bg-blue-600"><Edit2 size={14} /></button>
                                            <button onClick={() => handleDeleteMVP(item.id)} className="p-1.5 bg-black/50 text-white rounded hover:bg-red-600"><Trash2 size={14} /></button>
                                        </div>
                                        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black to-transparent p-2">
                                            <h4 className="text-white font-bold">{item.name}</h4>
                                            <p className="text-xs text-gray-300">{item.team}</p>
                                        </div>
                                    </div>
                                    <div className="p-3 grid grid-cols-3 gap-2 text-center">
                                        <div className="bg-black/40 rounded p-1"><div className="text-[10px] text-gray-500 uppercase">Kills</div><div className="text-white font-bold">{item.stats?.kills}</div></div>
                                        <div className="bg-black/40 rounded p-1"><div className="text-[10px] text-gray-500 uppercase">Wins</div><div className="text-white font-bold">{item.stats?.wins}</div></div>
                                        <div className="bg-black/40 rounded p-1"><div className="text-[10px] text-gray-500 uppercase">Role</div><div className="text-white font-bold text-[10px]">{item.role}</div></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default AdminContentManager;
