const express = require('express');
const router = express.Router();
const guildController = require('../controllers/guildController');
const { protect } = require('../middleware/authMiddleware');

// Guild CRUD
router.post('/', protect, guildController.createGuild);
router.get('/', protect, guildController.getGuilds);
router.get('/search', protect, guildController.searchGuildByLink); // Search by custom link
router.get('/my-guilds', protect, guildController.getUserGuilds); // User's guilds
router.get('/followed', protect, guildController.getFollowedGuilds); // Followed guilds
router.get('/:guildId', protect, guildController.getGuildDetails);

// Guild membership
router.post('/:guildId/join', protect, guildController.joinGuild);
router.post('/:guildId/leave', protect, guildController.leaveGuild);
router.post('/:guildId/follow', protect, guildController.followGuild);
router.post('/:guildId/unfollow', protect, guildController.unfollowGuild);

// Admin & Permissions management
router.post('/:guildId/admins', protect, guildController.addAdmin);
router.put('/:guildId/members/:userId/permissions', protect, guildController.updateMemberPermissions);

// Channel & Group creation
router.post('/:guildId/channels', protect, guildController.createChannel);
router.post('/:guildId/groups', protect, guildController.createGroup);

// Group invite
router.post('/groups/join/:inviteCode', protect, guildController.joinGroupByLink);

module.exports = router;
