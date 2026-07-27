import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './Contact.css';

export default function Contact() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="contact-page-wrapper">
      <Navbar />
      
      <main className="contact-page">
        <div className="contact-container">
          {/* Left Column: Image & Contact Info */}
          <div className="contact-left">
            <div className="contact-hero-image-wrapper">
              <img 
                src="/images/contact_hero.png" 
                alt="Preyson Rider" 
                className="contact-hero-img" 
              />
            </div>
            
            <div className="contact-info-block">
              <h2 className="contact-section-title">CONTACT US</h2>
              <div className="contact-details">
                <p className="company-name">PREYSON MOTO COMPANY</p>
                <p>Jalan Otto Iskandardinata 115, Subang, Jawa Barat, Indonesia</p>
                <p>
                  <a href="tel:+6285287139337">+62 852 - 8713 - 9337</a>
                </p>
                <p>
                  <a href="mailto:Preyson.moto@gmail.com">Preyson.moto@gmail.com</a>
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Logo & About Text */}
          <div className="contact-right">
            <img 
              src="/images/logo.png" 
              alt="PREYSON MOTO COMPANY" 
              className="contact-brand-logo" 
            />
            
            <h2 className="about-section-title">ABOUT PREYSON MOTO</h2>
            
            <p className="about-text">
              Berawal dari kecintaan kami pada roda dua, Preyson Moto hadir untuk jadi teman setia di setiap perjalananmu. Kami percaya setiap jahitan punya cerita, dan setiap produk punya jiwa. Dibuat dengan passion buat kamu yang menghargai kebebasan di atas dua roda. Karena bagi kami, berkendara bukan sekadar soal sampai di tujuan, tapi tentang bagaimana kamu menikmati setiap kilometernya. Selamat datang di Preyson.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
