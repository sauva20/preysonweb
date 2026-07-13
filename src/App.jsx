import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ProductProvider } from './context/ProductContext';
import { OrderProvider } from './context/OrderContext';
import { PromoProvider } from './context/PromoContext';
import { CustomerProvider } from './context/CustomerContext';
import { CartProvider } from './context/CartContext';
import { CurrencyProvider } from './context/CurrencyContext';

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductGrid from './components/ProductGrid';
import Banner from './components/Banner';
import CollabGrid from './components/CollabGrid';
import Footer from './components/Footer';
import Catalog from './pages/Catalog';
import Cart from './pages/Cart';
import ProductDetail from './pages/ProductDetail';

// Customer Auth
import CustomerLogin from './pages/CustomerLogin';
import CustomerRegister from './pages/CustomerRegister';
import CustomerForgotPassword from './pages/CustomerForgotPassword';

// Admin Components
import AdminLogin from './admin/pages/AdminLogin';
import AdminLayout from './admin/AdminLayout';
import Dashboard from './admin/pages/Dashboard';
import POS from './admin/pages/POS';
import Campaign from './admin/pages/Campaign';
import Products from './admin/pages/Products';
import Orders from './admin/pages/Orders';
import Discount from './admin/pages/Discount';
import Customers from './admin/pages/Customers';
import Reports from './admin/pages/Reports';
import Settings from './admin/pages/Settings';

function Home() {
  const [blocks, setBlocks] = React.useState(() => {
    const saved = localStorage.getItem('storefrontLayout');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse layout');
      }
    }
    // Default layout if none saved
    return [
      { id: '1', type: 'hero', config: {} },
      { id: '2', type: 'catalog', config: { title: 'REKOMENDASI PREYSON', subtitle: 'Pilihan terbaik untuk gaya berkendara Anda', columns: 4 } },
      { id: '3', type: 'catalog', config: { title: 'NEW RELEASE', subtitle: 'Koleksi terbaru dari Preyson Moto', columns: 4 } },
      { id: '4', type: 'banner', config: { imageUrl1: '/images/hero_bg.png', imageUrl2: '/images/cat_jacket.png' } },
      { id: '5', type: 'collab', config: { visible: true } },
      { id: '6', type: 'catalog', config: { title: 'KATALOG PRODUK', subtitle: 'Jelajahi seluruh koleksi Preyson', columns: 4 } },
    ];
  });

  const renderComponent = (block) => {
    switch (block.type) {
      case 'hero':
        return <Hero key={block.id} images={block.config.images} />;
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
        return block.config.visible !== false ? <CollabGrid key={block.id} collabs={block.config.collabs} /> : null;
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

import { QrisProvider } from './context/QrisContext';

function App() {
  return (
    <CurrencyProvider>
      <QrisProvider>
        <ProductProvider>
          <OrderProvider>
            <PromoProvider>
              <CustomerProvider>
                <CartProvider>
                  <Router>
                    <Routes>
                      {/* Storefront Routes */}
                      <Route path="/" element={<Home />} />
                      <Route path="/catalog" element={<Catalog />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/product/:id" element={<ProductDetail />} />
                      
                      {/* Customer Auth */}
                      <Route path="/login" element={<CustomerLogin />} />
                      <Route path="/register" element={<CustomerRegister />} />
                      <Route path="/forgot-password" element={<CustomerForgotPassword />} />
                      
                      {/* Admin Auth */}
                      <Route path="/admin/login" element={<AdminLogin />} />
                      
                      {/* Admin Dashboard Routes */}
                      <Route path="/admin" element={<AdminLayout />}>
                        <Route index element={<Navigate to="/admin/dashboard" replace />} />
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="pos" element={<POS />} />
                        <Route path="orders" element={<Orders />} />
                        <Route path="discount" element={<Discount />} />
                        <Route path="campaign" element={<Campaign />} />
                        <Route path="products" element={<Products />} />
                        <Route path="customers" element={<Customers />} />
                        <Route path="reports" element={<Reports />} />
                        <Route path="settings" element={<Settings />} />
                      </Route>
                    </Routes>
                  </Router>
                </CartProvider>
              </CustomerProvider>
            </PromoProvider>
          </OrderProvider>
        </ProductProvider>
      </QrisProvider>
    </CurrencyProvider>
  );
}

export default App;
