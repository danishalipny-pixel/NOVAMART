import React from 'react';
import { useStore } from '../../context/StoreContext';
import SafeImage from '../common/SafeImage';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Truck } from 'lucide-react';

export default function CartDrawer() {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    cartCount,
    cartSubtotal,
    freeShippingThreshold,
    freeShippingRemaining,
    updateCartQuantity,
    removeFromCart,
    setIsCheckoutOpen
  } = useStore();

  if (!isCartOpen) return null;

  const percentToFreeShipping = Math.min(
    100,
    Math.round((cartSubtotal / freeShippingThreshold) * 100)
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      {/* Drawer Container */}
      <div className="fixed inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-indigo-600" />
            <h2 className="font-extrabold text-base text-slate-900">
              Shopping Cart ({cartCount})
            </h2>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/50"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Bar */}
        <div className="px-4 py-3 bg-indigo-50/60 border-b border-indigo-100 text-xs">
          <div className="flex items-center justify-between text-[11px] font-semibold mb-1.5">
            <span className="flex items-center gap-1 text-indigo-700">
              <Truck className="w-3.5 h-3.5" />
              {freeShippingRemaining === 0 ? (
                <span className="text-emerald-700 font-bold">You unlocked FREE Express Delivery!</span>
              ) : (
                <span>Add ${freeShippingRemaining.toFixed(2)} more for FREE shipping</span>
              )}
            </span>
            <span className="font-bold text-indigo-800">{percentToFreeShipping}%</span>
          </div>
          <div className="w-full h-1.5 bg-indigo-200/60 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 transition-all duration-300 rounded-full"
              style={{ width: `${percentToFreeShipping}%` }}
            />
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-sm text-slate-700">Your cart is empty</h3>
              <p className="text-xs text-slate-400 mt-1 mb-4">
                Explore our featured electronics, cameras, and gear!
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product.id}
                className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/70"
              >
                {/* Thumbnail */}
                <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 overflow-hidden shrink-0">
                  <SafeImage
                    src={item.selectedImage || (item.product.images && item.product.images[0])}
                    alt={item.product.name}
                    aspectRatio="aspect-square"
                    fit="contain"
                    padding="p-1"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-xs text-slate-800 truncate">
                    {item.product.name}
                  </h4>
                  <div className="text-[11px] text-slate-400 capitalize">
                    {item.product.category}
                  </div>
                  <div className="text-xs font-black text-slate-900 mt-1">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </div>
                </div>

                {/* Quantity Controls & Delete */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-slate-400 hover:text-rose-500 p-1"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden text-xs">
                    <button
                      onClick={() => updateCartQuantity(item.product.id, -1)}
                      className="px-2 py-0.5 text-slate-600 hover:bg-slate-100 font-bold"
                    >
                      -
                    </button>
                    <span className="px-2 py-0.5 font-bold text-slate-800 text-[11px]">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateCartQuantity(item.product.id, 1)}
                      className="px-2 py-0.5 text-slate-600 hover:bg-slate-100 font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer & Checkout */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-800">${cartSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span>Shipping</span>
                <span className="font-semibold text-emerald-600">
                  {freeShippingRemaining === 0 ? 'FREE' : '$9.99'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm font-black text-slate-900 pt-1.5 border-t border-slate-200">
                <span>Total Amount</span>
                <span>
                  ${(cartSubtotal + (freeShippingRemaining === 0 ? 0 : 9.99)).toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setIsCartOpen(false);
                setIsCheckoutOpen(true);
              }}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>256-bit Encrypted Checkout</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
