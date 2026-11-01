import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import SafeImage from '../common/SafeImage';
import ProductUploadModal from './ProductUploadModal';
import { salesChartData } from '../../data/mockSeller';
import {
  TrendingUp,
  DollarSign,
  Package,
  ShoppingCart,
  Star,
  Plus,
  Edit2,
  Trash2,
  Search,
  ArrowUpRight,
  Eye
} from 'lucide-react';

export default function SellerDashboard() {
  const {
    products,
    deleteProduct,
    sellerStats,
    sellerOrders,
    setActiveView,
    setSelectedProductForDetail
  } = useStore();

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productSearch, setProductSearch] = useState('');
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'orders'

  // Filter seller products
  const sellerProducts = products.filter((p) => {
    if (!productSearch) return true;
    const q = productSearch.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q);
  });

  const handleEdit = (prod) => {
    setEditingProduct(prod);
    setIsUploadModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setIsUploadModalOpen(true);
  };

  return (
    <div className="py-6 sm:py-8 space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              Merchant Verified
            </span>
            <span className="text-xs text-slate-400">Store ID #NM-9924</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            Seller Dashboard Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Manage your catalog imagery, live stock, sales analytics, and fulfillment
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setActiveView('storefront')}
            className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
          >
            Customer Storefront
          </button>
          <button
            onClick={handleAddNew}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* 1. Metrics Grid (Responsive: 1 col on mobile, 2 on tablet, 4 on desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 block">Total Revenue</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5 block">
              ${sellerStats.totalRevenue.toLocaleString()}
            </span>
            <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-0.5 mt-1">
              <ArrowUpRight className="w-3 h-3" /> +{sellerStats.monthlyGrowth}% vs last mo.
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 block">Total Orders</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5 block">
              {sellerStats.totalOrders}
            </span>
            <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-0.5 mt-1">
              <ArrowUpRight className="w-3 h-3" /> +{sellerStats.orderGrowth}% increase
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <ShoppingCart className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 block">Active Listings</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5 block">
              {products.length}
            </span>
            <span className="text-[11px] text-slate-400 block mt-1">100% verified images</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 block">Store Rating</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5 block">
              {sellerStats.averageRating} ★
            </span>
            <span className="text-[11px] text-indigo-600 font-semibold block mt-1">
              Based on 1.2k customer reviews
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Star className="w-6 h-6 fill-purple-600 text-purple-600" />
          </div>
        </div>
      </div>

      {/* 2. Responsive Sales Chart */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <span>Sales Performance &amp; Revenue Velocity</span>
            </h3>
            <p className="text-xs text-slate-400">Monthly revenue trend across catalog</p>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1 rounded-lg border border-slate-200">
            Current Year 2026
          </span>
        </div>

        {/* SVG Responsive Area Chart */}
        <div className="w-full h-48 sm:h-56 relative pt-4">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 700 200" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            <line x1="0" y1="40" x2="700" y2="40" stroke="#f1f5f9" strokeWidth="1" />
            <line x1="0" y1="90" x2="700" y2="90" stroke="#f1f5f9" strokeWidth="1" />
            <line x1="0" y1="140" x2="700" y2="140" stroke="#f1f5f9" strokeWidth="1" />

            {/* Area Path */}
            <path
              d="M 20,150 Q 120,130 220,90 T 420,105 T 550,60 T 680,25 L 680,180 L 20,180 Z"
              fill="url(#chartGradient)"
            />

            {/* Line Path */}
            <path
              d="M 20,150 Q 120,130 220,90 T 420,105 T 550,60 T 680,25"
              fill="none"
              stroke="#4f46e5"
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            {/* Data Points */}
            {[
              { x: 20, y: 150, val: '$4.2k' },
              { x: 120, y: 135, val: '$5.1k' },
              { x: 220, y: 90, val: '$6.8k' },
              { x: 320, y: 110, val: '$5.9k' },
              { x: 420, y: 105, val: '$7.4k' },
              { x: 550, y: 60, val: '$8.9k' },
              { x: 680, y: 25, val: '$10.6k' }
            ].map((pt, i) => (
              <g key={i}>
                <circle cx={pt.x} cy={pt.y} r="5" fill="#4f46e5" stroke="#ffffff" strokeWidth="2.5" />
                <text x={pt.x} y={pt.y - 10} textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="bold">
                  {pt.val}
                </text>
              </g>
            ))}
          </svg>

          {/* Month labels */}
          <div className="flex justify-between text-[11px] text-slate-400 font-semibold px-2 mt-2">
            {salesChartData.map((d) => (
              <span key={d.month}>{d.month}</span>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Product Inventory & Orders Tabs */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Table Navigation Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'inventory'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Catalog Inventory ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'orders'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Recent Customer Orders ({sellerOrders.length})
            </button>
          </div>

          {activeTab === 'inventory' && (
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search products in inventory..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:bg-white focus:border-indigo-500 outline-none"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
          )}
        </div>

        {/* Tab Content 1: Products Table */}
        {activeTab === 'inventory' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Product &amp; Thumbnail</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock Status</th>
                  <th className="py-3 px-4">Images</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sellerProducts.map((p) => {
                  const thumb = (p.images && p.images[0]) || '';
                  const imageCount = (p.images && p.images.length) || 1;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Product Thumbnail & Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 overflow-hidden shrink-0">
                            <SafeImage
                              src={thumb}
                              alt={p.name}
                              aspectRatio="aspect-square"
                              fit="contain"
                              padding="p-1"
                            />
                          </div>
                          <div className="min-w-0 max-w-xs">
                            <div className="font-bold text-slate-800 truncate" title={p.name}>
                              {p.name}
                            </div>
                            <div className="text-[11px] text-slate-400 font-medium">
                              Brand: <span className="text-slate-600 font-semibold">{p.brand}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span className="capitalize font-semibold text-slate-600">
                          {p.category}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4 font-black text-slate-900">
                        ${p.price.toFixed(2)}
                      </td>

                      {/* Stock Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.stock > 10
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : p.stock > 0
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}
                        </span>
                      </td>

                      {/* Multi-images count */}
                      <td className="py-3 px-4">
                        <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                          {imageCount} view{imageCount > 1 ? 's' : ''}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedProductForDetail(p)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Preview Storefront PDP"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(p)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit Product & Photos"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteProduct(p.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* Tab Content 2: Orders Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sellerOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-700">
                      {ord.id}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {ord.customer}
                    </td>
                    <td className="py-3 px-4 text-slate-600 truncate max-w-xs">
                      {ord.items}
                    </td>
                    <td className="py-3 px-4 font-black text-slate-900">
                      ${ord.total.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {ord.date}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${ord.statusColor}`}>
                        {ord.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for Product Upload & Multi-Image Manager */}
      <ProductUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setEditingProduct(null);
        }}
        editingProduct={editingProduct}
      />
    </div>
  );
}
