// src/routes/notificationsRoutes.js
const express = require('express');
const router = express.Router();

const notificationController = require('../controllers/notificationController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

router.use(authenticate);
router.get('/', authorize(['USER', 'PREMIUM', 'ADMIN', 'ANALYST', 'KYC_OFFICER']), notificationController.getNotifications);
router.put('/read-all', authorize(['USER', 'PREMIUM', 'ADMIN', 'ANALYST', 'KYC_OFFICER']), notificationController.markAllRead);
router.put('/read/:id', authorize(['USER', 'PREMIUM', 'ADMIN', 'ANALYST', 'KYC_OFFICER']), notificationController.markRead);
router.delete('/:id', authorize(['USER', 'PREMIUM', 'ADMIN', 'ANALYST', 'KYC_OFFICER']), notificationController.deleteNotification);

module.exports = router;

