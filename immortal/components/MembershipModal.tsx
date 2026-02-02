
import React, { useState, useEffect } from 'react';
import { X, Check, Zap, Shield, Crown, CreditCard, Loader2, AlertTriangle, Swords } from 'lucide-react';
import { UserProfile, MembershipPlan } from '../types';
import { getMembershipPlans } from '../utils/membershipStorage';

interface MembershipModalProps {
    user: UserProfile;
    onClose: () => void;
    onUpdateUser: (user: UserProfile) => void;
}

const MembershipModal: React.FC<MembershipModalProps> = ({ user, onClose }) => {
    const [plans, setPlans] = useState<MembershipPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState<string | null>(null);
    const [selectedDuration, setSelectedDuration] = useState(1);
    const [error, setError] = useState<string | null>(null);

    const isMember = user.membership?.expiresAt && new Date(user.membership.expiresAt) > new Date();

    useEffect(() => {
        loadPlans();
    }, []);

    const loadPlans = async () => {
        try {
            const data = await getMembershipPlans();
            setPlans(data);
        } catch (err) {
            setError('Failed to load transmission protocols.');
        } finally {
            setLoading(false);
        }
    };

    const handlePurchase = async (plan: MembershipPlan) => {
        const planId = plan.id || (plan as any)._id;
        setPurchasing(planId);

        // Build payment URL with metadata
        const baseUrl = "https://your-payment-gateway-link.com";
        const metadata = `?user=${user.id}&plan=${planId}&months=${selectedDuration}`;

        setTimeout(() => {
            window.open(baseUrl + metadata, '_blank');
            setPurchasing(null);
            alert('External secure portal initialized. Membership will update upon successful handshake.');
        }, 800);
    };

    // Filter plans: Only show team plans if user.teamId exists
    const displayPlans = plans.filter(p => p.isActive).filter(p => {
        if (p.type === 'team') return !!user.teamId;
        return true;
    });

    const getDiscountedPrice = (price: number) => {
        let discount = 0;
        if (selectedDuration > 1) {
            discount = Math.min((selectedDuration - 1) * 0.05, 0.20);
        }
        return Math.round(price * selectedDuration * (1 - discount));
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl" onClick={onClose}></div>
            <div className="relative w-full max-w-2xl bg-[#0c0c12] border border-white/10 clip-corner-lg overflow-hidden flex flex-col max-h-[90vh] shadow-[0_0_50px_rgba(0,255,157,0.1)]">
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-gaming-accent/10 to-transparent">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-full ${isMember ? 'bg-gaming-accent/20' : 'bg-white/5'} border border-white/10`}>
                            <Crown className={isMember ? 'text-gaming-accent' : 'text-gray-500'} size={28} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black italic uppercase tracking-wider text-white">
                                {isMember ? 'CLEARANCE VERIFIED' : 'ACTIVE MEMBERSHIP'}
                            </h2>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">
                                {isMember ? `Access Level: ${user.membership?.type?.toUpperCase()} OPERATOR` : 'Initialize secure service level protocols'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors group">
                        <X size={24} className="text-gray-500 group-hover:text-white" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar space-y-8">
                    {isMember ? (
                        <div className="text-center py-12 space-y-6">
                            <div className="w-20 h-20 bg-gaming-accent/10 border-2 border-gaming-accent/30 rounded-full flex items-center justify-center mx-auto animate-pulse">
                                <Check className="text-gaming-accent" size={40} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black italic text-white">OPERATOR CLEARANCE ACTIVE</h3>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Expires on: {new Date(user.membership!.expiresAt).toLocaleDateString()}</p>
                            </div>
                            <div className="bg-white/5 border border-white/10 p-4 rounded-xl max-w-sm mx-auto">
                                <p className="text-[10px] text-gray-400 font-bold uppercase leading-relaxed tracking-wider">
                                    Your tactical status is currently active. New purchase options are locked until current session expires.
                                </p>
                            </div>
                            <button onClick={onClose} className="px-10 py-3 bg-gaming-accent text-black font-black uppercase tracking-[0.2em] text-[10px] clip-corner-sm hover:bg-white transition-all">
                                Return to HQ
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Duration Selector */}
                            <div className="space-y-3">
                                <label className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] block text-center">Execution Cycle Duration</label>
                                <div className="flex bg-black/60 p-1.5 clip-corner-sm border border-white/5">
                                    {[1, 3, 6, 12].map(m => (
                                        <button
                                            key={m}
                                            onClick={() => setSelectedDuration(m)}
                                            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${selectedDuration === m ? 'bg-gaming-accent text-black shadow-[0_0_20px_rgba(0,255,157,0.3)]' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                                        >
                                            {m} Month{m > 1 ? 's' : ''}
                                            {m > 1 && <span className="block text-[7px] opacity-60">Save {Math.min((m - 1) * 5, 20)}%</span>}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-4">
                                    <Loader2 className="text-gaming-accent animate-spin" size={40} />
                                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest animate-pulse">Syncing Plans...</p>
                                </div>
                            ) : error ? (
                                <div className="text-center py-20 bg-red-500/5 rounded-xl border border-red-500/10">
                                    <AlertTriangle className="text-red-500 mx-auto mb-2" size={32} />
                                    <p className="text-xs text-red-500 font-bold uppercase">{error}</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {displayPlans.map(plan => {
                                        const planId = plan.id || (plan as any)._id;
                                        return (
                                            <div key={planId} className={`relative p-6 bg-gradient-to-b from-white/[0.05] to-transparent border ${plan.type === 'team' ? 'border-purple-500/20 hover:border-purple-500/50' : 'border-white/10 hover:border-gaming-accent/50'} clip-corner-sm group transition-all`}>
                                                {plan.type === 'team' && (
                                                    <div className="absolute -top-1 right-3 bg-purple-600 text-[8px] font-black uppercase py-0.5 px-3 shadow-lg rounded-b">
                                                        Squad Level
                                                    </div>
                                                )}
                                                <h4 className="text-lg font-black uppercase italic tracking-wider mb-1 text-white group-hover:text-gaming-accent transition-colors">{plan.name}</h4>
                                                <div className="flex items-baseline gap-2 mb-6">
                                                    <span className="text-3xl font-mono font-black text-white">$ {getDiscountedPrice(plan.price)}</span>
                                                    <span className="text-[9px] text-gray-500 uppercase font-bold tracking-tighter">Total Credits</span>
                                                </div>

                                                <div className="space-y-4 mb-8">
                                                    <div className="flex items-center gap-3 text-[10px] text-gray-400 font-bold uppercase tracking-wide">
                                                        <Swords className="text-blue-500" size={14} />
                                                        <span>{plan.challengeLimit} Matches per cycle</span>
                                                    </div>
                                                    <ul className="space-y-2.5">
                                                        {plan.features.map((f, i) => (
                                                            <li key={i} className="flex items-center gap-2 text-[10px] text-gray-400 font-medium uppercase tracking-tight">
                                                                <Check className="text-gaming-accent/60" size={12} />
                                                                {f}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                <button
                                                    onClick={() => handlePurchase(plan)}
                                                    disabled={purchasing !== null}
                                                    className={`w-full py-4 clip-corner-sm text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${plan.type === 'team' ? 'bg-purple-600 hover:bg-purple-500 text-white' : 'bg-gaming-accent hover:bg-white text-black'}`}
                                                >
                                                    {purchasing === planId ? <Loader2 className="animate-spin" size={16} /> : <Zap size={16} />}
                                                    Initialize Uplink
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Disclaimer */}
                            <div className="bg-[#0a0a0f] border border-white/5 p-4 rounded-xl flex items-center gap-4">
                                <Shield className="text-gaming-accent/40" size={24} />
                                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">
                                    Secure handshake required. All operational clearances are finalized upon external transaction confirmation.
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MembershipModal;
