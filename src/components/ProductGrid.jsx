import React from 'react';
import './ProductGrid.css';

export default function ProductGrid({ title, subtitle, items, columns = 4 }) {
  const displayItems = items && items.length > 0 ? items : Array(8).fill({
    name: 'PREYSON SIGNATURE',
    price: 'Rp 150.000',
    image: '/images/cat_tees.png', // Using an existing placeholder
  });

  return (
    <section className="product-grid-section">
      <div className="product-grid-header">
        {title && <h2>{title}</h2>}
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className={`product-grid-container cols-${columns}`}>
        {displayItems.map((item, index) => (
          <div className="product-card" key={index}>
            <div className="product-image-wrapper">
              <div className="product-image" style={{ backgroundImage: `url(${item.image})` }}></div>
            </div>
            <div className="product-info">
              <h3>{item.name}</h3>
              <p className="price">{item.price}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="product-grid-footer">
        <button className="view-all-btn">VIEW ALL</button>
      </div>
    </section>
  );
}
