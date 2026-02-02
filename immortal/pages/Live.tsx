import React, { useState, useEffect, useCallback } from 'react';
import { Eye, Radio, Play, RefreshCcw, Mic, Zap } from 'lucide-react';
import { getSocket } from '../utils/socket';
import LiveStreamView from '../components/LiveStreamView';
import YouTubeViewer from '../components/YouTubeViewer';
import { UserProfile } from '../types';

interface YouTubeContent {
  _id: string;
  title: string;
  youtubeId: string;
  youtubeUrl: string;
  type: 'live' | 'video';
  thumbnailUrl: string;
  viewCount: number;
}

interface LiveProps {
  user: UserProfile;
}

const Live: React.FC<LiveProps> = ({ user }) => {
  // Live streaming states
  const [sessions, setSessions] = useState<any[]>([]);
  const [youtubeContent, setYoutubeContent] = useState<YouTubeContent[]>([]);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [liveCategory, setLiveCategory] = useState<'all' | 'video' | 'audio'>('all');

  const fetchSessions = useCallback(() => {
    try {
      const socket = getSocket();
      setRefreshing(true);
      socket.emit('get-active-sessions');
    } catch (e) {
      console.warn('Socket not ready for fetch');
      setIsLoading(false);
    }
  }, []);

  const fetchYouTubeContent = useCallback(async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/youtube/active`);
      if (response.ok) {
        const data = await response.json();
        setYoutubeContent(data.content || []);
      }
    } catch (error) {
      console.error('Failed to fetch YouTube content:', error);
    }
  }, []);

  useEffect(() => {
    let socket: any;
    try {
      socket = getSocket();
    } catch (e) {
      console.warn('Live: Socket not initialized yet');
      const retryTimer = setTimeout(() => {
        setIsLoading(false); // Stop loading anyway
      }, 3000);
      return () => clearTimeout(retryTimer);
    }

    const handleSessions = (list: any[]) => {
      console.log('Live: Received sessions', list);
      setSessions(list);
      setIsLoading(false);
      setRefreshing(false);
    };

    socket.on('active-sessions-list', handleSessions);
    fetchSessions();
    fetchYouTubeContent(); // Fetch YouTube content

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 4000);

    return () => {
      socket.off('active-sessions-list', handleSessions);
      clearTimeout(timer);
    };
  }, [fetchSessions, fetchYouTubeContent]);


  
  // Combined filtering for native sessions + YouTube content
  const getFilteredLiveContent = () => {
    const allContent: any[] = [];

    if (liveCategory === 'all' || liveCategory === 'video') {
      // Add native video sessions
      sessions
        .filter(s => s.type === 'Video' || s.liveType === 'Video')
        .forEach(session => {
          allContent.push({
            type: 'native-video',
            data: session,
          });
        });

      // Add YouTube live streams
      youtubeContent
        .filter(yt => yt.type === 'live')
        .forEach(yt => {
          allContent.push({
            type: 'youtube-live',
            data: yt,
          });
        });

      // Add YouTube videos
      youtubeContent
        .filter(yt => yt.type === 'video')
        .forEach(yt => {
          allContent.push({
            type: 'youtube-video',
            data: yt,
          });
        });
    }

    if (liveCategory === 'all' || liveCategory === 'audio') {
      // Add native audio/voice sessions
      sessions
        .filter(s => s.type === 'Audio' || s.liveType === 'VoiceSeated' || s.liveType === 'VoiceFree')
        .forEach(session => {
          allContent.push({
            type: 'native-audio',
            data: session,
          });
        });
    }

    return allContent;
  };

  const filteredLiveContent = getFilteredLiveContent();

  if (isLoading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-gaming-accent font-mono">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gaming-accent mb-4"></div>
      <div className="animate-pulse tracking-widest">LOADING...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      {/* Live Streaming Content */}
      <div className="px-4 space-y-6 animate-fade-in pt-6">
        {/* Header & Category Toggle */}
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-black uppercase italic text-white tracking-tighter leading-none mb-1">
                LIVE <span className="text-gaming-accent">ARENA</span>
              </h1>
              <p className="text-[9px] text-gray-500 font-mono tracking-[0.3em] uppercase">Public Guild Networks</p>
            </div>
            <button
              onClick={fetchSessions}
              disabled={refreshing}
              className={`p-2 bg-white/5 border border-white/10 clip-corner-sm hover:bg-white/10 transition-all ${refreshing ? 'animate-spin' : ''}`}
            >
              <RefreshCcw size={16} className="text-gaming-accent" />
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setLiveCategory('all')}
              className={`flex-1 py-3 px-4 clip-corner-sm border transition-all flex items-center justify-center gap-2 ${liveCategory === 'all' ? 'bg-gaming-accent/20 border-gaming-accent text-gaming-accent' : 'bg-white/5 border-white/10 text-gray-500 hover:text-white'}`}
            >
              <Radio size={14} />
              <span className="text-[11px] font-black uppercase tracking-widest">All Live</span>
            </button>
            <button
              onClick={() => setLiveCategory('video')}
              className={`flex-1 py-3 px-4 clip-corner-sm border transition-all flex items-center justify-center gap-2 ${liveCategory === 'video' ? 'bg-gaming-accent/20 border-gaming-accent text-gaming-accent' : 'bg-white/5 border-white/10 text-gray-500 hover:text-white'}`}
            >
              <Play size={14} />
              <span className="text-[11px] font-black uppercase tracking-widest">Video Live</span>
            </button>
            <button
              onClick={() => setLiveCategory('audio')}
              className={`flex-1 py-3 px-4 clip-corner-sm border transition-all flex items-center justify-center gap-2 ${liveCategory === 'audio' ? 'bg-gaming-accent/20 border-gaming-accent text-gaming-accent' : 'bg-white/5 border-white/10 text-gray-500 hover:text-white'}`}
            >
              <Mic size={14} />
              <span className="text-[11px] font-black uppercase tracking-widest">Voice Live</span>
            </button>
          </div>
        </div>

          {/* Live Sessions Grid - YouTube Style */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLiveContent.length === 0 ? (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
                <Zap size={48} className="mx-auto text-gray-800 mb-4" />
                <p className="text-xs text-gray-600 font-black uppercase tracking-widest italic">No active streams in this category.</p>
              </div>
            ) : (
              filteredLiveContent.map((item, index) => {
                const isNative = item.type.startsWith('native');
                const isYouTube = item.type.startsWith('youtube');

                if (isNative) {
                  const session = item.data;
                  return (
                    <div
                      key={`native-${session.id || index}`}
                      onClick={() => setActiveSession(session)}
                      className="group flex flex-col bg-[#0c0c12]/60 rounded-2xl overflow-hidden border border-white/5 hover:border-gaming-accent/30 transition-all cursor-pointer cyber-glimmer hover:translate-y-[-4px]"
                    >
                      {/* Thumbnail Area */}
                      <div className="aspect-video bg-black relative overflow-hidden">
                        <img 
                          src={session.hostAvatar || session.thumbnailUrl} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-60 group-hover:opacity-100" 
                          alt="" 
                        />
                        
                        {/* Live Badge */}
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-600 px-2.5 py-1 rounded-md text-[10px] font-black text-white shadow-lg animate-pulse z-10">
                          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                          LIVE
                        </div>

                        {/* Type Indicator */}
                        <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md px-2 py-1 rounded text-[9px] font-bold text-white z-10">
                          {session.type === 'Video' || session.liveType === 'Video' ? <div className="flex items-center gap-1"><Play size={10} /> VIDEO</div> : <div className="flex items-center gap-1"><Mic size={10} /> VOICE</div>}
                        </div>

                        {/* Hover Play Icon */}
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                           <div className="w-12 h-12 bg-gaming-accent rounded-full flex items-center justify-center text-black shadow-[0_0_20px_rgba(0,223,130,0.5)]">
                              <Play size={20} fill="currentColor" />
                           </div>
                        </div>
                      </div>

                      {/* Info Area */}
                      <div className="p-4 flex gap-4">
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden shrink-0 mt-1">
                           <img src={session.hostAvatar} className="w-full h-full object-cover" alt="" />
                        </div>
                        
                        {/* Text */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-black text-white leading-tight mb-1 line-clamp-2 group-hover:text-gaming-accent transition-colors">
                            {session.title || 'Guild Live Stream'}
                          </h3>
                          <div className="flex flex-col gap-0.5">
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wide">{session.hostName}</p>
                            <div className="flex items-center gap-3 text-[10px] text-gray-600 font-mono">
                              <span className="flex items-center gap-1"><Eye size={10} /> {session.viewers || session.viewersCount || 0} watching</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                if (isYouTube) {
                  const yt = item.data;
                  return (
                    <div
                      key={`youtube-${yt._id}`}
                      onClick={() => {
                        setActiveSession({
                          ...yt,
                          isYouTube: true,
                          type: yt.type,
                        });
                      }}
                      className="group flex flex-col bg-[#0c0c12]/60 rounded-2xl overflow-hidden border border-white/5 hover:border-red-500/30 transition-all cursor-pointer cyber-glimmer hover:translate-y-[-4px]"
                    >
                      {/* Thumbnail Area */}
                      <div className="aspect-video bg-black relative overflow-hidden">
                        <img 
                          src={yt.thumbnailUrl} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                          alt="" 
                          onError={(e) => {
                            e.currentTarget.src = `https://img.youtube.com/vi/${yt.youtubeId}/hqdefault.jpg`;
                          }}
                        />
                        
                        {/* YouTube Badge */}
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-600 px-2.5 py-1 rounded-md text-[10px] font-black text-white shadow-lg z-10">
                          <Radio size={10} />
                          {yt.type === 'live' ? 'YOUTUBE LIVE' : 'YOUTUBE'}
                        </div>

                        {/* Hover Play Icon */}
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                           <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white shadow-[0_0_20px_rgba(255,0,0,0.5)]">
                              <Play size={20} fill="currentColor" />
                           </div>
                        </div>
                      </div>

                      {/* Info Area */}
                      <div className="p-4">
                        <h3 className="text-sm font-black text-white leading-tight mb-1 line-clamp-2 group-hover:text-red-500 transition-colors">
                          {yt.title}
                        </h3>
                        <div className="flex items-center gap-3 text-[10px] text-gray-600 font-mono mt-2">
                          <span className="flex items-center gap-1"><Eye size={10} /> {yt.viewCount} views</span>
                        </div>
                      </div>
                    </div>
                  );
                }

                return null;
              })
            )}
          </div>
        </div>

      {activeSession && (
        <>
          {activeSession.isYouTube ? (
            <YouTubeViewer
              youtubeId={activeSession.youtubeId}
              title={activeSession.title}
              type={activeSession.type}
              onClose={() => setActiveSession(null)}
            />
          ) : (
            <LiveStreamView
              user={user}
              session={activeSession}
              isHost={activeSession.hostId === user.id}
              onClose={() => setActiveSession(null)}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Live;
