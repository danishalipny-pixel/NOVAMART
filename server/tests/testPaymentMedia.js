import http from 'http';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { generateAccessToken } from '../src/utils/tokenUtils.js';
import { stripe } from '../src/config/stripe.js';
import { cloudinary } from '../src/config/cloudinary.js';
import { Order } from '../src/models/Order.js';
import { Product } from '../src/models/Product.js';
import { Seller } from '../src/models/Seller.js';

const TEST_PORT = 5098;
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

const runPaymentMediaTests = async () => {
  console.log('====================================================');
  console.log('   NOVAMART: Phase 4 Payment & Media Test Suite     ');
  console.log('====================================================\n');

  // Start HTTP server on test port
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(TEST_PORT, '127.0.0.1', resolve));
  console.log(`Test HTTP server started on http://127.0.0.1:${TEST_PORT}\n`);

  // In-Memory Database Repositories
  const ordersDb = new Map();
  const productsDb = new Map();
  const sellersDb = new Map();

  // Test Entities
  const customerId1 = new mongoose.Types.ObjectId().toString();
  const customerId2 = new mongoose.Types.ObjectId().toString();
  const sellerUserId = new mongoose.Types.ObjectId().toString();
  const otherSellerUserId = new mongoose.Types.ObjectId().toString();
  const adminUserId = new mongoose.Types.ObjectId().toString();

  const sellerProfileId = new mongoose.Types.ObjectId();
  const otherSellerProfileId = new mongoose.Types.ObjectId();

  // Tokens
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

  const sellerToken = generateAccessToken({
    userId: sellerUserId,
    email: 'seller@novamart.test',
    role: 'seller',
    sellerProfile: sellerProfileId.toString()
  });

  const otherSellerToken = generateAccessToken({
    userId: otherSellerUserId,
    email: 'otherseller@novamart.test',
    role: 'seller',
    sellerProfile: otherSellerProfileId.toString()
  });

  const _adminToken = generateAccessToken({
    userId: adminUserId,
    email: 'admin@novamart.test',
    role: 'admin'
  });

  // Populate Mock Sellers
  sellersDb.set(sellerProfileId.toString(), {
    _id: sellerProfileId,
    user: sellerUserId,
    storeName: 'Audio Haven',
    status: 'approved'
  });

  sellersDb.set(otherSellerProfileId.toString(), {
    _id: otherSellerProfileId,
    user: otherSellerUserId,
    storeName: 'Other Store',
    status: 'approved'
  });

  // Populate Mock Products
  const productId1 = new mongoose.Types.ObjectId();
  const testProduct1 = {
    _id: productId1,
    name: 'Sony WH-1000XM5 Wireless Headphones',
    slug: 'sony-wh-1000xm5-wireless-headphones',
    categorySlug: 'electronics',
    seller: sellerProfileId,
    price: 399.99,
    stock: 15,
    images: ['https://res.cloudinary.com/novamart/products/sony-1.webp'],
    save: async function () {
      productsDb.set(this._id.toString(), this);
      return this;
    }
  };
  productsDb.set(productId1.toString(), testProduct1);

  // Populate Mock Orders
  const orderId1 = new mongoose.Types.ObjectId();
  const testOrder1 = {
    _id: orderId1,
    orderNumber: 'NM-100001',
    customer: customerId1,
    items: [
      {
        product: productId1,
        name: testProduct1.name,
        price: 399.99,
        quantity: 2,
        total: 799.98
      }
    ],
    pricing: {
      subtotal: 799.98,
      tax: 64.0,
      shipping: 0.0,
      discount: 0.0,
      total: 863.98
    },
    payment: {
      method: 'card',
      status: 'pending',
      transactionId: null,
      paidAt: null
    },
    status: 'pending',
    save: async function () {
      ordersDb.set(this._id.toString(), this);
      return this;
    }
  };
  ordersDb.set(orderId1.toString(), testOrder1);

  // Patch Mongoose Models
  Order.findById = async function (id) {
    return ordersDb.get(id?.toString()) || null;
  };
  Order.findOne = async function (filter = {}) {
    if (filter.orderNumber) {
      return Array.from(ordersDb.values()).find((o) => o.orderNumber === filter.orderNumber) || null;
    }
    return null;
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

  Seller.findOne = async function (filter = {}) {
    if (filter.user) {
      return Array.from(sellersDb.values()).find((s) => s.user.toString() === filter.user.toString()) || null;
    }
    return null;
  };

  // Mock Stripe SDK
  let stripeMockCreatedIntent = null;
  stripe.paymentIntents.create = async (params) => {
    stripeMockCreatedIntent = params;
    return {
      id: 'pi_test_' + Math.random().toString(36).substring(2, 10),
      client_secret: 'pi_test_secret_' + Math.random().toString(36).substring(2, 10),
      amount: params.amount,
      currency: params.currency,
      metadata: params.metadata,
      status: 'requires_payment_method'
    };
  };

  stripe.webhooks.constructEvent = (rawBody, signature, _secret) => {
    if (!signature || signature !== 'valid_stripe_signature_test') {
      throw new Error('Invalid signature header');
    }
    const parsed = JSON.parse(rawBody.toString('utf-8'));
    return parsed;
  };

  // Mock Cloudinary SDK
  cloudinary.uploader.upload_stream = (options, callback) => {
    return {
      end: (buffer) => {
        setTimeout(() => {
          callback(null, {
            secure_url: `https://res.cloudinary.com/novamart/image/upload/v1700000000/novamart/products/test_${Date.now()}.webp`,
            public_id: `novamart/products/test_${Date.now()}`,
            format: 'webp',
            width: 800,
            height: 800,
            bytes: buffer.length,
            created_at: new Date().toISOString()
          });
        }, 10);
      }
    };
  };

  cloudinary.uploader.destroy = async (publicId) => {
    return { result: 'ok', public_id: publicId };
  };

  console.log('--- 1. Stripe PaymentIntent Creation Tests ---');

  // Test 1: Unauthorized access rejected
  const res1 = await makeRequest('/api/v1/payments/create-intent', {
    method: 'POST',
    body: { orderId: orderId1.toString() }
  });
  assert(res1.statusCode === 401, 'POST /payments/create-intent fails with 401 Unauthorized without token');

  // Test 2: Missing orderId rejected
  const res2 = await makeRequest('/api/v1/payments/create-intent', {
    method: 'POST',
    headers: { Authorization: `Bearer ${customer1Token}` },
    body: {}
  });
  assert(res2.statusCode === 400, 'POST /payments/create-intent fails with 400 when orderId is missing');

  // Test 3: Customer cannot pay for another customer's order
  const res3 = await makeRequest('/api/v1/payments/create-intent', {
    method: 'POST',
    headers: { Authorization: `Bearer ${customer2Token}` },
    body: { orderId: orderId1.toString() }
  });
  assert(res3.statusCode === 403, "POST /payments/create-intent fails with 403 when customer pays for another's order");

  // Test 4: Successful PaymentIntent creation with server-side amount calculation
  const res4 = await makeRequest('/api/v1/payments/create-intent', {
    method: 'POST',
    headers: { Authorization: `Bearer ${customer1Token}` },
    body: { orderId: orderId1.toString() }
  });
  assert(res4.statusCode === 201, 'POST /payments/create-intent returns 201 Created for valid customer order');
  assert(
    res4.data?.data?.amountCents === 86398,
    'Calculates payable amount strictly server-side in cents (863.98 * 100 = 86398)'
  );
  assert(
    Boolean(res4.data?.data?.clientSecret && res4.data?.data?.paymentIntentId),
    'Returns Stripe clientSecret and paymentIntentId'
  );
  assert(
    stripeMockCreatedIntent?.metadata?.orderId === orderId1.toString(),
    'Attaches authenticated orderId and customerId to Stripe metadata'
  );

  console.log('\n--- 2. Stripe Webhook Verification & Processing Tests ---');

  // Test 5: Missing stripe-signature header rejected
  const res5 = await makeRequest('/api/v1/payments/webhook', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { type: 'payment_intent.succeeded' }
  });
  assert(res5.statusCode === 400, 'POST /payments/webhook rejects missing stripe-signature header with 400');

  // Test 6: Invalid signature rejected
  const res6 = await makeRequest('/api/v1/payments/webhook', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'stripe-signature': 'invalid_forged_signature'
    },
    body: { type: 'payment_intent.succeeded' }
  });
  assert(res6.statusCode === 400, 'POST /payments/webhook rejects forged Stripe signature with 400');

  // Test 7: Successful payment_intent.succeeded webhook updates order to captured and processing
  const successWebhookPayload = {
    id: 'evt_test_success_123',
    type: 'payment_intent.succeeded',
    data: {
      object: {
        id: 'pi_test_confirmed_123',
        status: 'succeeded',
        metadata: {
          orderId: orderId1.toString(),
          orderNumber: testOrder1.orderNumber
        }
      }
    }
  };
  const res7 = await makeRequest('/api/v1/payments/webhook', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'stripe-signature': 'valid_stripe_signature_test'
    },
    body: successWebhookPayload
  });
  assert(res7.statusCode === 200, 'POST /payments/webhook accepts verified payment_intent.succeeded');
  assert(testOrder1.payment.status === 'captured', "Order payment status transitioned to 'captured'");
  assert(testOrder1.status === 'processing', "Order status transitioned to 'processing'");
  assert(Boolean(testOrder1.payment.paidAt), 'Order records paidAt timestamp');

  // Test 8: Idempotency guard prevents duplicate processing
  const res8 = await makeRequest('/api/v1/payments/webhook', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'stripe-signature': 'valid_stripe_signature_test'
    },
    body: successWebhookPayload
  });
  assert(res8.statusCode === 200 && res8.data?.duplicate === true, 'Webhook idempotency guard skips redundant event processing');

  // Test 9: payment_intent.canceled restores product stock and marks order cancelled
  const cancelOrderId = new mongoose.Types.ObjectId();
  const cancelOrder = {
    _id: cancelOrderId,
    orderNumber: 'NM-CANCEL-01',
    customer: customerId1,
    items: [{ product: productId1, quantity: 3 }],
    pricing: { total: 100.0 },
    payment: { status: 'pending', method: 'stripe' },
    status: 'pending',
    save: async function () {
      ordersDb.set(this._id.toString(), this);
      return this;
    }
  };
  ordersDb.set(cancelOrderId.toString(), cancelOrder);
  const initialStock = testProduct1.stock; // 15

  const cancelWebhookPayload = {
    id: 'evt_test_cancel_456',
    type: 'payment_intent.canceled',
    data: {
      object: {
        id: 'pi_test_canceled_456',
        metadata: {
          orderId: cancelOrderId.toString()
        }
      }
    }
  };
  const res9 = await makeRequest('/api/v1/payments/webhook', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'stripe-signature': 'valid_stripe_signature_test'
    },
    body: cancelWebhookPayload
  });
  assert(res9.statusCode === 200, 'POST /payments/webhook accepts payment_intent.canceled');
  assert(cancelOrder.status === 'cancelled', "Cancelled order status is set to 'cancelled'");
  assert(testProduct1.stock === initialStock + 3, 'Restores inventory quantities upon payment cancellation');

  console.log('\n--- 3. Payment Status Endpoint Tests ---');

  // Test 10: Customer can inspect own order payment status
  const res10 = await makeRequest(`/api/v1/payments/status/${orderId1.toString()}`, {
    headers: { Authorization: `Bearer ${customer1Token}` }
  });
  assert(res10.statusCode === 200, 'GET /payments/status/:orderId retrieves payment details for order owner');
  assert(res10.data?.data?.payment?.status === 'captured', 'Returns correct captured payment status');

  // Test 11: Customer cannot inspect another customer's payment status
  const res11 = await makeRequest(`/api/v1/payments/status/${orderId1.toString()}`, {
    headers: { Authorization: `Bearer ${customer2Token}` }
  });
  assert(res11.statusCode === 403, "GET /payments/status/:orderId rejects access to another customer's order with 403");

  console.log('\n--- 4. Cloud Media Storage (Cloudinary & Multer) Tests ---');

  // Test 12: Customer cannot upload media (403 Forbidden)
  const dummyImageBytes = Buffer.from('FAKE-JPEG-IMAGE-DATA-BINARY');
  const multipart1 = createMultipartPayload('images', 'headphones.jpg', 'image/jpeg', dummyImageBytes);
  const res12 = await makeRequest('/api/v1/media/upload', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${customer1Token}`,
      'Content-Type': multipart1.contentType
    },
    body: multipart1.body
  });
  assert(res12.statusCode === 403, 'POST /media/upload forbids customers from uploading images (403)');

  // Test 13: Seller can upload image batch to Cloudinary
  const res13 = await makeRequest('/api/v1/media/upload', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${sellerToken}`,
      'Content-Type': multipart1.contentType
    },
    body: multipart1.body
  });
  assert(res13.statusCode === 201, 'POST /media/upload allows authenticated sellers to upload images (201)');
  assert(
    Array.isArray(res13.data?.data) && res13.data?.data[0]?.secureUrl?.includes('cloudinary.com'),
    'Returns Cloudinary secureUrl and metadata'
  );

  // Test 14: Seller cannot attach images to another merchant's product (403)
  const res14 = await makeRequest(`/api/v1/media/products/${productId1.toString()}/images`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${otherSellerToken}`,
      'Content-Type': multipart1.contentType
    },
    body: multipart1.body
  });
  assert(
    res14.statusCode === 403,
    "POST /media/products/:id/images prevents modifying another merchant's product (403)"
  );

  // Test 15: Seller owner can attach images to own product
  const initialImagesCount = testProduct1.images.length;
  const res15 = await makeRequest(`/api/v1/media/products/${productId1.toString()}/images`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${sellerToken}`,
      'Content-Type': multipart1.contentType
    },
    body: multipart1.body
  });
  assert(res15.statusCode === 200, 'POST /media/products/:id/images successfully attaches images for seller owner');
  assert(
    testProduct1.images.length === initialImagesCount + 1,
    'Appends new Cloudinary image URL to product image array'
  );

  // Test 16: Seller cannot delete the last remaining image
  testProduct1.images = ['https://res.cloudinary.com/novamart/products/only-image.webp'];
  const res16 = await makeRequest(`/api/v1/media/products/${productId1.toString()}/images`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${sellerToken}`,
      'Content-Type': 'application/json'
    },
    body: { imageUrl: testProduct1.images[0] }
  });
  assert(res16.statusCode === 400, 'DELETE /media/products/:id/images rejects deleting last remaining image with 400');

  // Test 17: Seller can delete an image when multiple exist
  const keepImage = 'https://res.cloudinary.com/novamart/products/keep.webp';
  const removeImage = 'https://res.cloudinary.com/novamart/products/remove.webp';
  testProduct1.images = [keepImage, removeImage];
  const res17 = await makeRequest(`/api/v1/media/products/${productId1.toString()}/images`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${sellerToken}`,
      'Content-Type': 'application/json'
    },
    body: { imageUrl: removeImage, publicId: 'novamart/products/remove' }
  });
  assert(res17.statusCode === 200, 'DELETE /media/products/:id/images successfully removes image from product');
  assert(
    testProduct1.images.length === 1 && testProduct1.images[0] === keepImage,
    'Correctly removes targeted image URL from product'
  );

  // Test 18: Delete Cloudinary asset directly via publicId
  const res18 = await makeRequest('/api/v1/media/novamart/products/sample_img', {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${sellerToken}` }
  });
  assert(res18.statusCode === 200, 'DELETE /media/:publicId destroys asset in Cloudinary');

  // Clean up server
  await new Promise((resolve) => server.close(resolve));
  console.log('\nTest HTTP server shut down cleanly.');

  console.log('\n====================================================');
  console.log(`Phase 4 Test Results: ${passed} passed, ${failed} failed`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
};

runPaymentMediaTests().catch((err) => {
  console.error('Test execution failed:', err);
  if (server) server.close();
  process.exit(1);
});
