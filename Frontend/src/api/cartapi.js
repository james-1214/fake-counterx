import api from "./axios";

// ===== CART OPERATIONS =====

/**
 * Add items to cart
 * @param {Object} cartData - Cart data containing items, customerId, etc.
 * @returns {Promise<Object>} Created cart
 */
export const addToCart = async (cartData) => {
  try {
    const res = await api.post("/cart", cartData);
    return res.data;
  } catch (error) {
    console.error("Error adding to cart:", error);
    throw error;
  }
};

/**
 * Get all carts (Admin view)
 * @returns {Promise<Array>} List of all carts
 */
export const getAllCarts = async () => {
  try {
    const res = await api.get("/cart");
    return res.data;
  } catch (error) {
    console.error("Error fetching carts:", error);
    throw error;
  }
};

/**
 * Get specific cart by ID
 * @param {Number} cartId - Cart ID
 * @returns {Promise<Object>} Cart details with items
 */
export const getCart = async (cartId) => {
  try {
    const res = await api.get(`/cart/${cartId}`);
    return res.data;
  } catch (error) {
    console.error(`Error fetching cart ${cartId}:`, error);
    throw error;
  }
};

/**
 * Delete cart (Clear cart)
 * @param {Number} cartId - Cart ID to delete
 * @returns {Promise<String>} Confirmation message
 */
export const deleteCart = async (cartId) => {
  try {
    const res = await api.delete(`/cart/${cartId}`);
    return res.data;
  } catch (error) {
    console.error(`Error deleting cart ${cartId}:`, error);
    throw error;
  }
};

// ===== HELPER FUNCTIONS =====

/**
 * Calculate cart totals
 */
export const calculateCartTotals = (cartItems) => {
  if (!Array.isArray(cartItems)) return { total: 0, itemCount: 0, avgPrice: 0 };
  
  const total = cartItems.reduce((sum, item) => sum + (item.price * (item.quantity || item.qty || 1)), 0);
  const itemCount = cartItems.reduce((count, item) => count + (item.quantity || item.qty || 1), 0);
  const avgPrice = itemCount > 0 ? (total / itemCount).toFixed(2) : 0;
  
  return {
    subtotal: parseFloat(total.toFixed(2)),
    subtotalFormatted: `₹${total.toFixed(2)}`,
    itemCount,
    avgPrice: parseFloat(avgPrice),
    avgPriceFormatted: `₹${avgPrice}`,
    tax: parseFloat((total * 0.05).toFixed(2)), // 5% tax
    taxFormatted: `₹${(total * 0.05).toFixed(2)}`,
    total: parseFloat((total * 1.05).toFixed(2)), // With tax
    totalFormatted: `₹${(total * 1.05).toFixed(2)}`
  };
};

/**
 * Format cart item for display
 */
export const formatCartItem = (item) => {
  return {
    ...item,
    quantity: item.quantity || item.qty || 1,
    itemPrice: item.price || 0,
    itemPriceFormatted: `₹${(item.price || 0).toFixed(2)}`,
    lineTotal: (item.price || 0) * (item.quantity || item.qty || 1),
    lineTotalFormatted: `₹${((item.price || 0) * (item.quantity || item.qty || 1)).toFixed(2)}`
  };
};

/**
 * Validate cart data before submission
 */
export const validateCartData = (cartData) => {
  const errors = [];
  
  if (!cartData.items || cartData.items.length === 0) {
    errors.push('Cart is empty');
  }
  
  cartData.items?.forEach((item, index) => {
    if (!item.menuId || !item.menuId.toString().trim()) {
      errors.push(`Item ${index + 1}: Menu ID is required`);
    }
    if (!item.quantity || item.quantity < 1) {
      errors.push(`Item ${index + 1}: Quantity must be at least 1`);
    }
    if (!item.price || item.price < 0) {
      errors.push(`Item ${index + 1}: Invalid price`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Merge carts (for guest to registered user migration)
 */
export const mergeCarts = (guestCart, userCart) => {
  const merged = [...userCart];
  
  guestCart.forEach(guestItem => {
    const existingItem = merged.find(item => item.menuId === guestItem.menuId);
    
    if (existingItem) {
      existingItem.quantity += guestItem.quantity;
    } else {
      merged.push(guestItem);
    }
  });
  
  return merged;
};

/**
 * Remove item from cart (local operation)
 */
export const removeCartItem = (cartItems, menuId) => {
  return cartItems.filter(item => item.menuId !== menuId);
};

/**
 * Update item quantity in cart (local operation)
 */
export const updateItemQuantity = (cartItems, menuId, newQuantity) => {
  if (newQuantity <= 0) {
    return removeCartItem(cartItems, menuId);
  }
  
  return cartItems.map(item => 
    item.menuId === menuId 
      ? { ...item, quantity: newQuantity, qty: newQuantity }
      : item
  );
};

/**
 * Clear entire cart (local operation)
 */
export const clearCart = () => {
  return [];
};

/**
 * Check if item already in cart
 */
export const isItemInCart = (cartItems, menuId) => {
  return cartItems.some(item => item.menuId === menuId);
};

/**
 * Get item from cart
 */
export const getCartItem = (cartItems, menuId) => {
  return cartItems.find(item => item.menuId === menuId);
};