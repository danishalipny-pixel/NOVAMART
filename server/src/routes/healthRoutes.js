import { Router } from 'express';
import { getHealth } from '../controllers/healthController.js';
import { validateHealthQuery } from '../validators/healthValidator.js';

const router = Router();

/**
 * @route   GET /api/v1/health
 * @desc    Get API service and database health status
 * @access  Public
 */
router.get('/', validateHealthQuery, getHealth);

export default router;
