import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Bookmark,
  AlertCircle,
  ExternalLink,
  Trash2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Clock
} from 'lucide-react';

function Dashboard() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const isHindi = i18n.language === 'hi';

  const [savedSchemes, setSavedSchemes] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch saved schemes
      const token = localStorage.getItem('jansetu_token');
      const savedRes = await fetch('/api/saved-schemes', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const savedData = await savedRes.json();
      setSavedSchemes(Array.isArray(savedData) ? savedData : []);

      // 2. Fetch recommended schemes based on user occupation
      const occ = user?.occupation || 'Farmer';
      const recRes = await fetch(`/api/schemes?occupation=${encodeURIComponent(occ)}`);
      const recData = await recRes.json();
      setRecommendations(Array.isArray(recData) ? recData.slice(0, 3) : []);
    } catch (err) {
      console.warn('Dashboard data fetch warning:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSaved = async (id) => {
    try {
      const token = localStorage.getItem('jansetu_token');
      await fetch(`/api/saved-schemes/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setSavedSchemes(savedSchemes.filter(s => s.id !== id && s.scheme_id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto px-4 sm:px-6">
      {/* Profile Overview Card */}
      <div className="bg-white border border-taupe-300 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-taupe-850 text-taupe-100 flex items-center justify-center font-extrabold text-2xl shadow-md">
            {user?.name ? user.name.charAt(0) : 'C'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-taupe-950">
                {t('welcomeUser')} {user?.name || 'Citizen'}
              </h1>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle size={10} /> Verified Citizen
              </span>
            </div>
            <p className="text-xs text-taupe-600 mt-1">
              {user?.occupation || 'Farmer'} • {user?.state || 'Uttar Pradesh'} • {user?.category || 'General'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Link
            to="/dbt"
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-taupe-850 hover:bg-taupe-950 text-taupe-50 text-xs font-bold rounded-xl transition-all shadow-sm"
          >
            <AlertCircle size={14} />
            <span>{t('dbtDetectiveBtn')}</span>
          </Link>
          <Link
            to="/schemes"
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-taupe-200 hover:bg-taupe-300 text-taupe-950 text-xs font-bold rounded-xl border border-taupe-300 transition-all"
          >
            <span>{t('findSchemesBtn')}</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Saved Schemes */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bookmark size={18} className="text-taupe-850" />
              <h2 className="text-lg font-bold text-taupe-950">
                {t('savedSchemes')} ({savedSchemes.length})
              </h2>
            </div>
            <Link to="/schemes" className="text-xs font-bold text-taupe-850 hover:underline">
              Browse More
            </Link>
          </div>

          {loading ? (
            <div className="bg-white border border-taupe-200 rounded-2xl p-8 text-center text-xs text-taupe-500">
              Loading your saved schemes...
            </div>
          ) : savedSchemes.length === 0 ? (
            <div className="bg-white border border-dashed border-taupe-300 rounded-2xl p-8 text-center space-y-3">
              <Bookmark size={32} className="mx-auto text-taupe-400" />
              <p className="text-xs text-taupe-600 max-w-sm mx-auto">
                {t('noSavedSchemes')}
              </p>
              <Link
                to="/schemes"
                className="inline-block px-4 py-2 bg-taupe-850 text-taupe-50 text-xs font-bold rounded-xl"
              >
                {t('findSchemesBtn')}
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {savedSchemes.map((item) => {
                const s = item.scheme || item;
                return (
                  <div
                    key={item.id || s.id}
                    className="bg-white border border-taupe-200 hover:border-taupe-300 rounded-2xl p-5 shadow-sm transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-taupe-100 text-taupe-800 px-2 py-0.5 rounded-md">
                        {s.category}
                      </span>
                      <h3 className="text-sm font-bold text-taupe-950 mt-1.5">
                        {isHindi && s.name_hi ? s.name_hi : s.name}
                      </h3>
                      <p className="text-xs text-taupe-600 line-clamp-1 mt-0.5">
                        {isHindi && s.benefits_hi ? s.benefits_hi : s.benefits}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        to={`/schemes/${s.id}`}
                        className="px-3 py-1.5 bg-taupe-100 hover:bg-taupe-200 text-taupe-950 text-xs font-bold rounded-lg transition-colors"
                      >
                        {t('viewDetails')}
                      </Link>
                      {s.official_url && (
                        <a
                          href={s.official_url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-taupe-850 hover:bg-taupe-950 text-taupe-50 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                        >
                          <span>{t('applyNow')}</span>
                          <ExternalLink size={11} />
                        </a>
                      )}
                      <button
                        onClick={() => handleRemoveSaved(item.id || s.id)}
                        className="p-1.5 text-taupe-400 hover:text-red-700 transition-colors"
                        title="Remove"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Col: Recommendations & DBT Fast Action */}
        <div className="space-y-6">
          {/* Recommended schemes */}
          <div className="bg-white border border-taupe-300 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={16} className="text-taupe-850" />
              <h2 className="text-sm font-bold text-taupe-950 uppercase tracking-wide">
                Tailored for You
              </h2>
            </div>
            <p className="text-xs text-taupe-600 mb-4">
              Based on your profile as a <strong>{user?.occupation || 'Farmer'}</strong>:
            </p>

            <div className="space-y-3">
              {recommendations.map((rec) => (
                <div key={rec.id} className="p-3 bg-taupe-50 border border-taupe-200 rounded-xl">
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-taupe-200 text-taupe-800 px-1.5 py-0.5 rounded">
                    {rec.category}
                  </span>
                  <h4 className="text-xs font-bold text-taupe-950 mt-1 line-clamp-1">
                    {isHindi && rec.name_hi ? rec.name_hi : rec.name}
                  </h4>
                  <Link
                    to={`/schemes/${rec.id}`}
                    className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-taupe-850 hover:underline"
                  >
                    <span>Check Eligibility</span>
                    <ArrowRight size={10} />
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* DBT Detective Callout */}
          <div className="bg-gradient-to-br from-taupe-850 to-taupe-950 text-taupe-50 rounded-2xl p-6 shadow-md space-y-3">
            <div className="flex items-center gap-2 text-taupe-200 text-xs font-bold">
              <AlertCircle size={16} />
              <span>Payment Delayed?</span>
            </div>
            <h3 className="text-sm font-bold">
              Facing missing subsidy or scholarship credit?
            </h3>
            <p className="text-xs text-taupe-300 leading-relaxed">
              Use our interactive diagnostic workflow to find the exact banking error and get an official resolution plan.
            </p>
            <Link
              to="/dbt"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-taupe-200 hover:bg-taupe-100 text-taupe-950 text-xs font-bold rounded-xl transition-all"
            >
              <span>Launch DBT Detective</span>
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
