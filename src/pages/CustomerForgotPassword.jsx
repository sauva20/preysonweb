import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, KeyRound, Mail, ArrowRight } from 'lucide-react';
import Swal from 'sweetalert2';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './CustomerAuth.css';

export default function CustomerForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Enter email & Send OTP, 2: Enter OTP & New Password
  const [email, setEmail] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      return Swal.fire({ icon: 'warning', title: 'Email Required', text: 'Please enter your email address.', confirmButtonColor: '#1d1d1d' });
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });

      const data = await res.json();

      if (res.ok) {
        setStep(2);
        Swal.fire({
          icon: 'info',
          title: 'OTP Verification Sent!',
          html: `<p>A 6-digit verification code has been sent to <strong>${email}</strong>.</p>
                 <div style="background:#f3f4f6; padding:12px; border-radius:8px; margin-top:10px; font-size:22px; font-weight:bold; letter-spacing:3px; color:#c66a2b;">
                   ${data.otp}
                 </div>`,
          confirmButtonColor: '#1d1d1d'
        });
      } else {
        Swal.fire({ icon: 'error', title: 'Request Failed', text: data.error || 'Failed to send OTP code.', confirmButtonColor: '#1d1d1d' });
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Connection Error', text: 'Cannot connect to server. Please try again later.', confirmButtonColor: '#1d1d1d' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!otpInput || otpInput.trim().length < 6) {
      return Swal.fire({ icon: 'warning', title: 'OTP Code Required', text: 'Please enter the 6-digit OTP verification code.', confirmButtonColor: '#1d1d1d' });
    }
    if (newPassword.length < 8) {
      return Swal.fire({ icon: 'warning', title: 'Password Too Short', text: 'New password must be at least 8 characters long.', confirmButtonColor: '#1d1d1d' });
    }
    if (newPassword !== confirmPassword) {
      return Swal.fire({ icon: 'warning', title: 'Password Mismatch', text: 'Confirmation password does not match.', confirmButtonColor: '#1d1d1d' });
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp: otpInput.trim(), newPassword })
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Password Reset Successful!',
          text: 'Your password has been reset. You can now sign in with your new password.',
          timer: 2200,
          showConfirmButton: false
        }).then(() => {
          navigate('/login');
        });
      } else {
        Swal.fire({ icon: 'error', title: 'Reset Failed', text: data.error || 'Invalid or expired OTP code.', confirmButtonColor: '#1d1d1d' });
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Connection Error', text: 'Cannot connect to server. Please try again later.', confirmButtonColor: '#1d1d1d' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="customer-auth-page">
      <Navbar />
      <div className="auth-container">
        <div className="auth-box">
          <h2>FORGOT PASSWORD</h2>
          <p className="auth-subtitle">
            {step === 1 
              ? "Enter your email address and we'll send a 6-digit OTP code to reset your password."
              : `Enter the OTP verification code sent to ${email} and your new password.`}
          </p>

          {step === 1 ? (
            <form className="auth-form" onSubmit={handleSendOtp}>
              <div className="form-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  placeholder="Enter your registered email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <button type="submit" className="auth-submit-btn" disabled={isLoading}>
                {isLoading ? 'SENDING OTP...' : 'SEND OTP VERIFICATION'}
              </button>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleResetPassword}>
              <div className="form-group">
                <label>6-Digit Verification OTP Code</label>
                <input 
                  type="text" 
                  placeholder="e.g. 592014" 
                  maxLength={6}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>New Password</label>
                <div className="password-input-wrapper">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Minimum 8 characters" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <button 
                    type="button" 
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Confirm New Password</label>
                <div className="password-input-wrapper">
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    placeholder="Confirm new password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button 
                    type="button" 
                    className="password-toggle-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex="-1"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {confirmPassword && (
                  <div style={{ marginTop: '6px', fontSize: '12px', fontWeight: '600', color: newPassword === confirmPassword ? '#10b981' : '#ef4444' }}>
                    {newPassword === confirmPassword ? '✓ Password cocok!' : '✕ Password tidak cocok!'}
                  </div>
                )}
              </div>
              
              <button type="submit" className="auth-submit-btn" disabled={isLoading}>
                {isLoading ? 'VERIFYING...' : 'VERIFY OTP & RESET PASSWORD'}
              </button>

              <button 
                type="button" 
                onClick={() => setStep(1)} 
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '13px', marginTop: '12px', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Change Email / Resend OTP
              </button>
            </form>
          )}
          
          <div className="auth-footer">
            <p>Remembered your password? <Link to="/login">Sign in</Link></p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
