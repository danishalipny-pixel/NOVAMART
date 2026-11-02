import http from 'http';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { generateAccessToken } from '../src/utils/tokenUtils.js';
import { User } from '../src/models/User.js';
import { Seller } from '../src/models/Seller.js';
import { Product } from '../src/models/Product.js';
import { Order } from '../src/models/Order.js';

const TEST_PORT = 5096;
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

const runPhase6Tests = async () => {
  console.log('====================================================');
  console.log('   NOVAMART: Phase 6 Seller & Admin Management     ');
  console.log('====================================================\n');

  // Start HTTP server on test port
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(TEST_PORT, '127.0.0.1', resolve));
  console.log(`Test HTTP server started on http://127.0.0.1:${TEST_PORT}\n`);

  // In-Memory Database Repositories
  const usersDb = new Map();
  const sellersDb = new Map();
  const productsDb = new Map();
  const ordersDb = new Map();

  // Test Entities Identifiers
  const customer1Id = new mongoose.Types.ObjectId().toString();
  const customer2Id = new mongoose.Types.ObjectId().toString();
  const seller1UserId = new mongoose.Types.ObjectId().toString();
  const seller1ProfileId = new mongoose.Types.ObjectId().toString();
  const seller2UserId = new mongoose.Types.ObjectId().toString();
  const seller2ProfileId = new mongoose.Types.ObjectId().toString();
  const adminId = new mongoose.Types.ObjectId().toString();

  // Auth Tokens
  const customer1Token = generateAccessToken({
    userId: customer1Id,
    email: 'applicant1@novamart.test',
    role: 'customer'
  });

  const customer2Token = generateAccessToken({
    userId: customer2Id,
    email: 'customer2@novamart.test',
    role: 'customer'
  });

  const seller1Token = generateAccessToken({
    userId: seller1UserId,
    email: 'sony.store@novamart.test',
    role: 'seller'
  });

  const seller2Token = generateAccessToken({
    userId: seller2UserId,
    email: 'apple.store@novamart.test',
    role: 'seller'
  });

  const adminToken = generateAccessToken({
    userId: adminId,
    email: 'admin.root@novamart.test',
    role: 'admin'
  });

  // Seed User 1 (Customer applicant)
  const user1 = {
    _id: customer1Id,
    name: 'John Applicant',
    email: 'applicant1@novamart.test',
    role: 'customer',
    isActive: true,
    sellerProfile: null,
    save: async function () {
      usersDb.set(this._id.toString(), this);
      return this;
    }
  };
  usersDb.set(customer1Id, user1);

  // Seed User 2 (Customer 2)
  const user2 = {
    _id: customer2Id,
    name: 'Clara Oswald',
    email: 'customer2@novamart.test',
    role: 'customer',
    isActive: true,
    sellerProfile: null,
    save: async function () {
      usersDb.set(this._id.toString(), this);
      return this;
    }
  };
  usersDb.set(customer2Id, user2);

  // Seed Seller 1 User & Profile (Approved)
  const seller1User = {
    _id: seller1UserId,
    name: 'Sony Official',
    email: 'sony.store@novamart.test',
    role: 'seller',
    isActive: true,
    sellerProfile: seller1ProfileId,
    save: async function () {
      usersDb.set(this._id.toString(), this);
      return this;
    }
  };
  usersDb.set(seller1UserId, seller1User);

  const seller1Profile = {
    _id: seller1ProfileId,
    user: seller1UserId,
    storeName: 'Sony Official Store',
    storeSlug: 'sony-official-store',
    description: 'Direct audio gear',
    status: 'approved',
    rejectionReason: '',
    rating: 4.9,
    save: async function () {
      sellersDb.set(this._id.toString(), this);
      return this;
    }
  };
  sellersDb.set(seller1ProfileId, seller1Profile);

  // Seed Seller 2 User & Profile (Approved)
  const seller2User = {
    _id: seller2UserId,
    name: 'Apple Store',
    email: 'apple.store@novamart.test',
    role: 'seller',
    isActive: true,
    sellerProfile: seller2ProfileId,
    save: async function () {
      usersDb.set(this._id.toString(), this);
      return this;
    }
  };
  usersDb.set(seller2UserId, seller2User);

  const seller2Profile = {
    _id: seller2ProfileId,
    user: seller2UserId,
    storeName: 'Apple Flagship Store',
    storeSlug: 'apple-flagship-store',
    description: 'Premium laptops and tech',
    status: 'approved',
    rejectionReason: '',
    rating: 4.8,
    save: async function () {
      sellersDb.set(this._id.toString(), this);
      return this;
    }
  };
  sellersDb.set(seller2ProfileId, seller2Profile);

  // Seed Root Admin
  const adminUser = {
    _id: adminId,
    name: 'Super Admin',
    email: 'admin.root@novamart.test',
    role: 'admin',
    isActive: true,
    save: async function () {
      usersDb.set(this._id.toString(), this);
      return this;
    }
  };
  usersDb.set(adminId, adminUser);

  // Seed Products for Seller 1 and Seller 2
  const prod1Id = new mongoose.Types.ObjectId().toString();
  const prod2Id = new mongoose.Types.ObjectId().toString();
  const prod3Id = new mongoose.Types.ObjectId().toString();

  const product1 = {
    _id: prod1Id,
    seller: seller1ProfileId,
    name: 'Sony WH-1000XM5 Headphones',
    slug: 'sony-wh-1000xm5-headphones',
    price: 399.99,
    stock: 20,
    isActive: true,
    brand: 'Sony',
    images: ['https://example.com/sony.webp'],
    rating: 4.8,
    reviewCount: 15,
    save: async function () {
      productsDb.set(this._id.toString(), this);
      return this;
    }
  };
  productsDb.set(prod1Id, product1);

  const product2 = {
    _id: prod2Id,
    seller: seller1ProfileId,
    name: 'Sony Bravia 4K TV',
    slug: 'sony-bravia-4k-tv',
    price: 1299.99,
    stock: 2, // low stock <= 5
    isActive: true,
    brand: 'Sony',
    images: ['https://example.com/tv.webp'],
    rating: 4.9,
    reviewCount: 30,
    save: async function () {
      productsDb.set(this._id.toString(), this);
      return this;
    }
  };
  productsDb.set(prod2Id, product2);

  const product3 = {
    _id: prod3Id,
    seller: seller2ProfileId,
    name: 'Apple MacBook Pro M3',
    slug: 'apple-macbook-pro-m3',
    price: 2499.0,
    stock: 12,
    isActive: true,
    brand: 'Apple',
    images: ['https://example.com/macbook.webp'],
    rating: 5.0,
    reviewCount: 8,
    save: async function () {
      productsDb.set(this._id.toString(), this);
      return this;
    }
  };
  productsDb.set(prod3Id, product3);

  // Seed Orders
  const order1Id = new mongoose.Types.ObjectId().toString();
  const order1 = {
    _id: order1Id,
    orderNumber: 'NM-ORD-001',
    customer: customer1Id,
    sellers: [seller1ProfileId],
    items: [
      {
        product: prod1Id,
        seller: seller1ProfileId,
        name: product1.name,
        price: 399.99,
        quantity: 2
      }
    ],
    pricing: {
      itemsPrice: 799.98,
      shippingPrice: 0,
      taxPrice: 0,
      total: 799.98
    },
    status: 'delivered',
    payment: {
      status: 'succeeded',
      method: 'stripe'
    },
    createdAt: new Date(),
    save: async function () {
      ordersDb.set(this._id.toString(), this);
      return this;
    }
  };
  ordersDb.set(order1Id, order1);

  // ==========================================
  // Mock Model Implementations
  // ==========================================
  User.findById = function (id) {
    const raw = usersDb.get(id?.toString()) || null;
    if (!raw) {
      return {
        select: function () { return this; },
        populate: async () => null,
        then: (resolve) => resolve(null)
      };
    }
    const userDoc = {
      ...raw,
      save: async function () {
        raw.role = this.role;
        raw.sellerProfile = this.sellerProfile;
        raw.isActive = this.isActive;
        usersDb.set(raw._id.toString(), raw);
        return this;
      }
    };
    return {
      select: function () { return this; },
      populate: function () { return Promise.resolve(userDoc); },
      then: (resolve) => resolve(userDoc)
    };
  };

  User.findOne = async function (filter = {}) {
    for (const u of usersDb.values()) {
      if (filter.email && u.email === filter.email) return u;
      if (filter._id && u._id.toString() === filter._id.toString()) return u;
    }
    return null;
  };

  User.countDocuments = async function (filter = {}) {
    let count = 0;
    for (const u of usersDb.values()) {
      if (filter.role && u.role !== filter.role) continue;
      if (filter.isActive !== undefined && u.isActive !== filter.isActive) continue;
      count++;
    }
    return count;
  };

  User.find = function (filter = {}) {
    let results = Array.from(usersDb.values()).filter((u) => {
      if (filter.role && u.role !== filter.role) return false;
      if (filter.isActive !== undefined && u.isActive !== filter.isActive) return false;
      return true;
    });

    const chain = {
      select: () => chain,
      sort: () => chain,
      skip: () => chain,
      limit: () => chain,
      populate: () => chain,
      then: (resolve) => resolve(results)
    };
    return chain;
  };

  // Mock Seller Model Constructor & Static methods
  class MockSeller {
    constructor(data) {
      this._id = data._id || new mongoose.Types.ObjectId().toString();
      this.user = data.user;
      this.storeName = data.storeName;
      this.storeSlug = data.storeSlug;
      this.description = data.description || '';
      this.contactPhone = data.contactPhone || '';
      this.contactEmail = data.contactEmail || '';
      this.socialLinks = data.socialLinks || {};
      this.status = data.status || 'pending';
      this.rejectionReason = data.rejectionReason || '';
      this.createdAt = new Date();
    }

    async save() {
      sellersDb.set(this._id.toString(), this);
      return this;
    }
  }

  // Override Seller Prototype / functions
  Seller.findById = async function (id) {
    const raw = sellersDb.get(id?.toString()) || null;
    if (!raw) return null;
    const data = typeof raw.toObject === 'function' ? raw.toObject() : raw;
    const doc = {
      ...data,
      save: async function () {
        raw.status = this.status;
        raw.rejectionReason = this.rejectionReason;
        sellersDb.set(raw._id.toString(), raw);
        return this;
      },
      populate: function () {
        return Promise.resolve(this);
      }
    };
    return doc;
  };

  Seller.findOne = async function (filter = {}) {
    for (const s of sellersDb.values()) {
      if (filter.user && s.user.toString() === filter.user.toString()) {
        return s;
      }
      if (filter.storeSlug && s.storeSlug === filter.storeSlug) {
        if (filter._id && filter._id.$ne && s._id.toString() === filter._id.$ne.toString()) {
          continue;
        }
        return s;
      }
    }
    return null;
  };

  Seller.countDocuments = async function (filter = {}) {
    let count = 0;
    for (const s of sellersDb.values()) {
      if (filter.status && s.status !== filter.status) continue;
      count++;
    }
    return count;
  };

  Seller.find = function (filter = {}) {
    let results = Array.from(sellersDb.values()).filter((s) => {
      if (filter.status && s.status !== filter.status) return false;
      return true;
    });

    const chain = {
      sort: () => chain,
      skip: () => chain,
      limit: () => chain,
      populate: () => chain,
      then: (resolve) => resolve(results)
    };
    return chain;
  };

  Seller.create = async function (data) {
    const doc = new MockSeller(data);
    await doc.save();
    return doc;
  };

  // Bind new Seller instantiation
  Seller.prototype.save = async function () {
    if (!this._id) {
      this._id = new mongoose.Types.ObjectId().toString();
    }
    sellersDb.set(this._id.toString(), this);
    return this;
  };

  Product.findById = async function (id) {
    const raw = productsDb.get(id?.toString()) || null;
    if (!raw) return null;
    const doc = {
      ...raw,
      save: async function () {
        raw.stock = this.stock;
        raw.isActive = this.isActive;
        productsDb.set(raw._id.toString(), raw);
        return this;
      }
    };
    return doc;
  };

  Product.findOne = async function (filter = {}) {
    for (const p of productsDb.values()) {
      if (filter.slug && p.slug === filter.slug) return p;
    }
    return null;
  };

  Product.find = function (filter = {}) {
    let results = Array.from(productsDb.values()).filter((p) => {
      if (filter.seller && p.seller.toString() !== filter.seller.toString()) return false;
      if (filter.isActive !== undefined && p.isActive !== filter.isActive) return false;
      return true;
    });

    const chain = {
      sort: () => chain,
      skip: () => chain,
      limit: () => chain,
      populate: () => chain,
      then: (resolve) => resolve(results)
    };
    return chain;
  };

  Product.countDocuments = async function (filter = {}) {
    let count = 0;
    for (const p of productsDb.values()) {
      if (filter.isActive !== undefined && p.isActive !== filter.isActive) continue;
      count++;
    }
    return count;
  };

  Product.findByIdAndDelete = async function (id) {
    const doc = productsDb.get(id?.toString()) || null;
    if (doc) productsDb.delete(id.toString());
    return doc;
  };

  Order.findById = async function (id) {
    const raw = ordersDb.get(id?.toString()) || null;
    if (!raw) return null;
    const doc = {
      ...raw,
      save: async function () {
        raw.status = this.status;
        ordersDb.set(raw._id.toString(), raw);
        return this;
      },
      populate: function () {
        return Promise.resolve(this);
      }
    };
    return doc;
  };

  Order.find = function (filter = {}) {
    let results = Array.from(ordersDb.values()).filter((o) => {
      if (filter.status && filter.status.$ne && o.status === filter.status.$ne) return false;
      if (filter.status && typeof filter.status === 'string' && o.status !== filter.status) return false;
      if (filter.$or) {
        const match = filter.$or.some((clause) => {
          if (clause.sellers) {
            const sid = clause.sellers.toString();
            return o.sellers.some((s) => s.toString() === sid);
          }
          if (clause['items.seller']) {
            const sid = clause['items.seller'].toString();
            return o.items.some((it) => it.seller.toString() === sid);
          }
          return false;
        });
        if (!match) return false;
      }
      return true;
    });

    const chain = {
      sort: () => chain,
      skip: () => chain,
      limit: () => chain,
      populate: () => chain,
      then: (resolve) => resolve(results)
    };
    return chain;
  };

  Order.countDocuments = async function () {
    return ordersDb.size;
  };

  // ==========================================
  // SECTION 1: Seller Application & Onboarding
  // ==========================================
  console.log('--- Section 1: Seller Application & Status ---');

  // 1.1 Unauthenticated application
  const unauthApp = await makeRequest('/api/v1/sellers/apply', {
    method: 'POST',
    body: { storeName: 'Audio Haven', storeSlug: 'audio-haven' }
  });
  assert(unauthApp.statusCode === 401, '1.1 Unauthenticated application is rejected with 401');

  // 1.2 Customer 1 submits application
  const applyRes = await makeRequest('/api/v1/sellers/apply', {
    method: 'POST',
    headers: { Authorization: `Bearer ${customer1Token}` },
    body: {
      storeName: 'Audio Haven',
      storeSlug: 'audio-haven',
      description: 'Handcrafted headphone accessories',
      contactPhone: '555-0144'
    }
  });
  assert(applyRes.statusCode === 201, '1.2 Customer seller application succeeds with 201 Created');
  assert(applyRes.data.data.status === 'pending', '1.2 Seller profile status initialized as "pending"');

  // 1.3 User role remains customer (No auto-promotion)
  const user1Current = usersDb.get(customer1Id);
  assert(user1Current.role === 'customer', '1.3 Applicant user role remains "customer" pending admin review');

  // 1.4 Duplicate application rejected
  const dupAppRes = await makeRequest('/api/v1/sellers/apply', {
    method: 'POST',
    headers: { Authorization: `Bearer ${customer1Token}` },
    body: { storeName: 'Audio Haven 2' }
  });
  assert(dupAppRes.statusCode === 409, '1.4 Re-application while pending rejected with 409 Conflict');

  // 1.5 Duplicate store slug from another user
  const dupSlugRes = await makeRequest('/api/v1/sellers/apply', {
    method: 'POST',
    headers: { Authorization: `Bearer ${customer2Token}` },
    body: { storeName: 'Audio Haven Direct', storeSlug: 'audio-haven' }
  });
  assert(dupSlugRes.statusCode === 409, '1.5 Duplicate store slug rejected with 409 Conflict');

  // 1.6 Check application status
  const statusRes = await makeRequest('/api/v1/sellers/application-status', {
    headers: { Authorization: `Bearer ${customer1Token}` }
  });
  assert(statusRes.statusCode === 200, '1.6 GET /api/v1/sellers/application-status returns 200 OK');
  assert(statusRes.data.data.hasApplied === true, '1.6 Status confirms hasApplied = true');
  assert(statusRes.data.data.status === 'pending', '1.6 Status confirms application status = "pending"');

  // 1.7 Non-applicant status check
  const nonAppStatus = await makeRequest('/api/v1/sellers/application-status', {
    headers: { Authorization: `Bearer ${customer2Token}` }
  });
  assert(nonAppStatus.data.data.hasApplied === false, '1.7 Non-applicant returns hasApplied = false');

  // ==========================================
  // SECTION 2: Seller Dashboard & Stock Update
  // ==========================================
  console.log('\n--- Section 2: Seller Dashboard & Stock Update ---');

  // 2.1 Unauthenticated dashboard access
  const unauthDash = await makeRequest('/api/v1/sellers/dashboard');
  assert(unauthDash.statusCode === 401, '2.1 Unauthenticated seller dashboard rejected with 401');

  // 2.2 Customer dashboard access rejected
  const custDash = await makeRequest('/api/v1/sellers/dashboard', {
    headers: { Authorization: `Bearer ${customer1Token}` }
  });
  assert(custDash.statusCode === 403, '2.2 Customer access to seller dashboard rejected with 403 Forbidden');

  // 2.3 Approved seller dashboard access
  const sellerDash = await makeRequest('/api/v1/sellers/dashboard', {
    headers: { Authorization: `Bearer ${seller1Token}` }
  });
  assert(sellerDash.statusCode === 200, '2.3 Approved seller dashboard returns 200 OK');
  const m = sellerDash.data.data.metrics;
  assert(m.totalProducts === 2, '2.3 Seller metrics reports accurate totalProducts count (2)');
  assert(m.totalStock === 22, '2.3 Seller metrics reports accurate totalStock (20 + 2 = 22)');
  assert(m.lowStockCount === 1, '2.3 Seller metrics identifies low stock item (TV stock=2)');
  assert(m.orderCount === 1, '2.3 Seller metrics reports accurate orderCount (1)');
  assert(m.totalRevenue === 799.98, '2.3 Seller metrics aggregates correct revenue ($799.98)');
  assert(m.totalItemsSold === 2, '2.3 Seller metrics reports accurate total items sold (2)');

  // 2.4 Quick stock update on merchant's own product
  const stockUpdateRes = await makeRequest(`/api/v1/sellers/products/${prod1Id}/stock`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${seller1Token}` },
    body: { stock: 35 }
  });
  assert(stockUpdateRes.statusCode === 200, '2.4 Seller successfully updates stock of own product (200 OK)');
  assert(stockUpdateRes.data.data.stock === 35, '2.4 Product stock updated to 35 in database');

  // 2.5 Negative stock rejection
  const badStockRes = await makeRequest(`/api/v1/sellers/products/${prod1Id}/stock`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${seller1Token}` },
    body: { stock: -5 }
  });
  assert(badStockRes.statusCode === 400, '2.5 Negative stock value rejected with 400 Bad Request');

  // 2.6 Cross-merchant isolation: Seller 2 cannot update Seller 1's product
  const crossStockRes = await makeRequest(`/api/v1/sellers/products/${prod1Id}/stock`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${seller2Token}` },
    body: { stock: 99 }
  });
  assert(crossStockRes.statusCode === 403, '2.6 Cross-merchant stock modification strictly blocked with 403 Forbidden');

  // ==========================================
  // SECTION 3: Administrator Platform Dashboard
  // ==========================================
  console.log('\n--- Section 3: Admin Platform Dashboard ---');

  // 3.1 Unauthenticated access rejected
  const unauthAdminDash = await makeRequest('/api/v1/admin/dashboard');
  assert(unauthAdminDash.statusCode === 401, '3.1 Unauthenticated admin dashboard rejected with 401');

  // 3.2 Customer access rejected
  const custAdminDash = await makeRequest('/api/v1/admin/dashboard', {
    headers: { Authorization: `Bearer ${customer1Token}` }
  });
  assert(custAdminDash.statusCode === 403, '3.2 Customer access to admin dashboard rejected with 403 Forbidden');

  // 3.3 Seller access rejected
  const sellerAdminDash = await makeRequest('/api/v1/admin/dashboard', {
    headers: { Authorization: `Bearer ${seller1Token}` }
  });
  assert(sellerAdminDash.statusCode === 403, '3.3 Seller access to admin dashboard rejected with 403 Forbidden');

  // 3.4 Root admin access
  const adminDash = await makeRequest('/api/v1/admin/dashboard', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  assert(adminDash.statusCode === 200, '3.4 Admin dashboard returns 200 OK');
  const adm = adminDash.data.data.metrics;
  assert(adm.totalCustomers === 2, '3.4 Platform metrics reports 2 registered customers');
  assert(adm.totalSellers === 2, '3.4 Platform metrics reports 2 approved sellers');
  assert(adm.pendingApplications === 1, '3.4 Platform metrics reports 1 pending application');
  assert(adm.totalProducts === 3, '3.4 Platform metrics reports 3 total catalog products');
  assert(adm.totalOrders === 1, '3.4 Platform metrics reports 1 order');
  assert(adm.totalRevenue === 799.98, '3.4 Platform metrics reports $799.98 total volume');

  // ==========================================
  // SECTION 4: Admin Seller Review & Approval
  // ==========================================
  console.log('\n--- Section 4: Admin Seller Onboarding Workflow ---');

  // 4.1 Pending sellers list
  const pendingRes = await makeRequest('/api/v1/admin/sellers/pending', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  assert(pendingRes.statusCode === 200, '4.1 Admin retrieves pending sellers list (200 OK)');
  const pendingApp = pendingRes.data.data.sellers.find((s) => s.storeName === 'Audio Haven');
  assert(pendingApp !== undefined, '4.1 "Audio Haven" application found in pending list');

  // 4.2 Non-admin cannot approve
  const unauthApprove = await makeRequest(`/api/v1/admin/sellers/${pendingApp._id}/approve`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${customer2Token}` }
  });
  assert(unauthApprove.statusCode === 403, '4.2 Customer cannot approve seller (403 Forbidden)');

  // 4.3 Admin approves seller application
  const approveRes = await makeRequest(`/api/v1/admin/sellers/${pendingApp._id}/approve`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  assert(approveRes.statusCode === 200, '4.3 Admin approves seller application with 200 OK');
  assert(approveRes.data.data.status === 'approved', '4.3 Seller status transitioned to "approved"');

  // Verify User 1 upgraded to seller
  const updatedUser1 = usersDb.get(customer1Id);
  assert(updatedUser1.role === 'seller', '4.3 Applicant role successfully upgraded to "seller" upon admin approval');

  // 4.4 Admin rejects application
  // Let customer 2 submit an application
  const app2Res = await makeRequest('/api/v1/sellers/apply', {
    method: 'POST',
    headers: { Authorization: `Bearer ${customer2Token}` },
    body: { storeName: 'Vintage Vinyl', storeSlug: 'vintage-vinyl' }
  });
  assert(app2Res.statusCode === 201, '4.4 Customer 2 submits seller application');
  const app2Id = app2Res.data.data._id;

  const rejectRes = await makeRequest(`/api/v1/admin/sellers/${app2Id}/reject`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: { reason: 'Incomplete business license information' }
  });
  assert(rejectRes.statusCode === 200, '4.4 Admin rejects seller application with 200 OK');
  assert(rejectRes.data.data.status === 'rejected', '4.4 Seller status transitioned to "rejected"');
  assert(
    rejectRes.data.data.rejectionReason === 'Incomplete business license information',
    '4.4 Rejection rationale recorded accurately'
  );

  // ==========================================
  // SECTION 5: Admin User Account Management
  // ==========================================
  console.log('\n--- Section 5: Admin User Management ---');

  // 5.1 List users
  const usersListRes = await makeRequest('/api/v1/admin/users', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  assert(usersListRes.statusCode === 200, '5.1 Admin retrieves user accounts list (200 OK)');
  assert(usersListRes.data.data.users.length >= 4, '5.1 Retrieved user accounts collection');

  // 5.2 Deactivate user account
  const deactRes = await makeRequest(`/api/v1/admin/users/${customer2Id}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: { isActive: false }
  });
  assert(deactRes.statusCode === 200, '5.2 Admin deactivates user account (200 OK)');
  const deactUser = usersDb.get(customer2Id);
  assert(deactUser.isActive === false, '5.2 User account isActive set to false in database');

  // 5.3 Prevent self-deactivation by admin
  const selfDeactRes = await makeRequest(`/api/v1/admin/users/${adminId}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: { isActive: false }
  });
  assert(selfDeactRes.statusCode === 400, '5.3 Administrator cannot deactivate their own account (400 Bad Request guard)');

  // ==========================================
  // SECTION 6: Admin Catalog Moderation
  // ==========================================
  console.log('\n--- Section 6: Admin Catalog Moderation ---');

  // 6.1 List products
  const modProductsRes = await makeRequest('/api/v1/admin/products', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  assert(modProductsRes.statusCode === 200, '6.1 Admin retrieves products for moderation (200 OK)');

  // 6.2 Hide/unhide product
  const hideRes = await makeRequest(`/api/v1/admin/products/${prod2Id}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: { isActive: false }
  });
  assert(hideRes.statusCode === 200, '6.2 Admin hides product listing (200 OK)');
  const hiddenProd = productsDb.get(prod2Id);
  assert(hiddenProd.isActive === false, '6.2 Product isActive set to false in database');

  // 6.3 Admin permanently deletes product
  const delProdRes = await makeRequest(`/api/v1/admin/products/${prod3Id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  assert(delProdRes.statusCode === 200, '6.3 Admin deletes product (200 OK)');
  assert(!productsDb.has(prod3Id), '6.3 Product removed from database');

  // ==========================================
  // SECTION 7: Admin Marketplace Orders
  // ==========================================
  console.log('\n--- Section 7: Admin Marketplace Orders ---');

  // 7.1 List orders
  const adminOrdersRes = await makeRequest('/api/v1/admin/orders', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  assert(adminOrdersRes.statusCode === 200, '7.1 Admin lists all marketplace orders (200 OK)');

  // 7.2 Update fulfillment status
  const orderStatusRes = await makeRequest(`/api/v1/admin/orders/${order1Id}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: { status: 'shipped' }
  });
  assert(orderStatusRes.statusCode === 200, '7.2 Admin updates order status to "shipped" (200 OK)');
  const updatedOrder = ordersDb.get(order1Id);
  assert(updatedOrder.status === 'shipped', '7.2 Order status updated in database');
  assert(updatedOrder.payment.status === 'succeeded', '7.3 Payment status remains intact and protected from tampering');

  // Teardown
  await new Promise((resolve) => server.close(resolve));
  console.log(`\nTest HTTP server closed.`);

  console.log('====================================================');
  console.log(`Phase 6 Tests Completed: ${passed} passed, ${failed} failed`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
};

runPhase6Tests().catch((err) => {
  console.error('Test execution error:', err);
  if (server) server.close();
  process.exit(1);
});
