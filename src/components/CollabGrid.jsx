import React from 'react';
import './CollabGrid.css';

export default function CollabGrid({ title, subtitle, collabs }) {
  const defaultCollabs = [
    {
      name: "ADIPATI BERTIGA",
      buttonText: "See more",
      image: "/images/cat_jacket.png",
      logo: "ADIPATI BERTIGA",
      logoStyle: 'text'
    },
    {
      name: "QUEENLEKHA",
      buttonText: "Coming soon",
      image: "/images/cat_tees.png",
      logo: "QUEEN LEKHA",
      logoStyle: 'text'
    },
    {
      name: "BRAP HELMET",
      buttonText: "See More",
      image: "/images/placeholder.png",
      logo: "BRAP HELMET",
      logoStyle: 'text'
    },
    {
      name: "SUZZY HELMET",
      buttonText: "See More",
      image: "/images/hero_bg.png",
      logo: "SUZZY",
      logoStyle: 'text'
    }
  ];

  const displayCollabs = collabs || defaultCollabs;

  return (
    <section className="collab-section">
      <div className="collab-header">
        {title && <h2>{title}</h2>}
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className="collab-grid">
        {displayCollabs.map((collab, index) => {
          const isComingSoon = collab.isComingSoon || collab.buttonText?.toLowerCase() === 'coming soon';
          const btnText = isComingSoon ? 'Coming soon' : (collab.buttonText || 'See More');
          
          return (
            <div 
              className={`collab-card ${isComingSoon ? 'coming-soon' : ''}`} 
              key={collab.id || index}
              onClick={() => {
                if (!isComingSoon && collab.link) {
                  window.location.href = collab.link;
                }
              }}
              style={{ cursor: isComingSoon ? 'default' : 'pointer' }}
            >
              <div className="collab-image" style={{ backgroundImage: `url(${collab.image || '/images/hero_bg.png'})` }}>
                <div className="collab-logo-overlay">
                  {collab.logoStyle === 'text' || !collab.logo ? (
                    <h3 className="collab-logo-text">{collab.logo || collab.name}</h3>
                  ) : (
                    <img src={collab.logo} alt={`${collab.name} logo`} />
                  )}
                </div>
              </div>
              <div className="collab-info">
                <h4>{collab.name || 'New Collab'}</h4>
                <button 
                  className="collab-btn" 
                  disabled={isComingSoon}
                  style={{ opacity: isComingSoon ? 0.6 : 1 }}
                >
                  {btnText}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
