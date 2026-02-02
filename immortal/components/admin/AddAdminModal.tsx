import React, { useState, useEffect } from 'react';
import { X, UserPlus, Shield, Trophy, Image, FileText, Users as UsersIcon, Radio, Crown } from 'lucide-react';
import { createAdmin, AdminUser } from '../../utils/adminStorage';
import { getTournaments } from '../../utils/tournamentStorage';
import { Tournament } from '../../types';

interface AddAdminModalProps {
    onClose: () => void;
    onSuccess: () => void;
    currentAdminId: string;
}

const AddAdminModal: React.FC<AddAdminModalProps> = ({ onClose, onSuccess, currentAdminId }) => {
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'tournament_admin' as AdminUser['role'],
        selectedTournaments: [] as string[],
        canManageChallenges: false
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadTournaments();
    }, []);

    const loadTournaments = async () => {
        try {
            const data = await getTournaments();
            if (Array.isArray(data)) {
                setTournaments(data);
            } else {
                console.error("Invalid tournaments data received:", data);
                setTournaments([]);
            }
        } catch (err) {
            console.error("Failed to load tournaments in modal:", err);
            setTournaments([]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!formData.username || !formData.email || !formData.password) {
            setError('Please fill in all required fields');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            // Prepare Permissions
            const isSuper = formData.role === 'super_admin';
            const permissionsPayload = {
                tournaments: formData.selectedTournaments,
                canManageChallenges: isSuper || formData.role === 'challenge_admin',
                canManageUsers: isSuper || formData.role === 'user_admin',
                canManageTransactions: isSuper || formData.role === 'user_admin', // User admin usually manages transactions too, or super
                canManageBanners: isSuper || formData.role === 'banner_admin',
                canManageContent: isSuper || formData.role === 'content_admin',
                canManageLive: isSuper || formData.role === 'live_admin'
            };

            await createAdmin({
                username: formData.username,
                email: formData.email,
                password: formData.password,
                role: formData.role,
                permissions: permissionsPayload
            });
            onSuccess();
            onClose();
        } catch (error: any) {
            setError(error.message || 'Failed to create admin. Check server logs.');
        } finally {
            setLoading(false);
        }
    };

    const toggleTournament = (tournamentId: string) => {
        if (formData.selectedTournaments.includes(tournamentId)) {
            setFormData({
                ...formData,
                selectedTournaments: formData.selectedTournaments.filter(id => id !== tournamentId)
            });
        } else {
            setFormData({
                ...formData,
                selectedTournaments: [...formData.selectedTournaments, tournamentId]
            });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-2xl bg-[#0c0c12] border border-white/10 rounded-lg shadow-[0_0_30px_rgba(0,255,157,0.1)] max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-white/10 bg-white/5 sticky top-0 z-10">
                    <h3 className="text-xl font-black italic uppercase tracking-wider text-white flex items-center">
                        <UserPlus className="mr-2 text-gaming-accent" size={24} />
                        Add New Admin
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded">
                            {error}
                        </div>
                    )}

                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-gray-500 uppercase font-bold mb-2">
                                Username <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 rounded p-3 text-white focus:border-gaming-accent focus:outline-none"
                                placeholder="admin_username"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs text-gray-500 uppercase font-bold mb-2">
                                Email <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 rounded p-3 text-white focus:border-gaming-accent focus:outline-none"
                                placeholder="admin@example.com"
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs text-gray-500 uppercase font-bold mb-2">
                                Password <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 rounded p-3 text-white focus:border-gaming-accent focus:outline-none"
                                placeholder="Minimum 6 characters"
                                minLength={6}
                                required
                            />
                        </div>
                    </div>

                    {/* Role Selection */}
                    <div>
                        <label className="block text-xs text-gray-500 uppercase font-bold mb-2">
                            Admin Role <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setFormData({
                                    ...formData,
                                    role: 'super_admin',
                                    selectedTournaments: [],
                                    canManageChallenges: true // Super admin gets all
                                })}
                                className={`p-4 rounded-lg border-2 transition-all text-left ${formData.role === 'super_admin'
                                    ? 'border-gaming-accent bg-gaming-accent/10'
                                    : 'border-white/10 bg-white/5 hover:border-white/20'
                                    }`}
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <Crown size={20} className="text-yellow-400" />
                                    <span className="font-bold text-white">Super Admin</span>
                                </div>
                                <p className="text-xs text-gray-400">Full access to manage EVERYTHING</p>
                            </button>

                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, role: 'tournament_admin', canManageChallenges: false })}
                                className={`p-4 rounded-lg border-2 transition-all text-left ${formData.role === 'tournament_admin'
                                    ? 'border-gaming-accent bg-gaming-accent/10'
                                    : 'border-white/10 bg-white/5 hover:border-white/20'
                                    }`}
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <Trophy size={20} className="text-gaming-accent" />
                                    <span className="font-bold text-white">Tournament Admin</span>
                                </div>
                                <p className="text-xs text-gray-400">Manage specific tournaments and their matches</p>
                            </button>

                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, role: 'challenge_admin', selectedTournaments: [] })}
                                className={`p-4 rounded-lg border-2 transition-all text-left ${formData.role === 'challenge_admin'
                                    ? 'border-gaming-accent bg-gaming-accent/10'
                                    : 'border-white/10 bg-white/5 hover:border-white/20'
                                    }`}
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <Shield size={20} className="text-blue-400" />
                                    <span className="font-bold text-white">Challenge Admin</span>
                                </div>
                                <p className="text-xs text-gray-400">Manage all challenge matches</p>
                            </button>

                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, role: 'banner_admin', selectedTournaments: [] })}
                                className={`p-4 rounded-lg border-2 transition-all text-left ${formData.role === 'banner_admin'
                                    ? 'border-gaming-accent bg-gaming-accent/10'
                                    : 'border-white/10 bg-white/5 hover:border-white/20'
                                    }`}
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <Image size={20} className="text-purple-400" />
                                    <span className="font-bold text-white">Banner Admin</span>
                                </div>
                                <p className="text-xs text-gray-400">Manage banners and promotional content</p>
                            </button>

                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, role: 'content_admin', selectedTournaments: [] })}
                                className={`p-4 rounded-lg border-2 transition-all text-left ${formData.role === 'content_admin'
                                    ? 'border-gaming-accent bg-gaming-accent/10'
                                    : 'border-white/10 bg-white/5 hover:border-white/20'
                                    }`}
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <FileText size={20} className="text-gaming-accent" />
                                    <span className="font-bold text-white">Content Admin</span>
                                </div>
                                <p className="text-xs text-gray-400">Manage content and news articles</p>
                            </button>

                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, role: 'user_admin', selectedTournaments: [] })}
                                className={`p-4 rounded-lg border-2 transition-all text-left ${formData.role === 'user_admin'
                                    ? 'border-gaming-accent bg-gaming-accent/10'
                                    : 'border-white/10 bg-white/5 hover:border-white/20'
                                    }`}
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <UsersIcon size={20} className="text-pink-400" />
                                    <span className="font-bold text-white">User Admin</span>
                                </div>
                                <p className="text-xs text-gray-400">Manage user accounts and profiles</p>
                            </button>

                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, role: 'live_admin', selectedTournaments: [] })}
                                className={`p-4 rounded-lg border-2 transition-all text-left ${formData.role === 'live_admin'
                                    ? 'border-gaming-accent bg-gaming-accent/10'
                                    : 'border-white/10 bg-white/5 hover:border-white/20'
                                    }`}
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <Radio size={24} className="text-red-500" />
                                    <span className="font-bold text-white">Live Manager</span>
                                </div>
                                <p className="text-xs text-gray-400">Manage live streams and archive</p>
                            </button>
                        </div>
                    </div>

                    {/* Tournament Selection (for Tournament Admin) */}
                    {formData.role === 'tournament_admin' && (
                        <div>
                            <label className="block text-xs text-gray-500 uppercase font-bold mb-2">
                                Assign Tournaments <span className="text-red-500">*</span>
                            </label>
                            <div className="bg-black/40 border border-white/10 rounded-lg p-4 max-h-60 overflow-y-auto space-y-2">
                                {tournaments.length === 0 ? (
                                    <p className="text-gray-500 text-sm text-center py-4">No tournaments available</p>
                                ) : (
                                    tournaments.map((tournament) => (
                                        <label
                                            key={tournament.id}
                                            className="flex items-center gap-3 p-3 rounded hover:bg-white/5 cursor-pointer transition-colors"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={formData.selectedTournaments.includes(tournament.id)}
                                                onChange={() => toggleTournament(tournament.id)}
                                                className="w-4 h-4 accent-gaming-accent"
                                            />
                                            <div className="flex-1">
                                                <p className="text-white font-medium text-sm">{tournament.title}</p>
                                                <p className="text-xs text-gray-500">
                                                    {tournament.map} • {tournament.category} • {tournament.status}
                                                </p>
                                            </div>
                                        </label>
                                    ))
                                )}
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                Selected: {formData.selectedTournaments.length} tournament(s)
                            </p>
                        </div>
                    )}

                    {/* Challenge Permission */}
                    {formData.role === 'challenge_admin' && (
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                <Shield className="text-blue-400" size={20} />
                                <div>
                                    <p className="text-white font-bold text-sm">Challenge Management</p>
                                    <p className="text-xs text-gray-400">This admin will be able to manage all challenge matches</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 rounded-lg font-bold uppercase text-sm border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-3 rounded-lg font-bold uppercase text-sm bg-gaming-accent text-black hover:bg-gaming-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {loading ? (
                                <>Creating...</>
                            ) : (
                                <>
                                    <UserPlus size={18} />
                                    Create Admin
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddAdminModal;
