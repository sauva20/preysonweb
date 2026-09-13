import React, { useState, useRef, useEffect } from 'react';
import { X, Scan, CheckCircle, AlertTriangle } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import { useActivity } from '../../context/ActivityContext';

export default function StockScannerModal({ onClose }) {
  const { scanAddStock } = useProducts();
  const { logActivity } = useActivity();
  const [sku, setSku] = useState('');
  const [qty, setQty] = useState(1);
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', message: string, product: object }
  const [isScanning, setIsScanning] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    // Focus the input immediately when modal opens
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sku.trim()) return;

    setIsScanning(true);
    setStatus(null);
    try {
      const updatedProduct = await scanAddStock(sku.trim(), qty);
      
      // Find the specific size we just updated to show in the success message
      let sizeName = '';
      try {
        const sizes = JSON.parse(updatedProduct.sizes || '[]');
        const matchedSize = sizes.find(s => s.sku === sku.trim());
        if (matchedSize) sizeName = matchedSize.name;
      } catch (e) {}

      setStatus({
        type: 'success',
        message: `Stock added! +${qty} for ${updatedProduct.name} (Size: ${sizeName})`,
        product: updatedProduct
      });

      logActivity({
        category: 'Inventory',
        title: 'Stock In via Barcode',
        description: `Added +${qty} stock to SKU: ${sku.trim()} (${updatedProduct.name} - ${sizeName})`,
        status: 'success'
      });

    } catch (err) {
      setStatus({
        type: 'error',
        message: err.message || 'SKU not found or error adding stock'
      });
    } finally {
      setIsScanning(false);
      setSku('');
      // Refocus input for the next scan
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 100);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '500px', width: '90%', textAlign: 'center' }}>
        <button className="close-btn" onClick={onClose}>
          <X size={20} />
        </button>
        
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px', color: '#10b981' }}>
          <Scan size={48} />
        </div>
        
        <h2>Scan to Add Stock</h2>
        <p style={{ marginBottom: '20px', color: '#666', fontSize: '14px' }}>
          Scan a barcode or type the SKU and press Enter. The stock will be immediately added to the system.
        </p>

        <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', alignItems: 'center', marginBottom: '15px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px', textAlign: 'left', color: '#666' }}>Quantity per scan:</label>
              <input
                type="number"
                min="1"
                value={qty}
                onChange={(e) => setQty(parseInt(e.target.value) || 1)}
                style={{ width: '80px', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '16px', textAlign: 'center' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px', textAlign: 'left', color: '#666' }}>SKU Barcode:</label>
              <input
                ref={inputRef}
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="Scan barcode here..."
                disabled={isScanning}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid #10b981', fontSize: '16px', outline: 'none' }}
                autoComplete="off"
              />
            </div>
          </div>
          <button type="submit" disabled={isScanning || !sku.trim()} className="btn-primary" style={{ width: '100%', padding: '12px', display: 'none' }}>
            {isScanning ? 'Processing...' : 'Submit'}
          </button>
        </form>

        {status && (
          <div style={{ 
            padding: '15px', 
            borderRadius: '8px', 
            backgroundColor: status.type === 'success' ? '#ecfdf5' : '#fef2f2',
            border: `1px solid ${status.type === 'success' ? '#10b981' : '#ef4444'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            textAlign: 'left'
          }}>
            {status.type === 'success' ? <CheckCircle color="#10b981" /> : <AlertTriangle color="#ef4444" />}
            <div>
              <strong style={{ color: status.type === 'success' ? '#065f46' : '#991b1b', display: 'block' }}>
                {status.type === 'success' ? 'Success' : 'Error'}
              </strong>
              <span style={{ fontSize: '14px', color: '#333' }}>{status.message}</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
