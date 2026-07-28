import React, { useState } from 'react';
import { useProducts } from '../../context/ProductContext';
import { Plus, Edit2, Trash2, X, Image as ImageIcon, ChevronDown, Search, Upload, Flame, Eye, EyeOff } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import { useActivity } from '../../context/ActivityContext';
import Barcode from 'react-barcode';
import { confirmDelete, showSuccess, showError } from '../utils/alert';
import Swal from 'sweetalert2';
import './Products.css';

export default function Products() {
  const { products, addProduct, updateProduct, deleteProduct, toggleSoldOut, categories, addCategory, deleteCategory } = useProducts();
  const { formatPrice } = useCurrency();
  const { logActivity } = useActivity();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [newCatName, setNewCatName] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    price: '',
    stock: '',
    description: '',
    thumbnails: [],
    sizes: [],
    sizeGuide: { image: '', metrics: [], measurements: {} },
    aestheticImage: '',
    features: [],
    materials: [],
    washing: []
  });

  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const uploadImage = async (file) => {
    setIsUploadingImage(true);
    const data = new FormData();
    data.append('image', file);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/upload`, {
        method: 'POST',
        body: data
      });
      if (!res.ok) throw new Error('Upload failed');
      const json = await res.json();
      return json.url;
    } catch (err) {
      console.error('Error uploading image:', err);
      Swal.fire({ title: 'Failed to upload image', icon: 'error', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false });
      return null;
    } finally {
      setIsUploadingImage(false);
    }
  };

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        categoryId: product.categoryId || '',
        price: product.price,
        stock: product.stock,
        description: product.description || '',
        thumbnails: [product.image, ...(product.thumbnails || [])].filter(Boolean),
        sizes: (product.sizes || []).map(s => typeof s === 'string' ? { name: s, stock: 0 } : s),
        sizeGuide: product.sizeGuide || { image: '', metrics: [], measurements: {} },
        aestheticImage: product.aestheticImage || '',
        features: product.features || [],
        materials: product.materials || [],
        washing: product.washing || []
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', categoryId: '', price: '', stock: '', description: '', thumbnails: [], sizes: [], sizeGuide: { image: '', metrics: [], measurements: {} }, aestheticImage: '', features: [], materials: [], washing: [] });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      return Swal.fire('Perhatian', 'Nama produk wajib diisi!', 'warning');
    }
    if (!formData.categoryId) {
      return Swal.fire('Perhatian', 'Kategori produk wajib dipilih!', 'warning');
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      return Swal.fire('Perhatian', 'Harga produk wajib diisi dan harus valid!', 'warning');
    }
    if (formData.thumbnails.length === 0) {
      return Swal.fire('Perhatian', 'Minimal harus ada 1 foto produk!', 'warning');
    }
    if (formData.sizes.length === 0) {
      return Swal.fire('Perhatian', 'Minimal harus ada 1 varian ukuran (Size)!', 'warning');
    }

    Swal.fire({ title: 'Saving Product...', text: 'Please wait...', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); } });

    try {
      // Auto-generate SKU if new product
      let finalSku = editingProduct ? editingProduct.sku : '';
      if (!editingProduct) {
        const cat = categories.find(c => c.id === parseInt(formData.categoryId));
        const catPrefix = cat ? cat.name.substring(0, 3).toUpperCase() : 'PRD';
        const namePrefix = formData.name.substring(0, 3).toUpperCase();
        const random = Math.floor(1000 + Math.random() * 9000);
        finalSku = `${catPrefix}-${namePrefix}-${random}`;
      }

      const mainImage = formData.thumbnails.length > 0 ? formData.thumbnails[0] : '';
      const additionalThumbs = formData.thumbnails.slice(1);

      const productData = {
        name: formData.name,
        sku: finalSku,
        price: parseFloat(formData.price),
        stock: formData.sizes.reduce((acc, curr) => acc + (parseInt(curr.stock) || 0), 0),
        image: mainImage,
        categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
        description: formData.description,
        thumbnails: additionalThumbs,
        sizes: formData.sizes,
        sizeGuide: formData.sizeGuide,
        aestheticImage: formData.aestheticImage,
        features: formData.features.filter(f => f.trim() !== ''),
        materials: formData.materials.filter(f => f.trim() !== ''),
        washing: formData.washing.filter(f => f.trim() !== '')
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
        logActivity({ category: 'Produk', title: 'Pembaruan Produk', description: `Data produk "${productData.name}" (Stok: ${productData.stock}) berhasil diperbarui.`, status: 'info' });
        Swal.close();
        showSuccess('Product updated successfully');
      } else {
        await addProduct(productData);
        logActivity({ category: 'Produk', title: 'Produk Baru Ditambahkan', description: `Produk baru "${productData.name}" (Stok awal: ${productData.stock}) ditambahkan ke katalog.`, status: 'success' });
        Swal.close();
        showSuccess('Product added successfully');
      }
      closeModal();
    } catch (err) {
      console.error('Error saving product:', err);
      Swal.fire('Error', 'Failed to save product. Please try again.', 'error');
    }
  };

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    await addCategory({ name: newCatName });
    logActivity({ category: 'Produk', title: 'Kategori Baru Ditambahkan', description: `Kategori katalog baru "${newCatName}" telah dibuat.`, status: 'success' });
    setNewCatName('');
    showSuccess('Category added successfully');
  };

  const renderListEditor = (field, label) => (
    <div className="spec-block preview-spec-block">
      <h4>{label}</h4>
      <ul>
        {formData[field].map((item, index) => (
          <li key={index} className="preview-li-input">
            <input
              type="text"
              value={item}
              onChange={(e) => {
                const newList = [...formData[field]];
                newList[index] = e.target.value;
                setFormData({ ...formData, [field]: newList });
              }}
              placeholder={`Type ${label.toLowerCase()} here...`}
            />
            <button type="button" onClick={() => {
              const newList = formData[field].filter((_, i) => i !== index);
              setFormData({ ...formData, [field]: newList });
            }} className="remove-item-btn"><X size={14} /></button>
          </li>
        ))}
      </ul>
      <button type="button" className="add-preview-btn" onClick={() => setFormData({ ...formData, [field]: [...formData[field], ''] })}>
        + Add bullet point
      </button>
    </div>
  );

  return (
    <div className="products-page">
      <div className="products-header">
        <div className="page-titles">
          <h2>Product Inventory</h2>
          <p>Manage your products, stock, categories and aesthetic details.</p>
        </div>
        <div className="products-header-actions">
          <button className="manage-cat-btn" onClick={() => setIsCatModalOpen(true)} style={{ height: 'auto', padding: '10px 16px', fontSize: '14px', borderRadius: '8px' }}>
            MANAGE CATEGORIES
          </button>
          <button className="add-product-btn" onClick={() => openModal()}>
            <Plus size={18} />
            ADD PRODUCT
          </button>
        </div>
      </div>

      <div className="search-wrapper" style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--admin-surface)', border: '1px solid var(--admin-border)', borderRadius: '8px', padding: '10px 16px', marginBottom: '20px', maxWidth: '420px' }}>
        <Search size={18} color="var(--admin-text-muted)" style={{ marginRight: '10px' }} />
        <input
          type="text"
          placeholder="Cari produk berdasarkan Nama, SKU, atau Kategori..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ flex: 1, background: 'none', border: 'none', color: 'var(--admin-text)', outline: 'none', fontSize: '13px' }}
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', color: 'var(--admin-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <X size={16} />
          </button>
        )}
      </div>

      <div className="products-table-container">
        <table className="products-table">
          <thead>
            <tr>
              <th>IMAGE</th>
              <th>NAME & SKU</th>
              <th>CATEGORY</th>
              <th>PRICE</th>
              <th>STOCK</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {products.filter(p => {
              const q = searchQuery.toLowerCase().trim();
              if (!q) return true;
              return String(p.name || '').toLowerCase().includes(q) ||
                     String(p.sku || '').toLowerCase().includes(q) ||
                     String(p.category?.name || p.categoryId || '').toLowerCase().includes(q);
            }).map(product => (
              <tr key={product.id}>
                <td>
                  <div
                    className="table-img"
                    style={{ backgroundImage: `url(${product.image || '/images/placeholder.png'})` }}
                  />
                </td>
                <td>
                  <div className="table-product-info">
                    <h4>{product.name}</h4>
                    <span className="table-sku">{product.sku}</span>
                  </div>
                </td>
                <td>
                  {product.category ? <span className="cat-badge">{product.category.name}</span> : <span className="text-muted">-</span>}
                </td>
                <td className="table-price">{formatPrice(product.price)}</td>
                <td>
                  <span className={`stock-pill ${product.stock < 5 ? 'low-stock' : ''}`}>
                    {product.stock}
                  </span>
                </td>
                <td>
                  <div className="table-actions">
                    <button 
                      className={`action-btn soldout-toggle-btn ${product.isSoldOut ? 'is-soldout' : ''}`}
                      title={product.isSoldOut ? 'Aktifkan Kembali Stok (Normal Mode)' : 'Matikan Stok / Tandai Sold Out (Marketing Mode)'}
                      onClick={async () => {
                        try {
                          const updated = await toggleSoldOut(product.id);
                          logActivity({
                            category: 'Produk',
                            title: 'Status Sold Out Diubah',
                            description: `Produk "${product.name}" kini dalam status ${updated.isSoldOut ? 'SOLD OUT (Marketing Mode)' : 'Aktif Tersedia'}.`,
                            status: updated.isSoldOut ? 'warning' : 'success'
                          });
                          showSuccess(updated.isSoldOut ? `"${product.name}" ditandai SOLD OUT!` : `"${product.name}" kembali Aktif!`);
                        } catch (e) {
                          showError('Gagal mengubah status produk');
                        }
                      }}
                    >
                      {product.isSoldOut ? <Flame size={15} color="#ef4444" /> : <Eye size={15} />}
                      <span className="soldout-btn-text">{product.isSoldOut ? 'SOLD OUT' : 'AKTIF'}</span>
                    </button>
                    <button className="action-btn edit" onClick={() => openModal(product)} title="Edit Produk">
                      <Edit2 size={16} />
                    </button>
                    <button className="action-btn delete" title="Hapus Produk" onClick={async () => {
                      if (await confirmDelete(`the product "${product.name}"`)) {
                        await deleteProduct(product.id);
                        logActivity({ category: 'Produk', title: 'Produk Dihapus', description: `Produk "${product.name}" telah dihapus secara permanen dari katalog.`, status: 'warning' });
                        showSuccess('Product deleted successfully');
                      }
                    }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan="6" className="empty-table">No products found. Add a product to get started.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="edit-modal product-modal xl-modal">
            <div className="modal-header">
              <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <button className="close-modal-btn" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
              <div className="modal-body modal-scrollable">
                <div className="live-pdp-preview">

                  <div className="preview-breadcrumbs">
                    <span className="breadcrumb-link">HOME</span>
                    <span className="breadcrumb-separator">/</span>
                    <span className="breadcrumb-link">CATALOG</span>
                    <span className="breadcrumb-separator">/</span>
                    <div className="custom-breadcrumb-select-wrapper">
                      <button
                        type="button"
                        className="breadcrumb-dropdown-btn"
                        onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                      >
                        {formData.categoryId
                          ? categories.find(c => c.id == formData.categoryId)?.name.toUpperCase() || 'SELECT CATEGORY'
                          : 'SELECT CATEGORY'}
                        <ChevronDown size={14} />
                      </button>

                      {isCategoryDropdownOpen && (
                        <div className="breadcrumb-dropdown-menu">
                          {categories.map(c => (
                            <div
                              key={c.id}
                              className={`breadcrumb-dropdown-item ${formData.categoryId == c.id ? 'selected' : ''}`}
                              onClick={() => { setFormData({ ...formData, categoryId: c.id }); setIsCategoryDropdownOpen(false); }}
                            >
                              {c.name.toUpperCase()}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pdp-top-section-preview">
                    {/* Left Column: Gallery */}
                    <div className="pdp-gallery-col-preview">
                      <div className="pdp-thumbnails-preview">
                        {formData.thumbnails.map((url, i) => (
                          <div key={i} className={`pdp-thumb-preview ${i === 0 ? 'active' : ''}`} style={{ position: 'relative' }}>
                            <img src={url} alt={`Thumb ${i}`} />
                            <button type="button" className="remove-img-btn" onClick={() => {
                              const newThumbs = formData.thumbnails.filter((_, idx) => idx !== i);
                              const newFormData = { ...formData, thumbnails: newThumbs };
                              if (formData.aestheticImage === url) {
                                newFormData.aestheticImage = '';
                              }
                              setFormData(newFormData);
                            }}><X size={12} /></button>
                            {i === 0 && <span className="main-badge">Main</span>}
                            {i !== 0 && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFormData(prev => ({ ...prev, aestheticImage: prev.aestheticImage === url ? '' : url }));
                                }}
                                style={{
                                  position: 'absolute',
                                  bottom: '2px',
                                  left: '50%',
                                  transform: 'translateX(-50%)',
                                  fontSize: '9px',
                                  padding: '2px 4px',
                                  background: formData.aestheticImage === url ? '#1a1a1a' : 'rgba(255,255,255,0.9)',
                                  color: formData.aestheticImage === url ? '#fff' : '#000',
                                  border: '1px solid #ccc',
                                  borderRadius: '3px',
                                  cursor: 'pointer',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {formData.aestheticImage === url ? 'Hover ✓' : 'Set Hover'}
                              </button>
                            )}
                          </div>
                        ))}
                        {/* Upload Button */}
                        <label className="pdp-thumb-preview upload-thumb-preview" style={isUploadingImage ? { opacity: 0.5, cursor: 'not-allowed' } : {}}>
                          <input type="file" multiple accept="image/*" style={{ display: 'none' }} disabled={isUploadingImage} onChange={async (e) => {
                            const files = Array.from(e.target.files);
                            const urls = [];
                            for (const file of files) {
                              const url = await uploadImage(file);
                              if (url) urls.push(url);
                            }
                            setFormData(prev => ({ ...prev, thumbnails: [...prev.thumbnails, ...urls] }));
                          }} />
                          {isUploadingImage ? <span style={{ fontSize: '10px', color: '#666', fontWeight: 'bold' }}>UPLOADING...</span> : <Plus size={24} color="#999" />}
                        </label>
                      </div>

                      <div className="pdp-main-image-wrapper-preview">
                        <img
                          src={formData.thumbnails.length > 0 ? formData.thumbnails[0] : '/images/placeholder.png'}
                          alt="Main Product"
                          className="pdp-main-image-preview"
                        />
                      </div>


                    </div>

                    {/* Right Column: Info */}
                    <div className="pdp-info-col-preview">
                      <input
                        type="text"
                        className="invisible-input pdp-title-preview"
                        required
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        placeholder="PRODUCT NAME"
                      />

                      <div className="price-input-wrapper">
                        <span className="currency-symbol">Rp</span>
                        <input
                          type="text"
                          className="invisible-input pdp-price-preview"
                          required
                          value={formData.price ? Number(formData.price).toLocaleString('id-ID') : ''}
                          onChange={e => {
                            const rawValue = e.target.value.replace(/\D/g, '');
                            setFormData({ ...formData, price: rawValue });
                          }}
                          placeholder="0"
                        />
                      </div>

                      <div className="pdp-size-section-preview">
                        <div className="size-header-preview">Available Sizes</div>
                        <div className="pdp-size-grid-preview">
                          {['All Size', 'S', 'M', 'L', 'XL', 'XXL'].map(size => {
                            const isSelected = formData.sizes.some(s => s.name === size);
                            return (
                              <button
                                key={size}
                                type="button"
                                className={`pdp-size-btn-preview ${isSelected ? 'selected' : ''}`}
                                onClick={() => {
                                  let newSizes;
                                  if (isSelected) {
                                    newSizes = formData.sizes.filter(s => s.name !== size);
                                  } else {
                                    newSizes = [...formData.sizes, { name: size, stock: 10 }];
                                  }
                                  const totalStock = newSizes.reduce((acc, curr) => acc + (parseInt(curr.stock) || 0), 0);
                                  setFormData({ ...formData, sizes: newSizes, stock: totalStock });
                                }}
                              >
                                {size}
                              </button>
                            );
                          })}
                        </div>
                        {formData.sizes.length > 0 && (
                          <div className="size-stock-inputs" style={{ marginTop: '15px' }}>
                            <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: '#666' }}>STOCK PER SIZE:</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                              {formData.sizes.map((s, index) => (
                                <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f5f5f5', padding: '6px 12px', borderRadius: '4px' }}>
                                  <span style={{ fontWeight: 'bold', width: '30px' }}>{s.name}</span>
                                  <input
                                    type="number"
                                    value={s.stock}
                                    onChange={(e) => {
                                      const newSizes = [...formData.sizes];
                                      newSizes[index].stock = parseInt(e.target.value) || 0;
                                      const totalStock = newSizes.reduce((acc, curr) => acc + (parseInt(curr.stock) || 0), 0);
                                      setFormData({ ...formData, sizes: newSizes, stock: totalStock });
                                    }}
                                    style={{ width: '60px', padding: '4px', border: '1px solid #ccc', borderRadius: '4px' }}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="stock-input-wrapper">
                        <span className="stock-label">Total Inventory Stock:</span>
                        <input
                          type="number"
                          className="invisible-input small-number-input"
                          readOnly
                          value={formData.sizes.reduce((acc, curr) => acc + (parseInt(curr.stock) || 0), 0)}
                          placeholder="0"
                        />
                      </div>

                      <div className="pdp-actions-preview">
                        <div className="pdp-qty-selector-preview">
                          <button type="button">-</button>
                          <span>1</span>
                          <button type="button">+</button>
                        </div>
                        <button type="button" className="add-to-cart-btn-preview">ADD TO CART</button>
                      </div>

                      <div className="pdp-accordions-preview">
                        <div className="accordion-preview">
                          <div className="accordion-header-preview">Product Details <span className="arrow-down">^</span></div>
                          <div className="accordion-content-preview">
                            <textarea
                              className="invisible-textarea"
                              rows="4"
                              value={formData.description}
                              onChange={e => setFormData({ ...formData, description: e.target.value })}
                              placeholder="Type product description here..."
                            />
                          </div>
                        </div>
                        <div className="accordion-preview" style={{ paddingBottom: '10px' }}>
                          <div className="accordion-header-preview">Size Guide <span className="arrow-down">^</span></div>
                          <div className="accordion-content-preview" style={{ marginTop: '10px', display: 'block' }}>
                            {/* Upload Size Guide Image */}
                            <div style={{ marginBottom: '16px' }}>
                              <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--admin-text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
                                Size Guide Image (Optional)
                              </div>
                              {formData.sizeGuide?.image ? (
                                <div style={{ position: 'relative', width: '100%', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--admin-border)', background: '#f8f9fa' }}>
                                  <img 
                                    src={formData.sizeGuide.image} 
                                    alt="Size Guide" 
                                    style={{ width: '100%', maxHeight: '220px', objectFit: 'contain', display: 'block', padding: '8px' }} 
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setFormData({
                                      ...formData,
                                      sizeGuide: { ...(formData.sizeGuide || {}), image: '' }
                                    })}
                                    style={{
                                      position: 'absolute',
                                      top: '6px',
                                      right: '6px',
                                      background: 'rgba(239, 68, 68, 0.9)',
                                      color: '#fff',
                                      border: 'none',
                                      borderRadius: '50%',
                                      width: '24px',
                                      height: '24px',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}
                                    title="Remove Size Guide Image"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              ) : (
                                <label style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '8px',
                                  padding: '14px',
                                  border: '1px dashed var(--admin-border)',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  background: 'var(--admin-surface)',
                                  fontSize: '12px',
                                  color: 'var(--admin-text-muted)',
                                  transition: 'all 0.2s'
                                }}>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    disabled={isUploadingImage}
                                    onChange={async (e) => {
                                      if (e.target.files && e.target.files.length > 0) {
                                        const url = await uploadImage(e.target.files[0]);
                                        if (url) {
                                          setFormData({
                                            ...formData,
                                            sizeGuide: { ...(formData.sizeGuide || {}), image: url }
                                          });
                                        }
                                      }
                                    }}
                                  />
                                  <Upload size={16} />
                                  <span>{isUploadingImage ? 'Uploading Image...' : 'Upload Size Guide Image'}</span>
                                </label>
                              )}
                            </div>

                            <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--admin-text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
                              Size Guide Table (Optional)
                            </div>
                            <div className="metric-input-wrapper">
                              <input
                                type="text"
                                placeholder="Add Metric (e.g. LD, LP)"
                                id="newMetricInput"
                                className="metric-input-preview"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    document.getElementById('addMetricBtn').click();
                                  }
                                }}
                              />
                              <button
                                type="button"
                                id="addMetricBtn"
                                className="add-metric-btn-preview"
                                onClick={() => {
                                  const input = document.getElementById('newMetricInput');
                                  const val = input.value.trim().toUpperCase();
                                  if (val && !formData.sizeGuide?.metrics?.includes(val)) {
                                    const newMetrics = [...(formData.sizeGuide?.metrics || []), val];
                                    setFormData({
                                      ...formData,
                                      sizeGuide: { ...(formData.sizeGuide || { measurements: {} }), metrics: newMetrics }
                                    });
                                    input.value = '';
                                  }
                                }}
                              >
                                Add
                              </button>
                            </div>

                            {formData.sizeGuide?.metrics?.length > 0 && formData.sizes.length > 0 && (
                              <div className="size-guide-table-wrapper">
                                <table className="size-guide-admin-table">
                                  <thead>
                                    <tr>
                                      <th>Size</th>
                                      {formData.sizeGuide.metrics.map((m, i) => (
                                        <th key={m}>
                                          <div className="metric-header-content">
                                            <span>{m}</span>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                const newMetrics = formData.sizeGuide.metrics.filter(met => met !== m);
                                                setFormData({
                                                  ...formData,
                                                  sizeGuide: { ...formData.sizeGuide, metrics: newMetrics }
                                                });
                                              }}
                                              className="remove-metric-btn"
                                              title="Remove Metric"
                                            >
                                              <Trash2 size={12} />
                                            </button>
                                          </div>
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {formData.sizes.map(size => (
                                      <tr key={size.name}>
                                        <td className="size-name-cell">{size.name}</td>
                                        {formData.sizeGuide.metrics.map(m => (
                                          <td key={m}>
                                            <input
                                              type="text"
                                              placeholder="0cm"
                                              className="size-guide-input-preview"
                                              value={(formData.sizeGuide.measurements[size.name] && formData.sizeGuide.measurements[size.name][m]) || ''}
                                              onChange={(e) => {
                                                const newMeasurements = { ...(formData.sizeGuide.measurements || {}) };
                                                if (!newMeasurements[size.name]) newMeasurements[size.name] = {};
                                                newMeasurements[size.name][m] = e.target.value;
                                                setFormData({
                                                  ...formData,
                                                  sizeGuide: { ...formData.sizeGuide, measurements: newMeasurements }
                                                });
                                              }}
                                            />
                                          </td>
                                        ))}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                            {(!formData.sizeGuide?.metrics?.length || !formData.sizes.length) && !formData.sizeGuide?.image && (
                              <div className="size-guide-empty-state">
                                Upload a Size Guide Image above, or add "Available Sizes" + "Metrics" to create a table (or use both).
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="accordion-preview">
                          <div className="accordion-header-preview">Share <span className="arrow-down">v</span></div>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Aesthetic Details Section */}
                  <div className="preview-specs-container">
                    <div className="specs-split-preview">
                      <div className="specs-image-col-preview">
                        <div className="aesthetic-upload-wrapper">
                          <img
                            src={formData.aestheticImage || formData.thumbnails[0] || '/images/placeholder.png'}
                            alt="Aesthetic preview"
                            className="specs-large-img-preview"
                          />
                          <label className="aesthetic-upload-overlay" style={isUploadingImage ? { opacity: 0.5, cursor: 'not-allowed' } : {}}>
                            <input type="file" accept="image/*" style={{ display: 'none' }} disabled={isUploadingImage} onChange={async (e) => {
                              if (e.target.files && e.target.files.length > 0) {
                                const url = await uploadImage(e.target.files[0]);
                                if (url) {
                                  setFormData({ ...formData, aestheticImage: url });
                                }
                              }
                            }} />
                            {isUploadingImage ? <span style={{ fontSize: '14px', color: '#fff', fontWeight: 'bold' }}>UPLOADING...</span> : (
                              <>
                                <Plus size={32} color="#fff" />
                                <span>Change Image</span>
                              </>
                            )}
                          </label>
                        </div>
                      </div>
                      <div className="specs-text-col-preview">
                        <div style={{ marginBottom: '16px' }}>
                          <textarea 
                            value={formData.sizeGuide?.policyText ?? 'UNTUK PRODUK SALE TIDAK BISA TUKAR SIZE ATAUPUN REFUND.'} 
                            onChange={(e) => setFormData({ ...formData, sizeGuide: { ...(formData.sizeGuide || {}), policyText: e.target.value } })}
                            placeholder="Sale warning text (kosongkan untuk menyembunyikan)"
                            style={{ width: '100%', padding: '12px', background: 'var(--input-bg)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', minHeight: '60px', fontFamily: 'inherit' }}
                          />
                        </div>

                        {renderListEditor('features', 'FEATURES')}
                        {renderListEditor('materials', 'MATERIALS')}
                        {renderListEditor('washing', 'WASHING INSTRUCTIONS')}
                      </div>
                    </div>
                  </div>
                  
                  {/* Banner Upload Section */}
                  <div className="banner-upload-section" style={{ marginTop: '20px', padding: '20px', border: '1px dashed var(--border-color)', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>Product Banner (Bottom)</h4>
                      {Boolean(formData.sizeGuide?.bannerImage) && (
                        <button 
                          type="button" 
                          onClick={() => setFormData({ ...formData, sizeGuide: { ...(formData.sizeGuide || {}), bannerImage: '' } })}
                          style={{
                            background: '#ef4444',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '6px 12px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'opacity 0.2s'
                          }}
                        >
                          <X size={14} /> Remove Banner
                        </button>
                      )}
                    </div>

                    {formData.sizeGuide?.bannerImage ? (
                      <div style={{ position: 'relative', width: '100%', height: '120px', background: '#222', borderRadius: '8px', overflow: 'hidden' }}>
                        <img 
                          src={formData.sizeGuide.bannerImage} 
                          alt="Banner Preview" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                        <label 
                          style={{ 
                            position: 'absolute', 
                            top: 0, 
                            left: 0, 
                            width: '100%', 
                            height: '100%', 
                            display: 'flex', 
                            justifyContent: 'center', 
                            alignItems: 'center', 
                            background: 'rgba(0,0,0,0.5)', 
                            cursor: 'pointer', 
                            color: '#fff', 
                            opacity: isUploadingImage ? 1 : 0, 
                            transition: 'opacity 0.2s',
                            ...(isUploadingImage ? { cursor: 'not-allowed' } : {}) 
                          }}
                          onMouseEnter={(e) => !isUploadingImage && (e.currentTarget.style.opacity = 1)}
                          onMouseLeave={(e) => !isUploadingImage && (e.currentTarget.style.opacity = 0)}
                        >
                          <input type="file" accept="image/*" style={{ display: 'none' }} disabled={isUploadingImage} onChange={async (e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              const url = await uploadImage(e.target.files[0]);
                              if (url) {
                                setFormData({ ...formData, sizeGuide: { ...(formData.sizeGuide || {}), bannerImage: url } });
                              }
                            }
                          }} />
                          {isUploadingImage ? <span style={{ fontWeight: 'bold' }}>UPLOADING...</span> : <span>Click to Change Banner</span>}
                        </label>

                        {/* Top-Right Close / Cancel Badge Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFormData({ ...formData, sizeGuide: { ...(formData.sizeGuide || {}), bannerImage: '' } });
                          }}
                          style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            background: '#ef4444',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '50%',
                            width: '28px',
                            height: '28px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            zIndex: 20,
                            boxShadow: '0 2px 6px rgba(0,0,0,0.4)'
                          }}
                          title="Remove Banner"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <label style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        width: '100%', 
                        height: '100px', 
                        background: 'var(--input-bg)', 
                        border: '1px dashed var(--border-color)', 
                        borderRadius: '8px', 
                        cursor: 'pointer', 
                        color: 'var(--text-secondary)',
                        transition: 'border-color 0.2s'
                      }}>
                        <input type="file" accept="image/*" style={{ display: 'none' }} disabled={isUploadingImage} onChange={async (e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            const url = await uploadImage(e.target.files[0]);
                            if (url) {
                              setFormData({ ...formData, sizeGuide: { ...(formData.sizeGuide || {}), bannerImage: url } });
                            }
                          }
                        }} />
                        <Upload size={22} style={{ marginBottom: '6px' }} />
                        <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                          {isUploadingImage ? 'UPLOADING...' : '+ Upload Product Banner (Bottom)'}
                        </span>
                        <span style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '2px' }}>
                          Optional: Biarkan kosong jika produk ini tidak pakai banner bawah
                        </span>
                      </label>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                {!editingProduct && <div className="sku-hint">SKU will be auto-generated on save.</div>}
                <button type="button" className="cancel-btn" onClick={closeModal}>Cancel</button>
                <button type="submit" className="save-modal-btn">
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Categories Management Modal */}
      {isCatModalOpen && (
        <div className="modal-backdrop" style={{ zIndex: 1100 }}>
          <div className="edit-modal category-modal">
            <div className="modal-header">
              <h3>Manage Categories</h3>
              <button className="close-modal-btn" onClick={() => setIsCatModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="add-cat-form">
                <input
                  type="text"
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  placeholder="New Category Name..."
                  onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                />
                <button onClick={handleAddCategory} className="save-modal-btn">Add</button>
              </div>
              <ul className="cat-list">
                {categories.map(c => (
                  <li key={c.id}>
                    <span>{c.name}</span>
                    <button onClick={async () => {
                      if (await confirmDelete(`the category "${c.name}"`)) {
                        await deleteCategory(c.id);
                        logActivity({ category: 'Produk', title: 'Kategori Dihapus', description: `Kategori produk "${c.name}" telah dihapus.`, status: 'warning' });
                        showSuccess('Category deleted successfully');
                      }
                    }} className="action-btn delete"><Trash2 size={14} /></button>
                  </li>
                ))}
                {categories.length === 0 && <p className="text-muted" style={{ textAlign: 'center', padding: '10px' }}>No categories yet.</p>}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
