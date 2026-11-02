import React, { useState, useEffect, useCallback } from 'react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../services/api';
import SafeImage from '../common/SafeImage';
import {
  X,
  ShieldCheck,
  TrendingUp,
  Users,
  Store,
  Package,
  ShoppingCart,
  DollarSign,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  Trash2,
  RefreshCw,
  ArrowUpRight,
  ShieldAlert
} from 'lucide-react';

export default function AdminDashboardModal() {
  const { isAdminModalOpen, setIsAdminModalOpen, addToast } = useStore();
  const { user: currentAdmin, isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'sellers' | 'users' | 'products' | 'orders'
  const [loading, setLoading] = useState(false);

  // Overview metrics state
  const [metrics, setMetrics] = useState({
    totalCustomers: 24,
    totalSellers: 8,
    pendingApplications: 2,
    totalProducts: 48,
    totalOrders: 112,
    totalRevenue: 34890.5,
    averageOrderValue: 311.52
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);

  // Sellers management state
  const [sellersList, setSellersList] = useState([]);
  const [sellersFilter, setSellersFilter] = useState('all'); // 'all' | 'pending' | 'approved' | 'rejected'
  const [rejectingSellerId, setRejectingSellerId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Users management state
  const [usersList, setUsersList] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');

  // Products moderation state
  const [productsList, setProductsList] = useState([]);
  const [productSearch, setProductSearch] = useState('');

  // Orders management state
  const [ordersList, setOrdersList] = useState([]);
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  const fetchOverview = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminApi.getDashboard();
      if (res?.data) {
        setMetrics(res.data.metrics || {});
        setRecentOrders(res.data.recentOrders || []);
        setRecentApplications(res.data.recentApplications || []);
      }
    } catch (err) {
      console.warn('Admin overview fetch (using baseline state):', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSellers = useCallback(async () => {
    try {
      setLoading(true);
      const params = sellersFilter !== 'all' ? { status: sellersFilter } : {};
      const res = await adminApi.getSellers(params);
      if (res?.data?.sellers) {
        setSellersList(res.data.sellers);
      }
    } catch (err) {
      console.warn('Admin sellers fetch:', err.message);
    } finally {
      setLoading(false);
    }
  }, [sellersFilter]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (userRoleFilter !== 'all') params.role = userRoleFilter;
      if (userSearch.trim()) params.search = userSearch.trim();
      const res = await adminApi.getUsers(params);
      if (res?.data?.users) {
        setUsersList(res.data.users);
      }
    } catch (err) {
      console.warn('Admin users fetch:', err.message);
    } finally {
      setLoading(false);
    }
  }, [userRoleFilter, userSearch]);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (productSearch.trim()) params.search = productSearch.trim();
      const res = await adminApi.getProducts(params);
      if (res?.data?.products) {
        setProductsList(res.data.products);
      }
    } catch (err) {
      console.warn('Admin products fetch:', err.message);
    } finally {
      setLoading(false);
    }
  }, [productSearch]);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (orderStatusFilter !== 'all') params.status = orderStatusFilter;
      const res = await adminApi.getOrders(params);
      if (res?.data?.orders) {
        setOrdersList(res.data.orders);
      }
    } catch (err) {
      console.warn('Admin orders fetch:', err.message);
    } finally {
      setLoading(false);
    }
  }, [orderStatusFilter]);

  // Load data based on active tab
  useEffect(() => {
    if (!isAdminModalOpen || !isAdmin) return;

    const timer = setTimeout(() => {
      if (activeTab === 'overview') {
        fetchOverview();
      } else if (activeTab === 'sellers') {
        fetchSellers();
      } else if (activeTab === 'users') {
        fetchUsers();
      } else if (activeTab === 'products') {
        fetchProducts();
      } else if (activeTab === 'orders') {
        fetchOrders();
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [isAdminModalOpen, isAdmin, activeTab, fetchOverview, fetchSellers, fetchUsers, fetchProducts, fetchOrders]);

  if (!isAdminModalOpen) return null;

  // Actions
  const handleApproveSeller = async (sellerId, storeName) => {
    try {
      await adminApi.approveSeller(sellerId);
      addToast(`Seller "${storeName}" approved successfully!`, 'success');
      fetchSellers();
      fetchOverview();
    } catch (err) {
      addToast(err.message || 'Failed to approve seller', 'error');
    }
  };

  const handleRejectSeller = async (sellerId) => {
    try {
      await adminApi.rejectSeller(sellerId, rejectionReason);
      addToast('Seller application rejected with rationale', 'info');
      setRejectingSellerId(null);
      setRejectionReason('');
      fetchSellers();
      fetchOverview();
    } catch (err) {
      addToast(err.message || 'Failed to reject seller', 'error');
    }
  };

  const handleToggleUserStatus = async (user) => {
    if (user._id === currentAdmin?._id || user._id === currentAdmin?.id) {
      addToast('You cannot deactivate your own administrative account', 'error');
      return;
    }
    try {
      const nextStatus = !user.isActive;
      await adminApi.updateUserStatus(user._id, nextStatus);
      addToast(`User ${user.email} is now ${nextStatus ? 'Active' : 'Deactivated'}`, 'info');
      fetchUsers();
    } catch (err) {
      addToast(err.message || 'Failed to update user status', 'error');
    }
  };

  const handleToggleProductStatus = async (product) => {
    try {
      const nextStatus = !product.isActive;
      await adminApi.updateProductStatus(product._id || product.id, nextStatus);
      addToast(`Product "${product.name}" status updated to ${nextStatus ? 'Live' : 'Hidden'}`, 'info');
      fetchProducts();
    } catch (err) {
      addToast(err.message || 'Failed to update product status', 'error');
    }
  };

  const handleDeleteProduct = async (product) => {
    if (!window.confirm(`Are you sure you want to permanently remove "${product.name}"?`)) return;
    try {
      await adminApi.deleteProduct(product._id || product.id);
      addToast(`Product removed permanently by administrator`, 'info');
      fetchProducts();
      fetchOverview();
    } catch (err) {
      addToast(err.message || 'Failed to delete product', 'error');
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await adminApi.updateOrderStatus(orderId, { status: newStatus });
      addToast(`Order fulfillment status updated to ${newStatus}`, 'success');
      fetchOrders();
    } catch (err) {
      addToast(err.message || 'Failed to update order status', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={() => setIsAdminModalOpen(false)}
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      {/* Main Admin Modal Window */}
      <div className="relative w-full max-w-6xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 flex flex-col my-auto animate-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 px-6 py-4 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-400/30 flex items-center justify-center text-purple-300 shadow-inner">
              <ShieldCheck className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  NOVAMART Administrator Control Hub
                </h2>
                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30">
                  Root Admin
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Multi-vendor platform governance, seller onboarding, catalog moderation, and fulfillment
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (activeTab === 'overview') fetchOverview();
                else if (activeTab === 'sellers') fetchSellers();
                else if (activeTab === 'users') fetchUsers();
                else if (activeTab === 'products') fetchProducts();
                else if (activeTab === 'orders') fetchOrders();
              }}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              title="Refresh Current View"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
            </button>
            <button
              onClick={() => setIsAdminModalOpen(false)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              aria-label="Close Admin Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 pt-3 pb-2 bg-slate-50 border-b border-slate-200 overflow-x-auto no-scrollbar text-xs font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Platform Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('sellers')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'sellers'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Seller Onboarding</span>
            {metrics.pendingApplications > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-black flex items-center justify-center">
                {metrics.pendingApplications}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'users'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>User Accounts</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'products'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Catalog Moderation</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'orders'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Marketplace Orders</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50">
          {/* TAB 1: Platform Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <span className="text-xs font-semibold text-slate-400 block">Total Customers</span>
                  <span className="text-xl sm:text-2xl font-black text-slate-900 mt-1 block">
                    {metrics.totalCustomers ?? 0}
                  </span>
                  <span className="text-[11px] font-semibold text-indigo-600 flex items-center gap-0.5 mt-1">
                    <Users className="w-3 h-3" /> Registered Buyers
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <span className="text-xs font-semibold text-slate-400 block">Approved Sellers</span>
                  <span className="text-xl sm:text-2xl font-black text-slate-900 mt-1 block">
                    {metrics.totalSellers ?? 0}
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-0.5 mt-1">
                    <CheckCircle2 className="w-3 h-3" /> Active Merchants
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <span className="text-xs font-semibold text-slate-400 block">Pending Reviews</span>
                  <span className="text-xl sm:text-2xl font-black text-amber-600 mt-1 block">
                    {metrics.pendingApplications ?? 0}
                  </span>
                  <span className="text-[11px] font-semibold text-amber-600 flex items-center gap-0.5 mt-1">
                    <AlertCircle className="w-3 h-3" /> Requires Decision
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <span className="text-xs font-semibold text-slate-400 block">Total Products</span>
                  <span className="text-xl sm:text-2xl font-black text-slate-900 mt-1 block">
                    {metrics.totalProducts ?? 0}
                  </span>
                  <span className="text-[11px] font-semibold text-purple-600 flex items-center gap-0.5 mt-1">
                    <Package className="w-3 h-3" /> Live Catalog Items
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <span className="text-xs font-semibold text-slate-400 block">Total Orders</span>
                  <span className="text-xl sm:text-2xl font-black text-slate-900 mt-1 block">
                    {metrics.totalOrders ?? 0}
                  </span>
                  <span className="text-[11px] font-semibold text-indigo-600 flex items-center gap-0.5 mt-1">
                    <ShoppingCart className="w-3 h-3" /> Completed Checkouts
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <span className="text-xs font-semibold text-slate-400 block">Platform Volume</span>
                  <span className="text-xl sm:text-2xl font-black text-slate-900 mt-1 block">
                    ${Number(metrics.totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-0.5 mt-1">
                    <DollarSign className="w-3 h-3" /> Processed Volume
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
                  <span className="text-xs font-semibold text-slate-400 block">Average Order Value</span>
                  <span className="text-xl sm:text-2xl font-black text-slate-900 mt-1 block">
                    ${Number(metrics.averageOrderValue || 0).toFixed(2)}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-0.5 mt-1">
                    <ArrowUpRight className="w-3 h-3" /> Per Order Mean
                  </span>
                </div>
              </div>

              {/* Recent Applications & Orders Split Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Recent Applications */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Store className="w-4 h-4 text-indigo-600" />
                      <span>Pending Seller Applications</span>
                    </h3>
                    <button
                      onClick={() => setActiveTab('sellers')}
                      className="text-xs font-bold text-indigo-600 hover:underline"
                    >
                      View All
                    </button>
                  </div>

                  {recentApplications.length === 0 ? (
                    <p className="text-xs text-slate-400 py-6 text-center">No pending seller applications</p>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {recentApplications.map((app) => (
                        <div key={app._id} className="py-2.5 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-slate-800 block">{app.storeName}</span>
                            <span className="text-[11px] text-slate-400">
                              Applicant: {app.user?.name || 'Customer'} ({app.user?.email || 'N/A'})
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              setActiveTab('sellers');
                              setSellersFilter('pending');
                            }}
                            className="px-2.5 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg font-bold text-[11px]"
                          >
                            Review
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Platform Orders */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <ShoppingCart className="w-4 h-4 text-emerald-600" />
                      <span>Recent Marketplace Orders</span>
                    </h3>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-xs font-bold text-indigo-600 hover:underline"
                    >
                      View All
                    </button>
                  </div>

                  {recentOrders.length === 0 ? (
                    <p className="text-xs text-slate-400 py-6 text-center">No orders recorded yet</p>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {recentOrders.map((ord) => (
                        <div key={ord._id} className="py-2.5 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-mono font-bold text-indigo-700 block">{ord.orderNumber}</span>
                            <span className="text-[11px] text-slate-400">
                              {ord.customer?.name || 'Customer'} • ${(ord.pricing?.total || 0).toFixed(2)}
                            </span>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            {ord.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Seller Onboarding & Approvals */}
          {activeTab === 'sellers' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSellersFilter('all')}
                    className={`px-3 py-1 rounded-xl text-xs font-bold ${
                      sellersFilter === 'all'
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    All Stores
                  </button>
                  <button
                    onClick={() => setSellersFilter('pending')}
                    className={`px-3 py-1 rounded-xl text-xs font-bold ${
                      sellersFilter === 'pending'
                        ? 'bg-amber-600 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Pending Review
                  </button>
                  <button
                    onClick={() => setSellersFilter('approved')}
                    className={`px-3 py-1 rounded-xl text-xs font-bold ${
                      sellersFilter === 'approved'
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Approved
                  </button>
                  <button
                    onClick={() => setSellersFilter('rejected')}
                    className={`px-3 py-1 rounded-xl text-xs font-bold ${
                      sellersFilter === 'rejected'
                        ? 'bg-rose-600 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Rejected
                  </button>
                </div>

                <span className="text-xs text-slate-400">
                  Showing {sellersList.length} seller profiles
                </span>
              </div>

              {/* Rejection Prompt Banner */}
              {rejectingSellerId && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs space-y-2">
                  <span className="font-bold text-rose-800 block">
                    Please provide a rationale for rejecting this merchant application:
                  </span>
                  <input
                    type="text"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="e.g. Incomplete business verification, non-compliant storefront title..."
                    className="w-full px-3 py-1.5 rounded-xl bg-white border border-rose-300 text-xs text-slate-800 outline-none"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRejectSeller(rejectingSellerId)}
                      className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs"
                    >
                      Confirm Rejection
                    </button>
                    <button
                      onClick={() => {
                        setRejectingSellerId(null);
                        setRejectionReason('');
                      }}
                      className="px-3 py-1 bg-slate-200 text-slate-700 rounded-lg font-semibold text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Sellers Table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Store & Slug</th>
                      <th className="py-3 px-4">Applicant / Email</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Phone / Contact</th>
                      <th className="py-3 px-4 text-right">Administrative Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sellersList.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400">
                          No seller records matching selected filter
                        </td>
                      </tr>
                    ) : (
                      sellersList.map((sel) => (
                        <tr key={sel._id} className="hover:bg-slate-50/70">
                          <td className="py-3 px-4">
                            <span className="font-bold text-slate-900 block">{sel.storeName}</span>
                            <span className="text-[11px] text-slate-400">/{sel.storeSlug}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-medium text-slate-800 block">{sel.user?.name || 'Applicant'}</span>
                            <span className="text-[11px] text-slate-400">{sel.user?.email || sel.contactEmail}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                sel.status === 'approved'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : sel.status === 'pending'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {sel.status}
                            </span>
                            {sel.rejectionReason && (
                              <span className="block text-[10px] text-rose-500 mt-0.5 truncate max-w-xs" title={sel.rejectionReason}>
                                Rationale: {sel.rejectionReason}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {sel.contactPhone || sel.user?.phone || 'Not provided'}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {sel.status !== 'approved' && (
                                <button
                                  onClick={() => handleApproveSeller(sel._id, sel.storeName)}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 shadow-xs cursor-pointer"
                                >
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Approve</span>
                                </button>
                              )}
                              {sel.status !== 'rejected' && (
                                <button
                                  onClick={() => setRejectingSellerId(sel._id)}
                                  className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                                >
                                  <XCircle className="w-3 h-3" />
                                  <span>Reject</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: User Accounts Management */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="relative w-full sm:w-60">
                    <input
                      type="text"
                      placeholder="Search users by name or email..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 outline-none"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  </div>

                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 outline-none"
                  >
                    <option value="all">All Roles</option>
                    <option value="customer">Customer</option>
                    <option value="seller">Seller</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <span className="text-xs text-slate-400">
                  Showing {usersList.length} accounts
                </span>
              </div>

              {/* Users Table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Account Status</th>
                      <th className="py-3 px-4 text-right">Administrative Toggle</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {usersList.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400">
                          No users found matching query
                        </td>
                      </tr>
                    ) : (
                      usersList.map((usr) => {
                        const isSelf = usr._id === currentAdmin?._id || usr._id === currentAdmin?.id;
                        return (
                          <tr key={usr._id} className="hover:bg-slate-50/70">
                            <td className="py-3 px-4 font-bold text-slate-900">
                              {usr.name} {isSelf && <span className="text-[10px] text-indigo-600 font-semibold">(You)</span>}
                            </td>
                            <td className="py-3 px-4 text-slate-600">
                              {usr.email}
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                                {usr.role}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  usr.isActive
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                                }`}
                              >
                                {usr.isActive ? 'Active' : 'Deactivated'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => handleToggleUserStatus(usr)}
                                disabled={isSelf}
                                className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                                  isSelf
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                    : usr.isActive
                                    ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 cursor-pointer'
                                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 cursor-pointer'
                                }`}
                              >
                                {isSelf ? 'Root Admin' : usr.isActive ? 'Deactivate' : 'Activate'}
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: Catalog Moderation */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200">
                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    placeholder="Search marketplace products..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 outline-none"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>

                <span className="text-xs text-slate-400">
                  Showing {productsList.length} products
                </span>
              </div>

              {/* Products Table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Item</th>
                      <th className="py-3 px-4">Merchant</th>
                      <th className="py-3 px-4">Price</th>
                      <th className="py-3 px-4">Moderation Status</th>
                      <th className="py-3 px-4 text-right">Moderator Controls</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {productsList.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400">
                          No products found
                        </td>
                      </tr>
                    ) : (
                      productsList.map((p) => {
                        const thumb = (p.images && p.images[0]) || '';
                        return (
                          <tr key={p._id || p.id} className="hover:bg-slate-50/70">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 overflow-hidden shrink-0">
                                  <SafeImage src={thumb} alt={p.name} aspectRatio="aspect-square" fit="contain" padding="p-0.5" />
                                </div>
                                <div className="min-w-0 max-w-xs">
                                  <span className="font-bold text-slate-900 truncate block">{p.name}</span>
                                  <span className="text-[11px] text-slate-400">Brand: {p.brand}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-slate-600 font-semibold">
                              {p.seller?.storeName || 'NOVAMART Direct'}
                            </td>
                            <td className="py-3 px-4 font-black text-slate-900">
                              ${(p.price || 0).toFixed(2)}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  p.isActive
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                                }`}
                              >
                                {p.isActive ? 'Active & Live' : 'Hidden by Admin'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleToggleProductStatus(p)}
                                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                                    p.isActive
                                      ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                                      : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                  }`}
                                >
                                  {p.isActive ? 'Hide Listing' : 'Make Live'}
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(p)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                  title="Delete Listing"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: Marketplace Orders */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">Filter Status:</span>
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 outline-none"
                  >
                    <option value="all">All Orders</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <span className="text-xs text-slate-400">
                  Showing {ordersList.length} platform orders
                </span>
              </div>

              {/* Orders Table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Order ID</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Total</th>
                      <th className="py-3 px-4">Stripe Payment</th>
                      <th className="py-3 px-4">Fulfillment Status</th>
                      <th className="py-3 px-4 text-right">Update Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {ordersList.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          No orders found matching filter
                        </td>
                      </tr>
                    ) : (
                      ordersList.map((ord) => (
                        <tr key={ord._id} className="hover:bg-slate-50/70">
                          <td className="py-3 px-4 font-mono font-bold text-indigo-700">
                            {ord.orderNumber}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-slate-800 block">{ord.customer?.name || 'Customer'}</span>
                            <span className="text-[11px] text-slate-400">{ord.customer?.email}</span>
                          </td>
                          <td className="py-3 px-4 font-black text-slate-900">
                            ${(ord.pricing?.total || 0).toFixed(2)}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                ord.payment?.status === 'succeeded'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {ord.payment?.status === 'succeeded' ? 'Stripe Paid' : ord.payment?.status || 'Pending'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              {ord.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <select
                              value={ord.status}
                              onChange={(e) => handleUpdateOrderStatus(ord._id, e.target.value)}
                              className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 outline-none cursor-pointer"
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-indigo-600" />
            <span>Administrator actions directly affect real-time marketplace databases</span>
          </div>
          <button
            onClick={() => setIsAdminModalOpen(false)}
            className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors cursor-pointer"
          >
            Close Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
