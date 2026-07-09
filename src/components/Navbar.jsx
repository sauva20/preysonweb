import React, { useState, useEffect } from 'react';
import { Menu, Search, ShoppingBag, Moon, Sun, X } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const [isDark, setIsDark] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    // Check if dark mode is already set on body (e.g., from initial load or local storage)
    if (document.body.classList.contains('dark-mode')) {
      setIsDark(true);
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    document.body.classList.toggle('dark-mode');
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button className="menu-btn" onClick={() => setIsMenuOpen(true)}>
          <Menu size={24} />
        </button>
        <ul className="nav-links">
          <li><a href="#bestseller">BEST SELLER</a></li>
          <li><a href="#signature">SIGNATURE SERIES</a></li>
          <li><a href="#accessories">ACCESSORIES</a></li>
        </ul>
        
        {/* Mobile Menu Drawer */}
        <div className={`mobile-menu-drawer ${isMenuOpen ? 'open' : ''}`}>
          <div className="mobile-menu-header">
            <span className="brand-preyson">PREYSON</span>
            <button className="close-btn" onClick={() => setIsMenuOpen(false)}>
              <X size={24} />
            </button>
          </div>
          <ul className="mobile-nav-links">
            <li><a href="#bestseller" onClick={() => setIsMenuOpen(false)}>BEST SELLER</a></li>
            <li><a href="#signature" onClick={() => setIsMenuOpen(false)}>SIGNATURE SERIES</a></li>
            <li><a href="#accessories" onClick={() => setIsMenuOpen(false)}>ACCESSORIES</a></li>
            <li><a href="#login" onClick={() => setIsMenuOpen(false)}>LOGIN</a></li>
          </ul>
        </div>
        
        {/* Overlay for clicking outside */}
        {isMenuOpen && <div className="mobile-menu-overlay" onClick={() => setIsMenuOpen(false)}></div>}
      </div>
      <div className="navbar-center">
        <div className="brand-logo">
          <span className="brand-preyson">PREYSON</span>
          <span className="brand-moto">MOTO COMPANY</span>
        </div>
      </div>
      <div className="navbar-right">
        <a href="#login" className="login-link">LOGIN</a>
        <button className="icon-btn"><Search size={20} /></button>
        <button className="icon-btn"><ShoppingBag size={20} /></button>
        <button className="icon-btn" onClick={toggleDarkMode} title="Toggle Dark Mode">
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </nav>
  );
}
