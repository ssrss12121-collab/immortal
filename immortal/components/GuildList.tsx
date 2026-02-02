import React, { useState, useEffect } from 'react';
import { Plus, Users, MessageSquare, Radio, ChevronRight, Crown, Shield } from 'lucide-react';
import { Guild } from '../types';
import GuildCreationModal from './GuildCreationModal';

interface GuildListProps {
  userId: string;
  userToken: string;
}

const GuildList: React.FC<GuildListProps> = ({ userId, userToken }) => {
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [followedGuilds, setFollowedGuilds] = useState<Guild[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'my' | 'followed'>('my');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchGuilds();
  }, []);

  const fetchGuilds = async () => {
    setLoading(true);
    try {
      // Fetch user's guilds
      const myGuildsRes = await fetch(
        `${import.meta.env.VITE_API_URL}/api/guilds/my-guilds`,
        {
          headers: { Authorization: `Bearer ${userToken}` },
        }
      );
      if (myGuildsRes.ok) {
        const data = await myGuildsRes.json();
        setGuilds(data.guilds || []);
      }

      // Fetch followed guilds
      const followedRes = await fetch(
        `${import.meta.env.VITE_API_URL}/api/guilds/followed`,
        {
          headers: { Authorization: `Bearer ${userToken}` },
        }
      );
      if (followedRes.ok) {
        const data = await followedRes.json();
        setFollowedGuilds(data.guilds || []);
      }
    } catch (error) {
      console.error('Error fetching guilds:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGuildCreated = (newGuild: Guild) => {
    setGuilds([newGuild, ...guilds]);
    setActiveTab('my');
  };

  const displayGuilds = activeTab === 'my' ? guilds : followedGuilds;

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-white">Guilds</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg font-medium transition-all"
        >
          <Plus size={20} />
          Create Guild
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-gray-800 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('my')}
          className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === 'my'
              ? 'bg-orange-500 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          My Guilds ({guilds.length})
        </button>
        <button
          onClick={() => setActiveTab('followed')}
          className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === 'followed'
              ? 'bg-orange-500 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Following ({followedGuilds.length})
        </button>
      </div>

      {/* Guild List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : displayGuilds.length === 0 ? (
        <div className="text-center py-20 bg-gray-800/50 rounded-xl border border-gray-700">
          <Users size={48} className="mx-auto mb-4 text-gray-600" />
          <h3 className="text-xl font-bold text-white mb-2">
            {activeTab === 'my' ? 'No Guilds Yet' : 'Not Following Any Guilds'}
          </h3>
          <p className="text-gray-400 mb-6">
            {activeTab === 'my'
              ? 'Create your first guild to get started'
              : 'Discover and follow guilds to see them here'}
          </p>
          {activeTab === 'my' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg font-medium transition-all"
            >
              Create Your First Guild
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayGuilds.map((guild) => {
            const isOwner = guild.ownerId === userId;
            const member = guild.members.find((m) => m.userId === userId);
            const isAdmin = member?.role === 'Admin';

            return (
              <div
                key={guild.id || guild._id}
                className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 hover:border-orange-500/50 transition-all cursor-pointer overflow-hidden group"
              >
                {/* Banner/Logo */}
                <div className="h-32 bg-gradient-to-br from-orange-500/20 to-red-500/20 relative overflow-hidden">
                  {guild.bannerUrl ? (
                    <img
                      src={guild.bannerUrl}
                      alt={guild.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Users size={48} className="text-gray-600" />
                    </div>
                  )}
                  {guild.isVerified && (
                    <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-1.5">
                      <Shield size={16} className="text-white" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white group-hover:text-orange-500 transition-colors">
                        {guild.name}
                      </h3>
                      <p className="text-sm text-gray-400">{guild.customLink}</p>
                    </div>
                    {isOwner && (
                      <div className="bg-orange-500/20 border border-orange-500/50 rounded px-2 py-1">
                        <Crown size={14} className="text-orange-500" />
                      </div>
                    )}
                    {isAdmin && !isOwner && (
                      <div className="bg-purple-500/20 border border-purple-500/50 rounded px-2 py-1">
                        <Shield size={14} className="text-purple-500" />
                      </div>
                    )}
                  </div>

                  {guild.description && (
                    <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                      {guild.description}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                    <div className="flex items-center gap-1">
                      <Users size={14} />
                      <span>{guild.memberCount} members</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare size={14} />
                      <span>{guild.totalPosts} posts</span>
                    </div>
                    {guild.totalLives > 0 && (
                      <div className="flex items-center gap-1">
                        <Radio size={14} className="text-red-500" />
                        <span>{guild.totalLives} lives</span>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <button className="w-full flex items-center justify-between px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors group">
                    <span className="text-sm font-medium text-white">
                      {activeTab === 'my' ? 'Manage Guild' : 'View Guild'}
                    </span>
                    <ChevronRight
                      size={16}
                      className="text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all"
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Guild Modal */}
      <GuildCreationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleGuildCreated}
        userId={userId}
        userToken={userToken}
      />
    </div>
  );
};

export default GuildList;
