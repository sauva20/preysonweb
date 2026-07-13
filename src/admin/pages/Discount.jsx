import React, { useState } from 'react';
import { usePromos } from '../../context/PromoContext';
import PromoModal from '../components/PromoModal';
import { Plus, Tag, Ticket, Edit2, Trash2 } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import './Discount.css';

export default function Discount() {
  const { 
    vouchers, addVoucher, updateVoucher, deleteVoucher, toggleVoucherStatus,
    discounts, addDiscount, updateDiscount, deleteDiscount, toggleDiscountStatus
  } = usePromos();
  const { formatPrice } = useCurrency();

  const [activeTab, setActiveTab] = useState('vouchers'); // 'vouchers' or 'discounts'
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('voucher');
  const [editingData, setEditingData] = useState(null);

  const handleOpenModal = (type, data = null) => {
    setModalType(type);
    setEditingData(data);
    setIsModalOpen(true);
  };

  const handleSubmit = (payload) => {
    if (modalType === 'voucher') {
      if (editingData) {
        updateVoucher(editingData.id, payload);
      } else {
        addVoucher(payload);
      }
    } else {
      if (editingData) {
        updateDiscount(editingData.id, payload);
      } else {
        addDiscount(payload);
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
                        className={`status-toggle ${v.isActive ? 'active' : 'inactive'}`}
                        onClick={() => toggleVoucherStatus(v.id)}
                      >
                        {v.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button onClick={() => handleOpenModal('voucher', v)} title="Edit"><Edit2 size={16} /></button>
                        <button onClick={() => deleteVoucher(v.id)} className="delete" title="Delete"><Trash2 size={16} /></button>
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
                        className={`status-toggle ${d.isActive ? 'active' : 'inactive'}`}
                        onClick={() => toggleDiscountStatus(d.id)}
                      >
                        {d.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button onClick={() => handleOpenModal('discount', d)} title="Edit"><Edit2 size={16} /></button>
                        <button onClick={() => deleteDiscount(d.id)} className="delete" title="Delete"><Trash2 size={16} /></button>
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
