import React from 'react';
import { X, Trophy, Crosshair, Award, Shield, Skull, ChevronRight } from 'lucide-react';
import { MVPItem } from '../types';

interface MVPDetailsModalProps {
    mvp: MVPItem;
    onClose: () => void;
    onViewProfile?: (userId: string) => void;
}

const MVPDetailsModal: React.FC<MVPDetailsModalProps> = ({ mvp, onClose, onViewProfile }) => {
    if (!mvp) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#0c0c12] border-x-0 border-y-0 md:border border-white/10 w-full max-w-lg h-full md:h-auto overflow-y-auto md:rounded-lg rounded-none relative shadow-2xl animate-in zoom-in-95 duration-200">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 p-2 bg-black/50 text-white rounded-full hover:bg-white/20 transition-colors"
                >
                    <X size={20} />
                </button>

                {/* Header Image */}
                <div className="h-48 relative">
                    <img src={mvp.image} alt={mvp.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c12] via-transparent to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-6">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="bg-gaming-accent/20 text-gaming-accent border border-gaming-accent/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">
                                MVP Spotlight
                            </span>
                        </div>
                        <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter">{mvp.name}</h2>
                        <p className="text-gaming-accent font-bold uppercase tracking-wider text-sm">{mvp.team} // {mvp.role}</p>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-white/5 border border-white/10 p-3 rounded text-center">
                            <Skull size={20} className="text-red-500 mx-auto mb-1" />
                            <div className="text-2xl font-bold text-white">{mvp.stats?.kills}</div>
                            <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Eliminations</div>
                        </div>
                        <div className="bg-white/5 border border-white/10 p-3 rounded text-center">
                            <Trophy size={20} className="text-gaming-accent mx-auto mb-1" />
                            <div className="text-2xl font-bold text-white">{mvp.stats?.wins}</div>
                            <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Victories</div>
                        </div>
                        <div className="bg-white/5 border border-white/10 p-3 rounded text-center">
                            <Crosshair size={20} className="text-blue-500 mx-auto mb-1" />
                            <div className="text-2xl font-bold text-white">{mvp.stats?.matches}</div>
                            <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Matches</div>
                        </div>
                    </div>

                    {/* Bio */}
                    <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Shield size={14} /> Player Intel
                        </h3>
                        <p className="text-gray-300 text-sm leading-relaxed border-l-2 border-gaming-accent pl-4">
                            {mvp.description || "No additional intel available for this operative."}
                        </p>
                    </div>

                    {/* Footer */}
                    <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                        <span className="text-[10px] text-gray-600 font-mono">ID: {mvp.id}</span>
                        {mvp.userId && onViewProfile && (
                            <button
                                onClick={() => onViewProfile(mvp.userId!)}
                                className="text-gaming-accent text-xs font-bold uppercase hover:underline flex items-center gap-1"
                            >
                                View Full Profile <ChevronRight size={12} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MVPDetailsModal;
