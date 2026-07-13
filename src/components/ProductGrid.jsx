import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { useCurrency } from '../context/CurrencyContext';
import './ProductGrid.css';

export default function ProductGrid({ title, subtitle, items, columns = 4, categoryId, productIds, viewAllLink }) {
  const navigate = useNavigate();
  const { products } = useProducts();
  const { formatPrice } = useCurrency();

  const displayItems = useMemo(() => {
    if (items && items.length > 0) return items;
    
    let filtered = products;
    if (filtered && filtered.length > 0) {
      if (categoryId) {
        filtered = filtered.filter(p => p.categoryId === parseInt(categoryId) || p.categoryId === categoryId);
      } else if (productIds && productIds.length > 0) {
        filtered = filtered.filter(p => productIds.includes(p.id));
      }
      return filtered.slice(0, columns > 0 ? columns * 2 : 8); // Just show a couple of rows
    }
    
    // Default empty state
    return [];
  }, [items, products, categoryId, productIds, columns]);

  const handleViewAll = () => {
    if (viewAllLink) {
      navigate(viewAllLink);
    } else {
      navigate('/catalog');
    }
  };

  return (
    <section className="product-grid-section">
      <div className="product-grid-header">
        {title && <h2>{title}</h2>}
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className={`product-grid-container cols-${columns}`}>
        {displayItems.map((item, index) => (
          <div className="product-card" key={item.id || index} onClick={() => navigate(`/product/${item.id}`)}>
            <div className="product-image-wrapper">
              <div className="product-image" style={{ backgroundImage: `url(${item.image})` }}></div>
            </div>
            <div className="product-info">
              <h3>{item.name}</h3>
              <p className="price">
                {typeof item.price === 'number' 
                  ? formatPrice(item.price) 
                  : item.price}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="product-grid-footer">
        <button className="view-all-btn" onClick={handleViewAll}>VIEW ALL</button>
      </div>
    </section>
  );
}
