const BASE = "http://localhost:8082";

const token = () => {
  const tk = localStorage.getItem("cx_token");
  if (!tk) {
    console.warn("⚠️ No auth token found. User may not be logged in.");
  }
  return tk;
};

const authH = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token() || ""}`,
});

async function req(url, opts = {}) {
  try {
    const tk = token();
    if (!tk && !url.includes("/auth/login")) {
      console.error("❌ No token available for authenticated endpoint:", url);
      // Redirect to login if token is missing
      window.location.href = "/admin-login";
      throw new Error("Authentication required");
    }

    const res = await fetch(BASE + url, opts);
    
    // Handle 403 Forbidden
    if (res.status === 403) {
      console.error("🔒 Access Denied (403) for:", url);
      localStorage.removeItem("cx_token");
      localStorage.removeItem("cx_user");
      window.location.href = "/admin-login";
      throw new Error("Access Denied - Please login again");
    }

    // Handle 401 Unauthorized
    if (res.status === 401) {
      console.error("🔓 Unauthorized (401) - Token expired");
      localStorage.removeItem("cx_token");
      localStorage.removeItem("cx_user");
      window.location.href = "/admin-login";
      throw new Error("Session expired - Please login again");
    }

    if (!res.ok) {
      const msg = await res.text().catch(() => res.statusText);
      throw new Error(msg || `HTTP ${res.status}`);
    }

    const ct = res.headers.get("content-type") || "";
    return ct.includes("application/json") ? res.json() : res.text();
  } catch (error) {
    console.error("API Error:", error.message);
    throw error;
  }
}

// ── AUTH  POST /api/auth/login ──────────────────────────────────────────────
// LoginDTO: { username: <email>, password }  (@JsonAlias("email") on backend)
export async function loginAdmin(email, password) {
  try {
    const jwt = await req("/api/auth/login", {
      method: "POST",   
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: email, password }),
    });

    // Ensure jwt is a string
    const tokenString = typeof jwt === "string" ? jwt : jwt.token || jwt;

    localStorage.setItem("cx_token", tokenString);
    
    try {
      const payload = JSON.parse(atob(tokenString.split(".")[1]));
      localStorage.setItem("cx_user", payload.sub || email);
    } catch {
      localStorage.setItem("cx_user", email);
    }

    console.log("✅ Login successful");
    return tokenString;
  } catch (error) {
    console.error("❌ Login failed:", error);
    throw error;
  }
}

export function logoutAdmin() {
  localStorage.removeItem("cx_token");
  localStorage.removeItem("cx_user");
  console.log("✅ Logged out");
}

export const getStoredUser = () => localStorage.getItem("cx_user") || "Admin";
export const getStoredToken = () => localStorage.getItem("cx_token");

// ── DASHBOARD  /api/dashboard ───────────────────────────────────────────────
// GET /api/dashboard/today  → DashboardDTO { revenueDate, totalOrders, totalRevenue, pendingOrders, completedOrders }
export const getDashboardToday = () => req("/api/dashboard/today", { headers: authH() });

// GET /api/dashboard/week   → List<DashboardDTO>
export const getDashboardWeek = () => req("/api/dashboard/week", { headers: authH() });

// ── ADMIN ORDERS  /api/admin ────────────────────────────────────────────────
// GET /api/admin/orders → List<AdminOrderDTO> { orderId, dailyOrderNumber, orderType, orderStatus, totalAmount }
export const getAdminOrders = () => req("/api/admin/orders", { headers: authH() });

// PUT /api/admin/orders/{id}/status?status=PLACED
export const updateAdminOrderStatus = (id, status) =>
  req(`/api/admin/orders/${id}/status?status=${status}`, { method: "PUT", headers: authH() });

// GET /api/admin/top-items → List<TopItemDTO> { itemName, quantity, salesCount, revenue }
export const getTopItems = () => req("/api/admin/top-items", { headers: authH() });

// GET /api/admin/category-revenue → List<CategoryRevenueDTO> { category, revenue }
export const getCategoryRevenue = () => req("/api/admin/category-revenue", { headers: authH() });

// ── KITCHEN  /api/kitchen ───────────────────────────────────────────────────
// GET /api/kitchen/orders → List<KitchenOrderDTO> { orderId, dailyOrderNumber, orderType, orderStatus, totalAmount }
export const getKitchenOrders = () => req("/api/kitchen/orders", { headers: authH() });

// PUT /api/kitchen/orders/{id}/status?status=PREPARING
export const updateKitchenStatus = (id, status) =>
  req(`/api/kitchen/orders/${id}/status?status=${status}`, { method: "PUT", headers: authH() });

// ── SALES/REVENUE  /api/sales ───────────────────────────────────────────────
// GET /api/sales/today  → DailyRevenue
export const getSalesToday = () => req("/api/sales/today", { headers: authH() });

// GET /api/sales/week   → List<DailyRevenue>
export const getSalesWeek = () => req("/api/sales/week", { headers: authH() });

// GET /api/sales/month  → List<DailyRevenue>
export const getSalesMonth = () => req("/api/sales/month", { headers: authH() });

// GET /api/sales/top-items → List<TopItemDTO>
export const getSalesTopItems = () => req("/api/sales/top-items", { headers: authH() });

// GET /api/sales/categories → List<CategoryRevenueDTO>
export const getSalesCategories = () => req("/api/sales/categories", { headers: authH() });

// ── MENU  /api/menu ─────────────────────────────────────────────────────────
// GET /api/menu → List<Menu> { menuId, itemName, description, price, category, available, imagePath }
export const getAllMenus = () => req("/api/menu", { headers: authH() });

// POST /api/menu  body: MenuDto { itemName, description, price, category, available, imagePath }
export const addMenu = (dto) => req("/api/menu", { method: "POST", headers: authH(), body: JSON.stringify(dto) });

// PUT /api/menu/{id}
export const updateMenu = (id, dto) => req(`/api/menu/${id}`, { method: "PUT", headers: authH(), body: JSON.stringify(dto) });

// DELETE /api/menu/{id}
export const deleteMenu = (id) => req(`/api/menu/${id}`, { method: "DELETE", headers: authH() });

// PUT /api/menu/availability/{itemName}/{available}
export const toggleAvailability = (itemName, available) =>
  req(`/api/menu/availability/${encodeURIComponent(itemName)}/${available}`, { method: "PUT", headers: authH() });

// GET /api/menu/available  (public - customer page)
export const getAvailableMenus = () => req("/api/menu/available");

// ── INVENTORY  /api/inventory ───────────────────────────────────────────────
// GET /api/inventory → ApiResponses<List<InventoryResponseDto>>
export const getAllInventory = async () => {
  const res = await req("/api/inventory", { headers: authH() });
  return res?.data ?? res;
};

// POST /api/inventory  body: InventoryRequestDto
export const createInventory = async (dto) => {
  const res = await req("/api/inventory", { method: "POST", headers: authH(), body: JSON.stringify(dto) });
  return res?.data ?? res;
};

// PUT /api/inventory/{id}
export const updateInventory = async (id, dto) => {
  const res = await req(`/api/inventory/${id}`, { method: "PUT", headers: authH(), body: JSON.stringify(dto) });
  return res?.data ?? res;
};

// DELETE /api/inventory/{id}
export const deleteInventory = (id) => req(`/api/inventory/${id}`, { method: "DELETE", headers: authH() });

// GET /api/dashboard/inventory/summary → ApiResponses<List<DashboardSummaryDto>>
export const getInventorySummary = async () => {
  const res = await req("/api/dashboard/inventory/summary", { headers: authH() });
  return res?.data ?? res;
};