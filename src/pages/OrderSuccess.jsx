import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { CheckCircle } from 'lucide-react';
import './Checkout.css'; // Reuse some layout styles if needed

export default function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="order-success-page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', textAlign: 'center' }}>
        <CheckCircle size={80} color="#52c41a" style={{ marginBottom: '20px' }} />
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', marginBottom: '10px' }}>Order Confirmed!</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '30px', maxWidth: '500px' }}>
          Thank you for your purchase! Your order <strong>#{orderId?.substring(0,8) || 'Unknown'}</strong> has been successfully placed and paid via Midtrans. 
          We'll send you a confirmation email shortly.
        </p>
        <Link to="/catalog" className="btn btn-primary" style={{ padding: '15px 30px', borderRadius: '30px' }}>
          Continue Shopping
        </Link>
      </div>
      <Footer />
    </div>
  );
}
