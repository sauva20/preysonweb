import { getApiUrl, getBackendUrl } from '../../utils/apiConfig';
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, User, Lock, Eye, EyeOff } from 'lucide-react';
import './AdminLogin.css';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch(`${getApiUrl()}/auth/admin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        // Redirect to admin dashboard
        navigate('/admin');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Cannot connect to server. Make sure the backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

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
          <Link to="/" className="back-link"><ArrowLeft size={16} /> Back to Store</Link>
          
          <div className="login-form-container">
            <h3>Welcome Back, Admin</h3>
            <p className="login-subtitle">Enter your credentials to access the dashboard.</p>
            
            {error && <div className="login-error-msg" style={{color: 'red', marginBottom: '15px', background: '#ffebee', padding: '10px', borderRadius: '4px'}}>{error}</div>}

            <form className="admin-login-form" onSubmit={handleLogin}>
              <div className="form-group">
                <label>Admin Email</label>
                <div className="input-wrapper">
                  <User size={18} className="input-icon" />
                  <input 
                    type="email" 
                    placeholder="admin@preyson.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ paddingLeft: '3rem' }}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Password</label>
                <div className="input-wrapper" style={{ position: 'relative' }}>
                  <Lock size={18} className="input-icon" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ paddingLeft: '3rem', paddingRight: '40px' }}
                    required
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                    style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', color: 'var(--admin-text-muted, #94a3b8)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              
              <button type="submit" className="login-submit-btn" disabled={isLoading}>
                {isLoading ? 'SIGNING IN...' : 'SIGN IN TO ADMIN'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
