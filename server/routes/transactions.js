const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

console.log('✅ Transactions Route File Loaded');
router.get('/', transactionController.getAllTransactions);
router.get('/user/:userId', transactionController.getTransactionsByUser);
router.post('/create', transactionController.createTransaction);
router.post('/update-status', transactionController.updateStatus); // Renamed to force refresh
console.log('✅ POST /update-status route registered');
router.get('/stats', transactionController.getTransactionStats);

module.exports = router;
