import React, { useEffect, useState } from 'react';
import { ChevronLeft, FileText, Loader2 } from 'lucide-react';
import { getTerms } from '../utils/newsStorage';

interface TermsProps {
    onBack: () => void;
}

const Terms: React.FC<TermsProps> = ({ onBack }) => {
    const [content, setContent] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadTerms();
    }, []);

    const loadTerms = async () => {
        setIsLoading(true);
        try {
            const data = await getTerms();
            setContent(data);
        } catch (error) {
            console.error("Failed to load terms UI", error);
            setContent("Failed to load terms. Please check your connection.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="pb-28 pt-6 px-4">
            {/* Header */}
            <div className="flex items-center space-x-2 mb-8 cursor-pointer" onClick={onBack}>
                <div className="p-1.5 bg-white/10 rounded hover:bg-white/20 transition-colors"><ChevronLeft size={18} /></div>
                <h1 className="text-xl font-black uppercase italic tracking-wider text-white">Terms <span className="text-gray-500">& Conditions</span></h1>
            </div>

            <div className="bg-[#0c0c12]/60 p-6 clip-corner-sm border border-white/5 min-h-[50vh] flex flex-col">
                {isLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center opacity-50">
                        <Loader2 size={32} className="mb-2 text-gaming-accent animate-spin" />
                        <p className="text-[10px] uppercase font-black tracking-widest text-gray-500">Decrypting Policies...</p>
                    </div>
                ) : content ? (
                    <div className="prose prose-invert prose-sm max-w-none">
                        <div className="whitespace-pre-wrap text-gray-300 font-mono text-xs leading-relaxed">
                            {content}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-40 opacity-50">
                        <FileText size={40} className="mb-2 text-gray-600" />
                        <p className="text-xs uppercase font-bold text-gray-500">Content Unavailable</p>
                    </div>
                )}
            </div>

            <p className="text-center text-[9px] text-gray-600 mt-6 pb-4">
                Last Updated: {new Date().toLocaleDateString()}
            </p>
        </div>
    );
};

export default Terms;
