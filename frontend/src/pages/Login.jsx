import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { LogIn, Lock, Mail, AlertCircle, Sparkles } from 'lucide-react';

function Login() {
  const { t, i18n } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('citizen@jansetu.in');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

  const fillDemoAccount = () => {
    setEmail('citizen@jansetu.in');
    setPassword('password123');
  };

  return (
    <div className="max-w-md mx-auto my-12 px-4">
      <div className="bg-white border border-taupe-300 rounded-2xl p-8 shadow-sm">
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto rounded-xl bg-taupe-850 text-taupe-50 flex items-center justify-center mb-3">
            <LogIn size={22} />
          </div>
          <h2 className="text-2xl font-bold text-taupe-950">{t('login')}</h2>
          <p className="text-xs text-taupe-600 mt-1">
            Access your personalized schemes, DBT diagnostic history, and profile
          </p>
        </div>

        {/* Demo Fast Login Helper */}
        <div className="bg-taupe-100/90 border border-taupe-300 rounded-xl p-3 mb-6 text-xs flex items-center justify-between">
          <div>
            <div className="font-semibold text-taupe-950 flex items-center gap-1">
              <Sparkles size={12} className="text-taupe-700" /> Demo Credentials:
            </div>
            <div className="text-taupe-600">citizen@jansetu.in • Any password</div>
          </div>
          <button
            type="button"
            onClick={fillDemoAccount}
            className="px-2.5 py-1 bg-taupe-200 hover:bg-taupe-300 text-taupe-950 font-bold text-[11px] rounded-lg transition-colors"
          >
            Auto-fill
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
            <AlertCircle size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-taupe-800 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-3 text-taupe-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="citizen@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-taupe-50 rounded-xl border border-taupe-300 text-sm text-taupe-900 focus:outline-none focus:ring-2 focus:ring-taupe-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-taupe-800 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-3 text-taupe-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-taupe-50 rounded-xl border border-taupe-300 text-sm text-taupe-900 focus:outline-none focus:ring-2 focus:ring-taupe-700"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-taupe-850 hover:bg-taupe-950 text-taupe-50 font-bold rounded-xl text-sm transition-all shadow-md disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : t('login')}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-taupe-600">
          Don't have an account?{' '}
          <Link to="/signup" className="text-taupe-950 font-bold hover:underline">
            {t('signup')}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
