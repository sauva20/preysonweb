import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { Filter, X, ChevronDown, ShoppingBag, Plus } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './Catalog.css';

export default function Catalog() {
  const { products } = useProducts();
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  
  // State for filters
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeSize, setActiveSize] = useState('All');
  const [sortOption, setSortOption] = useState('newest');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  
  // Quick Add State
  const [quickAddProduct, setQuickAddProduct] = useState(null);
  const [selectedQuickSize, setSelectedQuickSize] = useState('');

  const categories = ['All', 'Gloves', 'Tee Series', 'Work Jackets', 'Cap'];
  const sizes = ['All', 'S', 'M', 'L', 'XL', 'XXL', 'All Size'];

  // Formatting currency
  const formatRupiah = formatPrice;

  // Filter and Sort Logic
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    // Filter by category
    if (activeCategory !== 'All') {
      result = result.filter(p => {
        const catName = typeof p.category === 'object' && p.category !== null ? p.category.name : p.category;
        return catName === activeCategory;
      });
    }

    // Filter by size
    if (activeSize !== 'All') {
      result = result.filter(p => p.sizes && p.sizes.includes(activeSize));
    }

    // Sort
    switch (sortOption) {
      case 'price_low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        result.sort((a, b) => b.id - a.id);
        break;
      case 'oldest':
        result.sort((a, b) => a.id - b.id);
        break;
      case 'popular':
        result.sort((a, b) => b.sold - a.sold);
        break;
      case 'name_asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name_desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }

    return result;
  }, [products, activeCategory, activeSize, sortOption]);

  const handleAddToCart = () => {
    if (!selectedQuickSize) {
      alert("Please select a size first");
      return;
    }
    addToCart(quickAddProduct, selectedQuickSize, 1);
    setQuickAddProduct(null);
    setSelectedQuickSize('');
  };

  const openQuickAdd = (e, product) => {
    e.stopPropagation(); // Prevent card click
    setQuickAddProduct(product);
    setSelectedQuickSize(''); // Reset size
  };

  return (
    <div className="catalog-page">
      <Navbar />

      <div className="catalog-main">
        {/* Top Filter Bar (Allbirds style) */}
        <div className="catalog-top-bar">
          <button className="top-filter-btn" onClick={() => setIsFilterDrawerOpen(true)}>
            <Filter size={16} />
            <span>FILTER</span>
            <span className="product-count">({filteredAndSortedProducts.length} products)</span>
          </button>

          <div className="top-sort-wrapper">
            <select 
              value={sortOption} 
              onChange={(e) => setSortOption(e.target.value)}
              className="top-sort-select"
            >
              <option value="newest">FEATURED: NEWEST</option>
              <option value="oldest">OLDEST</option>
              <option value="popular">MOST POPULAR</option>
              <option value="price_low">PRICE: LOW TO HIGH</option>
              <option value="price_high">PRICE: HIGH TO LOW</option>
              <option value="name_asc">A - Z</option>
              <option value="name_desc">Z - A</option>
            </select>
            <ChevronDown className="sort-icon" size={16} />
          </div>
        </div>

        {/* Product Grid */}
        <div className="catalog-content">
          {filteredAndSortedProducts.length === 0 ? (
            <div className="empty-state">
              <ShoppingBag size={48} className="empty-icon" />
              <h3>No products found</h3>
              <p>Try changing your filter criteria.</p>
              <button className="btn clear-btn mt-4" onClick={() => { setActiveCategory('All'); setActiveSize('All'); }}>Clear Filters</button>
            </div>
          ) : (
            <div className="catalog-grid">
              {filteredAndSortedProducts.map(product => (
                <div 
                  className="catalog-card" 
                  key={product.id}
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  <div className="catalog-image-bg">
                    <div 
                      className="catalog-product-image main-img" 
                      style={{ backgroundImage: `url(${product.image || '/images/hero_bg.png'})` }}
                    ></div>
                    {product.aestheticImage && (
                      <div 
                        className="catalog-product-image hover-img" 
                        style={{ backgroundImage: `url(${product.aestheticImage})` }}
                      ></div>
                    )}
                    {product.stock === 0 && <span className="product-badge out-of-stock">SOLD OUT</span>}
                    

                  </div>
                  <div className="catalog-product-info">
                    <h3>{product.name}</h3>
                    <p className="category">{typeof product.category === 'object' && product.category !== null ? product.category.name : product.category}</p>
                    <p className="price">{formatRupiah(product.price)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Filter Drawer */}
      <div className={`filter-drawer ${isFilterDrawerOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <h2>FILTERS</h2>
          <button className="close-drawer-btn" onClick={() => setIsFilterDrawerOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <div className="drawer-body">
          {/* Category Filter */}
          <div className="filter-group">
            <h4>Category</h4>
            <div className="filter-options">
              {categories.map(cat => (
                <button 
                  key={cat}
                  className={`filter-pill ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Size Filter */}
          <div className="filter-group">
            <h4>Size</h4>
            <div className="filter-options size-grid">
              {sizes.map(size => (
                <button 
                  key={size}
                  className={`filter-pill ${activeSize === size ? 'active' : ''}`}
                  onClick={() => setActiveSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="drawer-footer">
          <button 
            className="btn clear-btn" 
            onClick={() => { setActiveCategory('All'); setActiveSize('All'); }}
          >
            Clear All
          </button>
          <button 
            className="btn apply-btn" 
            onClick={() => setIsFilterDrawerOpen(false)}
          >
            Show {filteredAndSortedProducts.length} Results
          </button>
        </div>
      </div>

      {isFilterDrawerOpen && (
        <div className="drawer-overlay" onClick={() => setIsFilterDrawerOpen(false)}></div>
      )}

      {/* Quick Add Modal */}
      {quickAddProduct && (
        <div className="quick-add-modal-overlay" onClick={() => setQuickAddProduct(null)}>
          <div className="quick-add-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Select Size</h3>
              <button className="close-modal-btn" onClick={() => setQuickAddProduct(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p className="product-name">{quickAddProduct.name}</p>
              <div className="size-selector">
                {quickAddProduct.sizes && quickAddProduct.sizes.length > 0 ? (
                  quickAddProduct.sizes.map(size => (
                    <button 
                      key={size}
                      className={`size-btn ${selectedQuickSize === size ? 'selected' : ''}`}
                      onClick={() => setSelectedQuickSize(size)}
                    >
                      {size}
                    </button>
                  ))
                ) : (
                  <p>No sizes available</p>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-primary add-to-cart-submit-btn" 
                onClick={handleAddToCart}
                disabled={!selectedQuickSize}
              >
                Add to Cart - {formatRupiah(quickAddProduct.price)}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
