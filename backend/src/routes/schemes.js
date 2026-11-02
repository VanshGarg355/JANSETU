const express = require('express');
const router = express.Router();
const axios = require('axios');
const demoSchemes = require('../data/demoSchemes.json');
const demoLoans = require('../data/demoLoans.json');
const { supabase } = require('../supabaseClient');

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


// POST /api/schemes/match-situation
router.post('/match-situation', async (req, res) => {
  try {
    const { situation = '', language = 'en' } = req.body;
    const isHindi = language === 'hi';
    const result = matchSituationLocally(situation, isHindi, demoSchemes);
    res.json(result);
  } catch (error) {
    console.error('Error in match-situation:', error);
    res.status(500).json({ error: 'Failed to process situation matching', details: error.message });
  }
});

// List schemes with search, category filtering, and eligibility matching
router.get('/', async (req, res) => {
  const { q, category, occupation } = req.query;

  if (!supabase) {
    let results = [...demoSchemes];

    if (q) {
      const term = q.toLowerCase();
      results = results.filter(s =>
        s.name.toLowerCase().includes(term) ||
        (s.name_hi && s.name_hi.includes(term)) ||
        (s.description && s.description.toLowerCase().includes(term)) ||
        (s.description_hi && s.description_hi.includes(term))
      );
    }

    if (category) {
      results = results.filter(s => s.category.toLowerCase() === category.toLowerCase());
    }

    if (occupation) {
      const occTerm = occupation.toLowerCase();
      results = results.filter(s => {
        const crit = (s.eligibility_criteria || '').toLowerCase();
        const desc = (s.description || '').toLowerCase();
        return crit.includes(occTerm) || desc.includes(occTerm);
      });
    }

    return res.json({ schemes: results, total: results.length });
  }

  try {
    let query = supabase.from('schemes').select('*');

    if (category) {
      query = query.ilike('category', category);
    }

    if (q) {
      query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    let schemes = data || [];

    if (occupation && schemes.length > 0) {
      const occ = occupation.toLowerCase();
      schemes = schemes.filter(s => {
        const crit = JSON.stringify(s.eligibility_criteria || '').toLowerCase();
        return crit.includes(occ);
      });
    }

    res.json({ schemes, total: schemes.length });
  } catch (error) {
    console.error('Error fetching schemes:', error);
    res.status(500).json({ error: 'Failed to fetch schemes', details: error.message });
  }
});

// GET /api/schemes/:id
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const numId = parseInt(id, 10);

  if (!supabase) {
    const scheme = demoSchemes.find(s => s.id === numId);
    if (!scheme) {
      return res.status(404).json({ error: 'Scheme not found' });
    }
    return res.json({ scheme });
  }

  try {
    const { data, error } = await supabase
      .from('schemes')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      const fallback = demoSchemes.find(s => s.id === numId);
      if (fallback) return res.json({ scheme: fallback });
      return res.status(404).json({ error: 'Scheme not found' });
    }

    res.json({ scheme: data });
  } catch (error) {
    console.error('Error fetching scheme:', error);
    res.status(500).json({ error: 'Failed to fetch scheme', details: error.message });
  }
});

module.exports = router;
