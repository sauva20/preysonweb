import React, { useState } from 'react';
import { Search, Eye, Filter, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Orders.css';

import { useOrders } from '../../context/OrderContext';
import { useCurrency } from '../../context/CurrencyContext';

export default function Orders() {
  const { orders } = useOrders();
  const { formatPrice } = useCurrency();
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrders = orders.filter(order => {
    const matchesFilter = filter === 'All' || order.status === filter || order.source === filter;
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase());
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
          <h2>Orders & Transactions</h2>
          <p>Monitor and manage all incoming orders from POS and Online.</p>
        </div>
        <div className="header-actions">
          <button className="action-btn-outline">
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
            placeholder="Search by Order ID..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <Filter size={16} color="var(--admin-text-muted)" />
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="All">All Orders</option>
            <optgroup label="By Source">
              <option value="POS">POS System</option>
              <option value="Online">Online Store</option>
            </optgroup>
            <optgroup label="By Status">
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
            </optgroup>
          </select>
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
