import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Menu, User, Sun, Moon, AlertTriangle, ShoppingCart, X, Check, ArrowUpRight } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import { useOrders } from '../../context/OrderContext';
import './Topbar.css';

export default function Topbar({ isSidebarCollapsed, onToggleSidebar }) {
  const [isDarkMode, setIsDarkMode] = useState(
    document.body.classList.contains('dark-mode')
  );
  const [showNotifications, setShowNotifications] = useState(false);
  const [dismissedNotifs, setDismissedNotifs] = useState([]);
  const notificationRef = useRef(null);
  const { products } = useProducts();
  const { orders } = useOrders();

  // Search state & navigation
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef(null);

  // Compute OP Notifications
  const lowStockProducts = products.filter(p => p.stock > 0 && p.stock < 5);
  const outOfStockProducts = products.filter(p => p.stock === 0 || p.isSoldOut);
  const pendingOrders = orders.filter(o => o.status === 'Pending');

  const notifications = [
    ...pendingOrders.map(o => ({
      id: `order-${o.id}`,
      type: 'order',
      category: 'order',
      badgeTag: o.source === 'Online' ? 'ONLINE ORDER' : 'PESANAN MASUK',
      title: o.source === 'Online' ? '📦 Pesanan Online Baru!' : '⚡ Pesanan Perlu Diproses',
      message: `Order #${o.id.substring(0, 8)} • ${o.customerName || o.shippingAddress?.name || 'Customer'} • Rp ${o.total?.toLocaleString('id-ID') || 0}`,
      time: o.date ? new Date(o.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' WIB' : 'Baru saja',
      link: '/admin/orders'
    })),
    ...outOfStockProducts.map(p => ({
      id: `outofstock-${p.id}`,
      type: 'outofstock',
      category: 'stock',
      badgeTag: p.isSoldOut ? 'MARKETING SOLD OUT' : 'STOK HABIS',
      title: `🔥 Produk Habis: ${p.name}`,
      message: p.isSoldOut ? 'Produk aktif dalam mode Paksa Sold Out.' : 'Stok 0 Pcs! Segera lakukan isi ulang barang.',
      time: 'Stok 0 Pcs',
      link: '/admin/products'
    })),
    ...lowStockProducts.map(p => ({
      id: `lowstock-${p.id}`,
      type: 'lowstock',
      category: 'stock',
      badgeTag: 'STOK MENIPIS',
      title: `⚠️ Stok Menipis: ${p.name}`,
      message: `Tersisa ${p.stock} item lagi di inventaris toko.`,
      time: `Sisa ${p.stock} Pcs`,
      link: '/admin/products'
    }))
  ];

  const [activeFilter, setActiveFilter] = useState('ALL');
  const activeNotifications = notifications.filter(n => !dismissedNotifs.includes(n.id));
  const filteredNotifications = activeNotifications.filter(n => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'ORDER') return n.type === 'order';
    if (activeFilter === 'STOCK') return n.type === 'lowstock' || n.type === 'outofstock';
    return true;
  });

  const handleNotificationClick = (notif) => {
    setDismissedNotifs(prev => [...prev, notif.id]);
    setShowNotifications(false);
    navigate(notif.link);
  };

  const handleMarkAllRead = () => {
    setDismissedNotifs(notifications.map(n => n.id));
  };

  const toggleTheme = () => {
    if (isDarkMode) {
      document.body.classList.remove('dark-mode');
      setIsDarkMode(false);
    } else {
      document.body.classList.add('dark-mode');
      setIsDarkMode(true);
    }
  };

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDarkMode(document.body.classList.contains('dark-mode'));
        }
      });
    });
    observer.observe(document.body, { attributes: true });
    return () => observer.disconnect();
  }, []);

  // Click outside to close notifications & search dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Global search filtering
  const navItems = [
    { title: 'Dashboard', subtitle: 'Analisis & Statistik Bisnis', path: '/admin/dashboard', badge: 'Menu' },
    { title: 'Point of Sale (POS)', subtitle: 'Kasir & Transaksi Toko', path: '/admin/pos', badge: 'Kasir' },
    { title: 'Products', subtitle: 'Kelola Katalog & Stok', path: '/admin/products', badge: 'Inventory' },
    { title: 'Orders & Sales', subtitle: 'Daftar Pesanan Masuk & Selesai', path: '/admin/orders', badge: 'Sales' },
    { title: 'Promotion & Discount', subtitle: 'Voucher & Potongan Harga', path: '/admin/discount', badge: 'Promo' },
    { title: 'Customers', subtitle: 'Data Pelanggan & Kontak', path: '/admin/customers', badge: 'CRM' },
    { title: 'Reports & Analytics', subtitle: 'Laporan Penjualan & Pendapatan', path: '/admin/reports', badge: 'Laporan' },
    { title: 'Campaign', subtitle: 'Siaran Broadcast & Promosi', path: '/admin/campaign', badge: 'Marketing' },
    { title: 'Activity Logs', subtitle: 'Riwayat & Rekam Jejak Sistem', path: '/admin/activity', badge: 'Audit' },
    { title: 'Store Settings', subtitle: 'Profil Toko, Pengiriman & Staff', path: '/admin/settings', badge: 'Config' }
  ];

  const trimmedQuery = searchQuery.trim().toLowerCase();

  const matchedNav = trimmedQuery ? navItems.filter(i => 
    i.title.toLowerCase().includes(trimmedQuery) || i.subtitle.toLowerCase().includes(trimmedQuery)
  ) : [];

  const matchedProducts = trimmedQuery ? products.filter(p => 
    String(p.name || '').toLowerCase().includes(trimmedQuery) || 
    String(p.sku || '').toLowerCase().includes(trimmedQuery) ||
    String(p.category?.name || p.categoryId || '').toLowerCase().includes(trimmedQuery)
  ).slice(0, 4) : [];

  const matchedOrders = trimmedQuery ? orders.filter(o =>
    String(o.id || '').toLowerCase().includes(trimmedQuery) ||
    String(o.customerName || '').toLowerCase().includes(trimmedQuery) ||
    String(o.shippingAddress?.name || '').toLowerCase().includes(trimmedQuery)
  ).slice(0, 3) : [];

  const handleSelectResult = (path) => {
    navigate(path);
    setShowSearchDropdown(false);
    setSearchQuery('');
  };


  return (
    <div className="admin-topbar">
      <div className="topbar-left">
        <button className="icon-btn menu-toggle" onClick={onToggleSidebar}>
          <Menu size={20} />
        </button>
        <div className="welcome-text">
          Halo, <strong>Admin Preyson!</strong> <span className="wave">👋</span>
        </div>
      </div>
      
      <div className="search-container topbar-center" ref={searchRef}>
        <Search size={18} className="search-icon" />
        <input 
          type="text" 
          placeholder="Cari fitur, produk (SKU/nama), atau pesanan..." 
          className="search-input"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowSearchDropdown(e.target.value.trim().length > 0);
          }}
          onFocus={() => {
            if (searchQuery.trim().length > 0) setShowSearchDropdown(true);
          }}
        />
        {showSearchDropdown && (
          <div className="search-results-dropdown">
            {matchedNav.length === 0 && matchedProducts.length === 0 && matchedOrders.length === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center', color: 'var(--admin-text-muted)', fontSize: '13px' }}>
                Tidak ada hasil untuk "<strong>{searchQuery}</strong>"
              </div>
            ) : (
              <>
                {matchedNav.length > 0 && (
                  <div className="search-section">
                    <div className="search-section-title">Halaman & Menu</div>
                    {matchedNav.map((item, idx) => (
                      <div key={`nav-${idx}`} className="search-result-item" onClick={() => handleSelectResult(item.path)}>
                        <div className="search-result-left">
                          <span className="search-result-title">{item.title}</span>
                          <span className="search-result-subtitle">{item.subtitle}</span>
                        </div>
                        <span className="search-result-badge">{item.badge}</span>
                      </div>
                    ))}
                  </div>
                )}

                {matchedProducts.length > 0 && (
                  <div className="search-section">
                    <div className="search-section-title">Produk ({matchedProducts.length})</div>
                    {matchedProducts.map((prod, idx) => (
                      <div key={`prod-${idx}`} className="search-result-item" onClick={() => handleSelectResult('/admin/products')}>
                        <div className="search-result-left">
                          <span className="search-result-title">{prod.name}</span>
                          <span className="search-result-subtitle">SKU: {prod.sku || 'N/A'} &bull; Stok: {prod.stock} unit</span>
                        </div>
                        <span className="search-result-badge">Rp {prod.price?.toLocaleString('id-ID') || 0}</span>
                      </div>
                    ))}
                  </div>
                )}

                {matchedOrders.length > 0 && (
                  <div className="search-section">
                    <div className="search-section-title">Pesanan ({matchedOrders.length})</div>
                    {matchedOrders.map((ord, idx) => (
                      <div key={`ord-${idx}`} className="search-result-item" onClick={() => handleSelectResult('/admin/orders')}>
                        <div className="search-result-left">
                          <span className="search-result-title">Order #{ord.id?.substring(0, 10)}</span>
                          <span className="search-result-subtitle">Customer: {ord.customerName || ord.shippingAddress?.name || 'Customer'} &bull; Status: {ord.status}</span>
                        </div>
                        <span className="search-result-badge">Rp {ord.total?.toLocaleString('id-ID') || 0}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <div className="topbar-right">
        <button className="icon-btn theme-toggle-btn" onClick={toggleTheme}>
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        
        <div className="notification-wrapper" ref={notificationRef}>
          <button 
            className={`icon-btn notification-btn ${activeNotifications.length > 0 ? 'has-unread' : ''}`}
            onClick={() => setShowNotifications(!showNotifications)}
            title="Pemberitahuan Sistem"
          >
            <Bell size={20} />
            {activeNotifications.length > 0 && (
              <span className="notification-badge pulse-badge">
                {activeNotifications.length}
              </span>
            )}
          </button>
          
          {showNotifications && (
            <div className="notification-dropdown op-notif-dropdown">
              <div className="notification-header">
                <div className="notif-header-left">
                  <h3>Pemberitahuan Sistem</h3>
                  <span className="notif-count-pill">{activeNotifications.length} Baru</span>
                </div>
                {activeNotifications.length > 0 && (
                  <button className="mark-all-read-btn" onClick={handleMarkAllRead}>
                    Tandai Dibaca
                  </button>
                )}
              </div>

              {/* Filter Tabs */}
              <div className="notif-filter-tabs">
                <button 
                  className={`notif-tab ${activeFilter === 'ALL' ? 'active' : ''}`}
                  onClick={() => setActiveFilter('ALL')}
                >
                  Semua ({activeNotifications.length})
                </button>
                <button 
                  className={`notif-tab ${activeFilter === 'ORDER' ? 'active' : ''}`}
                  onClick={() => setActiveFilter('ORDER')}
                >
                  Pesanan ({activeNotifications.filter(n => n.type === 'order').length})
                </button>
                <button 
                  className={`notif-tab ${activeFilter === 'STOCK' ? 'active' : ''}`}
                  onClick={() => setActiveFilter('STOCK')}
                >
                  Stok ({activeNotifications.filter(n => n.category === 'stock').length})
                </button>
              </div>

              <div className="notification-list">
                {filteredNotifications.length === 0 ? (
                  <div className="notification-empty">
                    <div className="empty-notif-icon">✨</div>
                    <p>Tidak ada pemberitahuan baru.</p>
                    <span>Semua transaksi & stok aman terkelola!</span>
                  </div>
                ) : (
                  filteredNotifications.map(notif => (
                    <div 
                      className={`notification-item ${notif.type}`} 
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                    >
                      <div className={`notification-icon ${notif.type}`}>
                        {notif.type === 'order' && <ShoppingCart size={18} />}
                        {notif.type === 'outofstock' && <X size={18} />}
                        {notif.type === 'lowstock' && <AlertTriangle size={18} />}
                      </div>
                      <div className="notification-content">
                        <div className="notif-item-top">
                          <span className={`notif-badge-tag tag-${notif.type}`}>
                            {notif.badgeTag}
                          </span>
                          <span className="notification-time">{notif.time}</span>
                        </div>
                        <h4>{notif.title}</h4>
                        <p>{notif.message}</p>
                      </div>
                      <button 
                        className="dismiss-single-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDismissedNotifs(prev => [...prev, notif.id]);
                        }}
                        title="Tutup Notifikasi"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="user-profile">
          <div className="user-info">
            <span className="user-name">Admin Preyson</span>
            <span className="user-role">OWNER</span>
          </div>
          <div className="user-avatar">
            <User size={20} />
          </div>
        </div>
      </div>
    </div>
  );
}
