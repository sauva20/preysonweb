import React from 'react';
import { ArrowLeft, User, Lock } from 'lucide-react';
import './Login.css';

export default function Login() {
  return (
    <div className="login-page">
      <div className="login-split">
        <div className="login-image-side" style={{ backgroundImage: "url('/images/hero_bg.png')" }}>
          <div className="login-image-overlay">
            <img src="/images/logo.png" alt="Preyson" className="login-brand-logo" />
            <h2>ADMINISTRATION<br/>PORTAL</h2>
            <p>Manage your inventory, collaborations, and website content.</p>
          </div>
        </div>
        
        <div className="login-form-side">
          <a href="#" className="back-link"><ArrowLeft size={16} /> Back to Store</a>
          
          <div className="login-form-container">
            <h3>Welcome Back</h3>
            <p className="login-subtitle">Enter your credentials to access the dashboard.</p>
            
            <form className="admin-login-form" onSubmit={(e) => e.preventDefault()}>
              <div className="form-group">
                <label>Email or Username</label>
                <div className="input-wrapper">
                  <User size={18} className="input-icon" />
                  <input type="text" placeholder="admin@preyson.com" />
                </div>
              </div>
              
              <div className="form-group">
                <label>Password</label>
                <div className="input-wrapper">
                  <Lock size={18} className="input-icon" />
                  <input type="password" placeholder="••••••••" />
                </div>
              </div>
              
              <div className="form-options">
                <label className="remember-me">
                  <input type="checkbox" />
                  <span>Remember me</span>
                </label>
                <a href="#" className="forgot-password">Forgot Password?</a>
              </div>
              
              <button type="submit" className="login-submit-btn">SIGN IN</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
