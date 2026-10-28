import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Database,
  Cpu,
  Layers,
  Users,
  CheckCircle,
  Plus,
  Trash2,
  AlertCircle
} from 'lucide-react';

function AdminDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [stats, setStats] = useState({
    total_schemes: 25,
    active_dbt_rules: 15,
    registered_citizens: 148,
    resolved_dbt_cases: 532,
    database_status: 'Connected (Demo Mode / Seed Data Active)',
    ai_status: 'Grounded RAG Knowledge Engine'
  });
  const [newScheme, setNewScheme] = useState({
    name: '',
    name_hi: '',
    category: 'Education',
    benefits: '',
    eligibility_criteria: '',
    official_url: ''
  });
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('jansetu_token');
      const res = await fetch('/api/admin/stats', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.warn(e);
    }
  };

  const handleAddScheme = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('jansetu_token');
      const res = await fetch('/api/admin/schemes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newScheme)
      });
      if (res.ok) {
        setSuccessMsg('New verified scheme added successfully!');
        setNewScheme({
          name: '',
          name_hi: '',
          category: 'Education',
          benefits: '',
          eligibility_criteria: '',
          official_url: ''
        });
        setTimeout(() => setSuccessMsg(''), 3000);
        fetchStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16 px-4 sm:px-6">
      {/* Admin Header */}
      <div className="flex items-center justify-between bg-white border border-taupe-300 rounded-2xl p-6 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-taupe-200 text-taupe-950 text-xs font-semibold mb-2">
            <ShieldCheck size={14} />
            <span>Admin Console & Verification Desk</span>
          </div>
          <h1 className="text-2xl font-extrabold text-taupe-950">
            System Administration & Audit Logs
          </h1>
          <p className="text-xs text-taupe-600 mt-0.5">
            Manage verified scheme registries, DBT inference rules, and platform configuration
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-taupe-200 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-taupe-500 mb-2">
            <span className="text-xs font-semibold">Total Schemes</span>
            <Layers size={18} />
          </div>
          <div className="text-2xl font-extrabold text-taupe-950">{stats.total_schemes}</div>
          <span className="text-[10px] text-emerald-700 font-semibold">100% Officially Verified</span>
        </div>

        <div className="p-5 bg-white border border-taupe-200 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-taupe-500 mb-2">
            <span className="text-xs font-semibold">DBT Diagnostic Rules</span>
            <AlertCircle size={18} />
          </div>
          <div className="text-2xl font-extrabold text-taupe-950">{stats.active_dbt_rules}</div>
          <span className="text-[10px] text-taupe-600">Active Rule Mappings</span>
        </div>

        <div className="p-5 bg-white border border-taupe-200 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-taupe-500 mb-2">
            <span className="text-xs font-semibold">Database Mode</span>
            <Database size={18} />
          </div>
          <div className="text-sm font-bold text-taupe-950 truncate mt-1">
            {stats.database_status?.includes('Supabase') ? 'Supabase Live' : 'Demo Local Engine'}
          </div>
          <span className="text-[10px] text-taupe-500">PostgreSQL Schema Ready</span>
        </div>

        <div className="p-5 bg-white border border-taupe-200 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-taupe-500 mb-2">
            <span className="text-xs font-semibold">AI Assistant Engine</span>
            <Cpu size={18} />
          </div>
          <div className="text-sm font-bold text-taupe-950 truncate mt-1">
            Grounded RAG Engine
          </div>
          <span className="text-[10px] text-taupe-500">Groq/OpenAI Ready</span>
        </div>
      </div>

      {/* Add New Scheme Admin Form */}
      <div className="bg-white border border-taupe-300 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-2">
          <Plus size={18} className="text-taupe-850" />
          <h2 className="text-lg font-bold text-taupe-950">
            Publish New Verified Government Scheme
          </h2>
        </div>

        <form onSubmit={handleAddScheme} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-taupe-800 mb-1">
                Scheme Name (English)
              </label>
              <input
                type="text"
                required
                value={newScheme.name}
                onChange={(e) => setNewScheme({ ...newScheme, name: e.target.value })}
                placeholder="e.g. National Apprenticeship Promotion Scheme"
                className="w-full px-4 py-2.5 bg-taupe-50 rounded-xl border border-taupe-300 text-xs text-taupe-900 focus:outline-none focus:ring-2 focus:ring-taupe-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-taupe-800 mb-1">
                Scheme Name (Hindi)
              </label>
              <input
                type="text"
                value={newScheme.name_hi}
                onChange={(e) => setNewScheme({ ...newScheme, name_hi: e.target.value })}
                placeholder="उदा. राष्ट्रीय शिक्षुता प्रोत्साहन योजना"
                className="w-full px-4 py-2.5 bg-taupe-50 rounded-xl border border-taupe-300 text-xs text-taupe-900 focus:outline-none focus:ring-2 focus:ring-taupe-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-taupe-800 mb-1">
                Category
              </label>
              <select
                value={newScheme.category}
                onChange={(e) => setNewScheme({ ...newScheme, category: e.target.value })}
                className="w-full px-4 py-2.5 bg-taupe-50 rounded-xl border border-taupe-300 text-xs text-taupe-900 focus:outline-none focus:ring-2 focus:ring-taupe-700"
              >
                <option value="Education">Education</option>
                <option value="Agriculture">Agriculture</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Housing">Housing</option>
                <option value="Pension">Pension</option>
                <option value="Financial Assistance">Financial Assistance</option>
                <option value="Employment">Employment</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-taupe-800 mb-1">
                Official Application Portal URL
              </label>
              <input
                type="url"
                required
                value={newScheme.official_url}
                onChange={(e) => setNewScheme({ ...newScheme, official_url: e.target.value })}
                placeholder="https://official.gov.in"
                className="w-full px-4 py-2.5 bg-taupe-50 rounded-xl border border-taupe-300 text-xs text-taupe-900 focus:outline-none focus:ring-2 focus:ring-taupe-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-taupe-800 mb-1">
              Benefits Summary
            </label>
            <input
              type="text"
              required
              value={newScheme.benefits}
              onChange={(e) => setNewScheme({ ...newScheme, benefits: e.target.value })}
              placeholder="e.g. Rs 1,500 monthly stipend subsidy credited directly via DBT."
              className="w-full px-4 py-2.5 bg-taupe-50 rounded-xl border border-taupe-300 text-xs text-taupe-900 focus:outline-none focus:ring-2 focus:ring-taupe-700"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-taupe-800 mb-1">
              Eligibility Criteria
            </label>
            <textarea
              rows={2}
              required
              value={newScheme.eligibility_criteria}
              onChange={(e) => setNewScheme({ ...newScheme, eligibility_criteria: e.target.value })}
              placeholder="e.g. Trainees enrolled in recognized ITI / vocational apprenticeships aged 16 to 25."
              className="w-full px-4 py-2.5 bg-taupe-50 rounded-xl border border-taupe-300 text-xs text-taupe-900 focus:outline-none focus:ring-2 focus:ring-taupe-700"
            />
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 bg-taupe-850 hover:bg-taupe-950 text-taupe-50 text-xs font-bold rounded-xl transition-all shadow-sm"
          >
            Publish Scheme to Registry
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminDashboard;
