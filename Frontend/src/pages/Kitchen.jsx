import { useState, useEffect } from 'react';
import { getKitchenOrders, updateKitchenOrderStatus } from '../api/kitchenapi';
import { getOrderItemsByOrderId } from '../api/orderApi';
import { useToast } from '../context/ToastContext';
import styles from '../styles/Kitchen.module.css';
import BrandLogo from '../components/BrandLogo';

// Status values must match the backend OrderStatus enum exactly.
// PENDING_PAYMENT and PLACED are collapsed into "PLACED" for the
// "New Orders" column — kitchen only cares about paid, placed orders.
const COLUMNS = [
  { key: 'PLACED',    label: 'New Orders', icon: '🔔', next: 'PREPARING' },
  { key: 'PREPARING', label: 'Preparing',  icon: '🔥', next: 'READY'     },
  { key: 'READY',     label: 'Ready',      icon: '✅', next: 'SERVED'     },
  { key: 'SERVED',    label: 'Served',     icon: '★',  next: null         },
];

const COLOR = {
  PLACED:    'var(--warning)',
  PREPARING: 'var(--primary)',
  READY:     'var(--secondary)',
  SERVED:    'var(--success)',
};

const ADVANCE_LABELS = {
  PREPARING: '▶ Start',
  READY:     '✓ Ready',
  SERVED:    '★ Served',
};

const TOAST_LABELS = {
  PREPARING: 'Now Preparing',
  READY:     'Ready to Serve!',
  SERVED:    'Order Served',
};

export default function Kitchen() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow]         = useState(new Date());
  const { addToast }          = useToast();

  useEffect(() => {
    loadOrders();
    const pollInterval  = setInterval(loadOrders, 30_000);
    const clockInterval = setInterval(() => setNow(new Date()), 1_000);
    return () => {
      clearInterval(pollInterval);
      clearInterval(clockInterval);
    };
  }, []);

  const loadOrders = async () => {
    try {
      // Use the dedicated KitchenController endpoint (GET /api/kitchen/orders)
      // which returns KitchenOrderDTO: { orderId, dailyOrderNumber, orderType,
      //                                   orderStatus, totalAmount }
      const raw = await getKitchenOrders();

      // Fetch items for each order in parallel
      const enriched = await Promise.all(
        raw.map(async (o) => {
          let items = [];
          try {
            const orderItems = await getOrderItemsByOrderId(o.orderId);
            items = (orderItems || []).map(i => ({
              name: i.itemName || 'Item',
              qty:  i.quantity  || 1,
            }));
          } catch {
            // If items fetch fails, show the order without items rather than crashing
          }

          return {
            // Normalise field names so the JSX below has a consistent shape
            id:     o.orderId,
            token:  o.dailyOrderNumber,
            status: o.orderStatus || 'PLACED',        // backend enum name
            type:   o.orderType  === 'DINE_IN' ? 'Dine In' : 'Take Away',
            amount: o.totalAmount,
            items,
            // KitchenOrderDTO has no timestamp — fall back gracefully
            createdAt: o.orderDateTime || null,
          };
        })
      );

      // Exclude PENDING_PAYMENT orders — payment not confirmed yet
      const visible = enriched.filter(
        o => o.status !== 'PENDING_PAYMENT' && o.status !== 'CANCELLED'
      );

      setOrders(visible);
    } catch (err) {
      console.error('Kitchen load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const advance = async (order, nextStatus) => {
    try {
      // PUT /api/kitchen/orders/{id}/status?status=PREPARING
      await updateKitchenOrderStatus(order.id, nextStatus);
      setOrders(prev =>
        prev.map(o =>
          o.id === order.id ? { ...o, status: nextStatus } : o
        )
      );
      addToast(
        `#${order.token || order.id} → ${TOAST_LABELS[nextStatus]}`,
        nextStatus === 'READY' ? 'success' : 'info'
      );
    } catch {
      addToast(`Failed to update order #${order.token || order.id}`, 'error');
    }
  };

  const getElapsed = (createdAt) => {
    if (!createdAt) return '—';
    const diff = Math.floor((now - new Date(createdAt)) / 60_000);
    if (diff < 1)  return 'Just now';
    if (diff === 1) return '1 min ago';
    return `${diff} mins ago`;
  };

  const pendingCount   = orders.filter(o => o.status === 'PLACED').length;
  const preparingCount = orders.filter(o => o.status === 'PREPARING').length;
  const readyCount     = orders.filter(o => o.status === 'READY').length;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <BrandLogo size={120} />
          <div>
            <div className={styles.title}>Kitchen Display</div>
            <div className={styles.subtitle}>Live Order Management</div>
          </div>
        </div>
        <div className={styles.clock}>
          {now.toLocaleTimeString('en-IN', {
            hour: '2-digit', minute: '2-digit', second: '2-digit',
          })}
        </div>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statVal}>{pendingCount}</span>
            <span className={styles.statLabel}>Pending</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statVal}>{preparingCount}</span>
            <span className={styles.statLabel}>Cooking</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statVal}>{readyCount}</span>
            <span className={styles.statLabel}>Ready</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className={styles.loadingWrap}>Loading orders…</div>
      ) : (
        <div className={styles.board}>
          {COLUMNS.map(col => {
            const colOrders = orders.filter(o => o.status === col.key);
            return (
              <div key={col.key} className={styles.column}>
                <div className={styles.colHeader} style={{ '--col-color': COLOR[col.key] }}>
                  <span className={styles.colIcon}>{col.icon}</span>
                  <span className={styles.colLabel}>{col.label}</span>
                  <span className={styles.colCount}>{colOrders.length}</span>
                </div>

                <div className={styles.cards}>
                  {colOrders.length === 0 ? (
                    <div className={styles.emptyCol}>
                      <div className={styles.emptyIcon}>○</div>
                      <div>No orders here</div>
                    </div>
                  ) : (
                    colOrders.map(order => (
                      <div
                        key={order.id}
                        className={styles.card}
                        style={{ '--card-accent': COLOR[col.key] }}
                      >
                        <div className={styles.cardTop}>
                          <div className={styles.orderId}>
                            #{order.token > 0 ? order.token : order.id}
                          </div>
                          <div className={styles.orderMeta}>
                            <span className={styles.orderType}>{order.type}</span>
                          </div>
                        </div>

                        <div className={styles.itemsList}>
                          {order.items.length === 0 ? (
                            <div className={styles.item}>
                              <span className={styles.itemName}>No items</span>
                            </div>
                          ) : (
                            order.items.map((item, i) => (
                              <div key={i} className={styles.item}>
                                <span className={styles.itemQty}>×{item.qty}</span>
                                <span className={styles.itemName}>{item.name}</span>
                              </div>
                            ))
                          )}
                        </div>

                        <div className={styles.cardBottom}>
                          <div className={styles.elapsed}>
                            {getElapsed(order.createdAt)}
                          </div>
                          {col.next && (
                            <button
                              className={styles.advanceBtn}
                              style={{ '--btn-color': COLOR[col.next] }}
                              onClick={() => advance(order, col.next)}
                            >
                              {ADVANCE_LABELS[col.next]}
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
