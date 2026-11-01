import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import SafeImage from '../common/SafeImage';
import RatingStars from '../common/RatingStars';
import { X, ShoppingCart, ArrowRight } from 'lucide-react';

export default function QuickViewModal() {
  const {
    quickViewProduct,
    setQuickViewProduct,
    setSelectedProductForDetail,
    addToCart
  } = useStore();

  const [activeThumb, setActiveThumb] = useState(0);

  if (!quickViewProduct) return null;

  const images = quickViewProduct.images || [];
  const currentImage = images[activeThumb] || images[0];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        onClick={() => setQuickViewProduct(null)}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
      />

      <div className="min-h-screen flex items-center justify-center p-3 sm:p-4">
        <div className="relative w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-200 z-10 animate-in fade-in zoom-in-95 duration-200">
          <button
            onClick={() => setQuickViewProduct(null)}
            className="absolute top-3 right-3 z-20 p-1.5 text-slate-400 hover:text-slate-800 bg-white/90 rounded-full shadow-xs"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-2">
            {/* Image & Thumbs */}
            <div className="p-4 bg-slate-50 flex flex-col justify-between">
              <div className="aspect-square w-full rounded-xl bg-white border border-slate-200/80 overflow-hidden">
                <SafeImage
                  src={currentImage}
                  alt={quickViewProduct.name}
                  aspectRatio="aspect-square"
                  fit="contain"
                  padding="p-4"
                />
              </div>

              {images.length > 1 && (
                <div className="flex items-center gap-2 mt-3 overflow-x-auto no-scrollbar">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveThumb(idx)}
                      className={`w-12 h-12 rounded-lg border-2 overflow-hidden bg-white shrink-0 ${
                        activeThumb === idx ? 'border-indigo-600' : 'border-slate-200 opacity-60'
                      }`}
                    >
                      <SafeImage
                        src={img}
                        alt={`Thumb ${idx}`}
                        aspectRatio="aspect-square"
                        fit="contain"
                        padding="p-1"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Details */}
            <div className="p-5 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                  {quickViewProduct.brand}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1 leading-snug">
                  {quickViewProduct.name}
                </h3>

                <div className="mt-2">
                  <RatingStars
                    rating={quickViewProduct.rating || 5}
                    reviewCount={quickViewProduct.reviewCount}
                    size="xs"
                  />
                </div>

                <div className="mt-3 text-xl font-black text-slate-900">
                  ${quickViewProduct.price.toFixed(2)}
                </div>

                <p className="mt-2 text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {quickViewProduct.description}
                </p>
              </div>

              <div className="mt-6 space-y-2 pt-4 border-t border-slate-100">
                <button
                  onClick={() => {
                    addToCart(quickViewProduct, 1, currentImage);
                    setQuickViewProduct(null);
                  }}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedProductForDetail(quickViewProduct);
                    setQuickViewProduct(null);
                  }}
                  className="w-full py-2 text-slate-600 hover:text-indigo-600 text-xs font-semibold flex items-center justify-center gap-1"
                >
                  <span>View Full Product Specs</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
