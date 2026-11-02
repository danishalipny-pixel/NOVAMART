import mongoose from 'mongoose';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { ApiError } from '../utils/ApiError.js';

export const categoryService = {
  /**
   * Create a new category (Admin only).
   */
  createCategory: async ({
    name,
    slug,
    description = '',
    icon = 'LayoutGrid',
    image = '/assets/images/categories/cat-all.webp',
    parentCategory = null,
    displayOrder = 0
  }) => {
    const trimmedName = name.trim();
    const generatedSlug = slug
      ? slug.trim().toLowerCase()
      : trimmedName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');

    // Prevent duplicate category name or slug
    const existing = await Category.findOne({
      $or: [{ name: trimmedName }, { slug: generatedSlug }]
    });

    if (existing) {
      if (existing.name.toLowerCase() === trimmedName.toLowerCase()) {
        throw ApiError.conflict(`Category with name "${trimmedName}" already exists`);
      }
      throw ApiError.conflict(`Category slug "${generatedSlug}" is already in use`);
    }

    const category = new Category({
      name: trimmedName,
      slug: generatedSlug,
      description: description.trim(),
      icon: icon.trim(),
      image: image.trim(),
      parentCategory: parentCategory || null,
      displayOrder: Number(displayOrder) || 0
    });

    await category.save();
    return category;
  },

  /**
   * Retrieve all categories with optional active status filter.
   */
  getAllCategories: async (query = {}) => {
    const filter = {};
    if (query.activeOnly !== 'false') {
      filter.isActive = true;
    }
    if (query.parent) {
      filter.parentCategory = query.parent === 'null' ? null : query.parent;
    }

    const categories = await Category.find(filter)
      .sort({ displayOrder: 1, name: 1 })
      .populate('parentCategory', 'name slug');

    return categories;
  },

  /**
   * Retrieve single category by MongoDB ID or unique slug.
   */
  getCategoryByIdOrSlug: async (idOrSlug) => {
    let category;
    if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
      category = await Category.findById(idOrSlug).populate('parentCategory', 'name slug');
    } else {
      category = await Category.findOne({ slug: idOrSlug.toLowerCase() }).populate(
        'parentCategory',
        'name slug'
      );
    }

    if (!category) {
      throw ApiError.notFound(`Category "${idOrSlug}" not found`);
    }

    return category;
  },

  /**
   * Update category by ID or slug (Admin only).
   */
  updateCategory: async (idOrSlug, updateData) => {
    let category;
    if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
      category = await Category.findById(idOrSlug);
    } else {
      category = await Category.findOne({ slug: idOrSlug.toLowerCase() });
    }

    if (!category) {
      throw ApiError.notFound(`Category "${idOrSlug}" not found`);
    }

    // Check conflict if name or slug is being updated
    if (updateData.name && updateData.name.trim() !== category.name) {
      const conflictName = await Category.findOne({
        name: updateData.name.trim(),
        _id: { $ne: category._id }
      });
      if (conflictName) {
        throw ApiError.conflict(`Category with name "${updateData.name}" already exists`);
      }
      category.name = updateData.name.trim();
    }

    if (updateData.slug && updateData.slug.trim().toLowerCase() !== category.slug) {
      const conflictSlug = await Category.findOne({
        slug: updateData.slug.trim().toLowerCase(),
        _id: { $ne: category._id }
      });
      if (conflictSlug) {
        throw ApiError.conflict(`Category slug "${updateData.slug}" is already taken`);
      }
      category.slug = updateData.slug.trim().toLowerCase();
    }

    if (updateData.description !== undefined) category.description = updateData.description.trim();
    if (updateData.icon !== undefined) category.icon = updateData.icon.trim();
    if (updateData.image !== undefined) category.image = updateData.image.trim();
    if (updateData.isActive !== undefined) category.isActive = Boolean(updateData.isActive);
    if (updateData.displayOrder !== undefined) category.displayOrder = Number(updateData.displayOrder);

    await category.save();
    return category;
  },

  /**
   * Delete category by ID or slug (Admin only).
   */
  deleteCategory: async (idOrSlug) => {
    let category;
    if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
      category = await Category.findById(idOrSlug);
    } else {
      category = await Category.findOne({ slug: idOrSlug.toLowerCase() });
    }

    if (!category) {
      throw ApiError.notFound(`Category "${idOrSlug}" not found`);
    }

    // Safeguard: Check if products belong to this category
    const productCount = await Product.countDocuments({ category: category._id });
    if (productCount > 0) {
      throw ApiError.badRequest(
        `Cannot delete category "${category.name}" because ${productCount} product(s) are actively linked to it. Reassign or remove those products first.`
      );
    }

    await Category.deleteOne({ _id: category._id });
    return { id: category._id, name: category.name, deleted: true };
  }
};

export default categoryService;
