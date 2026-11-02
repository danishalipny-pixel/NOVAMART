import { mediaService } from '../services/mediaService.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';

export const mediaController = {
  /**
   * Upload multiple or single image files to Cloudinary.
   */
  uploadImages: async (req, res, next) => {
    try {
      const files = req.files || (req.file ? [req.file] : []);
      if (!files || files.length === 0) {
        throw ApiError.badRequest('No image files provided for upload');
      }

      const folder = req.body.folder || 'novamart/uploads';
      const results = await mediaService.uploadImages(files, folder);
      return ApiResponse.created(res, 'Images uploaded successfully to Cloudinary', results);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete an image from Cloudinary by public_id.
   */
  deleteImage: async (req, res, next) => {
    try {
      const publicId = req.params.publicId || req.body.publicId || req.query.publicId;
      if (!publicId) {
        throw ApiError.badRequest('publicId is required to delete image');
      }

      const result = await mediaService.deleteImage(publicId);
      return ApiResponse.success(res, 'Image deleted successfully from Cloudinary', result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Upload images and directly attach to a product.
   */
  uploadProductImages: async (req, res, next) => {
    try {
      const files = req.files || (req.file ? [req.file] : []);
      if (!files || files.length === 0) {
        throw ApiError.badRequest('No image files provided for upload');
      }

      const result = await mediaService.uploadProductImages(
        req.params.id,
        files,
        req.user,
        req.seller
      );
      return ApiResponse.success(res, 'Product images uploaded and attached successfully', result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Remove an image from a product.
   */
  removeProductImage: async (req, res, next) => {
    try {
      const { imageUrl, publicId } = req.body;
      if (!imageUrl && !publicId) {
        throw ApiError.badRequest('imageUrl or publicId is required to remove image from product');
      }

      const result = await mediaService.removeProductImage(
        req.params.id,
        { imageUrl, publicId },
        req.user,
        req.seller
      );
      return ApiResponse.success(res, 'Product image removed successfully', result);
    } catch (error) {
      next(error);
    }
  }
};

export default mediaController;
