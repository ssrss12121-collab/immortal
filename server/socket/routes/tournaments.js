const express = require('express');
const router = express.Router();
const tournamentController = require('../controllers/tournamentController');

router.get('/', tournamentController.getTournaments);
router.post('/save', tournamentController.saveTournament);
router.delete('/:id', tournamentController.deleteTournament);
router.post('/join', tournamentController.joinTournament);

router.post('/restart/:id', tournamentController.restartTournament);
router.post('/rematch/:id', tournamentController.rematchTournament);
router.post('/publish', tournamentController.publishResults);

module.exports = router;
