import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Menu, Search, User, ShoppingBag, X, Moon, Sun } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './Navbar.css';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const location = useLocation();
  const isLightPage = location.pathname === '/catalog' || location.pathname === '/cart' || location.pathname.startsWith('/product') || location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/forgot-password';
  
  const { cartCount } = useCart();

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
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''} ${isLightPage ? 'light-page' : ''}`}>
      <div className="navbar-left">
        <button className="menu-btn mobile-only" onClick={() => setIsMenuOpen(true)}>
          <Menu size={24} />
        </button>
        <ul className="nav-links desktop-only">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/catalog">Catalog</Link></li>
        </ul>
        
        {/* Mobile Menu Drawer */}
        <div className={`mobile-menu-drawer ${isMenuOpen ? 'open' : ''}`}>
          <div className="mobile-menu-header">
            <img src="/images/logo-mobile.png" alt="PREYSON" className="mobile-logo" />
            <button className="close-btn" onClick={() => setIsMenuOpen(false)}>
              <X size={24} />
            </button>
          </div>
          <ul className="mobile-nav-links">
            <li><Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link></li>
            <li><Link to="/catalog" onClick={() => setIsMenuOpen(false)}>Catalog</Link></li>
          </ul>
        </div>
        
        {/* Overlay for clicking outside */}
        {isMenuOpen && <div className="mobile-menu-overlay" onClick={() => setIsMenuOpen(false)}></div>}
      </div>
      
      <div className="navbar-center">
        <Link to="/" className="brand-logo">
          <img src="/images/logo.png" alt="PREYSON MOTO COMPANY" className="logo-img desktop-logo" />
          <img src="/images/logo-mobile.png" alt="PREYSON" className="logo-img mobile-logo-img" />
        </Link>
      </div>
      
      <div className="navbar-right">
        <button className="icon-btn"><Search size={20} /></button>
        <Link to="/login" className="icon-btn"><User size={20} /></Link>
        <Link to="/cart" className="icon-btn cart-btn-wrapper">
          <ShoppingBag size={20} />
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </Link>
        <button className="icon-btn theme-toggle" onClick={toggleDarkMode} title="Toggle Theme">
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </nav>
  );
}
