import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import DisclaimerBanner from './components/DisclaimerBanner';

import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import SchemeFinder from './pages/SchemeFinder';
import SchemeDetail from './pages/SchemeDetail';
import DBTDetective from './pages/DBTDetective';
import AIChat from './pages/AIChat';
import LoanDiscovery from './pages/LoanDiscovery';
import AdminDashboard from './pages/AdminDashboard';

// Protected Route Wrapper
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="p-8 text-center text-xs text-taupe-500">Checking credentials...</div>;
  }
  return user ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-[#F7F5F2] text-[#2A2725]">
        <DisclaimerBanner />
        <Navbar />

        <main className="flex-1 pt-6">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/schemes" element={<SchemeFinder />} />
            <Route path="/schemes/:id" element={<SchemeDetail />} />
            <Route path="/dbt" element={<DBTDetective />} />
            <Route path="/loans" element={<LoanDiscovery />} />
            <Route path="/chat" element={<AIChat />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <PrivateRoute>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;
