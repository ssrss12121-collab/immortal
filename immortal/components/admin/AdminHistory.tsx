import React, { useState, useEffect } from 'react';
import { getArchives, deleteArchiveEntry, updateArchiveEntry, MatchArchiveEntry } from '../../utils/archiveStorage';
import { deleteMatchHistoryFromAllUsers, correctUserStatsAndHistory } from '../../utils/auth';
import { deleteMatchHistoryFromAllTeams, correctTeamStatsAndHistory } from '../../utils/teamStorage';
import { deleteTournament, getTournaments } from '../../utils/tournamentStorage';
import { History, Trash2, Search, Filter, AlertCircle, ChevronDown, ChevronUp, Clock, Trophy, RefreshCw, LogOut, Edit3, Check, X as CloseIcon } from 'lucide-react';

const AdminHistory: React.FC = () => {
    const [archives, setArchives] = useState<MatchArchiveEntry[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterAction, setFilterAction] = useState<string>('ALL');
    const [expandedEntry, setExpandedEntry] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [editScores, setEditScores] = useState<any[]>([]);

    const fetchArchives = async () => {
        const data = await getArchives();
        setArchives([...data].reverse());
    };

    useEffect(() => {
        fetchArchives();
    }, []);

    const handleEditStart = (entry: MatchArchiveEntry) => {
        if (!entry.results) return;
        setEditScores([...entry.results.scores]);
        setIsEditing(entry.id);
        setExpandedEntry(entry.id);
    };

    const handleSaveEdit = async (entry: MatchArchiveEntry) => {
        if (!confirm("Are you sure you want to modify these results? This will update ALL affected player/team stats to reflect the new scores.")) return;

        try {
            const originalScores = entry.results!.scores;

            // 1. Perform Stats Sync for each participant
            for (const newScore of editScores) {
                const oldScore: any = originalScores.find(s => s.participantId === newScore.participantId) || { kills: 0, position: 0, memberStats: [] };

                // --- USER SYNC ---
                await correctUserStatsAndHistory(
                    newScore.participantId,
                    entry.tournamentId,
                    { kills: oldScore.kills, isWin: oldScore.position === 1 },
                    { kills: newScore.kills, isWin: newScore.position === 1, position: newScore.position }
                );

                // --- TEAM SYNC ---
                if (newScore.memberStats) {
                    await correctTeamStatsAndHistory(
                        newScore.participantId,
                        entry.tournamentId,
                        { totalKills: oldScore.kills, isWin: oldScore.position === 1 },
                        { totalKills: newScore.kills, isWin: newScore.position === 1, position: newScore.position }
                    );

                    for (const mNew of newScore.memberStats) {
                        const mOld = oldScore.memberStats?.find((x: any) => x.id === mNew.id) || { kills: 0 };
                        await correctUserStatsAndHistory(
                            mNew.id,
                            entry.tournamentId,
                            { kills: mOld.kills, isWin: newScore.position === 1 },
                            { kills: mNew.kills, isWin: newScore.position === 1, position: newScore.position }
                        );
                    }
                }
            }

            // 3. Update Archive Object
            const updatedEntry = {
                ...entry,
                results: {
                    ...entry.results!,
                    scores: editScores
                },
                details: `Results modified by admin on ${new Date().toLocaleString()}`
            };

            await updateArchiveEntry(updatedEntry);
            await fetchArchives();
            setIsEditing(null);
            alert("Results corrected and profiles synchronized successfully!");
        } catch (error) {
            console.error(error);
            alert("An error occurred while updating stats.");
        }
    };

    const handleDelete = async (entry: MatchArchiveEntry) => {
        const isDeleteTournament = confirm(`PERMANENT DELETE: This will remove this log entry. If you choose "Deep Delete" in the next step, it will also erase this tournament from EVERY player's match history. Continue?`);

        if (isDeleteTournament) {
            const deepDelete = confirm(`Do you want to perform a Deep Delete? (Removes tournament records from all User and Team profiles)`);

            if (deepDelete) {
                deleteMatchHistoryFromAllUsers(entry.tournamentId);
                await deleteMatchHistoryFromAllTeams(entry.tournamentId);
            }

            await deleteArchiveEntry(entry.id);
            await fetchArchives();
            alert("Entry removed successfully.");
        }
    };

    const filteredArchives = archives.filter(a => {
        const matchesSearch = a.tournamentTitle.toLowerCase().includes(searchTerm.toLowerCase()) || a.tournamentId.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterAction === 'ALL' || a.action === filterAction;
        return matchesSearch && matchesFilter;
    });

    const getActionColor = (action: string) => {
        switch (action) {
            case 'COMPLETED': return 'text-green-500 bg-green-500/10';
            case 'RESTARTED': return 'text-gaming-accent bg-gaming-accent/10';
            case 'REMATCH': return 'text-orange-500 bg-orange-500/10';
            case 'DELAYED': return 'text-blue-500 bg-blue-500/10';
            case 'DELETED': return 'text-red-500 bg-red-500/10';
            default: return 'text-gray-400 bg-gray-400/10';
        }
    };

    return (
        <div className="space-y-6 animate-fade-in text-white">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <History size={24} className="text-gaming-accent" />
                    <h2 className="text-2xl font-black uppercase tracking-widest italic">Operations Log</h2>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        <input
                            type="text"
                            placeholder="Search logs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-black/40 border border-white/10 rounded-full py-2 pl-10 pr-4 text-xs focus:outline-none focus:border-gaming-accent w-48 transition-all"
                        />
                    </div>
                    <select
                        value={filterAction}
                        onChange={(e) => setFilterAction(e.target.value)}
                        className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs font-bold uppercase outline-none focus:border-gaming-accent"
                    >
                        <option value="ALL">All Actions</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="RESTARTED">Restarted</option>
                        <option value="REMATCH">Rematch</option>
                        <option value="DELAYED">Delayed</option>
                        <option value="DELETED">Deleted</option>
                    </select>
                </div>
            </div>

            <div className="bg-black/40 border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead className="bg-white/5 text-[10px] uppercase font-black tracking-[0.2em] text-gray-500 border-b border-white/10">
                            <tr>
                                <th className="p-4">Timestamp</th>
                                <th className="p-4">Tournament / Action</th>
                                <th className="p-4">Details</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 font-sans">
                            {filteredArchives.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-12 text-center text-gray-600 italic font-mono uppercase tracking-widest">
                                        No logs found in secure storage.
                                    </td>
                                </tr>
                            ) : (
                                filteredArchives.map((entry) => (
                                    <React.Fragment key={entry.id}>
                                        <tr className={`group transition-colors hover:bg-white/5 ${expandedEntry === entry.id ? 'bg-white/5' : ''}`}>
                                            <td className="p-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <Clock size={12} className="text-gray-600" />
                                                    <span className="text-[10px] font-mono text-gray-400">
                                                        {new Date(entry.timestamp).toLocaleDateString()}<br />
                                                        {new Date(entry.timestamp).toLocaleTimeString()}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <p className="font-black text-xs uppercase tracking-tight text-white">{entry.tournamentTitle}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`text-[8px] px-1.5 py-0.5 rounded font-black uppercase ${getActionColor(entry.action)}`}>
                                                        {entry.action}
                                                    </span>
                                                    <span className="text-[9px] text-gray-600 font-mono">ID: {entry.tournamentId}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <p className="text-xs text-gray-400 line-clamp-1 italic">"{entry.details}"</p>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {entry.results && (
                                                        <>
                                                            <button
                                                                onClick={() => setExpandedEntry(expandedEntry === entry.id ? null : entry.id)}
                                                                className="p-2 hover:bg-white/10 rounded-lg text-gaming-accent transition-all"
                                                                title="View Results Snapshot"
                                                            >
                                                                {expandedEntry === entry.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                            </button>
                                                            <button
                                                                onClick={() => handleEditStart(entry)}
                                                                className="p-2 hover:bg-white/10 rounded-lg text-gaming-accent transition-all opacity-40 group-hover:opacity-100"
                                                                title="Edit historical results"
                                                            >
                                                                <Edit3 size={16} />
                                                            </button>
                                                        </>
                                                    )}
                                                    <button
                                                        onClick={() => handleDelete(entry)}
                                                        className="p-2 hover:bg-red-500/20 rounded-lg text-red-500 transition-all opacity-40 group-hover:opacity-100"
                                                        title="Delete entry permanently"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        {expandedEntry === entry.id && entry.results && (
                                            <tr className="bg-black/60 border-y border-gaming-accent/20">
                                                <td colSpan={4} className="p-6">
                                                    {isEditing === entry.id ? (
                                                        <div className="space-y-4">
                                                            <div className="flex justify-between items-center mb-4">
                                                                <h4 className="text-gaming-accent font-black uppercase text-xs tracking-widest flex items-center gap-2 italic">
                                                                    <Edit3 size={16} /> Edit Mode: Correcting Match Results
                                                                </h4>
                                                                <div className="flex gap-2">
                                                                    <button onClick={() => setIsEditing(null)} className="flex items-center gap-2 px-3 py-1 bg-white/5 hover:bg-white/10 rounded text-[10px] font-bold uppercase transition-all"><CloseIcon size={12} /> Cancel</button>
                                                                    <button onClick={() => handleSaveEdit(entry)} className="flex items-center gap-2 px-3 py-1 bg-gaming-accent text-black hover:bg-gaming-accent/80 rounded text-[10px] font-bold uppercase transition-all shadow-[0_0_10px_rgba(0,255,157,0.3)]"><Check size={12} /> Save Correction</button>
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-1 gap-2 border border-white/5 rounded-lg overflow-hidden bg-black/40">
                                                                <div className="grid grid-cols-4 p-2 text-[8px] uppercase font-black text-gray-500 border-b border-white/5 bg-white/5">
                                                                    <div className="pl-2">Participant ID</div>
                                                                    <div className="text-center">Position</div>
                                                                    <div className="text-center">Kills (Total)</div>
                                                                    <div className="text-right pr-2">Member Breakdown</div>
                                                                </div>
                                                                {editScores.map((score, sIdx) => (
                                                                    <div key={score.participantId} className="grid grid-cols-4 p-2 items-center border-b border-white/5 last:border-0 hover:bg-white/5">
                                                                        <div className="pl-2 flex items-center gap-2">
                                                                            <div className="w-1.5 h-1.5 rounded-full bg-gaming-accent shadow-[0_0_5px_rgba(0,255,157,1)]"></div>
                                                                            <span className="text-[10px] font-mono text-gray-400">{score.participantId}</span>
                                                                        </div>
                                                                        <div className="flex justify-center">
                                                                            <input
                                                                                type="number"
                                                                                value={score.position}
                                                                                onChange={e => {
                                                                                    const next = [...editScores];
                                                                                    next[sIdx].position = Number(e.target.value);
                                                                                    setEditScores(next);
                                                                                }}
                                                                                className="w-12 bg-black border border-white/20 rounded p-1 text-center text-xs font-black text-white outline-none focus:border-gaming-accent"
                                                                            />
                                                                        </div>
                                                                        <div className="flex justify-center">
                                                                            <input
                                                                                type="number"
                                                                                value={score.kills}
                                                                                onChange={e => {
                                                                                    const next = [...editScores];
                                                                                    next[sIdx].kills = Number(e.target.value);
                                                                                    setEditScores(next);
                                                                                }}
                                                                                className="w-14 bg-black border border-white/20 rounded p-1 text-center text-xs font-black text-red-500 outline-none focus:border-gaming-accent"
                                                                            />
                                                                        </div>
                                                                        <div className="space-y-1">
                                                                            {score.memberStats?.map((m: any, mIdx: number) => (
                                                                                <div key={m.id} className="flex justify-end items-center gap-2 h-6">
                                                                                    <span className="text-[9px] text-gray-500 font-bold uppercase truncate max-w-[60px]">{m.name}</span>
                                                                                    <input
                                                                                        type="number"
                                                                                        value={m.kills}
                                                                                        onChange={e => {
                                                                                            const next = [...editScores];
                                                                                            next[sIdx].memberStats[mIdx].kills = Number(e.target.value);
                                                                                            // Automatically update total team kills
                                                                                            next[sIdx].kills = next[sIdx].memberStats.reduce((sum: number, curr: any) => sum + curr.kills, 0);
                                                                                            setEditScores(next);
                                                                                        }}
                                                                                        className="w-10 bg-black/40 border border-white/10 rounded p-0.5 text-center text-[9px] text-gray-300 font-mono outline-none"
                                                                                    />
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                            <div className="bg-white/5 p-4 rounded-lg border border-white/5">
                                                                <div className="flex items-center gap-2 mb-3">
                                                                    <Trophy size={14} className="text-gaming-accent" />
                                                                    <h4 className="text-[10px] font-black uppercase text-white">Winner Summary</h4>
                                                                </div>
                                                                {entry.results.scores.sort((a, b) => a.position - b.position).slice(0, 3).map(s => (
                                                                    <div key={s.participantId} className="flex justify-between items-center py-1 border-b border-white/5 last:border-0">
                                                                        <span className="text-[10px] text-gray-400 font-bold uppercase">#{s.position} ID: {s.participantId.substr(0, 6)}</span>
                                                                        <span className="text-xs font-black text-white">{s.kills} K</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <div className="bg-white/5 p-4 rounded-lg border border-white/5">
                                                                <div className="flex items-center gap-2 mb-3">
                                                                    <RefreshCw size={14} className="text-blue-500" />
                                                                    <h4 className="text-[10px] font-black uppercase text-white">Full Scoreboard</h4>
                                                                </div>
                                                                <div className="max-h-24 overflow-y-auto space-y-1 pr-2">
                                                                    {entry.results.scores.map(s => (
                                                                        <div key={s.participantId} className="flex justify-between text-[9px] font-mono text-gray-500">
                                                                            <span>ID_{s.participantId.substr(0, 4)}</span>
                                                                            <span>Pos: {s.position} // {s.kills}K</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <div className="bg-white/5 p-4 rounded-lg border border-white/5">
                                                                <div className="flex items-center gap-2 mb-3">
                                                                    <AlertCircle size={14} className="text-gaming-accent" />
                                                                    <h4 className="text-[10px] font-black uppercase text-white">Metadata</h4>
                                                                </div>
                                                                <p className="text-[10px] text-gray-500 font-mono tracking-tighter">
                                                                    Log Hash: {Math.random().toString(16).substr(2, 8)}<br />
                                                                    MVP_ID: {entry.results.mvpId || 'NONE'}<br />
                                                                    Banner_Publish: {entry.results.publishBanner ? 'TRUE' : 'FALSE'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-gaming-accent/5 border border-gaming-accent/20 p-4 rounded-lg flex gap-3">
                <AlertCircle className="text-gaming-accent shrink-0" size={20} />
                <p className="text-[10px] text-gaming-accent/80 uppercase font-black tracking-widest leading-relaxed">
                    CAUTION: DELETING AN ENTRY WITH "DEEP DELETE" WILL PERMANENTLY ERASE MISSION DATA FROM PLAYER PROFILES. THIS ACTION IS IRREVERSIBLE AND BREAKS THE HISTORICAL CHAIN OF CUSTODY.
                </p>
            </div>
        </div>
    );
};

export default AdminHistory;
