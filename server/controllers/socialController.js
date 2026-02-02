const Follow = require('../models/Follow');
const User = require('../models/User');

// @desc    Follow a user
// @route   POST /api/social/follow/:id
// @access  Private
exports.followUser = async (req, res) => {
    try {
        const targetUserId = req.params.id;
        const followerId = req.user.id;

        if (targetUserId === followerId) {
            return res.status(400).json({ message: "You cannot follow yourself" });
        }

        // Check if user exists
        const userToFollow = await User.findById(targetUserId);
        if (!userToFollow) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if already following
        const existingFollow = await Follow.findOne({ followerId, followingId: targetUserId });
        if (existingFollow) {
            return res.status(400).json({ message: "Already following this user" });
        }

        const follow = new Follow({
            followerId,
            followingId: targetUserId
        });

        await follow.save();

        res.status(200).json({ message: "Successfully followed user" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Unfollow a user
// @route   POST /api/social/unfollow/:id
// @access  Private
exports.unfollowUser = async (req, res) => {
    try {
        const targetUserId = req.params.id;
        const followerId = req.user.id;

        const result = await Follow.findOneAndDelete({ followerId, followingId: targetUserId });

        if (!result) {
            return res.status(400).json({ message: "You are not following this user" });
        }

        res.status(200).json({ message: "Successfully unfollowed user" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get follow stats for a user
// @route   GET /api/social/stats/:id
// @access  Public
exports.getFollowStats = async (req, res) => {
    try {
        const userId = req.params.id;

        const followersCount = await Follow.countDocuments({ followingId: userId });
        const followingCount = await Follow.countDocuments({ followerId: userId });

        res.status(200).json({ followersCount, followingCount });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
