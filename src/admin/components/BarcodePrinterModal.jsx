import React, { useState, useRef } from 'react';
import { X, Printer } from 'lucide-react';
import Barcode from 'react-barcode';

export default function BarcodePrinterModal({ product, onClose }) {
  // State to hold quantity of barcodes to print for each size
  const [quantities, setQuantities] = useState(
    (product.sizes || []).reduce((acc, size) => {
      acc[size.name] = 1; // Default to 1
      return acc;
    }, {})
  );

  const printAreaRef = useRef(null);

  const handlePrint = () => {
    const printContent = printAreaRef.current.innerHTML;
    const originalContent = document.body.innerHTML;

    // Create a temporary style for printing
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        body * {
          visibility: hidden;
        }
        #print-area, #print-area * {
          visibility: visible;
        }
        #print-area {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
        }
        .barcode-item {
          page-break-inside: avoid;
          margin-bottom: 20px;
          text-align: center;
        }
        @page {
          margin: 0;
        }
      }
    `;
    document.head.appendChild(style);

    // Give it a small delay for styles to apply, then print
    setTimeout(() => {
      window.print();
      document.head.removeChild(style);
    }, 100);
  };

  const sizes = product.sizes || [];

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '600px', width: '90%' }}>
        <button className="close-btn" onClick={onClose}>
          <X size={20} />
        </button>
        <h2>Print Barcodes - {product.name}</h2>
        <p style={{ marginBottom: '20px', color: '#666' }}>Select the quantity of barcodes to print for each size.</p>

        <div className="sizes-list" style={{ marginBottom: '20px', maxHeight: '300px', overflowY: 'auto' }}>
          {sizes.map(size => (
            <div key={size.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #eee' }}>
              <div>
                <strong>Size: {size.name}</strong>
                <div style={{ fontSize: '12px', color: '#666' }}>SKU: {size.sku || 'N/A'}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label>Qty:</label>
                <input
                  type="number"
                  min="0"
                  value={quantities[size.name] || 0}
                  onChange={(e) => setQuantities({ ...quantities, [size.name]: parseInt(e.target.value) || 0 })}
                  style={{ width: '60px', padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
                  disabled={!size.sku}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="btn-primary" onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Printer size={16} /> Print
          </button>
        </div>

        {/* Hidden Print Area */}
        <div style={{ display: 'none' }}>
          <div id="print-area" ref={printAreaRef}>
            {sizes.map(size => {
              const qty = quantities[size.name] || 0;
              if (qty <= 0 || !size.sku) return null;
              
              const barcodes = [];
              for (let i = 0; i < qty; i++) {
                barcodes.push(
                  <div key={`${size.name}-${i}`} className="barcode-item" style={{ marginBottom: '10px', textAlign: 'center', padding: '10px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{product.name} - {size.name}</div>
                    <Barcode value={size.sku} width={1.5} height={40} fontSize={14} margin={5} />
                  </div>
                );
              }
              return barcodes;
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
