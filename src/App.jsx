import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { AuthProvider, useAuth } from './context/AuthContext';
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
import WishlistModal from './components/storefront/WishlistModal';
import ProfileModal from './components/auth/ProfileModal';
import AdminDashboardModal from './components/admin/AdminDashboardModal';
import ImageAuditModal from './components/verification/ImageAuditModal';
import AuthModal from './components/auth/AuthModal';
import ToastContainer from './components/common/Toast';
import ErrorBoundary from './components/common/ErrorBoundary';
import { ShieldAlert, Store, ArrowRight } from 'lucide-react';

function AppContent() {
  const { activeView, setActiveView, viewportMode } = useStore();
  const { user, isAuthenticated, isSeller, openAuthModal } = useAuth();

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
          ) : !isAuthenticated || !isSeller ? (
            /* Protected Route Guard Screen */
            <div className="py-16 px-4 text-center max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-4 shadow-xs">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mb-2">
                Merchant Access Restricted
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed mb-6">
                {!isAuthenticated
                  ? 'Access to the Seller Management Dashboard requires authentication with an authorized merchant account.'
                  : 'You are signed in as a Customer. To list products, manage inventory, and view sales performance, please activate your Seller profile.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <button
                  onClick={() => openAuthModal(!isAuthenticated ? 'login' : 'become-seller')}
                  className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Store className="w-4 h-4" />
                  <span>{!isAuthenticated ? 'Sign In as Seller' : 'Activate Seller Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveView('storefront')}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                >
                  Return to Storefront
                </button>
              </div>
            </div>
          ) : (
            /* Seller Portal Hub (Authenticated & Authorized) */
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
      <WishlistModal />
      <ProfileModal key={user?._id || user?.id || 'guest'} />
      <AdminDashboardModal />
      <ImageAuditModal />
      <AuthModal />
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <StoreProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </StoreProvider>
    </ErrorBoundary>
  );
}
