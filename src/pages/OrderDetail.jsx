import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ArrowLeft, Truck, Package, CheckCircle2, Clock, MapPin, Copy, ExternalLink, ShieldCheck, User, CreditCard } from 'lucide-react';
import './OrderDetail.css';

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [trackingData, setTrackingData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingTracking, setIsLoadingTracking] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setIsLoading(true);

    fetch(`${import.meta.env.VITE_API_URL}/orders`)
      .then(res => res.json())
      .then(allOrders => {
        if (Array.isArray(allOrders)) {
          const found = allOrders.find(o => String(o.id) === String(id));
          if (found) {
            setOrder(found);
            // Fetch live Biteship tracking if waybill tracking code exists
            if (found.trackingCode) {
              fetchTracking(found.trackingCode, found.shippingCourier);
            }
          }
        }
      })
      .catch(err => console.error("Error fetching order detail:", err))
      .finally(() => setIsLoading(false));
  }, [id]);

  const fetchTracking = (waybill, courier) => {
    setIsLoadingTracking(true);
    fetch(`${import.meta.env.VITE_API_URL}/tracking/${waybill}?courier=${courier || 'jne'}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.history) {
          setTrackingData(data);
        }
      })
      .catch(err => console.error("Error fetching tracking:", err))
      .finally(() => setIsLoadingTracking(false));
  };

  const copyResi = (code) => {
    navigator.clipboard.writeText(code);
    Swal.fire({
      icon: 'success',
      title: 'Copied!',
      text: `Tracking code ${code} copied to clipboard.`,
      timer: 1500,
      showConfirmButton: false
    });
  };

  if (isLoading) {
    return (
      <div className="order-detail-page">
        <Navbar />
        <div className="detail-container" style={{ textAlign: 'center', padding: '100px 20px', color: 'var(--text-secondary)' }}>
          Loading order details...
        </div>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-detail-page">
        <Navbar />
        <div className="detail-container" style={{ textAlign: 'center', padding: '100px 20px' }}>
          <h2>Order Not Found</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>The requested order ID #{id} does not exist.</p>
          <button className="view-detail-btn" onClick={() => navigate('/my-orders')}>
            BACK TO ORDERS
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const rawItems = order.items ? (typeof order.items === 'string' ? JSON.parse(order.items) : order.items) : [];
  const statusKey = String(order.status || 'pending').toLowerCase();

  // Determine Stepper Active Step
  let stepIndex = 1; // 1: Processed, 2: Picked up, 3: In Transit, 4: Out for delivery, 5: Delivered
  if (statusKey === 'shipped') stepIndex = 3;
  if (statusKey === 'delivered' || statusKey === 'completed') stepIndex = 5;

  return (
    <div className="order-detail-page">
      <Navbar />
      <div className="detail-container">
        <div style={{ marginBottom: '20px' }}>
          <Link to="/my-orders" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '14px', textDecoration: 'none' }}>
            <ArrowLeft size={16} /> Back to Purchase History
          </Link>
        </div>

        {/* Order Header Summary */}
        <div className="order-detail-header-card">
          <div className="order-detail-title-group">
            <h1>Order #{order.id}</h1>
            <p>
              Placed on {new Date(order.createdAt || order.date || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span className={`order-status-badge ${statusKey}`}>
              {statusKey === 'paid' && <CheckCircle2 size={14} />}
              {statusKey === 'shipped' && <Truck size={14} />}
              {statusKey === 'pending' && <Clock size={14} />}
              {order.status || 'Pending'}
            </span>
          </div>
        </div>

        {/* Real-time Biteship Package Tracking Timeline Section */}
        <div className="tracking-live-box">
          <div className="tracking-box-header">
            <h3>
              <Truck size={22} color="var(--burnt-orange)" /> LIVE PACKAGE TRACKING
            </h3>
            <span className="biteship-badge">Biteship Logistics Realtime</span>
          </div>

          {/* Stepper Progress */}
          <div className="tracking-stepper">
            <div className={`stepper-step ${stepIndex >= 1 ? 'completed' : ''}`}>
              <div className="step-icon-circle"><Package size={18} /></div>
              <span className="step-label">Processed</span>
            </div>

            <div className={`stepper-step ${stepIndex >= 2 ? 'completed' : ''}`}>
              <div className="step-icon-circle"><Truck size={18} /></div>
              <span className="step-label">Picked Up</span>
            </div>

            <div className={`stepper-step ${stepIndex >= 3 ? (stepIndex === 3 ? 'active' : 'completed') : ''}`}>
              <div className="step-icon-circle"><MapPin size={18} /></div>
              <span className="step-label">In Transit</span>
            </div>

            <div className={`stepper-step ${stepIndex >= 4 ? (stepIndex === 4 ? 'active' : 'completed') : ''}`}>
              <div className="step-icon-circle"><Truck size={18} /></div>
              <span className="step-label">Out for Delivery</span>
            </div>

            <div className={`stepper-step ${stepIndex >= 5 ? 'completed' : ''}`}>
              <div className="step-icon-circle"><CheckCircle2 size={18} /></div>
              <span className="step-label">Delivered</span>
            </div>
          </div>

          {/* Tracking Details & Checkpoints Feed */}
          {order.trackingCode ? (
            <div style={{ marginTop: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--bg-secondary)', padding: '14px 20px', borderRadius: '10px', marginBottom: '24px' }}>
                <div style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
                  Courier: <strong>{order.shippingCourier?.toUpperCase() || 'JNE'} REGULAR</strong> | Waybill Code: <strong>{order.trackingCode}</strong>
                </div>
                <button className="copy-resi-btn" onClick={() => copyResi(order.trackingCode)}>
                  <Copy size={14} /> Copy Resi
                </button>
              </div>

              {isLoadingTracking ? (
                <p style={{ color: 'var(--text-secondary)' }}>Loading live location checkpoints...</p>
              ) : trackingData && trackingData.history ? (
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '16px', letterSpacing: '0.5px' }}>
                    Live Shipment Checkpoints ({trackingData.history.length})
                  </h4>
                  <div className="checkpoint-timeline">
                    {trackingData.history.map((cp, idx) => (
                      <div key={idx} className="checkpoint-item">
                        <div className="checkpoint-note">{cp.note}</div>
                        <div className="checkpoint-meta">
                          {new Date(cp.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} &bull; Location: {cp.location || 'Hub Center'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="checkpoint-timeline">
                  <div className="checkpoint-item">
                    <div className="checkpoint-note">Package in transit via courier delivery center.</div>
                    <div className="checkpoint-meta">Updated just now &bull; Destination City</div>
                  </div>
                  <div className="checkpoint-item">
                    <div className="checkpoint-note">Handed over to courier driver at origin hub.</div>
                    <div className="checkpoint-meta">Preyson Subang Warehouse</div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-secondary)', borderRadius: '10px' }}>
              <Clock size={24} style={{ marginBottom: '8px', opacity: 0.5 }} />
              <div>Tracking code has not been issued by courier yet. Our team is preparing your package.</div>
            </div>
          )}
        </div>

        {/* Two Column Section: Items & Shipping/Payment Breakdown */}
        <div className="detail-grid-two-col">
          {/* Items List */}
          <div className="detail-section-card">
            <h3>Ordered Items ({rawItems.length})</h3>
            <div className="order-items-detail-list">
              {Array.isArray(rawItems) && rawItems.map((item, idx) => (
                <div key={idx} className="item-row-detail">
                  <img src={item.image || '/images/placeholder.png'} alt={item.name} className="item-img-box" />
                  <div className="item-info-meta">
                    <div className="item-title-name">{item.name}</div>
                    <div className="item-sub-spec">
                      Size: <strong>{item.selectedSize || item.size || 'N/A'}</strong> | Qty: {item.quantity} x Rp {(item.price || 0).toLocaleString()}
                    </div>
                  </div>
                  <div style={{ fontWeight: '700', fontSize: '15px' }}>
                    Rp {((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping & Payment Summary */}
          <div className="detail-section-card">
            <h3>Shipping & Billing Summary</h3>

            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                RECIPIENT & ADDRESS
              </div>
              <div style={{ fontWeight: '700', fontSize: '15px', color: 'var(--text-primary)' }}>
                {order.customerName || 'Customer'}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {order.customerPhone || 'N/A'} &bull; {order.customerEmail}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-primary)', marginTop: '6px', lineHeight: '1.4' }}>
                {order.shippingAddress || 'No address specified'}
                {order.shippingCity && `, ${order.shippingCity}`}
                {order.shippingProvince && `, ${order.shippingProvince}`}
                {order.shippingPostal && ` (${order.shippingPostal})`}
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                PAYMENT BREAKDOWN
              </div>

              <div className="info-row-item">
                <span className="label">Subtotal</span>
                <span className="val">Rp {(order.subtotal || order.total || 0).toLocaleString()}</span>
              </div>

              <div className="info-row-item">
                <span className="label">Shipping Fee ({order.shippingCourier?.toUpperCase() || 'JNE'})</span>
                <span className="val">Rp {(order.shippingCost || 0).toLocaleString()}</span>
              </div>

              {order.discount > 0 && (
                <div className="info-row-item">
                  <span className="label">Discount Applied</span>
                  <span className="val" style={{ color: '#10b981' }}>- Rp {order.discount.toLocaleString()}</span>
                </div>
              )}

              <div className="grand-total-row">
                <span>Grand Total</span>
                <span className="val">Rp {(order.total || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
