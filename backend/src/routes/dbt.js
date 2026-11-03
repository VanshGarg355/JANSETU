const express = require('express');
const router = express.Router();
const axios = require('axios');
const { supabase } = require('../supabaseClient');
const demoIssues = require('../data/demoDbtIssues.json');
const demoScenarios = require('../data/demoScenarios.json');
const PDFDocument = require('pdfkit');

// In-memory diagnostic sessions for PDF generation
const inMemoryHistory = {};

// Groq models in order of preference (llama-3.1-70b-versatile was decommissioned by Groq)
const GROQ_MODELS = [
  process.env.GROQ_MODEL,
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant'
].filter(Boolean);

// Clean and safely parse JSON from LLM content (handles markdown fences and conversational wrappers)
function cleanAndParseJson(raw) {
  if (!raw || typeof raw !== 'string') return null;
  let text = raw.trim();
  if (text.startsWith('```')) {
    text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  }
  try {
    return JSON.parse(text);
  } catch (e) {
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(text.slice(firstBrace, lastBrace + 1));
      } catch (e2) {
        return null;
      }
    }
    return null;
  }
}

// Normalize question & options for the UI
function normalizeDiagnosticOutput(parsed, language, citizenName, userTurns) {
  if (!parsed || typeof parsed !== 'object') return null;
  const isHi = language === 'hi';

  if (parsed.status === 'questioning') {
    let question = parsed.question;
    const defaultOptions = isHi
      ? [
          { label: 'हाँ (YES)', value: 'हाँ (YES)' },
          { label: 'नहीं (NO)', value: 'नहीं (NO)' },
          { label: 'पता नहीं (NOT SURE)', value: 'पता नहीं (NOT SURE)' }
        ]
      : [
          { label: 'Yes', value: 'Yes' },
          { label: 'No', value: 'No' },
          { label: 'Not Sure', value: 'Not Sure' }
        ];

    if (typeof question === 'string') {
      question = { text: question, options: defaultOptions };
    } else if (question && typeof question === 'object') {
      const qText = question.text || question.question || question.prompt || '';
      let opts = defaultOptions;
      if (Array.isArray(question.options) && question.options.length > 0) {
        opts = question.options.map(opt => {
          if (typeof opt === 'string') return { label: opt, value: opt };
          return {
            label: opt.label || opt.text || opt.value || 'Option',
            value: opt.value || opt.label || opt.text || 'Option'
          };
        });
      }
      question = { text: qText, options: opts };
    }

    if (!question || !question.text) return null;

    return {
      status: 'questioning',
      reply: parsed.reply || (isHi ? 'कृपया इस प्रश्न का उत्तर दें:' : 'Please clarify this point:'),
      question,
      detected_scheme: parsed.detected_scheme || 'General DBT',
      diagnostic_progress: parsed.diagnostic_progress || { questions_asked: userTurns, known_facts: [] }
    };
  }

  if (parsed.status === 'completed' && parsed.diagnosis) {
    const diag = parsed.diagnosis;
    const historyId = diag.history_id || ('DBT-AI-' + Date.now().toString(36).toUpperCase());
    let causes = Array.isArray(diag.possible_causes) ? diag.possible_causes : [];
    if (causes.length === 0 && (diag.cause || diag.issue_title)) {
      causes = [
        {
          id: 'cause-1',
          title: diag.issue_title || diag.cause,
          explanation: diag.why_it_happened || diag.cause,
          likelihood: 'High',
          evidence: isHi ? 'नागरिक द्वारा दी गई जानकारी' : 'Beneficiary reported situation',
          verification_steps: [isHi ? 'आधिकारिक पोर्टल पर स्टेटस जांचें।' : 'Verify status on official portal.'],
          resolution_steps: diag.action_steps || [],
          official_portals: diag.official_portals || []
        }
      ];
    }

    return {
      status: 'completed',
      reply: parsed.reply || (isHi ? 'आपकी स्थिति का बहु-कारणीय विश्लेषण पूर्ण हो गया है।' : 'Your multi-cause diagnostic assessment is complete.'),
      diagnosis: {
        history_id: historyId,
        citizen_name: citizenName,
        diagnosed_at: diag.diagnosed_at || new Date().toISOString(),
        case_title: diag.case_title || diag.issue_title || 'DBT Payment Disbursal Assessment',
        category: diag.category || 'Direct Benefit Transfer',
        detected_scheme: diag.detected_scheme || 'General DBT',
        severity: diag.severity || 'High',
        resolution_sla: diag.resolution_sla || '48-72 Hours',
        affected_systems: diag.affected_systems || 'PFMS / NPCI APBS',
        summary: diag.summary || (isHi ? 'नागरिक द्वारा दी गई जानकारी के आधार पर संभावित कारणों की प्राथमिकता सूची:' : 'Suspected causes ranked by likelihood based on citizen testimony:'),
        possible_causes: causes,
        required_documents: diag.required_documents || ['Aadhaar Card', 'Bank Passbook'],
        application_letter: diag.application_letter || '',
        escalation_authority: diag.escalation_authority || 'Bank Branch Manager / PFMS Helpdesk',
        escalation_url: diag.escalation_url || 'https://pfms.nic.in/',
        issue_title: diag.issue_title || causes[0]?.title || 'DBT Disbursal Issue',
        cause: diag.cause || causes[0]?.explanation || '',
        why_it_happened: diag.why_it_happened || causes[0]?.explanation || '',
        action_steps: diag.action_steps || causes[0]?.resolution_steps || [],
        official_portals: diag.official_portals || causes[0]?.official_portals || []
      }
    };
  }

  return null;
}

// Grounded DBT Diagnostic System Prompt
const DBT_SYSTEM_PROMPT = `You are "JanSetu AI DBT Diagnostic Assistant" (जनसेतु डीबीटी विफलता जासूस), an intelligent civic diagnostic companion for Indian citizens.
Your job is to diagnose Direct Benefit Transfer (DBT) payment failures (e.g. PM-KISAN, Scholarships, Pensions, PMAY Housing, PM SVANidhi, Mudra, and NPCI Aadhaar-Bank mapping) through an adaptive, multi-turn diagnostic interview.

WORKFLOW & MANDATORY REQUIREMENTS:
1. NEVER GIVE A FINAL DIAGNOSIS ON TURN 1 (IMMEDIATELY AFTER THE FIRST USER MESSAGE):
   - Even if the citizen provides a detailed problem description on turn 1, ALWAYS acknowledge their situation and ask ONE relevant follow-up question to probe verification status, portal error messages, or bank type.
   - Diagnosis requires at least 1 or 2 follow-up exchanges to build genuine evidence.

2. ADAPTIVE QUESTIONING (ONE AT A TIME):
   - Ask ONLY ONE focused question at a time.
   - Questions must dynamically depend on previous answers.
   - Remember previous responses and NEVER repeat questions or ask for facts already established.
   - Provide 2 to 4 quick button options with every question so citizens can respond with 1 tap.

3. MULTI-CAUSE PROBABILISTIC DIAGNOSIS (NEVER FORCE A SINGLE ROOT CAUSE):
   - In government DBT, payment failures frequently have multiple contributing or suspected reasons.
   - Identify ALL relevant possible causes (typically 2 or 3 ranked causes).
   - NEVER present suspected causes as confirmed facts. Use objective diagnostic language.
   - For EACH possible cause, provide:
     a) title: Short concise title
     b) explanation: Clear explanation in simple language
     c) likelihood: Exactly one of "High", "Medium", or "Low"
     d) evidence: Concrete evidence directly drawn from the citizen's own answers
     e) verification_steps: Array of concrete instructions on how to verify whether this is the actual cause
     f) resolution_steps: Step-by-step instructions explaining what to check, where to check, and how to resolve it
     g) official_portals: Array of objects { name, url, desc } with 100% verified *.gov.in or *.nic.in URLs.

4. SAFETY & INTEGRITY:
   - NEVER ask for passwords, OTPs, ATM PINs, or 12-digit Aadhaar / full bank account numbers.
   - NEVER invent government circulars, schemes, or fake URLs.
   - Respond in the citizen's preferred language (Hindi in clean Devanagari script, or English).

OUTPUT FORMAT:
Respond with ONLY valid, raw JSON (no markdown fences, no text outside JSON).

When more information is needed (status: "questioning"):
{
  "status": "questioning",
  "reply": "Empathetic conversational response in Hindi/English explaining what you understood, and introducing the next single question.",
  "question": {
    "text": "The single targeted question to ask",
    "options": [
      { "label": "Short label (e.g. हाँ / YES)", "value": "User response text" },
      { "label": "Short label (e.g. नहीं / NO)", "value": "User response text" },
      { "label": "Short label (e.g. पता नहीं / NOT SURE)", "value": "User response text" }
    ]
  },
  "detected_scheme": "PM-KISAN | Scholarship | Pension | Housing | General DBT",
  "diagnostic_progress": {
    "questions_asked": 1,
    "known_facts": ["Symptom 1", "Fact 2"]
  }
}

When ready to deliver the multi-cause diagnosis (status: "completed", after at least 1-3 questions):
{
  "status": "completed",
  "reply": "Conversational closing summary analyzing the full conversation and presenting the prioritized possible causes below.",
  "diagnosis": {
    "case_title": "Clear concise case title in Hindi/English",
    "category": "Agriculture | Education | Pension | Housing | Banking & Identity",
    "detected_scheme": "PM-KISAN | Scholarship | Pension | Housing | General DBT",
    "severity": "Critical | High | Medium",
    "resolution_sla": "e.g. 48 Hours to 15 Days",
    "affected_systems": "e.g. State Bhulekh, PM-KISAN, NPCI APBS",
    "summary": "Brief 2-line diagnostic summary explaining that these are suspected causes ranked by likelihood based on citizen testimony.",
    "possible_causes": [
      {
        "id": "cause-1",
        "title": "Cause 1 Title",
        "explanation": "Clear explanation of how and why this happens under treasury/government rules",
        "likelihood": "High",
        "evidence": "Exact evidence from what the citizen said",
        "verification_steps": [
          "Step to verify on portal",
          "What exact error code or text to look for"
        ],
        "resolution_steps": [
          "Action 1",
          "Action 2",
          "Action 3"
        ],
        "official_portals": [
          { "name": "Official Portal Name", "url": "https://...", "desc": "Brief portal description" }
        ]
      },
      {
        "id": "cause-2",
        "title": "Cause 2 Title",
        "explanation": "Secondary possible reason",
        "likelihood": "Medium",
        "evidence": "Evidence or potential gap from citizen testimony",
        "verification_steps": [
          "How to verify on bank/portal"
        ],
        "resolution_steps": [
          "Action step"
        ],
        "official_portals": [
          { "name": "Portal Name", "url": "https://...", "desc": "Portal description" }
        ]
      }
    ],
    "required_documents": [
      "Document 1",
      "Document 2",
      "Document 3"
    ],
    "application_letter": "Complete, formal pre-filled application letter in Hindi/English with formal salutation, subject, body, placeholders, and enclosures.",
    "escalation_authority": "Designated grievance officer / department",
    "escalation_url": "Official portal URL for complaint or escalation"
  }
}`;

// Local Grounded Multi-Cause Adaptive Diagnostic Engine
function adaptiveDbtDiagnosticEngineLocal(messages, language = 'en', citizenName = 'Citizen Beneficiary') {
  const isHi = language === 'hi';
  const userMessages = (messages || []).filter(m => m.role === 'user');
  const userTurns = userMessages.length;
  const assistantTurns = (messages || []).filter(m => m.role === 'assistant').length;

  const allUserText = userMessages.map(m => m.content).join(' ').toLowerCase();

  // Contextual signals from last turn
  const lastUserMsg = (userMessages[userMessages.length - 1]?.content || '').toLowerCase();
  const lastAssistantQ = (messages.filter(m => m.role === 'assistant').pop()?.question?.text || '').toLowerCase();
  const isAffirmative = /हाँ|yes|done|complete|पूर्ण|सत्यापित|हो गया|सक्रिय|active/.test(lastUserMsg);
  const isNegative = /नहीं|no|lambi|pending|लंबित|अधूरा|पेंडिंग|inactive|निष्क्रिय/.test(lastUserMsg);

  // Domain flags
  const isKisan = /kisan|farmer|kheti|fasal|crop|2000|kist|installment|land|zameen|bhoomi|patwari|khatauni|pmkisan|किसान|खेती|फसल|किस्त|खतौनी|भूमि/.test(allUserText);
  const isStudent = /scholarship|student|school|college|fee|fees|nsp|marksheet|matric|chhatravritti|छात्र|छात्रा|छात्रवृत्ति|स्कॉलरशिप|कॉलेज|फीस/.test(allUserText);
  const isPension = /pension|elderly|senior|bujurg|vriddha|widow|vidhwa|jeevan|pramaan|life certificate|पेंशन|बुजुर्ग|वृद्धावस्था|विधवा|जीवन प्रमाण/.test(allUserText);
  const isHousing = /awas|pmay|housing|makan|ghar|chhat|pucca|kutcha|geotag|आवास|मकान|घर|छत/.test(allUserText);

  // Sub-symptom signals from citizen (evaluated per message to prevent cross-sentence regex false positives)
  let mentionsEkycNo = false;
  let mentionsEkycYes = false;
  let mentionsLandNo = false;
  let mentionsLandYes = false;
  let mentionsLimitYes = false;
  let mentionsLimitNo = false;
  let mentionsCollegeYes = false;
  let mentionsCollegeNo = false;
  let mentionsLifeCertNo = false;
  let mentionsLifeCertYes = false;
  let mentionsMergerYes = false;
  let mentionsMergerNo = false;
  let mentionsNpciYes = false;
  let mentionsNpciNo = false;

  userMessages.forEach(msg => {
    const text = (msg.content || '').toLowerCase();
    if (/e-?kyc[^.,\n]{0,25}(yes|done|complete|ho gaya|pura|पूर्ण|हाँ|हो चुकी|सत्यापित)|(yes|done|complete|पूर्ण|हाँ)[^.,\n]{0,25}e-?kyc|ई-?केवाईसी[^.,\n]{0,25}(पूर्ण|हाँ|हो चुकी)/i.test(text)) {
      mentionsEkycYes = true;
    }
    if (/e-?kyc[^.,\n]{0,25}(no|lambi|pend|nhi|nahi|अधूरा|लंबित|नहीं)|(no|lambi|pend|nhi|nahi|नहीं)[^.,\n]{0,25}e-?kyc|ई-?केवाईसी[^.,\n]{0,25}(लंबित|नहीं)/i.test(text)) {
      mentionsEkycNo = true;
    }
    if (/land[^.,\n]{0,25}(yes|done|complete|हाँ|पूर्ण)|(yes|done|हाँ|पूर्ण)[^.,\n]{0,25}land|भू-?अंकन[^.,\n]{0,25}(yes|हाँ|पूर्ण)/i.test(text)) {
      mentionsLandYes = true;
    }
    if (/land[^.,\n]{0,25}(no|nahi|nhi|lambi|पेंडिंग|नहीं)|(no|nahi|nhi|लंबित|नहीं)[^.,\n]{0,25}land|bhoomi.*no|भू-?अंकन[^.,\n]{0,25}(no|नहीं)|भूलेख.*नहीं/i.test(text)) {
      mentionsLandNo = true;
    }
    if (/limit|jandhan|100000|1 lakh|small account|क्रेडिट सीमा|जनधन|zero balance/i.test(text)) {
      mentionsLimitYes = true;
    }
    if (/regular|normal|सामान्य|लिमिट नहीं|सेविंग्स/i.test(text)) {
      mentionsLimitNo = true;
    }
    if (/verified by institute|verified by college|कॉलेज से सत्यापित|ino verified/i.test(text)) {
      mentionsCollegeYes = true;
    }
    if (/pending at institute|pending at college|कॉलेज स्तर पर पेंडिंग/i.test(text)) {
      mentionsCollegeNo = true;
    }
    if (/jeevan.*(no|nahi|expired|lambi|नहीं|लंबित)|life cert.*(no|expired)|प्रमाण पत्र.*नहीं/i.test(text)) {
      mentionsLifeCertNo = true;
    }
    if (/jeevan.*(yes|done|जमा|हाँ)|life cert.*(yes|done)|प्रमाण पत्र.*(हाँ|जमा)|dlc/i.test(text)) {
      mentionsLifeCertYes = true;
    }
    if (/merge|विलय|ifsc बदला|ifsc changed/i.test(text)) {
      mentionsMergerYes = true;
    }
    if (/no merge|विलय नहीं|same bank|वही खाता/i.test(text)) {
      mentionsMergerNo = true;
    }
    if (/npci.*(yes|active|seeded|सक्रिय|हाँ)|(yes|active|सक्रिय).*npci|aadhaar.*seeded/i.test(text)) {
      mentionsNpciYes = true;
    }
    if (/npci.*(no|inactive|not seeded|निष्क्रिय|नहीं)|(no|inactive|नहीं).*npci/i.test(text)) {
      mentionsNpciNo = true;
    }
  });

  // If last question was about a specific checkpoint, check user's direct affirmative or negative answer
  if (/kyc/i.test(lastAssistantQ)) {
    if (isAffirmative) { mentionsEkycYes = true; mentionsEkycNo = false; }
    if (isNegative) { mentionsEkycNo = true; mentionsEkycYes = false; }
  }
  if (/land|भू-?अंकन/i.test(lastAssistantQ)) {
    if (isAffirmative) { mentionsLandYes = true; mentionsLandNo = false; }
    if (isNegative) { mentionsLandNo = true; mentionsLandYes = false; }
  }
  if (/जनधन|limit|ceiling/i.test(lastAssistantQ)) {
    if (isAffirmative) mentionsLimitYes = true;
    if (isNegative) mentionsLimitNo = true;
  }
  if (/institute|college|ino/i.test(lastAssistantQ)) {
    if (isAffirmative) { mentionsCollegeYes = true; mentionsCollegeNo = false; }
    if (isNegative) { mentionsCollegeNo = true; mentionsCollegeYes = false; }
  }
  if (/jeevan|life certificate|प्रमाण पत्र/i.test(lastAssistantQ)) {
    if (isAffirmative) { mentionsLifeCertYes = true; mentionsLifeCertNo = false; }
    if (isNegative) { mentionsLifeCertNo = true; mentionsLifeCertYes = false; }
  }
  if (/विलय|merge|ifsc/i.test(lastAssistantQ)) {
    if (isAffirmative) { mentionsMergerYes = true; mentionsMergerNo = false; }
    if (isNegative) { mentionsMergerNo = true; mentionsMergerYes = false; }
  }
  if (/npci/i.test(lastAssistantQ)) {
    if (isAffirmative) { mentionsNpciYes = true; mentionsNpciNo = false; }
    if (isNegative) { mentionsNpciNo = true; mentionsNpciYes = false; }
  }

  // RULE 1: NEVER GIVE A FINAL DIAGNOSIS IMMEDIATELY ON TURN 1!
  // Always ask an adaptive probing question first.

  // 1. PM-KISAN FLOW
  if (isKisan) {
    const ekycAnswered = mentionsEkycYes || mentionsEkycNo;
    const landAnswered = mentionsLandYes || mentionsLandNo;

    if (!ekycAnswered) {
      return {
        status: 'questioning',
        reply: isHi
          ? 'नमस्ते। आपकी पीएम-किसान किस्त रुकने की स्थिति दर्ज कर ली गई है। सरकारी नियमों के अनुसार किस्त रुकने के 2-3 संभावित कारण होते हैं। सटीक विश्लेषण हेतु कृपया पहला प्रश्न स्पष्ट करें:'
          : 'Hello. Your PM-KISAN installment issue has been recorded. Government treasury rules identify multiple potential bottlenecks. To isolate the exact causes, please clarify this first question:',
        question: {
          text: isHi
            ? 'क्या आपने pmkisan.gov.in पर "Know Your Status" में देखा कि आपका आधार e-KYC "YES" है या लंबित (NO/Pending) प्रदर्शित हो रहा है?'
            : 'Have you verified on pmkisan.gov.in under "Know Your Status" whether your Aadhaar e-KYC displays "YES" or pending ("NO")?',
          options: [
            { label: isHi ? 'हाँ, e-KYC "YES" है' : 'Yes, e-KYC is YES', value: isHi ? 'हाँ, मेरा e-KYC पोर्टल पर YES है' : 'Yes, my e-KYC is marked YES on portal' },
            { label: isHi ? 'नहीं, e-KYC लंबित/NO है' : 'No, e-KYC is NO / Pending', value: isHi ? 'नहीं, मेरा e-KYC अभी लंबित या NO दिख रहा है' : 'No, my e-KYC is incomplete or pending' },
            { label: isHi ? 'जांच नहीं की / पता नहीं' : 'Not sure / Need check', value: isHi ? 'मुझे पता नहीं है, मैंने अभी जांच नहीं की' : 'I am not sure, have not checked yet' }
          ]
        },
        detected_scheme: 'PM-KISAN',
        diagnostic_progress: { questions_asked: 1, known_facts: ['PM-KISAN installment delayed'] }
      };
    }

    if (!landAnswered) {
      return {
        status: 'questioning',
        reply: isHi
          ? 'धन्यवाद। e-KYC की स्थिति दर्ज कर ली गई है। दूसरा सबसे महत्वपूर्ण बिंदु राज्य राजस्व विभाग (भूलेख) का रिकॉर्ड सत्यापन है:'
          : 'Thank you. e-KYC status recorded. The second critical prerequisite is state revenue land record linkage:',
        question: {
          text: isHi
            ? 'क्या आपके पीएम-किसान स्टेटस में "Land Seeding (भू-अभिलेख अंकन)" YES आ रहा है या NO?'
            : 'In your PM-KISAN beneficiary status, does "Land Seeding" display "YES" or "NO"?',
          options: [
            { label: isHi ? 'हाँ, Land Seeding "YES" है' : 'Yes, Land Seeding is YES', value: isHi ? 'हाँ, Land Seeding YES प्रदर्शित हो रहा है' : 'Yes, Land Seeding is marked YES' },
            { label: isHi ? 'नहीं, Land Seeding "NO" है' : 'No, Land Seeding is NO', value: isHi ? 'नहीं, मेरे स्टेटस में Land Seeding NO लिखा आ रहा है' : 'No, Land Seeding shows NO in my status' },
            { label: isHi ? 'पता नहीं / समझ नहीं आया' : 'Not sure / Need guidance', value: isHi ? 'मुझे भू-अंकन स्थिति की जानकारी नहीं है' : 'I am not sure about Land Seeding status' }
          ]
        },
        detected_scheme: 'PM-KISAN',
        diagnostic_progress: { questions_asked: 2, known_facts: ['e-KYC verified', 'PM-KISAN delay'] }
      };
    }

    if (userTurns === 1) {
      return {
        status: 'questioning',
        reply: isHi
          ? 'धन्यवाद। e-KYC एवं भूलेख की जानकारी दर्ज हो चुकी है। अंतिम सत्यापन बिंदु बैंक खाते में NPCI आधार सीडिंग है:'
          : 'Thank you. e-KYC and land records noted. Final checkpoint is bank NPCI Aadhaar seeding mandate:',
        question: {
          text: isHi
            ? 'क्या आपका बैंक खाता NPCI DBT मैपर से आधार सीडेड सक्रिय है?'
            : 'Is your bank account actively seeded in the NPCI Aadhaar Payment Bridge for DBT credits?',
          options: [
            { label: isHi ? 'हाँ, बैंक में NPCI सक्रिय है' : 'Yes, NPCI is active', value: isHi ? 'हाँ, मेरा बैंक खाता NPCI में सक्रिय है' : 'Yes, my bank account is active in NPCI' },
            { label: isHi ? 'नहीं, केवल आधार लिंक है' : 'No, only KYC linked', value: isHi ? 'नहीं, केवल आधार लिंक है डीबीटी सक्रिय नहीं' : 'No, only basic KYC done' },
            { label: isHi ? 'पता नहीं / जांच नहीं की' : 'Not sure', value: isHi ? 'मुझे NPCI स्थिति की जानकारी नहीं है' : 'Not sure about NPCI status' }
          ]
        },
        detected_scheme: 'PM-KISAN',
        diagnostic_progress: { questions_asked: 2, known_facts: ['e-KYC and Land records analyzed'] }
      };
    }

    // Complete PM-KISAN Multi-Cause Diagnosis
    return buildMultiCauseDiagnosis('pm_kisan', isHi, citizenName, allUserText, { mentionsEkycNo, mentionsEkycYes, mentionsLandNo, mentionsLandYes, mentionsNpciNo, mentionsNpciYes });
  }

  // 2. SCHOLARSHIP FLOW
  if (isStudent) {
    const limitAnswered = mentionsLimitYes || mentionsLimitNo;
    const collegeAnswered = mentionsCollegeYes || mentionsCollegeNo;

    if (!limitAnswered) {
      return {
        status: 'questioning',
        reply: isHi
          ? 'नमस्ते। छात्रवृत्ति भुगतान रुकने का एक मुख्य कारण बैंक खाते की जमा सीमा (Credit Ceiling) और दूसरा संस्थान सत्यापन होता है। कृपया यह बताएं:'
          : 'Hello. In scholarship disbursements via PFMS, bank account credit limits and institute nodal approvals are the most frequent causes. Please clarify:',
        question: {
          text: isHi
            ? 'क्या आपका छात्रवृत्ति वाला बैंक खाता जनधन / बेसिक बचत खाता (PMJDY) है जिसकी ₹1,00,000 की वार्षिक जमा सीमा पार हो गई हो?'
            : 'Is your scholarship linked to a Jan Dhan / Basic Savings Bank Account (PMJDY) that might have exceeded its Rs 1 Lakh annual credit limit?',
          options: [
            { label: isHi ? 'हाँ, जनधन / जीरो बैलेंस खाता है' : 'Yes, Jan Dhan Account', value: isHi ? 'हाँ, मेरा बैंक खाता जनधन/जीरो बैलेंस खाता है' : 'Yes, it is a PMJDY Jan Dhan account' },
            { label: isHi ? 'नहीं, सामान्य बचत खाता है' : 'No, Regular Savings Account', value: isHi ? 'नहीं, मेरा खाता सामान्य रेगुलर सेविंग्स बैंक खाता है' : 'No, it is a regular savings account' },
            { label: isHi ? 'पता नहीं / खाता प्रकार याद नहीं' : 'Not sure of account type', value: isHi ? 'मुझे खाते के प्रकार के बारे में पक्की जानकारी नहीं है' : 'I am not sure about the exact account category' }
          ]
        },
        detected_scheme: 'Scholarship (NSP)',
        diagnostic_progress: { questions_asked: 1, known_facts: ['Scholarship payment delayed'] }
      };
    }

    if (!collegeAnswered) {
      return {
        status: 'questioning',
        reply: isHi
          ? 'धन्यवाद। खाते की जानकारी दर्ज हो गई है। दूसरा महत्वपूर्ण बिंदु संस्थान नोडल अधिकारी (INO) द्वारा सत्यापन है:'
          : 'Thank you. Account details recorded. The next critical checkpoint is verification by the Institute Nodal Officer (INO):',
        question: {
          text: isHi
            ? 'क्या NSP या राज्य छात्रवृत्ति पोर्टल पर आपका आवेदन "Verified by Institute Nodal Officer" दिख रहा है या कॉलेज स्तर पर पेंडिंग है?'
            : 'On the scholarship portal, does your application status show "Verified by Institute" or pending at college level?',
          options: [
            { label: isHi ? 'हाँ, कॉलेज से सत्यापित है' : 'Yes, verified by college', value: isHi ? 'हाँ, कॉलेज ने सत्यापन पूरा कर दिया है' : 'Yes, verified by institute' },
            { label: isHi ? 'नहीं, कॉलेज स्तर पर पेंडिंग है' : 'Pending at Institute level', value: isHi ? 'नहीं, पोर्टल पर कॉलेज सत्यापन लंबित दिख रहा है' : 'Pending at institute nodal officer level' },
            { label: isHi ? 'जांच नहीं की / पता नहीं' : 'Not sure / Need check', value: isHi ? 'मैंने अभी पोर्टल पर लॉगिन कर सत्यापन नहीं देखा' : 'Have not checked institute verification status yet' }
          ]
        },
        detected_scheme: 'Scholarship (NSP)',
        diagnostic_progress: { questions_asked: 2, known_facts: ['Account type known', 'Scholarship delay'] }
      };
    }

    if (userTurns === 1) {
      return {
        status: 'questioning',
        reply: isHi
          ? 'धन्यवाद। खाता और कॉलेज सत्यापन दर्ज कर लिया गया है। अंतिम प्रश्न:'
          : 'Thank you. Account and college status recorded. Final question:',
        question: {
          text: isHi
            ? 'क्या PFMS पोर्टल पर स्टेटस "Payment Failed / Rejected" आ रहा है या "Under Processing"?'
            : 'On the PFMS portal, does your status say "Payment Failed / Rejected" or "Under Processing"?',
          options: [
            { label: isHi ? 'Payment Failed / Rejected' : 'Payment Failed / Rejected', value: isHi ? 'Payment Failed प्रदर्शित हो रहा है' : 'Payment Failed is displayed' },
            { label: isHi ? 'Under Processing' : 'Under Processing', value: isHi ? 'Under Processing आ रहा है' : 'Under Processing is displayed' }
          ]
        },
        detected_scheme: 'Scholarship (NSP)',
        diagnostic_progress: { questions_asked: 2, known_facts: ['Scholarship facts recorded'] }
      };
    }

    return buildMultiCauseDiagnosis('scholarship', isHi, citizenName, allUserText, { mentionsLimitYes, mentionsLimitNo, mentionsCollegeYes, mentionsCollegeNo });
  }

  // 3. PENSION FLOW
  if (isPension) {
    const lifeCertAnswered = mentionsLifeCertYes || mentionsLifeCertNo;
    const mergerAnswered = mentionsMergerYes || mentionsMergerNo;

    if (!lifeCertAnswered) {
      return {
        status: 'questioning',
        reply: isHi
          ? 'सादर प्रणाम। वरिष्ठ नागरिक, वृद्धावस्था या विधवा पेंशन रुकने के 2 मुख्य कारण होते हैं—जीवन प्रमाण पत्र या बैंक विलय के बाद IFSC कोड का अमान्य होना। कृपया बताएं:'
          : 'Greetings. The suspension of social security pensions typically stems from Digital Life Certificate expiration or bank merger IFSC changes. Please clarify:',
        question: {
          text: isHi
            ? 'क्या आपने पिछले वर्ष नवंबर या हाल ही में अपना "डिजिटल जीवन प्रमाण पत्र (Jeevan Pramaan)" बायोमेट्रिक या चेहरे के प्रमाणीकरण से जमा कराया है?'
            : 'Have you submitted your annual Digital Life Certificate (Jeevan Pramaan) via biometric or facial authentication recently?',
          options: [
            { label: isHi ? 'हाँ, जीवन प्रमाण पत्र जमा कराया था' : 'Yes, DLC submitted', value: isHi ? 'हाँ, मैंने जीवन प्रमाण पत्र जमा कराया था' : 'Yes, I submitted my life certificate' },
            { label: isHi ? 'नहीं, अभी तक जमा नहीं कराया' : 'No, not submitted yet', value: isHi ? 'नहीं, मैंने अभी तक जीवन प्रमाण पत्र जमा नहीं कराया है' : 'No, I have not submitted life certificate yet' },
            { label: isHi ? 'याद नहीं / पता नहीं' : 'Don\'t remember / Not sure', value: isHi ? 'मुझे ठीक से याद नहीं है' : 'I am not sure if it was submitted' }
          ]
        },
        detected_scheme: 'Social Security Pension',
        diagnostic_progress: { questions_asked: 1, known_facts: ['Pension payment stopped'] }
      };
    }

    if (!mergerAnswered) {
      return {
        status: 'questioning',
        reply: isHi
          ? 'धन्यवाद। जीवन प्रमाण पत्र की जानकारी दर्ज कर ली गई है। दूसरा कारण बैंक विलय हो सकता है:'
          : 'Thank you. Life certificate status recorded. Another frequent reason is banking structural changes:',
        question: {
          text: isHi
            ? 'क्या आपका बैंक खाता किसी अन्य बैंक में विलय (Merge) हुआ है (जैसे PNB, Canara, BoB आदि) और नया IFSC समाज कल्याण विभाग में दर्ज नहीं हुआ?'
            : 'Did your bank merge into another bank (e.g. PNB, Canara Bank, BoB) with changed IFSC code not updated in the social welfare records?',
          options: [
            { label: isHi ? 'हाँ, बैंक विलय हुआ था' : 'Yes, bank was merged', value: isHi ? 'हाँ, बैंक का विलय हुआ था और IFSC बदला था' : 'Yes, bank merged and IFSC changed' },
            { label: isHi ? 'नहीं, वही पुराना बैंक खाता है' : 'No, same bank account', value: isHi ? 'नहीं, बैंक विलय नहीं हुआ, खाता वही है' : 'No, same branch and IFSC' },
            { label: isHi ? 'पता नहीं है' : 'Not sure', value: isHi ? 'मुझे बैंक विलय की जानकारी नहीं है' : 'Not sure about bank merger' }
          ]
        },
        detected_scheme: 'Social Security Pension',
        diagnostic_progress: { questions_asked: 2, known_facts: ['DLC status known', 'Pension delay'] }
      };
    }

    if (userTurns === 1) {
      return {
        status: 'questioning',
        reply: isHi
          ? 'धन्यवाद। जीवन प्रमाण व विलय स्थिति दर्ज है। अंतिम प्रश्न:'
          : 'Thank you. Life cert and merger facts noted. Final checkpoint:',
        question: {
          text: isHi
            ? 'क्या आपके पास अपनी पेंशन पासबुक और PPO (पेंशन पेमेंट ऑर्डर) नंबर उपलब्ध है?'
            : 'Do you have your Pension Passbook and PPO number handy?',
          options: [
            { label: isHi ? 'हाँ, उपलब्ध है' : 'Yes, available', value: isHi ? 'हाँ, मेरे पास PPO और पासबुक है' : 'Yes, PPO and passbook available' },
            { label: isHi ? 'नहीं / खोजना पड़ेगा' : 'No / Need to find', value: isHi ? 'नहीं, मुझे PPO खोजना पड़ेगा' : 'No, need to find PPO' }
          ]
        },
        detected_scheme: 'Social Security Pension',
        diagnostic_progress: { questions_asked: 2, known_facts: ['Pension facts verified'] }
      };
    }

    return buildMultiCauseDiagnosis('pension', isHi, citizenName, allUserText, { mentionsLifeCertNo, mentionsLifeCertYes, mentionsMergerYes, mentionsMergerNo });
  }

  // 4. GENERAL / HOUSING / OTHER DBT FLOW
  const npciAnswered = mentionsNpciYes || mentionsNpciNo;
  if (!npciAnswered) {
    return {
      status: 'questioning',
      reply: isHi
        ? 'नमस्ते। सरकारी प्रत्यक्ष लाभ अंतरण (DBT) भुगतान रुकने का 80% कारण बैंक खाते में "NPCI DBT Mandate" सक्रिय न होना होता है। कृपया यह बताएं:'
        : 'Hello. Over 80% of government DBT disbursement delays stem from inactive NPCI DBT Mandates. Please clarify:',
      question: {
        text: isHi
          ? 'क्या आपका बैंक खाता एनपीसीआई (NPCI) आधार पेमेंट ब्रिज से "DBT Mandate" के साथ सक्रिय है? (ध्यान दें: केवल आधार लिंक होना और DBT मैंडेट होना अलग प्रक्रियाएं हैं।)'
          : 'Is your bank account actively seeded in the NPCI Aadhaar Payment Bridge with a DBT Credit Mandate? (Note: KYC linking is different from NPCI DBT Credit Seeding).',
        options: [
          { label: isHi ? 'हाँ, NPCI सीडिंग सक्रिय है' : 'Yes, NPCI seeded', value: isHi ? 'हाँ, बैंक कहता है NPCI सीडिंग सक्रिय है' : 'Yes, bank confirmed NPCI DBT seeding is active' },
          { label: isHi ? 'नहीं, केवल आधार लिंक है' : 'No, only KYC linked', value: isHi ? 'नहीं, केवल आधार कार्ड लिंक कराया था, डीबीटी मैंडेट का पता नहीं' : 'Only normal Aadhaar linking was done, not sure of DBT mandate' },
          { label: isHi ? 'पता नहीं / जांच नहीं की' : 'Not sure / Need guidance', value: isHi ? 'मुझे एनपीसीआई सीडिंग की स्थिति नहीं पता' : 'I am not sure of NPCI status' }
        ]
      },
      detected_scheme: 'General DBT',
      diagnostic_progress: { questions_asked: 1, known_facts: ['DBT payment failure reported'] }
    };
  }

  if (userTurns === 1) {
    return {
      status: 'questioning',
      reply: isHi
        ? 'धन्यवाद। NPCI सीडिंग की स्थिति दर्ज कर ली गई है। दूसरा महत्वपूर्ण प्रश्न खाता स्थिति का है:'
        : 'Thank you. NPCI status recorded. The second critical check is account dormancy status:',
      question: {
        text: isHi
          ? 'क्या आपने पिछले 6 महीनों से इस बैंक खाते में कोई नकद जमा, निकासी या ऑनलाइन लेन-देन किया है?'
          : 'Have you conducted any transaction in this bank account in the past 6 months?',
        options: [
          { label: isHi ? 'हाँ, हाल ही में लेन-देन हुआ है' : 'Yes, active transactions', value: isHi ? 'हाँ, खाता सक्रिय है और हाल ही में लेन-देन हुआ है' : 'Yes, account has recent transactions' },
          { label: isHi ? 'नहीं, काफी समय से लेन-देन नहीं हुआ' : 'No, long time inactive', value: isHi ? 'नहीं, लंबे समय से कोई लेन-देन नहीं हुआ' : 'No, no transactions for long time' }
        ]
      },
      detected_scheme: 'General DBT',
      diagnostic_progress: { questions_asked: 2, known_facts: ['NPCI mandate analyzed'] }
    };
  }

  return buildMultiCauseDiagnosis('general', isHi, citizenName, allUserText, { mentionsNpciYes, mentionsNpciNo });
}

// Helper: Compile Multi-Cause Grounded Diagnosis Object
function buildMultiCauseDiagnosis(schemeKey, isHi, citizenName, allUserText, flags) {
  const historyId = 'DBT-AI-' + Date.now().toString(36).toUpperCase();
  let diag = null;

  if (schemeKey === 'pm_kisan') {
    const isLandHigh = flags.mentionsLandNo || (!flags.mentionsEkycNo && !flags.mentionsLandYes);
    const isEkycHigh = flags.mentionsEkycNo;

    diag = {
      case_title: isHi ? 'पीएम-किसान सम्मान निधि: किस्त विफलता का बहु-कारणीय एआई निदान' : 'PM-KISAN Installment Disbursal Multi-Cause Diagnostic Assessment',
      category: isHi ? 'कृषि (Agriculture)' : 'Agriculture',
      detected_scheme: 'PM-KISAN',
      severity: isLandHigh || isEkycHigh ? 'Critical' : 'High',
      resolution_sla: '48 Hours to 15 Working Days',
      affected_systems: 'State Bhulekh ROR, PM-KISAN National Portal, NPCI APBS',
      summary: isHi
        ? 'नागरिक द्वारा दी गई जानकारी के आधार पर, यह पुष्टि नहीं बल्कि 3 संभावित कारण हैं जिनकी संभावना स्तर (Likelihood) के अनुसार जांच की जानी चाहिए:'
        : 'Based on the citizen\'s testimony, the failure is analyzed across multiple suspected causes ranked by likelihood, with verification instructions for each:',
      possible_causes: [
        {
          id: 'kisan-cause-1',
          title: isHi ? 'भू-अभिलेख सत्यापन (Land Seeding) "NO" होना' : 'Land Seeding Status Flagged as "NO"',
          explanation: isHi
            ? 'राज्य राजस्व विभाग के भूलेख रिकॉर्ड से किसान के जमीन विवरण का मिलान न होने के कारण Land Seeding "NO" दर्ज हो जाती है और केंद्र सरकार FTO रोक देती है।'
            : 'Mismatch between farmer details and state revenue landholding records (Khatauni/ROR), marking Land Seeding as "NO" on the portal.',
          likelihood: isLandHigh ? 'High' : (flags.mentionsLandYes ? 'Low' : 'Medium'),
          evidence: isHi
            ? (flags.mentionsLandNo ? 'नागरिक ने बताया कि स्टेटस में Land Seeding "NO" दिख रहा है।' : 'नागरिक द्वारा भू-अभिलेख की स्थिति स्पष्ट नहीं की गई अथवा सत्यापन लंबित होने की प्रबल संभावना है।')
            : (flags.mentionsLandNo ? 'Citizen reported that Land Seeding displays "NO" on the portal.' : 'Landholding records remain unverified on the state revenue portal.'),
          verification_steps: [
            isHi ? 'pmkisan.gov.in पर जाएं और "Know Your Status" में अपना रजिस्ट्रेशन नंबर दर्ज करें।' : 'Visit pmkisan.gov.in and click "Know Your Status" with your registration number.',
            isHi ? 'Eligibility Status टैब खोलें और देखें कि Land Seeding के आगे हरा "YES" है या लाल "NO"।' : 'Open the Eligibility Status tab and verify whether Land Seeding shows green "YES" or red "NO".'
          ],
          resolution_steps: [
            isHi ? 'अपनी तहसील अथवा ऑनलाइन राज्य भूलेख पोर्टल (upbhulekh.gov.in) से प्रमाणित खतौनी निकालें।' : 'Download a certified copy of your Khatauni (ROR) from the revenue portal or tehsil.',
            isHi ? 'आधार कार्ड, बैंक पासबुक और खतौनी की स्वप्रमाणित फोटोकॉपी संलग्न करें।' : 'Attach self-attested copies of your Aadhaar card, bank passbook, and Khatauni.',
            isHi ? 'अपने क्षेत्र के लेखपाल (पटवारी) या विकास भवन में ब्लॉक कृषि नोडल अधिकारी के पास जाकर भौतिक सत्यापन कराएं।' : 'Submit the dossier to your local Lekhpal/Patwari or District Agriculture Officer for manual clearance.'
          ],
          official_portals: [
            { name: 'PM-KISAN Status Portal', url: 'https://pmkisan.gov.in/BeneficiaryStatus_New.aspx', desc: 'Verify Land Seeding Status' },
            { name: 'State Bhulekh Portal', url: 'https://upbhulekh.gov.in/', desc: 'Download Certified Khatauni' }
          ]
        },
        {
          id: 'kisan-cause-2',
          title: isHi ? 'आधार ई-केवाईसी (e-KYC) सत्यापन अधूरा या लंबित होना' : 'Aadhaar e-KYC Verification Incomplete or Pending',
          explanation: isHi
            ? '13वीं किस्त से सभी पंजीकृत किसानों के लिए बायोमेट्रिक या ओटीपी आधार e-KYC अनिवार्य कर दिया गया है। e-KYC लंबित होने पर भुगतान रुक जाता है।'
            : 'Central ministry rules mandate biometric or OTP Aadhaar e-KYC. Accounts without verified e-KYC are barred from FTO token generation.',
          likelihood: flags.mentionsEkycNo ? 'High' : (flags.mentionsEkycYes ? 'Low' : 'Medium'),
          evidence: isHi
            ? (flags.mentionsEkycNo ? 'नागरिक ने बताया कि e-KYC अभी अधूरा या लंबित है।' : (flags.mentionsEkycYes ? 'नागरिक ने पुष्टि की कि e-KYC पोर्टल पर पूर्ण (YES) है।' : 'e-KYC स्थिति की जांच आवश्यक है ताकि बायोमेट्रिक अमान्यता खारिज हो सके।'))
            : (flags.mentionsEkycNo ? 'Citizen noted e-KYC is incomplete or pending.' : (flags.mentionsEkycYes ? 'Citizen confirmed e-KYC is completed and active on portal.' : 'e-KYC verification status requires confirmation on the central portal.')),
          verification_steps: [
            isHi ? 'pmkisan.gov.in पर "e-KYC" लिंक खोलें और अपना आधार नंबर डालें।' : 'Open the "e-KYC" link on pmkisan.gov.in and enter your 12-digit Aadhaar number.',
            isHi ? 'यदि पोर्टल "eKYC is already done" कहता है तो यह कारण नहीं है, अन्यथा ओटीपी डालकर पूरा करें।' : 'If it displays "eKYC is already done", this cause is eliminated; otherwise complete via OTP.'
          ],
          resolution_steps: [
            isHi ? 'आधार लिंक मोबाइल पर प्राप्त 6 अंकों के OTP से ऑनलाइन e-KYC पूर्ण करें।' : 'Submit the 6-digit OTP received on your Aadhaar-linked mobile.',
            isHi ? 'यदि मोबाइल लिंक नहीं है, तो नजदीकी ग्राहक सेवा केंद्र (CSC) जाकर बायोमेट्रिक फिंगरप्रिंट लगाएं।' : 'If mobile is unlinked, visit any nearby CSC / VLE center for fingerprint authentication.'
          ],
          official_portals: [
            { name: 'PM-KISAN e-KYC Direct Portal', url: 'https://pmkisan.gov.in/aadharekyc.aspx', desc: '1-Click Direct e-KYC Link' }
          ]
        },
        {
          id: 'kisan-cause-3',
          title: isHi ? 'बैंक खाते में NPCI आधार सीडिंग / DBT Mandate निष्क्रिय होना' : 'Bank Account Inactive on NPCI Aadhaar Payment Bridge',
          explanation: isHi
            ? 'बैंक में केवल आधार कार्ड जमा होना (KYC) और सरकारी भुगतान हेतु NPCI मैपर में आधार सीड होना दो अलग प्रक्रियाएं हैं।'
            : 'Standard Aadhaar linkage is insufficient. The bank must specifically activate the DBT Credit Mandate in the central NPCI registry.',
          likelihood: (!flags.mentionsLandNo && !flags.mentionsEkycNo) ? 'High' : 'Medium',
          evidence: isHi
            ? 'पीएम-किसान का 100% भुगतान आधार पेमेंट ब्रिज (APBS) द्वारा भेजा जाता है, जहां बैंक सीडिंग में त्रुटि होने पर ट्रांजेक्शन बाउंस होता है।'
            : 'All PM-KISAN transfers route through the NPCI Aadhaar Payment Bridge, where inactive mandates cause treasury reversals.',
          verification_steps: [
            isHi ? 'UIDAI पोर्टल पर "Check Aadhaar & Bank Account Linking Status" में जाकर सक्रिय बैंक देखें।' : 'Check active seeded bank on the UIDAI resident portal under bank mapper.',
            isHi ? 'PFMS पोर्टल पर जाकर देखें कि बैंक ने आपका खाता "Accepted by PFMS" किया है या नहीं।' : 'Verify PFMS treasury acceptance status using your PM-KISAN registration number.'
          ],
          resolution_steps: [
            isHi ? 'अपनी बैंक शाखा में जाकर "NPCI DBT Mandate Consent Form" जमा करें और मुहर लगी पावती लें।' : 'Submit the official NPCI DBT Mandate Form at your bank branch and obtain a stamped receipt.',
            isHi ? 'वैकल्पिक रूप से, इंडिया पोस्ट पेमेंट्स बैंक (IPPB) में नया खाता खुलवाएं जिसमें स्वतः NPCI मैपिंग हो जाती है।' : 'Alternatively, open an India Post Payments Bank account with instant NPCI DBT mapping.'
          ],
          official_portals: [
            { name: 'UIDAI Resident Bank Mapper', url: 'https://resident.uidai.gov.in/bank-mapper', desc: 'Check Active NPCI Seeded Bank' },
            { name: 'PM-KISAN Helpdesk', url: 'https://pmkisan.gov.in/', desc: 'Official Scheme Grievance' }
          ]
        }
      ],
      required_documents: [
        'मूल आधार कार्ड (Original Aadhaar Card)',
        'प्रमाणित खतौनी नकल (Land Record ROR)',
        'बैंक पासबुक की फोटोकॉपी',
        'NPCI DBT सहमति पत्र (Mandate Form)'
      ],
      application_letter: `सेवा में,\nश्रीमान उप-जिलाधिकारी (SDM) / तहसीलदार महोदय,\nतहसील [तहसील का नाम], जिला [जिले का नाम]\n\nविषय: पीएम-किसान सम्मान निधि की रुकी किस्त हेतु भू-अभिलेख (Land Seeding) एवं आधार सत्यापन कराने हेतु।\n\nमहोदय,\nसविनय निवेदन है कि प्रार्थी [${citizenName}], ग्राम [गांव], ब्लॉक [ब्लॉक], पीएम-किसान पंजीकरण संख्या [पंजीकरण संख्या] का पात्र लाभार्थी है।\n\nवर्तमान में पोर्टल पर भूलेख सत्यापन / e-KYC त्रुटि प्रदर्शित होने के कारण मेरी सम्मान निधि की किस्तें रुकी हुई हैं। मैंने अपने वैध भू-अभिलेख एवं आधार दस्तावेज संलग्न कर दिए हैं।\n\nअतः श्रीमान जी से विनम्र निवेदन है कि प्रार्थी के अभिलेखों का भौतिक सत्यापन कराकर पोर्टल पर Land Seeding को "YES" कराने की कृपा करें जिससे मेरी रुकी किस्तें प्राप्त हो सकें।\n\nप्रार्थी: [${citizenName}]\nमोबाइल: [मोबाइल नंबर]\nसंलग्नक: 1. प्रमाणित खतौनी प्रति 2. आधार कार्ड प्रति 3. बैंक पासबुक`,
      escalation_authority: 'Sub-Divisional Magistrate (SDM) / Tehsildar / District Agriculture Officer',
      escalation_url: 'https://pmkisan.gov.in/'
    };
  } else if (schemeKey === 'scholarship') {
    const isLimitHigh = flags.mentionsLimitYes;

    diag = {
      case_title: isHi ? 'छात्रवृत्ति भुगतान विफलता: बहु-कारणीय एआई निदान' : 'Scholarship PFMS Payment Failure Multi-Cause Diagnostic Assessment',
      category: isHi ? 'शिक्षा (Education)' : 'Education',
      detected_scheme: 'Scholarship (NSP)',
      severity: 'High',
      resolution_sla: '48 Hours to 7 Working Days',
      affected_systems: 'National Scholarship Portal (NSP), PFMS Treasury, Core Banking System (CBS)',
      summary: isHi
        ? 'छात्र द्वारा दी गई जानकारी के आधार पर छात्रवृत्ति रुकने के 2 मुख्य संभावित कारण पहचाने गए हैं:'
        : 'Based on student testimony, the scholarship failure is isolated across 2 primary suspected causes:',
      possible_causes: [
        {
          id: 'scholarship-cause-1',
          title: isHi ? 'बैंक खाते की जमा सीमा पार (Credit Limit Exceeded - PFMS Rejection)' : 'Bank Account Credit Ceiling Exceeded (PFMS Rejection)',
          explanation: isHi
            ? 'छात्र का बैंक खाता जनधन / बेसिक बचत खाता (PMJDY) होने पर ₹1 लाख की वार्षिक जमा सीमा पार होने के कारण बैंक कोर बैंकिंग सिस्टम भुगतान रिजेक्ट कर देता है।'
            : 'PMJDY basic savings accounts have an annual deposit ceiling of Rs 1 Lakh. Treasury scholarship transfers exceeding this ceiling are automatically rejected by bank systems.',
          likelihood: isLimitHigh ? 'High' : (flags.mentionsLimitNo ? 'Low' : 'Medium'),
          evidence: isHi
            ? (flags.mentionsLimitYes ? 'छात्र ने बताया कि खाता जनधन/जीरो बैलेंस खाता है।' : 'छात्रवृत्ति की राशि जनधन खाते की सीमा से अधिक होने की संभावना है।')
            : (flags.mentionsLimitYes ? 'Student confirmed holding a PMJDY Jan Dhan account.' : 'Scholarship entitlement likely exceeds small account deposit limits.'),
          verification_steps: [
            isHi ? 'PFMS पोर्टल पर "Track NSP Payments" में जाकर Rejection Code देखें कि "Credit Limit Exceeded" है या नहीं।' : 'Log on to PFMS Track Payments to check if the error status reads "Credit Limit Exceeded".',
            isHi ? 'अपनी बैंक शाखा में जाकर पासबुक अपडेट कराएं और खाते की श्रेणी की पुष्टि करें।' : 'Check with home branch manager to verify whether account is categorized as PMJDY Small Account.'
          ],
          resolution_steps: [
            isHi ? 'पैन कार्ड (या फॉर्म 60) और आधार जमा करके खाते को नियमित बचत खाते (Regular Savings) में अपग्रेड कराएं।' : 'Submit full biometric re-KYC with PAN card (or Form 60) to convert to Regular Savings.',
            isHi ? 'बैंक से खाता अपग्रेड होने की मुहर लगी स्लिप लें और NSP डेस्क से PFMS री-पुश (Re-transaction) का अनुरोध करें।' : 'Obtain account upgrade slip and request institute scholarship desk to trigger PFMS re-payment.'
          ],
          official_portals: [
            { name: 'PFMS Track Payments', url: 'https://pfms.nic.in/NewDefaultHome.aspx', desc: 'Track Exact PFMS Rejection Reason' },
            { name: 'National Scholarship Portal', url: 'https://scholarships.gov.in/', desc: 'NSP Student Dashboard' }
          ]
        },
        {
          id: 'scholarship-cause-2',
          title: isHi ? 'संस्थान नोडल अधिकारी (INO) अथवा जिला कल्याण सत्यापन लंबित' : 'Institute Nodal Officer (INO) Verification Pending',
          explanation: isHi
            ? 'जब तक स्कूल या कॉलेज का नोडल अधिकारी छात्रवृत्ति आवेदन के मूल दस्तावेजों का सत्यापन कर पोर्टल पर अग्रसारित नहीं करता, तब तक पीएफएमएस पर टोकन नहीं बनता।'
            : 'Application dossiers must be verified by the college registrar/INO before cutoff deadlines. Without institute sign-off, treasury disbursement is never initiated.',
          likelihood: isLimitHigh ? 'Low' : 'High',
          evidence: isHi
            ? 'शैक्षणिक सत्र के दौरान कॉलेज स्तर पर सत्यापन में देरी होना छात्रवृत्ति रुकने का सबसे बड़ा कारण है।'
            : 'Administrative backlog at institute scholarship counters is the predominant reason for pending files.',
          verification_steps: [
            isHi ? 'scholarships.gov.in पर लॉगिन करें और "Application Status" में देखें कि फाइल कहाँ पेंडिंग है।' : 'Log in to scholarships.gov.in to check if the status displays "Pending at Institute Level".'
          ],
          resolution_steps: [
            isHi ? 'अपने कॉलेज के छात्रवृत्ति प्रभारी / कुलसचिव (Registrar) से संपर्क कर तुरंत सत्यापन करने का आग्रह करें।' : 'Contact your college scholarship in-charge/registrar for immediate document approval.',
            isHi ? 'कॉलेज से अनुमोदन होते ही फाइल स्वतः राज्य व पीएफएमएस स्तर पर अग्रसारित हो जाएगी।' : 'Once approved by college, the file automatically proceeds to state and PFMS treasury stages.'
          ],
          official_portals: [
            { name: 'National Scholarship Portal', url: 'https://scholarships.gov.in/', desc: 'Student Login & Verification Tracking' }
          ]
        }
      ],
      required_documents: [
        'आधार कार्ड (Aadhaar Card)',
        'पैन कार्ड या फॉर्म 60 (PAN Card / Form 60)',
        'कॉलेज बोनाफाइड व फीस रसीद',
        'बैंक पासबुक प्रति'
      ],
      application_letter: `सेवा में,\nश्रीमान शाखा प्रबंधक महोदय,\n[बैंक का नाम], शाखा [शाखा का नाम]\n\nविषय: छात्रवृत्ति प्राप्त करने हेतु जनधन/लघु बचत खाते को नियमित बचत खाते में अपग्रेड करने विषयक।\n\nमहोदय,\nसविनय निवेदन है कि प्रार्थी [${citizenName}] का बचत खाता संख्या [खाता संख्या] आपकी शाखा में है। प्रार्थी [कॉलेज का नाम] में नियमित छात्र है।\n\nप्रार्थी की राष्ट्रीय छात्रवृत्ति (NSP) स्वीकृत हो चुकी है, किंतु खाते पर अधिकतम जमा सीमा (Credit Limit) होने के कारण PFMS द्वारा भुगतान रोक दिया गया है।\n\nअतः आपसे करबद्ध प्रार्थना है कि प्रार्थी की पूर्ण केवाईसी कर खाते को नियमित बचत खाते में अपग्रेड करने की कृपा करें ताकि छात्रवृत्ति खाते में आ सके।\n\nप्रार्थी: [${citizenName}]\nमोबाइल: [मोबाइल]\nसंलग्नक: 1. आधार कार्ड 2. पैन कार्ड 3. कॉलेज आईडी व बोनाफाइड`,
      escalation_authority: 'Bank Branch Manager / PFMS Helpdesk (1800-118-111)',
      escalation_url: 'https://pfms.nic.in/'
    };
  } else if (schemeKey === 'pension') {
    const isDlcHigh = flags.mentionsLifeCertNo;

    diag = {
      case_title: isHi ? 'सामाजिक सुरक्षा पेंशन: भुगतान रुकने का बहु-कारणीय एआई निदान' : 'Social Security Pension Payment Suspension Multi-Cause Diagnostic Assessment',
      category: isHi ? 'पेंशन (Pension)' : 'Pension',
      detected_scheme: 'Social Security Pension',
      severity: 'Critical',
      resolution_sla: '48 to 72 Hours',
      affected_systems: 'State Social Security Pension Portal, Jeevan Pramaan, PFMS',
      summary: isHi
        ? 'पेंशनभोगी द्वारा दी गई जानकारी के आधार पर 2 संभावित कारण सामने आए हैं जिनकी प्राथमिकता के आधार पर जांच की जानी चाहिए:'
        : 'Based on pensioner testimony, the suspension is isolated across 2 suspected reasons ranked by likelihood:',
      possible_causes: [
        {
          id: 'pension-cause-1',
          title: isHi ? 'वार्षिक डिजिटल जीवन प्रमाण पत्र (Jeevan Pramaan) नवीनीकरण लंबित' : 'Annual Digital Life Certificate (DLC) Renewal Pending',
          explanation: isHi
            ? 'पेंशनभोगी के जीवित होने के सत्यापन हेतु प्रतिवर्ष (विशेषकर नवंबर में) डिजिटल जीवन प्रमाण पत्र अनिवार्य होता है। इसके अभाव में समाज कल्याण विभाग स्वतः पेंशन रोक देता है।'
            : 'Under government audit regulations, pensioners must submit an annual Digital Life Certificate (DLC). Failure to submit results in automated disbursement freezing.',
          likelihood: isDlcHigh ? 'High' : (flags.mentionsLifeCertYes ? 'Low' : 'High'),
          evidence: isHi
            ? (flags.mentionsLifeCertNo ? 'पेंशनभोगी ने पुष्टि की कि इस वर्ष का जीवन प्रमाण पत्र अभी जमा नहीं हुआ है।' : 'वार्षिक जीवन प्रमाण पत्र का नवीनीकरण न होना 90% मामलों में पेंशन रुकने का कारण होता है।')
            : (flags.mentionsLifeCertNo ? 'Pensioner confirmed annual life certificate was not submitted.' : 'Unrenewed life certificates account for over 90% of pension stoppages.'),
          verification_steps: [
            isHi ? 'राज्य पेंशन पोर्टल पर जाकर पेंशनर स्टेटस में देखें कि क्या "Life Certificate Status: Expired" आ रहा है।' : 'Verify status on State Social Security Pension Portal to check whether Life Certificate is expired.'
          ],
          resolution_steps: [
            isHi ? 'डाकघर के डाकिया (IPPB Doorstep Service) को घर बुलाएं या सीएससी केंद्र पर जाकर 5 मिनट में बायोमेट्रिक से जीवन प्रमाण पत्र जमा करें।' : 'Call your local postman (IPPB doorstep service) or visit a CSC center for instant biometric DLC generation.',
            isHi ? 'जीवन प्रमाण पत्र की पावती रसीद (Pramaan ID) सुरक्षित रखें।' : 'Retain the generated Pramaan ID receipt for department records.',
            isHi ? 'प्रमाण पत्र स्वीकार होते ही पिछले महीनों का बकाया (Arrears) सहित पेंशन खाते में आ जाएगी।' : 'Once accepted, pending pension arrears will be credited to your account.'
          ],
          official_portals: [
            { name: 'Jeevan Pramaan Portal', url: 'https://jeevanpramaan.gov.in/', desc: 'Digital Life Certificate Portal' },
            { name: 'India Post Doorstep DLC', url: 'https://ippbonline.com/', desc: 'Request Postman at home' }
          ]
        },
        {
          id: 'pension-cause-2',
          title: isHi ? 'बैंक विलय (Merger) के बाद पुराना IFSC अमान्य होना' : 'Invalidated Old IFSC Code Post Bank Merger',
          explanation: isHi
            ? 'सार्वजनिक बैंकों के विलय (जैसे ओरिएंटल बैंक, सिंडिकेट बैंक आदि) के बाद पुराना IFSC अमान्य होने से कोषागार से भेजी गई पेंशन बाउंस हो जाती है।'
            : 'Following public sector bank consolidations, treasury transfers to legacy IFSC codes bounce due to invalid routing clearing data.',
          likelihood: flags.mentionsLifeCertYes ? 'High' : 'Medium',
          evidence: isHi
            ? 'यदि जीवन प्रमाण पत्र जमा होने के बावजूद पेंशन नहीं आ रही है तो बैंक विलय की समस्या सबसे प्रबल कारण होती है।'
            : 'If life certificate is valid yet payments fail, clearing code invalidation is the most probable secondary roadblock.',
          verification_steps: [
            isHi ? 'अपनी नई बैंक पासबुक में देखें कि क्या आपका IFSC कोड बदला है।' : 'Check updated bank passbook for changed IFSC code post-merger.'
          ],
          resolution_steps: [
            isHi ? 'नई पासबुक की प्रति लेकर विकास भवन में जिला समाज कल्याण अधिकारी कार्यालय में जमा करें और नया IFSC दर्ज कराएं।' : 'Submit a copy of your updated passbook with the new IFSC code to the Social Welfare Department.',
            isHi ? 'ट्रेजरी में नया IFSC अपडेट होते ही पेंशन पुनः शुरू हो जाएगी।' : 'Disbursements will resume once treasury records reflect the new IFSC.'
          ],
          official_portals: [
            { name: 'PFMS Treasury Portal', url: 'https://pfms.nic.in/', desc: 'Track Treasury Payment Clearance' }
          ]
        }
      ],
      required_documents: [
        'पेंशनर PPO / रजिस्ट्रेशन नंबर',
        'आधार कार्ड (Aadhaar Card)',
        'बैंक पासबुक की फोटोकॉपी',
        'डिजिटल जीवन प्रमाण पावती'
      ],
      application_letter: `सेवा में,\nश्रीमान जिला समाज कल्याण अधिकारी महोदय,\nविकास भवन, [जिले का नाम]\n\nविषय: जीवन प्रमाण पत्र प्रस्तुत करने के उपरांत रुकी हुई वृद्धावस्था/विधवा पेंशन बहाल करने हेतु।\n\nमहोदय,\nसविनय निवेदन है कि प्रार्थी/प्रार्थिया [${citizenName}], निवासी [गांव/वार्ड], पेंशन रजिस्ट्रेशन/PPO संख्या [PPO संख्या] का पंजीकृत लाभार्थी है।\n\nमेरी मासिक पेंशन विगत कुछ माह से जीवन प्रमाण पत्र के अभाव में रुक गई थी। मैंने अपना डिजिटल जीवन प्रमाण पत्र (Pramaan ID: [प्रमाण आईडी]) सफलतापूर्वक दर्ज करा दिया है।\n\nअतः आपसे विनम्र प्रार्थना है कि प्रार्थी की रुकी हुई पेंशन राशि का बकाया सहित भुगतान पुनः शुरू कराने की कृपा करें।\n\nप्रार्थी/प्रार्थिया: [${citizenName}]\nमोबाइल: [मोबाइल]\nसंलग्नक: 1. आधार कार्ड 2. जीवन प्रमाण पावती 3. बैंक पासबुक`,
      escalation_authority: 'District Social Welfare Officer (जिला समाज कल्याण अधिकारी)',
      escalation_url: 'https://jeevanpramaan.gov.in/'
    };
  } else {
    // General DBT Multi-Cause Diagnosis
    diag = {
      case_title: isHi ? 'डीबीटी भुगतान विफलता: बहु-कारणीय एआई निदान' : 'Direct Benefit Transfer Multi-Cause Diagnostic Assessment',
      category: isHi ? 'बैंकिंग व पहचान (Banking & Identity)' : 'Banking & Identity',
      detected_scheme: 'General DBT',
      severity: 'Critical',
      resolution_sla: '48 to 72 Hours',
      affected_systems: 'NPCI Bharat Aadhaar Seeding Enabler (BASE), PFMS',
      summary: isHi
        ? 'नागरिक द्वारा दी गई जानकारी के आधार पर सरकारी डीबीटी विफलता के 2 संभावित कारण सामने आए हैं:'
        : 'Based on citizen testimony, 2 primary suspected causes for DBT failure are isolated:',
      possible_causes: [
        {
          id: 'general-cause-1',
          title: isHi ? 'बैंक खाते में NPCI आधार सीडिंग / DBT Mandate निष्क्रिय होना' : 'NPCI Aadhaar-Bank DBT Mandate Inactive',
          explanation: isHi
            ? 'आधार कार्ड बैंक खाते में केवल KYC हेतु लिंक होना और सरकारी प्रत्यक्ष लाभ अंतरण हेतु NPCI मैपर में सक्रिय होना दो अलग प्रक्रियाएं हैं।'
            : 'Standard Aadhaar KYC linking does not enable automated government subsidies. The bank must specifically activate the APBS DBT Credit Mandate.',
          likelihood: 'High',
          evidence: isHi
            ? 'भारत में 80% से अधिक सरकारी सब्सिडी विफलता का मुख्य कारण NPCI मैपर में खाता सक्रिय न होना होता है।'
            : 'Over 80% of stalled DBT transfers occur because banks have not updated the central NPCI APBS registry.',
          verification_steps: [
            isHi ? 'UIDAI के "Bank Seeding Status" पोर्टल पर जाकर जांचें कि कौन सा बैंक खाता NPCI में Active दिख रहा है।' : 'Check active seeded bank on the official UIDAI resident bank mapper portal.'
          ],
          resolution_steps: [
            isHi ? 'अपनी बैंक शाखा में जाएं और नीचे दिया गया तैयार आवेदन पत्र तथा "NPCI DBT Mandate Form" जमा करें।' : 'Submit the pre-filled application letter below and official DBT Mandate Form at your bank branch.',
            isHi ? 'यदि बैंक में देरी हो तो इंडिया पोस्ट पेमेंट्स बैंक (IPPB) में नया खाता खुलवाएं जिसमें स्वतः 24 घंटे में NPCI मैपिंग सक्रिय हो जाती है।' : 'Alternatively, open an India Post Payments Bank account for instant NPCI DBT mapping.'
          ],
          official_portals: [
            { name: 'UIDAI Resident Bank Mapper', url: 'https://resident.uidai.gov.in/bank-mapper', desc: 'Verify NPCI DBT Mapping' },
            { name: 'NPCI Official Portal', url: 'https://www.npci.org.in/', desc: 'National Payments Corporation Portal' }
          ]
        },
        {
          id: 'general-cause-2',
          title: isHi ? 'बैंक खाता निष्क्रिय (Dormant/Inactive) अथवा जमा सीमा बाधा' : 'Dormant Account Status or Transaction Ceiling',
          explanation: isHi
            ? 'लंबे समय तक लेन-देन न होने से बैंक खाता इनएक्टिव हो जाता है या लघु बचत खाते पर ₹1 लाख की वार्षिक सीमा होती है, जिससे सरकारी किस्त बाउंस हो जाती है।'
            : 'Accounts without recent transactions enter dormant status, causing bank clearing systems to reject inbound treasury remittances.',
          likelihood: 'Medium',
          evidence: isHi
            ? 'बैंक कोर बैंकिंग सिस्टम इनएक्टिव खातों में आने वाले फंड को अस्वीकृत कर देता है।'
            : 'Core banking systems reject treasury credits to dormant or credit-restricted accounts.',
          verification_steps: [
            isHi ? 'बैंक जाकर या एटीएम में मिनी-स्टेटमेंट निकालकर जांचें कि खाता पूरी तरह सक्रिय है या नहीं।' : 'Check recent account transaction activity or mini-statement at your branch/ATM.'
          ],
          resolution_steps: [
            isHi ? 'शाखा में री-केवाईसी फॉर्म और आधार कार्ड जमा कर खाते को पुनः सक्रिय (Reactivate) कराएं।' : 'Submit a re-KYC form with Aadhaar at the branch to reactivate the account.'
          ],
          official_portals: [
            { name: 'RBI Banking Ombudsman', url: 'https://cms.rbi.org.in/', desc: 'Escalate Unresolved Bank Grievance' }
          ]
        }
      ],
      required_documents: [
        'मूल आधार कार्ड (Original Aadhaar Card)',
        'आधार कार्ड की स्वप्रमाणित प्रति',
        'बैंक पासबुक की फोटोकॉपी',
        'NPCI Mandate सहमति पत्र'
      ],
      application_letter: `सेवा में,\nश्रीमान शाखा प्रबंधक महोदय,\n[बैंक का नाम], शाखा [शाखा का नाम]\n\nविषय: बचत खाते को NPCI DBT मैपर से आधार सीड/मैप करने हेतु प्रार्थना पत्र।\n\nमहोदय,\nसविनय निवेदन है कि प्रार्थी [${citizenName}] का एक बचत खाता संख्या [खाता संख्या] आपकी शाखा में संचालित है। प्रार्थी का आधार संख्या [आधार संख्या] है।\n\nप्रार्थी को केंद्र एवं राज्य सरकार की प्रत्यक्ष लाभ अंतरण (DBT) योजनाओं का लाभ इसी बैंक खाते में प्राप्त करना है। वर्तमान में NPCI Aadhaar Payment Bridge में यह खाता सीड न होने के कारण सरकारी किस्तें अस्वीकृत (Rejected by Bank) हो रही हैं।\n\nअतः आपसे विनम्र प्रार्थना है कि प्रार्थी के उक्त खाते को NPCI मैपर में आधार के साथ लिंक/सीड करने की कृपा करें तथा पावती प्रदान करें।\n\nसधन्यवाद,\nप्रार्थी: [${citizenName}]\nमोबाइल: [मोबाइल]\nसंलग्नक: 1. आधार कार्ड प्रति 2. बैंक पासबुक प्रति 3. NPCI DBT सहमति पत्र`,
      escalation_authority: 'Bank Branch Manager / RBI Banking Ombudsman',
      escalation_url: 'https://cms.rbi.org.in/'
    };
  }

  const result = {
    status: 'completed',
    reply: isHi
      ? `आपकी स्थिति का विस्तृत विश्लेषण पूर्ण हो गया है। सरकारी नियमों व आपके उत्तरों के आधार पर संभावित कारणों को प्राथमिकता क्रम (Likelihood: High / Medium / Low) में नीचे प्रस्तुत किया गया है। साथ ही सत्यापन व समाधान के चरण दिए गए हैं:`
      : `Your diagnostic assessment is complete. Based on government treasury rules and your responses, suspected causes are ranked by likelihood (High / Medium / Low) with verification and step-by-step resolution instructions below:`,
    diagnosis: {
      history_id: historyId,
      citizen_name: citizenName,
      diagnosed_at: new Date().toISOString(),
      analyzed_text: allUserText,
      // Backward compatibility fields for single-cause components
      issue_title: diag.possible_causes?.[0]?.title || diag.case_title,
      cause: diag.possible_causes?.[0]?.explanation || 'Suspected DBT mapping or verification roadblock',
      why_it_happened: diag.possible_causes?.[0]?.explanation || 'Treasury clearance suspended pending mandatory verification.',
      action_steps: diag.possible_causes?.[0]?.resolution_steps || [],
      official_portals: diag.possible_causes?.[0]?.official_portals || [],
      ...diag
    }
  };

  inMemoryHistory[historyId] = result.diagnosis;
  return result;
}

// Orchestrator: Calls Groq -> OpenAI -> Local Grounded Diagnostic Engine
async function callGroqOrOpenAiForDbt(messages, language = 'en', citizenName = 'Citizen Beneficiary', answersSummary = {}) {
  const isHi = language === 'hi';
  const groqKey = process.env.GROQ_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  const userMessages = (messages || []).filter(m => m.role === 'user');

  // Hard Rule: NEVER finish diagnosis immediately after turn 1
  const forceQuestionOnTurn1 = userMessages.length <= 1;

  // Format messages for LLM
  const formattedMessages = [
    { role: 'system', content: DBT_SYSTEM_PROMPT },
    {
      role: 'user',
      content: `Citizen Name: ${citizenName}\nLanguage Requested: ${isHi ? 'Hindi (हिंदी)' : 'English'}\nCurrent User Turns: ${userMessages.length}\n${forceQuestionOnTurn1 ? 'IMPORTANT: This is the citizen\'s first input. You MUST respond with status: "questioning" and ask a probing question. Do NOT complete diagnosis yet.' : ''}\nKnown Facts: ${JSON.stringify(answersSummary)}`
    },
    ...messages.map(m => ({ role: m.role, content: m.content }))
  ];

  // 1. Try Groq (Llama 3.3 / 3.1)
  if (groqKey && !groqKey.includes('your_groq')) {
    for (const model of GROQ_MODELS) {
      try {
        const response = await axios.post(
          'https://api.groq.com/openai/v1/chat/completions',
          {
            model,
            messages: formattedMessages,
            temperature: 0.2,
            max_tokens: 1800,
            response_format: { type: 'json_object' }
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${groqKey}`
            },
            timeout: 18000
          }
        );

        const content = response.data?.choices?.[0]?.message?.content;
        if (content) {
          const parsed = cleanAndParseJson(content);
          if (parsed) {
            const normalized = normalizeDiagnosticOutput(parsed, language, citizenName, userMessages.length);
            if (normalized) {
              if (forceQuestionOnTurn1 && normalized.status === 'completed') {
                return adaptiveDbtDiagnosticEngineLocal(messages, language, citizenName, answersSummary);
              }
              return normalized;
            }
          }
        }
      } catch (err) {
        console.warn(`Groq DBT diagnostic call failed (model: ${model}):`, err.response?.data || err.message);
      }
    }
  }

  // 2. Try OpenAI Fallback
  if (openaiKey && !openaiKey.includes('your_openai')) {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          messages: formattedMessages,
          temperature: 0.2,
          max_tokens: 1800,
          response_format: { type: 'json_object' }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openaiKey}`
          },
          timeout: 12000
        }
      );

      const content = response.data?.choices?.[0]?.message?.content;
      if (content) {
        const parsed = cleanAndParseJson(content);
        if (parsed) {
          const normalized = normalizeDiagnosticOutput(parsed, language, citizenName, userMessages.length);
          if (normalized) {
            if (forceQuestionOnTurn1 && normalized.status === 'completed') {
              return adaptiveDbtDiagnosticEngineLocal(messages, language, citizenName, answersSummary);
            }
            return normalized;
          }
        }
      }
    } catch (err) {
      console.warn('OpenAI DBT diagnostic call failed:', err.response?.data || err.message);
    }
  }

  // 3. Fallback to Grounded Adaptive Diagnostic Engine
  return adaptiveDbtDiagnosticEngineLocal(messages, language, citizenName);
}

// ==========================================
// API ROUTES
// ==========================================

// 1. List all DBT issue types
router.get('/issues', (req, res) => {
  res.json(demoIssues);
});

// 2. Interactive AI-Powered DBT Diagnostic Assistant (New Adaptive Endpoint)
router.post('/chat-diagnose', async (req, res) => {
  try {
    const { messages = [], language = 'en', citizen_name = 'Citizen Beneficiary', answers_summary = {} } = req.body;
    if (!messages || !messages.length) {
      return res.status(400).json({ error: 'Messages cannot be empty.' });
    }

    const result = await callGroqOrOpenAiForDbt(messages, language, citizen_name, answers_summary);

    if (result.status === 'completed' && result.diagnosis) {
      const historyId = result.diagnosis.history_id || ('DBT-AI-' + Date.now().toString(36).toUpperCase());
      result.diagnosis.history_id = historyId;
      result.diagnosis.citizen_name = citizen_name;
      result.diagnosis.diagnosed_at = result.diagnosis.diagnosed_at || new Date().toISOString();
      inMemoryHistory[historyId] = result.diagnosis;
    }

    res.json(result);
  } catch (err) {
    console.error('Error in /api/dbt/chat-diagnose:', err);
    const fallback = adaptiveDbtDiagnosticEngineLocal(req.body.messages || [], req.body.language, req.body.citizen_name);
    if (fallback.status === 'completed' && fallback.diagnosis) {
      const historyId = 'DBT-AI-' + Date.now().toString(36).toUpperCase();
      fallback.diagnosis.history_id = historyId;
      fallback.diagnosis.citizen_name = req.body.citizen_name;
      fallback.diagnosis.diagnosed_at = new Date().toISOString();
      inMemoryHistory[historyId] = fallback.diagnosis;
    }
    res.json(fallback);
  }
});

// 2.1 Sync diagnosis to memory store for PDF generation
router.post('/history/sync', (req, res) => {
  try {
    const { diagnosis } = req.body;
    if (diagnosis && diagnosis.history_id) {
      inMemoryHistory[diagnosis.history_id] = diagnosis;
      return res.json({ success: true, history_id: diagnosis.history_id });
    }
    res.status(400).json({ error: 'Valid diagnosis object required' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 3. Legacy / Quick Natural Language Problem Diagnosis (Backwards-compatible)
router.post('/analyze-problem', (req, res) => {
  try {
    const { problem = '', language = 'en', citizen_name = 'Citizen Beneficiary' } = req.body;
    if (!problem.trim()) {
      return res.status(400).json({ error: 'Please describe your DBT failure problem.' });
    }

    const text = problem.toLowerCase();
    let issueKey = 'general';
    if (/kisan|farmer|2000|kist/.test(text)) {
      issueKey = 'pm_kisan';
    } else if (/scholarship|student|nsp/.test(text)) {
      issueKey = 'scholarship';
    } else if (/pension|senior|bujurg|vriddha|widow/.test(text)) {
      issueKey = 'pension';
    }

    const finalRes = buildMultiCauseDiagnosis(issueKey, language === 'hi', citizen_name, problem, {});
    res.json({ success: true, ...finalRes.diagnosis });
  } catch (err) {
    console.error('Error analyzing DBT problem:', err);
    res.status(500).json({ error: 'Diagnosis failed: ' + err.message });
  }
});

// 4. Get questions for an issue
router.get('/issues/:id/questions', (req, res) => {
  const { id } = req.params;
  const issue = demoIssues.find(i => String(i.id) === String(id));
  if (!issue) return res.status(404).json({ error: 'Issue not found' });
  res.json(issue.questions);
});

// 5. Diagnose an issue based on citizen's answers
router.post('/issues/:id/diagnose', async (req, res) => {
  const { id } = req.params;
  const { answers, citizen_name, language } = req.body;

  const issue = demoIssues.find(i => String(i.id) === String(id));
  if (!issue) return res.status(404).json({ error: 'DBT issue not found' });

  let matchedRule = null;
  const answerValues = Object.values(answers || {});

  for (const rule of issue.rules) {
    const isMatch = rule.match.some(m => answerValues.some(ans => ans.includes(m) || m.includes(ans)));
    if (isMatch) {
      matchedRule = rule;
      break;
    }
  }

  if (!matchedRule) {
    matchedRule = issue.rules[issue.rules.length - 1];
  }

  const historyId = 'DIAG-' + Date.now().toString(36).toUpperCase();

  const diagnosticResult = {
    history_id: historyId,
    issue_id: issue.id,
    issue_title: language === 'hi' ? issue.title_hi : issue.title,
    citizen_name: citizen_name || 'Citizen Beneficiary',
    diagnosed_at: new Date().toISOString(),
    cause: language === 'hi' ? matchedRule.cause_hi : matchedRule.cause,
    why_it_happened: language === 'hi' ? matchedRule.guidance_hi : matchedRule.guidance,
    severity: matchedRule.severity,
    guidance: language === 'hi' ? matchedRule.guidance_hi : matchedRule.guidance,
    action_steps: matchedRule.action_steps || [],
    escalation_authority: matchedRule.escalation_authority,
    escalation_url: matchedRule.escalation_url,
    user_answers: answers
  };

  inMemoryHistory[historyId] = diagnosticResult;

  if (supabase) {
    try {
      await supabase.from('diagnostic_history').insert([
        { issue_id: issue.id, answers, result: diagnosticResult }
      ]);
    } catch (e) {
      console.warn('DB insert skipped in demo');
    }
  }

  res.json(diagnosticResult);
});

// 6. Generate and download PDF Diagnostic Report (Multi-Cause Capable)
router.get('/history/:hid/report', (req, res) => {
  const { hid } = req.params;
  const data = inMemoryHistory[hid] || {
    history_id: hid,
    case_title: 'Direct Benefit Transfer Multi-Cause Diagnostic Assessment',
    issue_title: 'DBT Payment Disbursal Diagnosis',
    citizen_name: 'Verified Citizen',
    diagnosed_at: new Date().toISOString(),
    severity: 'High',
    resolution_sla: '48-72 Hours',
    summary: 'Automated diagnostic assessment grounded in official treasury guidelines.',
    possible_causes: [
      {
        title: 'NPCI Aadhaar-Bank Seeding or e-KYC Requirement',
        likelihood: 'High',
        evidence: 'Citizen reported stalled treasury payment credit.',
        verification_steps: ['Check active seeded bank on UIDAI resident bank mapper.'],
        resolution_steps: [
          'Visit your bank branch with original Aadhaar Card and Passbook.',
          'Submit the Aadhaar Seeding / Mandate Consent form for DBT.',
          'Verify status on resident.uidai.gov.in.'
        ]
      }
    ],
    required_documents: ['Original Aadhaar Card', 'Bank Passbook', 'DBT Mandate Consent Form'],
    escalation_authority: 'Bank Branch Manager / UIDAI / PFMS',
    escalation_url: 'https://pfms.nic.in/'
  };

  try {
    const doc = new PDFDocument({ margin: 45 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="JanSetu_DBT_Diagnostic_${hid}.pdf"`);

    doc.pipe(res);

    // Header Banner
    doc.rect(0, 0, 612, 85).fill('#1E293B');
    doc.fillColor('#F8FAFC').fontSize(20).text('JANSETU - DBT FAILURE DETECTIVE', 45, 22, { bold: true });
    doc.fillColor('#94A3B8').fontSize(10).text('Official Direct Benefit Transfer Multi-Cause Diagnostic Report', 45, 48);

    doc.moveDown(3);

    // Meta Box
    doc.fillColor('#0F172A').fontSize(13).text(`Case Reference ID: ${data.history_id}`, 45, 105, { bold: true });
    doc.fontSize(9).fillColor('#475569');
    doc.text(`Generated On: ${new Date(data.diagnosed_at).toLocaleString('en-IN')}`);
    doc.text(`Beneficiary Name: ${data.citizen_name}`);
    doc.text(`Category: ${data.category || data.detected_scheme || 'DBT Welfare'}`);
    doc.text(`Severity: ${data.severity || 'High'} | Resolution SLA: ${data.resolution_sla || '48-72 Hours'}`);
    if (data.affected_systems) doc.text(`Affected Systems: ${data.affected_systems}`);

    doc.moveDown(0.8);
    doc.rect(45, 178, 522, 1).fill('#CBD5E1');
    doc.moveDown(1.2);

    // Multi-Cause Breakdown
    doc.fillColor('#0F172A').fontSize(13).text('Prioritized Suspected Causes (Ranked by Likelihood):', 45, 195, { bold: true });
    doc.moveDown(0.5);

    const causes = data.possible_causes && data.possible_causes.length > 0 ? data.possible_causes : [
      {
        title: data.cause || 'NPCI Aadhaar-Bank Seeding Incomplete',
        likelihood: 'High',
        evidence: 'Citizen reported disbursement stoppage.',
        resolution_steps: data.action_steps || []
      }
    ];

    causes.forEach((c, idx) => {
      doc.moveDown(0.5);
      doc.fillColor('#1E293B').fontSize(11).text(`${idx + 1}. ${c.title}`, { bold: true });
      doc.fillColor('#64748B').fontSize(9).text(`Likelihood: [ ${c.likelihood || 'High'} ] | Evidence: ${c.evidence || 'Reported by beneficiary'}`);
      
      if (c.explanation) {
        doc.fillColor('#334155').fontSize(9).text(`Explanation: ${c.explanation}`, { width: 520, align: 'justify' });
      }

      if (c.verification_steps && c.verification_steps.length > 0) {
        doc.moveDown(0.2);
        doc.fillColor('#0369A1').fontSize(8.5).text('How to Verify:', { bold: true });
        c.verification_steps.forEach(v => {
          doc.fillColor('#334155').fontSize(8.5).text(` • ${v}`, { indent: 10 });
        });
      }

      if (c.resolution_steps && c.resolution_steps.length > 0) {
        doc.moveDown(0.2);
        doc.fillColor('#047857').fontSize(8.5).text('Resolution Steps:', { bold: true });
        c.resolution_steps.forEach(r => {
          doc.fillColor('#334155').fontSize(8.5).text(` • ${r}`, { indent: 10 });
        });
      }
      doc.moveDown(0.5);
    });

    // Required Documents
    if (data.required_documents && data.required_documents.length > 0) {
      doc.moveDown(0.8);
      doc.fillColor('#0F172A').fontSize(11).text('Required Documents Checklist:', { bold: true });
      doc.moveDown(0.3);
      data.required_documents.forEach((docName) => {
        doc.fillColor('#334155').fontSize(8.5).text(`[ ] ${docName}`, { indent: 12 });
      });
    }

    // Escalation Section
    doc.moveDown(0.8);
    doc.fillColor('#0F172A').fontSize(11).text('Designated Escalation Authority:', { bold: true });
    doc.fillColor('#475569').fontSize(8.5).text(`Authority: ${data.escalation_authority || 'Bank Branch Manager / PFMS Helpdesk'}`);
    if (data.escalation_url) {
      doc.fillColor('#0284C7').fontSize(8.5).text(`Official Portal: ${data.escalation_url}`);
    }

    // Disclaimer Footer
    doc.moveDown(1.5);
    doc.rect(45, doc.y, 522, 45).fill('#F8FAFC');
    doc.fillColor('#64748B').fontSize(7.5).text(
      'DISCLAIMER: JanSetu provides automated diagnostic guidance based on official Government of India (PFMS, NPCI, UIDAI) circulars. Take this report along with your original Aadhaar and passbook to your bank branch or tehsil.',
      55,
      doc.y - 38,
      { width: 502, align: 'center' }
    );

    doc.end();
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate PDF report: ' + err.message });
  }
});

module.exports = router;
