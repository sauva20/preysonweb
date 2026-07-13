import React, { useState, useEffect } from 'react';
import './Hero.css';

export default function Hero({ images = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const displayImages = images && images.length > 0 ? images.filter(Boolean) : ['/images/hero_bg.png'];

  useEffect(() => {
    if (displayImages.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayImages.length);
    }, 5000); // Change image every 5 seconds
    
    return () => clearInterval(interval);
  }, [displayImages.length]);

  return (
    <section className="hero">
      {displayImages.map((img, idx) => (
        <div 
          key={idx} 
          className={`hero-bg ${idx === currentIndex ? 'active' : ''}`}
          style={{ backgroundImage: `url('${img}')` }}
        ></div>
      ))}
      <div className="hero-overlay"></div>
      <div className="hero-content">
        <h2>EXPLORE THE JOURNEY OF A LIFETIME<br />WITH PREYSON MOTO</h2>
      </div>
      
      {displayImages.length > 1 && (
        <div className="hero-indicators">
          {displayImages.map((_, idx) => (
            <span 
              key={idx} 
              className={`indicator ${idx === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(idx)}
            ></span>
          ))}
        </div>
      )}
    </section>
  );
}
