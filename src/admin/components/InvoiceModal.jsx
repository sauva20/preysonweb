import React from 'react';
import { useCurrency } from '../../context/CurrencyContext';
import './InvoiceModal.css';

export default function InvoiceModal({ isOpen, onClose, order, isEventMode }) {
  const { formatPrice, formatEventPrice } = useCurrency();

  if (!isOpen || !order) return null;

  const displayPrice = (amount) => isEventMode ? formatEventPrice(amount) : formatPrice(amount);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="invoice-modal-backdrop">
      <div className="invoice-modal">
        <div id="printable-invoice" className="invoice-content">
          <div className="invoice-header">
            <h2>PREYSON</h2>
            <p>Official Store</p>
          </div>
          <div className="invoice-details">
            <p><strong>Date:</strong> {new Date(order.date).toLocaleString('id-ID')}</p>
            {order.customerName && <p><strong>Customer:</strong> {order.customerName}</p>}
            {order.customerEmail && <p><strong>Email:</strong> {order.customerEmail}</p>}
            <p><strong>Payment:</strong> {order.paymentMethod}</p>
          </div>
          
          <div className="invoice-items">
            {order.items.map((item, idx) => (
              <div className="invoice-item-row" key={idx}>
                <div style={{ flex: 1, paddingRight: '10px' }}>
                  <div style={{ fontWeight: 'bold' }}>{item.name || `Product ID: ${item.productId}`}</div>
                  <div style={{ fontSize: '12px', color: '#555' }}>
                    Size: {item.size} | {item.quantity}x @ {displayPrice(item.price)}
                  </div>
                </div>
                <div style={{ fontWeight: 'bold' }}>
                  {displayPrice(item.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>

          <div className="invoice-totals">
            <div className="totals-row">
              <span>Subtotal</span>
              <span>{displayPrice(order.subtotal)}</span>
            </div>
            {order.tax > 0 && (
              <div className="totals-row">
                <span>Tax</span>
                <span>{displayPrice(order.tax)}</span>
              </div>
            )}
            <div className="totals-row grand-total">
              <span>Total</span>
              <span>{displayPrice(order.total)}</span>
            </div>
            {order.received > 0 && (
              <>
                <div className="totals-row" style={{ marginTop: '10px' }}>
                  <span>Cash Received</span>
                  <span>{displayPrice(order.received)}</span>
                </div>
                <div className="totals-row">
                  <span>Change Due</span>
                  <span>{displayPrice(order.change)}</span>
                </div>
              </>
            )}
          </div>
          
          <div className="invoice-footer-message">
            <p>Thank you for shopping with us!</p>
            <p>IG: @preyson</p>
          </div>
        </div>

        <div className="invoice-actions">
          <button className="btn-close-invoice" onClick={onClose}>TUTUP</button>
          <button className="btn-print" onClick={handlePrint}>PRINT INVOICE</button>
        </div>
      </div>
    </div>
  );
}
