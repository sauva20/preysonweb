import React from 'react';
import './Banner.css';

export default function Banner({ images, imageUrl1, imageUrl2 }) {
  const displayImages = images && images.length > 0 
    ? images.filter(Boolean) 
    : [imageUrl1, imageUrl2].filter(Boolean);

  if (!displayImages || displayImages.length === 0) {
    return null;
  }

  return (
    <section className="banner-section">
      <div className="banner-container">
        {displayImages.map((img, i) => (
          <div key={i} className="banner-image" style={{ backgroundImage: `url(${img})` }}></div>
        ))}
      </div>
    </section>
  );
}
