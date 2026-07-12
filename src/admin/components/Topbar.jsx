import React, { useState, useEffect } from 'react';
import { Search, Bell, Menu, User, Sun, Moon } from 'lucide-react';
import './Topbar.css';

export default function Topbar({ isSidebarCollapsed, onToggleSidebar }) {
  const [isDarkMode, setIsDarkMode] = useState(
    document.body.classList.contains('dark-mode')
  );

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
        
        <button className="icon-btn notification-btn">
          <Bell size={20} />
          <span className="notification-badge">3</span>
        </button>
        
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
