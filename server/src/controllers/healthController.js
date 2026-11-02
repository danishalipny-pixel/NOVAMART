import { healthService } from '../services/healthService.js';
import { ApiResponse } from '../utils/ApiResponse.js';

/**
 * Controller to handle API health check requests.
 */
export const getHealth = (req, res, next) => {
  try {
    const isVerbose = req.query.verbose === 'true';
    const health = healthService.getHealthStatus(isVerbose);
    return ApiResponse.success(res, 'NOVAMART API service is healthy and operational', health);
  } catch (error) {
    next(error);
  }
};

export default {
  getHealth
};
