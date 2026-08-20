const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..'); // Points to backend/

const getPath = (filename) => path.join(dataDir, filename);

const readJson = (filename, defaultValue = []) => {
    const filePath = getPath(filename);
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2));
        return defaultValue;
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
};

const writeJson = (filename, data) => {
    const filePath = getPath(filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

module.exports = {
    readJson,
    writeJson
};
