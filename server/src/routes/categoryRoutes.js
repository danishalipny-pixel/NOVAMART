import { Router } from 'express';
import { categoryController } from '../controllers/categoryController.js';
import {
  validateCreateCategory,
  validateUpdateCategory
} from '../validators/categoryValidator.js';
import { authenticate, requireAdmin } from '../middleware/authMiddleware.js';

const router = Router();

// Public Read Endpoints
router.get('/', categoryController.getAll);
router.get('/:id', categoryController.getById);

// Admin-Protected Mutation Endpoints
router.post('/', authenticate, requireAdmin, validateCreateCategory, categoryController.create);
router.put('/:id', authenticate, requireAdmin, validateUpdateCategory, categoryController.update);
router.delete('/:id', authenticate, requireAdmin, categoryController.delete);

export default router;
