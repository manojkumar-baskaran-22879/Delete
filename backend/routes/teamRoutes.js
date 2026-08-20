const express = require('express');
const router = express.Router();
const TeamController = require('../controllers/TeamController');

const teamController = new TeamController();

// Team draft routes
router.post('/draft', (req, res) => teamController.saveTeamDraft(req, res));

module.exports = router;
