import mongoose from 'mongoose';
import { cloudinary } from '../config/cloudinary.js';
import { Product } from '../models/Product.js';
import { Seller } from '../models/Seller.js';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';

/**
 * Helper to upload a single buffer into Cloudinary via streaming.
 */
const uploadBufferToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: options.folder || 'novamart/products',
      resource_type: 'image',
      ...options
    };

    const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (error) {
        logger.error('Cloudinary stream upload error:', error);
        return reject(error);
      }
      resolve({
        url: result.secure_url,
        secureUrl: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
        createdAt: result.created_at
      });
    });

    stream.end(buffer);
  });
};

export const mediaService = {
  /**
   * Upload single or multiple image files to Cloudinary.
   */
  uploadImages: async (files, folder = 'novamart/products') => {
    const fileList = Array.isArray(files) ? files : [files].filter(Boolean);

    if (fileList.length === 0) {
      throw ApiError.badRequest('No image files provided for upload');
    }

    if (fileList.length > 5) {
      throw ApiError.badRequest('Maximum 5 images allowed per upload batch');
    }

    try {
      const uploadPromises = fileList.map((file) =>
        uploadBufferToCloudinary(file.buffer, { folder })
      );
      const results = await Promise.all(uploadPromises);
      return results;
    } catch (error) {
      logger.error('Cloudinary upload failure:', error.message);
      throw ApiError.internal(`Media upload failed: ${error.message}`);
    }
  },

  /**
   * Delete an image from Cloudinary by its public_id.
   */
  deleteImage: async (publicId) => {
    if (!publicId) {
      throw ApiError.badRequest('publicId is required to delete image');
    }

    try {
      const result = await cloudinary.uploader.destroy(publicId);
      logger.info(`Cloudinary image deleted: ${publicId} (Result: ${result.result})`);
      return {
        publicId,
        result: result.result
      };
    } catch (error) {
      logger.error('Cloudinary image deletion failed:', error.message);
      throw ApiError.internal(`Image deletion failed: ${error.message}`);
    }
  },

  /**
   * Upload images and directly attach to a specific product.
   * Enforces strict seller ownership or admin access.
   */
  uploadProductImages: async (productId, files, user, sellerProfile) => {
    let product;
    if (mongoose.Types.ObjectId.isValid(productId)) {
      product = await Product.findById(productId);
    } else {
      product = await Product.findOne({ slug: productId.toLowerCase() });
    }

    if (!product) {
      throw ApiError.notFound(`Product "${productId}" not found`);
    }

    // Authorization & Ownership Verification
    if (user.role === 'seller') {
      let matchedSellerId = sellerProfile?._id || user.sellerProfile;
      if (!matchedSellerId) {
        const foundSeller = await Seller.findOne({ user: user.userId });
        matchedSellerId = foundSeller?._id;
      }
      if (!matchedSellerId || product.seller.toString() !== matchedSellerId.toString()) {
        throw ApiError.forbidden(
          "Access denied: You are not authorized to upload images for another merchant's product"
        );
      }
    } else if (user.role !== 'admin') {
      throw ApiError.forbidden('Only sellers and administrators can upload product images');
    }

    // Upload files to Cloudinary
    const uploadedImages = await mediaService.uploadImages(files, `novamart/products/${product.categorySlug || 'general'}`);

    // Append new URLs to existing product images
    const newUrls = uploadedImages.map((img) => img.secureUrl);
    product.images = [...(product.images || []), ...newUrls];
    await product.save();

    logger.info(`Appended ${newUrls.length} images to product "${product.name}" (#${product._id})`);

    return {
      product,
      uploadedImages
    };
  },

  /**
   * Remove an image from a product and delete it from Cloudinary if publicId is provided.
   */
  removeProductImage: async (productId, { imageUrl, publicId }, user, sellerProfile) => {
    let product;
    if (mongoose.Types.ObjectId.isValid(productId)) {
      product = await Product.findById(productId);
    } else {
      product = await Product.findOne({ slug: productId.toLowerCase() });
    }

    if (!product) {
      throw ApiError.notFound(`Product "${productId}" not found`);
    }

    // Authorization & Ownership Verification
    if (user.role === 'seller') {
      let matchedSellerId = sellerProfile?._id || user.sellerProfile;
      if (!matchedSellerId) {
        const foundSeller = await Seller.findOne({ user: user.userId });
        matchedSellerId = foundSeller?._id;
      }
      if (!matchedSellerId || product.seller.toString() !== matchedSellerId.toString()) {
        throw ApiError.forbidden(
          "Access denied: You are not authorized to remove images from another merchant's product"
        );
      }
    } else if (user.role !== 'admin') {
      throw ApiError.forbidden('Only sellers and administrators can modify product images');
    }

    if (imageUrl) {
      if (product.images.length <= 1) {
        throw ApiError.badRequest('Cannot delete the last remaining image of a product');
      }
      product.images = product.images.filter((img) => img !== imageUrl);
      await product.save();
    }

    let cloudinaryResult = null;
    if (publicId) {
      cloudinaryResult = await mediaService.deleteImage(publicId);
    }

    return {
      product,
      deletedImage: imageUrl || null,
      cloudinaryResult
    };
  }
};

export default mediaService;
