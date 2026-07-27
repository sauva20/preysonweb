import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer-section">
      <div className="footer-container">
        <div className="footer-col">
          <h3 className="footer-logo">PREYSON MOTO COMPANY.</h3>
          <p>
            Every journey made a mark, every miles represent it riders. PREYSON is suited for you who those believe that every mark tells everything. We provide the riding accesories and apparel in a raw way and a raw soul.
          </p>
        </div>
        <div className="footer-col">
          <h4>USEFUL LINKS</h4>
          <ul>
            <li><Link to="/contact">Contact Us</Link></li>
            <li><a href="#">Our Stores</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>INFORMATION</h4>
          <ul>
            <li><a href="#">Payment Confirmation</a></li>
            <li><a href="#">Track your order</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>CUSTOMER SERVICE</h4>
          <ul>
            <li><a href="#">Online Purchase & Services</a></li>
            <li>Monday - Saturday</li>
            <li>(10.00 - 17.00 WIB)</li>
            <li>WhatsApp : +62 852 8713 9337</li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>COPYRIGHT © 2024 PREYSON MOTO COMPANY. ALL RIGHTS RESERVED.</p>
      </div>
    </footer>
  );
}
