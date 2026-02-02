import React, { useState, useEffect } from 'react';
import { Users, Trophy, DollarSign, Shield, Zap, TrendingUp, UserCheck, Clock } from 'lucide-react';
import { getAllUsers } from '../../utils/auth';

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeSubscriptions: 0,
        totalMatches: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const users = await getAllUsers();
                const activeCount = users.filter(u => u.membership?.expiresAt && new Date(u.membership.expiresAt) > new Date()).length;
                setStats({
                    totalUsers: users.length,
                    activeSubscriptions: activeCount,
                    totalMatches: 0 // Placeholder
                });
            } catch (error) {
                console.error('Failed to fetch stats', error);
            }
        };

        fetchStats();
        // Refresh every 30s
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/5 border border-white/10 p-6 rounded-lg">
                    <h3 className="text-gray-400 text-sm font-bold uppercase">System Status</h3>
                    <p className="text-2xl font-bold mt-2 text-green-500">
                        ONLINE
                    </p>
                </div>
                <div className="bg-white/5 border border-white/10 p-6 rounded-lg">
                    <h3 className="text-gray-400 text-sm font-bold uppercase">Active Users</h3>
                    <p className="text-2xl font-bold text-white mt-2">{stats.totalUsers}</p>
                </div>
                <div className="bg-white/5 border border-white/10 p-6 rounded-lg relative overflow-hidden group">
                    <div className="absolute -right-4 -bottom-4 opacity-5 text-gaming-accent group-hover:opacity-10 transition-opacity">
                        <Zap size={80} />
                    </div>
                    <h3 className="text-gray-400 text-sm font-bold uppercase relative z-10 flex items-center gap-2">
                        <Zap size={14} className="text-gaming-accent" /> Active Subscriptions
                    </h3>
                    <p className="text-2xl font-black text-white mt-2 relative z-10">{stats.activeSubscriptions}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 mt-8">
                <div className="bg-white/5 border border-white/10 p-6 rounded-lg">
                    <h3 className="text-lg font-bold text-white mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                        {/* Placeholder for now */}
                        <div className="text-gray-500 text-sm italic">Activity logs coming soon...</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
