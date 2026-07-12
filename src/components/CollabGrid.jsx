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
        {displayCollabs.map((collab, index) => (
          <div className="collab-card" key={index}>
            <div className="collab-image" style={{ backgroundImage: `url(${collab.image})` }}>
              <div className="collab-logo-overlay">
                {collab.logoStyle === 'text' ? (
                  <h3 className="collab-logo-text">{collab.logo}</h3>
                ) : (
                  <img src={collab.logo} alt={`${collab.name} logo`} />
                )}
              </div>
            </div>
            <div className="collab-info">
              <h4>{collab.name}</h4>
              <button className="collab-btn">{collab.buttonText}</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
