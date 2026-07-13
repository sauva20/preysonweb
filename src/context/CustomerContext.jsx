import React, { createContext, useState, useEffect, useContext } from 'react';

const CustomerContext = createContext();
const API_URL = `${import.meta.env.VITE_API_URL}`;

export function CustomerProvider({ children }) {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await fetch(`${API_URL}/customers`);
      if (!res.ok) throw new Error('Failed to fetch customers');
      const data = await res.json();
      
      const mappedCustomers = data.map(c => {
        const totalOrders = c.orders ? c.orders.length : 0;
        const totalSpent = c.orders ? c.orders.reduce((sum, order) => sum + (order.total || 0), 0) : 0;
        
        return {
          id: c.id,
          name: c.name,
          email: c.email,
          phone: c.phone || '-', // if phone is added later
          address: '-', // Add mapping if address fields are added
          city: '-',
          totalOrders,
          totalSpent,
          status: 'Active',
          joinDate: c.createdAt
        };
      });
      
      setCustomers(mappedCustomers);
    } catch (err) {
      console.error('Error fetching customers:', err);
    }
  };

  const addCustomer = async (customerData) => {
    // Usually this would call an API, but since register exists, we can use it or simply mock for now
    // if there's no add admin API
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...customerData, password: 'password123' }) // Default password for admin-created customers
      });
      if (!res.ok) throw new Error('Failed to add customer');
      fetchCustomers();
    } catch (err) {
      console.error('Error adding customer:', err);
    }
  };

  const updateCustomer = (id, updatedData) => {
    setCustomers(customers.map(c => 
      c.id === id ? { ...c, ...updatedData } : c
    ));
  };

  const deleteCustomer = (id) => {
    setCustomers(customers.filter(c => c.id !== id));
  };

  return (
    <CustomerContext.Provider value={{ customers, addCustomer, updateCustomer, deleteCustomer, fetchCustomers }}>
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomers() {
  return useContext(CustomerContext);
}
