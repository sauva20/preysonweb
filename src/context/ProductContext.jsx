import React, { createContext, useState, useEffect, useContext } from 'react';


import { getApiUrl, getBackendUrl } from '../utils/apiConfig';

const ProductContext = createContext();
const API_URL = getApiUrl();
const SOCKET_URL = getBackendUrl();

export function ProductProvider({ children }) {
  const [products, setProducts] = useState(() => {
    const cached = localStorage.getItem('offline_products');
    return cached ? JSON.parse(cached) : [];
  });
  const [categories, setCategories] = useState(() => {
    const cached = localStorage.getItem('offline_categories');
    return cached ? JSON.parse(cached) : [];
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();

    const handleForceRefetch = () => {
      fetchProducts();
    };
    window.addEventListener('force_refetch_products', handleForceRefetch);

    return () => {
      window.removeEventListener('force_refetch_products', handleForceRefetch);
    };
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/products`);
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      setProducts(data);
      localStorage.setItem('offline_products', JSON.stringify(data));
    } catch (err) {
      console.error('Error fetching products, using cached data if available:', err);
      // Fallback to cache is handled by initial state, but we can also set it here if needed
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/categories`);
      if (!res.ok) throw new Error('Failed to fetch categories');
      const data = await res.json();
      setCategories(data);
      localStorage.setItem('offline_categories', JSON.stringify(data));
    } catch (err) {
      console.error('Error fetching categories, using cached data if available:', err);
    }
  };

  const addProduct = async (productData) => {
    try {
      const res = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      if (!res.ok) throw new Error('Failed to add product');
      const newProduct = await res.json();
      setProducts(prev => [...prev, newProduct]);
      return newProduct;
    } catch (err) {
      console.error('Error adding product:', err);
      throw err;
    }
  };

  const updateProduct = async (id, updatedData) => {
    try {
      const res = await fetch(`${API_URL}/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      if (!res.ok) throw new Error('Failed to update product');
      const updatedProduct = await res.json();
      setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
      return updatedProduct;
    } catch (err) {
      console.error('Error updating product:', err);
      throw err;
    }
  };

  const deleteProduct = async (id) => {
    try {
      const res = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete product');
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Error deleting product:', err);
      throw err;
    }
  };

  const addCategory = async (categoryData) => {
    try {
      const res = await fetch(`${API_URL}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryData)
      });
      if (!res.ok) throw new Error('Failed to add category');
      const newCategory = await res.json();
      setCategories(prev => [...prev, newCategory]);
      return newCategory;
    } catch (err) {
      console.error('Error adding category:', err);
      throw err;
    }
  };

  const deleteCategory = async (id) => {
    try {
      const res = await fetch(`${API_URL}/categories/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete category');
      setCategories(prev => prev.filter(c => c.id !== id));
      // Optionally re-fetch products because their categoryId might be nulled
      fetchProducts();
    } catch (err) {
      console.error('Error deleting category:', err);
      throw err;
    }
  };

  const toggleSoldOut = async (id) => {
    try {
      const res = await fetch(`${API_URL}/products/${id}/toggle-soldout`, {
        method: 'PATCH'
      });
      if (!res.ok) throw new Error('Failed to toggle sold out status');
      const updatedProduct = await res.json();
      setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
      return updatedProduct;
    } catch (err) {
      console.error('Error toggling sold out status:', err);
      throw err;
    }
  };

  const deductStockLocally = (items, isEventMode) => {
    setProducts(prev => {
      const newProducts = prev.map(p => {
        const orderItemsForProduct = items.filter(i => i.productId === p.id);
        if (orderItemsForProduct.length === 0) return p;

        let totalDeducted = 0;
        let newSizes = p.sizes;
        try {
          if (typeof newSizes === 'string') newSizes = JSON.parse(newSizes);
        } catch(e) {}
        
        let sizeUpdated = false;

        orderItemsForProduct.forEach(item => {
          totalDeducted += item.quantity;
          if (item.size && item.size !== 'OS' && Array.isArray(newSizes)) {
            newSizes = newSizes.map(s => {
              if (s.name === item.size) {
                sizeUpdated = true;
                return { ...s, stock: Math.max(0, s.stock - item.quantity) };
              }
              return s;
            });
          }
        });

        const updatedP = { ...p };
        if (isEventMode) {
          updatedP.eventStock = Math.max(0, (updatedP.eventStock || 0) - totalDeducted);
        } else {
          updatedP.stock = Math.max(0, (updatedP.stock || 0) - totalDeducted);
        }
        
        if (sizeUpdated) {
          updatedP.sizes = JSON.stringify(newSizes);
        }
        
        return updatedP;
      });
      
      localStorage.setItem('offline_products', JSON.stringify(newProducts));
      return newProducts;
    });
  };

  return (
    <ProductContext.Provider value={{
      products, addProduct, updateProduct, deleteProduct, toggleSoldOut, fetchProducts, deductStockLocally,
      categories, addCategory, deleteCategory, fetchCategories
    }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  return useContext(ProductContext);
}
