import React, { createContext, useState, useEffect, useContext } from 'react';

import { getApiUrl } from '../utils/apiConfig';

const PromoContext = createContext();
const API_URL = getApiUrl();

export function PromoProvider({ children }) {
  // Global Vouchers State (Mapped from Campaigns)
  const [vouchers, setVouchers] = useState([]);

  // Per-Product Discounts State (Mapped from Database)
  const [discounts, setDiscounts] = useState([]);

  useEffect(() => {
    fetchVouchers();
    fetchDiscounts();
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

  const fetchDiscounts = async () => {
    try {
      const res = await fetch(`${API_URL}/discounts`);
      if (!res.ok) throw new Error('Failed to fetch discounts');
      const data = await res.json();
      
      const mapped = data.map(d => {
        const expireDate = new Date(d.endDate);
        expireDate.setHours(23, 59, 59, 999);
        const isExpired = expireDate < new Date();
        return {
          ...d,
          isExpired
        };
      });
      setDiscounts(mapped);
    } catch (err) {
      console.error('Error fetching discounts:', err);
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
  const addDiscount = async (discount) => {
    try {
      const res = await fetch(`${API_URL}/discounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(discount)
      });
      if (!res.ok) throw new Error('Failed to add discount');
      fetchDiscounts();
    } catch (err) {
      console.error('Error adding discount:', err);
    }
  };

  const updateDiscount = async (id, updatedDiscount) => {
    try {
      const res = await fetch(`${API_URL}/discounts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedDiscount)
      });
      if (!res.ok) throw new Error('Failed to update discount');
      fetchDiscounts();
    } catch (err) {
      console.error('Error updating discount:', err);
    }
  };

  const deleteDiscount = async (id) => {
    try {
      const res = await fetch(`${API_URL}/discounts/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete discount');
      fetchDiscounts();
    } catch (err) {
      console.error('Error deleting discount:', err);
    }
  };

  const toggleDiscountStatus = async (id) => {
    const discount = discounts.find(d => d.id === id);
    if (!discount) return;
    try {
      const res = await fetch(`${API_URL}/discounts/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !discount.isActive })
      });
      if (!res.ok) throw new Error('Failed to toggle discount status');
      fetchDiscounts();
    } catch (err) {
      console.error('Error toggling discount status:', err);
    }
  };

  const applyDiscounts = (productsList) => {
    if (!productsList) return [];
    return productsList.map(product => {
      const activeDiscount = discounts.find(d =>
        d.isActive && !d.isExpired && d.productIds.includes(product.id)
      );
      if (activeDiscount) {
        let discountPrice = product.price;
        if (activeDiscount.type === 'percentage') {
          discountPrice = product.price * (1 - activeDiscount.value / 100);
        } else if (activeDiscount.type === 'fixed') {
          discountPrice = Math.max(0, product.price - activeDiscount.value);
        }
        return { ...product, discountPrice, discountData: activeDiscount };
      }
      return product;
    });
  };

  const getDiscountedProduct = (product) => {
    if (!product) return null;
    const activeDiscount = discounts.find(d =>
      d.isActive && !d.isExpired && d.productIds.includes(product.id)
    );
    if (activeDiscount) {
      let discountPrice = product.price;
      if (activeDiscount.type === 'percentage') {
        discountPrice = product.price * (1 - activeDiscount.value / 100);
      } else if (activeDiscount.type === 'fixed') {
        discountPrice = Math.max(0, product.price - activeDiscount.value);
      }
      return { ...product, discountPrice, discountData: activeDiscount };
    }
    return product;
  };

  return (
    <PromoContext.Provider value={{
      vouchers, addVoucher, updateVoucher, deleteVoucher, toggleVoucherStatus, fetchVouchers,
      discounts, addDiscount, updateDiscount, deleteDiscount, toggleDiscountStatus, fetchDiscounts,
      applyDiscounts, getDiscountedProduct
    }}>
      {children}
    </PromoContext.Provider>
  );
}

export function usePromos() {
  return useContext(PromoContext);
}
