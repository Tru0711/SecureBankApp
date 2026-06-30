// src/routes/walletRoutes.js
const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const { authenticate } = require('../middleware/authMiddleware');
const { requireActiveAccount } = require('../middleware/authStatusMiddleware');

// All wallet routes require authentication
router.use(authenticate);
// Wallet + financial operations require full onboarding: ACTIVE only.
router.use(requireActiveAccount([require('../utils/userStatus').STATUSES.ACTIVE]));

router.get('/', walletController.getWallet);
router.post('/', walletController.createWallet);
router.post('/add-money', walletController.addMoney);
router.post('/transfer', walletController.transferMoney);

router.get('/balance', walletController.getBalance);
router.get('/transactions', walletController.getTransactionHistory);
router.get('/transactions/:transactionId', walletController.getTransactionDetails);

module.exports = router;
