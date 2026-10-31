import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const DEMO_PERSONAS = [
  {
    id: 'persona-farmer',
    name: 'Rajesh Sharma',
    email: 'citizen@jansetu.in',
    role: 'Farmer',
    occupation: 'Farmer',
    state: 'Uttar Pradesh',
    category: 'OBC',
    aadhaar_seeded: true,
    bank_name: 'State Bank of India',
    account_last4: '4921',
    ifsc: 'SBIN0001245',
    npci_status: 'Active & Verified',
    dbt_health_score: 98,
    avatar: '👨‍🌾',
    annual_income: '₹1,20,000',
    dbt_benefit_total: 36000,
    active_schemes_count: 4,
    eligible_schemes_count: 14,
    pending_action: 'PM-KISAN e-KYC verified',
    is_admin: true
  },
  {
    id: 'persona-student',
    name: 'Aarav Sharma',
    email: 'student@jansetu.in',
    role: 'Student',
    occupation: 'Student',
    state: 'Uttar Pradesh',
    category: 'General',
    aadhaar_seeded: false,
    bank_name: 'Punjab National Bank',
    account_last4: '1088',
    ifsc: 'PUNB0124900',
    npci_status: 'Inactive / Unseeded',
    dbt_health_score: 55,
    avatar: '🎓',
    annual_income: '₹75,000',
    dbt_benefit_total: 25000,
    active_schemes_count: 2,
    eligible_schemes_count: 9,
    pending_action: 'Aadhaar-NPCI Seeding Required at Bank',
    is_admin: false
  },
  {
    id: 'persona-senior',
    name: 'Kamla Devi',
    email: 'pensioner@jansetu.in',
    role: 'Senior Citizen',
    occupation: 'Homemaker / Pensioner',
    state: 'Rajasthan',
    category: 'SC',
    aadhaar_seeded: true,
    bank_name: 'Bank of Baroda',
    account_last4: '8832',
    ifsc: 'BARB0ALWARX',
    npci_status: 'Active (Life Cert Due)',
    dbt_health_score: 72,
    avatar: '👵',
    annual_income: '₹40,000',
    dbt_benefit_total: 28000,
    active_schemes_count: 3,
    eligible_schemes_count: 7,
    pending_action: 'Jeevan Pramaan Digital Certificate Due',
    is_admin: false
  },
  {
    id: 'persona-entrepreneur',
    name: 'Sunita Devi',
    email: 'artisan@jansetu.in',
    role: 'Self-Employed / SHG Member',
    occupation: 'Small Business Owner',
    state: 'Bihar',
    category: 'OBC',
    aadhaar_seeded: true,
    bank_name: 'Canara Bank',
    account_last4: '6219',
    ifsc: 'CNRB0002194',
    npci_status: 'Active & Verified',
    dbt_health_score: 95,
    avatar: '💼',
    annual_income: '₹1,80,000',
    dbt_benefit_total: 55000,
    active_schemes_count: 3,
    eligible_schemes_count: 12,
    pending_action: 'PM SVANidhi 2nd Tranche Eligible',
    is_admin: false
  }
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('jansetu_user');
      if (saved) return JSON.parse(saved);
      // Fallback: Start with default demo user so app is immediately usable, but allow clear logout
      return DEMO_PERSONAS[0];
    } catch (e) {
      return DEMO_PERSONAS[0];
    }
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

  const login = async (email, password, personaData = null) => {
    setLoading(true);
    try {
      if (personaData) {
        setUser(personaData);
        const t = 'demo-token-' + personaData.id;
        setToken(t);
        localStorage.setItem('jansetu_token', t);
        return { user: personaData, access_token: t };
      }

      // Check matched persona by email first for demo convenience
      const matchedPersona = DEMO_PERSONAS.find(p => p.email.toLowerCase() === (email || '').toLowerCase());

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (res.ok && data.user) {
          const combinedUser = matchedPersona ? { ...matchedPersona, ...data.user } : data.user;
          setUser(combinedUser);
          setToken(data.access_token);
          localStorage.setItem('jansetu_token', data.access_token);
          return { user: combinedUser, access_token: data.access_token };
        }
      } catch (e) {
        // network or offline fallback
      }

      // Fallback demo user
      const fallbackUser = matchedPersona || {
        ...DEMO_PERSONAS[0],
        email: email || DEMO_PERSONAS[0].email,
        name: email ? email.split('@')[0].toUpperCase() : DEMO_PERSONAS[0].name
      };
      setUser(fallbackUser);
      setToken('demo-token');
      localStorage.setItem('jansetu_token', 'demo-token');
      return { user: fallbackUser, access_token: 'demo-token' };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    setLoading(true);
    try {
      let createdUser = null;
      try {
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        });
        const data = await res.json();
        if (res.ok && data.user) {
          createdUser = data.user;
        }
      } catch (e) {
        // offline fallback
      }

      if (!createdUser) {
        createdUser = {
          ...DEMO_PERSONAS[0],
          ...userData,
          id: 'user-' + Date.now(),
          dbt_health_score: 90,
          npci_status: 'Active & Verified',
          avatar: '👤'
        };
      }

      setUser(createdUser);
      setToken('demo-token');
      localStorage.setItem('jansetu_token', 'demo-token');
      return { user: createdUser };
    } finally {
      setLoading(false);
    }
  };

  const switchPersona = (persona) => {
    setUser(persona);
    const t = 'demo-token-' + persona.id;
    setToken(t);
    localStorage.setItem('jansetu_token', t);
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
    <AuthContext.Provider value={{ user, token, loading, login, signup, switchPersona, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
