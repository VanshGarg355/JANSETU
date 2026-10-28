import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const savedLang = localStorage.getItem('jansetu_lang') || 'en';

const resources = {
  en: {
    translation: {
      appName: 'JanSetu',
      tagline: 'Direct Bridge Between Citizens & Government Schemes',
      heroTitle: 'Empowering Every Citizen With Verified Government Benefits',
      heroSubtitle: 'Discover eligible welfare schemes, diagnose and resolve DBT payment failures, and consult JanSetu AI Sahayak in Hindi or English.',
      findSchemesBtn: 'Find Eligible Schemes',
      dbtDetectiveBtn: 'DBT Failure Detective',
      aiSahayakBtn: 'Ask AI Sahayak',
      searchPlaceholder: 'Search by scheme name, keywords, or occupation...',
      allCategories: 'All Categories',
      education: 'Education',
      agriculture: 'Agriculture',
      housing: 'Housing',
      healthcare: 'Healthcare',
      pension: 'Pension',
      financial: 'Financial Assistance',
      employment: 'Employment',
      navHome: 'Home',
      navSchemes: 'Scheme Finder',
      navDbt: 'DBT Detective',
      navLoans: 'Loans & Caution',
      navChat: 'AI Sahayak',
      navDashboard: 'My Dashboard',
      navAdmin: 'Admin',
      login: 'Login',
      signup: 'Register / Sign Up',
      logout: 'Logout',
      welcomeUser: 'Welcome back,',
      savedSchemes: 'Saved Schemes',
      noSavedSchemes: 'No schemes saved yet. Browse Scheme Finder to bookmark.',
      saveScheme: 'Save Scheme',
      saved: 'Saved',
      applyNow: 'Official Portal',
      viewDetails: 'View Full Details',
      verifiedGovtScheme: 'Official Verified Scheme',
      diagnoseDbtIssue: 'Diagnose DBT Issue',
      dbtHeroHeading: 'Direct Benefit Transfer (DBT) Failure Detective',
      dbtHeroDesc: 'Identify the exact root cause behind missing scholarships, subsidies, or pensions, with verified rectification guidance.',
      selectDbtIssuePrompt: 'Select the government payment issue you are experiencing:',
      questionStep: 'Diagnostic Step',
      submitDiagnosis: 'Generate Diagnosis & Guidance',
      rootCause: 'Root Cause Identified',
      recommendedAction: 'Actionable Resolution Steps',
      downloadPdf: 'Download Official Diagnostic PDF Report',
      escalationLink: 'Escalation & Official Portal',
      chatPlaceholder: 'Ask AI Sahayak in Hindi or English (e.g. "How to link Aadhaar with bank?")...',
      send: 'Send',
      demoModeActive: 'Demo Mode Active (Verified Datasets Loaded)',
      disclaimerText: 'JanSetu is an independent civic guidance platform developed for Build for Bharat 2026. We are not an official government entity. Never share passwords, OTPs, or full Aadhaar numbers.',
      formalLoans: 'Verified Formal Loans',
      suspiciousLoans: 'Suspicious Loan & Fraud Awareness',
      hackathonDemoScenarios: 'Hackathon Demo Scenarios',
      testPersonaPrompt: 'Click a test scenario to prefill diagnostic details:'
    }
  },
  hi: {
    translation: {
      appName: 'जनसेतु',
      tagline: 'नागरिकों और सरकारी योजनाओं के बीच सीधा सेतु',
      heroTitle: 'हर नागरिक को मिले उसका अधिकार और सरकारी लाभ',
      heroSubtitle: 'पात्र सरकारी योजनाएं खोजें, रुकी हुई छात्रवृत्ति या सब्सिडी (DBT) का समाधान पाएं, और जनसेतु AI सहायक से हिंदी या अंग्रेज़ी में सलाह लें।',
      findSchemesBtn: 'योजनाएं खोजें',
      dbtDetectiveBtn: 'DBT डिफेक्टिव (समस्या निवारण)',
      aiSahayakBtn: 'AI सहायक से पूछें',
      searchPlaceholder: 'योजना का नाम, कीवर्ड या व्यवसाय से खोजें...',
      allCategories: 'सभी श्रेणियां',
      education: 'शिक्षा',
      agriculture: 'कृषि',
      housing: 'आवास',
      healthcare: 'स्वास्थ्य',
      pension: 'पेंशन',
      financial: 'वित्तीय सहायता',
      employment: 'रोजगार व उद्यम',
      navHome: 'होम',
      navSchemes: 'योजना खोजें',
      navDbt: 'DBT डिटेक्टिव',
      navLoans: 'ऋण व धोखाधड़ी जागरूकता',
      navChat: 'AI सहायक',
      navDashboard: 'मेरा डैशबोर्ड',
      navAdmin: 'एडमिन',
      login: 'लॉग इन',
      signup: 'पंजीकरण करें',
      logout: 'लॉग आउट',
      welcomeUser: 'स्वागत है,',
      savedSchemes: 'सहेजी गई योजनाएं',
      noSavedSchemes: 'अभी तक कोई योजना सहेजी नहीं गई है।',
      saveScheme: 'सहेजें',
      saved: 'सहेजा गया',
      applyNow: 'आधिकारिक पोर्टल',
      viewDetails: 'पूरा विवरण देखें',
      verifiedGovtScheme: 'सत्यापित सरकारी योजना',
      diagnoseDbtIssue: 'समस्या की जांच करें',
      dbtHeroHeading: 'डीबीटी विफलता जासूस (DBT Detective)',
      dbtHeroDesc: 'रुकी हुई छात्रवृत्ति, किसान सम्मान निधि या पेंशन का सटीक कारण पहचानें और आधिकारिक समाधान प्राप्त करें।',
      selectDbtIssuePrompt: 'अपनी भुगतान समस्या का चयन करें:',
      questionStep: 'जांच चरण',
      submitDiagnosis: 'निदान और मार्गदर्शन देखें',
      rootCause: 'पहचाना गया मुख्य कारण',
      recommendedAction: 'समाधान के आवश्यक कदम',
      downloadPdf: 'आधिकारिक निदान पीडीएफ रिपोर्ट डाउनलोड करें',
      escalationLink: 'आधिकारिक पोर्टल व संपर्क',
      chatPlaceholder: 'AI सहायक से हिंदी या अंग्रेज़ी में पूछें (उदा. "आधार बैंक से कैसे लिंक करें?")...',
      send: 'भेजें',
      demoModeActive: 'डेमो मोड सक्रिय (सत्यापित डेटा उपलब्ध)',
      disclaimerText: 'जनसेतु बिल्ड फॉर भारत 2026 हेतु विकसित एक स्वतंत्र नागरिक सहायता मंच है। हम आधिकारिक सरकारी पोर्टल नहीं हैं। कभी भी पासवर्ड, ओटीपी या पूरा आधार नंबर साझा न करें।',
      formalLoans: 'सत्यापित संस्थागत सरकारी ऋण',
      suspiciousLoans: 'संदिग्ध ऋण एवं धोखाधड़ी से सावधान',
      hackathonDemoScenarios: 'हैकाथॉन डेमो परिदृश्य (Test Scenarios)',
      testPersonaPrompt: 'तुरंत जांच हेतु किसी भी डेमो परिदृश्य पर क्लिक करें:'
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLang,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
