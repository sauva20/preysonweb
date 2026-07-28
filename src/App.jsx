import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { getApiUrl } from './utils/apiConfig';

import { ProductProvider } from './context/ProductContext';
import { OrderProvider } from './context/OrderContext';
import { PromoProvider } from './context/PromoContext';
import { CustomerProvider } from './context/CustomerContext';
import { CartProvider } from './context/CartContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { ActivityProvider } from './context/ActivityContext';
import { QrisProvider } from './context/QrisContext';
import { OfflineSyncProvider } from './context/OfflineSyncContext';

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductGrid from './components/ProductGrid';
import Banner from './components/Banner';
import CollabGrid from './components/CollabGrid';
import Footer from './components/Footer';

// Pages
import Catalog from './pages/Catalog';
import Cart from './pages/Cart';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import Payment from './pages/Payment';
import OrderSuccess from './pages/OrderSuccess';
import Contact from './pages/Contact';

// Customer Auth
import CustomerLogin from './pages/CustomerLogin';
import CustomerRegister from './pages/CustomerRegister';
import CustomerForgotPassword from './pages/CustomerForgotPassword';
import CustomerProfile from './pages/CustomerProfile';
import OrderHistory from './pages/OrderHistory';
import OrderDetail from './pages/OrderDetail';
import TrackOrder from './pages/TrackOrder';

// Admin Components
import AdminLogin from './admin/pages/AdminLogin';
import AdminLayout from './admin/AdminLayout';
import Dashboard from './admin/pages/Dashboard';
import POS from './admin/pages/POS';
import Campaign from './admin/pages/Campaign';
import Products from './admin/pages/Products';
import Orders from './admin/pages/Orders';
import OrderDetails from './admin/pages/OrderDetails';
import Discount from './admin/pages/Discount';
import Customers from './admin/pages/Customers';
import Reports from './admin/pages/Reports';
import Settings from './admin/pages/Settings';
import ActivityLog from './admin/pages/ActivityLog';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function Home() {
  const [blocks, setBlocks] = useState([
    { id: '1', type: 'hero', config: {} },
    { id: '2', type: 'catalog', config: { title: 'PREYSON RECOMMENDATIONS', subtitle: 'The best choices for your riding style', columns: 4 } },
    { id: '3', type: 'catalog', config: { title: 'NEW RELEASE', subtitle: 'The latest collection from Preyson Moto', columns: 4 } },
    { id: '4', type: 'banner', config: { imageUrl1: '/images/hero_bg.png', imageUrl2: '/images/cat_jacket.png' } },
    { id: '5', type: 'collab', config: { title: 'Colabs', visible: true } },
    { id: '6', type: 'catalog', config: { title: 'PRODUCT CATALOG', subtitle: 'Explore the full Preyson collection', columns: 4 } },
  ]);

  useEffect(() => {
    fetch(`${getApiUrl()}/settings`)
      .then(res => res.json())
      .then(data => {
        if (data.storefrontLayout) {
          try {
            const parsed = JSON.parse(data.storefrontLayout);
            setBlocks(parsed.map(b => {
              if (b.type === 'collab' && b.config.title === undefined) {
                b.config.title = 'Colabs';
              }
              return b;
            }));
          } catch(e) { console.error('Failed to parse layout from API'); }
        }
      })
      .catch(err => console.error('Error fetching layout settings:', err));
  }, []);

  const renderComponent = (block) => {
    switch (block.type) {
      case 'hero':
        return <Hero key={block.id} images={block.config.images} title={block.config.title} />;
      case 'catalog':
        return (
          <ProductGrid 
            key={block.id} 
            title={block.config.title} 
            subtitle={block.config.subtitle} 
            columns={block.config.columns} 
            categoryId={block.config.categoryId} 
            productIds={block.config.productIds} 
            viewAllLink={block.config.viewAllLink} 
          />
        );
      case 'banner':
        return <Banner key={block.id} images={block.config.images} imageUrl1={block.config.imageUrl1} imageUrl2={block.config.imageUrl2} />;
      case 'collab':
        return block.config.visible !== false ? <CollabGrid key={block.id} title={block.config.title} collabs={block.config.collabs} /> : null;
      default:
        return null;
    }
  };

  return (
    <div className="app">
      <Navbar />
      {blocks.map(renderComponent)}
      <Footer />
    </div>
  );
}

function App() {
  return (
    <ActivityProvider>
      <CurrencyProvider>
        <QrisProvider>
          <OfflineSyncProvider>
            <ProductProvider>
              <OrderProvider>
                <PromoProvider>
                  <CustomerProvider>
                    <CartProvider>
                      <Router>
                        <ScrollToTop />
                        <Routes>
                          {/* Storefront Routes */}
                          <Route path="/" element={<Home />} />
                          <Route path="/catalog" element={<Catalog />} />
                          <Route path="/catalog/:categoryName" element={<Catalog />} />
                          <Route path="/cart" element={<Cart />} />
                          <Route path="/product/:slug" element={<ProductDetail />} />
                          <Route path="/product/id/:id" element={<ProductDetail />} />
                          <Route path="/checkout" element={<Checkout />} />
                          <Route path="/payment/:id" element={<Payment />} />
                          <Route path="/order-success" element={<OrderSuccess />} />
                          <Route path="/contact" element={<Contact />} />
                          <Route path="/contact-us" element={<Contact />} />
                          
                          {/* Customer Auth */}
                          <Route path="/login" element={<CustomerLogin />} />
                          <Route path="/register" element={<CustomerRegister />} />
                          <Route path="/forgot-password" element={<CustomerForgotPassword />} />
                          <Route path="/profile" element={<CustomerProfile />} />
                          <Route path="/my-orders" element={<OrderHistory />} />
                          <Route path="/order-detail/:id" element={<OrderDetail />} />
                          <Route path="/track-order" element={<TrackOrder />} />
                          
                          {/* Admin Auth */}
                          <Route path="/admin/login" element={<AdminLogin />} />
                          
                          {/* Admin Dashboard Routes */}
                          <Route path="/admin" element={<AdminLayout />}>
                            <Route index element={<Navigate to="/admin/dashboard" replace />} />
                            <Route path="dashboard" element={<Dashboard />} />
                            <Route path="pos" element={<POS />} />
                            <Route path="orders" element={<Orders />} />
                            <Route path="orders/:id" element={<OrderDetails />} />
                            <Route path="discount" element={<Discount />} />
                            <Route path="campaign" element={<Campaign />} />
                            <Route path="products" element={<Products />} />
                            <Route path="customers" element={<Customers />} />
                            <Route path="reports" element={<Reports />} />
                            <Route path="activity" element={<ActivityLog />} />
                            <Route path="settings" element={<Settings />} />
                          </Route>
                        </Routes>
                      </Router>
                    </CartProvider>
                  </CustomerProvider>
                </PromoProvider>
              </OrderProvider>
            </ProductProvider>
          </OfflineSyncProvider>
        </QrisProvider>
      </CurrencyProvider>
    </ActivityProvider>
  );
}

export default App;
