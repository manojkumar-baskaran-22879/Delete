const BaseModel = require('./BaseModel');

class SystemLogModel extends BaseModel {
    constructor() {
        super('SystemLogs');
    }
}

module.exports = SystemLogModel;
