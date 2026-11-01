import React, { useState } from 'react';
import { ImageOff, Sparkles, Package } from 'lucide-react';
import { getFallbackImage, PLACEHOLDER_ASSETS } from '../../constants/imageAssets';

/**
 * SafeImage - Rock-solid image wrapper that enforces:
 * 1. Aspect ratio container to prevent Cumulative Layout Shift (CLS)
 * 2. Elegant shimmer skeleton while loading
 * 3. object-fit: contain or cover with neutral background framing
 * 4. Automatic error handling with a sleek fallback (no broken image icons ever!)
 * 5. Native lazy loading
 */
export default function SafeImage({
  src,
  alt = 'Product image',
  className = '',
  containerClassName = '',
  aspectRatio = 'aspect-square',
  fit = 'contain', // 'contain' or 'cover'
  loading = 'lazy',
  fallbackText,
  fallbackType = 'product', // 'product' | 'banner' | 'category' | 'avatar'
  padding = fit === 'contain' ? 'p-3' : 'p-0',
  showZoomOnHover = false,
  onClick
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(!src);
  const [prevSrc, setPrevSrc] = useState(src);
  const [attemptedFallback, setAttemptedFallback] = useState(false);

  // Synchronize state when src prop changes without cascading renders
  if (prevSrc !== src) {
    setPrevSrc(src);
    setLoaded(false);
    setError(!src);
    setAttemptedFallback(false);
  }

  const handleLoad = () => {
    setLoaded(true);
    setError(false);
  };

  const handleError = () => {
    if (!attemptedFallback) {
      setAttemptedFallback(true);
      // Try local placeholder asset first
      const fallbackUrl = getFallbackImage(fallbackType);
      if (fallbackUrl && fallbackUrl !== src) {
        setPrevSrc(fallbackUrl);
        return;
      }
    }
    setLoaded(false);
    setError(true);
  };

  const fitClass = fit === 'contain' ? 'object-contain' : 'object-cover';

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden w-full select-none bg-slate-50 flex items-center justify-center ${aspectRatio} ${containerClassName} ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      {/* 1. Loading Shimmer Skeleton */}
      {!loaded && !error && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100 animate-pulse">
          <Package className="w-8 h-8 text-slate-300 animate-bounce opacity-60" />
          <span className="text-[11px] text-slate-400 mt-1 font-medium">Loading image...</span>
        </div>
      )}

      {/* 2. Error Fallback (Guaranteed: NEVER broken image icon) */}
      {error ? (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-4 text-center bg-gradient-to-b from-slate-50 to-slate-100 border border-slate-200/60 rounded-inherit">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100/80 flex items-center justify-center text-indigo-500 mb-2 shadow-xs">
            {fallbackType === 'product' ? (
              <Package className="w-6 h-6 stroke-[1.8]" />
            ) : fallbackType === 'banner' ? (
              <Sparkles className="w-6 h-6 stroke-[1.8]" />
            ) : (
              <ImageOff className="w-6 h-6 stroke-[1.8]" />
            )}
          </div>
          <span className="text-xs font-semibold text-slate-700 line-clamp-1 max-w-[90%]">
            {fallbackText || alt || 'NovaMart Verified'}
          </span>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5 font-medium">
            Placeholder Preview
          </span>
        </div>
      ) : (
        /* 3. The Real Image */
        <img
          src={src || PLACEHOLDER_ASSETS.product}
          alt={alt}
          loading={loading}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          className={`w-full h-full ${fitClass} ${padding} transition-all duration-300 ${
            showZoomOnHover ? 'group-hover:scale-105 transition-transform duration-500 ease-out' : ''
          } ${loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'} ${className}`}
        />
      )}
    </div>
  );
}
