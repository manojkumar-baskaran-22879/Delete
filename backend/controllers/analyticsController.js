const AnalyticsModel = require('../models/AnalyticsModel');
const { logError } = require('../utils/logger');

const trackAnalytics = async (req, res) => {
    try {
        const { type, target, path: pagePath } = req.body;
        if (!type || !pagePath) return res.status(400).json({ error: "Missing data" });

        const analyticsModel = new AnalyticsModel();

        const entry = {
            type,
            target: target || null,
            path: pagePath,
            userAgent: req.headers['user-agent'] || 'Unknown'
        };

        const result = await analyticsModel.create(req, entry);
        if (!result.success) throw new Error(result.error);

        res.json({ success: true });
    } catch (e) {
        console.error("[Analytics] Failed to track:", e);
        await logError(req, 'AnalyticsController', 'Failed to track', e);
        res.status(500).json({ error: "Failed to track" });
    }
};

const getAnalytics = async (req, res) => {
    try {
        const analyticsModel = new AnalyticsModel();
        // Get all records, optionally limiting to last 10000 records
        const result = await analyticsModel.getAll(req, { limit: 10000 });
        
        const views = [];
        const clicks = [];

        if (result && result.success && Array.isArray(result.data)) {
            result.data.forEach(row => {
                const mappedRow = {
                    ...row,
                    timestamp: row.CREATEDTIME || new Date().toISOString()
                };

                if (mappedRow.type === 'view') {
                    views.push(mappedRow);
                } else if (mappedRow.type === 'click') {
                    clicks.push(mappedRow);
                }
            });

            // Sort by timestamp asc (newest at bottom, like push)
            views.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
            clicks.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        }

        res.json({ views, clicks });
    } catch (e) {
        console.error("[Analytics] Failed to fetch analytics, sending empty fallback:", e);
        res.json({ views: [], clicks: [] });
    }
};

module.exports = {
    trackAnalytics,
    getAnalytics
};
