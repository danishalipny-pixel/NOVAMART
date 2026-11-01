import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import SafeImage from '../common/SafeImage';
import { X, CheckCircle, CreditCard, Lock } from 'lucide-react';

export default function CheckoutModal() {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    cartSubtotal,
    freeShippingRemaining,
    clearCart,
    addToast
  } = useStore();

  const [isSuccess, setIsSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [formData, setFormData] = useState({
    name: 'Alex Mercer',
    email: 'alex.mercer@example.com',
    address: '742 Evergreen Terrace',
    city: 'San Francisco',
    state: 'CA',
    zip: '94107',
    cardNumber: '•••• •••• •••• 4242',
    exp: '12/28',
    cvv: '921'
  });

  if (!isCheckoutOpen) return null;

  const total = cartSubtotal + (freeShippingRemaining === 0 ? 0 : 9.99);

  const handleSubmit = (e) => {
    e.preventDefault();
    setOrderId(`NM-${Math.floor(100000 + Math.random() * 900000)}`);
    setIsSuccess(true);
    clearCart();
    addToast('Order confirmed! Tracking details sent to email.', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        onClick={() => !isSuccess && setIsCheckoutOpen(false)}
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
      />

      <div className="min-h-screen flex items-center justify-center p-3 sm:p-4">
        <div className="relative w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-200 z-10 animate-in fade-in zoom-in-95">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-600" />
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                {isSuccess ? 'Order Confirmation' : 'Secure Express Checkout'}
              </h3>
            </div>
            {!isSuccess && (
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-200/50 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {isSuccess ? (
            /* Order Success View */
            <div className="p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Payment Successful!
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                Thank you, <span className="font-bold text-slate-800">{formData.name}</span>. Your order <span className="font-mono font-bold text-indigo-600">#{orderId}</span> has been confirmed.
              </p>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 max-w-sm mx-auto text-left space-y-1">
                <div><span className="font-semibold">Shipping to:</span> {formData.address}, {formData.city}</div>
                <div><span className="font-semibold">Delivery:</span> 2-3 Business Days (Express)</div>
                <div><span className="font-semibold">Billed:</span> ${total.toFixed(2)} via Card (4242)</div>
              </div>
              <div className="pt-4">
                <button
                  onClick={() => {
                    setIsSuccess(false);
                    setIsCheckoutOpen(false);
                  }}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
                >
                  Return to Storefront
                </button>
              </div>
            </div>
          ) : (
            /* Checkout Form */
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
              {/* Order Items Preview */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Order Summary ({cart.length} items)
                </div>
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                  {cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="w-12 h-12 rounded-xl bg-white border border-slate-200 overflow-hidden shrink-0 relative"
                      title={item.product.name}
                    >
                      <SafeImage
                        src={item.selectedImage || (item.product.images && item.product.images[0])}
                        alt={item.product.name}
                        aspectRatio="aspect-square"
                        fit="contain"
                        padding="p-0.5"
                      />
                      <span className="absolute bottom-0 right-0 bg-slate-900 text-white text-[9px] font-bold px-1 rounded-tl">
                        x{item.quantity}
                      </span>
                    </div>
                  ))}
                  <div className="ml-auto text-right pl-3 shrink-0">
                    <span className="text-xs text-slate-400 block">Total Due:</span>
                    <span className="text-base font-black text-indigo-700">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Shipping Details */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Shipping Address
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Street Address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none sm:col-span-2"
                  />
                  <input
                    type="text"
                    required
                    placeholder="City"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none"
                  />
                  <input
                    type="text"
                    required
                    placeholder="ZIP / Postal Code"
                    value={formData.zip}
                    onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              {/* Payment Details */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                  <span>Payment Method</span>
                  <span className="text-[10px] text-slate-400 font-normal">Test Mode Active</span>
                </label>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-indigo-600" />
                    <input
                      type="text"
                      readOnly
                      value={formData.cardNumber}
                      className="bg-transparent font-mono font-bold text-slate-700 outline-none flex-1"
                    />
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`Exp: ${formData.exp}`}
                      className="bg-transparent text-slate-500 outline-none w-24"
                    />
                    <input
                      type="text"
                      readOnly
                      value={`CVV: ${formData.cvv}`}
                      className="bg-transparent text-slate-500 outline-none w-24"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>Authorize Payment of ${total.toFixed(2)}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
