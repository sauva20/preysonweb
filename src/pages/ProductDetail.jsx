import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductGrid from '../components/ProductGrid';
import { Heart, Minus, Plus, ChevronDown, ChevronUp, Link as LinkIcon, ZoomIn, ZoomOut, RotateCcw, ChevronLeft, ChevronRight, X, Maximize2 } from 'lucide-react';
import { slugify } from '../utils/slugify';
import './ProductDetail.css';

export default function ProductDetail() {
  const params = useParams();
  const slugOrId = params.slug || params.id;
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

  // Lightbox & Zoom States
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [fullscreenIndex, setFullscreenIndex] = useState(0);

  const galleryImages = useMemo(() => {
    if (!product) return [];
    const list = [];
    if (product.image) list.push(product.image);
    if (product.thumbnails && Array.isArray(product.thumbnails)) {
      product.thumbnails.forEach(t => {
        if (t && !list.includes(t)) list.push(t);
      });
    }
    return list;
  }, [product]);

  const openFullscreen = (imgUrl) => {
    const idx = galleryImages.indexOf(imgUrl);
    setFullscreenIndex(idx >= 0 ? idx : 0);
    setZoomLevel(1);
    setIsFullscreenOpen(true);
  };

  const closeFullscreen = () => {
    setIsFullscreenOpen(false);
    setZoomLevel(1);
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.5, 1));
  };

  const toggleDoubleTapZoom = () => {
    setZoomLevel(prev => (prev > 1 ? 1 : 2));
  };

  const prevFullscreenImage = () => {
    setZoomLevel(1);
    setFullscreenIndex(prev => (prev > 0 ? prev - 1 : galleryImages.length - 1));
  };

  const nextFullscreenImage = () => {
    setZoomLevel(1);
    setFullscreenIndex(prev => (prev < galleryImages.length - 1 ? prev + 1 : 0));
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeFullscreen();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    // Scroll to top on load
    window.scrollTo(0, 0);
    
    if (!slugOrId) return;

    const found = products.find(p => {
      if (!p) return false;
      const pSlug = p.slug || slugify(p.name);
      return pSlug === slugOrId || String(p.id) === String(slugOrId);
    });

    if (found) {
      setProduct(found);
      setMainImage(found.image);
      setSelectedSize('');
      setQuantity(1);
    } else {
      fetch(`${import.meta.env.VITE_API_URL}/products/${slugOrId}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.id) {
            setProduct(data);
            setMainImage(data.image);
            setSelectedSize('');
            setQuantity(1);
          }
        })
        .catch(err => console.error("Failed to fetch product by slug:", err));
    }
  }, [slugOrId, products]);

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

  const handleInstagramShare = (e) => {
    e.preventDefault();
    navigator.clipboard.writeText(window.location.href);
    setToastMessage('✓ Tautan disalin! Membuka pesan Instagram...');
    setTimeout(() => {
      setToastMessage('');
      window.open('https://www.instagram.com/direct/inbox/', '_blank');
    }, 1500);
  };

  return (
    <div className="pdp-page">
      <Navbar />
      
      {/* Top Section: Breadcrumbs + Main Product Info */}
      <div className="pdp-top-section">
        <div className="pdp-gallery-col">
          <div className="pdp-thumbnails">
            {product.image && (
              <div 
                className={`pdp-thumb ${mainImage === product.image ? 'active' : ''}`}
                onClick={() => setMainImage(product.image)}
              >
                <img src={product.image} alt={`${product.name} main view`} />
              </div>
            )}
            {product.thumbnails && product.thumbnails.map((thumb, idx) => (
              <div 
                key={idx} 
                className={`pdp-thumb ${mainImage === thumb ? 'active' : ''}`}
                onClick={() => setMainImage(thumb)}
              >
                <img src={thumb} alt={`${product.name} view ${idx + 2}`} />
              </div>
            ))}
          </div>
          <div 
            className="pdp-main-image-wrapper clickable-zoom"
            onClick={() => openFullscreen(mainImage)}
            title="Klik untuk memperbesar (Fullscreen Zoom)"
          >
            <img src={mainImage} alt={product.name} className="pdp-main-image" />
            <div className="zoom-hint-badge">
              <Maximize2 size={15} /> <span>Fullscreen Zoom</span>
            </div>
          </div>
        </div>
        
        <div className="pdp-info-col">
          <div className="breadcrumbs">
            <Link to="/">Home</Link> / <Link to="/catalog">Catalog</Link> / <span>{product.name}</span>
          </div>
          
          <h1 className="pdp-title">
            {product.name}
            {(product.isSoldOut || product.stock <= 0) && (
              <span className="pdp-soldout-tag">SOLD OUT</span>
            )}
          </h1>
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
                const isOutOfStock = product.isSoldOut || stock === 0;

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
                   if (product.isSoldOut) return <span className="stock-badge out">Out of stock (Sold Out)</span>;
                   const sObj = product.sizes.find(s => (typeof s === 'string' ? s : s.name) === selectedSize);
                   const sStock = typeof sObj === 'string' ? 999 : (sObj?.stock || 0);
                   if (sStock === 0) return <span className="stock-badge out">Out of stock</span>;
                   if (sStock < 5) return <span className="stock-badge low">Only {sStock} left!</span>;
                   return <span className="stock-badge in">In stock</span>;
                })()}
              </div>
            )}
          </div>
          
          <div className="pdp-actions">
            <div className="pdp-qty-selector">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={product.isSoldOut || product.stock <= 0}><Minus size={16} /></button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} disabled={product.isSoldOut || product.stock <= 0}><Plus size={16} /></button>
            </div>
            <button 
              className={`btn btn-primary add-to-cart-btn ${(product.isSoldOut || product.stock <= 0) ? 'is-soldout-btn' : ''}`}
              onClick={handleAddToCart}
              disabled={product.isSoldOut || product.stock <= 0 || !selectedSize || (() => {
                 const sObj = product.sizes.find(s => (typeof s === 'string' ? s : s.name) === selectedSize);
                 const sStock = typeof sObj === 'string' ? 999 : (sObj?.stock || 0);
                 return sStock === 0;
              })()}
            >
              {(product.isSoldOut || product.stock <= 0) ? 'STOK HABIS (SOLD OUT)' : (!selectedSize ? 'PILIH UKURAN' : 'TAMBAH KE KERANJANG')}
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
                  {/* Size Guide Image */}
                  {Boolean(product.sizeGuide?.image && product.sizeGuide.image.trim() !== '') && (
                    <div className="size-guide-img-wrapper" style={{ marginBottom: (product.sizeGuide?.metrics?.length > 0 && product.sizes?.length > 0) ? '16px' : '0' }}>
                      <img 
                        src={product.sizeGuide.image} 
                        alt="Size Guide Chart" 
                        style={{ width: '100%', height: 'auto', borderRadius: '8px', display: 'block', cursor: 'pointer' }}
                        onClick={() => window.open(product.sizeGuide.image, '_blank')}
                        title="Click to view full size"
                      />
                    </div>
                  )}

                  {/* Size Guide Metric Table */}
                  {product.sizeGuide?.metrics?.length > 0 && product.sizes?.length > 0 && (
                    <div className="size-guide-table-wrapper">
                      <table className="size-guide-table">
                        <thead>
                          <tr>
                            <th>Size</th>
                            {product.sizeGuide.metrics.map(m => <th key={m}>{m}</th>)}
                          </tr>
                        </thead>
                        <tbody>
                          {product.sizes.map(size => {
                            const sizeName = typeof size === 'string' ? size : size.name;
                            return (
                              <tr key={sizeName}>
                                <td><strong>{sizeName}</strong></td>
                                {product.sizeGuide.metrics.map(m => (
                                  <td key={m}>{product.sizeGuide.measurements?.[sizeName]?.[m] || '-'}</td>
                                ))}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Fallback if neither image nor metric table is provided */}
                  {(!product.sizeGuide?.image || product.sizeGuide.image.trim() === '') &&
                   (!product.sizeGuide?.metrics?.length || !product.sizes?.length) && (
                    <p>Our sizing is true to fit. If you prefer a looser fit, we recommend sizing up. For exact measurements, please contact our support team.</p>
                  )}
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
                      href="#" 
                      onClick={handleInstagramShare}
                      className="share-btn instagram"
                      title="Share to Instagram"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
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
            {product.sizeGuide?.policyText !== undefined ? (
              product.sizeGuide.policyText.trim() !== '' && (
                <h3 className="specs-highlight-text">
                  {product.sizeGuide.policyText}
                </h3>
              )
            ) : (
              <h3 className="specs-highlight-text">
                UNTUK PRODUK SALE TIDAK BISA TUKAR SIZE ATAUPUN REFUND.
              </h3>
            )}
            
            {product.features && product.features.length > 0 && (
              <div className="spec-block">
                <h4>FEATURES</h4>
                <ul>
                  {product.features.map((feature, idx) => <li key={idx}>{feature}</li>)}
                </ul>
              </div>
            )}
            
            {product.materials && product.materials.length > 0 && (
              <div className="spec-block">
                <h4>MATERIALS</h4>
                <ul>
                  {product.materials.map((mat, idx) => <li key={idx}>{mat}</li>)}
                </ul>
              </div>
            )}
            
            {product.washing && product.washing.length > 0 && (
              <div className="spec-block">
                <h4>WASHING INSTRUCTIONS</h4>
                <ul>
                  {product.washing.map((wash, idx) => <li key={idx}>{wash}</li>)}
                </ul>
              </div>
            )}
          </div>
        </div>
        
        {Boolean(product.sizeGuide?.bannerImage && product.sizeGuide.bannerImage.trim() !== '') && (
          <div className="specs-fullwidth-image">
             <img src={product.sizeGuide.bannerImage} alt="Texture detail" className="texture-image" />
          </div>
        )}
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

      {/* Fullscreen Lightbox Modal */}
      {isFullscreenOpen && (
        <div className="pdp-lightbox-modal">
          <div className="lightbox-backdrop" onClick={closeFullscreen}></div>
          
          {/* Header Controls */}
          <div className="lightbox-header">
            <span className="lightbox-counter">
              {fullscreenIndex + 1} / {galleryImages.length}
            </span>
            
            <div className="lightbox-zoom-tools">
              <button onClick={handleZoomOut} disabled={zoomLevel <= 1} title="Zoom Out (-)">
                <ZoomOut size={18} />
              </button>
              <span className="zoom-value">{Math.round(zoomLevel * 100)}%</span>
              <button onClick={handleZoomIn} disabled={zoomLevel >= 3} title="Zoom In (+)">
                <ZoomIn size={18} />
              </button>
              {zoomLevel > 1 && (
                <button onClick={() => setZoomLevel(1)} title="Reset Zoom">
                  <RotateCcw size={16} />
                </button>
              )}
            </div>

            <button onClick={closeFullscreen} className="lightbox-close-btn" title="Tutup (Close X)">
              <X size={24} />
            </button>
          </div>

          {/* Main Image Container */}
          <div className="lightbox-content" onDoubleClick={toggleDoubleTapZoom}>
            {galleryImages.length > 1 && (
              <button className="lightbox-nav-btn prev" onClick={prevFullscreenImage} title="Sebelumnya">
                <ChevronLeft size={28} />
              </button>
            )}

            <div className="lightbox-img-container">
              <img 
                src={galleryImages[fullscreenIndex]} 
                alt={`${product.name} Fullscreen`} 
                className="lightbox-image"
                style={{ transform: `scale(${zoomLevel})` }}
              />
            </div>

            {galleryImages.length > 1 && (
              <button className="lightbox-nav-btn next" onClick={nextFullscreenImage} title="Berikutnya">
                <ChevronRight size={28} />
              </button>
            )}
          </div>

          {/* Bottom Thumbnail Selector */}
          {galleryImages.length > 1 && (
            <div className="lightbox-footer-thumbs">
              {galleryImages.map((img, idx) => (
                <div 
                  key={idx} 
                  className={`lightbox-footer-thumb ${idx === fullscreenIndex ? 'active' : ''}`}
                  onClick={() => { setFullscreenIndex(idx); setZoomLevel(1); }}
                >
                  <img src={img} alt="thumb" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
