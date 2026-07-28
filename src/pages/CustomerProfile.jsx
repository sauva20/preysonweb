import { getApiUrl, getBackendUrl } from '../utils/apiConfig';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { User, Package, LogOut, ShieldCheck, Mail, Phone, MapPin, Truck, Copy, CheckCircle2, Clock, XCircle, ChevronRight, ShoppingBag } from 'lucide-react';
import './CustomerProfile.css';

export default function CustomerProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('info'); // 'info', 'orders', 'security'
  const [orderFilter, setOrderFilter] = useState('ALL'); // 'ALL', 'PENDING', 'PAID', 'SHIPPED'

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('customer_user');
    const token = localStorage.getItem('customer_token');
    
    if (!token || !savedUser) {
      navigate('/login');
      return;
    }

    try {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      setFormData({
        name: parsed.name || '',
        email: parsed.email || '',
        phone: parsed.phone || '',
        address: parsed.address || ''
      });

      if (parsed.email) {
        setIsLoadingOrders(true);
        fetch(`${getApiUrl()}/orders`)
          .then(res => res.json())
          .then(data => {
            if (Array.isArray(data)) {
              const myOrders = data.filter(o => o.customerEmail?.toLowerCase() === parsed.email.toLowerCase());
              setOrders(myOrders);
            }
          })
          .catch(err => console.error("Failed to fetch customer orders:", err))
          .finally(() => setIsLoadingOrders(false));
      }
    } catch (e) {
      console.error("Error parsing customer profile:", e);
      navigate('/login');
    }
  }, [navigate]);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const updatedUser = { ...user, ...formData };
    localStorage.setItem('customer_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    
    Swal.fire({
      icon: 'success',
      title: 'Profile Updated!',
      text: 'Your account details have been updated successfully.',
      timer: 2000,
      showConfirmButton: false
    });
  };

  const [otpStep, setOtpStep] = useState(1); // 1: Request OTP, 2: Enter OTP & New Password
  const [otpInput, setOtpInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handleSendOtp = async () => {
    if (!user || !user.email) return;
    setIsSendingOtp(true);

    try {
      const res = await fetch(`${getApiUrl()}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email })
      });
      const data = await res.json();

      if (res.ok) {
        setOtpStep(2);
        Swal.fire({
          icon: 'info',
          title: 'OTP Code Sent!',
          html: `<p>A 6-digit OTP code has been sent to <strong>${user.email}</strong>.</p>
                 <div style="background:#f3f4f6; padding:12px; border-radius:8px; margin-top:10px; font-size:20px; font-weight:bold; letter-spacing:3px; color:#c66a2b;">
                   ${data.otp}
                 </div>`,
          confirmButtonColor: '#1d1d1d'
        });
      } else {
        Swal.fire({ icon: 'error', title: 'Failed to Send OTP', text: data.error || 'Please try again.', confirmButtonColor: '#1d1d1d' });
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Connection Error', text: 'Cannot connect to server.', confirmButtonColor: '#1d1d1d' });
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtpAndSavePassword = async (e) => {
    e.preventDefault();
    if (!otpInput || otpInput.trim().length < 6) {
      return Swal.fire({ icon: 'warning', title: 'Invalid OTP', text: 'Please enter the 6-digit verification code.', confirmButtonColor: '#1d1d1d' });
    }
    if (newPassword.length < 8) {
      return Swal.fire({ icon: 'warning', title: 'Password Too Short', text: 'New password must be at least 8 characters long.', confirmButtonColor: '#1d1d1d' });
    }
    if (newPassword !== confirmPassword) {
      return Swal.fire({ icon: 'warning', title: 'Password Mismatch', text: 'New password and confirmation password do not match.', confirmButtonColor: '#1d1d1d' });
    }

    setIsUpdatingPassword(true);

    try {
      const res = await fetch(`${getApiUrl()}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, otp: otpInput, newPassword })
      });
      const data = await res.json();

      if (res.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Password Updated!',
          text: 'Your password has been updated successfully via OTP verification.',
          timer: 2200,
          showConfirmButton: false
        });
        setOtpStep(1);
        setOtpInput('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        Swal.fire({ icon: 'error', title: 'Update Failed', text: data.error || 'Invalid or expired OTP code.', confirmButtonColor: '#1d1d1d' });
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Connection Error', text: 'Cannot connect to server.', confirmButtonColor: '#1d1d1d' });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleLogout = () => {
    Swal.fire({
      title: 'Sign Out Account?',
      text: 'Are you sure you want to log out from Preyson Moto?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Sign Out'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('customer_token');
        localStorage.removeItem('customer_user');
        
        Swal.fire({
          icon: 'success',
          title: 'Signed Out',
          text: 'You have been logged out successfully.',
          timer: 1500,
          showConfirmButton: false
        }).then(() => {
          navigate('/login');
        });
      }
    });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    Swal.fire({
      icon: 'success',
      title: 'Copied!',
      text: `Tracking code ${text} copied to clipboard.`,
      timer: 1500,
      showConfirmButton: false
    });
  };

  if (!user) return null;

  const getInitials = (nameStr) => {
    if (!nameStr) return 'P';
    const parts = nameStr.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0].substring(0, 2).toUpperCase();
  };

  const filteredOrders = orders.filter(o => {
    if (orderFilter === 'ALL') return true;
    const st = String(o.status || '').toUpperCase();
    if (orderFilter === 'PAID') return st === 'PAID' || st === 'PROCESSING';
    return st === orderFilter;
  });

  return (
    <div className="customer-profile-page">
      <Navbar />
      <div className="profile-container">
        {/* Profile Summary Card */}
        <div className="profile-header-card">
          <div className="profile-header-main">
            <div className="profile-avatar">
              {getInitials(user.name)}
            </div>
            <div className="profile-header-info">
              <h2>{user.name}</h2>
              <p>{user.email}</p>
              <div className="profile-badges-row">
                <span className="profile-badge">
                  <ShieldCheck size={14} /> PREYSON MEMBER
                </span>
              </div>
            </div>
          </div>

          <div className="profile-stat-pill">
            <div className="stat-item">
              <span className="stat-value">{orders.length}</span>
              <span className="stat-label">Total Orders</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-value">Active</span>
              <span className="stat-label">Account Status</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="profile-tabs-bar">
          <button 
            className={`profile-tab-btn ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            <User size={18} /> MY PROFILE
          </button>
          <button 
            className={`profile-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <Package size={18} /> PURCHASE HISTORY ({orders.length})
          </button>
          <button 
            className={`profile-tab-btn ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <ShieldCheck size={18} /> SECURITY
          </button>
          <button 
            className="profile-tab-btn"
            onClick={handleLogout}
            style={{ color: '#ef4444', marginLeft: 'auto' }}
          >
            <LogOut size={18} /> SIGN OUT
          </button>
        </div>

        {/* Tab 1: Account Info */}
        {activeTab === 'info' && (
          <div className="profile-card">
            <div className="profile-card-header">
              <h3>Personal Details & Shipping Address</h3>
            </div>
            <form onSubmit={handleSaveProfile}>
              <div className="profile-form-grid">
                <div className="profile-form-group">
                  <label>Full Name</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="profile-form-group">
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    disabled
                    style={{ opacity: 0.7, cursor: 'not-allowed' }}
                  />
                </div>

                <div className="profile-form-group">
                  <label>Phone Number</label>
                  <input 
                    type="tel" 
                    placeholder="+62 812-xxxx-xxxx"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="profile-form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Default Shipping Address</label>
                  <textarea 
                    rows="3"
                    placeholder="Street name, house number, district, city, postal code..."
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
              </div>

              <button type="submit" className="profile-save-btn">
                SAVE CHANGES
              </button>
            </form>
          </div>
        )}

        {/* Tab 2: Purchase History */}
        {activeTab === 'orders' && (
          <div className="profile-card">
            <div className="profile-card-header">
              <h3>Purchase History & Order Tracking</h3>
            </div>

            {/* Order Filter Pills */}
            <div className="purchase-history-filters">
              <button className={`order-filter-pill ${orderFilter === 'ALL' ? 'active' : ''}`} onClick={() => setOrderFilter('ALL')}>
                ALL ORDERS ({orders.length})
              </button>
              <button className={`order-filter-pill ${orderFilter === 'PENDING' ? 'active' : ''}`} onClick={() => setOrderFilter('PENDING')}>
                PENDING
              </button>
              <button className={`order-filter-pill ${orderFilter === 'PAID' ? 'active' : ''}`} onClick={() => setOrderFilter('PAID')}>
                PAID / PROCESSING
              </button>
              <button className={`order-filter-pill ${orderFilter === 'SHIPPED' ? 'active' : ''}`} onClick={() => setOrderFilter('SHIPPED')}>
                SHIPPED
              </button>
            </div>

            {isLoadingOrders ? (
              <p style={{ color: 'var(--text-secondary)' }}>Fetching purchase history...</p>
            ) : filteredOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
                <ShoppingBag size={56} style={{ opacity: 0.3, marginBottom: '16px' }} />
                <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', marginBottom: '8px' }}>No Purchase Record Found</h4>
                <p style={{ fontSize: '14px', marginBottom: '20px' }}>You haven't placed any orders in this status yet.</p>
                <button 
                  onClick={() => navigate('/catalog')}
                  className="profile-save-btn" 
                  style={{ textTransform: 'uppercase' }}
                >
                  Explore Catalog
                </button>
              </div>
            ) : (
              <div className="order-history-list">
                {filteredOrders.map(order => {
                  const statusKey = String(order.status || 'pending').toLowerCase();
                  const rawItems = order.items ? (typeof order.items === 'string' ? JSON.parse(order.items) : order.items) : [];

                  return (
                    <div key={order.id} className="order-card-premium">
                      <div className="order-card-top">
                        <div className="order-id-meta">
                          <span className="order-code">Order #{order.id}</span>
                          <span className="order-date">
                            Placed on {new Date(order.createdAt || order.date || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <span className={`order-status-badge ${statusKey}`}>
                          {statusKey === 'paid' && <CheckCircle2 size={14} />}
                          {statusKey === 'shipped' && <Truck size={14} />}
                          {statusKey === 'pending' && <Clock size={14} />}
                          {statusKey === 'cancelled' && <XCircle size={14} />}
                          {order.status || 'Pending'}
                        </span>
                      </div>

                      {/* Items Listing */}
                      <div className="order-items-grid">
                        {Array.isArray(rawItems) && rawItems.map((item, idx) => (
                          <div key={idx} className="order-item-row">
                            <img 
                              src={item.image || '/images/placeholder.png'} 
                              alt={item.name} 
                              className="order-item-thumb" 
                            />
                            <div className="order-item-details">
                              <div className="order-item-name">{item.name}</div>
                              <div className="order-item-spec">
                                Size: <strong>{item.selectedSize || item.size || 'N/A'}</strong> | Qty: <strong>{item.quantity}</strong>
                              </div>
                            </div>
                            <div className="order-item-price">
                              Rp {((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Card Footer: Courier & Total */}
                      <div className="order-card-bottom">
                        <div className="courier-info-pill">
                          <Truck size={16} color="var(--burnt-orange)" />
                          <span>
                            Courier: <strong>{order.shippingCourier?.toUpperCase() || 'REGULAR'}</strong>
                          </span>
                          {order.trackingCode && (
                            <span style={{ marginLeft: '12px' }}>
                              Tracking: <strong>{order.trackingCode}</strong>
                              <button 
                                className="copy-resi-btn" 
                                onClick={() => copyToClipboard(order.trackingCode)}
                                title="Copy Tracking Code"
                              >
                                <Copy size={12} /> Copy
                              </button>
                            </span>
                          )}
                        </div>

                        <div className="order-total-sum">
                          <div className="total-label">Total Payment</div>
                          <div className="total-amount-highlight">
                            Rp {(order.total || 0).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Security */}
        {activeTab === 'security' && (
          <div className="profile-card">
            <div className="profile-card-header">
              <h3>Security & OTP Password Verification</h3>
            </div>
            
            {otpStep === 1 ? (
              <div style={{ maxWidth: '550px' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px', lineHeight: '1.5' }}>
                  For enhanced account security, password updates require email OTP verification. An authentication OTP code will be sent to your registered email: <strong>{user.email}</strong>.
                </p>
                <button 
                  type="button" 
                  className="profile-save-btn" 
                  onClick={handleSendOtp} 
                  disabled={isSendingOtp}
                >
                  {isSendingOtp ? 'SENDING OTP...' : 'SEND OTP TO EMAIL'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleVerifyOtpAndSavePassword}>
                <div style={{ backgroundColor: 'rgba(198, 106, 43, 0.08)', padding: '14px 20px', borderRadius: '10px', marginBottom: '24px', fontSize: '13px', color: 'var(--burnt-orange)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>
                    📩 OTP code sent to <strong>{user.email}</strong>
                  </span>
                  <button 
                    type="button" 
                    onClick={handleSendOtp} 
                    disabled={isSendingOtp} 
                    style={{ background: 'none', border: 'none', color: 'var(--burnt-orange)', textDecoration: 'underline', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    Resend OTP
                  </button>
                </div>

                <div className="profile-form-grid" style={{ maxWidth: '600px' }}>
                  <div className="profile-form-group">
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

                  <div className="profile-form-group">
                    <label>New Password</label>
                    <input 
                      type="password" 
                      placeholder="Minimum 8 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="profile-form-group">
                    <label>Confirm New Password</label>
                    <input 
                      type="password" 
                      placeholder="Repeat new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    {confirmPassword && (
                      <div style={{ marginTop: '6px', fontSize: '12px', fontWeight: '600', color: newPassword === confirmPassword ? '#10b981' : '#ef4444' }}>
                        {newPassword === confirmPassword ? '✓ Password cocok!' : '✕ Password tidak cocok!'}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                  <button type="submit" className="profile-save-btn" disabled={isUpdatingPassword}>
                    {isUpdatingPassword ? 'VERIFYING...' : 'VERIFY OTP & UPDATE PASSWORD'}
                  </button>
                  <button 
                    type="button" 
                    className="profile-save-btn" 
                    onClick={() => setOtpStep(1)}
                    style={{ backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                  >
                    CANCEL
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
