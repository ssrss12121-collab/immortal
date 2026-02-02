import React, { useState, useEffect } from 'react';
import { Trophy, Swords, Target, Zap } from 'lucide-react';
import { UserProfile, Tournament, Challenge } from '../types';
import { getTournaments } from '../utils/tournamentStorage';
import { getChallenges, acceptChallenge } from '../utils/challengeStorage';
import TournamentCard from '../components/TournamentCard';
import ChallengeCard from '../components/ChallengeCard';
import PullToRefresh from '../components/PullToRefresh';

interface PlayPageProps {
  user: UserProfile;
}

const PlayPage: React.FC<PlayPageProps> = ({ user }) => {
  const [viewMode, setViewMode] = useState<'TOURNAMENT' | 'CHALLENGE'>('TOURNAMENT');
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [filter, setFilter] = useState<'All' | 'Solo' | 'Duo' | 'Squad'>('All');
  const [challengeType, setChallengeType] = useState<'ALL' | '1v1' | 'Squad'>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([loadTournaments(), loadChallenges()]);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTournaments = async () => {
    try {
      const allTournaments = await getTournaments();
      setTournaments(allTournaments || []);
    } catch (error) {
      console.error('Failed to load tournaments:', error);
      setTournaments([]);
    }
  };

  const loadChallenges = async () => {
    try {
      const allChallenges = await getChallenges();
      setChallenges(allChallenges || []);
    } catch (error) {
      console.error('Failed to load challenges:', error);
      setChallenges([]);
    }
  };

  const handleRefresh = async () => {
    await loadData();
  };

  const handleAcceptChallenge = async (challengeId: string) => {
    try {
      await acceptChallenge(challengeId, user);
      await loadChallenges();
    } catch (error) {
      console.error('Failed to accept challenge:', error);
    }
  };

  const filteredTournaments = tournaments.filter(t => 
    filter === 'All' || t.teamSize === filter
  );

  const filteredChallenges = challenges.filter(c => {
    if (challengeType === 'ALL') return true;
    return c.type === challengeType;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-gaming-accent font-mono">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gaming-accent mb-4"></div>
        <div className="animate-pulse tracking-widest">LOADING...</div>
      </div>
    );
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="pb-28 pt-6 px-4 space-y-6 min-h-screen animate-fade-in bg-black">
        {/* Header */}
        <div className="bg-[#0c0c12]/80 backdrop-blur-md p-4 clip-corner-sm border border-white/10 cyber-glimmer">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black uppercase italic tracking-tighter text-white">
                Battle <span className="text-gaming-accent">Arena</span>
              </h1>
              <p className="text-[9px] text-gray-500 font-mono tracking-widest uppercase mt-1">
                Tournaments & Challenges
              </p>
            </div>
            <div className="w-12 h-12 bg-gaming-accent/10 border border-gaming-accent/30 rounded-2xl flex items-center justify-center">
              <Trophy size={24} className="text-gaming-accent" />
            </div>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex p-1 bg-black/40 clip-corner-sm border border-white/5">
          <button
            onClick={() => setViewMode('TOURNAMENT')}
            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest clip-corner-sm transition-all ${
              viewMode === 'TOURNAMENT' 
                ? 'bg-white/10 text-white shadow-inner' 
                : 'text-gray-500 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Trophy size={12} />
              Tournaments
            </div>
          </button>
          <button
            onClick={() => setViewMode('CHALLENGE')}
            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest clip-corner-sm transition-all ${
              viewMode === 'CHALLENGE' 
                ? 'bg-white/10 text-white shadow-inner' 
                : 'text-gray-500 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Swords size={12} />
              Challenges
            </div>
          </button>
        </div>

        {/* Tournament View */}
        {viewMode === 'TOURNAMENT' && (
          <div className="space-y-4">
            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {(['All', 'Solo', 'Duo', 'Squad'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                    filter === f
                      ? 'bg-gaming-accent text-black'
                      : 'bg-white/5 text-gray-500 hover:text-white border border-white/10'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Tournament List */}
            <div className="space-y-4">
              {filteredTournaments.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-3xl">
                  <Trophy size={48} className="mx-auto text-gray-800 opacity-20 mb-4" />
                  <p className="text-xs text-gray-600 uppercase font-bold tracking-widest italic">
                    No tournaments available
                  </p>
                </div>
              ) : (
                filteredTournaments.map((tournament) => (
                  <TournamentCard key={tournament.id} tournament={tournament} />
                ))
              )}
            </div>
          </div>
        )}

        {/* Challenge View */}
        {viewMode === 'CHALLENGE' && (
          <div className="space-y-4">
            {/* Challenge Type Filter */}
            <div className="flex gap-2">
              {(['ALL', '1v1', 'Squad'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setChallengeType(type)}
                  className={`flex-1 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    challengeType === type
                      ? 'bg-gaming-accent text-black'
                      : 'bg-white/5 text-gray-500 hover:text-white border border-white/10'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Challenge List */}
            <div className="space-y-4">
              {filteredChallenges.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-3xl">
                  <Swords size={48} className="mx-auto text-gray-800 opacity-20 mb-4" />
                  <p className="text-xs text-gray-600 uppercase font-bold tracking-widest italic">
                    No challenges available
                  </p>
                </div>
              ) : (
                filteredChallenges.map((challenge) => (
                  <ChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    onAccept={() => handleAcceptChallenge(challenge.id)}
                    currentUserId={user.id}
                  />
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </PullToRefresh>
  );
};

export default PlayPage;
