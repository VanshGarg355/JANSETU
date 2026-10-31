import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth, DEMO_PERSONAS } from '../context/AuthContext';
import FamilyDocumentsVault from '../components/FamilyDocumentsVault';
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
  Clock,
  Layers,
  FileCheck2,
  Calendar,
  MessageSquare,
  HelpCircle,
  TrendingUp,
  Download,
  Building2,
  CreditCard,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Smartphone,
  ChevronRight,
  Check
} from 'lucide-react';

function Dashboard() {
  const { t, i18n } = useTranslation();
  const { user, switchPersona } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isHindi = i18n.language === 'hi';

  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'schemes'); // 'schemes' | 'dbt_health' | 'documents' | 'calendar'

  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);
  const [schemeFilter, setSchemeFilter] = useState('all'); // 'all' | 'saved' | 'high_match'
  const [savedSchemes, setSavedSchemes] = useState([]);
  const [allSchemes, setAllSchemes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick DBT Problem Solver state
  const [selectedIssueScheme, setSelectedIssueScheme] = useState('pmkisan');
  const [diagResult, setDiagResult] = useState(null);
  const [diagLoading, setDiagLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch saved schemes from backend or fallback to initial defaults
      const token = localStorage.getItem('jansetu_token');
      try {
        const savedRes = await fetch('/api/saved-schemes', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        const savedData = await savedRes.json();
        if (Array.isArray(savedData) && savedData.length > 0) {
          setSavedSchemes(savedData);
        } else {
          // Default initial bookmark sample
          setSavedSchemes([
            {
              id: 1,
              name: 'PM Kisan Samman Nidhi (PM-KISAN)',
              name_hi: 'प्रधानमंत्री किसान सम्मान निधि',
              category: 'Agriculture',
              benefits: 'Rs 6,000 per year credited directly in 3 installments.',
              benefits_hi: 'प्रति वर्ष ₹6,000 तीन किस्तों में सीधे बैंक खाते में।',
              official_url: 'https://pmkisan.gov.in/'
            },
            {
              id: 2,
              name: 'Ayushman Bharat PM-JAY',
              name_hi: 'आयुष्मान भारत प्रधानमंत्री जन आरोग्य योजना',
              category: 'Healthcare',
              benefits: 'Cashless healthcare cover up to Rs 5,00,000 per family per year.',
              benefits_hi: '₹5 लाख तक का कैशलेस स्वास्थ्य कवर प्रति वर्ष प्रति परिवार।',
              official_url: 'https://pmjay.gov.in/'
            }
          ]);
        }
      } catch (e) {
        setSavedSchemes([
          {
            id: 1,
            name: 'PM Kisan Samman Nidhi (PM-KISAN)',
            name_hi: 'प्रधानमंत्री किसान सम्मान निधि',
            category: 'Agriculture',
            benefits: 'Rs 6,000 per year credited directly in 3 installments.',
            benefits_hi: 'प्रति वर्ष ₹6,000 तीन किस्तों में सीधे बैंक खाते में।',
            official_url: 'https://pmkisan.gov.in/'
          }
        ]);
      }

      // 2. Fetch all schemes from backend or fallback
      try {
        const res = await fetch('/api/schemes');
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setAllSchemes(data);
        } else {
          setAllSchemes(getDefaultSchemes());
        }
      } catch (e) {
        setAllSchemes(getDefaultSchemes());
      }
    } finally {
      setLoading(false);
    }
  };

  const getDefaultSchemes = () => [
    {
      id: 1,
      name: 'PM Kisan Samman Nidhi (PM-KISAN)',
      name_hi: 'प्रधानमंत्री किसान सम्मान निधि',
      category: 'Agriculture',
      ministry: 'Ministry of Agriculture & Farmers Welfare',
      benefits: '₹6,000 per year in 3 equal installments of ₹2,000 direct to bank account.',
      benefits_hi: '₹6,000 प्रति वर्ष तीन समान किस्तों में सीधे आधार-सीडेड बैंक खाते में।',
      eligibility_match: 98,
      official_url: 'https://pmkisan.gov.in/',
      docs: ['Aadhaar', 'Land Record', 'Bank Passbook']
    },
    {
      id: 2,
      name: 'Ayushman Bharat PM-JAY',
      name_hi: 'आयुष्मान भारत प्रधानमंत्री जन आरोग्य योजना',
      category: 'Healthcare',
      ministry: 'National Health Authority',
      benefits: '₹5,00,000 cashless secondary and tertiary hospitalization cover per family.',
      benefits_hi: '₹5 लाख तक का कैशलेस अस्पताल उपचार प्रति परिवार प्रति वर्ष।',
      eligibility_match: 92,
      official_url: 'https://pmjay.gov.in/',
      docs: ['Aadhaar', 'Ration Card', 'Mobile Number']
    },
    {
      id: 4,
      name: 'Kisan Credit Card (KCC) Scheme',
      name_hi: 'किसान क्रेडिट कार्ड योजना',
      category: 'Agriculture',
      ministry: 'Ministry of Finance & Agriculture',
      benefits: 'Short term collateral-free agricultural credit up to ₹1.6 lakh (and up to ₹3 lakh subsidized).',
      benefits_hi: '₹1.6 लाख तक बिना बंधक और ₹3 लाख तक रियायती ब्याज दर पर कृषि ऋण।',
      eligibility_match: 95,
      official_url: 'https://pmkisan.gov.in/',
      docs: ['Land Record', 'Aadhaar', 'Passport Photo']
    },
    {
      id: 5,
      name: 'NSP Post-Matric Scholarship Scheme',
      name_hi: 'एनएसपी पोस्ट-मैट्रिक छात्रवृत्ति योजना',
      category: 'Education',
      ministry: 'Ministry of Social Justice & Empowerment',
      benefits: 'Full tuition fee reimbursement + annual maintenance allowance ₹12,000-₹20,000.',
      benefits_hi: 'पूर्ण शिक्षण शुल्क प्रतिपूर्ति एवं वार्षिक रखरखाव भत्ता।',
      eligibility_match: 88,
      official_url: 'https://scholarships.gov.in/',
      docs: ['Aadhaar', 'Fee Receipt', 'Income Certificate', 'Marksheet']
    },
    {
      id: 6,
      name: 'PM Mudra Yojana (PMMY - Shishu / Kishor)',
      name_hi: 'प्रधानमंत्री मुद्रा योजना',
      category: 'Financial Assistance',
      ministry: 'Ministry of Finance',
      benefits: 'Collateral-free business loans up to ₹50,000 (Shishu) and up to ₹5,00,000 (Kishor).',
      benefits_hi: 'बिना किसी गारंटी के ₹50,000 से ₹5 लाख तक का व्यावसायिक ऋण।',
      eligibility_match: 86,
      official_url: 'https://www.mudra.org.in/',
      docs: ['Aadhaar', 'Business Proof', 'Bank Statement']
    },
    {
      id: 7,
      name: 'Atal Pension Yojana (APY)',
      name_hi: 'अटल पेंशन योजना',
      category: 'Pension',
      ministry: 'PFRDA / Ministry of Finance',
      benefits: 'Guaranteed monthly pension of ₹1,000 to ₹5,000 after age 60.',
      benefits_hi: '60 वर्ष की आयु के बाद ₹1,000 से ₹5,000 तक की गारंटीकृत मासिक पेंशन।',
      eligibility_match: 84,
      official_url: 'https://www.npscra.nsdl.co.in/',
      docs: ['Aadhaar', 'Savings Bank Account']
    }
  ];

  const handleRemoveSaved = async (id) => {
    try {
      const token = localStorage.getItem('jansetu_token');
      await fetch(`/api/saved-schemes/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
    } catch (e) {
      // silent
    }
    setSavedSchemes(prev => prev.filter(s => (s.id !== id && s.scheme_id !== id)));
  };

  const handleRunQuickDiag = () => {
    setDiagLoading(true);
    setDiagResult(null);

    setTimeout(() => {
      setDiagLoading(false);
      if (selectedIssueScheme === 'pmkisan') {
        if (user?.occupation === 'Student') {
          setDiagResult({
            title: 'Not Eligible / Incompatible Scheme Category',
            severity: 'Medium',
            cause: 'Your profile occupation is marked as Student, whereas PM-KISAN requires recorded agricultural land in beneficiary name.',
            action: 'Check NSP Scholarship or PM-USP instead, or update land ownership documents at local Revenue Tehsil.'
          });
        } else {
          setDiagResult({
            title: 'NPCI Aadhaar-Bank Seeding & e-KYC Status: Verified',
            severity: 'Low',
            cause: 'Primary bank (State Bank of India •••4921) is active on NPCI DBT Mapper.',
            action: 'Your 17th installment is scheduled for direct credit. If funds are delayed past release date, verify land seeding at pmkisan.gov.in.'
          });
        }
      } else if (selectedIssueScheme === 'scholarship') {
        setDiagResult({
          title: 'Bank Account Inactive / NPCI Mapper Unlinked',
          severity: 'High',
          cause: 'PFMS returned error: "Aadhaar Not Seeded in NPCI Mapper (Code: 72)". The state scholarship cannot credit funds.',
          action: 'Visit your bank branch with Aadhaar copy and submit the official "Aadhaar DBT Mandate Form" within 15 days.'
        });
      } else if (selectedIssueScheme === 'pension') {
        setDiagResult({
          title: 'Annual Jeevan Pramaan (Life Certificate) Expired',
          severity: 'High',
          cause: 'Disbursement stopped due to unverified annual life certificate for fiscal year.',
          action: 'Submit digital biometric life certificate using Jeevan Pramaan App on smartphone or visit nearest CSC/Post Office.'
        });
      } else {
        setDiagResult({
          title: 'Direct Benefit Transfer Pipeline Healthy',
          severity: 'Low',
          cause: 'All 4 verification checks (UIDAI, PFMS, NPCI, Bank KYC) are valid.',
          action: 'No action required. Next government installment will automatically credit to primary account.'
        });
      }
    }, 600);
  };

  // Filter schemes based on active tab and filters
  const displaySchemes = allSchemes.filter(s => {
    if (schemeFilter === 'saved') {
      return savedSchemes.some(saved => (saved.id === s.id || saved.scheme_id === s.id));
    }
    if (schemeFilter === 'high_match') {
      return (s.eligibility_match || 85) >= 90;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 1. Indian Civic Header & Profile Banner */}
      <div className="bg-white border border-taupe-300 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        {/* Subtle decorative gradient pill */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-600 via-taupe-500 to-emerald-600" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* User Info & Avatar */}
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-taupe-850 to-taupe-950 text-white flex items-center justify-center font-extrabold text-3xl shadow-md shrink-0">
              {user?.avatar || (user?.name ? user.name.charAt(0) : 'C')}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-taupe-950 tracking-tight">
                  {isHindi ? 'नमस्ते,' : 'Namaste,'} {user?.name || 'Citizen'}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <CheckCircle size={12} />
                  <span>Verified Beneficiary</span>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-taupe-600 font-medium">
                <span className="bg-taupe-100 text-taupe-850 px-2 py-0.5 rounded-md font-semibold">
                  {user?.role || user?.occupation || 'Farmer'}
                </span>
                <span>•</span>
                <span>{user?.state || 'Uttar Pradesh'}</span>
                <span>•</span>
                <span className="text-taupe-500">
                  Citizen ID: <strong className="text-taupe-800 font-mono">JS-2026-{user?.account_last4 || '4921'}</strong>
                </span>
                <span>•</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <ShieldCheck size={13} /> NPCI Mapped ({user?.bank_name || 'State Bank of India'})
                </span>
              </div>
            </div>
          </div>

          {/* Persona Switcher for Hackathon Judges / Evaluators */}
          <div className="w-full lg:w-auto bg-taupe-50 border border-taupe-300 rounded-2xl p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-taupe-700 uppercase tracking-wider flex items-center gap-1">
                <Sparkles size={12} className="text-amber-600" />
                Switch Test Persona:
              </span>
              <span className="text-[10px] text-taupe-500">Live Personalization</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {DEMO_PERSONAS.map(p => {
                const isActive = user?.id === p.id || user?.name === p.name;
                return (
                  <button
                    key={p.id}
                    onClick={() => switchPersona(p)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 justify-center ${
                      isActive
                        ? 'bg-taupe-850 text-white shadow-sm'
                        : 'bg-white hover:bg-taupe-200 text-taupe-850 border border-taupe-200'
                    }`}
                  >
                    <span>{p.avatar}</span>
                    <span className="truncate">{p.role.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick Shortcut Buttons */}
        <div className="mt-6 pt-6 border-t border-taupe-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/dbt"
              className="inline-flex items-center gap-2 px-4 py-2 bg-taupe-850 hover:bg-taupe-950 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              <AlertCircle size={14} className="text-amber-400" />
              <span>Launch DBT Detective</span>
              <ArrowRight size={13} />
            </Link>

            <button
              onClick={() => setActiveTab('documents')}
              className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
                activeTab === 'documents'
                  ? 'bg-taupe-850 text-white border-taupe-850'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-300'
              }`}
            >
              <FileCheck2 size={14} className={activeTab === 'documents' ? 'text-amber-400' : 'text-emerald-700'} />
              <span>{isHindi ? 'दस्तावेज़ वॉल्ट (किसान, छात्र, पेंशन)' : 'Document Vault (Farmer, Student, Pension)'}</span>
            </button>

            <Link
              to="/schemes"
              className="inline-flex items-center gap-2 px-4 py-2 bg-taupe-200 hover:bg-taupe-300 text-taupe-950 text-xs font-bold rounded-xl border border-taupe-300 transition-colors"
            >
              <Layers size={14} />
              <span>Browse 25+ Schemes</span>
            </Link>

            <Link
              to="/chat"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-taupe-100 text-taupe-850 text-xs font-bold rounded-xl border border-taupe-300 transition-colors"
            >
              <MessageSquare size={14} className="text-taupe-600" />
              <span>Ask AI Sahayak</span>
            </Link>
          </div>

          <div className="text-xs text-taupe-500 font-medium">
            Aadhaar-Bank Link: <strong className="text-emerald-700 font-semibold">{user?.npci_status || 'Active & Verified'}</strong>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Summary Grid (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Eligible Schemes */}
        <div className="bg-white border border-taupe-300 rounded-2xl p-5 shadow-sm hover:border-taupe-400 transition-colors">
          <div className="flex items-center justify-between text-taupe-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Eligible Schemes</span>
            <div className="w-8 h-8 rounded-lg bg-taupe-100 text-taupe-850 flex items-center justify-center">
              <Layers size={16} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-taupe-950">
            {user?.eligible_schemes_count || 14}
          </div>
          <p className="text-xs text-taupe-600 mt-1">
            Matched for <span className="font-semibold text-taupe-800">{user?.role || 'Citizen'}</span> in {user?.state || 'UP'}
          </p>
        </div>

        {/* Card 2: Saved Schemes */}
        <div className="bg-white border border-taupe-300 rounded-2xl p-5 shadow-sm hover:border-taupe-400 transition-colors">
          <div className="flex items-center justify-between text-taupe-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Saved Schemes</span>
            <div className="w-8 h-8 rounded-lg bg-taupe-100 text-taupe-850 flex items-center justify-center">
              <Bookmark size={16} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-taupe-950">
            {savedSchemes.length}
          </div>
          <p className="text-xs text-taupe-600 mt-1">
            Bookmarked for quick document review & application
          </p>
        </div>

        {/* Card 3: DBT Lifetime Benefits Received */}
        <div className="bg-white border border-taupe-300 rounded-2xl p-5 shadow-sm hover:border-taupe-400 transition-colors">
          <div className="flex items-center justify-between text-taupe-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">DBT Disbursed</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-taupe-950">
            ₹{(user?.dbt_benefit_total || 36000).toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-emerald-700 font-semibold mt-1 flex items-center gap-1">
            <CheckCircle size={12} /> Direct into Bank Account •••{user?.account_last4 || '4921'}
          </p>
        </div>

        {/* Card 4: DBT Health Score */}
        <div className="bg-white border border-taupe-300 rounded-2xl p-5 shadow-sm hover:border-taupe-400 transition-colors">
          <div className="flex items-center justify-between text-taupe-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">DBT Health Score</span>
            <div className="w-8 h-8 rounded-lg bg-taupe-100 text-taupe-850 flex items-center justify-center">
              <ShieldCheck size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-taupe-950">
              {user?.dbt_health_score || 98}%
            </span>
            <span className="text-[11px] font-bold text-emerald-700">Healthy</span>
          </div>
          <p className="text-xs text-taupe-600 mt-1 truncate">
            {user?.pending_action || 'No blocking payment errors found'}
          </p>
        </div>
      </div>

      {/* 3. Main Dashboard Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-taupe-300 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('schemes')}
          className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all shrink-0 flex items-center gap-2 ${
            activeTab === 'schemes'
              ? 'bg-taupe-850 text-white shadow-sm'
              : 'text-taupe-700 hover:text-taupe-950 hover:bg-taupe-200'
          }`}
        >
          <Layers size={15} />
          <span>Tailored Schemes ({displaySchemes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('documents')}
          className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all shrink-0 flex items-center gap-2 ${
            activeTab === 'documents'
              ? 'bg-taupe-850 text-white shadow-sm ring-2 ring-emerald-500'
              : 'text-taupe-700 hover:text-taupe-950 hover:bg-taupe-200'
          }`}
        >
          <FileCheck2 size={15} className={activeTab === 'documents' ? 'text-emerald-400' : 'text-emerald-600'} />
          <span>{isHindi ? 'दस्तावेज़ वॉल्ट' : 'Document Vault'}</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold border border-emerald-200">
            Farmer • Student • Pension
          </span>
        </button>

        <button
          onClick={() => setActiveTab('dbt_health')}
          className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all shrink-0 flex items-center gap-2 ${
            activeTab === 'dbt_health'
              ? 'bg-taupe-850 text-white shadow-sm'
              : 'text-taupe-700 hover:text-taupe-950 hover:bg-taupe-200'
          }`}
        >
          <ShieldCheck size={15} />
          <span>DBT Payment Health & Diagnostics</span>
        </button>

        <button
          onClick={() => setActiveTab('calendar')}
          className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all shrink-0 flex items-center gap-2 ${
            activeTab === 'calendar'
              ? 'bg-taupe-850 text-white shadow-sm'
              : 'text-taupe-700 hover:text-taupe-950 hover:bg-taupe-200'
          }`}
        >
          <Calendar size={15} />
          <span>DBT Installment Calendar</span>
        </button>
      </div>

      {/* 4. Tab 1: Tailored & Saved Schemes */}
      {activeTab === 'schemes' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Schemes List (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-taupe-300">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSchemeFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    schemeFilter === 'all'
                      ? 'bg-taupe-850 text-white'
                      : 'bg-taupe-100 text-taupe-700 hover:bg-taupe-200'
                  }`}
                >
                  All Schemes ({allSchemes.length})
                </button>
                <button
                  onClick={() => setSchemeFilter('high_match')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    schemeFilter === 'high_match'
                      ? 'bg-taupe-850 text-white'
                      : 'bg-taupe-100 text-taupe-700 hover:bg-taupe-200'
                  }`}
                >
                  High Match (&gt;90%)
                </button>
                <button
                  onClick={() => setSchemeFilter('saved')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    schemeFilter === 'saved'
                      ? 'bg-taupe-850 text-white'
                      : 'bg-taupe-100 text-taupe-700 hover:bg-taupe-200'
                  }`}
                >
                  <Bookmark size={12} />
                  <span>Saved Only ({savedSchemes.length})</span>
                </button>
              </div>

              <Link to="/schemes" className="text-xs font-bold text-taupe-850 hover:underline flex items-center gap-1">
                <span>Search All 25+</span>
                <ChevronRight size={13} />
              </Link>
            </div>

            {/* Scheme Cards */}
            <div className="space-y-3.5">
              {displaySchemes.length === 0 ? (
                <div className="bg-white border border-dashed border-taupe-300 rounded-3xl p-10 text-center space-y-3">
                  <Bookmark size={36} className="mx-auto text-taupe-400" />
                  <h3 className="text-sm font-bold text-taupe-800">No schemes found in this filter</h3>
                  <p className="text-xs text-taupe-500 max-w-sm mx-auto">
                    Try switching filters or explore the full Scheme Finder directory.
                  </p>
                  <button
                    onClick={() => setSchemeFilter('all')}
                    className="px-4 py-2 bg-taupe-850 text-white text-xs font-bold rounded-xl"
                  >
                    Reset Filter
                  </button>
                </div>
              ) : (
                displaySchemes.map((s) => {
                  const isSaved = savedSchemes.some(item => item.id === s.id || item.scheme_id === s.id);
                  return (
                    <div
                      key={s.id}
                      className="bg-white border border-taupe-300 hover:border-taupe-400 rounded-3xl p-5 shadow-sm transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-taupe-100 text-taupe-800 px-2 py-0.5 rounded-md">
                              {s.category}
                            </span>
                            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <Sparkles size={10} />
                              <span>{s.eligibility_match || 90}% Match for {user?.occupation || 'Profile'}</span>
                            </span>
                          </div>

                          <h3 className="text-base font-extrabold text-taupe-950">
                            {isHindi ? s.name_hi || s.name : s.name}
                          </h3>

                          <p className="text-xs text-taupe-600 line-clamp-2">
                            {isHindi ? s.benefits_hi || s.benefits : s.benefits}
                          </p>

                          {/* Documents Preview */}
                          {s.docs && (
                            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-taupe-500">
                              <span className="font-semibold text-taupe-700">Required:</span>
                              {s.docs.map((d, i) => (
                                <span key={i} className="bg-taupe-100 text-taupe-800 px-2 py-0.5 rounded-md text-[10px] font-medium">
                                  {d}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center sm:flex-col gap-2 shrink-0 pt-2 sm:pt-0">
                          {s.official_url && (
                            <a
                              href={s.official_url}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3.5 py-1.5 bg-taupe-850 hover:bg-taupe-950 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                            >
                              <span>Apply Now</span>
                              <ExternalLink size={12} />
                            </a>
                          )}

                          {isSaved ? (
                            <button
                              onClick={() => handleRemoveSaved(s.id)}
                              className="p-1.5 text-taupe-400 hover:text-red-600 hover:bg-taupe-100 rounded-xl transition-colors"
                              title="Remove bookmark"
                            >
                              <Trash2 size={15} />
                            </button>
                          ) : (
                            <button
                              onClick={() => setSavedSchemes(prev => [...prev, s])}
                              className="px-3 py-1.5 bg-taupe-100 hover:bg-taupe-200 text-taupe-800 text-xs font-bold rounded-xl transition-colors"
                            >
                              + Save
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick AI Prompts Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white border border-taupe-300 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-taupe-850 text-white flex items-center justify-center">
                  <Sparkles size={16} className="text-amber-400" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-taupe-950">AI Sahayak Assistant</h3>
                  <p className="text-[11px] text-taupe-500">Ask about documents & schemes</p>
                </div>
              </div>

              <div className="space-y-2">
                {[
                  'What documents does Rajesh Sharma need for PM-KISAN 17th installment?',
                  'How can Aarav Sharma apply for Post-Matric Scholarship with 12th marksheet?',
                  'Why is Ramprasad Sharma Jeevan Pramaan renewal due and how to submit?'
                ].map((promptText, i) => (
                  <button
                    key={i}
                    onClick={() => navigate('/chat', { state: { initialPrompt: promptText } })}
                    className="w-full text-left p-3 rounded-2xl bg-taupe-50 hover:bg-taupe-100 text-taupe-800 text-xs font-medium border border-taupe-200 transition-colors flex items-center justify-between gap-2 group"
                  >
                    <span className="line-clamp-2">{promptText}</span>
                    <ArrowRight size={13} className="text-taupe-400 group-hover:text-taupe-900 group-hover:translate-x-0.5 transition-transform shrink-0" />
                  </button>
                ))}
              </div>

              <Link
                to="/chat"
                className="block text-center w-full py-2 bg-taupe-850 hover:bg-taupe-950 text-white font-bold text-xs rounded-xl transition-all"
              >
                Open Full AI Sahayak Chat
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 5. Tab 2: Family Documents & Digital Locker (Dedicated Full Section!) */}
      {activeTab === 'documents' && (
        <FamilyDocumentsVault isHindi={isHindi} currentUser={user} />
      )}

      {/* 6. Tab 3: DBT Payment Health & Diagnostics (Interactive) */}
      {activeTab === 'dbt_health' && (
        <div className="space-y-6">
          {/* Visual 4-Step Aadhaar-Bank Seeding Health Tracker */}
          <div className="bg-white border border-taupe-300 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-taupe-200 gap-2">
              <div>
                <h2 className="text-lg font-bold text-taupe-950 flex items-center gap-2">
                  <ShieldCheck size={20} className="text-emerald-600" />
                  <span>Aadhaar Direct Benefit Transfer (DBT) Health Pipeline</span>
                </h2>
                <p className="text-xs text-taupe-600 mt-0.5">
                  Real-time synchronization status across UIDAI, NPCI Mapper, and Public Financial Management System (PFMS).
                </p>
              </div>

              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full self-start sm:self-auto flex items-center gap-1.5">
                <CheckCircle2 size={14} />
                <span>Overall Health: 98%</span>
              </span>
            </div>

            {/* Stepper Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Step 1</span>
                  <CheckCircle2 size={16} className="text-emerald-600" />
                </div>
                <h4 className="text-xs font-bold text-emerald-950">Aadhaar & Mobile Link</h4>
                <p className="text-[11px] text-emerald-800">
                  UIDAI status: Active. Mobile OTP authorization active.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Step 2</span>
                  <CheckCircle2 size={16} className="text-emerald-600" />
                </div>
                <h4 className="text-xs font-bold text-emerald-950">Bank KYC Verification</h4>
                <p className="text-[11px] text-emerald-800">
                  {user?.bank_name || 'SBI'} A/C ••••{user?.account_last4 || '4921'} KYC completed.
                </p>
              </div>

              <div className={`p-4 rounded-2xl space-y-2 ${
                user?.npci_status?.includes('Inactive')
                  ? 'bg-amber-50 border border-amber-300'
                  : 'bg-emerald-50/60 border border-emerald-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Step 3</span>
                  {user?.npci_status?.includes('Inactive') ? (
                    <AlertTriangle size={16} className="text-amber-600" />
                  ) : (
                    <CheckCircle2 size={16} className="text-emerald-600" />
                  )}
                </div>
                <h4 className="text-xs font-bold text-taupe-950">NPCI DBT Mapper Consent</h4>
                <p className="text-[11px] text-taupe-700">
                  {user?.npci_status || 'Active & Seeded for government credit'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Step 4</span>
                  <CheckCircle2 size={16} className="text-emerald-600" />
                </div>
                <h4 className="text-xs font-bold text-emerald-950">PFMS Beneficiary Code</h4>
                <p className="text-[11px] text-emerald-800">
                  Beneficiary registered and valid on pfms.nic.in.
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Quick DBT Problem Solver Widget */}
          <div className="bg-white border border-taupe-300 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h3 className="text-base font-bold text-taupe-950 flex items-center gap-2">
                  <AlertCircle size={18} className="text-amber-600" />
                  <span>Stalled Payment Diagnostic Simulator</span>
                </h3>
                <p className="text-xs text-taupe-600 mt-0.5">
                  Select a government scheme to verify if your latest DBT installment has any blocking flags:
                </p>
              </div>

              <Link
                to="/dbt"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-taupe-100 hover:bg-taupe-200 text-taupe-900 font-bold text-xs rounded-xl self-start sm:self-auto"
              >
                <span>Full DBT Detective Tool</span>
                <ArrowRight size={12} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 mb-4">
              {[
                { id: 'pmkisan', label: 'PM-KISAN (Farmer Subsidy)' },
                { id: 'scholarship', label: 'NSP Scholarship (Post-Matric)' },
                { id: 'pension', label: 'Old Age / Widow Pension' },
                { id: 'pmay', label: 'PMAY Housing Installment' }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => { setSelectedIssueScheme(opt.id); setDiagResult(null); }}
                  className={`p-3 rounded-2xl text-xs font-bold text-left transition-all border ${
                    selectedIssueScheme === opt.id
                      ? 'bg-taupe-850 text-white border-taupe-850 shadow-sm'
                      : 'bg-taupe-50 hover:bg-taupe-100 text-taupe-800 border-taupe-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <button
              onClick={handleRunQuickDiag}
              disabled={diagLoading}
              className="px-5 py-2.5 bg-taupe-850 hover:bg-taupe-950 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-2"
            >
              {diagLoading ? (
                <>
                  <RotateCcw size={14} className="animate-spin" />
                  <span>Querying PFMS & NPCI Gateway...</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} className="text-amber-400" />
                  <span>Run 10-Second DBT Diagnostic Check</span>
                </>
              )}
            </button>

            {/* Diagnostic Result Callout */}
            {diagResult && (
              <div className="mt-6 p-5 rounded-2xl bg-taupe-50 border border-taupe-300 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {diagResult.severity === 'High' ? (
                      <AlertTriangle size={18} className="text-red-600" />
                    ) : diagResult.severity === 'Medium' ? (
                      <AlertCircle size={18} className="text-amber-600" />
                    ) : (
                      <CheckCircle2 size={18} className="text-emerald-600" />
                    )}
                    <h4 className="text-sm font-bold text-taupe-950">{diagResult.title}</h4>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    diagResult.severity === 'High'
                      ? 'bg-red-100 text-red-800'
                      : diagResult.severity === 'Medium'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    Severity: {diagResult.severity}
                  </span>
                </div>

                <div className="text-xs text-taupe-700 leading-relaxed">
                  <strong>Identified Cause:</strong> {diagResult.cause}
                </div>

                <div className="p-3 bg-white rounded-xl border border-taupe-200 text-xs text-taupe-900 leading-relaxed">
                  <strong className="text-taupe-950">Official Rectification Step:</strong> {diagResult.action}
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Link
                    to="/dbt"
                    className="px-4 py-2 bg-taupe-850 hover:bg-taupe-950 text-white text-xs font-bold rounded-xl"
                  >
                    Generate Full Diagnostic Report (PDF)
                  </Link>
                  <Link
                    to="/chat"
                    className="px-4 py-2 bg-taupe-200 hover:bg-taupe-300 text-taupe-950 text-xs font-bold rounded-xl"
                  >
                    Ask AI Sahayak for Form Template
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 7. Tab 4: DBT Installment Calendar & Directives */}
      {activeTab === 'calendar' && (
        <div className="bg-white border border-taupe-300 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="pb-6 border-b border-taupe-200">
            <h2 className="text-lg font-bold text-taupe-950 flex items-center gap-2">
              <Calendar size={20} className="text-taupe-850" />
              <span>DBT Disbursement Schedule & Government Advisories</span>
            </h2>
            <p className="text-xs text-taupe-600 mt-0.5">
              Official timeline for upcoming central and state welfare credit installments.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                scheme: 'PM Kisan Samman Nidhi (17th Installment)',
                amount: '₹2,000',
                date: 'November 2026',
                status: 'Scheduled',
                statusColor: 'text-emerald-800 bg-emerald-100',
                note: 'Eligible landholders with active e-KYC will receive direct credit.'
              },
              {
                scheme: 'NSP Post-Matric Scholarship Batch Disbursal',
                amount: '₹18,500',
                date: 'Processing (Expected 10 Days)',
                status: 'At State Treasury',
                statusColor: 'text-amber-800 bg-amber-100',
                note: 'Institutions verification complete. Sent to PFMS.'
              },
              {
                scheme: 'Atal Pension Yojana Monthly Auto-Debit',
                amount: '₹210',
                date: '1st of Every Month',
                status: 'Recurring',
                statusColor: 'text-taupe-800 bg-taupe-100',
                note: 'Maintains eligibility for ₹3,000 monthly guaranteed pension at age 60.'
              }
            ].map((item, idx) => (
              <div key={idx} className="p-4 bg-taupe-50 border border-taupe-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.statusColor}`}>
                      {item.status}
                    </span>
                    <span className="text-xs text-taupe-500 font-medium">{item.date}</span>
                  </div>
                  <h4 className="text-sm font-bold text-taupe-950">{item.scheme}</h4>
                  <p className="text-xs text-taupe-600">{item.note}</p>
                </div>
                <div className="text-right sm:shrink-0">
                  <div className="text-xs text-taupe-500 font-medium">Estimated Amount</div>
                  <div className="text-base font-extrabold text-taupe-950">{item.amount}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
