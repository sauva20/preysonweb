import React, { useState } from 'react';
import { useProducts } from '../../context/ProductContext';
import { Plus, Edit2, Trash2, X, Image as ImageIcon } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import Barcode from 'react-barcode';
import './Products.css';

export default function Products() {
  const { products, addProduct, updateProduct, deleteProduct, categories, addCategory, deleteCategory } = useProducts();
  const { formatPrice } = useCurrency();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  const [newCatName, setNewCatName] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    price: '',
    stock: '',
    description: '',
    thumbnails: [],
    sizes: [],
    aestheticImage: '',
    features: [],
    materials: [],
    washing: []
  });

  const uploadImage = async (file) => {
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
      return null;
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
        sizes: product.sizes || [],
        aestheticImage: product.aestheticImage || '',
        features: product.features || [],
        materials: product.materials || [],
        washing: product.washing || []
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', categoryId: '', price: '', stock: '', description: '', thumbnails: [], sizes: [], aestheticImage: '', features: [], materials: [], washing: [] });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
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
      aestheticImage: formData.aestheticImage,
      features: formData.features.filter(f => f.trim() !== ''),
      materials: formData.materials.filter(f => f.trim() !== ''),
      washing: formData.washing.filter(f => f.trim() !== '')
    };

    if (editingProduct) {
      await updateProduct(editingProduct.id, productData);
    } else {
      await addProduct(productData);
    }
    closeModal();
  };

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    await addCategory({ name: newCatName });
    setNewCatName('');
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
                setFormData({...formData, [field]: newList});
              }} 
              placeholder={`Type ${label.toLowerCase()} here...`}
            />
            <button type="button" onClick={() => {
              const newList = formData[field].filter((_, i) => i !== index);
              setFormData({...formData, [field]: newList});
            }} className="remove-item-btn"><X size={14}/></button>
          </li>
        ))}
      </ul>
      <button type="button" className="add-preview-btn" onClick={() => setFormData({...formData, [field]: [...formData[field], '']})}>
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
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="manage-cat-btn" onClick={() => setIsCatModalOpen(true)} style={{ height: 'auto', padding: '10px 16px', fontSize: '14px', borderRadius: '8px' }}>
            MANAGE CATEGORIES
          </button>
          <button className="add-product-btn" onClick={() => openModal()}>
            <Plus size={18} />
            ADD PRODUCT
          </button>
        </div>
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
            {products.map(product => (
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
                    <button className="action-btn edit" onClick={() => openModal(product)}>
                      <Edit2 size={16} />
                    </button>
                    <button className="action-btn delete" onClick={() => deleteProduct(product.id)}>
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
            
            <form onSubmit={handleSubmit}>
              <div className="modal-body modal-scrollable" style={{ backgroundColor: '#fff' }}>
                <div className="live-pdp-preview">
                  
                  {/* Fake Header/Breadcrumbs area for Category */}
                  <div className="preview-breadcrumbs">
                    <span>HOME / CATALOG / </span>
                    <select 
                      className="invisible-select"
                      required
                      value={formData.categoryId} 
                      onChange={e => setFormData({...formData, categoryId: e.target.value})}
                    >
                      <option value="">SELECT CATEGORY</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name.toUpperCase()}</option>)}
                    </select>
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
                              const newFormData = {...formData, thumbnails: newThumbs};
                              if (formData.aestheticImage === url) {
                                newFormData.aestheticImage = '';
                              }
                              setFormData(newFormData);
                            }}><X size={12}/></button>
                            {i === 0 && <span className="main-badge">Main</span>}
                            {i !== 0 && (
                              <button 
                                type="button" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFormData(prev => ({...prev, aestheticImage: prev.aestheticImage === url ? '' : url}));
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
                        <label className="pdp-thumb-preview upload-thumb-preview">
                          <input type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={async (e) => {
                            const files = Array.from(e.target.files);
                            const urls = [];
                            for (const file of files) {
                              const url = await uploadImage(file);
                              if (url) urls.push(url);
                            }
                            setFormData(prev => ({...prev, thumbnails: [...prev.thumbnails, ...urls]}));
                          }} />
                          <Plus size={24} color="#999" />
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
                        onChange={e => setFormData({...formData, name: e.target.value})} 
                        placeholder="PRODUCT NAME"
                      />
                      
                      <div className="price-input-wrapper">
                        <span className="currency-symbol">Rp</span>
                        <input 
                          type="number" 
                          className="invisible-input pdp-price-preview"
                          step="0.01" 
                          required 
                          value={formData.price} 
                          onChange={e => setFormData({...formData, price: e.target.value})} 
                          placeholder="0"
                        />
                      </div>

                      <div className="pdp-size-section-preview">
                        <div className="size-header-preview">Available Sizes</div>
                        <div className="pdp-size-grid-preview">
                          {['S', 'M', 'L', 'XL', 'XXL'].map(size => {
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
                                  setFormData({...formData, sizes: newSizes, stock: totalStock});
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
                                      setFormData({...formData, sizes: newSizes, stock: totalStock});
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
                              onChange={e => setFormData({...formData, description: e.target.value})} 
                              placeholder="Type product description here..."
                            />
                          </div>
                        </div>
                        <div className="accordion-preview">
                          <div className="accordion-header-preview">Size Guide <span className="arrow-down">v</span></div>
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
                          <label className="aesthetic-upload-overlay">
                            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={async (e) => {
                              if (e.target.files && e.target.files[0]) {
                                const url = await uploadImage(e.target.files[0]);
                                if (url) setFormData({...formData, aestheticImage: url});
                              }
                            }} />
                            <Plus size={32} color="#fff" />
                            <span>Change Image</span>
                          </label>
                        </div>
                      </div>
                      <div className="specs-text-col-preview">
                        <h3 className="specs-highlight-text-preview">
                          UNTUK PRODUK SALE TIDAK BISA TUKAR SIZE ATAUPUN REFUND.
                        </h3>
                        
                        {renderListEditor('features', 'FEATURES')}
                        {renderListEditor('materials', 'MATERIALS')}
                        {renderListEditor('washing', 'WASHING INSTRUCTIONS')}
                      </div>
                    </div>
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
                    <button onClick={() => deleteCategory(c.id)} className="action-btn delete"><Trash2 size={14}/></button>
                  </li>
                ))}
                {categories.length === 0 && <p className="text-muted" style={{textAlign:'center', padding:'10px'}}>No categories yet.</p>}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
