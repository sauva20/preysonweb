import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Clock, AlertCircle, CheckCircle } from 'lucide-react';
import './Payment.css';

export default function Payment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [orderInfo, setOrderInfo] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isExpired, setIsExpired] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaymentStatus();
  }, [id]);

  useEffect(() => {
    if (!orderInfo || orderInfo.status === 'Expired' || orderInfo.status === 'Paid') return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expiresAt = new Date(orderInfo.expiresAt).getTime();
      const diff = expiresAt - now;

      if (diff <= 0) {
        clearInterval(interval);
        setTimeLeft(0);
        setIsExpired(true);
        handleExpire();
      } else {
        setTimeLeft(Math.floor(diff / 1000));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [orderInfo]);

  const fetchPaymentStatus = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/orders/${id}/payment-status`);
      if (res.ok) {
        const data = await res.json();
        setOrderInfo(data);
        if (data.status === 'Expired') setIsExpired(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleExpire = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/orders/${id}/cancel`, { method: 'POST' });
      setOrderInfo(prev => ({ ...prev, status: 'Expired' }));
    } catch (e) {
      console.error(e);
    }
  };

  const handlePayNow = () => {
    if (orderInfo.midtransToken === 'dummy_token') {
      navigate('/order-success?order_id=' + id);
      return;
    }

    if (window.snap) {
      window.snap.pay(orderInfo.midtransToken, {
        onSuccess: function(result) {
          navigate('/order-success?order_id=' + id);
        },
        onPending: function(result) {
          alert('Waiting for payment!');
        },
        onError: function(result) {
          alert('Payment failed!');
        },
        onClose: function() {
          console.log('User closed popup');
        }
      });
    } else {
      alert("Midtrans snap not loaded");
    }
  };

  if (loading) return <div className="payment-loading">Loading...</div>;
  if (!orderInfo) return <div className="payment-loading">Order not found</div>;

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="payment-page">
      <Navbar />
      
      <div className="payment-container">
        <div className="payment-card">
          {orderInfo.status === 'Paid' ? (
            <div className="payment-status-box success">
              <CheckCircle size={48} />
              <h2>Payment Successful</h2>
              <p>Your order has been paid and is being processed.</p>
              <button className="btn btn-primary" onClick={() => navigate('/catalog')}>Continue Shopping</button>
            </div>
          ) : isExpired ? (
            <div className="payment-status-box expired">
              <AlertCircle size={48} />
              <h2>Payment Expired</h2>
              <p>You did not complete the payment within the time limit. Your reserved stock has been released.</p>
              <button className="btn btn-primary" onClick={() => navigate('/catalog')}>Shop Again</button>
            </div>
          ) : (
            <div className="payment-status-box pending">
              <Clock size={48} className="pulse-icon" />
              <h2>Complete Your Payment</h2>
              <p>We've reserved your items! Please complete your payment before the timer runs out to secure your order.</p>
              
              <div className="countdown-timer">
                {formatTime(timeLeft)}
              </div>
              
              <div className="order-summary-mini">
                <p><strong>Order ID:</strong> {id}</p>
              </div>

              <button className="btn btn-primary pay-btn" onClick={handlePayNow}>
                Pay Now
              </button>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
