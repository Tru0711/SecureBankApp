// src/routes/adminRoutes.js
const express = require('express');
const router = express.Router();

const { authenticate, authorize } = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');

router.use(authenticate);
router.use(authorize(['ADMIN']));

router.get('/dashboard', adminController.getDashboard);
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserDetails);
router.put('/users/:id/approve', adminController.approveUser);
router.put('/users/:id/reject', adminController.rejectUser);
router.put('/users/:id/freeze', adminController.freezeUser);
router.put('/users/:id/unfreeze', adminController.unfreezeUser);
router.put('/users/:id/ban', adminController.banUser);
router.put('/users/:id/force-logout', adminController.forceLogoutUser);
router.put('/users/:id/reset-password', adminController.resetUserPassword);
router.get('/transactions', adminController.getTransactions);
router.get('/fraud-alerts', adminController.getFraudAlerts);
router.get('/kyc', adminController.getKycQueue);
router.put('/kyc/:id/review', adminController.reviewKyc);
router.get('/tickets', adminController.getTickets);
router.get('/tickets/:id', adminController.getTicketDetails);
router.post('/tickets/:id/replies', adminController.replyTicket);
router.put('/tickets/:id', adminController.updateTicket);
router.put('/tickets/:id/assign', adminController.assignTicket);
router.get('/audit-logs', adminController.getAuditLogs);
router.get('/activity-logs', adminController.getAuditLogs);

module.exports = router;

