import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Download, 
  Trash2, 
  ShieldCheck, 
  MonitorSmartphone, 
  Box, 
  ShoppingCart, 
  Users, 
  Tag, 
  Settings as SettingsIcon, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  Clock, 
  User 
} from 'lucide-react';
import { useActivity } from '../../context/ActivityContext';
import { showSuccess, confirmDelete } from '../utils/alert';
import './ActivityLog.css';

export default function ActivityLog() {
  const { activities, clearActivities } = useActivity();
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'ALL', label: 'Semua Aktivitas' },
    { id: 'POS', label: 'Kasir & POS' },
    { id: 'Produk', label: 'Inventaris & Produk' },
    { id: 'Pesanan', label: 'Pesanan Store' },
    { id: 'Promo', label: 'Promosi & Voucher' },
    { id: 'Pelanggan', label: 'Pelanggan' },
    { id: 'Settings', label: 'Konfigurasi' }
  ];

  const filteredActivities = activities.filter(item => {
    const matchesCat = activeCategory === 'ALL' || item.category === activeCategory;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = !q || 
      String(item.title || '').toLowerCase().includes(q) ||
      String(item.description || '').toLowerCase().includes(q) ||
      String(item.user || '').toLowerCase().includes(q) ||
      String(item.category || '').toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'POS': return <MonitorSmartphone size={16} />;
      case 'Produk': return <Box size={16} />;
      case 'Pesanan': return <ShoppingCart size={16} />;
      case 'Promo': return <Tag size={16} />;
      case 'Pelanggan': return <Users size={16} />;
      case 'Settings': return <SettingsIcon size={16} />;
      default: return <ShieldCheck size={16} />;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle2 size={18} className="status-ico success" />;
      case 'warning': return <AlertCircle size={18} className="status-ico warning" />;
      default: return <Info size={18} className="status-ico info" />;
    }
  };

  const formatTimestamp = (isoString) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 1) return 'Baru saja';
      if (diffMins < 60) return `${diffMins} menit yang lalu`;
      if (diffMins < 1440) return `${Math.floor(diffMins / 60)} jam yang lalu`;
      
      return date.toLocaleDateString('id-ID', { 
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      }) + ' WIB';
    } catch (e) {
      return isoString;
    }
  };

  const handleExportCSV = () => {
    if (filteredActivities.length === 0) {
      return;
    }
    const headers = 'ID,Waktu,Kategori,Judul,Deskripsi,Pengguna,Status\n';
    const rows = filteredActivities.map(a => 
      `"${a.id}","${a.timestamp}","${a.category}","${a.title.replace(/"/g, '""')}","${a.description.replace(/"/g, '""')}","${a.user}","${a.status}"`
    ).join('\n');
    
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Preyson_Activity_Logs_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
    showSuccess('File CSV riwayat aktivitas berhasil diunduh!');
  };

  const handleClearLogs = async () => {
    if (await confirmDelete('semua riwayat aktivitas sistem')) {
      clearActivities();
      showSuccess('Seluruh riwayat aktivitas telah dibatalkan & dibersihkan.');
    }
  };

  return (
    <div className="activity-log-page">
      {/* Page Header */}
      <div className="activity-header">
        <div className="header-title">
          <div className="header-icon-box">
            <History size={26} />
          </div>
          <div>
            <h2>Activity History & Audit Logs</h2>
            <p>Pantau seluruh rekam jejak aktivitas kasir, pembaruan stok, pesanan, dan konfigurasi secara real-time.</p>
          </div>
        </div>
        
        <div className="header-actions">
          <button className="export-csv-btn" onClick={handleExportCSV} disabled={filteredActivities.length === 0}>
            <Download size={16} />
            <span>Export CSV</span>
          </button>
          <button className="clear-logs-btn" onClick={handleClearLogs} disabled={activities.length === 0}>
            <Trash2 size={16} />
            <span>Bersihkan Log</span>
          </button>
        </div>
      </div>

      {/* Quick Metrics Cards */}
      <div className="activity-metrics-grid">
        <div className="metric-box">
          <div className="metric-icon total">
            <History size={22} />
          </div>
          <div className="metric-content">
            <h4>Total Kejadian</h4>
            <span>{activities.length} Aktivitas</span>
          </div>
        </div>

        <div className="metric-box">
          <div className="metric-icon pos">
            <MonitorSmartphone size={22} />
          </div>
          <div className="metric-content">
            <h4>Transaksi POS</h4>
            <span>{activities.filter(a => a.category === 'POS').length} Transaksi</span>
          </div>
        </div>

        <div className="metric-box">
          <div className="metric-icon prod">
            <Box size={22} />
          </div>
          <div className="metric-content">
            <h4>Perubahan Inventaris</h4>
            <span>{activities.filter(a => a.category === 'Produk').length} Pembaruan</span>
          </div>
        </div>

        <div className="metric-box">
          <div className="metric-icon sys">
            <ShieldCheck size={22} />
          </div>
          <div className="metric-content">
            <h4>Sistem & Promo</h4>
            <span>{activities.filter(a => ['Settings', 'Promo', 'Pelanggan', 'Pesanan'].includes(a.category)).length} Aksi</span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="activity-toolbar">
        <div className="category-pills">
          {categories.map(cat => (
            <button 
              key={cat.id}
              className={`cat-pill ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.label}
              <span className="pill-count">
                {cat.id === 'ALL' ? activities.length : activities.filter(a => a.category === cat.id).length}
              </span>
            </button>
          ))}
        </div>

        <div className="search-box">
          <Search size={16} />
          <input 
            type="text" 
            placeholder="Cari aktivitas, admin, atau deskripsi..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Activity Logs Table */}
      <div className="activity-table-container">
        {filteredActivities.length > 0 ? (
          <>
            <div className="desktop-table-view">
              <table className="activity-table">
                <thead>
                  <tr>
                    <th style={{ width: '18%' }}>WAKTU KEJADIAN</th>
                    <th style={{ width: '15%' }}>KATEGORI</th>
                    <th style={{ width: '45%' }}>DETAIL AKTIVITAS</th>
                    <th style={{ width: '15%' }}>PENGGUNA</th>
                    <th style={{ width: '7%', textAlign: 'center' }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredActivities.map((log) => (
                    <tr key={log.id} className="activity-row">
                      <td className="col-time">
                        <Clock size={14} className="time-ico" />
                        <span>{formatTimestamp(log.timestamp)}</span>
                      </td>
                      <td className="col-cat">
                        <span className={`category-badge badge-${log.category.toLowerCase()}`}>
                          {getCategoryIcon(log.category)}
                          {log.category}
                        </span>
                      </td>
                      <td className="col-details">
                        <div className="log-title">{log.title}</div>
                        <div className="log-desc">{log.description}</div>
                      </td>
                      <td className="col-user">
                        <div className="user-pill">
                          <User size={13} />
                          <span>{log.user}</span>
                        </div>
                      </td>
                      <td className="col-status" style={{ textAlign: 'center' }}>
                        {getStatusIcon(log.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mobile-feed-view">
              {filteredActivities.map((log) => (
                <div key={log.id} className="mobile-log-card">
                  <div className="mobile-card-top">
                    <span className={`category-badge badge-${log.category.toLowerCase()}`}>
                      {getCategoryIcon(log.category)}
                      {log.category}
                    </span>
                    <div className="mobile-time">
                      <Clock size={13} className="time-ico" />
                      <span>{formatTimestamp(log.timestamp)}</span>
                    </div>
                  </div>
                  
                  <div className="mobile-card-content">
                    <div className="mobile-title-row">
                      <h4 className="log-title">{log.title}</h4>
                      <div className="mobile-status">{getStatusIcon(log.status)}</div>
                    </div>
                    <p className="log-desc">{log.description}</p>
                  </div>

                  <div className="mobile-card-footer">
                    <div className="user-pill">
                      <User size={13} />
                      <span>{log.user}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="no-activity-state">
            <div className="empty-ico-box">
              <History size={44} />
            </div>
            <h3>Tidak ada riwayat aktivitas yang sesuai</h3>
            <p>Cobalah mengganti filter kategori atau kata kunci pencarian Anda.</p>
          </div>
        )}
      </div>
    </div>
  );
}
