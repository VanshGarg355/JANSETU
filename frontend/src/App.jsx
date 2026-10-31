import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import LanguageSwitcher from './components/LanguageSwitcher';
import { Menu, ShieldCheck, User } from 'lucide-react';

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
import DocumentsPage from './pages/DocumentsPage';

// Protected Route Wrapper
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="p-8 text-center text-xs text-taupe-500">Checking credentials...</div>;
  }
  return user ? children : <Navigate to="/login" replace />;
}

function AppContent() {
  const { user } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // When logged in: Render Left Sidebar Layout (NO upper navbar!)
  if (user) {
    return (
      <div className="min-h-screen flex bg-[#F5F4EF] text-[#0F0F0E]">
        {/* Left Side Navigation Bar (Exactly matching user specification & screenshot) */}
        <Sidebar mobileOpen={mobileSidebarOpen} setMobileOpen={setMobileSidebarOpen} />

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
          {/* Top Bar with Mobile Menu Toggle & Citizen Profile Info */}
          <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 sm:px-6 py-3 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 border border-slate-200"
                title="Toggle Sidebar"
              >
                <Menu size={20} />
              </button>

              <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-600">
                <span className="font-extrabold text-slate-900">JanSetu Portal</span>
                <span>•</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <ShieldCheck size={14} /> Aadhaar Verified
                </span>
              </div>
            </div>

            {/* Language Switcher & Active Persona Pill */}
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              
              <div className="flex items-center gap-2 pl-3 border-l border-slate-200 text-xs">
                <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                  {user.avatar || (user.name ? user.name.charAt(0) : 'U')}
                </div>
                <div className="hidden md:block">
                  <span className="font-extrabold text-slate-900 block leading-tight">{user.name}</span>
                  <span className="text-[10px] text-slate-500 font-medium block">{user.role || user.occupation}</span>
                </div>
              </div>
            </div>
          </header>

          {/* Page View */}
          <main className="flex-1 p-3 sm:p-5 lg:p-7">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/login" element={<Navigate to="/dashboard" replace />} />
              <Route path="/signup" element={<Navigate to="/dashboard" replace />} />
              <Route path="/schemes" element={<SchemeFinder />} />
              <Route path="/schemes/:id" element={<SchemeDetail />} />
              <Route path="/dbt" element={<DBTDetective />} />
              <Route path="/documents" element={<PrivateRoute><DocumentsPage /></PrivateRoute>} />
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
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    );
  }

  // When logged out: Regular layout with upper Navbar & Footer
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F4EF] text-[#0F0F0E]">
      <Navbar />

      <main className="flex-1 pt-6">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/schemes" element={<SchemeFinder />} />
          <Route path="/schemes/:id" element={<SchemeDetail />} />
          <Route path="/dbt" element={<DBTDetective />} />
          <Route path="/documents" element={<PrivateRoute><DocumentsPage /></PrivateRoute>} />
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
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
