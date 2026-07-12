import React from 'react';
import './Banner.css';

export default function Banner({ imageUrl1, imageUrl2 }) {
  return (
    <section className="banner-section">
      <div className="banner-container">
        <div className="banner-image" style={{ backgroundImage: `url(${imageUrl1 || '/images/hero_bg.png'})` }}></div>
        {imageUrl2 && (
          <div className="banner-image" style={{ backgroundImage: `url(${imageUrl2})` }}></div>
        )}
      </div>
    </section>
  );
}
