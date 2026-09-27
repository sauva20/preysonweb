import React, { useState } from 'react';
import { useOrders } from '../../context/OrderContext';
import { useProducts } from '../../context/ProductContext';
import { useCurrency } from '../../context/CurrencyContext';
import { 
  TrendingUp, TrendingDown, DollarSign, ShoppingBag, Package, 
  AlertTriangle, AlertCircle, ShoppingCart, ChevronDown, Filter, Printer 
} from 'lucide-react';
import './Reports.css';

export default function Reports() {
  const { orders } = useOrders();
  const { products, categories } = useProducts();
  const { formatPrice } = useCurrency();
  const [activeTab, setActiveTab] = useState('overview');
  const [dateFilter, setDateFilter] = useState('All Time');
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // --- Calculations for Executive Summary ---
  const filteredOrders = orders.filter(order => {
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
      } else if (dateFilter === 'Custom') {
        if (startDate && endDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          matchesDate = orderDate >= start && orderDate <= end;
        } else {
          // If custom dates are not fully selected, maybe show all or nothing. Let's default to true until both are picked.
          matchesDate = true;
        }
      }
    }
    return matchesDate;
  });

  const completedOrders = filteredOrders.filter(o => o.status === 'Completed' || o.status === 'Pending'); // Including Pending as revenue for now
  
  const totalRevenue = completedOrders.reduce((sum, order) => sum + order.total, 0);
  const totalOrdersCount = completedOrders.length;
  const aov = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;
  
  const totalItemsSold = completedOrders.reduce((sum, order) => {
    return sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
  }, 0);

  // --- Channel Performance (POS vs Online) ---
  const posOrders = completedOrders.filter(o => o.source === 'POS');
  const onlineOrders = completedOrders.filter(o => o.source === 'Online');
  
  const posRevenue = posOrders.reduce((sum, order) => sum + order.total, 0);
  const onlineRevenue = onlineOrders.reduce((sum, order) => sum + order.total, 0);
  
  const posPercentage = totalRevenue > 0 ? (posRevenue / totalRevenue) * 100 : 0;
  const onlinePercentage = totalRevenue > 0 ? (onlineRevenue / totalRevenue) * 100 : 0;

  // --- Product Performance Calculations ---
  // Using actual product data from ProductContext
  const sortedBySold = [...products].sort((a, b) => b.sold - a.sold);
  const topSellers = sortedBySold.slice(0, 5);
  
  // Dead Stock: Products with 0 sold or very low sold compared to stock
  const deadStock = [...products].filter(p => p.sold === 0 || (p.sold < 5 && p.stock > 20));
  
  // Restock Alerts: Low stock
  const lowStock = [...products].filter(p => p.stock <= 5 && p.stock > 0).sort((a, b) => a.stock - b.stock);
  const outOfStock = [...products].filter(p => p.stock === 0);

  // --- Discounted Products Performance ---
  const discountedItemsSold = [];
  
  completedOrders.forEach(order => {
    order.items.forEach(item => {
      // item.product contains the original product details. item.price is what they paid.
      if (item.product && item.price < item.product.price) {
        const existing = discountedItemsSold.find(d => d.productId === item.productId);
        if (existing) {
          existing.quantity += item.quantity;
          existing.revenue += (item.price * item.quantity);
        } else {
          discountedItemsSold.push({
            productId: item.productId,
            name: item.product.name,
            sku: item.product.sku,
            originalPrice: item.product.price,
            soldPrice: item.price,
            quantity: item.quantity,
            revenue: (item.price * item.quantity)
          });
        }
      }
    });
  });

  // --- Category and Payment Summaries ---
  const categoryStockDetail = (categories || []).map(cat => {
    const catProducts = products.filter(p => p.categoryId === cat.id);
    
    let totalSizeRows = 0;
    const details = catProducts.map(p => {
      let sizes = [];
      try {
        sizes = typeof p.sizes === 'string' ? JSON.parse(p.sizes) : (p.sizes || []);
      } catch (e) {}

      let parsedSizes = [];
      if (sizes.length === 0) {
        parsedSizes = [{ sizeName: 'All Size', stock: p.stock }];
      } else {
        parsedSizes = sizes.map(s => ({
          sizeName: typeof s === 'string' ? s : s.name,
          stock: typeof s === 'string' ? p.stock : (s.stock || 0)
        }));
      }
      
      totalSizeRows += parsedSizes.length;
      return { productName: p.name, sizes: parsedSizes };
    });

    if (totalSizeRows === 0) totalSizeRows = 1;

    return { name: cat.name, totalSizeRows, details };
  });

  const categorySales = (categories || []).map(cat => {
    const catProductsIds = products.filter(p => p.categoryId === cat.id).map(p => p.id);
    let qtySold = 0;
    let catRevenue = 0;
    completedOrders.forEach(order => {
      order.items.forEach(item => {
        if (catProductsIds.includes(item.productId)) {
          qtySold += item.quantity;
          catRevenue += (item.price * item.quantity);
        }
      });
    });
    return { name: cat.name, qtySold, totalRevenue: catRevenue };
  }).sort((a, b) => b.totalRevenue - a.totalRevenue);

  const paymentMethodSummary = completedOrders.reduce((acc, order) => {
    const method = order.paymentMethod || 'Unknown';
    if (!acc[method]) {
      acc[method] = { method, revenue: 0, count: 0 };
    }
    acc[method].revenue += order.total;
    acc[method].count += 1;
    return acc;
  }, {});
  const paymentMethodsArray = Object.values(paymentMethodSummary).sort((a, b) => b.revenue - a.revenue);

  const formatCurrency = (amount) => {
    return formatPrice(amount); 
  };

  return (
    <div className="reports-page">
      <div className="reports-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className="page-titles">
          <h2>Analytics & Reports</h2>
          <p>Comprehensive overview of your store's performance and inventory health.</p>
        </div>
        <div className="filter-group" style={{ marginTop: '15px', display: 'flex', gap: '15px', alignItems: 'center' }}>
          <button 
            className="action-btn-outline" 
            style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={() => window.print()}
          >
            <Printer size={16} />
            Print Report
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={16} color="var(--admin-text-muted)" />
          <div className="custom-dropdown-wrapper">
            <button 
              className="custom-dropdown-toggle"
              onClick={() => setIsDateDropdownOpen(!isDateDropdownOpen)}
            >
              {dateFilter}
              <ChevronDown size={14} />
            </button>
            {isDateDropdownOpen && (
              <div className="custom-dropdown-menu" style={{ right: 0, left: 'auto' }}>
                {['All Time', 'Today', 'This Week', 'This Month', 'Custom'].map(d => (
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

          {dateFilter === 'Custom' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '8px' }}>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{ padding: '6px', borderRadius: '4px', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-bg)', color: 'var(--admin-text)', fontSize: '0.9rem' }}
              />
              <span style={{ color: 'var(--admin-text-muted)' }}>-</span>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{ padding: '6px', borderRadius: '4px', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-bg)', color: 'var(--admin-text)', fontSize: '0.9rem' }}
              />
            </div>
          )}

        </div>
      </div>
    </div>

      <div className="reports-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <TrendingUp size={16} /> Sales Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          <Package size={16} /> Product Performance
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="tab-content">
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-icon highlight"><DollarSign size={24} /></div>
              <div className="metric-info">
                <h3>Total Revenue</h3>
                <p className="metric-value">{formatCurrency(totalRevenue)}</p>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon"><ShoppingBag size={24} /></div>
              <div className="metric-info">
                <h3>Total Orders</h3>
                <p className="metric-value">{totalOrdersCount}</p>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon"><TrendingUp size={24} /></div>
              <div className="metric-info">
                <h3>Average Order Value</h3>
                <p className="metric-value">{formatCurrency(aov)}</p>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon"><ShoppingCart size={24} /></div>
              <div className="metric-info">
                <h3>Items Sold</h3>
                <p className="metric-value">{totalItemsSold} units</p>
              </div>
            </div>
          </div>

          <div className="report-section">
            <div className="section-header">
              <h3>Sales Channel Breakdown</h3>
              <p>Revenue distribution between Physical POS and Online Store</p>
            </div>
            
            <div className="channel-split-container">
              <div className="channel-bar-wrapper">
                <div 
                  className="channel-bar pos-bar" 
                  style={{ width: `${posPercentage}%` }}
                  title={`POS: ${formatCurrency(posRevenue)}`}
                ></div>
                <div 
                  className="channel-bar online-bar" 
                  style={{ width: `${onlinePercentage}%` }}
                  title={`Online: ${formatCurrency(onlineRevenue)}`}
                ></div>
              </div>
              <div className="channel-legend">
                <div className="legend-item">
                  <span className="legend-dot pos"></span>
                  <div className="legend-text">
                    <strong>POS (In-Store)</strong>
                    <span>{posPercentage.toFixed(1)}% — {formatCurrency(posRevenue)}</span>
                  </div>
                </div>
                <div className="legend-item">
                  <span className="legend-dot online"></span>
                  <div className="legend-text">
                    <strong>Online Store</strong>
                    <span>{onlinePercentage.toFixed(1)}% — {formatCurrency(onlineRevenue)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="report-section" style={{ marginTop: '20px' }}>
            <div className="section-header">
              <h3>Ringkasan Metode Pembayaran</h3>
              <p>Total penjualan berdasarkan cara pembayaran (CASH, QRIS, ECOMMERCE, dll)</p>
            </div>
            <table className="report-table">
              <thead>
                <tr>
                  <th>Cara Pembayaran</th>
                  <th>Jumlah Transaksi</th>
                  <th>Total Penjualan</th>
                </tr>
              </thead>
              <tbody>
                {paymentMethodsArray.map(pm => (
                  <tr key={pm.method}>
                    <td><strong>{pm.method}</strong></td>
                    <td><span className="badge neutral">{pm.count}</span></td>
                    <td>{formatCurrency(pm.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {activeTab === 'products' && (
        <div className="tab-content product-reports-grid">

          {/* CATEGORY SALES & STOCK */}
          <div className="report-card full-width">
            <div className="card-header">
              <div className="title-with-icon">
                <ShoppingBag size={20} color="#8b5cf6" />
                <h3>Laporan Berdasarkan Kategori</h3>
              </div>
              <p>Ringkasan stok dan penjualan untuk tiap kategori produk.</p>
            </div>
            <div className="alerts-grid">
              <div className="alert-column">
                <h4 className="alert-subtitle" style={{ marginBottom: '10px' }}>Penjualan per Kategori</h4>
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', fontSize: '13px', color: '#000' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#e5e7eb', borderBottom: '2px solid #000' }}>
                      <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'left', fontWeight: 'bold' }}>Kategori</th>
                      <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>Qty Terjual</th>
                      <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>Total Penjualan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categorySales.map(cat => (
                      <tr key={cat.name}>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>{cat.name}</td>
                        <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>{cat.qtySold}</td>
                        <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>{formatCurrency(cat.totalRevenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="alerts-grid" style={{ marginTop: '20px' }}>
              <div className="alert-column" style={{ gridColumn: '1 / -1' }}>
                <h4 className="alert-subtitle" style={{ marginBottom: '10px' }}>Detail Stok per Kategori</h4>
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', fontSize: '13px', color: '#000' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#e5e7eb', borderBottom: '2px solid #000' }}>
                      <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'left', fontWeight: 'bold' }}>Kategori</th>
                      <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'left', fontWeight: 'bold' }}>Nama Produk</th>
                      <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>Size</th>
                      <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>Jumlah</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryStockDetail.map(cat => (
                      <React.Fragment key={cat.name}>
                        {cat.details.length === 0 ? (
                          <tr>
                            <td style={{ border: '1px solid #000', padding: '8px', fontWeight: 'bold', backgroundColor: '#f3f4f6' }}>{cat.name}</td>
                            <td colSpan="3" style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>- Kosong -</td>
                          </tr>
                        ) : (
                          cat.details.map((prod, pIdx) => (
                            prod.sizes.map((sz, sIdx) => (
                              <tr key={`${cat.name}-${prod.productName}-${sz.sizeName}`}>
                                {pIdx === 0 && sIdx === 0 && (
                                  <td rowSpan={cat.totalSizeRows} style={{ border: '1px solid #000', padding: '8px', verticalAlign: 'top', fontWeight: 'bold', backgroundColor: '#f3f4f6' }}>{cat.name}</td>
                                )}
                                {sIdx === 0 && (
                                  <td rowSpan={prod.sizes.length} style={{ border: '1px solid #000', padding: '8px', verticalAlign: 'top' }}>{prod.productName}</td>
                                )}
                                <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>{sz.sizeName}</td>
                                <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>{sz.stock}</td>
                              </tr>
                            ))
                          ))
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          {/* TOP SELLERS */}
          <div className="report-card">
            <div className="card-header">
              <div className="title-with-icon">
                <TrendingUp size={20} color="#22c55e" />
                <h3>Top Sellers</h3>
              </div>
              <p>Products with the highest quantity sold.</p>
            </div>
            <table className="report-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Sold</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topSellers.map(product => (
                  <tr key={product.id}>
                    <td>
                      <div className="product-name-sku">
                        <strong>{product.name}</strong>
                        <span>{product.sku}</span>
                      </div>
                    </td>
                    <td><span className="badge success">{product.sold} units</span></td>
                    <td>{formatCurrency(product.sold * product.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* DEAD STOCK */}
          <div className="report-card">
            <div className="card-header">
              <div className="title-with-icon">
                <TrendingDown size={20} color="#ef4444" />
                <h3>Dead Stock / Slow Movers</h3>
              </div>
              <p>Products that are not selling well.</p>
            </div>
            <table className="report-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Stock</th>
                  <th>Sold</th>
                </tr>
              </thead>
              <tbody>
                {deadStock.length > 0 ? deadStock.map(product => (
                  <tr key={product.id}>
                    <td>
                      <div className="product-name-sku">
                        <strong>{product.name}</strong>
                        <span>{product.sku}</span>
                      </div>
                    </td>
                    <td><span className="badge neutral">{product.stock} units</span></td>
                    <td><span className="badge danger">{product.sold} units</span></td>
                  </tr>
                )) : (
                  <tr><td colSpan="3" className="empty-state">No dead stock found. Great job!</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* DISCOUNTED ITEMS SOLD */}
          <div className="report-card" style={{ gridColumn: '1 / -1' }}>
            <div className="card-header">
              <div className="title-with-icon">
                <DollarSign size={20} color="#3b82f6" />
                <h3>Discounted Products Sold</h3>
              </div>
              <p>Products sold at a discount during the selected period.</p>
            </div>
            {discountedItemsSold.length > 0 ? (
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Original Price</th>
                    <th>Sold At</th>
                    <th>Quantity Sold</th>
                    <th>Total Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {discountedItemsSold.map(item => (
                    <tr key={item.productId}>
                      <td>
                        <div className="product-name-sku">
                          <strong>{item.name}</strong>
                          <span>{item.sku}</span>
                        </div>
                      </td>
                      <td style={{ textDecoration: 'line-through', color: '#888' }}>{formatCurrency(item.originalPrice)}</td>
                      <td style={{ color: '#10b981', fontWeight: 'bold' }}>{formatCurrency(item.soldPrice)}</td>
                      <td><span className="badge warning">{item.quantity} units</span></td>
                      <td>{formatCurrency(item.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--admin-text-muted)' }}>
                No discounted products sold during this period.
              </div>
            )}
          </div>



          {/* RESTOCK ALERTS */}
          <div className="report-card full-width">
            <div className="card-header">
              <div className="title-with-icon">
                <AlertTriangle size={20} color="#eab308" />
                <h3>Restock Alerts</h3>
              </div>
              <p>Products that are critically low or out of stock.</p>
            </div>
            
            <div className="alerts-grid">
              <div className="alert-column">
                <h4 className="alert-subtitle"><AlertCircle size={16} color="#ef4444" /> Out of Stock</h4>
                {outOfStock.length > 0 ? outOfStock.map(product => (
                  <div className="alert-item danger" key={product.id}>
                    <div className="alert-item-info">
                      <strong>{product.name}</strong>
                      <span>{product.sku}</span>
                    </div>
                    <span className="alert-badge">0 Left</span>
                  </div>
                )) : (
                  <p className="empty-state-small">No out of stock items.</p>
                )}
              </div>
              
              <div className="alert-column">
                <h4 className="alert-subtitle"><AlertTriangle size={16} color="#eab308" /> Low Stock (Below 5)</h4>
                {lowStock.length > 0 ? lowStock.map(product => (
                  <div className="alert-item warning" key={product.id}>
                    <div className="alert-item-info">
                      <strong>{product.name}</strong>
                      <span>{product.sku}</span>
                    </div>
                    <span className="alert-badge warning">{product.stock} Left</span>
                  </div>
                )) : (
                  <p className="empty-state-small">No low stock items.</p>
                )}
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
