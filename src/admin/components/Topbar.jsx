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

  // Compute notifications
  const lowStockProducts = products.filter(p => p.stock < 5);
  const newOnlineOrders = orders.filter(o => o.status === 'Pending' && o.source === 'Online');

  const notifications = [
    ...newOnlineOrders.map(o => ({
      id: `order-${o.id}`,
      type: 'order',
      title: 'New Online Order!',
      message: `Order #${o.id.substring(0, 8)} - ${o.items?.length || 0} items ($${o.total?.toFixed(2) || 0})`,
      time: new Date(o.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    })),
    ...lowStockProducts.map(p => ({
      id: `stock-${p.id}`,
      type: 'stock',
      title: 'Low Stock Alert',
      message: `${p.name} only has ${p.stock} left in stock.`,
      time: 'Just now'
    }))
  ];

  const activeNotifications = notifications.filter(n => !dismissedNotifs.includes(n.id));

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
            className="icon-btn notification-btn"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={20} />
            {activeNotifications.length > 0 && <span className="notification-badge">{activeNotifications.length}</span>}
          </button>
          
          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <h3>Notifications</h3>
                <span className="badge">{activeNotifications.length} New</span>
              </div>
              <div className="notification-list">
                {activeNotifications.length === 0 ? (
                  <div className="notification-empty">No new notifications</div>
                ) : (
                  activeNotifications.map(notif => (
                    <div className="notification-item" key={notif.id}>
                      <div className={`notification-icon ${notif.type}`}>
                        {notif.type === 'stock' ? <AlertTriangle size={16} /> : <ShoppingCart size={16} />}
                      </div>
                      <div className="notification-content">
                        <h4>{notif.title}</h4>
                        <p>{notif.message}</p>
                        <span className="notification-time">{notif.time}</span>
                      </div>
                      <button 
                        className="accept-notif-btn"
                        onClick={() => setDismissedNotifs([...dismissedNotifs, notif.id])}
                        title="Accept/Dismiss"
                      >
                        <Check size={16} />
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
