import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import LanguageSwitcher from './LanguageSwitcher';
import {
  Compass,
  AlertCircle,
  MessageSquare,
  ShieldCheck,
  User,
  LogOut,
  Menu,
  X,
  Layers,
  Banknote
} from 'lucide-react';

function Navbar() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: '/', label: t('navHome'), icon: Compass },
    { to: '/schemes', label: t('navSchemes'), icon: Layers },
    { to: '/dbt', label: t('navDbt'), icon: AlertCircle, highlight: true },
    { to: '/loans', label: t('navLoans'), icon: Banknote },
    { to: '/chat', label: t('navChat'), icon: MessageSquare },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-taupe-50/95 backdrop-blur-md border-b border-taupe-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-taupe-850 to-taupe-950 flex items-center justify-center text-taupe-200 shadow-md group-hover:scale-105 transition-transform">
              <span className="font-extrabold text-xl tracking-tight">JS</span>
            </div>
            <div>
              <span className="font-bold text-xl text-taupe-950 tracking-tight block">
                {t('appName')}
              </span>
              <span className="text-[10px] text-taupe-600 block -mt-1 font-medium">
                Team Bit Warriors
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? 'bg-taupe-200 text-taupe-950 font-semibold shadow-inner'
                      : link.highlight
                      ? 'text-taupe-900 bg-taupe-100 hover:bg-taupe-200'
                      : 'text-taupe-700 hover:text-taupe-950 hover:bg-taupe-100'
                  }`}
                >
                  <Icon size={16} className={link.highlight ? 'text-amber-800' : ''} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action: Language + Auth */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher />

            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-taupe-300">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-taupe-200 hover:bg-taupe-300 text-taupe-950 transition-colors"
                >
                  <User size={14} />
                  <span>{user.name ? user.name.split(' ')[0] : 'Citizen'}</span>
                </Link>
                <button
                  onClick={logout}
                  title={t('logout')}
                  className="p-1.5 rounded-lg text-taupe-600 hover:text-taupe-950 hover:bg-taupe-200 transition-colors"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-semibold text-taupe-800 hover:text-taupe-950"
                >
                  {t('login')}
                </Link>
                <Link
                  to="/signup"
                  className="px-3.5 py-1.5 text-xs font-semibold bg-taupe-850 hover:bg-taupe-950 text-taupe-50 rounded-lg shadow-sm transition-colors"
                >
                  {t('signup')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <LanguageSwitcher />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-taupe-700 hover:text-taupe-950"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-taupe-200 bg-taupe-50 px-4 pt-2 pb-4 space-y-1 shadow-lg">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-taupe-800 hover:bg-taupe-200"
            >
              <link.icon size={16} />
              <span>{link.label}</span>
            </Link>
          ))}
          <div className="pt-2 border-t border-taupe-200">
            {user ? (
              <div className="flex items-center justify-between px-3 py-2">
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-semibold text-taupe-900"
                >
                  {t('navDashboard')} ({user.name})
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs text-red-700 font-semibold"
                >
                  {t('logout')}
                </button>
              </div>
            ) : (
              <div className="flex gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 text-xs font-semibold border border-taupe-400 rounded-lg"
                >
                  {t('login')}
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 text-xs font-semibold bg-taupe-850 text-white rounded-lg"
                >
                  {t('signup')}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
