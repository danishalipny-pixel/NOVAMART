import { categoryService } from '../services/categoryService.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const categoryController = {
  create: async (req, res, next) => {
    try {
      const category = await categoryService.createCategory(req.body);
      return ApiResponse.created(res, 'Category created successfully', category);
    } catch (error) {
      next(error);
    }
  },

  getAll: async (req, res, next) => {
    try {
      const categories = await categoryService.getAllCategories(req.query);
      return ApiResponse.success(res, 'Categories retrieved successfully', categories);
    } catch (error) {
      next(error);
    }
  },

  getById: async (req, res, next) => {
    try {
      const category = await categoryService.getCategoryByIdOrSlug(req.params.id);
      return ApiResponse.success(res, 'Category retrieved successfully', category);
    } catch (error) {
      next(error);
    }
  },

  update: async (req, res, next) => {
    try {
      const category = await categoryService.updateCategory(req.params.id, req.body);
      return ApiResponse.success(res, 'Category updated successfully', category);
    } catch (error) {
      next(error);
    }
  },

  delete: async (req, res, next) => {
    try {
      const result = await categoryService.deleteCategory(req.params.id);
      return ApiResponse.success(res, 'Category deleted successfully', result);
    } catch (error) {
      next(error);
    }
  }
};

export default categoryController;
