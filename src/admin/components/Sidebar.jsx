import React from 'react';
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
  Settings
} from 'lucide-react';
import './Sidebar.css';

export default function Sidebar({ isCollapsed }) {
  return (
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
        <NavLink to="/admin/discount" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`} title="Discount">
          <Tag size={20} />
          {!isCollapsed && <span>DISCOUNT</span>}
        </NavLink>
        <NavLink to="/admin/customers" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`} title="Customers">
          <Users size={20} />
          {!isCollapsed && <span>CUSTOMERS</span>}
        </NavLink>
        <NavLink to="/admin/reports" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`} title="Reports">
          <BarChart2 size={20} />
          {!isCollapsed && <span>REPORTS</span>}
        </NavLink>
        <NavLink to="/admin/campaign" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`} title="Campaign">
          <Megaphone size={20} />
          {!isCollapsed && <span>CAMPAIGN</span>}
        </NavLink>
      </nav>
      
      <div className="sidebar-footer">
        <NavLink to="/admin/settings" className="sidebar-link" title="Settings">
          <Settings size={20} />
          {!isCollapsed && <span>SETTINGS</span>}
        </NavLink>
      </div>
    </aside>
  );
}
