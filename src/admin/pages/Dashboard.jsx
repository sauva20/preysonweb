import React, { useState, useEffect } from 'react';
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
  const { orders } = useOrders();
  const { formatPrice } = useCurrency();
  const [period, setPeriod] = useState('today');
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSales: 0,
    totalCustomers: 0,
    lowStockProducts: 0
  });

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/dashboard/stats?period=${period}`)
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error('Failed to fetch dashboard stats:', err));
  }, [period]);

  return (
    <div className="dashboard-page">
      <div className="dashboard-header-block">
        <div className="dashboard-titles">
          <h2>Overview Bisnis</h2>
          <p>Ringkasan performa hari ini, 12 Jul 2026</p>
        </div>
        <div className="dashboard-filters">
          <button className={`filter-tab ${period === 'today' ? 'active' : ''}`} onClick={() => setPeriod('today')}>Hari Ini</button>
          <button className={`filter-tab ${period === 'week' ? 'active' : ''}`} onClick={() => setPeriod('week')}>Minggu Ini</button>
          <button className={`filter-tab ${period === 'month' ? 'active' : ''}`} onClick={() => setPeriod('month')}>Bulan Ini</button>
        </div>
      </div>

      <div className="metric-cards">
        <div className="metric-card">
          <div className="metric-icon-wrapper wallet-icon">
            <TrendingUp size={24} className="metric-icon" />
          </div>
          <div className="metric-info">
            <h3>Total Pendapatan</h3>
            <p className="metric-value">Rp {stats.totalSales.toLocaleString('id-ID')}</p>
            <span className="metric-trend positive">Data Realtime</span>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon-wrapper bag-icon">
            <ShoppingBag size={24} className="metric-icon" />
          </div>
          <div className="metric-info">
            <h3>Pesanan Baru</h3>
            <p className="metric-value">{stats.totalOrders}</p>
            <span className="metric-trend neutral">Perlu diproses</span>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon-wrapper crown-icon">
            <Award size={24} className="metric-icon" />
          </div>
          <div className="metric-info">
            <h3>Low Stock</h3>
            <p className="metric-value text-large">{stats.lowStockProducts} Items</p>
            <span className="metric-trend positive">Perlu restock</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrapper users-icon">
            <Users size={24} className="metric-icon" />
          </div>
          <div className="metric-info">
            <h3>Total Pelanggan</h3>
            <p className="metric-value">{stats.totalCustomers}</p>
            <span className="metric-trend positive">Terdaftar</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Left Column: Chart */}
        <div className="dashboard-chart-section">
          <h3>Grafik Penjualan (7 Hari Terakhir)</h3>
          <div className="chart-placeholder">
            {/* Simple mock chart lines */}
            <div className="chart-line-bg"></div>
            <div className="chart-line-bg"></div>
            <div className="chart-line-bg"></div>
            <div className="chart-line-bg"></div>
            <div className="chart-line-bg"></div>
            <div className="chart-line-bg"></div>
          </div>
        </div>

        {/* Right Column: Control Panel & Transactions */}
        <div className="dashboard-side-section">
          <div className="control-panel">
            <h3>Control Panel</h3>
            <div className="control-grid">
              <button className="control-btn">
                <Shirt size={24} />
                <span>Katalog Gear</span>
              </button>
              <button className="control-btn">
                <Package size={24} />
                <span>Pesanan</span>
              </button>
              <button className="control-btn">
                <Tag size={24} />
                <span>Promo</span>
              </button>
              <button className="control-btn">
                <BarChart size={24} />
                <span>Laporan</span>
              </button>
            </div>
          </div>

          <div className="recent-transactions">
            <div className="section-header-row">
              <h3>Transaksi Terakhir</h3>
              <a href="#" className="see-all">Lihat Semua</a>
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
