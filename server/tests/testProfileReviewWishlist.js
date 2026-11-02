import http from 'http';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { generateAccessToken } from '../src/utils/tokenUtils.js';
import { hashPassword, comparePassword } from '../src/utils/passwordUtils.js';
import { User } from '../src/models/User.js';
import { Product } from '../src/models/Product.js';
import { Order } from '../src/models/Order.js';
import { Review } from '../src/models/Review.js';
import { Wishlist } from '../src/models/Wishlist.js';

const TEST_PORT = 5095;
let server;
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

const makeRequest = (path, options = {}) => {
  return new Promise((resolve, reject) => {
    let payload = null;
    const headers = { ...(options.headers || {}) };

    if (options.body && typeof options.body === 'object') {
      payload = JSON.stringify(options.body);
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(payload);
    } else if (typeof options.body === 'string') {
      payload = options.body;
      headers['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = http.request(
      {
        host: '127.0.0.1',
        port: TEST_PORT,
        path,
        method: options.method || 'GET',
        headers
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            resolve({ statusCode: res.statusCode, data: parsed });
          } catch {
            resolve({ statusCode: res.statusCode, data: body });
          }
        });
      }
    );
    req.on('error', reject);
    if (payload) {
      req.write(payload);
    }
    req.end();
  });
};

const runPhase5Tests = async () => {
  console.log('====================================================');
  console.log('   NOVAMART: Phase 5 Profile, Reviews & Wishlist     ');
  console.log('====================================================\n');

  // Start HTTP server on test port
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(TEST_PORT, '127.0.0.1', resolve));
  console.log(`Test HTTP server started on http://127.0.0.1:${TEST_PORT}\n`);

  // In-Memory Database Repositories
  const usersDb = new Map();
  const productsDb = new Map();
  const ordersDb = new Map();
  const reviewsDb = new Map();
  const wishlistsDb = new Map();
  const _sellersDb = new Map();

  // Test Entities
  const customerId1 = new mongoose.Types.ObjectId().toString();
  const customerId2 = new mongoose.Types.ObjectId().toString();
  const adminId = new mongoose.Types.ObjectId().toString();
  const _sellerUserId = new mongoose.Types.ObjectId().toString();
  const _sellerProfileId = new mongoose.Types.ObjectId();

  const customer1Token = generateAccessToken({
    userId: customerId1,
    email: 'customer1@novamart.test',
    role: 'customer'
  });

  const customer2Token = generateAccessToken({
    userId: customerId2,
    email: 'customer2@novamart.test',
    role: 'customer'
  });

  const adminToken = generateAccessToken({
    userId: adminId,
    email: 'admin@novamart.test',
    role: 'admin'
  });

  // Hash initial password for customer 1
  const initialPasswordHash = await hashPassword('CurrentPassword123!');

  // Mock User 1
  const user1 = {
    _id: customerId1,
    name: 'Alex Mercer',
    email: 'customer1@novamart.test',
    password: initialPasswordHash,
    role: 'customer',
    phone: '555-0199',
    avatar: '/assets/images/avatars/user-default.webp',
    address: {
      street: '742 Evergreen Terr',
      city: 'Springfield',
      state: 'OR',
      postalCode: '97477',
      country: 'US'
    },
    isActive: true,
    isEmailVerified: true,
    comparePassword: async function (candidate) {
      return await comparePassword(candidate, this.password);
    },
    save: async function () {
      if (this.password && !this.password.startsWith('$2')) {
        this.password = await hashPassword(this.password);
      }
      usersDb.set(this._id.toString(), this);
      return this;
    }
  };
  usersDb.set(customerId1, user1);

  // Mock User 2
  const user2 = {
    _id: customerId2,
    name: 'Sarah Connor',
    email: 'customer2@novamart.test',
    password: initialPasswordHash,
    role: 'customer',
    phone: '',
    avatar: '',
    isActive: true,
    comparePassword: async function (candidate) {
      return await comparePassword(candidate, this.password);
    },
    save: async function () {
      usersDb.set(this._id.toString(), this);
      return this;
    }
  };
  usersDb.set(customerId2, user2);

  // Mock Admin User
  const adminUser = {
    _id: adminId,
    name: 'Admin User',
    email: 'admin@novamart.test',
    role: 'admin',
    isActive: true
  };
  usersDb.set(adminId, adminUser);

  // Mock Products
  const prod1Id = new mongoose.Types.ObjectId();
  const prod2Id = new mongoose.Types.ObjectId();
  const inactiveProdId = new mongoose.Types.ObjectId();

  const product1 = {
    _id: prod1Id,
    name: 'Sony WH-1000XM5 Headphones',
    slug: 'sony-wh-1000xm5-headphones',
    price: 399.99,
    originalPrice: 399.99,
    stock: 25,
    images: ['https://res.cloudinary.com/novamart/products/sony.webp'],
    rating: 0,
    reviewCount: 0,
    isActive: true,
    categorySlug: 'electronics',
    brand: 'Sony',
    save: async function () {
      productsDb.set(this._id.toString(), this);
      return this;
    }
  };
  productsDb.set(prod1Id.toString(), product1);

  const product2 = {
    _id: prod2Id,
    name: 'Apple MacBook Pro 16',
    slug: 'apple-macbook-pro-16',
    price: 2499.0,
    originalPrice: 2499.0,
    stock: 10,
    images: ['https://res.cloudinary.com/novamart/products/macbook.webp'],
    rating: 0,
    reviewCount: 0,
    isActive: true,
    categorySlug: 'electronics',
    brand: 'Apple',
    save: async function () {
      productsDb.set(this._id.toString(), this);
      return this;
    }
  };
  productsDb.set(prod2Id.toString(), product2);

  const inactiveProduct = {
    _id: inactiveProdId,
    name: 'Discontinued Vintage Camera',
    slug: 'discontinued-vintage-camera',
    price: 99.0,
    stock: 0,
    isActive: false,
    images: [],
    save: async function () {
      productsDb.set(this._id.toString(), this);
      return this;
    }
  };
  productsDb.set(inactiveProdId.toString(), inactiveProduct);

  // Mock Order: Customer 1 purchased Product 1
  const order1Id = new mongoose.Types.ObjectId();
  const verifiedOrder1 = {
    _id: order1Id,
    orderNumber: 'NM-VERIFIED-001',
    customer: customerId1,
    items: [{ product: prod1Id, quantity: 1, price: 399.99, name: product1.name }],
    status: 'delivered',
    payment: { status: 'captured' }
  };
  ordersDb.set(order1Id.toString(), verifiedOrder1);

  // Patch Mongoose Models
  User.findById = function (id) {
    const raw = usersDb.get(id?.toString()) || null;
    if (!raw) {
      return {
        select: function () { return this; },
        populate: async () => null,
        then: (resolve) => resolve(null)
      };
    }
    const obj = { ...raw };
    delete obj.password; // stripped by default
    obj.select = function (sel) {
      if (sel && sel.includes('+password')) {
        obj.password = raw.password;
      }
      return this;
    };
    obj.populate = function () { return Promise.resolve(this); };
    obj.comparePassword = async function (candidate) {
      return await comparePassword(candidate, raw.password);
    };
    obj.save = async function () {
      if (this.password && !this.password.startsWith('$2')) {
        this.password = await hashPassword(this.password);
      }
      raw.name = this.name;
      raw.phone = this.phone;
      raw.avatar = this.avatar;
      raw.address = this.address;
      if (this.password) {
        raw.password = this.password;
      }
      usersDb.set(raw._id.toString(), raw);
      return this;
    };
    return {
      select: function (sel) {
        return obj.select(sel);
      },
      populate: function () {
        return Promise.resolve(obj);
      },
      then: (resolve) => resolve(obj)
    };
  };

  Product.findById = async function (id) {
    return productsDb.get(id?.toString()) || null;
  };

  Product.findOne = async function (filter = {}) {
    if (filter.slug) {
      return Array.from(productsDb.values()).find((p) => p.slug === filter.slug) || null;
    }
    return null;
  };

  Order.findOne = async function (filter = {}) {
    return (
      Array.from(ordersDb.values()).find((o) => {
        if (filter.customer && o.customer.toString() !== filter.customer.toString()) {
          return false;
        }
        if (filter['items.product'] && !o.items.some((it) => it.product.toString() === filter['items.product'].toString())) {
          return false;
        }
        if (filter.status?.$ne && o.status === filter.status.$ne) {
          return false;
        }
        return true;
      }) || null
    );
  };

  Wishlist.findOne = function (filter = {}) {
    const raw = Array.from(wishlistsDb.values()).find(
      (w) => w.user.toString() === filter.user?.toString()
    ) || null;

    if (!raw) {
      return {
        populate: async () => null,
        then: (resolve) => resolve(null)
      };
    }

    const populated = {
      ...raw,
      products: raw.products
        .map((pId) => {
          const idStr = pId?._id ? pId._id.toString() : pId?.toString();
          return productsDb.get(idStr);
        })
        .filter(Boolean),
      save: async function () {
        raw.products = this.products.map((p) => (p._id ? p._id : p));
        wishlistsDb.set(raw._id.toString(), raw);
        return this;
      }
    };

    return {
      populate: async () => populated,
      then: (resolve) => resolve(populated)
    };
  };

  Wishlist.create = async function (data) {
    const newW = {
      _id: new mongoose.Types.ObjectId(),
      user: data.user,
      products: data.products || [],
      save: async function () {
        wishlistsDb.set(this._id.toString(), this);
        return this;
      }
    };
    wishlistsDb.set(newW._id.toString(), newW);
    return newW;
  };

  Review.find = function (filter = {}) {
    const filtered = Array.from(reviewsDb.values()).filter((r) => {
      if (filter.product && r.product.toString() !== filter.product.toString()) return false;
      if (filter.rating && r.rating !== filter.rating) return false;
      return true;
    });

    const chainable = {
      sort: () => chainable,
      skip: () => chainable,
      limit: () => chainable,
      populate: () => Promise.resolve(filtered),
      then: (resolve) => resolve(filtered)
    };
    return chainable;
  };

  Review.findOne = async function (filter = {}) {
    return (
      Array.from(reviewsDb.values()).find((r) => {
        if (filter.product && r.product.toString() !== filter.product.toString()) return false;
        if (filter.user && r.user.toString() !== filter.user.toString()) return false;
        return true;
      }) || null
    );
  };

  Review.findById = function (id) {
    const review = reviewsDb.get(id?.toString()) || null;
    if (!review) return Promise.resolve(null);
    return {
      ...review,
      populate: async () => {
        const author = usersDb.get(review.user.toString());
        return {
          ...review,
          user: author ? { _id: author._id, name: author.name, avatar: author.avatar } : null
        };
      },
      then: (resolve) => resolve(review)
    };
  };

  Review.countDocuments = async function (filter = {}) {
    return Array.from(reviewsDb.values()).filter((r) => {
      if (filter.product && r.product.toString() !== filter.product.toString()) return false;
      return true;
    }).length;
  };

  Review.findByIdAndDelete = async function (id) {
    const found = reviewsDb.get(id?.toString());
    reviewsDb.delete(id?.toString());
    return found;
  };

  Review.create = async function (data) {
    const rev = {
      _id: new mongoose.Types.ObjectId(),
      product: data.product,
      user: data.user,
      order: data.order,
      rating: data.rating,
      title: data.title,
      comment: data.comment,
      images: data.images || [],
      isVerifiedPurchase: data.isVerifiedPurchase ?? true,
      createdAt: new Date(),
      save: async function () {
        reviewsDb.set(this._id.toString(), this);
        return this;
      }
    };
    reviewsDb.set(rev._id.toString(), rev);
    return rev;
  };

  console.log('--- 1. User Profile & Password Security Tests ---');

  // Test 1: Unauthorized access to profile rejected
  const res1 = await makeRequest('/api/v1/users/profile');
  assert(res1.statusCode === 401, 'GET /users/profile rejects unauthenticated request with 401');

  // Test 2: Authenticated user retrieves own profile
  const res2 = await makeRequest('/api/v1/users/profile', {
    headers: { Authorization: `Bearer ${customer1Token}` }
  });
  assert(res2.statusCode === 200, 'GET /users/profile returns 200 OK for authenticated user');
  assert(res2.data?.data?.email === 'customer1@novamart.test', 'Returns correct profile email');
  assert(res2.data?.data?.password === undefined, 'Password hash is strictly excluded from profile response');

  // Test 3: Update profile attributes (name, phone, address)
  const res3 = await makeRequest('/api/v1/users/profile', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${customer1Token}` },
    body: {
      name: 'Alexander Mercer',
      phone: '555-9988',
      address: {
        street: '100 Market St',
        city: 'San Francisco',
        state: 'CA',
        postalCode: '94105'
      }
    }
  });
  assert(res3.statusCode === 200, 'PUT /users/profile returns 200 OK');
  const updatedUser1 = usersDb.get(customerId1);
  assert(updatedUser1.name === 'Alexander Mercer', 'Updates user name in database');
  assert(updatedUser1.phone === '555-9988', 'Updates user phone in database');
  assert(updatedUser1.address.city === 'San Francisco', 'Updates nested address in database');

  // Test 4: Privilege escalation and role tampering blocked
  const res4 = await makeRequest('/api/v1/users/profile', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${customer1Token}` },
    body: {
      role: 'admin',
      isEmailVerified: false,
      sellerProfile: new mongoose.Types.ObjectId()
    }
  });
  assert(res4.statusCode === 200, 'PUT /users/profile completes without crashing on forbidden fields');
  assert(usersDb.get(customerId1).role === 'customer', 'Role tampering strictly prevented: role remains "customer"');

  // Test 5: Change password with incorrect current password fails
  const res5 = await makeRequest('/api/v1/users/change-password', {
    method: 'POST',
    headers: { Authorization: `Bearer ${customer1Token}` },
    body: {
      currentPassword: 'WrongPassword999!',
      newPassword: 'BrandNewPassword123!'
    }
  });
  assert(res5.statusCode === 400, 'POST /users/change-password rejects incorrect current password with 400');

  // Test 6: Change password with valid current password succeeds
  const res6 = await makeRequest('/api/v1/users/change-password', {
    method: 'POST',
    headers: { Authorization: `Bearer ${customer1Token}` },
    body: {
      currentPassword: 'CurrentPassword123!',
      newPassword: 'BrandNewPassword123!'
    }
  });
  assert(res6.statusCode === 200, 'POST /users/change-password succeeds with 200 OK');
  assert(
    await comparePassword('BrandNewPassword123!', usersDb.get(customerId1).password),
    'New password is encrypted and verified with bcrypt'
  );

  console.log('\n--- 2. Wishlist Management Tests ---');

  // Test 7: Unauthorized wishlist access rejected
  const res7 = await makeRequest('/api/v1/wishlist');
  assert(res7.statusCode === 401, 'GET /wishlist rejects unauthenticated request with 401');

  // Test 8: Add product to wishlist
  const res8 = await makeRequest(`/api/v1/wishlist/${prod1Id.toString()}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${customer1Token}` }
  });
  assert(res8.statusCode === 200, 'POST /wishlist/:productId adds product to wishlist');
  assert(res8.data?.data?.products?.length === 1, 'Wishlist item count is 1');

  // Test 9: Duplicate prevention in wishlist
  const res9 = await makeRequest(`/api/v1/wishlist/${prod1Id.toString()}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${customer1Token}` }
  });
  assert(res9.statusCode === 200, 'POST /wishlist/:productId with existing item returns 200');
  assert(res9.data?.data?.products?.length === 1, 'Duplicate prevention: item count remains 1');

  // Test 10: Check wishlist status
  const res10 = await makeRequest(`/api/v1/wishlist/check/${prod1Id.toString()}`, {
    headers: { Authorization: `Bearer ${customer1Token}` }
  });
  assert(res10.statusCode === 200 && res10.data?.data?.isWishlisted === true, 'GET /wishlist/check/:id reports true');

  // Test 11: Add second product
  await makeRequest(`/api/v1/wishlist/${prod2Id.toString()}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${customer1Token}` }
  });
  const res11 = await makeRequest('/api/v1/wishlist', {
    headers: { Authorization: `Bearer ${customer1Token}` }
  });
  assert(res11.data?.data?.products?.length === 2, 'GET /wishlist returns 2 active wishlisted products');

  // Test 12: Remove product from wishlist
  const res12 = await makeRequest(`/api/v1/wishlist/${prod1Id.toString()}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${customer1Token}` }
  });
  assert(res12.statusCode === 200, 'DELETE /wishlist/:productId removes product from wishlist');
  assert(res12.data?.data?.products?.length === 1, 'Wishlist item count reduced to 1');

  // Test 13: Clear wishlist
  const res13 = await makeRequest('/api/v1/wishlist', {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${customer1Token}` }
  });
  assert(res13.statusCode === 200, 'DELETE /wishlist clears all items');
  assert(res13.data?.data?.products?.length === 0, 'Wishlist is now empty');

  console.log('\n--- 3. Product Reviews & Ratings Tests ---');

  // Test 14: Non-purchaser cannot review product (403 Forbidden)
  const res14 = await makeRequest('/api/v1/reviews', {
    method: 'POST',
    headers: { Authorization: `Bearer ${customer2Token}` },
    body: {
      productId: prod1Id.toString(),
      rating: 5,
      comment: 'I did not buy this product but I want to leave a review.'
    }
  });
  assert(
    res14.statusCode === 403,
    'POST /reviews rejects customers who have not purchased the product (403 Forbidden)'
  );

  // Test 15: Invalid review data (rating > 5) rejected
  const res15 = await makeRequest('/api/v1/reviews', {
    method: 'POST',
    headers: { Authorization: `Bearer ${customer1Token}` },
    body: {
      productId: prod1Id.toString(),
      rating: 6,
      comment: 'Out of range rating test'
    }
  });
  assert(res15.statusCode === 422 || res15.statusCode === 400, 'POST /reviews rejects out-of-range rating (400/422)');

  // Test 16: Verified buyer submits a valid review
  let createdReviewId = null;
  const res16 = await makeRequest('/api/v1/reviews', {
    method: 'POST',
    headers: { Authorization: `Bearer ${customer1Token}` },
    body: {
      productId: prod1Id.toString(),
      rating: 5,
      title: 'Incredible sound and noise cancellation',
      comment: 'These are the best wireless headphones I have ever owned. Exceptional ANC!'
    }
  });
  assert(res16.statusCode === 201, 'POST /reviews allows verified purchaser to submit a review (201 Created)');
  assert(res16.data?.data?.isVerifiedPurchase === true, 'Review marked with isVerifiedPurchase: true');
  createdReviewId = res16.data?.data?._id;

  // Test 17: Product rating aggregation updated
  assert(product1.rating === 5.0, 'Product rating recalculated to 5.0');
  assert(product1.reviewCount === 1, 'Product review count recalculated to 1');

  // Test 18: Duplicate review prevention
  const res18 = await makeRequest('/api/v1/reviews', {
    method: 'POST',
    headers: { Authorization: `Bearer ${customer1Token}` },
    body: {
      productId: prod1Id.toString(),
      rating: 4,
      comment: 'Attempting to submit a second review for the same product.'
    }
  });
  assert(res18.statusCode === 400, 'POST /reviews blocks duplicate review for the same product (400 Bad Request)');

  // Test 19: Public can read reviews & rating stats
  const res19 = await makeRequest(`/api/v1/reviews/product/${prod1Id.toString()}`);
  assert(res19.statusCode === 200, 'GET /reviews/product/:id returns reviews publicly');
  assert(res19.data?.data?.reviews?.length === 1, 'Returns 1 review');
  assert(res19.data?.data?.stats?.averageRating === 5.0, 'Stats include accurate averageRating: 5.0');
  assert(res19.data?.data?.stats?.distribution?.[5] === 1, 'Stats include rating distribution');

  // Test 20: Another customer cannot update someone else's review
  const res20 = await makeRequest(`/api/v1/reviews/${createdReviewId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${customer2Token}` },
    body: { rating: 1, comment: 'Hacking another user review' }
  });
  assert(res20.statusCode === 403, "PUT /reviews/:id forbids modifying another customer's review (403)");

  // Test 21: Author updates their own review & rating recalculates
  const res21 = await makeRequest(`/api/v1/reviews/${createdReviewId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${customer1Token}` },
    body: {
      rating: 4,
      comment: 'Updated review: After 2 months, battery life is solid 4 stars.'
    }
  });
  assert(res21.statusCode === 200, 'PUT /reviews/:id allows author to update their review');
  assert(product1.rating === 4.0, 'Product average rating updated dynamically to 4.0');

  // Test 22: Non-author, non-admin cannot delete review
  const res22 = await makeRequest(`/api/v1/reviews/${createdReviewId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${customer2Token}` }
  });
  assert(res22.statusCode === 403, 'DELETE /reviews/:id forbids unauthorized deletion (403)');

  // Test 23: Admin moderation: Admin can delete any review
  const res23 = await makeRequest(`/api/v1/reviews/${createdReviewId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  assert(res23.statusCode === 200, 'DELETE /reviews/:id allows Admin moderation deletion (200 OK)');
  assert(product1.rating === 0, 'Product average rating resets to 0 after review deletion');
  assert(product1.reviewCount === 0, 'Product reviewCount resets to 0 after review deletion');

  // Clean up server
  await new Promise((resolve) => server.close(resolve));
  console.log('\nTest HTTP server shut down cleanly.');

  console.log('\n====================================================');
  console.log(`Phase 5 Test Results: ${passed} passed, ${failed} failed`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
};

runPhase5Tests().catch((err) => {
  console.error('Test execution failed:', err);
  if (server) server.close();
  process.exit(1);
});
