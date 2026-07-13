import React, { useState, useEffect } from 'react';
import { Search, Bell, Menu, User, Sun, Moon, AlertTriangle, ShoppingCart, X } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import { useOrders } from '../../context/OrderContext';
import './Topbar.css';

export default function Topbar({ isSidebarCollapsed, onToggleSidebar }) {
  const [isDarkMode, setIsDarkMode] = useState(
    document.body.classList.contains('dark-mode')
  );
  const [showNotifications, setShowNotifications] = useState(false);
  const { products } = useProducts();
  const { orders } = useOrders();

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
      
      {/* We can keep the search bar but move it or make it smaller, or just focus on the right side elements */}
      <div className="search-container topbar-center">
        <Search size={18} className="search-icon" />
        <input 
          type="text" 
          placeholder="Search..." 
          className="search-input"
        />
      </div>

      <div className="topbar-right">
        <button className="icon-btn theme-toggle-btn" onClick={toggleTheme}>
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        
        <div className="notification-wrapper">
          <button 
            className="icon-btn notification-btn"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={20} />
            {notifications.length > 0 && <span className="notification-badge">{notifications.length}</span>}
          </button>
          
          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <h3>Notifications</h3>
                <span className="badge">{notifications.length} New</span>
              </div>
              <div className="notification-list">
                {notifications.length === 0 ? (
                  <div className="notification-empty">No new notifications</div>
                ) : (
                  notifications.map(notif => (
                    <div className="notification-item" key={notif.id}>
                      <div className={`notification-icon ${notif.type}`}>
                        {notif.type === 'stock' ? <AlertTriangle size={16} /> : <ShoppingCart size={16} />}
                      </div>
                      <div className="notification-content">
                        <h4>{notif.title}</h4>
                        <p>{notif.message}</p>
                        <span className="notification-time">{notif.time}</span>
                      </div>
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
