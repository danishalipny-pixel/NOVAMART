# NOVAMART — Full-Stack Multi-Vendor E-Commerce Platform

A production-ready, full-stack multi-vendor e-commerce platform built with React, Vite, Tailwind CSS, Node.js, Express, and MongoDB. NOVAMART delivers a seamless consumer shopping journey, a robust merchant dashboard, an administrator governance portal, and an enterprise REST API featuring role-based access control (RBAC), Stripe payment processing, and Cloudinary media management.

---

## Table of Contents

- [Overview](#overview)
- [Purpose and Objectives](#purpose-and-objectives)
- [Key Features](#key-features)
  - [Customer Storefront](#customer-storefront)
  - [Product Detail Experience](#product-detail-experience)
  - [Cart & Checkout](#cart--checkout)
  - [User Profiles, Reviews & Wishlists](#user-profiles-reviews--wishlists)
  - [Seller Dashboard & Product Management](#seller-dashboard--product-management)
  - [Administrator Portal & Governance](#administrator-portal--governance)
  - [Backend Architecture & Security](#backend-architecture--security)
- [Technology Stack](#technology-stack)
- [System Architecture & Folder Structure](#system-architecture--folder-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Configuration](#environment-configuration)
  - [Installation](#installation)
  - [Available Scripts](#available-scripts)
- [Automated Testing & Quality Assurance](#automated-testing--quality-assurance)
- [Developer Information](#developer-information)
- [License](#license)

---

## Overview

NOVAMART is an end-to-end digital retail platform designed for consumers, independent merchants, and platform administrators. It pairs a polished consumer storefront—featuring instant live search, faceted category filtering, dynamic promotional banners, and an interactive multi-image product detail view—with a comprehensive multi-vendor marketplace layer.

The platform provides a secured Node.js + Express backend powered by MongoDB and Mongoose, enforcing strict role-based access control, sliding-window rate limiting, NoSQL query sanitization, OWASP security headers, server-side Stripe payment validation, and direct Cloudinary image uploads.

---

## Purpose and Objectives

1. **Visual Stability & Zero CLS:** Enforce strict container aspect ratios across all product cards, category tiles, and banners to eliminate Cumulative Layout Shift during resource loading.
2. **Fail-Safe Image Rendering:** Implement client-side fallback mechanisms (`SafeImage`) that catch missing or broken image assets and immediately present styled SVG placeholders instead of native browser broken-image icons.
3. **Robust Security & Data Integrity:** Protect endpoints with OWASP security headers, recursive NoSQL injection sanitizers, sliding-window rate limiters, bcrypt-hashed credentials, and cryptographically verified Stripe webhook signatures.
4. **Adaptive Layouts:** Deliver an uninterrupted user experience across mobile phones, tablets, laptops, and wide desktop displays with zero horizontal overflow.
5. **Multi-Vendor Governance:** Support seller onboarding workflows (application, review, approval/rejection) and grant authorized sellers dedicated inventory and fulfillment management while giving administrators full platform oversight.

---

## Key Features

### Customer Storefront
- **Hero Banner Slider:** Responsive carousel showcasing launch highlights, pricing badges, and direct call-to-action routing with pause-on-hover capability.
- **Category Explorer:** Grid-based navigation covering Electronics, Wearables, Computing, Optics, Gaming, and Modern Lifestyle collections.
- **Promotional Feature Banners:** Multi-card promotional layouts with category-specific discount badges.
- **Live Catalog Filtering:** Instant client-side search across product titles, brands, and descriptions, complemented by category filters and price range controls.
- **Sorting Options:** Sort products by Featured Picks, Price (Low to High), Price (High to Low), or Customer Ratings.
- **Product Cards:** Uniform cards featuring `object-fit: contain` image containers, promotional tags, discount badges, review ratings, wishlist toggles, and quick view triggers.

### Product Detail Experience
- **Multi-View Image Gallery:** Interactive thumbnail strip presenting multiple angles (front, detail, lifestyle, packaging) for catalog items.
- **Desktop Hover Zoom Lens:** Cursor-tracked image magnifier that enlarges fine textures and product details on desktop displays.
- **Fullscreen HD Lightbox:** Modal viewer featuring zoom stepping controls (100% to 300%) and keyboard/touch navigation across all item photos.
- **Specifications & Highlights:** Tabular breakdown of technical specifications and feature checklists.
- **Merchant Verification Card:** Merchant information, customer rating metrics, and authenticity badges.

### Cart & Checkout
- **Slide-Over Cart Drawer:** Real-time item listing, product thumbnail previews, quantity steppers, item deletion, and subtotal calculations.
- **Free Shipping Meter:** Dynamic progress bar showing the remaining order amount required to qualify for complimentary express delivery ($100+ threshold).
- **Express Checkout Modal:** Multi-step modal capturing shipping addresses and payment details with instant order number generation and local storage synchronization.
- **Stripe Integration:** Server-side Stripe PaymentIntent creation, payment verification, and webhook synchronization.

### User Profiles, Reviews & Wishlists
- **Customer Profile Management:** Update personal information, contact numbers, delivery addresses, and change account passwords securely.
- **Persistent Wishlist:** Toggle favorites directly from product cards or detail modals with real-time backend synchronization and local fallback.
- **Product Reviews & Ratings:** Verified customer reviews with 1-5 star ratings, detailed comments, and automated recalculation of product average rating and review counts.

### Seller Dashboard & Product Management
- **Key Performance Indicators:** Real-time metrics tracking Total Revenue, Monthly Growth, Order Volume, and Average Review Ratings.
- **Revenue Velocity Chart:** Scalable vector graphics (SVG) area chart illustrating monthly sales volume.
- **Catalog Inventory Management:** Table of all active listings with image thumbnails, categories, pricing, stock levels, and quick edit/delete actions.
- **Multi-Image Uploader:**
  - Drag-and-drop file upload zone.
  - Multi-file selection with instantaneous preview thumbnail generation.
  - One-click primary cover designation (`COVER` badge) for storefront card display.
  - Direct upload to Cloudinary with format and size validation (< 5MB).
- **Order Tracking:** Table displaying Order IDs, customer names, purchased items, totals, dates, and fulfillment status tags.

### Administrator Portal & Governance
- **Platform Analytics:** Real-time aggregate statistics on total platform users, active sellers, catalog products, and completed orders.
- **Seller Application Workflow:** Admin review dashboard to inspect pending merchant applications and approve or reject prospective vendors.
- **User Management:** Oversee registered user accounts, role allocations, and account statuses.
- **Product Moderation:** Cross-vendor catalog oversight and moderation controls.

### Backend Architecture & Security
- **Modular REST API:** Built on Express.js with a clean separation of concerns (`controllers/`, `services/`, `models/`, `routes/`, `middleware/`, `validators/`).
- **Role-Based Access Control (RBAC):** Strict JWT verification and role enforcement across `customer`, `seller`, and `admin` scopes.
- **OWASP Security Headers:** Configured security headers including `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, and stripped `X-Powered-By`.
- **NoSQL Query Injection Protection:** Recursive middleware sanitizer stripping dangerous MongoDB operators (`$` and `.`) while preserving raw Buffer streams for webhook signature verification.
- **Sliding-Window Rate Limiting:** In-memory request limiters protecting sensitive endpoints against brute-force and denial-of-service attempts.
- **Graceful Process Handling:** Intercepts `SIGINT` and `SIGTERM` signals to cleanly drain active HTTP connections and safely terminate database pools.

---

## Technology Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | React 19 | Component-based UI architecture utilizing hooks and Context API |
| **Frontend Build Tool** | Vite 8 | Fast Hot Module Replacement (HMR) and optimized Rollup bundling |
| **Styling** | Tailwind CSS 4 | Utility-first CSS framework with responsive breakpoint utilities |
| **Icons** | Lucide React | Clean, consistent vector iconography |
| **Backend Runtime** | Node.js (v18+) | High-performance asynchronous JavaScript server runtime |
| **Backend Framework** | Express 4 | Fast, modular HTTP application server and REST routing |
| **Database & ODM** | MongoDB & Mongoose 8 | Document database with schema validation, virtuals, and compound indexes |
| **Authentication** | JWT & bcrypt | Stateless JSON Web Tokens and salted bcrypt password hashing |
| **Payments** | Stripe SDK (v23) | Server-side PaymentIntent creation and cryptographically verified webhooks |
| **Media Storage** | Cloudinary & Multer | Secure cloud media upload and asset hosting |
| **Code Quality & QA** | Oxlint | High-speed static analysis and linting |

---

## System Architecture & Folder Structure

```
NOVAMART/
├── public/
│   ├── assets/images/           # Categorized local image assets and placeholders
│   └── favicon.svg
├── server/
│   ├── src/
│   │   ├── config/              # Database (Mongoose), Cloudinary, Stripe, and Env configs
│   │   ├── controllers/         # Thin controllers mapping HTTP requests to services
│   │   ├── middleware/          # Auth, RBAC, error handling, rate limiting, security headers, upload
│   │   ├── models/              # Mongoose schemas (User, Product, Category, Order, Cart, Wishlist, Review, Seller)
│   │   ├── routes/              # Express REST routes mounted under /api/v1
│   │   ├── services/            # Pure business logic and database interactions
│   │   ├── utils/               # ApiError, ApiResponse, logger, tokenUtils, passwordUtils
│   │   ├── validators/          # Express-validator schema rules
│   │   ├── app.js               # Express app configuration and middleware pipeline
│   │   └── server.js            # HTTP server startup and graceful shutdown lifecycle
│   ├── tests/                   # 8 automated backend test suites (310 assertions)
│   ├── .env.example             # Documented backend environment template
│   └── package.json             # Server dependencies and test scripts
├── src/
│   ├── components/
│   │   ├── admin/               # AdminDashboardModal
│   │   ├── auth/                # AuthModal, ProfileModal
│   │   ├── common/              # SafeImage, Badge, RatingStars, ErrorBoundary
│   │   ├── layout/              # Navbar, MobileDrawer, MobileBottomNav, Footer, ResponsiveTesterBar
│   │   ├── seller/              # SellerDashboard, ProductUploadModal
│   │   ├── storefront/          # HeroBanner, CategoryGrid, ProductGrid, ProductCard, ProductDetailModal, WishlistModal, CartDrawer, CheckoutModal
│   │   └── verification/        # ImageAuditModal
│   ├── context/
│   │   ├── AuthContext.jsx       # Authentication state, login, register, profile updates
│   │   └── StoreContext.jsx      # Global store provider, cart, wishlist, products, orders
│   ├── data/                    # Initial catalog fallback definitions and banner configurations
│   ├── services/
│   │   └── api.js               # Axios/Fetch client integration with backend REST API
│   ├── App.jsx                  # Root application wrapped in ErrorBoundary
│   ├── main.jsx                 # Application entry point
│   └── index.css                # Global base styles and animations
├── .env.example                 # Documented frontend environment template
├── .gitignore                   # Comprehensive exclusion rules (env, logs, node_modules)
├── index.html                   # HTML entry point with responsive viewport metadata
├── package.json                 # Frontend dependencies and full-stack orchestration scripts
└── vite.config.js               # Vite build configuration
```

---

## Getting Started

### Prerequisites

Ensure the following tools are installed on your environment:
- **Node.js:** v18.0.0 or later (v20+ LTS recommended)
- **npm:** v9.0.0 or later
- **MongoDB:** v6.0+ (Local MongoDB Community Server or MongoDB Atlas cluster)
- **Git:** v2.30.0 or later

### Environment Configuration

1. **Frontend Configuration:**
   Copy `.env.example` in the project root to `.env`:
   ```bash
   cp .env.example .env
   ```
   Configure your frontend environment variables:
   ```env
   VITE_API_URL=http://localhost:5000/api/v1
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_placeholder_key_51ABCxyz
   ```

2. **Backend Configuration:**
   Copy `server/.env.example` to `server/.env`:
   ```bash
   cp server/.env.example server/.env
   ```
   Configure your backend environment variables:
   ```env
   NODE_ENV=development
   PORT=5000
   CLIENT_URL=http://localhost:5173
   MONGODB_URI=mongodb://127.0.0.1:27017/novamart
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRES_IN=7d
   STRIPE_SECRET_KEY=sk_test_placeholder_key_51ABCxyz
   STRIPE_WEBHOOK_SECRET=whsec_placeholder_webhook_secret_xyz
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/danishalipny-pixel/NOVAMART.git
   cd NOVAMART
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Install backend dependencies:
   ```bash
   cd server && npm install && cd ..
   ```

### Available Scripts

#### Root Orchestration Scripts
- **`npm run dev`** — Launches the Vite frontend development server at `http://localhost:5173`.
- **`npm run build`** — Compiles and optimizes the React frontend into the `dist/` directory.
- **`npm run preview`** — Locally previews the compiled production build.
- **`npm run lint`** — Executes Oxlint across all JavaScript and JSX source files.
- **`npm run server`** — Starts the Express backend server using Node.js.
- **`npm run server:dev`** — Starts the Express backend in development watch mode (`node --watch`).
- **`npm run server:test`** — Runs all 8 backend automated test suites sequentially.

#### Backend Scripts (`cd server`)
- **`npm start`** — Starts the production backend server (`node src/server.js`).
- **`npm run dev`** — Starts development server with file watching.
- **`npm test`** — Executes all backend test suites.
- **`npm run test:models`** — Executes Mongoose schema validation tests.
- **`npm run test:health`** — Executes HTTP health and error handler tests.
- **`npm run test:auth`** — Executes authentication and RBAC tests.
- **`npm run test:catalog`** — Executes product catalog and order processing tests.
- **`npm run test:payment`** — Executes Stripe payment and Cloudinary media tests.
- **`npm run test:profile`** — Executes user profiles, reviews, and wishlist tests.
- **`npm run test:seller-admin`** — Executes seller onboarding and admin management tests.
- **`npm run test:production`** — Executes production readiness, security headers, and rate limiting tests.

---

## Automated Testing & Quality Assurance

The platform includes a comprehensive automated test harness covering schemas, controllers, authentication, payment handling, and production hardening:

```bash
npm run server:test
```

### Verified Test Summary

| Test Suite | Assertions | Result |
| :--- | :---: | :---: |
| 1. Mongoose Model Validation (`testModels.js`) | 37 | Passed |
| 2. Backend HTTP & Health (`testHealth.js`) | 20 | Passed |
| 3. Authentication & RBAC (`testAuth.js`) | 41 | Passed |
| 4. Catalog & Orders (`testCatalogOrders.js`) | 40 | Passed |
| 5. Stripe Payments & Media (`testPaymentMedia.js`) | 30 | Passed |
| 6. Profiles, Reviews & Wishlist (`testProfileReviewWishlist.js`) | 42 | Passed |
| 7. Seller & Admin Operations (`testSellerAdmin.js`) | 57 | Passed |
| 8. Production Readiness & Security (`testProductionReadiness.js`) | 43 | Passed |
| **Total Automated Assertions** | **310** | **0 Failures (100% Pass Rate)** |

---

## Developer Information

- **Developer:** Danish Rashid
- **GitHub Profile:** [@danishalipny-pixel](https://github.com/danishalipny-pixel)
- **Repository:** [https://github.com/danishalipny-pixel/NOVAMART](https://github.com/danishalipny-pixel/NOVAMART)
- **Contact:** [danish.ali.pny@gmail.com](mailto:danish.ali.pny@gmail.com)

---

## License

This project is open-source software licensed under the [MIT License](LICENSE).
