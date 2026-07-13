import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import './CustomerModal.css';

export default function CustomerModal({ isOpen, onClose, onSubmit, initialData }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [status, setStatus] = useState('Active');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name || '');
        setEmail(initialData.email || '');
        setPhone(initialData.phone || '');
        setAddress(initialData.address || '');
        setCity(initialData.city || '');
        setStatus(initialData.status || 'Active');
      } else {
        setName('');
        setEmail('');
        setPhone('');
        setAddress('');
        setCity('');
        setStatus('Active');
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { name, email, phone, address, city, status };
    onSubmit(payload);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="customer-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{initialData ? 'Edit Customer' : 'Add New Customer'}</h3>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="customer-form">
          <div className="form-grid">
            <div className="form-group full-width">
              <label>Full Name *</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. John Doe" />
            </div>
            
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="john@example.com" />
            </div>
            
            <div className="form-group">
              <label>Phone Number *</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} required placeholder="e.g. 081234567890" />
            </div>

            <div className="form-group full-width">
              <label>Address</label>
              <input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="Street name, building, etc." />
            </div>

            <div className="form-group">
              <label>City</label>
              <input type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Jakarta" />
            </div>

            <div className="form-group">
              <label>Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
          
          <div className="modal-actions">
            <button type="button" className="btn-cancel action-btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="action-btn-primary">
              {initialData ? 'Update Customer' : 'Save Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
