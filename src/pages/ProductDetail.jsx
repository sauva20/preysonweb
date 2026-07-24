import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductGrid from '../components/ProductGrid';
import { Heart, Minus, Plus, ChevronDown, ChevronUp, Link as LinkIcon } from 'lucide-react';
import './ProductDetail.css';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products } = useProducts();
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();
  
  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isDetailsOpen, setIsDetailsOpen] = useState(true);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    // Scroll to top on load
    window.scrollTo(0, 0);
    
    // Find product
    const found = products.find(p => p.id === parseInt(id));
    if (found) {
      setProduct(found);
      setMainImage(found.image);
      setSelectedSize('');
      setQuantity(1);
    }
  }, [id, products]);

  if (!product) return <div className="product-not-found">Loading...</div>;

  // Use formatPrice directly instead of formatRupiah
  const formatRupiah = formatPrice;

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert("Please select a size first");
      return;
    }
    addToCart(product, selectedSize, quantity);
    setToastMessage('✓ Berhasil ditambahkan ke keranjang!');
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setToastMessage('✓ Tautan berhasil disalin!');
    setTimeout(() => setToastMessage(''), 3000);
  };

  return (
    <div className="pdp-page">
      <Navbar />
      
      {/* Top Section: Breadcrumbs + Main Product Info */}
      <div className="pdp-top-section">
        <div className="pdp-gallery-col">
          <div className="pdp-thumbnails">
            {product.thumbnails && product.thumbnails.map((thumb, idx) => (
              <div 
                key={idx} 
                className={`pdp-thumb ${mainImage === thumb ? 'active' : ''}`}
                onClick={() => setMainImage(thumb)}
              >
                <img src={thumb} alt={`${product.name} view ${idx + 1}`} />
              </div>
            ))}
          </div>
          <div className="pdp-main-image-wrapper">
            <img src={mainImage} alt={product.name} className="pdp-main-image" />
            <img src="/images/logo.png" alt="Preyson" className="pdp-watermark" />
          </div>
        </div>
        
        <div className="pdp-info-col">
          <div className="breadcrumbs">
            <Link to="/">Home</Link> / <Link to="/catalog">Catalog</Link> / <span>{product.name}</span>
          </div>
          
          <h1 className="pdp-title">{product.name}</h1>
          <div className="pdp-price">
            {product.discountPrice ? (
              <>
                <span className="pdp-price-original">{formatRupiah(product.price)}</span>
                <span>{formatRupiah(product.discountPrice)}</span>
              </>
            ) : (
              formatRupiah(product.price)
            )}
          </div>
          
          <div className="pdp-size-section">
            <div className="size-header">
              <span>Your Size</span>
              {selectedSize && (
                <span className="selected-size-label">: {selectedSize}</span>
              )}
            </div>
            <div className="pdp-size-grid">
              {product.sizes.map(sizeObj => {
                const sizeName = typeof sizeObj === 'string' ? sizeObj : sizeObj.name;
                const stock = typeof sizeObj === 'string' ? 999 : sizeObj.stock;
                const isOutOfStock = stock === 0;

                return (
                  <button 
                    key={sizeName}
                    className={`pdp-size-btn ${selectedSize === sizeName ? 'selected' : ''} ${isOutOfStock ? 'out-of-stock' : ''}`}
                    onClick={() => !isOutOfStock && setSelectedSize(sizeName)}
                    disabled={isOutOfStock}
                    title={isOutOfStock ? 'Out of stock' : `${stock} in stock`}
                  >
                    {sizeName}
                  </button>
                );
              })}
            </div>
            {selectedSize && (
              <div className="size-stock-status" style={{ marginTop: '10px' }}>
                {(() => {
                   const sObj = product.sizes.find(s => (typeof s === 'string' ? s : s.name) === selectedSize);
                   const sStock = typeof sObj === 'string' ? 999 : (sObj?.stock || 0);
                   if (sStock === 0) return <span className="stock-badge out">Out of stock</span>;
                   if (sStock < 5) return <span className="stock-badge low">Sisa {sStock} lagi!</span>;
                   return <span className="stock-badge in">In stock</span>;
                })()}
              </div>
            )}
          </div>
          
          <div className="pdp-actions">
            <div className="pdp-qty-selector">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus size={16} /></button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)}><Plus size={16} /></button>
            </div>
            <button 
              className="btn btn-primary add-to-cart-btn" 
              onClick={handleAddToCart}
              disabled={!selectedSize || (() => {
                 const sObj = product.sizes.find(s => (typeof s === 'string' ? s : s.name) === selectedSize);
                 const sStock = typeof sObj === 'string' ? 999 : (sObj?.stock || 0);
                 return sStock === 0;
              })()}
            >
              {!selectedSize ? 'Select Size' : 'Add to Cart'}
            </button>
          </div>
          
          <button 
            className="btn pdp-wishlist-btn"
            style={{ backgroundColor: '#1a1a1a', color: '#fff', borderColor: '#1a1a1a', fontWeight: 'bold', width: '100%' }}
            disabled={!selectedSize || (() => {
               const sObj = product.sizes.find(s => (typeof s === 'string' ? s : s.name) === selectedSize);
               const sStock = typeof sObj === 'string' ? 999 : (sObj?.stock || 0);
               return sStock === 0;
            })()}
            onClick={() => {
              handleAddToCart();
              navigate('/cart');
            }}
          >
            <span>{!selectedSize ? 'SELECT SIZE TO BUY NOW' : 'BELI SEKARANG (BUY NOW)'}</span>
          </button>
          
          <div className="pdp-accordions">
            <div className="accordion">
              <button 
                className="accordion-header" 
                onClick={() => setIsDetailsOpen(!isDetailsOpen)}
              >
                <span>Product Details</span>
                {isDetailsOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              {isDetailsOpen && (
                <div className="accordion-content">
                  <p>{product.description}</p>
                </div>
              )}
            </div>
            
            <div className="accordion">
              <button 
                className="accordion-header" 
                onClick={() => setIsSizeGuideOpen(!isSizeGuideOpen)}
              >
                <span>Size Guide</span>
                {isSizeGuideOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              {isSizeGuideOpen && (
                <div className="accordion-content">
                  <p>Our sizing is true to fit. If you prefer a looser fit, we recommend sizing up. For exact measurements, please contact our support team.</p>
                </div>
              )}
            </div>
            
            <div className="accordion share-accordion">
              <button 
                className="accordion-header"
                onClick={() => setIsShareOpen(!isShareOpen)}
              >
                <span>Share</span>
                {isShareOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              {isShareOpen && (
                <div className="accordion-content share-content">
                  <div className="share-buttons">
                    <button className="share-btn copy" onClick={handleCopyLink} title="Copy Link">
                      <LinkIcon size={20} />
                    </button>
                    <a 
                      href={`https://wa.me/?text=Check out ${product.name}: ${window.location.href}`} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="share-btn whatsapp"
                      title="Share to WhatsApp"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                    </a>
                    <a 
                      href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="share-btn facebook"
                      title="Share to Facebook"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                    </a>
                    <a 
                      href={`https://twitter.com/intent/tweet?url=${window.location.href}&text=Check out ${product.name}`} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="share-btn twitter"
                      title="Share to Twitter"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Middle Section: Detailed Product Specs */}
      <div className="pdp-specs-section">
        <h2 className="section-title">Product Details</h2>
        
        <div className="specs-split">
          <div className="specs-image-col">
            <img src={product.aestheticImage || product.image} alt={`${product.name} specs view`} className="specs-large-img" />
          </div>
          <div className="specs-text-col">
            <h3 className="specs-highlight-text">
              UNTUK PRODUK SALE TIDAK BISA TUKAR SIZE ATAUPUN REFUND.
            </h3>
            
            <div className="spec-block">
              <h4>FEATURES</h4>
              {product.features && product.features.length > 0 ? (
                <ul>
                  {product.features.map((feature, idx) => <li key={idx}>{feature}</li>)}
                </ul>
              ) : (
                <p>No special features listed.</p>
              )}
            </div>
            
            <div className="spec-block">
              <h4>MATERIALS</h4>
              {product.materials && product.materials.length > 0 ? (
                <ul>
                  {product.materials.map((mat, idx) => <li key={idx}>{mat}</li>)}
                </ul>
              ) : (
                <p>Material details not available.</p>
              )}
            </div>
            
            <div className="spec-block">
              <h4>WASHING INSTRUCTIONS</h4>
              {product.washing && product.washing.length > 0 ? (
                <ul>
                  {product.washing.map((wash, idx) => <li key={idx}>{wash}</li>)}
                </ul>
              ) : (
                <p>Standard washing instructions apply.</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="specs-fullwidth-image">
           <img src="/images/hero_bg.png" alt="Texture detail" className="texture-image" />
        </div>
      </div>
      
      {/* Bottom Section: Related Products */}
      <div className="pdp-related-section">
        <ProductGrid 
          title="Related products" 
          subtitle=""
          items={products.slice(0, 4)}
          columns={4}
        />
      </div>
      
      <Footer />
      
      {/* Toast Notification */}
      <div className={`pdp-toast ${toastMessage ? 'show' : ''}`}>
        {toastMessage}
      </div>
    </div>
  );
}
