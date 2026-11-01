export const initialSellerStats = {
  totalRevenue: 48920.00,
  monthlyGrowth: 14.8,
  totalOrders: 342,
  orderGrowth: 8.5,
  activeProducts: 12,
  averageRating: 4.88,
  totalViews: 92450
};

export const salesChartData = [
  { month: 'Jan', sales: 4200, orders: 32 },
  { month: 'Feb', sales: 5100, orders: 40 },
  { month: 'Mar', sales: 6800, orders: 52 },
  { month: 'Apr', sales: 5900, orders: 46 },
  { month: 'May', sales: 7400, orders: 58 },
  { month: 'Jun', sales: 8900, orders: 69 },
  { month: 'Jul', sales: 10620, orders: 85 }
];

export const initialOrders = [
  {
    id: 'ORD-9842',
    date: '2026-10-31',
    customer: 'Sophia Chen',
    items: 'Sony WH-1000XM5 Wireless Headphones (x1)',
    total: 348.00,
    status: 'Shipped',
    statusColor: 'bg-emerald-100 text-emerald-800 border-emerald-300'
  },
  {
    id: 'ORD-9841',
    date: '2026-10-31',
    customer: 'Marcus Vance',
    items: 'Apple Watch Ultra 2 Titanium (x1)',
    total: 779.00,
    status: 'Processing',
    statusColor: 'bg-amber-100 text-amber-800 border-amber-300'
  },
  {
    id: 'ORD-9840',
    date: '2026-10-30',
    customer: 'Elena Rostova',
    items: 'Keychron Q1 Pro Mechanical Keyboard (x2)',
    total: 398.00,
    status: 'Delivered',
    statusColor: 'bg-blue-100 text-blue-800 border-blue-300'
  },
  {
    id: 'ORD-9839',
    date: '2026-10-29',
    customer: 'David Kim',
    items: 'Fujifilm X-T5 Mirrorless Camera Body (x1)',
    total: 1699.00,
    status: 'Delivered',
    statusColor: 'bg-blue-100 text-blue-800 border-blue-300'
  },
  {
    id: 'ORD-9838',
    date: '2026-10-29',
    customer: 'Amara Okafor',
    items: 'Bellroy Tokyo Transit Tech Backpack (x1)',
    total: 179.00,
    status: 'Delivered',
    statusColor: 'bg-blue-100 text-blue-800 border-blue-300'
  }
];
