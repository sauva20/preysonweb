import React, { createContext, useState, useContext, useEffect } from 'react';

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
    status: 'warning'
  }
];

export const ActivityProvider = ({ children }) => {
  const [activities, setActivities] = useState(() => {
    const saved = localStorage.getItem('adminActivityLogs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Failed to parse activity logs:', e);
      }
    }
    return INITIAL_LOGS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('adminActivityLogs', JSON.stringify(activities));
    } catch (e) {
      console.error('Failed to save activity logs to localStorage:', e);
    }
  }, [activities]);

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

    const newActivity = {
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      category,
      title,
      description,
      user: userName,
      status
    };

    setActivities(prev => [newActivity, ...prev].slice(0, 300)); // Keep max 300 recent logs
  };

  const clearActivities = () => {
    setActivities([]);
    localStorage.removeItem('adminActivityLogs');
  };

  return (
    <ActivityContext.Provider value={{ activities, logActivity, clearActivities }}>
      {children}
    </ActivityContext.Provider>
  );
};
