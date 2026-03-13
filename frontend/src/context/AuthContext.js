// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [adminKey, setAdminKey] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // On app start, check if we already have the key
    const key = localStorage.getItem('adminKey');
    if (key) {
      setAdminKey(key);
    }
    setLoading(false);
  }, []);

  const login = (key) => {
    localStorage.setItem('adminKey', key);
    setAdminKey(key);
  };

  const logout = () => {
    localStorage.removeItem('adminKey');
    setAdminKey(null);
  };

  return (
    <AuthContext.Provider value={{ adminKey, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};