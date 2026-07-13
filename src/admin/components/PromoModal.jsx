import React, { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import { useCurrency } from '../../context/CurrencyContext';
import './PromoModal.css';

export default function PromoModal({ isOpen, onClose, type, onSubmit, initialData }) {
  const { products } = useProducts();
  const { formatPrice } = useCurrency();
  
  // Common Fields
  const [promoType, setPromoType] = useState('percentage'); // 'percentage' or 'fixed'
  const [value, setValue] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Voucher Specific
  const [code, setCode] = useState('');
  const [minSpend, setMinSpend] = useState('');
  const [maxDiscount, setMaxDiscount] = useState('');
  const [usageLimit, setUsageLimit] = useState('');

  // Discount Specific
  const [name, setName] = useState('');
  const [productIds, setProductIds] = useState([]);
  
  // Product Search for Discount
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setPromoType(initialData.type || 'percentage');
        setValue(initialData.value || '');
        setStartDate(initialData.startDate || '');
        setEndDate(initialData.endDate || '');
        
        if (type === 'voucher') {
          setCode(initialData.code || '');
          setMinSpend(initialData.minSpend || '');
          setMaxDiscount(initialData.maxDiscount || '');
          setUsageLimit(initialData.usageLimit || '');
        } else {
          setName(initialData.name || '');
          setProductIds(initialData.productIds || []);
        }
      } else {
        // Reset form
        setPromoType('percentage');
        setValue('');
        setStartDate('');
        setEndDate('');
        setCode('');
        setMinSpend('');
        setMaxDiscount('');
        setUsageLimit('');
        setName('');
        setProductIds([]);
      }
    }
  }, [isOpen, initialData, type]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    let payload = {
      type: promoType,
      value: Number(value),
      startDate,
      endDate,
      isActive: initialData ? initialData.isActive : true
    };

    if (type === 'voucher') {
      payload = {
        ...payload,
        code: code.toUpperCase(),
        minSpend: minSpend ? Number(minSpend) : 0,
        maxDiscount: promoType === 'percentage' && maxDiscount ? Number(maxDiscount) : null,
        usageLimit: usageLimit ? Number(usageLimit) : null,
      };
    } else {
      payload = {
        ...payload,
        name,
        productIds
      };
    }

    onSubmit(payload);
    onClose();
  };

  const toggleProductSelection = (id) => {
    if (productIds.includes(id)) {
      setProductIds(productIds.filter(pid => pid !== id));
    } else {
      setProductIds([...productIds, id]);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="modal-backdrop promo-modal-backdrop" onClick={onClose}>
      <div className="promo-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{initialData ? 'Edit' : 'Create'} {type === 'voucher' ? 'Voucher' : 'Product Discount'}</h3>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="promo-form">
          <div className="form-grid">
            
            {/* VOUCHER FIELDS */}
            {type === 'voucher' && (
              <>
                <div className="form-group">
                  <label>Voucher Code</label>
                  <input type="text" value={code} onChange={e => setCode(e.target.value)} required placeholder="e.g. SUMMER20" />
                </div>
                <div className="form-group">
                  <label>Usage Limit (Total)</label>
                  <input type="number" value={usageLimit} onChange={e => setUsageLimit(e.target.value)} placeholder="Leave blank for unlimited" />
                </div>
              </>
            )}

            {/* DISCOUNT FIELDS */}
            {type === 'discount' && (
              <div className="form-group full-width">
                <label>Discount Campaign Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Clearance Sale" />
              </div>
            )}

            {/* COMMON FIELDS */}
            <div className="form-group">
              <label>Discount Type</label>
              <select value={promoType} onChange={e => setPromoType(e.target.value)}>
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount ($)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Discount Value</label>
              <input type="number" value={value} onChange={e => setValue(e.target.value)} required min="1" max={promoType === 'percentage' ? 100 : 99999} />
            </div>

            {/* MORE VOUCHER FIELDS */}
            {type === 'voucher' && (
              <>
                <div className="form-group">
                  <label>Minimum Spend ($)</label>
                  <input type="number" value={minSpend} onChange={e => setMinSpend(e.target.value)} placeholder="0" />
                </div>
                {promoType === 'percentage' && (
                  <div className="form-group">
                    <label>Maximum Discount ($)</label>
                    <input type="number" value={maxDiscount} onChange={e => setMaxDiscount(e.target.value)} placeholder="No limit" />
                  </div>
                )}
              </>
            )}

            <div className="form-group">
              <label>Valid From</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Valid Until</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required />
            </div>

            {/* PRODUCT SELECTOR FOR DISCOUNT */}
            {type === 'discount' && (
              <div className="form-group full-width product-selector">
                <label>Select Products</label>
                <div className="search-box">
                  <Search size={16} />
                  <input 
                    type="text" 
                    placeholder="Search products..." 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="product-list-selectable">
                  {filteredProducts.map(product => (
                    <label key={product.id} className={`product-select-item ${productIds.includes(product.id) ? 'selected' : ''}`}>
                      <input 
                        type="checkbox" 
                        checked={productIds.includes(product.id)}
                        onChange={() => toggleProductSelection(product.id)}
                      />
                      <div className="product-select-img" style={{ backgroundImage: `url(${product.image || '/images/placeholder.png'})` }}></div>
                      <div className="product-select-info">
                        <span className="product-name">{product.name}</span>
                        <span className="product-sku">{product.sku}</span>
                      </div>
                      <span className="product-price">{formatPrice(product.price)}</span>
                    </label>
                  ))}
                  {filteredProducts.length === 0 && <p className="no-products">No products found.</p>}
                </div>
              </div>
            )}
          </div>
          
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-submit">
              {initialData ? 'Update' : 'Create'} {type === 'voucher' ? 'Voucher' : 'Discount'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
