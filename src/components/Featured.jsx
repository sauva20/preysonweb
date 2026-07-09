import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Featured.css';

export default function Featured() {
  const scrollRef = useRef(null);
  const [text, setText] = useState('');
  const fullText = "PREYSON SIGNATURE SERIES";

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      // Scroll by roughly one card width at a time, or full width if preferred. Let's do full width.
      const scrollAmount = direction === 'left' ? -clientWidth : clientWidth;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    let index = 0;
    let isDeleting = false;
    let timeoutId;

    const type = () => {
      if (!isDeleting && index < fullText.length) {
        // Typing forward
        setText(fullText.slice(0, index + 1));
        index++;
        timeoutId = setTimeout(type, 100); // Typing speed
      } else if (!isDeleting && index === fullText.length) {
        // Pause at the end
        isDeleting = true;
        timeoutId = setTimeout(type, 2000); // Wait 3 seconds before deleting
      } else if (isDeleting && index > 0) {
        // Deleting backward
        setText(fullText.slice(0, index - 1));
        index--;
        timeoutId = setTimeout(type, 50); // Deleting speed
      } else if (isDeleting && index === 0) {
        // Pause before restarting
        isDeleting = false;
        timeoutId = setTimeout(type, 800);
      }
    };

    timeoutId = setTimeout(type, 500); // Initial delay

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <section className="featured-section">
      <div className="featured-header">
        <h2 className="typing-container">
          <span className="invisible-text">{fullText}</span>
          <span className="typing-text">{text}<span className="cursor">|</span></span>
        </h2>
      </div>
      <div className="carousel-wrapper">
        <button className="nav-button left" onClick={() => scroll('left')}>
          <ChevronLeft size={32} />
        </button>
        
        <div className="featured-grid" ref={scrollRef}>
        <div className="feature-card">
          <div className="feature-img" style={{ backgroundImage: `url('/images/cat_gloves.png')` }}></div>
          <div className="feature-overlay"></div>
          <h4>GLOVES</h4>
        </div>
        <div className="feature-card">
          <div className="feature-img" style={{ backgroundImage: `url('/images/cat_tees.png')` }}></div>
          <div className="feature-overlay"></div>
          <h4>TEE SERIES</h4>
        </div>
        <div className="feature-card">
          <div className="feature-img" style={{ backgroundImage: `url('/images/cat_jacket.png')` }}></div>
          <div className="feature-overlay"></div>
          <h4>WORK JACKET</h4>
        </div>
        <div className="feature-card">
          <div className="feature-img" style={{ backgroundImage: `url('/images/cat_cap.png')` }}></div>
          <div className="feature-overlay"></div>
          <h4>CAP</h4>
        </div>
        </div>
        
        <button className="nav-button right" onClick={() => scroll('right')}>
          <ChevronRight size={32} />
        </button>
      </div>
    </section>
  );
}
