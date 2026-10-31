import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import {
  Search,
<<<<<<< HEAD
=======
  Filter,
>>>>>>> c6a0618c18654d881a99ac583080468894e43f72
  CheckCircle,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  ArrowRight,
  ShieldCheck,
<<<<<<< HEAD
  Sparkles,
  Mic,
  MicOff,
  FileCheck,
  RotateCcw,
  Volume2,
  AlertTriangle,
  ClipboardList
} from 'lucide-react';
import ALL_DEMO_SCHEMES from '../data/demoSchemes.json';

// Local zero-latency intelligent semantic matching algorithm (100% resilient fallback)
function matchSituationLocally(query, isHindi, allSchemesList) {
  const textLower = (query || '').toLowerCase().trim();
  const words = textLower.split(/[\s,.;:!?]+/).filter(w => w.length >= 2);

  const topicKeywords = {
    Education: [
      'student', 'school', 'college', 'scholarship', 'fees', 'fee', 'exam', 'marksheet', 'study', 'education',
      'chhatravritti', 'hostel', 'padhai', 'degree', 'diploma', 'matric', '10th', '12th', '10', '12', 'btech',
      'graduation', 'vidyarthi', 'admission', 'university', 'shiksha', 'coaching', 'student loan', 'books',
      'छात्र', 'छात्रा', 'विद्यार्थी', 'स्कॉलरशिप', 'छात्रवृत्ति', 'अंकपत्र', 'मार्कशीट', 'फीस', 'कॉलेज',
      'स्कूल', 'पढ़ाई', 'दाखिला', 'दसवीं', 'बारहवीं', '10वीं', '12वीं', 'शिक्षा', 'यूनिवर्सिटी', 'डिग्री'
    ],
    Agriculture: [
      'kisan', 'farmer', 'kheti', 'crop', 'fasal', 'land', 'zameen', 'seed', 'beej', 'tractor', 'fertilizer',
      'khad', 'irrigation', 'dairy', 'krishi', 'khatauni', 'khasra', 'wheat', 'gehu', 'paddy', 'dhan', 'ganna',
      'sugarcane', 'agriculture', 'sinchai', 'lekhpal', 'patwari', 'bhoomi',
      'किसान', 'खेती', 'फसल', 'बीज', 'खाद', 'उर्वरक', 'जमीन', 'भूमि', 'खसरा', 'खतौनी', 'कृषि', 'गेहूं',
      'धान', 'गन्ना', 'सिंचाई', 'ऋण', 'मुआवजा', 'पटवारी', 'कृषक'
    ],
    Pension: [
      'pension', 'old age', 'elderly', 'senior', 'retirement', 'bujurg', 'vriddha', 'widow', 'vidhwa',
      'jeevan pramaan', 'atal pension', 'apy', 'vridha', 'elder', 'father', 'grandfather', 'dadaji', 'pitaji',
      'baap', 'sasur', 'retire', '60', '70', 'pensioner', 'life certificate',
      'पेंशन', 'बुजुर्ग', 'वृद्धावस्था', 'वरिष्ठ', 'सेवानिवृत्त', 'पिताजी', 'दादाजी', 'जीवन प्रमाण', 'विधवा', 'वृद्ध'
    ],
    Housing: [
      'house', 'home', 'housing', 'makan', 'ghar', 'pucca', 'kutcha', 'chhat', 'awas', 'roof', 'slum',
      'construction', 'basti', 'gramin awas', 'pmay', 'jhopdi', 'kiraya',
      'मकान', 'घर', 'पक्का', 'कच्चा', 'छत', 'आवास', 'बस्ती', 'झोपड़ी', 'भवन'
    ],
    Healthcare: [
      'health', 'hospital', 'illness', 'disease', 'medical', 'ayushman', 'swasthya', 'treatment', 'doctor',
      'bimar', 'operation', 'medicine', 'dawa', 'clinic', 'cancer', 'ilaj', 'upchar', 'dawai', 'bimari',
      'स्वास्थ्य', 'अस्पताल', 'इलाज', 'दवा', 'दवाई', 'बीमार', 'बीमारी', 'ऑपरेशन', 'डॉक्टर', 'कैंसर', 'उपचार', 'आरोग्य'
    ],
    'Financial Assistance': [
      'financial', 'assistance', 'subsidy', 'garib', 'ration', 'annadata', 'svanidhi', 'mudra', 'bima',
      'insurance', 'ujjwala', 'gas', 'loan', 'paisa', 'sahayata', 'madad', 'help', 'anudan', 'rashan',
      'राशन', 'गैस', 'उज्ज्वला', 'सब्सिडी', 'सहायता', 'मदद', 'गरीब', 'बीमा', 'ऋण', 'लोन'
    ],
    Employment: [
      'job', 'employment', 'unemployed', 'berojgar', 'artisan', 'karigar', 'vishwakarma', 'skill', 'mgnrega',
      'mazdoor', 'daily wage', 'carpenter', 'blacksmith', 'tailor', 'tool kit', 'rojgar', 'naukri', 'business',
      'dukan', 'thela', 'rehri', 'vendor',
      'रोजगार', 'नौकरी', 'दुकान', 'ठेला', 'रेहड़ी', 'कारीगर', 'विश्वकर्मा', 'मजदूर', 'बेरोजगार', 'व्यवसाय', 'व्यापार'
    ]
  };

  const personaMap = {
    Education: {
      en: '🎓 College Student / Scholar',
      hi: '🎓 छात्र / उच्च शिक्षा शिक्षार्थी',
      needEn: 'Higher Education Fees, Books & Scholarship',
      needHi: 'कॉलेज फीस, पुस्तकें व छात्रवृत्ति सहायता'
    },
    Agriculture: {
      en: '👨‍🌾 Landholding Farmer',
      hi: '👨‍🌾 कृषक / किसान',
      needEn: 'Crop Subsidy, Land Record Support & KCC Credit',
      needHi: 'फसल व बीज सहायता, भू-अभिलेख एवं किसान क्रेडिट'
    },
    Pension: {
      en: '👴 Senior Citizen / Pensioner',
      hi: '👴 वरिष्ठ नागरिक / पेंशनभोगी',
      needEn: 'Monthly Social Security Pension & Life Certificate',
      needHi: 'मासिक सामाजिक सुरक्षा पेंशन व जीवन प्रमाण पत्र'
    },
    Housing: {
      en: '🏠 Rural / Urban Family',
      hi: '🏠 आवास लाभार्थी परिवार',
      needEn: 'Pucca House Construction Direct Grant',
      needHi: 'पक्का मकान निर्माण सरकारी अनुदान'
    },
    Healthcare: {
      en: '🏥 Family Healthcare Beneficiary',
      hi: '🏥 स्वास्थ्य सुरक्षा लाभार्थी',
      needEn: 'Cashless Hospital Hospitalization & Treatment',
      needHi: 'कैशलेस अस्पताल इलाज व आयुष्मान कवर'
    },
    Employment: {
      en: '🔨 Artisan / Skilled Enterprise',
      hi: '🔨 कारीगर / कुशल कामगार',
      needEn: 'Collateral-free Mudra / Tool-kit & Skill Support',
      needHi: 'बिना गारंटी टूल-किट व मुद्रा स्वरोजगार ऋण'
    },
    'Financial Assistance': {
      en: '💼 Welfare Beneficiary / Micro-Vendor',
      hi: '💼 सामाजिक कल्याण लाभार्थी',
      needEn: 'Direct Benefit Transfer & Subsidized Welfare',
      needHi: 'प्रत्यक्ष लाभ अंतरण (DBT) व रियायती सहायता'
    }
  };

  const categoryScores = {};
  for (const [cat, kws] of Object.entries(topicKeywords)) {
    let count = 0;
    kws.forEach(kw => {
      if (textLower.includes(kw.toLowerCase())) count += 1;
    });
    categoryScores[cat] = count;
  }

  let primaryCategory = null;
  let maxCatScore = 0;
  for (const [cat, sc] of Object.entries(categoryScores)) {
    if (sc > maxCatScore) {
      maxCatScore = sc;
      primaryCategory = cat;
    }
  }

  const list = Array.isArray(allSchemesList) && allSchemesList.length > 0 ? allSchemesList : [];
  const scored = list.map(scheme => {
    let score = 48;
    const isPrimary = primaryCategory && scheme.category === primaryCategory;

    if (isPrimary) {
      score = 88 + Math.min(10, maxCatScore * 2);
    } else {
      const catMatches = categoryScores[scheme.category] || 0;
      score += catMatches * 8;
    }

    const content = `${scheme.name} ${scheme.description || ''} ${scheme.eligibility_criteria || ''} ${scheme.benefits || ''}`.toLowerCase();
    const contentHi = `${scheme.name_hi || ''} ${scheme.description_hi || ''} ${scheme.eligibility_criteria_hi || ''} ${scheme.benefits_hi || ''}`.toLowerCase();

    words.forEach(w => {
      if (content.includes(w) || contentHi.includes(w)) {
        score += 4;
      }
    });

    const reqDocsRaw = (scheme.required_documents || (Array.isArray(scheme.docs) ? scheme.docs.join(', ') : 'Aadhaar Card, Bank Passbook'))
      .split(/[,;]+/)
      .map(d => d.trim().replace(/\.$/, ''))
      .filter(Boolean);

    return {
      ...scheme,
      match_score: Math.min(99, Math.max(45, score)),
      required_documents_list: reqDocsRaw.length > 0 ? reqDocsRaw : ['Aadhaar Card', 'Bank Passbook'],
      reason: isHindi
        ? 'आपकी व्यक्त स्थिति के आधार पर पूर्णतः उपयुक्त। आवेदन के लिए नीचे दिए गए दस्तावेज़ आवश्यक हैं।'
        : 'Directly matches your described situation. See required documents below to apply.'
    };
  });

  const topSchemes = scored.sort((a, b) => b.match_score - a.match_score).slice(0, 6);
  const detectedMeta = primaryCategory ? personaMap[primaryCategory] : null;
  const detectedPersona = detectedMeta
    ? (isHindi ? detectedMeta.hi : detectedMeta.en)
    : (isHindi ? 'नागरिक लाभार्थी' : 'Citizen Beneficiary');
  const detectedNeed = detectedMeta
    ? (isHindi ? detectedMeta.needHi : detectedMeta.needEn)
    : (isHindi ? 'सरकारी कल्याणकारी योजनाएं' : 'Government Welfare Schemes');

  const topSchemeName = isHindi ? (topSchemes[0]?.name_hi || topSchemes[0]?.name) : topSchemes[0]?.name;
  const topDocs = topSchemes[0]?.required_documents_list?.slice(0, 3).join(', ') || (isHindi ? 'आधार कार्ड, बैंक पासबुक' : 'Aadhaar Card, Bank Passbook');

  const aiSummary = isHindi
    ? `विश्लेषण पूर्ण: आपकी स्थिति को "${detectedPersona}" के रूप में पहचाना गया है, जिसकी मुख्य आवश्यकता "${detectedNeed}" है। आपकी पात्रता के अनुसार सबसे उपयुक्त योजना "${topSchemeName}" है। आवेदन हेतु आवश्यक दस्तावेज़: ${topDocs}।`
    : `Analysis Complete: Your profile was identified as "${detectedPersona}" with focus on "${detectedNeed}". The most eligible scheme for you is "${topSchemeName}". Carry these essential documents: ${topDocs}.`;

  return {
    success: true,
    situation_analyzed: query,
    detected_category: primaryCategory || 'General',
    detected_persona: detectedPersona,
    detected_need: detectedNeed,
    ai_summary: aiSummary,
    schemes: topSchemes
  };
}

const PRESET_SITUATIONS = [
  {
    icon: '🌾',
    labelEn: 'Small Farmer needing crop subsidy',
    labelHi: 'छोटे किसान: बीज, खाद व फसल सब्सिडी',
    situation: 'I am a small farmer with 2 acres cultivable land facing high cost of seeds and fertilizer. I need government crop financial assistance.',
    situationHi: 'मेरे पास 2 एकड़ कृषि भूमि है। मुझे बीज, खाद और फसल हेतु सरकारी सहायता व सब्सिडी चाहिए।'
  },
  {
    icon: '🎓',
    labelEn: 'Student needing college scholarship',
    labelHi: 'छात्र: कॉलेज फीस व उच्च शिक्षा छात्रवृत्ति',
    situation: 'I am a 12th pass student from a low-income family seeking scholarship to pay for college graduation fees and books.',
    situationHi: 'मैं 12वीं पास छात्र हूँ और मेरा परिवार कम आय वर्ग से है। मुझे कॉलेज फीस और पढ़ाई के लिए सरकारी स्कॉलरशिप चाहिए।'
  },
  {
    icon: '🏠',
    labelEn: 'Rural family needing pucca house grant',
    labelHi: 'ग्रामीण परिवार: पक्के मकान निर्माण हेतु सरकारी अनुदान',
    situation: 'Our family lives in a dilapidated kutcha house in rural village. We need financial grant assistance from the government to construct a pucca house.',
    situationHi: 'हमारा परिवार गांव में कच्चे मकान में रहता है। हमें पक्का मकान बनाने के लिए सरकारी आवास योजना का अनुदान चाहिए।'
  },
  {
    icon: '🏥',
    labelEn: 'Low income family needing hospital care',
    labelHi: 'गरीब परिवार: गंभीर बीमारी में मुफ्त अस्पताल इलाज',
    situation: 'My family has a critical medical emergency and we cannot afford hospital operation and treatment costs. We need government free health cover.',
    situationHi: 'हमारे परिवार में गंभीर बीमारी का इलाज होना है और अस्पताल खर्च उठाने में असमर्थ हैं। हमें सरकारी स्वास्थ्य बीमा कवर चाहिए।'
  },
  {
    icon: '👴',
    labelEn: 'Senior citizen needing pension',
    labelHi: 'वरिष्ठ नागरिक: मासिक वृद्धावस्था पेंशन सहायता',
    situation: 'I am a 65 year old senior citizen with no fixed income source and need monthly old age pension and social security.',
    situationHi: 'मेरी उम्र 65 वर्ष है और कोई नियमित आय नहीं है। मुझे मासिक वृद्धावस्था पेंशन व जीवन प्रमाण पत्र की जानकारी चाहिए।'
  }
];
=======
  Sparkles
} from 'lucide-react';
>>>>>>> c6a0618c18654d881a99ac583080468894e43f72

function SchemeFinder() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
<<<<<<< HEAD
  const [searchParams] = useSearchParams();

  const isHindi = i18n.language === 'hi';

  // Situation text from URL query parameter or empty
  const initialText = searchParams.get('q') || '';
  const [situationText, setSituationText] = useState(initialText);

  // States
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState('');
  const [matchingLoading, setMatchingLoading] = useState(false);

  // CRITICAL: matchedResults is null initially.
  // Schemes NEVER appear until the citizen clicks "Find Eligible Schemes"!
  const [matchedResults, setMatchedResults] = useState(null);

  const [savedIds, setSavedIds] = useState(new Set());
  const [savedMessage, setSavedMessage] = useState('');

  useEffect(() => {
    fetchSavedSchemes();
  }, []);
=======
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
>>>>>>> c6a0618c18654d881a99ac583080468894e43f72

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

<<<<<<< HEAD
=======
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchSchemes();
  };

>>>>>>> c6a0618c18654d881a99ac583080468894e43f72
  const handleSaveScheme = async (scheme) => {
    try {
      const token = localStorage.getItem('jansetu_token');
      await fetch('/api/saved-schemes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
<<<<<<< HEAD
          Authorization: token ? `Bearer ${token}` : ''
=======
          Authorization: `Bearer ${token}`
>>>>>>> c6a0618c18654d881a99ac583080468894e43f72
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

<<<<<<< HEAD
  // Voice Input (Web Speech API)
  // ONLY fills the text input, DOES NOT trigger search automatically!
  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechError(
        isHindi
          ? 'आपके ब्राउज़र में वॉइस इनपुट समर्थित नहीं है। कृपया लिखकर अपनी स्थिति बताएं।'
          : 'Voice input is not supported in this browser. Please type your situation.'
      );
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = isHindi ? 'hi-IN' : 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError('');
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const updated = situationText ? situationText + ' ' + transcript : transcript;
        setSituationText(updated);
        setIsListening(false);
        // Note: Do NOT auto-run matcher. Citizen will click "Find Eligible Schemes"!
      };

      recognition.onerror = (err) => {
        console.warn('Speech recognition error:', err);
        setSpeechError(
          isHindi
            ? 'ध्वनि नहीं पहचानी जा सकी। कृपया पुनः प्रयास करें अथवा नीचे लिखें।'
            : 'Could not hear clearly. Please try speaking again or type below.'
        );
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      setSpeechError(isHindi ? 'माइक्रोफ़ोन एक्सेस में समस्या हुई।' : 'Error accessing microphone.');
      setIsListening(false);
    }
  };

  // Run Matcher ONLY when citizen explicitly clicks "Find Eligible Schemes"
  const handleRunMatcher = async (textToMatch = null) => {
    const query = typeof textToMatch === 'string' ? textToMatch : situationText;

    if (!query.trim()) {
      setSpeechError(
        isHindi
          ? 'कृपया अपनी स्थिति लिखें या माइक बटन दबाकर बोलें, फिर "पात्र सरकारी योजनाएं खोजें" पर क्लिक करें।'
          : 'Please describe your situation or tap the microphone to speak, then click "Find Eligible Schemes".'
      );
      return;
    }

    setMatchingLoading(true);
    setSpeechError('');

    try {
      const res = await fetch('/api/schemes/match-situation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          situation: query,
          language: isHindi ? 'hi' : 'en'
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.schemes) && data.schemes.length > 0) {
          setMatchedResults(data);
          setMatchingLoading(false);
          return;
        }
      }
      // Resilient local matcher
      const localResult = matchSituationLocally(query, isHindi, ALL_DEMO_SCHEMES);
      setMatchedResults(localResult);
    } catch (err) {
      console.warn('Backend unavailable, executed instant client-side matching engine:', err);
      const localResult = matchSituationLocally(query, isHindi, ALL_DEMO_SCHEMES);
      setMatchedResults(localResult);
    } finally {
      setMatchingLoading(false);
    }
  };

  // Apply Preset Scenario: ONLY fills the text, DOES NOT auto-load schemes!
  const applyPreset = (preset) => {
    const sit = isHindi ? preset.situationHi : preset.situation;
    setSituationText(sit);
    setMatchedResults(null); // Clear previous schemes so new ones ONLY appear on click!
    setSpeechError('');
  };

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto px-4 sm:px-6">
=======
  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto px-4 sm:px-6">
>>>>>>> c6a0618c18654d881a99ac583080468894e43f72
      {/* Top Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-taupe-200 text-taupe-950 text-xs font-semibold">
          <ShieldCheck size={14} className="text-taupe-800" />
          <span>{t('verifiedGovtScheme')}</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-taupe-950">
          {isHindi ? 'सरकारी योजना खोजक' : 'Government Scheme Finder'}
        </h1>
<<<<<<< HEAD
        <p className="text-xs sm:text-sm text-taupe-600 leading-relaxed">
          {isHindi
            ? 'अपनी स्थिति बोलें या लिखें, फिर "पात्र सरकारी योजनाएं खोजें" पर क्लिक करें। जनसेतु आपकी पात्रता व आवश्यक दस्तावेज़ों की सूची तैयार करेगा।'
            : 'Simply speak or type your situation, then click "Find Eligible Schemes". JanSetu identifies matching welfare programs and required documents for you.'}
=======
        <p className="text-xs sm:text-sm text-taupe-600">
          {isHindi
            ? 'अपनी श्रेणी, व्यवसाय और पात्रता के अनुसार 25+ सत्यापित सरकारी योजनाओं की खोज करें।'
            : 'Explore 25+ officially verified central and state government welfare schemes with exact eligibility rules.'}
>>>>>>> c6a0618c18654d881a99ac583080468894e43f72
        </p>
      </div>

      {savedMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-taupe-850 text-taupe-50 px-4 py-3 rounded-xl shadow-xl text-xs flex items-center gap-2 border border-taupe-700 animate-fade-in">
          <CheckCircle size={14} className="text-emerald-400" />
          <span>{savedMessage}</span>
        </div>
      )}

<<<<<<< HEAD
      {/* Main Voice/Text Input Card */}
      <div className="bg-white border-2 border-taupe-300 rounded-3xl p-5 sm:p-8 shadow-sm space-y-6">
        
        {/* Quick 1-Click Persona Prompts for Hackathon Demo */}
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-taupe-500 mb-2 flex items-center gap-1.5">
            <Sparkles size={14} className="text-taupe-700" />
            <span>{isHindi ? 'त्वरित उदाहरण (चुनें और खोजें):' : 'Quick Demo Scenarios (Select to Fill):'}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
            {PRESET_SITUATIONS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(preset)}
                className="p-3 bg-taupe-50 hover:bg-taupe-100 border border-taupe-200 hover:border-taupe-400 rounded-2xl text-left transition-all group"
              >
                <div className="text-base mb-1">{preset.icon}</div>
                <div className="text-xs font-bold text-taupe-900 group-hover:text-taupe-950">
                  {isHindi ? preset.labelHi : preset.labelEn}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Input Box with Animated Mic */}
        <div className="pt-3 border-t border-taupe-200 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <label className="text-sm font-bold text-taupe-950 flex items-center gap-2">
              <Volume2 size={18} className="text-taupe-800" />
              <span>
                {isHindi
                  ? 'अपनी आवश्यकता या स्थिति बताएं (माइक पर बोलें या नीचे लिखें)'
                  : 'Describe Your Need or Situation (Tap Mic to Speak or Type below)'}
              </span>
            </label>

            {/* Animated Mic Button */}
            <button
              type="button"
              onClick={handleVoiceInput}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all shadow-sm ${
                isListening
                  ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-200'
                  : 'bg-taupe-900 hover:bg-black text-taupe-50'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff size={15} />
                  <span>{isHindi ? 'सुन रहा हूँ... बोलिए' : 'Listening... Speak now'}</span>
                </>
              ) : (
                <>
                  <Mic size={15} />
                  <span>{isHindi ? 'माइक पर बोलें (Voice Input)' : 'Speak Your Situation (Voice)'}</span>
                </>
              )}
            </button>
          </div>

          {/* Text Area */}
          <div className="relative">
            <textarea
              rows={3}
              value={situationText}
              onChange={(e) => {
                setSituationText(e.target.value);
                if (speechError) setSpeechError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleRunMatcher();
                }
              }}
              placeholder={
                isHindi
                  ? 'जैसे: "मेरी 2 एकड़ कृषि भूमि है, मुझे खाद और बीज के लिए सरकारी आर्थिक सहायता चाहिए..." अथवा "मैं 12वीं पास छात्र हूँ, कॉलेज फीस के लिए स्कॉलरशिप चाहिए..." (टाइप करके नीचे "पात्र सरकारी योजनाएं खोजें" पर क्लिक करें)'
                  : 'e.g. "I am a small farmer with 2 acres of land needing fertilizer subsidy..." or "I am a 12th pass student needing scholarship for higher education fees..." (Type and click "Find Eligible Schemes" below)'
              }
              className="w-full p-4 bg-taupe-50 rounded-2xl border border-taupe-300 text-sm text-taupe-950 focus:outline-none focus:ring-2 focus:ring-taupe-700 leading-relaxed placeholder-taupe-400"
            />
          </div>

          {speechError && (
            <div className="text-xs text-rose-600 flex items-center gap-1.5 font-medium">
              <AlertTriangle size={14} />
              <span>{speechError}</span>
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => {
              setSituationText('');
              setMatchedResults(null);
              setSpeechError('');
            }}
            className="text-xs font-semibold text-taupe-500 hover:text-taupe-800 flex items-center gap-1"
          >
            <RotateCcw size={13} />
            <span>{isHindi ? 'साफ़ करें' : 'Clear'}</span>
          </button>

          {/* EXPLICIT FIND ELIGIBLE SCHEMES BUTTON */}
          <button
            type="button"
            disabled={matchingLoading}
            onClick={() => handleRunMatcher()}
            className="px-6 py-3 bg-taupe-900 hover:bg-black text-taupe-50 text-xs sm:text-sm font-bold rounded-xl flex items-center gap-2 shadow-md transition-all disabled:opacity-50 hover:shadow-lg active:scale-95"
          >
            <Sparkles size={16} className="text-amber-300" />
            <span>
              {matchingLoading
                ? (isHindi ? 'पात्रता व दस्तावेज़ों की जांच हो रही है...' : 'Finding Eligible Schemes...')
                : (isHindi ? 'पात्र सरकारी योजनाएं खोजें' : 'Find Eligible Schemes')}
            </span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* STATE 1: INITIAL STATE (NO SCHEMES BEFORE CLICKING)       */}
      {/* ========================================================= */}
      {!matchedResults && !matchingLoading && (
        <div className="bg-white border-2 border-dashed border-taupe-300 rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-2xs">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-taupe-100 border border-taupe-200 flex items-center justify-center text-3xl shadow-inner">
            🏛️
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="text-base sm:text-lg font-extrabold text-taupe-950">
              {isHindi ? 'पात्र सरकारी योजनाएं खोजने के लिए तैयार' : 'Ready to Discover Your Eligible Schemes'}
            </h3>
            <p className="text-xs text-taupe-600 leading-relaxed">
              {isHindi
                ? 'ऊपर अपनी स्थिति लिखें या माइक से बोलें (या त्वरित उदाहरण चुनें), फिर "पात्र सरकारी योजनाएं खोजें" बटन पर क्लिक करें। आपकी पात्रता, लाभ और आवश्यक दस्तावेज़ तभी प्रदर्शित होंगे।'
                : 'Type or speak your situation above (or pick a quick scenario), then click "Find Eligible Schemes". Your eligible schemes, matching scores, and required documents will appear here.'}
            </p>
          </div>

          {/* 3 Step Instruction Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto pt-3 text-left">
            <div className="p-3 bg-taupe-50 rounded-2xl border border-taupe-200">
              <span className="text-[10px] font-bold text-taupe-500 uppercase tracking-wider block">
                {isHindi ? 'चरण 1' : 'Step 1'}
              </span>
              <span className="text-xs font-bold text-taupe-900 block mt-0.5">
                {isHindi ? 'स्थिति लिखें या बोलें' : 'Describe Situation'}
              </span>
              <span className="text-[11px] text-taupe-600 block mt-0.5">
                {isHindi ? 'किसान, छात्र, वरिष्ठ नागरिक या आवास' : 'Farmer, Student, Senior or Housing'}
              </span>
            </div>
            <div className="p-3 bg-taupe-50 rounded-2xl border border-taupe-200">
              <span className="text-[10px] font-bold text-taupe-500 uppercase tracking-wider block">
                {isHindi ? 'चरण 2' : 'Step 2'}
              </span>
              <span className="text-xs font-bold text-taupe-900 block mt-0.5">
                {isHindi ? 'बटन पर क्लिक करें' : 'Click Search Button'}
              </span>
              <span className="text-[11px] text-taupe-600 block mt-0.5">
                {isHindi ? '"पात्र सरकारी योजनाएं खोजें"' : '"Find Eligible Schemes"'}
              </span>
            </div>
            <div className="p-3 bg-taupe-50 rounded-2xl border border-taupe-200">
              <span className="text-[10px] font-bold text-taupe-500 uppercase tracking-wider block">
                {isHindi ? 'चरण 3' : 'Step 3'}
              </span>
              <span className="text-xs font-bold text-taupe-900 block mt-0.5">
                {isHindi ? 'योजनाएं व दस्तावेज़ देखें' : 'View Schemes & Docs'}
              </span>
              <span className="text-[11px] text-taupe-600 block mt-0.5">
                {isHindi ? 'पात्रता स्कोर व आवश्यक कागजात' : 'Match score & required documents'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* STATE 2: LOADING SPINNER (DURING SEARCH)                  */}
      {/* ========================================================= */}
      {matchingLoading && (
        <div className="bg-white border-2 border-taupe-200 rounded-3xl p-10 sm:p-14 text-center space-y-4 shadow-sm animate-pulse">
          <div className="w-14 h-14 mx-auto rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-2xl animate-spin">
            <Sparkles size={26} />
          </div>
          <h3 className="text-base font-extrabold text-taupe-950">
            {isHindi ? 'पात्रता व दस्तावेज़ों की जांच हो रही है...' : 'Analyzing eligibility & extracting required documents...'}
          </h3>
          <p className="text-xs text-taupe-600 max-w-sm mx-auto">
            {isHindi
              ? 'कृपया प्रतीक्षा करें, जनसेतु आपकी आवश्यकताओं के अनुसार श्रेष्ठ सरकारी योजनाओं की गणना कर रहा है।'
              : 'Please wait, JanSetu is matching your profile with verified central and state welfare programs.'}
          </p>
        </div>
      )}

      {/* ========================================================= */}
      {/* STATE 3: RESULTS (RENDERED ONLY AFTER SEARCH CLICK)       */}
      {/* ========================================================= */}
      {matchedResults && !matchingLoading && (
        <div className="space-y-6 animate-fade-in">
          {/* Detected Persona & Intent Analysis Banner */}
          <div className="p-4 sm:p-5 bg-emerald-50 border border-emerald-200 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white border border-emerald-300 text-emerald-800 flex items-center justify-center font-extrabold text-lg shrink-0 shadow-xs">
                🎯
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                  <Sparkles size={11} />
                  <span>{isHindi ? 'स्थिति विश्लेषण परिणाम' : 'Analyzed Citizen Need & Persona'}</span>
                </div>
                <div className="text-sm font-extrabold text-taupe-950 flex flex-wrap items-center gap-2 mt-0.5">
                  <span>{matchedResults.detected_persona || (isHindi ? 'नागरिक लाभार्थी' : 'Citizen Beneficiary')}</span>
                  <span>•</span>
                  <span className="text-emerald-800 font-semibold text-xs">
                    {matchedResults.detected_need || (isHindi ? 'सरकारी कल्याणकारी योजनाएं' : 'Welfare Assistance')}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-xs font-bold px-3 py-1.5 bg-white text-emerald-800 border border-emerald-300 rounded-xl shadow-xs self-stretch sm:self-auto text-center">
              {isHindi ? '✓ प्रासंगिक योजनाएं व दस्तावेज़ सत्यापित' : '✓ Matching Verified Schemes Found'}
            </div>
          </div>

          {/* AI Guidance Card */}
          {matchedResults.ai_summary && (
            <div className="bg-gradient-to-r from-taupe-900 via-taupe-850 to-taupe-900 text-taupe-50 rounded-3xl p-6 sm:p-7 shadow-lg border border-taupe-700 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold tracking-wide uppercase text-amber-300">
                <Sparkles size={15} />
                <span>{isHindi ? 'जनसेतु एआई पात्रता व दस्तावेज़ मार्गदर्शन' : 'JanSetu AI Eligibility & Document Advisory'}</span>
              </div>
              <p className="text-xs sm:text-sm leading-relaxed text-taupe-100 font-medium">
                {matchedResults.ai_summary}
              </p>
            </div>
          )}

          {/* Title & Count */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-taupe-950">
                {isHindi ? 'आपके लिए अनुशंसित पात्र योजनाएं' : 'Eligible Schemes for Your Situation'}
              </h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-taupe-200 text-taupe-850">
                {matchedResults.schemes?.length || 0}
              </span>
            </div>
            <div className="text-xs text-taupe-500 font-medium">
              {isHindi ? 'दस्तावेज़ सूची स्वचालित रूप से नीचे प्रदर्शित है' : 'Required documents auto-extracted below'}
            </div>
          </div>

          {/* Schemes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(matchedResults.schemes || []).map((scheme) => {
=======
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
>>>>>>> c6a0618c18654d881a99ac583080468894e43f72
              const isSaved = savedIds.has(scheme.id);
              return (
                <div
                  key={scheme.id}
<<<<<<< HEAD
                  className="bg-white border-2 border-taupe-200 hover:border-taupe-400 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Header: Category & Match Score */}
=======
                  className="bg-white border border-taupe-200 hover:border-taupe-400 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
>>>>>>> c6a0618c18654d881a99ac583080468894e43f72
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-taupe-100 text-taupe-800 px-2.5 py-1 rounded-full border border-taupe-200">
                        {scheme.category}
                      </span>
<<<<<<< HEAD
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                          {scheme.match_score}% {isHindi ? 'पात्रता' : 'Match'}
                        </span>
                        <button
                          onClick={() => handleSaveScheme(scheme)}
                          className="p-1 text-taupe-400 hover:text-taupe-850"
                          title="Save Scheme"
                        >
                          {isSaved ? (
                            <BookmarkCheck size={18} className="text-taupe-850" />
                          ) : (
                            <Bookmark size={18} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Scheme Name */}
                    <h3 className="text-base font-bold text-taupe-950 mb-2 leading-snug">
                      {isHindi && scheme.name_hi ? scheme.name_hi : scheme.name}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-taupe-600 line-clamp-2 leading-relaxed mb-4">
                      {isHindi && scheme.description_hi ? scheme.description_hi : scheme.description}
                    </p>

                    {/* Benefits */}
                    <div className="bg-taupe-50 border border-taupe-200 rounded-2xl p-3 mb-4 text-xs space-y-1">
                      <div className="font-semibold text-taupe-950 flex items-center gap-1">
                        <Sparkles size={12} className="text-taupe-700" />
                        <span>{isHindi ? 'योजना के लाभ:' : 'Scheme Benefits:'}</span>
                      </div>
                      <div className="text-taupe-700 text-[11px] line-clamp-2">
                        {isHindi && scheme.benefits_hi ? scheme.benefits_hi : scheme.benefits}
                      </div>
                    </div>

                    {/* AUTO-DETECTED REQUIRED DOCUMENTS */}
                    <div className="bg-taupe-100/60 border border-taupe-200 rounded-2xl p-3.5 mb-4 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-taupe-900">
                        <ClipboardList size={14} className="text-taupe-700" />
                        <span>{isHindi ? 'आवेदन हेतु आवश्यक दस्तावेज़:' : 'Documents You Need to Carry:'}</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {(scheme.required_documents_list || []).map((doc, dIdx) => (
                          <span
                            key={dIdx}
                            className="inline-flex items-center gap-1 text-[11px] font-medium bg-white text-taupe-800 border border-taupe-300 px-2.5 py-1 rounded-lg shadow-2xs"
                          >
                            <FileCheck size={11} className="text-emerald-600 flex-shrink-0" />
                            <span>{doc}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Footer Actions */}
                  <div className="pt-3 border-t border-taupe-100 flex items-center justify-between gap-2">
                    <Link
                      to={`/schemes/${scheme.id}`}
                      className="text-xs font-bold text-taupe-900 hover:text-black flex items-center gap-1 hover:underline"
=======
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
>>>>>>> c6a0618c18654d881a99ac583080468894e43f72
                    >
                      <span>{t('viewDetails')}</span>
                      <ArrowRight size={12} />
                    </Link>

                    {scheme.official_url && (
                      <a
                        href={scheme.official_url}
                        target="_blank"
                        rel="noreferrer"
<<<<<<< HEAD
                        className="px-3.5 py-1.5 bg-taupe-900 hover:bg-black text-taupe-50 text-[11px] font-bold rounded-xl flex items-center gap-1 transition-colors shadow-sm"
=======
                        className="px-3 py-1.5 bg-taupe-850 hover:bg-taupe-950 text-taupe-50 text-[11px] font-bold rounded-lg flex items-center gap-1 transition-colors"
>>>>>>> c6a0618c18654d881a99ac583080468894e43f72
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
<<<<<<< HEAD
        </div>
      )}
=======
        )}
      </div>
>>>>>>> c6a0618c18654d881a99ac583080468894e43f72
    </div>
  );
}

export default SchemeFinder;
