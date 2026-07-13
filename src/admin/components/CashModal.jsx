import React, { useState, useEffect } from 'react';
import { X, Delete } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import './CashModal.css';

export default function CashModal({ isOpen, onClose, onConfirm, cartItems, subtotal, tax, total }) {
  const { formatPrice } = useCurrency();
  const [received, setReceived] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setReceived('');
      setCustomerName('');
      setCustomerEmail('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNumClick = (num) => {
    setReceived(prev => prev + num);
  };

  const handleBackspace = () => {
    setReceived(prev => prev.slice(0, -1));
  };

  const handleQuickAdd = (amount) => {
    setReceived(amount.toString());
  };

  const receivedAmount = parseFloat(received) || 0;
  const changeDue = receivedAmount - total;
  const canConfirm = receivedAmount >= total;

  const handleConfirm = () => {
    if (!canConfirm) return;
    setShowConfirm(true);
  };

  const processConfirm = () => {
    setShowConfirm(false);
    onConfirm({
      received: receivedAmount,
      change: changeDue,
      customerName,
      customerEmail
    });
  };

  return (
    <div className="modal-backdrop cash-modal-backdrop" onClick={onClose}>
      <div className="cash-modal" onClick={e => e.stopPropagation()}>
        
        {/* LEFT PANEL: SUMMARY & CUSTOMER */}
        <div className="cash-modal-left">
          <div className="cash-modal-section">
            <h3 className="section-title">PAYMENT SUMMARY</h3>
            <div className="cash-items-list">
              {cartItems.map((item, idx) => (
                <div className="cash-item-row" key={idx}>
                  <div className="cash-item-info">
                    <h4>{item.name}</h4>
                    <span>SKU: {item.sku} | SIZE: {item.size}</span>
                  </div>
                  <div className="cash-item-price">
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="cash-modal-section">
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

          <div className="cash-modal-totals">
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

        {/* RIGHT PANEL: CASH ENTRY */}
        <div className="cash-modal-right">
          <div className="cash-modal-header">
            <h3>💵 CASH ENTRY</h3>
            <button className="close-btn" onClick={onClose}><X size={20} /></button>
          </div>

          <div className="cash-entry-display">
            <span className="entry-label">RECEIVED</span>
            <div className="entry-value">
              <span className="currency-symbol">Rp</span>
              {receivedAmount.toLocaleString('id-ID')}
              <span className="cursor-blink">|</span>
            </div>
          </div>

          <div className="quick-amounts">
            <button onClick={() => handleQuickAdd(total)}>Uang Pas</button>
            <button onClick={() => handleQuickAdd(50000)}>50.000</button>
            <button onClick={() => handleQuickAdd(100000)}>100.000</button>
            <button onClick={() => handleQuickAdd(200000)}>200.000</button>
          </div>

          <div className="numpad">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <button key={num} onClick={() => handleNumClick(num.toString())}>{num}</button>
            ))}
            <button onClick={() => handleNumClick('00')}>00</button>
            <button onClick={() => handleNumClick('0')}>0</button>
            <button onClick={handleBackspace} className="backspace-btn"><Delete size={20} /></button>
          </div>

          <div className="change-due">
            <span>CHANGE DUE</span>
            <span>{changeDue > 0 ? formatPrice(changeDue) : formatPrice(0)}</span>
          </div>

          <div className="cash-modal-actions">
            <button className="btn-cancel" onClick={onClose}>CANCEL</button>
            <button 
              className="btn-confirm" 
              onClick={handleConfirm}
              disabled={!canConfirm}
            >
              CONFIRM →
            </button>
          </div>
        </div>
      </div>
      
      {showConfirm && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }} onClick={e => e.stopPropagation()}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', textAlign: 'center', maxWidth: '320px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
            <h4 style={{ color: '#111', marginBottom: '12px', fontSize: '1.2rem', fontWeight: 'bold' }}>Konfirmasi Pembayaran</h4>
            <p style={{ color: '#555', marginBottom: '24px', fontSize: '0.95rem' }}>Apakah uang tunai yang diterima sudah pas dan transaksi diselesaikan?</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button style={{ padding: '10px 20px', background: '#e5e7eb', border: 'none', borderRadius: '4px', cursor: 'pointer', color: '#374151', fontWeight: '600' }} onClick={() => setShowConfirm(false)}>Batal</button>
              <button style={{ padding: '10px 20px', background: '#cf5a16', border: 'none', borderRadius: '4px', cursor: 'pointer', color: '#fff', fontWeight: '600' }} onClick={processConfirm}>Ya, Selesaikan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
