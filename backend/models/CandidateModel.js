const BaseModel = require('./BaseModel');

class CandidateModel extends BaseModel {
    constructor() {
        super('Candidates');
    }

    // Get all candidates for a team
    async getByTeamId(req, teamId) {
        try {
            const searchCriteria = `teamId = ${teamId}`;
            return await this.search(req, searchCriteria);
        } catch (error) {
            console.error('Error fetching candidates by team:', error);
            return { success: false, error: error.message };
        }
    }

    // Get candidate by phone number
    async getByPhone(req, phone) {
        try {
            const searchCriteria = `phone = '${phone}'`;
            const result = await this.search(req, searchCriteria);

            if (result.success && result.data.length > 0) {
                return { success: true, data: result.data[0] };
            }
            return { success: false, error: 'Candidate not found' };
        } catch (error) {
            console.error('Error fetching candidate by phone:', error);
            return { success: false, error: error.message };
        }
    }
    // Get candidate by email
    async getByEmail(req, email) {
        try {
            const searchCriteria = `email = '${email}'`;
            const result = await this.search(req, searchCriteria);

            if (result.success && result.data.length > 0) {
                return { success: true, data: result.data[0] };
            }
            return { success: false, error: 'Candidate not found' };
        } catch (error) {
            console.error('Error fetching candidate by email:', error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = CandidateModel;
