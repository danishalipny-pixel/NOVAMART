import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import authRoutes from './authRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import productRoutes from './productRoutes.js';
import orderRoutes from './orderRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import mediaRoutes from './mediaRoutes.js';
import userRoutes from './userRoutes.js';
import wishlistRoutes from './wishlistRoutes.js';
import reviewRoutes from './reviewRoutes.js';
import sellerRoutes from './sellerRoutes.js';
import adminRoutes from './adminRoutes.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const apiRouter = Router();

// API Root Info
apiRouter.get('/', (req, res) => {
  return ApiResponse.success(res, 'NOVAMART REST API v1 Base Route', {
    name: 'NOVAMART API',
    version: '1.0.0',
    documentation: '/api/v1/health',
    endpoints: {
      health: '/api/v1/health',
      auth: {
        base: '/api/v1/auth',
        register: 'POST /api/v1/auth/register',
        login: 'POST /api/v1/auth/login',
        me: 'GET /api/v1/auth/me',
        logout: 'POST /api/v1/auth/logout',
        becomeSeller: 'POST /api/v1/auth/become-seller'
      },
      users: {
        base: '/api/v1/users',
        getProfile: 'GET /api/v1/users/profile',
        updateProfile: 'PUT /api/v1/users/profile',
        changePassword: 'POST /api/v1/users/change-password'
      },
      categories: {
        base: '/api/v1/categories',
        getAll: 'GET /api/v1/categories',
        getById: 'GET /api/v1/categories/:id',
        create: 'POST /api/v1/categories (Admin)',
        update: 'PUT /api/v1/categories/:id (Admin)',
        delete: 'DELETE /api/v1/categories/:id (Admin)'
      },
      products: {
        base: '/api/v1/products',
        getAll: 'GET /api/v1/products (search, filter, sort, page)',
        getById: 'GET /api/v1/products/:id',
        getMyProducts: 'GET /api/v1/products/seller/me (Seller)',
        create: 'POST /api/v1/products (Approved Seller)',
        update: 'PUT /api/v1/products/:id (Seller Owner or Admin)',
        delete: 'DELETE /api/v1/products/:id (Seller Owner or Admin)'
      },
      orders: {
        base: '/api/v1/orders',
        create: 'POST /api/v1/orders (Customer)',
        getMyOrders: 'GET /api/v1/orders/my-orders (Customer)',
        getSellerOrders: 'GET /api/v1/orders/seller/my-orders (Seller)',
        getAllOrders: 'GET /api/v1/orders/admin/all (Admin)',
        getById: 'GET /api/v1/orders/:id (Customer/Seller/Admin)',
        updateStatus: 'PATCH /api/v1/orders/:id/status (Seller/Admin)'
      },
      payments: {
        base: '/api/v1/payments',
        createIntent: 'POST /api/v1/payments/create-intent (Customer/Admin)',
        webhook: 'POST /api/v1/payments/webhook (Stripe Signature Verified)',
        getStatus: 'GET /api/v1/payments/status/:orderId (Customer/Admin)'
      },
      media: {
        base: '/api/v1/media',
        upload: 'POST /api/v1/media/upload (Seller/Admin)',
        attachToProduct: 'POST /api/v1/media/products/:id/images (Seller Owner/Admin)',
        removeFromProduct: 'DELETE /api/v1/media/products/:id/images (Seller Owner/Admin)',
        delete: 'DELETE /api/v1/media/:publicId (Seller/Admin)'
      },
      wishlist: {
        base: '/api/v1/wishlist',
        getWishlist: 'GET /api/v1/wishlist',
        add: 'POST /api/v1/wishlist/:productId',
        remove: 'DELETE /api/v1/wishlist/:productId',
        clear: 'DELETE /api/v1/wishlist',
        check: 'GET /api/v1/wishlist/check/:productId'
      },
      reviews: {
        base: '/api/v1/reviews',
        create: 'POST /api/v1/reviews (Verified Buyer)',
        getByProduct: 'GET /api/v1/reviews/product/:productId',
        getStats: 'GET /api/v1/reviews/product/:productId/stats',
        update: 'PUT /api/v1/reviews/:id (Author)',
        delete: 'DELETE /api/v1/reviews/:id (Author/Admin)'
      },
      sellers: {
        base: '/api/v1/sellers',
        apply: 'POST /api/v1/sellers/apply (Customer)',
        status: 'GET /api/v1/sellers/application-status (Customer/Seller)',
        dashboard: 'GET /api/v1/sellers/dashboard (Approved Seller)',
        updateStock: 'PATCH /api/v1/sellers/products/:id/stock (Approved Seller)'
      },
      admin: {
        base: '/api/v1/admin',
        dashboard: 'GET /api/v1/admin/dashboard (Admin)',
        users: 'GET /api/v1/admin/users (Admin)',
        updateUserStatus: 'PATCH /api/v1/admin/users/:id/status (Admin)',
        sellers: 'GET /api/v1/admin/sellers (Admin)',
        pendingSellers: 'GET /api/v1/admin/sellers/pending (Admin)',
        approveSeller: 'PATCH /api/v1/admin/sellers/:id/approve (Admin)',
        rejectSeller: 'PATCH /api/v1/admin/sellers/:id/reject (Admin)',
        products: 'GET /api/v1/admin/products (Admin)',
        updateProductStatus: 'PATCH /api/v1/admin/products/:id/status (Admin)',
        deleteProduct: 'DELETE /api/v1/admin/products/:id (Admin)',
        orders: 'GET /api/v1/admin/orders (Admin)',
        updateOrderStatus: 'PATCH /api/v1/admin/orders/:id/status (Admin)'
      }
    }
  });
});

// Mount modular sub-routers
apiRouter.use('/health', healthRoutes);
apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/categories', categoryRoutes);
apiRouter.use('/products', productRoutes);
apiRouter.use('/orders', orderRoutes);
apiRouter.use('/payments', paymentRoutes);
apiRouter.use('/media', mediaRoutes);
apiRouter.use('/wishlist', wishlistRoutes);
apiRouter.use('/reviews', reviewRoutes);
apiRouter.use('/sellers', sellerRoutes);
apiRouter.use('/admin', adminRoutes);

export default apiRouter;
