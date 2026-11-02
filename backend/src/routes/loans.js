const express = require('express');
const router = express.Router();
const demoLoans = require('../data/demoLoans.json');

// Intelligent local loan matching algorithm
function matchLoanSituation(query, isHindi = false) {
  const textLower = (query || '').toLowerCase().trim();
  const words = textLower.split(/[\s,.;:!?]+/).filter(w => w.length >= 2);

  const personaMap = {
    Agriculture: {
      en: '👨‍🌾 Farmer / Cultivator',
      hi: '👨‍🌾 कृषक / किसान',
      needEn: 'Subsidized Crop Credit, Seeds & Fertilizers (KCC)',
      needHi: 'रियायती 4% कृषि साख, फसल व बीज हेतु किसान क्रेडिट कार्ड'
    },
    'Street Vendor': {
      en: '🛒 Urban Street Vendor / Hawker',
      hi: '🛒 रेहड़ी-पटरी विक्रेता / स्ट्रीट वेंडर',
      needEn: 'Collateral-free Working Capital with 7% Interest Subsidy (PM SVANidhi)',
      needHi: 'बिना गारंटी कार्यशील पूंजी व 7% ब्याज सब्सिडी (पीएम स्वनिधि)'
    },
    Artisans: {
      en: '🔨 Artisan / Traditional Craftsman',
      hi: '🔨 कारीगर व पारंपरिक शिल्पकार',
      needEn: 'PM Vishwakarma Concessional 5% Credit & Rs 15,000 Toolkit',
      needHi: 'पीएम विश्वकर्मा 5% रियायती ऋण व ₹15,000 टूल-किट अनुदान'
    },
    Education: {
      en: '🎓 Higher Education / College Student',
      hi: '🎓 उच्च शिक्षा / कॉलेज विद्यार्थी',
      needEn: 'Collateral-free Vidya Lakshmi Education Loan with 100% Moratorium Subsidy',
      needHi: 'बिना गारंटी विद्या लक्ष्मी एजुकेशन लोन व पढ़ाई के दौरान पूर्ण ब्याज छूट'
    },
    Business: {
      en: '🏬 Micro-Entrepreneur / Shopkeeper',
      hi: '🏬 सूक्ष्म उद्यमी / छोटा व्यापारी',
      needEn: 'Collateral-free PM Mudra / PMEGP Capital Assistance',
      needHi: 'बिना गारंटी प्रधानमंत्री मुद्रा व पीएमईजीपी स्वरोजगार ऋण'
    },
    Housing: {
      en: '🏠 Home Construction / EWS Beneficiary',
      hi: '🏠 गृह निर्माण / आवास लाभार्थी',
      needEn: 'PMAY CLSS Upfront Interest Subsidy up to Rs 2.67 Lakh',
      needHi: 'पीएम आवास योजना ₹2.67 लाख तक की अग्रिम ब्याज सब्सिडी'
    }
  };

  const topicKeywords = {
    Agriculture: ['kisan', 'farmer', 'kheti', 'crop', 'fasal', 'land', 'tractor', 'seed', 'fertilizer', 'kcc', 'krishi', 'dairy', 'पशुपालन', 'किसान', 'खेती', 'फसल', 'खाद', 'बीज', 'क्रेडिट कार्ड'],
    'Street Vendor': ['vendor', 'street', 'thela', 'rehri', 'cart', 'fruit', 'vegetable', 'stall', 'svanidhi', 'रेहड़ी', 'पटरी', 'ठेला', 'सब्जी', 'फल', 'स्वनिधि', 'फेरीवाला'],
    Artisans: ['artisan', 'carpenter', 'blacksmith', 'tailor', 'potter', 'barber', 'cobbler', 'toolkit', 'vishwakarma', 'बढ़ई', 'लोहार', 'दर्जी', 'कुम्हार', 'मोची', 'विश्वकर्मा', 'टूलकिट', 'शिल्पकार'],
    Education: ['student', 'college', 'school', 'scholarship', 'btech', 'mbbs', 'degree', 'admission', 'vidya', 'lakshmi', 'fees', 'study', 'विद्यार्थी', 'कॉलेज', 'फीस', 'पढ़ाई', 'दाखिला', 'एजुकेशन'],
    Business: ['business', 'shop', 'dukan', 'store', 'mudra', 'shishu', 'kishore', 'tarun', 'machinery', 'pmegp', 'startup', 'vyapar', 'दुकान', 'व्यापार', 'मुद्रा', 'मशीन', 'स्टार्टअप', 'उद्यम'],
    Housing: ['home', 'house', 'housing', 'makan', 'ghar', 'chhat', 'awas', 'construction', 'clss', 'मकान', 'घर', 'आवास', 'छत', 'निर्माण']
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
  let maxScore = 0;
  for (const [cat, sc] of Object.entries(categoryScores)) {
    if (sc > maxScore) {
      maxScore = sc;
      primaryCategory = cat;
    }
  }

  const formalLoans = demoLoans.filter(l => l.type === 'formal');
  const scored = formalLoans.map(loan => {
    let score = 50;
    if (primaryCategory && loan.category === primaryCategory) {
      score = 88 + Math.min(10, maxScore * 2);
    } else {
      score += (categoryScores[loan.category] || 0) * 8;
    }

    const content = `${loan.name} ${loan.description || ''} ${loan.benefits || ''}`.toLowerCase();
    const contentHi = `${loan.name_hi || ''} ${loan.description_hi || ''} ${loan.benefits_hi || ''}`.toLowerCase();
    words.forEach(w => {
      if (content.includes(w) || contentHi.includes(w)) {
        score += 3;
      }
    });

    return {
      ...loan,
      match_score: Math.min(99, Math.max(45, score)),
      reason: isHindi
        ? 'आपकी वित्तीय आवश्यकता और व्यवसाय/उद्देश्य के अनुसार पूर्णतः उपयुक्त।'
        : 'Directly tailored to your funding needs and occupation profile.'
    };
  });

  const topLoans = scored.sort((a, b) => b.match_score - a.match_score).slice(0, 6);
  const detectedMeta = primaryCategory ? personaMap[primaryCategory] : null;
  const detectedPersona = detectedMeta
    ? (isHindi ? detectedMeta.hi : detectedMeta.en)
    : (isHindi ? 'नागरिक / ऋण आवेदक' : 'Citizen Loan Applicant');
  const detectedNeed = detectedMeta
    ? (isHindi ? detectedMeta.needHi : detectedMeta.needEn)
    : (isHindi ? 'सरकारी संस्थागत ऋण व ब्याज सब्सिडी' : 'Formal Government Credit & Subsidy');

  return {
    success: true,
    situation_analyzed: query,
    detected_category: primaryCategory || 'General',
    detected_persona: detectedPersona,
    detected_need: detectedNeed,
    loans: topLoans
  };
}

// 1. GET loans with filtering (Manual Discovery)
router.get('/', (req, res) => {
  const { type, category, collateral_free, max_amount, q } = req.query;
  let results = [...demoLoans];

  if (type) {
    results = results.filter(l => l.type === type);
  }
  if (category && category !== 'All') {
    results = results.filter(l => l.category && l.category.toLowerCase() === category.toLowerCase());
  }
  if (collateral_free === 'true') {
    results = results.filter(l => l.collateral_free === true);
  }
  if (max_amount) {
    const maxVal = Number(max_amount);
    if (!isNaN(maxVal)) {
      results = results.filter(l => !l.max_amount || l.max_amount <= maxVal);
    }
  }
  if (q) {
    const term = q.toLowerCase();
    results = results.filter(l =>
      l.name.toLowerCase().includes(term) ||
      (l.name_hi && l.name_hi.includes(term)) ||
      (l.description && l.description.toLowerCase().includes(term)) ||
      (l.category && l.category.toLowerCase().includes(term))
    );
  }

  res.json(results);
});

// 2. Intelligent Loan Matcher (Natural Language & Speech)
router.post('/match-situation', (req, res) => {
  const { situation = '', language = 'en' } = req.body;
  if (!situation.trim()) {
    return res.status(400).json({ error: 'Please describe your loan requirement.' });
  }
  const result = matchLoanSituation(situation, language === 'hi');
  res.json(result);
});

module.exports = router;
