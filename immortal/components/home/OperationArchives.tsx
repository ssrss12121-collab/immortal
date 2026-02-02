import React from 'react';
import { History, Copy, Award, ChevronRight } from 'lucide-react';
import { Tournament } from '../../types';
import { MatchArchiveEntry } from '../../utils/archiveStorage';

interface Props {
    items: (Tournament | MatchArchiveEntry)[];
    onSelect: (item: any) => void;
}

const OperationArchives: React.FC<Props> = ({ items, onSelect }) => (
    <div className="animate-slide-in-bottom">
        <div className="flex justify-between items-center mb-4 px-1 border-b border-white/5 pb-2 mt-10">
            <h3 className="text-lg font-black uppercase italic tracking-wider text-white flex items-center">
                <History className="text-purple-500 mr-2" size={18} />
                Operation Archives
            </h3>
        </div>
        <div className="space-y-4">
            {items.map(t => (
                <div key={t._id || t.id || Math.random().toString()} onClick={() => onSelect(t)} className="bg-[#0c0c12]/90 backdrop-blur border border-white/5 p-4 clip-corner-sm flex flex-col gap-3 hover:bg-white/5 hover:border-purple-500/40 transition-all group cursor-pointer relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-16 h-16 bg-gradient-to-bl from-purple-500/10 to-transparent pointer-events-none"></div>
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <h4 className="font-bold text-sm text-white truncate group-hover:text-purple-400 transition-colors uppercase tracking-tight">{t.title}</h4>
                            <div className="flex items-center gap-3 mt-1.5">
                                <span className="text-[9px] text-gray-500 font-mono bg-black/60 px-2 py-0.5 rounded border border-white/5 flex items-center gap-2">
                                    ID: {'originalId' in t ? (t as any).originalId : t.id}
                                </span>
                                {'originalId' in t && (
                                    <span className="text-[8px] font-black bg-purple-950/40 text-purple-300 px-2 py-0.5 rounded border border-purple-500/20 tracking-widest">ARCHIVED</span>
                                )}
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-[9px] text-green-500 font-black uppercase tracking-widest block mb-0.5">Mission Clear</span>
                            <span className="text-[9px] text-gray-500 font-mono block opacity-60 italic">{t.startTime}</span>
                        </div>
                    </div>
                    {t.matchResult?.published && (
                        <div className="bg-purple-950/20 border border-purple-500/20 px-3 py-2 clip-corner-sm flex justify-between items-center group-hover:bg-purple-900/10 transition-colors">
                            <span className="text-[9px] text-purple-400 font-black uppercase tracking-widest flex items-center gap-2">
                                <Award size={10} /> Intel Published
                            </span>
                            <span className="text-[9px] text-white font-bold flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                                Review debrief <ChevronRight size={10} className="text-purple-500" />
                            </span>
                        </div>
                    )}
                </div>
            ))}
        </div>
    </div>
);

export default React.memo(OperationArchives);
