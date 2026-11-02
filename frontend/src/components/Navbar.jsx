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
  Banknote,
  LayoutDashboard,
  Sparkles,
  ChevronDown,
  ArrowRight
} from 'lucide-react';

function Navbar() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: '/schemes', label: t('navSchemes'), icon: Layers },
    { to: '/dbt', label: t('navDbt'), icon: AlertCircle, badge: 'Main' },
    { to: '/loans', label: t('navLoans'), icon: Banknote },
    { to: '/chat', label: t('navChat'), icon: MessageSquare },
  ];

  if (user) {
    navLinks.push({
      to: '/dashboard',
      label: t('navDashboard') || 'Dashboard',
      icon: LayoutDashboard,
      isDashboard: true
    });
  }

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* 1. Spacious Brand Logo */}
          <Link to="/" className="flex items-center gap-3.5 group shrink-0">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-900 via-indigo-900 to-blue-700 flex items-center justify-center text-white shadow-md group-hover:shadow-blue-900/20 group-hover:scale-105 transition-all">
              <span className="font-black text-xl tracking-tighter">JS</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-2xl text-slate-950 tracking-tight">
                  JanSetu
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-200/70 px-2 py-0.5 rounded-md">
                  जनसेतु
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Direct Citizen Welfare Bridge
              </p>
            </div>
          </Link>

          {/* 2. Uncluttered, Elegant Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    active
                      ? 'bg-slate-900 text-white shadow-sm'
                      : link.isDashboard
                      ? 'bg-blue-50/80 text-blue-950 border border-blue-200 hover:bg-blue-100'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                  }`}
                >
                  <Icon
                    size={16}
                    className={
                      active
                        ? 'text-white'
                        : link.badge
                        ? 'text-amber-600'
                        : 'text-slate-500'
                    }
                  />
                  <span>{link.label}</span>
                  {link.badge && !active && (
                    <span className="text-[9px] font-extrabold uppercase tracking-wide bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                      {link.badge}
                    </span>
                  )}
                  {link.isDashboard && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* 3. Spacious Right Actions (Language + User Profile / Login) */}
          <div className="hidden lg:flex items-center gap-4 shrink-0">
            <LanguageSwitcher />

            <div className="h-6 w-px bg-slate-200" />

            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/90 text-slate-900 transition-all shadow-2xs group"
                >
                  <span className="text-lg leading-none">{user.avatar || '👤'}</span>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold leading-tight group-hover:text-blue-900 transition-colors">
                      {user.name ? user.name.split(' ')[0] : 'Citizen'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold leading-none">
                      {user.role ? user.role.split(' ')[0] : 'Beneficiary'}
                    </span>
                  </div>
                </Link>

                <button
                  onClick={logout}
                  title={t('logout')}
                  className="p-2.5 rounded-xl text-slate-500 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all"
                >
                  <LogOut size={17} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  {t('login')}
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 text-xs font-bold bg-blue-900 hover:bg-blue-950 text-white rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-1.5"
                >
                  <span>{t('signup')}</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger & Quick Language Toggle */}
          <div className="flex lg:hidden items-center gap-2.5">
            <LanguageSwitcher />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-slate-100 border border-slate-200 transition-colors"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-5 pt-3 pb-6 space-y-2 shadow-xl animate-in slide-in-from-top-2">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
                isActive(link.to)
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-800 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <link.icon size={18} />
                <span>{link.label}</span>
              </div>
              {link.badge && (
                <span className="text-[10px] uppercase font-extrabold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                  {link.badge}
                </span>
              )}
            </Link>
          ))}

          <div className="pt-3 border-t border-slate-200">
            {user ? (
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 text-xs font-bold text-slate-900"
                >
                  <span className="text-xl">{user.avatar || '👤'}</span>
                  <div>
                    <div className="text-sm font-extrabold">{user.name}</div>
                    <div className="text-slate-500 font-normal">Go to Dashboard</div>
                  </div>
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs text-red-700 font-bold px-3 py-1.5 rounded-lg hover:bg-red-50 border border-red-200"
                >
                  {t('logout')}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 text-xs font-bold border border-slate-300 rounded-xl text-slate-800"
                >
                  {t('login')}
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 text-xs font-bold bg-blue-900 text-white rounded-xl shadow-sm"
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
