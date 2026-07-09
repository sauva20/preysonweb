import React from 'react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer-section">
      <div className="footer-container">
        <div className="footer-col">
          <h3 className="footer-logo">PREYSON MOTO.</h3>
          <p>
            To create contemporary motorcycle apparel & gear that keeps up with the rapid evolution of fashion trends while still being true to the spirit of motorcycle culture.
          </p>
        </div>
        <div className="footer-col">
          <h4>USEFUL LINKS</h4>
          <ul>
            <li><a href="#">Company Profile</a></li>
            <li><a href="#">Be Our Partner</a></li>
            <li><a href="#">Our Stores</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>INFORMATION</h4>
          <ul>
            <li><a href="#">Payment Confirmation</a></li>
            <li><a href="#">Track your order</a></li>
            <li><a href="#">Return Policy</a></li>
            <li><a href="#">Contact Us</a></li>
            <li><a href="#">FAQ</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>CUSTOMER SERVICE</h4>
          <ul>
            <li><a href="#">Online Purchase & Services</a></li>
            <li>Monday - Saturday</li>
            <li>(10.00 - 17.00 WIB)</li>
            <li>WhatsApp : 08112355555</li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>COPYRIGHT © 2024 PREYSON MOTO COMPANY. ALL RIGHTS RESERVED.</p>
      </div>
    </footer>
  );
}
