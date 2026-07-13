import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import './AdminLayout.css';

export default function AdminLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    if (!user || user.role === 'customer') {
      navigate('/admin/login');
      return;
    }

    if (user.role === 'cashier') {
      const restrictedPaths = ['/admin/discount', '/admin/customers', '/admin/campaign', '/admin/settings'];
      if (restrictedPaths.some(p => location.pathname.startsWith(p))) {
        navigate('/admin/dashboard');
      }
    }
  }, [location.pathname, navigate]);

  return (
    <div className={`admin-layout ${isSidebarCollapsed ? 'collapsed' : ''}`}>
      <Sidebar isCollapsed={isSidebarCollapsed} />
      <div className="admin-main">
        <Topbar 
          isSidebarCollapsed={isSidebarCollapsed} 
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
        />
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
