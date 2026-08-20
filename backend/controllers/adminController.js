const TeamModel = require('../models/TeamModel');
const CandidateModel = require('../models/CandidateModel');
const DraftCandidateModel = require('../models/DraftCandidateModel');
const DraftTeamModel = require('../models/DraftTeamModel');
const SystemLogModel = require('../models/SystemLogModel');
const { logError } = require('../utils/logger');

const teamModel = new TeamModel();
const candidateModel = new CandidateModel();
const draftModel = new DraftCandidateModel();
const draftTeamModel = new DraftTeamModel();

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "test@123";

const login = (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        return res.json({ success: true, token: "valid-admin-token-12345" });
    }
    res.status(401).json({ success: false, error: "Invalid credentials" });
};

const getRegistrations = async (req, res) => {
    try {
        // 1. Fetch all teams
        const teamsResult = await teamModel.getAll(req);
        if (!teamsResult.success) throw new Error(teamsResult.error);

        // 2. Fetch all candidates
        const candidatesResult = await candidateModel.getAll(req);
        if (!candidatesResult.success) throw new Error(candidatesResult.error);

        const teams = teamsResult.data;
        const candidates = candidatesResult.data;

        // 3. Map candidates to teams
        const registrations = teams.map(team => {
            return {
                ...team,
                id: team.ROWID,
                participants: candidates.filter(c => String(c.teamId) === String(team.ROWID))
            };
        });

        res.json(registrations);
    } catch (e) {
        console.error("[Admin] Fetch Error:", e);
        await logError(req, 'AdminController - Registrations', 'Failed to fetch registrations', e);
        res.status(500).json({ error: "Failed to fetch registrations", details: e.message });
    }
};

const getDrafts = async (req, res) => {
    try {
        const draftTeamsResult = await draftTeamModel.getAll(req);
        if (!draftTeamsResult.success) throw new Error(draftTeamsResult.error);

        const draftCandidatesResult = await draftModel.getAll(req);
        if (!draftCandidatesResult.success) throw new Error(draftCandidatesResult.error);

        const draftTeams = draftTeamsResult.data;
        const draftCandidates = draftCandidatesResult.data;

        // Fetch completed candidates to check for conversion
        const candidatesResult = await candidateModel.getAll(req);
        const registeredCandidates = candidatesResult.success ? candidatesResult.data : [];

        // Cross-reference draft candidates to see if they booked
        const mappedDraftCandidates = draftCandidates.map(c => {
            const isRegistered = registeredCandidates.some(rc => 
                (rc.email && c.email && String(rc.email).toLowerCase() === String(c.email).toLowerCase()) || 
                (rc.phone && c.phone && String(rc.phone) === String(c.phone))
            );
            return {
                ...c,
                isConverted: isRegistered
            };
        });

        // Map candidates to their draft teams
        const drafts = draftTeams.map(team => {
            return {
                ...team,
                id: team.ROWID,
                participants: mappedDraftCandidates.filter(c => String(c.draftTeamId) === String(team.ROWID))
            };
        });

        res.json(drafts);
    } catch (e) {
        console.error("[Admin] Drafts Fetch Error:", e);
        await logError(req, 'AdminController - Drafts', 'Failed to fetch drafts', e);
        res.status(500).json({ error: "Failed to fetch drafts", details: e.message });
    }
};

const getLogs = async (req, res) => {
    try {
        const logModel = new SystemLogModel();
        const logsResult = await logModel.getAll(req);
        
        if (!logsResult.success) throw new Error(logsResult.error);
        
        // Sort by created_at descending if possible
        const logs = logsResult.data.sort((a, b) => {
            return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        });
        
        res.json(logs);
    } catch (e) {
        console.error("[Admin] Logs Fetch Error:", e);
        res.status(500).json({ error: "Failed to fetch system logs", details: e.message });
    }
};

module.exports = {
    login,
    getRegistrations,
    getDrafts,
    getLogs
};
