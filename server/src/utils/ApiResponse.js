/**
 * Standardized API success response wrapper.
 */
export class ApiResponse {
  constructor(statusCode, message = 'Success', data = null) {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.timestamp = new Date().toISOString();
  }

  static success(res, message = 'Success', data = null, statusCode = 200) {
    return res.status(statusCode).json(new ApiResponse(statusCode, message, data));
  }

  static created(res, message = 'Resource created successfully', data = null) {
    return res.status(201).json(new ApiResponse(201, message, data));
  }
}

export default ApiResponse;
