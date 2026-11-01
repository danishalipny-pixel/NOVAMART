import React from 'react';
import { useStore } from '../../context/StoreContext';
import { categories } from '../../data/categories';
import { X, Store, ShoppingBag, ShieldCheck, ChevronRight } from 'lucide-react';
import SafeImage from '../common/SafeImage';

export default function MobileDrawer() {
  const {
    isMobileNavOpen,
    setIsMobileNavOpen,
    selectedCategory,
    setSelectedCategory,
    activeView,
    setActiveView
  } = useStore();

  if (!isMobileNavOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsMobileNavOpen(false)}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      {/* Drawer Content */}
      <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-300">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-base tracking-tight text-slate-900">
              NOVAMART
            </span>
          </div>
          <button
            onClick={() => setIsMobileNavOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/50"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Action Switcher */}
        <div className="p-3 bg-indigo-50/70 border-b border-indigo-100">
          <button
            onClick={() => {
              setActiveView(activeView === 'seller' ? 'storefront' : 'seller');
              setIsMobileNavOpen(false);
            }}
            className="w-full flex items-center justify-between p-2.5 bg-white rounded-xl border border-indigo-200/70 shadow-xs text-xs font-bold text-indigo-700 cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Store className="w-4 h-4 text-indigo-600" />
              {activeView === 'seller' ? 'Switch to Storefront' : 'Open Seller Dashboard'}
            </span>
            <ChevronRight className="w-4 h-4 text-indigo-400" />
          </button>
        </div>

        {/* Category List with Thumbnails */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Browse Categories
          </div>

          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setActiveView('storefront');
                  setIsMobileNavOpen(false);
                }}
                className={`w-full flex items-center gap-3 p-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-slate-200/50">
                  <SafeImage
                    src={cat.image}
                    alt={cat.name}
                    aspectRatio="aspect-square"
                    fit="cover"
                    padding="p-0"
                    fallbackType="category"
                  />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="truncate">{cat.name}</div>
                  <div
                    className={`text-[10px] ${
                      isSelected ? 'text-indigo-200' : 'text-slate-400'
                    }`}
                  >
                    {cat.count} items
                  </div>
                </div>
                <ChevronRight
                  className={`w-4 h-4 shrink-0 ${
                    isSelected ? 'text-white' : 'text-slate-300'
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/80 text-xs text-slate-500 space-y-2">
          <div className="flex items-center gap-2 text-emerald-600 font-semibold text-[11px]">
            <ShieldCheck className="w-4 h-4" />
            <span>Guaranteed High-Res Verified Items</span>
          </div>
          <div className="text-[11px] text-slate-400">
            © 2026 NOVAMART Platform • Full Responsiveness Engine
          </div>
        </div>
      </div>
    </div>
  );
}
