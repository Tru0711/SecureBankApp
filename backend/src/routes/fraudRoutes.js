// src/routes/fraudRoutes.js
const express = require('express');
const router = express.Router();

const { authenticate } = require('../middleware/authMiddleware');
const fraudController = require('../controllers/fraudController');

router.use(authenticate);

router.post('/analyze', fraudController.analyze);
router.get('/history', fraudController.history);

module.exports = router;

