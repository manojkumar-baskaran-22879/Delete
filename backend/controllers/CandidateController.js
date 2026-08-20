const BaseController = require('./BaseController');
const DraftCandidateModel = require('../models/DraftCandidateModel');

class CandidateController extends BaseController {
    constructor() {
        super(new DraftCandidateModel());
    }

    // Save or update draft candidate (UPSERT based on phone)
    async saveDraft(req, res) {
        try {
            const { phone, firstName, lastName, email, college, department, year, tshirt, gender } = req.body;

            if (!phone) {
                return this.sendError(res, 'Phone number is required', 400);
            }

            // Map data to ensure only valid columns are sent
            // This prevents "Invalid input value for column name" if tshirt/gender aren't created yet
            const draftData = {
                phone,
                firstName,
                lastName,
                email,
                college,
                department,
                year
            };

            // Add fields only if they exist in schema (optional until user adds them)
            if (tshirt) draftData.tshirt = tshirt;
            if (gender) draftData.gender = gender;

            // Check if draft exists with this phone
            const existing = await this.model.getByPhone(req, phone);

            if (existing.success && existing.data) {
                // UPDATE existing draft
                const draftId = existing.data.ROWID;
                const result = await this.model.update(req, draftId, draftData);

                if (result.success) {
                    this.sendResponse(res, true, result.data, 0, 'Draft updated successfully', 200);
                } else {
                    this.sendError(res, result.error, 400);
                }
            } else {
                // CREATE new draft
                const result = await this.model.create(req, draftData);

                if (result.success) {
                    this.sendResponse(res, true, result.data, 0, 'Draft created successfully', 201);
                } else {
                    this.sendError(res, result.error, 400);
                }
            }
        } catch (error) {
            this.sendError(res, 'Failed to save draft candidate', 500, error);
        }
    }

    // Get draft candidate by phone
    async getDraftByPhone(req, res) {
        try {
            const { phone } = req.params;
            const result = await this.model.getByPhone(req, phone);

            if (result.success && result.data) {
                this.sendResponse(res, true, result.data, 0, 'Draft fetched successfully');
            } else {
                this.sendError(res, 'Draft not found', 404);
            }
        } catch (error) {
            this.sendError(res, 'Failed to fetch draft', 500, error);
        }
    }

    // Delete draft candidate by phone
    async deleteDraft(req, res) {
        try {
            const { phone } = req.params;
            const existing = await this.model.getByPhone(req, phone);

            if (existing.success && existing.data) {
                const result = await this.model.delete(req, existing.data.ROWID);

                if (result.success) {
                    this.sendResponse(res, true, null, 0, 'Draft deleted successfully');
                } else {
                    this.sendError(res, result.error, 400);
                }
            } else {
                this.sendError(res, 'Draft not found', 404);
            }
        } catch (error) {
            this.sendError(res, 'Failed to delete draft', 500, error);
        }
    }
}

module.exports = CandidateController;
