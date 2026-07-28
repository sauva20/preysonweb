import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Menu, Search, User, ShoppingBag, X, Moon, Sun, ChevronDown } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';
import './Navbar.css';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isCategoryHovered, setIsCategoryHovered] = useState(false);
  const [isMobileCategoryOpen, setIsMobileCategoryOpen] = useState(false);

  const location = useLocation();
  const isLightPage = location.pathname.startsWith('/catalog') || location.pathname === '/cart' || location.pathname.startsWith('/product') || location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/forgot-password' || location.pathname.startsWith('/contact') || location.pathname === '/profile';
  
  const { cartCount } = useCart();
  const { categories: dbCategories } = useProducts() || {};

  const fallbackCategories = [
    { name: 'Jacket' },
    { name: 'Tees' },
    { name: 'Gloves' },
    { name: 'Cap' },
    { name: 'Outer' },
    { name: 'Accessories' }
  ];

  const displayCategories = (dbCategories && dbCategories.length > 0) ? dbCategories : fallbackCategories;

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    if (document.body.classList.contains('dark-mode')) {
      setIsDark(true);
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    document.body.classList.toggle('dark-mode');
  };

  const getDesktopLogo = () => {
    if (isDark) {
      return '/images/logo_white.png';
    } else {
      if (isScrolled) return '/images/logo_black.png';
      return isLightPage ? '/images/logo_black.png' : '/images/logo_white.png';
    }
  };

  const getMobileLogo = () => {
    if (isDark) {
      return '/images/logo_mobile_white.png';
    } else {
      if (isScrolled) return '/images/logo_mobile_black.png';
      return isLightPage ? '/images/logo_mobile_black.png' : '/images/logo_mobile_white.png';
    }
  };

  const customerUser = (() => {
    try {
      const saved = localStorage.getItem('customer_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  })();

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''} ${isLightPage ? 'light-page' : ''}`}>
      <div className="navbar-left">
        <button className="menu-btn mobile-only" onClick={() => setIsMenuOpen(true)}>
          <Menu size={24} />
        </button>
        <ul className="nav-links desktop-only">
          <li><Link to="/">Home</Link></li>
          
          <li 
            className="nav-item-dropdown"
            onMouseEnter={() => setIsCategoryHovered(true)}
            onMouseLeave={() => setIsCategoryHovered(false)}
          >
            <Link to="/catalog" className="dropdown-trigger-link">
              Catalog <ChevronDown size={14} className={`chevron-icon ${isCategoryHovered ? 'rotate' : ''}`} />
            </Link>
            
            <ul className={`nav-dropdown-menu ${isCategoryHovered ? 'show' : ''}`}>
              {displayCategories.map((cat, idx) => (
                <li key={cat.id || idx}>
                  <Link to={`/catalog/${encodeURIComponent(cat.name)}`}>
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li className="dropdown-divider"></li>
              <li>
                <Link to="/catalog" style={{ fontWeight: 'bold' }}>
                  All Categories
                </Link>
              </li>
            </ul>
          </li>

          <li><Link to="/catalog">Products</Link></li>
          <li><Link to="/contact">Contact</Link></li>
        </ul>
        
        {/* Mobile Menu Drawer */}
        <div className={`mobile-menu-drawer ${isMenuOpen ? 'open' : ''}`}>
          <div className="mobile-menu-header">
            <img src={isDark ? "/images/logo_mobile_white.png" : "/images/logo_mobile_black.png"} alt="PREYSON" className="mobile-logo" />
            <button className="close-btn" onClick={() => setIsMenuOpen(false)}>
              <X size={24} />
            </button>
          </div>
          <ul className="mobile-nav-links">
            <li><Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link></li>
            
            <li className="mobile-dropdown-item">
              <div 
                className="mobile-dropdown-header"
                onClick={() => setIsMobileCategoryOpen(!isMobileCategoryOpen)}
              >
                <span>Catalog</span>
                <ChevronDown size={18} className={`chevron-icon ${isMobileCategoryOpen ? 'rotate' : ''}`} />
              </div>
              
              {isMobileCategoryOpen && (
                <ul className="mobile-submenu">
                  {displayCategories.map((cat, idx) => (
                    <li key={cat.id || idx}>
                      <Link to={`/catalog/${encodeURIComponent(cat.name)}`} onClick={() => setIsMenuOpen(false)}>
                        {cat.name}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link to="/catalog" onClick={() => setIsMenuOpen(false)} style={{ fontWeight: 'bold' }}>
                      All Categories
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            <li><Link to="/catalog" onClick={() => setIsMenuOpen(false)}>Products</Link></li>
            <li><Link to="/contact" onClick={() => setIsMenuOpen(false)}>Contact</Link></li>
          </ul>
        </div>
        
        {/* Overlay for clicking outside */}
        {isMenuOpen && <div className="mobile-menu-overlay" onClick={() => setIsMenuOpen(false)}></div>}
      </div>
      
      <div className="navbar-center">
        <Link to="/" className="brand-logo">
          <img src={getDesktopLogo()} alt="PREYSON MOTO COMPANY" className="logo-img desktop-logo" />
          <img src={getMobileLogo()} alt="PREYSON" className="logo-img mobile-logo-img" />
        </Link>
      </div>
      
      <div className="navbar-right">
        <button className="icon-btn"><Search size={20} /></button>
        <Link 
          to={customerUser ? "/profile" : "/login"} 
          className="icon-btn user-btn-wrapper" 
          style={{ position: 'relative' }}
          title={customerUser ? `Profile (${customerUser.name})` : "Login"}
        >
          <User size={20} />
          {customerUser && (
            <span style={{ position: 'absolute', bottom: '2px', right: '2px', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', border: '1.5px solid var(--bg-primary)' }}></span>
          )}
        </Link>
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
