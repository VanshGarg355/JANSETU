const express = require('express');
const router = express.Router();
<<<<<<< HEAD
const axios = require('axios');
const { supabase } = require('../supabaseClient');
const demoSchemes = require('../data/demoSchemes.json');
const demoLoans = require('../data/demoLoans.json');

// POST /api/schemes/match-situation
// Intelligent matching of Government Schemes based on citizen's spoken or typed situation
// Automatically extracts and displays the exact required documents for eligible schemes without manual upload
router.post('/match-situation', async (req, res) => {
  try {
    const { situation = '', language = 'en' } = req.body;
    const isHindi = language === 'hi';
    const textLower = situation.toLowerCase().trim();
    const words = textLower.split(/[\s,.;:!?]+/).filter(w => w.length >= 2);

    // 1. Comprehensive multi-lingual keyword mapping (Devanagari, Romanized Hinglish, English)
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

    // Persona & Need descriptions
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

    // Calculate relevance score against each category
    const categoryScores = {};
    for (const [cat, kws] of Object.entries(topicKeywords)) {
      let count = 0;
      kws.forEach(kw => {
        if (textLower.includes(kw.toLowerCase())) count += 1;
      });
      categoryScores[cat] = count;
    }

    // Determine primary category with highest match count
    let primaryCategory = null;
    let maxCatScore = 0;
    for (const [cat, sc] of Object.entries(categoryScores)) {
      if (sc > maxCatScore) {
        maxCatScore = sc;
        primaryCategory = cat;
      }
    }

    // 2. Score and Match Schemes
    const matchedSchemes = demoSchemes.map(scheme => {
      let score = 48; // base baseline
      const isPrimary = primaryCategory && scheme.category === primaryCategory;

      if (isPrimary) {
        // High priority for the primary detected category
        score = 88 + Math.min(10, maxCatScore * 2);
      } else {
        const catMatches = categoryScores[scheme.category] || 0;
        score += catMatches * 8;
      }

      // Check text match against scheme fields
      const content = `${scheme.name} ${scheme.description || ''} ${scheme.eligibility_criteria || ''} ${scheme.benefits || ''}`.toLowerCase();
      const contentHi = `${scheme.name_hi || ''} ${scheme.description_hi || ''} ${scheme.eligibility_criteria_hi || ''} ${scheme.benefits_hi || ''}`.toLowerCase();
      
      words.forEach(w => {
        if (content.includes(w) || contentHi.includes(w)) {
          score += 4;
        }
      });

      // Parse required documents list cleanly for user guidance
      const reqDocsRaw = (scheme.required_documents || '')
        .split(/[,;]+/)
        .map(d => d.trim().replace(/\.$/, ''))
        .filter(Boolean);

      const finalScore = Math.min(99, Math.max(45, score));

      return {
        ...scheme,
        match_score: finalScore,
        required_documents_list: reqDocsRaw.length > 0 ? reqDocsRaw : ['Aadhaar Card', 'Bank Passbook'],
        reason: isHindi
          ? `आपकी व्यक्त स्थिति के आधार पर पूर्णतः उपयुक्त। आवेदन के लिए नीचे दिए गए दस्तावेज़ आवश्यक हैं।`
          : `Directly matches your described situation. See required documents below to apply.`
      };
    });

    // Sort schemes by match_score descending, pick top 6
    const topSchemes = matchedSchemes
      .sort((a, b) => b.match_score - a.match_score)
      .slice(0, 6);

    const detectedMeta = primaryCategory ? personaMap[primaryCategory] : null;
    const detectedPersona = detectedMeta
      ? (isHindi ? detectedMeta.hi : detectedMeta.en)
      : (isHindi ? 'नागरिक लाभार्थी' : 'Citizen Beneficiary');
    const detectedNeed = detectedMeta
      ? (isHindi ? detectedMeta.needHi : detectedMeta.needEn)
      : (isHindi ? 'सरकारी कल्याणकारी योजनाएं' : 'Government Welfare Schemes');

    // 3. Generate Smart Contextual Summary
    let aiSummary = '';
    const topSchemeName = isHindi ? (topSchemes[0]?.name_hi || topSchemes[0]?.name) : topSchemes[0]?.name;
    const topDocs = topSchemes[0]?.required_documents_list?.slice(0, 3).join(', ') || (isHindi ? 'आधार कार्ड, बैंक पासबुक' : 'Aadhaar Card, Bank Passbook');

    if (isHindi) {
      aiSummary = `विश्लेषण पूर्ण: आपकी स्थिति को "${detectedPersona}" के रूप में पहचाना गया है, जिसकी मुख्य आवश्यकता "${detectedNeed}" है। आपकी पात्रता के अनुसार सबसे उपयुक्त योजना "${topSchemeName}" है। आवेदन हेतु आवश्यक दस्तावेज़: ${topDocs}।`;
    } else {
      aiSummary = `Analysis Complete: Your profile was identified as "${detectedPersona}" with focus on "${detectedNeed}". The most eligible scheme for you is "${topSchemeName}". Carry these essential documents: ${topDocs}.`;
    }

    res.json({
      success: true,
      situation_analyzed: situation,
      detected_category: primaryCategory || 'General',
      detected_persona: detectedPersona,
      detected_need: detectedNeed,
      ai_summary: aiSummary,
      schemes: topSchemes
    });
  } catch (error) {
    console.error('Error in match-situation:', error);
    res.status(500).json({ error: 'Failed to process situation matching', details: error.message });
  }
});
=======
const { supabase } = require('../supabaseClient');
const demoSchemes = require('../data/demoSchemes.json');
>>>>>>> c6a0618c18654d881a99ac583080468894e43f72

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
        s.description.toLowerCase().includes(term) ||
        s.benefits.toLowerCase().includes(term)
      );
    }

    if (category && category !== 'All') {
      results = results.filter(s => s.category.toLowerCase() === category.toLowerCase());
    }

    if (occupation) {
      const occ = occupation.toLowerCase();
      results = results.filter(s =>
        s.description.toLowerCase().includes(occ) ||
        s.eligibility_criteria.toLowerCase().includes(occ) ||
        s.category.toLowerCase().includes(occ)
      );
    }

    return res.json(results);
  }

  try {
    let query = supabase.from('schemes').select('*, scheme_translations(*)');

    if (q) {
      query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
    }

    if (category && category !== 'All') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });

    res.json(data && data.length > 0 ? data : demoSchemes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get scheme by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  if (!supabase) {
    const scheme = demoSchemes.find(s => String(s.id) === String(id));
    if (!scheme) return res.status(404).json({ error: 'Scheme not found' });
    return res.json(scheme);
  }

  try {
    const { data, error } = await supabase
      .from('schemes')
      .select('*, scheme_translations(*)')
      .eq('id', id)
      .single();

    if (error || !data) {
      const fallback = demoSchemes.find(s => String(s.id) === String(id));
      if (fallback) return res.json(fallback);
      return res.status(404).json({ error: 'Scheme not found' });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
