import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import './Cart.css';

export default function Cart() {
  const { cartItems, removeFromCart, updateQuantity, cartTotal } = useCart();
  const { formatPrice } = useCurrency();

  const formatRupiah = formatPrice;

  const handleQuantityChange = (id, currentQty, delta) => {
    const newQty = currentQty + delta;
    if (newQty > 0) {
      updateQuantity(id, newQty);
    }
  };

  return (
    <div className="cart-page">
      <Navbar />
      
      <div className="cart-container">
        <h1 className="cart-title">YOUR CART</h1>
        
        {cartItems.length === 0 ? (
          <div className="empty-cart-state">
            <ShoppingBag size={64} className="empty-cart-icon" />
            <h2>Your cart is currently empty</h2>
            <p>Looks like you haven't added anything yet. Let's find something perfect for your ride.</p>
            <Link to="/catalog" className="btn btn-primary start-shopping-btn">
              START SHOPPING
            </Link>
          </div>
        ) : (
          <div className="cart-content">
            <div className="cart-items-section">
              <div className="cart-items-header">
                <span className="col-product">PRODUCT</span>
                <span className="col-quantity">QUANTITY</span>
                <span className="col-total">TOTAL</span>
              </div>
              
              <div className="cart-items-list">
                {cartItems.map((item) => (
                  <div className="cart-item" key={item.id}>
                    <div className="item-product-info">
                      <div className="item-image-wrapper">
                        <img 
                          src={item.product.image || '/images/hero_bg.png'} 
                          alt={item.product.name} 
                          className="item-image"
                        />
                      </div>
                      <div className="item-details">
                        <h3>{item.product.name}</h3>
                        <p className="item-variant">Size: {item.size}</p>
                        <p className="item-price">{formatRupiah(item.product.price)}</p>
                      </div>
                    </div>
                    
                    <div className="item-quantity-controls">
                      <div className="qty-selector">
                        <button 
                          className="qty-btn"
                          onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                        >
                          <Minus size={14} />
                        </button>
                        <span className="qty-display">{item.quantity}</span>
                        <button 
                          className="qty-btn"
                          onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <button 
                        className="remove-item-btn"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 size={16} />
                        <span>Remove</span>
                      </button>
                    </div>
                    
                    <div className="item-total-price">
                      {formatRupiah(item.product.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="cart-summary-section">
              <div className="summary-card">
                <h2>ORDER SUMMARY</h2>
                
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>{formatRupiah(cartTotal)}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
                
                <div className="summary-divider"></div>
                
                <div className="summary-row total-row">
                  <span>Total</span>
                  <span>{formatRupiah(cartTotal)}</span>
                </div>
                
                <button className="btn checkout-btn">
                  PROCEED TO CHECKOUT <ArrowRight size={18} />
                </button>
                
                <p className="secure-checkout-text">
                  Secure Checkout. Free returns within 14 days.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}
