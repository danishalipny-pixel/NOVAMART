import mongoose from 'mongoose';

const sellerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Seller profile must be linked to a user account'],
      unique: true,
      index: true
    },
    storeName: {
      type: String,
      required: [true, 'Store name is required'],
      trim: true,
      minlength: [2, 'Store name must be at least 2 characters'],
      maxlength: [100, 'Store name cannot exceed 100 characters'],
      index: true
    },
    storeSlug: {
      type: String,
      required: [true, 'Store slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: ''
    },
    logo: {
      type: String,
      default: '/assets/images/logo/novamart-symbol.svg'
    },
    banner: {
      type: String,
      default: '/assets/images/banners/banner-hero-summer.webp'
    },
    rating: {
      type: Number,
      default: 5.0,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot exceed 5.0']
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: [0, 'Review count cannot be negative']
    },
    totalSales: {
      type: Number,
      default: 0,
      min: [0, 'Total sales cannot be negative']
    },
    totalRevenue: {
      type: Number,
      default: 0,
      min: [0, 'Total revenue cannot be negative']
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'approved', 'suspended', 'rejected'],
        message: '{VALUE} is not a valid seller status'
      },
      default: 'approved',
      index: true
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: ''
    },
    contactEmail: {
      type: String,
      lowercase: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please provide a valid contact email'
      ]
    },
    contactPhone: {
      type: String,
      trim: true,
      default: ''
    },
    socialLinks: {
      website: { type: String, trim: true, default: '' },
      twitter: { type: String, trim: true, default: '' },
      instagram: { type: String, trim: true, default: '' }
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for active listing count (populated via Product model)
sellerSchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'seller'
});

export const Seller = mongoose.model('Seller', sellerSchema);
export default Seller;
