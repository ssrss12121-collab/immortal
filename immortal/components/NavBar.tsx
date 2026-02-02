import React from 'react';
import { Home, Users, Play, User, LayoutGrid, MessageSquare, Gamepad2 } from 'lucide-react';

interface NavBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const NavBar: React.FC<NavBarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'home', icon: Home, label: 'HOME' },
    { id: 'game', icon: Gamepad2, label: 'GAME' },
    { id: 'messenger', icon: MessageSquare, label: 'MESSAGE' },
    { id: 'play', icon: Play, label: 'LIVE', isMain: true },
    { id: 'guild', icon: LayoutGrid, label: 'GUILD' },
    { id: 'rank', icon: Users, label: 'RANKING' },
    { id: 'profile', icon: User, label: 'PROFILE' },
  ];

  return (
    <div id="bottom-nav" className="fixed bottom-0 left-0 right-0 h-[88px] z-50 px-2 flex justify-center pointer-events-none">
      {/* Background shape */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-black/95 border-t border-white/5 pointer-events-auto shadow-[0_-5px_30px_rgba(0,0,0,0.8)]">
      </div>

      <div className="relative w-full max-w-md flex justify-around items-end pb-3 pointer-events-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;

          if (item.isMain) {
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="relative -top-10 group"
              >
                {/* Premium Hexagon-ish shape for Play button */}
                <div className={`w-16 h-16 p-[2px] clip-corner shadow-[0_0_15px_rgba(0,223,130,0.3)] transition-transform duration-300 ${isActive ? 'scale-110' : 'scale-100'}`}>
                  <div className={`w-full h-full flex items-center justify-center clip-corner transition-all duration-300 relative overflow-hidden ${isActive ? 'bg-gaming-accent' : 'bg-[#1a1a24] border border-white/10'}`}>
                    {isActive && <div className="absolute inset-0 bg-white/20 animate-pulse"></div>}
                    <Play size={28} className={isActive ? 'text-black fill-current z-10' : 'text-gray-400 ml-1 z-10'} />
                  </div>
                </div>
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-16 h-1 bg-gaming-accent blur-[10px] rounded-full opacity-60"></div>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex-1 flex flex-col items-center justify-center h-[72px] space-y-1 relative group transition-all duration-300 min-w-0`}
            >
              {/* Active Background Glow */}
              <div className={`absolute top-0 w-10 h-10 bg-gaming-accent/10 rounded-xl transition-all duration-300 border border-transparent ${isActive ? 'opacity-100 translate-y-0 border-gaming-accent/20 bg-gaming-accent/18 shadow-[0_0_15px_rgba(0,223,130,0.1)]' : 'opacity-0 translate-y-2'}`}></div>

              <item.icon
                size={20}
                strokeWidth={isActive ? 2.5 : 2}
                className={`relative z-10 transition-all duration-200 ${isActive ? 'text-gaming-accent drop-shadow-[0_0_8px_rgba(0,223,130,0.6)] -translate-y-0.5' : 'text-gray-500 group-hover:text-gray-300'}`}
              />
              <span className={`text-[7.5px] uppercase font-black tracking-tight relative z-10 transition-all text-center leading-none ${isActive ? 'text-white' : 'text-gray-600'}`}>
                {item.label}
              </span>

              {/* Green Dot Indicator */}
              <div className={`absolute bottom-2 w-1.5 h-1.5 bg-gaming-accent rounded-full shadow-[0_0_8px_#00df82] transition-all duration-300 ${isActive ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-50'}`}></div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default NavBar;
