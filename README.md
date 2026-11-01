# NOVAMART — Modern E-Commerce Platform

A performant, component-driven e-commerce platform built with React, Vite, and Tailwind CSS. NOVAMART delivers a seamless customer shopping experience and a feature-complete merchant dashboard, backed by a centralized asset architecture, zero cumulative layout shift (CLS), and resilient image rendering.

---

## Table of Contents

- [Overview](#overview)
- [Purpose and Objectives](#purpose-and-objectives)
- [Key Features](#key-features)
  - [Customer Storefront](#customer-storefront)
  - [Product Detail Experience](#product-detail-experience)
  - [Cart & Checkout](#cart--checkout)
  - [Seller Dashboard & Product Management](#seller-dashboard--product-management)
  - [Quality Assurance & Viewport Controller](#quality-assurance--viewport-controller)
- [Technology Stack](#technology-stack)
- [System Architecture & Folder Structure](#system-architecture--folder-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Available Scripts](#available-scripts)
- [Developer Information](#developer-information)
- [License](#license)

---

## Overview

NOVAMART is an end-to-end digital retail platform designed for both consumers and independent sellers. It pairs a polished consumer storefront—featuring product filtering, dynamic promotional banners, and an interactive multi-image product detail view—with an intuitive seller administration dashboard that supports multi-image uploads, inventory editing, sales analytics, and fulfillment tracking.

The application is engineered with an emphasis on visual stability, fast load times, and fluid adaptation across varying screen widths without horizontal overflow.

---

## Purpose and Objectives

1. **Visual Stability & Zero CLS:** Enforce strict container aspect ratios across all product cards, category tiles, and banners to eliminate Cumulative Layout Shift during resource loading.
2. **Fail-Safe Image Rendering:** Implement client-side fallback mechanisms (`SafeImage`) that catch missing or broken image assets and immediately present styled SVG placeholders instead of native browser broken-image icons.
3. **Centralized Asset Management:** Maintain all local product, category, banner, brand, and icon graphics within a unified, version-controlled asset repository with optimized WebP compression.
4. **Adaptive Layouts:** Provide an uninterrupted user experience across mobile phones, tablets, laptops, and wide desktop displays using standard CSS flexbox, CSS grid, and responsive utility classes.
5. **Comprehensive Merchant Controls:** Provide sellers with a dedicated management interface to add new products, inspect multi-image galleries, designate primary cover photos, and track incoming orders.

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
- **Free Shipping Meter:** Dynamic progress bar showing the remaining order amount required to qualify for complimentary express delivery.
- **Express Checkout Modal:** Multi-step modal capturing shipping addresses and payment details with instant order number generation and local storage synchronization.
- **Persistent Wishlist:** Toggle favorites directly from product cards or detail modals with persistent storage across sessions.

### Seller Dashboard & Product Management
- **Key Performance Indicators:** Real-time metrics tracking Total Revenue, Monthly Growth, Order Volume, and Average Review Ratings.
- **Revenue Velocity Chart:** Scalable vector graphics (SVG) area chart illustrating monthly sales volume.
- **Catalog Inventory Management:** Table of all active listings with image thumbnails, categories, pricing, stock levels, and quick edit/delete actions.
- **Multi-Image Uploader:**
  - Drag-and-drop file upload zone.
  - Multi-file selection with instantaneous preview thumbnail generation.
  - One-click primary cover designation (`COVER` badge) for storefront card display.
  - Image replacement and deletion on individual thumbnail cards.
  - Client-side validation enforcing supported formats (JPEG, PNG, WebP, AVIF) and size limits (< 5MB).
  - Simulated progress meter indicating image optimization and catalog synchronization.
- **Order Tracking:** Table displaying Order IDs, customer names, purchased items, totals, dates, and fulfillment status tags.

### Quality Assurance & Viewport Controller
- **Viewport Simulator Bar:** Sticky developer toolbar enabling one-click viewport simulation across Mobile (375px), Tablet (768px), Laptop (1024px), Desktop (1440px), and Fluid Responsive modes.
- **Image Health Audit Inspector:** Integrated diagnostic tool verifying that all catalog, banner, and category images resolve successfully, validating fallback resilience through test assertions.

---

## Technology Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Runtime & Framework** | React 19 | Component-based UI architecture utilizing hooks and Context API |
| **Build Tool** | Vite 8 | Fast Hot Module Replacement (HMR) and optimized Rollup bundling |
| **Styling** | Tailwind CSS 4 | Utility-first CSS framework with responsive breakpoint utilities |
| **Icons** | Lucide React | Clean, consistent vector iconography |
| **State & Persistence** | React Context + LocalStorage | Client-side global state for cart, wishlist, inventory, and orders |
| **Image Compression** | WebP & SVG | High-efficiency modern formats ensuring rapid transfer and zero artifacts |
| **Linting & QA** | Oxlint | High-speed static code analysis |

---

## System Architecture & Folder Structure

```
NOVAMART/
├── public/
│   ├── assets/
│   │   └── images/
│   │       ├── logo/            # Platform logos and vector marks
│   │       ├── products/        # Product image galleries by category
│   │       │   ├── electronics/
│   │       │   ├── accessories/
│   │       │   ├── home-living/
│   │       │   ├── fashion/
│   │       │   └── footwear/
│   │       ├── categories/      # Category showcase photography
│   │       ├── banners/         # Hero sliders and promotional banner art
│   │       ├── brands/          # Partner and manufacturer SVG logos
│   │       ├── avatars/         # User and merchant profile avatars
│   │       ├── icons/           # Trust badges and feature icons
│   │       └── placeholders/   # SVG and WebP fallback placeholders
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── common/              # SafeImage, Badge, RatingStars, Toast
│   │   ├── layout/              # Navbar, MobileDrawer, MobileBottomNav, Footer, ResponsiveTesterBar
│   │   ├── storefront/          # HeroBanner, CategoryGrid, PromoBanners, ProductGrid, ProductCard, ProductDetailModal, QuickViewModal, CartDrawer, CheckoutModal
│   │   ├── seller/              # SellerDashboard, ProductUploadModal
│   │   └── verification/        # ImageAuditModal
│   ├── constants/
│   │   └── imageAssets.js       # Centralized asset reference mapping
│   ├── context/
│   │   ├── StoreContext.jsx     # Global store provider and business logic
│   │   └── useStore.js          # Custom store consumer hook
│   ├── data/
│   │   ├── products.js          # Default catalog items with specs and galleries
│   │   ├── categories.js        # Category definitions and asset links
│   │   ├── banners.js           # Hero slider and promotional banner configurations
│   │   └── mockSeller.js        # Analytics data points and initial orders
│   ├── App.jsx                  # Root application component
│   ├── main.jsx                 # Application entry point
│   └── index.css                # Global base styles, scrollbars, and image zoom rules
├── index.html                   # HTML template with responsive meta tags
├── package.json                 # Dependencies and npm script definitions
└── vite.config.js               # Vite build and Tailwind plugin configuration
```

---

## Getting Started

### Prerequisites

Ensure you have the following installed on your development machine:
- **Node.js:** v18.0.0 or later (v20+ recommended)
- **npm:** v9.0.0 or later (or `pnpm` / `yarn`)
- **Git:** v2.30.0 or later

### Installation

1. Clone the repository to your local machine:
   ```bash
   git clone https://github.com/danishalipny-pixel/NOVAMART.git
   cd NOVAMART
   ```

2. Install project dependencies:
   ```bash
   npm install
   ```

### Available Scripts

- **Start Local Development Server:**
  ```bash
  npm run dev
  ```
  Launches the Vite development server with Hot Module Replacement (HMR) at `http://localhost:5173`.

- **Create Production Build:**
  ```bash
  npm run build
  ```
  Compiles and optimizes JavaScript and CSS assets into the `dist/` directory for production deployment.

- **Preview Production Build:**
  ```bash
  npm run preview
  ```
  Serves the contents of `dist/` locally to preview the production build.

- **Run Linter:**
  ```bash
  npm run lint
  ```
  Executes Oxlint across all project files to detect potential issues and syntax discrepancies.

---

## Developer Information

- **Developer:** Danish Rashid
- **GitHub Profile:** [@danishalipny-pixel](https://github.com/danishalipny-pixel)
- **Repository:** [https://github.com/danishalipny-pixel/NOVAMART](https://github.com/danishalipny-pixel/NOVAMART)
- **Contact:** [danish.ali.pny@gmail.com](mailto:danish.ali.pny@gmail.com)

---

## License

This project is open-source software licensed under the [MIT License](LICENSE).
