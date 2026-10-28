import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Filter,
  CheckCircle,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  ArrowRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

function SchemeFinder() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const isHindi = i18n.language === 'hi';

  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [savedIds, setSavedIds] = useState(new Set());
  const [savedMessage, setSavedMessage] = useState('');

  const categories = [
    { key: 'All', labelEn: 'All Schemes', labelHi: 'सभी योजनाएं' },
    { key: 'Agriculture', labelEn: 'Agriculture', labelHi: 'कृषि' },
    { key: 'Education', labelEn: 'Education', labelHi: 'शिक्षा' },
    { key: 'Healthcare', labelEn: 'Healthcare', labelHi: 'स्वास्थ्य' },
    { key: 'Housing', labelEn: 'Housing', labelHi: 'आवास' },
    { key: 'Pension', labelEn: 'Pension', labelHi: 'पेंशन' },
    { key: 'Financial Assistance', labelEn: 'Financial Assistance', labelHi: 'वित्तीय सहायता' },
    { key: 'Employment', labelEn: 'Employment & Skills', labelHi: 'रोजगार व कौशल' },
  ];

  useEffect(() => {
    fetchSchemes();
    fetchSavedSchemes();
  }, [selectedCategory]);

  const fetchSchemes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (selectedCategory && selectedCategory !== 'All') params.append('category', selectedCategory);

      const res = await fetch(`/api/schemes?${params.toString()}`);
      const data = await res.json();
      setSchemes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching schemes:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedSchemes = async () => {
    try {
      const token = localStorage.getItem('jansetu_token');
      const res = await fetch('/api/saved-schemes', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setSavedIds(new Set(data.map(item => item.scheme_id || item.id)));
      }
    } catch (e) {
      // silent
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchSchemes();
  };

  const handleSaveScheme = async (scheme) => {
    try {
      const token = localStorage.getItem('jansetu_token');
      await fetch('/api/saved-schemes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ scheme_id: scheme.id })
      });
      setSavedIds(prev => new Set([...prev, scheme.id]));
      setSavedMessage(`"${isHindi && scheme.name_hi ? scheme.name_hi : scheme.name}" saved!`);
      setTimeout(() => setSavedMessage(''), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto px-4 sm:px-6">
      {/* Top Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-taupe-200 text-taupe-950 text-xs font-semibold">
          <ShieldCheck size={14} className="text-taupe-800" />
          <span>{t('verifiedGovtScheme')}</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-taupe-950">
          {isHindi ? 'सरकारी योजना खोजक' : 'Government Scheme Finder'}
        </h1>
        <p className="text-xs sm:text-sm text-taupe-600">
          {isHindi
            ? 'अपनी श्रेणी, व्यवसाय और पात्रता के अनुसार 25+ सत्यापित सरकारी योजनाओं की खोज करें।'
            : 'Explore 25+ officially verified central and state government welfare schemes with exact eligibility rules.'}
        </p>
      </div>

      {savedMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-taupe-850 text-taupe-50 px-4 py-3 rounded-xl shadow-xl text-xs flex items-center gap-2 border border-taupe-700 animate-fade-in">
          <CheckCircle size={14} className="text-emerald-400" />
          <span>{savedMessage}</span>
        </div>
      )}

      {/* Search & Category Filter Bar */}
      <div className="bg-white border border-taupe-300 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-3 text-taupe-400" />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-taupe-50 rounded-xl border border-taupe-300 text-sm text-taupe-900 focus:outline-none focus:ring-2 focus:ring-taupe-700"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 bg-taupe-850 hover:bg-taupe-950 text-taupe-50 text-xs font-bold rounded-xl transition-all shadow-sm"
          >
            {isHindi ? 'खोजें' : 'Search'}
          </button>
        </form>

        {/* Categories Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-3.5 py-1.5 rounded-full font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-taupe-850 text-taupe-50 shadow-sm'
                    : 'bg-taupe-100 text-taupe-800 hover:bg-taupe-200'
                }`}
              >
                {isHindi ? cat.labelHi : cat.labelEn}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Count & Grid */}
      <div>
        <div className="flex items-center justify-between mb-4 text-xs text-taupe-600 font-semibold px-1">
          <span>
            {loading ? 'Searching...' : `Showing ${schemes.length} verified schemes`}
          </span>
          <span>Sources: myScheme.gov.in & Official Ministries</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white border border-taupe-200 rounded-2xl p-6 h-64 animate-pulse" />
            ))}
          </div>
        ) : schemes.length === 0 ? (
          <div className="bg-white border border-dashed border-taupe-300 rounded-2xl p-12 text-center space-y-3">
            <Search size={36} className="mx-auto text-taupe-400" />
            <h3 className="text-base font-bold text-taupe-900">No schemes found</h3>
            <p className="text-xs text-taupe-600 max-w-sm mx-auto">
              Try adjusting your search query or reset the category filter.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                fetchSchemes();
              }}
              className="px-4 py-2 bg-taupe-850 text-taupe-50 text-xs font-bold rounded-xl"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schemes.map((scheme) => {
              const isSaved = savedIds.has(scheme.id);
              return (
                <div
                  key={scheme.id}
                  className="bg-white border border-taupe-200 hover:border-taupe-400 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-taupe-100 text-taupe-800 px-2.5 py-1 rounded-full border border-taupe-200">
                        {scheme.category}
                      </span>
                      <button
                        onClick={() => handleSaveScheme(scheme)}
                        className="p-1.5 text-taupe-400 hover:text-taupe-850 transition-colors"
                        title={isSaved ? 'Saved' : 'Save Scheme'}
                      >
                        {isSaved ? (
                          <BookmarkCheck size={18} className="text-taupe-850" />
                        ) : (
                          <Bookmark size={18} />
                        )}
                      </button>
                    </div>

                    <h3 className="text-base font-bold text-taupe-950 leading-snug mb-2 line-clamp-2">
                      {isHindi && scheme.name_hi ? scheme.name_hi : scheme.name}
                    </h3>

                    <p className="text-xs text-taupe-600 line-clamp-3 leading-relaxed mb-4">
                      {isHindi && scheme.description_hi ? scheme.description_hi : scheme.description}
                    </p>

                    <div className="bg-taupe-50 border border-taupe-200 rounded-xl p-3 mb-4 text-xs space-y-1.5">
                      <div className="font-semibold text-taupe-950 flex items-center gap-1">
                        <Sparkles size={12} className="text-taupe-700" /> Benefits:
                      </div>
                      <div className="text-taupe-700 line-clamp-2 text-[11px]">
                        {isHindi && scheme.benefits_hi ? scheme.benefits_hi : scheme.benefits}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-taupe-100 flex items-center justify-between gap-2">
                    <Link
                      to={`/schemes/${scheme.id}`}
                      className="text-xs font-bold text-taupe-900 hover:text-taupe-950 flex items-center gap-1 hover:underline"
                    >
                      <span>{t('viewDetails')}</span>
                      <ArrowRight size={12} />
                    </Link>

                    {scheme.official_url && (
                      <a
                        href={scheme.official_url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-taupe-850 hover:bg-taupe-950 text-taupe-50 text-[11px] font-bold rounded-lg flex items-center gap-1 transition-colors"
                      >
                        <span>{t('applyNow')}</span>
                        <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default SchemeFinder;
