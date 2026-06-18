import api from "./axios";

// ===== DASHBOARD STATISTICS =====

/** Get today's dashboard statistics */
export const getDashboardStats = async () => {
  try {
    const res = await api.get("/dashboard/today");
    return res.data;
  } catch (error) {
    console.error("Error fetching today's dashboard stats:", error);
    throw error;
  }
};

/**
 * Get weekly dashboard statistics.
 * Backend returns: [{ revenueDate, totalOrders, totalRevenue }]
 * NOTE: the date field is "revenueDate", not "date".
 */
export const getWeekDashboard = async () => {
  try {
    const res = await api.get("/dashboard/week");
    return res.data;
  } catch (error) {
    console.error("Error fetching weekly dashboard stats:", error);
    throw error;
  }
};

/** Get monthly dashboard statistics */
export const getMonthDashboard = async () => {
  try {
    const res = await api.get("/dashboard/month");
    return res.data;
  } catch (error) {
    console.error("Error fetching monthly dashboard stats:", error);
    throw error;
  }
};

// ===== HELPER FUNCTIONS =====

/** Format dashboard stats for display */
export const formatDashboardStats = (stats) => ({
  ...stats,
  totalRevenue: stats.totalRevenue
    ? `₹${Number(stats.totalRevenue).toFixed(2)}` : '₹0.00',
  totalOrders:      stats.totalOrders      || 0,
  pendingOrders:    stats.pendingOrders    || 0,
  completedOrders:  stats.completedOrders  || 0,
  avgOrderValue: stats.totalOrders && stats.totalRevenue
    ? `₹${(stats.totalRevenue / stats.totalOrders).toFixed(2)}` : '₹0.00',
  // Normalise the date field — backend uses revenueDate
  date: (stats.revenueDate || stats.date)
    ? new Date(stats.revenueDate || stats.date).toLocaleDateString('en-IN') : '',
});

export const formatNumber   = (num)    => Number(num).toLocaleString('en-IN');
export const formatCurrency = (amount) => `₹${Number(amount || 0).toFixed(2)}`;

export const getGrowthPercentage = (current, previous) => {
  if (!previous || previous === 0) return 0;
  return (((current - previous) / previous) * 100).toFixed(1);
};
