import React, { createContext, useState, useEffect, useContext } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('preyson_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('preyson_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const getStockForSize = (product, size) => {
    let sizesObj = product.sizes;
    if (typeof sizesObj === 'string') {
      try { sizesObj = JSON.parse(sizesObj); } catch(e) { sizesObj = []; }
    }
    const sObj = sizesObj.find(s => (typeof s === 'string' ? s : s.name) === size);
    return typeof sObj === 'string' ? product.stock : (sObj?.stock || 0);
  };

  // Add item to cart
  const addToCart = (product, size, quantity = 1) => {
    const stock = getStockForSize(product, size);
    setCartItems(prevItems => {
      // Check if item with same id and size already exists
      const existingItemIndex = prevItems.findIndex(
        item => item.product.id === product.id && item.size === size
      );

      if (existingItemIndex > -1) {
        // Update quantity
        const newItems = [...prevItems];
        const newQty = newItems[existingItemIndex].quantity + quantity;
        if (newQty > stock) {
          alert(`Cannot add more. Only ${stock} items available in stock.`);
          return prevItems;
        }
        newItems[existingItemIndex].quantity = newQty;
        return newItems;
      } else {
        // Add new item
        if (quantity > stock) {
          alert(`Cannot add more. Only ${stock} items available in stock.`);
          return prevItems;
        }
        return [...prevItems, { id: Date.now(), product, size, quantity }];
      }
    });
  };

  // Remove item from cart
  const removeFromCart = (itemId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  // Update item quantity
  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setCartItems(prevItems => {
      const itemToUpdate = prevItems.find(item => item.id === itemId);
      if (itemToUpdate) {
        const stock = getStockForSize(itemToUpdate.product, itemToUpdate.size);
        if (newQuantity > stock) {
          alert(`Cannot update quantity. Only ${stock} items available in stock.`);
          return prevItems;
        }
      }
      return prevItems.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      );
    });
  };

  // Calculate totals
  const cartTotal = cartItems.reduce(
    (total, item) => total + (item.product.price * item.quantity), 
    0
  );

  const cartCount = cartItems.reduce(
    (count, item) => count + item.quantity,
    0
  );

  const clearCart = () => setCartItems([]);

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      cartTotal,
      cartCount,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
