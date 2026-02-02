const express = require('express');
const router = express.Router();
const subController = require('../controllers/membershipController');

router.get('/plans', subController.getPlans);
router.post('/plans/add', subController.createPlan);
router.patch('/plans/:id', subController.adminUpdatePlan);
router.delete('/plans/:id', subController.deletePlan);
router.post('/buy', subController.buyMembership);
router.post('/assign', subController.assignSubscription);
router.get('/search/:playerIdToken', subController.getUserByPlayerId);

module.exports = router;
