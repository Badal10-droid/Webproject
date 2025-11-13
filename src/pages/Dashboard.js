import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios'; // Or use fetch

// Mock data as fallback - in a real app, fetch from API
const mockMetrics = {
  totalRevenue: 125000,
  totalExpenses: 85000,
  netProfit: 40000,
  occupancyRate: 78,
  categoryBreakdown: [
    { _id: 'Fish Farm', revenue: 50000 },
    { _id: 'Room', revenue: 40000 }
  ]
};

const mockDaily = {
  todayIncome: 1500,
  todayExpenses: 800,
  todayRevenue: 700
};

const mockRevenueData = [
  { month: 'Jan', revenue: 80000 },
  { month: 'Feb', revenue: 95000 },
  { month: 'Mar', revenue: 110000 },
  { month: 'Apr', revenue: 125000 },
  { month: 'May', revenue: 140000 }
];

const mockExpenseData = [
  { category: 'Staff', amount: 30000 },
  { category: 'Utilities', amount: 15000 },
  { category: 'Maintenance', amount: 12000 },
  { category: 'Supplies', amount: 18000 },
  { category: 'Marketing', amount: 10000 }
];

const mockRecentTransactions = [
  { id: 1, type: 'Income', description: 'Room Booking - Suite 101', amount: 500, date: '2025-10-11' },
  { id: 2, type: 'Expense', description: 'Staff Salary', amount: -2500, date: '2025-10-10' },
  { id: 3, type: 'Income', description: 'Spa Service', amount: 150, date: '2025-10-09' },
  { id: 4, type: 'Expense', description: 'Utility Bill', amount: -800, date: '2025-10-08' }
];

export default function Dashboard() {
  const [searchParams] = useSearchParams();
  const [metrics, setMetrics] = useState(mockMetrics); // Default to mock
  const [dailySummary, setDailySummary] = useState(mockDaily); // NEW: Daily state
  const [revenueData, setRevenueData] = useState(mockRevenueData);
  const [expenseData, setExpenseData] = useState(mockExpenseData);
  const [recentTransactions, setRecentTransactions] = useState(mockRecentTransactions);
  const [loading, setLoading] = useState(false); // No initial loading since using mocks
  const [error, setError] = useState(null);
  const refetchTrigger = searchParams.get('refetch'); // Trigger refetch after edits

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Attempt to fetch real data
      const [metricsRes, revenueRes, expenseRes, transactionsRes, dailyRes] = await Promise.all([
        axios.get('/api/metrics'),
        axios.get('/api/revenue-trend'),
        axios.get('/api/expenses-breakdown'),
        axios.get('/api/transactions?limit=5'),
        axios.get('/api/daily-summary') // NEW: Fetch daily summary
      ]);

      setMetrics(metricsRes.data);
      setDailySummary(dailyRes.data); // NEW: Set daily data
      setRevenueData(revenueRes.data);
      setExpenseData(expenseRes.data);
      setRecentTransactions(transactionsRes.data);
    } catch (err) {
      // On error, fallback to mocks and log
      console.warn('API fetch failed, using mock data:', err.message);
      setMetrics(mockMetrics);
      setDailySummary(mockDaily); // NEW: Mock for daily
      setRevenueData(mockRevenueData);
      setExpenseData(mockExpenseData);
      setRecentTransactions(mockRecentTransactions);
      setError('Using mock data (backend not connected yet)');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refetchTrigger]); // Refetch when trigger changes

  useEffect(() => {
    if (revenueData.length > 0) {
      const canvas = document.getElementById('revenueChart');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const data = revenueData;
      const maxRevenue = Math.max(...data.map(d => d.revenue));
      const barWidth = 60;
      const spacing = 20;
      const startX = 20;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      data.forEach((item, index) => {
        const barHeight = (item.revenue / maxRevenue) * 250;
        const x = startX + (index * (barWidth + spacing));
        const y = canvas.height - barHeight - 30;

        ctx.fillStyle = '#28a745';
        ctx.fillRect(x, y, barWidth, barHeight);

        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(item.month, x + barWidth / 2, canvas.height - 10);
        ctx.fillText('$' + item.revenue.toLocaleString(), x + barWidth / 2, y - 5);
      });
    }
  }, [revenueData]);

  useEffect(() => {
    if (expenseData.length > 0) {
      const expenseCanvas = document.getElementById('expenseChart');
      if (!expenseCanvas) return;
      const ctx = expenseCanvas.getContext('2d');
      const data = expenseData;
      const maxAmount = Math.max(...data.map(d => d.amount));
      const barWidth = 80;
      const spacing = 10;
      const startX = 10;

      ctx.clearRect(0, 0, expenseCanvas.width, expenseCanvas.height);

      data.forEach((item, index) => {
        const barHeight = (item.amount / maxAmount) * 250;
        const x = startX + (index * (barWidth + spacing));
        const y = expenseCanvas.height - barHeight - 30;

        ctx.fillStyle = '#dc3545';
        ctx.fillRect(x, y, barWidth, barHeight);

        ctx.fillStyle = '#333';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(item.category, x + barWidth / 2, expenseCanvas.height - 10);
        ctx.fillText('$' + item.amount.toLocaleString(), x + barWidth / 2, y - 5);
      });
    }
  }, [expenseData]);

  if (loading) {
    return <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px' }}>Loading...</div>;
  }

  return (
    <div style={{ 
      fontFamily: 'Arial, sans-serif', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
      minHeight: '100vh', 
      padding: '20px',
      color: '#333'
    }}>
      {/* Header */}
      <div style={{ 
        background: 'rgba(255, 255, 255, 0.95)', 
        padding: '20px', 
        borderRadius: '12px', 
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)', 
        marginBottom: '30px',
        textAlign: 'center'
      }}>
        <h1 style={{ 
          color: '#4a5568', 
          margin: '0 0 10px 0', 
          fontSize: '2.5em',
          textShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>Pani Ghatta Resort</h1>
        <p style={{ 
          color: '#718096', 
          fontSize: '1.2em', 
          margin: 0 
        }}>Welcome to your oasis of insight—where every booking blooms and every bill balances.</p>
        {error && <p style={{ color: '#ef4444', fontSize: '0.9em', marginTop: '10px' }}>{error}</p>}
      </div>

      {/* Key Metrics Section */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr)', 
        gap: '20px', 
        marginBottom: '30px' 
      }}>
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.95)', 
          padding: '25px', 
          borderRadius: '12px', 
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)', 
          textAlign: 'center' 
        }}>
          <h3 style={{ color: '#718096', marginBottom: '10px' }}>Total Revenue</h3>
          <p style={{ 
            fontSize: '28px', 
            fontWeight: 'bold', 
            color: '#28a745',
            margin: 0 
          }}>${metrics.totalRevenue.toLocaleString()}</p>
        </div>
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.95)', 
          padding: '25px', 
          borderRadius: '12px', 
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)', 
          textAlign: 'center' 
        }}>
          <h3 style={{ color: '#718096', marginBottom: '10px' }}>Total Expenses</h3>
          <p style={{ 
            fontSize: '28px', 
            fontWeight: 'bold', 
            color: '#dc3545',
            margin: 0 
          }}>${metrics.totalExpenses.toLocaleString()}</p>
        </div>
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.95)', 
          padding: '25px', 
          borderRadius: '12px', 
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)', 
          textAlign: 'center' 
        }}>
          <h3 style={{ color: '#718096', marginBottom: '10px' }}>Net Profit</h3>
          <p style={{ 
            fontSize: '28px', 
            fontWeight: 'bold', 
            color: '#10b981',
            margin: 0 
          }}>${metrics.netProfit.toLocaleString()}</p>
        </div>
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.95)', 
          padding: '25px', 
          borderRadius: '12px', 
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)', 
          textAlign: 'center' 
        }}>
          <h3 style={{ color: '#718096', marginBottom: '10px' }}>Occupancy Rate</h3>
          <p style={{ 
            fontSize: '28px', 
            fontWeight: 'bold', 
            color: '#3b82f6',
            margin: 0 
          }}>{metrics.occupancyRate}%</p>
        </div>
        {/* Top Category Card */}
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.95)', 
          padding: '25px', 
          borderRadius: '12px', 
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)', 
          textAlign: 'center' 
        }}>
          <h3 style={{ color: '#718096', marginBottom: '10px' }}>Top Category</h3>
          <p style={{ 
            fontSize: '28px', 
            fontWeight: 'bold', 
            color: '#ff6b6b',
            margin: 0 
          }}>
            {metrics.categoryBreakdown?.[0]?._id || 'N/A'}: ${metrics.categoryBreakdown?.[0]?.revenue?.toLocaleString() || 0}
          </p>
        </div>
      </div>

      {/* NEW: Daily Record Section */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr)', 
        gap: '20px', 
        marginBottom: '30px' 
      }}>
        <h2 style={{ gridColumn: '1 / -1', color: '#4a5568', marginBottom: '10px' }}>Today's Record</h2>
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.95)', 
          padding: '25px', 
          borderRadius: '12px', 
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)', 
          textAlign: 'center' 
        }}>
          <h3 style={{ color: '#718096', marginBottom: '10px' }}>Today's Income</h3>
          <p style={{ 
            fontSize: '28px', 
            fontWeight: 'bold', 
            color: '#28a745',
            margin: 0 
          }}>${dailySummary.todayIncome.toLocaleString()}</p>
        </div>
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.95)', 
          padding: '25px', 
          borderRadius: '12px', 
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)', 
          textAlign: 'center' 
        }}>
          <h3 style={{ color: '#718096', marginBottom: '10px' }}>Today's Expenses</h3>
          <p style={{ 
            fontSize: '28px', 
            fontWeight: 'bold', 
            color: '#dc3545',
            margin: 0 
          }}>${dailySummary.todayExpenses.toLocaleString()}</p>
        </div>
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.95)', 
          padding: '25px', 
          borderRadius: '12px', 
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)', 
          textAlign: 'center' 
        }}>
          <h3 style={{ color: '#718096', marginBottom: '10px' }}>Today's Revenue</h3>
          <p style={{ 
            fontSize: '28px', 
            fontWeight: 'bold', 
            color: '#10b981',
            margin: 0 
          }}>${dailySummary.todayRevenue.toLocaleString()}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div style={{ 
        display: 'flex', 
        gap: '30px', 
        marginBottom: '30px',
        flexWrap: 'wrap'
      }}>
        {/* Revenue Trend Chart */}
        <div style={{ 
          flex: 1, 
          minWidth: '300px',
          background: 'rgba(255, 255, 255, 0.95)', 
          padding: '25px', 
          borderRadius: '12px', 
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)' 
        }}>
          <h3 style={{ color: '#4a5568', marginBottom: '20px' }}>Revenue Trend (Last 5 Months)</h3>
          <canvas 
            id="revenueChart" 
            width="400" 
            height="300" 
            style={{ 
              border: '1px solid #e2e8f0', 
              borderRadius: '8px',
              display: 'block',
              margin: '0 auto'
            }} 
          />
        </div>

        {/* Expenses Breakdown Chart */}
        <div style={{ 
          flex: 1, 
          minWidth: '300px',
          background: 'rgba(255, 255, 255, 0.95)', 
          padding: '25px', 
          borderRadius: '12px', 
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)' 
        }}>
          <h3 style={{ color: '#4a5568', marginBottom: '20px' }}>Expenses Breakdown</h3>
          <canvas 
            id="expenseChart" 
            width="300" 
            height="300" 
            style={{ 
              border: '1px solid #e2e8f0', 
              borderRadius: '8px',
              display: 'block',
              margin: '0 auto'
            }} 
          />
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div style={{ 
        background: 'rgba(255, 255, 255, 0.95)', 
        padding: '25px', 
        borderRadius: '12px', 
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)', 
        overflow: 'hidden' 
      }}>
        <h3 style={{ color: '#4a5568', marginBottom: '20px' }}>Recent Transactions</h3>
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse',
          fontSize: '14px'
        }}>
          <thead>
            <tr style={{ background: '#f7fafc' }}>
              <th style={{ 
                padding: '15px 10px', 
                textAlign: 'left', 
                borderBottom: '2px solid #e2e8f0',
                color: '#4a5568'
              }}>Type</th>
              <th style={{ 
                padding: '15px 10px', 
                textAlign: 'left', 
                borderBottom: '2px solid #e2e8f0',
                color: '#4a5568'
              }}>Description</th>
              <th style={{ 
                padding: '15px 10px', 
                textAlign: 'right', 
                borderBottom: '2px solid #e2e8f0',
                color: '#4a5568'
              }}>Amount</th>
              <th style={{ 
                padding: '15px 10px', 
                textAlign: 'right', 
                borderBottom: '2px solid #e2e8f0',
                color: '#4a5568'
              }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {recentTransactions.map(transaction => (
              <tr key={transaction.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ 
                  padding: '15px 10px',
                  fontWeight: '500',
                  color: transaction.type === 'Income' ? '#10b981' : '#ef4444'
                }}>
                  {transaction.type}
                </td>
                <td style={{ padding: '15px 10px', color: '#718096' }}>
                  {transaction.description}
                </td>
                <td style={{ 
                  padding: '15px 10px', 
                  textAlign: 'right',
                  fontWeight: 'bold',
                  color: transaction.amount > 0 ? '#10b981' : '#ef4444'
                }}>
                  ${Math.abs(transaction.amount).toLocaleString()}
                </td>
                <td style={{ 
                  padding: '15px 10px', 
                  textAlign: 'right', 
                  color: '#718096' 
                }}>
                  {transaction.date}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}