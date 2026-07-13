import React, { createContext, useState, useEffect, useContext } from 'react';

const OrderContext = createContext();
const API_URL = 'http://localhost:5000/api';

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/orders`);
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  const addOrder = async (orderData) => {
    try {
      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      if (!res.ok) throw new Error('Failed to add order');
      const newOrder = await res.json();
      setOrders(prev => [newOrder, ...prev]);
      return newOrder;
    } catch (err) {
      console.error('Error adding order:', err);
      throw err;
    }
  };

  const updateOrderStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('Failed to update order status');
      const updatedOrder = await res.json();
      setOrders(prev => prev.map(order => order.id === id ? updatedOrder : order));
      return updatedOrder;
    } catch (err) {
      console.error('Error updating order status:', err);
      throw err;
    }
  };

  return (
    <OrderContext.Provider value={{ orders, addOrder, updateOrderStatus, fetchOrders }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  return useContext(OrderContext);
}
