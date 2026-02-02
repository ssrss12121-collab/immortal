const YouTubeContent = require('../models/YouTubeContent');

// Get all active YouTube content
exports.getActiveContent = async (req, res) => {
  try {
    const { type } = req.query; // 'live', 'video', or null for all
    
    const content = await YouTubeContent.getActiveContent(type);
    
    res.json({
      success: true,
      content,
      count: content.length
    });
  } catch (error) {
    console.error('Get active content error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch content',
      error: error.message
    });
  }
};

// Get single content by ID
exports.getContentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const content = await YouTubeContent.findById(id);
    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }
    
    // Check and deactivate if expired
    await content.checkAndDeactivate();
    
    // Increment view count
    content.viewCount++;
    await content.save();
    
    res.json({
      success: true,
      content
    });
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch content',
      error: error.message
    });
  }
};

// Create new YouTube content (Admin only)
exports.createContent = async (req, res) => {
  try {
    const { title, youtubeUrl, type, duration } = req.body;
    
    // Validate required fields
    if (!title || !youtubeUrl || !type) {
      return res.status(400).json({
        success: false,
        message: 'Title, YouTube URL, and type are required'
      });
    }
    
    // Validate type
    if (!['live', 'video'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type must be either "live" or "video"'
      });
    }
    
    // Extract YouTube ID
    const youtubeId = YouTubeContent.extractYouTubeId(youtubeUrl);
    if (!youtubeId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid YouTube URL'
      });
    }
    
    // Create content
    const content = new YouTubeContent({
      title,
      youtubeUrl,
      youtubeId,
      type,
      duration: duration || 0,
      createdBy: req.user?.id || 'admin'
    });
    
    await content.save();
    
    res.status(201).json({
      success: true,
      message: 'Content created successfully',
      content
    });
  } catch (error) {
    console.error('Create content error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create content',
      error: error.message
    });
  }
};

// Update YouTube content (Admin only)
exports.updateContent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, youtubeUrl, type, duration, isActive } = req.body;
    
    const content = await YouTubeContent.findById(id);
    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }
    
    // Update fields
    if (title) content.title = title;
    if (type && ['live', 'video'].includes(type)) content.type = type;
    if (typeof isActive === 'boolean') content.isActive = isActive;
    
    // Update YouTube URL if provided
    if (youtubeUrl && youtubeUrl !== content.youtubeUrl) {
      const youtubeId = YouTubeContent.extractYouTubeId(youtubeUrl);
      if (!youtubeId) {
        return res.status(400).json({
          success: false,
          message: 'Invalid YouTube URL'
        });
      }
      content.youtubeUrl = youtubeUrl;
      content.youtubeId = youtubeId;
      content.thumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
    }
    
    // Update duration
    if (typeof duration === 'number') {
      content.duration = duration;
      if (duration > 0) {
        const expiryDate = new Date();
        expiryDate.setMinutes(expiryDate.getMinutes() + duration);
        content.expiresAt = expiryDate;
      } else {
        content.expiresAt = null;
      }
    }
    
    await content.save();
    
    res.json({
      success: true,
      message: 'Content updated successfully',
      content
    });
  } catch (error) {
    console.error('Update content error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update content',
      error: error.message
    });
  }
};

// Delete YouTube content (Admin only)
exports.deleteContent = async (req, res) => {
  try {
    const { id } = req.params;
    
    const content = await YouTubeContent.findByIdAndDelete(id);
    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Content deleted successfully'
    });
  } catch (error) {
    console.error('Delete content error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete content',
      error: error.message
    });
  }
};

// Get all content (Admin only - includes inactive)
exports.getAllContent = async (req, res) => {
  try {
    const content = await YouTubeContent.find().sort({ createdAt: -1 });
    
    res.json({
      success: true,
      content,
      count: content.length
    });
  } catch (error) {
    console.error('Get all content error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch content',
      error: error.message
    });
  }
};
