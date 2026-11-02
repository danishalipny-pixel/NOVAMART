import mongoose from 'mongoose';
import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';
import { Seller } from '../models/Seller.js';
import { ApiError } from '../utils/ApiError.js';

export const productService = {
  /**
   * Create a new product (Approved Seller only).
   */
  createProduct: async (productData, sellerProfileId) => {
    if (!sellerProfileId) {
      throw ApiError.forbidden('Only approved sellers with an active store profile can create products');
    }

    // Resolve Category by ID or Slug
    let categoryDoc;
    if (mongoose.Types.ObjectId.isValid(productData.category)) {
      categoryDoc = await Category.findById(productData.category);
    } else {
      categoryDoc = await Category.findOne({ slug: productData.category.toLowerCase().trim() });
    }

    if (!categoryDoc) {
      throw ApiError.notFound(`Referenced category "${productData.category}" does not exist`);
    }

    // Slug generation with collision avoidance
    const baseSlug = productData.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    let finalSlug = baseSlug;
    const existingProduct = await Product.findOne({ slug: finalSlug });
    if (existingProduct) {
      finalSlug = `${baseSlug}-${Date.now().toString().slice(-5)}`;
    }

    // Check SKU uniqueness if provided
    if (productData.sku) {
      const existingSku = await Product.findOne({ sku: productData.sku.toUpperCase().trim() });
      if (existingSku) {
        throw ApiError.conflict(`Product with SKU "${productData.sku}" already exists`);
      }
    }

    const price = Number(productData.price);
    const originalPrice = productData.originalPrice ? Number(productData.originalPrice) : price;
    const discountPercentage =
      productData.discountPercentage !== undefined
        ? Number(productData.discountPercentage)
        : originalPrice > price
        ? Math.round(((originalPrice - price) / originalPrice) * 100)
        : 0;

    const product = new Product({
      name: productData.name.trim(),
      slug: finalSlug,
      brand: productData.brand.trim(),
      category: categoryDoc._id,
      categorySlug: categoryDoc.slug,
      seller: sellerProfileId,
      price,
      originalPrice,
      discountPercentage,
      stock: Number(productData.stock) || 0,
      sku: productData.sku ? productData.sku.toUpperCase().trim() : undefined,
      badge: productData.badge ? productData.badge.trim() : '',
      isFeatured: Boolean(productData.isFeatured),
      isActive: productData.isActive !== undefined ? Boolean(productData.isActive) : true,
      description: productData.description.trim(),
      features: Array.isArray(productData.features) ? productData.features : [],
      specs: productData.specs || new Map(),
      images: Array.isArray(productData.images) ? productData.images : []
    });

    await product.save();
    await product.populate([
      { path: 'category', select: 'name slug icon' },
      { path: 'seller', select: 'storeName storeSlug rating' }
    ]);

    return product;
  },

  /**
   * Search, filter, and paginate products.
   */
  getProducts: async (query = {}) => {
    const filter = {};

    // Active status filter (default: active products only)
    if (query.includeInactive !== 'true') {
      filter.isActive = true;
    }

    // Search by text or name/brand/description
    if (query.search && query.search.trim()) {
      const term = query.search.trim();
      filter.$or = [
        { name: { $regex: term, $options: 'i' } },
        { brand: { $regex: term, $options: 'i' } },
        { description: { $regex: term, $options: 'i' } }
      ];
    }

    // Category filter (supports ObjectId or slug)
    if (query.category && query.category !== 'all') {
      if (mongoose.Types.ObjectId.isValid(query.category)) {
        filter.category = query.category;
      } else {
        filter.categorySlug = query.category.toLowerCase().trim();
      }
    }

    // Brand filter
    if (query.brand) {
      filter.brand = { $regex: new RegExp(`^${query.brand.trim()}$`, 'i') };
    }

    // Price range filter
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      filter.price = {};
      if (query.minPrice !== undefined && query.minPrice !== '') {
        filter.price.$gte = Number(query.minPrice);
      }
      if (query.maxPrice !== undefined && query.maxPrice !== '') {
        filter.price.$lte = Number(query.maxPrice);
      }
    }

    // Stock availability filter
    if (query.inStock === 'true') {
      filter.stock = { $gt: 0 };
    }

    // Seller filter
    if (query.seller) {
      if (mongoose.Types.ObjectId.isValid(query.seller)) {
        filter.seller = query.seller;
      }
    }

    // Featured filter
    if (query.isFeatured !== undefined) {
      filter.isFeatured = query.isFeatured === 'true';
    }

    // Sorting
    let sortOptions = { isFeatured: -1, createdAt: -1 };
    switch (query.sort) {
      case 'price-asc':
        sortOptions = { price: 1 };
        break;
      case 'price-desc':
        sortOptions = { price: -1 };
        break;
      case 'rating':
        sortOptions = { rating: -1, reviewCount: -1 };
        break;
      case 'newest':
        sortOptions = { createdAt: -1 };
        break;
      case 'featured':
      default:
        sortOptions = { isFeatured: -1, createdAt: -1 };
        break;
    }

    // Pagination
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 12));
    const skip = (page - 1) * limit;

    const [total, products] = await Promise.all([
      Product.countDocuments(filter),
      Product.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate('category', 'name slug icon')
        .populate('seller', 'storeName storeSlug rating')
        .lean({ virtuals: true })
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  },

  /**
   * Retrieve single product by ID or slug.
   */
  getProductByIdOrSlug: async (idOrSlug) => {
    let product;
    if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
      product = await Product.findById(idOrSlug)
        .populate('category', 'name slug icon')
        .populate('seller', 'storeName storeSlug rating logo');
    } else {
      product = await Product.findOne({ slug: idOrSlug.toLowerCase() })
        .populate('category', 'name slug icon')
        .populate('seller', 'storeName storeSlug rating logo');
    }

    if (!product) {
      throw ApiError.notFound(`Product "${idOrSlug}" not found`);
    }

    return product;
  },

  /**
   * Update product (Seller must own the product, or Admin).
   */
  updateProduct: async (idOrSlug, updateData, user, sellerProfile) => {
    let product;
    if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
      product = await Product.findById(idOrSlug);
    } else {
      product = await Product.findOne({ slug: idOrSlug.toLowerCase() });
    }

    if (!product) {
      throw ApiError.notFound(`Product "${idOrSlug}" not found`);
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
          "Access denied: You are not authorized to modify another merchant's product"
        );
      }
    } else if (user.role !== 'admin') {
      throw ApiError.forbidden('Access denied: Insufficient permissions to update products');
    }

    // Apply allowed updates
    if (updateData.name && updateData.name.trim() !== product.name) {
      product.name = updateData.name.trim();
    }
    if (updateData.description !== undefined) product.description = updateData.description.trim();
    if (updateData.price !== undefined) product.price = Number(updateData.price);
    if (updateData.originalPrice !== undefined) product.originalPrice = Number(updateData.originalPrice);
    if (updateData.discountPercentage !== undefined) {
      product.discountPercentage = Number(updateData.discountPercentage);
    }
    if (updateData.stock !== undefined) product.stock = Number(updateData.stock);
    if (updateData.brand !== undefined) product.brand = updateData.brand.trim();
    if (updateData.badge !== undefined) product.badge = updateData.badge.trim();
    if (updateData.isFeatured !== undefined) product.isFeatured = Boolean(updateData.isFeatured);
    if (updateData.isActive !== undefined) product.isActive = Boolean(updateData.isActive);
    if (Array.isArray(updateData.features)) product.features = updateData.features;
    if (updateData.specs !== undefined) product.specs = updateData.specs;
    if (Array.isArray(updateData.images) && updateData.images.length > 0) {
      product.images = updateData.images;
    }

    // Update category if provided
    if (updateData.category) {
      let categoryDoc;
      if (mongoose.Types.ObjectId.isValid(updateData.category)) {
        categoryDoc = await Category.findById(updateData.category);
      } else {
        categoryDoc = await Category.findOne({ slug: updateData.category.toLowerCase().trim() });
      }
      if (categoryDoc) {
        product.category = categoryDoc._id;
        product.categorySlug = categoryDoc.slug;
      }
    }

    await product.save();
    await product.populate([
      { path: 'category', select: 'name slug icon' },
      { path: 'seller', select: 'storeName storeSlug rating' }
    ]);

    return product;
  },

  /**
   * Delete product (Seller must own the product, or Admin).
   */
  deleteProduct: async (idOrSlug, user, sellerProfile) => {
    let product;
    if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
      product = await Product.findById(idOrSlug);
    } else {
      product = await Product.findOne({ slug: idOrSlug.toLowerCase() });
    }

    if (!product) {
      throw ApiError.notFound(`Product "${idOrSlug}" not found`);
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
          "Access denied: You are not authorized to delete another merchant's product"
        );
      }
    } else if (user.role !== 'admin') {
      throw ApiError.forbidden('Access denied: Insufficient permissions to delete products');
    }

    await Product.deleteOne({ _id: product._id });
    return { id: product._id, name: product.name, deleted: true };
  },

  /**
   * Retrieve all products belonging to an authenticated seller.
   */
  getSellerProducts: async (sellerProfileId, query = {}) => {
    const filter = { seller: sellerProfileId };

    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const [total, products] = await Promise.all([
      Product.countDocuments(filter),
      Product.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('category', 'name slug')
        .lean({ virtuals: true })
    ]);

    return {
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1
      }
    };
  }
};

export default productService;
