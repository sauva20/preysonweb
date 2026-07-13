import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  // Add item to cart
  const addToCart = (product, size, quantity = 1) => {
    setCartItems(prevItems => {
      // Check if item with same id and size already exists
      const existingItemIndex = prevItems.findIndex(
        item => item.product.id === product.id && item.size === size
      );

      if (existingItemIndex > -1) {
        // Update quantity
        const newItems = [...prevItems];
        newItems[existingItemIndex].quantity += quantity;
        return newItems;
      } else {
        // Add new item
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
    
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
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

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      cartTotal,
      cartCount
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
