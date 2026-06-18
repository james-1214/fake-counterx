import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import StatsCard from '../components/StatsCard';
import ChartContainer from '../components/ChartContainer';
import Spinner from '../components/Spinner';
import { getDashboardStats, getWeekDashboard } from '../api/dashboardApi';
import { getTopItems, getCategoryRevenue } from '../api/salesApi';
import styles from '../styles/Dashboard.module.css';

function MiniBarChart({ data, color = 'var(--primary)' }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        No data available
      </div>
    );
  }
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className={styles.barChart}>
      {data.map((d, i) => (
        <div key={i} className={styles.barGroup}>
          <div
            className={styles.miniBar}
            style={{ height: `${(d.value / max) * 100}%`, background: color }}
            title={`${d.label}: ${d.value}`}
          />
          <div className={styles.barLabel}>{d.label}</div>
        </div>
      ))}
    </div>
  );
}

function DonutChart({ segments }) {
  if (!segments || segments.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        No category data available
      </div>
    );
  }

  const total = segments.reduce((s, seg) => s + seg.value, 0);
  if (total === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        No orders yet
      </div>
    );
  }

  let cumulative = 0;
  const cx = 80, cy = 80, r = 60, strokeW = 20;
  const circumference = 2 * Math.PI * r;
  const colors = ['var(--primary)', 'var(--secondary)', 'var(--warning)', 'var(--success)', 'var(--danger)'];

  return (
    <div className={styles.donutWrap}>
      <svg viewBox="0 0 160 160" className={styles.donutSvg}>
        {segments.map((seg, i) => {
          const pct = seg.value / total;
          const dashArr = `${pct * circumference} ${circumference}`;
          const rotate = cumulative * 360 - 90;
          cumulative += pct;
          return (
            <circle
              key={i}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={colors[i % colors.length]}
              strokeWidth={strokeW}
              strokeDasharray={dashArr}
              transform={`rotate(${rotate} ${cx} ${cy})`}
              style={{ transition: 'stroke-dasharray 0.5s ease' }}
            />
          );
        })}
        <text x={cx} y={cy - 8} textAnchor="middle" className={styles.donutTotal}>{total}</text>
        <text x={cx} y={cx + 10} textAnchor="middle" className={styles.donutLabel}>Total</text>
      </svg>
      <div className={styles.donutLegend}>
        {segments.map((seg, i) => (
          <div key={i} className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: colors[i % colors.length] }} />
            <span className={styles.legendName}>{seg.label}</span>
            <span className={styles.legendVal}>{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [topItems, setTopItems] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [categorySegments, setCategorySegments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getDashboardStats(),
      getTopItems(),
      getWeekDashboard(),
      getCategoryRevenue(),
    ])
      .then(([s, t, week, cats]) => {
        setStats(s);

        // Normalize top items from salesApi.
        // Backend TopItemDTO now exposes quantity as "salesCount" via @JsonProperty.
        setTopItems(
          t.map(item => ({
            name: item.itemName || item.name,
            orders: item.salesCount || item.quantity || item.sales || item.orders || 0,
            revenue: item.revenue || 0,
          }))
        );

        // Build hourly/weekly chart data — week endpoint returns per-day stats
        // Shape: [{ revenueDate, totalOrders, totalRevenue }]
        // NOTE: the date field is "revenueDate", not "date"
        setWeeklyData(
          (week || []).map(day => ({
            label: (day.revenueDate || day.date)
              ? new Date(day.revenueDate || day.date).toLocaleDateString('en-IN', { weekday: 'short' })
              : '—',
            value: day.totalOrders || day.orders || 0,
          }))
        );

        // Build donut segments from category revenue
        // Shape: [{ category, revenue, ... }]
        setCategorySegments(
          (cats || []).map(cat => ({
            label: cat.category || cat.name || 'Other',
            value: Math.round(cat.revenue || 0),
          }))
        );

        setLoading(false);
      })
      .catch(err => {
        console.error('Dashboard load error:', err);
        setLoading(false);
      });
  }, []);

  const totalOrders    = stats?.totalOrders    ?? 0;
  const revenue        = stats?.totalRevenue   ?? 0;
  const completedOrders = stats?.completedOrders ?? 0;
  const avgOrderValue  = totalOrders > 0 ? (revenue / totalOrders).toFixed(0) : 0;

  return (
    <div className={styles.layout}>
      <Sidebar />
      <div className={styles.main}>
        <header className={styles.topbar}>
          <div>
            <h1 className={styles.pageTitle}>Analytics</h1>
            <p className={styles.pageDate}>Performance overview for today</p>
          </div>
          <div className={styles.periodBadge}>Today</div>
        </header>

        {loading ? (
          <div className={styles.loadingWrap}>
            <Spinner size="lg" />
          </div>
        ) : (
          <div className={styles.content}>
            {/* KPI row */}
            <div className={styles.statsGrid}>
              <StatsCard
                icon="📋"
                label="Total Orders"
                value={totalOrders}
                change={`${totalOrders} placed`}
                up
                color="primary"
              />
              <StatsCard
                icon="💰"
                label="Revenue"
                value={revenue >= 1000 ? `₹${(revenue / 1000).toFixed(1)}k` : `₹${revenue}`}
                change={`₹${avgOrderValue} avg`}
                up
                color="secondary"
              />
              <StatsCard
                icon="✅"
                label="Completed"
                value={completedOrders}
                change={
                  totalOrders > 0
                    ? `${((completedOrders / totalOrders) * 100).toFixed(0)}% completion`
                    : '0%'
                }
                up
                color="secondary"
              />
              <StatsCard
                icon="⏳"
                label="Pending"
                value={stats?.pendingOrders ?? 0}
                change={`${stats?.pendingOrders ?? 0} in queue`}
                up={false}
              />
            </div>

            {/* Charts row */}
            <div className={styles.chartsRow}>
              <ChartContainer
                title="Weekly Order Volume"
                subtitle="Orders received per day this week"
              >
                <MiniBarChart
                  data={weeklyData}
                  color="var(--primary)"
                />
              </ChartContainer>

              <ChartContainer
                title="Revenue by Category"
                subtitle="Distribution across menu categories"
              >
                <DonutChart segments={categorySegments} />
              </ChartContainer>
            </div>

            {/* Top items */}
            <ChartContainer
              title="Top Performing Items"
              subtitle="Ranked by order volume"
            >
              {topItems.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No sales data yet
                </div>
              ) : (
                <div className={styles.topItemsList}>
                  {topItems.map((item, i) => (
                    <div key={i} className={styles.topItem}>
                      <div className={styles.topItemRank}>{i + 1}</div>
                      <div className={styles.topItemInfo}>
                        <div className={styles.topItemName}>{item.name}</div>
                        <div className={styles.topItemBar}>
                          <div
                            className={styles.topItemFill}
                            style={{
                              width: `${
                                topItems[0].orders > 0
                                  ? (item.orders / topItems[0].orders) * 100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                      <div className={styles.topItemStats}>
                        <div className={styles.topItemOrders}>{item.orders} orders</div>
                        <div className={styles.topItemRevenue}>
                          ₹{Number(item.revenue).toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ChartContainer>

            {/* Summary metric cards */}
            <div className={styles.metricRow}>
              {[
                {
                  label: 'Avg Order Value',
                  value: `₹${avgOrderValue}`,
                  icon: '🧾',
                  change: 'per order',
                  up: true,
                },
                {
                  label: 'Completed Orders',
                  value: String(completedOrders),
                  icon: '✅',
                  change: `of ${totalOrders} total`,
                  up: true,
                },
                {
                  label: 'Pending Orders',
                  value: String(stats?.pendingOrders ?? 0),
                  icon: '⏳',
                  change: 'awaiting action',
                  up: false,
                },
                {
                  label: 'Total Revenue',
                  value: revenue >= 1000 ? `₹${(revenue / 1000).toFixed(1)}k` : `₹${revenue}`,
                  icon: '💰',
                  change: 'today',
                  up: true,
                },
              ].map((m, i) => (
                <div key={i} className={styles.metricCard}>
                  <div className={styles.metricIcon}>{m.icon}</div>
                  <div className={styles.metricValue}>{m.value}</div>
                  <div className={styles.metricLabel}>{m.label}</div>
                  <div className={`${styles.metricChange} ${m.up ? styles.up : styles.down}`}>
                    {m.up ? '↑' : '↓'} {m.change}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}