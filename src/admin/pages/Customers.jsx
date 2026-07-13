import React, { useState } from 'react';
import { useCustomers } from '../../context/CustomerContext';
import { useCurrency } from '../../context/CurrencyContext';
import CustomerModal from '../components/CustomerModal';
import { Search, Plus, UserPlus, Users, Mail, Phone, Edit2, Trash2 } from 'lucide-react';
import './Customers.css';

export default function Customers() {
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useCustomers();
  const { formatPrice } = useCurrency();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);

  const handleOpenModal = (data = null) => {
    setEditingData(data);
    setIsModalOpen(true);
  };

  const handleSubmit = (payload) => {
    if (editingData) {
      updateCustomer(editingData.id, payload);
    } else {
      addCustomer(payload);
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          customer.phone.includes(searchQuery);
    const matchesStatus = filterStatus === 'All' || customer.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const activeCount = customers.filter(c => c.status === 'Active').length;
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const formatCurrency = formatPrice;

  return (
    <div className="customers-page">
      <div className="customers-header">
        <div className="page-titles">
          <h2>Customer Relationship</h2>
          <p>Manage your customer database and view their purchasing habits.</p>
        </div>
        <div className="header-actions">
          <button className="action-btn-primary" onClick={() => handleOpenModal()}>
            <UserPlus size={16} /> Add Customer
          </button>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon"><Users size={24} /></div>
          <div className="metric-info">
            <h3>Total Customers</h3>
            <p className="metric-value">{customers.length}</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon active-icon"><UserPlus size={24} /></div>
          <div className="metric-info">
            <h3>Active Customers</h3>
            <p className="metric-value">{activeCount}</p>
          </div>
        </div>
      </div>

      <div className="customers-toolbar">
        <div className="search-box">
          <Search size={16} />
          <input 
            type="text" 
            placeholder="Search by name, email, or phone..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="table-container">
        <table className="customers-table">
          <thead>
            <tr>
              <th>CUSTOMER</th>
              <th>CONTACT</th>
              <th>JOIN DATE</th>
              <th>ORDERS</th>
              <th>TOTAL SPENT</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map(customer => (
              <tr key={customer.id}>
                <td>
                  <div className="customer-info">
                    <strong>{customer.name}</strong>
                    <span className="customer-id">{customer.id}</span>
                  </div>
                </td>
                <td>
                  <div className="contact-info">
                    {customer.email && <span title="Email"><Mail size={12} /> {customer.email}</span>}
                    {customer.phone && <span title="Phone"><Phone size={12} /> {customer.phone}</span>}
                  </div>
                </td>
                <td>{formatDate(customer.joinDate)}</td>
                <td>
                  <strong>{customer.totalOrders}</strong>
                </td>
                <td className="spent-amount">
                  {formatCurrency(customer.totalSpent)}
                </td>
                <td>
                  <span className={`status-badge ${customer.status.toLowerCase()}`}>
                    {customer.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button onClick={() => handleOpenModal(customer)} title="Edit"><Edit2 size={16} /></button>
                    <button onClick={() => deleteCustomer(customer.id)} className="delete" title="Delete"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredCustomers.length === 0 && (
              <tr>
                <td colSpan="7" className="empty-state">No customers found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <CustomerModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingData}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
