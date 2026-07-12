import React, { createContext, useState, useContext } from 'react';

const ProductContext = createContext();

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([
    {
      id: 1,
      name: 'IRONCLAD GAUNTLET',
      sku: 'SKU-GLV-001',
      price: 120.00,
      image: '/images/hero_bg.png',
      stock: 14,
      sold: 90
    },
    {
      id: 2,
      name: 'ROADKILL CANVAS JKT',
      sku: 'SKU-JKT-042',
      price: 250.00,
      image: '/images/cat_jacket.png',
      stock: 2,
      sold: 90
    },
    {
      id: 3,
      name: 'HEAVY DUTY TEE - ASH',
      sku: 'SKU-TEE-011',
      price: 45.00,
      image: '',
      stock: 45,
      sold: 90
    },
    {
      id: 4,
      name: 'WAXED COTTON VEST',
      sku: 'SKU-VST-008',
      price: 185.00,
      image: '',
      stock: 8,
      sold: 0
    }
  ]);

  const addProduct = (product) => {
    setProducts([...products, { ...product, id: Date.now(), sold: 0 }]);
  };

  const updateProduct = (id, updatedProduct) => {
    setProducts(products.map(p => p.id === id ? { ...p, ...updatedProduct } : p));
  };

  const deleteProduct = (id) => {
    setProducts(products.filter(p => p.id !== id));
  };

  return (
    <ProductContext.Provider value={{ products, addProduct, updateProduct, deleteProduct }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  return useContext(ProductContext);
}
