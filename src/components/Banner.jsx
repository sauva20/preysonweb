import React from 'react';
import './Banner.css';

export default function Banner({ images, imageUrl1, imageUrl2 }) {
  const displayImages = images && images.length > 0 
    ? images 
    : [imageUrl1 || '/images/hero_bg.png', imageUrl2].filter(Boolean);

  return (
    <section className="banner-section">
      <div className="banner-container">
        {displayImages.map((img, i) => (
          <div key={i} className="banner-image" style={{ backgroundImage: `url(${img || '/images/hero_bg.png'})` }}></div>
        ))}
      </div>
    </section>
  );
}
