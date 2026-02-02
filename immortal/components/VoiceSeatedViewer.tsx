import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Heart,
  Flame,
  ThumbsUp,
  Zap,
  Star,
  Users,
  X,
} from 'lucide-react';
import { LiveSessionEnhanced, LiveSeat, SocketLiveStats } from '../types';
import { Socket } from 'socket.io-client';

interface VoiceSeatedViewerProps {
  session: LiveSessionEnhanced;
  userId: string;
  socket: Socket;
  onClose: () => void;
}

const VoiceSeatedViewer: React.FC<VoiceSeatedViewerProps> = ({
  session,
  userId,
  socket,
  onClose,
}) => {
  const [seats, setSeats] = useState<LiveSeat[]>(session.seats || []);
  const [viewersCount, setViewersCount] = useState(session.viewersCount || 0);
  const [peakViewers, setPeakViewers] = useState(session.peakViewers || 0);
  const [reactionCounts, setReactionCounts] = useState(session.reactionCounts);
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);

  const sessionId = session.id || session._id;
  const currentUserSeat = seats.find((s) => s.userId === userId);

  useEffect(() => {
    // Join live session
    socket.emit('join-live', { sessionId });

    // Listen for seat updates
    socket.on('voice-seats-update', (data: { seats: LiveSeat[] }) => {
      setSeats(data.seats);
    });

    // Listen for stats updates
    socket.on('session-stats-update', (data: SocketLiveStats) => {
      setViewersCount(data.viewersCount);
      if (data.peakViewers) setPeakViewers(data.peakViewers);
    });

    // Listen for reaction updates
    socket.on('live-reaction-received', (data: any) => {
      setReactionCounts(data.reactionCounts);
    });

    return () => {
      socket.emit('leave-live', { sessionId });
      socket.off('voice-seats-update');
      socket.off('session-stats-update');
      socket.off('live-reaction-received');
    };
  }, [sessionId, socket]);

  const handleJoinSeat = (position: number) => {
    if (currentUserSeat) {
      alert('You are already seated. Leave your current seat first.');
      return;
    }
    socket.emit('join-voice-seat', { sessionId, position });
  };

  const handleLeaveSeat = () => {
    if (!currentUserSeat) return;
    socket.emit('leave-voice-seat', { sessionId });
  };

  const handleReaction = (type: 'like' | 'love' | 'fire' | 'clap' | 'wow') => {
    socket.emit('send-live-reaction', { sessionId, type });
  };

  const reactionIcons = {
    like: ThumbsUp,
    love: Heart,
    fire: Flame,
    clap: Zap,
    wow: Star,
  };

  // Generate seat grid (2 rows of 6 for 12 seats)
  const seatPositions = Array.from({ length: session.maxSeats }, (_, i) => i + 1);

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl w-full max-w-5xl border border-gray-700 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-gradient-to-r from-orange-500/10 to-red-500/10">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-1">{session.title}</h2>
            <p className="text-sm text-gray-400">
              Hosted by {session.hostName || 'Unknown'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg">
              <Users size={20} className="text-orange-500" />
              <span className="text-white font-medium">{viewersCount}</span>
              <span className="text-gray-400 text-sm">viewers</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X size={24} className="text-gray-400 hover:text-white" />
            </button>
          </div>
        </div>

        {/* Seats Grid */}
        <div className="p-8">
          <div className="grid grid-cols-6 gap-4 mb-8">
            {seatPositions.map((position) => {
              const seat = seats.find((s) => s.position === position);
              const isOccupied = !!seat;
              const isCurrentUser = seat?.userId === userId;

              return (
                <div
                  key={position}
                  onClick={() => !isOccupied && handleJoinSeat(position)}
                  className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all ${
                    isOccupied
                      ? isCurrentUser
                        ? 'bg-orange-500/20 border-orange-500'
                        : 'bg-gray-700 border-gray-600'
                      : 'bg-gray-800/50 border-gray-700 hover:border-orange-500/50 hover:bg-gray-700/50'
                  }`}
                >
                  {isOccupied ? (
                    <>
                      {/* Avatar or Icon */}
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mb-2">
                        {seat.avatar ? (
                          <img
                            src={seat.avatar}
                            alt={seat.username || seat.ign}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-white font-bold text-lg">
                            {(seat.username || seat.ign || 'U')[0].toUpperCase()}
                          </span>
                        )}
                      </div>
                      {/* Name */}
                      <p className="text-xs text-white font-medium text-center truncate w-full px-2">
                        {seat.username || seat.ign || 'User'}
                      </p>
                      {/* Mic Status */}
                      <div className="mt-1">
                        {seat.micActive ? (
                          <Mic
                            size={14}
                            className={`${
                              seat.isSpeaking ? 'text-green-500' : 'text-gray-400'
                            }`}
                          />
                        ) : (
                          <MicOff size={14} className="text-red-500" />
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center mb-2">
                        <Users size={20} className="text-gray-500" />
                      </div>
                      <p className="text-xs text-gray-500">Empty Seat</p>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* User Controls */}
          {currentUserSeat && (
            <div className="bg-gray-800 rounded-xl p-4 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                  <Mic size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-medium">You are seated</p>
                  <p className="text-xs text-gray-400">
                    Position {currentUserSeat.position}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLeaveSeat}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
              >
                Leave Seat
              </button>
            </div>
          )}

          {/* Reactions */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-white font-bold mb-4">Send Reaction</h3>
            <div className="flex items-center justify-around">
              {Object.entries(reactionIcons).map(([type, Icon]) => (
                <button
                  key={type}
                  onClick={() =>
                    handleReaction(type as 'like' | 'love' | 'fire' | 'clap' | 'wow')
                  }
                  className="flex flex-col items-center gap-2 p-3 hover:bg-gray-700 rounded-lg transition-colors group"
                >
                  <Icon
                    size={28}
                    className={`${
                      type === 'like'
                        ? 'text-blue-500'
                        : type === 'love'
                        ? 'text-red-500'
                        : type === 'fire'
                        ? 'text-orange-500'
                        : type === 'clap'
                        ? 'text-yellow-500'
                        : 'text-purple-500'
                    } group-hover:scale-110 transition-transform`}
                  />
                  <span className="text-xs text-gray-400 font-medium">
                    {reactionCounts[type as keyof typeof reactionCounts] || 0}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Stats */}
        <div className="px-6 py-4 border-t border-gray-700 bg-gray-900/50 flex items-center justify-between">
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <div>
              <span className="text-gray-500">Peak Viewers:</span>{' '}
              <span className="text-white font-medium">{peakViewers}</span>
            </div>
            <div>
              <span className="text-gray-500">Seated:</span>{' '}
              <span className="text-white font-medium">
                {seats.length}/{session.maxSeats}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-red-500 font-medium text-sm">LIVE</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceSeatedViewer;
