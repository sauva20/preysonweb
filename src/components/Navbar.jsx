import React, { useState, useEffect } from 'react';
import { Menu, Search, User, ShoppingBag, X, Moon, Sun } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    // Check initial dark mode state
    if (document.body.classList.contains('dark-mode')) {
      setIsDark(true);
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    document.body.classList.toggle('dark-mode');
  };

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-left">
        <button className="menu-btn mobile-only" onClick={() => setIsMenuOpen(true)}>
          <Menu size={24} />
        </button>
        <ul className="nav-links desktop-only">
          <li><a href="#home">Home</a></li>
          <li><a href="#catalog">Catalog</a></li>
          <li><a href="#contact">Contact Us</a></li>
          <li><a href="#location">Location</a></li>
        </ul>
        
        {/* Mobile Menu Drawer */}
        <div className={`mobile-menu-drawer ${isMenuOpen ? 'open' : ''}`}>
          <div className="mobile-menu-header">
            <img src="/images/logo.png" alt="PREYSON" className="mobile-logo" />
            <button className="close-btn" onClick={() => setIsMenuOpen(false)}>
              <X size={24} />
            </button>
          </div>
          <ul className="mobile-nav-links">
            <li><a href="#home" onClick={() => setIsMenuOpen(false)}>Home</a></li>
            <li><a href="#catalog" onClick={() => setIsMenuOpen(false)}>Catalog</a></li>
            <li><a href="#contact" onClick={() => setIsMenuOpen(false)}>Contact Us</a></li>
            <li><a href="#location" onClick={() => setIsMenuOpen(false)}>Location</a></li>
          </ul>
        </div>
        
        {/* Overlay for clicking outside */}
        {isMenuOpen && <div className="mobile-menu-overlay" onClick={() => setIsMenuOpen(false)}></div>}
      </div>
      
      <div className="navbar-center">
        <div className="brand-logo">
          <img src="/images/logo.png" alt="PREYSON MOTO COMPANY" className="logo-img" />
        </div>
      </div>
      
      <div className="navbar-right">
        <button className="icon-btn"><Search size={20} /></button>
        <a href="#login" className="icon-btn"><User size={20} /></a>
        <button className="icon-btn"><ShoppingBag size={20} /></button>
        <button className="icon-btn theme-toggle" onClick={toggleDarkMode} title="Toggle Theme">
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </nav>
  );
}
