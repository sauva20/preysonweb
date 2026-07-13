import React, { useState } from 'react';
import { Store, CreditCard, Truck, Users, Save, CheckCircle2, QrCode, LogOut } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import { useQris } from '../../context/QrisContext';
import './Settings.css';

export default function Settings() {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('settingsActiveTab') || 'store';
  });
  
  React.useEffect(() => {
    localStorage.setItem('settingsActiveTab', activeTab);
  }, [activeTab]);

  const [isSaved, setIsSaved] = useState(false);
  const { currency, setCurrency } = useCurrency();
  const { qrisStaticString, updateQrisString } = useQris();



  const [paymentMethods, setPaymentMethods] = useState([
    { id: 'midtrans', name: 'Midtrans (Virtual Account, GoPay)', active: true, apiKey: 'Mid-server-*******' }
  ]);

  const [localQrisString, setLocalQrisString] = useState(qrisStaticString);

  // Sync local state when context loads
  React.useEffect(() => {
    setLocalQrisString(qrisStaticString);
  }, [qrisStaticString]);

  const [shippingProviders, setShippingProviders] = useState([
    { id: 'jne', name: 'JNE Express', active: true },
    { id: 'sicepat', name: 'SiCepat Ekspres', active: true },
    { id: 'jnt', name: 'J&T Express', active: true },
    { id: 'anteraja', name: 'AnterAja', active: true },
    { id: 'tiki', name: 'TIKI', active: true },
    { id: 'pos', name: 'Pos Indonesia', active: true },
    { id: 'ninja', name: 'Ninja Xpress', active: false },
    { id: 'lion', name: 'Lion Parcel', active: false },
    { id: 'idexpress', name: 'ID Express', active: false },
    { id: 'sap', name: 'SAP Express', active: false },
    { id: 'gosend', name: 'GoSend', active: false },
    { id: 'grab', name: 'GrabExpress', active: false },
    { id: 'paxel', name: 'Paxel', active: false },
    { id: 'lalamove', name: 'Lalamove', active: false }
  ]);

  const [staffList, setStaffList] = useState([]);
  const [isInviteStaffOpen, setIsInviteStaffOpen] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: '', email: '', password: '', role: 'cashier' });

  const fetchStaff = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/staff`);
      if(res.ok) {
        const data = await res.json();
        setStaffList(data);
      }
    } catch(err) { console.error(err); }
  };

  const [areaSearch, setAreaSearch] = useState('');
  const [areaResults, setAreaResults] = useState([]);
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);
  const [isSearchingArea, setIsSearchingArea] = useState(false);

  React.useEffect(() => {
    if (areaSearch.length < 3) {
      setAreaResults([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      setIsSearchingArea(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/checkout/search-area?query=${encodeURIComponent(areaSearch)}`);
        const data = await res.json();
        setAreaResults(data.areas || []);
        setShowAreaDropdown(true);
      } catch(err) {
        console.error(err);
      }
      setIsSearchingArea(false);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [areaSearch]);

  const handleSelectArea = (area) => {
    setAppSettings(prev => ({
      ...prev,
      store_province: area.administrative_division_level_1_name,
      store_city: area.administrative_division_level_2_name,
      store_postal_code: area.postal_code,
      store_area_id: area.id
    }));
    setAreaSearch(`${area.name}, ${area.administrative_division_level_2_name}, ${area.postal_code}`);
    setShowAreaDropdown(false);
  };

  const [appSettings, setAppSettings] = useState({
    midtrans_server_key: '',
    midtrans_client_key: '',
    midtrans_is_production: 'false',
    biteship_api_key: '',
    store_name: 'Preyson Moto',
    store_email: 'hello@preysonmoto.com',
    store_phone: '+62 812 3456 7890',
    store_address: 'Jl. Ahmad Yani No. 100',
    store_city: 'Bandung',
    store_province: 'Jawa Barat',
    store_postal_code: '40115',
    store_timezone: 'Asia/Jakarta'
  });

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/settings`);
      if (res.ok) {
        const data = await res.json();
        setAppSettings(prev => ({
          ...prev,
          ...data
        }));
        if (data.store_city || data.store_postal_code) {
          setAreaSearch(`${data.store_city || ''}, ${data.store_province || ''} ${data.store_postal_code ? `(${data.store_postal_code})` : ''}`);
        }
      }
    } catch(err) { console.error(err); }
  };

  React.useEffect(() => {
    fetchStaff();
    fetchSettings();
  }, []);

  const handleInviteStaffSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/staff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStaff)
      });
      if(res.ok) {
        fetchStaff();
        setIsInviteStaffOpen(false);
        setNewStaff({ name: '', email: '', password: '', role: 'cashier' });
        alert('Staff added successfully!');
      } else {
        alert('Failed to add staff.');
      }
    } catch(err) { console.error(err); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (localQrisString !== qrisStaticString) {
      await updateQrisString(localQrisString);
    }
    
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appSettings)
      });
    } catch(err) { console.error(err); }

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const togglePayment = (id) => {
    setPaymentMethods(paymentMethods.map(p => p.id === id ? { ...p, active: !p.active } : p));
  };

  const toggleShipping = (id) => {
    setShippingProviders(shippingProviders.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/admin/login';
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
          
          <button 
            className="settings-nav-item logout-btn"
            style={{ marginTop: 'auto', color: '#e53e3e' }}
            onClick={handleLogout}
          >
            <LogOut size={18} /> Logout
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
                    value={appSettings.store_name} 
                    onChange={e => setAppSettings({...appSettings, store_name: e.target.value})} 
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group half">
                    <label>Contact Email</label>
                    <input 
                      type="email" 
                      value={appSettings.store_email} 
                      onChange={e => setAppSettings({...appSettings, store_email: e.target.value})} 
                    />
                  </div>
                  <div className="form-group half">
                    <label>Phone Number</label>
                    <input 
                      type="tel" 
                      value={appSettings.store_phone} 
                      onChange={e => setAppSettings({...appSettings, store_phone: e.target.value})} 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Store Address (Used for Shipping Origins)</label>
                  <input 
                    type="text" 
                    value={appSettings.store_address} 
                    onChange={e => setAppSettings({...appSettings, store_address: e.target.value})} 
                    placeholder="Street Address"
                    style={{ marginBottom: '10px' }}
                  />
                  <div className="form-row" style={{ marginTop: '10px', gap: '10px' }}>
                    <div className="form-group" style={{ flex: 1, position: 'relative' }}>
                      <input 
                        type="text" 
                        value={areaSearch} 
                        onChange={e => setAreaSearch(e.target.value)} 
                        placeholder="Cari Kecamatan / Kota (Biteship Autocomplete)"
                        onFocus={() => { if(areaResults.length > 0) setShowAreaDropdown(true); }}
                      />
                      {isSearchingArea && <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>Searching...</div>}
                      {showAreaDropdown && areaResults.length > 0 && (
                        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--admin-bg)', border: '1px solid var(--admin-border)', borderRadius: '4px', maxHeight: '200px', overflowY: 'auto', zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                          {areaResults.map(area => (
                            <div 
                              key={area.id} 
                              onClick={() => handleSelectArea(area)}
                              style={{ padding: '10px', cursor: 'pointer', borderBottom: '1px solid var(--admin-border)', fontSize: '13px', color: 'var(--admin-text)' }}
                              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--admin-surface)'}
                              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                              <strong>{area.name}</strong>, {area.administrative_division_level_2_name}, {area.administrative_division_level_1_name} ({area.postal_code})
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="form-row" style={{ marginTop: '10px', gap: '10px' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <input 
                        type="text" 
                        value={appSettings.store_city} 
                        onChange={e => setAppSettings({...appSettings, store_city: e.target.value})} 
                        placeholder="City"
                        disabled
                      />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <input 
                        type="text" 
                        value={appSettings.store_province} 
                        onChange={e => setAppSettings({...appSettings, store_province: e.target.value})} 
                        placeholder="Province"
                        disabled
                      />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <input 
                        type="text" 
                        value={appSettings.store_postal_code} 
                        onChange={e => setAppSettings({...appSettings, store_postal_code: e.target.value})} 
                        placeholder="Postal Code"
                        disabled
                      />
                    </div>
                  </div>
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
                      value={appSettings.store_timezone} 
                      onChange={e => setAppSettings({...appSettings, store_timezone: e.target.value})}
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
                    {payment.active && payment.id === 'midtrans' && (
                      <div className="toggle-card-body">
                        <div className="form-group">
                          <label>Midtrans Server Key</label>
                          <input 
                            type="text" 
                            value={appSettings.midtrans_server_key} 
                            onChange={(e) => setAppSettings({...appSettings, midtrans_server_key: e.target.value})} 
                          />
                        </div>
                        <div className="form-group">
                          <label>Midtrans Client Key</label>
                          <input 
                            type="text" 
                            value={appSettings.midtrans_client_key} 
                            onChange={(e) => setAppSettings({...appSettings, midtrans_client_key: e.target.value})} 
                          />
                        </div>
                        <div className="form-group">
                          <label>Environment</label>
                          <select 
                            value={appSettings.midtrans_is_production}
                            onChange={(e) => setAppSettings({...appSettings, midtrans_is_production: e.target.value})}
                          >
                            <option value="false">Sandbox</option>
                            <option value="true">Production</option>
                          </select>
                        </div>
                      </div>
                    )}
                    {payment.active && payment.id !== 'midtrans' && (
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
              
              <div className="settings-form" style={{ marginBottom: '24px' }}>
                <div className="form-group" style={{ backgroundColor: 'var(--admin-surface)', padding: '16px', borderRadius: '6px', border: '1px solid var(--admin-border)' }}>
                  <label>Biteship API Key</label>
                  <p style={{ fontSize: '12px', color: 'var(--admin-text-muted)', marginBottom: '12px' }}>
                    Required to calculate dynamic shipping rates during checkout.
                  </p>
                  <input 
                    type="text" 
                    value={appSettings.biteship_api_key} 
                    onChange={e => setAppSettings({...appSettings, biteship_api_key: e.target.value})} 
                    style={{ width: '100%', padding: '10px', backgroundColor: 'var(--admin-bg)', border: '1px solid var(--admin-border-dark)', color: 'var(--admin-text)', borderRadius: '4px' }}
                  />
                </div>
              </div>
              
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
                <button className="action-btn-outline" onClick={() => setIsInviteStaffOpen(true)}>
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
      
      {isInviteStaffOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', width: '400px' }}>
            <h3 style={{ marginBottom: '16px', color: '#111' }}>Invite New Staff</h3>
            <form onSubmit={handleInviteStaffSubmit}>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.9rem', color: '#555' }}>Name</label>
                <input type="text" required style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} value={newStaff.name} onChange={e => setNewStaff({...newStaff, name: e.target.value})} />
              </div>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.9rem', color: '#555' }}>Email</label>
                <input type="email" required style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} value={newStaff.email} onChange={e => setNewStaff({...newStaff, email: e.target.value})} />
              </div>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.9rem', color: '#555' }}>Password</label>
                <input type="password" required style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} value={newStaff.password} onChange={e => setNewStaff({...newStaff, password: e.target.value})} />
              </div>
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.9rem', color: '#555' }}>Role</label>
                <select style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', background: '#fff' }} value={newStaff.role} onChange={e => setNewStaff({...newStaff, role: e.target.value})}>
                  <option value="cashier">Cashier</option>
                  <option value="admin">Admin</option>
                  <option value="superadmin">Super Admin</option>
                  <option value="owner">Owner</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setIsInviteStaffOpen(false)} style={{ padding: '8px 16px', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 16px', background: '#cf5a16', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Add Staff</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
