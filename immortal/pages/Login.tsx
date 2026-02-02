import React, { useState } from 'react';
import { ChevronRight, Lock, Mail, AlertTriangle } from 'lucide-react';
// import { storage } from '../utils/storage';
import { UserProfile } from '../types';

interface LoginProps {
  onLoginSuccess: (user: UserProfile) => void;
  onSwitchToRegister: () => void;
}

import { auth } from '../utils/auth';
import { initiateSocketConnection } from '../utils/socket';

const Login: React.FC<LoginProps> = ({ onLoginSuccess, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Credentials required for system access.');
      return;
    }

    setLoading(true);

    try {
      // Use centralized Auth Utility
      const userProfile = await auth.login(email, password);

      // Update App State
      onLoginSuccess(userProfile);

      // Connect Socket (Get token from storage where auth util saved it)
      const stored = JSON.parse(localStorage.getItem('battle_arena_user') || '{}');
      if (stored.token) {
        initiateSocketConnection(stored.token);
      }

    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Login failed. Check server connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-y-auto overflow-x-hidden">
      <div className="min-h-screen flex flex-col items-center justify-start py-8 px-4 relative z-10 sm:justify-center sm:py-12">

      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=2670&ixlib=rb-4.0.3"
          className="w-full h-full object-cover opacity-20"
          alt="Gaming Background"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gaming-dark via-gaming-dark/80 to-gaming-primary/20 mix-blend-multiply"></div>
        <div className="absolute inset-0 cyber-grid-bg opacity-20"></div>
      </div>

      <div className="w-full max-w-sm relative z-10 flex flex-col">

        {/* Header Section */}
        <div className="text-center mb-10 relative">
          <div className="inline-block relative">
            <h1 className="text-6xl font-black italic uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-200 to-gray-500 drop-shadow-2xl glitch-text" data-text="IMMORAL ZONE">
              IMMORAL<br />ZONE
            </h1>
            <div className="h-1 w-full bg-gaming-accent mt-2 shadow-[0_0_10px_#00ff9d]"></div>
          </div>
          <p className="text-gaming-accent font-mono text-xs tracking-[0.5em] mt-3 uppercase font-bold animate-pulse">
            System Access Portal
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#0c0c12]/80 backdrop-blur-xl border border-white/10 p-1 relative group">

          {/* Decorative Border Elements */}
          <div className="absolute top-0 left-0 w-full h-full border border-white/5 clip-corner-sm pointer-events-none"></div>
          <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-gaming-accent"></div>
          <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-gaming-accent"></div>

          <div className="bg-black/40 p-6 clip-corner-sm">

            <h2 className="text-white text-xl font-bold uppercase tracking-wider mb-6 flex items-center">
              <span className="w-1 h-6 bg-gaming-primary mr-3"></span>
              Operator Login
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-500/20 border border-red-500/50 p-2 rounded clip-corner-sm flex items-center space-x-2 text-red-500 text-[10px] font-bold uppercase tracking-wide animate-bounce">
                  <AlertTriangle size={12} />
                  <span>{error}</span>
                </div>
              )}

              <div className="group/input">
                <label className="text-[9px] text-gray-500 group-hover/input:text-gaming-accent transition-colors uppercase font-bold tracking-widest mb-1 block">
                  Identity
                </label>
                <div className="relative">
                  <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center text-gray-500 group-focus-within/input:text-gaming-accent transition-colors">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    className="w-full bg-[#1a1a24] border border-white/5 pl-10 pr-4 py-3 text-white focus:border-gaming-accent focus:bg-black focus:shadow-[0_0_15px_rgba(0,255,157,0.1)] focus:outline-none clip-corner-sm text-sm font-mono transition-all placeholder:text-gray-700"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="ENTER EMAIL ID"
                  />
                </div>
              </div>

              <div className="group/input">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[9px] text-gray-500 group-hover/input:text-gaming-primary transition-colors uppercase font-bold tracking-widest block">
                    Passcode
                  </label>
                  <a href="#" className="text-[9px] text-gray-600 hover:text-white transition-colors uppercase font-bold tracking-wider">Forgot?</a>
                </div>
                <div className="relative">
                  <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center text-gray-500 group-focus-within/input:text-gaming-primary transition-colors">
                    <Lock size={16} />
                  </div>
                  <input
                    type="password"
                    className="w-full bg-[#1a1a24] border border-white/5 pl-10 pr-4 py-3 text-white focus:border-gaming-primary focus:bg-black focus:shadow-[0_0_15px_rgba(124,58,237,0.1)] focus:outline-none clip-corner-sm text-sm font-mono transition-all placeholder:text-gray-700"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full relative overflow-hidden bg-white text-black font-black py-4 clip-corner-sm hover:bg-gaming-accent transition-colors group mt-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="absolute inset-0 bg-gaming-accent/0 group-hover:bg-gaming-accent transition-colors z-0"></div>
                <span className="relative z-10 flex items-center justify-center uppercase tracking-[0.2em] text-xs">
                  {loading ? 'AUTHENTICATING...' : 'Establish Link'}
                  {!loading && <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />}
                </span>
              </button>
            </form>

          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <button
            onClick={onSwitchToRegister}
            className="group relative inline-flex items-center justify-center px-8 py-3 overflow-hidden font-bold text-white transition-all duration-300 bg-transparent border border-white/20 hover:border-gaming-accent clip-corner-sm"
          >
            <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-gray-700"></span>
            <span className="relative text-xs uppercase tracking-widest group-hover:text-gaming-accent transition-colors">Initialize New Profile</span>
          </button>
          <p className="mt-4 text-[9px] text-gray-600 font-mono">SECURE CONNECTION v2.0.4</p>
        </div>

        {/* Guest Access */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={async () => {
              setLoading(true);
              try {
                const user = await auth.guestLogin();
                onLoginSuccess(user);
                // Connect Socket (Get token from storage where auth util saved it)
                const stored = JSON.parse(localStorage.getItem('battle_arena_user') || '{}');
                if (stored.token) {
                  initiateSocketConnection(stored.token);
                }
              } catch (err: any) {
                console.error("Guest Login Error:", err);
                const msg = err.response?.data?.message || err.message || 'Guest System Offline';
                setError(msg);
                setLoading(false);
              }
            }}
            className="text-[10px] uppercase font-bold tracking-widest text-gray-400 hover:text-white transition-colors border-b border-transparent hover:border-white pb-0.5"
          >
            Guest Access Protocol
          </button>
        </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
