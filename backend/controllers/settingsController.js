const SettingsModel = require('../models/SettingsModel');
const settingsModel = new SettingsModel();

const getSettings = async (req, res) => {
    try {
        const result = await settingsModel.getSettings(req);
        if (!result.success) throw new Error(result.error);
        res.json(result.data);
    } catch (e) {
        console.error("[Settings] Fetch Error:", e);
        res.status(500).json({ error: "Failed to fetch settings" });
    }
};

const updateSettings = async (req, res) => {
    try {
        const newSettings = req.body;
        // Validation (can be expanded)
        if (typeof newSettings.earlyBird !== 'boolean' || !newSettings.prices) {
            return res.status(400).json({ error: "Invalid settings format" });
        }

        const result = await settingsModel.updateSettings(req, newSettings);
        if (!result.success) throw new Error(result.error);

        res.json({ success: true, settings: newSettings });
    } catch (e) {
        console.error("[Settings] Update Error:", e);
        res.status(500).json({ error: "Failed to update settings" });
    }
};

module.exports = {
    getSettings,
    updateSettings
};
