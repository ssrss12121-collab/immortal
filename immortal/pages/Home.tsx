import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { getNews, getMVPs } from '../utils/newsStorage';
import { getNotifications, markAsRead, deleteNotification } from '../utils/notificationStorage';
import { Bell, X, Trash2, Crown } from 'lucide-react';
import { getArchives, MatchArchiveEntry } from '../utils/archiveStorage';
import { Tournament, NewsItem, MVPItem, Notification, UserProfile } from '../types';
import { socketService } from '../utils/socketService';

import BannerDetailsModal from '../components/BannerDetailsModal';
import TournamentDetailsModal from '../components/TournamentDetailsModal';
import MVPDetailsModal from '../components/MVPDetailsModal';
import PublicProfileModal from '../components/PublicProfileModal';
import { getBanners } from '../utils/bannerStorage';
import { getFeaturedPlayerIds } from '../utils/featuredStorage';
import { getFeaturedPlayers } from '../utils/auth';
import { getTournaments } from '../utils/tournamentStorage';
import PullToRefresh from '../components/PullToRefresh';

// Memoized Sub-components
import HomeCarousel from '../components/home/HomeCarousel';
import IntelFeed from '../components/home/IntelFeed';
import MVPSpotlight from '../components/home/MVPSpotlight';
import DeploymentsList from '../components/home/DeploymentsList';
import EliteOperators from '../components/home/EliteOperators';
import OperationArchives from '../components/home/OperationArchives';
import DynamicAdCarousel from '../components/home/DynamicAdCarousel';

interface Banner {
  id: string;
  _id?: string;
  image: string;
  title: string;
  description: string;
  videoUrl?: string;
  badgeText?: string;
  type?: 'HERO' | 'AD';
}

interface HomeProps {
  user: UserProfile;
  onPlayClick: () => void;
  onTrophyClick: () => void;
}

const Home: React.FC<HomeProps> = ({ user, onPlayClick, onTrophyClick }) => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [ads, setAds] = useState<Banner[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [featuredPlayers, setFeaturedPlayers] = useState<UserProfile[]>([]);
  const [archives, setArchives] = useState<MatchArchiveEntry[]>([]);
  const [mvps, setMvps] = useState<MVPItem[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [selectedMVP, setSelectedMVP] = useState<MVPItem | null>(null);
  const [viewingProfileId, setViewingProfileId] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  // Parallel Data Loading
  const fetchContent = useCallback(async (ignoreCache = false) => {
    try {
      const [bannersList, newsList, tournamentsList, featuredIds, arc, mList] = await Promise.all([
        getBanners(ignoreCache),
        getNews(ignoreCache),
        getTournaments(ignoreCache),
        getFeaturedPlayerIds(ignoreCache),
        getArchives(ignoreCache),
        getMVPs(ignoreCache)
      ]);

      const heroBanners = bannersList.filter(b => b.type !== 'AD');
      const adList = bannersList.filter(b => b.type === 'AD');

      setBanners(heroBanners.length > 0 ? heroBanners : [{
        id: 'default',
        title: 'Welcome to Immortal Zone',
        description: 'The ultimate esports platform.',
        image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e',
        badgeText: 'Welcome'
      }]);
      setAds(adList);
      setNews(newsList);
      setTournaments(tournamentsList);
      setArchives(arc);
      setMvps(mList);

      if (featuredIds.length > 0) {
        const featured = await getFeaturedPlayers(featuredIds);
        setFeaturedPlayers(featured);
      }
    } catch (error) {
      console.error('Failed to load content', error);
    }
  }, []);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const handleManualRefresh = async () => {
    await Promise.all([
      fetchContent(true),
      fetchNotifications()
    ]);
  };

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await getNotifications(user.id);
      setNotifications(data as any);
    } catch (error) {
      console.error("Failed to load notifications");
    }
  }, [user.id]);

  useEffect(() => {
    fetchNotifications();
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'immora_notifications') fetchNotifications();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [fetchNotifications]);

  const handleMarkRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await markAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id || n.id === id ? { ...n, read: true } : n));
    } catch (error) { }
  };

  const handleAcceptInvite = async (notif: Notification) => {
    if (!notif.data?.teamId) return;
    try {
      const success = await socketService.acceptInviteAPI(notif._id || notif.id!, notif.data.teamId, user.id);
      if (success) {
        alert("SQUAD JOINED SUCCESSFULLY! WELCOME OPERATIVE.");
        setSelectedNotification(null);
        fetchNotifications();
      }
    } catch (err) { }
  };

  const handleRejectInvite = async (notif: Notification) => {
    try {
      const success = await socketService.rejectInviteAPI(notif._id || notif.id!);
      if (success) {
        setSelectedNotification(null);
        fetchNotifications();
      }
    } catch (err) { }
  };

  const handleDeleteNotification = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm('Delete this notification?')) return;
    try {
      await deleteNotification(id);
      setNotifications(prev => prev.filter(n => (n as any).id !== id));
      if (selectedNotification && (selectedNotification as any).id === id) setSelectedNotification(null);
    } catch (error) {
      console.error('Failed to delete');
    }
  };

  const slides = useMemo(() => {
    const bannerSlides = banners.map(x => ({ type: 'BANNER' as const, data: x }));
    const tournamentSlides = tournaments.filter(x => x.featured).map(x => ({ type: 'TOURNAMENT' as const, data: x }));
    return [...bannerSlides, ...tournamentSlides];
  }, [banners, tournaments]);

  const sortedArchives = useMemo(() => {
    return [...tournaments.filter(t => t.status === 'Completed'), ...archives]
      .sort((a, b) => {
        const timeA = new Date((a as any).endTime || (a as any).startTime || (a as any).date || 0).getTime();
        const timeB = new Date((b as any).endTime || (b as any).startTime || (b as any).date || 0).getTime();
        return timeB - timeA;
      });
  }, [tournaments, archives]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <PullToRefresh onRefresh={handleManualRefresh}>
      <div className="pb-28 pt-6 px-4 space-y-6 relative" onClick={() => showNotifications && setShowNotifications(false)}>
        {/* Header */}
        <div className="flex justify-between items-center relative z-50">
          <div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 glitch-text" data-text="IMMORAL ZONE">
              IMMORAL <span className="text-gaming-accent">ZONE</span>
            </h1>
            <div className="flex items-center space-x-3 mt-1">
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-gaming-accent rounded-full animate-pulse shadow-[0_0_5px_#00ff9d]"></span>
                <p className="text-[10px] text-gaming-accent font-mono tracking-[0.2em]">SYSTEM ONLINE</p>
              </div>
              {user.membership?.expiresAt && new Date(user.membership.expiresAt) > new Date() && (
                <div className="px-1.5 py-0.5 bg-gaming-accent text-black text-[7px] font-black uppercase rounded-sm flex items-center gap-0.5 shadow-[0_0_10px_rgba(0,223,130,0.5)]">
                  <Crown size={8} />
                  Premium Operator
                </div>
              )}
            </div>
          </div>

          <div className="relative">
            <div
              onClick={(e) => {
                e.stopPropagation();
                setShowNotifications(!showNotifications);
              }}
              className="w-12 h-12 clip-corner-sm bg-[#1a1a24] border border-white/10 flex items-center justify-center relative group cursor-pointer hover:bg-[#1a1a24]/80 transition-colors"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-br from-gaming-accent/20 to-transparent opacity-50 blur-sm"></div>
              <Bell size={20} className={`${unreadCount > 0 ? 'text-gaming-accent animate-pulse' : 'text-gray-400'} relative z-10`} />
              {unreadCount > 0 && <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border border-[#1a1a24] z-20"></div>}
            </div>

            {showNotifications && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
                <div className="bg-gaming-card border border-white/10 w-full max-w-md rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh] cyber-border-green">
                  <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <h3 className="font-bold text-white flex items-center gap-2 uppercase tracking-widest text-sm italic">
                      <Bell className="text-gaming-accent" size={18} /> Incoming Intel
                    </h3>
                    <button onClick={() => setShowNotifications(false)} className="p-1 hover:bg-white/10 rounded-full text-gray-400 hover:text-white"><X size={20} /></button>
                  </div>
                  <div className="overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="text-center py-20 text-gray-500">
                        <Bell size={48} className="mx-auto mb-4 opacity-10" />
                        <p className="font-mono text-[10px] tracking-widest uppercase">No fresh intel detected</p>
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div
                          key={notif._id || (notif as any).id}
                          onClick={() => {
                            setSelectedNotification(notif);
                            if (!notif.read) handleMarkRead(notif._id || (notif as any).id!, { stopPropagation: () => { } } as any);
                          }}
                          className={`p-4 rounded-xl border transition-all relative group cursor-pointer ${notif.read ? 'bg-white/5 border-white/5 hover:border-white/20' : 'bg-gaming-accent/5 border-gaming-accent/20 hover:border-gaming-accent/40 shadow-[0_0_15px_rgba(0,223,130,0.05)]'}`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className={`text-[8px] font-black px-2 py-0.5 rounded-sm uppercase tracking-tighter ${notif.type === 'SYSTEM' ? 'bg-blue-500/20 text-blue-400' : notif.type === 'TEAM_INVITE' ? 'bg-gaming-accent/20 text-gaming-accent' : notif.type === 'CHALLENGE' ? 'bg-red-500/20 text-red-500' : notif.type === 'ANNOUNCEMENT' ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-500/20 text-gray-400'}`}>
                              {notif.type}
                            </span>
                            <span className="text-[9px] text-gray-500 font-mono">{new Date(notif.createdAt || (notif as any).timestamp).toLocaleDateString()}</span>
                          </div>
                          <h4 className={`text-xs font-black uppercase tracking-tight mb-1 ${notif.read ? 'text-gray-400' : 'text-white'}`}>{notif.title || 'Intel Report'}</h4>
                          <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">{notif.message}</p>
                          <div className="absolute right-3 bottom-3 opacity-0 group-hover:opacity-100 transition-all">
                            <button onClick={(e) => handleDeleteNotification(notif._id || (notif as any).id!, e)} className="p-1.5 bg-red-500/10 text-red-500 rounded border border-red-500/20 hover:bg-red-500 hover:text-white transition-all shadow-lg"><Trash2 size={12} /></button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <HomeCarousel slides={slides} onSlideClick={(slide) => slide.type === 'BANNER' ? setSelectedBanner(slide.data as Banner) : setSelectedTournament(slide.data as Tournament)} />

        <IntelFeed news={news} />

        {/* Tech Separator */}
        <div className="py-2 flex items-center justify-center w-full px-4 overflow-hidden pointer-events-none opacity-60">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-gaming-accent/30 to-gaming-accent"></div>
          <div className="px-4 text-[8px] text-gaming-accent font-mono tracking-widest animate-pulse">ENCRYPTED DATA STREAM</div>
          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-gaming-accent/30 to-gaming-accent"></div>
        </div>

        <MVPSpotlight mvps={mvps} onSelectMVP={setSelectedMVP} />

        <DeploymentsList deployments={tournaments.filter(t => t.showOnDeployments)} onSelect={setSelectedTournament} />

        <EliteOperators players={featuredPlayers} onViewProfile={setViewingProfileId} />

        <OperationArchives items={sortedArchives} onSelect={setSelectedTournament} />

        <DynamicAdCarousel ads={ads} onAdClick={setSelectedBanner} />

        {/* Modals */}
        {selectedBanner && <BannerDetailsModal banner={selectedBanner} onClose={() => setSelectedBanner(null)} />}
        {selectedTournament && <TournamentDetailsModal tournament={selectedTournament} user={user} onClose={() => setSelectedTournament(null)} />}
        {selectedMVP && <MVPDetailsModal mvp={selectedMVP} onClose={() => setSelectedMVP(null)} onViewProfile={setViewingProfileId} />}
        {viewingProfileId && <PublicProfileModal userId={viewingProfileId} onClose={() => setViewingProfileId(null)} />}

        {selectedNotification && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60] flex items-center justify-center p-4" onClick={() => setSelectedNotification(null)}>
            <div className="bg-[#0a0a0f] border border-gaming-accent/30 w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl cyber-border-green" onClick={(e) => e.stopPropagation()}>
              <div className="h-32 bg-gaming-accent/5 relative flex items-center justify-center">
                <Bell size={48} className="text-gaming-accent/20" />
                <button onClick={() => setSelectedNotification(null)} className="absolute top-4 right-4 p-2 bg-black/40 rounded-full text-white/50 hover:text-white"><X size={20} /></button>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-gaming-accent">{selectedNotification.type}</span>
                  <span className="text-gray-500">{new Date(selectedNotification.createdAt || (selectedNotification as any).timestamp).toLocaleString()}</span>
                </div>
                <h2 className="text-xl font-black italic uppercase tracking-wider text-white leading-tight">{selectedNotification.title}</h2>
                <p className="text-sm text-gray-400 leading-relaxed font-medium">{selectedNotification.message}</p>

                <div className="pt-6 space-y-3">
                  {selectedNotification.type === 'TEAM_INVITE' && (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleAcceptInvite(selectedNotification)}
                        className="py-3 bg-gaming-accent text-black text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_15px_rgba(0,223,130,0.3)] hover:bg-white"
                      >
                        Accept Intel
                      </button>
                      <button
                        onClick={() => handleRejectInvite(selectedNotification)}
                        className="py-3 bg-white/5 hover:bg-red-500/20 text-white hover:text-red-500 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-white/5"
                      >
                        Reject invite
                      </button>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button onClick={() => setSelectedNotification(null)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-white/5">Dismiss</button>
                    <button onClick={() => handleDeleteNotification(selectedNotification._id || (selectedNotification as any).id!)} className="px-5 py-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-red-500/20"><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PullToRefresh>
  );
};

export default React.memo(Home);
