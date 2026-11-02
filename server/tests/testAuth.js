import http from 'http';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { hashPassword, comparePassword } from '../src/utils/passwordUtils.js';
import { generateAccessToken, verifyAccessToken } from '../src/utils/tokenUtils.js';
import { User } from '../src/models/User.js';
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

const runAuthTests = async () => {
  console.log('====================================================');
  console.log('   NOVAMART: Phase 2 Authentication Test Suite      ');
  console.log('====================================================\n');

  // Start HTTP server on test port
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(TEST_PORT, '127.0.0.1', resolve));
  console.log(`Test HTTP server started on http://127.0.0.1:${TEST_PORT}\n`);

  try {
    // -------------------------------------------------------------
    // 1. Password Hashing & Verification
    // -------------------------------------------------------------
    console.log('1. Testing Password Hashing & Security (bcrypt)...');
    const plainPassword = 'SuperSecret123!';
    const hashed = await hashPassword(plainPassword);

    assert(hashed !== plainPassword, 'Password is never stored in plaintext');
    assert(hashed.startsWith('$2'), 'Produces valid bcrypt salt/hash');

    const matchesCorrect = await comparePassword(plainPassword, hashed);
    assert(matchesCorrect === true, 'Correct password verifies successfully');

    const matchesWrong = await comparePassword('WrongPassword123!', hashed);
    assert(matchesWrong === false, 'Incorrect password correctly rejected');

    // -------------------------------------------------------------
    // 2. JWT Generation & Verification
    // -------------------------------------------------------------
    console.log('\n2. Testing JWT Lifecycle & Verification...');
    const testClaims = {
      userId: '654321654321654321654321',
      role: 'customer',
      email: 'customer@novamart.com',
      name: 'Test Customer'
    };
    const token = generateAccessToken(testClaims);
    assert(typeof token === 'string' && token.split('.').length === 3, 'Generates valid 3-segment JWT');

    const decoded = verifyAccessToken(token);
    assert(decoded.userId === testClaims.userId, 'Preserves userId claim');
    assert(decoded.role === 'customer', 'Preserves role claim');
    assert(decoded.email === testClaims.email, 'Preserves email claim');

    // Tampered token test
    let tamperedFailed = false;
    try {
      verifyAccessToken(token + 'tampered');
    } catch {
      tamperedFailed = true;
    }
    assert(tamperedFailed === true, 'Rejects cryptographically tampered token');

    // -------------------------------------------------------------
    // 3. Request Validation: Invalid Registration Data
    // -------------------------------------------------------------
    console.log('\n3. Testing Registration Input Validation...');

    // Missing fields
    const resEmpty = await makeRequest('/api/v1/auth/register', {
      method: 'POST',
      body: {}
    });
    assert(resEmpty.statusCode === 422, 'Rejects empty body with 422 Unprocessable Entity');
    assert(resEmpty.data.success === false, 'Payload indicates success: false');

    // Weak password
    const resWeakPass = await makeRequest('/api/v1/auth/register', {
      method: 'POST',
      body: {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'weak'
      }
    });
    assert(resWeakPass.statusCode === 422, 'Rejects weak password (<8 chars / missing numbers/uppercase)');

    // Attempting to self-register as admin
    const resAdminAttempt = await makeRequest('/api/v1/auth/register', {
      method: 'POST',
      body: {
        name: 'Hacker Admin',
        email: 'hacker@example.com',
        password: 'SecurePassword123!',
        role: 'admin'
      }
    });
    assert(resAdminAttempt.statusCode === 422, 'Blocks public attempt to register with admin role');

    // -------------------------------------------------------------
    // 4. In-Memory Mock Database for End-to-End Service & Route Testing
    // -------------------------------------------------------------
    console.log('\n4. Setting up isolated test repository...');
    const usersDb = new Map();
    const sellersDb = new Map();

    // Mock User Model Methods
    const originalUserFindOne = User.findOne;
    const originalUserFindById = User.findById;
    const originalUserSave = User.prototype.save;
    const originalSellerFindOne = Seller.findOne;
    const originalSellerSave = Seller.prototype.save;

    User.findOne = function (query) {
      if (query.email) {
        const found = Array.from(usersDb.values()).find((u) => u.email === query.email);
        return {
          select: () => Promise.resolve(found || null),
          then: (resolve) => resolve(found || null)
        };
      }
      return Promise.resolve(null);
    };

    User.findById = function (id) {
      const found = usersDb.get(id.toString());
      return {
        populate: () => Promise.resolve(found || null),
        then: (resolve) => resolve(found || null)
      };
    };

    User.prototype.save = async function () {
      if (!this._id) {
        this._id = new mongoose.Types.ObjectId();
      }
      if (this.isModified && this.isModified('password')) {
        this.password = await hashPassword(this.password);
      }
      usersDb.set(this._id.toString(), this);
      return this;
    };

    Seller.findOne = function (query) {
      if (query.storeSlug) {
        const found = Array.from(sellersDb.values()).find((s) => s.storeSlug === query.storeSlug);
        return Promise.resolve(found || null);
      }
      if (query.user) {
        const found = Array.from(sellersDb.values()).find(
          (s) => s.user.toString() === query.user.toString()
        );
        return Promise.resolve(found || null);
      }
      return Promise.resolve(null);
    };

    Seller.prototype.save = async function () {
      if (!this._id) {
        this._id = new mongoose.Types.ObjectId();
      }
      sellersDb.set(this._id.toString(), this);
      return this;
    };

    // -------------------------------------------------------------
    // 5. Registration Success & Password Hashing
    // -------------------------------------------------------------
    console.log('\n5. Testing Registration Success...');
    const regPayload = {
      name: 'Sarah Connor',
      email: 'sarah@novamart.com',
      password: 'StrongPassword2026!'
    };
    const regRes = await makeRequest('/api/v1/auth/register', {
      method: 'POST',
      body: regPayload
    });

    assert(regRes.statusCode === 201, 'Returns 201 Created');
    assert(regRes.data.success === true, 'Response indicates success: true');
    assert(regRes.data.data.user.name === 'Sarah Connor', 'User name matches');
    assert(regRes.data.data.user.email === 'sarah@novamart.com', 'User email matches');
    assert(regRes.data.data.user.role === 'customer', 'Default role assigned is customer');
    assert(regRes.data.data.user.password === undefined, 'Password hash is completely omitted from response');
    assert(typeof regRes.data.data.tokens.accessToken === 'string', 'Returns JWT accessToken');

    // -------------------------------------------------------------
    // 6. Duplicate Email Rejection
    // -------------------------------------------------------------
    console.log('\n6. Testing Duplicate Email Handling...');
    const dupRes = await makeRequest('/api/v1/auth/register', {
      method: 'POST',
      body: regPayload
    });
    assert(dupRes.statusCode === 409, 'Returns 409 Conflict for existing email');
    assert(dupRes.data.message.includes('already exists'), 'Returns clear duplicate email message');

    // -------------------------------------------------------------
    // 7. Login Success & Failures
    // -------------------------------------------------------------
    console.log('\n7. Testing Login Workflows...');

    // Unknown account
    const unkRes = await makeRequest('/api/v1/auth/login', {
      method: 'POST',
      body: {
        email: 'unknown@novamart.com',
        password: 'SomePassword123!'
      }
    });
    assert(unkRes.statusCode === 401, 'Rejects unknown email with 401 Unauthorized');

    // Incorrect password
    const wrongPassRes = await makeRequest('/api/v1/auth/login', {
      method: 'POST',
      body: {
        email: 'sarah@novamart.com',
        password: 'IncorrectPassword!'
      }
    });
    assert(wrongPassRes.statusCode === 401, 'Rejects incorrect password with 401 Unauthorized');

    // Correct login
    const loginRes = await makeRequest('/api/v1/auth/login', {
      method: 'POST',
      body: {
        email: 'sarah@novamart.com',
        password: 'StrongPassword2026!'
      }
    });
    assert(loginRes.statusCode === 200, 'Successful login returns 200 OK');
    assert(loginRes.data.success === true, 'Login response success is true');
    assert(typeof loginRes.data.data.tokens.accessToken === 'string', 'Returns fresh access token');
    const customerToken = loginRes.data.data.tokens.accessToken;

    // -------------------------------------------------------------
    // 8. Protected /me Endpoint
    // -------------------------------------------------------------
    console.log('\n8. Testing Authenticated /me Endpoint...');

    // Without token
    const noTokenRes = await makeRequest('/api/v1/auth/me');
    assert(noTokenRes.statusCode === 401, 'Rejects request without token (401 Unauthorized)');

    // With invalid token
    const badTokenRes = await makeRequest('/api/v1/auth/me', {
      headers: { Authorization: 'Bearer bad.token.format' }
    });
    assert(badTokenRes.statusCode === 401, 'Rejects invalid token (401 Unauthorized)');

    // With valid customer token
    const meRes = await makeRequest('/api/v1/auth/me', {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    assert(meRes.statusCode === 200, 'Returns 200 OK with valid bearer token');
    assert(meRes.data.data.email === 'sarah@novamart.com', 'Returns correct authenticated user data');

    // -------------------------------------------------------------
    // 9. Role-Based Access Control (Customer vs Seller vs Admin)
    // -------------------------------------------------------------
    console.log('\n9. Testing Role-Based Authorization Guard Middleware...');

    // Customer accessing customer endpoint
    const custOnCust = await makeRequest('/api/v1/auth/test/customer-only', {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    assert(custOnCust.statusCode === 200, 'Customer has access to customer endpoint');

    // Customer attempting seller endpoint
    const custOnSeller = await makeRequest('/api/v1/auth/test/seller-only', {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    assert(custOnSeller.statusCode === 403, 'Customer is FORBIDDEN (403) from accessing seller endpoint');

    // Customer attempting admin endpoint
    const custOnAdmin = await makeRequest('/api/v1/auth/test/admin-only', {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    assert(custOnAdmin.statusCode === 403, 'Customer is FORBIDDEN (403) from accessing admin endpoint');

    // Create a verified Seller in test database
    const sellerUser = new User({
      name: 'Sony Official',
      email: 'seller@sony.com',
      password: 'SellerPassword123!',
      role: 'seller'
    });
    await sellerUser.save();

    const sellerProfile = new Seller({
      user: sellerUser._id,
      storeName: 'Sony Official Store',
      storeSlug: 'sony-official-store',
      status: 'approved'
    });
    await sellerProfile.save();
    sellerUser.sellerProfile = sellerProfile._id;
    await sellerUser.save();

    const sellerToken = generateAccessToken({
      userId: sellerUser._id.toString(),
      role: 'seller',
      email: sellerUser.email,
      name: sellerUser.name
    });

    // Seller accessing seller endpoint
    const sellerOnSeller = await makeRequest('/api/v1/auth/test/seller-only', {
      headers: { Authorization: `Bearer ${sellerToken}` }
    });
    assert(sellerOnSeller.statusCode === 200, 'Approved seller has access to seller endpoint (200 OK)');

    // Seller attempting admin endpoint
    const sellerOnAdmin = await makeRequest('/api/v1/auth/test/admin-only', {
      headers: { Authorization: `Bearer ${sellerToken}` }
    });
    assert(sellerOnAdmin.statusCode === 403, 'Seller is FORBIDDEN (403) from accessing admin endpoint');

    // Admin Token test
    const adminToken = generateAccessToken({
      userId: '111111111111111111111111',
      role: 'admin',
      email: 'superadmin@novamart.com',
      name: 'Super Administrator'
    });

    const adminOnAdmin = await makeRequest('/api/v1/auth/test/admin-only', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(adminOnAdmin.statusCode === 200, 'Administrator has access to admin endpoint (200 OK)');

    // -------------------------------------------------------------
    // 10. Seller Registration / Application Flow
    // -------------------------------------------------------------
    console.log('\n10. Testing Become-Seller Application Flow...');
    const applySellerRes = await makeRequest('/api/v1/auth/become-seller', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: {
        storeName: "Sarah's Tech Emporium",
        storeSlug: 'sarahs-tech-emporium',
        description: 'Curated boutique of high-end accessories'
      }
    });
    assert(applySellerRes.statusCode === 201, 'Customer successfully approved and upgraded to seller (201 Created)');
    assert(applySellerRes.data.data.seller.storeName === "Sarah's Tech Emporium", 'Created seller store matches input');
    assert(typeof applySellerRes.data.data.tokens.accessToken === 'string', 'Returns reissued token with seller role');

    // -------------------------------------------------------------
    // 11. Logout Endpoint
    // -------------------------------------------------------------
    console.log('\n11. Testing Logout Endpoint...');
    const logoutRes = await makeRequest('/api/v1/auth/logout', { method: 'POST' });
    assert(logoutRes.statusCode === 200, 'Logout endpoint returns 200 OK');

    // Restore original methods
    User.findOne = originalUserFindOne;
    User.findById = originalUserFindById;
    User.prototype.save = originalUserSave;
    Seller.findOne = originalSellerFindOne;
    Seller.prototype.save = originalSellerSave;

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

runAuthTests();
