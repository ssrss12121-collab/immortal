import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Home as HomeIcon, Shield, Lock } from 'lucide-react';
import NavBar from './components/NavBar';
import { UserProfile } from './types';
import { auth } from './utils/auth';
import { initiateSocketConnection, getSocket } from './utils/socket';
import { getCurrentAdmin, loginAdmin } from './utils/adminAuth';

// Lazy Loaded Pages for performance
const Home = lazy(() => import('./pages/Home'));
const Rankings = lazy(() => import('./pages/Rankings'));
const Live = lazy(() => import('./pages/Live'));
const Play = lazy(() => import('./pages/Play'));
const Profile = lazy(() => import('./pages/Profile'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const Login = lazy(() => import('./pages/Login'));
const Settings = lazy(() => import('./pages/Settings'));
const Support = lazy(() => import('./pages/Support'));
const Terms = lazy(() => import('./pages/Terms'));
const Admin = lazy(() => import('./pages/Admin'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const TransactionManagement = lazy(() => import('./pages/TransactionManagement'));
const TeamManager = lazy(() => import('./pages/TeamManager'));
const Welcome = lazy(() => import('./pages/Welcome'));
const GuildPage = lazy(() => import('./pages/GuildPage'));
const GuildInternal = lazy(() => import('./pages/GuildInternal'));
const LiveStreamView = lazy(() => import('./components/LiveStreamView'));
const GuildManagement = lazy(() => import('./pages/GuildManagement'));
const MessengerPage = lazy(() => import('./pages/MessengerPage'));
const CallOverlay = lazy(() => import('./components/CallOverlay'));
const AddFriendByID = lazy(() => import('./components/AddFriendByID'));
import CallPage from './pages/CallPage';
import { useCalling, CallProvider } from './utils/useCalling';

// Loading Placeholder
const PageLoader = () => (
  <div className="flex-1 flex flex-col items-center justify-center text-gaming-accent font-mono p-10">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gaming-accent mb-2"></div>
    <div className="text-[10px] tracking-widest uppercase opacity-50">Loading Module...</div>
  </div>
);

const TransactionRoute: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const admin = getCurrentAdmin();
    if (admin) setIsAuthenticated(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const admin = await loginAdmin(username, password);
      if (admin) setIsAuthenticated(true);
      else setError('Invalid credentials');
    } catch (err) { setError('Login failed'); }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white font-sans flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-gaming-accent/10 flex items-center justify-center rounded-full mb-4 border border-gaming-accent/20">
              <Lock className="text-gaming-accent" size={32} />
            </div>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter">SECURE ACCESS</h2>
          </div>
          <form className="mt-8 space-y-4" onSubmit={handleLogin}>
            <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-3 py-4 border border-white/10 bg-black/50 rounded-lg text-white" placeholder="ADMIN IDENTITY" />
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-4 border border-white/10 bg-black/50 rounded-lg text-white" placeholder="SECURITY CODE" />
            {error && <div className="text-red-500 text-xs uppercase font-bold text-center">{error}</div>}
            <button type="submit" className="w-full py-4 bg-gaming-accent text-black font-black rounded-lg uppercase tracking-widest">Authenticate</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <main className="max-w-md mx-auto min-h-screen relative overflow-hidden border-x border-white/5 bg-black">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between border-b border-white/5">
          <h1 className="text-xl font-black italic uppercase tracking-wider text-white">Transaction Ops</h1>
        </div>
        <Suspense fallback={<PageLoader />}>
          <TransactionManagement />
        </Suspense>
      </main>
    </div>
  );
};

const AppContent: React.FC = () => {
    const [activeTab, setActiveTab] = useState('home');
  const [session, setSession] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeGuildId, setActiveGuildId] = useState<string | null>(null);
  const [manageGuildId, setManageGuildId] = useState<string | null>(null);
  const [activeCall, setActiveCall] = useState<any | null>(null);
  const [activeLiveSession, setActiveLiveSession] = useState<any | null>(null);
  const [activeChatUserId, setActiveChatUserId] = useState<string | null>(null);
  const [view, setView] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [isNavHidden, setIsNavHidden] = useState(false);

  const { callState } = useCalling();
  const isActuallyCalling = callState.status !== 'IDLE';

  const [showWelcome, setShowWelcome] = useState(() => {
    if (typeof window !== 'undefined') {
      return !localStorage.getItem('immortal_welcome_seen');
    }
    return false;
  });

  const path = window.location.pathname;

  useEffect(() => {
    setIsNavHidden(false);
  }, [activeTab]);

  useEffect(() => {
    const initSession = async () => {
      try {
        const currentSession = auth.getCurrentUser();
        setSession(currentSession);
        if (currentSession && !currentSession.ign) setView('REGISTER');
        if (currentSession) auth.refreshSession();
      } catch (error) { console.error('Session error:', error); }
      finally { setLoading(false); }
    };

    initSession();

    const stored = localStorage.getItem('battle_arena_user');
    if (stored) {
      const user = JSON.parse(stored);
      if (user.token) initiateSocketConnection(user.token);
    }
  }, []);

  useEffect(() => {
    let socket: any;
    try { socket = getSocket(); } catch { return; }

    if (socket && session) {
      socket.emit('join-user-room', session.id || session._id);

      // Removed non-chat listeners (tournament updates, balance, notifications)
      // to optimize performance as per user request. 
      // Sockets are now reserved for team chat operations.
    }
  }, [session?.id]);

  useEffect(() => {
    const handleSessionUpdate = () => setSession(auth.getCurrentUser());
    window.addEventListener('user-session-update', handleSessionUpdate);
    return () => window.removeEventListener('user-session-update', handleSessionUpdate);
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-gaming-accent font-mono">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gaming-accent mb-4"></div>
      <div className="tracking-widest text-[10px]">SYNCING PROTOCOLS...</div>
    </div>
  );

  if (path === '/admin') return <Suspense fallback={<PageLoader />}><Admin /></Suspense>;
  if (path === '/admin-login') return <Suspense fallback={<PageLoader />}><AdminLogin /></Suspense>;
  if (path.toLowerCase().includes('/tx')) return <TransactionRoute />;

  if (!session) {
    if (showWelcome) {
      return (
        <Suspense fallback={<PageLoader />}>
          <Welcome onComplete={() => {
            localStorage.setItem('immortal_welcome_seen', 'true');
            setShowWelcome(false);
          }} />
        </Suspense>
      );
    }
    return (
      <Suspense fallback={<PageLoader />}>
        {view === 'REGISTER' ?
          <Onboarding onSwitchToLogin={() => setView('LOGIN')} onRegisterSuccess={(u) => setSession(u)} /> :
          <Login onLoginSuccess={(u) => setSession(u)} onSwitchToRegister={() => setView('REGISTER')} />
        }
      </Suspense>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <Home user={session} onPlayClick={() => setActiveTab('play')} onTrophyClick={() => setActiveTab('rank')} />;
      case 'rank': return <Rankings />;
      case 'play': return <Live user={session} />;
      case 'guild':
        if (manageGuildId) return <GuildManagement guildId={manageGuildId} user={session} onBack={() => setManageGuildId(null)} />;
        return activeGuildId ? (
          <GuildInternal
            guildId={activeGuildId}
            user={session}
            onBack={() => setActiveGuildId(null)}
            onManage={() => setManageGuildId(activeGuildId)}
            onNavigateToChat={(type, id) => console.log('Chat:', type, id)}
            onStartLive={(type, id, sType) => setActiveLiveSession({ type, sourceId: id, sourceType: sType })}
          />
        ) : (
          <GuildPage user={session} onNavigateToGuild={setActiveGuildId} />
        );
      case 'messenger':
        return (
          <MessengerPage
            user={session}
            onChatToggle={setIsNavHidden}
            onNavigate={setActiveTab}
            activeChatUserId={activeChatUserId}
            onChatHandled={() => setActiveChatUserId(null)}
          />
        );
      case 'game': return <Play user={session} />;
      case 'team': return <TeamManager user={session} onUpdateUser={setSession} onBack={() => setActiveTab('profile')} onChatToggle={setIsNavHidden} />;
      case 'profile': return <Profile user={session} onLogout={() => { auth.logout(); setSession(null); }} onNavigateToTeam={() => setActiveTab('team')} onNavigateToSettings={() => setActiveTab('settings')} onUpdateUser={setSession} onRefresh={async () => { await auth.refreshSession(); setSession(auth.getCurrentUser()); }} />;
      case 'settings': return <Settings user={session} onLogout={() => setSession(null)} onBack={() => setActiveTab('profile')} onNavigate={setActiveTab} />;
      case 'support': return <Support onBack={() => setActiveTab('settings')} />;
      case 'terms': return <Terms onBack={() => setActiveTab('settings')} />;
      default: return <Home user={session} onPlayClick={() => setActiveTab('play')} onTrophyClick={() => setActiveTab('rank')} />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden">
      <main className="max-w-md mx-auto min-h-screen relative overflow-y-auto border-x border-white/5 bg-black shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        <Suspense fallback={<PageLoader />}>
          <div className={`relative transition-all duration-300 ${isNavHidden || isActuallyCalling ? 'h-[100dvh]' : ''}`}>
            {renderContent()}
          </div>
        </Suspense>

        {isActuallyCalling && (
          <Suspense fallback={null}>
            <CallPage onEnd={() => { }} />
          </Suspense>
        )}

        {!isNavHidden && !activeLiveSession && !isActuallyCalling && (
          <Suspense fallback={null}>
            <AddFriendByID onStartChat={(userId) => {
              setActiveChatUserId(userId);
              setActiveTab('messenger');
            }} />
          </Suspense>
        )}
        {!isNavHidden && !activeLiveSession && !isActuallyCalling && <NavBar activeTab={activeTab} setActiveTab={setActiveTab} />}
      </main>
    </div>
  );
};

const App: React.FC = () => {
    return (
        <CallProvider>
            <AppContent />
        </CallProvider>
    );
};

export default App;