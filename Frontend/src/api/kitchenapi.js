import api from "./axios";

// ===== KITCHEN OPERATIONS =====

/**
 * Get all kitchen orders (orders ready for preparation)
 * @returns {Promise<Array>} List of orders for the kitchen
 */
export const getKitchenOrders = async () => {
  try {
    const res = await api.get("/kitchen/orders");
    return res.data;
  } catch (error) {
    console.error("Error fetching kitchen orders:", error);
    throw error;
  }
};

/**
 * Update order status from kitchen
 * @param {Number} orderId - Order ID
 * @param {String} status - New status (PENDING, PREPARING, READY, COMPLETED)
 * @returns {Promise<Object>} Updated order
 */
export const updateKitchenOrderStatus = async (orderId, status) => {
  try {
    const res = await api.put(`/kitchen/orders/${orderId}/status`, null, {
      params: { status }
    });
    return res.data;
  } catch (error) {
    console.error(`Error updating kitchen order ${orderId} status:`, error);
    throw error;
  }
};

// ===== HELPER FUNCTIONS =====

/**
 * Get status badge color for kitchen display
 */
export const getKitchenStatusColor = (status) => {
  const statusColors = {
    'PENDING': '#ef4444',    // Red
    'PREPARING': '#f59e0b',  // Orange
    'READY': '#10b981',      // Green
    'COMPLETED': '#6b7280'   // Gray
  };
  return statusColors[status] || '#9ca3af';
};

/**
 * Get status icon for kitchen display
 */
export const getKitchenStatusIcon = (status) => {
  const icons = {
    'PENDING': '⏳',
    'PREPARING': '👨‍🍳',
    'READY': '✅',
    'COMPLETED': '✓'
  };
  return icons[status] || '•';
};

/**
 * Format kitchen order for display
 */
export const formatKitchenOrder = (order) => {
  return {
    ...order,
    createdAt: order.createdAt ? new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '',
    orderTime: order.createdAt ? new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '',
    statusIcon: getKitchenStatusIcon(order.status),
    statusColor: getKitchenStatusColor(order.status)
  };
};

/**
 * Calculate time since order placed
 */
export const getOrderAge = (createdAt) => {
  if (!createdAt) return 'N/A';
  
  const now = new Date();
  const orderTime = new Date(createdAt);
  const diffMs = now - orderTime;
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return '< 1 min';
  if (diffMins < 60) return `${diffMins} min`;
  
  const diffHours = Math.floor(diffMins / 60);
  return `${diffHours}h ${diffMins % 60}m`;
};

/**
 * Group orders by status
 */
export const groupOrdersByStatus = (orders) => {
  return {
    pending: orders.filter(o => o.status === 'PENDING'),
    preparing: orders.filter(o => o.status === 'PREPARING'),
    ready: orders.filter(o => o.status === 'READY'),
    completed: orders.filter(o => o.status === 'COMPLETED')
  };
};

/**
 * Sort orders by priority (pending first, then by age)
 */
export const sortByPriority = (orders) => {
  const statusPriority = {
    'PENDING': 0,
    'PREPARING': 1,
    'READY': 2,
    'COMPLETED': 3
  };
  
  return [...orders].sort((a, b) => {
    const priorityDiff = (statusPriority[a.status] || 99) - (statusPriority[b.status] || 99);
    if (priorityDiff !== 0) return priorityDiff;
    
    // If same status, sort by creation time (oldest first)
    return new Date(a.createdAt) - new Date(b.createdAt);
  });
};

/**
 * Get next suggested status
 */
export const getNextStatus = (currentStatus) => {
  const statusFlow = {
    'PENDING': 'PREPARING',
    'PREPARING': 'READY',
    'READY': 'COMPLETED'
  };
  return statusFlow[currentStatus] || null;
};

/**
 * Check if kitchen is busy (many orders in preparation)
 */
export const isKitchenBusy = (orders, threshold = 5) => {
  const preparingOrders = orders.filter(o => o.status === 'PREPARING');
  return preparingOrders.length > threshold;
};

/**
 * Get estimated wait time based on queue
 */
export const getEstimatedWaitTime = (ordersInQueue, avgTimePerOrder = 15) => {
  if (!Array.isArray(ordersInQueue)) return 0;
  
  const pendingOrders = ordersInQueue.filter(o => o.status === 'PENDING');
  return Math.ceil(pendingOrders.length * avgTimePerOrder);
};

/**
 * Alert sound function for new orders
 */
export const playNewOrderAlert = () => {
  try {
    // Using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (error) {
    console.log('Audio not available');
  }
};