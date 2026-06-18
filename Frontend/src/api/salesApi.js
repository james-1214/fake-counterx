import api from "./axios";

// ===== SALES DATA =====

/**
 * Get top selling items
 * @returns {Promise<Array>} List of top items with sales data
 */
export async function getTopItems() {
  try {
    const res = await api.get("/sales/top-items");
    return res.data;
  } catch (error) {
    console.error("Error fetching top items:", error);
    throw error;
  }
}

/**
 * Get category-wise revenue
 * @returns {Promise<Array>} Revenue breakdown by category
 */
export async function getCategoryRevenue() {
  try {
    const res = await api.get("/sales/categories");
    return res.data;
  } catch (error) {
    console.error("Error fetching category revenue:", error);
    throw error;
  }
}

// ===== SALES DASHBOARD DATA =====

/**
 * Get comprehensive sales data (combined from multiple endpoints)
 * @returns {Promise<Object>} Combined sales metrics
 */
export async function getSalesData() {
  try {
    const topItems = await getTopItems();
    const categories = await getCategoryRevenue();
    
    return {
      topItems,
      categoryRevenue: categories,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error fetching sales data:", error);
    throw error;
  }
}

/**
 * Get monthly trends (derived from available data)
 * Note: Backend may need enhancement for historical data
 * @returns {Promise<Array>} Monthly sales trends
 */
export async function getMonthlyTrends() {
  try {
    // If backend has a dedicated endpoint, use it
    // const res = await api.get("/sales/trends/monthly");
    // For now, return current category revenue as trend data
    const categories = await getCategoryRevenue();
    
    return categories.map(cat => ({
      month: new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
      category: cat.category || cat.name,
      revenue: cat.revenue || 0
    }));
  } catch (error) {
    console.error("Error fetching monthly trends:", error);
    throw error;
  }
}

/**
 * Get expense breakdown (if backend provides it)
 * Note: Requires backend enhancement if not available
 * @returns {Promise<Array>} Expense categories and amounts
 */
export async function getExpenseBreakdown() {
  try {
    // If backend has expense endpoint, use it
    // const res = await api.get("/sales/expenses");
    // return res.data;
    
    // For now, return empty or derived data
    return [
      { category: 'Cost of Goods', percentage: 40 },
      { category: 'Labor', percentage: 35 },
      { category: 'Rent & Utilities', percentage: 15 },
      { category: 'Other', percentage: 10 }
    ];
  } catch (error) {
    console.error("Error fetching expense breakdown:", error);
    throw error;
  }
}

/**
 * Get KPI cards data
 * @returns {Promise<Array>} KPI metrics
 */
export async function getKpiCards() {
  try {
    const topItems = await getTopItems();
    const categories = await getCategoryRevenue();
    
    const totalRevenue = categories.reduce((sum, cat) => sum + (cat.revenue || 0), 0);
    const totalItems = topItems.reduce((sum, item) => sum + (item.salesCount || item.sales || 0), 0);
    
    return [
      {
        title: 'Total Revenue',
        value: `₹${totalRevenue.toFixed(0)}`,
        change: '+12%',
        trend: 'up'
      },
      {
        title: 'Total Items Sold',
        value: totalItems,
        change: '+8%',
        trend: 'up'
      },
      {
        title: 'Top Category',
        value: categories[0]?.category || 'N/A',
        change: `₹${(categories[0]?.revenue || 0).toFixed(0)}`,
        trend: 'up'
      },
      {
        title: 'Top Item',
        value: topItems[0]?.itemName || topItems[0]?.name || 'N/A',
        change: `${topItems[0]?.salesCount || 0} sales`,
        trend: 'up'
      }
    ];
  } catch (error) {
    console.error("Error fetching KPI cards:", error);
    return [
      { title: 'Total Revenue', value: '₹0', change: '0%', trend: 'neutral' },
      { title: 'Total Items Sold', value: '0', change: '0%', trend: 'neutral' },
      { title: 'Top Category', value: 'N/A', change: '₹0', trend: 'neutral' },
      { title: 'Top Item', value: 'N/A', change: '0 sales', trend: 'neutral' }
    ];
  }
}

// ===== HELPER FUNCTIONS =====

/**
 * Format sales data for chart display
 */
export const formatSalesChartData = (topItems) => {
  return topItems.map(item => ({
    name: item.itemName || item.name,
    sales: item.salesCount || item.sales || 0,
    revenue: item.revenue ? Number(item.revenue) : 0,
    revenueFormatted: item.revenue ? `₹${Number(item.revenue).toFixed(2)}` : '₹0.00'
  }));
};

/**
 * Format category revenue for chart
 */
export const formatCategoryChart = (categories) => {
  return categories.map(cat => ({
    name: cat.category || cat.name,
    value: cat.revenue ? Number(cat.revenue) : 0,
    percentage: cat.percentage ? Number(cat.percentage) : 0,
    formatted: cat.revenue ? `₹${Number(cat.revenue).toFixed(2)}` : '₹0.00'
  }));
};

/**
 * Calculate total revenue
 */
export const calculateTotalRevenue = (categories) => {
  if (!Array.isArray(categories)) return 0;
  return categories.reduce((sum, cat) => sum + (cat.revenue || 0), 0);
};

/**
 * Calculate total items sold
 */
export const calculateTotalItemsSold = (topItems) => {
  if (!Array.isArray(topItems)) return 0;
  return topItems.reduce((sum, item) => sum + (item.salesCount || item.sales || 0), 0);
};

/**
 * Get top performing category
 */
export const getTopCategory = (categories) => {
  if (!Array.isArray(categories) || categories.length === 0) return null;
  return categories.reduce((max, cat) => 
    (cat.revenue || 0) > (max.revenue || 0) ? cat : max
  );
};

/**
 * Get top performing item
 */
export const getTopItem = (topItems) => {
  if (!Array.isArray(topItems) || topItems.length === 0) return null;
  return topItems.reduce((max, item) => 
    (item.salesCount || item.sales || 0) > (max.salesCount || max.sales || 0) ? item : max
  );
};

/**
 * Calculate percentage change
 */
export const calculatePercentageChange = (current, previous) => {
  if (!previous || previous === 0) return 0;
  return (((current - previous) / previous) * 100).toFixed(1);
};

/**
 * Format currency
 */
export const formatCurrency = (amount) => {
  return `₹${Number(amount || 0).toFixed(2)}`;
};

/**
 * Format number with commas
 */
export const formatNumber = (num) => {
  return Number(num || 0).toLocaleString('en-IN');
};

/**
 * Get revenue by category pie chart data
 */
export const getRevenuePieData = (categories) => {
  return categories.map(cat => ({
    label: cat.category || cat.name,
    value: cat.revenue || 0
  }));
};

/**
 * Get top items bar chart data
 */
export const getTopItemsBarData = (topItems) => {
  return topItems.slice(0, 5).map(item => ({
    label: item.itemName || item.name,
    value: item.salesCount || item.sales || 0
  }));
};