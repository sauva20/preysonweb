import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Search, Package, Mail, ArrowRight, Truck } from 'lucide-react';
import './TrackOrder.css';

export default function TrackOrder() {
  const navigate = useNavigate();
  const [orderCode, setOrderCode] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleTrackOrder = async (e) => {
    e.preventDefault();

    if (!orderCode.trim()) {
      return Swal.fire({
        icon: 'warning',
        title: 'Order Code Required',
        text: 'Please enter your Order Code or ID.',
        confirmButtonColor: 'var(--burnt-orange)'
      });
    }

    setIsLoading(true);

    try {
      // Clean order ID if user inputs "ORD-12" or "#12"
      const cleanId = orderCode.trim().replace(/^#|^ORD-/i, '');

      const res = await fetch(`${import.meta.env.VITE_API_URL}/orders`);
      const allOrders = await res.json();

      if (Array.isArray(allOrders)) {
        const found = allOrders.find(o => {
          const matchId = String(o.id) === cleanId || String(o.id) === orderCode.trim();
          if (!matchId) return false;

          // Verify email/phone if provided
          if (emailOrPhone.trim()) {
            const inputLower = emailOrPhone.trim().toLowerCase();
            const emailMatch = String(o.customerEmail || '').toLowerCase().includes(inputLower);
            const phoneMatch = String(o.customerPhone || '').toLowerCase().includes(inputLower);
            const nameMatch = String(o.customerName || '').toLowerCase().includes(inputLower);
            return emailMatch || phoneMatch || nameMatch;
          }
          return true;
        });

        if (found) {
          Swal.fire({
            icon: 'success',
            title: 'Order Found!',
            text: 'Redirecting to your order tracking details...',
            timer: 1500,
            showConfirmButton: false
          }).then(() => {
            navigate(`/order-detail/${found.id}`);
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Order Not Found',
            text: 'We could not find an order matching the provided Order Code and Email/Phone. Please double-check your receipt.',
            confirmButtonColor: '#1d1d1d'
          });
        }
      } else {
        throw new Error('Failed to search orders');
      }
    } catch (err) {
      console.error("Error tracking order:", err);
      Swal.fire({
        icon: 'error',
        title: 'Search Error',
        text: 'Cannot connect to server. Please try again later.',
        confirmButtonColor: '#1d1d1d'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="track-order-page">
      <Navbar />
      <div className="track-order-container">
        <div className="track-order-card">
          <div className="track-icon-wrapper">
            <Truck size={36} />
          </div>

          <h1>TRACK YOUR ORDER</h1>
          <p>
            Enter your Order Code and Email Address below to check the real-time shipping status and location of your package.
          </p>

          <form onSubmit={handleTrackOrder} className="track-form">
            <div className="track-form-group">
              <label>Order Code / ID</label>
              <div className="track-input-wrapper">
                <Package className="track-input-icon" size={18} />
                <input 
                  type="text" 
                  placeholder="e.g. 12 or ORD-1002"
                  value={orderCode}
                  onChange={(e) => setOrderCode(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="track-form-group">
              <label>Email Address or Phone Number</label>
              <div className="track-input-wrapper">
                <Mail className="track-input-icon" size={18} />
                <input 
                  type="text" 
                  placeholder="e.g. customer@example.com or 0812xxxx"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="track-submit-btn" disabled={isLoading}>
              {isLoading ? 'SEARCHING ORDER...' : 'TRACK PACKAGE'} <ArrowRight size={18} />
            </button>
          </form>

          <div className="track-help-text">
            💡 <strong>Need help?</strong> You can find your Order Code in the confirmation invoice sent to your email after checkout.
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
