import mongoose from 'mongoose';
import {
  User,
  Seller,
  Category,
  Product,
  Order,
  Cart,
  Wishlist,
  Review
} from '../src/models/index.js';

let passed = 0;
let failed = 0;

const assert = (condition, description) => {
  if (condition) {
    console.log(`  ✓ ${description}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${description}`);
    failed++;
  }
};

const runModelTests = async () => {
  console.log('====================================================');
  console.log('   NOVAMART: Mongoose Model Validation Suite        ');
  console.log('====================================================\n');

  // 1. User Model
  console.log('1. Testing User Model...');
  try {
    const invalidUser = new User({});
    const err = invalidUser.validateSync();
    assert(err && err.errors.name, 'Catches missing name');
    assert(err && err.errors.email, 'Catches missing email');
    assert(err && err.errors.password, 'Catches missing password');

    const invalidEmailUser = new User({
      name: 'John Doe',
      email: 'not-an-email',
      password: 'password123'
    });
    const emailErr = invalidEmailUser.validateSync();
    assert(emailErr && emailErr.errors.email, 'Catches invalid email format');

    const validUser = new User({
      name: 'Alice Johnson',
      email: 'alice@novamart.com',
      password: 'SecurePassword123!',
      role: 'customer'
    });
    const validErr = validUser.validateSync();
    assert(!validErr, 'Accepts valid user fields');
    assert(validUser.role === 'customer', 'Applies default customer role');
  } catch (e) {
    console.error('User test error:', e);
    failed++;
  }

  // 2. Seller Model
  console.log('\n2. Testing Seller Model...');
  try {
    const invalidSeller = new Seller({});
    const err = invalidSeller.validateSync();
    assert(err && err.errors.user, 'Catches missing user reference');
    assert(err && err.errors.storeName, 'Catches missing storeName');
    assert(err && err.errors.storeSlug, 'Catches missing storeSlug');

    const validSeller = new Seller({
      user: new mongoose.Types.ObjectId(),
      storeName: 'Sony Official Store',
      storeSlug: 'sony-official-store',
      description: 'Authorized retailer for Sony Electronics',
      status: 'approved'
    });
    const validErr = validSeller.validateSync();
    assert(!validErr, 'Accepts valid seller fields');
    assert(validSeller.rating === 5.0, 'Applies default 5.0 rating');
  } catch (e) {
    console.error('Seller test error:', e);
    failed++;
  }

  // 3. Category Model
  console.log('\n3. Testing Category Model...');
  try {
    const invalidCat = new Category({});
    const err = invalidCat.validateSync();
    assert(err && err.errors.name, 'Catches missing category name');
    assert(err && err.errors.slug, 'Catches missing category slug');

    const validCat = new Category({
      name: 'Electronics & Audio',
      slug: 'electronics',
      icon: 'Headphones',
      description: 'High-fidelity audio, wireless gear & monitors'
    });
    const validErr = validCat.validateSync();
    assert(!validErr, 'Accepts valid category fields');
    assert(validCat.isActive === true, 'Defaults isActive to true');
  } catch (e) {
    console.error('Category test error:', e);
    failed++;
  }

  // 4. Product Model
  console.log('\n4. Testing Product Model...');
  try {
    const invalidProd = new Product({});
    const err = invalidProd.validateSync();
    assert(err && err.errors.name, 'Catches missing product name');
    assert(err && err.errors.price, 'Catches missing price');
    assert(err && err.errors.seller, 'Catches missing seller ref');
    assert(err && err.errors.images, 'Catches empty image list');

    const dummyCatId = new mongoose.Types.ObjectId();
    const dummySellerId = new mongoose.Types.ObjectId();

    const validProd = new Product({
      name: 'Sony WH-1000XM5 Wireless Headphones',
      slug: 'sony-wh-1000xm5',
      brand: 'Sony',
      category: dummyCatId,
      categorySlug: 'electronics',
      seller: dummySellerId,
      price: 348.00,
      stock: 24,
      description: 'Industry-leading noise cancellation',
      images: ['/assets/images/products/electronics/sony-wh1000xm5-main.webp'],
      features: ['Two processors and 8 microphones', '30-hour battery life'],
      specs: new Map([['Driver', '30mm'], ['Battery', '30 hrs']])
    });
    const validErr = validProd.validateSync();
    assert(!validErr, 'Accepts valid product fields');
    assert(validProd.inStock === true, 'Virtual inStock returns true for stock > 0');
  } catch (e) {
    console.error('Product test error:', e);
    failed++;
  }

  // 5. Order Model
  console.log('\n5. Testing Order Model...');
  try {
    const invalidOrder = new Order({});
    const err = invalidOrder.validateSync();
    assert(err && err.errors.orderNumber, 'Catches missing orderNumber');
    assert(err && err.errors.customer, 'Catches missing customer ref');
    assert(err && err.errors.shippingAddress, 'Catches missing shipping address');

    const validOrder = new Order({
      orderNumber: 'NM-9842',
      customer: new mongoose.Types.ObjectId(),
      items: [
        {
          product: new mongoose.Types.ObjectId(),
          name: 'Sony WH-1000XM5',
          price: 348.00,
          quantity: 1,
          image: '/assets/images/products/electronics/sony-wh1000xm5-main.webp'
        }
      ],
      shippingAddress: {
        fullName: 'Sophia Chen',
        street: '742 Evergreen Terrace',
        city: 'Springfield',
        state: 'OR',
        postalCode: '97477',
        country: 'US',
        phone: '555-0199'
      },
      pricing: {
        subtotal: 348.00,
        shippingFee: 0,
        tax: 27.84,
        total: 375.84
      },
      status: 'shipped'
    });
    const validErr = validOrder.validateSync();
    assert(!validErr, 'Accepts valid order fields');
  } catch (e) {
    console.error('Order test error:', e);
    failed++;
  }

  // 6. Cart Model
  console.log('\n6. Testing Cart Model...');
  try {
    const invalidCart = new Cart({});
    const err = invalidCart.validateSync();
    assert(err && err.errors.user, 'Catches missing user ref');

    const validCart = new Cart({
      user: new mongoose.Types.ObjectId(),
      items: [
        {
          product: new mongoose.Types.ObjectId(),
          quantity: 2,
          priceAtAddition: 199.99
        }
      ]
    });
    const validErr = validCart.validateSync();
    assert(!validErr, 'Accepts valid cart');
    assert(validCart.totalItems === 2, 'Virtual totalItems accurately sums item quantities');
  } catch (e) {
    console.error('Cart test error:', e);
    failed++;
  }

  // 7. Wishlist Model
  console.log('\n7. Testing Wishlist Model...');
  try {
    const invalidWishlist = new Wishlist({});
    const err = invalidWishlist.validateSync();
    assert(err && err.errors.user, 'Catches missing user ref');

    const prodId1 = new mongoose.Types.ObjectId();
    const prodId2 = new mongoose.Types.ObjectId();
    const validWishlist = new Wishlist({
      user: new mongoose.Types.ObjectId(),
      products: [prodId1, prodId2]
    });
    const validErr = validWishlist.validateSync();
    assert(!validErr, 'Accepts valid wishlist');
    assert(validWishlist.itemCount === 2, 'Virtual itemCount reflects saved products');
  } catch (e) {
    console.error('Wishlist test error:', e);
    failed++;
  }

  // 8. Review Model
  console.log('\n8. Testing Review Model...');
  try {
    const invalidReview = new Review({});
    const err = invalidReview.validateSync();
    assert(err && err.errors.product, 'Catches missing product ref');
    assert(err && err.errors.user, 'Catches missing user ref');
    assert(err && err.errors.rating, 'Catches missing rating');
    assert(err && err.errors.comment, 'Catches missing comment');

    const invalidRatingReview = new Review({
      product: new mongoose.Types.ObjectId(),
      user: new mongoose.Types.ObjectId(),
      rating: 6,
      comment: 'Too high of a rating'
    });
    const ratingErr = invalidRatingReview.validateSync();
    assert(ratingErr && ratingErr.errors.rating, 'Catches out-of-range rating (> 5)');

    const validReview = new Review({
      product: new mongoose.Types.ObjectId(),
      user: new mongoose.Types.ObjectId(),
      rating: 5,
      title: 'Best headphones ever',
      comment: 'The noise cancellation is magical on long flights.',
      isVerifiedPurchase: true
    });
    const validErr = validReview.validateSync();
    assert(!validErr, 'Accepts valid review fields');
  } catch (e) {
    console.error('Review test error:', e);
    failed++;
  }

  console.log('\n====================================================');
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
};

runModelTests();
