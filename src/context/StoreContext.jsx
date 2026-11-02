import React, { createContext, useState, useEffect } from 'react';
import { initialProducts } from '../data/products';
import { initialSellerStats, initialOrders } from '../data/mockSeller';
import { productApi, wishlistApi } from '../services/api';

export const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  // Catalog & Inventory (can be extended by Seller)
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('novamart_products');
    if (!saved) return initialProducts;
    try {
      const parsed = JSON.parse(saved);
      // Seamlessly upgrade initial products to use centralized local assets
      return parsed.map((p) => {
        const matchingInitial = initialProducts.find((ip) => ip.id === p.id);
        if (matchingInitial) {
          return { ...p, images: matchingInitial.images };
        }
        return p;
      });
    } catch {
      return initialProducts;
    }
  });

  // Cart
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('novamart_cart');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      return parsed.map((item) => {
        const matchingInitial = initialProducts.find((ip) => ip.id === item.product?.id);
        if (matchingInitial) {
          return {
            ...item,
            product: { ...item.product, images: matchingInitial.images },
            selectedImage: matchingInitial.images[0] || item.selectedImage
          };
        }
        return item;
      });
    } catch {
      return [];
    }
  });

  // Wishlist
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('novamart_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  // Active App View: 'storefront' | 'seller'
  const [activeView, setActiveView] = useState('storefront');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [maxPrice, setMaxPrice] = useState(3500);

  // Modals & Drawers
  const [selectedProductForDetail, setSelectedProductForDetail] = useState(null);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isImageAuditOpen, setIsImageAuditOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // Responsive Viewport Simulation Mode: 'responsive' | 'mobile' (375px) | 'tablet' (768px) | 'laptop' (1024px) | 'desktop' (1440px)
  const [viewportMode, setViewportMode] = useState('responsive');

  // Seller Dashboard State
  const [sellerStats, setSellerStats] = useState(initialSellerStats);
  const [sellerOrders, setSellerOrders] = useState(initialOrders);

  // Toast Notifications
  const [toasts, setToasts] = useState([]);

  // Persistence
  useEffect(() => {
    localStorage.setItem('novamart_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('novamart_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('novamart_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Synchronize Wishlist with backend when user is authenticated
  useEffect(() => {
    if (localStorage.getItem('novamart_token')) {
      wishlistApi.getWishlist()
        .then((res) => {
          if (res?.data?.products && Array.isArray(res.data.products)) {
            const ids = res.data.products.map((p) => p._id || p.id);
            setWishlist(ids);
          }
        })
        .catch(() => {});
    }
  }, []);

  // Toast helper
  const addToast = (message, type = 'success', duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Cart actions
  const addToCart = (product, quantity = 1, selectedImage = null) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex].quantity += quantity;
        return next;
      }
      return [
        ...prev,
        {
          product,
          quantity,
          selectedImage: selectedImage || (product.images && product.images[0]) || ''
        }
      ];
    });
    addToast(`Added "${product.name.slice(0, 24)}..." to cart`, 'success');
  };

  const updateCartQuantity = (productId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    addToast('Item removed from cart', 'info');
  };

  const clearCart = () => {
    setCart([]);
  };

  // Wishlist actions
  const toggleWishlist = async (product) => {
    const targetId = product.id || product._id;
    const isFavorited = wishlist.includes(targetId);

    setWishlist((prev) => {
      if (isFavorited) {
        addToast(`Removed from wishlist`, 'info');
        return prev.filter((id) => id !== targetId);
      } else {
        addToast(`Saved to wishlist`, 'success');
        return [...prev, targetId];
      }
    });

    if (localStorage.getItem('novamart_token')) {
      try {
        if (isFavorited) {
          await wishlistApi.removeFromWishlist(targetId);
        } else {
          await wishlistApi.addToWishlist(targetId);
        }
      } catch (err) {
        console.warn('Backend wishlist sync:', err.message);
      }
    }
  };

  const clearWishlist = async () => {
    setWishlist([]);
    if (localStorage.getItem('novamart_token')) {
      try {
        await wishlistApi.clearWishlist();
      } catch (err) {
        console.warn('Backend clear wishlist sync:', err.message);
      }
    }
    addToast('Wishlist cleared', 'info');
  };

  // Seller: Add or update product with REST API synchronization
  const saveProduct = async (newProductData, isEditing = false) => {
    if (isEditing) {
      setProducts((prev) =>
        prev.map((p) => (p.id === newProductData.id ? { ...p, ...newProductData } : p))
      );
      try {
        await productApi.updateProduct(newProductData.id, newProductData);
      } catch {
        // Fallback to local storage persistence
      }
      addToast('Product details updated successfully!', 'success');
    } else {
      let createdId = `prod-${Date.now()}`;
      try {
        const res = await productApi.createProduct(newProductData);
        if (res && res.data) {
          createdId = res.data.id || res.data._id || createdId;
        }
      } catch {
        // Fallback to local storage persistence
      }
      const newProduct = {
        ...newProductData,
        id: createdId,
        rating: 5.0,
        reviewCount: 1,
        inStock: true
      };
      setProducts((prev) => [newProduct, ...prev]);
      setSellerStats((prev) => ({
        ...prev,
        activeProducts: prev.activeProducts + 1
      }));
      addToast('New product published to storefront!', 'success');
    }
  };

  const deleteProduct = async (productId) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    try {
      await productApi.deleteProduct(productId);
    } catch {
      // Fallback to local storage persistence
    }
    setSellerStats((prev) => ({
      ...prev,
      activeProducts: Math.max(0, prev.activeProducts - 1)
    }));
    addToast('Product removed from catalog', 'info');
  };

  // Cart Computations
  const cartSubtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const freeShippingThreshold = 100;
  const freeShippingRemaining = Math.max(0, freeShippingThreshold - cartSubtotal);

  return (
    <StoreContext.Provider
      value={{
        products,
        setProducts,
        cart,
        cartCount,
        cartSubtotal,
        freeShippingThreshold,
        freeShippingRemaining,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        wishlist,
        toggleWishlist,
        activeView,
        setActiveView,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        sortBy,
        setSortBy,
        maxPrice,
        setMaxPrice,
        selectedProductForDetail,
        setSelectedProductForDetail,
        quickViewProduct,
        setQuickViewProduct,
        isCartOpen,
        setIsCartOpen,
        isMobileNavOpen,
        setIsMobileNavOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isImageAuditOpen,
        setIsImageAuditOpen,
        isWishlistOpen,
        setIsWishlistOpen,
        isProfileOpen,
        setIsProfileOpen,
        isAdminModalOpen,
        setIsAdminModalOpen,
        clearWishlist,
        viewportMode,
        setViewportMode,
        sellerStats,
        setSellerStats,
        sellerOrders,
        setSellerOrders,
        saveProduct,
        deleteProduct,
        toasts,
        addToast,
        removeToast
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export { useStore } from './useStore';
