const SystemLogModel = require('../models/SystemLogModel');

const logError = async (req, moduleName, message, details = "") => {
    try {
        const logModel = new SystemLogModel();
        
        // Ensure details is a string and truncate if it's too long (Catalyst limit)
        let errorDetails = "";
        if (details instanceof Error) {
            errorDetails = details.stack || details.message;
        } else if (typeof details === "object") {
            errorDetails = JSON.stringify(details);
        } else {
            errorDetails = String(details);
        }
        
        if (errorDetails.length > 2000) {
            errorDetails = errorDetails.substring(0, 2000) + "...";
        }

        await logModel.create(req, {
            module: moduleName,
            message: message,
            details: errorDetails,
            created_at: new Date().toISOString()
        });
    } catch (e) {
        console.error("[Logger] Failed to write to SystemLogs:", e);
    }
};

module.exports = {
    logError
};
