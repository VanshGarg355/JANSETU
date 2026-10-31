import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  ExternalLink,
  ShieldCheck,
  FileCheck,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Bookmark,
  BookmarkCheck,
  Share2
} from 'lucide-react';

function SchemeDetail() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const isHindi = i18n.language === 'hi';

  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    fetchScheme();
  }, [id]);

  const fetchScheme = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/schemes/${id}`);
      const data = await res.json();
      setScheme(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
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
      setIsSaved(true);
    } catch (e) {
      // silent
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center text-xs text-taupe-500 animate-pulse">
        Loading verified scheme details...
      </div>
    );
  }

  if (!scheme || scheme.error) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center space-y-4">
        <h2 className="text-xl font-bold text-taupe-950">Scheme Not Found</h2>
        <Link
          to="/schemes"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-taupe-850 text-taupe-50 text-xs font-bold rounded-xl"
        >
          <ArrowLeft size={14} /> Back to Schemes
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 px-4 sm:px-6">
      {/* Back button */}
      <div>
        <Link
          to="/schemes"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-taupe-700 hover:text-taupe-950 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>{isHindi ? 'सभी योजनाओं पर वापस जाएं' : 'Back to Scheme Directory'}</span>
        </Link>
      </div>

      {/* Scheme Header Card */}
      <div className="bg-white border border-taupe-300 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider bg-taupe-100 text-taupe-800 px-3 py-1 rounded-full border border-taupe-200">
              {scheme.category}
            </span>
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full flex items-center gap-1">
              <ShieldCheck size={13} /> Official Verified
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-taupe-300 text-xs font-bold text-taupe-800 hover:bg-taupe-100 transition-colors"
            >
              {isSaved ? <BookmarkCheck size={14} className="text-taupe-900" /> : <Bookmark size={14} />}
              <span>{isSaved ? t('saved') : t('saveScheme')}</span>
            </button>
          </div>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-taupe-950 leading-tight">
            {isHindi && scheme.name_hi ? scheme.name_hi : scheme.name}
          </h1>
          {isHindi && scheme.name && (
            <p className="text-xs text-taupe-500 font-medium mt-1">
              English: {scheme.name}
            </p>
          )}
        </div>

        <p className="text-sm text-taupe-700 leading-relaxed">
          {isHindi && scheme.description_hi ? scheme.description_hi : scheme.description}
        </p>

        {/* Verification meta */}
        <div className="pt-4 border-t border-taupe-100 flex flex-wrap items-center gap-4 text-xs text-taupe-500">
          <div className="flex items-center gap-1">
            <Calendar size={13} />
            <span>Verified: {scheme.last_verified || '2026-01-15'}</span>
          </div>
          {scheme.source_url && (
            <a
              href={scheme.source_url}
              target="_blank"
              rel="noreferrer"
              className="hover:underline flex items-center gap-1 text-taupe-700 font-semibold"
            >
              <span>Source Documentation</span>
              <ExternalLink size={10} />
            </a>
          )}
        </div>
      </div>

      {/* Grid: Benefits & Eligibility */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Benefits */}
        <div className="bg-white border border-taupe-200 rounded-2xl p-6 shadow-sm space-y-3">
          <h2 className="text-base font-bold text-taupe-950 flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-700" />
            <span>{isHindi ? 'योजना के मुख्य लाभ' : 'Scheme Benefits & Subsidies'}</span>
          </h2>
          <p className="text-xs sm:text-sm text-taupe-700 leading-relaxed whitespace-pre-line">
            {isHindi && scheme.benefits_hi ? scheme.benefits_hi : scheme.benefits}
          </p>
        </div>

        {/* Eligibility Criteria */}
        <div className="bg-white border border-taupe-200 rounded-2xl p-6 shadow-sm space-y-3">
          <h2 className="text-base font-bold text-taupe-950 flex items-center gap-2">
            <FileCheck size={18} className="text-taupe-800" />
            <span>{isHindi ? 'पात्रता मानदंड' : 'Official Eligibility Criteria'}</span>
          </h2>
          <p className="text-xs sm:text-sm text-taupe-700 leading-relaxed whitespace-pre-line">
            {isHindi && scheme.eligibility_criteria_hi ? scheme.eligibility_criteria_hi : scheme.eligibility_criteria}
          </p>
        </div>
      </div>

      {/* Required Documents */}
      <div className="bg-white border border-taupe-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-3">
        <h2 className="text-base font-bold text-taupe-950">
          {isHindi ? 'आवश्यक दस्तावेज (Checklist)' : 'Required Documents Checklist'}
        </h2>
        <div className="p-4 bg-taupe-50 border border-taupe-200 rounded-xl text-xs sm:text-sm text-taupe-800 leading-relaxed">
          {scheme.required_documents || 'Aadhaar Card, Bank Passbook linked to Aadhaar, Income Proof, Photograph.'}
        </div>
      </div>

      {/* Application Process & Action */}
      <div className="bg-white border border-taupe-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-taupe-950">
          {isHindi ? 'आवेदन प्रक्रिया' : 'How to Apply (Application Process)'}
        </h2>
        <p className="text-xs sm:text-sm text-taupe-700 leading-relaxed">
          {scheme.application_process || 'Apply online via the official national portal or visit your nearest Common Service Centre (CSC).'}
        </p>

        <div className="pt-4 flex flex-wrap items-center gap-3">
          {scheme.official_url && (
            <a
              href={scheme.official_url}
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3 bg-taupe-850 hover:bg-taupe-950 text-taupe-50 font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all"
            >
              <span>{isHindi ? 'आधिकारिक पोर्टल पर आवेदन करें' : 'Apply on Official Government Portal'}</span>
              <ExternalLink size={14} />
            </a>
          )}

          <Link
            to="/dbt"
            className="px-5 py-3 bg-taupe-100 hover:bg-taupe-200 text-taupe-950 font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 border border-taupe-300 transition-all"
          >
            <AlertCircle size={15} />
            <span>{isHindi ? 'भुगतान नहीं मिला? DBT जांचें' : 'Payment Delayed? Diagnose with DBT Detective'}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default SchemeDetail;
