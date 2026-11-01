import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import ResponsiveTesterBar from './components/layout/ResponsiveTesterBar';
import Navbar from './components/layout/Navbar';
import MobileDrawer from './components/layout/MobileDrawer';
import MobileBottomNav from './components/layout/MobileBottomNav';
import Footer from './components/layout/Footer';
import HeroBanner from './components/storefront/HeroBanner';
import CategoryGrid from './components/storefront/CategoryGrid';
import PromoBanners from './components/storefront/PromoBanners';
import ProductGrid from './components/storefront/ProductGrid';
import SellerDashboard from './components/seller/SellerDashboard';
import ProductDetailModal from './components/storefront/ProductDetailModal';
import QuickViewModal from './components/storefront/QuickViewModal';
import CartDrawer from './components/storefront/CartDrawer';
import CheckoutModal from './components/storefront/CheckoutModal';
import ImageAuditModal from './components/verification/ImageAuditModal';
import ToastContainer from './components/common/Toast';

function AppContent() {
  const { activeView, viewportMode } = useStore();

  // Viewport simulator dimensions
  const viewportWidthStyles = {
    responsive: 'w-full',
    mobile: 'max-w-[375px] mx-auto shadow-2xl border-x border-slate-300 min-h-screen my-4 rounded-3xl overflow-hidden',
    tablet: 'max-w-[768px] mx-auto shadow-2xl border-x border-slate-300 min-h-screen my-4 rounded-2xl overflow-hidden',
    laptop: 'max-w-[1024px] mx-auto shadow-2xl border-x border-slate-300 min-h-screen my-4 rounded-xl overflow-hidden',
    desktop: 'max-w-[1440px] mx-auto shadow-2xl border-x border-slate-300 min-h-screen my-4 overflow-hidden'
  };

  const currentWrapperClass = viewportWidthStyles[viewportMode] || 'w-full';

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70 text-slate-800 antialiased overflow-x-hidden">
      {/* Top QA & Responsive Controller Bar */}
      <ResponsiveTesterBar />

      {/* Simulator Device Frame Wrapper */}
      <div className={`transition-all duration-300 flex-1 flex flex-col bg-white ${currentWrapperClass}`}>
        {/* Navigation Bar */}
        <Navbar />

        {/* Mobile Navigation Drawer */}
        <MobileDrawer />

        {/* Main Workspace View */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 py-4">
          {activeView === 'storefront' ? (
            <>
              {/* Homepage Hero Carousel */}
              <HeroBanner />

              {/* Verified Categories Showcase */}
              <CategoryGrid />

              {/* Promotional Feature Split Banners */}
              <PromoBanners />

              {/* Main Product Catalog Grid with Filters */}
              <ProductGrid />
            </>
          ) : (
            /* Seller Portal Hub */
            <SellerDashboard />
          )}
        </main>

        {/* Global Footer */}
        <Footer />

        {/* Mobile Fixed Bottom Navigation Bar */}
        <MobileBottomNav />
      </div>

      {/* Modals & Overlays */}
      <ProductDetailModal />
      <QuickViewModal />
      <CartDrawer />
      <CheckoutModal />
      <ImageAuditModal />
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
