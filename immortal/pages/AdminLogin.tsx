import React, { useState, useEffect } from 'react';
import { Shield, Lock, User, AlertCircle } from 'lucide-react';
import { loginAdmin, getCurrentAdmin } from '../utils/adminAuth';

const AdminLogin: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // If already logged in, redirect to admin panel
        if (getCurrentAdmin()) {
            window.history.pushState({}, '', '/admin');
            window.location.reload();
        }
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const admin = await loginAdmin(username, password); // Async call

        if (admin) {
            // Success - redirect to admin panel
            window.history.pushState({}, '', '/admin');
            window.location.reload();
        } else {
            setError('Invalid credentials or not an admin');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0c0c12] flex items-center justify-center p-4">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -left-48 w-96 h-96 bg-gaming-accent/5 rounded-full blur-[128px]"></div>
                <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-blue-500/5 rounded-full blur-[128px]"></div>
            </div>

            {/* Login Card */}
            <div className="relative w-full max-w-md">
                {/* Logo/Header */}
                <div className="text-center mb-8 animate-in fade-in slide-in-from-top-4">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gaming-accent/10 border-2 border-gaming-accent mb-4">
                        <Shield size={40} className="text-gaming-accent" />
                    </div>
                    <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white mb-2">
                        ADMIN <span className="text-gaming-accent">PANEL</span>
                    </h1>
                    <p className="text-gray-500 text-sm">Secure access for authorized personnel only</p>
                </div>

                {/* Login Form */}
                <div className="bg-[#12121a] border border-white/10 rounded-lg p-8 shadow-[0_0_30px_rgba(0,255,157,0.1)] animate-in fade-in slide-in-from-bottom-4">
                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-3 animate-in fade-in">
                                <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
                                <div>
                                    <p className="text-red-500 text-sm font-bold">{error}</p>
                                    <p className="text-red-400/70 text-xs mt-1">Please check your credentials and try again</p>
                                </div>
                            </div>
                        )}

                        {/* Username Field */}
                        <div>
                            <label className="block text-xs text-gray-500 uppercase font-bold mb-2">
                                Email or IGN
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-gaming-accent transition-colors"
                                    placeholder="Enter your email or IGN"
                                    required
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label className="block text-xs text-gray-500 uppercase font-bold mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-gaming-accent transition-colors"
                                    placeholder="Enter your password"
                                    required
                                />
                            </div>
                        </div>

                        {/* Login Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gaming-accent text-black font-black uppercase italic tracking-widest py-4 rounded-lg hover:bg-gaming-accent/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(0,255,157,0.3)] hover:shadow-[0_0_30px_rgba(0,255,157,0.5)]"
                        >
                            {loading ? 'Authenticating...' : 'Access Panel'}
                        </button>
                    </form>

                </div>

                {/* Footer */}
                <div className="text-center mt-6">
                    <p className="text-xs text-gray-600">
                        Unauthorized access is prohibited
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
