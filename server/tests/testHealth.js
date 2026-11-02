import http from 'http';
import app from '../src/app.js';

let server;
const TEST_PORT = 5099;
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
    const req = http.request(
      {
        host: '127.0.0.1',
        port: TEST_PORT,
        path,
        method: options.method || 'GET',
        headers: options.headers || {}
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
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
};

const runHealthTests = async () => {
  console.log('====================================================');
  console.log('   NOVAMART: Backend HTTP & Health Suite            ');
  console.log('====================================================\n');

  // Start HTTP server on test port
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(TEST_PORT, '127.0.0.1', resolve));
  console.log(`Test HTTP server started on http://127.0.0.1:${TEST_PORT}\n`);

  try {
    // 1. Root route
    console.log('1. Testing Root Welcome Endpoint (GET /)...');
    const rootRes = await makeRequest('/');
    assert(rootRes.statusCode === 200, 'Returns HTTP 200 OK');
    assert(rootRes.data.status === 'running', 'Status is "running"');

    // 2. API v1 Discovery
    console.log('\n2. Testing API Discovery Root (GET /api/v1)...');
    const apiRes = await makeRequest('/api/v1');
    assert(apiRes.statusCode === 200, 'Returns HTTP 200 OK');
    assert(apiRes.data.success === true, 'Response payload has success: true');
    assert(apiRes.data.data.endpoints.health === '/api/v1/health', 'Lists health endpoint');

    // 3. Health Check
    console.log('\n3. Testing Health Check (GET /api/v1/health)...');
    const healthRes = await makeRequest('/api/v1/health');
    assert(healthRes.statusCode === 200, 'Returns HTTP 200 OK');
    assert(healthRes.data.success === true, 'Response payload success is true');
    assert(healthRes.data.data.status === 'healthy', 'Health status is healthy');
    assert(typeof healthRes.data.data.uptime.seconds === 'number', 'Reports uptime in seconds');
    assert(typeof healthRes.data.data.database.status === 'string', 'Reports database connection state');

    // 4. Verbose Health Check
    console.log('\n4. Testing Verbose Health Check (GET /api/v1/health?verbose=true)...');
    const verboseRes = await makeRequest('/api/v1/health?verbose=true');
    assert(verboseRes.statusCode === 200, 'Returns HTTP 200 OK');
    assert(verboseRes.data.data.system !== undefined, 'Includes system diagnostic metadata');
    assert(typeof verboseRes.data.data.system.nodeVersion === 'string', 'Includes Node.js version');

    // 5. Request Validation Error
    console.log('\n5. Testing Request Validation Handler (GET /api/v1/health?verbose=notaboolean)...');
    const invalidQueryRes = await makeRequest('/api/v1/health?verbose=notaboolean');
    assert(invalidQueryRes.statusCode === 422, 'Returns HTTP 422 Unprocessable Entity');
    assert(invalidQueryRes.data.success === false, 'Response payload success is false');
    assert(Array.isArray(invalidQueryRes.data.errors), 'Returns structured validation errors array');
    assert(invalidQueryRes.data.errors[0].field === 'verbose', 'Identifies invalid field "verbose"');

    // 6. 404 Not Found Handler
    console.log('\n6. Testing 404 Route Not Found Handler (GET /api/v1/nonexistent)...');
    const notFoundRes = await makeRequest('/api/v1/nonexistent');
    assert(notFoundRes.statusCode === 404, 'Returns HTTP 404 Not Found');
    assert(notFoundRes.data.success === false, 'Response payload success is false');
    assert(notFoundRes.data.message.includes('Endpoint not found'), 'Returns descriptive 404 message');

  } catch (error) {
    console.error('Test suite error:', error);
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

runHealthTests();
