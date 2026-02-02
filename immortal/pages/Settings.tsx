import React, { useState } from 'react';
import { ChevronLeft, LogOut, HelpCircle, FileText, Bell } from 'lucide-react';
import { UserProfile } from '../types';
import { auth } from '../utils/auth';

interface SettingsProps {
  onBack: () => void;
  onLogout: () => void;
  onNavigate: (page: string) => void;
  user: UserProfile;
}

const Settings: React.FC<SettingsProps> = ({ onBack, onLogout, onNavigate, user }) => {

  const toggle = async (key: string) => {
    const newSettings = {
      ...user.settings,
      [key]: user.settings ? !(user.settings as any)[key] : true
    };
    try {
      await auth.updateProfile({ settings: newSettings });
    } catch (error) {
      console.error("Failed to update settings", error);
    }
  };

  return (
    <div className="pb-28 pt-6 px-4">
      {/* Header */}
      <div className="flex items-center space-x-2 mb-8 cursor-pointer" onClick={onBack}>
        <div className="p-1.5 bg-white/10 rounded hover:bg-white/20 transition-colors"><ChevronLeft size={18} /></div>
        <h1 className="text-xl font-black uppercase italic tracking-wider text-white">Settings</h1>
      </div>

      <div className="space-y-4">
        {/* Support & Legal */}
        <div className="space-y-2">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-3 ml-1">General</h3>

          <button
            onClick={() => onNavigate('support')}
            className="w-full flex items-center justify-between bg-[#0c0c12]/60 p-4 clip-corner-sm border border-white/5 hover:bg-[#1a1a24] text-left group transition-colors"
          >
            <div className="flex items-center space-x-3">
              <HelpCircle size={18} className="text-gray-400 group-hover:text-gaming-accent transition-colors" />
              <span className="text-sm font-bold uppercase tracking-wider text-white">Support Center</span>
            </div>
            <ChevronLeft size={16} className="rotate-180 text-gray-600" />
          </button>

          <button
            onClick={() => onNavigate('terms')}
            className="w-full flex items-center justify-between bg-[#0c0c12]/60 p-4 clip-corner-sm border border-white/5 hover:bg-[#1a1a24] text-left group transition-colors"
          >
            <div className="flex items-center space-x-3">
              <FileText size={18} className="text-gray-400 group-hover:text-gaming-accent transition-colors" />
              <span className="text-sm font-bold uppercase tracking-wider text-white">Terms & Conditions</span>
            </div>
            <ChevronLeft size={16} className="rotate-180 text-gray-600" />
          </button>
        </div>

        {/* Notifications (Simplified) */}
        <div className="space-y-2 pt-4">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-3 ml-1">Preferences</h3>
          <div className="flex items-center justify-between bg-[#0c0c12]/60 p-4 clip-corner-sm border border-white/5" onClick={() => toggle('emailNotifs')}>
            <div className="flex items-center space-x-3">
              <Bell size={18} className="text-gray-400" />
              <span className="text-sm font-bold uppercase tracking-wider text-white">Email Notifications</span>
            </div>
            <div className={`w-8 h-4 rounded-full relative transition-colors ${user.settings?.emailNotifs ? 'bg-gaming-accent' : 'bg-gray-700'}`}>
              <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${user.settings?.emailNotifs ? 'left-4.5' : 'left-0.5'}`} style={{ left: user.settings?.emailNotifs ? '18px' : '2px' }}></div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5">
          <button
            onClick={onLogout}
            className="w-full py-4 bg-red-900/20 hover:bg-red-900/40 border border-red-900/50 clip-corner-sm text-red-500 font-bold uppercase tracking-[0.2em] text-xs flex items-center justify-center transition-all"
          >
            <LogOut size={16} className="mr-2" /> Terminate Session
          </button>
          <p className="text-center text-[9px] text-gray-600 font-mono mt-4">ID: {user.id} // VER: 2.5.0</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
