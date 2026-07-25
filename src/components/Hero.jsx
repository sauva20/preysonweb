import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Hero.css';

export default function Hero({ images = [], title = "EXPLORE THE JOURNEY OF A LIFETIME\nWITH PREYSON MOTO" }) {
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
        {title && title.trim() !== '' && (
          <h2>
            {title.split('\n').map((line, i) => (
              <React.Fragment key={i}>
                {line}
                {i !== title.split('\n').length - 1 && <br />}
              </React.Fragment>
            ))}
          </h2>
        )}
      </div>
      
      {displayImages.length > 1 && (
        <>
          <button 
            className="hero-nav-btn prev" 
            onClick={(e) => { e.stopPropagation(); setCurrentIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length); }}
          >
            <ChevronLeft size={40} />
          </button>
          <button 
            className="hero-nav-btn next" 
            onClick={(e) => { e.stopPropagation(); setCurrentIndex((prev) => (prev + 1) % displayImages.length); }}
          >
            <ChevronRight size={40} />
          </button>
          
          <div className="hero-indicators">
            {displayImages.map((_, idx) => (
              <span 
                key={idx} 
                className={`indicator ${idx === currentIndex ? 'active' : ''}`}
                onClick={() => setCurrentIndex(idx)}
              ></span>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
