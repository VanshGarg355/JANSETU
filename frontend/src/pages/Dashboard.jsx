import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
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
  Check,
  Search,
  SlidersHorizontal,
  Compass,
  FileText,
  Banknote,
  PhoneCall,
  QrCode,
  Shield
} from 'lucide-react';

function Dashboard() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isHindi = i18n.language === 'hi';

  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'schemes'); // 'schemes' | 'dbt_health' | 'documents' | 'calendar'
  const [schemeFilter, setSchemeFilter] = useState('all'); // 'all' | 'saved' | 'high_match'
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [dashboardSearch, setDashboardSearch] = useState('');
  const [savedSchemes, setSavedSchemes] = useState([]);
  const [allSchemes, setAllSchemes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick DBT Problem Solver state
  const [selectedIssueScheme, setSelectedIssueScheme] = useState('pmkisan');
  const [diagResult, setDiagResult] = useState(null);
  const [diagLoading, setDiagLoading] = useState(false);

  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('jansetu_token');
      try {
        const savedRes = await fetch('/api/saved-schemes', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        const savedData = await savedRes.json();
        if (Array.isArray(savedData) && savedData.length > 0) {
          setSavedSchemes(savedData);
        } else {
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
      docs: ['Aadhaar', 'Land Record (Khatauni)', 'Bank Passbook']
    },
    {
      id: 2,
      name: 'Ayushman Bharat PM-JAY',
      name_hi: 'आयुष्मान भारत प्रधानमंत्री जन आरोग्य योजना',
      category: 'Healthcare',
      ministry: 'National Health Authority',
      benefits: '₹5,00,000 cashless secondary and tertiary hospitalization cover per family.',
      benefits_hi: '₹5 लाख तक का कैशलेस अस्पताल उपचार प्रति परिवार प्रति वर्ष।',
      eligibility_match: 94,
      official_url: 'https://pmjay.gov.in/',
      docs: ['Aadhaar', 'Ration Card', 'Active Mobile Number']
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
      eligibility_match: 91,
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
      eligibility_match: 88,
      official_url: 'https://www.mudra.org.in/',
      docs: ['Aadhaar', 'Business Proof / Udyam', 'Bank Statement']
    },
    {
      id: 7,
      name: 'Atal Pension Yojana (APY)',
      name_hi: 'अटल पेंशन योजना',
      category: 'Pension',
      ministry: 'PFRDA / Ministry of Finance',
      benefits: 'Guaranteed monthly pension of ₹1,000 to ₹5,000 after age 60.',
      benefits_hi: '60 वर्ष की आयु के बाद ₹1,000 से ₹5,000 तक की गारंटीकृत मासिक पेंशन।',
      eligibility_match: 86,
      official_url: 'https://www.npscra.nsdl.co.in/',
      docs: ['Aadhaar', 'Savings Bank Account']
    },
    {
      id: 3,
      name: 'Pradhan Mantri Awas Yojana (PMAY - Gramin)',
      name_hi: 'प्रधानमंत्री आवास योजना (ग्रामीण)',
      category: 'Housing',
      ministry: 'Ministry of Rural Development',
      benefits: 'Financial assistance of ₹1,20,000 for constructing a pucca house + 90 days MGNREGA wages.',
      benefits_hi: 'पक्का मकान निर्माण हेतु ₹1,20,000 की सीधी सहायता एवं 90 दिन की मनरेगा मजदूरी।',
      eligibility_match: 89,
      official_url: 'https://pmayg.nic.in/',
      docs: ['Aadhaar', 'Job Card', 'Bank Passbook', 'Land Possession']
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

  const handleSaveScheme = async (s) => {
    try {
      const token = localStorage.getItem('jansetu_token');
      await fetch('/api/saved-schemes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ scheme_id: s.id })
      });
    } catch (e) {
      // silent
    }
    setSavedSchemes(prev => [...prev, s]);
  };

  const handleRunQuickDiag = () => {
    setDiagLoading(true);
    setDiagResult(null);

    setTimeout(() => {
      setDiagLoading(false);
      if (selectedIssueScheme === 'pmkisan') {
        setDiagResult({
          title: isHindi ? 'NPCI आधार सीडिंग एवं e-KYC: पूर्ण एवं सक्रिय' : 'NPCI Aadhaar-Bank Seeding & e-KYC: Verified',
          severity: 'Low',
          cause: isHindi
            ? `प्राथमिक बैंक खाता (${user?.bank_name || 'State Bank of India'} •••${user?.account_last4 || '4921'}) NPCI मैपर पर सक्रिय है।`
            : `Primary bank (${user?.bank_name || 'State Bank of India'} •••${user?.account_last4 || '4921'}) is active on NPCI DBT Mapper.`,
          action: isHindi
            ? 'आपकी अगली किस्त सीधे बैंक खाते में क्रेडिट होने हेतु निर्धारित है। यदि विलंब हो तो pmkisan.gov.in पर लैंड सीडिंग जांचें।'
            : 'Your next installment is scheduled for direct credit. If funds delay past release date, verify land seeding at pmkisan.gov.in.'
        });
      } else if (selectedIssueScheme === 'scholarship') {
        setDiagResult({
          title: isHindi ? 'बैंक खाता इनएक्टिव / NPCI मैपर अनसीडेड' : 'Bank Account Inactive / NPCI Mapper Unlinked',
          severity: 'High',
          cause: isHindi
            ? 'PFMS एरर: "Aadhaar Not Seeded in NPCI Mapper (Code: 72)". बैंक में आधार जमा है परंतु DBT फ्लैग नो है।'
            : 'PFMS returned error: "Aadhaar Not Seeded in NPCI Mapper (Code: 72)". The state scholarship cannot credit funds.',
          action: isHindi
            ? 'बैंक शाखा में जाकर आधार की प्रति सहित "NPCI DBT मैंडेट फॉर्म" जमा करें। जनसेतु AI Sahayak से आवेदन पत्र प्राप्त करें।'
            : 'Visit your bank branch with Aadhaar copy and submit the official "Aadhaar DBT Mandate Form" within 15 days.'
        });
      } else if (selectedIssueScheme === 'pension') {
        setDiagResult({
          title: isHindi ? 'वार्षिक जीवन प्रमाण पत्र (Life Certificate) नवीनीकरण आवश्यक' : 'Annual Jeevan Pramaan (Life Certificate) Due',
          severity: 'High',
          cause: isHindi
            ? 'वार्षिक जीवन प्रमाण पत्र का सत्यापन लंबित है, जिससे पेंशन खाते में आना रुक सकती है।'
            : 'Disbursement stopped due to unverified annual life certificate for fiscal year.',
          action: isHindi
            ? 'स्मार्टफोन पर Jeevan Pramaan ऐप (Face RD) से या नजदीकी डाकघर/सीएससी पर डिजिटल प्रमाण पत्र तुरंत जमा करें।'
            : 'Submit digital biometric life certificate using Jeevan Pramaan App on smartphone or visit nearest CSC/Post Office.'
        });
      } else {
        setDiagResult({
          title: isHindi ? 'प्रत्यक्ष लाभ अंतरण (DBT) पाइपलाइन स्वस्थ' : 'Direct Benefit Transfer Pipeline Healthy',
          severity: 'Low',
          cause: isHindi
            ? 'सभी 4 सत्यापन चरण (UIDAI, PFMS, NPCI, Bank KYC) पूरी तरह सक्रिय हैं।'
            : 'All 4 verification checks (UIDAI, PFMS, NPCI, Bank KYC) are valid.',
          action: isHindi
            ? 'किसी अतिरिक्त कार्रवाई की आवश्यकता नहीं है। सरकारी राशि सीधे खाते में स्वतः अंतरित होगी।'
            : 'No action required. Next government installment will automatically credit to primary account.'
        });
      }
    }, 600);
  };

  // Filter schemes
  const displaySchemes = allSchemes.filter(s => {
    if (categoryFilter !== 'All' && s.category !== categoryFilter) {
      return false;
    }
    if (dashboardSearch.trim()) {
      const q = dashboardSearch.toLowerCase();
      const matchName = (s.name || '').toLowerCase().includes(q) || (s.name_hi || '').includes(q);
      const matchBen = (s.benefits || '').toLowerCase().includes(q) || (s.benefits_hi || '').includes(q);
      if (!matchName && !matchBen) return false;
    }
    if (schemeFilter === 'saved') {
      return savedSchemes.some(saved => (saved.id === s.id || saved.scheme_id === s.id));
    }
    if (schemeFilter === 'high_match') {
      return (s.eligibility_match || 85) >= 90;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 space-y-6">
      {/* 1. CIVIC HEADER & BENEFICIARY PROFILE BANNER */}
      <div className="bg-white border-2 border-slate-200/90 rounded-3xl p-5 sm:p-7 shadow-sm relative overflow-hidden">
        {/* National Tricolor accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FF9933] via-slate-200 to-[#138808]" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pt-1">
          {/* User Info & Avatar */}
          <div className="flex items-start sm:items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-center font-extrabold text-3xl shadow-md shrink-0 border border-slate-700">
                {user?.avatar || (user?.name ? user.name.charAt(0) : 'C')}
              </div>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-[10px] text-white font-bold" title="Verified Beneficiary">
                ✓
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                  {isHindi ? 'नमस्ते,' : 'Namaste,'} {user?.name || 'Rajesh Sharma'}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
                  <CheckCircle size={12} />
                  <span>{isHindi ? 'सत्यापित नागरिक लाभार्थी' : 'Verified Beneficiary'}</span>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 font-medium">
                <span className="bg-slate-100 text-slate-900 px-2.5 py-0.5 rounded-lg font-bold border border-slate-200">
                  {user?.role || user?.occupation || 'Farmer'}
                </span>
                <span>•</span>
                <span>{user?.state || 'Uttar Pradesh'}</span>
                <span>•</span>
                <span className="text-slate-500">
                  Citizen ID: <strong className="text-slate-900 font-mono">JS-2026-{user?.account_last4 || '4921'}</strong>
                </span>
                <span>•</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <ShieldCheck size={14} /> NPCI Mapped ({user?.bank_name || 'State Bank of India'})
                </span>
              </div>
            </div>
          </div>

          {/* Official Citizen Digital Civic Pass Card (Replaced Switch Persona) */}
          <div className="w-full lg:w-auto bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#1E1B4B] text-white rounded-3xl p-4 sm:p-5 shadow-lg border border-slate-700/80 flex flex-col justify-between gap-3 min-w-[300px]">
            <div className="flex items-center justify-between gap-3 border-b border-slate-700/60 pb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                <Shield size={14} className="text-amber-400" />
                <span>{isHindi ? 'जनसेतु नागरिक डिजिटल पास' : 'JanSetu Digital Civic Pass'}</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>APBS Active</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                  {isHindi ? 'प्राथमिक बैंक खाता' : 'Primary Bank'}
                </span>
                <span className="font-extrabold text-white truncate block text-[11px] mt-0.5">
                  {user?.bank_name || 'State Bank of India'}
                </span>
                <span className="text-slate-400 text-[10px] font-mono">A/C ••••{user?.account_last4 || '4921'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                  {isHindi ? 'सत्यापन स्थिति' : 'Verification'}
                </span>
                <span className="font-bold text-emerald-300 flex items-center gap-1 text-[11px] mt-0.5">
                  <CheckCircle size={12} /> Aadhaar Seeded
                </span>
                <span className="text-slate-400 text-[10px]">DigiLocker Linked</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-700/60 text-[10px]">
              <span className="text-slate-300">
                {isHindi ? 'वार्षिक स्वास्थ्य कवर:' : 'Health Cover:'} <strong className="text-amber-300 font-bold">₹5,00,000</strong>
              </span>
              <button
                type="button"
                onClick={() => setActiveTab('documents')}
                className="text-blue-300 hover:text-white font-bold flex items-center gap-0.5 hover:underline"
              >
                <span>{isHindi ? 'वॉल्ट देखें' : 'View Vault'}</span>
                <ChevronRight size={11} />
              </button>
            </div>
          </div>
        </div>

        {/* Live Civic Alert Notice Banner */}
        <div className="mt-5 p-3.5 rounded-2xl bg-amber-50/80 border border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs shadow-2xs">
          <div className="flex items-center gap-2 text-amber-950 font-medium">
            <AlertCircle size={16} className="text-amber-700 shrink-0" />
            <span>
              {isHindi ? 'स्थिति सूचना:' : 'Civic Advisory:'}{' '}
              <strong className="font-bold text-amber-900">
                {user?.pending_action || 'सभी सरकारी डीबीटी खाते सत्यापित हैं। अगली किस्त सीधे बैंक खाते में प्रेषित होगी।'}
              </strong>
            </span>
          </div>

          <Link
            to="/dbt"
            className="text-xs font-bold text-amber-900 hover:text-black flex items-center gap-1 hover:underline self-end sm:self-auto shrink-0"
          >
            <span>{isHindi ? 'डीबीटी स्थिति जांचें' : 'Check DBT Pipeline'}</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* 2. KEY METRICS SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Eligible Schemes */}
        <div className="bg-gradient-to-br from-white via-white to-blue-50/40 border-2 border-blue-100 hover:border-blue-300 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-600 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {isHindi ? 'पात्र सरकारी योजनाएं' : 'Eligible Schemes'}
              </span>
              <div className="w-9 h-9 rounded-2xl bg-blue-100 text-blue-900 flex items-center justify-center font-bold shadow-2xs">
                <Layers size={17} />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-950">
              {user?.eligible_schemes_count || 14}
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">
              {user?.role || 'Citizen'} ({user?.state || 'UP'})
            </span>
            <span className="text-blue-800 font-bold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 text-[10px]">
              +14 Live
            </span>
          </div>
        </div>

        {/* Card 2: Saved Schemes */}
        <div className="bg-gradient-to-br from-white via-white to-amber-50/40 border-2 border-amber-100 hover:border-amber-300 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-600 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {isHindi ? 'सहेजी गई योजनाएं' : 'Saved Schemes'}
              </span>
              <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center shadow-2xs">
                <Bookmark size={17} />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-950">
              {savedSchemes.length}
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">
              {isHindi ? 'त्वरित आवेदन व दस्तावेज़' : 'Bookmarked review'}
            </span>
            <button
              onClick={() => { setActiveTab('schemes'); setSchemeFilter('saved'); }}
              className="text-amber-800 font-bold hover:underline text-[11px]"
            >
              {isHindi ? 'देखें' : 'View'} →
            </button>
          </div>
        </div>

        {/* Card 3: Total DBT Disbursed */}
        <div className="bg-gradient-to-br from-white via-white to-emerald-50/40 border-2 border-emerald-100 hover:border-emerald-300 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-600 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                {isHindi ? 'डीबीटी प्राप्त लाभ' : 'DBT Disbursed'}
              </span>
              <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-900 flex items-center justify-center shadow-2xs">
                <TrendingUp size={17} />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-950">
              ₹{(user?.dbt_benefit_total || 36000).toLocaleString('en-IN')}
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
              <CheckCircle size={12} /> सीधे बैंक खाते में प्राप्त
            </span>
            <span className="text-emerald-800 font-bold text-[10px] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              100% Success
            </span>
          </div>
        </div>

        {/* Card 4: DBT Health Score */}
        <div className="bg-gradient-to-br from-white via-white to-teal-50/40 border-2 border-teal-100 hover:border-teal-300 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-600 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {isHindi ? 'डीबीटी स्वास्थ्य स्कोर' : 'DBT Health Score'}
              </span>
              <div className="w-9 h-9 rounded-2xl bg-teal-100 text-teal-900 flex items-center justify-center shadow-2xs">
                <ShieldCheck size={17} />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-950">
                {user?.dbt_health_score || 98}%
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                {isHindi ? 'उत्तम स्थिति' : 'Healthy'}
              </span>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium truncate text-[11px]">
              {user?.npci_status || 'NPCI मैपर सक्रिय'}
            </span>
            <button
              onClick={() => setActiveTab('dbt_health')}
              className="text-teal-800 font-bold hover:underline text-[11px] shrink-0"
            >
              {isHindi ? 'जांचें' : 'Check'} →
            </button>
          </div>
        </div>
      </div>

      {/* 3. QUICK ACTION LAUNCHPAD (5 PRIMARY HUBS) */}
      <div className="bg-white border-2 border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-sm space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-black text-slate-950">
            <Compass size={18} className="text-blue-900" />
            <span>{isHindi ? 'त्वरित नागरिक सेवा केंद्र (Quick Civic Launchpad)' : 'Quick Civic Action Launchpad'}</span>
          </div>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            {isHindi ? '1-क्लिक में आधिकारिक सहायता प्राप्त करें' : 'One-click direct civic tools'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Action 1: Scheme Finder */}
          <Link
            to="/schemes"
            className="p-4 bg-gradient-to-br from-blue-50/70 to-indigo-50/50 hover:from-blue-100/70 hover:to-indigo-100/60 border border-blue-200/80 hover:border-blue-400 rounded-2xl flex flex-col justify-between transition-all group shadow-2xs hover:shadow-xs active:scale-[0.98]"
          >
            <div className="w-10 h-10 rounded-2xl bg-white border border-blue-300 flex items-center justify-center text-blue-900 group-hover:scale-110 transition-transform mb-2.5 shadow-2xs">
              <Layers size={19} />
            </div>
            <div>
              <div className="text-xs font-black text-slate-950 group-hover:text-blue-950">
                {isHindi ? 'योजना खोजक' : 'Scheme Finder'}
              </div>
              <p className="text-[11px] text-blue-900 font-medium mt-0.5 line-clamp-1">
                {isHindi ? 'बोलकर व श्रेणी से' : 'Voice & Smart Match'}
              </p>
            </div>
          </Link>

          {/* Action 2: DBT Detective */}
          <Link
            to="/dbt"
            className="p-4 bg-gradient-to-br from-amber-50/80 to-orange-50/50 hover:from-amber-100/80 hover:to-orange-100/60 border border-amber-200/80 hover:border-amber-400 rounded-2xl flex flex-col justify-between transition-all group shadow-2xs hover:shadow-xs active:scale-[0.98]"
          >
            <div className="w-10 h-10 rounded-2xl bg-white border border-amber-300 flex items-center justify-center text-amber-800 group-hover:scale-110 transition-transform mb-2.5 shadow-2xs">
              <AlertCircle size={19} />
            </div>
            <div>
              <div className="text-xs font-black text-amber-950 group-hover:text-black">
                {isHindi ? 'डीबीटी डिटेक्टिव' : 'DBT Detective'}
              </div>
              <p className="text-[11px] text-amber-900 font-medium mt-0.5 line-clamp-1">
                {isHindi ? 'रुके पैसे का निदान' : 'Stalled Payment Solver'}
              </p>
            </div>
          </Link>

          {/* Action 3: AI Sahayak */}
          <Link
            to="/chat"
            className="p-4 bg-gradient-to-br from-sky-50/80 to-cyan-50/50 hover:from-sky-100/80 hover:to-cyan-100/60 border border-sky-200/80 hover:border-sky-400 rounded-2xl flex flex-col justify-between transition-all group shadow-2xs hover:shadow-xs active:scale-[0.98]"
          >
            <div className="w-10 h-10 rounded-2xl bg-white border border-sky-300 flex items-center justify-center text-sky-800 group-hover:scale-110 transition-transform mb-2.5 shadow-2xs">
              <MessageSquare size={19} />
            </div>
            <div>
              <div className="text-xs font-black text-sky-950 group-hover:text-black">
                {isHindi ? 'जनसेतु AI सहायक' : 'AI Sahayak'}
              </div>
              <p className="text-[11px] text-sky-900 font-medium mt-0.5 line-clamp-1">
                {isHindi ? 'समस्या समाधान चैट' : 'Civic Issue Chatbot'}
              </p>
            </div>
          </Link>

          {/* Action 4: Loan Discovery */}
          <Link
            to="/loans"
            className="p-4 bg-gradient-to-br from-emerald-50/80 to-teal-50/50 hover:from-emerald-100/80 hover:to-teal-100/60 border border-emerald-200/80 hover:border-emerald-400 rounded-2xl flex flex-col justify-between transition-all group shadow-2xs hover:shadow-xs active:scale-[0.98]"
          >
            <div className="w-10 h-10 rounded-2xl bg-white border border-emerald-300 flex items-center justify-center text-emerald-800 group-hover:scale-110 transition-transform mb-2.5 shadow-2xs">
              <Banknote size={19} />
            </div>
            <div>
              <div className="text-xs font-black text-emerald-950 group-hover:text-black">
                {isHindi ? 'सरकारी ऋण' : 'Loan Discovery'}
              </div>
              <p className="text-[11px] text-emerald-900 font-medium mt-0.5 line-clamp-1">
                {isHindi ? 'मुद्रा व स्वनिधि लोन' : 'Mudra & Collateral-Free'}
              </p>
            </div>
          </Link>

          {/* Action 5: Documents Vault */}
          <button
            type="button"
            onClick={() => setActiveTab('documents')}
            className="p-4 bg-gradient-to-br from-purple-50/80 to-violet-50/50 hover:from-purple-100/80 hover:to-violet-100/60 border border-purple-200/80 hover:border-purple-400 rounded-2xl flex flex-col justify-between transition-all group shadow-2xs hover:shadow-xs text-left active:scale-[0.98]"
          >
            <div className="w-10 h-10 rounded-2xl bg-white border border-purple-300 flex items-center justify-center text-purple-800 group-hover:scale-110 transition-transform mb-2.5 shadow-2xs">
              <FileText size={19} />
            </div>
            <div>
              <div className="text-xs font-black text-purple-950 group-hover:text-black">
                {isHindi ? 'दस्तावेज़ वॉल्ट' : 'Document Vault'}
              </div>
              <p className="text-[11px] text-purple-900 font-medium mt-0.5 line-clamp-1">
                {isHindi ? 'पारिवारिक लॉकर' : 'Family DigiVault'}
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* 4. MAIN DASHBOARD CONTENT TABS */}
      <div className="flex items-center gap-2 border-b-2 border-slate-200 pb-2 overflow-x-auto no-scrollbar text-xs sm:text-sm">
        <button
          onClick={() => setActiveTab('schemes')}
          className={`px-4 py-2.5 font-bold rounded-xl transition-all shrink-0 flex items-center gap-2 ${
            activeTab === 'schemes'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
          }`}
        >
          <Layers size={15} />
          <span>{isHindi ? `अनुकूलित योजनाएं (${displaySchemes.length})` : `Tailored Schemes (${displaySchemes.length})`}</span>
        </button>

        <button
          onClick={() => setActiveTab('dbt_health')}
          className={`px-4 py-2.5 font-bold rounded-xl transition-all shrink-0 flex items-center gap-2 ${
            activeTab === 'dbt_health'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck size={15} />
          <span>{isHindi ? 'डीबीटी स्वास्थ्य व पाइपलाइन' : 'DBT Payment Health'}</span>
        </button>

        <button
          onClick={() => setActiveTab('documents')}
          className={`px-4 py-2.5 font-bold rounded-xl transition-all shrink-0 flex items-center gap-2 ${
            activeTab === 'documents'
              ? 'bg-slate-900 text-white shadow-sm ring-2 ring-emerald-500'
              : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
          }`}
        >
          <FileCheck2 size={15} className="text-emerald-600" />
          <span>{isHindi ? 'दस्तावेज़ वॉल्ट' : 'Document Vault'}</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold">
            Family Vault
          </span>
        </button>

        <button
          onClick={() => setActiveTab('calendar')}
          className={`px-4 py-2.5 font-bold rounded-xl transition-all shrink-0 flex items-center gap-2 ${
            activeTab === 'calendar'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
          }`}
        >
          <Calendar size={15} />
          <span>{isHindi ? 'डीबीटी किस्त कैलेंडर' : 'Disbursement Calendar'}</span>
        </button>
      </div>

      {/* 5. TAB 1: TAILORED & SAVED SCHEMES */}
      {activeTab === 'schemes' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Schemes List (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Filter & Search Bar */}
            <div className="bg-white border-2 border-slate-200/90 rounded-3xl p-4 sm:p-5 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3.5 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={dashboardSearch}
                    onChange={(e) => setDashboardSearch(e.target.value)}
                    placeholder={isHindi ? 'योजना का नाम या लाभ खोजें...' : 'Filter schemes by name or benefit...'}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-800 font-medium"
                  />
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setSchemeFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      schemeFilter === 'all'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    All ({allSchemes.length})
                  </button>
                  <button
                    onClick={() => setSchemeFilter('high_match')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      schemeFilter === 'high_match'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    High Match (&gt;90%)
                  </button>
                  <button
                    onClick={() => setSchemeFilter('saved')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                      schemeFilter === 'saved'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <Bookmark size={12} />
                    <span>Saved ({savedSchemes.length})</span>
                  </button>
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar text-xs">
                {['All', 'Agriculture', 'Healthcare', 'Education', 'Financial Assistance', 'Pension', 'Housing'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-colors ${
                      categoryFilter === cat
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Scheme Cards Grid */}
            <div className="space-y-4">
              {displaySchemes.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-slate-300 rounded-3xl p-10 text-center space-y-2">
                  <Bookmark size={32} className="mx-auto text-slate-400" />
                  <h3 className="text-sm font-bold text-slate-800">
                    {isHindi ? 'कोई योजना नहीं मिली' : 'No schemes match your filter'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isHindi ? 'कृपया सर्च कीवर्ड या श्रेणी रीसेट करें।' : 'Try resetting your search query or category.'}
                  </p>
                  <button
                    onClick={() => { setSchemeFilter('all'); setCategoryFilter('All'); setDashboardSearch(''); }}
                    className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                displaySchemes.map((s) => {
                  const isSaved = savedSchemes.some(item => item.id === s.id || item.scheme_id === s.id);
                  return (
                    <div
                      key={s.id}
                      className="bg-white border-2 border-slate-200/90 hover:border-slate-400 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-2 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded-md border border-slate-200">
                              {s.category}
                            </span>
                            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded-md flex items-center gap-1 shadow-2xs">
                              <Sparkles size={11} className="text-emerald-700" />
                              <span>{s.eligibility_match || 90}% Match for {user?.occupation || 'Profile'}</span>
                            </span>
                          </div>

                          <h3 className="text-base font-extrabold text-slate-950">
                            {isHindi ? s.name_hi || s.name : s.name}
                          </h3>

                          <p className="text-xs text-slate-600 leading-relaxed font-medium">
                            {isHindi ? s.benefits_hi || s.benefits : s.benefits}
                          </p>

                          {/* Documents Preview */}
                          {s.docs && (
                            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
                              <span className="font-bold text-slate-700">
                                {isHindi ? 'आवश्यक दस्तावेज़:' : 'Required:'}
                              </span>
                              {s.docs.map((d, i) => (
                                <span key={i} className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md text-[10px] font-medium border border-slate-200">
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
                              className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 active:scale-95"
                            >
                              <span>{t('applyNow')}</span>
                              <ExternalLink size={12} />
                            </a>
                          )}

                          {isSaved ? (
                            <button
                              onClick={() => handleRemoveSaved(s.id)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded-xl transition-colors"
                              title="Remove bookmark"
                            >
                              <Trash2 size={16} />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSaveScheme(s)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors border border-slate-200"
                            >
                              + {isHindi ? 'सहेजें' : 'Save'}
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
            <div className="bg-white border-2 border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
                  <Sparkles size={18} className="text-amber-300" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-950">
                    {isHindi ? 'जनसेतु एआई सहायक' : 'AI Sahayak Assistant'}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {isHindi ? 'दस्तावेज़ व समस्या निवारण' : 'Ask about documents & schemes'}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {[
                  isHindi
                    ? 'पीएम किसान की ₹2,000 की किस्त रुकने पर बैंक को क्या पत्र दें?'
                    : 'What application letter to submit to bank for PM-KISAN stopped installment?',
                  isHindi
                    ? 'एनएसपी छात्रवृत्ति के लिए बैंक खाते की कौन सी लिमिट हटवानी पड़ती है?'
                    : 'Which bank account deposit limit needs to be removed for student scholarship?',
                  isHindi
                    ? 'वृद्धावस्था/विधवा पेंशन के लिए जीवन प्रमाण पत्र मोबाइल से कैसे जमा करें?'
                    : 'How to submit Jeevan Pramaan digital life certificate from mobile?'
                ].map((promptText, i) => (
                  <button
                    key={i}
                    onClick={() => navigate('/chat', { state: { initialPrompt: promptText } })}
                    className="w-full text-left p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-medium border border-slate-200 transition-colors flex items-center justify-between gap-2 group shadow-2xs"
                  >
                    <span className="line-clamp-2">{promptText}</span>
                    <ArrowRight size={13} className="text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-transform shrink-0" />
                  </button>
                ))}
              </div>

              <Link
                to="/chat"
                className="block text-center w-full py-3 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-2xl transition-all shadow-md active:scale-95"
              >
                {isHindi ? 'पूरा एआई चैट खोलें' : 'Open Full AI Sahayak Chat'}
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 6. TAB 2: DBT PAYMENT HEALTH & DIAGNOSTIC SIMULATOR */}
      {activeTab === 'dbt_health' && (
        <div className="space-y-6">
          {/* 4-Step Aadhaar-Bank Seeding Health Tracker */}
          <div className="bg-white border-2 border-slate-200/90 rounded-3xl p-5 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-2">
              <div>
                <h2 className="text-lg font-bold text-slate-950 flex items-center gap-2">
                  <ShieldCheck size={22} className="text-emerald-600" />
                  <span>{isHindi ? 'आधार प्रत्यक्ष लाभ अंतरण (DBT) स्वास्थ्य पाइपलाइन' : 'Aadhaar Direct Benefit Transfer (DBT) Health Pipeline'}</span>
                </h2>
                <p className="text-xs text-slate-600 mt-1 font-medium">
                  {isHindi
                    ? 'UIDAI, NPCI मैपर एवं सार्वजनिक वित्तीय प्रबंधन प्रणाली (PFMS) के साथ वास्तविक समय समन्वय स्थिति।'
                    : 'Real-time synchronization status across UIDAI, NPCI Mapper, and Public Financial Management System (PFMS).'}
                </p>
              </div>

              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-full self-start sm:self-auto flex items-center gap-1.5 border border-emerald-300 shadow-2xs">
                <CheckCircle2 size={15} />
                <span>Overall Health: {user?.dbt_health_score || 98}%</span>
              </span>
            </div>

            {/* Stepper Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Step 1</span>
                  <CheckCircle2 size={16} className="text-emerald-600" />
                </div>
                <h4 className="text-xs font-bold text-emerald-950">
                  {isHindi ? 'आधार व मोबाइल लिंकेज' : 'Aadhaar & Mobile Link'}
                </h4>
                <p className="text-[11px] text-emerald-850 font-medium">
                  {isHindi ? 'UIDAI स्थिति: सक्रिय। आधार OTP प्रमाणीकरण चालू है।' : 'UIDAI status: Active. Mobile OTP authorization active.'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Step 2</span>
                  <CheckCircle2 size={16} className="text-emerald-600" />
                </div>
                <h4 className="text-xs font-bold text-emerald-950">
                  {isHindi ? 'बैंक खाता KYC सत्यापन' : 'Bank KYC Verification'}
                </h4>
                <p className="text-[11px] text-emerald-850 font-medium">
                  {user?.bank_name || 'SBI'} A/C ••••{user?.account_last4 || '4921'} KYC पूर्ण है।
                </p>
              </div>

              <div className={`p-4 rounded-2xl space-y-2 shadow-2xs ${
                user?.npci_status?.includes('Inactive')
                  ? 'bg-amber-50 border border-amber-300'
                  : 'bg-emerald-50/70 border border-emerald-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Step 3</span>
                  {user?.npci_status?.includes('Inactive') ? (
                    <AlertTriangle size={16} className="text-amber-600" />
                  ) : (
                    <CheckCircle2 size={16} className="text-emerald-600" />
                  )}
                </div>
                <h4 className="text-xs font-bold text-slate-950">
                  {isHindi ? 'NPCI DBT मैपर सहमति' : 'NPCI DBT Mapper Consent'}
                </h4>
                <p className="text-[11px] text-slate-700 font-medium">
                  {user?.npci_status || 'Active & Seeded for government credit'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Step 4</span>
                  <CheckCircle2 size={16} className="text-emerald-600" />
                </div>
                <h4 className="text-xs font-bold text-emerald-950">
                  {isHindi ? 'PFMS लाभार्थी कोड' : 'PFMS Beneficiary Code'}
                </h4>
                <p className="text-[11px] text-emerald-850 font-medium">
                  {isHindi ? 'pfms.nic.in पर पंजीकृत एवं वैध लाभार्थी।' : 'Beneficiary registered and valid on pfms.nic.in.'}
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Diagnostic Simulator Widget */}
          <div className="bg-white border-2 border-slate-200/90 rounded-3xl p-5 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <h3 className="text-base font-bold text-slate-950 flex items-center gap-2">
                  <AlertCircle size={18} className="text-amber-600" />
                  <span>{isHindi ? 'रुके भुगतान का 10-सेकंड त्वरित निदान' : 'Stalled Payment Diagnostic Simulator'}</span>
                </h3>
                <p className="text-xs text-slate-600 mt-0.5 font-medium">
                  {isHindi
                    ? 'जांचने के लिए योजना चुनें और देखें कि क्या किसी तकनीकी कारण से किस्त रुकी है:'
                    : 'Select a government scheme to verify if your latest DBT installment has any blocking flags:'}
                </p>
              </div>

              <Link
                to="/dbt"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs rounded-xl self-start sm:self-auto border border-slate-300"
              >
                <span>{isHindi ? 'पूरा डीबीटी डिटेक्टिव खोलें' : 'Full DBT Detective Tool'}</span>
                <ArrowRight size={12} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 mb-4">
              {[
                { id: 'pmkisan', label: isHindi ? '🌾 पीएम-किसान (सब्सिडी)' : 'PM-KISAN (Farmer Subsidy)' },
                { id: 'scholarship', label: isHindi ? '🎓 NSP छात्रवृत्ति (पोस्ट-मैट्रिक)' : 'NSP Scholarship (Post-Matric)' },
                { id: 'pension', label: isHindi ? '👵 वृद्धा/विधवा पेंशन' : 'Old Age / Widow Pension' },
                { id: 'pmay', label: isHindi ? '🏠 पीएम आवास किस्त' : 'PMAY Housing Installment' }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => { setSelectedIssueScheme(opt.id); setDiagResult(null); }}
                  className={`p-3 rounded-2xl text-xs font-bold text-left transition-all border ${
                    selectedIssueScheme === opt.id
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <button
              onClick={handleRunQuickDiag}
              disabled={diagLoading}
              className="px-6 py-3 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-2 active:scale-95"
            >
              {diagLoading ? (
                <>
                  <RotateCcw size={14} className="animate-spin" />
                  <span>{isHindi ? 'PFMS व NPCI गेटवे से जांच की जा रही है...' : 'Querying PFMS & NPCI Gateway...'}</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} className="text-amber-400" />
                  <span>{isHindi ? '10-सेकंड डीबीटी डायग्नोस्टिक चलाएं' : 'Run 10-Second DBT Diagnostic Check'}</span>
                </>
              )}
            </button>

            {/* Diagnostic Result Callout */}
            {diagResult && (
              <div className="mt-6 p-5 rounded-3xl bg-slate-50 border-2 border-slate-200/90 space-y-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {diagResult.severity === 'High' ? (
                      <AlertTriangle size={18} className="text-red-600" />
                    ) : diagResult.severity === 'Medium' ? (
                      <AlertCircle size={18} className="text-amber-600" />
                    ) : (
                      <CheckCircle2 size={18} className="text-emerald-600" />
                    )}
                    <h4 className="text-sm font-bold text-slate-950">{diagResult.title}</h4>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    diagResult.severity === 'High'
                      ? 'bg-red-100 text-red-800 border border-red-300'
                      : diagResult.severity === 'Medium'
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  }`}>
                    Severity: {diagResult.severity}
                  </span>
                </div>

                <div className="text-xs text-slate-700 leading-relaxed font-medium">
                  <strong>{isHindi ? 'पहचाना गया कारण:' : 'Identified Cause:'}</strong> {diagResult.cause}
                </div>

                <div className="p-3 bg-white rounded-2xl border border-slate-200 text-xs text-slate-900 leading-relaxed shadow-2xs">
                  <strong className="text-slate-950">{isHindi ? 'आधिकारिक समाधान कदम:' : 'Official Rectification Step:'}</strong> {diagResult.action}
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Link
                    to="/dbt"
                    className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs"
                  >
                    {isHindi ? 'पूर्ण डायग्नोस्टिक रिपोर्ट (PDF) जनरेट करें' : 'Generate Full Diagnostic Report (PDF)'}
                  </Link>
                  <Link
                    to="/chat"
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-950 text-xs font-bold rounded-xl border border-slate-300"
                  >
                    {isHindi ? 'एआई सहायक से बैंक आवेदन पत्र लें' : 'Ask AI Sahayak for Form Template'}
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 7. TAB 3: FAMILY DOCUMENTS & DIGITAL VAULT */}
      {activeTab === 'documents' && (
        <FamilyDocumentsVault isHindi={isHindi} currentUser={user} />
      )}

      {/* 8. TAB 4: DBT INSTALLMENT CALENDAR */}
      {activeTab === 'calendar' && (
        <div className="bg-white border-2 border-slate-200/90 rounded-3xl p-5 sm:p-8 shadow-sm space-y-6">
          <div className="pb-5 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-950 flex items-center gap-2">
              <Calendar size={20} className="text-slate-900" />
              <span>{isHindi ? 'डीबीटी वितरण अनुसूची एवं सरकारी परामर्श' : 'DBT Disbursement Schedule & Government Advisories'}</span>
            </h2>
            <p className="text-xs text-slate-600 mt-0.5 font-medium">
              {isHindi
                ? 'आगामी केंद्रीय एवं राज्य कल्याणकारी योजनाओं की प्रत्यक्ष किस्त अंतरण समय-सारिणी।'
                : 'Official timeline for upcoming central and state welfare credit installments.'}
            </p>
          </div>

          <div className="space-y-3.5">
            {[
              {
                scheme: isHindi ? 'प्रधानमंत्री किसान सम्मान निधि (17वीं किस्त)' : 'PM Kisan Samman Nidhi (17th Installment)',
                amount: '₹2,000',
                date: 'November 2026',
                status: isHindi ? 'निर्धारित' : 'Scheduled',
                statusColor: 'text-emerald-800 bg-emerald-100 border border-emerald-300',
                note: isHindi ? 'e-KYC पूर्ण किसानों के आधार-सीडेड बैंक खाते में प्रत्यक्ष अंतरण होगा।' : 'Eligible landholders with active e-KYC will receive direct credit.'
              },
              {
                scheme: isHindi ? 'एनएसपी पोस्ट-मैट्रिक छात्रवृत्ति बैच वितरण' : 'NSP Post-Matric Scholarship Batch Disbursal',
                amount: '₹18,500',
                date: 'Processing (Expected 10 Days)',
                status: isHindi ? 'राज्य कोष स्तर पर' : 'At State Treasury',
                statusColor: 'text-amber-800 bg-amber-100 border border-amber-300',
                note: isHindi ? 'संस्थान स्तर पर सत्यापन पूर्ण होकर पीएफएमएस को प्रेषित किया गया है।' : 'Institutions verification complete. Sent to PFMS.'
              },
              {
                scheme: isHindi ? 'अटल पेंशन योजना मासिक स्वतः कटौती' : 'Atal Pension Yojana Monthly Auto-Debit',
                amount: '₹210',
                date: '1st of Every Month',
                status: isHindi ? 'नियमित' : 'Recurring',
                statusColor: 'text-slate-800 bg-slate-100 border border-slate-300',
                note: isHindi ? '60 वर्ष की आयु में ₹3,000 मासिक पेंशन गारंटी हेतु सक्रिय योगदान।' : 'Maintains eligibility for ₹3,000 monthly guaranteed pension at age 60.'
              }
            ].map((item, idx) => (
              <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.statusColor}`}>
                      {item.status}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">{item.date}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-950">{item.scheme}</h4>
                  <p className="text-xs text-slate-600 font-medium">{item.note}</p>
                </div>
                <div className="text-right sm:shrink-0">
                  <div className="text-xs text-slate-500 font-medium">{isHindi ? 'अनुमानित राशि' : 'Estimated Amount'}</div>
                  <div className="text-base font-extrabold text-slate-950">{item.amount}</div>
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
