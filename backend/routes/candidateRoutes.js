const express = require('express');
const router = express.Router();
const CandidateController = require('../controllers/CandidateController');

const candidateController = new CandidateController();

// Individual draft candidate routes have been deprecated in favor of team-based drafts

module.exports = router;
