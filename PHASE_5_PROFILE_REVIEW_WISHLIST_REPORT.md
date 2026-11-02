# NOVAMART — Phase 5: User Profiles, Reviews & Wishlists Report

**Repository:** [https://github.com/danishalipny-pixel/NOVAMART](https://github.com/danishalipny-pixel/NOVAMART)  
**Date:** November 1, 2026  
**Status:** Complete & Verified  

---

## 1. Executive Summary

Phase 5 of the NOVAMART platform engineering roadmap is complete. This phase implements customer profile management, secure password changes, server-persisted user wishlists, verified customer product reviews, and dynamic product rating aggregation across both backend REST endpoints and the React storefront.

### Key Milestones Achieved
1. **User Profile & Security API:** Endpoints to inspect and update personal profiles (`name`, `phone`, `avatar`, and nested `address`). User role, admin privileges, and seller statuses are protected against unauthorized modification. Password hashes are excluded from API payloads.
2. **Secure Password Modification:** Password change endpoint verifying current password with bcrypt, validating new password complexity (minimum 8 characters), and hashing with salt before persistence.
3. **Wishlist System:** Multi-endpoint wishlist architecture supporting add, duplicate prevention, removal, clearing, and checking product status, with self-healing cleanup for deleted or inactive products.
4. **Verified Purchaser Reviews & Security:** Review creation strictly gated behind verified purchase orders in MongoDB (`Order.customer === userId` and `items.product === productId` with non-cancelled status). Duplicate reviews for the same product by the same user are rejected.
5. **Dynamic Rating Aggregation:** Average rating (1 decimal place) and review count are automatically recalculated and persisted on the `Product` document whenever a review is created, edited, or deleted. Star distributions (1 to 5 stars) are computed server-side.
6. **Frontend Integration:** Seamless integration of `ProfileModal.jsx`, `WishlistModal.jsx`, and a Customer Reviews & Ratings section in `ProductDetailModal.jsx`, maintaining existing UI responsiveness across all screen sizes.
7. **Verification & Zero Regression:** 42 new Phase 5 test assertions passed (**210 / 210 total backend test assertions passed** across all 6 test suites), Vite production build passed in 1.84s, and Oxlint passed with 0 errors.

---

## 2. Profile Architecture & Password Security

### Profile Management (`/api/v1/users/profile`)
- **Sanitized Retrieval:** `GET /api/v1/users/profile` returns the authenticated user's profile with `.select('-password -__v')`, populating linked `sellerProfile` metadata when present.
- **Whitelist Update Policy:** `PUT /api/v1/users/profile` restricts modifications to safe user fields: `name`, `phone`, `avatar`, and `address` (`street`, `city`, `state`, `postalCode`, `country`).
- **Privilege Escalation Protection:** Any incoming payload attempting to modify `role`, `isEmailVerified`, `isActive`, `sellerProfile`, or `password` is ignored, preserving RBAC integrity.

### Password Change Security (`/api/v1/users/change-password`)
- Requires `currentPassword` and `newPassword` (minimum 8 characters).
- Explicitly queries the database with `+password` to retrieve the current hash.
- Compares `currentPassword` using bcrypt (`user.comparePassword()`). Rejects mismatches with HTTP 400.
- Rejects reuse of identical passwords.
- Updates `user.password`, triggering Mongoose pre-save middleware to salt and hash the new password.
- Password hashes are never returned in responses or exposed in logs.

---

## 3. Wishlist API Reference

| Method | Route | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/wishlist` | Authenticated User | Retrieves current user's wishlist populated with active products |
| `POST` | `/api/v1/wishlist/:productId` | Authenticated User | Adds a product to user's wishlist (duplicate protected) |
| `POST` | `/api/v1/wishlist` | Authenticated User | Body-based product addition (`{ productId }`) |
| `DELETE` | `/api/v1/wishlist/:productId` | Authenticated User | Removes a specific product from user's wishlist |
| `DELETE` | `/api/v1/wishlist` | Authenticated User | Clears all items from user's wishlist |
| `GET` | `/api/v1/wishlist/check/:productId` | Authenticated User | Checks whether a product is currently wishlisted |

### Wishlist Resilience Guarantees
- **Duplicate Prevention:** Checks `wishlist.products.some(...)` before appending; redundant additions return the existing list without duplicating.
- **Self-Healing Catalog Synchronization:** When fetching a wishlist, any items that have been deleted or deactivated (`isActive: false`) are filtered out and pruned from the user's document.
- **User Isolation:** Wishlists are keyed strictly to `req.user.userId`. Users cannot inspect or manipulate other users' wishlists.

---

## 4. Product Reviews & Rating Aggregation

### Review Endpoints Reference

| Method | Route | Access | Description |
|---|---|---|---|
| `POST` | `/api/v1/reviews` | Verified Purchaser | Creates a verified review for a purchased product |
| `POST` | `/api/v1/products/:productId/reviews` | Verified Purchaser | Nested route for review submission |
| `GET` | `/api/v1/reviews/product/:productId` | Public | Retrieves paginated reviews, sort options, and rating stats |
| `GET` | `/api/v1/products/:productId/reviews` | Public | Nested route for product reviews |
| `GET` | `/api/v1/reviews/product/:productId/stats` | Public | Returns average rating, count, and 1–5 star distribution |
| `PUT` | `/api/v1/reviews/:id` | Review Author | Updates review rating, title, and comment |
| `DELETE` | `/api/v1/reviews/:id` | Review Author / Admin | Deletes review (author deletion or admin moderation) |

### Review Eligibility & Security Rules
1. **Verified Purchase Requirement:** Before accepting a review, the backend verifies that the customer has an order in `Order` collection containing `items.product === productId` with `status !== 'cancelled'`. Unverified submissions are rejected with `403 Forbidden`.
2. **Duplicate Review Prevention:** Customers are restricted to one review per product. Subsequent attempts return `400 Bad Request`, instructing the user to edit their existing review.
3. **No Client User ID Trust:** User identity is extracted exclusively from the validated JWT token (`req.user.userId`).
4. **Author & Admin Moderation Isolation:** Only the author can update their review. Only the author or an authenticated administrator (`req.user.role === 'admin'`) can delete a review.

### Product Rating Aggregation Engine
Whenever a review is created, edited, or deleted, `reviewService.updateProductRatingMetrics(productId)` is automatically triggered:
```javascript
const reviews = await Review.find({ product: productId });
const reviewCount = reviews.length;
let averageRating = 0;
if (reviewCount > 0) {
  const sum = reviews.reduce((acc, r) => acc + Number(r.rating || 0), 0);
  averageRating = Math.round((sum / reviewCount) * 10) / 10;
}
product.rating = averageRating;
product.reviewCount = reviewCount;
await product.save();
```
Clients cannot directly mutate `Product.rating` or `Product.reviewCount`.

---

## 5. Frontend Integration

1. **`src/services/api.js`:**
   - Added `userApi` (`getProfile`, `updateProfile`, `changePassword`).
   - Added `wishlistApi` (`getWishlist`, `addToWishlist`, `removeFromWishlist`, `clearWishlist`, `checkWishlist`).
   - Added `reviewApi` (`createReview`, `getProductReviews`, `getRatingStats`, `updateReview`, `deleteReview`).
2. **`src/components/storefront/WishlistModal.jsx`:**
   - Dedicated modal rendering wishlisted products with cover images, prices, star ratings, stock status, quick "Add to Cart", and item removal.
   - Accessible via the Navbar heart icon, User menu, and Mobile Bottom Navigation.
3. **`src/components/auth/ProfileModal.jsx`:**
   - Customer profile management modal with tabs for "Personal Profile" (name, phone, address) and "Security & Password" (current password validation, new password with confirmation).
   - Accessible from the User menu dropdown in Navbar.
4. **`src/components/storefront/ProductDetailModal.jsx`:**
   - Added Customer Reviews & Ratings section below product specifications and merchant badge.
   - Shows overall score, rating distribution bars (5★ down to 1★), verified buyer badges, and chronological review comments.
   - Includes an inline verified purchaser review submission form with interactive 1–5 star rating picker, review title, and validation error/success messages.

---

## 6. Automated Testing & Verification

### Test Suite Summary
| Test Suite | Focus Area | Assertions | Result |
|---|---|---|---|
| `testModels.js` | Mongoose Schemas & Model Constraints | 37 / 37 | **PASSED** |
| `testHealth.js` | Server Health & Diagnostic Endpoints | 20 / 20 | **PASSED** |
| `testAuth.js` | JWT Authentication & Role-Based Access | 41 / 41 | **PASSED** |
| `testCatalogOrders.js` | Categories, Products & Order Workflow | 40 / 40 | **PASSED** |
| `testPaymentMedia.js` | Stripe PaymentIntent, Webhook & Cloudinary | 30 / 30 | **PASSED** |
| `testProfileReviewWishlist.js` | User Profile, Wishlist, Reviews & Ratings | 42 / 42 | **PASSED** |
| **Total Backend Tests** | **All 6 Test Suites** | **210 / 210** | **100% PASSED** |

### Code Quality & Build Verification
- **Oxlint:** 0 errors across 106 files.
- **Vite Production Build:** Successfully built in 1.84s (`dist/index.html`, `dist/assets/index-CrVIwYvN.css` [72.84 kB], `dist/assets/index-YbnfJiSJ.js` [421.41 kB]).
- **Responsive Layout Integrity:** Tested across 320px–480px (mobile), 481px–768px (tablet), 769px–1280px (laptop), and 1281px+ (desktop) simulation modes.

---

## 7. Files Created & Modified

### Backend Modules Created
- `server/src/services/userService.js`: User profile retrieval, whitelist updates, and bcrypt password changing.
- `server/src/services/wishlistService.js`: Wishlist management with duplicate protection and catalog self-healing.
- `server/src/services/reviewService.js`: Verified buyer review management and dynamic rating aggregation.
- `server/src/controllers/userController.js`: HTTP controller for user profile and password operations.
- `server/src/controllers/wishlistController.js`: HTTP controller for wishlist actions.
- `server/src/controllers/reviewController.js`: HTTP controller for product reviews and rating statistics.
- `server/src/validators/userValidator.js`: Input validation for profile updates and password changes.
- `server/src/validators/reviewValidator.js`: Input validation for review creation and updates.
- `server/src/routes/userRoutes.js`: User profile and password routes.
- `server/src/routes/wishlistRoutes.js`: Wishlist REST endpoints.
- `server/src/routes/reviewRoutes.js`: Product review REST endpoints.
- `server/tests/testProfileReviewWishlist.js`: 42 automated tests covering all Phase 5 requirements.

### Backend Modules Modified
- `server/src/routes/index.js`: Mounted `users`, `wishlist`, and `reviews` routers; updated `/api/v1` discovery documentation.
- `server/src/routes/productRoutes.js`: Added nested review endpoints (`/:productId/reviews`).
- `server/package.json`: Added `test:profile` script and updated `test` command.
- `package.json`: Updated root `server:test` command.

### Frontend Components Created & Modified
- `src/services/api.js`: Added `userApi`, `wishlistApi`, and `reviewApi` clients.
- `src/components/auth/ProfileModal.jsx`: Created customer profile and password security modal.
- `src/components/storefront/WishlistModal.jsx`: Created saved wishlist drawer modal.
- `src/components/storefront/ProductDetailModal.jsx`: Added Customer Reviews & Ratings section and review submission form.
- `src/context/StoreContext.jsx`: Integrated wishlist sync and modal visibility controls.
- `src/context/AuthContext.jsx`: Added `setUser` export for profile state updates.
- `src/components/layout/Navbar.jsx`: Connected Wishlist and Profile modal triggers.
- `src/components/layout/MobileBottomNav.jsx`: Connected Wishlist trigger for mobile devices.
- `src/App.jsx`: Mounted `WishlistModal` and `ProfileModal`.

---

## 8. Remaining Limitations & Next Phase Readiness

- **Email Verification Service:** Profiles include `isEmailVerified` flag; transactional email confirmation (SMTP/SendGrid) can be connected when mail transport is configured.
- **Review Voting (Helpful Votes):** Review documents include `helpfulVotes` field; upvote endpoints can be added in subsequent phases.
- **Phase 5 Complete:** Development halted in accordance with project constraints. Ready for review before proceeding to Phase 6.
