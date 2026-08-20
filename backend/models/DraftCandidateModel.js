const BaseModel = require('./BaseModel');

class DraftCandidateModel extends BaseModel {
    constructor() {
        super('DraftCandidates');
    }

    // Get draft candidate by phone number
    async getByPhone(req, phone) {
        try {
            const searchCriteria = `phone = '${phone}'`;
            const result = await this.search(req, searchCriteria);

            if (result.success && result.data.length > 0) {
                return { success: true, data: result.data[0] };
            }
            return { success: false, data: null };
        } catch (error) {
            console.error('Error fetching draft by phone:', error);
            return { success: false, error: error.message };
        }
    }

    // Delete draft candidates by phone numbers
    async deleteByPhones(req, phones) {
        try {
            const results = [];
            for (const phone of phones) {
                const draft = await this.getByPhone(req, phone);
                if (draft.success && draft.data) {
                    const deleteResult = await this.delete(req, draft.data.ROWID);
                    results.push(deleteResult);
                }
            }
            return { success: true, data: results };
        } catch (error) {
            console.error('Error deleting drafts by phones:', error);
            return { success: false, error: error.message };
        }
    }
    // Get draft candidate by email
    async getByEmail(req, email) {
        try {
            const searchCriteria = `email = '${email}'`;
            const result = await this.search(req, searchCriteria);

            if (result.success && result.data.length > 0) {
                return { success: true, data: result.data[0] };
            }
            return { success: false, data: null };
        } catch (error) {
            console.error('Error fetching draft by email:', error);
            return { success: false, error: error.message };
        }
    }

    // Get draft candidates by draftTeamId
    async getByDraftTeamId(req, draftTeamId) {
        try {
            const searchCriteria = `draftTeamId = '${draftTeamId}'`;
            return await this.search(req, searchCriteria);
        } catch (error) {
            console.error('Error fetching drafts by draftTeamId:', error);
            return { success: false, error: error.message };
        }
    }

    // Delete draft candidates by draftTeamId
    async deleteByDraftTeamId(req, draftTeamId) {
        try {
            const drafts = await this.getByDraftTeamId(req, draftTeamId);
            if (drafts.success && drafts.data) {
                const results = [];
                for (const draft of drafts.data) {
                    const deleteResult = await this.delete(req, draft.ROWID);
                    results.push(deleteResult);
                }
                return { success: true, data: results };
            }
            return { success: false, error: 'No drafts found for this team' };
        } catch (error) {
            console.error('Error deleting drafts by draftTeamId:', error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = DraftCandidateModel;
