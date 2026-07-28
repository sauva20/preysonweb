import { getApiUrl, getBackendUrl } from '../utils/apiConfig';
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import Swal from 'sweetalert2';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './CustomerAuth.css';

export default function CustomerRegister() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const getPasswordStrength = (pass) => {
    let score = 0;
    if (!pass) return { label: '', color: 'transparent', width: '0%' };
    if (pass.length >= 8) score += 1;
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score += 1;
    if (/\d/.test(pass)) score += 1;
    if (/[^a-zA-Z\d]/.test(pass)) score += 1;

    if (pass.length < 8) return { label: 'Too Short (Min 8 chars)', color: '#ef4444', width: '25%' };
    if (score <= 2) return { label: 'Weak', color: '#f59e0b', width: '50%' };
    if (score === 3) return { label: 'Good', color: '#3b82f6', width: '75%' };
    return { label: 'Strong', color: '#10b981', width: '100%' };
  };

  const strength = getPasswordStrength(password);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      const msg = 'Password minimal harus 8 karakter!';
      setError(msg);
      Swal.fire({ icon: 'warning', title: 'Password Terlalu Pendek', text: msg, confirmButtonColor: '#1d1d1d' });
      return;
    }
    if (password !== confirmPassword) {
      const msg = 'Konfirmasi password tidak cocok dengan password di atas!';
      setError(msg);
      Swal.fire({ icon: 'warning', title: 'Password Tidak Cocok', text: msg, confirmButtonColor: '#1d1d1d' });
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${getApiUrl()}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('customer_token', data.token);
        localStorage.setItem('customer_user', JSON.stringify(data.user));
        
        Swal.fire({
          icon: 'success',
          title: 'Registrasi Berhasil!',
          text: `Selamat bergabung di Preyson Moto Company, ${data.user?.name || name}!`,
          timer: 2000,
          showConfirmButton: false
        }).then(() => {
          navigate('/profile');
        });
      } else {
        const msg = data.error || 'Pendaftaran akun gagal';
        setError(msg);
        Swal.fire({
          icon: 'error',
          title: 'Registrasi Gagal',
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
          <h2>CREATE ACCOUNT</h2>
          <p className="auth-subtitle">Join the Preyson community today.</p>
          
          {error && <div className="auth-error-msg">{error}</div>}

          <form className="auth-form" onSubmit={handleRegister}>
            <div className="form-group">
              <label>Full Name</label>
              <input 
                type="text" 
                placeholder="Enter your name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

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
                  placeholder="Create a password" 
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
              {password && (
                <div className="password-strength-container">
                  <div className="strength-bar-bg">
                    <div 
                      className="strength-bar-fill" 
                      style={{ width: strength.width, backgroundColor: strength.color }}
                    ></div>
                  </div>
                  <span className="strength-label" style={{ color: strength.color }}>
                    {strength.label}
                  </span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Verify Password</label>
              <div className="password-input-wrapper">
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  placeholder="Confirm your password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button 
                  type="button" 
                  className="password-toggle-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex="-1"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {confirmPassword && (
                <div style={{ marginTop: '6px', fontSize: '12px', fontWeight: '600', color: password === confirmPassword ? '#10b981' : '#ef4444' }}>
                  {password === confirmPassword ? '✓ Password cocok!' : '✕ Password tidak cocok / tidak sama!'}
                </div>
              )}
            </div>
            
            <button type="submit" className="auth-submit-btn" disabled={isLoading}>
              {isLoading ? 'CREATING ACCOUNT...' : 'REGISTER'}
            </button>
          </form>
          
          <div className="auth-footer">
            <p>Already have an account? <Link to="/login">Sign in</Link></p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
