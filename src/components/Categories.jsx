import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Categories.css';

export default function Categories() {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = direction === 'left' ? -clientWidth : clientWidth;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="categories-section">
      <h2 className="section-title">CATEGORIES</h2>
      <div className="carousel-wrapper">
        <button className="nav-button left" onClick={() => scroll('left')}>
          <ChevronLeft size={32} />
        </button>
        
        <div className="categories-grid" ref={scrollRef}>
        <div className="category-card">
          <div className="category-img" style={{ backgroundImage: `url('/images/cat_gloves.png')` }}></div>
          <div className="card-overlay"></div>
          <div className="card-content">
            <h3>GLOVES</h3>
            <button className="btn">DISCOVER NOW</button>
          </div>
        </div>
        <div className="category-card">
          <div className="category-img" style={{ backgroundImage: `url('/images/cat_jacket.png')` }}></div>
          <div className="card-overlay"></div>
          <div className="card-content">
            <h3>JACKET</h3>
            <button className="btn">DISCOVER NOW</button>
          </div>
        </div>
        </div>
        
        <button className="nav-button right" onClick={() => scroll('right')}>
          <ChevronRight size={32} />
        </button>
      </div>
    </section>
  );
}
