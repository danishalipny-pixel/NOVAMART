# NOVAMART — Phase 3: Catalog & Order REST Endpoints Report

**Repository:** [https://github.com/danishalipny-pixel/NOVAMART](https://github.com/danishalipny-pixel/NOVAMART)  
**Execution Date:** November 1, 2026  
**Phase Status:** Complete & Fully Verified  

---

## 1. Executive Summary

Phase 3 established the core commercial engine for NOVAMART by developing complete REST API services for **Categories**, **Products**, and **Orders**, paired with real-time server-side price verification and safe inventory deduction.

All Phase 3 requirements have been realized with zero regression:
- **Category REST APIs:** Full CRUD endpoints under `/api/v1/categories`, featuring public catalog reading and admin-guarded category creation, updates, and deletes with duplication guards.
- **Product REST APIs:** Multi-vendor product catalog under `/api/v1/products` supporting full-text search, multi-faceted filtering (category, brand, price range, stock status), multi-parameter sorting, and pagination.
- **Strict Seller Ownership Enforcement:** Approved merchants can only modify and delete products they own; cross-merchant tampering is strictly blocked with HTTP 403 Forbidden.
- **Order REST APIs & Security:** Order processing under `/api/v1/orders` calculating verified item prices, subtotal, shipping fees, and taxes entirely on the server.
- **Safe Inventory Deductions:** Prevents negative inventory stock and out-of-stock purchases; automatically restores stock upon order cancellation.
- **Frontend Integration:** Connected checkout flow, product mutations, and service API clients while maintaining 100% of the existing React 19 UI, layout, responsiveness, and image gallery features.
- **Comprehensive Verification:** 40 new automated test assertions in `testCatalogOrders.js`, expanding the backend test suite to **138 total passed assertions (0 failures)**. Frontend production build and linter pass with 0 errors.

---

## 2. Implemented Endpoints

All endpoints are versioned under `/api/v1`:

### 2.1. Categories (`/api/v1/categories`)

| Method | Endpoint | Access Level | Description | Status Code |
| :--- | :--- | :--- | :--- | :---: |
| `GET` | `/api/v1/categories` | Public | Retrieve all categories sorted by display order and name | `200 OK` |
| `GET` | `/api/v1/categories/:id` | Public | Retrieve single category by MongoDB ObjectId or URL slug | `200 OK` |
| `POST` | `/api/v1/categories` | Admin Only | Create new category (validates duplicate name and slug) | `201 Created` |
| `PUT` | `/api/v1/categories/:id` | Admin Only | Update category attributes | `200 OK` |
| `DELETE` | `/api/v1/categories/:id` | Admin Only | Delete category (safeguards against deleting active categories) | `200 OK` |

### 2.2. Products (`/api/v1/products`)

| Method | Endpoint | Access Level | Description | Status Code |
| :--- | :--- | :--- | :--- | :---: |
| `GET` | `/api/v1/products` | Public | Search, filter, sort, and paginate product catalog | `200 OK` |
| `GET` | `/api/v1/products/:id` | Public | Retrieve single product with populated category and seller | `200 OK` |
| `GET` | `/api/v1/products/seller/me` | Approved Seller | Retrieve current seller's own inventory listings | `200 OK` |
| `POST` | `/api/v1/products` | Approved Seller | Create new product listing (seller ID derived from auth session) | `201 Created` |
| `PUT` | `/api/v1/products/:id` | Seller (Owner) / Admin | Update product details (blocks unauthorized merchants) | `200 OK` |
| `DELETE` | `/api/v1/products/:id` | Seller (Owner) / Admin | Remove product listing from catalog | `200 OK` |

### 2.3. Orders (`/api/v1/orders`)

| Method | Endpoint | Access Level | Description | Status Code |
| :--- | :--- | :--- | :--- | :---: |
| `POST` | `/api/v1/orders` | Customer | Place order with server-side pricing and stock validation | `201 Created` |
| `GET` | `/api/v1/orders/my-orders` | Customer | Retrieve order history for authenticated customer | `200 OK` |
| `GET` | `/api/v1/orders/seller/my-orders` | Approved Seller | Retrieve orders containing products from seller's store | `200 OK` |
| `GET` | `/api/v1/orders/admin/all` | Admin | Retrieve all marketplace orders with status filtering | `200 OK` |
| `GET` | `/api/v1/orders/:id` | Owner / Seller / Admin | Inspect single order (enforces role ownership) | `200 OK` |
| `PATCH` | `/api/v1/orders/:id/status` | Seller / Admin | Update order fulfillment status (restores stock if cancelled) | `200 OK` |

---

## 3. Request & Response Structures

### 3.1. Create Product (`POST /api/v1/products`)
**Request Payload:**
```json
{
  "name": "Sony WH-1000XM5 Wireless Headphones",
  "brand": "Sony",
  "category": "electronics",
  "price": 348.00,
  "originalPrice": 399.00,
  "stock": 24,
  "description": "Industry-leading noise cancelling wireless headphones with 30-hour battery life.",
  "features": [
    "Two processors and 8 microphones for noise cancellation",
    "Up to 30-hour battery life with quick charging"
  ],
  "specs": {
    "Driver Unit": "30mm",
    "Battery Life": "30 hrs"
  },
  "images": [
    "/assets/images/products/electronics/sony-wh1000xm5-main.webp"
  ]
}
```

### 3.2. Product Catalog Query Response (`GET /api/v1/products?category=electronics&minPrice=200&maxPrice=400&page=1&limit=12`)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Products catalog retrieved successfully",
  "data": {
    "products": [
      {
        "id": "6724a1b02f8a9c1e4b8d7a15",
        "name": "Sony WH-1000XM5 Wireless Headphones",
        "slug": "sony-wh-1000xm5-wireless-headphones",
        "brand": "Sony",
        "price": 348.00,
        "originalPrice": 399.00,
        "discountPercentage": 13,
        "stock": 24,
        "inStock": true,
        "category": {
          "id": "6724a1b02f8a9c1e4b8d7a14",
          "name": "Electronics & Audio",
          "slug": "electronics"
        },
        "seller": {
          "storeName": "Apex Audio",
          "storeSlug": "apex-audio",
          "rating": 4.9
        },
        "images": [
          "/assets/images/products/electronics/sony-wh1000xm5-main.webp"
        ]
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 12,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  },
  "timestamp": "2026-11-01T19:53:59.920Z"
}
```

### 3.3. Create Order (`POST /api/v1/orders`)
**Request Payload:**
```json
{
  "items": [
    {
      "product": "6724a1b02f8a9c1e4b8d7a15",
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "fullName": "Alice Walker",
    "street": "123 Market St",
    "city": "San Francisco",
    "state": "CA",
    "postalCode": "94105",
    "country": "US",
    "phone": "415-555-0100"
  },
  "paymentMethod": "card"
}
```

**Response Payload (Server Calculates Pricing & Stock):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Order placed successfully and inventory updated",
  "data": {
    "orderNumber": "NM-953996-4812",
    "customer": {
      "id": "6724a1b02f8a9c1e4b8d7a11",
      "name": "Alice Walker",
      "email": "customer@novamart.com"
    },
    "items": [
      {
        "product": "6724a1b02f8a9c1e4b8d7a15",
        "name": "Sony WH-1000XM5 Wireless Headphones",
        "price": 329.00,
        "quantity": 2
      }
    ],
    "pricing": {
      "subtotal": 658.00,
      "shippingFee": 0,
      "tax": 52.64,
      "total": 710.64
    },
    "status": "processing",
    "payment": {
      "method": "card",
      "status": "authorized",
      "transactionId": "TX-1730490839961-4812"
    }
  },
  "timestamp": "2026-11-01T19:53:59.961Z"
}
```

---

## 4. Authorization & Security Rules

1. **Category Access:**
   - Public: Read operations (`GET /`).
   - Admin: Write operations (`POST`, `PUT`, `DELETE`). Non-admin attempts return `403 Forbidden`.
2. **Product Access:**
   - Public: Browse, search, filter, read details.
   - Seller: Creation requires `requireApprovedSeller`. The seller reference is extracted from `req.user.sellerProfile` and cannot be forged from request payloads.
   - Product Ownership: `updateProduct` and `deleteProduct` verify that `product.seller == user.sellerProfile`. If a merchant attempts to modify or delete another merchant's listing, access is denied with `403 Forbidden`.
   - Admin: Authorized to update or delete any product across the marketplace.
3. **Order Access:**
   - Customer Ownership: Customers can only retrieve orders where `order.customer == req.user.userId`. Other customers receive `403 Forbidden`.
   - Seller Access: Sellers can only retrieve and update orders containing products from their store.
   - Admin Access: Full visibility across all marketplace transactions.
4. **Server-Side Pricing & Inventory Integrity:**
   - Item prices and order totals are calculated exclusively from verified database records. Client-supplied price tampering has zero effect.
   - Stock quantities are validated atomically before orders are recorded. Negative stock is impossible.

---

## 5. Inventory Behavior

- **Order Placement:** When an order is accepted, `product.stock` is decremented by `quantity` for each item.
- **Out of Stock Prevention:** If `product.stock < quantity`, the order creation transaction fails with `400 Bad Request` ("Insufficient inventory for..."), and no stock or order record is altered.
- **Order Cancellation:** When an order status transitions to `cancelled`, inventory quantities for all line items are automatically restored to the respective products.

---

## 6. Frontend Integration

1. **Unified API Service (`src/services/api.js`):** Expanded with complete `categoryApi`, `productApi`, and `orderApi` clients with URL query parameter serialization and automatic JWT Bearer token headers.
2. **Catalog Synchronization (`src/context/StoreContext.jsx`):**
   - Connected `saveProduct` and `deleteProduct` to backend REST endpoints for authenticated sellers.
   - Preserves offline/fallback capabilities so the storefront never breaks or displays empty states if the backend is restarting.
3. **Checkout Integration (`src/components/storefront/CheckoutModal.jsx`):**
   - Transmits order line items and shipping details to `/api/v1/orders`.
   - Records real server-generated order numbers (`NM-xxxxxx-xxxx`).
   - Displays processing state and error alerts without altering the design.

---

## 7. Testing & Verification Results

### 7.1. Full Backend Test Suite Execution
- **Mongoose Models Suite (`testModels.js`):** 37 passed, 0 failed.
- **Backend HTTP & Health Suite (`testHealth.js`):** 20 passed, 0 failed.
- **Authentication & RBAC Suite (`testAuth.js`):** 41 passed, 0 failed.
- **Catalog & Order Suite (`testCatalogOrders.js`):** 40 passed, 0 failed.

**Total Backend Test Assertions:** **138 PASSED, 0 FAILED**.

### 7.2. Frontend Quality Checks
- **Production Build (`npm run build`):** Built cleanly in 1.34s (0 errors).
- **Linter (`npm run lint`):** Passed with 0 errors across 82 project files.

---

## 8. Summary of Created & Modified Files

### Created Files:
- `server/src/validators/categoryValidator.js` — Validation rules for category creation and updates.
- `server/src/services/categoryService.js` — Business logic for category hierarchy, duplication guards, and product linkage checks.
- `server/src/controllers/categoryController.js` — HTTP controllers for category endpoints.
- `server/src/routes/categoryRoutes.js` — Public and admin-guarded category routes.
- `server/src/validators/productValidator.js` — Validation rules for product attributes and query parameters.
- `server/src/services/productService.js` — Search, filter, pagination, stock management, and seller ownership enforcement.
- `server/src/controllers/productController.js` — HTTP controllers for product catalog.
- `server/src/routes/productRoutes.js` — Public, seller, and admin product routes.
- `server/src/validators/orderValidator.js` — Validation rules for order placement and status updates.
- `server/src/services/orderService.js` — Server-side pricing calculation, inventory deduction, order ledger, and cancellation restoration.
- `server/src/controllers/orderController.js` — HTTP controllers for orders.
- `server/src/routes/orderRoutes.js` — Customer, seller, and admin order routes.
- `server/tests/testCatalogOrders.js` — 40-assertion automated test suite for categories, products, and orders.
- `PHASE_3_CATALOG_ORDER_REPORT.md` — Formal Phase 3 deliverable documentation.

### Modified Files:
- `server/src/models/Order.js` — Added `seller` to line items and `sellers` array to order schema for multi-vendor querying.
- `server/src/routes/index.js` — Mounted `/categories`, `/products`, and `/orders` routers.
- `server/package.json` — Added `"test:catalog": "node tests/testCatalogOrders.js"`.
- `package.json` — Updated `"server:test"` to run all 4 backend test suites.
- `src/services/api.js` — Added `categoryApi`, `productApi`, and `orderApi` clients.
- `src/context/StoreContext.jsx` — Connected seller product actions to REST endpoints.
- `src/components/storefront/CheckoutModal.jsx` — Integrated live order placement with loading state.

---

## 9. Remaining Limitations & Phase 4 Roadmap

1. **Phase 4: Real Payment Processing & Cloud Storage**
   - Stripe payment intent creation and webhook verification (currently operating in authorized mock mode).
   - Cloudinary or AWS S3 signed image uploads for dynamic seller listings (replacing client blob URLs).
2. **Phase 5: Advanced Admin Analytics & Moderation**
   - Visual dashboard for marketplace commission rates, dispute arbitration, and merchant KYC verification.
