export { User } from './User.js';
export { Seller } from './Seller.js';
export { Category } from './Category.js';
export { Product } from './Product.js';
export { Order } from './Order.js';
export { Cart } from './Cart.js';
export { Wishlist } from './Wishlist.js';
export { Review } from './Review.js';

export default {
  User: () => import('./User.js').then((m) => m.User),
  Seller: () => import('./Seller.js').then((m) => m.Seller),
  Category: () => import('./Category.js').then((m) => m.Category),
  Product: () => import('./Product.js').then((m) => m.Product),
  Order: () => import('./Order.js').then((m) => m.Order),
  Cart: () => import('./Cart.js').then((m) => m.Cart),
  Wishlist: () => import('./Wishlist.js').then((m) => m.Wishlist),
  Review: () => import('./Review.js').then((m) => m.Review)
};
