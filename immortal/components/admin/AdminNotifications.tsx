import React, { useState, useEffect } from 'react';
import { Bell, Send, Users, User, Upload, X as CloseIcon, Image as ImageIcon, Search } from 'lucide-react';
import { addNotification, broadcastNotification } from '../../utils/notificationStorage';
import { getAllUsers, auth } from '../../utils/auth';
import { UserProfile, Notification } from '../../types';

const AdminNotifications: React.FC = () => {
    const [targetType, setTargetType] = useState<'ALL' | 'SPECIFIC'>('ALL');
    const [targetUid, setTargetUid] = useState('');
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [type, setType] = useState<Notification['type']>('ANNOUNCEMENT');
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showUserList, setShowUserList] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            const all = await getAllUsers();
            setUsers(all);
        };
        fetchUsers();
    }, []);

    const handleSend = async () => {
        if (!message.trim() || !title.trim()) {
            alert('Title and Message are required');
            return;
        }
        if (targetType === 'SPECIFIC' && !targetUid.trim()) {
            alert('Please enter a User ID');
            return;
        }

        if (confirm(`Send notification to ${targetType === 'ALL' ? 'ALL USERS' : targetUid}?`)) {
            setLoading(true);
            try {
                if (targetType === 'ALL') {
                    await broadcastNotification({
                        title,
                        message,
                        type,
                        image: image || undefined
                    });
                } else {
                    await addNotification({
                        userId: targetUid,
                        title,
                        message,
                        type,
                        image: image || undefined
                    });
                }

                alert('Notification Sent Locally!');
                setMessage('');
                setTitle('');
                setTargetUid('');
                setImage(null);
            } catch (error) {
                console.error(error);
                alert('Failed to send notification');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Bell className="text-gaming-accent" /> Notification Center
            </h2>

            <div className="bg-white/5 border border-white/10 p-6 rounded-lg">
                <div className="flex gap-4 mb-6">
                    <button
                        onClick={() => setTargetType('ALL')}
                        className={`flex-1 p-4 rounded border flex flex-col items-center gap-2 transition-all ${targetType === 'ALL' ? 'bg-gaming-accent text-black border-gaming-accent' : 'bg-black/40 text-gray-400 border-white/10 hover:bg-white/5'}`}
                    >
                        <Users size={24} />
                        <span className="font-bold uppercase text-sm">Broadcast (All Users)</span>
                    </button>
                    <button
                        onClick={() => setTargetType('SPECIFIC')}
                        className={`flex-1 p-4 rounded border flex flex-col items-center gap-2 transition-all ${targetType === 'SPECIFIC' ? 'bg-gaming-accent text-black border-gaming-accent' : 'bg-black/40 text-gray-400 border-white/10 hover:bg-white/5'}`}
                    >
                        <User size={24} />
                        <span className="font-bold uppercase text-sm">Specific User</span>
                    </button>
                </div>

                <div className="space-y-4">
                    {targetType === 'SPECIFIC' && (
                        <div className="relative">
                            <label className="block text-xs text-gray-500 uppercase font-bold mb-1">Target User</label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={e => {
                                            setSearchTerm(e.target.value);
                                            setShowUserList(true);
                                        }}
                                        onFocus={() => setShowUserList(true)}
                                        className="w-full bg-black/40 border border-white/10 rounded p-3 text-white font-mono placeholder:text-gray-600"
                                        placeholder="Search by IGN or ID..."
                                    />
                                    <Search className="absolute right-3 top-3.5 text-gray-600" size={18} />
                                </div>
                                <div className="w-1/3">
                                    <input
                                        type="text"
                                        readOnly
                                        value={targetUid}
                                        className="w-full bg-black/20 border border-white/5 rounded p-3 text-gray-500 font-mono text-center"
                                        placeholder="UID"
                                    />
                                </div>
                            </div>

                            {showUserList && searchTerm && (
                                <div className="absolute z-50 left-0 right-0 mt-1 bg-[#1a1a24] border border-white/10 rounded-lg shadow-2xl max-h-48 overflow-y-auto">
                                    {users.filter(u =>
                                        u.ign.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        u.id.includes(searchTerm)
                                    ).map(u => (
                                        <div
                                            key={u.id}
                                            onClick={() => {
                                                setTargetUid(u.id);
                                                setSearchTerm(u.ign);
                                                setShowUserList(false);
                                            }}
                                            className="p-3 hover:bg-white/5 flex items-center justify-between cursor-pointer border-b border-white/5 last:border-0"
                                        >
                                            <div className="flex items-center gap-3">
                                                <img src={u.avatarUrl || `https://ui-avatars.com/api/?name=${u.ign}`} className="w-8 h-8 rounded-full border border-white/10" />
                                                <div>
                                                    <p className="text-white text-sm font-bold uppercase">{u.ign}</p>
                                                    <p className="text-[10px] text-gray-500 font-mono">ID: {u.id}</p>
                                                </div>
                                            </div>
                                            <span className="text-[10px] bg-gaming-accent/10 text-gaming-accent px-2 py-0.5 rounded border border-gaming-accent/20">SELECT</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-gray-500 uppercase font-bold mb-1">Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded p-3 text-white border-l-4 border-l-gaming-accent"
                                placeholder="Report Title"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 uppercase font-bold mb-1">Notification Type</label>
                            <select
                                value={type}
                                onChange={e => setType(e.target.value as any)}
                                className="w-full bg-black/40 border border-white/10 rounded p-3 text-white"
                            >
                                <option value="ANNOUNCEMENT">Announcement</option>
                                <option value="SYSTEM">System/Technical</option>
                                <option value="MATCH">Match Report</option>
                                <option value="CHALLENGE">Challenge Update</option>
                                <option value="TEAM_INVITE">Team Invite</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs text-gray-500 uppercase font-bold mb-1">Message</label>
                        <textarea
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded p-3 text-white h-32"
                            placeholder="Type your message here..."
                        />
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-xs text-gray-500 uppercase font-bold mb-1">Attached Image (Optional)</label>
                        {!image ? (
                            <label className="flex flex-col items-center justify-center w-full h-32 bg-black/40 border-2 border-dashed border-white/10 rounded-lg cursor-pointer hover:border-gaming-accent/50 transition-all group">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="text-gray-500 group-hover:text-gaming-accent mb-2" size={24} />
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Select Visual Data</p>
                                </div>
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                            </label>
                        ) : (
                            <div className="relative group rounded-lg overflow-hidden border border-white/10">
                                <img src={image} alt="Preview" className="w-full h-48 object-cover opacity-80" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                    <label className="p-3 bg-white/10 rounded-full hover:bg-gaming-accent hover:text-black cursor-pointer transition-all">
                                        <Upload size={20} />
                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                    </label>
                                    <button
                                        onClick={() => setImage(null)}
                                        className="p-3 bg-red-500/20 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all"
                                    >
                                        <CloseIcon size={20} />
                                    </button>
                                </div>
                                <div className="absolute top-3 left-3 px-2 py-1 bg-black/80 rounded border border-white/5 flex items-center gap-1.5 backdrop-blur-sm">
                                    <ImageIcon size={10} className="text-gaming-accent" />
                                    <span className="text-[8px] font-black text-white uppercase tracking-widest text-[8px]">Attachment Ready</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end">
                        <button
                            onClick={handleSend}
                            disabled={loading}
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded font-bold uppercase tracking-widest flex items-center gap-2 disabled:opacity-50"
                        >
                            {loading ? 'Sending...' : <><Send size={18} /> Send Notification</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminNotifications;
