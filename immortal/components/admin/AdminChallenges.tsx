import React, { useState, useEffect } from 'react';
import { Swords, Check, X, Clock, Trash2, AlertTriangle } from 'lucide-react';
import { Challenge, Tournament } from '../../types';
import { getChallenges, saveChallenge, deleteChallenge } from '../../utils/challengeStorage';
import { saveTournament } from '../../utils/tournamentStorage';

const AdminChallenges: React.FC = () => {
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
    const [matchTime, setMatchTime] = useState('');

    useEffect(() => {
        loadChallenges();
        window.addEventListener('storage', loadChallenges);
        return () => window.removeEventListener('storage', loadChallenges);
    }, []);

    const loadChallenges = async () => {
        try {
            const data = await getChallenges();
            setChallenges(data.filter(c => c.status === 'PendingAdmin'));
        } catch (error) {
            console.error('Failed to load challenges', error);
        }
    };

    const handleApprove = async () => {
        if (!selectedChallenge || !matchTime) return;

        // Create Tournament from Challenge
        const newTournament: Tournament = {
            id: Date.now().toString(),
            title: `${selectedChallenge.challengerName} vs ${selectedChallenge.acceptorName || 'Opponent'}`,
            category: selectedChallenge.type === '1v1' ? 'Solo' : 'Squad',
            isPremium: false,
            prizePool: 0,
            prizeList: [0],
            startTime: matchTime,
            map: selectedChallenge.map || 'Bermuda',
            slots: 2,
            filledSlots: 2,
            status: 'Open',
            image: 'https://picsum.photos/400/200?random=' + Date.now(),
            rules: selectedChallenge.message,
            participants: [
                {
                    id: selectedChallenge.challengerId || 'challenger-id',
                    name: selectedChallenge.challengerName,
                    isTeam: selectedChallenge.type !== '1v1'
                },
                {
                    id: selectedChallenge.acceptorId || 'acceptor-id',
                    name: selectedChallenge.acceptorName || 'Opponent',
                    isTeam: selectedChallenge.type !== '1v1'
                }
            ]
        };

        await saveTournament(newTournament);

        // Update Challenge Status
        const updatedChallenge = { ...selectedChallenge, status: 'Accepted' as const };
        await saveChallenge(updatedChallenge);
        await deleteChallenge(selectedChallenge.id);

        setSelectedChallenge(null);
        setMatchTime('');
        await loadChallenges();
    };

    const handleReject = async (id: string) => {
        if (confirm('Reject and delete this challenge?')) {
            await deleteChallenge(id);
            await loadChallenges();
        }
    };

    return (
        <div className="space-y-6 animate-fade-in text-white">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
                        <Swords className="text-gaming-accent animate-pulse" /> Pending Deployments
                    </h2>
                    <p className="text-[10px] md:text-xs text-gray-500 uppercase font-bold tracking-widest mt-1">Player vs Player Combat Approval</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {challenges.length === 0 ? (
                    <div className="text-center py-20 bg-white/[0.02] rounded-xl border border-white/5 border-dashed flex flex-col items-center">
                        <div className="p-6 bg-white/[0.02] rounded-full mb-4">
                            <Swords size={48} className="opacity-10" />
                        </div>
                        <p className="text-[10px] uppercase font-black tracking-widest text-gray-600">No pending duels in the queue</p>
                    </div>
                ) : (
                    challenges.map(challenge => (
                        <div key={challenge.id} className="bg-white/5 border border-white/10 p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group hover:bg-white/[0.08] transition-all relative overflow-hidden">
                            <div className="relative z-10 flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-sm border ${challenge.type === '1v1' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'}`}>
                                        {challenge.type} COV
                                    </span>
                                    <span className="text-gaming-accent font-mono font-black text-xs md:text-sm bg-gaming-accent/10 px-2 py-0.5 rounded">৳{challenge.wager}</span>
                                </div>
                                <h3 className="text-base md:text-lg font-black text-white group-hover:text-gaming-accent transition-colors">
                                    {challenge.challengerName} <span className="text-gray-600 mx-1">/</span> {challenge.acceptorName}
                                </h3>
                                <p className="text-gray-400 text-xs italic mt-1 line-clamp-1">"{challenge.message}"</p>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[9px] sm:text-[10px] text-gray-500 mt-2 uppercase font-black tracking-tighter">
                                    <span className="flex items-center gap-1">MAP: {challenge.map}</span>
                                    <span className="flex items-center gap-1 text-gray-600">SUBMITTED: {challenge.time}</span>
                                    {challenge.proposedTime && (
                                        <span className="text-gaming-accent flex items-center gap-1">
                                            <Clock size={10} /> ESTIMATED: {new Date(challenge.proposedTime).toLocaleString()}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 w-full md:w-auto relative z-10 border-t border-white/5 pt-4 md:border-none md:pt-0">
                                <button
                                    onClick={() => {
                                        setSelectedChallenge(challenge);
                                        if (challenge.proposedTime) {
                                            setMatchTime(new Date(challenge.proposedTime).toLocaleString());
                                        }
                                    }}
                                    className="flex-1 md:flex-none bg-gaming-accent text-black px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-gaming-accent/90 flex items-center justify-center gap-2 transition-all shadow-[0_4px_15px_rgba(0,255,157,0.2)] active:scale-95"
                                >
                                    <Check size={14} /> Schedule
                                </button>
                                <button
                                    onClick={() => handleReject(challenge.id)}
                                    className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-all hover:scale-110 active:scale-95"
                                    title="Reject Challenge"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            {/* Decorative Background Icon */}
                            <Swords size={80} className="absolute right-[-20px] bottom-[-20px] text-white/[0.02] -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
                        </div>
                    ))
                )}
            </div>

            {/* Approval Modal */}
            {selectedChallenge && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#1a1a24] border border-white/10 p-6 rounded-lg max-w-md w-full animate-in zoom-in-95">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Clock className="text-gaming-accent" /> Schedule Match
                        </h3>

                        <div className="bg-gaming-accent/10 border border-gaming-accent/20 p-3 rounded mb-4 flex items-start gap-2">
                            <AlertTriangle size={16} className="text-gaming-accent flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-gaming-accent/80">
                                Per rules, matches must be scheduled at least <strong>2 hours</strong> from now.
                            </p>
                        </div>

                        <div className="mb-6">
                            <label className="block text-xs text-gray-500 uppercase font-bold mb-1">Match Start Time</label>
                            <input
                                type="text"
                                value={matchTime}
                                onChange={(e) => setMatchTime(e.target.value)}
                                placeholder="e.g. Today, 10:00 PM"
                                className="w-full bg-black/40 border border-white/10 rounded p-3 text-white focus:border-gaming-accent focus:outline-none transition-colors"
                            />
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setSelectedChallenge(null)}
                                className="px-4 py-2 text-gray-400 hover:text-white text-sm font-bold uppercase"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleApprove}
                                disabled={!matchTime}
                                className="bg-gaming-accent text-black px-6 py-2 rounded font-bold uppercase hover:bg-gaming-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                Confirm Schedule
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminChallenges;
