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
  const [selectedCategory, setSelectedCategory] = useState('All');

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
      setSearchQuery('');
      setSelectedCategory('All');
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

  const uniqueCategories = ['All', ...new Set(products.map(p => {
    return (typeof p.category === 'object' && p.category !== null) ? p.category.name : p.category;
  }).filter(Boolean))];

  const filteredProducts = products.filter(p => {
    const nameMatch = p.name ? p.name.toLowerCase().includes(searchQuery.toLowerCase()) : false;
    const skuMatch = p.sku ? p.sku.toLowerCase().includes(searchQuery.toLowerCase()) : false;
    
    const catName = (typeof p.category === 'object' && p.category !== null) ? p.category.name : p.category;
    const categoryMatch = selectedCategory === 'All' || catName === selectedCategory;

    return (nameMatch || skuMatch) && categoryMatch;
  });

  const handleSelectAll = () => {
    const filteredIds = filteredProducts.map(p => p.id);
    const allSelected = filteredIds.length > 0 && filteredIds.every(id => productIds.includes(id));

    if (allSelected) {
      // Deselect all filtered
      setProductIds(productIds.filter(id => !filteredIds.includes(id)));
    } else {
      // Select all filtered
      const newIds = new Set([...productIds, ...filteredIds]);
      setProductIds(Array.from(newIds));
    }
  };

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
                  <input
                    type="number"
                    value={usageLimit}
                    onChange={e => setUsageLimit(e.target.value)}
                    onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
                    placeholder="Leave blank for unlimited"
                  />
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
                <option value="fixed">Fixed Amount (Rp)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Discount Value</label>
              <input
                type="number"
                value={value}
                onChange={e => setValue(e.target.value)}
                onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
                required
                min="1"
                max={promoType === 'percentage' ? 100 : 999999999}
              />
            </div>

            {/* MORE VOUCHER FIELDS */}
            {type === 'voucher' && (
              <>
                <div className="form-group">
                  <label>Minimum Spend (Rp)</label>
                  <input
                    type="number"
                    value={minSpend}
                    onChange={e => setMinSpend(e.target.value)}
                    onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
                    placeholder="0"
                  />
                </div>
                {promoType === 'percentage' && (
                  <div className="form-group">
                    <label>Maximum Discount (Rp)</label>
                    <input
                      type="number"
                      value={maxDiscount}
                      onChange={e => setMaxDiscount(e.target.value)}
                      onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
                      placeholder="No limit"
                    />
                  </div>
                )}
              </>
            )}

            <div className="form-group">
              <label>Valid From</label>
              <input type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Valid Until</label>
              <input type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} required />
            </div>

            {/* PRODUCT SELECTOR FOR DISCOUNT */}
            {type === 'discount' && (
              <div className="form-group full-width product-selector">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
                  <label style={{ margin: 0 }}>Select Products</label>
                  <button 
                    type="button" 
                    className="action-btn-outline" 
                    style={{ fontSize: '0.8rem', padding: '4px 8px' }}
                    onClick={handleSelectAll}
                  >
                    {(filteredProducts.length > 0 && filteredProducts.every(p => productIds.includes(p.id))) ? 'Deselect All Filtered' : 'Select All Filtered'}
                  </button>
                </div>
                
                <div className="search-filter-row" style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <div className="search-box" style={{ flex: 1, margin: 0 }}>
                    <Search size={16} />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <select 
                    value={selectedCategory} 
                    onChange={e => setSelectedCategory(e.target.value)}
                    style={{ flex: '0 0 150px', padding: '8px', border: '1px solid var(--admin-border)', borderRadius: '4px', background: 'var(--admin-bg)', color: 'var(--admin-text)' }}
                  >
                    {uniqueCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
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
