import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import Swal from 'sweetalert2';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './CustomerAuth.css';

export default function CustomerLogin() {
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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/customer-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('customer_token', data.token);
        localStorage.setItem('customer_user', JSON.stringify(data.user));
        
        Swal.fire({
          icon: 'success',
          title: 'Login Berhasil!',
          text: `Selamat datang kembali, ${data.user?.name || 'Customer'}!`,
          timer: 1800,
          showConfirmButton: false
        }).then(() => {
          navigate('/profile');
        });
      } else {
        const msg = data.error || 'Email atau password salah';
        setError(msg);
        Swal.fire({
          icon: 'error',
          title: 'Login Gagal',
          text: msg,
          confirmButtonColor: '#1d1d1d'
        });
      }
    } catch (err) {
      const msg = 'Tidak dapat terhubung ke server. Silakan coba beberapa saat lagi.';
      setError(msg);
      Swal.fire({
        icon: 'error',
        title: 'Koneksi Terputus',
        text: msg,
        confirmButtonColor: '#1d1d1d'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="customer-auth-page">
      <Navbar />
      <div className="auth-container">
        <div className="auth-box">
          <h2>LOGIN</h2>
          <p className="auth-subtitle">Welcome back! Please enter your details.</p>
          
          {error && <div className="auth-error-msg">{error}</div>}

          <form className="auth-form" onSubmit={handleLogin}>
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
            
            <div className="form-group">
              <label>Password</label>
              <div className="password-input-wrapper">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button 
                  type="button" 
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <div className="form-options">
              <Link to="/forgot-password" className="forgot-password">Forgot Password?</Link>
            </div>
            
            <button type="submit" className="auth-submit-btn" disabled={isLoading}>
              {isLoading ? 'SIGNING IN...' : 'SIGN IN'}
            </button>
          </form>
          
          <div className="auth-footer">
            <p>Don't have an account? <Link to="/register">Sign up</Link></p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
