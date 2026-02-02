
export type PlayerRole = 'Rusher' | 'Supporter' | 'Nader' | 'Sniper' | 'Guest';

export interface UserProfile {
  id: string;
  _id?: string;
  playerId?: string;
  name: string;
  ign: string; // In-Game Name
  avatarUrl?: string; // Added for profile picture upload
  role: PlayerRole;
  experience: string; // e.g., "2 years"
  age: number;
  email: string;
  membership?: {
    planId: string;
    expiresAt: string;
    type: 'individual' | 'team';
    challengesUsed: number;
    lastChallengeReset: string;
  };
  matchesPlayed?: number;
  booyahs?: number;
  winRate?: string;
  followersCount?: number;
  followingCount?: number;
  isOnline?: boolean;
  isFollowed?: boolean;
  stats: {
    matches: number;
    kills: number;
    wins: number;
    kdRatio: number;
    rankPoints: number;
    badge: 'Bronze' | 'Silver' | 'Gold' | 'Diamond' | 'Grandmaster' | 'Verified' | 'Legend';
  };
  country: string;
  district: string;
  isActive?: boolean;
  matchHistory?: {
    tournamentId: string;
    tournamentTitle: string;
    position: number;
    kills: number;
    prize: number;
    timestamp: string;
  }[];
  settings?: {
    emailNotifs: boolean;
  };
}

export interface Team {
  id: string;
  _id?: string;
  name: string; // Full Name
  shortName: string; // Short Name (Tag)
  captainId: string; // Manager
  leaderId?: string; // Leader
  members: UserProfile[]; // Active members
  logoUrl: string;
  bannerUrl?: string; // Team background banner
  country: string;
  district: string;
  rankPoints: number;
  stats?: {
    matches: number;
    wins: number;
    totalKills: number;
    mvpId?: string; // Team's most frequent MVP
  };
  matchHistory?: {
    tournamentId: string;
    tournamentTitle: string;
    position: number;
    totalKills: number;
    prize: number;
    timestamp: string;
  }[];
  createdAt?: string;
}

export interface TeamInvite {
  id: string;
  _id?: string;
  teamId: string;
  teamName: string;
  teamLogo: string;
  senderId: string; // Captain ID
  receiverUid: string; // The UID of the player being invited
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  timestamp: string;
}

export interface Tournament {
  id: string;
  _id?: string;
  title: string;
  category: 'Solo' | 'Duo' | 'Squad';
  isPremium: boolean;
  sponsors?: string[];
  prizePool: number;
  prizeList?: number[]; // [0] = 1st, [1] = 2nd, [2] = 3rd...
  startTime: string;
  map: 'Bermuda' | 'Purgatory' | 'Kalahari';
  slots: number;
  filledSlots: number;
  status: 'Open' | 'Live' | 'Completed';
  image: string;
  rules?: string; // Rich text or simple string for rules
  videoUrl?: string; // URL for tournament video (YouTube or direct link)
  roadmap?: string; // URL to roadmap image or text
  perKillCommission?: number; // For solo matches
  isUnlimited?: boolean; // For matches with unlimited slots where groups are used
  featured?: boolean; // Show on Home Banner
  showOnDeployments?: boolean; // Show on Home "Deployments" list
  groups?: {
    id: string;
    name: string;
    teams: string[]; // Team IDs or Player IDs
    roomId?: string;
    roomPassword?: string;
    credentialsPublished?: boolean;
    schedule?: string;
  }[];
  participants?: {
    id: string; // User ID or Team ID
    name: string;
    avatar?: string;
    isTeam: boolean;
    members?: { id: string; name: string; }[]; // For teams
    groupId?: string; // For Big Match grouping
  }[];
  roomId?: string;
  roomPassword?: string;
  credentialsPublished?: boolean;
  matchResult?: {
    published: boolean;
    publishBanner?: boolean;
    mvpId?: string;
    scores: {
      participantId: string; // Team ID or Player ID
      kills: number; // For Teams, this is total kills
      position: number;
      totalPoints: number;
      memberStats?: { // Detailed stats for each member in a team match
        id: string;
        name: string;
        kills: number;
      }[];
    }[];
    eventLogs?: {
      action: 'STARTED' | 'COMPLETED' | 'RESTARTED' | 'DELAYED' | 'REMATCH';
      timestamp: string;
      details?: string;
    }[];
  }
}

export interface Challenge {
  id: string;
  _id?: string;
  challengerName: string;
  challengerRole: PlayerRole;
  type: '1v1' | 'Squad';
  wager?: number; // Kept as optional but primarily 0 now
  map: string;
  status: 'Open' | 'Direct' | 'PendingAdmin' | 'Accepted'; // Accepted means approved by admin and converted to match
  message: string;
  time: string;
  proposedTime?: string;
  targetId?: string;
  acceptorId?: string;
  acceptorName?: string;
  acceptorRole?: string;
}

export interface Notification {
  id: string;
  _id?: string;
  userId: string; // Target user
  title?: string;
  message: string;
  type: 'CHALLENGE' | 'SYSTEM' | 'MATCH' | 'TEAM_INVITE' | 'ANNOUNCEMENT';
  read: boolean;
  timestamp: string;
  data?: any; // Extra data like challengeId
  image?: string; // Base64 or URL
}

export interface LiveStream {
  id: string;
  title: string;
  url: string;
  status: 'Live' | 'Offline';
  viewers: string;
  active?: boolean;
  thumbnail?: string;
  date?: string;
  duration?: string;
}

export interface LiveConfig {
  streams: LiveStream[];
  archive: LiveStream[];
}

export interface NewsItem {
  id: string;
  _id?: string;
  title: string;
  content: string; // Brief or full hex code/content
  image: string;
  type: 'Winner' | 'Update' | 'Event' | 'Maintenance' | 'Community';
  date?: string;
  important?: boolean;
}

export interface MVPItem {
  id: string;
  _id?: string;
  userId?: string; // Link to actual user profile
  name: string;
  image: string; // Banner image
  team?: string;
  role?: string;
  stats?: {
    kills: number;
    matches: number;
    wins: number;
  };
  description: string;
}

export interface Transaction {
  id: string;
  _id?: string;
  userId: string;
  userDetails?: {
    name: string;
    ign: string;
    playerId: string;
  };
  type: 'deposit' | 'withdrawal';
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  method: string;
  accountNumber?: string;
  accountHolderName?: string;
  transactionId?: string;
  screenshotUrl?: string;
  createdAt: string;
  processedAt?: string;
  processedBy?: string;
  notes?: string;
}

export interface Banner {
  id: string;
  _id?: string;
  image: string;
  title: string;
  description: string;
  badgeText?: string;
  videoUrl?: string;
  type?: 'HERO' | 'AD';
  isActive?: boolean;
  order?: number;
}
export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: 'super_admin' | 'tournament_admin' | 'challenge_admin' | 'banner_admin' | 'content_admin' | 'user_admin' | 'live_admin';
  permissions: {
    tournaments: string[];
    canManageChallenges: boolean;
    canManageUsers: boolean;
    canManageTransactions: boolean;
    canManageBanners: boolean;
    canManageContent: boolean;
    canManageLive: boolean;
  };
  isActive: boolean;
  token?: string;
  lastLogin?: string;
}

export interface MembershipPlan {
  id: string;
  _id?: string;
  name: string;
  price: number;
  durationMonths?: number;
  durationDays?: number;
  challengeLimit: number;
  discountPercentage?: number;
  type: 'individual' | 'team';
  features: string[];
  isActive: boolean;
}

// ============================================
// GUILD SYSTEM TYPES
// ============================================

export interface GuildPermissions {
  canPostInChannels: boolean;
  canEditChannels: boolean;
  canDeleteMembers: boolean;
  canManageGroups: boolean;
  canStartLive: boolean;
  canCreateChannels: boolean;
  canCreateGroups: boolean;
  canManageAdmins: boolean;
}

export interface GuildMember {
  userId: string;
  username?: string;
  ign?: string;
  avatar?: string;
  role: 'Owner' | 'Admin' | 'Member';
  permissions: GuildPermissions;
  joinedAt: string;
}

export interface Guild {
  id: string;
  _id?: string;
  name: string;
  customLink: string; // TR.prefix format
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  ownerId: string;
  members: GuildMember[];
  memberCount: number;
  channels: string[]; // Channel IDs
  groups: string[]; // Group IDs
  followers: string[]; // User IDs
  followerCount: number;
  isVerified: boolean;
  verificationSubscriptionId?: string;
  verificationExpiresAt?: string;
  totalPosts: number;
  totalLives: number;
  isActive: boolean;
  createdAt: string;
}

export interface ChannelPermissions {
  canPost: string[]; // User IDs
  canEditMessages: string[]; // User IDs
  canDeleteMembers: string[]; // User IDs
}

export interface Channel {
  id: string;
  _id?: string;
  guildId: string;
  name: string;
  description?: string;
  adminUserIds: string[];
  permissions: ChannelPermissions;
  activeLiveSessionId?: string;
  isLive: boolean;
  totalPosts: number;
  totalLives: number;
  isActive: boolean;
  createdAt: string;
}

export interface GroupMember {
  userId: string;
  username?: string;
  ign?: string;
  avatar?: string;
  role: 'Owner' | 'Admin' | 'Member';
  permissions: {
    canPost: boolean;
    canCall: boolean;
    canInvite: boolean;
  };
  joinedAt: string;
}

export interface Group {
  id: string;
  _id?: string;
  guildId: string;
  name: string;
  description?: string;
  type: 'Public' | 'Private';
  ownerId: string;
  members: GroupMember[];
  memberCount: number;
  inviteCode?: string;
  allowMessaging: boolean;
  activeCallId?: string;
  activeLiveSessionId?: string;
  isLive: boolean;
  isInCall: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface LiveSeat {
  userId: string;
  username?: string;
  ign?: string;
  avatar?: string;
  position: number; // 1-12
  isSpeaking: boolean;
  micActive: boolean;
  joinedAt: string;
}

export interface LiveReaction {
  userId: string;
  type: 'like' | 'love' | 'fire' | 'clap' | 'wow';
  timestamp: string;
}

export interface LiveSessionEnhanced {
  id: string;
  _id?: string;
  hostId: string;
  hostName?: string;
  hostAvatar?: string;
  title: string;
  description?: string;
  liveType: 'Video' | 'VoiceSeated' | 'VoiceFree';
  sourceType: 'Guild' | 'Channel' | 'Group' | 'Public';
  sourceId?: string;
  sourceName?: string;
  thumbnailUrl?: string;
  isPublic: boolean;
  status: 'Scheduled' | 'Live' | 'Ended';
  startedAt?: string;
  endedAt?: string;
  duration?: number; // seconds
  // Voice Seated specific
  seats: LiveSeat[];
  maxSeats: number; // 6-12
  // Viewer tracking
  viewers: string[]; // User IDs
  viewersCount: number;
  peakViewers: number;
  // Reactions
  reactions: LiveReaction[];
  reactionCounts: {
    like: number;
    love: number;
    fire: number;
    clap: number;
    wow: number;
  };
  allowReactions: boolean;
  allowComments: boolean;
  createdAt: string;
}

export interface PostReaction {
  userId: string;
  type: 'like' | 'love' | 'fire' | 'clap' | 'wow' | 'sad' | 'angry';
  timestamp: string;
}

export interface GuildPost {
  id: string;
  _id?: string;
  guildId: string;
  channelId?: string; // null = guild announcement
  authorId: string;
  authorName?: string;
  authorAvatar?: string;
  content: string;
  mediaUrls: string[];
  reactions: PostReaction[];
  reactionCounts: {
    like: number;
    love: number;
    fire: number;
    clap: number;
    wow: number;
    sad: number;
    angry: number;
  };
  totalReactions: number;
  commentCount: number;
  isPinned: boolean;
  isEdited: boolean;
  editedAt?: string;
  isActive: boolean;
  createdAt: string;
}

// Socket Event Types
export interface SocketLiveStats {
  viewersCount: number;
  peakViewers?: number;
}

export interface SocketLiveReaction {
  userId: string;
  type: 'like' | 'love' | 'fire' | 'clap' | 'wow';
  reactionCounts: {
    like: number;
    love: number;
    fire: number;
    clap: number;
    wow: number;
  };
}

export interface SocketLiveComment {
  userId: string;
  senderName: string;
  text: string;
  timestamp: Date;
}

export interface SocketChannelMessage {
  userId: string;
  senderName: string;
  text: string;
  timestamp: Date;
}

export interface SocketGuildNotification {
  type: 'START' | 'END' | 'UPDATE';
  guildId?: string;
  channelId?: string;
  sessionId?: string;
  title?: string;
  liveType?: string;
}

