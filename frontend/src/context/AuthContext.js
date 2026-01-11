import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_BASE = 'http://127.0.0.1:8000/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// AuthProvider is the component that fills the AuthContext with data. 
// So every page inside AppContent can access auth data.
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  if (token) {
    try {
      const decoded = jwtDecode(token);
      
      // IMMEDIATELY set basic user
      setUser({ id: decoded.user_id, username: `User-${decoded.user_id}`, role: 'worker' });
      setLoading(false);  // ✅ IMMEDIATE!
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Update with profile data later
      axios.get(`${API_BASE}/profile/`).then(response => {
        setUser({
          id: decoded.user_id,
          username: response.data.username,
          role: response.data.role
        });
      });
      
    } catch {
      localStorage.removeItem('token');
      setLoading(false);
    }
  } else {
    setLoading(false);
  }
  }, [token]);


  // const login = async (username, password) => {
  //   const { data } = await axios.post(`${API_BASE}/auth/token/`, { username, password });
  //   localStorage.setItem('token', data.access);
  //   setToken(data.access);
  //   axios.defaults.headers.common['Authorization'] = `Bearer ${data.access}`;
  // };
  const login = async (username, password) => {
    const response = await axios.post(`${API_BASE}/auth/token/`, { username, password });
    const token = response.data.access;
    
    localStorage.setItem('token', token);
    const decoded = jwtDecode(token);
    
    // ✅ IMMEDIATELY set user (don't wait for useEffect)
    setUser({ 
      id: decoded.user_id, 
      username: `User-${decoded.user_id}`,
      role: 'worker'
    });
    
    // Set axios header AFTER user is set
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };


  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
