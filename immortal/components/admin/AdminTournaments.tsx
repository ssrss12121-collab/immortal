import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Calendar, Map, Users, X, Save, Upload, Trophy, Search, Copy, RefreshCcw, Repeat } from 'lucide-react';
import { Tournament } from '../../types';
import { getTournaments, saveTournament, deleteTournament, restartTournament, rematchTournament } from '../../utils/tournamentStorage';
import { getCurrentAdmin } from '../../utils/adminAuth';
import AdminMatchManager from './AdminMatchManager';

const AdminTournaments: React.FC = () => {
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [managingTournament, setManagingTournament] = useState<Tournament | null>(null);
    const [searchId, setSearchId] = useState('');

    // Form State
    const [formData, setFormData] = useState<Partial<Tournament>>({
        title: '',
        category: 'Squad',
        isPremium: false,
        sponsors: [],
        prizePool: 0,
        startTime: '',
        map: 'Bermuda',
        slots: 48,
        filledSlots: 0,
        status: 'Open',
        image: 'https://picsum.photos/400/200?random=' + Math.random(),
        rules: '',
        videoUrl: '',
        roadmap: ''
    });

    useEffect(() => {
        loadTournaments();
        // Listen for storage events to update real-time
        window.addEventListener('storage', loadTournaments);
        return () => window.removeEventListener('storage', loadTournaments);
    }, []);

    const loadTournaments = async () => {
        try {
            const data = await getTournaments();
            setTournaments(data);
        } catch (error) {
            console.error('Failed to load tournaments', error);
        }
    };

    const handleDelete = async (id: string) => {
        // Only super admin can delete
        const currentAdmin = getCurrentAdmin();
        if (currentAdmin?.role !== 'super_admin') {
            alert('Only super admin can delete tournaments');
            return;
        }

        if (confirm('Are you sure you want to delete this tournament?')) {
            const deepDelete = confirm('Perform Deep Delete? This will erase this tournament from EVERY player and team match history permanently.');
            try {
                await deleteTournament(id, deepDelete);
                loadTournaments();
                alert(deepDelete ? 'Tournament and all related histories deleted permanently.' : 'Tournament deleted.');
            } catch (error) {
                alert('Failed to delete tournament');
            }
        }
    };

    const handleRestart = async (id: string) => {
        if (confirm('Are you sure you want to restart this tournament? All participants will be removed and status set to Open.')) {
            const res = await restartTournament(id);
            if (res.success) {
                alert(res.message);
                loadTournaments();
            } else {
                alert(res.message);
            }
        }
    };

    const handleRematch = async (id: string) => {
        if (confirm('Create a rematch for this tournament?')) {
            const res = await rematchTournament(id);
            if (res.success) {
                alert(res.message);
                loadTournaments();
            } else {
                alert(res.message);
            }
        }
    };

    const handleSave = async () => {
        if (!formData.title || !formData.startTime) {
            alert('Please fill in required fields');
            return;
        }

        const newTournament: Tournament = {
            id: editingId || Date.now().toString(),
            title: formData.title!,
            category: formData.category || 'Squad',
            isPremium: !!formData.isPremium,
            sponsors: formData.sponsors || [],
            prizePool: Number(formData.prizePool) || 0,
            startTime: formData.startTime || '',
            map: (formData.map as any) || 'Bermuda',
            slots: Number(formData.slots) || 48,
            filledSlots: Number(formData.filledSlots) || 0,
            status: (formData.status as any) || 'Open',
            image: formData.image || '',
            featured: formData.featured,
            showOnDeployments: formData.showOnDeployments,
            prizeList: (formData.prizeList || [0, 0, 0]).map(p => Number(p) || 0),
            participants: formData.participants || []
        };

        try {
            await saveTournament(newTournament);
            setIsCreating(false);
            setEditingId(null);
            setFormData({
                title: '', category: 'Squad', isPremium: false, sponsors: [], prizePool: 0, startTime: '', map: 'Bermuda', slots: 48, filledSlots: 0, status: 'Open',
                rules: '', roadmap: '', featured: false
            });
            loadTournaments();
            alert('Tournament saved successfully!');
        } catch (error: any) {
            console.error('Save Tournament Error:', error);
            alert('Failed to save tournament: ' + error.message);
        }
    };

    const startEdit = (t: Tournament) => {
        setFormData(t);
        setEditingId(t.id);
        setIsCreating(true);
    };

    if (managingTournament) {
        return <AdminMatchManager tournament={managingTournament} onBack={() => { setManagingTournament(null); loadTournaments(); }} />;
    }

    return (
        <div className="space-y-6 animate-fade-in text-white">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                <h2 className="text-xl md:text-2xl font-bold text-white">
                    {getCurrentAdmin()?.role === 'tournament_admin' ? 'My Tournaments' : 'Tournament Management'}
                </h2>
                <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        <input
                            type="text"
                            value={searchId}
                            onChange={(e) => setSearchId(e.target.value)}
                            placeholder="Search by ID or Title..."
                            className="bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:border-gaming-accent focus:outline-none w-full"
                        />
                    </div>
                    {!isCreating && getCurrentAdmin()?.role === 'super_admin' && (
                        <button
                            onClick={() => {
                                setEditingId(null);
                                setFormData({
                                    title: '', category: 'Squad', isPremium: false, sponsors: [], prizePool: 0, startTime: '', map: 'Bermuda', slots: 48, filledSlots: 0, status: 'Open',
                                    image: `https://picsum.photos/400/200?random=${Date.now()}`,
                                    rules: '', videoUrl: '', roadmap: '', featured: false
                                });
                                setIsCreating(true);
                            }}
                            className="bg-gaming-accent text-black px-4 py-2.5 rounded-lg font-bold hover:bg-gaming-accent/90 transition-all flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(0,255,157,0.2)] active:scale-95"
                        >
                            <Plus size={18} />
                            Create Tournament
                        </button>
                    )}
                </div>
            </div>

            {isCreating && (
                <div className="bg-white/5 border border-white/10 p-6 rounded-lg mb-6 animate-in fade-in slide-in-from-top-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-white">{editingId ? 'Edit Tournament' : 'New Tournament'}</h3>
                        <button onClick={() => setIsCreating(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Banner Upload Section */}
                        <div className="md:col-span-2 space-y-2">
                            <label className="block text-xs text-gray-500 uppercase font-bold mb-1">Tournament Banner</label>
                            <div className="flex items-start gap-4">
                                <div className="w-32 h-20 bg-black/40 border border-white/10 rounded overflow-hidden flex-shrink-0 relative group">
                                    <img
                                        src={formData.image}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                        onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/400/200?random=${Date.now()}` }}
                                    />
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div className="flex flex-col gap-2 w-full">
                                        <label className="cursor-pointer bg-gaming-accent/10 hover:bg-gaming-accent/20 text-gaming-accent border border-gaming-accent/30 p-4 rounded-xl text-xs font-black uppercase flex items-center justify-center gap-2 transition-all active:scale-95">
                                            <Upload size={18} /> Tap to Select Banner
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => {
                                                            setFormData({ ...formData, image: reader.result as string });
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                            />
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, image: `https://picsum.photos/400/200?random=${Date.now()}` })}
                                            className="w-full py-3 rounded-lg text-[10px] font-black uppercase tracking-widest border border-white/5 text-gray-500 hover:text-white hover:bg-white/5 active:bg-white/10 transition-all"
                                        >
                                            Generate AI placeholder
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        value={formData.image}
                                        onChange={e => setFormData({ ...formData, image: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded p-2 text-xs text-gray-300 font-mono"
                                        placeholder="Or paste image URL..."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs text-gray-500 uppercase font-bold mb-1">Video URL (YouTube or Direct MP4)</label>
                            <input type="text" value={formData.videoUrl || ''} onChange={e => setFormData({ ...formData, videoUrl: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded p-2 text-white font-mono" placeholder="https://youtube.com/watch?v=... or https://example.com/video.mp4" />
                            <p className="text-[10px] text-gray-500 mt-1">If provided, this video will autoplay (muted) instead of the banner image.</p>
                        </div>

                        <div>
                            <label className="block text-xs text-gray-500 uppercase font-bold mb-1">Title</label>
                            <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded p-2 text-white" placeholder="Tournament Name" />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 uppercase font-bold mb-1">Start Time</label>
                            <input type="text" value={formData.startTime} onChange={e => setFormData({ ...formData, startTime: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded p-2 text-white" placeholder="e.g. Today, 8:00 PM" />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 uppercase font-bold mb-1">Map</label>
                            <select value={formData.map} onChange={e => setFormData({ ...formData, map: e.target.value as any })} className="w-full bg-black/40 border border-white/10 rounded p-2 text-white">
                                <option>Bermuda</option><option>Purgatory</option><option>Kalahari</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 uppercase font-bold mb-1">Category</label>
                            <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value as any })} className="w-full bg-black/40 border border-white/10 rounded p-2 text-white">
                                <option>Solo</option><option>Duo</option><option>Squad</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-4 bg-white/5 p-4 rounded border border-white/10">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isPremium"
                                    checked={formData.isPremium || false}
                                    onChange={e => setFormData({ ...formData, isPremium: e.target.checked })}
                                    className="w-4 h-4 accent-gaming-accent"
                                />
                                <label htmlFor="isPremium" className="text-sm font-black uppercase text-gaming-accent cursor-pointer select-none tracking-widest">Premium Match</label>
                            </div>
                            <p className="text-[10px] text-gray-500 uppercase font-bold">Requires subscription to join</p>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 uppercase font-bold mb-1">Total Prize Pool (Auto)</label>
                            <input disabled type="number" value={formData.prizePool} className="w-full bg-black/20 border border-white/5 rounded p-2 text-gray-400 cursor-not-allowed font-mono" />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 uppercase font-bold mb-1">Slots</label>
                            <input type="number" value={formData.slots} onChange={e => setFormData({ ...formData, slots: Number(e.target.value) })} className="w-full bg-black/40 border border-white/10 rounded p-2 text-white" />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 uppercase font-bold mb-1">Status</label>
                            <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as any })} className="w-full bg-black/40 border border-white/10 rounded p-2 text-white">
                                <option>Open</option><option>Live</option><option>Completed</option>
                            </select>
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="block text-xs text-gray-500 uppercase font-bold mb-1">Sponsor Logos (URLs or Base64)</label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {formData.sponsors?.map((s, i) => (
                                    <div key={i} className="relative w-16 h-16 bg-white/5 border border-white/10 rounded overflow-hidden group">
                                        <img src={s} alt="Sponsor" className="w-full h-full object-contain" />
                                        <button onClick={() => setFormData({ ...formData, sponsors: formData.sponsors?.filter((_, index) => index !== i) })} className="absolute top-0 right-0 bg-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"><X size={10} /></button>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    id="new-sponsor"
                                    placeholder="Paste Image URL..."
                                    className="flex-1 bg-black/40 border border-white/10 rounded p-2 text-xs text-white"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            const val = (e.target as HTMLInputElement).value;
                                            if (val) {
                                                setFormData({ ...formData, sponsors: [...(formData.sponsors || []), val] });
                                                (e.target as HTMLInputElement).value = '';
                                            }
                                        }
                                    }}
                                />
                                <label className="cursor-pointer bg-white/5 hover:bg-white/10 border border-white/20 px-4 py-2 rounded text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                                    <Plus size={14} /> Upload
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    setFormData({ ...formData, sponsors: [...(formData.sponsors || []), reader.result as string] });
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                    />
                                </label>
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs text-gray-500 uppercase font-bold mb-1">Rules (Rich Text / HTML)</label>
                            <textarea value={formData.rules || ''} onChange={e => setFormData({ ...formData, rules: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded p-2 text-white h-24" placeholder="Enter tournament rules..." />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="block text-xs text-gray-500 uppercase font-bold mb-1">Roadmap Image (Big Match)</label>
                            <div className="flex items-start gap-4">
                                <div className="w-32 h-20 bg-black/40 border border-white/10 rounded overflow-hidden flex-shrink-0 relative group">
                                    {formData.roadmap ? (
                                        <img
                                            src={formData.roadmap}
                                            alt="Roadmap Preview"
                                            className="w-full h-full object-cover"
                                            onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/400/200?random=${Date.now()}` }}
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-600 text-[10px] uppercase font-bold">No Image</div>
                                    )}
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div className="flex flex-col gap-2 w-full">
                                        <label className="cursor-pointer bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 border border-blue-500/30 p-4 rounded-xl text-xs font-black uppercase flex items-center justify-center gap-2 transition-all active:scale-95">
                                            <Upload size={18} /> Tap to Select Roadmap
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => {
                                                            setFormData({ ...formData, roadmap: reader.result as string });
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                            />
                                        </label>
                                        {formData.roadmap && (
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, roadmap: '' })}
                                                className="w-full py-3 rounded-lg text-[10px] font-black uppercase border border-red-500/20 text-red-400 hover:bg-red-500/10 active:scale-95 transition-all"
                                            >
                                                Purge Asset
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-gray-500">Upload an image showing the tournament roadmap/schedule.</p>
                                </div>
                            </div>
                        </div>
                        <div className="md:col-span-2 flex items-center gap-4 bg-white/5 p-2 rounded border border-white/10">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="featured"
                                    checked={formData.featured || false}
                                    onChange={e => setFormData({ ...formData, featured: e.target.checked })}
                                    className="w-4 h-4 accent-gaming-accent"
                                />
                                <label htmlFor="featured" className="text-sm text-white font-bold cursor-pointer select-none">Home Banner</label>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="deployments"
                                    checked={formData.showOnDeployments || false}
                                    onChange={e => setFormData({ ...formData, showOnDeployments: e.target.checked })}
                                    className="w-4 h-4 accent-gaming-accent"
                                />
                                <label htmlFor="deployments" className="text-sm text-white font-bold cursor-pointer select-none">Deployments List</label>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 bg-white/5 p-4 rounded border border-white/10">
                        <h4 className="text-white text-sm font-bold uppercase mb-4 flex items-center gap-2">
                            <Trophy size={16} className="text-gaming-accent" /> Prize Distribution
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs text-gaming-accent uppercase font-bold mb-1">1st Place Prize</label>
                                <input
                                    type="number"
                                    value={formData.prizeList?.[0] || 0}
                                    onChange={e => {
                                        const newList = [...(formData.prizeList || [0, 0, 0])];
                                        newList[0] = Number(e.target.value);
                                        const newTotal = newList.reduce((a, b) => a + b, 0);
                                        setFormData({ ...formData, prizeList: newList, prizePool: newTotal });
                                    }}
                                    className="w-full bg-black/40 border border-gaming-accent/50 rounded p-2 text-white font-mono"
                                />
                            </div>

                            {formData.category === 'Solo' && (
                                <>
                                    <div>
                                        <label className="block text-xs text-gray-400 uppercase font-bold mb-1">2nd Place Prize</label>
                                        <input
                                            type="number"
                                            value={formData.prizeList?.[1] || 0}
                                            onChange={e => {
                                                const newList = [...(formData.prizeList || [0, 0, 0])];
                                                newList[1] = Number(e.target.value);
                                                const newTotal = newList.reduce((a, b) => a + b, 0);
                                                setFormData({ ...formData, prizeList: newList, prizePool: newTotal });
                                            }}
                                            className="w-full bg-black/40 border border-white/20 rounded p-2 text-white font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-400 uppercase font-bold mb-1">3rd Place Prize</label>
                                        <input
                                            type="number"
                                            value={formData.prizeList?.[2] || 0}
                                            onChange={e => {
                                                const newList = [...(formData.prizeList || [0, 0, 0])];
                                                newList[2] = Number(e.target.value);
                                                const newTotal = newList.reduce((a, b) => a + b, 0);
                                                setFormData({ ...formData, prizeList: newList, prizePool: newTotal });
                                            }}
                                            className="w-full bg-black/40 border border-white/20 rounded p-2 text-white font-mono"
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                    </div>

                    <div className="mt-4 flex justify-end">
                        <button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-bold flex items-center gap-2">
                            <Save size={18} /> Save Tournament
                        </button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 gap-4">
                {tournaments.filter(t => (t.id || '').toString().includes(searchId) || (t.title || '').toLowerCase().includes(searchId.toLowerCase())).map((tournament) => (
                    <div key={tournament.id || `temp-${Math.random()}`} className="bg-white/5 border border-white/10 p-3 sm:p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-white/[0.07] transition-all group">
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className="relative w-20 h-14 sm:w-28 sm:h-20 flex-shrink-0">
                                <img
                                    src={tournament.image}
                                    alt={tournament.title}
                                    className="w-full h-full object-cover rounded-lg border border-white/10 shadow-lg"
                                />
                                <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-black/60 backdrop-blur-md rounded text-[8px] font-black text-gaming-accent border border-gaming-accent/30 uppercase">
                                    {tournament.category}
                                </div>
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-gaming-accent transition-colors truncate">{tournament.title}</h3>
                                <div className="flex items-center gap-2 my-1">
                                    <span className="text-[9px] text-gray-500 font-mono bg-black/40 px-2 py-0.5 rounded border border-white/5 flex items-center gap-2">
                                        ID: {tournament.id}
                                        <button onClick={() => {
                                            navigator.clipboard.writeText(tournament.id);
                                            alert('Tournament ID copied!');
                                        }} className="hover:text-white transition-colors" title="Copy ID"><Copy size={10} /></button>
                                    </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] sm:text-xs text-gray-500 mt-1 uppercase font-bold">
                                    <span className="flex items-center gap-1"><Map size={12} className="text-gray-600" /> {tournament.map}</span>
                                    <span className="flex items-center gap-1"><Users size={12} className="text-gray-600" /> {tournament.filledSlots}/{tournament.slots}</span>
                                    <span className={`px-2 py-0.5 rounded text-[9px] tracking-tighter ${tournament.status === 'Live' ? 'bg-red-500/20 text-red-500 animate-pulse border border-red-500/30' :
                                        tournament.status === 'Open' ? 'bg-green-500/20 text-green-500 border border-green-500/30' :
                                            'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                                        }`}>
                                        {tournament.status}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end border-t border-white/5 pt-3 md:border-none md:pt-0">
                            <button
                                onClick={() => setManagingTournament(tournament)}
                                className="flex-1 md:flex-none bg-blue-600/10 hover:bg-blue-600/20 text-blue-500 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-600/30 transition-all hover:scale-105 active:scale-95"
                            >
                                Manage Match
                            </button>
                            <div className="flex items-center gap-2">
                                {getCurrentAdmin()?.role === 'super_admin' && (
                                    <>
                                        <button
                                            onClick={() => handleRestart(tournament.id)}
                                            className="p-2 sm:p-2.5 bg-white/5 hover:bg-gaming-accent/10 rounded-lg text-gaming-accent transition-all hover:scale-110"
                                            title="Restart Match"
                                        >
                                            <RefreshCcw size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleRematch(tournament.id)}
                                            className="p-2 sm:p-2.5 bg-white/5 hover:bg-purple-500/10 rounded-lg text-purple-500 transition-all hover:scale-110"
                                            title="Rematch"
                                        >
                                            <Repeat size={16} />
                                        </button>
                                        <button
                                            onClick={() => startEdit(tournament)}
                                            className="p-2 sm:p-2.5 bg-white/5 hover:bg-blue-500/10 rounded-lg text-blue-400 transition-all hover:scale-110"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(tournament.id)}
                                            className="p-2 sm:p-2.5 bg-white/5 hover:bg-red-500/10 rounded-lg text-red-500 transition-all hover:scale-110"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminTournaments;
