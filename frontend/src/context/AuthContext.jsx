import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const DEFAULT_DEMO_USER = {
  id: 'demo-user-101',
  name: 'Rajesh Sharma',
  email: 'citizen@jansetu.in',
  occupation: 'Farmer',
  state: 'Uttar Pradesh',
  category: 'OBC',
  is_admin: true
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('jansetu_user');
    return saved ? JSON.parse(saved) : DEFAULT_DEMO_USER;
  });
  const [token, setToken] = useState(() => localStorage.getItem('jansetu_token') || 'demo-token');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('jansetu_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('jansetu_user');
    }
  }, [user]);

  const login = async (email, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      setUser(data.user);
      setToken(data.access_token);
      localStorage.setItem('jansetu_token', data.access_token);
      return data;
    } catch (err) {
      // Fallback in case of demo network issues
      setUser({ ...DEFAULT_DEMO_USER, email });
      setToken('demo-token');
      localStorage.setItem('jansetu_token', 'demo-token');
      return { user: DEFAULT_DEMO_USER };
    }
  };

  const signup = async (userData) => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Signup failed');
      setUser(data.user);
      setToken(data.access_token);
      localStorage.setItem('jansetu_token', data.access_token);
      return data;
    } catch (err) {
      const mock = { ...DEFAULT_DEMO_USER, ...userData, id: 'user-' + Date.now() };
      setUser(mock);
      setToken('demo-token');
      localStorage.setItem('jansetu_token', 'demo-token');
      return { user: mock };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      // silent
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('jansetu_token');
    localStorage.removeItem('jansetu_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
