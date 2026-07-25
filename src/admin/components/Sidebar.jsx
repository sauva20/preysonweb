import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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
  LogOut,
  History
} from 'lucide-react';
import { confirmLogout, showSuccess } from '../utils/alert';
import './Sidebar.css';

export default function Sidebar({ isCollapsed, onLinkClick }) {
  const navigate = useNavigate();
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isCashier = user?.role === 'cashier';

  const handleLogoutClick = async () => {
    if (await confirmLogout()) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      showSuccess('Anda berhasil keluar dari sistem!');
      navigate('/admin/login');
    }
  };

  return (
    <>
      <aside className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <h1 className="logo-full">PREYSON</h1>
          <h1 className="logo-short">P</h1>
          <span className="sidebar-subtitle">ADMIN CONSOLE</span>
        </div>
        
        <nav className="sidebar-nav" onClick={onLinkClick}>
          <NavLink to="/admin/dashboard" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`} title="Dashboard">
            <LayoutDashboard size={20} />
            <span>DASHBOARD</span>
          </NavLink>
          <NavLink to="/admin/pos" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`} title="POS">
            <MonitorSmartphone size={20} />
            <span>POS</span>
          </NavLink>
          <NavLink to="/admin/products" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`} title="Products">
            <Box size={20} />
            <span>PRODUCTS</span>
          </NavLink>
          <NavLink to="/admin/orders" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`} title="Orders">
            <ShoppingCart size={20} />
            <span>ORDERS</span>
          </NavLink>

          {!isCashier && (
            <>
              <NavLink to="/admin/discount" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`} title="Discount">
                <Tag size={20} />
                <span>DISCOUNT</span>
              </NavLink>
              <NavLink to="/admin/customers" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`} title="Customers">
                <Users size={20} />
                <span>CUSTOMERS</span>
              </NavLink>
            </>
          )}

          <NavLink to="/admin/reports" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`} title="Reports">
            <BarChart2 size={20} />
            <span>REPORTS</span>
          </NavLink>

          {!isCashier && (
            <NavLink to="/admin/campaign" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`} title="Campaign">
              <Megaphone size={20} />
              <span>CAMPAIGN</span>
            </NavLink>
          )}

          <NavLink to="/admin/activity" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`} title="Activity History">
            <History size={20} />
            <span>ACTIVITY LOGS</span>
          </NavLink>
        </nav>
        
        <div className="sidebar-footer" onClick={onLinkClick}>
          {!isCashier && (
            <NavLink to="/admin/settings" className="sidebar-link" title="Settings">
              <Settings size={20} />
              <span>SETTINGS</span>
            </NavLink>
          )}
          <button 
            className="sidebar-link logout" 
            title="Logout" 
            onClick={handleLogoutClick}
          >
            <LogOut size={20} />
            <span>LOGOUT</span>
          </button>
        </div>
      </aside>
    </>
  );
}
