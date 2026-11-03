import React, { useState, useLayoutEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Compass,
  AlertCircle,
  MessageSquare,
  ShieldCheck,
  Search,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  FileText,
  Users,
  Award,
  ChevronDown,
  Sparkles,
  LayoutDashboard,
  ExternalLink,
  Layers,
  Banknote,
  FileCheck,
  ShieldAlert,
  Mic
} from 'lucide-react';
import HeroMosaic from '../components/HeroMosaic';

// Entrance plays once per page load (not on every client-side navigation).
let introPlayed = false;

function LandingPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [openFaq, setOpenFaq] = useState(null);

  const isHindi = i18n.language === 'hi';

  useLayoutEffect(() => {
    const root = document.documentElement;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced || introPlayed) return undefined;
    introPlayed = true;
    root.classList.add('intro');
    const raf = requestAnimationFrame(() => root.classList.add('intro-run'));
    const t = setTimeout(() => root.classList.remove('intro'), 4000);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
      root.classList.remove('intro', 'intro-run');
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/schemes?q=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/schemes');
    }
  };

  const quickPills = [
    { labelHi: '🌾 पीएम किसान', labelEn: '🌾 PM-Kisan', query: 'PM-Kisan' },
    { labelHi: '🎓 छात्रवृत्ति', labelEn: '🎓 Scholarships', query: 'Scholarship' },
    { labelHi: '🏥 आयुष्मान कार्ड', labelEn: '🏥 Ayushman Card', query: 'Ayushman' },
    { labelHi: '👵 वृद्धा पेंशन', labelEn: '👵 Pension', query: 'Pension' },
    { labelHi: '💼 मुद्रा लोन', labelEn: '💼 Mudra Loan', query: 'Mudra' },
    { labelHi: '🏠 आवास योजना', labelEn: '🏠 PMAY Housing', query: 'Housing' }
  ];

  const services = [
    {
      title: isHindi ? 'डीबीटी विफलता जासूस' : 'DBT Failure Detective',
      desc: isHindi
        ? 'रुकी हुई छात्रवृत्ति, किसान सम्मान निधि या पेंशन का सटीक कारण पहचानें और आधिकारिक निवारण रिपोर्ट पाएं।'
        : 'Step-by-step diagnostic engine to identify and resolve stalled government subsidies, scholarships, and pensions.',
      icon: AlertCircle,
      badge: isHindi ? 'मुख्य सुविधा' : 'Main Feature',
      to: '/dbt',
      color: 'bg-amber-100 text-amber-900'
    },
    {
      title: isHindi ? 'सरकारी योजना खोजक' : 'Government Scheme Finder',
      desc: isHindi
        ? 'शिक्षा, कृषि, आवास, स्वास्थ्य और पेंशन की 25+ सत्यापित योजनाओं में अपनी पात्रता जांचें।'
        : 'Explore 25+ verified central and state welfare schemes filtered by category, occupation, and criteria.',
      icon: Compass,
      badge: '25+ Verified',
      to: '/schemes',
      color: 'bg-blue-100 text-blue-900'
    },
    {
      title: isHindi ? 'जनसेतु AI सहायक' : 'JanSetu AI Sahayak',
      desc: isHindi
        ? 'हिंदी या अंग्रेज़ी में बोलकर या लिखकर सरकारी योजनाओं और प्रक्रियाओं की आधिकारिक जानकारी प्राप्त करें।'
        : 'Bilingual conversational assistant grounded in verified government guidelines with zero hallucinations.',
      icon: MessageSquare,
      badge: 'RAG Grounded',
      to: '/chat',
      color: 'bg-emerald-100 text-emerald-900'
    },
    {
      title: isHindi ? 'ऋण खोज एवं धोखाधड़ी जागरूकता' : 'Formal Loans & Fraud Check',
      desc: isHindi
        ? 'मुद्रा और केसीसी जैसे वैध ऋण खोजें और व्हाट्सएप व अवैध ऐप घोटालों से सावधान रहें।'
        : 'Discover official collateral-free schemes (Mudra, SVANidhi) and spot predatory fake loan apps.',
      icon: ShieldCheck,
      badge: 'Cyber Awareness',
      to: '/loans',
      color: 'bg-purple-100 text-purple-900'
    }
  ];

  const spotlightSchemes = [
    {
      id: 1,
      name: 'PM Kisan Samman Nidhi (PM-KISAN)',
      name_hi: 'प्रधानमंत्री किसान सम्मान निधि योजना',
      category: 'Agriculture',
      benefit: '₹6,000 / वर्ष सीधे आधार-सीडेड बैंक खाते में (3 किस्तों में)',
      benefitEn: '₹6,000/year directly into Aadhaar-seeded bank account in 3 installments',
      docs: ['आधार कार्ड', 'खतौनी', 'बैंक पासबुक'],
      docsEn: ['Aadhaar', 'Land Record', 'Bank Passbook'],
      url: 'https://pmkisan.gov.in',
      match: '98%'
    },
    {
      id: 2,
      name: 'Ayushman Bharat PM-JAY',
      name_hi: 'आयुष्मान भारत प्रधानमंत्री जन आरोग्य योजना',
      category: 'Healthcare',
      benefit: 'प्रति परिवार प्रति वर्ष ₹5 लाख तक का कैशलेस अस्पताल इलाज',
      benefitEn: '₹5 Lakh per family per year cashless hospital treatment',
      docs: ['आधार कार्ड', 'राशन कार्ड', 'मोबाइल नंबर'],
      docsEn: ['Aadhaar', 'Ration Card', 'Mobile Number'],
      url: 'https://pmjay.gov.in',
      match: '94%'
    },
    {
      id: 3,
      name: 'PM Mudra Yojana (PMMY)',
      name_hi: 'प्रधानमंत्री मुद्रा योजना (व्यापार ऋण)',
      category: 'Financial Assistance',
      benefit: 'बिना किसी गारंटी के ₹50,000 से ₹10 लाख तक का व्यापारिक ऋण',
      benefitEn: 'Collateral-free business credit from ₹50,000 up to ₹10 Lakh',
      docs: ['आधार कार्ड', 'पैन कार्ड', 'उद्यम रजिस्ट्रेशन'],
      docsEn: ['Aadhaar', 'PAN Card', 'Udyam Certificate'],
      url: 'https://www.mudra.org.in',
      match: '90%'
    }
  ];

  const steps = [
    {
      step: '01',
      titleHi: 'बोलकर या स्थिति बताएं',
      titleEn: 'Describe Your Need by Voice or Text',
      descHi: 'माइक पर बोलें या लिखें कि आपको क्या आवश्यकता है (जैसे: किसान, छात्र, पेंशन, आवास या लोन)।',
      descEn: 'Speak or type what you need—farming support, student scholarship, old-age pension, or business loan.'
    },
    {
      step: '02',
      titleHi: 'पात्रता व दस्तावेज़ सूची पाएं',
      titleEn: 'Instant Eligibility & Document Checklist',
      descHi: 'जनसेतु एआई तुरंत आपकी पात्रता जांचकर आवेदन हेतु आवश्यक सरकारी दस्तावेजों की चेकलिस्ट निकालता है।',
      descEn: 'JanSetu matches your profile with 25+ verified welfare schemes and auto-extracts required documents.'
    },
    {
      step: '03',
      titleHi: 'रुके पैसे का निदान व सीधा आवेदन',
      titleEn: 'Resolve Stalled DBT & Apply Directly',
      descHi: 'यदि कोई किस्त रुकी है तो DBT Detective से बैंक आवेदन पत्र लें और आधिकारिक सरकारी पोर्टल पर सीधा आवेदन करें।',
      descEn: 'Troubleshoot payment failures, download ready-to-copy bank application letters, and apply on official portals.'
    }
  ];

  const faqs = [
    {
      q: isHindi ? 'जनसेतु क्या है और यह नागरिकों की कैसे मदद करता है?' : 'What is JanSetu and how does it help citizens?',
      a: isHindi
        ? 'जनसेतु एक द्विभाषी (हिंदी + अंग्रेज़ी) नागरिक सहायता मंच है जो नागरिकों को उनकी पात्र सरकारी योजनाएं खोजने, आधार-बैंक सीडिंग जैसी डीबीटी विफलताओं का निवारण करने और एआई द्वारा सही सरकारी पोर्टल तक पहुंचने में मदद करता है।'
        : 'JanSetu is a bilingual civic assistance platform. It bridges citizens with verified welfare schemes and provides rule-based DBT diagnostics to resolve stalled bank credits.'
    },
    {
      q: isHindi ? 'डीबीटी (DBT) भुगतान क्यों रुक जाता है?' : 'Why do government DBT payments fail or get delayed?',
      a: isHindi
        ? 'डीबीटी भुगतान रुकने के मुख्य कारण होते हैं: बैंक खाते का एनपीसीआई मैपर में आधार से सीड न होना, वार्षिक ई-केवाईसी या जीवन प्रमाण पत्र लंबित होना, या जनधन खाते की ₹1 लाख जमा सीमा पार होना।'
        : 'Most DBT failures occur due to missing Aadhaar-bank seeding in the NPCI mapper, pending e-KYC/Life Certificates, bank merger IFSC changes, or account dormant/credit limit ceilings.'
    },
    {
      q: isHindi ? 'क्या जनसेतु पर जानकारी पूरी तरह सत्यापित है?' : 'Is the information on JanSetu officially verified?',
      a: isHindi
        ? 'हाँ। जनसेतु का पूरा डेटाबेस myscheme.gov.in, pfms.nic.in, pmkisan.gov.in और uidai.gov.in जैसे आधिकारिक सार्वजनिक स्रोतों पर आधारित है। हम कभी भी अपुष्ट जानकारी नहीं दिखाते।'
        : 'Yes. All schemes, diagnostic rules, and links are strictly mapped from official public government portals including myscheme.gov.in, pfms.nic.in, and uidai.gov.in.'
    },
    {
      q: isHindi ? 'क्या जनसेतु कोई शुल्क लेता है?' : 'Does JanSetu charge any fee for its services?',
      a: isHindi
        ? 'नहीं! जनसेतु पूरी तरह से निःशुल्क नागरिक सेवा है। सरकारी योजनाओं के आवेदन के लिए कोई अग्रिम शुल्क नहीं लगता।'
        : 'Never. JanSetu is 100% free for all citizens. Government schemes never charge advance fees.'
    }
  ];

  return (
    <div className="space-y-16 pb-12">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-14 rounded-3xl bg-gradient-to-b from-blue-50/70 via-slate-50 to-white border border-slate-200/90 shadow-sm px-4 sm:px-8">
        <div className="hero-split max-w-7xl mx-auto">
          <div className="text-center lg:text-left space-y-5">
            <div style={{ '--i': 0 }} className="hero-fade inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/70 text-blue-900 text-xs font-bold tracking-wide border border-blue-200/80 shadow-xs">
              <Sparkles size={14} className="text-blue-700" />
              <span>{isHindi ? 'डिजिटल भारत • प्रत्यक्ष लाभ अंतरण (DBT) व नागरिक कल्याण सेतु' : 'Digital Welfare Portal • Citizen Civic Bridge'}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-5xl xl:text-6xl font-black text-slate-950 tracking-tight leading-tight">
              <span className="hero-line" style={{ '--i': 0 }}><span>{t('heroTitle')}</span></span>
            </h1>

            <p style={{ '--i': 1 }} className="hero-fade text-sm sm:text-base text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
              {t('heroSubtitle')}
            </p>

            {/* Quick Search Bar with Pills */}
            <div style={{ '--i': 2 }} className="hero-fade max-w-xl mx-auto lg:mx-0 pt-2 space-y-2.5">
              <form onSubmit={handleSearch} className="relative flex items-center">
                <Search size={18} className="absolute left-4 text-slate-400" />
                <input
                  type="text"
                  placeholder={isHindi ? 'योजना खोजें (जैसे: किसान, छात्रवृत्ति, आवास, मुद्रा)...' : 'Search schemes (e.g. PM-Kisan, Scholarship, Housing, Mudra)...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-28 py-3.5 bg-white rounded-2xl border-2 border-slate-300 text-sm text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-800 shadow-sm transition-all font-medium"
                />
                <button
                  type="submit"
                  className="absolute right-2 px-4 py-2 bg-blue-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95"
                >
                  {isHindi ? 'खोजें' : 'Search'}
                </button>
              </form>

              {/* Quick Suggestion Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap">
                  {isHindi ? 'लोकप्रिय:' : 'Popular:'}
                </span>
                {quickPills.map((pill, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => navigate(`/schemes?q=${encodeURIComponent(pill.query)}`)}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-800 rounded-lg text-[11px] font-bold border border-slate-200 transition-colors shadow-2xs whitespace-nowrap"
                  >
                    {isHindi ? pill.labelHi : pill.labelEn}
                  </button>
                ))}
              </div>
            </div>

            {/* Hero CTA Action Buttons */}
            <div style={{ '--i': 3 }} className="hero-fade flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-blue-900 hover:bg-black text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-95"
              >
                <LayoutDashboard size={16} />
                <span>{isHindi ? 'नागरिक डैशबोर्ड' : 'Citizen Dashboard'}</span>
                <ArrowRight size={14} />
              </Link>

              <Link
                to="/dbt"
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-amber-100/80 hover:bg-amber-200 text-amber-950 text-xs sm:text-sm font-bold border border-amber-300 transition-all shadow-2xs active:scale-95"
              >
                <AlertCircle size={16} className="text-amber-800" />
                <span>{t('dbtDetectiveBtn')}</span>
              </Link>

              <Link
                to="/schemes"
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 text-xs sm:text-sm font-bold border border-slate-300 transition-all shadow-2xs active:scale-95"
              >
                <Compass size={16} />
                <span>{t('findSchemesBtn')}</span>
              </Link>

              <Link
                to="/chat"
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 text-xs sm:text-sm font-bold border border-slate-300 transition-all shadow-2xs active:scale-95"
              >
                <MessageSquare size={16} />
                <span>{t('aiSahayakBtn')}</span>
              </Link>
            </div>
          </div>

          <HeroMosaic isHindi={isHindi} />
        </div>
      </section>

      {/* 2. KEY CITIZEN SERVICES (4 PILLARS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-1">
            {isHindi ? 'सत्यापित नागरिक सुविधाएं' : 'Verified Civic Services'}
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-950">
            {isHindi ? 'नागरिक सेवा केंद्र' : 'Key Citizen Services'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1.5 font-medium">
            {isHindi
              ? 'योजना पात्रता जांच से लेकर बैंक डीबीटी समस्या निवारण तक सब कुछ एक ही मंच पर।'
              : 'End-to-end guidance from discovery to payment troubleshooting and official escalation.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((svc) => {
            const Icon = svc.icon;
            return (
              <div
                key={svc.title}
                className="group relative bg-white border-2 border-slate-200 hover:border-slate-400 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl ${svc.color} flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform`}>
                      <Icon size={24} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-800 px-2.5 py-1 rounded-full border border-slate-200">
                      {svc.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-950 mb-2">
                    {svc.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4 font-medium">
                    {svc.desc}
                  </p>
                </div>

                <Link
                  to={svc.to}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 group-hover:text-blue-900 group-hover:underline pt-2 border-t border-slate-100"
                >
                  <span>{isHindi ? 'सेवा का उपयोग करें' : 'Access Service'}</span>
                  <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. HOW JANSETU WORKS (3 SIMPLE STEPS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider bg-blue-800 text-blue-200 px-3 py-1 rounded-full inline-block">
              {isHindi ? 'सरल व पारदर्शी प्रक्रिया' : 'Simple 3-Step Process'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              {isHindi ? 'जनसेतु कैसे कार्य करता है?' : 'How JanSetu Works for Citizens'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              {isHindi ? 'बिना बिचौलियों के सीधे अपने हक की सरकारी योजनाओं और सब्सिडी का लाभ पाएं।' : 'No middleman or broker—get your rightful civic entitlements directly.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((st, sIdx) => (
              <div key={sIdx} className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 space-y-3 relative overflow-hidden">
                <span className="text-4xl font-black text-slate-700/80 absolute top-4 right-4 select-none">
                  {st.step}
                </span>
                <div className="text-xs font-extrabold text-blue-400 uppercase tracking-wider">
                  Step {sIdx + 1}
                </div>
                <h3 className="text-base font-bold text-white">
                  {isHindi ? st.titleHi : st.titleEn}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isHindi ? st.descHi : st.descEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. POPULAR SCHEMES SPOTLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
          <div>
            <div className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-1">
              {isHindi ? 'सत्यापित सरकारी योजनाएं' : 'Featured Welfare Programs'}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950">
              {isHindi ? 'लोकप्रिय सरकारी योजनाएं' : 'Popular Verified Schemes'}
            </h2>
          </div>

          <Link
            to="/schemes"
            className="text-xs font-bold text-blue-900 hover:text-black flex items-center gap-1 hover:underline"
          >
            <span>{isHindi ? 'सभी 25+ योजनाएं देखें' : 'View all 25+ schemes'}</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {spotlightSchemes.map((scheme) => (
            <div
              key={scheme.id}
              className="bg-white border-2 border-slate-200 hover:border-slate-400 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-800 px-2.5 py-1 rounded-full border border-slate-200">
                    {scheme.category}
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    {scheme.match} Match
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-950 mb-2 leading-snug">
                  {isHindi ? scheme.name_hi : scheme.name}
                </h3>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl mb-4 text-xs">
                  <span className="font-semibold text-slate-900 block mb-0.5">
                    {isHindi ? 'योजना लाभ:' : 'Benefits:'}
                  </span>
                  <p className="text-slate-700 leading-relaxed text-[11px]">
                    {isHindi ? scheme.benefit : scheme.benefitEn}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {(isHindi ? scheme.docs : scheme.docsEn).map((doc, dIdx) => (
                    <span
                      key={dIdx}
                      className="inline-flex items-center gap-1 text-[10px] font-medium bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md"
                    >
                      <FileCheck size={11} className="text-emerald-600" />
                      <span>{doc}</span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <Link
                  to="/schemes"
                  className="text-xs font-bold text-slate-900 hover:underline flex items-center gap-1"
                >
                  <span>{isHindi ? 'विवरण देखें' : 'Details'}</span>
                  <ArrowRight size={12} />
                </Link>

                <a
                  href={scheme.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-xs"
                >
                  <span>Apply Now</span>
                  <ExternalLink size={11} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. IMPACT & TRANSPARENCY NUMBERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white border-2 border-slate-200 rounded-3xl p-6 text-center shadow-sm">
          <div>
            <div className="text-3xl sm:text-4xl font-black text-slate-950">25+</div>
            <div className="text-xs text-slate-600 mt-1 font-semibold">{isHindi ? 'सत्यापित योजनाएं' : 'Verified Schemes'}</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-emerald-700">100%</div>
            <div className="text-xs text-slate-600 mt-1 font-semibold">{isHindi ? 'सत्यापित सरकारी डेटा' : 'Grounded Data'}</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-blue-900">22</div>
            <div className="text-xs text-slate-600 mt-1 font-semibold">{isHindi ? 'भारतीय भाषाएं समर्थित' : 'Indian Languages'}</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-purple-700">0₹</div>
            <div className="text-xs text-slate-600 mt-1 font-semibold">{isHindi ? 'निःशुल्क नागरिक सेवा' : '100% Free Service'}</div>
          </div>
        </div>
      </section>

      {/* 6. FREQUENTLY ASKED QUESTIONS */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-950">
            {isHindi ? 'अक्सर पूछे जाने वाले प्रश्न' : 'Frequently Asked Questions'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
            {isHindi ? 'नागरिकों की आम शंकाओं के सरल समाधान' : 'Quick answers to common questions about welfare schemes and DBT'}
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={faq.q}
                className="border-2 border-slate-200 rounded-2xl bg-white overflow-hidden shadow-2xs transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between text-xs sm:text-sm font-bold text-slate-950 hover:bg-slate-50 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={16}
                    className={`text-slate-600 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 text-xs text-slate-700 leading-relaxed border-t border-slate-100 pt-3 font-medium">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
