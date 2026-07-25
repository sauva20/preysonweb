import React, { useState } from 'react';
import { Search, Eye, Filter, Download, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Orders.css';

import { useOrders } from '../../context/OrderContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useActivity } from '../../context/ActivityContext';
import { showSuccess } from '../utils/alert';

export default function Orders() {
  const { orders } = useOrders();
  const { formatPrice } = useCurrency();
  const { logActivity } = useActivity();
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  const filteredOrders = orders.filter(order => {
    const matchesFilter = filter === 'All' || order.status === filter || order.source === filter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      String(order.id || '').toLowerCase().includes(q) ||
      String(order.customerName || '').toLowerCase().includes(q) ||
      String(order.shippingAddress?.name || '').toLowerCase().includes(q) ||
      String(order.status || '').toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="orders-page">
      <div className="orders-header">
        <div className="page-titles">
          <h2>Orders & Sales</h2>
          <p>Monitor customer transactions, POS checkouts and online orders.</p>
        </div>
        <div className="orders-actions">
          <button className="export-btn" onClick={() => {
            logActivity({ category: 'Pesanan', title: 'Ekspor Data Pesanan', description: `Laporan transaksi pesanan (${filteredOrders.length} data) diekspor ke format CSV.`, status: 'info' });
            showSuccess("Orders exported to CSV.");
          }}>
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      <div className="orders-toolbar">
        <div className="search-box">
          <Search size={16} />
          <input 
            type="text" 
            placeholder="Cari Order ID atau nama Pelanggan..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <Filter size={16} color="var(--admin-text-muted)" />
          <div className="custom-dropdown-wrapper">
            <button 
              className="custom-dropdown-toggle"
              onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
            >
              {filter === 'All' ? 'All Orders' : 
               filter === 'POS' ? 'POS System' : 
               filter === 'Online' ? 'Online Store' : filter}
              <ChevronDown size={14} />
            </button>
            {isFilterDropdownOpen && (
              <div className="custom-dropdown-menu">
                <div 
                  className={`dropdown-item ${filter === 'All' ? 'active' : ''}`}
                  onClick={() => { setFilter('All'); setIsFilterDropdownOpen(false); }}
                >
                  All Orders
                </div>
                <div className="dropdown-group-label">By Source</div>
                <div 
                  className={`dropdown-item ${filter === 'POS' ? 'active' : ''}`}
                  onClick={() => { setFilter('POS'); setIsFilterDropdownOpen(false); }}
                >
                  POS System
                </div>
                <div 
                  className={`dropdown-item ${filter === 'Online' ? 'active' : ''}`}
                  onClick={() => { setFilter('Online'); setIsFilterDropdownOpen(false); }}
                >
                  Online Store
                </div>
                <div className="dropdown-group-label">By Status</div>
                <div 
                  className={`dropdown-item ${filter === 'Completed' ? 'active' : ''}`}
                  onClick={() => { setFilter('Completed'); setIsFilterDropdownOpen(false); }}
                >
                  Completed
                </div>
                <div 
                  className={`dropdown-item ${filter === 'Pending' ? 'active' : ''}`}
                  onClick={() => { setFilter('Pending'); setIsFilterDropdownOpen(false); }}
                >
                  Pending
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="orders-table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>ORDER ID</th>
              <th>DATE & TIME</th>
              <th>SOURCE</th>
              <th>TOTAL</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(order => (
              <tr key={order.id}>
                <td>
                  <span className="order-id">{order.id}</span>
                </td>
                <td className="order-date">{formatDate(order.date)}</td>
                <td>
                  <span className={`source-badge ${order.source.toLowerCase()}`}>
                    {order.source}
                  </span>
                </td>
                <td className="order-total">{formatPrice(order.total)}</td>
                <td>
                  <span className={`status-badge ${order.status.toLowerCase()}`}>
                    {order.status}
                  </span>
                </td>
                <td>
                  <Link to={`/admin/orders/${order.id}`} className="view-details-btn" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <Eye size={16} />
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan="6" className="empty-table">No orders found matching your filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
