const BaseController = require('./BaseController');
const DraftTeamModel = require('../models/DraftTeamModel');
const DraftCandidateModel = require('../models/DraftCandidateModel');
const CandidateModel = require('../models/CandidateModel');

class TeamController extends BaseController {
    constructor() {
        super(new DraftTeamModel());
        this.draftCandidateModel = new DraftCandidateModel();
        this.candidateModel = new CandidateModel();
    }

    async saveTeamDraft(req, res) {
        try {
            const { teamName, ticketType, quantity, amount, participants, excitement, source, disability, updates } = req.body;

            if (!teamName || !ticketType || !quantity || !amount || !participants || participants.length === 0) {
                return this.sendError(res, 'Missing required fields or participants', 400);
            }

            // 1. Strict Duplicate Check
            for (const p of participants) {
                const phone = String(p.phone).trim();
                const email = String(p.email).toLowerCase().trim();

                // Check Candidates table
                const candidatePhoneCheck = await this.candidateModel.getByPhone(req, phone);
                if (candidatePhoneCheck.success && candidatePhoneCheck.data) {
                    return this.sendError(res, `Participant with phone ${phone} is already registered.`, 409);
                }
                const candidateEmailCheck = await this.candidateModel.getByEmail(req, email);
                if (candidateEmailCheck.success && candidateEmailCheck.data) {
                    return this.sendError(res, `Participant with email ${email} is already registered.`, 409);
                }
            }

            // 2. Create DraftTeam
            const draftTeamData = {
                teamName,
                ticketType,
                quantity: Math.round(Number(quantity)),
                amount: Math.round(Number(amount)),
                status: 'PENDING_PAYMENT'
            };

            if (excitement) draftTeamData.excitement = excitement;
            if (source) draftTeamData.source = source;
            draftTeamData.disability = (disability === true || disability === 'true');
            draftTeamData.updates = (updates === true || updates === 'true');

            const draftTeamResult = await this.model.create(req, draftTeamData);
            if (!draftTeamResult.success) {
                return this.sendError(res, 'Failed to create Draft Team', 500, draftTeamResult.error);
            }

            const draftTeamId = draftTeamResult.data.ROWID;
            const savedParticipants = [];

            // Query DraftCandidates columns for dynamic isLeader checking
            let draftCandColNames = [];
            try {
                const draftCandCols = await this.draftCandidateModel.getTable(req).getAllColumns();
                draftCandColNames = draftCandCols.map(c => c.column_name);
            } catch (err) {
                console.warn("Could not query DraftCandidates table columns:", err.message);
            }

            // 3. Create DraftCandidates
            for (const p of participants) {
                const draftData = {
                    draftTeamId: draftTeamId,
                    phone: String(p.phone),
                    firstName: String(p.firstName),
                    lastName: p.lastName ? String(p.lastName) : "",
                    email: String(p.email),
                    college: p.college ? String(p.college) : "",
                    department: p.department ? String(p.department) : "",
                    year: p.year ? String(p.year) : "",
                    tshirt: p.tshirt ? String(p.tshirt) : "M",
                    gender: p.gender ? String(p.gender) : "Other"
                };

                if (draftCandColNames.includes('isLeader')) {
                    draftData.isLeader = p.isLeader === true || p.isLeader === 'true';
                }

                const result = await this.draftCandidateModel.create(req, draftData);
                if (!result.success) {
                    // Rollback strategy could be implemented here, but ignoring for brevity 
                    // as drafts get purged or can be cleaned up later.
                    console.error(`Failed to create Draft Candidate for ${p.phone}:`, result.error);
                } else {
                    savedParticipants.push(result.data);
                }
            }

            // 4. Return success with draftTeamId
            this.sendResponse(res, true, { 
                draftTeamId, 
                teamDetails: draftTeamResult.data, 
                participants: savedParticipants 
            }, 0, 'Team draft created successfully', 201);
        } catch (error) {
            this.sendError(res, 'Failed to save team draft', 500, error);
        }
    }
}

module.exports = TeamController;
