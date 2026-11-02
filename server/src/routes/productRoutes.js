import { Router } from 'express';
import { productController } from '../controllers/productController.js';
import { reviewController } from '../controllers/reviewController.js';
import {
  validateCreateProduct,
  validateUpdateProduct,
  validateProductQuery
} from '../validators/productValidator.js';
import { validateCreateReview } from '../validators/reviewValidator.js';
import {
  authenticate,
  requireApprovedSeller
} from '../middleware/authMiddleware.js';

const router = Router();

// Public Catalog Endpoints
router.get('/', validateProductQuery, productController.getProducts);
router.get('/seller/me', authenticate, requireApprovedSeller, productController.getMyProducts);
router.get('/:id', productController.getProduct);

// Nested Product Review Endpoints
router.get('/:productId/reviews', reviewController.getProductReviews);
router.get('/:productId/reviews/stats', reviewController.getRatingStats);
router.post(
  '/:productId/reviews',
  authenticate,
  validateCreateReview,
  reviewController.createReview
);

// Approved Seller Creation Endpoint
router.post(
  '/',
  authenticate,
  requireApprovedSeller,
  validateCreateProduct,
  productController.createProduct
);

// Seller (Ownership verified in service) or Admin Mutation Endpoints
router.put(
  '/:id',
  authenticate,
  validateUpdateProduct,
  productController.updateProduct
);

router.delete(
  '/:id',
  authenticate,
  productController.deleteProduct
);

export default router;
