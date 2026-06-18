import api from "./axios";

// ===== ORDER OPERATIONS =====

/**
 * Create a new order.
 * Sends: { orderType, items, subtotal, tax, total, paymentMethod, table }
 * Backend maps "total" → totalAmount via @JsonAlias.
 */
export const createOrder = async (orderData) => {
  try {
    const res = await api.post("/orders", orderData);
    return res.data;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

/** Get all orders (Admin/Staff view) */
export const getOrders = async () => {
  try {
    const res = await api.get("/orders");
    return res.data;
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
};

/** Get order by ID */
export const getOrderById = async (id) => {
  try {
    const res = await api.get(`/orders/${id}`);
    return res.data;
  } catch (error) {
    console.error(`Error fetching order ${id}:`, error);
    throw error;
  }
};

/** Get today's orders */
export const getTodayOrders = async () => {
  try {
    const res = await api.get("/orders/today");
    return res.data;
  } catch (error) {
    console.error("Error fetching today's orders:", error);
    throw error;
  }
};

/**
 * Update order status.
 * Accepted values (backend maps both frontend and enum names):
 *   PENDING | CONFIRMED | PREPARING | READY | COMPLETED | CANCELLED
 */
export const updateOrderStatus = async (orderId, status) => {
  try {
    const res = await api.put(`/orders/${orderId}/status/${status}`);
    return res.data;
  } catch (error) {
    console.error(`Error updating order ${orderId} status to ${status}:`, error);
    throw error;
  }
};

/** Update order type */
export const updateOrderType = async (orderId, orderType) => {
  try {
    const res = await api.put(`/orders/${orderId}/type/${orderType}`);
    return res.data;
  } catch (error) {
    console.error(`Error updating order ${orderId} type to ${orderType}:`, error);
    throw error;
  }
};

/**
 * Get all OrderItem rows for a given orderId.
 * Used by Kitchen.jsx to show item names and quantities.
 * Maps to GET /order-items/order/{orderId}
 */
export const getOrderItemsByOrderId = async (orderId) => {
  try {
    const res = await api.get(`/order-items/order/${orderId}`);
    return res.data;
  } catch (error) {
    console.error(`Error fetching items for order ${orderId}:`, error);
    throw error;
  }
};

// ===== HELPER FUNCTIONS =====

/** Format order dates for display */
export const formatOrder = (order) => {
  const ts = order.orderDateTime || order.createdAt;
  return {
    ...order,
    createdAt: ts ? new Date(ts).toLocaleString('en-IN') : '',
    time:      ts ? new Date(ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '',
  };
};

/** Get order summary statistics */
export const getOrderStats = async () => {
  try {
    const orders = await getOrders();
    return {
      total:     orders.length,
      pending:   orders.filter(o => ['PENDING_PAYMENT','PLACED'].includes(o.orderStatus)).length,
      preparing: orders.filter(o => o.orderStatus === 'PREPARING').length,
      ready:     orders.filter(o => o.orderStatus === 'READY').length,
      completed: orders.filter(o => o.orderStatus === 'SERVED').length,
      totalRevenue: orders
        .filter(o => o.orderStatus === 'SERVED')
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0),
    };
  } catch (error) {
    console.error("Error calculating order statistics:", error);
    return {};
  }
};
