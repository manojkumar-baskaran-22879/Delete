const catalyst = require("zcatalyst-sdk-node");


class BaseModel {
  constructor(tableName) {
    this.tableName = tableName;
  }

  // Initialize Catalyst app from request
  getCatalystApp(req) {
      return catalyst.initialize(req);
  }

  // Get DataStore table
  getTable(req) {
    const catalystApp = this.getCatalystApp(req);
    return catalystApp.datastore().table(this.tableName);
  }

  // Get ZCQL instance for queries
  getZCQL(req) {
    const catalystApp = this.getCatalystApp(req);
    return catalystApp.zcql();
  }

  // Get Stratus Instance
  getStratus(req){
    const catalystApp = this.getCatalystApp(req);
    return catalystApp.stratus();
  }

  // Get comman image Bucket Instance
  getBucket(req){
    const stratus = this.getStratus(req);
    return stratus.bucket('cms-bucket');
  }


  // Create a new record
  async create(req, data) {
    try {
      const table = this.getTable(req);
      const result = await table.insertRow(data);
      return { success: true, data: result };
    } catch (error) {
      console.error(`Error creating ${this.tableName}:`, error);
      return { success: false, error: error.message };
    }
  }

  // Get all records with optional pagination
  async getAll(req, options = {}) {
    try {
      const zcql = this.getZCQL(req);

      // Query for data (with pagination)
      let query = `SELECT * FROM ${this.tableName}`;
      if (options.limit) {
        query += ` LIMIT ${options.limit}`;
        if (options.offset) {
          query += ` OFFSET ${options.offset}`;
        }
      }

      const result = await zcql.executeZCQLQuery(query);
      const data = result.map((row) => row[this.tableName]);

      // ✅ Count query with valid column name
      const countQuery = `SELECT COUNT(${this.tableName}.ROWID) as total FROM ${this.tableName}`;
      const countResult = await zcql.executeZCQLQuery(countQuery);
      let totalCount = 0;
      if (countResult && countResult.length > 0) {
        const tableData = countResult[0][this.tableName];
        totalCount = tableData["COUNT(ROWID)"]
          ? parseInt(tableData["COUNT(ROWID)"])
          : 0;
      }
      return {
        success: true,
        data,
        total: totalCount,
      };
    } catch (error) {
      console.error(`Error fetching ${this.tableName}:`, error);
      return { success: false, error: error.message };
    }
  }

  // Get record by ID
  async getById(req, id) {
    try {
      const zcql = this.getZCQL(req);
      const query = `SELECT * FROM ${this.tableName} WHERE ROWID = ${id}`;
      const result = await zcql.executeZCQLQuery(query);

      if (result.length === 0) {
        return { success: false, error: "Record not found" };
      }

      return { success: true, data: result[0][this.tableName] };
    } catch (error) {
      console.error(`Error fetching ${this.tableName} by ID:`, error);
      return { success: false, error: error.message };
    }
  }

  // Update record by ID
  async update(req, id, data) {
    try {
      const table = this.getTable(req);
      data.ROWID = id; // Catalyst requires ROWID for updates
      const result = await table.updateRow(data);
      return { success: true, data: result };
    } catch (error) {
      console.error(`Error updating ${this.tableName}:`, error);
      return { success: false, error: error.message };
    }
  }

  // Delete record by ID
  async delete(req, id) {
    try {
      const table = this.getTable(req);
      const result = await table.deleteRow(id);
      return { success: true, data: result };
    } catch (error) {
      console.error(`Error deleting ${this.tableName}:`, error);
      return { success: false, error: error.message };
    }
  }

  // Search records using ZCQL
  async search(req, whereClause) {
    try {
      const zcql = this.getZCQL(req);
      const query = `SELECT * FROM ${this.tableName} WHERE ${whereClause}`;
      const result = await zcql.executeZCQLQuery(query);
      const data = result.map((row) => row[this.tableName]);

      return { success: true, data: data };
    } catch (error) {
      console.error(`Error searching ${this.tableName}:`, error);
      return { success: false, error: error.message };
    }
  }

  // Upload Object
  async uploadObject(req,folder){
    try{
      const bucket = this.getBucket(req); 
      // console.log(req.files);
      let response=false;
      for(const file of req.files){
        response=await bucket.putObject(`${folder}/${file.originalname}`, file.buffer);
        if(!response)break;
      }
      if(response==true){
        return { success:true, data:"Images uploaded successfully"};
      }
      else{
        return { success:false, error:"Image upload failed"};
      }

    } catch (error) {
      console.error(`Error uploading images:`, error);
      return { success: false, error: error.message };
    }

  } 

  
}

module.exports = BaseModel;
