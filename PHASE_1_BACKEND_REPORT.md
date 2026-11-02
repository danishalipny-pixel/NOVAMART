# NOVAMART — Phase 1: Backend & Database Foundation Report

**Repository:** [https://github.com/danishalipny-pixel/NOVAMART](https://github.com/danishalipny-pixel/NOVAMART)  
**Execution Date:** November 1, 2026  
**Phase Status:** Complete & Verified  

---

## 1. Executive Summary

Phase 1 established the modular **Node.js + Express.js + MongoDB/Mongoose** backend foundation for the NOVAMART e-commerce platform. The existing React 19 + Vite frontend was completely preserved, with zero breakage to existing layouts, UI components, or client-side shopping workflows.

All Phase 1 goals have been realized:
- **Modular Architecture:** Layered division into `config/`, `models/`, `controllers/`, `services/`, `routes/`, `middleware/`, `validators/`, and `utils/`.
- **Database Schemas:** 8 comprehensive enterprise Mongoose models with validation rules, compound indexes, text search indexing, relationships, and virtual getters.
- **REST API Foundation:** Centralized error handling, standardized `ApiResponse` and `ApiError` envelopes, request validation via `express-validator`, CORS management, and versioned routing under `/api/v1`.
- **Security Infrastructure:** Bcrypt password hashing utilities, JWT token lifecycle helpers, RBAC guard middleware, environment-isolated configuration, and verified `.gitignore` rules preventing `.env` credential leaks.
- **Verification Suite:** 100% test pass rate across both the 37-assertion Mongoose Model Validation Suite and the 20-assertion Backend HTTP & Health Suite.

---

## 2. Backend Architecture

The backend adopts a **layered Service-Oriented Architecture (SOA)** ensuring thin controllers, isolated business logic in services, centralized data access via Mongoose models, and decoupled middleware:

```
server/
├── .env.example                     # Sample environment variable definitions
├── package.json                     # Backend dependencies and test scripts
├── package-lock.json
├── src/
│   ├── config/                      # Environment and database configuration
│   │   ├── env.js                   # Centralized env loader with defaults
│   │   └── db.js                    # Resilient Mongoose connection & lifecycle
│   ├── models/                      # Enterprise Mongoose data schemas
│   │   ├── User.js                  # User accounts, auth credentials, roles
│   │   ├── Seller.js                # Seller store profiles, ratings, metrics
│   │   ├── Category.js              # Hierarchical product categories
│   │   ├── Product.js               # Products, specifications, galleries, stock
│   │   ├── Order.js                 # Customer orders, line items, shipping, payment
│   │   ├── Cart.js                  # User shopping carts with item calculations
│   │   ├── Wishlist.js              # User favorited items
│   │   ├── Review.js                # Ratings, comments, verified buyer reviews
│   │   └── index.js                 # Centralized model registry
│   ├── controllers/                 # Thin HTTP request/response handlers
│   │   └── healthController.js     # Health check & system diagnostics handler
│   ├── services/                    # Encapsulated core business logic
│   │   └── healthService.js        # Health state aggregation & uptime logic
│   ├── routes/                      # Versioned route declarations
│   │   ├── healthRoutes.js          # /api/v1/health endpoints
│   │   └── index.js                 # Master /api/v1 router & discovery
│   ├── middleware/                  # Request lifecycle interceptors
│   │   ├── errorHandler.js          # Centralized error handler & parser
│   │   ├── notFound.js              # 404 Route Not Found handler
│   │   ├── validateRequest.js       # express-validator result processor
│   │   └── authMiddleware.js        # Bearer token verification & RBAC guard
│   ├── validators/                  # Request validation schemas
│   │   └── healthValidator.js       # Query parameter validators
│   ├── utils/                       # Shared utility helpers
│   │   ├── ApiResponse.js           # Standardized success response envelope
│   │   ├── ApiError.js              # Custom operational error classes
│   │   ├── logger.js                # Formatted timestamp logger
│   │   ├── passwordUtils.js         # Bcrypt hashing & verification
│   │   └── tokenUtils.js            # JWT access & refresh token generators
│   ├── app.js                       # Express application assembly & middleware
│   └── server.js                    # HTTP listener & graceful shutdown handlers
└── tests/                           # Automated verification suites
    ├── testModels.js                # Mongoose schema validation tests (37 asserts)
    └── testHealth.js                # HTTP & error handling tests (20 asserts)
```

---

## 3. Database Models

Eight Mongoose models were designed to support NOVAMART's multi-vendor catalog, order management, and customer interactions:

### 3.1. `User` Model (`server/src/models/User.js`)
- **Fields:** `name` (2–60 chars), `email` (unique, lowercase, regex validated, indexed), `password` (min 8 chars, `select: false`), `role` (enum: `['customer', 'seller', 'admin']`), `avatar`, `phone`, `address` subdocument (`street`, `city`, `state`, `postalCode`, `country`), `isEmailVerified`, `isActive`, `sellerProfile` (`ObjectId` ref: `Seller`).
- **Security:** Automatic pre-save hook for password hashing via `bcrypt`. Instance method `comparePassword()` for credential verification.
- **Serialization:** Strips password hash and `__v` from JSON/Object serialization.

### 3.2. `Seller` Model (`server/src/models/Seller.js`)
- **Fields:** `user` (`ObjectId` ref: `User`, unique, indexed), `storeName` (indexed), `storeSlug` (unique, indexed), `description`, `logo`, `banner`, `rating` (0–5.0), `reviewCount`, `totalSales`, `totalRevenue`, `status` (enum: `['pending', 'approved', 'suspended', 'rejected']`), `contactEmail`, `contactPhone`, `socialLinks`.
- **Virtuals:** `products` (foreign key population to `Product.seller`).

### 3.3. `Category` Model (`server/src/models/Category.js`)
- **Fields:** `name` (unique), `slug` (unique, indexed), `description`, `icon` (Lucide identifier), `image`, `parentCategory` (`ObjectId` ref: `Category` for subcategory hierarchies), `isActive`, `displayOrder`.
- **Virtuals:** `subcategories` (foreign key population to child categories).

### 3.4. `Product` Model (`server/src/models/Product.js`)
- **Fields:** `name` (max 200 chars), `slug` (unique, indexed), `brand` (indexed), `category` (`ObjectId` ref: `Category`), `categorySlug` (indexed), `seller` (`ObjectId` ref: `Seller`), `price` (min 0, indexed), `originalPrice`, `discountPercentage` (0–100%), `stock` (min 0), `sku` (unique, sparse), `badge`, `isFeatured` (indexed), `isActive` (indexed), `description`, `features` (string array), `specs` (key-value Map), `images` (array of asset paths/URLs, minimum 1 required), `rating` (0–5), `reviewCount`.
- **Indexes:**
  - Compound Index: `{ category: 1, price: 1 }` (optimized catalog filtering).
  - Compound Index: `{ isFeatured: 1, createdAt: -1 }` (storefront showcases).
  - Full-Text Search Index: `{ name: 'text', brand: 'text', description: 'text' }` (weighted search queries).
- **Virtuals:** `inStock` boolean computed from `stock > 0`.

### 3.5. `Order` Model (`server/src/models/Order.js`)
- **Fields:** `orderNumber` (unique, uppercase e.g. `NM-9842`), `customer` (`ObjectId` ref: `User`), `items` array with embedded product snapshot (`product`, `name`, `price`, `quantity`, `image`, `selectedSpecs`), `shippingAddress` subdocument, `payment` subdocument (`method`, `status`, `transactionId`, `paidAt`), `pricing` subdocument (`subtotal`, `shippingFee`, `tax`, `total`), `status` (enum: `['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned']`), `trackingNumber`, `deliveredAt`, `cancelledAt`, `cancelReason`.
- **Indexes:** `{ customer: 1, createdAt: -1 }`, `{ status: 1, createdAt: -1 }`.

### 3.6. `Cart` Model (`server/src/models/Cart.js`)
- **Fields:** `user` (`ObjectId` ref: `User`, unique, indexed), `items` array (`product`, `quantity`, `selectedImage`, `priceAtAddition`), `lastActive` (Date).
- **Virtuals:** `totalItems` (sums total quantity of items).

### 3.7. `Wishlist` Model (`server/src/models/Wishlist.js`)
- **Fields:** `user` (`ObjectId` ref: `User`, unique, indexed), `products` array (`ObjectId` refs to `Product`).
- **Virtuals:** `itemCount` (length of saved product list).

### 3.8. `Review` Model (`server/src/models/Review.js`)
- **Fields:** `product` (`ObjectId` ref: `Product`), `user` (`ObjectId` ref: `User`), `order` (`ObjectId` ref: `Order`), `rating` (1–5), `title`, `comment` (5–2000 chars), `images` array, `isVerifiedPurchase`, `helpfulVotes`.
- **Constraint:** Compound unique index `{ product: 1, user: 1 }` to prevent duplicate reviews by the same user on a product.

---

## 4. API Endpoints (Phase 1 Implemented)

All API routes are served under the versioned prefix `/api/v1`:

| Method | Endpoint | Access | Description | Status Code |
| :--- | :--- | :--- | :--- | :---: |
| `GET` | `/` | Public | Welcome banner and server metadata | `200 OK` |
| `GET` | `/api/v1` | Public | API discovery root detailing available and roadmap endpoints | `200 OK` |
| `GET` | `/api/v1/health` | Public | Basic service health, uptime, and database status | `200 OK` |
| `GET` | `/api/v1/health?verbose=true` | Public | Verbose health diagnostics (memory, Node runtime, PID) | `200 OK` |
| `*` | Any undefined route | Public | Catches invalid routes and returns structured 404 payload | `404 Not Found` |

### Sample Health Check Response (`GET /api/v1/health?verbose=true`):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "NOVAMART API service is healthy and operational",
  "data": {
    "status": "healthy",
    "service": "NOVAMART API Backend",
    "version": "1.0.0",
    "apiVersion": "v1",
    "environment": "development",
    "timestamp": "2026-11-01T19:25:13.786Z",
    "uptime": {
      "seconds": 42,
      "formatted": "0h 0m 42s"
    },
    "database": {
      "status": "disconnected",
      "connected": false,
      "host": "N/A",
      "databaseName": "N/A"
    },
    "system": {
      "nodeVersion": "v24.18.0",
      "platform": "win32",
      "arch": "x64",
      "pid": 14508,
      "memoryUsage": {
        "rssMb": 48.21,
        "heapTotalMb": 18.52,
        "heapUsedMb": 12.34
      }
    }
  },
  "timestamp": "2026-11-01T19:25:13.786Z"
}
```

---

## 5. Security & Environment Configuration

### Environment Variables
Environment settings are defined in `server/.env.example` and loaded via `server/src/config/env.js`:

```env
# Server Runtime
NODE_ENV=development
PORT=5000

# Client Application URL (for CORS)
CLIENT_URL=http://localhost:5173

# MongoDB Connection String
MONGODB_URI=mongodb://127.0.0.1:27017/novamart

# JWT Secrets (Prepared for Phase 2 Auth)
JWT_SECRET=novamart_dev_secret_key_849204918239012389012
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=novamart_dev_refresh_secret_9812739182739182739
JWT_REFRESH_EXPIRES_IN=30d

# Password Salt Rounds
BCRYPT_SALT_ROUNDS=10
```

### Security Measures Implemented
1. **Zero Credential Exposure:** `.gitignore` was updated to explicitly ignore `.env`, `.env.local`, and `server/.env`.
2. **CORS Whitelisting:** Cross-Origin Resource Sharing is configured to strictly allow the frontend origin (`http://localhost:5173`) with credentials, methods, and header whitelists.
3. **Payload Limits:** JSON and urlencoded body parsers are capped at 10MB to prevent denial-of-service memory exhaustion.
4. **Input Sanitization & Validation:** `express-validator` middleware halts invalid requests before reaching business services.
5. **Prepared RBAC Infrastructure:** `authMiddleware.js` provides `authenticate` (JWT Bearer parsing) and `authorize('seller', 'admin')` guards.

---

## 6. Installation & Execution Instructions

### Running the Backend

From the project root:
```powershell
# Run backend in production mode
npm run server

# Run backend with Node.js hot-reload (--watch)
npm run server:dev

# Run complete backend automated test suite
npm run server:test
```

Alternatively, from the `server` directory:
```powershell
cd server
npm install
npm start
# or development watcher:
npm run dev
```

### Running Frontend Concurrently
The existing React frontend remains fully operational:
```powershell
npm run dev
```

---

## 7. Testing & Verification Results

### 7.1. Mongoose Model Validation Suite (`server/tests/testModels.js`)
- **Execution:** `npm --prefix server run test:models`
- **Scope:** 37 assertions verifying required constraints, format validators, default values, out-of-range rejections, and schema virtuals across all 8 models.
- **Result:** **37 PASSED, 0 FAILED**.

### 7.2. Backend HTTP & Health Suite (`server/tests/testHealth.js`)
- **Execution:** `npm --prefix server run test:health`
- **Scope:** 20 assertions verifying root endpoint, `/api/v1` discovery, basic health check, verbose diagnostics, 422 validation error handling, and 404 route not found interception.
- **Result:** **20 PASSED, 0 FAILED**.

### 7.3. Frontend Non-Regression Verification
- **Build:** `npm run build` executed and passed in 1.37s with zero compilation errors.
- **Linter:** `npm run lint` executed and passed with 0 errors across 60 files.

---

## 8. Summary of Created Files

| File Path | Description |
| :--- | :--- |
| `server/package.json` | Backend dependencies, metadata, and test scripts |
| `server/.env.example` | Template for environment variables |
| `server/.env` | Local development environment configuration (gitignored) |
| `server/src/config/env.js` | Centralized environment variable validator and loader |
| `server/src/config/db.js` | Resilient MongoDB connection manager and status monitor |
| `server/src/models/User.js` | User identity schema with bcrypt pre-save hashing |
| `server/src/models/Seller.js` | Seller store profile and reputation schema |
| `server/src/models/Category.js` | Product category taxonomy schema |
| `server/src/models/Product.js` | Multi-image product schema with search and category indexing |
| `server/src/models/Order.js` | Order ledger schema with snapshot line items and shipping |
| `server/src/models/Cart.js` | Persistent user cart schema with quantity calculations |
| `server/src/models/Wishlist.js` | Saved products wishlist schema |
| `server/src/models/Review.js` | Product review schema with unique user-product constraint |
| `server/src/models/index.js` | Centralized export registry for all models |
| `server/src/utils/logger.js` | Timestamped console logger |
| `server/src/utils/ApiResponse.js` | Standardized API success envelope |
| `server/src/utils/ApiError.js` | Custom HTTP error classes |
| `server/src/utils/passwordUtils.js` | Bcrypt password hashing and comparison helpers |
| `server/src/utils/tokenUtils.js` | JWT access and refresh token helpers |
| `server/src/middleware/errorHandler.js` | Centralized error handler and database exception mapper |
| `server/src/middleware/notFound.js` | 404 route not found handler |
| `server/src/middleware/validateRequest.js` | Express-validator rule processor |
| `server/src/middleware/authMiddleware.js` | JWT token validator and RBAC guard middleware |
| `server/src/validators/healthValidator.js` | Request validation rules for health routes |
| `server/src/services/healthService.js` | Service aggregating uptime and system health |
| `server/src/controllers/healthController.js` | Controller for health check endpoints |
| `server/src/routes/healthRoutes.js` | Route definition for `/api/v1/health` |
| `server/src/routes/index.js` | Master API v1 router and discovery map |
| `server/src/app.js` | Express application configuration with CORS and middleware |
| `server/src/server.js` | Server startup and graceful shutdown coordinator |
| `server/tests/testModels.js` | 37-assertion test suite for Mongoose schemas |
| `server/tests/testHealth.js` | 20-assertion test suite for HTTP API endpoints |
| `PHASE_1_BACKEND_REPORT.md` | Formal Phase 1 deliverable documentation |

---

## 9. Remaining Tasks (Phase 2 & Beyond Roadmap)

Per Phase 1 strict rules, development was halted here pending user approval before proceeding to:

1. **Phase 2: Authentication & Role-Based Access Control (RBAC)**
   - Registration, Login, and Refresh Token endpoints (`/api/v1/auth/register`, `/api/v1/auth/login`).
   - Secure HTTP-only cookie session handling.
   - Route guards on frontend React app for Customer, Seller, and Admin vistas.
2. **Phase 3: Catalog & Order REST Endpoints**
   - Connect frontend catalog to live `/api/v1/products` endpoints.
   - Replace `localStorage` cart with database-persisted `/api/v1/cart`.
   - Checkout order persistence to `/api/v1/orders`.
3. **Phase 4: Real Payment & Persistent Cloud Storage**
   - Stripe payment intent creation and webhook verification.
   - Cloudinary or AWS S3 signed image uploads for dynamic seller listings.
