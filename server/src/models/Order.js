import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required']
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Seller',
      index: true
    },
    name: {
      type: String,
      required: [true, 'Product name is required']
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Item price cannot be negative']
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1']
    },
    image: {
      type: String,
      default: ''
    },
    selectedSpecs: {
      type: Map,
      of: String,
      default: () => new Map()
    }
  },
  { _id: true }
);

const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Recipient full name is required'],
      trim: true
    },
    street: {
      type: String,
      required: [true, 'Street address is required'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    state: {
      type: String,
      required: [true, 'State / Province is required'],
      trim: true
    },
    postalCode: {
      type: String,
      required: [true, 'Postal code is required'],
      trim: true
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
      default: 'US'
    },
    phone: {
      type: String,
      required: [true, 'Contact phone number is required'],
      trim: true
    }
  },
  { _id: false }
);

const paymentInfoSchema = new mongoose.Schema(
  {
    method: {
      type: String,
      enum: {
        values: ['card', 'stripe', 'paypal', 'cash_on_delivery'],
        message: '{VALUE} is not a supported payment method'
      },
      default: 'card'
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'authorized', 'captured', 'failed', 'refunded'],
        message: '{VALUE} is not a valid payment status'
      },
      default: 'pending'
    },
    transactionId: {
      type: String,
      trim: true,
      default: ''
    },
    paidAt: {
      type: Date,
      default: null
    }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: [true, 'Order number is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer reference is required'],
      index: true
    },
    sellers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller',
        index: true
      }
    ],
    items: {
      type: [orderItemSchema],
      validate: {
        validator: function (val) {
          return Array.isArray(val) && val.length > 0;
        },
        message: 'Order must contain at least one item'
      }
    },
    shippingAddress: {
      type: shippingAddressSchema,
      required: [true, 'Shipping address is required']
    },
    payment: {
      type: paymentInfoSchema,
      default: () => ({})
    },
    pricing: {
      subtotal: {
        type: Number,
        required: [true, 'Subtotal is required'],
        min: [0, 'Subtotal cannot be negative']
      },
      shippingFee: {
        type: Number,
        required: true,
        default: 0,
        min: [0, 'Shipping fee cannot be negative']
      },
      tax: {
        type: Number,
        required: true,
        default: 0,
        min: [0, 'Tax cannot be negative']
      },
      total: {
        type: Number,
        required: [true, 'Total is required'],
        min: [0, 'Total cannot be negative']
      }
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
        message: '{VALUE} is not a valid order status'
      },
      default: 'pending',
      index: true
    },
    trackingNumber: {
      type: String,
      trim: true,
      default: ''
    },
    deliveredAt: {
      type: Date,
      default: null
    },
    cancelledAt: {
      type: Date,
      default: null
    },
    cancelReason: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes
orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

export const Order = mongoose.model('Order', orderSchema);
export default Order;
