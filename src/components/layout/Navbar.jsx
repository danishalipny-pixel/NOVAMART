import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { categories } from '../../data/categories';
import {
  Search,
  ShoppingCart,
  Heart,
  Store,
  Menu,
  X,
  Sparkles,
  ShieldCheck,
  ShoppingBag,
  User,
  LogOut,
  ChevronDown
} from 'lucide-react';

export default function Navbar() {
  const {
    activeView,
    setActiveView,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    cartCount,
    setIsCartOpen,
    wishlist,
    setIsMobileNavOpen,
    setIsWishlistOpen,
    setIsProfileOpen,
    setIsAdminModalOpen,
    addToast
  } = useStore();

  const {
    user,
    isAuthenticated,
    isSeller,
    isAdmin,
    openAuthModal,
    logout
  } = useAuth();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Close user dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };
    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isUserMenuOpen]);

  // Protected Seller Access handler
  const handleSellerAccess = () => {
    if (activeView === 'seller') {
      setActiveView('storefront');
      return;
    }

    if (!isAuthenticated) {
      addToast('Please sign in to access the Seller Dashboard', 'info');
      openAuthModal('login');
      return;
    }

    if (!isSeller) {
      addToast('Activate your seller store profile to access the dashboard', 'info');
      openAuthModal('become-seller');
      return;
    }

    setActiveView('seller');
  };

  return (
    <header className="sticky top-[33px] z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top micro-bar: announcements & utility */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
              <Sparkles className="w-3.5 h-3.5" /> High-Resolution Verified Imagery
            </span>
            <span className="text-slate-600">•</span>
            <span>Free Express Delivery on orders over $100</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            {isAdmin && (
              <>
                <button
                  onClick={() => setIsAdminModalOpen(true)}
                  className="hover:text-purple-300 transition-colors flex items-center gap-1 font-semibold text-purple-400 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Admin Control Hub
                </button>
                <span className="text-slate-600">•</span>
              </>
            )}
            <button
              onClick={handleSellerAccess}
              className="hover:text-white transition-colors flex items-center gap-1 font-semibold text-indigo-400 cursor-pointer"
            >
              <Store className="w-3.5 h-3.5" />
              {activeView === 'seller' ? 'Return to Storefront' : 'Seller Dashboard Portal'}
            </button>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">24/7 Priority Support</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3.5">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Left: Mobile Menu Toggle & Brand Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsMobileNavOpen(true)}
              className="lg:hidden p-2 text-slate-700 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none"
              aria-label="Open mobile navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <button
              onClick={() => {
                setActiveView('storefront');
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="flex items-center gap-2 text-left group cursor-pointer"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <span className="text-lg sm:text-xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-700 bg-clip-text text-transparent block leading-tight">
                  NOVAMART
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-600 hidden sm:block">
                  Next-Gen Retail
                </span>
              </div>
            </button>
          </div>

          {/* Center: Search Bar (Responsive) */}
          <div className="flex-1 max-w-xl mx-2 sm:mx-4 hidden sm:block">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search premium headphones, watches, 4K cameras..."
                className="w-full pl-10 pr-9 py-2 rounded-xl bg-slate-100/80 border border-slate-200/80 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="p-1 text-slate-400 hover:text-slate-600 absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* View Switcher Button (Desktop & Tablet) */}
            <button
              onClick={handleSellerAccess}
              className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeView === 'seller'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : 'bg-slate-900 text-white hover:bg-slate-800 shadow-xs'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>{activeView === 'seller' ? 'Customer View' : 'Seller Portal'}</span>
            </button>

            {/* Wishlist Button */}
            <button
              onClick={() => setIsWishlistOpen(true)}
              title="Saved items in Wishlist"
              className="relative p-2 text-slate-700 hover:text-rose-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl shadow-xs transition-all cursor-pointer"
              aria-label="View Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="hidden sm:inline text-xs font-bold">Cart</span>
              {cartCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-white text-indigo-700 text-xs font-bold flex items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Account / Auth Dropdown */}
            <div className="relative" ref={userMenuRef}>
              {!isAuthenticated ? (
                <button
                  onClick={() => openAuthModal('login')}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-indigo-600 hover:bg-slate-100 border border-slate-200/80 transition-colors cursor-pointer"
                  aria-label="Sign In or Register"
                >
                  <User className="w-4 h-4 text-indigo-600" />
                  <span className="hidden sm:inline">Sign In</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-slate-50 transition-all cursor-pointer"
                    aria-label="User Account Menu"
                  >
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="hidden sm:block text-left text-xs">
                      <span className="font-bold text-slate-800 block truncate max-w-[85px] leading-tight">
                        {user.name.split(' ')[0]}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-indigo-600 block leading-tight">
                        {user.role}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-900">{user.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                        <span className="mt-1.5 inline-block px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider">
                          {user.role} Account
                        </span>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => {
                            setIsProfileOpen(true);
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2 cursor-pointer"
                        >
                          <User className="w-4 h-4 text-indigo-600" />
                          <span>Profile & Security</span>
                        </button>
                        <button
                          onClick={() => {
                            setIsWishlistOpen(true);
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-rose-50 hover:text-rose-600 flex items-center gap-2 cursor-pointer"
                        >
                          <Heart className="w-4 h-4 text-rose-500" />
                          <span>My Wishlist ({wishlist.length})</span>
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => {
                              setIsAdminModalOpen(true);
                              setIsUserMenuOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-xs font-medium text-purple-700 hover:bg-purple-50 flex items-center gap-2 cursor-pointer"
                          >
                            <ShieldCheck className="w-4 h-4 text-purple-600" />
                            <span>Admin Control Hub</span>
                          </button>
                        )}
                        {isSeller ? (
                          <button
                            onClick={() => {
                              setActiveView('seller');
                              setIsUserMenuOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2 cursor-pointer"
                          >
                            <Store className="w-4 h-4 text-indigo-600" />
                            <span>Seller Dashboard</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              openAuthModal('become-seller');
                              setIsUserMenuOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2 cursor-pointer"
                          >
                            <Store className="w-4 h-4 text-emerald-600" />
                            <span>Become a Seller</span>
                          </button>
                        )}
                      </div>

                      <div className="border-t border-slate-100 pt-1">
                        <button
                          onClick={() => {
                            logout();
                            setIsUserMenuOpen(false);
                            setActiveView('storefront');
                            addToast('Signed out of NOVAMART', 'info');
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                        >
                          <LogOut className="w-4 h-4 text-rose-500" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Bar Row (Visible only on < 640px) */}
        <div className="mt-2.5 sm:hidden">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, brands, gear..."
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-100 border border-slate-200/80 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-indigo-500 outline-none"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="p-1 text-slate-400 hover:text-slate-600 absolute right-2 top-1/2 -translate-y-1/2"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category Navigation Bar (Desktop & Tablet) */}
      <nav aria-label="Product categories" className="hidden lg:block border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-xs font-medium">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-2">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    if (activeView !== 'storefront') setActiveView('storefront');
                  }}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50 text-indigo-700 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 text-slate-500 font-medium shrink-0">
            <span className="flex items-center gap-1 text-emerald-600 font-semibold">
              <ShieldCheck className="w-4 h-4" /> 100% Authentic Guaranteed
            </span>
          </div>
        </div>
      </nav>
    </header>
  );
}
