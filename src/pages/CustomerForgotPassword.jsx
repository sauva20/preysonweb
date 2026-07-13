import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './CustomerAuth.css';

export default function CustomerForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('If an account exists with this email, a reset link has been sent to your inbox.');
        setEmail(''); // Clear form
      } else {
        setError(data.error || 'Failed to process request.');
      }
    } catch (err) {
      setError('Cannot connect to server. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="customer-auth-page">
      <Navbar />
      <div className="auth-container">
        <div className="auth-box">
          <h2>RESET PASSWORD</h2>
          <p className="auth-subtitle">Enter your email and we'll send you a link to get back into your account.</p>
          
          {error && <div className="auth-error-msg">{error}</div>}
          {message && <div className="auth-error-msg" style={{ backgroundColor: '#ecfdf5', color: '#065f46' }}>{message}</div>}

          <form className="auth-form" onSubmit={handleResetPassword}>
            <div className="form-group">
              <label>Email</label>
              <input 
                type="email" 
                placeholder="Enter your email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <button type="submit" className="auth-submit-btn" disabled={isLoading}>
              {isLoading ? 'SENDING...' : 'SEND RESET LINK'}
            </button>
          </form>
          
          <div className="auth-footer">
            <p>Remembered your password? <Link to="/login">Sign in</Link></p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
