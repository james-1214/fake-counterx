import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ChartContainer from '../components/ChartContainer';
import Spinner from '../components/Spinner';
import { getTopItems, getCategoryRevenue, getKpiCards, getExpenseBreakdown } from '../api/salesApi';
import styles from '../styles/SalesBoard.module.css';

// ===== TRANSFORMATION HELPERS =====

/**
 * Transform raw API data to component-friendly format
 */
const transformSalesData = (categories) => {
  if (!Array.isArray(categories) || categories.length === 0) {
    return {
      totalRevenue: 0,
      totalExpenses: 0,
      netProfit: 0,
      profitMargin: 0,
      revenueGrowth: 0,
      expenseGrowth: 0,
      profitGrowth: 0
    };
  }

  const totalRevenue = categories.reduce((sum, cat) => sum + (cat.revenue || 0), 0);
  const totalExpenses = totalRevenue * 0.6; // Estimate 60% expenses
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;

  return {
    totalRevenue,
    totalExpenses,
    netProfit,
    profitMargin,
    revenueGrowth: 12,  // Placeholder - requires historical data from backend
    expenseGrowth: 8,   // Placeholder
    profitGrowth: 15    // Placeholder
  };
};

/**
 * Transform categories to trends format for chart
 */
const transformCategoryToTrends = (categories) => {
  if (!Array.isArray(categories)) return [];

  return categories.map(cat => ({
    month: cat.category || 'Unknown',
    revenue: cat.revenue || 0,
    expenses: (cat.revenue || 0) * 0.6,  // Estimate
    profit: (cat.revenue || 0) * 0.4,    // Estimate
    category: cat.category
  }));
};

/**
 * Transform expense breakdown data
 */
const transformExpenseBreakdown = (expenses, totalRevenue) => {
  if (!Array.isArray(expenses)) return [];

  return expenses.map(exp => ({
    category: exp.category || 'Other',
    pct: exp.percentage || 0,
    amount: Math.round((totalRevenue * (exp.percentage || 0)) / 100)
  }));
};

/**
 * Transform KPI cards data
 */
const transformKpiCards = (apiKpis) => {
  if (!Array.isArray(apiKpis)) return [];

  return apiKpis.map(kpi => ({
    label: kpi.title || kpi.label || 'Metric',
    value: kpi.value || '0',
    up: kpi.trend === 'up' || kpi.trend === true,
    change: String(kpi.change || '0%').replace(/^\+/, '')
  }));
};

// ===== CHART COMPONENTS =====

function LineChart({ data }) {
  if (!data || !data.length) return <div style={{ padding: '20px', textAlign: 'center' }}>No data available</div>;

  const W = 500, H = 160, PAD = 20;
  const maxVal = Math.max(...data.map(d => d.revenue || 0), 1);
  const minVal = 0;
  const range = maxVal - minVal || 1;

  const toX = (i) => PAD + (i / Math.max(data.length - 1, 1)) * (W - PAD * 2);
  const toY = (v) => H - PAD - ((v - minVal) / range) * (H - PAD * 2);

  const revPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${toX(i)},${toY(d.revenue || 0)}`).join(' ');
  const profPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${toX(i)},${toY(d.profit || 0)}`).join(' ');
  const expPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${toX(i)},${toY(d.expenses || 0)}`).join(' ');

  const areaBase = `L${toX(data.length - 1)},${H - PAD} L${toX(0)},${H - PAD} Z`;

  return (
    <div className={styles.lineChartWrap}>
      <svg viewBox={`0 0 ${W} ${H}`} className={styles.lineSvg}>
        <defs>
          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="profGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--success)" stopOpacity="0.15" />
            <stop offset="100%" stopColor="var(--success)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0.25, 0.5, 0.75, 1].map((pct, i) => (
          <line
            key={i}
            x1={PAD} y1={toY(maxVal * pct)}
            x2={W - PAD} y2={toY(maxVal * pct)}
            stroke="var(--border-light)" strokeDasharray="4"
          />
        ))}

        {/* Revenue area */}
        <path d={`${revPath} ${areaBase}`} fill="url(#revGrad)" />
        {/* Profit area */}
        <path d={`${profPath} ${areaBase}`} fill="url(#profGrad)" />

        {/* Lines */}
        <path d={revPath} fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d={expPath} fill="none" stroke="var(--danger)" strokeWidth="1.5" strokeDasharray="5,3" strokeLinecap="round" strokeLinejoin="round" />
        <path d={profPath} fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

        {/* X-axis labels */}
        {data.map((d, i) => (
          <text key={i} x={toX(i)} y={H - 2} textAnchor="middle" className={styles.axisLabel}>
            {typeof d.month === 'string' ? d.month.slice(0, 3) : 'N/A'}
          </text>
        ))}

        {/* Dots on revenue line */}
        {data.map((d, i) => (
          <circle key={i} cx={toX(i)} cy={toY(d.revenue || 0)} r="3.5"
            fill="var(--primary)" stroke="#fff" strokeWidth="1.5" />
        ))}
      </svg>

      <div className={styles.lineLegend}>
        <div className={styles.legendLine} style={{ '--lc': 'var(--primary)' }}>Revenue</div>
        <div className={styles.legendLine} style={{ '--lc': 'var(--success)' }}>Profit</div>
        <div className={styles.legendLine} style={{ '--lc': 'var(--danger)', '--dash': '5px dashed' }}>Expenses</div>
      </div>
    </div>
  );
}

function ExpenseBreakdown({ data }) {
  if (!data || !data.length) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>No expense data</div>;
  }

  return (
    <div className={styles.expList}>
      {data.map((item, i) => (
        <div key={i} className={styles.expItem}>
          <div className={styles.expInfo}>
            <span className={styles.expName}>{item.category || 'Unknown'}</span>
            <span className={styles.expAmt}>₹{(item.amount || 0).toLocaleString()}</span>
          </div>
          <div className={styles.expBar}>
            <div
              className={styles.expFill}
              style={{
                width: `${item.pct || 0}%`,
                background: `hsl(${i * 50}, 70%, 55%)`,
              }}
            />
          </div>
          <span className={styles.expPct}>{item.pct || 0}%</span>
        </div>
      ))}
    </div>
  );
}

// ===== MAIN COMPONENT =====

export default function SalesBoard() {
  // State
  const [sales, setSales] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    profitMargin: 0,
    revenueGrowth: 0,
    expenseGrowth: 0,
    profitGrowth: 0
  });
  const [trends, setTrends] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [kpis, setKpis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load data from API
  useEffect(() => {
    const loadSalesData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch data from backend
        const [topItems, categories, kpiData, expenseData] = await Promise.all([
          getTopItems().catch(() => []),
          getCategoryRevenue().catch(() => []),
          getKpiCards().catch(() => []),
          getExpenseBreakdown().catch(() => [])
        ]);

        // Transform data for component
        const transformedSales = transformSalesData(categories);
        const transformedTrends = transformCategoryToTrends(categories);
        const transformedExpenses = transformExpenseBreakdown(expenseData, transformedSales.totalRevenue);
        const transformedKpis = transformKpiCards(kpiData);

        // Update state
        setSales(transformedSales);
        setTrends(transformedTrends);
        setExpenses(transformedExpenses);
        setKpis(transformedKpis);

      } catch (err) {
        console.error('Error loading sales data:', err);
        setError('Failed to load sales data');
      } finally {
        setLoading(false);
      }
    };

    loadSalesData();
  }, []);

  // Render
  return (
    <div className={styles.layout}>
      <Sidebar />
      <div className={styles.main}>
        <header className={styles.topbar}>
          <div>
            <h1 className={styles.pageTitle}>Sales Board</h1>
            <p className={styles.pageDate}>Financial performance — {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
          </div>
          <div className={styles.exportBtn}>Export Report</div>
        </header>

        {loading ? (
          <div className={styles.loadingWrap}>
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <div className={styles.errorWrap}>
            <p style={{ color: 'var(--danger)' }}>⚠️ {error}</p>
          </div>
        ) : (
          <div className={styles.content}>
            {/* Revenue / Expenses / Profit / Margin Cards */}
            <div className={styles.financialRow}>
              <div className={`${styles.finCard} ${styles.revenue}`}>
                <div className={styles.finIcon}>💰</div>
                <div className={styles.finValue}>₹{(sales.totalRevenue / 1000).toFixed(1)}k</div>
                <div className={styles.finLabel}>Total Revenue</div>
                <div className={styles.finChange}>↑ {sales.revenueGrowth}% vs last month</div>
              </div>
              <div className={`${styles.finCard} ${styles.expenses}`}>
                <div className={styles.finIcon}>📤</div>
                <div className={styles.finValue}>₹{(sales.totalExpenses / 1000).toFixed(1)}k</div>
                <div className={styles.finLabel}>Total Expenses</div>
                <div className={styles.finChange}>↑ {sales.expenseGrowth}% vs last month</div>
              </div>
              <div className={`${styles.finCard} ${styles.profit}`}>
                <div className={styles.finIcon}>📈</div>
                <div className={styles.finValue}>₹{(sales.netProfit / 1000).toFixed(1)}k</div>
                <div className={styles.finLabel}>Net Profit</div>
                <div className={styles.finChange}>↑ {sales.profitGrowth}% vs last month</div>
              </div>
              <div className={`${styles.finCard} ${styles.margin}`}>
                <div className={styles.finIcon}>%</div>
                <div className={styles.finValue}>{sales.profitMargin}%</div>
                <div className={styles.finLabel}>Profit Margin</div>
                <div className={styles.finChange}>↑ Healthy margin</div>
              </div>
            </div>

            {/* KPI Cards */}
            <div className={styles.kpiRow}>
              {kpis.length > 0 ? kpis.map((kpi, i) => (
                <div key={i} className={styles.kpiCard}>
                  <div className={styles.kpiLabel}>{kpi.label}</div>
                  <div className={styles.kpiValue}>{kpi.value}</div>
                  <div className={`${styles.kpiChange} ${kpi.up ? styles.up : styles.down}`}>
                    {kpi.up ? '↑' : '↓'} {kpi.change}
                  </div>
                </div>
              )) : (
                <div style={{ padding: '20px', color: 'var(--text-secondary)' }}>No KPI data available</div>
              )}
            </div>

            {/* Charts row */}
            <div className={styles.chartsRow}>
              <ChartContainer
                title="Revenue Trends"
                subtitle={trends.length > 0 ? "Revenue, expenses and profit by category" : "Loading..."}
              >
                <LineChart data={trends} />
              </ChartContainer>

              <ChartContainer
                title="Expense Breakdown"
                subtitle="Where the money goes"
              >
                <ExpenseBreakdown data={expenses} />
              </ChartContainer>
            </div>

            {/* Summary Table */}
            <ChartContainer 
              title="Category Summary" 
              subtitle={trends.length > 0 ? "Revenue breakdown by category" : "No data"}
            >
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Revenue</th>
                      <th>Expenses</th>
                      <th>Profit</th>
                      <th>Margin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trends.length > 0 ? trends.map((row, i) => {
                      const margin = row.revenue > 0 ? ((row.profit / row.revenue) * 100).toFixed(1) : '0';
                      return (
                        <tr key={i}>
                          <td className={styles.monthCell}>{row.month || 'N/A'}</td>
                          <td>₹{(row.revenue || 0).toLocaleString()}</td>
                          <td className={styles.expenseCell}>₹{(row.expenses || 0).toLocaleString()}</td>
                          <td className={styles.profitCell}>₹{(row.profit || 0).toLocaleString()}</td>
                          <td>
                            <span className={styles.marginBadge}>{margin}%</span>
                          </td>
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>No data available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </ChartContainer>
          </div>
        )}
      </div>
    </div>
  );
}