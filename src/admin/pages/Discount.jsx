import React, { useState } from 'react';
import { usePromos } from '../../context/PromoContext';
import PromoModal from '../components/PromoModal';
import { Plus, Tag, Ticket, Edit2, Trash2 } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import { useActivity } from '../../context/ActivityContext';
import { confirmDelete, showSuccess } from '../utils/alert';
import './Discount.css';

export default function Discount() {
  const { 
    vouchers, addVoucher, updateVoucher, deleteVoucher, toggleVoucherStatus,
    discounts, addDiscount, updateDiscount, deleteDiscount, toggleDiscountStatus
  } = usePromos();
  const { formatPrice } = useCurrency();
  const { logActivity } = useActivity();

  const [activeTab, setActiveTab] = useState('vouchers'); // 'vouchers' or 'discounts'
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('voucher');
  const [editingData, setEditingData] = useState(null);

  const handleOpenModal = (type, data = null) => {
    setModalType(type);
    setEditingData(data);
    setIsModalOpen(true);
  };

  const handleSubmit = async (payload) => {
    if (modalType === 'voucher') {
      if (editingData) {
        await updateVoucher(editingData.id, payload);
        logActivity({ category: 'Promo', title: 'Voucher Diperbarui', description: `Voucher promo "${payload.code}" berhasil diperbarui.`, status: 'info' });
        showSuccess('Voucher updated successfully');
      } else {
        await addVoucher(payload);
        logActivity({ category: 'Promo', title: 'Voucher Baru Dibuat', description: `Voucher diskon baru "${payload.code}" berhasil diaktifkan.`, status: 'success' });
        showSuccess('Voucher added successfully');
      }
    } else {
      if (editingData) {
        await updateDiscount(editingData.id, payload);
        logActivity({ category: 'Promo', title: 'Diskon Diperbarui', description: `Program diskon "${payload.name}" berhasil diperbarui.`, status: 'info' });
        showSuccess('Discount updated successfully');
      } else {
        await addDiscount(payload);
        logActivity({ category: 'Promo', title: 'Diskon Baru Dibuat', description: `Program diskon "${payload.name}" berhasil ditambahkan.`, status: 'success' });
        showSuccess('Discount added successfully');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  return (
    <div className="discount-page">
      <div className="discount-header">
        <div className="page-titles">
          <h2>Promotions & Discounts</h2>
          <p>Manage global vouchers and product-specific discounts.</p>
        </div>
        <div className="header-actions">
          <button className="action-btn-primary" onClick={() => handleOpenModal('voucher')}>
            <Plus size={16} /> Add Voucher
          </button>
          <button className="action-btn-outline" onClick={() => handleOpenModal('discount')}>
            <Plus size={16} /> Add Discount
          </button>
        </div>
      </div>

      <div className="promo-tabs">
        <button 
          className={`tab-btn ${activeTab === 'vouchers' ? 'active' : ''}`}
          onClick={() => setActiveTab('vouchers')}
        >
          <Ticket size={18} /> Global Vouchers
        </button>
        <button 
          className={`tab-btn ${activeTab === 'discounts' ? 'active' : ''}`}
          onClick={() => setActiveTab('discounts')}
        >
          <Tag size={18} /> Product Discounts
        </button>
      </div>

      <div className="promo-content">
        {activeTab === 'vouchers' ? (
          <div className="table-container">
            <table className="promo-table">
              <thead>
                <tr>
                  <th>CODE</th>
                  <th>VALUE</th>
                  <th>MIN SPEND</th>
                  <th>USAGE</th>
                  <th>VALIDITY</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {vouchers.map(v => (
                  <tr key={v.id}>
                    <td><span className="promo-code">{v.code}</span></td>
                    <td>{v.type === 'percentage' ? `${v.value}%` : formatPrice(v.value)}</td>
                    <td>{v.minSpend ? formatPrice(v.minSpend) : 'None'}</td>
                    <td>{v.usageCount} / {v.usageLimit || '∞'}</td>
                    <td>
                      <div className="date-range">
                        <span>{formatDate(v.startDate)}</span>
                        <span>to {formatDate(v.endDate)}</span>
                      </div>
                    </td>
                    <td>
                      <button 
                        className={`status-toggle ${v.isExpired ? 'expired' : (v.isActive ? 'active' : 'inactive')}`}
                        onClick={() => !v.isExpired && toggleVoucherStatus(v.id)}
                        disabled={v.isExpired}
                      >
                        {v.isExpired ? 'Expired' : (v.isActive ? 'Active' : 'Inactive')}
                      </button>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button onClick={() => handleOpenModal('voucher', v)} className="edit" title="Edit"><Edit2 size={16} /></button>
                        <button onClick={async () => {
                          if (await confirmDelete(`the voucher "${v.code}"`)) {
                            await deleteVoucher(v.id);
                            logActivity({ category: 'Promo', title: 'Voucher Dihapus', description: `Voucher "${v.code}" telah dihapus dari sistem.`, status: 'warning' });
                            showSuccess('Voucher deleted successfully');
                          }
                        }} className="delete" title="Delete"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {vouchers.length === 0 && (
                  <tr>
                    <td colSpan="7" className="empty-state">No vouchers found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="table-container">
            <table className="promo-table">
              <thead>
                <tr>
                  <th>CAMPAIGN NAME</th>
                  <th>VALUE</th>
                  <th>PRODUCTS</th>
                  <th>VALIDITY</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {discounts.map(d => (
                  <tr key={d.id}>
                    <td><strong>{d.name}</strong></td>
                    <td>{d.type === 'percentage' ? `${d.value}%` : formatPrice(d.value)}</td>
                    <td>{d.productIds.length} items</td>
                    <td>
                      <div className="date-range">
                        <span>{formatDate(d.startDate)}</span>
                        <span>to {formatDate(d.endDate)}</span>
                      </div>
                    </td>
                    <td>
                      <button 
                        className={`status-toggle ${d.isExpired ? 'expired' : (d.isActive ? 'active' : 'inactive')}`}
                        onClick={() => !d.isExpired && toggleDiscountStatus(d.id)}
                        disabled={d.isExpired}
                      >
                        {d.isExpired ? 'Expired' : (d.isActive ? 'Active' : 'Inactive')}
                      </button>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button onClick={() => handleOpenModal('discount', d)} className="edit" title="Edit"><Edit2 size={16} /></button>
                        <button onClick={async () => {
                          if (await confirmDelete(`the discount "${d.name}"`)) {
                            await deleteDiscount(d.id);
                            logActivity({ category: 'Promo', title: 'Diskon Dihapus', description: `Program diskon "${d.name}" telah dihapus.`, status: 'warning' });
                            showSuccess('Discount deleted successfully');
                          }
                        }} className="delete" title="Delete"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {discounts.length === 0 && (
                  <tr>
                    <td colSpan="6" className="empty-state">No product discounts found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <PromoModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type={modalType}
        initialData={editingData}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
