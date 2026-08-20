class BaseController {
  constructor(model) {
    this.model = model;
  }

  // Standard response format
  sendResponse(
    res,
    success,
    data = null,
    total = 0,
    message = "",
    statusCode = 200
  ) {
    res.status(statusCode).json({
      success,
      message,
      data,
      total,
      timestamp: new Date().toISOString(),
    });
  }

  // Error response
sendError(res, message, statusCode = 500, error = null) {
  console.error("Controller Error:", error);
  this.sendResponse(res, false, null, 0, message, statusCode);
}

  // Get all records
  async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      const result = await this.model.getAll(req, { limit, offset });

      if (result.success) {
        this.sendResponse(
          res,
          true,
          result.data,
          result.total,
          "Records fetched successfully"
        );
      } else {
        this.sendError(res, result.error, 400);
      }
    } catch (error) {
      this.sendError(res, "Failed to fetch records", 500, error);
    }
  }

  // Get record by ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const result = await this.model.getById(req, id);

      if (result.success) {
        this.sendResponse(
          res,
          true,
          result.data,
          "Record fetched successfully"
        );
      } else {
        this.sendError(res, result.error, 404);
      }
    } catch (error) {
      this.sendError(res, "Failed to fetch record", 500, error);
    }
  }

  // Create new record
  async create(req, res) {
    try {
      const result = await this.model.create(req, req.body);

      if (result.success) {
        this.sendResponse(
          res,
          true,
          result.data,
          "Record created successfully",
          201
        );
      } else {
        this.sendError(res, result.error, 400);
      }
    } catch (error) {
      this.sendError(res, "Failed to create record", 500, error);
    }
  }

  // Update record
  async update(req, res) {
    try {
      const { id } = req.params;
      const result = await this.model.update(req, id, req.body);

      if (result.success) {
        this.sendResponse(
          res,
          true,
          result.data,
          "Record updated successfully"
        );
      } else {
        this.sendError(res, result.error, 400);
      }
    } catch (error) {
      this.sendError(res, "Failed to update record", 500, error);
    }
  }

  // Delete record
  async delete(req, res) {
    try {
      const { id } = req.params;
      const result = await this.model.delete(req, id);

      if (result.success) {
        this.sendResponse(res, true, null, "Record deleted successfully");
      } else {
        this.sendError(res, result.error, 400);
      }
    } catch (error) {
      this.sendError(res, "Failed to delete record", 500, error);
    }
  }

  

}

module.exports = BaseController;
