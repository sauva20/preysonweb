import { getApiUrl, getBackendUrl } from '../utils/apiConfig';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useCurrency } from '../context/CurrencyContext';
import { useQris } from '../context/QrisContext';
import Swal from 'sweetalert2';
import './Payment.css';

// EMVCo CRC-16 (CCITT-FALSE) algorithm
function generateCRC16(str) {
  let crc = 0xFFFF;
  for (let c = 0; c < str.length; c++) {
    crc ^= str.charCodeAt(c) << 8;
    for (let i = 0; i < 8; i++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc = crc << 1;
      }
    }
  }
  return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
}

function makeDynamicQris(staticQris, amount) {
  if (!staticQris) return '';
  
  try {
    let qris = staticQris.replace("010211", "010212");
    if (qris.substring(qris.length - 8, qris.length - 4) === '6304') {
      qris = qris.slice(0, -8);
    } else {
      const idx6304 = qris.lastIndexOf('6304');
      if (idx6304 !== -1) {
        qris = qris.substring(0, idx6304);
      }
    }

    const amountStr = Math.round(amount).toString();
    const amountLen = amountStr.length.toString().padStart(2, '0');
    const tag54 = `54${amountLen}${amountStr}`;
    
    const idx58 = qris.indexOf("5802ID");
    if (idx58 !== -1) {
      qris = qris.substring(0, idx58) + tag54 + qris.substring(idx58);
    } else {
      qris += tag54;
    }
    
    qris += "6304";
    const crc = generateCRC16(qris);
    return qris + crc;
  } catch (err) {
    console.error("Error generating dynamic QRIS:", err);
    return staticQris; 
  }
}

export default function Payment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const { qrisStaticString } = useQris();
  const [orderInfo, setOrderInfo] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isExpired, setIsExpired] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    fetchPaymentStatus();
  }, [id]);

  useEffect(() => {
    if (!orderInfo || orderInfo.status === 'Expired' || orderInfo.status === 'Paid') return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expiresAt = new Date(orderInfo.expiresAt).getTime();
      const diff = expiresAt - now;

      if (diff <= 0) {
        clearInterval(interval);
        setTimeLeft(0);
        setIsExpired(true);
        handleExpire();
      } else {
        setTimeLeft(Math.floor(diff / 1000));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [orderInfo]);

  const fetchPaymentStatus = async () => {
    try {
      const res = await fetch(`${getApiUrl()}/orders/${id}/payment-status`);
      if (res.ok) {
        const data = await res.json();
        setOrderInfo(data);
        if (data.status === 'Expired') setIsExpired(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleExpire = async () => {
    try {
      await fetch(`${getApiUrl()}/orders/${id}/cancel`, { method: 'POST' });
      setOrderInfo(prev => ({ ...prev, status: 'Expired' }));
    } catch (e) {
      console.error(e);
    }
  };

  const handleCheckPaymentStatus = async () => {
    setIsChecking(true);
    try {
      const res = await fetch(`${getApiUrl()}/orders/${id}/notify-admin`, {
        method: 'POST'
      });
      if (res.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Notifikasi Terkirim',
          text: 'Kami telah memberitahu admin tentang pembayaran Anda. Mohon tunggu verifikasi.',
          confirmButtonText: 'Lanjut'
        }).then(() => {
          navigate('/order-success?order_id=' + id);
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Terjadi Kesalahan',
          text: 'Gagal menghubungi server. Silakan coba lagi.'
        });
      }
    } catch (error) {
      console.error("Payment check error:", error);
      Swal.fire({
        icon: 'error',
        title: 'Koneksi Error',
        text: 'Tidak dapat mengirim notifikasi saat ini.'
      });
    } finally {
      setIsChecking(false);
    }
  };

  if (loading) return <div className="payment-loading">Loading...</div>;
  if (!orderInfo) return <div className="payment-loading">Order not found</div>;

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const dynamicQris = makeDynamicQris(qrisStaticString, orderInfo.total);

  return (
    <div className="payment-page">
      <Navbar />
      
      <div className="payment-container">
        <div className="payment-card" style={{ maxWidth: '500px', margin: '0 auto' }}>
          {orderInfo.status === 'Paid' ? (
            <div className="payment-status-box success">
              <CheckCircle size={48} />
              <h2>Payment Successful</h2>
              <p>Your order has been paid and is being processed.</p>
              <button className="btn btn-primary" onClick={() => navigate('/catalog')}>Continue Shopping</button>
            </div>
          ) : isExpired ? (
            <div className="payment-status-box expired">
              <AlertCircle size={48} />
              <h2>Payment Expired</h2>
              <p>You did not complete the payment within the time limit. Your reserved stock has been released.</p>
              <button className="btn btn-primary" onClick={() => navigate('/catalog')}>Shop Again</button>
            </div>
          ) : (
            <div className="payment-status-box pending">
              <Clock size={48} className="pulse-icon" style={{ margin: '0 auto', display: 'block' }} />
              <h2 style={{ textAlign: 'center', marginTop: '1rem' }}>Selesaikan Pembayaran</h2>
              <p style={{ textAlign: 'center' }}>Harap scan QRIS di bawah ini dengan aplikasi pembayaran (GoPay, OVO, Dana, M-Banking) sebelum waktu habis.</p>
              
              <div className="countdown-timer" style={{ textAlign: 'center', fontSize: '2rem', margin: '1rem 0' }}>
                {formatTime(timeLeft)}
              </div>
              
              <div className="order-summary-mini" style={{ textAlign: 'center', background: '#f5f5f5', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                <p><strong>Order ID:</strong> {id}</p>
                <p><strong>Total Pembayaran:</strong> <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{formatPrice(orderInfo.total)}</span></p>
              </div>

              {dynamicQris ? (
                <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', display: 'inline-block', marginBottom: '1.5rem' }}>
                  <QRCodeSVG value={dynamicQris} size={220} />
                </div>
              ) : (
                <div style={{ color: 'red', margin: '1rem 0' }}>QRIS belum diatur oleh admin.</div>
              )}

              <button 
                className="btn btn-primary pay-btn" 
                onClick={handleCheckPaymentStatus}
                disabled={isChecking}
                style={{ width: '100%' }}
              >
                {isChecking ? 'Mengirim...' : 'Cek Status Pembayaran'}
              </button>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
