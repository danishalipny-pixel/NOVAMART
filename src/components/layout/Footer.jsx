import React from 'react';
import { ShoppingBag, ShieldCheck, Truck, RotateCcw, Headphones } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 pb-16 lg:pb-0">
      {/* Value Proposition Strip */}
      <div className="border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-indigo-400 shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-slate-200 text-xs sm:text-sm">Free Express Shipping</div>
                <div className="text-[11px] text-slate-400">On all orders over $100</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-emerald-400 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-slate-200 text-xs sm:text-sm">Authentic Guarantee</div>
                <div className="text-[11px] text-slate-400">100% verified photography</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-amber-400 shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-slate-200 text-xs sm:text-sm">30-Day Hassle Returns</div>
                <div className="text-[11px] text-slate-400">Zero restocking fees</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-rose-400 shrink-0">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-slate-200 text-xs sm:text-sm">24/7 Expert Support</div>
                <div className="text-[11px] text-slate-400">Live chat &amp; concierge</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <span className="text-lg font-extrabold tracking-tight text-white">
                NOVAMART
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              The premium e-commerce platform engineered with verified high-definition imagery, ultra-responsive layouts across all devices, and an intuitive seller dashboard with live multi-image management.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <div className="font-bold text-white text-xs uppercase tracking-wider mb-3">
              Shop Categories
            </div>
            <ul className="space-y-2 text-xs">
              <li><a href="#products" className="hover:text-white transition-colors">Electronics &amp; Audio</a></li>
              <li><a href="#products" className="hover:text-white transition-colors">Wearables &amp; Smart</a></li>
              <li><a href="#products" className="hover:text-white transition-colors">Laptops &amp; Computing</a></li>
              <li><a href="#products" className="hover:text-white transition-colors">Cameras &amp; Optics</a></li>
              <li><a href="#products" className="hover:text-white transition-colors">Gaming &amp; VR</a></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <div className="font-bold text-white text-xs uppercase tracking-wider mb-3">
              Customer Support
            </div>
            <ul className="space-y-2 text-xs">
              <li><span className="hover:text-white cursor-pointer transition-colors">Track Order</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors">Shipping &amp; Delivery</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors">Return Policy</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors">Seller Onboarding</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors">Image Quality Standards</span></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <div className="font-bold text-white text-xs uppercase tracking-wider mb-3">
              Stay in the Loop
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Subscribe to unlock flash sale drops and new releases.
            </p>
            <form onSubmit={(e) => { e.preventDefault(); alert('Subscribed to NOVAMART insider updates!'); }} className="space-y-2">
              <input
                type="email"
                required
                placeholder="Enter your email"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs transition-colors"
              >
                Join VIP Club
              </button>
            </form>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-10 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © 2026 NOVAMART Platform. All rights reserved. Zero Layout Shift Guaranteed.
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Notice</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer">Image Guidelines</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
