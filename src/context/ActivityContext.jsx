import React, { createContext, useState, useContext, useEffect } from 'react';
import { io } from 'socket.io-client';
import { getApiUrl, getBackendUrl } from '../utils/apiConfig';

const ActivityContext = createContext();

export const useActivity = () => {
  const context = useContext(ActivityContext);
  if (!context) {
    return {
      activities: [],
      logActivity: () => console.warn('ActivityContext not found in hierarchy'),
      clearActivities: () => {}
    };
  }
  return context;
};

const INITIAL_LOGS = [
  {
    id: 'act-001',
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    category: 'POS',
    title: 'Transaksi Kasir Berhasil',
    description: 'Pembayaran tunai (Cash) untuk transaksi #POS-8892 senilai Rp 450.000 berhasil diproses.',
    user: 'Kasir Utama',
    status: 'success'
  },
  {
    id: 'act-002',
    timestamp: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
    category: 'Produk',
    title: 'Stok Produk Diperbarui',
    description: 'Menambahkan 15 pcs stok untuk produk "Preyson Explorer Jacket - M".',
    user: 'Administrator',
    status: 'info'
  },
  {
    id: 'act-003',
    timestamp: new Date(Date.now() - 1000 * 60 * 115).toISOString(),
    category: 'Promo',
    title: 'Voucher Diskon Baru Dibuat',
    description: 'Voucher promo "SUPERMOTO25" dengan potongan diskon 25% berhasil diaktifkan.',
    user: 'Administrator',
    status: 'success'
  },
  {
    id: 'act-004',
    timestamp: new Date(Date.now() - 1000 * 60 * 210).toISOString(),
    category: 'Pesanan',
    title: 'Pesanan Online Dikirim',
    description: 'Status pesanan #ORD-7721 atas nama Budi Santoso diubah menjadi Shipped / Terkirim.',
    user: 'Administrator',
    status: 'info'
  },
  {
    id: 'act-005',
    timestamp: new Date(Date.now() - 1000 * 60 * 320).toISOString(),
    category: 'Pelanggan',
    title: 'Pendaftaran Member Baru',
    description: 'Pelanggan VIP baru berhasil terdaftar: Riko Kurniawan (riko.moto@gmail.com).',
    user: 'Sistem Web',
    status: 'success'
  },
  {
    id: 'act-006',
    timestamp: new Date(Date.now() - 1000 * 60 * 500).toISOString(),
    category: 'Settings',
    title: 'Konfigurasi QRIS & Toko',
    description: 'Pembaruan tarif pajak (VAT 11%) dan metode pengiriman reguler toko berhasil disimpan.',
    user: 'Administrator',
  }
];

export const ActivityProvider = ({ children }) => {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    // 1. Fetch initial activity logs from API
    fetch(`${getApiUrl()}/activities`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setActivities(data);
        }
      })
      .catch(err => {
        console.error('Failed to fetch activity logs from API:', err);
      });

    // 2. Setup Socket.IO listener for real-time activity updates across admins
    const socket = io(getBackendUrl(), {
      transports: ['polling', 'websocket']
    });

    socket.on('activity_added', (newAct) => {
      setActivities(prev => {
        if (prev.some(a => a.id === newAct.id)) return prev;
        return [newAct, ...prev].slice(0, 500);
      });
    });

    socket.on('activities_cleared', () => {
      setActivities([]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const logActivity = ({ category = 'Sistem', title, description, status = 'info', customUser }) => {
    let userName = customUser || 'Administrator';
    if (!customUser) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const u = JSON.parse(storedUser);
          userName = u.name || (u.role === 'cashier' ? 'Kasir Utama' : 'Administrator');
        } catch (err) {}
      }
    }

    const payload = {
      category,
      title,
      description,
      user: userName,
      status,
      timestamp: new Date().toISOString()
    };

    fetch(`${import.meta.env.VITE_API_URL}/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(savedAct => {
      setActivities(prev => {
        if (prev.some(a => a.id === savedAct.id)) return prev;
        return [savedAct, ...prev].slice(0, 500);
      });
    })
    .catch(err => {
      console.error('Failed to save activity log to server:', err);
    });
  };

  const clearActivities = () => {
    fetch(`${import.meta.env.VITE_API_URL}/activities`, {
      method: 'DELETE'
    })
    .then(() => setActivities([]))
    .catch(err => console.error('Failed to clear activities on server:', err));
  };

  return (
    <ActivityContext.Provider value={{ activities, logActivity, clearActivities }}>
      {children}
    </ActivityContext.Provider>
  );
};
