const BaseModel = require('./BaseModel');

class TeamModel extends BaseModel {
    constructor() {
        super('Teams');
    }

    // Get team by payment session ID
    async getByPaymentSessionId(req, paymentSessionId) {
        try {
            const searchCriteria = `paymentSessionId = '${paymentSessionId}'`;
            const result = await this.search(req, searchCriteria);

            if (result.success && result.data.length > 0) {
                return { success: true, data: result.data[0] };
            }
            return { success: false, error: 'Team not found' };
        } catch (error) {
            console.error('Error fetching team by payment session:', error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = TeamModel;
