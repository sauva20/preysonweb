import React, { createContext, useState, useEffect, useContext } from 'react';
import { getApiUrl } from '../utils/apiConfig';

const OfflineSyncContext = createContext();

export function OfflineSyncProvider({ children }) {
  const [pendingOrders, setPendingOrders] = useState(() => {
    const saved = localStorage.getItem('offline_pending_orders');
    return saved ? JSON.parse(saved) : [];
  });
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Re-save to localstorage whenever pendingOrders changes
  useEffect(() => {
    localStorage.setItem('offline_pending_orders', JSON.stringify(pendingOrders));
  }, [pendingOrders]);

  const addPendingOrder = (order) => {
    setPendingOrders(prev => [...prev, order]);
  };

  const removePendingOrder = (index) => {
    setPendingOrders(prev => prev.filter((_, i) => i !== index));
  };

  const syncNow = async () => {
    if (pendingOrders.length === 0) return true;
    if (!navigator.onLine) {
      alert("Anda sedang offline. Hubungkan ke internet dulu untuk sinkronisasi.");
      return false;
    }

    setIsSyncing(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${getApiUrl()}/checkout/offline-sync`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ orders: pendingOrders })
      });

      if (!res.ok) throw new Error('Failed to sync orders');
      
      const data = await res.json();
      if (data.success) {
        setPendingOrders([]); // Clear queue on success
        alert("Sinkronisasi Berhasil! " + pendingOrders.length + " transaksi ter-upload.");
        setIsSyncing(false);
        window.dispatchEvent(new CustomEvent('force_refetch_products'));
        return true;
      }
    } catch (err) {
      console.error("Sync error:", err);
      alert("Gagal sinkronisasi. Coba lagi nanti saat internet stabil.");
    }
    setIsSyncing(false);
    return false;
  };

  return (
    <OfflineSyncContext.Provider value={{ pendingOrders, isSyncing, addPendingOrder, removePendingOrder, syncNow }}>
      {children}
    </OfflineSyncContext.Provider>
  );
}

export function useOfflineSync() {
  return useContext(OfflineSyncContext);
}
