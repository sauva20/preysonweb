import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import { Search, Trash2, Minus, Plus, X } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import { useOrders } from '../../context/OrderContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useActivity } from '../../context/ActivityContext';
import CashModal from '../components/CashModal';
import QrisModal from '../components/QrisModal';
import './POS.css';
import './POS-modal.css';

export default function POS() {
  const { products, categories } = useProducts();
  const { addOrder } = useOrders();
  const { formatPrice } = useCurrency();
  const { logActivity } = useActivity();
  const [cartItems, setCartItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [isCashModalOpen, setIsCashModalOpen] = useState(false);
  const [isQrisModalOpen, setIsQrisModalOpen] = useState(false);
  const [selectedProductForSize, setSelectedProductForSize] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Barcode Scanner State
  const [scanBuffer, setScanBuffer] = useState('');
  const lastKeyTime = useRef(Date.now());
  const scanTimeout = useRef(null);

  // Global Keydown Listener for Barcode Scanner
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is typing in an actual input field (except maybe the main search bar)
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      const currentTime = Date.now();

      // Barcode scanners type very fast (usually < 30ms between keystrokes)
      if (currentTime - lastKeyTime.current > 50) {
        setScanBuffer(''); // Reset buffer if it's too slow (likely human typing)
      }

      if (e.key === 'Enter') {
        if (scanBuffer.length > 0) {
          handleScan(scanBuffer);
          setScanBuffer('');
        }
      } else if (e.key.length === 1) { // Only capture single characters
        setScanBuffer(prev => prev + e.key);
      }

      lastKeyTime.current = currentTime;
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scanBuffer, products, cartItems]);

  const handleScan = (sku) => {
    const product = products.find(p => p.sku === sku);
    if (product) {
      handleProductClick(product);
    } else {
      console.warn('Scanned SKU not found:', sku);
    }
  };

  const handleProductClick = (product) => {
    let sizesObj = [];
    try {
      sizesObj = typeof product.sizes === 'string' ? JSON.parse(product.sizes) : (product.sizes || []);
    } catch (e) { }

    if (sizesObj.length > 0 && typeof sizesObj[0] === 'object') {
      setSelectedProductForSize({ product, sizes: sizesObj });
    } else {
      addToCart(product, 'OS', product.stock);
    }
  };

  const addToCart = (product, sizeName, maxStock) => {
    if (maxStock <= 0) {
      Swal.fire({ icon: 'error', text: 'Out of stock!', confirmButtonColor: 'var(--admin-accent)' });
      return;
    }
    const existing = cartItems.find(item => item.id === product.id && item.size === sizeName);
    if (existing) {
      if (existing.quantity >= maxStock) {
        Swal.fire({ icon: 'warning', text: `Cannot add more. Only ${maxStock} in stock.`, confirmButtonColor: 'var(--admin-accent)' });
        return;
      }
      setCartItems(cartItems.map(item =>
        (item.id === product.id && item.size === sizeName) ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      // Need a unique key for cart items if same product different sizes
      setCartItems([...cartItems, { ...product, cartItemId: Date.now() + Math.random(), quantity: 1, size: sizeName, maxStock }]);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const handleQuantity = (cartItemId, delta) => {
    setCartItems(cartItems.map(item => {
      if (item.cartItemId === cartItemId) {
        const newQ = item.quantity + delta;
        const stockLimit = item.maxStock || item.stock;
        if (newQ > stockLimit) {
          Swal.fire({ icon: 'warning', text: `Cannot add more. Only ${stockLimit} in stock.`, confirmButtonColor: 'var(--admin-accent)' });
          return item;
        }
        return { ...item, quantity: Math.max(1, newQ) };
      }
      return item;
    }));
  };

  const handleRemove = (cartItemId) => {
    Swal.fire({
      title: 'Hapus Item?',
      text: "Yakin ingin menghapus item ini dari keranjang?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: 'var(--admin-border-dark)',
      confirmButtonText: 'Ya, hapus!'
    }).then((result) => {
      if (result.isConfirmed) {
        setCartItems(cartItems.filter(item => item.cartItemId !== cartItemId));
      }
    });
  };

  const handleClearCart = () => {
    Swal.fire({
      title: 'Kosongkan Keranjang?',
      text: "Yakin ingin menghapus semua item dari pesanan ini?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: 'var(--admin-border-dark)',
      confirmButtonText: 'Ya, kosongkan!'
    }).then((result) => {
      if (result.isConfirmed) {
        setCartItems([]);
      }
    });
  };

  const handleCharge = () => {
    if (cartItems.length === 0) return;

    if (paymentMethod === 'CASH') {
      setIsCashModalOpen(true);
    } else if (paymentMethod === 'QRIS') {
      setIsQrisModalOpen(true);
    } else {
      processOrder({}); // Process without customer details for other methods
    }
  };

  const processOrder = async (details = {}) => {
    try {
      await addOrder({
        items: cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        subtotal,
        tax,
        total,
        source: 'POS',
        paymentMethod,
        status: 'Completed',
        customerName: details.customerName || '',
        customerEmail: details.customerEmail || ''
      });

      setCartItems([]);
      setIsCashModalOpen(false);
      setIsQrisModalOpen(false);
      logActivity({
        category: 'POS',
        title: `Transaksi POS Berhasil (${paymentMethod})`,
        description: `Pembayaran ${paymentMethod} atas ${cartItems.length} jenis item senilai ${formatPrice(total)} diproses.`,
        status: 'success'
      });
      Swal.fire({ icon: 'success', title: 'Success!', text: 'Transaction Successful! Added to Orders.', confirmButtonColor: 'var(--admin-accent)' });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to process transaction.', confirmButtonColor: 'var(--admin-accent)' });
    }
  };

  return (
    <div className="pos-page">
      {/* Main Catalog Area */}
      <div className="pos-main">
        {/* Added Search Bar for manual entry or direct focus scanning */}
        <div className="pos-search-bar" style={{ marginBottom: '24px' }}>
          <div className="search-wrapper" style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--admin-surface)', border: '1px solid var(--admin-border)', borderRadius: '6px', padding: '8px 16px' }}>
            <Search size={18} color="var(--admin-text-muted)" style={{ marginRight: '8px' }} />
            <input
              type="text"
              placeholder="SEARCH SKU, NAME, OR SCAN BARCODE..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flex: 1, background: 'none', border: 'none', color: 'var(--admin-text)', outline: 'none', fontSize: '13px', fontWeight: '600', letterSpacing: '0.5px' }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.target.value) {
                  handleScan(e.target.value);
                  setSearchQuery(''); // Clear after scan
                }
              }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', color: 'var(--admin-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        <div className="pos-filters">
          <button
            className={`pos-filter-btn ${activeCategory === 'ALL' ? 'active' : ''}`}
            onClick={() => setActiveCategory('ALL')}
          >
            ALL ITEMS
          </button>
          <button
            className={`pos-filter-btn ${activeCategory === 'TOP_WK' ? 'active' : ''}`}
            onClick={() => setActiveCategory('TOP_WK')}
          >
            TOP SALE WK
          </button>
          <button
            className={`pos-filter-btn ${activeCategory === 'TOP_MO' ? 'active' : ''}`}
            onClick={() => setActiveCategory('TOP_MO')}
          >
            TOP SALE MO
          </button>
          {categories.map(c => (
            <button
              key={c.id}
              className={`pos-filter-btn ${activeCategory === c.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(c.id)}
            >
              {c.name.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="pos-product-grid">
          {products
            .filter(p => {
              const q = searchQuery.toLowerCase().trim();
              const matchesSearch = !q || 
                String(p.name || '').toLowerCase().includes(q) || 
                String(p.sku || '').toLowerCase().includes(q) ||
                String(p.category?.name || p.categoryId || '').toLowerCase().includes(q);
              
              if (!matchesSearch) return false;
              if (activeCategory === 'ALL' || activeCategory === 'TOP_WK' || activeCategory === 'TOP_MO') return true;
              return p.categoryId === activeCategory;
            })
            .sort((a, b) => {
              if (activeCategory === 'TOP_WK' || activeCategory === 'TOP_MO') {
                return b.sold - a.sold;
              }
              return 0;
            })
            .map(product => (
              <div className="pos-product-card" key={product.id} onClick={() => handleProductClick(product)}>
                <div
                  className={`pos-card-image ${!product.image ? 'bg-gray' : ''}`}
                  style={product.image ? { backgroundImage: `url('${product.image}')` } : {}}
                >
                  <div className="pos-badges">
                    <span className={`pos-stock-badge ${product.stock < 5 ? 'low-stock' : ''}`}>{product.stock} IN STOCK</span>
                    {product.sold > 0 && <span className="pos-sold-badge">{product.sold} SOLD</span>}
                  </div>
                </div>
                <div className="pos-card-info">
                  <h4>{product.name}</h4>
                  <div className="pos-card-footer">
                    <span className="sku">{product.sku}</span>
                    <span className="price">{formatPrice(product.price)}</span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Cart Sidebar */}
      <div className="pos-cart-sidebar">
        <div className="cart-header">
          <h2>CURRENT ORDER</h2>
          <button className="clear-btn" onClick={handleClearCart}>
            <Trash2 size={14} /> CLEAR
          </button>
        </div>

        <div className="pos-cart-items">
          {cartItems.map(item => (
            <div className="pos-cart-item" key={item.cartItemId}>
              <div className="pos-cart-item-row">
                <h4>{item.name}</h4>
                <span className="pos-item-price">{formatPrice(item.price * item.quantity)}</span>
              </div>
              <div className="pos-cart-item-meta">
                SIZE: {item.size} | {item.sku}
              </div>
              <div className="pos-cart-item-controls">
                <div className="qty-control">
                  <button 
                    onClick={() => handleQuantity(item.cartItemId, -1)}
                    disabled={item.quantity <= 1}
                    style={{ opacity: item.quantity <= 1 ? 0.4 : 1, cursor: item.quantity <= 1 ? 'not-allowed' : 'pointer' }}
                  >
                    <Minus size={14} />
                  </button>
                  <span>{item.quantity}</span>
                  <button 
                    onClick={() => handleQuantity(item.cartItemId, 1)}
                    disabled={item.quantity >= (item.maxStock || item.stock)}
                    style={{ opacity: item.quantity >= (item.maxStock || item.stock) ? 0.4 : 1, cursor: item.quantity >= (item.maxStock || item.stock) ? 'not-allowed' : 'pointer' }}
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <button className="remove-btn" onClick={() => handleRemove(item.cartItemId)}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-footer">
          <div className="payment-method-section">
            <span className="section-label">PAYMENT METHOD</span>
            <div className="payment-buttons">
              <button
                className={`pay-btn ${paymentMethod === 'CASH' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('CASH')}
              >
                CASH
              </button>
              <button
                className={`pay-btn ${paymentMethod === 'QRIS' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('QRIS')}
              >
                QRIS
              </button>
            </div>
          </div>

          <div className="cart-summary">
            <div className="summary-row">
              <span>SUBTOTAL</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="summary-row">
              <span>DISCOUNT</span>
              <span>{formatPrice(0)}</span>
            </div>
            <div className="summary-divider"></div>
            <div className="summary-row">
              <span>TAX (8%)</span>
              <span>{formatPrice(tax)}</span>
            </div>
            <div className="summary-row total-row">
              <span>TOTAL</span>
              <span className="total-amount">{formatPrice(total)}</span>
            </div>
          </div>

          <button className="charge-btn" onClick={handleCharge} disabled={cartItems.length === 0}>
            CHARGE &rarr;
          </button>
        </div>
      </div>

      {isCashModalOpen && (
        <CashModal
          isOpen={true}
          total={total}
          cartItems={cartItems}
          subtotal={subtotal}
          tax={tax}
          onClose={() => setIsCashModalOpen(false)}
          onConfirm={(details) => processOrder(details)}
        />
      )}

      {isQrisModalOpen && (
        <QrisModal
          isOpen={true}
          total={total}
          cartItems={cartItems}
          subtotal={subtotal}
          tax={tax}
          onClose={() => setIsQrisModalOpen(false)}
          onConfirm={(details) => processOrder(details)}
        />
      )}

      {selectedProductForSize && (
        <div className="pos-modal-overlay">
          <div className="pos-modal-content" style={{ position: 'relative' }}>
            <button 
              onClick={() => setSelectedProductForSize(null)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={20} />
            </button>
            <h2>Select Size for {selectedProductForSize.product.name}</h2>
            <div className="size-grid">
              {selectedProductForSize.sizes.map((s, idx) => {
                const inCart = cartItems.find(item => item.id === selectedProductForSize.product.id && item.size === s.name);
                const cartQty = inCart ? inCart.quantity : 0;
                const remainingStock = s.stock - cartQty;
                const isDisabled = remainingStock <= 0;
                return (
                  <button
                    key={idx}
                    className={`size-btn ${isDisabled ? 'out-of-stock' : ''}`}
                    disabled={isDisabled}
                    onClick={() => addToCart(selectedProductForSize.product, s.name, s.stock)}
                  >
                    <div className="size-name">{s.name}</div>
                    <div className="size-stock">{remainingStock} left</div>
                  </button>
                );
              })}
            </div>
            <div className="current-cart-info" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px', fontSize: '14px', color: 'var(--admin-accent)', fontWeight: '600' }}>
              {selectedProductForSize.sizes.map(s => {
                const inCart = cartItems.find(item => item.id === selectedProductForSize.product.id && item.size === s.name);
                if (inCart) {
                  return (
                    <div key={s.name} style={{ display: 'flex', alignItems: 'center', margin: '4px 0', gap: '12px' }}>
                      <span style={{ width: '40px', textAlign: 'right', fontWeight: '700' }}>{s.name}</span>
                      <span style={{ color: 'var(--admin-border-dark)', fontSize: '12px' }}>|</span>
                      <span style={{ width: '60px', textAlign: 'left' }}>{inCart.quantity} item</span>
                    </div>
                  );
                }
                return null;
              })}
            </div>
            <div className="modal-actions">
              <button className="btn-save" onClick={() => setSelectedProductForSize(null)}>Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
