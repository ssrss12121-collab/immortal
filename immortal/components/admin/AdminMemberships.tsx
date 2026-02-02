
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Save, X, Shield, Clock, Swords, CheckCircle, AlertTriangle, Zap } from 'lucide-react';
import { MembershipPlan } from '../../types';
import { getMembershipPlans, addMembershipPlan, updateMembershipPlan, deleteMembershipPlan } from '../../utils/membershipStorage';

const AdminMemberships: React.FC = () => {
    const [plans, setPlans] = useState<MembershipPlan[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<Partial<MembershipPlan>>({
        name: '',
        price: 0,
        durationMonths: 1,
        challengeLimit: 3,
        type: 'individual',
        features: [],
        isActive: true
    });

    const [searchedUser, setSearchedUser] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchLoading, setSearchLoading] = useState(false);
    const [assignPlanId, setAssignPlanId] = useState('');
    const [assignDuration, setAssignDuration] = useState('');

    useEffect(() => {
        loadPlans();
    }, []);

    const loadPlans = async () => {
        setLoading(true);
        try {
            const data = await getMembershipPlans(true);
            setPlans(data);
        } catch (err) {
            setError('Failed to load plans');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.name || formData.price === undefined) {
            setError('Name and Price are required');
            return;
        }

        setLoading(true);
        try {
            // Ensure durationDays is populated
            const payload = { ...formData, durationDays: formData.durationDays || 30 };

            if (editingId) {
                await updateMembershipPlan(editingId, payload);
            } else {
                await addMembershipPlan(payload);
            }
            setIsCreating(false);
            setEditingId(null);
            setFormData({ name: '', price: 0, durationDays: 30, challengeLimit: 3, type: 'individual', features: [], isActive: true });
            loadPlans();
        } catch (err: any) {
            setError(err.message || 'Failed to save plan');
        } finally {
            setLoading(false);
        }
    };

    const startEdit = (plan: MembershipPlan) => {
        setFormData({
            ...plan,
            durationDays: plan.durationDays || 30
        });
        setEditingId(plan.id || plan._id!);
        setIsCreating(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Delete this membership plan?')) {
            try {
                await deleteMembershipPlan(id);
                loadPlans();
            } catch (err) {
                alert('Deletion failed');
            }
        }
    };

    const handleSearchUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setSearchLoading(true);
        setSearchedUser(null);
        try {
            // Assuming we have a direct axios call availability or need to import it. 
            // Since this file imports services, I'll use fetch directly for this specific new endpoint 
            // or better, I should have updated membershipStorage.ts. I'll use fetch for now to save time/context switching.
            const res = await fetch(`${import.meta.env.VITE_API_URL}/memberships/search/${searchQuery}`);
            const data = await res.json();
            if (data.success) {
                setSearchedUser(data.user);
            } else {
                alert('User not found');
            }
        } catch (err) {
            alert('Search failed');
        } finally {
            setSearchLoading(false);
        }
    };

    const handleAssign = async () => {
        if (!searchedUser || !assignPlanId) return;
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/memberships/assign`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: searchedUser.id,
                    planId: assignPlanId,
                    durationDaysOverride: assignDuration ? parseInt(assignDuration) : undefined
                })
            });
            const data = await res.json();
            if (data.success) {
                alert(data.message);
                setSearchedUser(null);
                setSearchQuery('');
            } else {
                alert(data.message);
            }
        } catch (err) {
            alert('Assignment failed');
        }
    };

    return (
        <div className="space-y-8 text-white animate-fade-in pb-20">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black italic uppercase tracking-tighter">Plan Command</h2>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Configure & Distribute Protocol Access</p>
                </div>
                {!isCreating && (
                    <button
                        onClick={() => { setIsCreating(true); setEditingId(null); setFormData({ name: '', price: 0, durationDays: 30, challengeLimit: 3, type: 'individual', features: [], isActive: true }); }}
                        className="bg-gaming-accent text-black px-6 py-2.5 rounded-lg font-bold hover:bg-gaming-accent/90 transition-all flex items-center gap-2 shadow-[0_4px_15px_rgba(0,255,157,0.2)]"
                    >
                        <Plus size={18} /> New Plan
                    </button>
                )}
            </div>

            {/* Grant Access Section */}
            <section className="bg-gaming-card border border-white/10 rounded-xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                    <Shield size={100} />
                </div>
                <h3 className="text-lg font-black uppercase text-gaming-accent mb-4 flex items-center gap-2 relative z-10">
                    <Zap size={20} /> Grant Manual Access
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                    <div className="space-y-4">
                        <form onSubmit={handleSearchUser} className="flex gap-2">
                            <div className="flex-1 bg-black/50 border border-white/10 rounded-lg flex items-center pr-2 focus-within:border-gaming-accent/50 transition-colors">
                                <input
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    placeholder="Search by Player ID / Email"
                                    className="flex-1 bg-transparent p-3 text-sm text-white outline-none placeholder:text-gray-600"
                                />
                                {searchLoading && <div className="animate-spin h-4 w-4 border-2 border-gaming-accent border-t-transparent rounded-full"></div>}
                            </div>
                            <button type="submit" disabled={searchLoading} className="bg-white/10 p-3 rounded-lg hover:bg-white/20 transition-colors">
                                <Swords size={20} />
                            </button>
                        </form>

                        {searchedUser && (
                            <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-lg flex items-center gap-4 animate-in fade-in slide-in-from-left-4">
                                <div className="w-12 h-12 rounded-full bg-black border border-white/10 overflow-hidden shadow-lg">
                                    <img src={`https://ui-avatars.com/api/?name=${searchedUser.ign}&background=random`} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <p className="text-white font-bold text-sm">{searchedUser.name} <span className="text-gray-400 font-normal">({searchedUser.ign})</span></p>
                                    <p className="text-[10px] text-green-400 font-mono tracking-wide">{searchedUser.email}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[9px] uppercase bg-black/40 px-1.5 rounded text-gray-400 border border-white/5">
                                            {searchedUser.membership?.type ? `Current: ${searchedUser.membership.type}` : 'No Active Plan'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className={`space-y-4 transition-all ${searchedUser ? 'opacity-100' : 'opacity-40 grayscale pointer-events-none'}`}>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[9px] font-black uppercase text-gray-500 mb-1.5 tracking-widest">Select Protocol</label>
                                <select
                                    value={assignPlanId}
                                    onChange={e => setAssignPlanId(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 p-3 rounded-lg text-white text-xs outline-none focus:border-gaming-accent"
                                >
                                    <option value="">Select Plan...</option>
                                    {plans.map(p => (
                                        <option key={p.id || p._id} value={p.id || p._id}>{p.name} ({p.durationDays} Days)</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[9px] font-black uppercase text-gray-500 mb-1.5 tracking-widest">Duration Override</label>
                                <input
                                    type="number"
                                    value={assignDuration}
                                    onChange={e => setAssignDuration(e.target.value)}
                                    placeholder="Default"
                                    className="w-full bg-black/50 border border-white/10 p-3 rounded-lg text-white text-xs outline-none focus:border-gaming-accent placeholder:text-gray-700"
                                />
                            </div>
                        </div>
                        <button
                            onClick={handleAssign}
                            disabled={!assignPlanId}
                            className="w-full bg-gaming-accent text-black font-black uppercase py-3 rounded-lg hover:bg-gaming-accent/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(0,223,130,0.2)]"
                        >
                            Authorize Assignment
                        </button>
                    </div>
                </div>
            </section>

            {/* Create/Edit Form */}
            {isCreating && (
                <div className="bg-white/5 border border-white/10 p-6 rounded-xl space-y-4 animate-in slide-in-from-top-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold">{editingId ? 'Edit Plan' : 'Create New Plan'}</h3>
                        <button onClick={() => setIsCreating(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] text-gray-500 uppercase font-black mb-1.5 tracking-widest">Plan Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 outline-none focus:border-gaming-accent transition-colors"
                                placeholder="e.g. Bronze Operative"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] text-gray-500 uppercase font-black mb-1.5 tracking-widest">Price (USD/Point)</label>
                            <input
                                type="number"
                                value={formData.price}
                                onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 outline-none focus:border-gaming-accent transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] text-gray-500 uppercase font-black mb-1.5 tracking-widest">Duration (Days)</label>
                            <input
                                type="number"
                                value={formData.durationDays}
                                onChange={e => setFormData({ ...formData, durationDays: Number(e.target.value) })}
                                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 outline-none focus:border-gaming-accent transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] text-gray-500 uppercase font-black mb-1.5 tracking-widest">Monthly Challenge Limit</label>
                            <input
                                type="number"
                                value={formData.challengeLimit}
                                onChange={e => setFormData({ ...formData, challengeLimit: Number(e.target.value) })}
                                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 outline-none focus:border-gaming-accent transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] text-gray-500 uppercase font-black mb-1.5 tracking-widest">Plan Type</label>
                            <select
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 outline-none focus:border-gaming-accent transition-colors"
                            >
                                <option value="individual">Individual Operative</option>
                                <option value="team">Tactical Squadron (Team)</option>
                            </select>
                        </div>
                        <div className="flex items-end pb-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="w-4 h-4 accent-gaming-accent"
                                />
                                <span className="text-xs font-bold uppercase text-gray-400">Active & Published</span>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] text-gray-500 uppercase font-black mb-1.5 tracking-widest">Features (One per line)</label>
                        <textarea
                            value={formData.features?.join('\n')}
                            onChange={e => setFormData({ ...formData, features: e.target.value.split('\n').filter(f => f.trim()) })}
                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 h-24 outline-none focus:border-gaming-accent transition-colors"
                            placeholder="Enter plan features..."
                        />
                    </div>

                    {error && <p className="text-red-500 text-xs font-bold flex items-center gap-2 bg-red-500/10 p-3 rounded-lg border border-red-500/20"><AlertTriangle size={14} /> {error}</p>}

                    <div className="flex justify-end gap-3">
                        <button onClick={() => setIsCreating(false)} className="px-6 py-2.5 text-gray-500 hover:text-white font-bold uppercase text-xs">Cancel</button>
                        <button onClick={handleSave} disabled={loading} className="bg-gaming-accent text-black px-8 py-2.5 rounded-lg font-black uppercase text-xs hover:bg-gaming-accent/90 disabled:opacity-50 shadow-[0_0_15px_rgba(0,255,157,0.3)]">
                            {loading ? 'Processing...' : editingId ? 'Update Plan' : 'Create Plan'}
                        </button>
                    </div>
                </div>
            )}

            {/* Plans List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map(plan => (
                    <div key={plan.id || plan._id} className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/[0.08] transition-all group relative overflow-hidden flex flex-col h-full">
                        <div className={`absolute top-0 right-0 px-2 py-1 text-[8px] font-black uppercase tracking-widest ${plan.type === 'team' ? 'bg-blue-600 text-white' : 'bg-gaming-accent text-black'}`}>
                            {plan.type}
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1 group-hover:text-gaming-accent transition-colors">{plan.name}</h3>
                        <div className="flex items-baseline gap-1 mb-6">
                            <span className="text-3xl font-black text-white tracking-tighter">৳{plan.price}</span>
                            <span className="text-[10px] text-gray-500 uppercase font-bold">/ {plan.durationDays} Days</span>
                        </div>

                        <div className="space-y-3 mb-6 flex-1 text-xs text-gray-400 font-bold uppercase tracking-wide">
                            <div className="flex items-center gap-3 p-2 bg-black/20 rounded-lg"><Clock size={14} className="text-gray-600" /> {plan.durationDays} Days Access</div>
                            <div className="flex items-center gap-3 p-2 bg-black/20 rounded-lg"><Swords size={14} className="text-gray-600" /> {plan.challengeLimit} Challenges/Month</div>
                            {plan.features?.map((f, i) => (
                                <div key={i} className="flex items-center gap-3 px-2"><CheckCircle size={14} className="text-gaming-accent" /> {f}</div>
                            ))}
                        </div>

                        <div className="flex justify-end gap-2 border-t border-white/5 pt-4 mt-auto">
                            <button onClick={() => startEdit(plan)} className="p-2 bg-white/5 hover:bg-blue-500/10 text-blue-400 rounded-lg transition-all"><Edit2 size={16} /></button>
                            <button onClick={() => handleDelete(plan.id || plan._id!)} className="p-2 bg-white/5 hover:bg-red-500/10 text-red-500 rounded-lg transition-all"><Trash2 size={16} /></button>
                        </div>
                    </div>
                ))}

                {plans.length === 0 && !isCreating && !loading && (
                    <div className="col-span-full py-24 text-center bg-white/5 border border-white/5 rounded-2xl text-gray-500 border-dashed border-2">
                        <Shield size={48} className="mx-auto mb-4 opacity-20" />
                        <p className="font-black uppercase tracking-widest text-[10px]">No active protocols initialized</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminMemberships;
