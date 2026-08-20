const { readJson, writeJson } = require('../utils/jsonDb');

const DB_FILE = 'junkyard_db.json';

const getJunkyard = (req, res) => {
    try {
        const data = readJson(DB_FILE);
        res.json(data);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to read dump" });
    }
};

const addToJunkyard = (req, res) => {
    try {
        const { name, status, cause } = req.body;
        if (!name || !status || !cause) {
            return res.status(400).json({ error: "Missing garbage details" });
        }

        const data = readJson(DB_FILE);
        const newEntry = { name, status, cause, timestamp: new Date().toISOString() };
        // Add to top
        data.unshift(newEntry);
        writeJson(DB_FILE, data);

        res.json({ success: true, message: "Trashed successfully", entry: newEntry });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to dump" });
    }
};

module.exports = {
    getJunkyard,
    addToJunkyard
};
