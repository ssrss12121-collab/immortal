import React, { useState, useEffect } from 'react';
import { DISTRICTS } from '../constants';
import { PlayerRole, UserProfile, Team } from '../types';
import { Crown, Map, Shield, User, Crosshair, Zap, Target, Swords, Medal, Copy, Check } from 'lucide-react';
import PublicProfileModal from '../components/PublicProfileModal';
import { getAllUsers } from '../utils/auth';
import { getTeams } from '../utils/teamStorage';
import PullToRefresh from '../components/PullToRefresh';

const Rankings: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'Teams' | 'Districts' | 'Players' | 'Roles'>('Roles');
    const [selectedRole, setSelectedRole] = useState<PlayerRole>('Rusher');
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [expandedDistrict, setExpandedDistrict] = useState<string | null>(null);
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async (ignoreCache = false) => {
        try {
            const [usersList, teamsList] = await Promise.all([
                getAllUsers(ignoreCache),
                getTeams(ignoreCache)
            ]);
            setUsers(usersList);
            setTeams(teamsList);
        } catch (error) {
            console.error('Failed to load rankings:', error);
        }
    };

    const copyToClipboard = (id: string) => {
        navigator.clipboard.writeText(id);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    // Calculate Dynamic District Stats
    const districtStats = DISTRICTS.map(districtName => {
        const districtTeams = teams.filter(t => t.district === districtName);
        const districtUsers = users.filter(u => u.district === districtName && u.role !== 'Guest');
        const totalPoints = districtTeams.reduce((sum, t) => sum + (t.rankPoints || 0), 0) +
            districtUsers.reduce((sum, u) => sum + (u.stats.rankPoints || 0), 0);

        const topTeam = districtTeams.sort((a, b) => b.rankPoints - a.rankPoints)[0];

        return {
            name: districtName,
            points: totalPoints,
            topTeamName: topTeam?.name || 'No Teams',
            teams: districtTeams.sort((a, b) => b.rankPoints - a.rankPoints),
            playerCount: districtUsers.length,
            teamCount: districtTeams.length
        };
    }).sort((a, b) => b.points - a.points);

    // Derived Data
    const topPlayers = users.filter(u => u.role !== 'Guest').sort((a, b) => (b.stats.rankPoints || 0) - (a.stats.rankPoints || 0)).slice(0, 50);

    const getRolePlayers = (role: PlayerRole) => {
        return users.filter(u => u.role === role).sort((a, b) => (b.stats.rankPoints || 0) - (a.stats.rankPoints || 0)).slice(0, 10);
    };

    const roleIcons: Record<PlayerRole, any> = {
        'Rusher': Zap,
        'Sniper': Crosshair,
        'Nader': Target,
        'Supporter': Shield,
        'Guest': User
    };

    const roleColors: Record<PlayerRole, string> = {
        'Rusher': 'text-gaming-accent',
        'Sniper': 'text-cyan-400',
        'Nader': 'text-red-400',
        'Supporter': 'text-green-400',
        'Guest': 'text-gray-400'
    };

    const currentRolePlayers = getRolePlayers(selectedRole);

    return (
        <PullToRefresh onRefresh={() => loadData(true)}>
            <div className="pb-28 pt-6 px-4 animate-fade-in min-h-screen">
                <div className="text-center mb-8 relative">
                    <h1 className="text-3xl font-black uppercase italic tracking-tighter text-white glitch-text" data-text="LEADERBOARD">Leader<span className="text-gaming-accent">Board</span></h1>
                    <p className="text-[9px] text-gray-500 font-mono tracking-[0.4em] uppercase mt-1">Global Ranking Data</p>
                </div>

                {/* Tabs */}
                <div className="flex p-1 bg-[#0c0c12]/80 backdrop-blur-md clip-corner-sm mb-6 border border-white/10 overflow-x-auto no-scrollbar">
                    {['Roles', 'Districts', 'Teams', 'Players'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`flex-1 py-2 px-3 min-w-[80px] text-[10px] uppercase font-bold tracking-widest clip-corner-sm transition-all whitespace-nowrap ${activeTab === tab ? 'bg-gaming-accent text-black shadow-[0_0_15px_rgba(0,223,130,0.4)]' : 'text-gray-500 hover:text-white'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {activeTab === 'Roles' && (
                    <div className="space-y-6">

                        {/* Role Selector */}
                        <div className="grid grid-cols-4 gap-2">
                            {(Object.keys(roleIcons) as PlayerRole[]).filter(r => r !== 'Guest').map((role) => {
                                const RoleIcon = roleIcons[role];
                                const isSelected = selectedRole === role;
                                return (
                                    <button
                                        key={role}
                                        onClick={() => setSelectedRole(role)}
                                        className={`flex flex-col items-center justify-center p-2 rounded-sm clip-corner-sm transition-all border ${isSelected ? `bg-white/10 border-white/40 ${roleColors[role]}` : 'bg-[#0c0c12]/60 border-white/5 text-gray-600 hover:text-gray-400'}`}
                                    >
                                        <RoleIcon size={20} className={`mb-1 ${isSelected ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : ''}`} />
                                        <span className="text-[8px] font-bold uppercase tracking-wider">{role}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Role Leaderboard */}
                        <div className="relative">
                            <div className="flex items-center space-x-2 mb-4">
                                <div className={`w-1 h-4 ${roleColors[selectedRole].replace('text-', 'bg-')}`}></div>
                                <h3 className="text-sm font-bold uppercase text-white tracking-widest">
                                    Top <span className={roleColors[selectedRole]}>{selectedRole}s</span>
                                </h3>
                            </div>

                            {/* #1 Player Card */}
                            {currentRolePlayers.length > 0 && (
                                <div className="mb-4 relative group">
                                    <div className={`absolute -inset-0.5 bg-gradient-to-r from-transparent via-gaming-accent/20 to-transparent opacity-50 group-hover:opacity-100 transition-opacity blur`}></div>
                                    <div className="bg-[#1a1a24] clip-corner border border-white/10 p-4 flex items-center relative overflow-hidden cyber-border-green cyber-glimmer">
                                        {/* Background Watermark */}
                                        <Swords className="absolute -right-4 -bottom-4 text-white/5 w-32 h-32 transform -rotate-12" />

                                        <div className="relative z-10 flex items-center w-full">
                                            <div className="w-16 h-16 relative mr-4">
                                                <div className="absolute inset-0 bg-gaming-accent rounded-full blur opacity-20 animate-pulse"></div>
                                                <Crown className="absolute -top-3 -right-3 text-gaming-accent drop-shadow-[0_0_10px_rgba(0,223,130,0.5)] z-20" size={24} fill="currentColor" />
                                                <img
                                                    src={currentRolePlayers[0].avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentRolePlayers[0].id}`}
                                                    className="w-full h-full clip-corner-sm object-cover border border-gaming-accent/30"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2">
                                                    <h2 className="text-xl font-black text-white italic tracking-wider">{currentRolePlayers[0].ign}</h2>
                                                    <Medal size={16} className="text-gaming-accent animate-bounce" />
                                                </div>
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <div className="cyber-tag-green px-1.5 py-0.5 clip-corner-sm">
                                                        <span className="text-[8px] font-bold uppercase tracking-[0.2em]">Class MVP</span>
                                                    </div>
                                                    <button
                                                        onClick={() => copyToClipboard(currentRolePlayers[0].id)}
                                                        className="text-[9px] text-gaming-accent flex items-center space-x-1 hover:text-white transition-colors"
                                                    >
                                                        <span className="font-mono">#{currentRolePlayers[0].id}</span>
                                                        {copiedId === currentRolePlayers[0].id ? <Check size={10} /> : <Copy size={10} />}
                                                    </button>
                                                </div>
                                                <div className="flex space-x-3">
                                                    <span className="text-xs font-mono font-bold text-gaming-accent bg-gaming-accent/10 px-2 py-0.5 rounded-sm border border-gaming-accent/20">
                                                        {currentRolePlayers[0].stats.rankPoints} PTS
                                                    </span>
                                                    <span className="text-xs font-mono font-bold text-gray-400 bg-white/5 px-2 py-0.5 rounded-sm border border-white/5">
                                                        {currentRolePlayers[0].stats.kdRatio} KD
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* List */}
                            <div className="space-y-2">
                                {currentRolePlayers.slice(1).map((p, idx) => (
                                    <div key={p.id} className="bg-[#0c0c12]/60 backdrop-blur-md p-2.5 clip-corner-sm border border-white/5 flex items-center justify-between hover:bg-white/5 hover:border-gaming-accent/30 transition-all group cyber-glimmer">
                                        <div className="flex items-center space-x-3">
                                            <span className="text-gray-600 font-bold font-mono text-xs w-6 text-center">{(idx + 2).toString().padStart(2, '0')}</span>
                                            <div className="flex items-center space-x-3">
                                                <img src={p.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.id}`} className="w-8 h-8 clip-corner-sm grayscale group-hover:grayscale-0 transition-all" />
                                                <div>
                                                    <div className="flex items-center space-x-2">
                                                        <button
                                                            onClick={() => setSelectedUserId(p.id)}
                                                            className="font-bold text-xs text-white uppercase tracking-tight group-hover:text-gaming-accent transition-colors text-left hover:underline"
                                                        >
                                                            {p.ign}
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); copyToClipboard(p.id); }}
                                                            className="text-[8px] text-gray-600 hover:text-white flex items-center"
                                                        >
                                                            {copiedId === p.id ? <Check size={8} className="text-green-500" /> : <Copy size={8} />}
                                                        </button>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <p className="text-[8px] text-gray-500 uppercase font-bold tracking-widest">{p.stats.matches} Matches</p>
                                                        <span className="text-[8px] text-gray-600 font-black">•</span>
                                                        <p className="text-[8px] text-gaming-accent/60 uppercase font-black tracking-tight">{p.country || 'BD'} • {p.district || 'GL'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="block font-mono text-sm font-bold text-white">{p.stats.rankPoints}</span>
                                            <span className="text-[8px] uppercase text-gray-500 font-bold tracking-wider">PTS</span>
                                        </div>
                                    </div>
                                ))}
                                {currentRolePlayers.length === 0 && (
                                    <div className="text-center text-gray-500 py-10">No players found for this role.</div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'Districts' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-4 text-gaming-accent pl-2 border-l-2 border-gaming-accent">
                            <div className="flex items-center space-x-2">
                                <Map size={16} />
                                <span className="text-xs uppercase font-bold tracking-wider">Provincial Rankings</span>
                            </div>
                            <span className="text-[10px] text-gray-500 font-mono">TOTAL POINTS: {districtStats.reduce((s, d) => s + d.points, 0)}</span>
                        </div>

                        {districtStats.map((d, index) => {
                            const isExpanded = expandedDistrict === d.name;
                            return (
                                <div key={d.name} className="space-y-2">
                                    <div
                                        onClick={() => setExpandedDistrict(isExpanded ? null : d.name)}
                                        className={`bg-[#0c0c12]/60 backdrop-blur-md p-3 clip-corner-sm flex items-center justify-between border ${isExpanded ? 'border-gaming-accent/60 bg-white/5' : 'border-white/5'} hover:border-gaming-accent/40 hover:bg-white/5 transition-all group cursor-pointer`}
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className={`w-8 h-8 flex items-center justify-center font-black text-xl italic ${index < 3 ? 'text-gaming-secondary drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]' : 'text-gray-600'}`}>
                                                #{index + 1}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-white uppercase tracking-tight group-hover:text-gaming-accent transition-colors">{d.name}</h3>
                                                <p className="text-[9px] text-gray-500 font-mono uppercase tracking-wider">
                                                    {d.teamCount} Teams • {d.playerCount} Operatives
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right flex items-center gap-4">
                                            <div className="bg-black/40 px-3 py-1 clip-corner-sm border border-white/5">
                                                <span className="block font-mono font-bold text-sm text-white">{d.points}</span>
                                                <span className="text-[8px] uppercase text-gray-500 font-bold tracking-widest">RANK PTS</span>
                                            </div>
                                            <Swords size={14} className={`text-gray-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                        </div>
                                    </div>

                                    {/* Expanded Teams List */}
                                    {isExpanded && (
                                        <div className="ml-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
                                            {d.teams.length === 0 ? (
                                                <p className="text-[10px] text-gray-600 italic py-2">No active combat squads in this sector.</p>
                                            ) : (
                                                d.teams.map((team, tIdx) => (
                                                    <div key={team.id} className="bg-white/[0.02] border border-white/5 p-2 rounded flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-[10px] font-mono text-gray-600">{(tIdx + 1).toString().padStart(2, '0')}</span>
                                                            <div className="w-6 h-6 rounded bg-gray-800 border border-white/10 overflow-hidden">
                                                                <img src={team.logoUrl} className="w-full h-full object-cover" />
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-xs font-bold text-gray-300">{team.name}</span>
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); copyToClipboard(team.id); }}
                                                                        className="text-gaming-accent/50 hover:text-gaming-accent"
                                                                    >
                                                                        {copiedId === team.id ? <Check size={8} /> : <Copy size={8} />}
                                                                    </button>
                                                                </div>
                                                                <p className="text-[8px] text-gray-600 uppercase">MVP: {team.members[0]?.name || 'N/A'}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="text-xs font-mono font-bold text-gaming-accent">{team.rankPoints}</span>
                                                            <span className="text-[7px] text-gray-600 uppercase block leading-none">PTS</span>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {activeTab === 'Players' && (
                    <div className="space-y-4">
                        {/* Top 3 Podium Visual - Cyber Card Style */}
                        {topPlayers.length > 0 && (
                            <div className="flex justify-center items-end gap-x-4 min-h-[350px] mb-12 pt-10 px-4 relative">


                                {/* 2ND PLACE (Left) */}
                                {(() => {
                                    const p = topPlayers[1];
                                    if (!p) return <div className="w-32"></div>;
                                    return (
                                        <div className="relative group w-32 flex flex-col justify-end translate-y-4">
                                            <button onClick={() => setSelectedUserId(p.id)} className="bg-[#15151b] border border-gray-700 relative h-48 w-full shadow-[0_0_20px_rgba(0,0,0,0.5)] flex flex-col items-center pt-12 pb-4 cursor-pointer hover:border-gray-500 transition-all"
                                                style={{ clipPath: 'polygon(0% 20%, 20% 0%, 80% 0%, 100% 0%, 100% 100%, 0% 100%)' }}>

                                                {/* Notch / Avatar Header */}
                                                <div className="absolute top-0 left-4 w-12 h-10 bg-[#0c0c12] border-b border-l border-r border-gray-600 flex items-center justify-center shadow-lg overflow-hidden"
                                                    style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 80%, 80% 100%, 0% 100%)' }}>
                                                    <img src={p.avatarUrl || `https://ui-avatars.com/api/?name=${p.ign}&background=random`} alt={p.ign} className="w-full h-full object-cover opacity-90" />
                                                </div>

                                                {/* Rank & Details */}
                                                <div className="text-gray-500 font-bold text-xs uppercase mb-2">2ND</div>
                                                <div className="w-12 h-1 bg-gray-600 mb-3 shadow-[0_0_8px_rgba(75,85,99,0.5)]"></div>

                                                <h2 className="text-white font-black uppercase text-sm truncate max-w-[90%] px-1">{p.ign}</h2>
                                                <p className="text-[10px] text-gaming-accent font-mono mt-1">{p.role}</p>

                                                {/* Bottom Bar */}
                                                <div className="mt-auto w-full px-3">
                                                    <div className="w-full h-8 bg-gray-800/30 rounded flex items-center justify-center border border-white/5">
                                                        <span className="font-mono font-bold text-white text-sm">{p.stats.rankPoints}</span>
                                                    </div>
                                                </div>
                                            </button>
                                        </div>
                                    );
                                })()}

                                {/* 1ST PLACE (Center) */}
                                {(() => {
                                    const p = topPlayers[0];
                                    if (!p) return null;
                                    return (
                                        <div className="relative group w-40 flex flex-col justify-end z-10 -translate-y-0">
                                            <button onClick={() => setSelectedUserId(p.id)} className="bg-[#15151b] border-gaming-accent relative h-64 w-full shadow-[0_0_50px_rgba(0,223,130,0.25)] flex flex-col items-center pt-14 pb-6 cursor-pointer hover:border-white transition-all cyber-border-green cyber-glimmer"
                                                style={{ clipPath: 'polygon(20% 0%, 80% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 20%)' }}>

                                                {/* Notch / Avatar Header - Center */}
                                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-12 bg-[#0c0c12] border-b border-l border-r border-gaming-accent flex items-center justify-center shadow-[0_0_20px_rgba(0,223,130,0.4)] overflow-hidden"
                                                    style={{ clipPath: 'polygon(0% 0%, 100% 0%, 85% 100%, 15% 100%)' }}>
                                                    <img src={p.avatarUrl || `https://ui-avatars.com/api/?name=${p.ign}&background=000&color=fff`} alt={p.ign} className="w-full h-full object-cover" />
                                                </div>

                                                {/* Rank & Details */}
                                                <div className="text-gaming-accent font-black italic text-4xl mb-1 mt-4 drop-shadow-[0_0_10px_rgba(0,223,130,0.5)]">1ST</div>
                                                <div className="w-20 h-1.5 bg-gaming-accent mb-4 shadow-[0_0_20px_rgba(0,223,130,1)] rounded-full"></div>

                                                <h2 className="text-white font-black uppercase text-lg truncate max-w-[90%] px-1 tracking-wider">{p.ign}</h2>
                                                <p className="text-xs text-gaming-accent font-mono mt-1 font-bold">{p.role}</p>

                                                {/* Bottom Bar */}
                                                <div className="mt-auto w-full px-4">
                                                    <div className="w-full h-10 bg-gaming-accent/20 rounded flex items-center justify-center border border-gaming-accent/40">
                                                        <span className="font-mono font-bold text-white text-lg">{p.stats.rankPoints}</span>
                                                    </div>
                                                </div>
                                            </button>
                                        </div>
                                    );
                                })()}

                                {/* 3RD PLACE (Right) */}
                                {(() => {
                                    const p = topPlayers[2];
                                    if (!p) return <div className="w-32"></div>;
                                    return (
                                        <div className="relative group w-32 flex flex-col justify-end translate-y-8">
                                            <button onClick={() => setSelectedUserId(p.id)} className="bg-[#15151b] border border-orange-700 relative h-40 w-full shadow-[0_0_20px_rgba(0,0,0,0.5)] flex flex-col items-center pt-12 pb-4 cursor-pointer hover:border-orange-600 transition-all"
                                                style={{ clipPath: 'polygon(0% 0%, 80% 0%, 100% 20%, 100% 100%, 0% 100%, 0% 0%)' }}>

                                                {/* Notch / Avatar Header */}
                                                <div className="absolute top-0 right-4 w-12 h-10 bg-[#0c0c12] border-b border-l border-r border-orange-700 flex items-center justify-center shadow-lg overflow-hidden"
                                                    style={{ clipPath: 'polygon(20% 100%, 100% 100%, 100% 0%, 0% 0%)' }}>
                                                    <img src={p.avatarUrl || `https://ui-avatars.com/api/?name=${p.ign}&background=random`} alt={p.ign} className="w-full h-full object-cover opacity-90" />
                                                </div>

                                                {/* Rank & Details */}
                                                <div className="text-orange-700 font-bold text-xs uppercase mb-2">3RD</div>
                                                <div className="w-12 h-1 bg-orange-700 mb-3 shadow-[0_0_8px_rgba(194,65,12,0.5)]"></div>

                                                <h2 className="text-white font-black uppercase text-sm truncate max-w-[90%] px-1">{p.ign}</h2>
                                                <p className="text-[10px] text-gaming-accent font-mono mt-1">{p.role}</p>

                                                {/* Bottom Bar */}
                                                <div className="mt-auto w-full px-3">
                                                    <div className="w-full h-8 bg-gray-800/30 rounded flex items-center justify-center border border-white/5">
                                                        <span className="font-mono font-bold text-white text-sm">{p.stats.rankPoints}</span>
                                                    </div>
                                                </div>
                                            </button>
                                        </div>
                                    );
                                })()}

                            </div>
                        )}

                        {/* List */}
                        <div className="space-y-2">
                            {topPlayers.map((p, index) => (
                                <div key={p.id} className="bg-[#0c0c12]/60 backdrop-blur-md p-3 clip-corner-sm border border-white/5 flex items-center justify-between hover:bg-white/5 hover:border-gaming-accent/40 transition-all cyber-glimmer">
                                    <div className="flex items-center space-x-3">
                                        <span className="text-gray-600 font-bold font-mono text-sm w-6">{(index + 1).toString().padStart(2, '0')}</span>
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => setSelectedUserId(p.id)}
                                                    className="font-bold text-sm text-white uppercase tracking-tight hover:text-gaming-accent hover:underline text-left transition-colors"
                                                >
                                                    {p.ign}
                                                </button>
                                                <button
                                                    onClick={() => copyToClipboard(p.id)}
                                                    className="text-[8px] text-gray-600 hover:text-white transition-colors"
                                                >
                                                    {copiedId === p.id ? <Check size={10} className="text-green-500" /> : <Copy size={10} />}
                                                </button>
                                            </div>
                                            <p className="text-[8px] text-gaming-accent/70 uppercase tracking-widest font-bold tracking-[0.2em]">{p.role}</p>
                                        </div>
                                    </div>
                                    <span className="font-mono text-white font-bold bg-black/50 px-2 py-0.5 rounded border border-white/5">{p.stats.rankPoints}</span>
                                </div>
                            ))}
                            {topPlayers.length === 0 && (
                                <div className="text-center text-gray-500 py-10">No players found.</div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'Teams' && (
                    <div className="space-y-2">
                        {teams.length === 0 ? (
                            <div className="text-center py-20 bg-[#0c0c12]/60 backdrop-blur-md clip-corner border border-white/5 border-dashed">
                                <Shield size={64} className="mx-auto text-gray-700 mb-6" />
                                <h3 className="text-gray-400 font-bold uppercase tracking-wider mb-2">No Squad Found</h3>
                                <p className="text-xs text-gray-600 max-w-[200px] mx-auto mb-6">Initialize a new combat unit to participate in squad rankings.</p>
                                <button className="bg-gaming-primary text-white px-8 py-3 clip-corner-sm text-xs font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:bg-white hover:text-black transition-all">
                                    Create Squad
                                </button>
                            </div>
                        ) : (
                            teams.sort((a, b) => b.rankPoints - a.rankPoints).map((team, index) => (
                                <div key={team.id} className="bg-[#0c0c12]/60 backdrop-blur-md p-3 clip-corner-sm border border-white/5 flex items-center justify-between hover:bg-white/5 hover:border-gaming-primary/30 transition-all">
                                    <div className="flex items-center space-x-4">
                                        <div className={`w-8 h-8 flex items-center justify-center font-black text-xl italic ${index < 3 ? 'text-gaming-secondary drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]' : 'text-gray-600'}`}>
                                            #{index + 1}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded bg-gray-800 border border-white/10 overflow-hidden">
                                                <img src={team.logoUrl} alt={team.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-bold text-white text-sm">{team.name}</h3>
                                                    <button
                                                        onClick={() => copyToClipboard(team.id)}
                                                        className="text-gaming-accent/40 hover:text-gaming-accent transition-colors"
                                                    >
                                                        {copiedId === team.id ? <Check size={10} /> : <Copy size={10} />}
                                                    </button>
                                                </div>
                                                <p className="text-[10px] text-gray-500 uppercase">{team.district}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right bg-black/40 px-3 py-1 clip-corner-sm border border-white/5">
                                        <span className="block font-mono font-bold text-sm text-white">{team.rankPoints}</span>
                                        <span className="text-[8px] uppercase text-gray-500 font-bold tracking-widest">PTS</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
                {/* Public Profile Modal */}
                {selectedUserId && (
                    <PublicProfileModal
                        userId={selectedUserId}
                        onClose={() => setSelectedUserId(null)}
                    />
                )}
            </div>
        </PullToRefresh>
    );
};

export default Rankings;
