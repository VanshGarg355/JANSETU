import React, { useState } from 'react';
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
  Sparkles
} from 'lucide-react';

function LandingPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [openFaq, setOpenFaq] = useState(null);

  const isHindi = i18n.language === 'hi';

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/schemes?q=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/schemes');
    }
  };

  const services = [
    {
      title: isHindi ? 'डीबीटी विफलता जासूस' : 'DBT Failure Detective',
      desc: isHindi
        ? 'रुकी हुई छात्रवृत्ति, किसान सम्मान निधि या पेंशन का सटीक कारण पहचानें और आधिकारिक निवारण रिपोर्ट पाएं।'
        : 'Step-by-step diagnostic engine to identify and resolve stalled government subsidies, scholarships, and pensions.',
      icon: AlertCircle,
      badge: 'Main Feature',
      to: '/dbt',
      color: 'border-amber-700/30'
    },
    {
      title: isHindi ? 'सरकारी योजना खोजक' : 'Government Scheme Finder',
      desc: isHindi
        ? 'शिक्षा, कृषि, आवास, स्वास्थ्य और पेंशन की 25+ सत्यापित योजनाओं में अपनी पात्रता जांचें।'
        : 'Explore 25+ verified central and state welfare schemes filtered by category, occupation, and criteria.',
      icon: Compass,
      badge: '25+ Verified',
      to: '/schemes'
    },
    {
      title: isHindi ? 'जनसेतु AI सहायक' : 'JanSetu AI Sahayak',
      desc: isHindi
        ? 'हिंदी या अंग्रेज़ी में बोलकर या लिखकर सरकारी योजनाओं और प्रक्रियाओं की आधिकारिक जानकारी प्राप्त करें।'
        : 'Bilingual conversational assistant grounded in verified government guidelines with zero hallucinations.',
      icon: MessageSquare,
      badge: 'RAG Grounded',
      to: '/chat'
    },
    {
      title: isHindi ? 'ऋण खोज एवं धोखाधड़ी जागरूकता' : 'Formal Loans & Fraud Check',
      desc: isHindi
        ? 'मुद्रा और केसीसी जैसे वैध ऋण खोजें और व्हाट्सएप व अवैध ऐप घोटालों से सावधान रहें।'
        : 'Discover official collateral-free schemes (Mudra, SVANidhi) and spot predatory fake loan apps.',
      icon: ShieldCheck,
      badge: 'Cyber Awareness',
      to: '/loans'
    }
  ];

  const faqs = [
    {
      q: isHindi ? 'जनसेतु क्या है और यह नागरिकों की कैसे मदद करता है?' : 'What is JanSetu and how does it help citizens?',
      a: isHindi
        ? 'जनसेतु एक द्विभाषी (हिंदी + अंग्रेज़ी) नागरिक सहायता मंच है जो नागरिकों को उनकी पात्र सरकारी योजनाएं खोजने, आधार-बैंक सीडिंग जैसी डीबीटी विफलताओं का निवारण करने और एआई द्वारा सही सरकारी पोर्टल तक पहुंचने में मदद करता है।'
        : 'JanSetu is a bilingual civic assistance platform built for Build for Bharat 2026. It bridges citizens with verified welfare schemes and provides rule-based DBT diagnostics to resolve stalled bank credits.'
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
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-14 rounded-3xl bg-gradient-to-b from-taupe-100/90 to-taupe-50 border border-taupe-200 shadow-sm px-4 sm:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-taupe-200 text-taupe-900 text-xs font-semibold tracking-wide border border-taupe-300 shadow-sm">
            <Sparkles size={14} className="text-taupe-800" />
            <span>Build for Bharat 2026 • Team Bit Warriors</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-taupe-950 tracking-tight leading-tight">
            {t('heroTitle')}
          </h1>

          <p className="text-base sm:text-lg text-taupe-700 max-w-2xl mx-auto leading-relaxed">
            {t('heroSubtitle')}
          </p>

          {/* Quick Search */}
          <form onSubmit={handleSearch} className="max-w-xl mx-auto pt-2">
            <div className="relative flex items-center">
              <Search size={18} className="absolute left-4 text-taupe-500" />
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-28 py-3.5 bg-white rounded-2xl border border-taupe-300 text-sm text-taupe-950 placeholder:text-taupe-400 focus:outline-none focus:ring-2 focus:ring-taupe-700 shadow-sm transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 px-4 py-2 bg-taupe-850 hover:bg-taupe-950 text-taupe-50 text-xs font-semibold rounded-xl transition-all shadow-sm"
              >
                {t('searchPlaceholder') ? (isHindi ? 'खोजें' : 'Search') : 'Search'}
              </button>
            </div>
          </form>

          {/* Hero CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <Link
              to="/dbt"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-taupe-850 hover:bg-taupe-950 text-taupe-50 text-sm font-semibold shadow-md hover:shadow-lg transition-all"
            >
              <AlertCircle size={16} />
              <span>{t('dbtDetectiveBtn')}</span>
              <ArrowRight size={14} />
            </Link>

            <Link
              to="/schemes"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-taupe-200 hover:bg-taupe-300 text-taupe-950 text-sm font-semibold border border-taupe-300 transition-all"
            >
              <Compass size={16} />
              <span>{t('findSchemesBtn')}</span>
            </Link>

            <Link
              to="/chat"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-taupe-100 text-taupe-900 text-sm font-semibold border border-taupe-300 transition-all"
            >
              <MessageSquare size={16} />
              <span>{t('aiSahayakBtn')}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-taupe-950">
            {isHindi ? 'नागरिक सेवा केंद्र' : 'Key Citizen Services'}
          </h2>
          <p className="text-xs sm:text-sm text-taupe-600 mt-2">
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
                className="group relative bg-white border border-taupe-200 hover:border-taupe-400 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-taupe-100 text-taupe-900 flex items-center justify-center group-hover:bg-taupe-850 group-hover:text-taupe-50 transition-colors">
                      <Icon size={22} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-taupe-100 text-taupe-800 px-2.5 py-1 rounded-full border border-taupe-200">
                      {svc.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-taupe-950 mb-2">
                    {svc.title}
                  </h3>
                  <p className="text-xs text-taupe-600 leading-relaxed mb-4">
                    {svc.desc}
                  </p>
                </div>

                <Link
                  to={svc.to}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-taupe-900 group-hover:text-taupe-950 group-hover:underline pt-2"
                >
                  <span>{isHindi ? 'खोलें' : 'Access Service'}</span>
                  <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* DBT Detective Highlight Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-r from-taupe-850 to-taupe-950 text-taupe-100 rounded-3xl p-8 sm:p-12 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl space-y-4">
            <span className="inline-block text-[11px] font-bold uppercase tracking-wider bg-taupe-700 text-taupe-200 px-3 py-1 rounded-full">
              Flagship Innovation
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-taupe-50 leading-tight">
              {t('dbtHeroHeading')}
            </h2>
            <p className="text-xs sm:text-sm text-taupe-300 leading-relaxed">
              {t('dbtHeroDesc')}
            </p>
            <div className="flex flex-wrap gap-4 pt-2 text-xs text-taupe-300">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-taupe-300" />
                <span>Interactive Diagnosis</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-taupe-300" />
                <span>Actionable Steps</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-taupe-300" />
                <span>Downloadable PDF Report</span>
              </div>
            </div>
          </div>

          <Link
            to="/dbt"
            className="shrink-0 px-8 py-4 bg-taupe-200 hover:bg-taupe-100 text-taupe-950 font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 text-sm"
          >
            <span>{isHindi ? 'डीबीटी जांच शुरू करें' : 'Start DBT Diagnosis'}</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Impact & Transparency Numbers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-taupe-100/70 border border-taupe-300 rounded-2xl p-6 text-center">
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-taupe-950">25+</div>
            <div className="text-xs text-taupe-600 mt-1">Verified Schemes</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-taupe-950">100%</div>
            <div className="text-xs text-taupe-600 mt-1">Grounded Guidance</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-taupe-950">2</div>
            <div className="text-xs text-taupe-600 mt-1">Languages (Hindi + English)</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-taupe-950">0</div>
            <div className="text-xs text-taupe-600 mt-1">Data Storage Risk</div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-taupe-950">
            {isHindi ? 'अक्सर पूछे जाने वाले प्रश्न' : 'Frequently Asked Questions'}
          </h2>
          <p className="text-xs sm:text-sm text-taupe-600 mt-1">
            {isHindi ? 'नागरिकों की आम शंकाओं के सरल समाधान' : 'Quick answers to common questions about welfare schemes and DBT'}
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={faq.q}
                className="border border-taupe-300 rounded-xl bg-white overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between text-sm font-bold text-taupe-950 hover:bg-taupe-50"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={16}
                    className={`text-taupe-600 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 text-xs text-taupe-700 leading-relaxed border-t border-taupe-100 pt-3">
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
