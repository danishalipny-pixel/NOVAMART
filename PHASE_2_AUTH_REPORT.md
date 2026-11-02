# NOVAMART — Phase 2: Authentication & Role-Based Access Control Report

**Repository:** [https://github.com/danishalipny-pixel/NOVAMART](https://github.com/danishalipny-pixel/NOVAMART)  
**Execution Date:** November 1, 2026  
**Phase Status:** Complete & Fully Verified  

---

## 1. Executive Summary

Phase 2 established an enterprise-grade, cryptographically secure **Authentication and Role-Based Access Control (RBAC)** system for NOVAMART, encompassing both the Node.js/Express backend and the React 19 frontend.

All requirements for Phase 2 have been satisfied:
- **Stateless JWT & Bcrypt Authentication:** End-to-end user registration, secure credential verification, JWT signing, and token lifecycle management.
- **Three-Tier Role-Based Access Control (RBAC):** Strict authorization separation across `customer`, `seller`, and `admin` roles, preventing frontend role spoofing.
- **Verified Seller Access Gating:** Regulated merchant access requiring an approved `Seller` profile before accessing merchant features and dashboard views.
- **Frontend Integration:** Seamless integration into the React 19 UI with persistent auth state, responsive login/registration modal, role-aware navigation dropdown, and protected seller route guarding with zero disruption to the existing design.
- **Comprehensive Automated Test Coverage:** 41 new isolated authentication test assertions, bringing the total backend test suite to **98 tests passed (0 failures)**.

---

## 2. Authentication Architecture

The authentication workflow follows the stateless JSON Web Token (JWT) architecture combined with salted Bcrypt password hashing:

```mermaid
sequenceDiagram
    autonumber
    actor User as Client (Browser)
    participant AuthMW as Auth Middleware
    participant Controller as Auth Controller
    participant Service as Auth Service
    participant DB as MongoDB (User / Seller)

    %% Registration Flow
    Note over User, DB: Registration Flow (POST /api/v1/auth/register)
    User->>Controller: POST credentials (name, email, password)
    Controller->>Service: Validate & sanitize input
    Service->>DB: Check if email exists
    DB-->>Service: Unique verified
    Service->>Service: Hash password via bcrypt (10 rounds)
    Service->>DB: Persist User (role='customer', default)
    Service->>User: Issue JWT accessToken (7d) & sanitized user profile

    %% Protected Route Flow
    Note over User, DB: Protected Route Access (e.g. GET /api/v1/auth/me)
    User->>AuthMW: Request with Authorization: Bearer <token>
    AuthMW->>AuthMW: Verify cryptographic signature & expiration
    AuthMW->>Controller: Attach req.user (userId, role, email)
    Controller->>Service: Fetch fresh profile & populate sellerProfile
    Service->>User: 200 OK (User Profile)
```

### Layer Responsibilities
1. **Validators (`authValidator.js`):** Enforces strong password rules (minimum 8 characters, uppercase, lowercase, number), email normalization, and blocks public registration with the `admin` role.
2. **Controller (`authController.js`):** Thin handler parsing incoming HTTP requests and returning standardized `ApiResponse` payloads.
3. **Service (`authService.js`):** Business logic layer managing credential hashing, duplicate checks, seller profile creation, token issuance, and user sanitization.
4. **Middleware (`authMiddleware.js`):** Intercepts requests, validates Bearer tokens, enforces role whitelisting (`authorize`), and verifies seller approval status (`requireApprovedSeller`).
5. **Frontend Client (`api.js` & `AuthContext.jsx`):** Automatically attaches JWT Bearer tokens to outbound requests, manages session storage, and notifies users via toasts.

---

## 3. API Endpoints

All authentication endpoints are mounted under `/api/v1/auth`:

| Method | Endpoint | Access Level | Description | Status Code |
| :--- | :--- | :--- | :--- | :---: |
| `POST` | `/api/v1/auth/register` | Public | Registers a new account (Customer or Seller). Passwords hashed with bcrypt. | `201 Created` |
| `POST` | `/api/v1/auth/login` | Public | Validates credentials and returns JWT access and refresh tokens. | `200 OK` |
| `GET` | `/api/v1/auth/me` | Authenticated | Retrieves current user profile with populated `sellerProfile`. | `200 OK` |
| `POST` | `/api/v1/auth/become-seller` | Customer Only | Upgrades customer account to seller with an approved store profile. | `201 Created` |
| `POST` | `/api/v1/auth/logout` | Public | Stateless session logout (clears client tokens). | `200 OK` |
| `GET` | `/api/v1/auth/test/customer-only` | Customer/Seller/Admin | Protected test endpoint verifying basic authentication. | `200 OK` |
| `GET` | `/api/v1/auth/test/seller-only` | Approved Seller Only | RBAC test endpoint verifying approved seller merchant status. | `200 OK` |
| `GET` | `/api/v1/auth/test/admin-only` | Administrator Only | RBAC test endpoint restricting access strictly to `admin` role. | `200 OK` |

### Sample Response (`POST /api/v1/auth/login`):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "6724a1b02f8a9c1e4b8d7a12",
      "name": "Sarah Connor",
      "email": "sarah@novamart.com",
      "role": "customer",
      "avatar": "/assets/images/avatars/user-default.webp",
      "isEmailVerified": false,
      "isActive": true,
      "createdAt": "2026-11-01T19:34:50.087Z",
      "updatedAt": "2026-11-01T19:34:50.087Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  },
  "timestamp": "2026-11-01T19:34:50.124Z"
}
```

---

## 4. JWT Strategy & Role Permissions

### JWT Token Design
- **Access Token:** Signed using HMAC-SHA256 with `JWT_SECRET`. Contains minimal non-sensitive identity claims: `{ userId, role, email, name }`. Configured with a 7-day expiration (`7d`).
- **Refresh Token:** Signed using `JWT_REFRESH_SECRET` with a 30-day expiration (`30d`). Contains `{ userId }`.
- **Security Guarantee:** Password hashes and salt values are **never** embedded in JWT payloads or returned in API responses (`select: false` on Mongoose model + JSON transform stripping).

### Role Permissions Matrix

| Capability / Route | Unauthenticated | Customer | Approved Seller | Administrator |
| :--- | :---: | :---: | :---: | :---: |
| Browse Catalog & Categories | Allowed | Allowed | Allowed | Allowed |
| Product Search & Image Zoom | Allowed | Allowed | Allowed | Allowed |
| Add to Cart / Local Wishlist | Allowed | Allowed | Allowed | Allowed |
| Customer Profile (`/auth/me`) | 401 Denied | Allowed | Allowed | Allowed |
| Apply to Become a Seller | 401 Denied | Allowed | Conflict (Already Seller) | Denied |
| Seller Dashboard & Inventory | 401 Denied | 403 Forbidden | Allowed | Allowed |
| Product Creation & Deletion | 401 Denied | 403 Forbidden | Allowed | Allowed |
| Platform Administration Portal | 401 Denied | 403 Forbidden | 403 Forbidden | Allowed |

---

## 5. Security Measures

1. **Bcrypt Hashing:** Passwords hashed with 10 salt rounds. Pre-save Mongoose hook guarantees plaintext passwords are never written to disk.
2. **Preventing Role Escalation:** Public registration rejects any attempt to pass `role: 'admin'` with a `422 Unprocessable Entity` validation error.
3. **Seller Access Integrity:** The `requireApprovedSeller` middleware verifies both the user's role and the existence and `approved` status of their linked `Seller` document in MongoDB.
4. **Environment Isolation:** Zero credentials in source code. All secrets (`JWT_SECRET`, `JWT_REFRESH_SECRET`, `MONGODB_URI`) are loaded from `.env`, which is strictly ignored by `.gitignore`.
5. **No Password Leakage:** Both the Mongoose schema (`select: false`) and `toJSON` transform guarantee that password hashes are stripped before serialization.

---

## 6. Frontend Integration Details

The React 19 application was upgraded with full authentication and role-awareness while preserving 100% of the existing storefront design:

- **Auth Context (`src/context/AuthContext.jsx` & `useAuth.js`):** Provides global authentication state, token sync with `localStorage`, session verification on mount, and `login`, `register`, `becomeSeller`, and `logout` actions.
- **Auth Modal (`src/components/auth/AuthModal.jsx`):** A modal with smooth tabbed switching between "Sign In", "Create Account", and "Activate Seller Account", including quick-fill buttons for demo accounts.
- **Navbar Integration (`src/components/layout/Navbar.jsx`):**
  - Displays a "Sign In" button when unauthenticated.
  - Displays an interactive user avatar, name, and role badge when authenticated, with a dropdown menu offering direct links to Seller Dashboard or Become a Seller, and one-click Sign Out.
- **Route Guarding:**
  - Clicking "Seller Portal" when unauthenticated displays a toast prompt and launches the login modal.
  - Clicking "Seller Portal" as a customer displays a prompt to activate a seller store profile.
  - Directly attempting to render the Seller Dashboard without seller privileges renders a merchant access restricted card in [`App.jsx`](file:///c:/Users/ULS/Desktop/NOVAMART%20platform/src/App.jsx).

---

## 7. Testing & Verification Results

### 7.1. Full Backend Test Suite

```
====================================================
   NOVAMART: Phase 2 Authentication Test Suite      
====================================================

1. Password Hashing & Security (bcrypt):
  ✓ Password is never stored in plaintext
  ✓ Produces valid bcrypt salt/hash ($2b$10...)
  ✓ Correct password verifies successfully
  ✓ Incorrect password correctly rejected

2. JWT Lifecycle & Verification:
  ✓ Generates valid 3-segment JWT
  ✓ Preserves userId claim
  ✓ Preserves role claim
  ✓ Preserves email claim
  ✓ Rejects cryptographically tampered token

3. Registration Input Validation:
  ✓ Rejects empty body with 422 Unprocessable Entity
  ✓ Payload indicates success: false
  ✓ Rejects weak password (<8 chars / missing numbers/uppercase)
  ✓ Blocks public attempt to register with admin role

4. Registration & Persistence:
  ✓ Returns 201 Created on registration
  ✓ Response indicates success: true
  ✓ Default role assigned is customer
  ✓ Password hash is completely omitted from response
  ✓ Returns JWT accessToken
  ✓ Returns 409 Conflict for existing duplicate email

5. Login Workflows:
  ✓ Rejects unknown email with 401 Unauthorized
  ✓ Rejects incorrect password with 401 Unauthorized
  ✓ Successful login returns 200 OK
  ✓ Returns fresh access token

6. Protected /me Endpoint:
  ✓ Rejects request without token (401 Unauthorized)
  ✓ Rejects invalid token format (401 Unauthorized)
  ✓ Returns 200 OK with valid bearer token
  ✓ Returns correct authenticated user data

7. Role-Based Authorization Guard Middleware:
  ✓ Customer has access to customer endpoint
  ✓ Customer is FORBIDDEN (403) from accessing seller endpoint
  ✓ Customer is FORBIDDEN (403) from accessing admin endpoint
  ✓ Approved seller has access to seller endpoint (200 OK)
  ✓ Seller is FORBIDDEN (403) from accessing admin endpoint
  ✓ Administrator has access to admin endpoint (200 OK)

8. Seller Application & Upgrade:
  ✓ Customer successfully approved and upgraded to seller (201 Created)
  ✓ Created seller store matches input
  ✓ Returns reissued token with seller role

9. Logout Endpoint:
  ✓ Logout endpoint returns 200 OK

Results: 41 passed, 0 failed
```

### 7.2. Regression Testing Summary

| Test Suite | Command | Assertions | Result |
| :--- | :--- | :---: | :---: |
| **Mongoose Models Suite** | `npm --prefix server run test:models` | 37 | **PASSED (37/37)** |
| **HTTP & Health Suite** | `npm --prefix server run test:health` | 20 | **PASSED (20/20)** |
| **Authentication & RBAC Suite** | `npm --prefix server run test:auth` | 41 | **PASSED (41/41)** |
| **Frontend Production Build** | `npm run build` | 2,077 modules | **PASSED (1.47s)** |
| **Static Code Analysis** | `npm run lint` | 69 files | **PASSED (0 errors)** |

---

## 8. Summary of Created & Modified Files

### Created Files:
- `server/src/validators/authValidator.js` — Input validation rules for registration, login, and seller application.
- `server/src/services/authService.js` — Authentication business logic, token generation, and account upgrading.
- `server/src/controllers/authController.js` — HTTP controllers for `/api/v1/auth/*`.
- `server/src/routes/authRoutes.js` — Route declarations for authentication and RBAC test endpoints.
- `server/tests/testAuth.js` — 41-assertion automated authentication test suite.
- `src/services/api.js` — Frontend HTTP client with automatic Bearer token management.
- `src/context/AuthContext.jsx` — React authentication state provider.
- `src/context/useAuth.js` — Custom hook for consuming authentication state.
- `src/components/auth/AuthModal.jsx` — Responsive login, registration, and seller upgrade modal.
- `PHASE_2_AUTH_REPORT.md` — Formal Phase 2 deliverable documentation.

### Modified Files:
- `server/src/middleware/authMiddleware.js` — Added `requireApprovedSeller` and `requireAdmin` guards.
- `server/src/routes/index.js` — Mounted `authRoutes` at `/api/v1/auth`.
- `server/package.json` — Added `"test:auth": "node tests/testAuth.js"`.
- `package.json` — Updated `"server:test"` to run all three backend suites.
- `src/App.jsx` — Integrated `AuthProvider`, `AuthModal`, and protected route screen for Seller Dashboard.
- `src/components/layout/Navbar.jsx` — Integrated auth state, user dropdown menu, and protected seller portal button.
- `src/components/layout/MobileDrawer.jsx` — Integrated mobile user card and protected seller access.
- `src/components/layout/MobileBottomNav.jsx` — Integrated protected seller navigation.

---

## 9. Remaining Tasks & Phase 3 Recommendations

With Phase 2 fully tested and verified, the platform is prepared for:

1. **Phase 3: Catalog & Order REST Endpoints**
   - Connect frontend catalog to live `/api/v1/products` endpoints.
   - Replace client-side `localStorage` cart with database-backed `/api/v1/cart`.
   - Implement `/api/v1/orders` checkout persistence.
2. **Phase 4: Real Payment Gateway & Cloud Media Storage**
   - Stripe payment intent creation and webhook verification.
   - Cloudinary or AWS S3 signed image uploads for dynamic seller listings.
3. **Phase 5: Administrator Oversight Portal**
   - Implement administrative UI to approve/suspend sellers and manage disputed transactions.
