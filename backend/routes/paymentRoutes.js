const express = require('express');
const router = express.Router();
const { createPaymentSession, finalizeTeam } = require('../controllers/paymentController');

// Payment routes
router.post('/session', createPaymentSession);
router.post('/finalize', finalizeTeam);

module.exports = router;
