const express = require('express');
const router = express.Router();
const { getJunkyard, addToJunkyard } = require('../controllers/junkyardController');

router.get('/', getJunkyard);
router.post('/', addToJunkyard);

module.exports = router;
