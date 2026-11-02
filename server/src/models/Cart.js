import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required']
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
      default: 1
    },
    selectedImage: {
      type: String,
      default: ''
    },
    priceAtAddition: {
      type: Number,
      min: [0, 'Price at addition cannot be negative']
    }
  },
  { _id: true, timestamps: true }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Cart must belong to a user'],
      unique: true,
      index: true
    },
    items: {
      type: [cartItemSchema],
      default: []
    },
    lastActive: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual: total item count in cart
cartSchema.virtual('totalItems').get(function () {
  return (this.items || []).reduce((sum, item) => sum + item.quantity, 0);
});

export const Cart = mongoose.model('Cart', cartSchema);
export default Cart;
