import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { UserPlus, User, Mail, Lock, Briefcase, MapPin, AlertCircle } from 'lucide-react';

function Signup() {
  const { t, i18n } = useTranslation();
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    occupation: 'Farmer',
    state: 'Uttar Pradesh',
    category: 'General'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const states = [
    'Uttar Pradesh', 'Madhya Pradesh', 'Bihar', 'Rajasthan', 'Maharashtra',
    'Gujarat', 'Punjab', 'Haryana', 'West Bengal', 'Karnataka', 'Tamil Nadu', 'Delhi'
  ];

  const occupations = [
    'Farmer', 'Student', 'Artisan / Craftsperson', 'Daily Wage Worker',
    'Street Vendor', 'Small Business Owner', 'Homemaker / Pensioner', 'Unemployed Youth'
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signup(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto my-12 px-4">
      <div className="bg-white border border-taupe-300 rounded-2xl p-8 shadow-sm">
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto rounded-xl bg-taupe-850 text-taupe-50 flex items-center justify-center mb-3">
            <UserPlus size={22} />
          </div>
          <h2 className="text-2xl font-bold text-taupe-950">{t('signup')}</h2>
          <p className="text-xs text-taupe-600 mt-1">
            Create your citizen profile to unlock eligibility matching and DBT tracking
          </p>
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
              Full Name
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-3 text-taupe-400" />
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Rameshwar Patel"
                className="w-full pl-10 pr-4 py-2.5 bg-taupe-50 rounded-xl border border-taupe-300 text-sm text-taupe-900 focus:outline-none focus:ring-2 focus:ring-taupe-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-taupe-800 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-3 text-taupe-400" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
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
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-taupe-50 rounded-xl border border-taupe-300 text-sm text-taupe-900 focus:outline-none focus:ring-2 focus:ring-taupe-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-taupe-800 mb-1">
                Occupation
              </label>
              <div className="relative">
                <Briefcase size={16} className="absolute left-3.5 top-3 text-taupe-400 pointer-events-none" />
                <select
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-taupe-50 rounded-xl border border-taupe-300 text-xs text-taupe-900 focus:outline-none focus:ring-2 focus:ring-taupe-700"
                >
                  {occupations.map(occ => (
                    <option key={occ} value={occ}>{occ}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-taupe-800 mb-1">
                State / UT
              </label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3.5 top-3 text-taupe-400 pointer-events-none" />
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-taupe-50 rounded-xl border border-taupe-300 text-xs text-taupe-900 focus:outline-none focus:ring-2 focus:ring-taupe-700"
                >
                  {states.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-taupe-850 hover:bg-taupe-950 text-taupe-50 font-bold rounded-xl text-sm transition-all shadow-md disabled:opacity-50 mt-2"
          >
            {loading ? 'Creating Profile...' : t('signup')}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-taupe-600">
          Already registered?{' '}
          <Link to="/login" className="text-taupe-950 font-bold hover:underline">
            {t('login')}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Signup;
