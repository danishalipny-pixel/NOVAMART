import http from 'http';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import app from '../src/app.js';
import { generateAccessToken } from '../src/utils/tokenUtils.js';
import { stripe } from '../src/config/stripe.js';
import { config } from '../src/config/env.js';
import { User } from '../src/models/User.js';
import { Seller } from '../src/models/Seller.js';
import { Product } from '../src/models/Product.js';
import { Order } from '../src/models/Order.js';

const TEST_PORT = 5097;
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

    if (Buffer.isBuffer(options.body)) {
      payload = options.body;
      headers['Content-Length'] = payload.length;
    } else if (options.body && typeof options.body === 'object') {
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
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              data: parsed
            });
          } catch {
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              data: body
            });
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

const createMultipartPayload = (fieldName, filename, mimeType, fileBuffer) => {
  const boundary = '----TestBoundary' + Math.random().toString(36).substring(2);
  const prefix = Buffer.from(
    `--${boundary}\r\nContent-Disposition: form-data; name="${fieldName}"; filename="${filename}"\r\nContent-Type: ${mimeType}\r\n\r\n`
  );
  const suffix = Buffer.from(`\r\n--${boundary}--\r\n`);
  const body = Buffer.concat([prefix, fileBuffer, suffix]);
  return {
    boundary,
    body,
    contentType: `multipart/form-data; boundary=${boundary}`
  };
};

const runPhase7Tests = async () => {
  console.log('====================================================');
  console.log('   NOVAMART: Phase 7 Production Readiness Suite     ');
  console.log('====================================================\n');

  // Start HTTP server on test port
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(TEST_PORT, '127.0.0.1', resolve));
  console.log(`Test HTTP server started on http://127.0.0.1:${TEST_PORT}\n`);

  // Repositories in-memory
  const usersDb = new Map();
  const sellersDb = new Map();
  const productsDb = new Map();
  const ordersDb = new Map();

  // Test User Accounts
  const customerId = new mongoose.Types.ObjectId().toString();
  const otherCustomerId = new mongoose.Types.ObjectId().toString();
  const sellerUserId = new mongoose.Types.ObjectId().toString();
  const sellerProfileId = new mongoose.Types.ObjectId().toString();
  const pendingSellerUserId = new mongoose.Types.ObjectId().toString();
  const pendingSellerProfileId = new mongoose.Types.ObjectId().toString();
  const adminId = new mongoose.Types.ObjectId().toString();

  // JWT Tokens
  const customerToken = generateAccessToken({
    userId: customerId,
    email: 'customer.verified@novamart.test',
    role: 'customer'
  });

  const otherCustomerToken = generateAccessToken({
    userId: otherCustomerId,
    email: 'other.customer@novamart.test',
    role: 'customer'
  });

  const sellerToken = generateAccessToken({
    userId: sellerUserId,
    email: 'approved.merchant@novamart.test',
    role: 'seller'
  });

  const pendingSellerToken = generateAccessToken({
    userId: pendingSellerUserId,
    email: 'pending.merchant@novamart.test',
    role: 'seller'
  });

  const _adminToken = generateAccessToken({
    userId: adminId,
    email: 'root.admin@novamart.test',
    role: 'admin'
  });

  // Seed Users
  usersDb.set(customerId, {
    _id: customerId,
    name: 'Verified Customer',
    email: 'customer.verified@novamart.test',
    role: 'customer',
    isActive: true
  });

  usersDb.set(otherCustomerId, {
    _id: otherCustomerId,
    name: 'Other Customer',
    email: 'other.customer@novamart.test',
    role: 'customer',
    isActive: true
  });

  usersDb.set(sellerUserId, {
    _id: sellerUserId,
    name: 'Approved Merchant',
    email: 'approved.merchant@novamart.test',
    role: 'seller',
    sellerProfile: sellerProfileId,
    isActive: true
  });

  usersDb.set(pendingSellerUserId, {
    _id: pendingSellerUserId,
    name: 'Pending Merchant',
    email: 'pending.merchant@novamart.test',
    role: 'seller',
    sellerProfile: pendingSellerProfileId,
    isActive: true
  });

  usersDb.set(adminId, {
    _id: adminId,
    name: 'System Administrator',
    email: 'root.admin@novamart.test',
    role: 'admin',
    isActive: true
  });

  // Seed Sellers
  sellersDb.set(sellerProfileId, {
    _id: sellerProfileId,
    user: sellerUserId,
    storeName: 'Elite Audio Labs',
    storeSlug: 'elite-audio-labs',
    status: 'approved'
  });

  sellersDb.set(pendingSellerProfileId, {
    _id: pendingSellerProfileId,
    user: pendingSellerUserId,
    storeName: 'Pending Audio Boutique',
    storeSlug: 'pending-audio-boutique',
    status: 'pending'
  });

  // Seed Products
  const prodId = new mongoose.Types.ObjectId().toString();
  const product = {
    _id: prodId,
    name: 'Sony Noise Canceling XM5',
    slug: 'sony-noise-canceling-xm5',
    price: 399.99,
    stock: 50,
    isActive: true,
    seller: sellerProfileId,
    brand: 'Sony',
    categorySlug: 'electronics',
    images: ['https://example.com/sony.webp'],
    save: async function () {
      productsDb.set(this._id.toString(), this);
      return this;
    }
  };
  productsDb.set(prodId, product);

  // Mongoose Model Stubs
  User.findById = function (id) {
    const raw = usersDb.get(id?.toString()) || null;
    return {
      select: () => ({
        populate: async () => raw,
        then: (res) => res(raw)
      }),
      populate: async () => raw,
      then: (res) => res(raw)
    };
  };

  User.findOne = function (filter = {}) {
    let raw = null;
    for (const u of usersDb.values()) {
      if (filter.email && u.email === filter.email) {
        raw = u;
        break;
      }
      if (filter._id && u._id.toString() === filter._id.toString()) {
        raw = u;
        break;
      }
    }
    const queryObj = {
      select: () => queryObj,
      then: (resolve) => resolve(raw)
    };
    return queryObj;
  };

  User.countDocuments = async () => usersDb.size;
  User.find = () => ({
    select: () => ({
      sort: () => ({
        skip: () => ({
          limit: () => ({
            populate: async () => Array.from(usersDb.values()),
            then: (res) => res(Array.from(usersDb.values()))
          })
        })
      })
    })
  });

  Seller.findOne = async function (filter = {}) {
    for (const s of sellersDb.values()) {
      if (filter.user && s.user.toString() === filter.user.toString()) return s;
      if (filter.storeSlug && s.storeSlug === filter.storeSlug) return s;
    }
    return null;
  };

  Seller.findById = async function (id) {
    return sellersDb.get(id?.toString()) || null;
  };

  Seller.countDocuments = async (filter = {}) => {
    let c = 0;
    for (const s of sellersDb.values()) {
      if (filter.status && s.status !== filter.status) continue;
      c++;
    }
    return c;
  };

  Seller.find = () => ({
    sort: () => ({
      skip: () => ({
        limit: () => ({
          populate: async () => Array.from(sellersDb.values()),
          then: (res) => res(Array.from(sellersDb.values()))
        })
      })
    })
  });

  Product.findById = async function (id) {
    const raw = productsDb.get(id?.toString()) || null;
    if (!raw) return null;
    return {
      ...raw,
      save: async function () {
        raw.stock = this.stock;
        productsDb.set(raw._id.toString(), raw);
        return this;
      }
    };
  };

  Product.find = () => ({
    sort: () => ({
      skip: () => ({
        limit: () => ({
          populate: async () => Array.from(productsDb.values()),
          then: (res) => res(Array.from(productsDb.values()))
        })
      })
    })
  });

  Product.countDocuments = async () => productsDb.size;

  Order.prototype.save = async function () {
    if (!this._id) this._id = new mongoose.Types.ObjectId().toString();
    ordersDb.set(this._id.toString(), this);
    return this;
  };

  Order.prototype.populate = async function () {
    return this;
  };

  Order.findById = async function (id) {
    const raw = ordersDb.get(id?.toString()) || null;
    if (!raw) return null;
    const data = typeof raw.toObject === 'function' ? raw.toObject() : raw;
    const doc = {
      ...data,
      save: async function () {
        raw.status = this.status;
        raw.payment = this.payment;
        ordersDb.set(raw._id.toString(), raw);
        return this;
      },
      populate: function () {
        return Promise.resolve(this);
      }
    };
    return doc;
  };

  Order.findOne = async function (filter = {}) {
    for (const raw of ordersDb.values()) {
      const o = typeof raw.toObject === 'function' ? raw.toObject() : raw;
      if (filter.orderNumber && o.orderNumber === filter.orderNumber) {
        return {
          ...o,
          save: async function () {
            raw.status = this.status;
            raw.payment = this.payment;
            ordersDb.set(raw._id.toString(), raw);
            return this;
          }
        };
      }
    }
    return null;
  };

  Order.countDocuments = async () => ordersDb.size;
  Order.find = () => ({
    sort: () => ({
      skip: () => ({
        limit: () => ({
          populate: async () => Array.from(ordersDb.values()),
          then: (res) => res(Array.from(ordersDb.values()))
        })
      })
    })
  });

  Order.create = async function (data) {
    const doc = {
      _id: new mongoose.Types.ObjectId().toString(),
      ...data,
      save: async function () {
        ordersDb.set(this._id.toString(), this);
        return this;
      }
    };
    await doc.save();
    return doc;
  };

  // Mock Stripe SDK
  stripe.paymentIntents = {
    create: async ({ amount, currency, metadata, description }) => {
      return {
        id: `pi_test_${Date.now()}`,
        client_secret: `pi_test_${Date.now()}_secret_test`,
        amount,
        currency,
        metadata,
        description,
        status: 'requires_payment_method'
      };
    }
  };

  stripe.webhooks = {
    constructEvent: (rawBody, signature, _secret) => {
      if (signature !== 'valid_stripe_signature_2026') {
        throw new Error('Invalid signature');
      }
      return JSON.parse(rawBody.toString('utf8'));
    }
  };

  // ==========================================
  // SECTION 1: Production Security Headers & Sanitization
  // ==========================================
  console.log('--- Section 1: Security Headers & Sanitization ---');

  const healthResponse = await makeRequest('/api/v1/health');
  assert(healthResponse.statusCode === 200, '1.1 Health endpoint responds with 200 OK');
  assert(
    healthResponse.headers['x-content-type-options'] === 'nosniff',
    '1.1 X-Content-Type-Options: nosniff header present'
  );
  assert(
    healthResponse.headers['x-frame-options'] === 'SAMEORIGIN',
    '1.1 X-Frame-Options: SAMEORIGIN header present'
  );
  assert(
    healthResponse.headers['referrer-policy'] === 'strict-origin-when-cross-origin',
    '1.1 Referrer-Policy header present'
  );
  assert(
    healthResponse.headers['x-powered-by'] === undefined,
    '1.2 X-Powered-By header is removed/hidden from client'
  );

  // 1.3 NoSQL Injection query sanitization test
  const sanitizeTest = await makeRequest('/api/v1/auth/login', {
    method: 'POST',
    body: {
      email: { $gt: '' }, // Injected MongoDB operator
      password: 'password123'
    }
  });
  // Since $gt is stripped, email becomes empty object {}, which fails validation
  assert(sanitizeTest.statusCode === 422, '1.3 Injected NoSQL operators stripped and safely rejected');

  // ==========================================
  // SECTION 2: Rate Limiting Throttling
  // ==========================================
  console.log('\n--- Section 2: Rate Limiting & Throttling ---');

  assert(
    sanitizeTest.headers['ratelimit-limit'] !== undefined,
    '2.1 RateLimit-Limit header present on throttled endpoints'
  );
  assert(
    sanitizeTest.headers['ratelimit-remaining'] !== undefined,
    '2.1 RateLimit-Remaining header present'
  );

  // Send requests to test rate limit overflow
  let rateLimitHit = false;
  for (let i = 0; i < 35; i++) {
    const res = await makeRequest('/api/v1/auth/login', {
      method: 'POST',
      body: { email: 'rate.limit@test.com', password: 'Short' }
    });
    if (res.statusCode === 429) {
      rateLimitHit = true;
      assert(res.headers['retry-after'] !== undefined, '2.2 Retry-After header provided on 429 response');
      break;
    }
  }
  assert(rateLimitHit === true, '2.2 Rate limit triggers 429 Too Many Requests upon threshold violation');

  // ==========================================
  // SECTION 3: JWT Token Lifecycle & Edge Cases
  // ==========================================
  console.log('\n--- Section 3: Token Lifecycle & Edge Cases ---');

  // 3.1 Missing token
  const noTokenRes = await makeRequest('/api/v1/users/profile');
  assert(noTokenRes.statusCode === 401, '3.1 Missing token rejected with 401 Unauthorized');

  // 3.2 Malformed token
  const malformedRes = await makeRequest('/api/v1/users/profile', {
    headers: { Authorization: 'Bearer this.is.an.invalid.token' }
  });
  assert(malformedRes.statusCode === 401, '3.2 Malformed token rejected with 401 Unauthorized');

  // 3.3 Expired token
  const expiredToken = jwt.sign(
    { userId: customerId, role: 'customer' },
    config.jwt.secret,
    { expiresIn: -10 } // Expired 10 seconds ago
  );
  const expiredRes = await makeRequest('/api/v1/users/profile', {
    headers: { Authorization: `Bearer ${expiredToken}` }
  });
  assert(expiredRes.statusCode === 401, '3.3 Expired token rejected with 401 Unauthorized');
  assert(
    expiredRes.data.message.includes('expired'),
    '3.3 Error message identifies token expiration specifically'
  );

  // ==========================================
  // SECTION 4: End-to-End Customer Order & Stripe Checkout
  // ==========================================
  console.log('\n--- Section 4: End-to-End Order & Stripe Lifecycle ---');

  // 4.1 Successful Order Creation
  const orderPayload = {
    items: [{ product: prodId, quantity: 2 }],
    shippingAddress: {
      fullName: 'John Smith',
      street: '123 Market St',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94103',
      country: 'US',
      phone: '555-0100'
    },
    paymentMethod: 'stripe'
  };

  const createOrderRes = await makeRequest('/api/v1/orders', {
    method: 'POST',
    headers: { Authorization: `Bearer ${customerToken}` },
    body: orderPayload
  });
  assert(createOrderRes.statusCode === 201, '4.1 Customer creates order successfully (201 Created)');
  const createdOrder = createOrderRes.data.data;
  assert(createdOrder.orderNumber.startsWith('NM-'), '4.1 Order number properly formatted (NM-XXXX)');
  assert(createdOrder.pricing.subtotal === 799.98, '4.1 Subtotal accurately calculated server-side ($799.98)');
  assert(createdOrder.pricing.total === 863.98, '4.1 Total price with tax accurately calculated server-side ($863.98)');
  const orderId = createdOrder._id || createdOrder.id;

  // 4.2 Invalid order with 0 quantity
  const badOrderRes = await makeRequest('/api/v1/orders', {
    method: 'POST',
    headers: { Authorization: `Bearer ${customerToken}` },
    body: { ...orderPayload, items: [{ product: prodId, quantity: 0 }] }
  });
  assert(badOrderRes.statusCode === 422 || badOrderRes.statusCode === 400, '4.2 Order with 0 quantity rejected with validation error');

  // 4.3 Stripe PaymentIntent Creation
  const paymentIntentRes = await makeRequest('/api/v1/payments/create-intent', {
    method: 'POST',
    headers: { Authorization: `Bearer ${customerToken}` },
    body: { orderId }
  });
  assert(paymentIntentRes.statusCode === 201, '4.3 Payment intent created successfully (201 Created)');
  assert(paymentIntentRes.data.data.clientSecret !== undefined, '4.3 Returns Stripe clientSecret');
  assert(paymentIntentRes.data.data.amountCents === 86398, '4.3 Correct amount in cents (86398)');

  // 4.4 Cross-customer payment intent blocked
  const crossPayRes = await makeRequest('/api/v1/payments/create-intent', {
    method: 'POST',
    headers: { Authorization: `Bearer ${otherCustomerToken}` },
    body: { orderId }
  });
  assert(crossPayRes.statusCode === 403, '4.4 Cross-customer payment attempt strictly forbidden (403)');

  // 4.5 Stripe Webhook Signature Verification Failure
  const fakeWebhookPayload = Buffer.from(
    JSON.stringify({
      id: 'evt_test_1',
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_test_123',
          metadata: { orderId }
        }
      }
    })
  );

  const badSigRes = await makeRequest('/api/v1/payments/webhook', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'stripe-signature': 'invalid_signature_attempt'
    },
    body: fakeWebhookPayload
  });
  assert(badSigRes.statusCode === 400, '4.5 Webhook rejected with invalid Stripe signature (400)');

  // 4.6 Verified Webhook Payment Confirmation
  const validWebhookRes = await makeRequest('/api/v1/payments/webhook', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'stripe-signature': 'valid_stripe_signature_2026'
    },
    body: fakeWebhookPayload
  });
  assert(validWebhookRes.statusCode === 200, '4.6 Verified Stripe webhook processed successfully (200 OK)');

  const capturedOrder = ordersDb.get(orderId);
  assert(capturedOrder.payment.status === 'captured', '4.6 Order payment status updated to "captured"');
  assert(capturedOrder.status === 'processing', '4.6 Order status transitioned to "processing"');

  // 4.7 Webhook Idempotency Check (Duplicate Event)
  const dupWebhookRes = await makeRequest('/api/v1/payments/webhook', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'stripe-signature': 'valid_stripe_signature_2026'
    },
    body: fakeWebhookPayload
  });
  assert(dupWebhookRes.statusCode === 200, '4.7 Duplicate webhook acknowledged with 200 OK');
  assert(dupWebhookRes.data.duplicate === true, '4.7 Webhook idempotency confirms duplicate = true');

  // 4.8 Cannot create payment intent for captured order
  const rePayRes = await makeRequest('/api/v1/payments/create-intent', {
    method: 'POST',
    headers: { Authorization: `Bearer ${customerToken}` },
    body: { orderId }
  });
  assert(rePayRes.statusCode === 400, '4.8 Payment intent creation for already-paid order rejected with 400');

  // ==========================================
  // SECTION 5: Strict RBAC & Unauthorized Access
  // ==========================================
  console.log('\n--- Section 5: RBAC & Access Hardening ---');

  // 5.1 Customer accessing seller dashboard
  const custSellerDash = await makeRequest('/api/v1/sellers/dashboard', {
    headers: { Authorization: `Bearer ${customerToken}` }
  });
  assert(custSellerDash.statusCode === 403, '5.1 Customer access to seller dashboard forbidden (403)');

  // 5.2 Pending seller accessing seller dashboard
  const pendingSellerDash = await makeRequest('/api/v1/sellers/dashboard', {
    headers: { Authorization: `Bearer ${pendingSellerToken}` }
  });
  assert(pendingSellerDash.statusCode === 403, '5.2 Pending unapproved seller access forbidden (403)');

  // 5.3 Customer accessing admin dashboard
  const custAdminDash = await makeRequest('/api/v1/admin/dashboard', {
    headers: { Authorization: `Bearer ${customerToken}` }
  });
  assert(custAdminDash.statusCode === 403, '5.3 Customer access to admin dashboard forbidden (403)');

  // 5.4 Seller accessing admin dashboard
  const sellerAdminDash = await makeRequest('/api/v1/admin/dashboard', {
    headers: { Authorization: `Bearer ${sellerToken}` }
  });
  assert(sellerAdminDash.statusCode === 403, '5.4 Seller access to admin dashboard forbidden (403)');

  // ==========================================
  // SECTION 6: File Upload Security & Validation
  // ==========================================
  console.log('\n--- Section 6: File Upload Constraints ---');

  // 6.1 Unauthenticated upload attempt
  const unauthUpload = await makeRequest('/api/v1/media/upload', {
    method: 'POST'
  });
  assert(unauthUpload.statusCode === 401, '6.1 Unauthenticated media upload rejected with 401');

  // 6.2 Disallowed MIME format upload (e.g. PDF/HTML)
  const badMimePayload = createMultipartPayload(
    'images',
    'exploit.pdf',
    'application/pdf',
    Buffer.from('%PDF-1.4 test file')
  );
  const badMimeRes = await makeRequest('/api/v1/media/upload', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${sellerToken}`,
      'Content-Type': badMimePayload.contentType
    },
    body: badMimePayload.body
  });
  assert(badMimeRes.statusCode === 400, '6.2 Unsupported file format (PDF) rejected with 400 Bad Request');

  // ==========================================
  // SECTION 7: Health & System Diagnostics
  // ==========================================
  console.log('\n--- Section 7: Health & System Diagnostics ---');

  // 7.1 Welcome endpoint
  const rootRes = await makeRequest('/');
  assert(rootRes.statusCode === 200, '7.1 Root API responds with 200 OK');
  assert(rootRes.data.status === 'running', '7.1 Status is "running"');

  // 7.2 Health check
  const healthCheck = await makeRequest('/api/v1/health');
  assert(healthCheck.statusCode === 200, '7.2 Health check responds with 200 OK');
  assert(healthCheck.data.data.status === 'healthy', '7.2 Health status is "healthy"');
  assert(healthCheck.data.data.uptime?.seconds >= 0, '7.2 System uptime reported');

  // 7.3 Verbose diagnostics
  const verboseCheck = await makeRequest('/api/v1/health?verbose=true');
  assert(verboseCheck.statusCode === 200, '7.3 Verbose health diagnostics returns 200 OK');
  assert(verboseCheck.data.data.system !== undefined, '7.3 System diagnostic metrics included');

  // Cleanup
  await new Promise((resolve) => server.close(resolve));
  console.log(`\nTest HTTP server closed.`);

  console.log('====================================================');
  console.log(`Phase 7 Tests Completed: ${passed} passed, ${failed} failed`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
};

runPhase7Tests().catch((err) => {
  console.error('Test execution error:', err);
  if (server) server.close();
  process.exit(1);
});
