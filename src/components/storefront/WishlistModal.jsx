import React from 'react';
import { useStore } from '../../context/StoreContext';
import SafeImage from '../common/SafeImage';
import RatingStars from '../common/RatingStars';
import { X, Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';

export default function WishlistModal() {
  const {
    isWishlistOpen,
    setIsWishlistOpen,
    wishlist,
    products,
    toggleWishlist,
    clearWishlist,
    addToCart,
    setSelectedProductForDetail
  } = useStore();

  if (!isWishlistOpen) return null;

  // Resolve product objects from catalog matching wishlist IDs
  const wishlistedProducts = products.filter(
    (p) => wishlist.includes(p.id) || wishlist.includes(p._id)
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={() => setIsWishlistOpen(false)}
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
      />

      <div className="min-h-screen flex items-center justify-center p-3 sm:p-4">
        <div className="relative w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-200 z-10 animate-in fade-in zoom-in-95">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <Heart className="w-4 h-4 fill-rose-500" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                  My Saved Wishlist
                </h3>
                <span className="text-xs text-slate-500">
                  {wishlistedProducts.length} {wishlistedProducts.length === 1 ? 'item' : 'items'} saved
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {wishlistedProducts.length > 0 && (
                <button
                  onClick={clearWishlist}
                  className="text-xs font-semibold text-slate-500 hover:text-rose-600 px-2 py-1 rounded-lg hover:bg-slate-200/50 transition-colors cursor-pointer"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={() => setIsWishlistOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-200/50 cursor-pointer"
                aria-label="Close Wishlist"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Wishlist Items List */}
          <div className="p-4 sm:p-6 max-h-[60vh] overflow-y-auto space-y-3">
            {wishlistedProducts.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-400 flex items-center justify-center mx-auto">
                  <Heart className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-800 text-sm sm:text-base">Your wishlist is empty</h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Save your favorite products while browsing to easily find and purchase them later.
                  </p>
                </div>
                <button
                  onClick={() => setIsWishlistOpen(false)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  <span>Explore Catalog</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              wishlistedProducts.map((product) => {
                const coverImage = (product.images && product.images[0]) || '';
                return (
                  <div
                    key={product.id || product._id}
                    className="flex items-center gap-3 sm:gap-4 p-3 rounded-2xl border border-slate-100 hover:border-slate-200 bg-white hover:bg-slate-50/50 transition-all group"
                  >
                    {/* Thumbnail */}
                    <div
                      onClick={() => {
                        setSelectedProductForDetail(product);
                        setIsWishlistOpen(false);
                      }}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-slate-100 overflow-hidden shrink-0 cursor-pointer p-1"
                    >
                      <SafeImage
                        src={coverImage}
                        alt={product.name}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                        {product.brand || 'NOVAMART'}
                      </p>
                      <h4
                        onClick={() => {
                          setSelectedProductForDetail(product);
                          setIsWishlistOpen(false);
                        }}
                        className="text-xs sm:text-sm font-bold text-slate-900 truncate hover:text-indigo-600 cursor-pointer"
                      >
                        {product.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs sm:text-sm font-black text-slate-900">
                          ${product.price.toFixed(2)}
                        </span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-[11px] text-slate-400 line-through">
                            ${product.originalPrice.toFixed(2)}
                          </span>
                        )}
                        <RatingStars rating={product.rating || 5} size="w-3 h-3" />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                      <button
                        onClick={() => {
                          addToCart(product, 1, coverImage);
                        }}
                        className="p-2 sm:px-3 sm:py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                        title="Move to Cart"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span className="hidden sm:inline">Add to Cart</span>
                      </button>
                      <button
                        onClick={() => toggleWishlist(product)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        title="Remove from Wishlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
