import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { sellerApi } from '../../services/api';
import {
  X,
  Lock,
  Mail,
  User,
  Store,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Sparkles
} from 'lucide-react';

export default function AuthModal() {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
    openAuthModal,
    login,
    register,
    becomeSeller,
    isLoading,
    user
  } = useAuth();

  const { addToast } = useStore();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'customer',
    storeName: '',
    storeSlug: '',
    description: ''
  });

  const [errorMessage, setErrorMessage] = useState('');

  if (!isAuthModalOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      // Auto-generate slug from storeName
      ...(name === 'storeName' && {
        storeSlug: value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
      })
    }));
    setErrorMessage('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.email || !formData.password) {
      setErrorMessage('Please fill in both email and password.');
      return;
    }

    const res = await login({
      email: formData.email,
      password: formData.password
    });

    if (res.success) {
      addToast(`Welcome back, ${res.user.name}!`, 'success');
    } else {
      setErrorMessage(res.error || 'Login failed. Please check your credentials.');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.name || !formData.email || !formData.password) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (formData.password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (!/[A-Z]/.test(formData.password) || !/[0-9]/.test(formData.password)) {
      setErrorMessage('Password must include at least one uppercase letter and one number.');
      return;
    }

    if (formData.role === 'seller' && (!formData.storeName || !formData.storeSlug)) {
      setErrorMessage('Please enter your store name and store slug.');
      return;
    }

    const res = await register(formData);

    if (res.success) {
      addToast(`Account created successfully! Welcome, ${res.user.name}.`, 'success');
    } else {
      setErrorMessage(res.error || 'Registration failed. Please check your details.');
    }
  };

  const handleBecomeSellerSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.storeName || !formData.storeSlug) {
      setErrorMessage('Store name and slug are required.');
      return;
    }

    try {
      await sellerApi.apply({
        storeName: formData.storeName,
        storeSlug: formData.storeSlug,
        description: formData.description
      });
      addToast('Seller application submitted and is pending administrator review!', 'info');
      closeAuthModal();
    } catch (err) {
      if (err.status === 409) {
        setErrorMessage(err.message || 'A seller profile or application already exists.');
        return;
      }
      // Fallback to direct activation
      const res = await becomeSeller({
        storeName: formData.storeName,
        storeSlug: formData.storeSlug,
        description: formData.description
      });

      if (res.success) {
        addToast(`Congratulations! Your seller store "${formData.storeName}" is now active.`, 'success');
      } else {
        setErrorMessage(res.error || err.message || 'Failed to submit seller application.');
      }
    }
  };

  const fillDemoAccount = (role) => {
    if (role === 'customer') {
      setFormData((prev) => ({
        ...prev,
        email: 'sarah@novamart.com',
        password: 'StrongPassword2026!'
      }));
    } else if (role === 'seller') {
      setFormData((prev) => ({
        ...prev,
        email: 'seller@sony.com',
        password: 'SellerPassword123!'
      }));
    } else if (role === 'admin') {
      setFormData((prev) => ({
        ...prev,
        email: 'admin@novamart.com',
        password: 'AdminMaster2026!'
      }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={closeAuthModal}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-10 animate-in zoom-in-95 duration-200 my-8">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/80 flex items-center justify-center text-white shadow-inner">
              {authModalMode === 'become-seller' ? (
                <Store className="w-4 h-4" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              )}
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">
                {authModalMode === 'login' && 'Sign in to NOVAMART'}
                {authModalMode === 'register' && 'Create your Account'}
                {authModalMode === 'become-seller' && 'Activate Seller Account'}
              </h2>
              <p className="text-[11px] text-slate-400">
                {authModalMode === 'login' && 'Access orders, wishlist & seller tools'}
                {authModalMode === 'register' && 'Join thousands of premium buyers & sellers'}
                {authModalMode === 'become-seller' && 'Open your multi-vendor storefront today'}
              </p>
            </div>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher (Login / Register) */}
        {authModalMode !== 'become-seller' && (
          <div className="flex border-b border-slate-200/80 bg-slate-50/80 p-1.5 gap-1.5 m-4 rounded-xl">
            <button
              type="button"
              onClick={() => {
                openAuthModal('login');
                setErrorMessage('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                authModalMode === 'login'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                openAuthModal('register');
                setErrorMessage('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                authModalMode === 'register'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="mx-6 mb-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* FORM CONTENT */}
        <div className="px-6 pb-6">
          {/* 1. LOGIN FORM */}
          {authModalMode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Demo Credentials Quick Fill */}
              <div className="pt-2 border-t border-slate-100">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">
                  Quick Demo Access
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => fillDemoAccount('customer')}
                    className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold transition-colors"
                  >
                    Customer Demo
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemoAccount('seller')}
                    className="flex-1 py-1.5 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[11px] font-semibold transition-colors"
                  >
                    Seller Demo
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemoAccount('admin')}
                    className="flex-1 py-1.5 px-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-[11px] font-semibold transition-colors"
                  >
                    Admin Demo
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* 2. REGISTER FORM */}
          {authModalMode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Alex Rivera"
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="alex@example.com"
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password <span className="font-normal text-slate-400">(8+ chars, uppercase & number)</span>
                </label>
                <div className="relative">
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Account Type Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Account Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, role: 'customer' }))}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-left flex items-center gap-2 cursor-pointer ${
                      formData.role === 'customer'
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span>Customer</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, role: 'seller' }))}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-left flex items-center gap-2 cursor-pointer ${
                      formData.role === 'seller'
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Store className="w-4 h-4" />
                    <span>Merchant / Seller</span>
                  </button>
                </div>
              </div>

              {/* Conditional Seller Details */}
              {formData.role === 'seller' && (
                <div className="space-y-2 p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl animate-in fade-in">
                  <div>
                    <label className="block text-[11px] font-bold text-indigo-900 mb-0.5">
                      Store Name
                    </label>
                    <input
                      type="text"
                      name="storeName"
                      value={formData.storeName}
                      onChange={handleChange}
                      placeholder="e.g. Apex Digital Hub"
                      required
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white border border-indigo-200 focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-indigo-900 mb-0.5">
                      Store URL Slug
                    </label>
                    <input
                      type="text"
                      name="storeSlug"
                      value={formData.storeSlug}
                      onChange={handleChange}
                      placeholder="e.g. apex-digital-hub"
                      required
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white border border-indigo-200 focus:border-indigo-500 outline-none"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 mt-2"
              >
                {isLoading ? (
                  <span>Creating Account...</span>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* 3. BECOME SELLER MODAL */}
          {authModalMode === 'become-seller' && (
            <form onSubmit={handleBecomeSellerSubmit} className="space-y-3">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs">
                <span className="font-bold">Upgrade Account:</span> You are currently signed in as{' '}
                <span className="font-semibold">{user?.email}</span>. Fill out your store information below to activate your Seller Dashboard.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Store Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="storeName"
                    value={formData.storeName}
                    onChange={handleChange}
                    placeholder="e.g. Skyline Audio Labs"
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                  />
                  <Store className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Store Slug (URL Identifier)
                </label>
                <input
                  type="text"
                  name="storeSlug"
                  value={formData.storeSlug}
                  onChange={handleChange}
                  placeholder="e.g. skyline-audio-labs"
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Store Description <span className="font-normal text-slate-400">(optional)</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Tell customers about your products and brands..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 active:scale-98 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 mt-2"
              >
                {isLoading ? (
                  <span>Activating Storefront...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Activate Seller Dashboard</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
