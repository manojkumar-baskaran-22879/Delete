const BaseModel = require('./BaseModel');
const { logError } = require('../utils/logger');

class SettingsModel extends BaseModel {
    constructor() {
        super('TicketClass');
    }

    async getSettings(req) {
        try {
            console.log(`[SettingsModel] Fetching all records from ${this.tableName}...`);
            const result = await this.getAll(req);

            const settings = {
                earlyBird: false,
                standardEnabled: false,
                registrationOpen: false,
                prices: { earlyBird: 0, standard: 0 }
            };

            if (result.success) {
                if (result.data.length > 0) {
                    result.data.forEach(row => {
                        if (!row.class) return;
                        const ticketClass = row.class.toLowerCase();
                        const price = parseInt(row.price) || 0;
                        const status = row.status === true || row.status === 'true' || row.status === 1;

                        if (ticketClass === 'early-bird') {
                            settings.earlyBird = status;
                            settings.prices.earlyBird = price;
                        } else if (ticketClass === 'standard') {
                            settings.standardEnabled = status;
                            settings.prices.standard = price;
                        } else if (ticketClass === 'registration-status') {
                            settings.registrationOpen = status;
                        }
                    });
                    return { success: true, data: settings };
                } else {
                    console.log(`[SettingsModel] No settings found in ${this.tableName}, returning defaults.`);
                    return {
                        success: true,
                        data: {
                            earlyBird: true,
                            standardEnabled: true,
                            registrationOpen: true,
                            prices: { earlyBird: 1, standard: 1 }
                        }
                    };
                }
            } else {
                throw new Error(result.error || "Failed to fetch from Datastore");
            }

        } catch (error) {
            console.error(`[SettingsModel] Error fetching settings:`, error);
            await logError(req, 'SettingsModel', 'Error fetching settings', error);
            return { success: false, error: error.message };
        }
    }

    async updateSettings(req, settingsData) {
        try {
            console.log(`[SettingsModel] Updating multi-row settings in ${this.tableName}...`);

            const configs = [
                { class: 'early-bird', price: settingsData.prices.earlyBird, status: settingsData.earlyBird },
                { class: 'standard', price: settingsData.prices.standard, status: settingsData.standardEnabled },
                { class: 'registration-status', price: 0, status: settingsData.registrationOpen }
            ];

            for (const config of configs) {
                // Find existing by class
                const searchResult = await this.search(req, `class = '${config.class}'`);

                if (searchResult.success && searchResult.data.length > 0) {
                    const rowId = searchResult.data[0].ROWID;
                    console.log(`[SettingsModel] Updating existing record for ${config.class} (ID: ${rowId})`);
                    const updateRes = await this.update(req, rowId, config);
                    if (!updateRes.success) throw new Error(updateRes.error);
                } else {
                    console.log(`[SettingsModel] Creating new record for ${config.class}`);
                    const createRes = await this.create(req, config);
                    if (!createRes.success) throw new Error(createRes.error);
                }
            }

            return { success: true };
        } catch (error) {
            console.error(`[SettingsModel] Error updating settings:`, error);
            await logError(req, 'SettingsModel', 'Error updating settings', error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = SettingsModel;
