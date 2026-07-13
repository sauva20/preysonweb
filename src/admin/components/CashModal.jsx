import React, { useState, useEffect } from 'react';
import { X, Delete } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import './CashModal.css';

export default function CashModal({ isOpen, onClose, onConfirm, cartItems, subtotal, tax, total }) {
  const { formatPrice } = useCurrency();
  const [received, setReceived] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

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
    </div>
  );
}
