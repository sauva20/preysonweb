import React from 'react';
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
import './Dashboard.css';

export default function Dashboard() {
  return (
    <div className="dashboard-page">
      <div className="dashboard-header-block">
        <div className="dashboard-titles">
          <h2>Overview Bisnis</h2>
          <p>Ringkasan performa hari ini, 12 Jul 2026</p>
        </div>
        <div className="dashboard-filters">
          <button className="filter-tab active">Hari Ini</button>
          <button className="filter-tab">Minggu Ini</button>
          <button className="filter-tab">Bulan Ini</button>
        </div>
      </div>

      <div className="metric-cards">
        <div className="metric-card">
          <div className="metric-icon-wrapper wallet-icon">
            <TrendingUp size={24} className="metric-icon" />
          </div>
          <div className="metric-info">
            <h3>Total Pendapatan</h3>
            <p className="metric-value">Rp 12.450.000</p>
            <span className="metric-trend positive">Data Realtime</span>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon-wrapper bag-icon">
            <ShoppingBag size={24} className="metric-icon" />
          </div>
          <div className="metric-info">
            <h3>Pesanan Baru</h3>
            <p className="metric-value">14</p>
            <span className="metric-trend neutral">Perlu diproses</span>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon-wrapper crown-icon">
            <Award size={24} className="metric-icon" />
          </div>
          <div className="metric-info">
            <h3>Best Seller</h3>
            <p className="metric-value text-large">Roadkill JKT</p>
            <span className="metric-trend positive">Favorit Riders</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrapper users-icon">
            <Users size={24} className="metric-icon" />
          </div>
          <div className="metric-info">
            <h3>Total Pelanggan</h3>
            <p className="metric-value">128</p>
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
              {[
                { name: 'Order: Ironclad Glove', amount: '+Rp 1.200.000', time: '20:09' },
                { name: 'Order: Roadkill JKT', amount: '+Rp 2.500.000', time: '18:29' },
                { name: 'Order: HD Tee - Ash', amount: '+Rp 450.000', time: '19:01' },
                { name: 'Order: Waxed Vest', amount: '+Rp 1.850.000', time: '18:42' },
                { name: 'Order: Classic Helmet', amount: '+Rp 3.100.000', time: '18:08' },
              ].map((tx, idx) => (
                <div className="transaction-item" key={idx}>
                  <div className="tx-icon">
                    <ArrowDownCircle size={20} />
                  </div>
                  <div className="tx-details">
                    <h4>{tx.name}</h4>
                    <span className="tx-status">Completed &bull; {tx.time}</span>
                  </div>
                  <div className="tx-amount">{tx.amount}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
