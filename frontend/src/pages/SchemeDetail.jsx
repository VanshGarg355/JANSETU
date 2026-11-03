import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
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
  Share2,
  Download
} from 'lucide-react';

function SchemeDetail() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const isHindi = i18n.language === 'hi';

  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [autofillOpen, setAutofillOpen] = useState(false);
  const [autofillValues, setAutofillValues] = useState({});
  const [autofillMissing, setAutofillMissing] = useState([]);

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

  // Smart Form Autofill: map saved citizen profile to government application form fields
  const SCHEME_FORM_FIELDS = [
    { key: 'full_name', label: 'Full Name' },
    { key: 'father_name', label: 'Father Name' },
    { key: 'mother_name', label: 'Mother Name' },
    { key: 'dob', label: 'Date of Birth' },
    { key: 'gender', label: 'Gender' },
    { key: 'mobile', label: 'Mobile Number' },
    { key: 'email', label: 'Email Address' },
    { key: 'address', label: 'Address' },
    { key: 'state', label: 'State' },
    { key: 'district', label: 'District' },
    { key: 'pincode', label: 'PIN Code' },
    { key: 'category', label: 'Social Category' },
    { key: 'annual_income', label: 'Annual Family Income' },
    { key: 'occupation', label: 'Occupation' }
  ];

  const buildAutofillFromProfile = () => {
    const u = user || {};
    const values = {
      full_name: u.name || '',
      father_name: u.father_name || '',
      mother_name: u.mother_name || '',
      dob: u.dob || '',
      gender: u.gender || '',
      mobile: u.mobile || '',
      email: u.email || '',
      address: u.address || '',
      state: u.state || '',
      district: u.district || '',
      pincode: u.pincode || '',
      category: u.category || '',
      annual_income: u.annual_income || '',
      occupation: u.occupation || ''
    };
    const missing = SCHEME_FORM_FIELDS.filter(f => !String(values[f.key] || '').trim());
    return { values, missing };
  };

  const openAutofill = () => {
    const { values, missing } = buildAutofillFromProfile();
    setAutofillValues(values);
    setAutofillMissing(missing);
    setAutofillOpen(true);
  };

  const updateAutofillValue = (key, value) => {
    setAutofillValues(prev => ({ ...prev, [key]: value }));
    setAutofillMissing(prevMissing => prevMissing.filter(m => m.key !== key));
  };

  const downloadAutofillSummary = () => {
    const lines = [
      'JANSETU SMART APPLICATION AUTOFILL SUMMARY',
      `Scheme: ${scheme?.name || ''}`,
      '',
      ...SCHEME_FORM_FIELDS.map(f => `${f.label}: ${autofillValues[f.key] || '(not provided)'}`),
      '',
      'This is a citizen-editable draft. Verify all details with original documents before applying on the official portal.'
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jansetu_autofill_${scheme?.id || 'scheme'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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

      {/* Smart Form Autofill from Saved Citizen Profile */}
      <div className="bg-white border-2 border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-taupe-950 flex items-center gap-2">
          <FileCheck size={18} className="text-emerald-700" />
          <span>{isHindi ? 'स्मार्ट फ़ॉर्म ऑटो-फ़ील (सहेजी प्रोफ़ाइल)' : 'Smart Form Autofill (Saved Profile)'}</span>
        </h2>
        <p className="text-xs sm:text-sm text-taupe-700 leading-relaxed">
          {isHindi
            ? 'आपके सहेजे गए नागरिक प्रोफ़ाइल से आवेदन पत्र के उपलब्ध फ़ील्ड स्वतः भरे जाएंगे।'
            : 'Your saved citizen profile will automatically fill available fields of this government application form. Missing details can be added by you before submission.'}
        </p>

        <div className="pt-2 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={openAutofill}
            className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all active:scale-95"
          >
            <FileCheck size={15} />
            <span>{isHindi ? 'प्रोफ़ाइल से ऑटो-फ़ील करें' : 'Autofill from Saved Profile'}</span>
          </button>

          {scheme.official_url && (
            <a
              href={scheme.official_url}
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3 bg-taupe-100 hover:bg-taupe-200 text-taupe-950 font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 border border-taupe-300 transition-all"
            >
              <span>{isHindi ? 'आधिकारिक पोर्टल पर आवेदन करें' : 'Apply on Official Portal'}</span>
              <ExternalLink size={14} />
            </a>
          )}
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

      {/* Smart Autofill Review Modal */}
      {autofillOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-3xl border border-slate-300 shadow-2xl p-6 sm:p-8 space-y-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-extrabold text-slate-950">Smart Form Autofill</h3>
                <p className="text-xs text-slate-600 mt-0.5 font-medium">{scheme?.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setAutofillOpen(false)}
                className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-300 transition-colors"
              >
                Close
              </button>
            </div>

            <div className="space-y-3">
              {SCHEME_FORM_FIELDS.map((f) => {
                const value = autofillValues[f.key] || '';
                const isMissing = !String(value).trim();
                return (
                  <div key={f.key} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-xs font-bold text-slate-850">{f.label}</label>
                      {isMissing ? (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">Not provided</span>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Auto-filled from saved profile</span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => updateAutofillValue(f.key, e.target.value)}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-800 font-medium"
                    />
                  </div>
                );
              })}
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={downloadAutofillSummary}
                className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Download size={14} />
                <span>Download Autofill Summary</span>
              </button>

              {scheme.official_url && (
                <a
                  href={scheme.official_url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <span>Submit on Official Portal</span>
                  <ExternalLink size={13} />
                </a>
              )}

              <button
                type="button"
                onClick={() => setAutofillOpen(false)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold rounded-xl text-xs border border-slate-300 transition-colors"
              >
                Close
              </button>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Autofill only fills fields present in your saved profile. Nothing is submitted automatically to any government portal.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default SchemeDetail;
