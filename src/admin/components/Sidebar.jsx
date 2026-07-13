import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MonitorSmartphone, 
  Box, 
  ShoppingCart, 
  Tag, 
  Users, 
  BarChart2, 
  Megaphone,
  Settings,
  LogOut
} from 'lucide-react';
import './Sidebar.css';

export default function Sidebar({ isCollapsed }) {
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isCashier = user?.role === 'cashier';

  const confirmLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/admin/login';
  };

  return (
    <>
      <aside className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <h1>{isCollapsed ? 'P' : 'PREYSON'}</h1>
          {!isCollapsed && <span className="sidebar-subtitle">ADMIN CONSOLE</span>}
        </div>
        
        <nav className="sidebar-nav">
          <NavLink to="/admin/dashboard" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`} title="Dashboard">
            <LayoutDashboard size={20} />
            {!isCollapsed && <span>DASHBOARD</span>}
          </NavLink>
          <NavLink to="/admin/pos" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`} title="POS">
            <MonitorSmartphone size={20} />
            {!isCollapsed && <span>POS</span>}
          </NavLink>
          <NavLink to="/admin/products" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`} title="Products">
            <Box size={20} />
            {!isCollapsed && <span>PRODUCTS</span>}
          </NavLink>
          <NavLink to="/admin/orders" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`} title="Orders">
            <ShoppingCart size={20} />
            {!isCollapsed && <span>ORDERS</span>}
          </NavLink>

          {!isCashier && (
            <>
              <NavLink to="/admin/discount" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`} title="Discount">
                <Tag size={20} />
                {!isCollapsed && <span>DISCOUNT</span>}
              </NavLink>
              <NavLink to="/admin/customers" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`} title="Customers">
                <Users size={20} />
                {!isCollapsed && <span>CUSTOMERS</span>}
              </NavLink>
            </>
          )}

          <NavLink to="/admin/reports" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`} title="Reports">
            <BarChart2 size={20} />
            {!isCollapsed && <span>REPORTS</span>}
          </NavLink>

          {!isCashier && (
            <NavLink to="/admin/campaign" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`} title="Campaign">
              <Megaphone size={20} />
              {!isCollapsed && <span>CAMPAIGN</span>}
            </NavLink>
          )}
        </nav>
        
        <div className="sidebar-footer">
          {!isCashier && (
            <NavLink to="/admin/settings" className="sidebar-link" title="Settings">
              <Settings size={20} />
              {!isCollapsed && <span>SETTINGS</span>}
            </NavLink>
          )}
          <button 
            className="sidebar-link" 
            title="Logout" 
            onClick={() => setIsLogoutModalOpen(true)}
            style={{ width: '100%', background: 'transparent', border: 'none', padding: '12px 16px', textAlign: 'left', color: '#e53e3e', cursor: 'pointer' }}
          >
            <LogOut size={20} />
            {!isCollapsed && <span>LOGOUT</span>}
          </button>
        </div>
      </aside>

      {isLogoutModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', width: '320px', textAlign: 'center', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
            <h3 style={{ marginBottom: '16px', color: '#111' }}>Konfirmasi Logout</h3>
            <p style={{ marginBottom: '24px', color: '#555', fontSize: '0.9rem' }}>Apakah Anda yakin ingin keluar dari sistem?</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button onClick={() => setIsLogoutModalOpen(false)} style={{ padding: '8px 20px', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Batal</button>
              <button onClick={confirmLogout} style={{ padding: '8px 20px', background: '#e53e3e', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Ya, Logout</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
