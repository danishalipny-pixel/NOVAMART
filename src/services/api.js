/**
 * Centralized API service client for NOVAMART frontend.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

/**
 * Serialize object to URL query string.
 */
function buildQueryString(params = {}) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, value);
    }
  }
  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Universal fetch wrapper with authorization and error handling.
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('novamart_token');
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const config = {
    ...options,
    headers
  };

  if (!isFormData && options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMessage =
        (data && data.message) ||
        (data && data.errors && data.errors[0] && data.errors[0].message) ||
        `Request failed with status ${response.status}`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    if (error.status) throw error;
    // Network / offline error
    const netError = new Error(
      'Unable to connect to NOVAMART API server. Please verify backend is running on port 5000.'
    );
    netError.status = 0;
    netError.isNetworkError = true;
    throw netError;
  }
}

export const authApi = {
  register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
  login: (credentials) => request('/auth/login', { method: 'POST', body: credentials }),
  getMe: () => request('/auth/me', { method: 'GET' }),
  becomeSeller: (storeData) => request('/auth/become-seller', { method: 'POST', body: storeData }),
  logout: () => request('/auth/logout', { method: 'POST' })
};

export const categoryApi = {
  getAll: (params) => request(`/categories${buildQueryString(params)}`),
  getById: (idOrSlug) => request(`/categories/${idOrSlug}`),
  create: (data) => request('/categories', { method: 'POST', body: data }),
  update: (idOrSlug, data) => request(`/categories/${idOrSlug}`, { method: 'PUT', body: data }),
  delete: (idOrSlug) => request(`/categories/${idOrSlug}`, { method: 'DELETE' })
};

export const productApi = {
  getProducts: (params) => request(`/products${buildQueryString(params)}`),
  getProduct: (idOrSlug) => request(`/products/${idOrSlug}`),
  getMyProducts: (params) => request(`/products/seller/me${buildQueryString(params)}`),
  createProduct: (data) => request('/products', { method: 'POST', body: data }),
  updateProduct: (idOrSlug, data) => request(`/products/${idOrSlug}`, { method: 'PUT', body: data }),
  deleteProduct: (idOrSlug) => request(`/products/${idOrSlug}`, { method: 'DELETE' })
};

export const orderApi = {
  createOrder: (orderData) => request('/orders', { method: 'POST', body: orderData }),
  getMyOrders: (params) => request(`/orders/my-orders${buildQueryString(params)}`),
  getSellerOrders: (params) => request(`/orders/seller/my-orders${buildQueryString(params)}`),
  getOrder: (idOrNumber) => request(`/orders/${idOrNumber}`),
  updateStatus: (idOrNumber, statusData) =>
    request(`/orders/${idOrNumber}/status`, { method: 'PATCH', body: statusData })
};

export const paymentApi = {
  createPaymentIntent: (orderId) =>
    request('/payments/create-intent', { method: 'POST', body: { orderId } }),
  getPaymentStatus: (orderId) =>
    request(`/payments/status/${orderId}`)
};

export const mediaApi = {
  uploadImages: (formData) =>
    request('/media/upload', { method: 'POST', body: formData }),
  uploadProductImages: (productId, formData) =>
    request(`/media/products/${productId}/images`, { method: 'POST', body: formData }),
  removeProductImage: (productId, data) =>
    request(`/media/products/${productId}/images`, { method: 'DELETE', body: data }),
  deleteImage: (publicId) =>
    request(`/media/${encodeURIComponent(publicId)}`, { method: 'DELETE' })
};

export const userApi = {
  getProfile: () => request('/users/profile'),
  updateProfile: (data) => request('/users/profile', { method: 'PUT', body: data }),
  changePassword: (data) => request('/users/change-password', { method: 'POST', body: data })
};

export const wishlistApi = {
  getWishlist: () => request('/wishlist'),
  addToWishlist: (productId) => request(`/wishlist/${productId}`, { method: 'POST' }),
  removeFromWishlist: (productId) => request(`/wishlist/${productId}`, { method: 'DELETE' }),
  clearWishlist: () => request('/wishlist', { method: 'DELETE' }),
  checkWishlist: (productId) => request(`/wishlist/check/${productId}`)
};

export const reviewApi = {
  createReview: (productId, data) =>
    request('/reviews', { method: 'POST', body: { productId, ...data } }),
  getProductReviews: (productId, params) =>
    request(`/reviews/product/${productId}${buildQueryString(params)}`),
  getRatingStats: (productId) =>
    request(`/reviews/product/${productId}/stats`),
  updateReview: (id, data) =>
    request(`/reviews/${id}`, { method: 'PUT', body: data }),
  deleteReview: (id) =>
    request(`/reviews/${id}`, { method: 'DELETE' })
};

export const sellerApi = {
  apply: (data) => request('/sellers/apply', { method: 'POST', body: data }),
  getApplicationStatus: () => request('/sellers/application-status'),
  getDashboard: () => request('/sellers/dashboard'),
  updateStock: (productId, stock) =>
    request(`/sellers/products/${productId}/stock`, { method: 'PATCH', body: { stock } })
};

export const adminApi = {
  getDashboard: () => request('/admin/dashboard'),
  getUsers: (params) => request(`/admin/users${buildQueryString(params)}`),
  getUserById: (id) => request(`/admin/users/${id}`),
  updateUserStatus: (id, isActive) =>
    request(`/admin/users/${id}/status`, { method: 'PATCH', body: { isActive } }),
  getSellers: (params) => request(`/admin/sellers${buildQueryString(params)}`),
  getPendingSellers: (params) => request(`/admin/sellers/pending${buildQueryString(params)}`),
  getSellerById: (id) => request(`/admin/sellers/${id}`),
  approveSeller: (id) => request(`/admin/sellers/${id}/approve`, { method: 'PATCH' }),
  rejectSeller: (id, reason) =>
    request(`/admin/sellers/${id}/reject`, { method: 'PATCH', body: { reason } }),
  getProducts: (params) => request(`/admin/products${buildQueryString(params)}`),
  updateProductStatus: (id, isActive) =>
    request(`/admin/products/${id}/status`, { method: 'PATCH', body: { isActive } }),
  deleteProduct: (id) => request(`/admin/products/${id}`, { method: 'DELETE' }),
  getOrders: (params) => request(`/admin/orders${buildQueryString(params)}`),
  getOrderById: (id) => request(`/admin/orders/${id}`),
  updateOrderStatus: (id, statusData) =>
    request(`/admin/orders/${id}/status`, { method: 'PATCH', body: statusData })
};

export default {
  auth: authApi,
  user: userApi,
  category: categoryApi,
  product: productApi,
  order: orderApi,
  payment: paymentApi,
  media: mediaApi,
  wishlist: wishlistApi,
  review: reviewApi,
  seller: sellerApi,
  admin: adminApi,
  request
};
