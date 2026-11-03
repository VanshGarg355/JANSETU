import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import LanguageSwitcher from './components/LanguageSwitcher';
import { Menu, ShieldCheck, User, LogIn, Lock, ArrowRight } from 'lucide-react';

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

// Protected Route Wrapper with Login Prompt & Direct Button
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isHindi = i18n.language === 'hi';

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-slate-500 text-sm">
        Checking credentials...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto my-12 sm:my-16 px-4">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto shadow-xs">
            <Lock size={32} />
          </div>

          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 text-amber-900 text-xs font-bold border border-amber-200">
              <ShieldCheck size={14} className="text-amber-700" />
              <span>{isHindi ? 'सुरक्षित नागरिक सेवा' : 'Protected Citizen Service'}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {isHindi ? 'उपयोग करने के लिए कृपया लॉगिन करें' : 'Please Login to Use This Feature'}
            </h2>

            <p className="text-sm sm:text-base text-slate-600 max-w-lg mx-auto leading-relaxed font-medium">
              {isHindi
                ? 'सरकारी योजनाएं खोजने, पात्रता व दस्तावेज जांचने, डीबीटी विफलता निवारण और ऋण सेवाओं का उपयोग करने के लिए कृपया पहले लॉगिन करें।'
                : 'To search verified welfare schemes, check eligibility, diagnose DBT payment failures, and explore loans, please login to your citizen account first.'}
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/login', { state: { from: location } })}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-blue-900 hover:bg-black text-white text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group active:scale-95"
            >
              <LogIn size={18} />
              <span>{isHindi ? 'लॉगिन करें' : 'Login Now'}</span>
              <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition-all"
            >
              <span>{isHindi ? 'होम पेज पर जाएं' : 'Back to Home'}</span>
            </button>
          </div>

          <div className="pt-4 border-t border-slate-100 text-xs text-slate-500">
            {isHindi ? 'नया खाता बनाना चाहते हैं?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => navigate('/signup')}
              className="text-blue-900 font-bold hover:underline"
            >
              {isHindi ? 'साइन अप करें' : 'Sign up'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
}

function AppContent() {
  const { user } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // When logged in: Render Left Sidebar Layout (NO upper navbar!)
  if (user) {
    return (
      <div className="min-h-screen flex bg-[#F5F4EF] text-[#0F0F0E]">
        {/* Left Side Navigation Bar (Matching user specification & screenshot) */}
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
          <Route path="/schemes" element={<PrivateRoute><SchemeFinder /></PrivateRoute>} />
          <Route path="/schemes/:id" element={<PrivateRoute><SchemeDetail /></PrivateRoute>} />
          <Route path="/dbt" element={<PrivateRoute><DBTDetective /></PrivateRoute>} />
          <Route path="/documents" element={<PrivateRoute><DocumentsPage /></PrivateRoute>} />
          <Route path="/loans" element={<PrivateRoute><LoanDiscovery /></PrivateRoute>} />
          <Route path="/chat" element={<PrivateRoute><AIChat /></PrivateRoute>} />

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
