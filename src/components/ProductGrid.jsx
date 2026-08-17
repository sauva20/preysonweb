import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { usePromos } from '../context/PromoContext';
import { useCurrency } from '../context/CurrencyContext';
import { slugify } from '../utils/slugify';
import './ProductGrid.css';

export default function ProductGrid({ title, subtitle, items, columns = 4, categoryId, productIds, viewAllLink }) {
  const navigate = useNavigate();
  const { products } = useProducts();
  const { applyDiscounts } = usePromos();
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
      filtered = applyDiscounts(filtered);
      return filtered.slice(0, columns > 0 ? columns * 2 : 8); // Just show a couple of rows
    }
    
    // Default empty state
    return [];
  }, [items, products, categoryId, productIds, columns, applyDiscounts]);

  const handleViewAll = () => {
    if (viewAllLink) {
      navigate(viewAllLink);
    } else {
      navigate('/catalog');
    }
  };

  return (
    <section className="product-grid-section">
      <div className="product-grid-wrapper">
        <div className="product-grid-header">
          {title && <h2>{title}</h2>}
          {subtitle && <p>{subtitle}</p>}
        </div>
        <div className={`product-grid-container cols-${columns}`}>
          {displayItems.map((item, index) => (
            <div className="product-card" key={item.id || index} onClick={() => navigate(`/product/${item.slug || slugify(item.name) || item.id}`)}>
              <div className="product-image-wrapper">
                <div className="product-image main-img" style={{ backgroundImage: `url(${item.image})` }}></div>
                {item.aestheticImage && (
                  <div className="product-image hover-img" style={{ backgroundImage: `url(${item.aestheticImage})` }}></div>
                )}
                {(item.isSoldOut || item.stock <= 0) && (
                  <div className="product-soldout-badge">SOLD OUT</div>
                )}
              </div>
              <div className="product-info">
                <h3>{item.name}</h3>
                <p className="price">
                  {item.discountPrice ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ textDecoration: 'line-through', color: '#888', fontSize: '0.9em' }}>{formatPrice(item.price)}</span>
                        <span style={{ color: '#d92929', fontWeight: 'bold' }}>{formatPrice(item.discountPrice)}</span>
                      </div>
                      <span style={{ color: '#10b981', fontSize: '0.85em', fontWeight: 'bold' }}>
                        You saved {formatPrice(item.price - item.discountPrice)}!
                      </span>
                    </div>
                  ) : (
                    typeof item.price === 'number' ? formatPrice(item.price) : item.price
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="product-grid-footer">
          <button className="view-all-btn" onClick={handleViewAll}>
            VIEW ALL PRODUCTS
          </button>
        </div>
      </div>
    </section>
  );
}
