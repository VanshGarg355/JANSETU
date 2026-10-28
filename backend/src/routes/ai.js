const express = require('express');
const router = express.Router();
const axios = require('axios');
const demoSchemes = require('../data/demoSchemes.json');

// Context grounding / RAG knowledge
function buildContextKnowledge(query) {
  const q = query.toLowerCase();
  const matched = demoSchemes.filter(s =>
    s.name.toLowerCase().includes(q) ||
    s.category.toLowerCase().includes(q) ||
    s.benefits.toLowerCase().includes(q) ||
    (s.description && s.description.toLowerCase().includes(q))
  ).slice(0, 4);

  if (matched.length === 0) {
    return demoSchemes.slice(0, 3).map(s => `Scheme: ${s.name} (${s.category})\nBenefits: ${s.benefits}\nURL: ${s.official_url}`).join('\n\n');
  }

  return matched.map(s => `Scheme: ${s.name} (${s.category})\nBenefits: ${s.benefits}\nEligibility: ${s.eligibility_criteria}\nURL: ${s.official_url}`).join('\n\n');
}

// System prompt enforcing strict government verification ethics
const SYSTEM_PROMPT = `You are "JanSetu AI Sahayak" (जनसेतु एआई सहायक), an official civic AI government assistance companion.
Your primary role is to assist Indian citizens in finding verified government schemes, understanding eligibility, and resolving DBT payment failures.

STRICT GUIDELINES:
1. Respond in the language chosen by the user (Hindi in Devanagari script, or English).
2. ONLY provide verified public information. Always mention official government URLs (e.g. myscheme.gov.in, pfms.nic.in, pmkisan.gov.in, scholarships.gov.in).
3. NEVER ask for passwords, OTPs, PINs, or complete 12-digit Aadhaar numbers.
4. NEVER guarantee approval of schemes or immediate disbursal of funds.
5. If you do not have verified information on a scheme or query, explicitly state that it cannot be verified and refer the citizen to the relevant official ministry portal.
6. Be polite, compassionate, and clear for first-time internet users.`;

// Demo Fallback Generator
function generateDemoResponse(query, language) {
  const isHindi = language === 'hi' || /[\u0900-\u097F]/.test(query);
  const q = query.toLowerCase();

  if (q.includes('kisan') || q.includes('किसान') || q.includes('farmer')) {
    if (isHindi) {
      return `नमस्ते! **प्रधानमंत्री किसान सम्मान निधि (PM-KISAN)** योजना के तहत पात्र किसान परिवारों को प्रति वर्ष ₹6,000 की वित्तीय सहायता तीन समान किस्तों (₹2,000 प्रत्येक) में सीधे बैंक खाते में दी जाती है।\n\n📌 **पात्रता:** सभी भूमिधारक किसान परिवार जिनके नाम कृषि योग्य भूमि है।\n📌 **अनिवार्य शर्तें:** e-KYC पूर्ण होना और बैंक खाता आधार से सीड (NPCI Mapped) होना आवश्यक है।\n🌐 **आधिकारिक पोर्टल:** https://pmkisan.gov.in/\n\nयदि आपकी किस्त रुकी हुई है, तो जनसेतु के "DBT Detective" टूल से तुरंत निदान करें!`;
    }
    return `Hello! Under the **PM Kisan Samman Nidhi (PM-KISAN)** scheme, eligible landholding farmer families receive Rs 6,000 per year directly in their bank accounts via DBT in 3 installments of Rs 2,000 each.\n\n📌 **Key Requirements:** Mandatory e-KYC completion and NPCI Aadhaar-bank account seeding.\n🌐 **Official Portal:** https://pmkisan.gov.in/\n\nIf your installment has not arrived, you can use JanSetu's "DBT Detective" for a step-by-step diagnosis.`;
  }

  if (q.includes('scholarship') || q.includes('छात्रवृत्ति') || q.includes('student')) {
    if (isHindi) {
      return `नमस्ते! राष्ट्रीय छात्रवृत्ति पोर्टल (**NSP**) पर विभिन्न केंद्रीय और राज्य स्तरीय छात्रवृत्तियां उपलब्ध हैं:\n\n1. **पोस्ट-मैट्रिक छात्रवृत्ति:** 10वीं के बाद उच्च शिक्षा के लिए शिक्षण शुल्क और रखरखाव भत्ता।\n2. **राष्ट्रीय साधन-सह-योग्यता छात्रवृत्ति (NMMSS):** कक्षा 9 से 12 तक ₹12,000 वार्षिक।\n\n📌 **आवेदन कैसे करें:** https://scholarships.gov.in/ पर OTR (One Time Registration) द्वारा।\n⚠️ ध्यान रखें: छात्रवृत्ति केवल NPCI में आधार से मैप किए गए खाते में ही आती है।`;
    }
    return `Hello! The **National Scholarship Portal (NSP)** provides central and state scholarships for students:\n\n1. **Post-Matric Scholarships:** For Class 11, 12, ITI, Diploma, Graduation, and Post-Graduation.\n2. **National Means-cum-Merit Scholarship:** Rs 12,000/year for meritorious students from Class 9 to 12.\n\n📌 **Official Portal:** https://scholarships.gov.in/\n⚠️ Note: The student's bank account must have NPCI DBT mapping enabled.`;
  }

  if (q.includes('dbt') || q.includes('payment') || q.includes('पैसा') || q.includes('खाता')) {
    if (isHindi) {
      return `नमस्ते! सरकारी योजनाओं का पैसा (DBT) न मिलने के मुख्य 3 कारण होते हैं:\n\n1. **आधार-बैंक सीडिंग:** बैंक में साधारण KYC के अलावा NPCI मैपर में DBT सहमति फॉर्म जमा होना चाहिए।\n2. **खाते की सीमा:** जनधन या छोटे बचत खातों में ₹1 लाख की वार्षिक सीमा पार होने पर पैसा वापस लौट जाता है।\n3. **e-KYC या जीवन प्रमाण:** योजना अनुसार e-KYC या पेंशन प्रमाण पत्र की आवश्यकता होती है।\n\n🔍 **अपनी भुगतान स्थिति यहाँ देखें:** https://pfms.nic.in/\n🛠️ जनसेतु के **DBT Detective** सेक्शन से विस्तृत जांच करें।`;
    }
    return `Hello! If your DBT payment is delayed or failed, the most common reasons are:\n\n1. **Aadhaar-Bank Seeding:** Account must be actively mapped in NPCI mapper with DBT consent.\n2. **Credit Limit:** Small/PMJDY accounts reject credits once annual deposits exceed Rs 1,00,000.\n3. **Pending Verification:** e-KYC or Life Certificate (Jeevan Pramaan) may be required.\n\n🔍 **Track Payments at:** https://pfms.nic.in/\n🛠️ Please run a quick check using JanSetu's **DBT Detective**!`;
  }

  if (isHindi) {
    return `नमस्ते! मैं आपका **जनसेतु AI सहायक** हूँ। मैं सरकारी योजनाओं, पात्रता मानदंडों, आवश्यक दस्तावेजों और डीबीटी (DBT) भुगतान समस्याओं में आपकी सहायता कर सकता हूँ।\n\nआप मुझसे किसान सम्मान निधि, छात्रवृत्ति, आयुष्मान भारत, आवास योजना, मुद्रा ऋण या आधार सीडिंग के बारे में पूछ सकते हैं।\n\n🌐 **आधिकारिक संदर्भ पोर्टल:** https://www.myscheme.gov.in/`;
  }

  return `Hello! I am **JanSetu AI Sahayak**, your verified civic assistant. I can guide you through government welfare schemes, eligibility rules, document requirements, and DBT troubleshooting.\n\nYou can ask me about PM-KISAN, Scholarships, Ayushman Bharat, PMAY Housing, Mudra loans, or Aadhaar-bank seeding issues.\n\n🌐 **National Discovery Portal:** https://www.myscheme.gov.in/`;
}

// POST /api/ai/chat
router.post('/chat', async (req, res) => {
  const { message, language } = req.body;
  if (!message) return res.status(400).json({ error: 'Message cannot be empty' });

  const lang = language === 'hi' ? 'hi' : 'en';
  const groqKey = process.env.GROQ_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  // Grounding context
  const contextData = buildContextKnowledge(message);

  // 1. Try Groq (Llama 3.3 / 3.1)
  if (groqKey && !groqKey.includes('your_groq')) {
    try {
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'llama-3.1-70b-versatile',
          messages: [
            { role: 'system', content: `${SYSTEM_PROMPT}\n\nVERIFIED CONTEXT FROM DATABASE:\n${contextData}` },
            { role: 'user', content: `Language requested: ${lang === 'hi' ? 'Hindi (Devanagari)' : 'English'}\n\nCitizen Query: ${message}` }
          ],
          temperature: 0.3,
          max_tokens: 800
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${groqKey}`
          },
          timeout: 10000
        }
      );

      const reply = response.data?.choices?.[0]?.message?.content;
      if (reply) {
        return res.json({ reply, mode: 'groq-live', source: 'Verified Schemes RAG + Groq' });
      }
    } catch (err) {
      console.warn('Groq call failed, attempting fallback:', err.message);
    }
  }

  // 2. Try OpenAI
  if (openaiKey && !openaiKey.includes('your_openai')) {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: `${SYSTEM_PROMPT}\n\nVERIFIED CONTEXT FROM DATABASE:\n${contextData}` },
            { role: 'user', content: `Language: ${lang === 'hi' ? 'Hindi' : 'English'}\n\nCitizen Query: ${message}` }
          ],
          temperature: 0.3,
          max_tokens: 800
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openaiKey}`
          },
          timeout: 10000
        }
      );

      const reply = response.data?.choices?.[0]?.message?.content;
      if (reply) {
        return res.json({ reply, mode: 'openai-live', source: 'Verified Schemes RAG + OpenAI' });
      }
    } catch (err) {
      console.warn('OpenAI call failed, attempting fallback:', err.message);
    }
  }

  // 3. Fallback to Grounded Rule-Based AI Engine
  const reply = generateDemoResponse(message, lang);
  res.json({
    reply,
    mode: 'demo-knowledge-base',
    source: 'JanSetu Verified Knowledge Engine'
  });
});

module.exports = router;
