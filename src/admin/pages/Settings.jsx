import React, { useState } from 'react';
import { Store, CreditCard, Truck, Users, Save, CheckCircle2, QrCode } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import { useQris } from '../../context/QrisContext';
import './Settings.css';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('store');
  const [isSaved, setIsSaved] = useState(false);
  const { currency, setCurrency } = useCurrency();
  const { qrisStaticString, updateQrisString } = useQris();

  // Mock State for Settings
  const [storeDetails, setStoreDetails] = useState({
    name: 'Preyson Moto',
    email: 'hello@preysonmoto.com',
    phone: '+62 812 3456 7890',
    address: 'Jl. Ahmad Yani No. 100, Bandung, Jawa Barat',
    timezone: 'Asia/Jakarta'
  });

  const [paymentMethods, setPaymentMethods] = useState([
    { id: 'midtrans', name: 'Midtrans (Virtual Account, GoPay)', active: true, apiKey: 'Mid-server-*******' },
    { id: 'stripe', name: 'Stripe (Credit Card)', active: false, apiKey: '' },
    { id: 'cod', name: 'Cash on Delivery (COD)', active: true, apiKey: 'N/A' },
    { id: 'manual', name: 'Manual Bank Transfer', active: true, apiKey: 'BCA 1234567890' }
  ]);

  const [localQrisString, setLocalQrisString] = useState(qrisStaticString);

  // Sync local state when context loads
  React.useEffect(() => {
    setLocalQrisString(qrisStaticString);
  }, [qrisStaticString]);

  const [shippingProviders, setShippingProviders] = useState([
    { id: 'jne', name: 'JNE Express', active: true },
    { id: 'sicepat', name: 'SiCepat Ekspres', active: true },
    { id: 'gosend', name: 'GoSend Same Day', active: false },
    { id: 'flat', name: 'Flat Rate (Jabodetabek)', active: true, rate: '20000' }
  ]);

  const [staffList, setStaffList] = useState([
    { id: 1, name: 'Admin Utama', email: 'admin@preysonmoto.com', role: 'Super Admin', status: 'Active' },
    { id: 2, name: 'Kasir Toko 1', email: 'kasir1@preysonmoto.com', role: 'Cashier', status: 'Active' },
    { id: 3, name: 'Manajer Gudang', email: 'gudang@preysonmoto.com', role: 'Inventory Manager', status: 'Active' }
  ]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (localQrisString !== qrisStaticString) {
      await updateQrisString(localQrisString);
    }
    // Simulate API Save
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const togglePayment = (id) => {
    setPaymentMethods(paymentMethods.map(p => p.id === id ? { ...p, active: !p.active } : p));
  };

  const toggleShipping = (id) => {
    setShippingProviders(shippingProviders.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <div className="page-titles">
          <h2>Settings</h2>
          <p>Manage your store configurations, payments, and staff access.</p>
        </div>
        <div className="header-actions">
          <button className="action-btn-primary" onClick={handleSave}>
            {isSaved ? <><CheckCircle2 size={16} /> Saved</> : <><Save size={16} /> Save Changes</>}
          </button>
        </div>
      </div>

      <div className="settings-container">
        {/* Left Sidebar Navigation */}
        <div className="settings-nav">
          <button 
            className={`settings-nav-item ${activeTab === 'store' ? 'active' : ''}`}
            onClick={() => setActiveTab('store')}
          >
            <Store size={18} /> Store Details
          </button>
          <button 
            className={`settings-nav-item ${activeTab === 'payments' ? 'active' : ''}`}
            onClick={() => setActiveTab('payments')}
          >
            <CreditCard size={18} /> Payments
          </button>
          <button 
            className={`settings-nav-item ${activeTab === 'shipping' ? 'active' : ''}`}
            onClick={() => setActiveTab('shipping')}
          >
            <Truck size={18} /> Shipping & Delivery
          </button>
          <button 
            className={`settings-nav-item ${activeTab === 'staff' ? 'active' : ''}`}
            onClick={() => setActiveTab('staff')}
          >
            <Users size={18} /> Staff Accounts
          </button>
        </div>

        {/* Right Content Area */}
        <div className="settings-content">
          
          {/* TAB: STORE DETAILS */}
          {activeTab === 'store' && (
            <div className="settings-section fade-in">
              <h3>Store Profile</h3>
              <p className="section-desc">Basic information about your business used in receipts and emails.</p>
              
              <div className="settings-form">
                <div className="form-group">
                  <label>Store Name</label>
                  <input 
                    type="text" 
                    value={storeDetails.name} 
                    onChange={e => setStoreDetails({...storeDetails, name: e.target.value})} 
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group half">
                    <label>Contact Email</label>
                    <input 
                      type="email" 
                      value={storeDetails.email} 
                      onChange={e => setStoreDetails({...storeDetails, email: e.target.value})} 
                    />
                  </div>
                  <div className="form-group half">
                    <label>Phone Number</label>
                    <input 
                      type="tel" 
                      value={storeDetails.phone} 
                      onChange={e => setStoreDetails({...storeDetails, phone: e.target.value})} 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Store Address (Used for Shipping Origins)</label>
                  <textarea 
                    rows="3" 
                    value={storeDetails.address} 
                    onChange={e => setStoreDetails({...storeDetails, address: e.target.value})} 
                  ></textarea>
                </div>

                <div className="form-row">
                  <div className="form-group half">
                    <label>Store Currency</label>
                    <select 
                      value={currency} 
                      onChange={e => setCurrency(e.target.value)}
                    >
                      <option value="IDR">IDR - Indonesian Rupiah</option>
                      <option value="MYR">MYR - Malaysian Ringgit</option>
                      <option value="USD">USD - US Dollar</option>
                      <option value="SGD">SGD - Singapore Dollar</option>
                    </select>
                  </div>
                  <div className="form-group half">
                    <label>Timezone</label>
                    <select 
                      value={storeDetails.timezone} 
                      onChange={e => setStoreDetails({...storeDetails, timezone: e.target.value})}
                    >
                      <option value="Asia/Jakarta">Asia/Jakarta (WIB)</option>
                      <option value="Asia/Makassar">Asia/Makassar (WITA)</option>
                      <option value="Asia/Jayapura">Asia/Jayapura (WIT)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: PAYMENTS */}
          {activeTab === 'payments' && (
            <div className="settings-section fade-in">
              <h3>Payment Providers</h3>
              <p className="section-desc">Configure the payment gateways available during checkout.</p>
              
              <div className="settings-form" style={{ marginBottom: '24px' }}>
                <div className="form-group" style={{ backgroundColor: 'var(--admin-surface)', padding: '16px', borderRadius: '6px', border: '1px solid var(--admin-border)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--admin-text)' }}>
                    <QrCode size={18} /> Base QRIS String (Static)
                  </label>
                  <p style={{ fontSize: '12px', color: 'var(--admin-text-muted)', marginBottom: '12px' }}>
                    Paste your standard (Static) QRIS string here. The POS system will automatically inject the transaction total and convert it to a Dynamic QRIS on the fly.
                  </p>
                  <textarea 
                    rows="4" 
                    value={localQrisString} 
                    onChange={e => setLocalQrisString(e.target.value)} 
                    placeholder="e.g. 00020101021126570011ID.DANA.WWW..."
                    style={{ width: '100%', padding: '10px', backgroundColor: 'var(--admin-bg)', border: '1px solid var(--admin-border-dark)', color: 'var(--admin-text)', borderRadius: '4px', resize: 'vertical' }}
                  ></textarea>
                </div>
              </div>

              <div className="toggle-list">
                {paymentMethods.map(payment => (
                  <div className="toggle-card" key={payment.id}>
                    <div className="toggle-card-header">
                      <div className="toggle-info">
                        <strong>{payment.name}</strong>
                        <span className={`status-text ${payment.active ? 'active' : 'inactive'}`}>
                          {payment.active ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      <label className="switch">
                        <input type="checkbox" checked={payment.active} onChange={() => togglePayment(payment.id)} />
                        <span className="slider round"></span>
                      </label>
                    </div>
                    {payment.active && (
                      <div className="toggle-card-body">
                        <div className="form-group">
                          <label>API Key / Account Info</label>
                          <input 
                            type="text" 
                            value={payment.apiKey} 
                            onChange={(e) => {
                              setPaymentMethods(paymentMethods.map(p => p.id === payment.id ? { ...p, apiKey: e.target.value } : p))
                            }} 
                            placeholder="Enter credentials..." 
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: SHIPPING */}
          {activeTab === 'shipping' && (
            <div className="settings-section fade-in">
              <h3>Shipping Providers</h3>
              <p className="section-desc">Manage integrated logistics and delivery options.</p>
              
              <div className="toggle-list">
                {shippingProviders.map(shipping => (
                  <div className="toggle-card" key={shipping.id}>
                    <div className="toggle-card-header">
                      <div className="toggle-info">
                        <strong>{shipping.name}</strong>
                      </div>
                      <label className="switch">
                        <input type="checkbox" checked={shipping.active} onChange={() => toggleShipping(shipping.id)} />
                        <span className="slider round"></span>
                      </label>
                    </div>
                    {shipping.active && shipping.rate !== undefined && (
                      <div className="toggle-card-body">
                        <div className="form-group">
                          <label>Flat Rate Price (IDR)</label>
                          <input 
                            type="number" 
                            value={shipping.rate} 
                            onChange={(e) => {
                              setShippingProviders(shippingProviders.map(s => s.id === shipping.id ? { ...s, rate: e.target.value } : s))
                            }} 
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: STAFF ACCOUNTS */}
          {activeTab === 'staff' && (
            <div className="settings-section fade-in">
              <div className="section-header-flex">
                <div>
                  <h3>Staff Accounts</h3>
                  <p className="section-desc">Manage who has access to the admin console.</p>
                </div>
                <button className="action-btn-outline" onClick={() => alert('Invite staff feature coming soon!')}>
                  Invite Staff
                </button>
              </div>
              
              <div className="table-container">
                <table className="settings-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffList.map(staff => (
                      <tr key={staff.id}>
                        <td><strong>{staff.name}</strong></td>
                        <td>{staff.email}</td>
                        <td><span className="role-badge">{staff.role}</span></td>
                        <td><span className={`status-badge ${staff.status.toLowerCase()}`}>{staff.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
