import React from 'react';
import { Zap, ChevronRight } from 'lucide-react';
import { Tournament } from '../../types';

interface Props {
    deployments: Tournament[];
    onSelect: (t: Tournament) => void;
}

const DeploymentsList: React.FC<Props> = ({ deployments, onSelect }) => (
    <div>
        <div className="flex justify-between items-center mb-4 px-1 border-b border-white/5 pb-2">
            <h3 className="text-lg font-black uppercase italic tracking-wider text-white flex items-center">
                <Zap className="text-gaming-primary mr-2" size={18} />
                Deployments
            </h3>
        </div>
        <div className="space-y-4">
            {deployments.map(t => (
                <div key={t._id || t.id || Math.random()} onClick={() => onSelect(t)} className="bg-[#0c0c12]/80 backdrop-blur border border-white/5 p-3 clip-corner-sm flex items-center space-x-4 hover:bg-white/5 hover:border-gaming-accent/30 transition-all group cursor-pointer relative overflow-hidden cyber-border-green">
                    <div className="absolute inset-y-0 left-0 w-1 bg-gaming-primary/50 group-hover:bg-gaming-accent transition-all"></div>
                    <div className="w-16 h-12 clip-corner-sm overflow-hidden relative flex-shrink-0 border border-white/10">
                        <img src={t.image} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-all group-hover:scale-110" alt="" />
                        <div className="absolute inset-0 bg-gaming-primary/20 mix-blend-overlay"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-white truncate group-hover:text-gaming-accent transition-colors uppercase tracking-tight">{t.title}</h4>
                        <div className="flex items-center space-x-2 text-[10px] text-gray-400 mt-1 font-mono uppercase">
                            <span className="flex items-center text-gaming-primary font-black"><span className="w-1 h-1 bg-gaming-primary rounded-full mr-1.5 animate-pulse"></span>{t.map}</span>
                            <span className="opacity-20">//</span>
                            <span className="text-gray-500 font-bold">{t.category}</span>
                        </div>
                    </div>
                    <div className="pr-1 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                        <ChevronRight size={16} className="text-gaming-accent" />
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export default React.memo(DeploymentsList);
