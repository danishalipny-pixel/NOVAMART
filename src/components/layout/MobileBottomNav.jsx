import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Home, Layers, Heart, ShoppingCart, Store } from 'lucide-react';

export default function MobileBottomNav() {
  const {
    activeView,
    setActiveView,
    setIsMobileNavOpen,
    setIsCartOpen,
    cartCount,
    wishlist
  } = useStore();

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1.5 shadow-lg">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* Home */}
        <button
          onClick={() => setActiveView('storefront')}
          className={`flex flex-col items-center justify-center p-1.5 rounded-lg text-[10px] font-medium transition-colors ${
            activeView === 'storefront' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span>Home</span>
        </button>

        {/* Categories Drawer */}
        <button
          onClick={() => setIsMobileNavOpen(true)}
          className="flex flex-col items-center justify-center p-1.5 rounded-lg text-[10px] font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <Layers className="w-5 h-5 mb-0.5" />
          <span>Categories</span>
        </button>

        {/* Wishlist */}
        <button
          onClick={() => {
            setActiveView('storefront');
          }}
          className="relative flex flex-col items-center justify-center p-1.5 rounded-lg text-[10px] font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <Heart className="w-5 h-5 mb-0.5" />
          <span>Wishlist</span>
          {wishlist.length > 0 && (
            <span className="absolute top-1 right-2 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
              {wishlist.length}
            </span>
          )}
        </button>

        {/* Cart */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center justify-center p-1.5 rounded-lg text-[10px] font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ShoppingCart className="w-5 h-5 mb-0.5" />
          <span>Cart</span>
          {cartCount > 0 && (
            <span className="absolute top-1 right-2 w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] font-bold flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>

        {/* Seller Portal */}
        <button
          onClick={() => setActiveView(activeView === 'seller' ? 'storefront' : 'seller')}
          className={`flex flex-col items-center justify-center p-1.5 rounded-lg text-[10px] font-medium transition-colors ${
            activeView === 'seller' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Store className="w-5 h-5 mb-0.5" />
          <span>Seller</span>
        </button>
      </div>
    </div>
  );
}
