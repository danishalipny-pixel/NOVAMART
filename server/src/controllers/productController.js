import { productService } from '../services/productService.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const productController = {
  createProduct: async (req, res, next) => {
    try {
      // Seller identity is extracted from request context populated by requireApprovedSeller
      const sellerProfileId = req.seller?._id || req.user?.sellerProfile;
      const product = await productService.createProduct(req.body, sellerProfileId);
      return ApiResponse.created(res, 'Product created and listed successfully', product);
    } catch (error) {
      next(error);
    }
  },

  getProducts: async (req, res, next) => {
    try {
      const result = await productService.getProducts(req.query);
      return ApiResponse.success(res, 'Products catalog retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  },

  getProduct: async (req, res, next) => {
    try {
      const product = await productService.getProductByIdOrSlug(req.params.id);
      return ApiResponse.success(res, 'Product details retrieved successfully', product);
    } catch (error) {
      next(error);
    }
  },

  updateProduct: async (req, res, next) => {
    try {
      const product = await productService.updateProduct(
        req.params.id,
        req.body,
        req.user,
        req.seller
      );
      return ApiResponse.success(res, 'Product updated successfully', product);
    } catch (error) {
      next(error);
    }
  },

  deleteProduct: async (req, res, next) => {
    try {
      const result = await productService.deleteProduct(
        req.params.id,
        req.user,
        req.seller
      );
      return ApiResponse.success(res, 'Product removed from catalog successfully', result);
    } catch (error) {
      next(error);
    }
  },

  getMyProducts: async (req, res, next) => {
    try {
      const sellerProfileId = req.seller?._id || req.user?.sellerProfile;
      const result = await productService.getSellerProducts(sellerProfileId, req.query);
      return ApiResponse.success(res, 'Seller inventory retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }
};

export default productController;
