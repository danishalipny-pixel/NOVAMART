import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters'],
      index: true
    },
    slug: {
      type: String,
      required: [true, 'Product slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    brand: {
      type: String,
      required: [true, 'Brand name is required'],
      trim: true,
      index: true
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category reference is required'],
      index: true
    },
    categorySlug: {
      type: String,
      required: [true, 'Category slug is required for indexing'],
      lowercase: true,
      trim: true,
      index: true
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Seller',
      required: [true, 'Seller reference is required'],
      index: true
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be a positive number'],
      index: true
    },
    originalPrice: {
      type: Number,
      min: [0, 'Original price cannot be negative'],
      default: function () {
        return this.price;
      }
    },
    discountPercentage: {
      type: Number,
      default: 0,
      min: [0, 'Discount percentage cannot be negative'],
      max: [100, 'Discount percentage cannot exceed 100%']
    },
    stock: {
      type: Number,
      required: [true, 'Stock count is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0
    },
    sku: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      uppercase: true
    },
    badge: {
      type: String,
      trim: true,
      default: ''
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true
    },
    features: {
      type: [String],
      default: []
    },
    specs: {
      type: Map,
      of: String,
      default: () => new Map()
    },
    images: {
      type: [String],
      validate: {
        validator: function (val) {
          return Array.isArray(val) && val.length > 0;
        },
        message: 'Product must include at least one image'
      }
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot exceed 5.0']
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: [0, 'Review count cannot be negative']
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for inStock indicator
productSchema.virtual('inStock').get(function () {
  return this.stock > 0;
});

// Compound Index: Category & Price (for filtered catalog sorting)
productSchema.index({ category: 1, price: 1 });
productSchema.index({ isFeatured: 1, createdAt: -1 });

// Full-text search index
productSchema.index(
  {
    name: 'text',
    brand: 'text',
    description: 'text'
  },
  {
    weights: {
      name: 10,
      brand: 5,
      description: 1
    },
    name: 'ProductTextSearchIndex'
  }
);

export const Product = mongoose.model('Product', productSchema);
export default Product;
