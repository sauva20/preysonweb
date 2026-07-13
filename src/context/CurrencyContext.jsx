import React, { createContext, useState, useContext, useEffect } from 'react';

const CurrencyContext = createContext();

export const useCurrency = () => useContext(CurrencyContext);

const EXCHANGE_RATES = {
  IDR: 1,
  MYR: 0.0003, // 1 MYR = ~3300 IDR
  USD: 0.000066, // 1 USD = ~15000 IDR
  SGD: 0.000086, // 1 SGD = ~11600 IDR
};

const LOCALE_MAP = {
  IDR: 'id-ID',
  MYR: 'ms-MY',
  USD: 'en-US',
  SGD: 'en-SG',
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('storeCurrency') || 'IDR';
  });

  useEffect(() => {
    localStorage.setItem('storeCurrency', currency);
  }, [currency]);

  const formatPrice = (priceInIDR) => {
    if (typeof priceInIDR !== 'number') return priceInIDR;
    
    const rate = EXCHANGE_RATES[currency] || 1;
    const convertedAmount = priceInIDR * rate;
    const locale = LOCALE_MAP[currency] || 'id-ID';

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: currency === 'IDR' ? 0 : 2,
    }).format(convertedAmount);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
};
