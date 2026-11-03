import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth, DEMO_PERSONAS } from '../context/AuthContext';
import {
  LogIn,
  Lock,
  Mail,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Eye,
  EyeOff,
  Smartphone,
  CheckCircle2,
  ArrowRight,
  Fingerprint,
  UserCheck,
  ExternalLink
} from 'lucide-react';

function Login() {
  const { t, i18n } = useTranslation();
  const { user, login, switchPersona, logout } = useAuth();
  const navigate = useNavigate();

  const [authMode, setAuthMode] = useState('credentials'); // 'credentials' | 'otp'
  const [email, setEmail] = useState('citizen@jansetu.in');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [mobileNumber, setMobileNumber] = useState('9876543210');
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activePersonaLoading, setActivePersonaLoading] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = () => {
    if (!mobileNumber || mobileNumber.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setError('');
    setOtpSent(true);
    setOtpValue('748291'); // Simulated secure OTP for demo
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otpValue !== '748291' && otpValue.length < 6) {
      setError('Please enter the 6-digit OTP sent to your phone.');
      return;
    }
    setLoading(true);
    try {
      await login('citizen@jansetu.in', 'password123', DEMO_PERSONAS[0]);
      navigate('/dashboard');
    } catch (err) {
      setError('OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPersonaSelect = async (persona) => {
    setActivePersonaLoading(persona.id);
    setError('');
    try {
      switchPersona(persona);
      setTimeout(() => {
        navigate('/dashboard');
      }, 400);
    } catch (err) {
      setError('Failed to switch persona');
      setActivePersonaLoading(null);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      {/* Already Logged In Notice */}
      {user && (
        <div className="max-w-xl mx-auto w-full mb-6 bg-emerald-50 border border-emerald-300 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg">
              {user.avatar || '✓'}
            </div>
            <div>
              <p className="text-xs text-emerald-800 font-semibold uppercase tracking-wider">
                Currently Logged In
              </p>
              <h4 className="text-sm font-bold text-emerald-950">
                {user.name} ({user.role || user.occupation})
              </h4>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
            >
              <span>Go to Dashboard</span>
              <ArrowRight size={14} />
            </button>
            <button
              onClick={logout}
              className="px-3 py-2 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-semibold text-xs rounded-xl transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Column: Civic Context & 1-Click Fast Pass for Evaluators */}
        <div className="lg:col-span-5 bg-gradient-to-br from-taupe-850 to-taupe-950 text-taupe-100 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl border border-taupe-700 relative overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-taupe-700/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-amber-600/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-taupe-700/50 border border-taupe-600/60 text-taupe-200 text-[11px] font-semibold mb-4">
              <ShieldCheck size={13} className="text-emerald-400" />
              <span>Digital India Welfare Gateway</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-taupe-50 tracking-tight leading-snug">
              JanSetu <span className="text-taupe-300 font-normal">जनसेतु</span>
            </h1>
            <p className="text-xs text-taupe-300 mt-2 leading-relaxed">
              Unified citizen access for verified DBT subsidies, PFMS bank diagnostics, and welfare entitlement.
            </p>

            {/* Quick Evaluator Access Section */}
            <div className="mt-6 pt-6 border-t border-taupe-700/80">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-taupe-200 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-400" />
                  1-Click Hackathon Personas
                </span>
                <span className="text-[10px] text-taupe-400 font-medium">Instant Test</span>
              </div>
              <p className="text-[11px] text-taupe-300 mb-3">
                Select a persona to test the dashboard with realistic DBT and scheme data:
              </p>

              <div className="space-y-2.5">
                {DEMO_PERSONAS.map((p) => {
                  const isCurrent = user?.id === p.id;
                  const isLoading = activePersonaLoading === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => handleQuickPersonaSelect(p)}
                      disabled={isLoading}
                      className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between group ${
                        isCurrent
                          ? 'bg-taupe-700/90 border-taupe-400 text-white shadow-md'
                          : 'bg-taupe-800/60 hover:bg-taupe-800 border-taupe-700/70 text-taupe-200 hover:border-taupe-500'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl shrink-0 p-1 bg-taupe-700/40 rounded-xl">
                          {p.avatar}
                        </span>
                        <div>
                          <div className="text-xs font-bold text-taupe-100 group-hover:text-white flex items-center gap-1.5">
                            <span>{p.name}</span>
                            <span className="text-[10px] font-normal text-taupe-400">
                              ({p.role})
                            </span>
                          </div>
                          <div className="text-[10px] text-taupe-300">
                            {p.state} • {p.pending_action || 'DBT Active'}
                          </div>
                        </div>
                      </div>
                      <div className="shrink-0 pl-2">
                        {isLoading ? (
                          <span className="text-[11px] font-bold text-amber-300 animate-pulse">
                            Loading...
                          </span>
                        ) : isCurrent ? (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                            Active
                          </span>
                        ) : (
                          <ArrowRight size={14} className="text-taupe-400 group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-6 pt-4 border-t border-taupe-700/60 flex items-center justify-between text-[11px] text-taupe-400">
            <span>🔒 Aadhaar-Bank Zero Data Risk</span>
            <span>Digital India Civic Portal</span>
          </div>
        </div>

        {/* Right Column: Interactive Login Card */}
        <div className="lg:col-span-7 bg-white border border-taupe-300 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between">
          <div>
            {/* Header and Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-taupe-200 gap-3">
              <div>
                <h2 className="text-2xl font-bold text-taupe-950">Citizen Login</h2>
                <p className="text-xs text-taupe-600 mt-0.5">
                  Sign in to view your tailored welfare schemes & DBT health
                </p>
              </div>

              {/* Tab Selector */}
              <div className="flex p-1 bg-taupe-100 rounded-xl border border-taupe-200 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => { setAuthMode('credentials'); setError(''); }}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                    authMode === 'credentials'
                      ? 'bg-white text-taupe-950 shadow-sm'
                      : 'text-taupe-600 hover:text-taupe-950'
                  }`}
                >
                  <Mail size={13} />
                  <span>Password</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode('otp'); setError(''); }}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                    authMode === 'otp'
                      ? 'bg-white text-taupe-950 shadow-sm'
                      : 'text-taupe-600 hover:text-taupe-950'
                  }`}
                >
                  <Smartphone size={13} />
                  <span>Mobile OTP</span>
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Mode 1: Credentials Form */}
            {authMode === 'credentials' && (
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-taupe-850">
                      Email or Citizen Username
                    </label>
                    <span className="text-[10px] text-taupe-500">Demo: citizen@jansetu.in</span>
                  </div>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-3.5 text-taupe-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="citizen@jansetu.in"
                      className="w-full pl-10 pr-4 py-2.5 bg-taupe-50 rounded-xl border border-taupe-300 text-sm text-taupe-900 focus:outline-none focus:ring-2 focus:ring-taupe-800 transition-all font-medium"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-taupe-850">
                      Password
                    </label>
                    <span className="text-[10px] text-taupe-500">Demo: password123</span>
                  </div>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-3.5 text-taupe-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-taupe-50 rounded-xl border border-taupe-300 text-sm text-taupe-900 focus:outline-none focus:ring-2 focus:ring-taupe-800 transition-all font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-taupe-400 hover:text-taupe-700 p-0.5"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-taupe-700 select-none">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded border-taupe-300 text-taupe-850 focus:ring-taupe-700"
                    />
                    <span>Remember my citizen profile</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('citizen@jansetu.in');
                      setPassword('password123');
                    }}
                    className="text-taupe-850 font-bold hover:underline"
                  >
                    Reset to Demo
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 bg-taupe-850 hover:bg-taupe-950 text-taupe-50 font-bold rounded-xl text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span>Verifying Citizen Credentials...</span>
                  ) : (
                    <>
                      <LogIn size={16} />
                      <span>Sign In & Open Dashboard</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Mode 2: Simulated Mobile / Aadhaar OTP Form */}
            {authMode === 'otp' && (
              <form onSubmit={handleVerifyOtp} className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-taupe-850 mb-1.5">
                    Aadhaar-Linked Mobile Number
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3.5 top-2.5 text-xs font-bold text-taupe-500">
                        +91
                      </span>
                      <input
                        type="tel"
                        maxLength={10}
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                        placeholder="9876543210"
                        className="w-full pl-12 pr-4 py-2.5 bg-taupe-50 rounded-xl border border-taupe-300 text-sm text-taupe-900 focus:outline-none focus:ring-2 focus:ring-taupe-800 font-medium"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="px-4 py-2.5 bg-taupe-200 hover:bg-taupe-300 text-taupe-950 font-bold text-xs rounded-xl transition-colors border border-taupe-300 shrink-0"
                    >
                      {otpSent ? 'Resend OTP' : 'Send OTP'}
                    </button>
                  </div>
                </div>

                {otpSent && (
                  <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between text-xs text-amber-900">
                      <span className="font-semibold flex items-center gap-1.5">
                        <CheckCircle2 size={14} className="text-emerald-600" />
                        OTP sent to +91 {mobileNumber}
                      </span>
                      <span className="text-[11px] font-mono bg-white px-2 py-0.5 rounded border border-amber-200 font-bold">
                        Demo OTP: 748291
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-taupe-850 mb-1">
                        Enter 6-Digit Verification Code
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        value={otpValue}
                        onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ''))}
                        placeholder="748291"
                        className="w-full py-2 px-4 text-center text-lg tracking-widest font-mono bg-white rounded-xl border border-taupe-300 text-taupe-950 focus:ring-2 focus:ring-taupe-800 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !otpSent}
                  className="w-full mt-2 py-3 bg-taupe-850 hover:bg-taupe-950 text-taupe-50 font-bold rounded-xl text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span>Verifying OTP via UIDAI Gateway...</span>
                  ) : (
                    <>
                      <Fingerprint size={16} />
                      <span>Verify OTP & Enter Dashboard</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Footer Navigation */}
          <div className="mt-8 pt-6 border-t border-taupe-200 flex flex-col sm:flex-row items-center justify-between text-xs text-taupe-600 gap-3">
            <div>
              Don't have a registered profile yet?{' '}
              <Link to="/signup" className="text-taupe-950 font-bold hover:underline">
                Register New Citizen
              </Link>
            </div>
            <Link
              to="/schemes"
              className="text-taupe-700 hover:text-taupe-950 font-semibold inline-flex items-center gap-1"
            >
              <span>Explore Public Schemes First</span>
              <ExternalLink size={12} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
