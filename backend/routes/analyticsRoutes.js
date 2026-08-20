const express = require('express');
const router = express.Router();
const { trackAnalytics, getAnalytics } = require('../controllers/analyticsController');
const adminAuth = require('../middlewares/authMiddleware');

router.post('/track', trackAnalytics);
router.get('/', adminAuth, getAnalytics);

module.exports = router;
