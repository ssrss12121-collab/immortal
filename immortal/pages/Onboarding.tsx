import React, { useState } from 'react';
import { PlayerRole, UserProfile } from '../types';
import { DISTRICTS, COUNTRIES } from '../constants';
import { Shield, Target, Zap, Crosshair, ChevronRight, User, Mail, Hash, Calendar, Layers, Lock, Globe } from 'lucide-react';
import { auth } from '../utils/auth';

interface OnboardingProps {
  onSwitchToLogin: () => void;
  onRegisterSuccess: (user: UserProfile) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onSwitchToLogin, onRegisterSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    ign: '',
    role: 'Rusher' as PlayerRole,
    experience: '',
    age: '',
    email: '',
    password: '',
    country: 'Bangladesh',
    district: '',
    termsAccepted: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.termsAccepted) {
      setError('You must accept the squad protocols.');
      return;
    }

    setLoading(true);

    try {
      const newUser = await auth.register({
        name: formData.name,
        ign: formData.ign,
        gameRole: formData.role,
        experience: formData.experience,
        age: parseInt(formData.age) || 18,
        email: formData.email,
        country: formData.country,
        district: formData.country === 'Bangladesh' ? formData.district : 'International',
        password: formData.password
      });

      onRegisterSuccess(newUser);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { id: 'Rusher', icon: Zap },
    { id: 'Sniper', icon: Crosshair },
    { id: 'Supporter', icon: Shield },
    { id: 'Nader', icon: Target },
  ];

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

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-200 to-gray-500 drop-shadow-2xl glitch-text" data-text="IMMORAL ZONE">
            IMMORAL<br />ZONE
          </h1>
          <div className="h-0.5 w-24 mx-auto bg-gaming-accent mt-2 shadow-[0_0_10px_#00ff9d]"></div>
          <p className="text-gaming-accent font-mono text-[10px] tracking-[0.3em] mt-2 uppercase font-bold">
            Initialize New Operator
          </p>
        </div>

        <div className="bg-[#0c0c12]/80 backdrop-blur-xl border border-white/10 p-1 relative group">
          {/* Decorative Border Elements */}
          <div className="absolute top-0 left-0 w-full h-full border border-white/5 clip-corner-sm pointer-events-none"></div>
          <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-gaming-accent"></div>
          <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-gaming-accent"></div>

          <div className="bg-black/40 p-5 clip-corner-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <p className="text-red-500 text-xs text-center font-bold tracking-widest">{error.toUpperCase()}</p>}

              {/* IGN Input */}
              <div className="group/input">
                <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1 block">Codename (IGN)</label>
                <div className="relative">
                  <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center text-gray-500">
                    <Hash size={14} />
                  </div>
                  <input
                    required
                    className="w-full bg-[#1a1a24] border border-white/5 pl-10 pr-4 py-2.5 text-white focus:border-gaming-accent focus:bg-black focus:shadow-[0_0_15px_rgba(0,255,157,0.1)] focus:outline-none clip-corner-sm text-sm font-mono transition-all"
                    value={formData.ign}
                    onChange={e => setFormData({ ...formData, ign: e.target.value })}
                    placeholder="E.g. NIGHTMARE"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1 block">Full Name</label>
                  <div className="relative">
                    <div className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center text-gray-500">
                      <User size={12} />
                    </div>
                    <input
                      required
                      className="w-full bg-[#1a1a24] border border-white/5 pl-8 pr-3 py-2.5 text-white focus:border-gaming-primary focus:outline-none clip-corner-sm text-xs font-mono"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Name"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1 block">Country</label>
                  <div className="relative">
                    <div className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center text-gray-500 pointer-events-none">
                      <Globe size={12} />
                    </div>
                    <select
                      className="w-full bg-[#1a1a24] border border-white/5 pl-8 pr-3 py-2.5 text-white focus:border-gaming-primary focus:outline-none clip-corner-sm text-xs font-mono appearance-none"
                      value={formData.country}
                      onChange={e => setFormData({ ...formData, country: e.target.value, district: e.target.value === 'Bangladesh' ? 'Dhaka' : '' })}
                    >
                      {COUNTRIES.map(c => <option key={c} value={c} className="bg-gray-900">{c}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {formData.country === 'Bangladesh' && (
                <div className="animate-in fade-in slide-in-from-top-2">
                  <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1 block">District</label>
                  <select
                    className="w-full bg-[#1a1a24] border border-white/5 pl-3 pr-8 py-2.5 text-white focus:border-gaming-primary focus:outline-none clip-corner-sm text-xs font-mono appearance-none"
                    value={formData.district}
                    onChange={e => setFormData({ ...formData, district: e.target.value })}
                  >
                    <option value="" disabled className="bg-gray-900">SELECT DISTRICT</option>
                    {DISTRICTS.map(d => <option key={d} value={d} className="bg-gray-900">{d}</option>)}
                  </select>
                </div>
              )}

              {/* Role Selection */}
              <div>
                <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-2 block">Combat Role</label>
                <div className="grid grid-cols-4 gap-2">
                  {roles.map((r) => (
                    <button
                      type="button"
                      key={r.id}
                      onClick={() => setFormData({ ...formData, role: r.id as PlayerRole })}
                      className={`p-2 clip-corner-sm border flex flex-col items-center justify-center transition-all h-16 relative overflow-hidden group ${formData.role === r.id
                        ? 'bg-gaming-primary/20 border-gaming-primary text-white shadow-[0_0_10px_rgba(124,58,237,0.2)]'
                        : 'bg-[#1a1a24] border-white/5 text-gray-500 hover:border-gray-600'
                        }`}
                    >
                      <r.icon size={16} className={`mb-1 ${formData.role === r.id ? 'text-gaming-accent' : ''}`} />
                      <span className="text-[8px] font-bold uppercase tracking-wider">{r.id}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1 block">Age</label>
                  <div className="relative">
                    <div className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center text-gray-500">
                      <Calendar size={12} />
                    </div>
                    <input
                      type="number"
                      required
                      className="w-full bg-[#1a1a24] border border-white/5 pl-8 pr-3 py-2.5 text-white focus:border-gaming-primary focus:outline-none clip-corner-sm text-xs font-mono"
                      value={formData.age}
                      onChange={e => setFormData({ ...formData, age: e.target.value })}
                      placeholder="18"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1 block">XP</label>
                  <div className="relative">
                    <div className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center text-gray-500">
                      <Layers size={12} />
                    </div>
                    <input
                      required
                      className="w-full bg-[#1a1a24] border border-white/5 pl-8 pr-3 py-2.5 text-white focus:border-gaming-primary focus:outline-none clip-corner-sm text-xs font-mono"
                      value={formData.experience}
                      onChange={e => setFormData({ ...formData, experience: e.target.value })}
                      placeholder="Years"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1 block">Email</label>
                  <div className="relative">
                    <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center text-gray-500">
                      <Mail size={14} />
                    </div>
                    <input
                      type="email"
                      required
                      className="w-full bg-[#1a1a24] border border-white/5 pl-10 pr-4 py-2.5 text-white focus:border-gaming-accent focus:outline-none clip-corner-sm text-xs font-mono transition-all"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Email"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1 block">Passcode</label>
                  <div className="relative">
                    <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center text-gray-500">
                      <Lock size={14} />
                    </div>
                    <input
                      type="password"
                      required
                      className="w-full bg-[#1a1a24] border border-white/5 pl-10 pr-4 py-2.5 text-white focus:border-gaming-accent focus:outline-none clip-corner-sm text-xs font-mono transition-all"
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 bg-white/5 p-3 clip-corner-sm border border-white/5">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    id="terms"
                    required
                    checked={formData.termsAccepted}
                    onChange={e => setFormData({ ...formData, termsAccepted: e.target.checked })}
                    className="peer w-4 h-4 cursor-pointer appearance-none border border-gray-600 rounded-sm checked:bg-gaming-accent checked:border-gaming-accent"
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 peer-checked:opacity-100">
                    <svg className="w-3 h-3 text-black font-bold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <label htmlFor="terms" className="text-[10px] text-gray-400 font-mono">
                  I AGREE TO <span className="text-gaming-accent cursor-pointer hover:underline">SQUAD PROTOCOLS</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full relative overflow-hidden bg-white text-black font-black py-4 clip-corner-sm hover:bg-gaming-accent transition-colors group mt-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="absolute inset-0 bg-gaming-accent/0 group-hover:bg-gaming-accent transition-colors z-0"></div>
                <span className="relative z-10 flex items-center justify-center uppercase tracking-[0.2em] text-xs">
                  {loading ? 'DEPLOYING...' : 'Deploy Profile'}
                  {!loading && <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />}
                </span>
              </button>
            </form>
          </div>
        </div>

        <div className="mt-6 text-center relative z-50">
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="w-full bg-[#1a1a24] border border-white/10 hover:border-gaming-accent text-gray-400 hover:text-white py-4 clip-corner-sm transition-all group flex items-center justify-center space-x-2"
          >
            <span className="text-[10px] font-bold uppercase tracking-widest">Existing Operator?</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-gaming-accent group-hover:text-white transition-colors">Log In</span>
            <ChevronRight size={14} className="text-gaming-accent group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;