import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { reviewApi } from '../../services/api';
import SafeImage from '../common/SafeImage';
import RatingStars from '../common/RatingStars';
import Badge from '../common/Badge';
import { PLACEHOLDER_ASSETS } from '../../constants/imageAssets';
import {
  X,
  Heart,
  ShoppingCart,
  ShieldCheck,
  Truck,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Check,
  Store,
  Star,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react';

export default function ProductDetailModal() {
  const {
    selectedProductForDetail,
    setSelectedProductForDetail,
    addToCart,
    wishlist,
    toggleWishlist,
    setIsCartOpen
  } = useStore();

  const product = selectedProductForDetail;
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFullscreenLightbox, setIsFullscreenLightbox] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isLensZooming, setIsLensZooming] = useState(false);
  const [lensPosition, setLensPosition] = useState({ x: 50, y: 50 });

  // Reviews & Rating State
  const { isAuthenticated, openAuthModal } = useAuth();
  const [reviewsList, setReviewsList] = useState([]);
  const [reviewStats, setReviewStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  });
  const [isWritingReview, setIsWritingReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: '',
    comment: ''
  });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  const imageContainerRef = useRef(null);

  // Load reviews whenever selected product changes
  useEffect(() => {
    if (product) {
      const pId = product._id || product.id;
      reviewApi.getProductReviews(pId)
        .then((res) => {
          if (res?.data) {
            setReviewsList(res.data.reviews || []);
            if (res.data.stats) {
              setReviewStats(res.data.stats);
            }
          }
        })
        .catch(() => {});
    }
  }, [product]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess('');
    setReviewSubmitting(true);

    try {
      const pId = product._id || product.id;
      const res = await reviewApi.createReview(pId, reviewForm);
      if (res?.data) {
        setReviewsList((prev) => [res.data, ...prev]);
        setReviewSuccess('Review published successfully!');
        setReviewForm({ rating: 5, title: '', comment: '' });
        setIsWritingReview(false);

        // Refresh stats
        reviewApi.getProductReviews(pId).then((r) => {
          if (r?.data?.stats) setReviewStats(r.data.stats);
        });
      }
    } catch (err) {
      setReviewError(err.message || 'Unable to submit review. You must be a verified purchaser.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (!product) return null;

  const images = product.images && product.images.length > 0
    ? product.images
    : [PLACEHOLDER_ASSETS.product];

  const currentImage = images[activeImageIndex] || images[0];
  const isFavorited = wishlist.includes(product.id);

  // Mouse move for interactive zoom lens
  const handleMouseMove = (e) => {
    if (!imageContainerRef.current) return;
    const { left, top, width, height } = imageContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - left) / width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - top) / height) * 100));
    setLensPosition({ x, y });
  };

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, currentImage);
    setSelectedProductForDetail(null);
    setIsCartOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={() => setSelectedProductForDetail(null)}
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
      />

      {/* Main Modal Wrapper */}
      <div className="relative min-h-screen flex items-center justify-center p-2 sm:p-4 lg:p-6">
        <div className="relative w-full max-w-5xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-200 z-10 animate-in fade-in zoom-in-95 duration-200">
          {/* Close Button */}
          <button
            onClick={() => setSelectedProductForDetail(null)}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 p-2 text-slate-400 hover:text-slate-800 bg-white/90 hover:bg-slate-100 rounded-full shadow-md transition-colors"
            aria-label="Close product details"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 max-h-[90vh] overflow-y-auto">
            {/* LEFT: Multi-Image Gallery with Interactive Zoom (Cols: 6) */}
            <div className="lg:col-span-6 p-4 sm:p-6 lg:p-8 bg-slate-50/70 border-b lg:border-b-0 lg:border-r border-slate-200/80 flex flex-col justify-between">
              <div>
                {/* Main Image Container */}
                <div
                  ref={imageContainerRef}
                  onMouseEnter={() => setIsLensZooming(true)}
                  onMouseLeave={() => setIsLensZooming(false)}
                  onMouseMove={handleMouseMove}
                  className="relative w-full aspect-square rounded-2xl overflow-hidden bg-white border border-slate-200/80 shadow-xs flex items-center justify-center cursor-crosshair group"
                >
                  {/* The interactive main image */}
                  <SafeImage
                    src={currentImage}
                    alt={`${product.name} view ${activeImageIndex + 1}`}
                    aspectRatio="aspect-square"
                    fit="contain"
                    padding="p-6"
                    className="transition-transform duration-150"
                  />

                  {/* Desktop Hover Zoom Preview Lens (zooms at cursor position) */}
                  {isLensZooming && (
                    <div
                      className="hidden sm:block absolute inset-0 pointer-events-none z-20 bg-no-repeat rounded-2xl"
                      style={{
                        backgroundImage: `url(${currentImage})`,
                        backgroundPosition: `${lensPosition.x}% ${lensPosition.y}%`,
                        backgroundSize: '240%'
                      }}
                    />
                  )}

                  {/* Navigation Arrows for main image */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePrevImage();
                        }}
                        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/90 hover:bg-white text-slate-700 shadow-md transition-all opacity-80 group-hover:opacity-100"
                        aria-label="Previous view"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNextImage();
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/90 hover:bg-white text-slate-700 shadow-md transition-all opacity-80 group-hover:opacity-100"
                        aria-label="Next view"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  {/* Fullscreen Lightbox Trigger Button */}
                  <button
                    onClick={() => setIsFullscreenLightbox(true)}
                    className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/80 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl backdrop-blur-md shadow-md transition-all active:scale-95"
                    title="Open Fullscreen Lightbox & Zoom"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Zoom HD</span>
                  </button>

                  {/* Image Counter Badge */}
                  <div className="absolute bottom-3 left-3 z-10 bg-white/90 border border-slate-200/80 px-2 py-0.5 rounded-md text-[10px] font-bold text-slate-600 shadow-2xs">
                    {activeImageIndex + 1} / {images.length}
                  </div>
                </div>

                {/* Multiple Image Thumbnail Strip */}
                <div className="mt-4 flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-1">
                  {images.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-16 sm:w-20 aspect-square rounded-xl overflow-hidden border-2 bg-white transition-all shrink-0 ${
                        activeImageIndex === idx
                          ? 'border-indigo-600 ring-2 ring-indigo-500/20 shadow-sm'
                          : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <SafeImage
                        src={imgUrl}
                        alt={`Thumbnail ${idx + 1}`}
                        aspectRatio="aspect-square"
                        fit="contain"
                        padding="p-1.5"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Guarantees strip */}
              <div className="mt-6 pt-4 border-t border-slate-200/70 grid grid-cols-3 gap-2 text-center text-[11px] text-slate-600">
                <div className="flex flex-col items-center gap-1">
                  <Truck className="w-4 h-4 text-indigo-600" />
                  <span className="font-semibold">Fast Shipping</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold">Verified Quality</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <RotateCcw className="w-4 h-4 text-amber-600" />
                  <span className="font-semibold">30-Day Return</span>
                </div>
              </div>
            </div>

            {/* RIGHT: Product Details & Purchase Controls (Cols: 6) */}
            <div className="lg:col-span-6 p-4 sm:p-6 lg:p-8 flex flex-col justify-between">
              <div>
                {/* Brand & Category & Badges */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                      {product.brand}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-500 capitalize">{product.category}</span>
                  </div>
                  {product.badge && <Badge variant="pro">{product.badge}</Badge>}
                </div>

                {/* Title */}
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                  {product.name}
                </h1>

                {/* Ratings & Reviews */}
                <div className="mt-2.5 flex items-center gap-3">
                  <RatingStars
                    rating={product.rating || 5.0}
                    reviewCount={product.reviewCount}
                    size="sm"
                  />
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> In Stock ({product.stock} units)
                  </span>
                </div>

                {/* Price Display */}
                <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-baseline gap-3">
                  <div className="text-2xl sm:text-3xl font-black text-slate-900">
                    ${product.price.toFixed(2)}
                  </div>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <>
                      <div className="text-sm text-slate-400 line-through">
                        ${product.originalPrice.toFixed(2)}
                      </div>
                      <div className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                        Save ${(product.originalPrice - product.price).toFixed(2)}
                      </div>
                    </>
                  )}
                </div>

                {/* Description */}
                <p className="mt-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {product.description}
                </p>

                {/* Features Checklist */}
                {product.features && (
                  <div className="mt-4 space-y-1.5">
                    <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                      Key Highlights
                    </div>
                    {product.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tech Specs Table */}
                {product.specs && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                      Specifications
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {Object.entries(product.specs).map(([key, val]) => (
                        <div key={key} className="bg-slate-50 p-2 rounded-lg border border-slate-200/60">
                          <span className="text-[10px] text-slate-400 block font-medium">{key}</span>
                          <span className="text-slate-800 font-semibold truncate block">{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Seller Box */}
                {product.seller && (
                  <div className="mt-4 p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Store className="w-4 h-4 text-indigo-600" />
                      <div>
                        <span className="font-semibold text-slate-800">{product.seller.name}</span>
                        <span className="text-slate-500 text-[11px] block">
                          Verified Official Merchant • {product.seller.rating} ★
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-indigo-600">Top Seller</span>
                  </div>
                )}

                {/* Customer Reviews & Rating Aggregation Section */}
                <div className="mt-6 pt-5 border-t border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-indigo-600" />
                      <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 uppercase tracking-wider">
                        Customer Reviews & Ratings
                      </h4>
                    </div>
                    {isAuthenticated ? (
                      <button
                        onClick={() => setIsWritingReview(!isWritingReview)}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors cursor-pointer"
                      >
                        {isWritingReview ? 'Cancel Review' : 'Write a Review'}
                      </button>
                    ) : (
                      <button
                        onClick={() => openAuthModal('login')}
                        className="text-[11px] font-semibold text-indigo-600 hover:underline"
                      >
                        Sign in to review
                      </button>
                    )}
                  </div>

                  {/* Rating Breakdown Bar & Summary */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col sm:flex-row items-center gap-4">
                    <div className="text-center sm:text-left shrink-0">
                      <div className="text-3xl font-black text-slate-900 leading-none">
                        {(reviewStats.averageRating || product.rating || 5.0).toFixed(1)}
                      </div>
                      <div className="flex items-center justify-center sm:justify-start gap-1 my-1">
                        <RatingStars rating={reviewStats.averageRating || product.rating || 5} size="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium">
                        Based on {reviewStats.totalReviews || product.reviewCount || 0} reviews
                      </span>
                    </div>

                    {/* Star Distribution Bars */}
                    <div className="flex-1 w-full space-y-1">
                      {[5, 4, 3, 2, 1].map((stars) => {
                        const count = reviewStats.distribution?.[stars] || 0;
                        const total = reviewStats.totalReviews || 1;
                        const pct = Math.round((count / total) * 100);
                        return (
                          <div key={stars} className="flex items-center gap-2 text-[10px]">
                            <span className="w-7 text-slate-500 font-bold shrink-0">{stars} ★</span>
                            <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-amber-400 rounded-full transition-all"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="w-6 text-right text-slate-400 font-mono shrink-0">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Review Submission Form */}
                  {isWritingReview && (
                    <form
                      onSubmit={handleSubmitReview}
                      className="mt-4 p-4 rounded-2xl border border-indigo-100 bg-indigo-50/30 space-y-3 animate-in fade-in"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">Your Rating</span>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                              className="p-1 hover:scale-110 transition-transform cursor-pointer"
                            >
                              <Star
                                className={`w-5 h-5 ${
                                  star <= reviewForm.rating
                                    ? 'text-amber-400 fill-amber-400'
                                    : 'text-slate-300'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      {reviewError && (
                        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                          <span>{reviewError}</span>
                        </div>
                      )}

                      {reviewSuccess && (
                        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                          <span>{reviewSuccess}</span>
                        </div>
                      )}

                      <div>
                        <input
                          type="text"
                          value={reviewForm.title}
                          onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                          placeholder="Review title (e.g. Outstanding battery life and sound)"
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <textarea
                          required
                          minLength={5}
                          rows={3}
                          value={reviewForm.comment}
                          onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                          placeholder="Write your honest review (minimum 5 characters)..."
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-slate-500 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          Verified buyers only
                        </span>
                        <button
                          type="submit"
                          disabled={reviewSubmitting}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {reviewSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                          <span>Submit Review</span>
                        </button>
                      </div>
                    </form>
                  )}

                  {/* List of Reviews */}
                  <div className="mt-4 space-y-3">
                    {reviewsList.length === 0 ? (
                      <p className="text-xs text-slate-400 italic text-center py-4">
                        No customer reviews yet. Be the first verified buyer to review this product!
                      </p>
                    ) : (
                      reviewsList.map((rev) => (
                        <div
                          key={rev._id || rev.id}
                          className="p-3 sm:p-4 rounded-xl border border-slate-100 bg-white shadow-2xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center">
                                {rev.user?.name ? rev.user.name.charAt(0).toUpperCase() : 'U'}
                              </div>
                              <span className="text-xs font-bold text-slate-800">
                                {rev.user?.name || 'Customer'}
                              </span>
                              {rev.isVerifiedPurchase && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[9px] font-bold">
                                  <Check className="w-2.5 h-2.5" /> Verified Buyer
                                </span>
                              )}
                            </div>
                            <RatingStars rating={rev.rating} size="w-3 h-3" />
                          </div>

                          {rev.title && (
                            <h5 className="text-xs font-bold text-slate-900">{rev.title}</h5>
                          )}
                          <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                          <span className="text-[10px] text-slate-400 block">
                            {rev.createdAt
                              ? new Date(rev.createdAt).toLocaleDateString(undefined, {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })
                              : 'Verified Purchase'}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Purchase Actions Strip */}
              <div className="mt-6 pt-4 border-t border-slate-200/80 space-y-3">
                <div className="flex items-center gap-3">
                  {/* Quantity selector */}
                  <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 overflow-hidden">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-3 py-2 text-slate-600 hover:bg-slate-200 font-bold"
                    >
                      -
                    </button>
                    <span className="px-3 py-2 font-bold text-xs text-slate-800 min-w-[2.5rem] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => q + 1)}
                      className="px-3 py-2 text-slate-600 hover:bg-slate-200 font-bold"
                    >
                      +
                    </button>
                  </div>

                  {/* Add to Cart button */}
                  <button
                    onClick={() => addToCart(product, quantity, currentImage)}
                    className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </button>

                  {/* Wishlist toggle */}
                  <button
                    onClick={() => toggleWishlist(product)}
                    className={`p-3 rounded-xl border transition-all ${
                      isFavorited
                        ? 'bg-rose-50 border-rose-300 text-rose-600'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                    aria-label={isFavorited ? 'Remove from wishlist' : 'Save to wishlist'}
                  >
                    <Heart className={`w-5 h-5 ${isFavorited ? 'fill-rose-500' : ''}`} />
                  </button>
                </div>

                <button
                  onClick={handleBuyNow}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  Buy Now with 1-Click
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FULLSCREEN LIGHTBOX & HIGH-RES ZOOM MODAL */}
      {isFullscreenLightbox && (
        <div className="fixed inset-0 z-60 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200">
          {/* Lightbox Toolbar */}
          <div className="flex items-center justify-between text-white z-20">
            <div className="flex items-center gap-3">
              <span className="font-bold text-sm text-white">
                {product.name}
              </span>
              <span className="text-xs text-slate-400">
                ({activeImageIndex + 1} / {images.length})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoomLevel((z) => Math.max(1, z - 0.5))}
                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono px-2">{Math.round(zoomLevel * 100)}%</span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(3, z + 0.5))}
                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setIsFullscreenLightbox(false);
                  setZoomLevel(1);
                }}
                className="p-2 bg-slate-800 hover:bg-rose-600 rounded-lg text-white transition-colors ml-2"
                title="Close Lightbox"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Lightbox Image Stage */}
          <div className="flex-1 flex items-center justify-center relative overflow-hidden my-4">
            <button
              onClick={handlePrevImage}
              className="absolute left-4 z-20 p-3 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white shadow-lg"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <div
              className="transition-transform duration-200 max-w-full max-h-[75vh] flex items-center justify-center"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              <img
                src={currentImage}
                alt="Fullscreen HD view"
                className="max-h-[75vh] max-w-full object-contain rounded-xl shadow-2xl"
              />
            </div>

            <button
              onClick={handleNextImage}
              className="absolute right-4 z-20 p-3 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white shadow-lg"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Lightbox Thumbnails Strip */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 z-20">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                  activeImageIndex === idx ? 'border-indigo-500 scale-105' : 'border-slate-700 opacity-60'
                }`}
              >
                <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-contain bg-white" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
