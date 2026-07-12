import React, { useState } from 'react';
import { useProducts } from '../../context/ProductContext';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import Barcode from 'react-barcode';
import './Products.css';

export default function Products() {
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    price: '',
    stock: '',
    image: ''
  });

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        sku: product.sku,
        price: product.price,
        stock: product.stock,
        image: product.image || ''
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', sku: '', price: '', stock: '', image: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const productData = {
      name: formData.name,
      sku: formData.sku,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      image: formData.image
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
    } else {
      addProduct(productData);
    }
    closeModal();
  };

  return (
    <div className="products-page">
      <div className="products-header">
        <div className="page-titles">
          <h2>Product Inventory</h2>
          <p>Manage your products, stock, and barcodes.</p>
        </div>
        <button className="add-product-btn" onClick={() => openModal()}>
          <Plus size={18} />
          ADD PRODUCT
        </button>
      </div>

      <div className="products-table-container">
        <table className="products-table">
          <thead>
            <tr>
              <th>IMAGE</th>
              <th>NAME & SKU</th>
              <th>BARCODE</th>
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
                    style={{ backgroundImage: `url(${product.image || '/images/hero_bg.png'})` }}
                  />
                </td>
                <td>
                  <div className="table-product-info">
                    <h4>{product.name}</h4>
                    <span className="table-sku">{product.sku}</span>
                  </div>
                </td>
                <td>
                  <div className="table-barcode">
                    <Barcode 
                      value={product.sku} 
                      width={1} 
                      height={30} 
                      fontSize={10} 
                      margin={0}
                      background="transparent"
                      lineColor="var(--admin-text)"
                    />
                  </div>
                </td>
                <td className="table-price">${product.price.toFixed(2)}</td>
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
          <div className="edit-modal product-modal">
            <div className="modal-header">
              <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <button className="close-modal-btn" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="config-form">
                  <div className="form-group">
                    <label>Product Name</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})} 
                      placeholder="e.g. IRONCLAD GAUNTLET"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>SKU (Used for Barcode)</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.sku} 
                      onChange={e => setFormData({...formData, sku: e.target.value})} 
                      placeholder="e.g. SKU-GLV-001"
                    />
                    {formData.sku && (
                      <div className="live-barcode-preview">
                        <Barcode 
                          value={formData.sku} 
                          width={1.5} 
                          height={40} 
                          fontSize={12} 
                          background="#fff"
                          lineColor="#000"
                        />
                      </div>
                    )}
                  </div>

                  <div className="form-row">
                    <div className="form-group half">
                      <label>Price ($)</label>
                      <input 
                        type="number" 
                        step="0.01" 
                        required 
                        value={formData.price} 
                        onChange={e => setFormData({...formData, price: e.target.value})} 
                      />
                    </div>
                    <div className="form-group half">
                      <label>Stock Quantity</label>
                      <input 
                        type="number" 
                        required 
                        value={formData.stock} 
                        onChange={e => setFormData({...formData, stock: e.target.value})} 
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Image URL (Optional)</label>
                    <input 
                      type="text" 
                      value={formData.image} 
                      onChange={e => setFormData({...formData, image: e.target.value})} 
                      placeholder="/images/cat_jacket.png"
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={closeModal}>Cancel</button>
                <button type="submit" className="save-modal-btn">
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
