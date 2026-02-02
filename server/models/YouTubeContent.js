const mongoose = require('mongoose');

const youtubeContentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  youtubeUrl: {
    type: String,
    required: true,
    trim: true,
  },
  youtubeId: {
    type: String, // Extracted from URL for embedding
    required: true,
  },
  type: {
    type: String,
    enum: ['live', 'video'],
    required: true,
  },
  thumbnailUrl: {
    type: String,
    default: function() {
      // Auto-generate YouTube thumbnail URL
      return `https://img.youtube.com/vi/${this.youtubeId}/maxresdefault.jpg`;
    }
  },
  duration: {
    type: Number, // in minutes, 0 = unlimited
    default: 0,
  },
  expiresAt: {
    type: Date,
    default: null, // null = unlimited
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  viewCount: {
    type: Number,
    default: 0,
  },
  createdBy: {
    type: String, // Admin ID
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for querying active content
youtubeContentSchema.index({ isActive: 1, type: 1, expiresAt: 1 });

// Virtual to check if content is expired
youtubeContentSchema.virtual('isExpired').get(function() {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
});

// Method to auto-deactivate if expired
youtubeContentSchema.methods.checkAndDeactivate = function() {
  if (this.isExpired && this.isActive) {
    this.isActive = false;
    return this.save();
  }
  return Promise.resolve(this);
};

// Static method to get active content
youtubeContentSchema.statics.getActiveContent = async function(type = null) {
  const query = { isActive: true };
  
  // Filter by type if specified
  if (type && ['live', 'video'].includes(type)) {
    query.type = type;
  }
  
  const content = await this.find(query).sort({ createdAt: -1 });
  
  // Check and deactivate expired content
  const activeContent = [];
  for (const item of content) {
    await item.checkAndDeactivate();
    if (item.isActive) {
      activeContent.push(item);
    }
  }
  
  return activeContent;
};

// Helper to extract YouTube ID from URL
youtubeContentSchema.statics.extractYouTubeId = function(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/live\/([^&\n?#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
};

// Pre-save hook to calculate expiresAt
youtubeContentSchema.pre('save', function(next) {
  if (this.isNew && this.duration > 0) {
    const expiryDate = new Date();
    expiryDate.setMinutes(expiryDate.getMinutes() + this.duration);
    this.expiresAt = expiryDate;
  }
  next();
});

module.exports = mongoose.model('YouTubeContent', youtubeContentSchema);
