import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductGrid from '../components/ProductGrid';
import { Heart, Minus, Plus, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [showToast, setShowToast] = useState(false);

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
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
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
              <button className="accordion-header">
                <span>Share</span>
                <ChevronDown size={18} />
              </button>
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
      <div className={`pdp-toast ${showToast ? 'show' : ''}`}>
        ✓ Berhasil ditambahkan ke keranjang!
      </div>
    </div>
  );
}
