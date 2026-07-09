import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Categories from './components/Categories';
import Featured from './components/Featured';
import Newsletter from './components/Newsletter';
import Footer from './components/Footer';

function App() {
  return (
    <div className="app">
      <Navbar />
      <Hero />
      <Categories />
      <Featured />
      <Newsletter />
      <Footer />
    </div>
  );
}

export default App;
