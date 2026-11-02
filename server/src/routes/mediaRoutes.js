import { Router } from 'express';
import { mediaController } from '../controllers/mediaController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = Router();

/**
 * @route   POST /api/v1/media/upload
 * @desc    Upload up to 5 images to Cloudinary
 * @access  Private (Sellers and Admins only)
 */
router.post(
  '/upload',
  authenticate,
  authorize('seller', 'admin'),
  upload.array('images', 5),
  mediaController.uploadImages
);

/**
 * @route   POST /api/v1/media/products/:id/images
 * @desc    Upload and attach images to a specific product
 * @access  Private (Seller Owner or Admin)
 */
router.post(
  '/products/:id/images',
  authenticate,
  authorize('seller', 'admin'),
  upload.array('images', 5),
  mediaController.uploadProductImages
);

/**
 * @route   DELETE /api/v1/media/products/:id/images
 * @desc    Remove an image from a specific product
 * @access  Private (Seller Owner or Admin)
 */
router.delete(
  '/products/:id/images',
  authenticate,
  authorize('seller', 'admin'),
  mediaController.removeProductImage
);

/**
 * @route   DELETE /api/v1/media/:publicId(*)
 * @desc    Delete an image from Cloudinary by public ID
 * @access  Private (Sellers and Admins only)
 */
router.delete(
  '/:publicId(*)',
  authenticate,
  authorize('seller', 'admin'),
  mediaController.deleteImage
);

/**
 * @route   DELETE /api/v1/media
 * @desc    Delete an image from Cloudinary by public ID in query/body
 * @access  Private (Sellers and Admins only)
 */
router.delete(
  '/',
  authenticate,
  authorize('seller', 'admin'),
  mediaController.deleteImage
);

export default router;
