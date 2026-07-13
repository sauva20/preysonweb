import React, { useState, useEffect } from 'react';
import { X, Clock } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useCurrency } from '../../context/CurrencyContext';
import { useQris } from '../../context/QrisContext';
import './QrisModal.css';

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
    // 1. Change Point of Initiation Method from Static (11) to Dynamic (12)
    // The spec says Tag 01 length 02 value 11 (010211) changes to 010212
    let qris = staticQris.replace("010211", "010212");
    
    // 2. Remove old CRC (last 4 chars of value + 4 chars of tag/len = 8 chars)
    // Tag 63, Length 04, Value XXXX = 6304XXXX
    if (qris.substring(qris.length - 8, qris.length - 4) === '6304') {
      qris = qris.slice(0, -8);
    } else {
      // In case it doesn't end with 6304, just try to find it or assume it's valid without it.
      // Most static QRIS strings end with 6304xxxx
      const idx6304 = qris.lastIndexOf('6304');
      if (idx6304 !== -1) {
        qris = qris.substring(0, idx6304);
      }
    }

    // 3. Add Tag 54 (Transaction Amount)
    const amountStr = Math.round(amount).toString();
    const amountLen = amountStr.length.toString().padStart(2, '0');
    const tag54 = `54${amountLen}${amountStr}`;
    
    // Insert tag54 before Tag 58 (Country Code '5802ID') or 59 (Merchant Name)
    const idx58 = qris.indexOf("5802ID");
    if (idx58 !== -1) {
      qris = qris.substring(0, idx58) + tag54 + qris.substring(idx58);
    } else {
      qris += tag54;
    }
    
    // 4. Add Tag 63 Length 04 back
    qris += "6304";
    
    // 5. Calculate new CRC-16
    const crc = generateCRC16(qris);
    
    return qris + crc;
  } catch (err) {
    console.error("Error generating dynamic QRIS:", err);
    return staticQris; // Fallback to static if parsing fails
  }
}

export default function QrisModal({ isOpen, onClose, onConfirm, cartItems, subtotal, tax, total }) {
  const { formatPrice } = useCurrency();
  const { qrisStaticString } = useQris();
  
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

  useEffect(() => {
    let timer;
    if (isOpen) {
      setTimeLeft(300); // Reset to 5 mins on open
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            onClose(); // Auto close if time runs out
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const dynamicQris = makeDynamicQris(qrisStaticString, total);
  
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="qris-modal-backdrop">
      <div className="qris-modal">
        {/* LEFT PANEL - Order Summary */}
        <div className="qris-modal-left">
          <h3 className="section-title">DIGITAL RECEIPT</h3>
          
          <div className="qris-items-list">
            {cartItems.map((item, idx) => (
              <div className="qris-item-row" key={idx}>
                <div className="qris-item-info">
                  <h4>{item.name}</h4>
                  <span>{item.quantity} x {formatPrice(item.price)}</span>
                </div>
                <div className="qris-item-price">{formatPrice(item.price * item.quantity)}</div>
              </div>
            ))}
          </div>

          <div className="qris-customer-details">
            <h3 className="section-title">CUSTOMER DETAILS</h3>
            <div className="form-group">
              <label>CUSTOMER NAME</label>
              <input 
                type="text" 
                placeholder="ENTER NAME" 
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>EMAIL ADDRESS</label>
              <input 
                type="email" 
                placeholder="CUSTOMER@EMAIL.COM" 
                value={customerEmail}
                onChange={e => setCustomerEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="qris-modal-totals">
            <div className="totals-row">
              <span>SUBTOTAL</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="totals-row">
              <span>TAX (8%)</span>
              <span>{formatPrice(tax)}</span>
            </div>
            <div className="totals-row grand-total">
              <span>TOTAL</span>
              <span className="accent-color">{formatPrice(total)}</span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - QR Code Display */}
        <div className="qris-modal-right">
          <div className="qris-modal-header">
            <h3>QRIS PAYMENT</h3>
            <button className="close-btn" onClick={onClose}><X size={20} /></button>
          </div>

          <div className="qris-code-container">
            <h4>SCAN TO PAY</h4>
            <p>OPEN YOUR BANKING OR E-WALLET APP</p>
            
            <div className="qr-wrapper">
              {dynamicQris ? (
                <QRCodeSVG value={dynamicQris} size={200} />
              ) : (
                <div className="qr-placeholder">QRIS Not Configured</div>
              )}
            </div>

            <div className="timer-display">
              <Clock size={16} /> VALID FOR: {formatTime(timeLeft)}
            </div>
            <div className="qris-badge">QRIS</div>
          </div>

          <div className="qris-modal-actions">
            <button 
              className="btn-confirm"
              onClick={() => setShowConfirm(true)}
            >
              PAYMENT SUCCESSFUL
            </button>
            <button className="btn-cancel" onClick={onClose}>
              CANCEL TRANSACTION
            </button>
          </div>
        </div>
      </div>
      
      {showConfirm && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, borderRadius: '8px' }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', textAlign: 'center', maxWidth: '320px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
            <h4 style={{ color: '#111', marginBottom: '12px', fontSize: '1.2rem', fontWeight: 'bold' }}>Konfirmasi Pembayaran</h4>
            <p style={{ color: '#555', marginBottom: '24px', fontSize: '0.95rem' }}>Apakah dana pembayaran sudah benar-benar masuk/diterima?</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button style={{ padding: '10px 20px', background: '#e5e7eb', border: 'none', borderRadius: '4px', cursor: 'pointer', color: '#374151', fontWeight: '600' }} onClick={() => setShowConfirm(false)}>Batal</button>
              <button style={{ padding: '10px 20px', background: '#cf5a16', border: 'none', borderRadius: '4px', cursor: 'pointer', color: '#fff', fontWeight: '600' }} onClick={() => {
                setShowConfirm(false);
                onConfirm({ customerName, customerEmail });
              }}>Ya, Sudah</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
