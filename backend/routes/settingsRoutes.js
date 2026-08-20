const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const adminAuth = require('../middlewares/authMiddleware');

router.get('/', getSettings);
router.post('/', adminAuth, updateSettings);

module.exports = router;
