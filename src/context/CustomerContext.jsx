import React, { createContext, useState, useEffect, useContext } from 'react';

import { getApiUrl } from '../utils/apiConfig';

const CustomerContext = createContext();
const API_URL = getApiUrl();

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
          phone: c.phone || '-', 
          address: c.address || '-', 
          city: c.city || '-',
          totalOrders,
          totalSpent,
          status: c.status || 'Active',
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

  const updateCustomer = async (id, updatedData) => {
    try {
      const res = await fetch(`${API_URL}/customers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      if (!res.ok) throw new Error('Failed to update customer');
      fetchCustomers();
    } catch (err) {
      console.error('Error updating customer:', err);
      throw err;
    }
  };

  const deleteCustomer = async (id) => {
    try {
      const res = await fetch(`${API_URL}/customers/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete customer');
      fetchCustomers();
    } catch (err) {
      console.error('Error deleting customer:', err);
      throw err;
    }
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
