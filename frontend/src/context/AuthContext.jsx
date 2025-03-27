import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
          setUser(JSON.parse(localStorage.getItem('user')));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const res = await api.post('/auth/login', { username, password });
      const userData = res.data;
      
      localStorage.setItem('authToken', userData.token);
      localStorage.setItem('user', JSON.stringify({
        username: userData.username,
        role: userData.role
      }));
      
      setUser({
        username: userData.username,
        role: userData.role,
        token: userData.token
      });
      
      return true;
    } catch (err) {
      console.error("Login error:", err);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    setUser(null);
  };

  const isAuthenticated = !!user;
  const role = user?.role || 'guest';

  return (
    <AuthContext.Provider value={{ 
      user, 
      role, 
      isAuthenticated, 
      login, 
      logout,
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};