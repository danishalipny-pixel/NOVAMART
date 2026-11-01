import React from 'react';
import { categories } from '../../data/categories';
import { useStore } from '../../context/StoreContext';
import SafeImage from '../common/SafeImage';

export default function CategoryGrid() {
  const { selectedCategory, setSelectedCategory, setActiveView } = useStore();

  return (
    <section className="my-8 sm:my-10" aria-label="Browse by Category">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div>
          <h2 className="text-lg sm:text-2xl font-black tracking-tight text-slate-900">
            Featured Categories
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Verified premium collections with optimized high-resolution visuals
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedCategory('all');
            setActiveView('storefront');
          }}
          className="text-xs sm:text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
        >
          View All ({categories.length})
        </button>
      </div>

      {/* Responsive Grid: 2 cols on mobile (320px+), 3 on tablet, 6 on desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5 sm:gap-4">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setActiveView('storefront');
                const el = document.getElementById('products-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`group flex flex-col rounded-2xl overflow-hidden border p-2.5 transition-all text-left bg-white cursor-pointer ${
                isSelected
                  ? 'border-indigo-600 ring-2 ring-indigo-500/20 shadow-md'
                  : 'border-slate-200/80 hover:border-indigo-300 hover:shadow-md'
              }`}
            >
              {/* Category Image Container */}
              <div className="w-full aspect-square rounded-xl overflow-hidden bg-slate-100 relative mb-2.5">
                <SafeImage
                  src={cat.image}
                  alt={cat.name}
                  aspectRatio="aspect-square"
                  fit="cover"
                  padding="p-0"
                  fallbackType="category"
                  showZoomOnHover={true}
                />
              </div>

              {/* Title & Count */}
              <div className="min-w-0">
                <span className={`block font-bold text-xs truncate transition-colors ${
                  isSelected ? 'text-indigo-600' : 'text-slate-800 group-hover:text-indigo-600'
                }`}>
                  {cat.name}
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  {cat.count} Items
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
