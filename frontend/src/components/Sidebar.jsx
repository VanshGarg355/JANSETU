import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import {
  Home,
  LayoutList,
  AlertCircle,
  FileText,
  Banknote,
  MessageSquare,
  Bell,
  Settings,
  Mic,
  Shield,
  LogOut,
  X,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Sparkles
} from 'lucide-react';

export default function Sidebar({ mobileOpen = false, setMobileOpen = () => {} }) {
  const { i18n } = useTranslation();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isHindi = i18n.language === 'hi';

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const pathname = location.pathname;

  // Real, 1:1 mapped feature navigation items matching JanSetu platform
  const menuItems = [
    {
      id: 'home',
      label: isHindi ? 'होम' : 'Home',
      icon: Home,
      to: '/dashboard',
      active: pathname === '/dashboard'
    },
    {
      id: 'schemes',
      label: isHindi ? 'योजनाएं (Schemes)' : 'Schemes',
      icon: LayoutList,
      to: '/schemes',
      active: pathname.startsWith('/schemes')
    },
    {
      id: 'dbt',
      label: isHindi ? 'डीबीटी (DBT Detective)' : 'DBT Detective',
      icon: AlertCircle,
      to: '/dbt',
      active: pathname === '/dbt',
      badgeText: 'Live'
    },
    {
      id: 'documents',
      label: isHindi ? 'दस्तावेज़ (Documents)' : 'Documents',
      icon: FileText,
      to: '/documents',
      active: pathname === '/documents'
    },
    {
      id: 'loans',
      label: isHindi ? 'ऋण (Loans)' : 'Loans',
      icon: Banknote,
      to: '/loans',
      active: pathname === '/loans'
    },
    {
      id: 'chat',
      label: isHindi ? 'एआई सहायक (AI Sahayak)' : 'AI Sahayak',
      icon: MessageSquare,
      to: '/chat',
      active: pathname === '/chat'
    },
    {
      id: 'notifications',
      label: isHindi ? 'सूचनाएं' : 'Notifications',
      icon: Bell,
      badge: 3,
      action: () => setNotificationsOpen(true)
    },
    {
      id: 'settings',
      label: isHindi ? 'सेटिंग्स' : 'Settings',
      icon: Settings,
      action: () => setSettingsOpen(true)
    }
  ];

  const handleItemClick = (item) => {
    if (item.action) {
      item.action();
    } else if (item.to) {
      navigate(item.to);
    }
    setMobileOpen(false);
  };

  // Live alerts in notifications drawer
  const notificationsList = [
    {
      id: 1,
      title: isHindi ? 'जीवन प्रमाण पत्र नवीनीकरण आवश्यक' : 'Jeevan Pramaan Life Certificate Renewal Due',
      desc: isHindi ? 'रामप्रसाद शर्मा का वार्षिक सत्यापन 15 दिनों में पूरा करें।' : 'Action required within 15 days to keep monthly pension uninterrupted.',
      time: 'Just now',
      urgent: true
    },
    {
      id: 2,
      title: isHindi ? 'पीएम किसान 17वीं किस्त' : 'PM-KISAN 17th Installment Scheduled',
      desc: isHindi ? 'आपके स्टेट बैंक खाते में ₹2,000 की किस्त डायरेक्ट क्रेडिट होगी।' : 'Scheduled direct credit to SBI A/C ••••4921 via Aadhaar APBS.',
      time: '2 hours ago',
      urgent: false
    },
    {
      id: 3,
      title: isHindi ? 'एनएसपी छात्रवृत्ति सत्यापन' : 'NSP Scholarship College Verified',
      desc: isHindi ? 'आरव शर्मा का बोनाफाइड संस्थान द्वारा अनुमोदित।' : 'Aarav Sharma bonafide verified by Institute Dean. Forwarded to State Treasury.',
      time: '1 day ago',
      urgent: false
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 sm:w-72 bg-white border-r border-slate-200/90 flex flex-col justify-between p-4 transition-transform duration-300 ease-in-out select-none shadow-sm ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto pr-1">
          {/* 1. Brand Logo */}
          <div className="flex items-center justify-between pb-4 pt-1 px-2 border-b border-slate-100">
            <Link
              to="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2.5 group"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-900 via-indigo-900 to-blue-700 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-all">
                <span className="font-black text-lg tracking-tighter">JS</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xl text-slate-950 tracking-tight">
                    JanSetu
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-200 px-1.5 py-0.2 rounded-md">
                    जनसेतु
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium">
                  Civic Welfare Portal
                </p>
              </div>
            </Link>

            {/* Mobile Close Button */}
            <button
              onClick={() => setMobileOpen(false)}
              className="p-1.5 text-slate-400 hover:text-slate-800 lg:hidden rounded-xl"
            >
              <X size={18} />
            </button>
          </div>

          {/* 2. Navigation Menu Links (1:1 with Features & Styled like Screenshot) */}
          <nav className="space-y-1.5 mt-4 flex-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = item.active;

              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all text-left ${
                    active
                      ? 'bg-[#EEF2F9] text-[#1E3A8A] font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50/80 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <Icon
                      size={19}
                      className={active ? 'text-[#1E3A8A]' : 'text-slate-500'}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {/* Badges */}
                  {item.badge ? (
                    <span className="w-5 h-5 rounded-full bg-[#E11D48] text-white text-[11px] font-bold flex items-center justify-center shrink-0 shadow-2xs">
                      {item.badge}
                    </span>
                  ) : item.badgeText && !active ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {item.badgeText}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>

          {/* 3. Divider Line */}
          <div className="my-3 border-t border-slate-200/80" />

          {/* 4. Bottom Section: Voice Assistant & Government Portal */}
          <div className="space-y-2 pt-1 pb-2">
            {/* Voice Assistant Button (Dark navy rounded pill button matching screenshot) */}
            <button
              onClick={() => {
                navigate('/chat', { state: { autoVoice: true } });
                setMobileOpen(false);
              }}
              className="w-full py-3.5 px-4 bg-[#2D3A74] hover:bg-[#222E60] active:scale-[0.98] text-white rounded-2xl font-bold text-sm shadow-md flex items-center justify-center gap-2.5 transition-all group"
            >
              <Mic size={18} className="text-white group-hover:scale-110 transition-transform" />
              <span>{isHindi ? 'वॉइस सहायक' : 'Voice Assistant'}</span>
            </button>

            {/* Government Portal Link */}
            <a
              href="https://www.myscheme.gov.in"
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-600 hover:text-slate-900 text-xs font-semibold rounded-xl hover:bg-slate-50 transition-colors"
            >
              <Shield size={16} className="text-slate-500" />
              <span className="truncate">{isHindi ? 'सरकारी पोर्टल' : 'Government Portal'}</span>
              <ExternalLink size={11} className="ml-auto text-slate-400" />
            </a>

            {/* User Profile Summary */}
            {user && (
              <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-2 mt-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center text-sm font-bold shrink-0">
                    {user.avatar || (user.name ? user.name.charAt(0) : 'U')}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">
                      {user.name || 'Citizen'}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">
                      {user.role || user.occupation || 'Farmer'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-200/60 rounded-xl transition-colors shrink-0"
                  title="Logout"
                >
                  <LogOut size={15} />
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Notifications Drawer / Modal */}
      {notificationsOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-fade-in relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center">
                  <Bell size={16} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-950">
                    {isHindi ? 'अधिसूचनाएं (Notifications)' : 'Civic Notifications'}
                  </h3>
                  <p className="text-[11px] text-slate-500">3 Unread Alerts</p>
                </div>
              </div>

              <button
                onClick={() => setNotificationsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-800 rounded-xl"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2.5 max-h-[60vh] overflow-y-auto">
              {notificationsList.map(item => (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-2xl border text-xs space-y-1 transition-all ${
                    item.urgent
                      ? 'bg-rose-50/70 border-rose-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      {item.urgent && <AlertTriangle size={13} className="text-rose-600" />}
                      <span>{item.title}</span>
                    </span>
                    <span className="text-[10px] text-slate-400">{item.time}</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={() => setNotificationsOpen(false)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                {isHindi ? 'बंद करें' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-fade-in relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
                  <Settings size={16} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-950">
                    {isHindi ? 'नागरिक सेटिंग्स' : 'Citizen Settings'}
                  </h3>
                  <p className="text-[11px] text-slate-500">Preferences & Profile</p>
                </div>
              </div>

              <button
                onClick={() => setSettingsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-800 rounded-xl"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Citizen Profile</span>
                <div className="font-bold text-slate-900">{user?.name}</div>
                <div className="text-slate-600">{user?.email} • {user?.state}</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Bank & DBT Linkage</span>
                <div className="font-bold text-slate-900">{user?.bank_name || 'State Bank of India'}</div>
                <div className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 size={13} />
                  <span>NPCI Aadhaar Mapped & Active</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => {
                  logout();
                  setSettingsOpen(false);
                }}
                className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 rounded-xl font-bold text-xs flex items-center gap-1"
              >
                <LogOut size={13} />
                <span>Logout</span>
              </button>

              <button
                onClick={() => setSettingsOpen(false)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
