import React, { createContext, useState, useEffect, useContext } from 'react';

import { getApiUrl } from '../utils/apiConfig';

const PromoContext = createContext();
const API_URL = getApiUrl();

export function PromoProvider({ children }) {
  // Global Vouchers State (Mapped from Campaigns)
  const [vouchers, setVouchers] = useState([]);
  
  // Per-Product Discounts State (Not in DB yet, keep mock for UI)
  const [discounts, setDiscounts] = useState([
    {
      id: 1,
      name: 'Summer Clearance',
      productIds: [1, 2], // Array of product IDs
      type: 'percentage',
      value: 20,
      startDate: '2026-07-15',
      endDate: '2026-07-30',
      isActive: false,
      isExpired: new Date('2026-07-30T23:59:59.999Z') < new Date()
    }
  ]);

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      const res = await fetch(`${API_URL}/campaigns`);
      if (!res.ok) throw new Error('Failed to fetch campaigns');
      const data = await res.json();
      
      const mapped = data.map(c => {
        // Assume end of day for the endDate
        const expireDate = new Date(c.endDate);
        expireDate.setHours(23, 59, 59, 999);
        const isExpired = expireDate < new Date();

        return {
          id: c.id,
          code: c.code,
          type: 'percentage',
          value: c.discountPct,
          minSpend: 0,
          maxDiscount: null,
          usageLimit: null,
          usageCount: 0,
          startDate: c.startDate,
          endDate: c.endDate,
          isActive: c.status === 'Active' && !isExpired,
          isExpired: isExpired
        };
      });
      setVouchers(mapped);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
    }
  };

  // Voucher Methods
  const addVoucher = async (voucher) => {
    try {
      const payload = {
        code: voucher.code,
        discountPct: voucher.value,
        startDate: voucher.startDate,
        endDate: voucher.endDate
      };
      const res = await fetch(`${API_URL}/campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to add campaign');
      fetchVouchers();
    } catch (err) {
      console.error('Error adding campaign:', err);
    }
  };

  const updateVoucher = (id, updatedVoucher) => {
    // API update not implemented, mock local update
    setVouchers(vouchers.map(v => v.id === id ? { ...v, ...updatedVoucher } : v));
  };

  const deleteVoucher = async (id) => {
    try {
      const res = await fetch(`${API_URL}/campaigns/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete campaign');
      setVouchers(vouchers.filter(v => v.id !== id));
    } catch (err) {
      console.error('Error deleting campaign:', err);
    }
  };

  const toggleVoucherStatus = async (id) => {
    const voucher = vouchers.find(v => v.id === id);
    if (!voucher) return;
    const newStatus = voucher.isActive ? 'Inactive' : 'Active';
    try {
      const res = await fetch(`${API_URL}/campaigns/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setVouchers(vouchers.map(v => v.id === id ? { ...v, isActive: !v.isActive } : v));
      }
    } catch (err) {
      console.error('Error toggling campaign status:', err);
    }
  };

  // Discount Methods
  const addDiscount = (discount) => {
    setDiscounts([...discounts, { ...discount, id: Date.now() }]);
  };

  const updateDiscount = (id, updatedDiscount) => {
    setDiscounts(discounts.map(d => d.id === id ? { ...d, ...updatedDiscount } : d));
  };

  const deleteDiscount = (id) => {
    setDiscounts(discounts.filter(d => d.id !== id));
  };

  const toggleDiscountStatus = (id) => {
    setDiscounts(discounts.map(d => d.id === id ? { ...d, isActive: !d.isActive } : d));
  };

  return (
    <PromoContext.Provider value={{
      vouchers, addVoucher, updateVoucher, deleteVoucher, toggleVoucherStatus, fetchVouchers,
      discounts, addDiscount, updateDiscount, deleteDiscount, toggleDiscountStatus
    }}>
      {children}
    </PromoContext.Provider>
  );
}

export function usePromos() {
  return useContext(PromoContext);
}
