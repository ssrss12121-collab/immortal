import React from 'react';
import { X, Youtube, ExternalLink } from 'lucide-react';

interface YouTubeViewerProps {
  youtubeId: string;
  title: string;
  type: 'live' | 'video';
  onClose: () => void;
}

const YouTubeViewer: React.FC<YouTubeViewerProps> = ({
  youtubeId,
  title,
  type,
  onClose,
}) => {
  const embedUrl = type === 'live'
    ? `https://www.youtube.com/embed/${youtubeId}?autoplay=1`
    : `https://www.youtube.com/embed/${youtubeId}?autoplay=1`;

  const watchUrl = `https://www.youtube.com/watch?v=${youtubeId}`;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/95 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-red-600 px-3 py-1.5 rounded">
            <Youtube size={18} className="text-white" />
            <span className="text-white text-xs font-bold uppercase">
              {type === 'live' ? 'LIVE' : 'VIDEO'}
            </span>
          </div>
          <h2 className="text-white font-bold text-sm line-clamp-1">{title}</h2>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={watchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Open in YouTube"
          >
            <ExternalLink size={20} className="text-gray-400 hover:text-white" />
          </a>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-400 hover:text-white" />
          </button>
        </div>
      </div>

      {/* YouTube Embed */}
      <div className="flex-1 relative bg-black">
        <iframe
          src={embedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>

      {/* Footer Info */}
      <div className="p-4 bg-black/95 border-t border-white/10">
        <p className="text-xs text-gray-500 text-center">
          Streaming from YouTube • {type === 'live' ? 'Live Stream' : 'Video'}
        </p>
      </div>
    </div>
  );
};

export default YouTubeViewer;
