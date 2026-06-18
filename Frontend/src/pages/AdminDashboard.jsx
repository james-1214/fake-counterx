import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import StatusBadge from '../components/StatusBadge';
import { useToast } from '../context/ToastContext';
import { useNavigate } from "react-router-dom";

// import {
//   dashboardSummary, ordersData, inventoryData,
//   dailySales, monthlySales, yearlySales, adminMenuItems,
// } from '../data/adminData';
//  import {
//   getDashboardSummary,
//   getOrders,
//   getInventory,
//   getMenuItems
// } from "../api/adminapi"; 

import {
  getDashboardToday,
  getDashboardWeek,

  getAdminOrders,
  updateAdminOrderStatus,

  getTopItems,
  getCategoryRevenue,

  getKitchenOrders,
  updateKitchenStatus,

  getSalesToday,
  getSalesWeek,
  getSalesMonth,
  getSalesTopItems,
  getSalesCategories,

  getAllMenus,
  addMenu,
  updateMenu,
  deleteMenu,
  toggleAvailability,

  getAllInventory,
  createInventory,
  updateInventory,
  deleteInventory,
  getInventorySummary,

  logoutAdmin,
  getStoredUser
} from "../api/adminapi";
import styles from '../styles/AdminDashboard.module.css';



// ── Mini Bar Chart (pure SVG, zero deps) ─────────────────────────────────────
// function BarChart({ data, valueKey, labelKey, color = 'var(--primary)' }) {
//   const max = Math.max(...data.map(d => d[valueKey]), 1);
//   const W = 460, H = 110, PAD = 24;
//   const barW = Math.min(30, (W - PAD * 2) / data.length - 6);
//   const toX = i => PAD + i * ((W - PAD * 2) / (data.length - 1 || 1));
//   return (
//     <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: '110px' }}>
//       {data.map((d, i) => {
//         const bh = ((d[valueKey] / max) * (H - PAD * 2));
//         const bx = toX(i) - barW / 2;
//         return (
//           <g key={i}>
//             <rect x={bx} y={H - PAD - bh} width={barW} height={bh} rx="4" fill={color} opacity="0.82" />
//             <text x={toX(i)} y={H - 4} textAnchor="middle" fontSize="9" fill="var(--muted)">{d[labelKey]}</text>
//           </g>
//         );
//       })}
//     </svg>
//   );
// }

function BarChart({
  data = [],
  valueKey,
  labelKey,
  color = 'var(--primary)'
}) {
  const safeData = Array.isArray(data) ? data : [];

  if (safeData.length === 0) {
    return (
      <div
        style={{
          height: '110px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0.6
        }}
      >
        No data available
      </div>
    );
  }

  const max = Math.max(
    ...safeData.map(d => Number(d[valueKey] || 0)),
    1
  );

  const W = 460;
  const H = 110;
  const PAD = 24;

  const barW = Math.min(
    30,
    (W - PAD * 2) / safeData.length - 6
  );

  const toX = i =>
    PAD +
    i * ((W - PAD * 2) / Math.max(safeData.length - 1, 1));

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{
        width: '100%',
        height: '110px'
      }}
    >
      {safeData.map((d, i) => {
        const value = Number(d[valueKey] || 0);

        const bh =
          (value / max) *
          (H - PAD * 2);

        const bx = toX(i) - barW / 2;

        return (
          <g key={i}>
            <rect
              x={bx}
              y={H - PAD - bh}
              width={barW}
              height={bh}
              rx="4"
              fill={color}
              opacity="0.82"
            />

            <text
              x={toX(i)}
              y={H - 4}
              textAnchor="middle"
              fontSize="9"
              fill="var(--muted)"
            >
              {d[labelKey] || '-'}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── DASHBOARD TAB ─────────────────────────────────────────────────────────────
function DashboardTab({ summary }) {
  summary = summary || {
    totalOrdersToday: 0,
    totalAmountToday: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    avgOrderValue: 0,
  };

  const fmt = n => n >= 1000 ? `₹${(n / 1000).toFixed(1)}k` : `₹${n}`;
  const cards = [
    { label: 'Total Orders Today', value: summary.totalOrdersToday, icon: '📋', grad: 'linear-gradient(135deg,#FF6B35,#FF8C5A)', sub: `${summary.completedOrders} completed` },
    { label: 'Total Amount Today', value: fmt(summary.totalAmountToday), icon: '💰', grad: 'linear-gradient(135deg,#2EC4B6,#4DD6CA)', sub: `Avg ₹${summary.avgOrderValue.toFixed(0)} / order` },
    { label: 'Pending Orders', value: summary.pendingOrders, icon: '⏳', grad: 'linear-gradient(135deg,#F59E0B,#FCD34D)', sub: 'Awaiting kitchen' },
    { label: 'Cancelled Today', value: summary.cancelledOrders, icon: '✕', grad: 'linear-gradient(135deg,#EF4444,#F87171)', sub: 'Review needed' },
  ];
  const hourly = [
    { h: '8AM', v: 3 }, { h: '9AM', v: 7 }, { h: '10AM', v: 12 }, { h: '11AM', v: 9 }, { h: '12PM', v: 18 },
    { h: '1PM', v: 22 }, { h: '2PM', v: 15 }, { h: '3PM', v: 8 }, { h: '4PM', v: 5 }, { h: '5PM', v: 11 }, { h: '6PM', v: 14 }, { h: '7PM', v: 19 },
  ];
  const revenue = [
    { h: '8AM', v: 821 }, { h: '9AM', v: 1245 }, { h: '10AM', v: 1820 }, { h: '11AM', v: 1050 }, { h: '12PM', v: 2100 },
    { h: '1PM', v: 2700 }, { h: '2PM', v: 1600 }, { h: '3PM', v: 900 }, { h: '4PM', v: 600 }, { h: '5PM', v: 1200 }, { h: '6PM', v: 1500 }, { h: '7PM', v: 2200 },
  ];
  const statusPct = [
    { status: 'completed', count: summary.completedOrders, color: 'var(--success)' },
    { status: 'preparing', count: 1, color: 'var(--primary)' },
    { status: 'pending', count: summary.pendingOrders, color: 'var(--warning)' },
    { status: 'cancelled', count: summary.cancelledOrders, color: 'var(--danger)' },
  ];
  return (
    <div className={styles.dashContent}>
      <div className={styles.heroGrid}>
        {cards.map((c, i) => (
          <div key={i} className={styles.heroCard} style={{ '--hg': c.grad }}>
            <div className={styles.heroIcon}>{c.icon}</div>
            <div className={styles.heroVal}>{c.value}</div>
            <div className={styles.heroLabel}>{c.label}</div>
            <div className={styles.heroSub}>{c.sub}</div>
          </div>
        ))}
      </div>
      <div className={styles.chartRow}>
        <div className={styles.chartCard}>
          <div className={styles.chartHead}><span className={styles.chartTitle}>📊 Hourly Orders — Today</span></div>
          <BarChart data={hourly} valueKey="v" labelKey="h" color="var(--primary)" />
        </div>
        <div className={styles.chartCard}>
          <div className={styles.chartHead}><span className={styles.chartTitle}>💹 Revenue Today (₹)</span></div>
          <BarChart data={revenue} valueKey="v" labelKey="h" color="var(--secondary)" />
        </div>
      </div>
      <div className={styles.statusRow}>
        {statusPct.map((s, i) => (
          <div key={i} className={styles.statusTile}>
            <StatusBadge status={s.status} />
            <div className={styles.statusCount}>{s.count}</div>
            <div className={styles.statusBar}>
              <div className={styles.statusFill} style={{
                width: `${Math.round(
                  (s.count / Math.max(summary.totalOrdersToday, 1)) * 100
                )}%`, background: s.color
              }} />
            </div>
            <div className={styles.statusPct}>{Math.round(
              (s.count / Math.max(summary.totalOrdersToday, 1)) * 100
            )}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── ORDER MANAGEMENT TAB ──────────────────────────────────────────────────────
function OrdersTab({ orders, onStatusChange }) {
  const [filter, setFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [search, setSearch] = useState('');
  const filtered = orders.filter(o => {
    if (filter !== 'all' && o.order_status !== filter) return false;
    if (typeFilter !== 'all' && o.order_type !== typeFilter) return false;
    if (search && !o.order_id.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  const fmtDate = dt => new Date(dt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  return (
    <div>
      <div className={styles.filterBar}>
        <input className={styles.searchInput} placeholder="🔍  Search Order ID…" value={search} onChange={e => setSearch(e.target.value)} />
        <div className={styles.filterGroup}>
          {['all', 'pending', 'preparing', 'ready', 'completed', 'cancelled'].map(s => (
            <button key={s} className={`${styles.filterBtn} ${filter === s ? styles.filterActive : ''}`} onClick={() => setFilter(s)}>
              {s === 'all' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        <div className={styles.filterGroup}>
          {['all', 'Dine In', 'Take Away'].map(t => (
            <button key={t} className={`${styles.filterBtn} ${typeFilter === t ? styles.filterActive : ''}`} onClick={() => setTypeFilter(t)}>
              {t === 'all' ? 'All Types' : t}
            </button>
          ))}
        </div>
      </div>
      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <h2 className={styles.tableTitle}>Order Management</h2>
          <span className={styles.tableCount}>{filtered.length} orders</span>
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr>
              <th>Order ID</th><th>#</th><th>Date & Time</th><th>Status</th>
              <th>Type</th><th>Payment Status</th><th>Payment Type</th><th>Amount</th><th>Action</th>
            </tr></thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o.order_id}>
                  <td className={styles.orderId}>{o.orderId}</td>
                  <td><span className={styles.dailyNo}>#{o.dailyOrderNumber}</span></td>
                  <td className={styles.time}>{fmtDate(o.order_datetime)}</td>
                  <td><StatusBadge status={o.orderStatus} /></td>
                  <td><span className={`${styles.typePill} ${o.order_type === 'Dine In' ? styles.dineIn : styles.takeAway}`}>{o.order_type === 'Dine In' ? '🍽️' : '📦'} {o.order_type}</span></td>
                  <td><span className={`${styles.payStatus} ${styles[o.payment_status]}`}>{o.payment_status === 'paid' ? '✓' : o.payment_status === 'refunded' ? '↩' : '⏳'} {o.payment_status}</span></td>
                  <td><span className={styles.payType}>{o.payment_type}</span></td>
                  {/* <td className={styles.total}>₹{o.order_amount.toFixed(2)}</td> */}
                  <td>₹{Number(o.totalAmount || 0).toFixed(2)}</td>
                  <td>
                    <select className={styles.statusSelect} value={o.order_status} onChange={e => onStatusChange(o.orderId, e.target.value)}>
                      {['pending', 'preparing', 'ready', 'completed', 'cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── INVENTORY TAB ─────────────────────────────────────────────────────────────
function InventoryTab({ items }) {
  const [catFilter, setCatFilter] = useState('all');
  const cats = ['all', ...new Set(items.map(i => i.category))];
  const filtered = catFilter === 'all' ? items : items.filter(i => i.category === catFilter);
  const fmtDate = dt => new Date(dt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' });
  const stockLevel = s => s <= 5 ? 'critical' : s <= 15 ? 'low' : 'ok';

  // const handleAddInventory = async (item) => {
  //   try {
  //     await createInventory(item);

  //     const updated = await getAllInventory();
  //     setInventory(updated);

  //     addToast("Inventory added", "success");
  //   } catch (err) {
  //     addToast("Failed to add inventory", "error");
  //   }
  // };

  const handleAddInventory = async () => {
    try {
      await createInventory({
        itemName: form.itemName,
        category: form.category,
        unitType: form.unitType,
        pricePerUnit: Number(form.pricePerUnit),
        availableStock: Number(form.availableStock),
      });

      const updated = await getAllInventory();

      setInventory(updated);

      setShowForm(false);

      addToast("Inventory added", "success");
    } catch (err) {
      console.error(err);
      addToast("Failed to add inventory", "error");
    }
  };

  const handleEditClick = (item) => {
    setIsEditing(true);

    setEditId(item.inventoryId);

    setForm({
      itemName: item.itemName,
      category: item.category,
      unitType: item.unitType,
      pricePerUnit: item.pricePerUnit,
      availableStock: item.availableStock,
    });

    setShowForm(true);
  };


  // const handleUpdateInventory = async (id, item) => {
  //   try {
  //     await updateInventory(id, item);

  //     const updated = await getAllInventory();
  //     setInventory(updated);

  //     addToast("Inventory updated", "success");
  //   } catch (err) {
  //     addToast("Failed to update inventory", "error");
  //   }
  // };


  const handleUpdateInventory = async () => {
    try {
      await updateInventory(editId, {
        itemName: form.itemName,
        category: form.category,
        unitType: form.unitType,
        pricePerUnit: Number(form.pricePerUnit),
        availableStock: Number(form.availableStock),
      });

      const updated = await getAllInventory();

      setInventory(updated);

      setShowForm(false);

      addToast("Inventory updated", "success");
    } catch (err) {
      console.error(err);
      addToast("Update failed", "error");
    }
  };


  const handleDeleteInventory = async (id) => {
    try {
      await deleteInventory(id);

      const updated = await getAllInventory();
      setInventory(updated);

      addToast("Inventory deleted", "success");
    } catch (err) {
      addToast("Failed to delete inventory", "error");
    }
  };


  const { addToast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    itemName: "",
    category: "DRINKS",
    unitType: "",
    pricePerUnit: "",
    availableStock: "",
  });

  return (
    <div>
      <div className={styles.filterBar}>
        <div className={styles.filterGroup}>
          {cats.map(c => (
            <button key={c} className={`${styles.filterBtn} ${catFilter === c ? styles.filterActive : ''}`} onClick={() => setCatFilter(c)}>
              {c === 'all' ? 'All Categories' : c}
            </button>
          ))}
        </div>
      </div>
      <div className={styles.tableCard}>
        {/* <div className={styles.tableHeader}>
          <h2 className={styles.tableTitle}>Inventory Dashboard</h2>
          <span className={styles.tableCount}>{filtered.length} items</span>
        </div> */}
        <div className={styles.tableHeader}>
          <h2 className={styles.tableTitle}>Inventory Dashboard</h2>

          <div style={{ display: "flex", gap: "10px" }}>
            <span className={styles.tableCount}>
              {filtered.length} items
            </span>

            <button
              className={styles.addBtn}
              onClick={() => {
                setShowForm(true);
                setIsEditing(false);
              }}
            >
              + Add Inventory
            </button>
          </div>
        </div>
        {showForm && (
          <div className={styles.modalOverlay}>
            <div className={styles.addForm}>

              <h3>
                {isEditing ? "Edit Inventory" : "Add Inventory"}
              </h3>

              <input
                placeholder="Item Name"
                value={form.itemName}
                onChange={(e) =>
                  setForm({ ...form, itemName: e.target.value })
                }
              />

              <select
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value })
                }
              >
                <option value="BREAKFAST">BREAKFAST</option>
                <option value="SNACKS">SNACKS</option>
                <option value="DRINKS">DRINKS</option>
                <option value="MEALS">MEALS</option>
                <option value="DESSERT">DESSERT</option>
              </select>

              <input
                placeholder="Unit Type"
                value={form.unitType}
                onChange={(e) =>
                  setForm({ ...form, unitType: e.target.value })
                }
              />

              <input
                type="number"
                placeholder="Price"
                value={form.pricePerUnit}
                onChange={(e) =>
                  setForm({ ...form, pricePerUnit: e.target.value })
                }
              />

              <input
                type="number"
                placeholder="Stock"
                value={form.availableStock}
                onChange={(e) =>
                  setForm({ ...form, availableStock: e.target.value })
                }
              />

              <button
                className={styles.submitBtn}
                onClick={
                  isEditing
                    ? handleUpdateInventory
                    : handleAddInventory
                }
              >
                {isEditing ? "💾 Update" : "✓ Add"}
              </button>

            </div>
          </div>
        )}
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr>
              <th>Inventory ID</th><th>Item Name</th><th>Category</th><th>Unit</th>
              <th>Price/Unit</th><th>Available Stock</th><th>Received Date</th>
              <th>Created At</th><th>Created By</th><th>Updated At</th><th>Updated By</th><th>Status</th><th>Actions</th>
            </tr></thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.inventory_id}>
                  <td className={styles.orderId}>{item.inventory_id}</td>
                  <td className={styles.itemName}>{item.item_name}</td>
                  <td><span className={styles.catBadge}>{item.category}</span></td>
                  <td className={styles.muted}>{item.unit_type}</td>
                  <td className={styles.total}>₹{item.price_per_unit}</td>
                  <td>
                    <div className={styles.stockWrap}>
                      <span className={`${styles.stockVal} ${styles[stockLevel(item.available_stock)]}`}>
                        {item.available_stock} {item.unit_type}
                      </span>
                      {stockLevel(item.available_stock) === 'critical' && <span className={styles.stockAlert}>⚠ Critical</span>}
                      {stockLevel(item.available_stock) === 'low' && <span className={styles.stockWarn}>↓ Low</span>}
                    </div>
                  </td>
                  <td className={styles.time}>{fmtDate(item.received_date)}</td>
                  <td className={styles.time}>{fmtDate(item.created_at)}</td>
                  <td className={styles.muted}>{item.created_by}</td>
                  <td className={styles.time}>{fmtDate(item.updated_at)}</td>
                  <td className={styles.muted}>{item.updated_by}</td>
                  <td><span className={`${styles.statusDot} ${item.deleted ? styles.deleted : styles.active}`}>{item.deleted ? '● Deleted' : '● Active'}</span></td>
                  <td>
                    <div style={{ display: "flex", gap: "8px" }}>

                      <button
                        className={styles.editBtn}
                        onClick={() => handleEditClick(item)}
                      >
                        ✏ Edit
                      </button>

                      <button
                        className={styles.deleteBtn}
                        onClick={() =>
                          handleDeleteInventory(item.inventoryId)
                        }
                      >
                        🗑 Delete
                      </button>

                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── SALES TAB ─────────────────────────────────────────────────────────────────
// function SalesTab() {
//   const [period, setPeriod] = useState('daily');
//   const datasets = { daily: dailySales, monthly: monthlySales, yearly: yearlySales };
//   const data = datasets[period];
//   const totalRevenue = data.reduce((s,d)=>s+d.revenue,0);
//   const totalOrders  = data.reduce((s,d)=>s+d.orders,0);
//   const avgOrder = totalOrders>0?(totalRevenue/totalOrders).toFixed(0):0;
//   const fmtMoney = n => n>=100000?`₹${(n/100000).toFixed(1)}L`:n>=1000?`₹${(n/1000).toFixed(1)}k`:`₹${n}`;
//   return (
//     <div className={styles.dashContent}>
//       <div className={styles.periodFilter}>
//         {[['daily','📅 Day Wise'],['monthly','📆 Monthly'],['yearly','📊 Yearly']].map(([k,l])=>(
//           <button key={k} className={`${styles.periodBtn} ${period===k?styles.periodActive:''}`} onClick={()=>setPeriod(k)}>{l}</button>
//         ))}
//       </div>
//       <div className={styles.salesKpi}>
//         <div className={styles.kpiCard}><div className={styles.kpiIcon}>💰</div><div className={styles.kpiVal}>{fmtMoney(totalRevenue)}</div><div className={styles.kpiLabel}>Total Revenue</div></div>
//         <div className={styles.kpiCard}><div className={styles.kpiIcon}>📋</div><div className={styles.kpiVal}>{totalOrders.toLocaleString()}</div><div className={styles.kpiLabel}>Total Orders</div></div>
//         <div className={styles.kpiCard}><div className={styles.kpiIcon}>📈</div><div className={styles.kpiVal}>₹{Number(avgOrder).toLocaleString()}</div><div className={styles.kpiLabel}>Avg Order Value</div></div>
//       </div>
//       <div className={styles.chartRow}>
//         <div className={styles.chartCard} style={{flex:2}}>
//           <div className={styles.chartHead}><span className={styles.chartTitle}>💰 Revenue ({period})</span></div>
//           <BarChart data={data} valueKey="revenue" labelKey="label" color="var(--primary)" />
//         </div>
//         <div className={styles.chartCard} style={{flex:1}}>
//           <div className={styles.chartHead}><span className={styles.chartTitle}>📋 Orders ({period})</span></div>
//           <BarChart data={data} valueKey="orders" labelKey="label" color="var(--secondary)" />
//         </div>
//       </div>
//       <div className={styles.tableCard}>
//         <div className={styles.tableHeader}>
//           <h2 className={styles.tableTitle}>Sales Breakdown</h2>
//           <span className={styles.tableCount}>{period}</span>
//         </div>
//         <div className={styles.tableWrap}>
//           <table className={styles.table}>
//             <thead><tr><th>Period</th><th>Revenue</th><th>Orders</th><th>Avg Value</th><th>Revenue Bar</th></tr></thead>
//             <tbody>
//               {data.map((d,i)=>(
//                 <tr key={i}>
//                   <td className={styles.itemName}>{d.label}</td>
//                   <td className={styles.total}>{fmtMoney(d.revenue)}</td>
//                   <td>{d.orders}</td>
//                   <td>₹{Math.round(d.revenue/d.orders)}</td>
//                   <td><div className={styles.barWrap}><div className={styles.bar} style={{width:`${(d.revenue/Math.max(...data.map(x=>x.revenue)))*100}%`}}/></div></td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }
function SalesTab({ salesToday, salesWeekData, salesMonthData }) {
  const [period, setPeriod] = useState('daily');

  const datasets = {
    daily: Array.isArray(salesToday) ? salesToday : [],
    monthly: Array.isArray(salesMonthData) ? salesMonthData : [],
    yearly: Array.isArray(salesWeekData) ? salesWeekData : [],
  };

  const data = datasets[period] || [];

  const totalRevenue = data.reduce(
    (s, d) => s + (d.revenue || 0),
    0
  );

  const totalOrders = data.reduce(
    (s, d) => s + (d.orders || 0),
    0
  );

  const avgOrder =
    totalOrders > 0
      ? (totalRevenue / totalOrders).toFixed(0)
      : 0;

  const fmtMoney = n =>
    n >= 100000
      ? `₹${(n / 100000).toFixed(1)}L`
      : n >= 1000
        ? `₹${(n / 1000).toFixed(1)}k`
        : `₹${n}`;

  return (
    <div className={styles.dashContent}>
      <div className={styles.periodFilter}>
        {[
          ['daily', '📅 Day Wise'],
          ['monthly', '📆 Monthly'],
          ['yearly', '📊 Yearly']
        ].map(([k, l]) => (
          <button
            key={k}
            className={`${styles.periodBtn} ${period === k ? styles.periodActive : ''
              }`}
            onClick={() => setPeriod(k)}
          >
            {l}
          </button>
        ))}
      </div>

      <div className={styles.salesKpi}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon}>💰</div>
          <div className={styles.kpiVal}>{fmtMoney(totalRevenue)}</div>
          <div className={styles.kpiLabel}>Total Revenue</div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon}>📋</div>
          <div className={styles.kpiVal}>
            {totalOrders.toLocaleString()}
          </div>
          <div className={styles.kpiLabel}>Total Orders</div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon}>📈</div>
          <div className={styles.kpiVal}>
            ₹{Number(avgOrder).toLocaleString()}
          </div>
          <div className={styles.kpiLabel}>Avg Order Value</div>
        </div>
      </div>

      <div className={styles.chartRow}>
        <div className={styles.chartCard} style={{ flex: 2 }}>
          <div className={styles.chartHead}>
            <span className={styles.chartTitle}>
              💰 Revenue ({period})
            </span>
          </div>

          <BarChart
            data={data}
            valueKey="revenue"
            labelKey="label"
            color="var(--primary)"
          />
        </div>

        <div className={styles.chartCard} style={{ flex: 1 }}>
          <div className={styles.chartHead}>
            <span className={styles.chartTitle}>
              📋 Orders ({period})
            </span>
          </div>

          <BarChart
            data={data}
            valueKey="orders"
            labelKey="label"
            color="var(--secondary)"
          />
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <h2 className={styles.tableTitle}>Sales Breakdown</h2>
          <span className={styles.tableCount}>{period}</span>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Period</th>
                <th>Revenue</th>
                <th>Orders</th>
                <th>Avg Value</th>
                <th>Revenue Bar</th>
              </tr>
            </thead>

            <tbody>
              {data.map((d, i) => (
                <tr key={i}>
                  <td className={styles.itemName}>
                    {d.label || d.date || d.month || '-'}
                  </td>

                  <td className={styles.total}>
                    {fmtMoney(d.revenue || 0)}
                  </td>

                  <td>{d.orders || 0}</td>

                  <td>
                    ₹
                    {Math.round(
                      (d.revenue || 0) /
                      Math.max(d.orders || 1, 1)
                    )}
                  </td>

                  <td>
                    <div className={styles.barWrap}>
                      <div
                        className={styles.bar}
                        style={{
                          width: `${((d.revenue || 0) /
                            Math.max(
                              ...data.map(
                                x => x.revenue || 0
                              ),
                              1
                            )) *
                            100
                            }%`
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
// ── MENU TAB ──────────────────────────────────────────────────────────────────
function MenuTab({ menuItems, setMenuItems }) {
  const { addToast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  // const [form, setForm] = useState({ name: '', category: 'Breakfast', price: '', description: '', veg: true, image: '' });
  const [form, setForm] = useState({
    name: '',
    category: 'BREAKFAST',
    price: '',
    description: '',
    veg: true,
    image: ''
  });

  const cats = ['BREAKFAST',
    'SNACKS',
    'DRINKS',
    'MEALS',
    'DESSERT'];
  // const handleToggle = id => {
  //   setMenuItems(prev=>prev.map(m=>m.id===id?{...m,available:!m.available}:m));
  //   const item = menuItems.find(m=>m.id===id);
  //   addToast(`${item.name} marked as ${item.available?'unavailable':'available'}`, 'info');
  // };
  // const handleDelete = id => {
  //   const item = menuItems.find(m=>m.id===id);
  //   setMenuItems(prev=>prev.filter(m=>m.id!==id));
  //   addToast(`${item.name} removed from menu`, 'error');
  // };
  // const handleAdd = () => {
  //   if (!form.name||!form.price){addToast('Name and price are required','error');return;}
  //   const newItem = {...form,id:`m${Date.now()}`,price:parseFloat(form.price),available:true};
  //   setMenuItems(prev=>[...prev,newItem]);
  //   setForm({name:'',category:'Breakfast',price:'',description:'',veg:true,image:''});
  //   setShowForm(false);
  //   addToast(`${newItem.name} added!`, 'success');
  // };

  const handleEdit = (item) => {
    setForm({
      name: item.itemName || '',
      category: item.category || 'BREAKFAST',
      price: item.price || '',
      description: item.description || '',
      veg: true,
      image: item.imagePath || ''
    });

    setEditingId(item.menuId);
    setIsEditing(true);
    setShowForm(true);
  };

  //   const handleAdd = async () => {
  // if (!form.name || !form.price) {
  // addToast('Name and price are required', 'error');
  // return;
  // }

  // try {
  // await addMenu({
  // itemName: form.name,
  // description: form.description,
  // price: parseFloat(form.price),
  // category: form.category,
  // available: true,
  // imagePath: form.image
  // });

  // const menus = await getAllMenus();

  // setMenuItems(menus);

  // setForm({
  //   name: '',
  //   category: 'Breakfast',
  //   price: '',
  //   description: '',
  //   veg: true,
  //   image: ''
  // });

  // setShowForm(false);

  // addToast(`${form.name} added!`, 'success');

  // } catch (err) {
  // console.error(err);
  // addToast('Failed to add menu item', 'error');
  // }
  // };
  const handleAdd = async () => {
    if (!form.name || !form.price) {
      addToast('Name and price are required', 'error');
      return;
    }

    try {
      const payload = {
        itemName: form.name,
        description: form.description,
        price: parseFloat(form.price),
        category: form.category,
        available: true,
        imagePath: form.image
      };

      if (isEditing) {
        await updateMenu(editingId, payload);

        addToast(
          `${form.name} updated successfully`,
          'success'
        );
      } else {
        await addMenu(payload);

        addToast(
          `${form.name} added successfully`,
          'success'
        );
      }

      const menus = await getAllMenus();

      setMenuItems(menus);

      setForm({
        name: '',
        category: 'BREAKFAST',
        price: '',
        description: '',
        veg: true,
        image: ''
      });

      setEditingId(null);
      setIsEditing(false);
      setShowForm(false);

    } catch (err) {
      console.error(err);
      addToast(
        isEditing
          ? 'Failed to update menu item'
          : 'Failed to add menu item',
        'error'
      );
    }
  };
  const handleDelete = async (menuId) => {
    try {
      const item = menuItems.find(
        m => m.menuId === menuId
      );

      await deleteMenu(menuId);

      const menus = await getAllMenus();

      setMenuItems(menus);

      addToast(
        `${item?.itemName || 'Menu Item'} removed from menu`,
        'error'
      );

    } catch (err) {
      console.error(err);
      addToast('Delete failed', 'error');
    }
  };

  const handleToggle = async (item) => {
    try {
      await toggleAvailability(
        item.itemName,
        !item.available
      );

      const menus = await getAllMenus();

      setMenuItems(menus);

      addToast(
        `${item.itemName} marked as ${item.available
          ? 'unavailable'
          : 'available'
        }`,
        'info'
      );

    } catch (err) {
      console.error(err);
      addToast('Update failed', 'error');
    }
  };

  //   const handleAdd = async () => {
  // try {
  // console.log("Sending menu item:", {
  // itemName: form.name,
  // description: form.description,
  // price: Number(form.price),
  // category: form.category,
  // available: true,
  // imagePath: form.image
  // });

  // ```
  // const response = await addMenu({
  //   itemName: form.name,
  //   description: form.description,
  //   price: Number(form.price),
  //   category: form.category,
  //   available: true,
  //   imagePath: form.image
  // });

  // console.log("Add Menu Response:", response);

  // const menus = await getAllMenus();

  // console.log("Menus after refresh:", menus);

  // setMenuItems(menus);

  // setForm({
  //   name: '',
  //   category: 'Breakfast',
  //   price: '',
  //   description: '',
  //   veg: true,
  //   image: ''
  // });

  // setShowForm(false);

  // addToast("Menu item added", "success");
  // ```

  // } catch (err) {
  // console.error("ADD MENU ERROR:", err);
  // addToast("Failed to add menu", "error");
  // }
  // };


  //   const handleDelete = async (id) => {
  //     try {
  //       await deleteMenu(id);

  //       const menus = await getAllMenus();
  //       setMenuItems(menus);

  //       addToast("Menu item deleted", "success");
  //     } catch (err) {
  //       addToast("Delete failed", "error");
  //     }
  //   };

  //   const handleToggle = async (item) => {
  //     try {
  //       await toggleAvailability(
  //         item.itemName,
  //         !item.available
  //       );

  //       const menus = await getAllMenus();
  //       setMenuItems(menus);

  //       addToast("Availability updated", "success");
  //     } catch (err) {
  //       addToast("Update failed", "error");
  //     }
  //   };

  return (
    <div className={styles.dashContent}>
      <div className={styles.menuTopBar}>
        <span className={styles.chartTitle}>🍽️ Menu Items ({menuItems.length})</span>
        <button className={styles.addBtn} onClick={() => setShowForm(v => !v)}>{showForm ? '✕ Cancel' : '+ Add Item'}</button>
      </div>
      {showForm && (
        <div
          className={styles.modalOverlay}
          onClick={() => {
            setShowForm(false);
            setIsEditing(false);
            setEditingId(null);
          }}
        >
          <div
            className={styles.addForm}
            onClick={(e) => e.stopPropagation()}
          >
            {/* <h3 className={styles.formTitle}>Add New Menu Item</h3> */}
            <h3 className={styles.formTitle}>
              {isEditing
                ? 'Edit Menu Item'
                : 'Add New Menu Item'}
            </h3>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}><label>Item Name *</label><input className={styles.formInput} placeholder="e.g. Paneer Butter Masala" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div className={styles.formGroup}><label>Category</label><select className={styles.formInput} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>{cats.map(c => <option key={c}>{c}</option>)}</select></div>
              <div className={styles.formGroup}><label>Price (₹) *</label><input className={styles.formInput} type="number" placeholder="0" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} /></div>
              <div className={styles.formGroup}><label>Type</label><select className={styles.formInput} value={form.veg ? 'veg' : 'non-veg'} onChange={e => setForm({ ...form, veg: e.target.value === 'veg' })}><option value="veg">🟢 Veg</option><option value="non-veg">🔴 Non-Veg</option></select></div>
              <div className={styles.formGroup} style={{ gridColumn: '1/-1' }}><label>Image URL</label><input className={styles.formInput} placeholder="https://..." value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} /></div>
              <div className={styles.formGroup} style={{ gridColumn: '1/-1' }}><label>Description</label><input className={styles.formInput} placeholder="Short description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
            </div>
            {/* <button className={styles.submitBtn} onClick={handleAdd}>✓ Add to Menu</button> */}
            <button
              className={styles.submitBtn}
              onClick={handleAdd}
            >
              {isEditing
                ? '💾 Update Item'
                : '✓ Add to Menu'}
            </button>
          </div>
        </div>
      )}
      <div className={styles.menuGrid}>
        {menuItems.map(item => (
          <div key={item.menuId} className={`${styles.menuCard} ${!item.available ? styles.menuUnavailable : ''}`}>
            {item.imagePath && (
              <img
                src={item.imagePath}
                alt={item.itemName}
                className={styles.menuImg}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            )}
            {/* {item.image && <img src={item.image} alt={item.name} className={styles.menuImg} onError={e => { e.target.style.display = 'none'; }} />} */}
            <div className={styles.menuBody}>
              <div className={styles.menuTop}>
                <span className={styles.menuName}>{item.itemName}</span>
                <span>{item.veg ? '🔴' : '🟢'}</span>
              </div>
              <span className={styles.menuCat}>{item.category}</span>
              <div className={styles.menuPrice}>₹{item.price}</div>
              {item.description && <p className={styles.menuDesc}>{item.description}</p>}
              <div className={styles.menuActions}>
                <label className={styles.toggle}>
                  <input
                    type="checkbox"
                    checked={item.available}
                    onChange={() => handleToggle(item)}
                  />
                  {/* <input type="checkbox" checked={item.available} onChange={() => handleToggle(item.id)} /> */}
                  <span className={styles.slider} />
                  <span className={styles.toggleLabel}>{item.available ? 'Available' : 'Unavailable'}</span>
                </label>
                {/* <button
  className={styles.deleteBtn}
  onClick={() => handleDelete(item.menuId)}
>🗑 Delete</button> */}
                <div className={styles.menuButtons}>
                  <button
                    className={styles.editBtn}
                    onClick={() => handleEdit(item)}
                  >
                    ✏️ Edit
                  </button>

                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(item.menuId)}
                  >
                    🗑 Delete
                  </button>
                </div>
                {/* <button className={styles.deleteBtn} onClick={() => handleDelete(item.id)}>🗑 Delete</button> */}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── KITCHEN DISPLAY TAB ───────────────────────────────────────────────────────
function KitchenTab({ orders, onStatusChange }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  const COLS = [
    { key: 'pending', label: 'New Orders', icon: '🔔', color: 'var(--warning)' },
    { key: 'preparing', label: 'Preparing', icon: '🔥', color: 'var(--primary)' },
    { key: 'ready', label: 'Ready', icon: '✅', color: 'var(--secondary)' },
    { key: 'completed', label: 'Completed', icon: '★', color: 'var(--success)' },
  ];
  const NEXT = { pending: 'preparing', preparing: 'ready', ready: 'completed' };
  const NEXT_LABEL = { preparing: '▶ Start', ready: '✓ Ready', completed: '★ Done' };
  const itemsMap = {
    'ORD-2024-001': [{ name: 'Poha', qty: 2 }, { name: 'Masala Chai', qty: 2 }],
    'ORD-2024-002': [{ name: 'Vada Pav', qty: 3 }, { name: 'Upma', qty: 1 }],
    'ORD-2024-003': [{ name: 'Upma', qty: 2 }, { name: 'Masala Chai', qty: 1 }],
    'ORD-2024-005': [{ name: 'Poha', qty: 1 }, { name: 'Vada Pav', qty: 1 }],
    'ORD-2024-006': [{ name: 'Upma', qty: 3 }],
    'ORD-2024-007': [{ name: 'Masala Chai', qty: 2 }, { name: 'Poha', qty: 1 }],
  };
  const elapsed = dt => { const diff = Math.floor((now - new Date(dt)) / 60000); return diff < 1 ? 'Just now' : diff === 1 ? '1 min ago' : `${diff} min ago`; };
  const activeOrders = orders.filter(o => o.order_status !== 'cancelled');
  return (
    <div className={styles.kitchenWrap}>
      <div className={styles.kitchenHeader}>
        <div className={styles.kitchenClock}>{now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
        <div className={styles.kitchenStats}>
          {COLS.slice(0, 3).map(col => (
            <div key={col.key} className={styles.kitchenStat}>
              <span className={styles.kitchenStatVal} style={{ color: col.color }}>{activeOrders.filter(o => o.order_status === col.key).length}</span>
              <span className={styles.kitchenStatLabel}>{col.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.kitchenBoard}>
        {COLS.map(col => {
          const colOrders = activeOrders.filter(o => o.order_status === col.key);
          return (
            <div key={col.key} className={styles.kitchenCol}>
              <div className={styles.kitchenColHead} style={{ '--kc': col.color }}>
                <span>{col.icon}</span><span>{col.label}</span>
                <span className={styles.kitchenColCount}>{colOrders.length}</span>
              </div>
              <div className={styles.kitchenCards}>
                {colOrders.length === 0 ? (
                  <div className={styles.kitchenEmpty}>No orders</div>
                ) : colOrders.map(o => (
                  <div key={o.order_id} className={styles.kitchenCard} style={{ '--ka': col.color }}>
                    <div className={styles.kitchenCardTop}>
                      <span className={styles.kitchenOrderId}>#{o.daily_order_no} — {o.order_id.slice(-3)}</span>
                      <span className={`${styles.typePill} ${o.order_type === 'Dine In' ? styles.dineIn : styles.takeAway}`} style={{ fontSize: '0.7rem' }}>
                        {o.order_type === 'Dine In' ? '🍽️' : '📦'} {o.order_type}
                      </span>
                    </div>
                    <div className={styles.kitchenItemList}>
                      {(itemsMap[o.order_id] || [{ name: 'Items', qty: o.items || 1 }]).map((item, i) => (
                        <div key={i} className={styles.kitchenItem}>
                          <span className={styles.kitchenQty}>×{item.qty}</span>
                          <span>{item.name}</span>
                        </div>
                      ))}
                    </div>
                    <div className={styles.kitchenCardBot}>
                      <span className={styles.kitchenElapsed}>{elapsed(o.order_datetime)}</span>
                      {NEXT[o.order_status] && (
                        <button className={styles.kitchenBtn} style={{ '--kb': col.color }}
                          onClick={() => onStatusChange(o.order_id, NEXT[o.order_status])}>
                          {NEXT_LABEL[NEXT[o.order_status]]}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
const TABS = [
  { key: 'dashboard', label: 'Dashboard', icon: '⊞' },
  { key: 'orders', label: 'Order Management', icon: '📋' },
  { key: 'inventory', label: 'Inventory', icon: '📦' },
  { key: 'sales', label: 'Sales', icon: '💹' },
  { key: 'menu', label: 'Menu', icon: '🍽️' },
  { key: 'kitchen', label: 'Kitchen Display', icon: '🍳' },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  // const [orders, setOrders] = useState(ordersData);
  // const [menuItems, setMenuItems] = useState(adminMenuItems);
  const { addToast } = useToast();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    getAdminOrders().then(setOrders);
  }, []);

  const [summary, setSummary] = useState({
    totalOrdersToday: 0,
    totalAmountToday: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    avgOrderValue: 0,
  });

  useEffect(() => {
    getDashboardToday()
      .then((data) => {
        setSummary({
          totalOrdersToday: data.totalOrders || 0,
          totalAmountToday: data.totalRevenue || 0,
          pendingOrders: data.pendingOrders || 0,
          completedOrders: data.completedOrders || 0,
          cancelledOrders: data.cancelledOrders || 0,
          avgOrderValue:
            data.totalOrders > 0
              ? data.totalRevenue / data.totalOrders
              : 0,
        });
      })
      .catch(console.error);
  }, []);


  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    getAllMenus()
      .then(setMenuItems)
      .catch(console.error);
  }, []);

  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      const data = await getAllInventory();
      setInventory(data);
    } catch (err) {
      console.error(err);
    }
  };

  const navigate = useNavigate();
  // const handleStatusChange = (id, status) => {
  //   setOrders(prev=>prev.map(o=>o.order_id===id?{...o, order_status:status}:o));
  //   addToast(`Order ${id} → ${status}`, 'success');
  // };

  const handleStatusChange = async (id, status) => {
    try {
      await updateAdminOrderStatus(id, status);

      const freshOrders = await getAdminOrders();
      setOrders(freshOrders);

      addToast(`Order ${id} updated`, "success");
    } catch (err) {
      console.error(err);
      addToast("Failed to update order", "error");
    }
  };

  const [salesToday, setSalesToday] = useState([]);
  const [salesWeekData, setSalesWeekData] = useState([]);
  const [salesMonthData, setSalesMonthData] = useState([]);

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    try {
      const today = await getSalesToday();
      const week = await getSalesWeek();
      const month = await getSalesMonth();

      setSalesToday(today || []);
      setSalesWeekData(week || []);
      setSalesMonthData(month || []);
    } catch (err) {
      console.error(err);
    }
  };

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const activeTabInfo = TABS.find(t => t.key === activeTab);

  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarBrand}>
          <div className={styles.sidebarLogo}>CX</div>
          <span className={styles.sidebarTitle}>CounterX</span>
        </div>
        <nav className={styles.sidebarNav}>
          {TABS.map(t => (
            <button key={t.key}
              className={`${styles.sidebarLink} ${activeTab === t.key ? styles.sidebarActive : ''}`}
              onClick={() => setActiveTab(t.key)}>
              <span className={styles.sidebarIcon}>{t.icon}</span>
              <span className={styles.sidebarLabel}>{t.label}</span>
            </button>
          ))}
        </nav>
        <div className={styles.sidebarFooter}>
          <div
            className={styles.profileSection}
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <div className={styles.sidebarAvatar}>A</div>

            <div>
              <div className={styles.sidebarName}>Admin</div>
              <div className={styles.sidebarRole}>Manager</div>
            </div>
          </div>

          {showProfileMenu && (
            <div className={styles.profileDropdown}>
              <button
                className={styles.logoutBtn}
                onClick={() => {
                  localStorage.removeItem("cx_token");
                  localStorage.removeItem("cx_user");
                  navigate("/welcome");
                }}
              >
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </aside>

      <div className={styles.main}>
        <header className={styles.topbar}>
          <div>
            <h1 className={styles.pageTitle}>{activeTabInfo?.icon} {activeTabInfo?.label}</h1>
            <p className={styles.pageDate}>{today}</p>
          </div>
          <div className={styles.topbarRight}>
            <div className={styles.onlineIndicator}><span className={styles.dot} /> Live</div>
            <div className={styles.avatar}>A</div>
          </div>
        </header>

        <div className={styles.content}>
          {activeTab === 'dashboard' && <DashboardTab summary={summary} />}
          {activeTab === 'orders' && <OrdersTab orders={orders} onStatusChange={handleStatusChange} />}
          {activeTab === 'inventory' && <InventoryTab items={inventory} />}
          {/* {activeTab==='sales'      && <SalesTab />} */}
          {activeTab === 'sales' && (
            <SalesTab
              salesToday={salesToday}
              salesWeekData={salesWeekData}
              salesMonthData={salesMonthData}
            />
          )}
          {activeTab === 'menu' && <MenuTab menuItems={menuItems} setMenuItems={setMenuItems} />}
          {activeTab === 'kitchen' && <KitchenTab orders={orders} onStatusChange={handleStatusChange} />}
        </div>
      </div>
    </div>
  );
}