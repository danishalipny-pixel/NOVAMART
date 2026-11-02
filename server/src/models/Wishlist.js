import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Wishlist must belong to a user'],
      unique: true,
      index: true
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      }
    ]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual: total count of saved wishlist items
wishlistSchema.virtual('itemCount').get(function () {
  return (this.products || []).length;
});

export const Wishlist = mongoose.model('Wishlist', wishlistSchema);
export default Wishlist;
