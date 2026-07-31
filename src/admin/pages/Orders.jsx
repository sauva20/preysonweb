import React, { useState } from 'react';
import { Search, Eye, Filter, Download, ChevronDown, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './Orders.css';

import { useOrders } from '../../context/OrderContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useActivity } from '../../context/ActivityContext';
import { showSuccess } from '../utils/alert';

export default function Orders() {
  const { orders, deleteOrder } = useOrders();
  const { formatPrice } = useCurrency();
  const { logActivity } = useActivity();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All Time');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);

  const filteredOrders = orders.filter(order => {
    const matchesFilter = filter === 'All' || 
                          order.status === filter || 
                          order.source === filter || 
                          (filter === 'POS' && (order.source === 'Offline POS' || order.source?.includes('POS')));
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      String(order.id || '').toLowerCase().includes(q) ||
      String(order.customerName || '').toLowerCase().includes(q) ||
      String(order.shippingAddress?.name || '').toLowerCase().includes(q) ||
      String(order.status || '').toLowerCase().includes(q);

    let matchesDate = true;
    if (dateFilter !== 'All Time') {
      const orderDate = new Date(order.date);
      const now = new Date();
      if (dateFilter === 'Today') {
        matchesDate = orderDate.toDateString() === now.toDateString();
      } else if (dateFilter === 'This Week') {
        const weekAgo = new Date(now.setDate(now.getDate() - 7));
        matchesDate = orderDate >= weekAgo;
      } else if (dateFilter === 'This Month') {
        const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
        matchesDate = orderDate >= monthAgo;
      }
    }

    return matchesFilter && matchesSearch && matchesDate;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const handleExportCSV = () => {
    if (filteredOrders.length === 0) {
      alert("No orders to export!");
      return;
    }

    const headers = ['ORDER ID', 'DATE & TIME', 'CUSTOMER', 'SOURCE', 'TOTAL', 'STATUS', 'PAYMENT METHOD'];
    
    const csvRows = [headers.join(',')];
    
    filteredOrders.forEach(order => {
      const orderId = order.id || '';
      const date = formatDate(order.date).replace(/,/g, '');
      const customer = `"${(order.customerName || order.shippingAddress?.name || 'Offline Customer').replace(/"/g, '""')}"`;
      const source = order.source || '';
      const total = order.total || 0;
      const status = order.status || '';
      const paymentMethod = order.paymentMethod || '';
      
      csvRows.push([orderId, date, customer, source, total, status, paymentMethod].join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Preyson_Orders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    logActivity({ category: 'Pesanan', title: 'Ekspor Data Pesanan', description: `Laporan transaksi pesanan (${filteredOrders.length} data) diekspor ke format CSV.`, status: 'info' });
    showSuccess("Orders exported to CSV.");
  };

  return (
    <div className="orders-page">
      <div className="orders-header">
        <div className="page-titles">
          <h2>Orders & Sales</h2>
          <p>Monitor customer transactions, POS checkouts and online orders.</p>
        </div>
        <div className="orders-actions">
          <button className="export-btn" onClick={handleExportCSV}>
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
              onClick={() => {
                setIsDateDropdownOpen(!isDateDropdownOpen);
                setIsFilterDropdownOpen(false);
              }}
            >
              {dateFilter}
              <ChevronDown size={14} />
            </button>
            {isDateDropdownOpen && (
              <div className="custom-dropdown-menu">
                {['All Time', 'Today', 'This Week', 'This Month'].map(d => (
                  <div 
                    key={d}
                    className={`dropdown-item ${dateFilter === d ? 'active' : ''}`}
                    onClick={() => { setDateFilter(d); setIsDateDropdownOpen(false); }}
                  >
                    {d}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="custom-dropdown-wrapper">
            <button 
              className="custom-dropdown-toggle"
              onClick={() => {
                setIsFilterDropdownOpen(!isFilterDropdownOpen);
                setIsDateDropdownOpen(false);
              }}
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
              <th>CUSTOMER</th>
              <th>SOURCE</th>
              <th>TOTAL</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(order => (
              <tr key={order.id} onClick={() => navigate(`/admin/orders/${order.id}`)} style={{ cursor: 'pointer' }} className="clickable-row">
                <td>
                  <span className="order-id">{order.id}</span>
                </td>
                <td className="order-date">{formatDate(order.date)}</td>
                <td>
                  <span className="customer-name" style={{ fontWeight: '500' }}>
                    {order.customerName || (order.shippingAddress?.name) || 'Offline Customer'}
                  </span>
                </td>
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
                <td onClick={(e) => e.stopPropagation()}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <Link to={`/admin/orders/${order.id}`} className="view-details-btn" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <Eye size={16} />
                      View
                    </Link>
                    <button 
                      className="delete-order-btn"
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: '600' }}
                      onClick={async (e) => {
                        e.stopPropagation();
                        const result = await Swal.fire({
                          title: 'Hapus Pesanan?',
                          text: "Stok akan dikembalikan dan pesanan ini akan dihapus permanen dari sistem. Anda yakin?",
                          icon: 'warning',
                          showCancelButton: true,
                          confirmButtonColor: '#d33',
                          cancelButtonColor: '#3085d6',
                          confirmButtonText: 'Ya, Hapus!'
                        });
                        
                        if (result.isConfirmed) {
                          try {
                            await deleteOrder(order.id);
                            Swal.fire('Terhapus!', 'Pesanan berhasil dihapus dan stok dikembalikan.', 'success');
                            logActivity({ category: 'Pesanan', title: 'Hapus Pesanan', description: `Pesanan ${order.id} dihapus dan stok dikembalikan.`, status: 'warning' });
                          } catch (err) {
                            Swal.fire('Error', 'Gagal menghapus pesanan', 'error');
                          }
                        }
                      }}
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
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
