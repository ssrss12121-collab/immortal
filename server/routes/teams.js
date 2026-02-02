const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');

router.get('/', teamController.getTeams);
router.post('/create', teamController.createTeam);
router.get('/user/:userId', teamController.getTeamByUserId);
router.get('/:id', teamController.getTeamById);
router.delete('/:id', teamController.deleteTeam);
router.post('/invite', teamController.inviteMember);
router.post('/accept', teamController.acceptInvite);
router.delete('/reject/:notificationId', teamController.rejectInvite);
router.post('/kick', teamController.kickMember);
router.post('/update/:teamId', teamController.updateTeam);
router.post('/transfer-leadership', teamController.transferLeadership);
router.post('/correct-stats', teamController.correctStats);
router.delete('/match-history/:tournamentId', teamController.deleteMatchHistory);

module.exports = router;
