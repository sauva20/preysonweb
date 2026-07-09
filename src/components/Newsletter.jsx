import React from 'react';
import './Newsletter.css';

export default function Newsletter() {
  return (
    <section className="newsletter-section" style={{ backgroundImage: `url('/images/footer_bg.png')` }}>
      <div className="newsletter-overlay"></div>
      <div className="newsletter-content">
        <h2>Stay Up to Date with All News<br/>and Exclusive Offers</h2>
        <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
          <input type="email" placeholder="Your Email" required />
          <button type="submit" className="btn btn-primary">SUBSCRIBE NOW</button>
        </form>
      </div>
    </section>
  );
}
