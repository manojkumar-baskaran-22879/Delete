const express = require('express');
const router = express.Router();
const { login, getRegistrations, getDrafts, getLogs } = require('../controllers/adminController');
const adminAuth = require('../middlewares/authMiddleware');

router.post('/login', login);
router.get('/registrations', adminAuth, getRegistrations);
router.get('/drafts', adminAuth, getDrafts);
router.get('/logs', adminAuth, getLogs);

module.exports = router;
