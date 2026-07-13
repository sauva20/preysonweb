import React, { createContext, useState, useEffect, useContext } from 'react';

const ProductContext = createContext();
const API_URL = 'http://localhost:5000/api';

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/products`);
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/categories`);
      if (!res.ok) throw new Error('Failed to fetch categories');
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
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

  return (
    <ProductContext.Provider value={{ 
      products, addProduct, updateProduct, deleteProduct, fetchProducts,
      categories, addCategory, deleteCategory, fetchCategories
    }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  return useContext(ProductContext);
}
