const express = require('express');
const router = express.Router();
const challengeController = require('../controllers/challengeController');

router.get('/', challengeController.getChallenges);
router.post('/create', challengeController.createChallenge);
router.post('/accept', challengeController.acceptChallenge);
router.delete('/:id', challengeController.deleteChallenge);
router.post('/update/:id', challengeController.updateChallenge);

module.exports = router;
