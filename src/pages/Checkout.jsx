import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { ChevronRight } from 'lucide-react';
import './Checkout.css';

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, cartTotal, clearCart } = useCart();
  const { formatPrice } = useCurrency();

  // Form State
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', province: '', city: '', postal: '', areaId: ''
  });

  // Autocomplete State
  const [areaSearch, setAreaSearch] = useState('');
  const [areaResults, setAreaResults] = useState([]);
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);
  const [isSearchingArea, setIsSearchingArea] = useState(false);
  
  // Shipping & Voucher
  const [shippingMethod, setShippingMethod] = useState('');
  const [shippingRates, setShippingRates] = useState([]);
  const [shippingCost, setShippingCost] = useState(0);
  
  const [voucherCode, setVoucherCode] = useState('');
  const [discountPct, setDiscountPct] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [voucherError, setVoucherError] = useState('');

  // Inject Midtrans Script Dynamically
  useEffect(() => {
    let scriptTag = null;
    fetch(`${import.meta.env.VITE_API_URL}/checkout/config`)
      .then(res => res.json())
      .then(data => {
        if (data.clientKey) {
          scriptTag = document.createElement('script');
          scriptTag.src = data.isProduction 
            ? 'https://app.midtrans.com/snap/snap.js'
            : 'https://app.sandbox.midtrans.com/snap/snap.js';
          scriptTag.setAttribute('data-client-key', data.clientKey);
          scriptTag.async = true;
          document.body.appendChild(scriptTag);
        }
      })
      .catch(err => console.error("Failed to load Midtrans config", err));

    return () => {
      if (scriptTag) document.body.removeChild(scriptTag);
    }
  }, []);

  // Search Area Effect
  useEffect(() => {
    if (areaSearch.length < 3) {
      setAreaResults([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      setIsSearchingArea(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/checkout/search-area?query=${encodeURIComponent(areaSearch)}`);
        const data = await res.json();
        setAreaResults(data.areas || []);
        setShowAreaDropdown(true);
      } catch(err) {
        console.error(err);
      }
      setIsSearchingArea(false);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [areaSearch]);

  const handleSelectArea = (area) => {
    setFormData({
      ...formData,
      province: area.administrative_division_level_1_name,
      city: area.administrative_division_level_2_name,
      postal: area.postal_code,
      areaId: area.id
    });
    setAreaSearch(`${area.name}, ${area.administrative_division_level_2_name}, ${area.postal_code}`);
    setShowAreaDropdown(false);
  };

  // Fetch Shipping Rates when areaId is selected
  useEffect(() => {
    if (formData.areaId) {
      fetch(`${import.meta.env.VITE_API_URL}/checkout/shipping-rates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destinationAreaId: formData.areaId, destinationPostal: formData.postal })
      })
      .then(res => res.json())
      .then(data => {
        if (data.rates) {
          setShippingRates(data.rates);
        }
      })
      .catch(err => console.error(err));
    }
  }, [formData.areaId, formData.postal]);

  // Recalculate Totals
  useEffect(() => {
    const sub = cartTotal;
    const discountVal = (sub * discountPct) / 100;
    setDiscountAmount(discountVal);
  }, [cartTotal, discountPct]);

  const finalTotal = cartTotal + shippingCost - discountAmount;

  const handleApplyVoucher = async () => {
    setVoucherError('');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/checkout/validate-voucher`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: voucherCode })
      });
      const data = await res.json();
      if (res.ok) {
        setDiscountPct(data.discountPct);
      } else {
        setVoucherError(data.error);
        setDiscountPct(0);
      }
    } catch (e) {
      setVoucherError('Failed to validate voucher');
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!shippingMethod) {
      alert("Please select a shipping method");
      return;
    }

    try {
      const orderPayload = {
        customerName: `${formData.firstName} ${formData.lastName}`,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        shippingAddress: formData.address,
        shippingCity: formData.city,
        shippingProvince: formData.province,
        shippingPostal: formData.postal,
        shippingCourier: shippingMethod,
        shippingCost: shippingCost,
        discount: discountAmount,
        voucherCode: voucherCode || null,
        subtotal: cartTotal,
        tax: 0,
        total: finalTotal,
        items: cartItems.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
          size: item.size
        }))
      };

      const res = await fetch(`${import.meta.env.VITE_API_URL}/checkout/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
      const data = await res.json();
      
      if (data.token === 'dummy_token' || data.token) {
        clearCart();
        navigate('/payment/' + data.orderId);
      } else {
        alert("Failed to initiate payment. Please make sure Midtrans is configured properly in Admin Settings.");
      }
    } catch (error) {
      console.error(error);
      alert("Checkout Error: " + (error.message || JSON.stringify(error)));
    }
  };

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        
        {/* Left Column */}
        <div className="checkout-left">
          <div className="checkout-header">
            <Link to="/">
              <img src="/images/logo.png" alt="Preyson" className="checkout-logo" />
            </Link>
            <div className="checkout-breadcrumbs">
              <Link to="/cart">Cart</Link> <ChevronRight size={14} /> <span>Checkout</span>
            </div>
          </div>

          <form onSubmit={handleCheckout} className="checkout-form">
            <section>
              <h2>Contact Information</h2>
              <input type="email" placeholder="Email address" required 
                value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              <div className="checkbox-row">
                <input type="checkbox" id="news" defaultChecked />
                <label htmlFor="news">Keep me up to date on news and exclusive offers</label>
              </div>
            </section>

            <section>
              <h2>Shipping Address</h2>
              <div className="form-row">
                <input type="text" placeholder="First name" required 
                  value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                <input type="text" placeholder="Last name" required 
                  value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
              </div>
              <input type="text" placeholder="Address" required 
                value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              <input type="text" placeholder="Phone" required 
                value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              <div className="autocomplete-container">
                <input 
                  type="text" 
                  placeholder="Cari Kecamatan / Kota / Kode Pos" 
                  required 
                  value={areaSearch} 
                  onChange={e => {
                    setAreaSearch(e.target.value);
                    if (formData.areaId) {
                      setFormData({...formData, areaId: '', postal: '', city: '', province: ''});
                      setShippingRates([]);
                    }
                  }} 
                  onFocus={() => { if(areaResults.length > 0) setShowAreaDropdown(true); }}
                />
                {isSearchingArea && <div className="autocomplete-loading">Searching...</div>}
                {showAreaDropdown && areaResults.length > 0 && (
                  <div className="autocomplete-dropdown">
                    {areaResults.map(area => (
                      <div 
                        key={area.id} 
                        className="autocomplete-item"
                        onClick={() => handleSelectArea(area)}
                      >
                        <strong>{area.name}</strong>, {area.administrative_division_level_2_name}, {area.administrative_division_level_1_name} ({area.postal_code})
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {formData.areaId && (
                <div className="selected-area-badge">
                  Selected: {formData.city}, {formData.province} - {formData.postal}
                </div>
              )}
            </section>

            <section>
              <h2>Shipping Method</h2>
              {shippingRates.length > 0 ? (
                <div className="shipping-methods-box">
                  {shippingRates.map((rate, idx) => (
                    <div key={idx} className="shipping-option">
                      <label>
                        <input type="radio" name="shipping" value={rate.courier} 
                          onChange={() => {
                            setShippingMethod(rate.courier);
                            setShippingCost(rate.price);
                          }}
                        />
                        <span>{rate.courier} - {rate.service} ({rate.etd})</span>
                      </label>
                      <span>{formatPrice(rate.price)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="shipping-placeholder">
                  Please provide postal code to see shipping rates
                </div>
              )}
            </section>

            {/* Removed Payment Section */}

            <div className="checkout-actions">
              <Link to="/cart" className="return-cart">Return to cart</Link>
              <button type="submit" className="btn btn-primary place-order-btn">
                Pay Now
              </button>
            </div>
          </form>
        </div>

        {/* Right Column */}
        <div className="checkout-right">
          <div className="checkout-summary">
            <div className="summary-items">
              {cartItems.map(item => (
                <div key={item.id} className="summary-item">
                  <div className="item-image">
                    <img src={item.product.image} alt={item.product.name} />
                    <span className="item-qty">{item.quantity}</span>
                  </div>
                  <div className="item-details">
                    <h4>{item.product.name}</h4>
                    <p>{item.size}</p>
                  </div>
                  <div className="item-price">
                    {formatPrice(item.product.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <div className="discount-section">
              <div className="discount-input">
                <input type="text" placeholder="Voucher / Discount code" 
                  value={voucherCode} onChange={e => setVoucherCode(e.target.value)} />
                <button type="button" onClick={handleApplyVoucher}>Apply</button>
              </div>
              {voucherError && <p className="voucher-error">{voucherError}</p>}
              {discountPct > 0 && <p className="voucher-success">Voucher applied: {discountPct}% off!</p>}
            </div>

            <div className="summary-totals">
              <div className="totals-row">
                <span>Subtotal</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="totals-row discount">
                  <span>Discount</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="totals-row">
                <span>Shipping</span>
                <span>{shippingCost > 0 ? formatPrice(shippingCost) : 'Calculated next step'}</span>
              </div>
              <div className="totals-row final-total">
                <span>Total</span>
                <span className="total-price">{formatPrice(finalTotal)}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
