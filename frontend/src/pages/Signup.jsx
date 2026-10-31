import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { UserPlus, User, Mail, Lock, Briefcase, MapPin, AlertCircle, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

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
    <div className="min-h-[calc(100vh-140px)] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto w-full bg-white border border-taupe-300 rounded-3xl p-6 sm:p-10 shadow-sm">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-taupe-100 text-taupe-800 text-[11px] font-bold mb-3">
            <ShieldCheck size={13} className="text-emerald-600" />
            <span>Digital India Citizen Registration</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-taupe-950">
            Create Citizen Profile
          </h2>
          <p className="text-xs text-taupe-600 mt-1.5 max-w-sm mx-auto">
            Get personalized welfare scheme matching, direct DBT failure diagnostic alerts, and fast application tracking.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-taupe-850 mb-1">
              Full Legal Name (as on Aadhaar)
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-3.5 text-taupe-400" />
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Rameshwar Patel"
                className="w-full pl-10 pr-4 py-2.5 bg-taupe-50 rounded-xl border border-taupe-300 text-sm text-taupe-900 focus:outline-none focus:ring-2 focus:ring-taupe-800 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-taupe-850 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-3.5 text-taupe-400" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="citizen@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-taupe-50 rounded-xl border border-taupe-300 text-sm text-taupe-900 focus:outline-none focus:ring-2 focus:ring-taupe-800 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-taupe-850 mb-1">
              Set Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-3.5 text-taupe-400" />
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-taupe-50 rounded-xl border border-taupe-300 text-sm text-taupe-900 focus:outline-none focus:ring-2 focus:ring-taupe-800 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-taupe-850 mb-1">
                Occupation
              </label>
              <div className="relative">
                <Briefcase size={16} className="absolute left-3.5 top-3.5 text-taupe-400 pointer-events-none" />
                <select
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-taupe-50 rounded-xl border border-taupe-300 text-xs font-medium text-taupe-900 focus:outline-none focus:ring-2 focus:ring-taupe-800"
                >
                  {occupations.map(occ => (
                    <option key={occ} value={occ}>{occ}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-taupe-850 mb-1">
                State / UT
              </label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3.5 top-3.5 text-taupe-400 pointer-events-none" />
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-taupe-50 rounded-xl border border-taupe-300 text-xs font-medium text-taupe-900 focus:outline-none focus:ring-2 focus:ring-taupe-800"
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
            className="w-full py-3 bg-taupe-850 hover:bg-taupe-950 text-white font-bold rounded-xl text-sm transition-all shadow-md disabled:opacity-50 mt-3 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Creating Citizen Profile...</span>
            ) : (
              <>
                <UserPlus size={16} />
                <span>Register & Open Dashboard</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-taupe-200 text-center text-xs text-taupe-600">
          Already registered as a beneficiary?{' '}
          <Link to="/login" className="text-taupe-950 font-bold hover:underline">
            {t('login')}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Signup;
