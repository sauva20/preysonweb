import React, { useState, useEffect, useRef } from 'react';
import { Search, Trash2, Minus, Plus } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import { useOrders } from '../../context/OrderContext';
import { useCurrency } from '../../context/CurrencyContext';
import CashModal from '../components/CashModal';
import QrisModal from '../components/QrisModal';
import './POS.css';

export default function POS() {
  const { products, categories } = useProducts();
  const { addOrder } = useOrders();
  const { formatPrice } = useCurrency();
  const [cartItems, setCartItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [isCashModalOpen, setIsCashModalOpen] = useState(false);
  const [isQrisModalOpen, setIsQrisModalOpen] = useState(false);
  
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
      addToCart(product);
    } else {
      // Could add a toast notification here: "Product not found!"
      console.warn('Scanned SKU not found:', sku);
    }
  };

  const addToCart = (product) => {
    if (product.stock <= 0) {
      alert('Out of stock!');
      return;
    }
    const existing = cartItems.find(item => item.id === product.id);
    if (existing) {
      if (existing.quantity >= product.stock) {
        alert(`Cannot add more. Only ${product.stock} in stock.`);
        return;
      }
      setCartItems(cartItems.map(item => 
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCartItems([...cartItems, { ...product, quantity: 1, size: 'OS' }]); // 'OS' = One Size for default
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const handleQuantity = (id, delta) => {
    setCartItems(cartItems.map(item => {
      if (item.id === id) {
        const newQ = item.quantity + delta;
        if (newQ > item.stock) {
           alert(`Cannot add more. Only ${item.stock} in stock.`);
           return item;
        }
        return { ...item, quantity: Math.max(1, newQ) };
      }
      return item;
    }));
  };

  const handleRemove = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
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
      alert('Transaction Successful! Added to Orders.');
    } catch (err) {
      alert('Failed to process transaction.');
    }
  };

  return (
    <div className="pos-page">
      {/* Main Catalog Area */}
      <div className="pos-main">
        {/* Added Search Bar for manual entry or direct focus scanning */}
        <div className="pos-search-bar" style={{ padding: '0 24px', paddingTop: '24px' }}>
           <div className="search-wrapper" style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--admin-surface)', border: '1px solid var(--admin-border)', borderRadius: '6px', padding: '8px 16px' }}>
             <Search size={18} color="var(--admin-text-muted)" style={{ marginRight: '8px' }}/>
             <input 
               type="text" 
               placeholder="SEARCH SKU, NAME, OR SCAN BARCODE..." 
               style={{ flex: 1, background: 'none', border: 'none', color: 'var(--admin-text)', outline: 'none', fontSize: '13px', fontWeight: '600', letterSpacing: '0.5px' }}
               onKeyDown={(e) => {
                 if (e.key === 'Enter' && e.target.value) {
                   handleScan(e.target.value);
                   e.target.value = ''; // Clear after scan
                 }
               }}
             />
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
              if (activeCategory === 'ALL') return true;
              if (activeCategory === 'TOP_WK' || activeCategory === 'TOP_MO') return true;
              return p.categoryId === activeCategory;
            })
            .sort((a, b) => {
              if (activeCategory === 'TOP_WK' || activeCategory === 'TOP_MO') {
                return b.sold - a.sold;
              }
              return 0;
            })
            .map(product => (
            <div className="pos-product-card" key={product.id} onClick={() => addToCart(product)}>
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
          <button className="clear-btn" onClick={() => setCartItems([])}>
            <Trash2 size={14} /> CLEAR
          </button>
        </div>

        <div className="cart-items">
          {cartItems.map(item => (
            <div className="cart-item" key={item.id}>
              <div className="cart-item-row">
                <h4>{item.name}</h4>
                <span className="item-price">{formatPrice(item.price * item.quantity)}</span>
              </div>
              <div className="cart-item-meta">
                SIZE: {item.size} | {item.sku}
              </div>
              <div className="cart-item-actions">
                <div className="qty-control">
                  <button onClick={() => handleQuantity(item.id, -1)}><Minus size={14}/></button>
                  <span>{item.quantity}</span>
                  <button onClick={() => handleQuantity(item.id, 1)}><Plus size={14}/></button>
                </div>
                <button className="remove-item-btn" onClick={() => handleRemove(item.id)}>
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

      <CashModal 
        isOpen={isCashModalOpen}
        onClose={() => setIsCashModalOpen(false)}
        onConfirm={processOrder}
        cartItems={cartItems}
        subtotal={subtotal}
        tax={tax}
        total={total}
      />

      <QrisModal 
        isOpen={isQrisModalOpen}
        onClose={() => setIsQrisModalOpen(false)}
        onConfirm={processOrder}
        cartItems={cartItems}
        subtotal={subtotal}
        tax={tax}
        total={total}
      />
    </div>
  );
}
