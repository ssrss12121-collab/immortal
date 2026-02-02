import React, { useState, useEffect } from 'react';

import AdminDashboard from '../components/admin/AdminDashboard';
import AdminUsers from '../components/admin/AdminUsers';
import AdminTournaments from '../components/admin/AdminTournaments';
import AdminBanners from '../components/admin/AdminBanners';
import AdminContentManager from '../components/admin/AdminContentManager';
import AdminChallenges from '../components/admin/AdminChallenges';
import AdminNotifications from '../components/admin/AdminNotifications';
import AdminLive from '../components/admin/AdminLive';
import AdminManagement from '../components/admin/AdminManagement';
import AdminFeaturedPlayers from '../components/admin/AdminFeaturedPlayers';
import AdminHistory from '../components/admin/AdminHistory';
import AdminMemberships from '../components/admin/AdminMemberships';
import AdminSubscriptions from '../components/admin/AdminSubscriptions';
import AdminSettings from '../components/admin/AdminSettings';
import { LayoutDashboard, Users, Trophy, LogOut, Image as ImageIcon, FileText, Swords, Bell, Radio, X, UserCog, Star, History, Shield, Settings } from 'lucide-react';
import { getCurrentAdmin, isSuperAdmin, loginAdmin, logoutAdmin } from '../utils/adminAuth';
import { getAllAdmins } from '../utils/adminStorage';

const Admin: React.FC = () => {
    const currentAdmin = getCurrentAdmin();

    // Set initial tab based on admin role
    const getInitialTab = () => {
        if (!currentAdmin) return 'dashboard';
        if (currentAdmin.role === 'tournament_admin') return 'tournaments';
        if (currentAdmin.role === 'challenge_admin') return 'challenges';
        if (currentAdmin.role === 'banner_admin') return 'banners';
        if (currentAdmin.role === 'content_admin') return 'content';
        if (currentAdmin.role === 'live_admin') return 'live';
        if (currentAdmin.role === 'user_admin') return 'users';
        return 'dashboard';
    };

    const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'tournaments' | 'banners' | 'content' | 'challenges' | 'notifications' | 'live' | 'admins' | 'featured' | 'history' | 'memberships' | 'settings'>(getInitialTab());
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    useEffect(() => {
        // Check if admin is logged in
        if (!getCurrentAdmin()) {
            // Initialize storage to create default admin if needed
            getAllAdmins();
            // Redirect to login page
            window.history.pushState({}, '', '/admin-login');
            window.location.reload();
            return;
        }

        // Ensure we are in admin mode
        if (!window.location.pathname.includes('/admin')) {
            window.history.pushState({}, '', '/admin');
        }
    }, []);

    const handleLogout = () => {
        logoutAdmin();
        window.history.pushState({}, '', '/admin-login');
        window.location.reload();
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard': return <AdminDashboard />;
            case 'users': return <AdminUsers />;
            case 'tournaments': return <AdminTournaments />;
            case 'challenges': return <AdminChallenges />;
            case 'banners': return <AdminBanners />;
            case 'content': return <AdminContentManager />;
            case 'notifications': return <AdminNotifications />;
            case 'live': return <AdminLive />;
            case 'admins': return <AdminManagement />;
            case 'featured': return <AdminFeaturedPlayers />;
            case 'history': return <AdminSubscriptions />;
            case 'memberships': return <AdminMemberships />;
            case 'settings': return <AdminSettings />;
            default: return <AdminDashboard />;
        }
    };

    const SidebarItem = ({ icon: Icon, label, id }: { icon: any, label: string, id: typeof activeTab }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${activeTab === id ? 'bg-gaming-accent text-black font-bold shadow-[0_0_15px_rgba(0,255,157,0.4)]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
        >
            <Icon size={20} />
            <span>{label}</span>
        </button>
    );

    return (
        <div className="min-h-screen bg-[#0c0c12] text-white flex font-sans">
            {/* Sidebar Overlay for Mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#12121a] border-r border-white/10 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0`}>
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <h1 className="text-2xl font-black italic text-white tracking-tighter">ADMIN <span className="text-gaming-accent">PANEL</span></h1>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>
                <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-100px)] custom-scrollbar">
                    {/* Super Admin - Full Access */}
                    {currentAdmin?.role === 'super_admin' && (
                        <>
                            <SidebarItem icon={LayoutDashboard} label="Dashboard" id="dashboard" />
                            <SidebarItem icon={Users} label="User Management" id="users" />
                            <SidebarItem icon={Trophy} label="Tournaments" id="tournaments" />
                            <SidebarItem icon={Swords} label="Challenges" id="challenges" />
                            <SidebarItem icon={Shield} label="Memberships" id="memberships" />
                            <SidebarItem icon={ImageIcon} label="Banners" id="banners" />
                            <SidebarItem icon={FileText} label="Content & News" id="content" />
                            <SidebarItem icon={Bell} label="Notifications" id="notifications" />
                            <SidebarItem icon={Radio} label="Live Page" id="live" />
                            <SidebarItem icon={Star} label="Featured Players" id="featured" />
                            <SidebarItem icon={History} label="Subscription Logs" id="history" />
                            <SidebarItem icon={Settings} label="Global Settings" id="settings" />
                            <div className="my-3 border-t border-white/10"></div>
                            <SidebarItem icon={UserCog} label="Admin Management" id="admins" />
                        </>
                    )}

                    {/* Tournament Admin - Only Tournaments */}
                    {currentAdmin?.role === 'tournament_admin' && (
                        <>
                            <SidebarItem icon={Trophy} label="My Tournaments" id="tournaments" />
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mt-4">
                                <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">Tournament Admin</p>
                                <p className="text-xs text-gray-500 mt-1">Managing {currentAdmin.permissions.tournaments?.length || 0} tournament(s)</p>
                            </div>
                        </>
                    )}

                    {/* Challenge Admin - Only Challenges */}
                    {currentAdmin?.role === 'challenge_admin' && (
                        <>
                            <SidebarItem icon={Swords} label="Challenge Matches" id="challenges" />
                            <div className="bg-gaming-accent/10 border border-gaming-accent/20 rounded-lg p-3 mt-4">
                                <p className="text-[10px] text-gaming-accent font-bold uppercase tracking-wider">Challenge Admin</p>
                                <p className="text-xs text-gray-500 mt-1">Managing all challenges</p>
                            </div>
                        </>
                    )}

                    {/* Banner Admin - Only Banners */}
                    {currentAdmin?.role === 'banner_admin' && (
                        <>
                            <SidebarItem icon={ImageIcon} label="Banner Management" id="banners" />
                            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 mt-4">
                                <p className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">Banner Admin</p>
                                <p className="text-xs text-gray-500 mt-1">Managing banners</p>
                            </div>
                        </>
                    )}

                    {/* Content Admin - Only Content */}
                    {currentAdmin?.role === 'content_admin' && (
                        <>
                            <SidebarItem icon={FileText} label="Content & News" id="content" />
                            <div className="bg-gaming-accent/10 border border-gaming-accent/20 rounded-lg p-3 mt-4">
                                <p className="text-[10px] text-gaming-accent font-bold uppercase tracking-wider">Content Admin</p>
                                <p className="text-xs text-gray-500 mt-1">Managing content</p>
                            </div>
                        </>
                    )}

                    {/* User Admin - Only Users */}
                    {currentAdmin?.role === 'user_admin' && (
                        <>
                            <SidebarItem icon={Users} label="User Management" id="users" />
                            <div className="bg-pink-500/10 border border-pink-500/20 rounded-lg p-3 mt-4">
                                <p className="text-[10px] text-pink-400 font-bold uppercase tracking-wider">User Admin</p>
                                <p className="text-xs text-gray-500 mt-1">Managing users</p>
                            </div>
                        </>
                    )}

                    {/* Live Admin - Only Live */}
                    {currentAdmin?.role === 'live_admin' && (
                        <>
                            <SidebarItem icon={Radio} label="Live Page Management" id="live" />
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mt-4">
                                <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider">Live Manager</p>
                                <p className="text-xs text-gray-500 mt-1">Managing live streams</p>
                            </div>
                        </>
                    )}

                    <div className="pt-4 mt-4 border-t border-white/10">
                        <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors font-bold text-sm uppercase tracking-wide">
                            <LogOut size={20} />
                            <span>Exit Panel</span>
                        </button>
                    </div>
                </nav>
            </div>

            {/* Main Content */}
            <main className="flex-1 min-w-0 h-screen overflow-y-auto w-full relative">
                <header className="sticky top-0 z-40 bg-[#0c0c12]/80 backdrop-blur-md border-b border-white/5 px-4 py-4 md:px-8 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-2 bg-gaming-accent/10 text-gaming-accent rounded-lg border border-gaming-accent/20"
                        >
                            <LayoutDashboard size={20} />
                        </button>
                        <div>
                            <h2 className="text-lg md:text-xl font-bold text-white capitalize leading-tight">{activeTab}</h2>
                            <p className="text-[10px] md:text-xs text-gray-500 uppercase tracking-wider font-semibold">Management Console</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3 md:space-x-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-white">{currentAdmin?.username || 'Admin'}</p>
                            <p className="text-[10px] text-gaming-accent uppercase font-bold tracking-tighter">{currentAdmin?.role.replace('_', ' ') || 'Super Admin'}</p>
                        </div>
                        <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gaming-accent/20 border border-gaming-accent flex items-center justify-center text-gaming-accent font-black">
                            {currentAdmin?.username?.charAt(0) || 'A'}
                        </div>
                    </div>
                </header>

                <div className="p-4 md:p-8 animate-fade-in max-w-7xl mx-auto">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

export default Admin;
