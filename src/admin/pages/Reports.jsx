import React, { useState } from 'react';
import { useOrders } from '../../context/OrderContext';
import { useProducts } from '../../context/ProductContext';
import { useCurrency } from '../../context/CurrencyContext';
import { 
  TrendingUp, TrendingDown, DollarSign, ShoppingBag, Package, 
  AlertTriangle, AlertCircle, ShoppingCart 
} from 'lucide-react';
import './Reports.css';

export default function Reports() {
  const { orders } = useOrders();
  const { products } = useProducts();
  const { formatPrice } = useCurrency();
  const [activeTab, setActiveTab] = useState('overview');

  // --- Calculations for Executive Summary ---
  const completedOrders = orders.filter(o => o.status === 'Completed' || o.status === 'Pending'); // Including Pending as revenue for now
  
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

  const formatCurrency = (amount) => {
    return formatPrice(amount); 
  };

  return (
    <div className="reports-page">
      <div className="reports-header">
        <div className="page-titles">
          <h2>Analytics & Reports</h2>
          <p>Comprehensive overview of your store's performance and inventory health.</p>
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
        </div>
      )}

      {activeTab === 'products' && (
        <div className="tab-content product-reports-grid">
          
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
