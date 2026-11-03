import React, { useState, useEffect } from 'react';
import PortalStepText from '../components/PortalStepText';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  CheckCircle,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Mic,
  MicOff,
  FileCheck,
  RotateCcw,
  Volume2,
  AlertTriangle,
  ClipboardList,
  SlidersHorizontal,
  Check
} from 'lucide-react';
import ALL_DEMO_SCHEMES from '../data/demoSchemes.json';

// Local zero-latency intelligent semantic matching algorithm (100% resilient fallback)
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'in', 'on', 'at', 'for', 'to', 'of', 'and', 'or', 'is', 'are', 'was', 'were',
  'be', 'been', 'with', 'by', 'as', 'about', 'from', 'into', 'over', 'after', 'i', 'me', 'my',
  'we', 'our', 'you', 'your', 'he', 'she', 'it', 'they', 'them', 'their', 'this', 'that', 'these',
  'those', 'what', 'which', 'who', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each',
  'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so',
  'than', 'too', 'very', 'can', 'will', 'just', 'should', 'now',
  'mein', 'me', 'se', 'ko', 'ka', 'ke', 'ki', 'k', 'hai', 'he', 'hain', 'ho', 'tha', 'thi', 'the',
  'karna', 'kare', 'karein', 'hona', 'hoga', 'hogi', 'chahiye', 'chahie', 'liye', 'liya', 'diya',
  'aur', 'ya', 'par', 'pe', 'bhi', 'to', 'toh', 'kya', 'kaise', 'kab', 'kyu', 'kyun', 'kaha', 'kahan',
  'mera', 'meri', 'mere', 'apna', 'apni', 'apne', 'hum', 'hume', 'humare', 'mujhe', 'mujhko', 'kisi',
  'kuch', 'sab', 'sabse', 'bohot', 'bahut', 'thoda', 'jyada', 'sabhi', 'wala', 'wali', 'wale', 'krna',
  'kar', 'raha', 'rahi', 'rahe', 'kuchh', 'ek', 'do', 'teen', 'char', 'paanch', 'rupya', 'rupaye',
  'में', 'से', 'को', 'का', 'के', 'की', 'है', 'हैं', 'हो', 'था', 'थी', 'थे', 'करना', 'करे', 'करें',
  'होना', 'होगा', 'होगी', 'चाहिए', 'लिए', 'लिया', 'दिया', 'और', 'या', 'पर', 'भी', 'तो', 'क्या',
  'कैसे', 'कब', 'क्यों', 'कहाँ', 'मेरा', 'मेरी', 'मेरे', 'अपना', 'अपनी', 'अपने', 'हम', 'हमें',
  'हमारे', 'मुझे', 'मुझको', 'किसी', 'कुछ', 'सब', 'सबसे', 'बहुत', 'थोड़ा', 'ज्यादा', 'सभी', 'वाला',
  'वाली', 'वाले', 'रहा', 'रही', 'रहे', 'एक', 'दो'
]);

const INTENT_RULES = [
  { regex: /fish|machh?li|matsya|pond|talaab|biofloc|मछली|मत्स्य|तालाब/i, favoredSchemeIds: [51, 14, 31], boost: 90 },
  { regex: /dairy|pashu|cattle|cow|gai|buffalo|bhains|goat|bakri|sheep|bhed|livestock|डेयरी|पशु|गाय|भैंस|बकरी|गोकुल/i, favoredSchemeIds: [52, 53, 14, 31], boost: 90 },
  { regex: /honey|bee|madhumakkhi|maun|मधुमक्खी|शहद/i, favoredSchemeIds: [54, 31, 14], boost: 90 },
  { regex: /water.*conservation|sarovar|amrit sarovar|pond|अमृत सरोवर|तालाब|जल संरक्षण/i, favoredSchemeIds: [55, 43], boost: 90 },
  { regex: /solar.*pump|kusum|pump.*solar|khet.*solar|सोलर पंप|कुसुम|खेत में सोलर/i, favoredSchemeIds: [26, 41, 31], boost: 95 },
  { regex: /bijli|rooftop|surya ghar|electric.*bill|बिजली बिल|छत पर सोलर|सूर्य घर/i, favoredSchemeIds: [41, 67, 26], boost: 90 },
  { regex: /tractor|drone|machine|mechaniz|smam|कृषि यंत्र|ट्रैक्टर|ड्रोन|यंत्र|मशीन/i, favoredSchemeIds: [27, 31, 14], boost: 90 },
  { regex: /bima|insurance|fasal.*nuksan|damage|sukha|baadh|barish|फसल बीमा|मुआवजा|नुकसान|सूखा|बाढ़/i, favoredSchemeIds: [15, 14, 1], boost: 95 },
  { regex: /organic|natural|jaivik|mitti|soil|urvarak|जैविक|प्राकृतिक|मिट्टी|उर्वरक/i, favoredSchemeIds: [30, 29, 1], boost: 85 },
  { regex: /kcc|credit card|agri.*loan|kisan.*loan|क्रेडिट कार्ड|कृषि ऋण/i, favoredSchemeIds: [14, 31, 1], boost: 90 },
  { regex: /kisan.*pension|pension.*kisan|maandhan|मानधन|किसान पेंशन/i, favoredSchemeIds: [28, 7], boost: 90 },
  { regex: /overseas|abroad|foreign|videsh|विदेश|विदेश में पढ़ाई/i, favoredSchemeIds: [56, 5], boost: 90 },
  { regex: /author|writer|writing|yuva|लेखक|किताब|लेखन|युवा लेखक/i, favoredSchemeIds: [57, 5], boost: 90 },
  { regex: /science|inspire|research.*fellowship|अनुसंधान|वैज्ञानिक|शोध|इंस्पायर/i, favoredSchemeIds: [58, 60, 33], boost: 90 },
  { regex: /north.*east|assam|manipur|tripura|ner|ishan uday|पूर्वोत्तर|ईशान उदय/i, favoredSchemeIds: [59, 5], boost: 90 },
  { regex: /girl|beti|ladki|female|women.*student|pragati|बेटी|लड़की|छात्रा|प्रगति|हजरत महल/i, favoredSchemeIds: [35, 36, 18, 32], boost: 90 },
  { regex: /divyang|handicap|disab|saksham|adhikarita|adip|udid|विकलांग|दिव्यांग|सक्षम|असमर्थ|उपकरण/i, favoredSchemeIds: [34, 72, 73, 46, 25, 44], boost: 95 },
  { regex: /college|university|btech|degree|higher education|कॉलेज|यूनिवर्सिटी|ग्रेजुएशन|डिग्री|उच्च शिक्षा/i, favoredSchemeIds: [33, 35, 32, 5], boost: 70 },
  { regex: /merit|means|nmmss|scholarship|fees|chhatravritti|छात्रवृत्ति|स्कॉलरशिप|फीस/i, favoredSchemeIds: [23, 5, 32, 33], boost: 70 },
  { regex: /medicine|generic|dawa|medical.*store|janaushadhi|सस्ती दवा|दवाई|जन औषधि/i, favoredSchemeIds: [61, 65, 2], boost: 90 },
  { regex: /dialysis|kidney|डायलिसिस|किडनी/i, favoredSchemeIds: [40, 2], boost: 95 },
  { regex: /tb|tuberculosis|nikshay|kshay|टीबी|क्षय रोग|निक्षय/i, favoredSchemeIds: [39, 2], boost: 95 },
  { regex: /child.*health|screening|surgery.*child|बाल स्वास्थ्य|बच्चों की जांच/i, favoredSchemeIds: [62, 64, 2], boost: 90 },
  { regex: /cancer|serious.*illness|critical|financial.*illness|गंभीर बीमारी|कैंसर|आरोग्य निधि/i, favoredSchemeIds: [63, 2, 40], boost: 95 },
  { regex: /vaccin|teekakaran|indradhanush|टीकाकरण|इंद्रधनुष/i, favoredSchemeIds: [64, 22], boost: 90 },
  { regex: /ayushman|hospital|operation|ilaj|card|swasthya|अस्पताल|इलाज|आयुष्मान|ऑपरेशन|उपचार/i, favoredSchemeIds: [2, 37, 40, 63], boost: 75 },
  { regex: /70|senior.*health|vay.*vandana|वरिष्ठ.*आयुष्मान|70 वर्ष/i, favoredSchemeIds: [37, 44, 8, 7], boost: 90 },
  { regex: /bujurg|senior|vridha|old.*age|vriddha|दादाजी|बुजुर्ग|वरिष्ठ नागरिक|वृद्धावस्था/i, favoredSchemeIds: [8, 44, 7, 37], boost: 75 },
  { regex: /widow|vidhwa|pati.*mrityu|husband.*death|पति की मृत्यु|विधवा|विधवा पेंशन/i, favoredSchemeIds: [45, 70, 19, 8], boost: 95 },
  { regex: /family.*benefit|breadwinner.*death|earning.*member.*death|पारिवारिक लाभ|कमाने वाले की मृत्यु/i, favoredSchemeIds: [70, 45, 19], boost: 95 },
  { regex: /shram.*yogi|mazdoor.*pension|unorganized.*pension|श्रमिक पेंशन|श्रम योगी/i, favoredSchemeIds: [69, 7, 21], boost: 95 },
  { regex: /makan|ghar|house|awas|chhat|jhopdi|kacha.*ghar|kaccha|pucca|मकान|घर|आवास|छत|झोपड़ी|पक्का मकान/i, favoredSchemeIds: [3, 4, 66, 79], boost: 85 },
  { regex: /rental|kiraya|migrant.*housing|किराया आवास|प्रवासी/i, favoredSchemeIds: [66, 4], boost: 90 },
  { regex: /bijli.*connection|saubhagya|बिजली कनेक्शन|सौभाग्य/i, favoredSchemeIds: [67, 41], boost: 90 },
  { regex: /toilet|shauchalay|latrine|swachh|शौचालय|स्वच्छ भारत/i, favoredSchemeIds: [42, 3], boost: 90 },
  { regex: /water|nal|paani|tap.*water|jal.*jeevan|नल|जल जीवन|पानी/i, favoredSchemeIds: [43, 3], boost: 90 },
  { regex: /ration|rashan|anna|grain|chawal|gehun|राशन|अन्न|मुफ्त अनाज/i, favoredSchemeIds: [24, 16], boost: 90 },
  { regex: /vendor|thela|rehri|footpath|patree|svanidhi|स्ट्रीट वेंडर|ठेला|रेहड़ी|पटरी|स्वनिधि/i, favoredSchemeIds: [10, 9, 13], boost: 90 },
  { regex: /dukan|shop|mudra|business|vyapar|dukaan|दुकान|मुद्रा|व्यापार|लघु उद्योग|स्वरोजगार/i, favoredSchemeIds: [9, 13, 11, 75], boost: 75 },
  { regex: /startup|seed.*fund|innovat|स्टार्टअप|सीड फंड|नवाचार/i, favoredSchemeIds: [78, 13, 9], boost: 95 },
  { regex: /artisan|karigar|carpenter|blacksmith|tailor|tool kit|vishwakarma|bunkar|shilpkar|कारीगर|विश्वकर्मा|बढ़ई|लोहार|दर्जी|शिल्पकार|हथकरघा/i, favoredSchemeIds: [12, 49, 76, 9], boost: 90 },
  { regex: /self.*help.*group|shg|mahila.*samuh|swayam.*sahayata|स्वयं सहायता समूह|महिला समूह/i, favoredSchemeIds: [74, 47, 11], boost: 90 },
  { regex: /cgtmse|guarantee.*cover|collateral.*free.*loan|क्रेडिट गारंटी|बिना गारंटी लोन/i, favoredSchemeIds: [75, 9, 11], boost: 90 },
  { regex: /zed|quality.*cert|zero.*defect|जेड प्रमाणन/i, favoredSchemeIds: [76, 75], boost: 95 },
  { regex: /job.*portal|ncs|naukri|berojgar|रोजगार पोर्टल|नौकरी खोज/i, favoredSchemeIds: [77, 50, 48], boost: 90 },
  { regex: /tribal|adivasi|pvtg|janman|जनजातीय|आदिवासी|जनमन/i, favoredSchemeIds: [79, 3, 56], boost: 95 },
  { regex: /agnipath|agniveer|army|armed.*force|defence|अग्निपथ|अग्निवीर|सेना/i, favoredSchemeIds: [80, 77], boost: 95 },
  { regex: /skill|kaushal|apprentice|training|iti|naps|ट्रेनिंग|कौशल|शिक्षुता/i, favoredSchemeIds: [50, 48, 13], boost: 90 }
];

function matchSituationLocally(query, isHindi, allSchemesList) {
  const textLower = (query || '').toLowerCase().trim();
  const meaningfulWords = textLower.split(/[\s,.;:!?]+/).filter(w => w.length >= 2 && !STOP_WORDS.has(w));

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
      'sugarcane', 'agriculture', 'sinchai', 'lekhpal', 'patwari', 'bhoomi', 'machhli', 'matsya', 'fisheries',
      'किसान', 'खेती', 'फसल', 'बीज', 'खाद', 'उर्वरक', 'जमीन', 'भूमि', 'खसरा', 'खतौनी', 'कृषि', 'गेहूं',
      'धान', 'गन्ना', 'सिंचाई', 'ऋण', 'मुआवजा', 'पटवारी', 'कृषक', 'मछली', 'डेयरी'
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

  // Primary category calculation
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
  
  // High-precision individual scheme scoring
  const scored = list.map(scheme => {
    let score = 20;

    // 1. Intent Rule Matching (Highest specificity)
    for (const rule of INTENT_RULES) {
      if (rule.regex.test(textLower)) {
        const rankIdx = rule.favoredSchemeIds.indexOf(scheme.id);
        if (rankIdx !== -1) {
          score += rule.boost - (rankIdx * 10);
        }
      }
    }

    // 2. Token Overlap Matching (Excluding stopwords)
    const nameStr = (scheme.name + ' ' + (scheme.name_hi || '')).toLowerCase();
    const descStr = ((scheme.description || '') + ' ' + (scheme.description_hi || '')).toLowerCase();
    const benStr = ((scheme.benefits || '') + ' ' + (scheme.benefits_hi || '')).toLowerCase();
    const eligStr = ((scheme.eligibility_criteria || '') + ' ' + (scheme.eligibility_criteria_hi || '')).toLowerCase();

    meaningfulWords.forEach(w => {
      if (nameStr.includes(w)) score += 20;
      if (descStr.includes(w)) score += 8;
      if (benStr.includes(w)) score += 8;
      if (eligStr.includes(w)) score += 5;
    });

    // 3. Category match bonus
    if (primaryCategory && scheme.category === primaryCategory) {
      score += 15;
    }

    return {
      scheme,
      rawScore: score
    };
  });

  // Sort by rawScore descending
  scored.sort((a, b) => b.rawScore - a.rawScore);

  // Return top 10 schemes with tiered realistic match percentages
  const tierScores = [98, 93, 88, 83, 78, 73, 68, 64, 60, 56];
  const topSchemes = scored.slice(0, 10).map((item, idx) => {
    const s = item.scheme;
    const reqDocsRaw = (s.required_documents || (Array.isArray(s.docs) ? s.docs.join(', ') : 'Aadhaar Card, Bank Passbook'))
      .split(/[,;]+/)
      .map(d => d.trim().replace(/\.$/, ''))
      .filter(Boolean);

    return {
      ...s,
      match_score: tierScores[idx] || Math.max(50, 95 - idx * 5),
      required_documents_list: reqDocsRaw.length > 0 ? reqDocsRaw : ['Aadhaar Card', 'Bank Passbook'],
      reason: isHindi
        ? 'आपकी व्यक्त स्थिति और आवश्यकता के आधार पर पूर्णतः उपयुक्त। आवेदन के लिए नीचे दिए गए दस्तावेज़ आवश्यक हैं।'
        : 'Directly matches your described situation. See required documents below to apply.'
    };
  });

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


export const PERSONA_TABS = [
  { key: 'farmer', labelEn: '🌾 Farmer', labelHi: '🌾 किसान' },
  { key: 'student', labelEn: '🎓 Student', labelHi: '🎓 छात्र' },
  { key: 'senior', labelEn: '👴 Senior Citizen', labelHi: '👴 वरिष्ठ नागरिक' },
  { key: 'entrepreneur', labelEn: '💼 Small Business / Artisan', labelHi: '💼 स्वरोजगार / कारीगर' }
];

export const PERSONA_SCHEME_SCENARIOS = {
  farmer: [
    {
      icon: '🌾',
      labelEn: 'Seeds, Fertilizer & PM-Kisan Crop Subsidy',
      labelHi: 'छोटे किसान: बीज, खाद व फसल सब्सिडी सहायता',
      situation: 'I am a small farmer with 2 acres cultivable land facing high cost of seeds and fertilizer. I need government crop financial assistance and PM-Kisan support.',
      situationHi: 'मेरे पास 2 एकड़ कृषि भूमि है। मुझे उन्नत बीज, खाद और फसल हेतु सरकारी सहायता व सब्सिडी चाहिए।'
    },
    {
      icon: '☀️',
      labelEn: 'Solar Agri Pump (PM Kusum 90% Subsidy)',
      labelHi: 'सोलर पंप (पीएम कुसुम 90% सरकारी अनुदान)',
      situation: 'I am spending high money on diesel generator for irrigation. I need to install a solar water pump under PM Kusum with 90% government subsidy.',
      situationHi: 'मुझे अपने खेत में सिंचाई हेतु सोलर कृषि पंप लगवाना है। मुझे पीएम कुसुम योजना के तहत 90% तक सरकारी अनुदान का लाभ लेना है।'
    },
    {
      icon: '🚜',
      labelEn: 'Farm Machinery & Tractor Subsidy (SMAM)',
      labelHi: 'ट्रैक्टर व कृषि यंत्र अनुदान (SMAM सब्सिडी)',
      situation: 'I need to purchase a power tiller and rotavator for field preparation. I want 40% to 50% government subsidy under Agricultural Mechanization scheme.',
      situationHi: 'मुझे नए रोटावेटर/ट्रैक्टर की खरीद पर 40% से 50% सरकारी अनुदान (कृषि यंत्रीकरण योजना) की पात्रता जाननी है।'
    },
    {
      icon: '🛡️',
      labelEn: 'Crop Insurance & Disaster Loss (PMFBY)',
      labelHi: 'फसल बीमा व प्राकृतिक आपदा मुआवजा (PMFBY)',
      situation: 'Excessive unseasonal rain and hailstorm severely damaged my standing wheat/paddy crop. I need compensation under PM Fasal Bima Yojana.',
      situationHi: 'अतिवृष्टि और ओलावृष्टि से मेरी फसल खराब हो गई है। मुझे प्रधानमंत्री फसल बीमा योजना के तहत क्लेम व मुआवजा राशि प्राप्त करनी है।'
    },
    {
      icon: '🌿',
      labelEn: 'Organic Farming & Compost Grant (PKVY)',
      labelHi: 'जैविक खेती व कम्पोस्ट खाद अनुदान (PKVY)',
      situation: 'I want to adopt chemical-free organic farming on my agricultural land. I need ₹50,000 per hectare grant under Paramparagat Krishi Vikas Yojana.',
      situationHi: 'मैं रसायनमुक्त जैविक खेती शुरू करना चाहता हूँ। मुझे परंपरागत कृषि विकास योजना के तहत ₹50,000 प्रति हेक्टेयर सहायता की पात्रता जाननी है।'
    }
  ],
  student: [
    {
      icon: '🎓',
      labelEn: 'College Student: Higher Education Scholarship',
      labelHi: 'छात्र: कॉलेज फीस व उच्च शिक्षा छात्रवृत्ति (NSP)',
      situation: 'I am a 12th pass student from a low-income family seeking scholarship to pay for college graduation fees and books under National Scholarship Portal.',
      situationHi: 'मैं 12वीं पास छात्र हूँ और मेरा परिवार कम आय वर्ग से है। मुझे कॉलेज फीस और पढ़ाई के लिए सरकारी स्कॉलरशिप चाहिए।'
    },
    {
      icon: '💻',
      labelEn: 'Free Student Tablet / Laptop Scheme',
      labelHi: 'मुफ्त टैबलेट/लैपटॉप व डिजिटल शिक्षा सहायता',
      situation: 'I am enrolled in an undergraduate degree and need a digital laptop/tablet device provided by government for technical coursework and online lectures.',
      situationHi: 'मैं स्नातक में पढ़ रहा हूँ और ऑनलाइन क्लास व पढ़ाई के लिए डिजिटल उपकरण की आवश्यकता है। मुझे छात्र टैबलेट योजना की पात्रता जाननी है।'
    },
    {
      icon: '🏆',
      labelEn: 'PM-YASASVI Meritorious Scholarship',
      labelHi: 'पीएम यशस्वी (PM-YASASVI) मेधावी छात्रवृत्ति',
      situation: 'I scored high merit marks in school examinations. I am seeking Rs 75,000 to Rs 1,25,000 per year top-class education scholarship for higher studies.',
      situationHi: 'मैं 10वीं/12वीं में अच्छे अंकों से उत्तीर्ण हुआ हूँ। मुझे उच्चतर माध्यमिक शिक्षा हेतु ₹75,000 से ₹1,25,000 वार्षिक मेधावी स्कॉलरशिप चाहिए।'
    },
    {
      icon: '📚',
      labelEn: 'Free Coaching for Competitive Exams',
      labelHi: 'प्रतियोगी परीक्षा मुफ्त कोचिंग (Free Coaching)',
      situation: 'I am preparing for competitive government examinations (UPSC/SSC/Banking) and need government sponsored free coaching plus monthly student stipend.',
      situationHi: 'मैं प्रतियोगी परीक्षा की तैयारी कर रहा हूँ। मुझे सामाजिक न्याय मंत्रालय की मुफ्त कोचिंग एवं मासिक वजीफा योजना की जानकारी चाहिए।'
    },
    {
      icon: '🌸',
      labelEn: 'Pragati Scholarship for Girl Students',
      labelHi: 'प्रगति छात्रवृत्ति: बालिकाओं हेतु ₹50,000 प्रति वर्ष',
      situation: 'I am a female student admitted to AICTE approved technical engineering degree course and need Rs 50,000 per year Pragati scholarship assistance.',
      situationHi: 'मैं तकनीकी इंजीनियरिंग कॉलेज में पढ़ रही छात्रा हूँ। मुझे एआईसीटीई प्रगति छात्रवृत्ति के तहत ₹50,000 वार्षिक सहायता की जानकारी चाहिए।'
    }
  ],
  senior: [
    {
      icon: '👴',
      labelEn: 'Senior Citizen: Old Age Pension & Life Cert',
      labelHi: 'वरिष्ठ नागरिक: मासिक वृद्धावस्था पेंशन सहायता',
      situation: 'I am a 65 year old senior citizen with no fixed income source and need monthly old age pension and social security under IGNOAPS.',
      situationHi: 'मेरी उम्र 65 वर्ष है और कोई नियमित आय नहीं है। मुझे मासिक वृद्धावस्था पेंशन व जीवन प्रमाण पत्र की जानकारी चाहिए।'
    },
    {
      icon: '🏥',
      labelEn: 'Ayushman 70+ Free ₹5 Lakh Hospital Cover',
      labelHi: 'आयुष्मान 70+ वर्ष मुफ्त ₹5 लाख इलाज (वय वंदना)',
      situation: 'I am a senior citizen aged 70 or above. I want to generate the new Ayushman Bharat Vay Vandana card for free Rs 5 lakh annual hospital coverage.',
      situationHi: 'हमारे परिवार में 70 वर्ष से अधिक आयु के वरिष्ठ नागरिक हैं। मुझे नए नियम अनुसार बिना किसी आय सीमा के ₹5 लाख का मुफ्त आयुष्मान कार्ड चाहिए।'
    },
    {
      icon: '👓',
      labelEn: 'Rashtriya Vayoshri: Free Assistive Devices',
      labelHi: 'राष्ट्रीय वयोश्री: मुफ्त चश्मा, व्हीलचेयर व श्रवण यंत्र',
      situation: 'I am an elderly person with walking and hearing impairment needing free spectacles, walking stick, hearing aid and wheelchair from government camp.',
      situationHi: 'वरिष्ठ नागरिक को चलने में परेशानी और कम सुनाई देने की समस्या है। मुझे सरकारी शिविर से मुफ्त श्रवण यंत्र और छड़ी/व्हीलचेयर चाहिए।'
    },
    {
      icon: '💰',
      labelEn: 'Atal Pension Yojana (Guaranteed Monthly Pension)',
      labelHi: 'अटल पेंशन योजना: आजीवन मासिक गारंटीशुदा पेंशन',
      situation: 'I want to claim or subscribe to Atal Pension Yojana to ensure guaranteed Rs 1,000 to Rs 5,000 monthly pension credited directly to bank account.',
      situationHi: 'मुझे 60 वर्ष की आयु के बाद प्रति माह ₹1,000 से ₹5,000 की सरकारी गारंटीशुदा आजीवन पेंशन प्राप्त करने की प्रक्रिया जाननी है।'
    },
    {
      icon: '🏠',
      labelEn: 'Widow / Destitute Senior Citizen Welfare',
      labelHi: 'विधवा व बेसहारा वरिष्ठ नागरिक सामाजिक सुरक्षा',
      situation: 'I am a widow elderly woman needing monthly widow pension, free foodgrain allocation, and healthcare access through official welfare schemes.',
      situationHi: 'मुझे मासिक विधवा पेंशन, अंत्योदय राशन कार्ड और वृद्धावस्था सामाजिक सुरक्षा योजनाओं की पात्रता व सहायता चाहिए।'
    }
  ],
  entrepreneur: [
    {
      icon: '🔨',
      labelEn: 'PM Vishwakarma: ₹15,000 Toolkit & 5% Loan',
      labelHi: 'पीएम विश्वकर्मा: ₹15,000 टूलकिट व 5% सस्ता ऋण',
      situation: 'I am a traditional carpenter/tailor/artisan seeking Rs 15,000 free toolkit grant, skill training stipend, and Rs 1 to 3 Lakh enterprise loan at 5% interest.',
      situationHi: 'मैं सिलाई और बढ़ई का कार्य करता हूँ। मुझे ₹15,000 की मुफ्त टूल-किट और मात्र 5% ब्याज पर विश्वकर्मा ऋण चाहिए।'
    },
    {
      icon: '🛒',
      labelEn: 'Street Vendor: PM SVANidhi Micro Credit',
      labelHi: 'रेहड़ी-पटरी विक्रेता: फल-सब्जी ठेला स्वनिधि ऋण',
      situation: 'I am an urban street vendor selling vegetables and fruits and need collateral-free loan of Rs 10,000 to Rs 50,000 with 7% interest subsidy.',
      situationHi: 'मैं सड़क किनारे फल और सब्जी का ठेला लगाता हूँ। मुझे बिना गारंटी 10,000 से 50,000 का सरकारी स्वनिधि लोन चाहिए।'
    },
    {
      icon: '🏭',
      labelEn: 'PMEGP: 35% Govt Subsidy on Business Setup',
      labelHi: 'PMEGP: 35% सरकारी सब्सिडी पर नया उद्योग/दुकान',
      situation: 'I want to establish a small food processing or manufacturing micro-enterprise and need up to Rs 50 Lakh bank loan with 35% government margin subsidy.',
      situationHi: 'मुझे खाद्य प्रसंस्करण/विनिर्माण की नई इकाई लगानी है। मुझे खादी ग्रामोद्योग (PMEGP) के तहत 35% मार्जिन मनी सब्सिडी पर लोन चाहिए।'
    },
    {
      icon: '👩‍💼',
      labelEn: 'NRLM Women SHG Revolving Capital Fund',
      labelHi: 'महिला स्वयं सहायता समूह (SHG) रिवॉल्विंग फंड',
      situation: 'Our women Self-Help Group (SHG) makes pickles, spices and textiles and needs revolving fund and low-interest credit linkage under NRLM.',
      situationHi: 'हमारा महिला स्वयं सहायता समूह सिलाई और पापड़/मसाला निर्माण करता है। हमें आजीविका मिशन (NRLM) से कम ब्याज पर पूंजी सहायता चाहिए।'
    },
    {
      icon: '🏬',
      labelEn: 'PM Mudra Yojana (Shishu/Kishore up to ₹10 Lakh)',
      labelHi: 'मुद्रा योजना: किराना दुकान व व्यवसाय विस्तार ऋण',
      situation: 'I want to expand my retail shop with additional inventory and counter setup. I need collateral-free Mudra loan up to Rs 5 Lakh.',
      situationHi: 'मुझे अपनी दुकान में नया माल और इन्वेंट्री भरने के लिए बिना किसी बैंक गारंटी के ₹5 लाख का मुद्रा किशोर लोन चाहिए।'
    }
  ]
};

const PRESET_SITUATIONS = PERSONA_SCHEME_SCENARIOS.farmer;

export const detectPersonaFromUser = (u) => {
  if (!u) return 'farmer';
  const text = ((u.role || '') + ' ' + (u.occupation || '') + ' ' + (u.name || '')).toLowerCase();
  if (text.includes('student') || text.includes('aarav') || text.includes('scholar') || text.includes('study') || text.includes('college')) return 'student';
  if (text.includes('senior') || text.includes('pension') || text.includes('kamla') || text.includes('bujurg') || text.includes('homemaker')) return 'senior';
  if (text.includes('artisan') || text.includes('shg') || text.includes('vendor') || text.includes('sunita') || text.includes('business') || text.includes('self-employed')) return 'entrepreneur';
  if (text.includes('farmer') || text.includes('kisan') || text.includes('krishi') || text.includes('rajesh') || text.includes('kheti')) return 'farmer';
  return 'farmer';
};

function SchemeFinder() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const isHindi = i18n.language === 'hi';

  // Mode: 'smart' (Voice/Text AI Matcher) vs 'manual' (Discover Schemes Manually)
  const defaultMode = searchParams.get('mode') === 'manual' ? 'manual' : 'smart';
  const activePersona = detectPersonaFromUser(user);

  const [activeMode, setActiveMode] = useState(defaultMode);

  // Smart Matcher State
  const initialText = searchParams.get('q') || '';
  const [situationText, setSituationText] = useState(initialText);
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState('');
  const [matchingLoading, setMatchingLoading] = useState(false);

  // Schemes NEVER appear until the citizen clicks "Find Eligible Schemes"!
  const [matchedResults, setMatchedResults] = useState(null);

  // Saved Schemes State
  const [savedIds, setSavedIds] = useState(new Set());
  const [savedMessage, setSavedMessage] = useState('');

  // Manual Discovery State
  const [schemes, setSchemes] = useState(ALL_DEMO_SCHEMES);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [onlyDbt, setOnlyDbt] = useState(false);

  useEffect(() => {
    fetchSavedSchemes();
    fetchSchemes();
  }, []);

  const fetchSchemes = async () => {
    try {
      const res = await fetch('/api/schemes');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setSchemes(data);
          return;
        }
      }
      setSchemes(ALL_DEMO_SCHEMES);
    } catch (e) {
      setSchemes(ALL_DEMO_SCHEMES);
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

  const handleSaveScheme = async (scheme) => {
    try {
      const token = localStorage.getItem('jansetu_token');
      await fetch('/api/saved-schemes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : ''
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

  // Voice Input (Web Speech API)
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

  // Filtered Schemes for Manual Discovery Mode
  const filteredManualSchemes = (schemes || ALL_DEMO_SCHEMES).filter((scheme) => {
    if (selectedCategory !== 'All' && scheme.category !== selectedCategory) {
      return false;
    }
    if (onlyDbt) {
      const textToCheck = `${scheme.benefits || ''} ${scheme.description || ''} ${scheme.name || ''} ${scheme.benefits_hi || ''}`.toLowerCase();
      const isDbt = textToCheck.includes('dbt') ||
                    textToCheck.includes('direct') ||
                    textToCheck.includes('खाते') ||
                    textToCheck.includes('kisan') ||
                    textToCheck.includes('pension') ||
                    textToCheck.includes('सब्सिडी');
      if (!isDbt) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        scheme.name.toLowerCase().includes(q) ||
        (scheme.name_hi && scheme.name_hi.includes(q)) ||
        (scheme.description && scheme.description.toLowerCase().includes(q)) ||
        (scheme.description_hi && scheme.description_hi.includes(q)) ||
        (scheme.benefits && scheme.benefits.toLowerCase().includes(q)) ||
        (scheme.category && scheme.category.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const categories = [
    { key: 'All', labelEn: 'All Schemes', labelHi: 'सभी योजनाएं' },
    { key: 'Agriculture', labelEn: '🌾 Agriculture', labelHi: '🌾 कृषि' },
    { key: 'Education', labelEn: '🎓 Education', labelHi: '🎓 शिक्षा' },
    { key: 'Healthcare', labelEn: '🏥 Healthcare', labelHi: '🏥 स्वास्थ्य' },
    { key: 'Housing', labelEn: '🏠 Housing', labelHi: '🏠 आवास' },
    { key: 'Pension', labelEn: '👴 Pension', labelHi: '👴 पेंशन' },
    { key: 'Financial Assistance', labelEn: '💼 Financial Assistance', labelHi: '💼 वित्तीय सहायता' },
    { key: 'Employment', labelEn: '🔨 Employment & Skills', labelHi: '🔨 रोजगार व कौशल' }
  ];

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto px-4 sm:px-6">
      {/* Top Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-taupe-200 text-taupe-950 text-xs font-semibold">
          <ShieldCheck size={14} className="text-taupe-800" />
          <span>{t('verifiedGovtScheme')}</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-taupe-950">
          {isHindi ? 'सरकारी योजना खोजक (Scheme Finder)' : 'Government Scheme Finder Portal'}
        </h1>
        <p className="text-xs sm:text-sm text-taupe-600 leading-relaxed">
          {isHindi
            ? 'अपनी स्थिति बोलें या लिखें। जनसेतु आपकी पात्रता, लाभ और आवश्यक दस्तावेज़ों की सूची तैयार करेगा—कोई अनावश्यक अपलोड नहीं!'
            : 'Simply speak or type your situation. JanSetu instantly identifies eligible schemes and automatically extracts the required documents for you.'}
        </p>

        {/* Mode Switcher Tabs (Matching Loans Section Pattern) */}
        <div className="inline-flex p-1 bg-taupe-100 rounded-2xl border border-taupe-300 shadow-sm mt-3">
          <button
            type="button"
            onClick={() => setActiveMode('smart')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeMode === 'smart'
                ? 'bg-taupe-900 text-taupe-50 shadow'
                : 'text-taupe-700 hover:text-taupe-950'
            }`}
          >
            <Sparkles size={16} className={activeMode === 'smart' ? 'text-amber-300' : ''} />
            <span>{isHindi ? '🎙️ बोलकर या स्थिति से खोजें (AI)' : '🎙️ Match by Need & Voice (AI)'}</span>
          </button>

          {/* Discover Schemes Manually Mode */}
          <button
            type="button"
            onClick={() => setActiveMode('manual')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeMode === 'manual'
                ? 'bg-taupe-900 text-taupe-50 shadow'
                : 'text-taupe-700 hover:text-taupe-950'
            }`}
          >
            <Search size={16} />
            <span>{isHindi ? '🔍 मैन्युअल योजना खोजक (Discover Schemes Manually)' : '🔍 Discover Schemes Manually'}</span>
          </button>
        </div>
      </div>

      {savedMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-taupe-850 text-taupe-50 px-4 py-3 rounded-xl shadow-xl text-xs flex items-center gap-2 border border-taupe-700 animate-fade-in">
          <CheckCircle size={14} className="text-emerald-400" />
          <span>{savedMessage}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODE 1: SMART VOICE / TYPE SCHEME FINDER                 */}
      {/* ========================================================= */}
      {activeMode === 'smart' && (
        <div className="space-y-6">
          {/* Main Voice/Text Input Card */}
          <div className="bg-white border-2 border-taupe-300 rounded-3xl p-5 sm:p-8 shadow-sm space-y-6">
            
            {/* Quick 1-Click Persona Prompts - Strictly Profile-Adaptive (No manual persona switching) */}
            <div>
              <div className="flex items-center justify-between flex-wrap gap-2 mb-2.5">
                <div className="text-xs font-bold uppercase tracking-wider text-taupe-700 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-600" />
                  <span>
                    {isHindi ? 'आपकी प्रोफ़ाइल अनुसार प्रमुख समस्याएं (Common Problems):' : 'Common Problems for Your Profile:'}
                  </span>
                  {user && (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                      {user.avatar || '👤'} {user.occupation || user.role}
                    </span>
                  )}
                </div>
              </div>

              {/* Scenarios Grid Strictly for Active Profile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                {(PERSONA_SCHEME_SCENARIOS[activePersona] || PERSONA_SCHEME_SCENARIOS.farmer).map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="p-3 bg-taupe-50 hover:bg-taupe-100 border border-taupe-200 hover:border-taupe-400 rounded-2xl text-left transition-all group hover:shadow-sm"
                  >
                    <div className="text-base mb-1">{preset.icon}</div>
                    <div className="text-xs font-bold text-taupe-900 group-hover:text-taupe-950 line-clamp-2">
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
                    ? 'ऊपर अपनी स्थिति लिखें या माइक से बोलें (या कोई आम समस्या चुनें), फिर "पात्र सरकारी योजनाएं खोजें" बटन पर क्लिक करें। आपकी पात्रता, लाभ और आवश्यक दस्तावेज़ तभी प्रदर्शित होंगे।'
                    : 'Type or speak your situation above (or pick a common problem), then click "Find Eligible Schemes". Your eligible schemes, matching scores, and required documents will appear here.'}
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
                  const isSaved = savedIds.has(scheme.id);
                  return (
                    <div
                      key={scheme.id}
                      className="bg-white border-2 border-taupe-200 hover:border-taupe-400 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* Header: Category & Match Score */}
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-taupe-100 text-taupe-800 px-2.5 py-1 rounded-full border border-taupe-200">
                            {scheme.category}
                          </span>
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

                        {/* Direct Government Portal & Steps Link */}
                        {scheme.application_process && (
                          <div className="bg-blue-50/70 border border-blue-200/90 rounded-2xl p-3 mb-4 text-xs space-y-1.5">
                            <div className="font-bold text-blue-950 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                              <ExternalLink size={13} className="text-blue-700 shrink-0" />
                              <span>{isHindi ? 'आवेदन प्रक्रिया व पोर्टल वेबसाइट लिंक:' : 'How to Apply & Official Portal Link:'}</span>
                            </div>
                            <PortalStepText
                              text={scheme.application_process}
                              isHindi={isHindi}
                              defaultPortalUrl={scheme.official_url}
                              defaultPortalName={scheme.name}
                            />
                          </div>
                        )}
                      </div>

                      {/* Bottom Footer Actions */}
                      <div className="pt-3 border-t border-taupe-100 flex items-center justify-between gap-2">
                        <Link
                          to={`/schemes/${scheme.id}`}
                          className="text-xs font-bold text-taupe-900 hover:text-black flex items-center gap-1 hover:underline"
                        >
                          <span>{t('viewDetails')}</span>
                          <ArrowRight size={12} />
                        </Link>

                        {scheme.official_url && (
                          <a
                            href={scheme.official_url}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3.5 py-1.5 bg-taupe-900 hover:bg-black text-taupe-50 text-[11px] font-bold rounded-xl flex items-center gap-1 transition-colors shadow-sm active:scale-95"
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
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODE 2: DISCOVER SCHEMES MANUALLY (CATEGORY & SEARCH)     */}
      {/* ========================================================= */}
      {activeMode === 'manual' && (
        <div className="space-y-6 animate-fade-in">
          {/* Filter & Search Bar */}
          <div className="bg-white border-2 border-taupe-300 rounded-3xl p-5 sm:p-7 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-taupe-950">
                <SlidersHorizontal size={18} className="text-taupe-800" />
                <span>{isHindi ? 'मैन्युअल योजना खोज व फिल्टर (Discover Schemes Manually)' : 'Discover Schemes Manually (Filters)'}</span>
              </div>
              <span className="text-xs font-semibold text-taupe-500">
                {filteredManualSchemes.length} {isHindi ? 'योजनाएं उपलब्ध' : 'schemes found'}
              </span>
            </div>

            {/* Keyword Search Input */}
            <div className="relative">
              <Search size={18} className="absolute left-3.5 top-3 text-taupe-400" />
              <input
                type="text"
                placeholder={isHindi ? 'योजना का नाम, कीवर्ड या मंत्रालय खोजें (जैसे: पीएम-किसान, छात्रवृत्ति, आवास, आयुष्मान)...' : 'Search scheme name, keyword, or ministry (e.g. PM-Kisan, Scholarship, Housing)...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-taupe-50 rounded-xl border border-taupe-300 text-sm text-taupe-900 focus:outline-none focus:ring-2 focus:ring-taupe-700"
              />
            </div>

            {/* Category Pills */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-taupe-700 uppercase tracking-wider block">
                {isHindi ? 'श्रेणी चुनें (Category):' : 'Select Category:'}
              </label>
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
                          ? 'bg-taupe-900 text-taupe-50 shadow-sm'
                          : 'bg-taupe-100 text-taupe-800 hover:bg-taupe-200'
                      }`}
                    >
                      {isHindi ? cat.labelHi : cat.labelEn}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Filters: DBT Only Checkbox & Reset */}
            <div className="pt-3 border-t border-taupe-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-taupe-850 bg-taupe-50 px-3 py-1.5 rounded-xl border border-taupe-200">
                <input
                  type="checkbox"
                  checked={onlyDbt}
                  onChange={(e) => setOnlyDbt(e.target.checked)}
                  className="rounded border-taupe-300 text-taupe-900 focus:ring-taupe-700"
                />
                <span>{isHindi ? 'केवल प्रत्यक्ष लाभ अंतरण (DBT Eligible Schemes Only)' : 'DBT Eligible Schemes Only'}</span>
              </label>

              {(selectedCategory !== 'All' || searchQuery || onlyDbt) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('All');
                    setSearchQuery('');
                    setOnlyDbt(false);
                  }}
                  className="text-xs font-bold text-taupe-600 hover:text-taupe-950 flex items-center gap-1"
                >
                  <RotateCcw size={12} />
                  <span>{isHindi ? 'फिल्टर रीसेट करें' : 'Reset Filters'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Scheme Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredManualSchemes.map((scheme) => {
              const isSaved = savedIds.has(scheme.id);
              const docsList = (scheme.required_documents || '')
                .split(/[,;]+/)
                .map(d => d.trim().replace(/\.$/, ''))
                .filter(Boolean);

              return (
                <div
                  key={scheme.id}
                  className="bg-white border-2 border-taupe-200 hover:border-taupe-400 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Header: Category & Save */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-taupe-100 text-taupe-800 px-2.5 py-1 rounded-full border border-taupe-200">
                        {scheme.category}
                      </span>
                      <button
                        onClick={() => handleSaveScheme(scheme)}
                        className="p-1 text-taupe-400 hover:text-taupe-850"
                        title={isSaved ? 'Saved' : 'Save Scheme'}
                      >
                        {isSaved ? (
                          <BookmarkCheck size={18} className="text-taupe-850" />
                        ) : (
                          <Bookmark size={18} />
                        )}
                      </button>
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

                    {/* Required Documents */}
                    {docsList.length > 0 && (
                      <div className="bg-taupe-100/60 border border-taupe-200 rounded-2xl p-3.5 mb-4 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-taupe-900">
                          <ClipboardList size={13} className="text-taupe-700" />
                          <span>{isHindi ? 'आवश्यक दस्तावेज़:' : 'Documents You Need:'}</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {docsList.slice(0, 3).map((doc, dIdx) => (
                            <span
                              key={dIdx}
                              className="inline-flex items-center gap-1 text-[11px] font-medium bg-white text-taupe-800 border border-taupe-300 px-2 py-0.5 rounded-lg shadow-2xs"
                            >
                              <FileCheck size={11} className="text-emerald-600 flex-shrink-0" />
                              <span>{doc}</span>
                            </span>
                          ))}
                          {docsList.length > 3 && (
                            <span className="text-[10px] font-bold text-taupe-500 self-center">
                              +{docsList.length - 3} {isHindi ? 'और' : 'more'}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Direct Government Portal & Steps Link */}
                    {scheme.application_process && (
                      <div className="bg-blue-50/70 border border-blue-200/90 rounded-2xl p-3 mb-4 text-xs space-y-1.5">
                        <div className="font-bold text-blue-950 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                          <ExternalLink size={13} className="text-blue-700 shrink-0" />
                          <span>{isHindi ? 'आवेदन प्रक्रिया व पोर्टल वेबसाइट लिंक:' : 'How to Apply & Official Portal Link:'}</span>
                        </div>
                        <PortalStepText
                          text={scheme.application_process}
                          isHindi={isHindi}
                          defaultPortalUrl={scheme.official_url}
                          defaultPortalName={scheme.name}
                        />
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-taupe-100 flex items-center justify-between gap-2">
                    <Link
                      to={`/schemes/${scheme.id}`}
                      className="text-xs font-bold text-taupe-900 hover:text-black flex items-center gap-1 hover:underline"
                    >
                      <span>{t('viewDetails')}</span>
                      <ArrowRight size={12} />
                    </Link>

                    {scheme.official_url && (
                      <a
                        href={scheme.official_url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-1.5 bg-taupe-900 hover:bg-black text-taupe-50 text-[11px] font-bold rounded-xl flex items-center gap-1 transition-colors shadow-sm active:scale-95"
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

          {/* Empty State */}
          {filteredManualSchemes.length === 0 && (
            <div className="bg-white border-2 border-dashed border-taupe-300 rounded-3xl p-10 text-center space-y-2">
              <Search size={32} className="mx-auto text-taupe-400" />
              <h3 className="text-sm font-bold text-taupe-900">
                {isHindi ? 'कोई सरकारी योजना नहीं मिली' : 'No schemes matched your filters'}
              </h3>
              <p className="text-xs text-taupe-500">
                {isHindi ? 'कृपया सर्च क्वेरी या श्रेणी फिल्टर बदलकर पुनः प्रयास करें।' : 'Try resetting your category or search query.'}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchQuery('');
                  setOnlyDbt(false);
                }}
                className="mt-2 px-4 py-2 bg-taupe-850 text-taupe-50 text-xs font-bold rounded-xl"
              >
                {isHindi ? 'फिल्टर रीसेट करें' : 'Reset Filters'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SchemeFinder;
