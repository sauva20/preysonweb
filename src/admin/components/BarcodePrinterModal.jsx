import React, { useState, useRef } from 'react';
import { X, Printer } from 'lucide-react';
import Barcode from 'react-barcode';
import { useCurrency } from '../../context/CurrencyContext';
import { useProducts } from '../../context/ProductContext';

export default function BarcodePrinterModal({ product, onClose }) {
  const { formatPrice } = useCurrency();
  const { categories } = useProducts();

  // State to hold quantity of barcodes to print for each size
  const [quantities, setQuantities] = useState(
    (product.sizes || []).reduce((acc, size) => {
      acc[size.name] = 0; // Default to 0
      return acc;
    }, {})
  );

  const printAreaRef = useRef(null);

  // Helper untuk menyusun label barcode: [Nama Produk] - [Jenis] - [Size] - [Harga]
  const getBarcodeLabel = (sizeName) => {
    // 1. Dapatkan nama kategori/jenis
    const categoryObj = product.category || (categories || []).find(c => c.id === product.categoryId);
    let categoryName = (categoryObj?.name || '').trim();

    let cleanName = (product.name || '').trim();
    let jenis = categoryName;

    // Jika nama produk mengandung " - ", periksa apakah bagian terakhir adalah jenis/kategori
    if (cleanName.includes(' - ')) {
      const parts = cleanName.split(' - ');
      const lastPart = parts[parts.length - 1].trim();

      const isKnownCat = (categoryName && lastPart.toLowerCase() === categoryName.toLowerCase()) ||
                         (categories || []).some(c => c.name.toLowerCase() === lastPart.toLowerCase());

      if (isKnownCat || (!jenis && lastPart)) {
        jenis = jenis || lastPart;
        cleanName = parts.slice(0, parts.length - 1).join(' - ').trim();
      }
    }

    // 2. Format harga
    const rawPrice = Number(product.price);
    const formattedPrice = (rawPrice && !isNaN(rawPrice))
      ? (formatPrice ? formatPrice(rawPrice).replace(/\s+/g, ' ') : `Rp ${rawPrice.toLocaleString('id-ID')}`)
      : '';

    // 3. Susun urutan: Nama Produk - Jenis - Size - Harga
    const labelParts = [cleanName, jenis, sizeName, formattedPrice].filter(Boolean);
    return labelParts.join(' - ');
  };

  const handlePrint = () => {
    const printContent = printAreaRef.current.innerHTML;
    if (!printContent.trim()) {
      alert("Tidak ada barcode yang bisa dicetak. Pastikan produk memiliki SKU dan Qty > 0.");
      return;
    }

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Barcodes</title>
          <style>
            body { font-family: sans-serif; margin: 0; padding: 20px; }
            .barcode-item {
              page-break-inside: avoid;
              margin-bottom: 20px;
              text-align: center;
              display: inline-block;
              margin-right: 15px;
            }
            .barcode-label {
              font-size: 12px;
              font-weight: bold;
              margin-bottom: 4px;
            }
            @media print {
              @page { margin: 0; }
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    
    // Slight delay to ensure barcodes are rendered before print dialog opens
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const sizes = product.sizes || [];

  return (
    <div className="modal-backdrop">
      <div className="edit-modal" style={{ maxWidth: '600px', width: '90%', padding: '30px', background: '#fff', borderRadius: '12px', position: 'relative' }}>
        <button className="close-modal-btn" onClick={onClose} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer' }}>
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
                <div style={{ fontSize: '11px', color: '#059669', marginTop: '2px', fontWeight: '500' }}>
                  Label: {getBarcodeLabel(size.name)}
                </div>
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
                    <div className="barcode-label" style={{ fontSize: '12px', fontWeight: 'bold' }}>{getBarcodeLabel(size.name)}</div>
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
