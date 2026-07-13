import React, { createContext, useState, useEffect, useContext } from 'react';

const QrisContext = createContext();
const API_URL = `${import.meta.env.VITE_API_URL}`;

export function QrisProvider({ children }) {
  const [qrisStaticString, setQrisStaticString] = useState('');
  
  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API_URL}/settings`);
      const data = await res.json();
      if (data.qrisStaticString) {
        setQrisStaticString(data.qrisStaticString);
      }
    } catch (err) {
      console.error('Failed to fetch settings', err);
    }
  };

  const updateQrisString = async (newString) => {
    try {
      const res = await fetch(`${API_URL}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrisStaticString: newString })
      });
      if (res.ok) {
        setQrisStaticString(newString);
      }
    } catch (err) {
      console.error('Failed to update settings', err);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <QrisContext.Provider value={{ qrisStaticString, updateQrisString }}>
      {children}
    </QrisContext.Provider>
  );
}

export function useQris() {
  return useContext(QrisContext);
}
