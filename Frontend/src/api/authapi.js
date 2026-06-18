import api from "./axios";

// ===== AUTHENTICATION OPERATIONS =====

/**
 * Register a new admin user
 * @param {Object} adminData - Admin registration data (email, password, name, etc.)
 * @returns {Promise<Object>} Registered admin user
 */
export const registerAdmin = async (adminData) => {
  try {
    const res = await api.post("/auth/register", adminData);
    return res.data;
  } catch (error) {
    console.error("Error registering admin:", error);
    throw error;
  }
};

/**
 * Login admin user
 * @param {Object} loginData - Login credentials (email, password)
 * @returns {Promise<String>} JWT token or session data
 */
export const loginAdmin = async (loginData) => {
  try {
    const res = await api.post("/auth/login", loginData);
    
    // If backend returns a token, store it
    if (res.data && typeof res.data === 'string') {
      localStorage.setItem('authToken', res.data);
      localStorage.setItem('userRole', 'admin');
    }
    
    return res.data;
  } catch (error) {
    console.error("Error logging in admin:", error);
    throw error;
  }
};

/**
 * Get admin profile by ID
 * @param {Number} adminId - Admin user ID
 * @returns {Promise<Object>} Admin profile data
 */
export const getAdminProfile = async (adminId) => {
  try {
    const res = await api.get(`/auth/${adminId}`);
    return res.data;
  } catch (error) {
    console.error(`Error fetching admin profile ${adminId}:`, error);
    throw error;
  }
};

/**
 * Get all admin users (super admin only)
 * @returns {Promise<Array>} List of all admins
 */
export const getAllAdmins = async () => {
  try {
    const res = await api.get("/auth");
    return res.data;
  } catch (error) {
    console.error("Error fetching all admins:", error);
    throw error;
  }
};

/**
 * Update admin profile
 * @param {Number} adminId - Admin user ID
 * @param {Object} updateData - Updated admin data
 * @returns {Promise<Object>} Updated admin profile
 */
export const updateAdminProfile = async (adminId, updateData) => {
  try {
    const res = await api.put(`/auth/${adminId}`, updateData);
    return res.data;
  } catch (error) {
    console.error(`Error updating admin profile ${adminId}:`, error);
    throw error;
  }
};

/**
 * Delete admin user
 * @param {Number} adminId - Admin user ID to delete
 * @returns {Promise<String>} Confirmation message
 */
export const deleteAdmin = async (adminId) => {
  try {
    const res = await api.delete(`/auth/${adminId}`);
    return res.data;
  } catch (error) {
    console.error(`Error deleting admin ${adminId}:`, error);
    throw error;
  }
};

// ===== LOCAL STORAGE & SESSION MANAGEMENT =====

/**
 * Store auth token in localStorage
 */
export const storeAuthToken = (token) => {
  localStorage.setItem('authToken', token);
  
  // Add token to API default headers
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
};

/**
 * Retrieve auth token from localStorage
 */
export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

/**
 * Remove auth token from localStorage
 */
export const removeAuthToken = () => {
  localStorage.removeItem('authToken');
  delete api.defaults.headers.common['Authorization'];
};

/**
 * Store user role in localStorage
 */
export const storeUserRole = (role) => {
  localStorage.setItem('userRole', role);
};

/**
 * Get stored user role
 */
export const getUserRole = () => {
  return localStorage.getItem('userRole');
};

/**
 * Store user profile in localStorage
 */
export const storeUserProfile = (profile) => {
  localStorage.setItem('userProfile', JSON.stringify(profile));
};

/**
 * Get stored user profile
 */
export const getUserProfile = () => {
  const profile = localStorage.getItem('userProfile');
  return profile ? JSON.parse(profile) : null;
};

/**
 * Logout user (clear all session data)
 */
export const logout = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userProfile');
  delete api.defaults.headers.common['Authorization'];
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return !!getAuthToken();
};

// ===== HELPER FUNCTIONS =====

/**
 * Validate login credentials
 */
export const validateLoginData = (loginData) => {
  const errors = [];
  
  if (!loginData.email || !loginData.email.trim()) {
    errors.push('Email is required');
  } else if (!isValidEmail(loginData.email)) {
    errors.push('Invalid email format');
  }
  
  if (!loginData.password || loginData.password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate admin registration data
 */
export const validateRegistrationData = (adminData) => {
  const errors = [];
  
  if (!adminData.email || !adminData.email.trim()) {
    errors.push('Email is required');
  } else if (!isValidEmail(adminData.email)) {
    errors.push('Invalid email format');
  }
  
  if (!adminData.password || adminData.password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }
  
  if (!adminData.name || !adminData.name.trim()) {
    errors.push('Name is required');
  }
  
  if (adminData.password !== adminData.confirmPassword) {
    errors.push('Passwords do not match');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Decode JWT token to get user info (without verification)
 * Note: This is for frontend display only, never trust token data for security
 */
export const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  
  const now = Math.floor(Date.now() / 1000);
  return decoded.exp < now;
};

/**
 * Format user profile for display
 */
export const formatUserProfile = (profile) => {
  return {
    ...profile,
    createdAt: profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-IN') : '',
    lastLogin: profile.lastLogin ? new Date(profile.lastLogin).toLocaleString('en-IN') : ''
  };
};