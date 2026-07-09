import React from 'react';
import './Hero.css';

export default function Hero() {
  return (
    <section className="hero" style={{ backgroundImage: `url('/images/hero_bg.png')` }}>
      <div className="hero-overlay"></div>
      <div className="hero-content">
        <h2>EXPLORE THE JOURNEY OF A LIFETIME<br />WITH PREYSON MOTO</h2>
      </div>
    </section>
  );
}
