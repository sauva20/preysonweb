import { getApiUrl, getBackendUrl } from '../../utils/apiConfig';
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  ShoppingBag, 
  Award, 
  Users, 
  Shirt, 
  Package, 
  Tag, 
  BarChart, 
  ArrowDownCircle 
} from 'lucide-react';
import { useOrders } from '../../context/OrderContext';
import { useCurrency } from '../../context/CurrencyContext';
import './Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const { orders } = useOrders();
  const { formatPrice } = useCurrency();
  const [period, setPeriod] = useState('today');
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSales: 0,
    totalCustomers: 0,
    lowStockProducts: 0
  });

  const chartDays = useMemo(() => {
    const days = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      const dayName = d.toLocaleDateString('id-ID', { weekday: 'short' });
      const dayNum = d.getDate();
      const monthName = d.toLocaleDateString('id-ID', { month: 'short' });
      const label = `${dayName}, ${dayNum} ${monthName}`;

      days.push({
        dateStr,
        label,
        totalSales: 0,
        count: 0
      });
    }

    if (orders && Array.isArray(orders)) {
      orders.forEach(order => {
        if (order.date || order.createdAt) {
          const oDate = new Date(order.date || order.createdAt);
          const year = oDate.getFullYear();
          const month = String(oDate.getMonth() + 1).padStart(2, '0');
          const day = String(oDate.getDate()).padStart(2, '0');
          const oDateStr = `${year}-${month}-${day}`;

          const found = days.find(d => d.dateStr === oDateStr);
          if (found) {
            found.totalSales += parseFloat(order.total || order.subtotal || 0);
            found.count += 1;
          }
        }
      });
    }

    const maxSales = Math.max(...days.map(d => d.totalSales), 500000);
    const total7Days = days.reduce((sum, d) => sum + d.totalSales, 0);

    return { days, maxSales, total7Days };
  }, [orders]);

  useEffect(() => {
    fetch(`${getApiUrl()}/dashboard/stats?period=${period}`)
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error('Failed to fetch dashboard stats:', err));
  }, [period]);

  return (
    <div className="dashboard-page">
      <div className="dashboard-header-block">
        <div className="dashboard-titles">
          <h2>Overview Bisnis</h2>
          <p>Ringkasan performa toko Preyson Moto</p>
        </div>
        <div className="dashboard-filters">
          <button className={`filter-tab ${period === 'today' ? 'active' : ''}`} onClick={() => setPeriod('today')}>Hari Ini</button>
          <button className={`filter-tab ${period === 'week' ? 'active' : ''}`} onClick={() => setPeriod('week')}>Minggu Ini</button>
          <button className={`filter-tab ${period === 'month' ? 'active' : ''}`} onClick={() => setPeriod('month')}>Bulan Ini</button>
        </div>
      </div>

      <div className="metric-cards">
        <div className="metric-card clickable-card" onClick={() => navigate('/admin/reports')}>
          <div className="metric-icon-wrapper wallet-icon">
            <TrendingUp size={24} className="metric-icon" />
          </div>
          <div className="metric-info">
            <h3>Total Pendapatan</h3>
            <p className="metric-value">Rp {stats.totalSales.toLocaleString('id-ID')}</p>
            <span className="metric-trend positive">Lihat Laporan ➔</span>
          </div>
        </div>
        
        <div className="metric-card clickable-card" onClick={() => navigate('/admin/orders')}>
          <div className="metric-icon-wrapper bag-icon">
            <ShoppingBag size={24} className="metric-icon" />
          </div>
          <div className="metric-info">
            <h3>Pesanan Masuk</h3>
            <p className="metric-value">{stats.totalOrders}</p>
            <span className={`metric-trend ${stats.totalOrders > 0 ? 'warning-trend' : 'neutral'}`}>
              {stats.totalOrders > 0 ? `⚡ ${stats.totalOrders} Perlu Diproses` : 'Tidak Ada Pending'}
            </span>
          </div>
        </div>
        
        <div className="metric-card clickable-card" onClick={() => navigate('/admin/products')}>
          <div className="metric-icon-wrapper crown-icon">
            <Award size={24} className="metric-icon" />
          </div>
          <div className="metric-info">
            <h3>Stok Menipis / Habis</h3>
            <p className="metric-value text-large">{stats.lowStockProducts} Items</p>
            <span className={`metric-trend ${stats.lowStockProducts > 0 ? 'negative-trend' : 'positive'}`}>
              {stats.lowStockProducts > 0 ? `⚠️ Perlu Restock` : 'Stok Aman'}
            </span>
          </div>
        </div>

        <div className="metric-card clickable-card" onClick={() => navigate('/admin/customers')}>
          <div className="metric-icon-wrapper users-icon">
            <Users size={24} className="metric-icon" />
          </div>
          <div className="metric-info">
            <h3>Total Pelanggan</h3>
            <p className="metric-value">{stats.totalCustomers}</p>
            <span className="metric-trend positive">Kelola Pelanggan ➔</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Left Column: Chart */}
        <div className="dashboard-chart-section">
          <div className="chart-header-info">
            <div>
              <h3>Grafik Penjualan (7 Hari Terakhir)</h3>
              <p className="chart-subtitle">Ringkasan transaksi dan omset harian toko</p>
            </div>
            <div className="chart-total-badge">
              <span>Total 7 Hari:</span>
              <strong>{formatPrice(chartDays.total7Days)}</strong>
            </div>
          </div>

          <div className="real-chart-container">
            <div className="chart-bars">
              {chartDays.days.map((item, idx) => {
                const heightPct = item.totalSales > 0 
                  ? Math.max(12, (item.totalSales / chartDays.maxSales) * 100)
                  : 4;
                return (
                  <div className="chart-bar-col" key={idx}>
                    <div className="bar-wrapper">
                      <div 
                        className={`bar-fill ${item.totalSales > 0 ? 'active-bar' : 'empty-bar'}`}
                        style={{ height: `${heightPct}%` }}
                      >
                        <div className="bar-tooltip">
                          <div className="tooltip-date">{item.label}</div>
                          <div className="tooltip-sales">{formatPrice(item.totalSales)}</div>
                          <div className="tooltip-count">{item.count} transaksi</div>
                        </div>
                      </div>
                    </div>
                    <span className="bar-label">{item.label.split(',')[0]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Control Panel & Transactions */}
        <div className="dashboard-side-section">
          <div className="control-panel">
            <h3>Control Panel</h3>
            <div className="control-grid">
              <button className="control-btn" onClick={() => navigate('/admin/products')} title="Kelola Katalog Produk">
                <Shirt size={24} />
                <span>Katalog Gear</span>
              </button>
              <button className="control-btn" onClick={() => navigate('/admin/orders')} title="Kelola Pesanan Masuk">
                <Package size={24} />
                <span>Pesanan</span>
              </button>
              <button className="control-btn" onClick={() => navigate('/admin/discount')} title="Kelola Voucher & Promo">
                <Tag size={24} />
                <span>Promo</span>
              </button>
              <button className="control-btn" onClick={() => navigate('/admin/reports')} title="Lihat Laporan Keuangan">
                <BarChart size={24} />
                <span>Laporan</span>
              </button>
            </div>
          </div>

          <div className="recent-transactions">
            <div className="section-header-row">
              <h3>Transaksi Terakhir</h3>
              <a href="#" className="see-all" onClick={(e) => { e.preventDefault(); navigate('/admin/orders'); }}>Lihat Semua</a>
            </div>
            
            <div className="transaction-list">
              {orders.slice(0, 5).map((tx, idx) => (
                <div className="transaction-item" key={tx.id || idx}>
                  <div className="tx-icon">
                    <ArrowDownCircle size={20} />
                  </div>
                  <div className="tx-details">
                    <h4>Order: {tx.id.split('-')[0]}</h4>
                    <span className="tx-status">{tx.status} &bull; {new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="tx-amount" style={{ color: tx.status === 'Cancelled' ? '#ef4444' : 'var(--admin-success)' }}>
                    {tx.status === 'Cancelled' ? '-' : '+'}{formatPrice(tx.total)}
                  </div>
                </div>
              ))}
              {orders.length === 0 && (
                <div className="no-transactions">
                  <p>Belum ada transaksi.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
