import api from "./axios";

// ===== MENU ITEMS =====

/**
 * Get all menu items (Admin view)
 */
export const getMenuItems = async () => {
  try {
    const res = await api.get("/menu");
    return res.data;
  } catch (error) {
    console.error("Error fetching menu items:", error);
    throw error;
  }
};

/**
 * Get only available menu items (Customer view)
 */
export const getAvailableMenuItems = async () => {
  try {
    const res = await api.get("/menu/available");
    return res.data;
  } catch (error) {
    console.error("Error fetching available menu items:", error);
    throw error;
  }
};

/**
 * Get menu item by ID
 */
export const getMenuItemById = async (id) => {
  try {
    const res = await api.get(`/menu/${id}`);
    return res.data;
  } catch (error) {
    console.error(`Error fetching menu item ${id}:`, error);
    throw error;
  }
};

/**
 * Get menu items by category
 */
export const getMenuItemsByCategory = async (category) => {
  try {
    const res = await api.get(`/menu/category/${category}`);
    return res.data;
  } catch (error) {
    console.error(`Error fetching menu items for category ${category}:`, error);
    throw error;
  }
};

/**
 * Get available menu items by category (Customer view)
 */
export const getAvailableMenuItemsByCategory = async (category) => {
  try {
    const res = await api.get(`/menu/available/category/${category}`);
    return res.data;
  } catch (error) {
    console.error(`Error fetching available items for category ${category}:`, error);
    throw error;
  }
};

/**
 * Search menu items by name
 */
export const searchMenuItems = async (itemName) => {
  try {
    const res = await api.get(`/menu/search/${itemName}`);
    return res.data;
  } catch (error) {
    console.error(`Error searching for menu items "${itemName}":`, error);
    throw error;
  }
};

// ===== ADMIN OPERATIONS =====

/**
 * Create a new menu item
 */
export const createMenuItem = async (data) => {
  try {
    const res = await api.post("/menu", data);
    return res.data;
  } catch (error) {
    console.error("Error creating menu item:", error);
    throw error;
  }
};

/**
 * Update existing menu item
 */
export const updateMenuItem = async (id, data) => {
  try {
    const res = await api.put(`/menu/${id}`, data);
    return res.data;
  } catch (error) {
    console.error(`Error updating menu item ${id}:`, error);
    throw error;
  }
};

/**
 * Delete menu item
 */
export const deleteMenuItem = async (id) => {
  try {
    const res = await api.delete(`/menu/${id}`);
    return res.data;
  } catch (error) {
    console.error(`Error deleting menu item ${id}:`, error);
    throw error;
  }
};

/**
 * Update menu item availability
 */
export const updateMenuItemAvailability = async (itemName, available) => {
  try {
    const res = await api.put(`/menu/availability/${itemName}/${available}`);
    return res.data;
  } catch (error) {
    console.error(`Error updating availability for ${itemName}:`, error);
    throw error;
  }
};

// ===== HELPER FUNCTIONS =====

/**
 * Extract unique categories from menu items
 * Use this if backend doesn't provide a dedicated categories endpoint
 */
export const getCategories = async () => {
  try {
    const items = await getMenuItems();
    const categories = [...new Set(items.map(item => item.category))];
    return categories;
  } catch (error) {
    console.error("Error extracting categories:", error);
    return [];
  }
};

/**
 * Get categories with only available items
 */
export const getAvailableCategories = async () => {
  try {
    const items = await getAvailableMenuItems();
    const categories = [...new Set(items.map(item => item.category))];
    return categories;
  } catch (error) {
    console.error("Error extracting available categories:", error);
    return [];
  }
};