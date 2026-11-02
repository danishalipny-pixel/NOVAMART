import http from 'http';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { generateAccessToken } from '../src/utils/tokenUtils.js';
import { Seller } from '../src/models/Seller.js';
import { Category } from '../src/models/Category.js';
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
    const payload = options.body ? JSON.stringify(options.body) : null;
    const req = http.request(
      {
        host: '127.0.0.1',
        port: TEST_PORT,
        path,
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
          ...(options.headers || {})
        }
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

const runCatalogOrderTests = async () => {
  console.log('====================================================');
  console.log('   NOVAMART: Phase 3 Catalog & Order Test Suite     ');
  console.log('====================================================\n');

  // Start HTTP server on test port
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(TEST_PORT, '127.0.0.1', resolve));
  console.log(`Test HTTP server started on http://127.0.0.1:${TEST_PORT}\n`);

  // In-Memory Database Repositories
  const sellersDb = new Map();
  const categoriesDb = new Map();
  const productsDb = new Map();
  const ordersDb = new Map();

  // Patch Mongoose Model methods for isolated integration testing
  Category.find = function (filter = {}) {
    let list = Array.from(categoriesDb.values());
    if (filter.isActive !== undefined) {
      list = list.filter((c) => c.isActive === filter.isActive);
    }
    return {
      sort: () => ({
        populate: () => Promise.resolve(list)
      }),
      populate: () => Promise.resolve(list),
      then: (resolve) => resolve(list)
    };
  };

  Category.findById = function (id) {
    const found = categoriesDb.get(id?.toString());
    return {
      populate: () => Promise.resolve(found || null),
      then: (resolve) => resolve(found || null)
    };
  };

  Category.findOne = function (query) {
    let list = Array.from(categoriesDb.values());
    if (query.$or) {
      const match = list.find((c) =>
        query.$or.some(
          (cond) =>
            (cond.name && c.name.toLowerCase() === cond.name.toLowerCase()) ||
            (cond.slug && c.slug.toLowerCase() === cond.slug.toLowerCase())
        )
      );
      return Promise.resolve(match || null);
    }
    if (query.slug) {
      const match = list.find((c) => c.slug.toLowerCase() === query.slug.toLowerCase());
      return {
        populate: () => Promise.resolve(match || null),
        then: (resolve) => resolve(match || null)
      };
    }
    if (query.name) {
      const match = list.find((c) => c.name.toLowerCase() === query.name.toLowerCase());
      return Promise.resolve(match || null);
    }
    return Promise.resolve(null);
  };

  Category.prototype.save = async function () {
    if (!this._id) this._id = new mongoose.Types.ObjectId();
    categoriesDb.set(this._id.toString(), this);
    return this;
  };

  Category.deleteOne = function (query) {
    if (query._id) categoriesDb.delete(query._id.toString());
    return Promise.resolve({ deletedCount: 1 });
  };

  // Product Mocking
  Product.countDocuments = function (filter = {}) {
    let list = Array.from(productsDb.values());
    if (filter.category) list = list.filter((p) => p.category?.toString() === filter.category.toString());
    if (filter.seller) list = list.filter((p) => p.seller?.toString() === filter.seller.toString());
    if (filter.isActive !== undefined) list = list.filter((p) => p.isActive === filter.isActive);
    return Promise.resolve(list.length);
  };

  Product.find = function (filter = {}) {
    let list = Array.from(productsDb.values());
    if (filter.category) list = list.filter((p) => p.category?.toString() === filter.category.toString());
    if (filter.categorySlug) list = list.filter((p) => p.categorySlug === filter.categorySlug);
    if (filter.seller) list = list.filter((p) => p.seller?.toString() === filter.seller.toString());
    if (filter.stock && filter.stock.$gt !== undefined) list = list.filter((p) => p.stock > filter.stock.$gt);
    if (filter.price) {
      if (filter.price.$gte !== undefined) list = list.filter((p) => p.price >= filter.price.$gte);
      if (filter.price.$lte !== undefined) list = list.filter((p) => p.price <= filter.price.$lte);
    }
    if (filter.$or) {
      list = list.filter((p) =>
        filter.$or.some((cond) => {
          if (cond.name && p.name.toLowerCase().includes(cond.name.$regex.toLowerCase())) return true;
          if (cond.brand && p.brand.toLowerCase().includes(cond.brand.$regex.toLowerCase())) return true;
          return false;
        })
      );
    }

    const chain = {
      sort: () => chain,
      skip: () => chain,
      limit: (l) => {
        const paginated = list.slice(0, l);
        return {
          populate: () => ({
            populate: () => ({
              lean: () => Promise.resolve(paginated)
            }),
            lean: () => Promise.resolve(paginated)
          })
        };
      },
      populate: () => chain,
      then: (resolve) => resolve(list)
    };
    return chain;
  };

  Product.findById = function (id) {
    const found = productsDb.get(id?.toString());
    return {
      populate: () => Promise.resolve(found || null),
      then: (resolve) => resolve(found || null)
    };
  };

  Product.findOne = function (query) {
    let list = Array.from(productsDb.values());
    if (query.slug) {
      const match = list.find((p) => p.slug === query.slug);
      return {
        populate: () => Promise.resolve(match || null),
        then: (resolve) => resolve(match || null)
      };
    }
    if (query.sku) {
      const match = list.find((p) => p.sku === query.sku);
      return Promise.resolve(match || null);
    }
    return Promise.resolve(null);
  };

  Product.prototype.save = async function () {
    if (!this._id) this._id = new mongoose.Types.ObjectId();
    productsDb.set(this._id.toString(), this);
    return this;
  };

  Product.prototype.populate = async function () {
    return this;
  };

  Product.deleteOne = function (query) {
    if (query._id) productsDb.delete(query._id.toString());
    return Promise.resolve({ deletedCount: 1 });
  };

  // Seller Mocking
  Seller.findOne = function (query) {
    if (query.user) {
      const found = Array.from(sellersDb.values()).find(
        (s) => s.user.toString() === query.user.toString()
      );
      return Promise.resolve(found || null);
    }
    return Promise.resolve(null);
  };

  // Order Mocking
  Order.countDocuments = function (filter = {}) {
    let list = Array.from(ordersDb.values());
    if (filter.customer) list = list.filter((o) => o.customer?.toString() === filter.customer.toString());
    return Promise.resolve(list.length);
  };

  Order.find = function (filter = {}) {
    let list = Array.from(ordersDb.values());
    if (filter.customer) list = list.filter((o) => o.customer?.toString() === filter.customer.toString());
    if (filter.$or) {
      list = list.filter((o) =>
        filter.$or.some((cond) => {
          if (cond.sellers && o.sellers) {
            return o.sellers.some((s) => s.toString() === cond.sellers.toString());
          }
          if (cond['items.seller']) {
            return o.items.some((it) => it.seller?.toString() === cond['items.seller'].toString());
          }
          return false;
        })
      );
    }

    const chain = {
      sort: () => chain,
      skip: () => chain,
      limit: (l) => {
        const paginated = list.slice(0, l);
        return {
          populate: () => ({
            populate: () => Promise.resolve(paginated)
          })
        };
      },
      populate: () => chain,
      then: (resolve) => resolve(list)
    };
    return chain;
  };

  Order.findById = function (id) {
    const found = ordersDb.get(id?.toString());
    return {
      populate: () => ({
        populate: () => Promise.resolve(found || null)
      }),
      then: (resolve) => resolve(found || null)
    };
  };

  Order.findOne = function (query) {
    if (query.orderNumber) {
      const found = Array.from(ordersDb.values()).find((o) => o.orderNumber === query.orderNumber);
      return {
        populate: () => ({
          populate: () => Promise.resolve(found || null)
        }),
        then: (resolve) => resolve(found || null)
      };
    }
    return Promise.resolve(null);
  };

  Order.prototype.save = async function () {
    if (!this._id) this._id = new mongoose.Types.ObjectId();
    ordersDb.set(this._id.toString(), this);
    return this;
  };

  Order.prototype.populate = async function () {
    return this;
  };

  try {
    // -------------------------------------------------------------
    // Set Up Identities & JWT Tokens
    // -------------------------------------------------------------
    const customerId = new mongoose.Types.ObjectId().toString();
    const customerToken = generateAccessToken({
      userId: customerId,
      role: 'customer',
      email: 'customer@novamart.com',
      name: 'Customer One'
    });

    const otherCustomerId = new mongoose.Types.ObjectId().toString();
    const otherCustomerToken = generateAccessToken({
      userId: otherCustomerId,
      role: 'customer',
      email: 'other@novamart.com',
      name: 'Other Customer'
    });

    // Seller 1 (Apex Store)
    const seller1UserId = new mongoose.Types.ObjectId().toString();
    const seller1ProfileId = new mongoose.Types.ObjectId();
    const seller1 = {
      _id: seller1ProfileId,
      user: seller1UserId,
      storeName: 'Apex Audio',
      storeSlug: 'apex-audio',
      status: 'approved'
    };
    sellersDb.set(seller1ProfileId.toString(), seller1);

    const seller1Token = generateAccessToken({
      userId: seller1UserId,
      role: 'seller',
      email: 'seller1@apex.com',
      name: 'Seller One',
      sellerProfile: seller1ProfileId.toString()
    });

    // Seller 2 (Titan Store)
    const seller2UserId = new mongoose.Types.ObjectId().toString();
    const seller2ProfileId = new mongoose.Types.ObjectId();
    const seller2 = {
      _id: seller2ProfileId,
      user: seller2UserId,
      storeName: 'Titan Electronics',
      storeSlug: 'titan-electronics',
      status: 'approved'
    };
    sellersDb.set(seller2ProfileId.toString(), seller2);

    const seller2Token = generateAccessToken({
      userId: seller2UserId,
      role: 'seller',
      email: 'seller2@titan.com',
      name: 'Seller Two',
      sellerProfile: seller2ProfileId.toString()
    });

    // Admin Token
    const adminId = new mongoose.Types.ObjectId().toString();
    const adminToken = generateAccessToken({
      userId: adminId,
      role: 'admin',
      email: 'admin@novamart.com',
      name: 'Super Admin'
    });

    // =============================================================
    // SECTION 1: CATEGORY API TESTS
    // =============================================================
    console.log('1. Testing Category Endpoints & Permissions...');

    // 1.1 Non-admin attempt to create category
    const catNoAuth = await makeRequest('/api/v1/categories', {
      method: 'POST',
      body: { name: 'Audio Gear' }
    });
    assert(catNoAuth.statusCode === 401, 'Rejects category creation without token (401)');

    const catCustAuth = await makeRequest('/api/v1/categories', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: { name: 'Audio Gear' }
    });
    assert(catCustAuth.statusCode === 403, 'Customer forbidden from creating category (403)');

    // 1.2 Admin creates category
    const catAdminCreate = await makeRequest('/api/v1/categories', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        name: 'Electronics & Audio',
        slug: 'electronics',
        icon: 'Headphones',
        description: 'Audio and computing equipment'
      }
    });
    assert(catAdminCreate.statusCode === 201, 'Admin successfully creates category (201 Created)');
    assert(catAdminCreate.data.data.slug === 'electronics', 'Category slug matches');
    const createdCatId = catAdminCreate.data.data.id || catAdminCreate.data.data._id;

    // 1.3 Duplicate category rejection
    const catDuplicate = await makeRequest('/api/v1/categories', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { name: 'Electronics & Audio' }
    });
    assert(catDuplicate.statusCode === 409, 'Rejects duplicate category name with 409 Conflict');

    // 1.4 Public read categories
    const catList = await makeRequest('/api/v1/categories');
    assert(catList.statusCode === 200, 'Public read all categories returns 200 OK');
    assert(Array.isArray(catList.data.data), 'Returns array of categories');

    // 1.5 Get single category by ID or slug
    const catGetSingle = await makeRequest(`/api/v1/categories/electronics`);
    assert(catGetSingle.statusCode === 200, 'Public read single category by slug returns 200 OK');
    assert(catGetSingle.data.data.name === 'Electronics & Audio', 'Returns correct category name');

    // 1.6 Update category (Admin)
    const catUpdate = await makeRequest(`/api/v1/categories/${createdCatId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { description: 'Updated premium sound and studio gear' }
    });
    assert(catUpdate.statusCode === 200, 'Admin updates category successfully (200 OK)');

    // =============================================================
    // SECTION 2: PRODUCT API TESTS
    // =============================================================
    console.log('\n2. Testing Product Endpoints & Permissions...');

    // 2.1 Customer cannot create product
    const prodCustCreate = await makeRequest('/api/v1/products', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: { name: 'Unauthorized Item' }
    });
    assert(prodCustCreate.statusCode === 403, 'Customer forbidden from creating products (403)');

    // 2.2 Validation: Missing required fields
    const prodInvalid = await makeRequest('/api/v1/products', {
      method: 'POST',
      headers: { Authorization: `Bearer ${seller1Token}` },
      body: { name: 'Incomplete Item' }
    });
    assert(prodInvalid.statusCode === 422, 'Rejects product with missing required fields (422)');

    // 2.3 Seller 1 creates Product A
    const prodAData = {
      name: 'Sony WH-1000XM5 Wireless Headphones',
      brand: 'Sony',
      category: createdCatId,
      price: 348.00,
      originalPrice: 399.00,
      stock: 10,
      description: 'Industry-leading noise cancelling wireless headphones with 30-hour battery life.',
      images: ['/assets/images/products/electronics/sony-wh1000xm5-main.webp']
    };

    const prodACreate = await makeRequest('/api/v1/products', {
      method: 'POST',
      headers: { Authorization: `Bearer ${seller1Token}` },
      body: prodAData
    });
    assert(prodACreate.statusCode === 201, 'Approved seller creates product successfully (201 Created)');
    assert(prodACreate.data.data.seller !== undefined, 'Product includes seller reference');
    const productAId = prodACreate.data.data.id || prodACreate.data.data._id;

    // 2.4 Public Catalog Browsing, Search & Filtering
    const prodSearch = await makeRequest('/api/v1/products?search=Sony');
    assert(prodSearch.statusCode === 200, 'Public search returns 200 OK');
    assert(prodSearch.data.data.products.length > 0, 'Finds product matching search query');
    assert(prodSearch.data.data.pagination.total >= 1, 'Includes pagination metadata');

    const prodFilter = await makeRequest('/api/v1/products?category=electronics&minPrice=200&maxPrice=400');
    assert(prodFilter.statusCode === 200, 'Price range and category filtering returns 200 OK');

    // 2.5 Seller Ownership Protection: Seller 2 attempts to edit Seller 1's product
    const prodUnauthorizedEdit = await makeRequest(`/api/v1/products/${productAId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${seller2Token}` },
      body: { price: 99.00 }
    });
    assert(
      prodUnauthorizedEdit.statusCode === 403,
      'Seller 2 FORBIDDEN (403) from editing Seller 1 product'
    );

    // 2.6 Seller 1 updates their own product
    const prodOwnerEdit = await makeRequest(`/api/v1/products/${productAId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${seller1Token}` },
      body: { price: 329.00 }
    });
    assert(prodOwnerEdit.statusCode === 200, 'Seller 1 successfully updates own product (200 OK)');
    assert(prodOwnerEdit.data.data.price === 329.00, 'Updated price confirmed');

    // 2.7 Admin can update any product
    const prodAdminEdit = await makeRequest(`/api/v1/products/${productAId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { badge: 'Staff Pick' }
    });
    assert(prodAdminEdit.statusCode === 200, 'Admin can update any product (200 OK)');

    // 2.8 Seller 2 cannot delete Seller 1's product
    const prodUnauthorizedDelete = await makeRequest(`/api/v1/products/${productAId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${seller2Token}` }
    });
    assert(
      prodUnauthorizedDelete.statusCode === 403,
      'Seller 2 FORBIDDEN (403) from deleting Seller 1 product'
    );

    // =============================================================
    // SECTION 3: ORDER API & INVENTORY TESTS
    // =============================================================
    console.log('\n3. Testing Order Creation, Server Calculations & Inventory...');

    // 3.1 Order validation: stock check
    const orderExcessQty = await makeRequest('/api/v1/orders', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: {
        items: [{ product: productAId, quantity: 999 }],
        shippingAddress: {
          fullName: 'Alice Walker',
          street: '123 Market St',
          city: 'San Francisco',
          state: 'CA',
          postalCode: '94105',
          phone: '415-555-0100'
        }
      }
    });
    assert(orderExcessQty.statusCode === 400, 'Rejects order exceeding available inventory (400 Bad Request)');
    assert(orderExcessQty.data.message.includes('Insufficient inventory'), 'Provides clear out-of-stock message');

    // 3.2 Customer creates valid order (Stock: 10, buy: 2 -> new stock: 8)
    const initialProductStock = productsDb.get(productAId.toString()).stock;

    const validOrderRes = await makeRequest('/api/v1/orders', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: {
        items: [{ product: productAId, quantity: 2 }],
        shippingAddress: {
          fullName: 'Alice Walker',
          street: '123 Market St',
          city: 'San Francisco',
          state: 'CA',
          postalCode: '94105',
          phone: '415-555-0100'
        },
        paymentMethod: 'card'
      }
    });

    assert(validOrderRes.statusCode === 201, 'Order created successfully (201 Created)');
    const createdOrder = validOrderRes.data.data;
    assert(createdOrder.orderNumber.startsWith('NM-'), 'Generates valid NM- orderNumber');

    // Server-side calculation verification:
    // Price = 329.00 * 2 = 658.00. Subtotal >= 100 -> shipping = 0. Tax = 8% of 658 = 52.64. Total = 710.64.
    assert(createdOrder.pricing.subtotal === 658.00, 'Server accurately computed subtotal (2 x $329 = $658)');
    assert(createdOrder.pricing.shippingFee === 0, 'Free shipping applied for order over $100');
    assert(createdOrder.pricing.total === 710.64, 'Accurately computes total with 8% tax ($710.64)');

    // Inventory reduction verification
    const updatedProductStock = productsDb.get(productAId.toString()).stock;
    assert(
      updatedProductStock === initialProductStock - 2,
      `Inventory stock decremented safely (from ${initialProductStock} to ${updatedProductStock})`
    );

    const orderId = createdOrder.id || createdOrder._id;

    // 3.3 Customer access control: Customer 1 accesses own order
    const cust1GetOrder = await makeRequest(`/api/v1/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    assert(cust1GetOrder.statusCode === 200, 'Customer 1 can view own order (200 OK)');

    // Customer 2 attempts to view Customer 1's order
    const cust2GetOrder = await makeRequest(`/api/v1/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${otherCustomerToken}` }
    });
    assert(cust2GetOrder.statusCode === 403, 'Customer 2 FORBIDDEN (403) from viewing Customer 1 order');

    // 3.4 Seller order access: Seller 1 owns the product in the order
    const seller1GetOrder = await makeRequest(`/api/v1/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${seller1Token}` }
    });
    assert(seller1GetOrder.statusCode === 200, 'Seller 1 can access order containing their product (200 OK)');

    // Seller 2 does NOT own any product in this order
    const seller2GetOrder = await makeRequest(`/api/v1/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${seller2Token}` }
    });
    assert(
      seller2GetOrder.statusCode === 403,
      'Seller 2 FORBIDDEN (403) from accessing order with no products from their store'
    );

    // 3.5 Admin order access: Admin views any order
    const adminGetOrder = await makeRequest(`/api/v1/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(adminGetOrder.statusCode === 200, 'Administrator can access any order (200 OK)');

    // 3.6 Order Status Update (Shipped)
    const updateShip = await makeRequest(`/api/v1/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${seller1Token}` },
      body: { status: 'shipped', trackingNumber: 'TRK-9876543210' }
    });
    assert(updateShip.statusCode === 200, 'Seller can mark order as shipped (200 OK)');
    assert(updateShip.data.data.status === 'shipped', 'Order status is now shipped');

    // 3.7 Order Cancellation & Inventory Restoration
    const preCancelStock = productsDb.get(productAId.toString()).stock;
    const cancelOrder = await makeRequest(`/api/v1/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${seller1Token}` },
      body: { status: 'cancelled', cancelReason: 'Customer requested cancellation' }
    });
    assert(cancelOrder.statusCode === 200, 'Order successfully cancelled (200 OK)');
    const postCancelStock = productsDb.get(productAId.toString()).stock;
    assert(
      postCancelStock === preCancelStock + 2,
      `Cancelled order restored inventory stock (from ${preCancelStock} to ${postCancelStock})`
    );

  } catch (error) {
    console.error('Test suite uncaught error:', error);
    failed++;
  } finally {
    await new Promise((resolve) => server.close(resolve));
    console.log('\nTest HTTP server stopped cleanly.');
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

runCatalogOrderTests();
