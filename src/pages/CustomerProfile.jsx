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
        fetch(`${import.meta.env.VITE_API_URL}/orders`)
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

  const handleSaveSecurity = (e) => {
    e.preventDefault();
    if (securityData.newPassword.length < 8) {
      return Swal.fire({
        icon: 'warning',
        title: 'Password Too Short',
        text: 'New password must be at least 8 characters long.',
        confirmButtonColor: 'var(--burnt-orange)'
      });
    }
    if (securityData.newPassword !== securityData.confirmPassword) {
      return Swal.fire({
        icon: 'warning',
        title: 'Password Mismatch',
        text: 'New password and confirmation password do not match.',
        confirmButtonColor: 'var(--burnt-orange)'
      });
    }

    Swal.fire({
      icon: 'success',
      title: 'Password Changed!',
      text: 'Your password has been updated successfully.',
      timer: 2000,
      showConfirmButton: false
    });

    setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' });
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
              <h3>Security & Password Management</h3>
            </div>
            <form onSubmit={handleSaveSecurity}>
              <div className="profile-form-grid" style={{ maxWidth: '600px' }}>
                <div className="profile-form-group">
                  <label>Current Password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    value={securityData.currentPassword}
                    onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                    required
                  />
                </div>

                <div className="profile-form-group">
                  <label>New Password</label>
                  <input 
                    type="password" 
                    placeholder="Minimum 8 characters"
                    value={securityData.newPassword}
                    onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                    required
                  />
                </div>

                <div className="profile-form-group">
                  <label>Confirm New Password</label>
                  <input 
                    type="password" 
                    placeholder="Repeat new password"
                    value={securityData.confirmPassword}
                    onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="profile-save-btn">
                UPDATE PASSWORD
              </button>
            </form>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
