const axios = require("axios");
const fetch = require("node-fetch");
const CandidateModel = require('../models/CandidateModel');
const SettingsModel = require('../models/SettingsModel');
const DraftTeamModel = require('../models/DraftTeamModel');
const DraftCandidateModel = require('../models/DraftCandidateModel');
const TeamModel = require('../models/TeamModel');

const candidateModel = new CandidateModel();
const settingsModel = new SettingsModel();
const draftTeamModel = new DraftTeamModel();
const draftCandidateModel = new DraftCandidateModel();
const teamModel = new TeamModel();

const createPaymentSession = async (req, res) => {
    const { draftTeamId, currency } = req.body;

    if (!draftTeamId) {
        return res.status(400).json({ error: "Missing required field: draftTeamId" });
    }

    try {
        // Fetch DraftTeam
        const teamResult = await draftTeamModel.getById(req, draftTeamId);
        if (!teamResult.success) {
            return res.status(404).json({ error: "Draft team not found" });
        }
        const draftTeam = teamResult.data;
        const { amount, ticketType, quantity, teamName } = draftTeam;

        // Fetch DraftCandidates
        const candidatesResult = await draftCandidateModel.getByDraftTeamId(req, draftTeamId);
        if (!candidatesResult.success || !candidatesResult.data || candidatesResult.data.length === 0) {
            return res.status(400).json({ error: "No candidates found for this draft team" });
        }
        const participants = candidatesResult.data;

        // Identify the leader for billing details
        let leadParticipant = participants.find(p => p.isLeader === true || p.isLeader === 'true');
        if (!leadParticipant) {
            leadParticipant = participants[0]; // fallback
        }

        const name = `${leadParticipant.firstName} ${leadParticipant.lastName || ''}`.trim();
        const phone = leadParticipant.phone;
        const email = leadParticipant.email;

        console.log(`[PaymentSession] Creating session for ${amount} ${currency || 'INR'} (Team: ${teamName})`);

        // 0. VALIDATE PRICE AND STATUS (Security Check)
        const settingsResult = await settingsModel.getSettings(req);
        if (!settingsResult.success) {
            throw new Error("Failed to fetch settings for validation");
        }

        const settings = settingsResult.data;
        let officialPrice = 0;
        let isEnabled = false;

        if (ticketType === 'early-bird') {
            officialPrice = settings.prices.earlyBird;
            isEnabled = settings.earlyBird;
        } else if (ticketType === 'standard') {
            officialPrice = settings.prices.standard;
            isEnabled = settings.standardEnabled;
        } else {
            return res.status(400).json({ error: "Invalid ticket type" });
        }

        if (!isEnabled) {
            return res.status(403).json({ error: `${ticketType} tickets are currently unavailable.` });
        }

        const expectedAmount = officialPrice * quantity;
        if (Number(amount) !== expectedAmount) {
            console.error(`[PaymentSession] Price Mismatch: Payload=${amount}, Expected=${expectedAmount}`);
            return res.status(400).json({ error: "Price mismatch. Please recreate draft." });
        }

        // Note: Strict duplicate checking is now handled during Draft creation, no need to duplicate here.

        // 1. Refresh Zoho Access Token
        console.log('[PaymentSession] Refreshing Zoho token...');
        const refreshResponse = await axios.get("https://refreshpaymenttoken-50027941168.catalystappsail.in/token/Zoho_Refresh_Token");
        const token = refreshResponse.data.access_token;
        if (!token) throw new Error("Failed to obtain Zoho access token");

        // 2. Prepare Zoho Payment Session request
        const account_id = process.env.NEXT_PUBLIC_ZOHO_PAYMENTS_ACC_ID || "60032576427";

        const meta_data = [
            { "key": "Name", "value": name },
            { "key": "Mobile", "value": phone },
            { "key": "Email", "value": email }
        ];
        if (teamName) {
            meta_data.push({ "key": "Team", "value": teamName });
        }

        const payload = {
            amount: Number(amount),
            currency: currency || "INR",
            meta_data
        };

        console.log('[PaymentSession] Sending session request to Zoho:', { account_id, payload });

        const response = await fetch(`https://payments.zoho.in/api/v1/paymentsessions?account_id=${account_id}`, {
            method: 'POST',
            headers: {
                'Authorization': `Zoho-oauthtoken ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[PaymentSession] Zoho API Error: ${response.status}`, errorText);
            throw new Error(`Zoho API Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('[PaymentSession] Session created successfully:', data.payments_session.payments_session_id);

        res.json(data);
    } catch (error) {
        console.error('[PaymentSession] Error:', error.message);
        res.status(500).json({ error: error.message });
    }
};

const finalizeTeam = async (req, res) => {
    const { draftTeamId, paymentSessionId, paymentId } = req.body;

    try {
        // Validate required fields
        if (!draftTeamId || !paymentSessionId || !paymentId) {
            return res.status(400).json({ error: "Missing required fields (draftTeamId, paymentSessionId, paymentId)" });
        }

        // Fetch DraftTeam
        const teamResult = await draftTeamModel.getById(req, draftTeamId);
        if (!teamResult.success) {
            return res.status(404).json({ error: "Draft team not found" });
        }
        const draftTeam = teamResult.data;

        // Fetch DraftCandidates
        const candidatesResult = await draftCandidateModel.getByDraftTeamId(req, draftTeamId);
        if (!candidatesResult.success || !candidatesResult.data || candidatesResult.data.length === 0) {
            return res.status(400).json({ error: "No candidates found for this draft team" });
        }
        const draftCandidates = candidatesResult.data;

        // 1. Create team in Teams table
        const teamData = {
            teamName: draftTeam.teamName,
            paymentSessionId,
            paymentId,
            amount: Math.round(Number(draftTeam.amount)),
            currency: 'INR',
            ticketType: draftTeam.ticketType,
            quantity: Math.round(Number(draftTeam.quantity)),
            status: 'PAID',
            paidAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
        };

        if (draftTeam.excitement) teamData.excitement = draftTeam.excitement;
        if (draftTeam.source) teamData.source = draftTeam.source;
        if (draftTeam.disability !== undefined) teamData.disability = (draftTeam.disability === true || draftTeam.disability === 'true');
        if (draftTeam.updates !== undefined) teamData.updates = (draftTeam.updates === true || draftTeam.updates === 'true');

        const createTeamResult = await teamModel.create(req, teamData);

        if (!createTeamResult.success) {
            console.error("[Finalize] Failed to create team:", createTeamResult.error);
            return res.status(500).json({ error: "Failed to create team", details: createTeamResult.error });
        }

        const teamId = createTeamResult.data.ROWID;

        // 2. Migrate from draft to candidates
        const migratedCandidates = [];

        for (const draft of draftCandidates) {
            // 2a. Create in Candidates table
            const candidateData = {
                teamId: teamId,
                phone: String(draft.phone),
                firstName: String(draft.firstName),
                lastName: draft.lastName ? String(draft.lastName) : "",
                email: String(draft.email),
                college: draft.college ? String(draft.college) : "",
                department: draft.department ? String(draft.department) : "",
                year: draft.year ? String(draft.year) : "",
                tshirt: draft.tshirt ? String(draft.tshirt) : "M",
                gender: draft.gender ? String(draft.gender) : "Other",
                isLeader: draft.isLeader === true || draft.isLeader === 'true'
            };

            console.log(`[Finalize] Migrating candidate:`, candidateData.phone);

            const candidateResult = await candidateModel.create(req, candidateData);

            if (!candidateResult.success) {
                console.error(`[Finalize] Catalyst Insertion Failed for ${draft.phone}:`, candidateResult.error);
                return res.status(500).json({
                    error: `Failed to create candidate record for ${draft.phone}`,
                    details: candidateResult.error
                });
            }

            migratedCandidates.push(candidateResult.data);
        }

        // 3. Cleanup Drafts
        console.log(`[Finalize] Cleaning up drafts for draftTeamId: ${draftTeamId}`);
        await draftCandidateModel.deleteByDraftTeamId(req, draftTeamId);
        await draftTeamModel.delete(req, draftTeamId);

        res.json({
            success: true,
            teamId,
            message: `Team created successfully with ${migratedCandidates.length} candidates`,
            team: createTeamResult.data,
            candidates: migratedCandidates
        });

    } catch (e) {
        console.error("Finalize Error:", e);
        res.status(500).json({ error: "Failed to finalize registration", details: e.message });
    }
};

module.exports = {
    createPaymentSession,
    finalizeTeam
};
