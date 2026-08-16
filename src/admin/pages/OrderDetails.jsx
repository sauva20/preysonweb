import { getApiUrl, getBackendUrl } from '../../utils/apiConfig';
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Truck, CheckCircle, Package, Trash2 } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import { useActivity } from '../../context/ActivityContext';
import { useOrders } from '../../context/OrderContext';
import Swal from 'sweetalert2';
import './Orders.css'; // Reuse some admin styles

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { deleteOrder } = useOrders();
  const { formatPrice } = useCurrency();
  const { logActivity } = useActivity();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shippingError, setShippingError] = useState('');
  const [shippingLoading, setShippingLoading] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`${getApiUrl()}/orders/${id}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const processShipping = async () => {
    setShippingLoading(true);
    setShippingError('');
    try {
      const res = await fetch(`${getApiUrl()}/orders/${id}/ship`, {
        method: 'POST'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to process shipping');
      
      setOrder(data);
      logActivity({ category: 'Pesanan', title: 'Status Pesanan Disepelaskan/Dikirim', description: `Pesanan #${id} berhasil diproses untuk pengiriman (Shipped).`, status: 'success' });
    } catch (err) {
      setShippingError(err.message);
    } finally {
      setShippingLoading(false);
    }
  };

  if (loading) return <div className="admin-loading">Loading order details...</div>;
  if (!order) return <div className="admin-loading">Order not found</div>;

  return (
    <div className="admin-page">
      <div className="admin-header" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/admin/orders" className="admin-btn-secondary" style={{ padding: '8px' }}>
            <ArrowLeft size={20} />
          </Link>
          <h2>Order {order.id}</h2>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <select 
            value={order.status}
            onChange={async (e) => {
              const newStatus = e.target.value;
              try {
                const res = await fetch(`${getApiUrl()}/orders/${order.id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ status: newStatus })
                });
                if (res.ok) {
                  setOrder({...order, status: newStatus});
                  logActivity({ category: 'Pesanan', title: 'Update Status Pesanan', description: `Status pesanan ${order.id} diubah menjadi ${newStatus}.`, status: 'info' });
                  Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'Status berhasil diperbarui',
                    showConfirmButton: false,
                    timer: 3000
                  });
                } else {
                  throw new Error('Gagal update status');
                }
              } catch (err) {
                Swal.fire('Error', err.message, 'error');
              }
            }}
            className={`status-badge ${order.status.replace(/\s+/g, '-').toLowerCase()}`}
            style={{
              cursor: 'pointer',
              border: 'none',
              outline: 'none',
              appearance: 'auto'
            }}
          >
            <option value="Pending">Pending</option>
            <option value="Menunggu Verifikasi Pembayaran">Menunggu Verifikasi Pembayaran</option>
            <option value="Siap Dikirim">Siap Dikirim</option>
            <option value="Dikirim">Dikirim</option>
            <option value="Selesai">Selesai</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Completed">Completed</option>
          </select>
          <button 
            className="admin-btn-secondary" 
            style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444', borderColor: '#fecaca', backgroundColor: '#fef2f2' }}
            onClick={async () => {
              const result = await Swal.fire({
                title: 'Hapus Pesanan?',
                text: "Stok akan dikembalikan dan pesanan ini akan dihapus permanen dari sistem. Anda yakin?",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Ya, Hapus!'
              });
              
              if (result.isConfirmed) {
                try {
                  await deleteOrder(order.id);
                  Swal.fire('Terhapus!', 'Pesanan berhasil dihapus dan stok dikembalikan.', 'success');
                  logActivity({ category: 'Pesanan', title: 'Hapus Pesanan', description: `Pesanan ${order.id} dihapus dan stok dikembalikan.`, status: 'warning' });
                  navigate('/admin/orders');
                } catch (err) {
                  Swal.fire('Error', 'Gagal menghapus pesanan', 'error');
                }
              }
            }}
          >
            <Trash2 size={16} />
            Delete Order
          </button>
        </div>
      </div>

      <div className="order-details-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        
        {/* Left Column */}
        <div className="order-main-info" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div className="admin-card" style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <h3>Items Ordered</h3>
            <div className="order-items-list" style={{ marginTop: '1rem' }}>
              {order.items?.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid #eee' }}>
                  <div style={{ display: 'flex', gap: '15px' }}>
                    <img 
                      src={item.product?.image || 'https://via.placeholder.com/60'} 
                      alt={item.product?.name} 
                      style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                    />
                    <div>
                      <h4 style={{ margin: '0 0 5px 0' }}>{item.product?.name}</h4>
                      <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <div style={{ fontWeight: '600' }}>
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-card" style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <h3>Payment Summary</h3>
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666' }}>
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666' }}>
                <span>Shipping ({order.shippingCourier})</span>
                <span>{formatPrice(order.shippingCost)}</span>
              </div>
              {order.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#e74c3c' }}>
                  <span>Discount ({order.voucherCode})</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.2rem', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #eee' }}>
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div className="order-side-info" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div className="admin-card" style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <h3>Customer</h3>
            <div style={{ marginTop: '1rem', lineHeight: '1.6' }}>
              <strong>{order.customerName}</strong><br/>
              <a href={`mailto:${order.customerEmail}`} style={{ color: '#c85a17' }}>{order.customerEmail}</a><br/>
              {order.customerPhone}
            </div>
          </div>

          <div className="admin-card" style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <h3>Shipping Details</h3>
            <div style={{ marginTop: '1rem', lineHeight: '1.6' }}>
              {order.shippingAddress}<br/>
              {order.shippingCity}, {order.shippingProvince}<br/>
              {order.shippingPostal}
            </div>
            
            <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
              <h4 style={{ margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck size={18} /> {order.shippingCourier?.toUpperCase() || 'Courier'}
              </h4>
              
              {order.trackingCode ? (
                <div>
                  <div style={{ color: '#27ae60', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px' }}>
                    <CheckCircle size={16} /> AWB / Resi Generated
                  </div>
                  <p style={{ margin: '0', fontSize: '1.1rem', letterSpacing: '1px' }}><strong>{order.trackingCode}</strong></p>
                </div>
              ) : (
                order.source === 'Online' && (
                  <div>
                    <p style={{ margin: '0 0 15px 0', fontSize: '0.9rem', color: '#666' }}>No tracking code yet.</p>
                    <button 
                      className="admin-btn-primary" 
                      onClick={processShipping} 
                      disabled={shippingLoading}
                      style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }}
                    >
                      <Package size={18} /> 
                      {shippingLoading ? 'Processing...' : 'Process Shipping (Biteship)'}
                    </button>
                    {shippingError && <p style={{ color: 'red', fontSize: '0.85rem', marginTop: '10px' }}>{shippingError}</p>}
                  </div>
                )
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
