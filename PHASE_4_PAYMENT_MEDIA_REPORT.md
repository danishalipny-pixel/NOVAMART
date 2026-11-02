# NOVAMART — Phase 4: Payment Gateway & Cloud Media Storage Report

**Repository:** [https://github.com/danishalipny-pixel/NOVAMART](https://github.com/danishalipny-pixel/NOVAMART)  
**Date:** November 1, 2026  
**Status:** Complete & Verified  

---

## 1. Executive Summary

Phase 4 of the NOVAMART engineering roadmap successfully implements:
1. **Server-Side Stripe Payment Processing:** Secure `PaymentIntent` lifecycle tied to authenticated customer orders, server-enforced amount calculations (preventing client-side tampering), idempotent webhook handling with cryptographic HMAC signature verification, and automated inventory restoration upon payment cancellation.
2. **Cloud Media Management (Cloudinary & Multer):** Memory-streamed image uploads without local disk storage, rigorous 5 MB file size and MIME-type validation, strict merchant product ownership boundaries, and direct Cloudinary asset deletion by `public_id`.
3. **Frontend Integration:** Seamless connection of `src/services/api.js`, `CheckoutModal.jsx`, and seller `ProductUploadModal.jsx` with full fallback safety and zero layout regressions.
4. **Verification & Zero Regression:** 30 new Phase 4 test assertions passed (168/168 total backend test assertions passed across all 5 test suites), frontend production build passed in 1.02s, and Oxlint passed with 0 errors.

---

## 2. Architecture & Design

### A. Stripe Payment Lifecycle & Security
```
[Client / Checkout]
       │
       ▼  POST /api/v1/payments/create-intent (orderId, Bearer JWT)
[paymentService.createPaymentIntent]
       ├── 1. Verifies order ownership (Customer cannot pay for another's order)
       ├── 2. Verifies order state (Blocks cancelled or already captured orders)
       ├── 3. Enforces server-side calculation: amountInCents = Math.round(order.pricing.total * 100)
       ├── 4. Creates Stripe PaymentIntent with metadata: { orderId, orderNumber, customerId }
       └── 5. Updates Order payment status to 'pending', method to 'stripe'
       │
       ▼
[Stripe Gateway / Webhook Event]
       │
       ▼  POST /api/v1/payments/webhook (Raw Buffer Body + stripe-signature)
[server/src/app.js (express.raw mounted specifically for webhook route)]
       │
       ▼
[paymentService.handleWebhookEvent]
       ├── 1. Cryptographically verifies Stripe signature (stripe.webhooks.constructEvent)
       ├── 2. Idempotency Check: if order is already 'captured', skips redundant processing
       ├── 3. 'payment_intent.succeeded' -> marks payment 'captured', order 'processing'
       ├── 4. 'payment_intent.payment_failed' -> marks payment 'failed'
       └── 5. 'payment_intent.canceled' -> marks order 'cancelled' & restores product inventory
```

### B. Cloudinary Media Storage Pipeline
```
[Seller Dashboard / Upload Modal]
       │
       ▼  POST /api/v1/media/upload or /products/:id/images (multipart/form-data)
[uploadMiddleware (Multer Memory Storage)]
       ├── 1. Validates MIME type: JPEG, PNG, WebP, AVIF, GIF
       └── 2. Enforces 5 MB per file limit; buffers in memory (zero disk contamination)
       │
       ▼
[mediaService (Cloudinary SDK v2)]
       ├── 1. Streams memory buffer to Cloudinary: folder 'novamart/products'
       ├── 2. Verifies merchant ownership: seller can only mutate their own products
       ├── 3. Appends secure_url to Product.images array in MongoDB
       └── 4. Returns secureUrl, publicId, dimensions, format, and byte size
```

---

## 3. Implemented API Endpoints Reference

### Payment Endpoints (`/api/v1/payments`)
| Method | Route | Access | Description |
|---|---|---|---|
| `POST` | `/api/v1/payments/create-intent` | Customer / Admin | Creates Stripe PaymentIntent with server-side price validation |
| `POST` | `/api/v1/payments/webhook` | Public (Stripe Verified) | Webhook listener handling raw body signature verification |
| `GET` | `/api/v1/payments/status/:orderId` | Customer Owner / Admin | Retrieves verified payment status for an order |

### Media Endpoints (`/api/v1/media`)
| Method | Route | Access | Description |
|---|---|---|---|
| `POST` | `/api/v1/media/upload` | Seller / Admin | Uploads 1-5 images to Cloudinary via memory stream |
| `POST` | `/api/v1/media/products/:id/images` | Seller Owner / Admin | Uploads and appends images to a specific merchant product |
| `DELETE` | `/api/v1/media/products/:id/images` | Seller Owner / Admin | Removes an image from a product (prevents deleting last image) |
| `DELETE` | `/api/v1/media/:publicId(*)` | Seller / Admin | Destroys an image in Cloudinary by its public ID |
| `DELETE` | `/api/v1/media` | Seller / Admin | Deletes Cloudinary image via request body/query parameter |

---

## 4. Key Security & Integrity Guarantees

1. **Zero Client Price Trust:** All payable amounts sent to Stripe are calculated directly from `order.pricing.total` stored in the database. Client payloads cannot alter prices, discounts, or totals.
2. **Raw Body Webhook Parsing:** Configured `express.raw({ type: 'application/json' })` specifically on `/api/v1/payments/webhook` before global `express.json()` to ensure byte-perfect cryptographic verification via `stripe.webhooks.constructEvent()`.
3. **Idempotency Safeguard:** Prevents double-processing or replay attacks by verifying whether `order.payment.status === 'captured'` prior to updating database state.
4. **Stock Restoration:** On `payment_intent.canceled` webhook events, product quantities previously decremented during order creation are automatically restored in MongoDB.
5. **Memory-Only File Buffering:** Multer uses `memoryStorage()`, ensuring no temporary binary files remain on the host filesystem.
6. **Merchant Product Isolation:** Sellers are strictly prohibited from uploading, replacing, or deleting media belonging to products owned by another merchant.
7. **Protected Credentials:** All Stripe and Cloudinary credentials reside strictly in `.env`, loaded via `server/src/config/env.js`, and are ignored by `.gitignore`.

---

## 5. Frontend Integration

1. **`src/services/api.js`:**
   - Added `paymentApi.createPaymentIntent(orderId)` and `paymentApi.getPaymentStatus(orderId)`.
   - Added `mediaApi.uploadImages(formData)`, `mediaApi.uploadProductImages(productId, formData)`, `mediaApi.removeProductImage(productId, data)`, and `mediaApi.deleteImage(publicId)`.
   - Updated `request()` wrapper to automatically omit `Content-Type: application/json` when passing `FormData` bodies, allowing native browser boundary formatting.
2. **`src/components/seller/ProductUploadModal.jsx`:**
   - Integrated `mediaApi.uploadImages()` to upload local files directly to Cloudinary when authenticated.
   - Retains instant preview and fallback behavior so seller workflow is never blocked offline or in demo mode.
3. **`src/components/storefront/CheckoutModal.jsx`:**
   - Connected `paymentApi.createPaymentIntent()` immediately following order creation, linking the order to Stripe PaymentIntent lifecycle.

---

## 6. Verification & Automated Test Results

### Suite Breakdown
| Suite | Target | Assertions | Status |
|---|---|---|---|
| `testModels.js` | Mongoose Schemas & Validation | 37 / 37 | **PASSED** |
| `testHealth.js` | HTTP Server & System Health | 20 / 20 | **PASSED** |
| `testAuth.js` | JWT Authentication & RBAC | 41 / 41 | **PASSED** |
| `testCatalogOrders.js` | Categories, Products & Orders | 40 / 40 | **PASSED** |
| `testPaymentMedia.js` | Stripe Gateway, Webhooks & Cloudinary | 30 / 30 | **PASSED** |
| **Total Backend Tests** | **All 5 Test Suites** | **168 / 168** | **PASSED (100%)** |

### Frontend Quality & Production Build
- **Oxlint:** 0 errors across 92 files.
- **Vite Production Build:** Successfully built in 1.02s (`dist/index.html`, `dist/assets/index-CEFxgiTn.css` [71.37 kB], `dist/assets/index-D3sr_eJ-.js` [396.06 kB]).
- **Image Display & Responsiveness:** All existing desktop, tablet, and mobile layouts remain 100% intact.

---

## 7. Next Steps (Phase 5)

Phase 4 is complete and verified. Ready for review before proceeding to **Phase 5: User Profiles, Reviews & Wishlist Endpoints**.
