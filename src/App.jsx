import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ProductProvider } from './context/ProductContext';

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductGrid from './components/ProductGrid';
import Banner from './components/Banner';
import CollabGrid from './components/CollabGrid';
import Footer from './components/Footer';
import Login from './components/Login';

// Admin Components
import AdminLayout from './admin/AdminLayout';
import Dashboard from './admin/pages/Dashboard';
import POS from './admin/pages/POS';
import Campaign from './admin/pages/Campaign';
import Products from './admin/pages/Products';

function Home() {
  return (
    <div className="app">
      <Navbar />
      <Hero />
      <ProductGrid 
        title="REKOMENDASI PREYSON" 
        subtitle="Pilihan terbaik untuk gaya berkendara Anda"
      />
      <ProductGrid 
        title="NEW RELEASE" 
        subtitle="Koleksi terbaru dari Preyson Moto"
        columns={4}
      />
      <Banner 
        imageUrl1="/images/hero_bg.png" 
        imageUrl2="/images/cat_jacket.png" 
      />
      <CollabGrid />
      <ProductGrid 
        title="KATALOG PRODUK" 
        subtitle="Jelajahi seluruh koleksi Preyson"
      />
      <Footer />
    </div>
  );
}

function App() {
  return (
    <ProductProvider>
      <Router>
        <Routes>
          {/* Storefront Routes */}
          <Route path="/" element={<Home />} />
          
          {/* Admin Login (Standalone) */}
          <Route path="/loginadmin" element={<Login />} />
          
          {/* Admin Dashboard Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="pos" element={<POS />} />
            <Route path="campaign" element={<Campaign />} />
            <Route path="products" element={<Products />} />
          </Route>
        </Routes>
      </Router>
    </ProductProvider>
  );
}

export default App;
