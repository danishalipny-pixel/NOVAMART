import React from 'react';
import { promoBanners } from '../../data/banners';
import { useStore } from '../../context/StoreContext';
import SafeImage from '../common/SafeImage';
import { ArrowRight, Tag } from 'lucide-react';

export default function PromoBanners() {
  const { setSelectedCategory, setActiveView } = useStore();

  return (
    <section className="my-8 sm:my-10" aria-label="Special Deals and Promotions">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {promoBanners.map((promo) => (
          <div
            key={promo.id}
            className="group relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 text-white shadow-lg hover:shadow-xl transition-all"
          >
            {/* Background image with gradient overlay */}
            <div className="absolute inset-0 opacity-40 group-hover:opacity-50 transition-opacity">
              <SafeImage
                src={promo.image}
                alt={promo.title}
                aspectRatio="aspect-auto"
                containerClassName="w-full h-full"
                fit="cover"
                padding="p-0"
                fallbackType="banner"
              />
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />

            {/* Banner Content */}
            <div className="relative z-10 p-5 sm:p-6 flex flex-col justify-end min-h-[220px] sm:min-h-[240px]">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/30 border border-indigo-400/40 text-indigo-300 text-[11px] font-bold w-fit mb-2">
                <Tag className="w-3 h-3" />
                <span>{promo.discount}</span>
              </div>

              <h3 className="text-lg sm:text-xl font-black text-white leading-snug">
                {promo.title}
              </h3>
              <p className="text-xs text-slate-300 mt-1 mb-4 line-clamp-1">
                {promo.subtitle}
              </p>

              <button
                onClick={() => {
                  setSelectedCategory(promo.category);
                  setActiveView('storefront');
                  const el = document.getElementById('products-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-white hover:text-indigo-400 transition-colors w-fit group/btn cursor-pointer"
              >
                <span>{promo.buttonText}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
