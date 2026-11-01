import React from 'react';
import { useStore } from '../../context/StoreContext';
import SafeImage from '../common/SafeImage';
import RatingStars from '../common/RatingStars';
import Badge from '../common/Badge';
import { Heart, ShoppingCart, Eye } from 'lucide-react';

export default function ProductCard({ product }) {
  const {
    addToCart,
    wishlist,
    toggleWishlist,
    setSelectedProductForDetail,
    setQuickViewProduct
  } = useStore();

  const isFavorited = wishlist.includes(product.id);
  const primaryImage = (product.images && product.images[0]) || '';

  return (
    <div className="group relative flex flex-col rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-300 hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* 1. Consistent Image Container */}
      <div className="relative w-full aspect-square bg-slate-50 overflow-hidden border-b border-slate-100 flex items-center justify-center">
        {/* Safe Image Wrapper with object-fit: contain to never clip or stretch items */}
        <SafeImage
          src={primaryImage}
          alt={product.name}
          aspectRatio="aspect-square"
          fit="contain"
          padding="p-4"
          showZoomOnHover={true}
          onClick={() => setSelectedProductForDetail(product)}
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 z-20 flex flex-col gap-1 items-start">
          {product.badge && (
            <Badge
              variant={
                product.badge.includes('OFF') || product.badge === 'Sale'
                  ? 'sale'
                  : product.badge === 'Best Seller'
                  ? 'pro'
                  : 'primary'
              }
            >
              {product.badge}
            </Badge>
          )}
          {product.discountPercentage > 0 && !product.badge?.includes('OFF') && (
            <span className="bg-rose-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full shadow-xs">
              -{product.discountPercentage}%
            </span>
          )}
        </div>

        {/* Top-Right Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className={`absolute top-2.5 right-2.5 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
            isFavorited
              ? 'bg-rose-50 text-rose-600 shadow-md ring-1 ring-rose-200'
              : 'bg-white/90 text-slate-500 hover:text-rose-600 hover:bg-white shadow-xs'
          }`}
          aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-500' : ''}`} />
        </button>

        {/* Quick View Button (hover overlay on desktop, always clean) */}
        <div className="absolute inset-x-3 bottom-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden sm:block">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setQuickViewProduct(product);
            }}
            className="w-full py-2 bg-slate-900/90 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl backdrop-blur-xs flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-all cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Quick View</span>
          </button>
        </div>

        {/* Multi-Image indicator badge */}
        {product.images && product.images.length > 1 && (
          <div className="absolute bottom-2.5 right-2.5 z-10 bg-slate-900/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md pointer-events-none">
            +{product.images.length} views
          </div>
        )}
      </div>

      {/* 2. Product Meta & Pricing */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Category */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span className="font-semibold text-indigo-600 uppercase tracking-wider text-[10px]">
              {product.brand}
            </span>
            <span className="capitalize">{product.category}</span>
          </div>

          {/* Product Title */}
          <h3
            onClick={() => setSelectedProductForDetail(product)}
            className="font-bold text-xs sm:text-sm text-slate-800 line-clamp-2 hover:text-indigo-600 cursor-pointer transition-colors leading-snug"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Ratings */}
          <div className="mt-1.5 flex items-center">
            <RatingStars
              rating={product.rating || 5.0}
              reviewCount={product.reviewCount}
              size="xs"
            />
          </div>
        </div>

        {/* Price & Add to Cart Action */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <div className="text-base sm:text-lg font-black text-slate-900 leading-none">
              ${product.price.toFixed(2)}
            </div>
            {product.originalPrice && product.originalPrice > product.price && (
              <div className="text-[11px] text-slate-400 line-through mt-0.5">
                ${product.originalPrice.toFixed(2)}
              </div>
            )}
          </div>

          <button
            onClick={() => addToCart(product, 1)}
            disabled={product.stock === 0}
            className={`p-2.5 rounded-xl transition-all flex items-center justify-center shrink-0 cursor-pointer ${
              product.stock === 0
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 active:scale-90 text-white shadow-xs shadow-indigo-600/30'
            }`}
            title={product.stock === 0 ? 'Out of Stock' : 'Add to cart'}
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
