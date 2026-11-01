import React, { useState, useEffect } from 'react';
import { heroBanners } from '../../data/banners';
import { useStore } from '../../context/StoreContext';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from 'lucide-react';
import SafeImage from '../common/SafeImage';

export default function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const { setSelectedCategory, setActiveView } = useStore();

  const totalSlides = heroBanners.length;

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused, totalSlides]);

  const slide = heroBanners[currentSlide];

  const handleCta = () => {
    if (slide.category) {
      setSelectedCategory(slide.category);
    }
    setActiveView('storefront');
    const el = document.getElementById('products-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-slate-950 text-white shadow-xl my-4 sm:my-6 border border-slate-800"
    >
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-transparent z-10 pointer-events-none" />

      {/* Slide Content Container */}
      <div className="relative z-20 min-h-[340px] sm:min-h-[400px] lg:min-h-[460px] flex flex-col lg:flex-row items-center justify-between p-6 sm:p-10 lg:p-14 gap-6">
        {/* Left Column: Text & CTA */}
        <div className="max-w-xl text-left space-y-3 sm:space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{slide.tag}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight sm:leading-none text-white">
            {slide.title}
          </h1>

          <p className="text-xs sm:text-sm lg:text-base text-slate-300 line-clamp-2 sm:line-clamp-3 leading-relaxed">
            {slide.subtitle}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleCta}
              className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <span>{slide.ctaText}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
              <span className="text-emerald-400 font-extrabold text-sm sm:text-base">
                {slide.price}
              </span>
              <span className="text-slate-500 line-through text-xs">
                {slide.originalPrice}
              </span>
              <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] px-1.5 py-0.5 rounded font-bold">
                {slide.badge}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Hero High-Res Product Image Container (No stretching or distortion) */}
        <div className="w-full lg:w-1/2 flex items-center justify-center relative">
          <div className="w-full max-w-[340px] sm:max-w-[420px] lg:max-w-[460px] aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-slate-700/50 bg-slate-900/50 backdrop-blur-xs relative group">
            <SafeImage
              src={slide.image}
              alt={slide.title}
              aspectRatio="aspect-[4/3]"
              fit="cover"
              padding="p-0"
              fallbackType="banner"
              loading="eager"
            />
            {/* Live badge */}
            <div className="absolute bottom-3 right-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-800 text-[10px] text-slate-300 font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Verified 4K Imagery
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Controls: Arrows */}
      <button
        onClick={() => setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides)}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white flex items-center justify-center border border-slate-700/60 shadow-lg transition-transform active:scale-95"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={() => setCurrentSlide((prev) => (prev + 1) % totalSlides)}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white flex items-center justify-center border border-slate-700/60 shadow-lg transition-transform active:scale-95"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Slide Indicator Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
        {heroBanners.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`h-2 rounded-full transition-all ${
              idx === currentSlide ? 'w-8 bg-indigo-500' : 'w-2 bg-slate-600 hover:bg-slate-400'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
