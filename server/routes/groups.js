const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const { protect } = require('../middleware/authMiddleware');

// Group management
router.get('/:groupId', protect, groupController.getGroup);
router.put('/:groupId', protect, groupController.editGroup);
router.delete('/:groupId', protect, groupController.deleteGroup);

// Group membership
router.post('/:groupId/join', protect, groupController.joinGroup);
router.post('/:groupId/leave', protect, groupController.leaveGroup);
router.post('/:groupId/kick/:userId', protect, groupController.kickMember);

// Group permissions & invite
router.post('/:groupId/invite', protect, groupController.inviteToGroup);
router.put('/:groupId/members/:userId/permissions', protect, groupController.updateGroupMemberPermissions);

module.exports = router;
