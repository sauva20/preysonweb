import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Package, Search, ArrowRight, Truck, CheckCircle2, Clock, XCircle, ShoppingBag, ArrowLeft } from 'lucide-react';
import './OrderHistory.css';

export default function OrderHistory() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    const savedUser = localStorage.getItem('customer_user');
    const token = localStorage.getItem('customer_token');
    
    if (!token || !savedUser) {
      navigate('/login');
      return;
    }

    try {
      const parsed = JSON.parse(savedUser);
      if (parsed.email) {
        setIsLoading(true);
        fetch(`${import.meta.env.VITE_API_URL}/orders`)
          .then(res => res.json())
          .then(data => {
            if (Array.isArray(data)) {
              const myOrders = data.filter(o => o.customerEmail?.toLowerCase() === parsed.email.toLowerCase());
              setOrders(myOrders);
            }
          })
          .catch(err => console.error("Failed to fetch customer orders:", err))
          .finally(() => setIsLoading(false));
      }
    } catch (e) {
      console.error("Error parsing user profile:", e);
      navigate('/login');
    }
  }, [navigate]);

  const filteredOrders = orders.filter(o => {
    // Status Filter
    if (filterStatus !== 'ALL') {
      const st = String(o.status || '').toUpperCase();
      if (filterStatus === 'PAID') {
        if (st !== 'PAID' && st !== 'PROCESSING') return false;
      } else if (st !== filterStatus) {
        return false;
      }
    }

    // Search Query
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchId = String(o.id).toLowerCase().includes(q);
    const matchCourier = String(o.shippingCourier || '').toLowerCase().includes(q);
    const matchResi = String(o.trackingCode || '').toLowerCase().includes(q);
    return matchId || matchCourier || matchResi;
  });

  return (
    <div className="order-history-page">
      <Navbar />
      <div className="history-container">
        <div style={{ marginBottom: '20px' }}>
          <Link to="/profile" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '14px', textDecoration: 'none' }}>
            <ArrowLeft size={16} /> Back to Profile
          </Link>
        </div>

        <div className="history-header">
          <div>
            <h1>PURCHASE HISTORY</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              Track your past orders and real-time package delivery status.
            </p>
          </div>

          <div className="history-search-bar">
            <Search size={18} color="var(--text-secondary)" />
            <input 
              type="text" 
              placeholder="Search by Order ID or Tracking Code..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="history-filters-bar">
          <button className={`history-filter-pill ${filterStatus === 'ALL' ? 'active' : ''}`} onClick={() => setFilterStatus('ALL')}>
            ALL ORDERS ({orders.length})
          </button>
          <button className={`history-filter-pill ${filterStatus === 'PENDING' ? 'active' : ''}`} onClick={() => setFilterStatus('PENDING')}>
            PENDING
          </button>
          <button className={`history-filter-pill ${filterStatus === 'PAID' ? 'active' : ''}`} onClick={() => setFilterStatus('PAID')}>
            PAID / PROCESSING
          </button>
          <button className={`history-filter-pill ${filterStatus === 'SHIPPED' ? 'active' : ''}`} onClick={() => setFilterStatus('SHIPPED')}>
            SHIPPED
          </button>
        </div>

        {/* Orders Listing */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
            Loading your orders...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', backgroundColor: 'var(--bg-primary)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
            <ShoppingBag size={64} style={{ opacity: 0.3, marginBottom: '16px' }} />
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '22px', marginBottom: '8px' }}>No Purchases Found</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
              You have not placed any orders matching this criteria.
            </p>
            <button className="view-detail-btn" onClick={() => navigate('/catalog')}>
              BROWSE CATALOG
            </button>
          </div>
        ) : (
          <div className="history-orders-list">
            {filteredOrders.map(order => {
              const statusKey = String(order.status || 'pending').toLowerCase();
              const rawItems = order.items ? (typeof order.items === 'string' ? JSON.parse(order.items) : order.items) : [];

              return (
                <div key={order.id} className="order-history-card-box">
                  <div className="order-card-header-line">
                    <div>
                      <span className="order-code-title">Order #{order.id}</span>
                      <span className="order-date-sub">
                        {new Date(order.createdAt || order.date || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
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

                  {/* Items Preview */}
                  <div className="order-card-items-preview">
                    {Array.isArray(rawItems) && rawItems.map((item, idx) => (
                      <div key={idx} className="order-item-thumb-row">
                        <img src={item.image || '/images/placeholder.png'} alt={item.name} className="thumb-image" />
                        <div className="thumb-info">
                          <div className="thumb-name">{item.name}</div>
                          <div className="thumb-spec">Size: {item.selectedSize || item.size || 'N/A'} | Qty: {item.quantity}</div>
                        </div>
                        <div style={{ fontWeight: '700', fontSize: '14px' }}>
                          Rp {((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Bottom Line */}
                  <div className="order-card-footer-line">
                    <div>
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Total Payment:</span>{' '}
                      <strong style={{ fontSize: '18px', fontFamily: 'var(--font-heading)', color: 'var(--burnt-orange)' }}>
                        Rp {(order.total || 0).toLocaleString()}
                      </strong>
                    </div>

                    <button className="view-detail-btn" onClick={() => navigate(`/order-detail/${order.id}`)}>
                      TRACK PACKAGE & DETAILS <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
