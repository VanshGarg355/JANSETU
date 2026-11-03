const express = require('express');
const router = express.Router();
const axios = require('axios');
const demoSchemes = require('../data/demoSchemes.json');

// Context grounding / RAG knowledge
function buildContextKnowledge(query) {
  const q = (query || '').toLowerCase();
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

// System prompt enforcing strict civic grievance resolution ethics
const SYSTEM_PROMPT = `You are "JanSetu AI Sahayak" (जनसेतु एआई सहायक), an official, highly competent civic problem-solving companion and grievance counselor for Indian citizens.
Your job is to diagnose the citizen's exact issue and provide 100% verified, actionable, step-by-step solutions to solve it.

CRITICAL RULES:
1. Always respond in the citizen's preferred language (Hindi in clean Devanagari script, or English).
2. For any civic issue, DBT failure, or scheme query, provide:
   - Issue identification & Root Cause explanation (सरल भाषा में कारण).
   - Step-by-step action plan (कदम-दर-कदम समाधान).
   - Required documents checklist (आवश्यक दस्तावेज़).
   - Direct official portal URL and toll-free helpline.
   - A ready-to-copy formal application letter template (बैंक या अधिकारी हेतु प्रार्थना पत्र) if an application is needed.
   - 3-4 interactive follow-up question suggestions.
3. NEVER ask for passwords, OTPs, PINs, or 12-digit Aadhaar.
4. ONLY provide genuine government URLs (*.gov.in, *.nic.in).`;

// Deep Grounded Civic Knowledge & Resolution Engine (100% Offline / Resilient)
function diagnoseCivicIssue(query, language) {
  const isHindi = language === 'hi' || /[\u0900-\u097F]/.test(query);
  const q = (query || '').toLowerCase().trim();

  // 1. PM-KISAN ISSUES (किस्त रुकना, e-KYC, भूलेख अंकन)
  if (
    q.includes('kisan') || q.includes('किसान') || q.includes('farmer') ||
    q.includes('kheti') || q.includes('fasal') || q.includes('2000') ||
    q.includes('6000') || q.includes('किस्त') || q.includes('installment') ||
    q.includes('ekyc') || q.includes('e-kyc') || q.includes('bhu-ankit') ||
    q.includes('land seeding') || q.includes('patwari')
  ) {
    if (isHindi) {
      return {
        identified_issue: 'पीएम-किसान सम्मान निधि किस्त रुकना / e-KYC एवं भूलेख सत्यापन',
        root_cause: 'पीएम-किसान की ₹2,000 की किस्त रुकने के 3 प्रमुख कारण होते हैं: (1) बैंक खाते में NPCI आधार सीडिंग इनएक्टिव होना, (2) पोर्टल पर e-KYC पूर्ण न होना, या (3) राज्य राजस्व विभाग द्वारा "Land Seeding (भू-अंकन) = NO" दर्ज होना।',
        action_steps: [
          'pmkisan.gov.in पोर्टल पर जाएं और "Know Your Status" में अपना पंजीकरण या आधार नंबर डालकर Land Seeding और e-KYC की स्थिति जांचें।',
          'यदि e-KYC लंबित है, तो पोर्टल पर "e-KYC" विकल्प से आधार OTP द्वारा या नजदीकी CSC केंद्र पर बायोमेट्रिक से तुरंत पूरा करें।',
          'यदि Land Seeding "NO" है, तो अपनी खतौनी (भूलेख नकल), आधार कार्ड और बैंक पासबुक लेकर तहसील में लेखपाल/पटवारी या कृषि उप-निदेशक कार्यालय में जमा कराएं।',
          'यदि FTO "NO" या DBT एरर है, तो अपनी बैंक शाखा में जाकर "NPCI DBT Seeding Mandate Form" जमा करें।'
        ],
        documents: [
          'आधार कार्ड (Aadhaar Card)',
          'कृषि भूमि की अद्यतन खतौनी / जमाबंदी (Land Khatauni)',
          'बैंक पासबुक की फोटोकॉपी (Bank Passbook)',
          'आधार से लिंक सक्रिय मोबाइल नंबर (Aadhaar Linked Mobile)'
        ],
        official_portal: {
          name: 'PM-KISAN आधिकारिक पोर्टल (pmkisan.gov.in)',
          url: 'https://pmkisan.gov.in'
        },
        helpline: 'पीएम-किसान टोल-फ्री हेल्पलाइन: 155261 / 1800-115-526',
        application_letter: `सेवा में,
श्रीमान शाखा प्रबंधक महोदय,
[बैंक का नाम], [शाखा का नाम]

विषय: पीएम-किसान योजना हेतु बैंक खाते को NPCI/DBT मैपर से लिंक करने बाबत।

महोदय,
सविनय निवेदन है कि प्रार्थी का एक बचत खाता आपकी शाखा में है, जिसका खाता क्रमांक [यहाँ अपना बैंक खाता संख्या लिखें] है। 
मुझे भारत सरकार की प्रधानमंत्री किसान सम्मान निधि योजना के अंतर्गत मिलने वाली किस्त प्राप्त नहीं हो पा रही है, क्योंकि मेरा बैंक खाता NPCI मैपर पर आधार से DBT हेतु सक्रिय नहीं है।

अतः आपसे करबद्ध निवेदन है कि मेरे उक्त खाते में NPCI आधार सीडिंग (DBT Consent) सक्रिय करने की कृपा करें, ताकि मुझे सरकारी आर्थिक सहायता प्राप्त हो सके।

संलग्नक:
1. आधार कार्ड की स्वप्रमाणित प्रति
2. बैंक पासबुक की प्रति
3. भरा हुआ NPCI मैंडेट फॉर्म

प्रार्थी:
नाम: [यहाँ अपना नाम लिखें]
मोबाइल नंबर: [यहाँ अपना मोबाइल नंबर लिखें]
आधार संख्या: [आधार के अंतिम 4 अंक - XXXX-XXXX-1234]`,
        follow_ups: [
          'बैंक को देने वाला प्रार्थना पत्र कैसे जमा करें?',
          'घर बैठे मोबाइल से e-KYC कैसे पूरी करें?',
          'तहसील में लेखपाल से भूलेख सत्यापन कैसे कराएं?',
          'पीएम-किसान हेल्पलाइन से संपर्क कैसे करें?'
        ]
      };
    }

    return {
      identified_issue: 'PM-KISAN ₹2,000 Installment Stopped / Pending e-KYC & Land Seeding',
      root_cause: 'PM-KISAN installment credits halt primarily due to 3 reasons: (1) Aadhaar not mapped in NPCI mapper with DBT consent, (2) Incomplete biometrics or OTP e-KYC, or (3) State Revenue Department marking "Land Seeding = NO".',
      action_steps: [
        'Visit pmkisan.gov.in and click "Know Your Status" using your registration or Aadhaar number to verify Land Seeding and e-KYC flags.',
        'If e-KYC is pending, complete it instantly on the portal using Aadhaar OTP or at any CSC center via biometric scanner.',
        'If Land Seeding is "NO", submit your land Khatauni (record of rights), Aadhaar, and passbook to the village Lekhpal/Patwari or District Agriculture Office.',
        'If FTO shows failed/pending, submit the NPCI DBT Mandate Form at your bank branch to link your Aadhaar with the APBS bridge.'
      ],
      documents: [
        'Aadhaar Card copy',
        'Updated Land Khatauni / Record of Rights',
        'Bank Passbook photocopy',
        'Aadhaar-linked active mobile number'
      ],
      official_portal: {
        name: 'PM-KISAN National Portal',
        url: 'https://pmkisan.gov.in'
      },
      helpline: 'PM-KISAN Toll-Free Helpline: 155261 / 1800-115-526',
      application_letter: `To,
The Branch Manager,
[Name of Bank], [Branch Name]

Subject: Request for Aadhaar-Bank Account Seeding on NPCI Mapper for PM-KISAN DBT.

Respected Sir/Madam,
I hold a savings bank account with your branch bearing Account Number [Insert Account Number].
I have been registered under the PM Kisan Samman Nidhi scheme; however, my direct subsidy installments are failing due to the absence of active NPCI/DBT mapping on this account.

I kindly request you to link my Aadhaar number with my savings bank account in the NPCI mapper for Direct Benefit Transfer (DBT) enablement.

Enclosures:
1. Self-attested copy of Aadhaar Card
2. Copy of Bank Passbook
3. Duly filled NPCI Consent Form

Sincerely,
Name: [Your Name]
Mobile Number: [Your Mobile Number]
Aadhaar (Last 4 digits): [XXXX-XXXX-1234]`,
      follow_ups: [
        'How to complete OTP e-KYC on mobile?',
        'How to resolve Land Seeding NO status?',
        'Show bank application letter format',
        'What is PM-KISAN official helpline?'
      ]
    };
  }

  // 2. DBT & AADHAAR NPCI SEEDING ISSUES (डीबीटी विफलता, आधार बैंक सीडिंग)
  if (
    q.includes('dbt') || q.includes('npci') || q.includes('seeding') ||
    q.includes('आधार लिंक') || q.includes('aadhar link') || q.includes('खाता लिंक') ||
    q.includes('payment failed') || q.includes('पैसा नहीं आया') || q.includes('पैसे नहीं आए') ||
    q.includes('mapper') || q.includes('pfms') || q.includes('apbs') || q.includes('subsidy')
  ) {
    if (isHindi) {
      return {
        identified_issue: 'डीबीटी भुगतान विफलता / बैंक खाते में NPCI आधार सीडिंग निष्क्रिय',
        root_cause: 'साधारण बैंक KYC और DBT सीडिंग में अंतर होता है! बैंक में केवल आधार कार्ड जमा करने से वह केवल पहचान पत्र बनता है। जब तक बैंक कर्मचारी NPCI के मैपर पोर्टल पर "DBT Consent" टिक करके सर्वर पर अपलोड नहीं करता, तब तक सरकारी सब्सिडी खाते में नहीं आ सकती।',
        action_steps: [
          'अपने बैंक की गृह शाखा (Home Branch) में जाएं और काउंटर से "आधार सीडिंग / NPCI DBT मैंडेट फॉर्म (Annexure I)" प्राप्त करें।',
          'फॉर्म में विकल्प (A) चुनें: "I wish to seed my Aadhaar in NPCI mapper to receive DBT benefits in this account"।',
          'बैंक क्लर्क से कहें कि "कृपया कोर बैंकिंग सिस्टम (CBS) में UID Linkage के साथ DBT Flag को YES करें"।',
          'जमा करने के बाद रसीद / मुहर लें। 48 से 72 घंटे में myaadhaar.uidai.gov.in पर "Bank Seeding Status" चेक करें।'
        ],
        documents: [
          'मूल आधार कार्ड एवं स्वप्रमाणित फोटोकॉपी (Aadhaar Card)',
          'बैंक पासबुक के प्रथम पृष्ठ की प्रति (Bank Passbook)',
          'भरा हुआ NPCI DBT सहमति प्रपत्र (NPCI Mandate Form)',
          'पैन कार्ड अथवा फॉर्म 60 (PAN Card / Form 60)'
        ],
        official_portal: {
          name: 'UIDAI बैंक सीडिंग स्टेटस पोर्टल (myaadhaar.uidai.gov.in)',
          url: 'https://myaadhaar.uidai.gov.in'
        },
        helpline: 'UIDAI आधार हेल्पलाइन: 1947 | PFMS हेल्पलाइन: 1800-118-111',
        application_letter: `सेवा में,
शाखा प्रबंधक महोदय,
[बैंक का नाम], [शाखा का नाम]

विषय: बचत खाते में NPCI आधार मैपर (DBT) सक्रिय करने हेतु प्रार्थना पत्र।

महोदय,
सविनय निवेदन है कि प्रार्थी का एक बचत खाता आपकी शाखा में संचालित है (खाता संख्या: [यहाँ खाता संख्या लिखें])।
सरकारी योजनाओं (डीबीटी/सब्सिडी) का लाभ प्राप्त करने हेतु मेरे खाते का NPCI सर्वर पर आधार से लिंक होना अनिवार्य है। पूर्व में आधार जमा होने के उपरांत भी DBT फ्लैग इनएक्टिव आ रहा है।

अतः श्रीमान जी से सविनय निवेदन है कि मेरे खाते को NPCI DBT मैपर पर तत्काल सक्रिय (Active) करने की कृपा करें।

संलग्नक:
1. आधार कार्ड की स्वप्रमाणित फोटोकॉपी
2. बैंक पासबुक की प्रति

प्रार्थी:
नाम: [यहाँ नाम लिखें]
खाता संख्या: [यहाँ खाता संख्या लिखें]
मोबाइल: [यहाँ मोबाइल नंबर लिखें]
दिनांक: [आज की तारीख]`,
        follow_ups: [
          'बैंक में जमा करने का आवेदन पत्र दिखाएं',
          'UIDAI पोर्टल पर स्टेटस कैसे चेक करें?',
          'साधारण KYC और DBT सीडिंग में क्या अंतर है?',
          'PFMS पोर्टल पर ट्रांजेक्शन कैसे ट्रैक करें?'
        ]
      };
    }

    return {
      identified_issue: 'DBT Payment Failure / Inactive NPCI Aadhaar-Bank Account Seeding',
      root_cause: 'There is a critical distinction between normal KYC and NPCI DBT seeding! Submitting Aadhaar for identity verification does not automatically enable government subsidy credits. The bank must specifically transmit your DBT Mandate to the National Payments Corporation of India (NPCI) mapper.',
      action_steps: [
        'Visit your bank home branch and ask for the "Aadhaar Seeding / NPCI DBT Mandate Form (Annexure I)".',
        'Mark Option (A): "I wish to receive DBT benefits in this account through NPCI mapping".',
        'Ensure the bank officer flags DBT Enabled = YES in their Core Banking Software (Finacle/BaNCS).',
        'Obtain an acknowledgment slip. Verify status after 48-72 hours on myaadhaar.uidai.gov.in.'
      ],
      documents: [
        'Original Aadhaar Card and self-attested photocopy',
        'Bank Passbook first page copy',
        'Duly filled NPCI DBT Consent Form',
        'PAN Card or Form 60'
      ],
      official_portal: {
        name: 'PFMS Public Financial Management System',
        url: 'https://pfms.nic.in'
      },
      helpline: 'UIDAI Aadhaar Helpline: 1947 | PFMS Helpline: 1800-118-111',
      application_letter: `To,
The Branch Manager,
[Bank Name], [Branch Address]

Subject: Urgent Request for NPCI Aadhaar Seeding / DBT Enablement on Savings Account.

Respected Sir/Madam,
I maintain a savings bank account with your branch bearing Account No: [Insert Account Number].
I am entitled to receive government welfare benefits under Direct Benefit Transfer (DBT); however, the payments are bouncing back because my account has not been activated on the NPCI APBS mapper.

I request you to kindly update my Aadhaar DBT Mandate in your system and transmit it to the NPCI mapper immediately.

Enclosures:
1. Self-attested copy of Aadhaar Card
2. Photocopy of Bank Passbook
3. Duly signed NPCI Mandate Form

Sincerely,
Name: [Your Name]
Account Number: [Your Account Number]
Mobile: [Your Mobile Number]
Date: [Current Date]`,
      follow_ups: [
        'Show formal application letter for Bank Manager',
        'How to verify NPCI status on UIDAI portal?',
        'Difference between Aadhaar linking vs Seeding',
        'How to track stuck payments on PFMS?'
      ]
    };
  }

  // 3. SCHOLARSHIP ISSUES (छात्रवृत्ति, NSP, फीस, कॉलेज वेरिफिकेशन)
  if (
    q.includes('scholarship') || q.includes('छात्रवृत्ति') || q.includes('student') ||
    q.includes('nsp') || q.includes('college') || q.includes('school') ||
    q.includes('fees') || q.includes('fee') || q.includes('vidyarthi') ||
    q.includes('post-matric') || q.includes('pre-matric') || q.includes('chhatravritti') ||
    q.includes('marksheet') || q.includes('hostel')
  ) {
    if (isHindi) {
      return {
        identified_issue: 'छात्रवृत्ति (Scholarship) भुगतान विलंब / कॉलेज व बायोमेट्रिक सत्यापन',
        root_cause: 'छात्रवृत्ति अटकने के प्रमुख कारण: (1) छात्र के बैंक खाते में ₹50,000 या ₹1 लाख की जनधन/नाबालिग क्रेडिट लिमिट होना, (2) कॉलेज नोडल अधिकारी द्वारा बायोमेट्रिक प्रमाणीकरण लंबित होना, या (3) आय प्रमाण पत्र 3 वर्ष से पुराना होना।',
        action_steps: [
          'National Scholarship Portal (scholarships.gov.in) पर OTR लॉगिन करके अपनी एप्लीकेशन का "Current Status" चेक करें।',
          'यदि स्टेटस "Pending at Institute Nodal Officer (INO)" है, तो अपने कॉलेज के छात्रवृत्ति प्रकोष्ठ में मूल दस्तावेजों सहित बायोमेट्रिक हाजिरी लगवाएं।',
          'सुनिश्चित करें कि छात्र का बैंक खाता केवल उसके स्वयं के नाम पर हो (संयुक्त खाता मान्य नहीं होता) और उसमें NPCI DBT एक्टिव हो।',
          'यदि बैंक खाता माइनर (नाबालिग) है और छात्र 18 वर्ष का हो चुका है, तो बैंक जाकर खाते को पूर्ण बचत खाते में अपग्रेड कराएं।'
        ],
        documents: [
          'कॉलेज का बोनाफाइड सर्टिफिकेट एवं फीस रसीद (Bonafide & Fee Receipt)',
          'गत वर्ष की मार्कशीट (Previous Year Marksheet)',
          'सक्षम अधिकारी द्वारा निर्गत वैध आय प्रमाण पत्र (Income Certificate - within 3 yrs)',
          'जाति प्रमाण पत्र (यदि लागू हो) (Caste Certificate)',
          'छात्र का आधार कार्ड एवं बैंक पासबुक (Aadhaar & Passbook)'
        ],
        official_portal: {
          name: 'राष्ट्रीय छात्रवृत्ति पोर्टल (scholarships.gov.in)',
          url: 'https://scholarships.gov.in'
        },
        helpline: 'NSP राष्ट्रीय हेल्पलाइन: 0120-6619540 | helpdesk@nsp.gov.in',
        application_letter: `सेवा में,
नोडल अधिकारी (छात्रवृत्ति प्रकोष्ठ),
[कॉलेज / संस्थान का नाम], [शहर का नाम]

विषय: राष्ट्रीय छात्रवृत्ति पोर्टल (NSP) पर बायोमेट्रिक एवं संस्थान सत्यापन पूर्ण करने बाबत।

महोदय,
सविनय निवेदन है कि प्रार्थी [अपना नाम लिखें] आपके संस्थान में [कक्षा/कोर्स का नाम, जैसे: B.Tech / B.A. द्वितीय वर्ष] का नियमित छात्र हूँ।
मैंने राष्ट्रीय छात्रवृत्ति पोर्टल (NSP) पर पोस्ट-मैट्रिक छात्रवृत्ति हेतु ऑनलाइन आवेदन किया है (आवेदन संदर्भ संख्या: [NSP Application ID])। 
पोर्टल पर वर्तमान स्थिति में संस्थान स्तर पर सत्यापन लंबित प्रदर्शित हो रहा है।

अतः श्रीमान जी से निवेदन है कि मेरे अभिलेखों की जांच कर संस्थान स्तर पर मेरा बायोमेट्रिक प्रमाणीकरण एवं छात्रवृत्ति सत्यापन अनुमोदित करने की कृपा करें।

संलग्नक:
1. NSP ऑनलाइन आवेदन पत्र की प्रति
2. चालू सत्र की फीस रसीद एवं बोनाफाइड
3. गत वर्ष की अंकतालिका
4. आय एवं जाति प्रमाण पत्र की प्रति

प्रार्थी:
नाम: [अपना नाम लिखें]
अनुक्रमांक (Roll No): [रोल नंबर]
मोबाइल: [मोबाइल नंबर]`,
        follow_ups: [
          'कॉलेज नोडल अधिकारी के लिए प्रार्थना पत्र दिखाएं',
          'छात्रवृत्ति के लिए बैंक खाते की कौन सी लिमिट हटवानी पड़ती है?',
          'NSP पोर्टल पर OTR रजिस्ट्रेशन कैसे करें?',
          'हेल्पलाइन से शिकायत कैसे दर्ज कराएं?'
        ]
      };
    }

    return {
      identified_issue: 'Scholarship Disbursal Delay / Institute Level Biometric Verification',
      root_cause: 'Scholarships fail to credit primarily due to: (1) Pending Institute/District Nodal Officer biometric authentication, (2) Student holding a minor/PMJDY bank account with a restrictive deposit cap (Rs 50k), or (3) Mismatch between Aadhaar name and Marksheet name.',
      action_steps: [
        'Log in to the National Scholarship Portal (scholarships.gov.in) using your OTR credentials and check "Application Status".',
        'If pending at Institute level, visit your college scholarship nodal officer with original documents to complete biometric verification.',
        'Ensure the bank account is solely in the student\'s name (joint accounts are rejected for DBT).',
        'If the student turned 18, visit the bank branch with KYC documents to convert the minor savings account to a regular account.'
      ],
      documents: [
        'Institute Bonafide Certificate & Fee Receipt',
        'Previous qualifying examination marksheet',
        'Valid Income Certificate issued by competent revenue authority',
        'Caste Certificate (if applicable)',
        'Student\'s Aadhaar Card and bank passbook'
      ],
      official_portal: {
        name: 'National Scholarship Portal (NSP)',
        url: 'https://scholarships.gov.in'
      },
      helpline: 'NSP Helpdesk: 0120-6619540 | helpdesk@nsp.gov.in',
      application_letter: `To,
The Nodal Officer (Scholarships),
[Name of College / University], [City]

Subject: Request for Institute-Level Verification and Biometric Authentication on NSP.

Respected Sir/Madam,
I am a bona fide student of [Your Course, e.g. B.Tech 2nd Year / B.Sc 1st Year] at your esteemed institution, holding Roll Number: [Your Roll Number].
I have submitted my application for the Post-Matric Scholarship on the National Scholarship Portal under Application ID: [Insert NSP Application ID].

The portal indicates that verification is currently pending at the Institute level. I have attached all required academic and income credentials for your kind perusal.

I respectfully request you to kindly verify my application and complete the biometric authorization on the portal at the earliest.

Enclosures:
1. Copy of NSP Application Form
2. Current Year Fee Receipt & Identity Card copy
3. Previous Year Academic Marksheet
4. Income and Caste Certificate copies

Yours faithfully,
Name: [Your Name]
Roll Number: [Your Roll Number]
Mobile Number: [Your Mobile Number]`,
      follow_ups: [
        'Show letter format for College Nodal Officer',
        'How to upgrade student bank account limit?',
        'How to complete NSP biometric authentication?',
        'Documents required for state scholarship'
      ]
    };
  }

  // 4. PENSION & JEEVAN PRAMAAN (पेंशन बंद होना, वृद्धा/विधवा पेंशन, जीवन प्रमाण)
  if (
    q.includes('pension') || q.includes('पेंशन') || q.includes('bujurg') ||
    q.includes('vriddha') || q.includes('vidhwa') || q.includes('widow') ||
    q.includes('senior citizen') || q.includes('jeevan pramaan') || q.includes('dlc') ||
    q.includes('life certificate') || q.includes('बुजुर्ग') || q.includes('वृद्धा') ||
    q.includes('दिव्यांग') || q.includes('disability')
  ) {
    if (isHindi) {
      return {
        identified_issue: 'पेंशन बंद होना / वार्षिक जीवन प्रमाण पत्र (Jeevan Pramaan DLC) नवीनीकरण',
        root_cause: 'मासिक सामाजिक सुरक्षा पेंशन (वृद्धावस्था, विधवा या दिव्यांग) बंद होने का 90% कारण वार्षिक जीवन प्रमाण पत्र (Digital Life Certificate) जमा न होना होता है। इसके अतिरिक्त बैंक खाता dormant (निष्क्रिय) हो जाने पर भी पेंशन रुक जाती है।',
        action_steps: [
          'अपने स्मार्टफोन पर "AadhaarFaceRD" और "Jeevan Pramaan" मोबाइल ऐप डाउनलोड करके घर बैठे चेहरे के स्कैन (Face Authentication) से जीवन प्रमाण पत्र जमा करें।',
          'यदि स्मार्टफोन में असुविधा हो, तो नजदीकी CSC केंद्र, इंडिया पोस्ट पेमेंट्स बैंक (डाकिया द्वारा घर पर) या अपनी बैंक शाखा में जाकर बायोमेट्रिक फिंगरप्रिंट से DLC बनवाएं।',
          'जीवन प्रमाण पत्र जमा करने के बाद जनरेट हुआ "Pramaan ID" सुरक्षित रखें।',
          'यदि जीवन प्रमाण पत्र जमा होने के बाद भी पेंशन न आए, तो जिला समाज कल्याण अधिकारी कार्यालय में PPO नंबर और बैंक पासबुक लेकर संपर्क करें।'
        ],
        documents: [
          'पेंशनभोगी का आधार कार्ड (Aadhaar Card)',
          'पीपीओ नंबर (Pension Payment Order - PPO Number)',
          'पेंशन खाता बैंक पासबुक (Pension Bank Passbook)',
          'सक्रिय मोबाइल नंबर (Active Mobile for OTP)'
        ],
        official_portal: {
          name: 'जीवन प्रमाण राष्ट्रीय पोर्टल (jeevanpramaan.gov.in)',
          url: 'https://jeevanpramaan.gov.in'
        },
        helpline: 'NSAP राष्ट्रीय सामाजिक सुरक्षा हेल्पलाइन: 1800-180-5111',
        application_letter: `सेवा में,
जिला समाज कल्याण अधिकारी महोदय,
[जिले का नाम], [राज्य का नाम]

विषय: रोकी गई वृद्धावस्था/विधवा/दिव्यांग पेंशन पुनः चालू कराने बाबत।

महोदय,
सविनय निवेदन है कि प्रार्थी/प्रार्थिया [अपना नाम लिखें], आयु [उम्र] वर्ष, निवासी [पूरा पता] का/की हूँ।
मुझे पूर्व में नियमित रूप से सामाजिक सुरक्षा पेंशन प्राप्त हो रही थी (पेंशन पंजीकरण / PPO संख्या: [PPO नंबर])। विगत [महीनों की संख्या, जैसे: 3 माह] से मेरी पेंशन बैंक खाते में आना बंद हो गई है।

मैंने अपना वार्षिक डिजिटल जीवन प्रमाण पत्र (Pramaan ID: [प्रमाण आईडी]) सफलतापूर्वक जमा कर दिया है तथा बैंक खाता भी सक्रिय है।

अतः श्रीमान जी से करबद्ध प्रार्थना है कि मेरी पेंशन संबंधी रुकावट को दूर कर बकाया पेंशन राशि खाते में प्रेषित कराने की कृपा करें।

संलग्नक:
1. जीवन प्रमाण पत्र पावती की प्रति
2. आधार कार्ड की छायाप्रति
3. बैंक पासबुक की छायाप्रति

प्रार्थी/प्रार्थिया:
नाम: [अपना नाम लिखें]
PPO संख्या: [PPO नंबर]
मोबाइल: [मोबाइल नंबर]`,
        follow_ups: [
          'मोबाइल से घर बैठे फेस ऐप द्वारा जीवन प्रमाण पत्र कैसे भरें?',
          'डाकिये को घर पर बुलाकर जीवन प्रमाण पत्र कैसे बनवाएं?',
          'समाज कल्याण अधिकारी के लिए आवेदन पत्र दिखाएं',
          'पेंशन का ऑनलाइन स्टेटस कैसे चेक करें?'
        ]
      };
    }

    return {
      identified_issue: 'Pension Stopped / Annual Digital Life Certificate (Jeevan Pramaan) Renewal',
      root_cause: 'Over 90% of pension halts (Old Age, Widow, or Disability) occur due to lapse of the annual Digital Life Certificate (DLC) submission. Accounts also freeze if marked dormant due to inactivity.',
      action_steps: [
        'Generate your Digital Life Certificate right from home using the "AadhaarFaceRD" and "Jeevan Pramaan" Android apps via face scan.',
        'Alternatively, visit your nearest CSC center, local Post Office (India Post Payments Bank postman visits home), or pension-disbursing bank branch.',
        'Retain the 10-digit Pramaan ID SMS sent to your registered mobile number.',
        'If pension remains uncredited after 15 days, submit a representation to the District Social Welfare Office along with your PPO and passbook.'
      ],
      documents: [
        'Pensioner\'s Aadhaar Card',
        'PPO Number (Pension Payment Order)',
        'Pension Bank Account Passbook',
        'Registered Mobile Number for OTP'
      ],
      official_portal: {
        name: 'Jeevan Pramaan Official Portal',
        url: 'https://jeevanpramaan.gov.in'
      },
      helpline: 'National Social Assistance Programme (NSAP): 1800-180-5111',
      application_letter: `To,
The District Social Welfare Officer,
[District Name], [State Name]

Subject: Request for Restoration of Discontinued Social Welfare Pension.

Respected Sir/Madam,
I am a registered pensioner under the Social Security Pension Scheme holding PPO Number: [Insert PPO Number].
I have been receiving pension in my savings account at [Bank Name, Account No: ...]. However, my monthly pension has been discontinued for the past [Number of Months] months.

I have submitted my annual Digital Life Certificate (Jeevan Pramaan ID: [Insert Pramaan ID]) and my bank account is fully active.

I humbly request your good office to investigate the discrepancy and restore the disbursement of my pension arrears at the earliest.

Enclosures:
1. Digital Life Certificate acknowledgment receipt
2. Copy of Aadhaar Card
3. Copy of Bank Passbook

Yours faithfully,
Name: [Your Name]
PPO Number: [Your PPO Number]
Mobile Number: [Your Mobile Number]`,
      follow_ups: [
        'How to submit Life Certificate using mobile face scan?',
        'How to book a postman visit for biometric verification?',
        'Show letter format for Social Welfare Officer',
        'How to track monthly pension status online?'
      ]
    };
  }

  // 5. AYUSHMAN BHARAT & HEALTH (आयुष्मान कार्ड, ₹5 लाख मुफ्त इलाज, अस्पताल)
  if (
    q.includes('ayushman') || q.includes('आयुष्मान') || q.includes('card') ||
    q.includes('hospital') || q.includes('अस्पताल') || q.includes('इलाज') ||
    q.includes('ilaj') || q.includes('doctor') || q.includes('swasthya') ||
    q.includes('operation') || q.includes('5 lakh') || q.includes('गोल्डन कार्ड') ||
    q.includes('treatment') || q.includes('health card') || q.includes('bimar')
  ) {
    if (isHindi) {
      return {
        identified_issue: 'आयुष्मान भारत कार्ड बनवाना / ₹5 लाख मुफ्त अस्पताल इलाज सुविधा',
        root_cause: 'आयुष्मान भारत (PM-JAY) योजना के तहत प्रत्येक पात्र परिवार को प्रति वर्ष ₹5 लाख तक का कैशलेस इलाज मिलता है। समस्या तब आती है जब परिवार का नाम SECC/राशन कार्ड डेटाबेस में न हो या अस्पताल का आयुष्मान मित्र इलाज से इंकार करे।',
        action_steps: [
          'beneficiary.nha.gov.in पोर्टल या Ayushman App पर जाकर अपना राशन कार्ड नंबर या आधार नंबर डालकर परिवार की पात्रता जांचें।',
          'यदि नाम सूची में है, तो आधार e-KYC करके तुरंत अपना आयुष्मान गोल्डन कार्ड (PVC/PDF) डाउनलोड करें।',
          'किसी भी सरकारी अस्पताल या सूचीबद्ध निजी अस्पताल में जाते समय आयुष्मान कार्ड और आधार कार्ड साथ रखें।',
          'अस्पताल में "आयुष्मान मित्र हेल्पडेस्क" पर संपर्क करें। यदि कोई अस्पताल पैसे मांगे या मना करे, तो तुरंत 14555 पर शिकायत दर्ज कराएं।'
        ],
        documents: [
          'परिवार का राशन कार्ड / NFSA पर्ची (Ration Card)',
          'परिवार के सभी सदस्यों का आधार कार्ड (Aadhaar Card of all members)',
          'आधार से लिंक सक्रिय मोबाइल नंबर (Mobile Number for OTP)'
        ],
        official_portal: {
          name: 'राष्ट्रीय स्वास्थ्य प्राधिकरण (beneficiary.nha.gov.in)',
          url: 'https://beneficiary.nha.gov.in'
        },
        helpline: 'आयुष्मान भारत राष्ट्रीय टोल-फ्री हेल्पलाइन: 14555 / 1800-111-565',
        application_letter: `सेवा में,
मुख्य चिकित्सा अधिकारी (CMO) महोदय,
[जिला चिकित्सालय का नाम], [जिले का नाम]

विषय: आयुष्मान भारत (PM-JAY) योजना के अंतर्गत नाम जोड़ने / कार्ड जारी करने बाबत।

महोदय,
सविनय निवेदन है कि प्रार्थी [अपना नाम लिखें] एक अत्यंत निर्धन परिवार से संबंध रखता है (राशन कार्ड संख्या: [राशन कार्ड नंबर])। 
हमारे परिवार में गंभीर बीमारी के इलाज हेतु आर्थिक साधन उपलब्ध नहीं हैं। सरकारी पात्रता मानदंडों के अनुसार हम आयुष्मान भारत योजना के अंतर्गत ₹5 लाख के स्वास्थ्य बीमा हेतु पात्र हैं, परंतु पोर्टल पर परिवार के सदस्यों का कार्ड जनरेट नहीं हो पा रहा है।

अतः श्रीमान जी से सविनय निवेदन है कि हमारे परिवार का सत्यापन कर आयुष्मान कार्ड जारी कराने की कृपा करें।

संलग्नक:
1. खाद्य सुरक्षा राशन कार्ड की प्रति
2. परिवार के सभी सदस्यों के आधार कार्ड

प्रार्थी:
नाम: [अपना नाम लिखें]
पता: [पूरा पता लिखें]
मोबाइल: [मोबाइल नंबर]`,
        follow_ups: [
          'मोबाइल से आयुष्मान कार्ड कैसे डाउनलोड करें?',
          'मेरे शहर के किन प्राइवेट अस्पतालों में मुफ्त इलाज होता है?',
          'यदि अस्पताल पैसा मांगे तो 14555 पर शिकायत कैसे करें?',
          '70 वर्ष से अधिक बुजुर्गों के लिए आयुष्मान कार्ड कैसे बनेगा?'
        ]
      };
    }

    return {
      identified_issue: 'Ayushman Bharat Card Generation / Rs 5 Lakh Cashless Hospital Treatment',
      root_cause: 'Under Ayushman Bharat (PM-JAY), eligible families are entitled to Rs 5 Lakh cashless treatment annually. Citizens often face hurdles when their names are unverified in the SECC/NFSA database or when empanelled hospitals fail to register their claim through the Ayushman Mitra desk.',
      action_steps: [
        'Visit beneficiary.nha.gov.in or download the Ayushman App to verify family eligibility using your Ration Card or Aadhaar number.',
        'If eligible, complete self-eKYC using Aadhaar OTP or facial recognition to download your Ayushman Card immediately.',
        'Carry your Ayushman Card along with your original Aadhaar Card to any empanelled public or private hospital.',
        'Approach the "Ayushman Mitra" desk in the hospital for zero-cost pre-authorization. If any hospital demands cash, report immediately to 14555.'
      ],
      documents: [
        'Family Ration Card / NFSA database receipt',
        'Aadhaar Card of each beneficiary family member',
        'Aadhaar-registered active mobile number'
      ],
      official_portal: {
        name: 'National Health Authority Beneficiary Portal',
        url: 'https://beneficiary.nha.gov.in'
      },
      helpline: 'National Ayushman Helpline: 14555 / 1800-111-565',
      application_letter: `To,
The Chief Medical Officer (CMO),
District Health Department, [District Name]

Subject: Request for Verification and Issuance of Ayushman Bharat (PM-JAY) Golden Card.

Respected Sir/Madam,
I, [Your Name], residing at [Your Address], belong to an economically weaker household (Ration Card No: [Insert Ration Card Number]).
Our family is eligible for cashless medical coverage under the Ayushman Bharat PM-JAY scheme; however, our records require administrative verification on the portal to generate the Golden Card.

In view of urgent healthcare requirements, I kindly request your office to verify our household records and facilitate the issuance of our Ayushman Cards.

Enclosures:
1. Photocopy of Ration Card
2. Copies of Aadhaar Cards of all family members

Yours sincerely,
Name: [Your Name]
Address: [Your Address]
Mobile Number: [Your Mobile Number]`,
      follow_ups: [
        'How to search empanelled hospitals in my district?',
        'How to generate Ayushman card for senior citizens (70+)?',
        'How to lodge a grievance if a hospital denies treatment?',
        'Download Ayushman card on mobile'
      ]
    };
  }

  // 6. PMAY HOUSING (प्रधानमंत्री आवास योजना, पक्का मकान, जियो-टैगिंग)
  if (
    q.includes('awas') || q.includes('आवास') || q.includes('makan') ||
    q.includes('मकान') || q.includes('ghar') || q.includes('pucca') ||
    q.includes('pmay') || q.includes('house') || q.includes('housing') ||
    q.includes('jhopdi') || q.includes('छत') || q.includes('bdo')
  ) {
    if (isHindi) {
      return {
        identified_issue: 'प्रधानमंत्री आवास योजना (PMAY) पक्का मकान सहायता / जियो-टैगिंग एवं किस्त',
        root_cause: 'आवास योजना में ₹1.20 लाख (ग्रामीण) या ₹2.50 लाख (शहरी) की किस्त रुकने का मुख्य कारण ग्राम विकास अधिकारी द्वारा मौके पर जियो-टैगिंग (AwaasApp से फोटो अपलोड) न होना या मनरेगा जॉब कार्ड लिंक न होना होता है।',
        action_steps: [
          'pmayg.nic.in पर जाकर "Stakeholders -> IAY/PMAYG Beneficiary" में अपना पंजीकरण नंबर डालकर FTO (Fund Transfer Order) और जियो-टैगिंग की स्थिति देखें।',
          'अपने ग्राम सचिव / पंचायत अधिकारी से कहें कि वे मौके पर आकर AwaasApp मोबाइल एप्लिकेशन से प्लिंथ/लिंटेल स्तर की फोटो अपलोड (Geo-tagging) करें।',
          'सुनिश्चित करें कि लाभार्थी का मनरेगा जॉब कार्ड पंचायत में पंजीकृत है ताकि 90 दिन की अकुशल मजदूरी (लगभग ₹20,000) भी सीधे खाते में मिले।',
          'यदि पंचायत स्तर पर सुनवाई न हो, तो ब्लॉक विकास अधिकारी (BDO) कार्यालय में लिखित प्रार्थना पत्र प्रस्तुत करें।'
        ],
        documents: [
          'आधार कार्ड (पति एवं पत्नी दोनों का) (Aadhaar Cards)',
          'जमीन का पट्टा / कच्चा मकान स्वामित्व प्रमाण (Land Possession / Patta)',
          'मनरेगा जॉब कार्ड (MGNREGA Job Card)',
          'बैंक पासबुक की प्रति (Bank Passbook with active DBT)'
        ],
        official_portal: {
          name: 'प्रधानमंत्री आवास योजना ग्रामीण पोर्टल (pmayg.nic.in)',
          url: 'https://pmayg.nic.in'
        },
        helpline: 'PMAY-G राष्ट्रीय टोल-फ्री हेल्पलाइन: 1800-11-6446',
        application_letter: `सेवा में,
खंड विकास अधिकारी (BDO) महोदय,
विकास खंड कार्यालय, [ब्लॉक का नाम], [जिले का नाम]

विषय: प्रधानमंत्री आवास योजना (ग्रामीण) की अगली किस्त जारी करने एवं जियो-टैगिंग कराने बाबत।

महोदय,
सविनय निवेदन है कि प्रार्थी [अपना नाम लिखें], ग्राम पंचायत [ग्राम का नाम], विकास खंड [ब्लॉक का नाम] का स्थायी निवासी है।
मुझे प्रधानमंत्री आवास योजना (ग्रामीण) के अंतर्गत आवास स्वीकृत हुआ था (पंजीकरण संख्या: [PMAY Registration ID])। मैंने अपने पक्के मकान का [स्तर लिखें, जैसे: नींव/प्लिंथ स्तर] निर्माण कार्य पूर्ण कर लिया है।

विगत काफी समय से ग्राम विकास अधिकारी द्वारा आवास ऐप पर जियो-टैगिंग न किए जाने के कारण मेरी अगली किस्त जारी नहीं हो सकी है।

अतः श्रीमान जी से निवेदन है कि मौके पर निरीक्षण कराकर जियो-टैगिंग करवाने एवं अगली निर्माण किस्त मेरे खाते में प्रेषित कराने की कृपा करें।

संलग्नक:
1. PMAY स्वीकृति पत्र की प्रति
2. निर्माणाधीन मकान की फोटो
3. बैंक पासबुक एवं आधार कार्ड की प्रति

प्रार्थी:
नाम: [अपना नाम लिखें]
ग्राम: [गाँव का नाम]
मोबाइल: [मोबाइल नंबर]`,
        follow_ups: [
          'आवास योजना की नई लाभार्थी सूची में नाम कैसे देखें?',
          'BDO कार्यालय के लिए आवेदन पत्र दिखाएं',
          'जियो-टैगिंग (AwaasApp) की प्रक्रिया क्या है?',
          'आवास के साथ मनरेगा मजदूरी का पैसा कैसे मिलता है?'
        ]
      };
    }

    return {
      identified_issue: 'PMAY Housing Construction Grant / Inspection Geo-tagging & Installment Release',
      root_cause: 'Construction grants (Rs 1.20 Lakh Rural / Rs 2.50 Lakh Urban) halt primarily when the local Panchayat Secretary / Gram Sevak delays uploading physical progress photos via the official AwaasApp (geo-tagging), or when the beneficiary\'s MGNREGA job card mapping is pending.',
      action_steps: [
        'Check your FTO status on pmayg.nic.in under "Stakeholders -> IAY/PMAYG Beneficiary" using your Registration Number.',
        'Contact your Village Development Officer / Gram Sevak to physically inspect the plinth or lintel construction and capture real-time geo-tagged photos.',
        'Ensure your MGNREGA Job Card is mapped to receive 90 to 95 days of unskilled construction wages (~Rs 20,000) directly into your account.',
        'If the block officials delay inspection without justification, submit a formal representation to the Block Development Officer (BDO).'
      ],
      documents: [
        'Aadhaar Card of both husband and wife',
        'Land possession certificate / Gram Panchayat Patta',
        'MGNREGA Job Card copy',
        'Aadhaar-seeded Bank Passbook photocopy'
      ],
      official_portal: {
        name: 'Pradhan Mantri Awaas Yojana Gramin (pmayg.nic.in)',
        url: 'https://pmayg.nic.in'
      },
      helpline: 'PMAY-G Toll-Free Helpline: 1800-11-6446',
      application_letter: `To,
The Block Development Officer (BDO),
Block Development Office, [Block Name], [District Name]

Subject: Request for On-Site Geo-Tagging and Release of PMAY-G Construction Installment.

Respected Sir/Madam,
I am a sanctioned beneficiary under Pradhan Mantri Awaas Yojana - Gramin, holding Registration ID: [Insert PMAY ID], residing in Village [Village Name].
I have completed the construction work up to the [Specify stage, e.g. Plinth / Lintel] level as per the prescribed government guidelines.

The subsequent installment has not been released due to pending photo geo-tagging on the AwaasApp portal by the field officer.

I kindly request your office to direct the field supervisor for an immediate site inspection and facilitate the disbursal of the construction installment.

Enclosures:
1. Copy of PMAY Sanction Letter
2. Recent photograph of construction work
3. Copy of Bank Passbook and Aadhaar Card

Yours faithfully,
Name: [Your Name]
Village: [Village Name]
Mobile Number: [Your Mobile Number]`,
      follow_ups: [
        'Show letter format for Block Development Officer (BDO)',
        'How to search your name in PMAY housing priority list?',
        'How to link MGNREGA job card with PMAY house?',
        'What to do if local officers demand illegal money?'
      ]
    };
  }

  // 7. LOANS & BUSINESS (मुद्रा लोन, स्वनिधि, बिना गारंटी लोन, दुकान, व्यापार)
  if (
    q.includes('loan') || q.includes('ऋण') || q.includes('mudra') ||
    q.includes('मुद्रा') || q.includes('svanidhi') || q.includes('स्वनिधि') ||
    q.includes('business') || q.includes('व्यापार') || q.includes('dukan') ||
    q.includes('दुकान') || q.includes('collateral') || q.includes('thela') ||
    q.includes('vendor') || q.includes('guarantee') || q.includes('कर्ज')
  ) {
    if (isHindi) {
      return {
        identified_issue: 'बिना गारंटी सरकारी व्यापार लोन (Mudra / SVANidhi) / बैंक द्वारा गारंटी मांगना',
        root_cause: 'आरबीआई के स्पष्ट नियमों के अनुसार प्रधानमंत्री मुद्रा योजना (शिशु ₹50,000, किशोर ₹5 लाख, तरुण ₹10 लाख) तथा पीएम स्वनिधि (स्ट्रीट वेंडर ₹10,000 - ₹50,000) में किसी भी प्रकार की संपत्ति गिरवी (Collateral) या थर्ड-पार्टी गारंटी मांगना गैरकानूनी है।',
        action_steps: [
          'बैंक शाखा के चक्कर काटने के बजाय केंद्र सरकार के "JanSamarth" पोर्टल (jansamarth.in) या "UdyamiMitra" पोर्टल पर ऑनलाइन आवेदन करें।',
          'सूक्ष्म एवं लघु उद्योग मंत्रालय की वेबसाइट (udyamregistration.gov.in) पर 5 मिनट में अपना निःशुल्क "उद्यम आधार" (MSME Certificate) बनाएं।',
          'एक साधारण 1-पेज का प्रोजेक्ट प्रपोजल तैयार करें जिसमें दुकान/व्यवसाय की अनुमानित बिक्री और लाभ का विवरण हो।',
          'यदि बैंक प्रबंधक गारंटी मांगकर मना करे, तो उन्हें RBI मास्टर सर्कुलर (Master Direction - Lending to Micro, Small & Medium Enterprises) का संदर्भ दें।'
        ],
        documents: [
          'आवेदक का आधार कार्ड एवं पैन कार्ड (Aadhaar & PAN Card)',
          'व्यवसाय स्थल का प्रमाण / बिजली बिल / किरायानामा (Business Address Proof)',
          'निःशुल्क एमएसएमई उद्यम पंजीकरण प्रमाण पत्र (Udyam MSME Certificate)',
          'विगत 6 माह का बैंक खाता विवरण (6 Months Bank Statement)'
        ],
        official_portal: {
          name: 'जनसमर्थ राष्ट्रीय ऋण पोर्टल (jansamarth.in)',
          url: 'https://www.jansamarth.in'
        },
        helpline: 'मुद्रा राष्ट्रीय ऋण हेल्पलाइन: 1800-180-1111 / 1800-11-0001',
        application_letter: `सेवा में,
शाखा प्रबंधक महोदय,
[बैंक का नाम], [शाखा का नाम]

विषय: प्रधानमंत्री मुद्रा योजना (शिशु/किशोर श्रेणी) के तहत बिना गारंटी ऋण स्वीकृति बाबत।

महोदय,
सविनय निवेदन है कि प्रार्थी [अपना नाम लिखें] एक छोटे व्यवसाय/दुकान [व्यवसाय का नाम, जैसे: किराना दुकान/कपड़ा सिलाई] का संचालन करता है। 
मैं अपने व्यवसाय के विस्तार हेतु प्रधानमंत्री मुद्रा योजना के अंतर्गत [ऋण राशि, जैसे: ₹50,000 या ₹2,00,000] का ऋण प्राप्त करना चाहता हूँ।

भारतीय रिज़र्व बैंक (RBI) के मास्टर सर्कुलर के अनुसार ₹10 लाख तक के मुद्रा ऋण हेतु किसी भी संपार्श्विक प्रतिभूति (Collateral Security) की आवश्यकता नहीं होती है।

अतः श्रीमान जी से सविनय निवेदन है कि संलग्न प्रोजेक्ट रिपोर्ट एवं केवाईसी अभिलेखों के आधार पर मेरा ऋण आवेदन स्वीकृत करने की कृपा करें।

संलग्नक:
1. आधार कार्ड एवं पैन कार्ड की प्रति
2. उद्यम रजिस्ट्रेशन प्रमाण पत्र
3. प्रोजेक्ट विवरण एवं 6 माह का बैंक स्टेटमेंट

प्रार्थी:
नाम: [अपना नाम लिखें]
व्यवसाय का नाम: [दुकान का नाम]
मोबाइल: [मोबाइल नंबर]`,
        follow_ups: [
          'मुद्रा लोन के लिए बैंक मैनेजर को देने वाला पत्र दिखाएं',
          'घर बैठे 5 मिनट में फ्री उद्यम रजिस्ट्रेशन कैसे करें?',
          'स्ट्रीट वेंडर्स के लिए पीएम स्वनिधि लोन कैसे मिलेगा?',
          'यदि बैंक लोन देने से मना करे तो RBI लोकपाल में शिकायत कैसे करें?'
        ]
      };
    }

    return {
      identified_issue: 'Collateral-Free Business Credit (PM Mudra / PM SVANidhi) / Bank Refusal',
      root_cause: 'Under Reserve Bank of India (RBI) MSME guidelines, demanding collateral security or third-party guarantees for loans up to Rs 10 Lakh under Pradhan Mantri Mudra Yojana (PMMY) or PM SVANidhi is strictly prohibited. Banks must rely on the CGTMSE credit guarantee cover.',
      action_steps: [
        'Apply directly through the unified government JanSamarth portal (jansamarth.in) to bypass branch-level gatekeeping.',
        'Generate your free official MSME Udyam Registration Certificate in 5 minutes at udyamregistration.gov.in.',
        'Prepare a concise 1-page business income and sales projection report.',
        'If a branch demands immovable property or collateral, cite RBI Master Direction on Lending to Micro, Small and Medium Enterprises.'
      ],
      documents: [
        'Aadhaar Card and PAN Card of applicant',
        'Business operating premises proof / Electricity bill / Rent agreement',
        'Free Udyam MSME Registration Certificate',
        '6 months bank account operational statement'
      ],
      official_portal: {
        name: 'JanSamarth Unified National Credit Portal',
        url: 'https://www.jansamarth.in'
      },
      helpline: 'National Mudra Helpline: 1800-180-1111 / 1800-11-0001',
      application_letter: `To,
The Branch Manager,
[Name of Bank], [Branch Name]

Subject: Application for Collateral-Free Business Loan under Pradhan Mantri Mudra Yojana.

Respected Sir/Madam,
I am operating a micro enterprise under the trade name [Name of Your Business, e.g. Grocery Store / Tailoring Unit], holding Udyam Registration No: [Insert Udyam Number].
I wish to apply for working capital / machinery credit of Rs [Insert Amount, e.g. Rs 1,00,000] under the [Shishu / Kishore] category of Pradhan Mantri Mudra Yojana (PMMY).

As per Reserve Bank of India (RBI) Master Guidelines, loans up to Rs 10 Lakh to micro-enterprises are sanctioned without collateral security under the Credit Guarantee Fund for Micro Units (CGFMU).

I kindly submit my project proposal and financial credentials for your favorable consideration.

Enclosures:
1. Aadhaar Card and PAN Card copies
2. MSME Udyam Registration Certificate
3. 6 Months Bank Statement & Business Projection Sheet

Yours faithfully,
Name: [Your Name]
Business Name: [Business Name]
Mobile Number: [Your Mobile Number]`,
      follow_ups: [
        'Show application letter format for Bank Manager',
        'How to register free MSME Udyam certificate online?',
        'How does PM SVANidhi loan work for street vendors?',
        'How to file complaint with Banking Ombudsman for loan denial?'
      ]
    };
  }

  // 8. RATION CARD & FOOD SECURITY (राशन कार्ड, नया नाम जोड़ना, कोटेदार, डीलर)
  if (
    q.includes('ration') || q.includes('राशन') || q.includes('rashan') ||
    q.includes('kotedar') || q.includes('nfsa') || q.includes('dealer') ||
    q.includes('chawal') || q.includes('gehu') || q.includes('खाद्य') ||
    q.includes('name add') || q.includes('नाम जोड़ना') || q.includes('food')
  ) {
    if (isHindi) {
      return {
        identified_issue: 'राशन कार्ड में नया नाम जोड़ना / कोटेदार द्वारा राशन कम देना अथवा मना करना',
        root_cause: 'राशन कार्ड में परिवार के नए सदस्य (नवविवाहिता या बच्चे) का नाम RCMS पोर्टल पर आधार सत्यापन न होने से नहीं जुड़ पाता। इसके अतिरिक्त सभी सदस्यों का बायोमेट्रिक e-KYC (e-PoS मशीन पर) लंबित होने पर राशन बंद हो सकता है।',
        action_steps: [
          'अपने राज्य के खाद्य पोर्टल (जैसे: fcs.up.gov.in) अथवा नजदीकी CSC/जनसेवा केंद्र पर जाकर "राशन कार्ड संशोधन / सदस्य जोड़ें" फॉर्म भरें।',
          'परिवार के सभी सदस्यों का आधार कार्ड लेकर राशन डीलर (कोटेदार) की e-PoS मशीन पर बायोमेट्रिक फिंगरप्रिंट लगाकर e-KYC पूरा करें।',
          'यदि राशन डीलर निर्धारित मात्रा से कम अनाज दे या पैसे मांगे, तो सीधे राष्ट्रीय खाद्य सुरक्षा हेल्पलाइन 1967 पर कॉल करें।',
          'वन नेशन वन राशन कार्ड (ONORC) के तहत आप देश के किसी भी राज्य में किसी भी सरकारी राशन दुकान से अपना राशन ले सकते हैं।'
        ],
        documents: [
          'मूल राशन कार्ड की प्रति (Ration Card Copy)',
          'नए जोड़े जाने वाले सदस्य का आधार कार्ड (New Member Aadhaar)',
          'बच्चे का जन्म प्रमाण पत्र अथवा पत्नी का विवाह प्रमाण पत्र (Birth/Marriage Certificate)',
          'परिवार के मुखिया का आधार कार्ड एवं फोटो (Head of Family Aadhaar)'
        ],
        official_portal: {
          name: 'राष्ट्रीय खाद्य सुरक्षा पोर्टल (nfsa.gov.in)',
          url: 'https://nfsa.gov.in'
        },
        helpline: 'राष्ट्रीय खाद्य सुरक्षा टोल-फ्री हेल्पलाइन: 1967 / 1800-180-2087',
        application_letter: `सेवा में,
जिला पूर्ति अधिकारी (DSO) महोदय,
खाद्य एवं नागरिक आपूर्ति विभाग, [जिले का नाम]

विषय: खाद्य सुरक्षा राशन कार्ड में परिवार के नए सदस्य का नाम सम्मिलित करने बाबत।

महोदय,
सविनय निवेदन है कि प्रार्थी [अपना नाम लिखें], राशन कार्ड संख्या [राशन कार्ड नंबर] का धारक है।
मेरे परिवार में [सदस्य का नाम, संबंध: जैसे पत्नी / पुत्र / पुत्री] का नाम वर्तमान राशन कार्ड में दर्ज नहीं है, जिस कारण उन्हें खाद्यान्न कोटा प्राप्त नहीं हो पा रहा है।

सदस्य का आधार कार्ड एवं आवश्यक प्रमाण पत्र संलग्न कर रहा हूँ।

अतः श्रीमान जी से विनम्र प्रार्थना है कि हमारे राशन कार्ड में उक्त सदस्य का नाम जोड़ने की कृपा करें।

संलग्नक:
1. मूल राशन कार्ड की छायाप्रति
2. नए सदस्य का आधार कार्ड
3. जन्म प्रमाण पत्र / विवाह प्रमाण पत्र की छायाप्रति

प्रार्थी:
नाम: [अपना नाम लिखें]
राशन कार्ड संख्या: [राशन कार्ड नंबर]
मोबाइल: [मोबाइल नंबर]`,
        follow_ups: [
          'राशन कार्ड में बच्चे या बहू का नाम ऑनलाइन कैसे जोड़ें?',
          'कोटेदार राशन कम दे तो 1967 पर शिकायत कैसे करें?',
          'DSO अधिकारी के लिए प्रार्थना पत्र दिखाएं',
          'वन नेशन वन राशन कार्ड (ONORC) से दूसरे शहर में राशन कैसे लें?'
        ]
      };
    }

    return {
      identified_issue: 'Ration Card Member Addition / PDS Dealer Malpractice or Ration Denial',
      root_cause: 'Family members (newborn child or bride) remain excluded when Aadhaar details are not linked in the State RCMS database. Rations may also be paused if family members fail to complete biometric e-KYC on the dealer\'s e-PoS device.',
      action_steps: [
        'Apply for "Ration Card Member Addition" on your State Food Department Portal or via any Common Service Center (CSC).',
        'Have all enrolled family members visit the Fair Price Shop dealer to complete e-KYC on the electronic Point of Sale (e-PoS) terminal.',
        'Under One Nation One Ration Card (ONORC), you are entitled to lift your subsidized food grains from any ration shop across India.',
        'If the dealer underweighs grains or refuses distribution, lodge an immediate complaint on the National Food Helpline 1967.'
      ],
      documents: [
        'Existing Ration Card copy',
        'Aadhaar Card of the member to be added',
        'Birth Certificate (for child) or Marriage Certificate (for spouse)',
        'Head of Family Aadhaar copy'
      ],
      official_portal: {
        name: 'National Food Security Portal (nfsa.gov.in)',
        url: 'https://nfsa.gov.in'
      },
      helpline: 'National Food Distribution Helpline: 1967 / 1800-180-2087',
      application_letter: `To,
The District Supply Officer (DSO),
Department of Food & Civil Supplies, [District Name]

Subject: Application for Inclusion of New Family Member in NFSA Ration Card.

Respected Sir/Madam,
I am the designated head of household holding Ration Card No: [Insert Ration Card Number].
I wish to request the inclusion of my [Relationship: Son / Daughter / Wife], named [Insert Member Name], in our existing Ration Card.

All requisite identification records including Aadhaar Card and relevant certificates are enclosed herewith.

I kindly request your office to verify the records and update our Ration Card in the state database.

Enclosures:
1. Copy of existing Ration Card
2. Aadhaar Card copy of new member
3. Birth / Marriage Certificate copy

Yours sincerely,
Name: [Your Name]
Ration Card No: [Ration Card Number]
Mobile Number: [Your Mobile Number]`,
      follow_ups: [
        'How to add child or spouse name in Ration Card online?',
        'How to report dealer corruption on helpline 1967?',
        'Show letter format for District Supply Officer',
        'How ONORC portability works in another city'
      ]
    };
  }

  // 9. OFFICIAL GRIEVANCE / FRAUD COMPLAINT (शिकायत, CPGRAMS, रिश्वत, अधिकारी मना कर रहा है)
  if (
    q.includes('complaint') || q.includes('शिकायत') || q.includes('fraud') ||
    q.includes('bribe') || q.includes('rishwat') || q.includes('scam') ||
    q.includes('cpgrams') || q.includes('pgportal') || q.includes('भ्रष्टाचार') ||
    q.includes('ombudsman') || q.includes('लोकपाल')
  ) {
    if (isHindi) {
      return {
        identified_issue: 'सरकारी शिकायत निवारण (CPGRAMS) एवं बैंक/अधिकारी के विरुद्ध कार्रवाई',
        root_cause: 'जब कोई सरकारी अधिकारी, बैंक कर्मचारी या पंचायत सेवक नागरिक की वैध अर्जी को दबाकर रखता है, टरकाता है या अनुचित मांग करता है, तो केंद्र सरकार का CPGRAMS पोर्टल सीधे प्रधानमंत्री कार्यालय (PMO) और संबंधित मंत्रालय द्वारा 30 दिनों में बाध्यकारी जांच कराता है।',
        action_steps: [
          'केंद्र सरकार के आधिकारिक शिकायत पोर्टल (pgportal.gov.in) पर जाएं और 2 मिनट में निःशुल्क खाता बनाएं।',
          '"Lodge Public Grievance" पर क्लिक करें और संबंधित मंत्रालय (जैसे: वित्तीय सेवाएं विभाग, कृषि मंत्रालय, ग्रामीण विकास) चुनें।',
          'अपनी पूर्व में दी गई अर्जी का विवरण, तारीख और कर्मचारी का आचरण स्पष्ट शब्दों में दर्ज करें।',
          'यदि मामला बैंक से जुड़ा है और बैंक 30 दिन में समाधान न करे, तो RBI Banking Ombudsman (cms.rbi.org.in) पर सीधे शिकायत दर्ज कराएं।'
        ],
        documents: [
          'मूल आवेदन की पावती / रसीद (Acknowledgement copy of earlier application)',
          'शिकायतकर्ता का आधार कार्ड (Complainant Aadhaar Card)',
          'बैंक पासबुक अथवा रिजेक्शन पत्र (Proof of rejection or inaction)'
        ],
        official_portal: {
          name: 'केंद्रीय लोक शिकायत निवारण पोर्टल (pgportal.gov.in)',
          url: 'https://pgportal.gov.in'
        },
        helpline: 'CPGRAMS राष्ट्रीय सपोर्ट: 011-23748133 | RBI लोकपाल: 14448',
        application_letter: `सेवा में,
लोक शिकायत निवारण अधिकारी,
[संबंधित विभाग / मंत्रालय का नाम, जैसे: वित्तीय सेवा विभाग / जिला मजिस्ट्रेट कार्यालय]

विषय: नागरिक सेवा में जानबूझकर किए जा रहे विलंब एवं लापरवाही के विरुद्ध औपचारिक शिकायत।

महोदय,
सविनय निवेदन है कि प्रार्थी [अपना नाम लिखें] ने दिनांक [तारीख] को [सेवा/योजना का नाम, जैसे: आधार सीडिंग / किसान सम्मान निधि / आवास] हेतु विधिवत आवेदन प्रस्तुत किया था (आवेदन संदर्भ संख्या: [आवेदन संख्या])।

समस्त पात्रता एवं वैध दस्तावेज प्रस्तुत करने के उपरांत भी संबंधित अधिकारी/कर्मचारी द्वारा प्रार्थी के कार्य में जानबूझकर विलंब किया जा रहा है तथा कोई संतोषजनक कारण नहीं बताया जा रहा है।

अतः श्रीमान जी से सविनय निवेदन है कि लोक सेवा गारंटी अधिनियम के अंतर्गत मामले की निष्पक्ष जांच कराकर त्वरित समाधान कराने एवं संबंधित पर नियमानुसार कार्रवाई करने की कृपा करें।

संलग्नक:
1. पूर्व आवेदन एवं पावती रसीद की छायाप्रति
2. पहचान एवं पते का प्रमाण

प्रार्थी:
नाम: [अपना नाम लिखें]
पता: [पूरा पता]
मोबाइल: [मोबाइल नंबर]`,
        follow_ups: [
          'CPGRAMS पोर्टल पर ऑनलाइन शिकायत कैसे दर्ज करें?',
          'बैंक के खिलाफ RBI लोकपाल (Banking Ombudsman) में कैसे शिकायत करें?',
          'शिकायत का आधिकारिक ड्राफ्ट पत्र दिखाएं',
          '30 दिन में शिकायत का समाधान न होने पर क्या करें?'
        ]
      };
    }

    return {
      identified_issue: 'Government Citizen Grievance (CPGRAMS) & Regulatory Redressal',
      root_cause: 'When local administration, bank officials, or panchayat personnel indefinitely stall citizen entitlements or indulge in harassment, CPGRAMS (Centralized Public Grievance Redress and Monitoring System) enables citizens to register a binding grievance directly overseen by the Prime Minister\'s Office and administrative vigilance with a mandatory 30-day closure timeline.',
      action_steps: [
        'Visit the national grievance redressal portal at pgportal.gov.in and create a free citizen account.',
        'Click "Lodge Public Grievance" and select the relevant Ministry/Department (e.g., Department of Financial Services, Rural Development, Agriculture).',
        'State the facts concisely, including application reference dates and names of concerned offices.',
        'For banking disputes where the branch has not resolved the matter within 30 days, file an online escalation with the RBI Ombudsman at cms.rbi.org.in.'
      ],
      documents: [
        'Previous application copy and stamped acknowledgment receipt',
        'Complainant\'s identity and address credentials',
        'Written proof of inaction or rejection (if received)'
      ],
      official_portal: {
        name: 'CPGRAMS National Grievance Portal',
        url: 'https://pgportal.gov.in'
      },
      helpline: 'CPGRAMS Central Helpline: 011-23748133 | RBI Ombudsman: 14448',
      application_letter: `To,
The Public Grievance Redressal Officer,
[Name of Ministry / Department / District Magistrate Office]

Subject: Formal Grievance against Unreasonable Administrative Delay and Service Denial.

Respected Sir/Madam,
I am lodging this formal representation regarding the unjustified denial/delay in the processing of my lawful civic application submitted on [Insert Date] (Application Reference ID: [Insert Ref ID]) for [Specify Service, e.g. Aadhaar DBT Linkage / Pension Restoration / Scheme Benefits].

Despite fulfilling all statutory criteria and providing necessary verification documents, the concerned branch/office has failed to take action.

I respectfully request your good office to intervene under Public Services Guarantee standards, direct an expeditious disposal of my application, and initiate necessary administrative review.

Enclosures:
1. Stamped acknowledgment receipt of original application
2. Supporting identity and entitlement documents

Yours faithfully,
Name: [Your Name]
Address: [Your Full Address]
Mobile Number: [Your Mobile Number]`,
      follow_ups: [
        'How to file grievance on CPGRAMS portal?',
        'How to escalate banking complaints to RBI Ombudsman?',
        'Show formal grievance letter template',
        'What is the maximum time limit for grievance resolution?'
      ]
    };
  }

  // 10. GENERAL / FALLBACK CIVIC ADVISOR
  if (isHindi) {
    return {
      identified_issue: 'जनसेतु एआई नागरिक परामर्श एवं कल्याणकारी योजना मार्गदर्शन',
      root_cause: 'सरकारी योजनाओं, सब्सिडी एवं डीबीटी (DBT) लाभों में पारदर्शिता सुनिश्चित करने हेतु सरकार ने प्रत्यक्ष लाभ अंतरण एवं आधार-आधारित भुगतान प्रणाली (APBS) लागू की है। सही जानकारी और उचित दस्तावेज़ होने पर कोई भी नागरिक अपने अधिकार से वंचित नहीं रह सकता।',
      action_steps: [
        'अपनी आवश्यकता बताएं (जैसे: किसान सम्मान निधि, छात्रवृत्ति, पेंशन, राशन कार्ड, आवास, मुद्रा ऋण या आधार सीडिंग)।',
        'जनसेतु के "योजना खोजक (Scheme Finder)" टूल से अपनी पात्रता एवं दस्तावेज़ों की सूची 1-क्लिक में जांचें।',
        'यदि कोई किस्त या सरकारी पैसा रुका हुआ है, तो "डीबीटी डिटेक्टिव (DBT Detective)" से त्वरित निदान करें।',
        'किसी भी बैंक या सरकारी कार्यालय में आवेदन करने हेतु तैयार आवेदन पत्र जनसेतु से प्राप्त करें।'
      ],
      documents: [
        'आधार कार्ड (Aadhaar Card)',
        'बैंक पासबुक (Bank Passbook with active DBT)',
        'आय, जाति व निवास प्रमाण पत्र (Income, Caste & Domicile Certificates)',
        'राशन कार्ड / भू-अभिलेख खतौनी (Ration Card or Land Records)'
      ],
      official_portal: {
        name: 'राष्ट्रीय योजना खोज पोर्टल (myscheme.gov.in)',
        url: 'https://www.myscheme.gov.in'
      },
      helpline: 'राष्ट्रीय नागरिक सहायता हेल्पलाइन: 1800-115-526 | myScheme: 1800-111-555',
      application_letter: `सेवा में,
सक्षम अधिकारी महोदय,
[कार्यालय / विभाग का नाम], [शहर का नाम]

विषय: सरकारी कल्याणकारी योजना के अंतर्गत लाभ प्रदान करने हेतु आवेदन।

महोदय,
सविनय निवेदन है कि प्रार्थी [अपना नाम लिखें], निवासी [पूरा पता] का स्थायी नागरिक है।
मैं शासन द्वारा संचालित कल्याणकारी योजना के सभी आवश्यक पात्रता मानदंडों को पूर्ण करता हूँ। 

अतः आपसे करबद्ध निवेदन है कि संलग्न प्रमाण पत्रों के आधार पर मुझे योजना का लाभ प्रदान करने की कृपा करें।

संलग्नक:
1. आधार कार्ड की स्वप्रमाणित प्रति
2. निवास एवं आय प्रमाण पत्र
3. बैंक पासबुक की प्रति

प्रार्थी:
नाम: [अपना नाम लिखें]
मोबाइल: [मोबाइल नंबर]`,
      follow_ups: [
        'पीएम किसान सम्मान निधि की किस्त कैसे पाएं?',
        'आधार कार्ड को बैंक से DBT के लिए कैसे लिंक कराएं?',
        'बिना गारंटी सरकारी मुद्रा लोन कैसे लें?',
        'आयुष्मान कार्ड में ₹5 लाख का मुफ्त इलाज कैसे मिलेगा?'
      ]
    };
  }

  return {
    identified_issue: 'JanSetu AI Civic Consultation & Welfare Scheme Advisory',
    root_cause: 'To ensure transparent delivery of government welfare and financial subsidies, government programs operate through the Direct Benefit Transfer (DBT) and Aadhaar Payment Bridge System (APBS). With proper verified documentation, every citizen can secure their rightful entitlements.',
    action_steps: [
      'Describe your civic problem or requirement (e.g. PM-Kisan, Scholarship, Pension, Housing, Mudra Loan, or Aadhaar Seeding).',
      'Use JanSetu\'s "Scheme Finder" to discover schemes and extract exact required documents.',
      'If any government transfer failed or bounced, use "DBT Detective" for an instant diagnostic report.',
      'Access ready-to-use formal bank and government application letters directly within JanSetu.'
    ],
    documents: [
      'Aadhaar Card copy',
      'Bank Passbook with active NPCI DBT status',
      'Income, Caste, and Domicile Certificates (if applicable)',
      'Ration Card or Land Records (Khatauni)'
    ],
    official_portal: {
      name: 'National Welfare Discovery Portal (myscheme.gov.in)',
      url: 'https://www.myscheme.gov.in'
    },
    helpline: 'National Civic Helpline: 1800-115-526 | myScheme: 1800-111-555',
    application_letter: `To,
The Competent Authority,
[Name of Department / Office], [City Name]

Subject: Application for Availing Entitlements under Government Welfare Scheme.

Respected Sir/Madam,
I, [Your Name], residing at [Your Address], fulfill the prescribed eligibility criteria under the government welfare programme.

I have enclosed all requisite identity, residential, and income credentials for your administrative verification.

I kindly request your office to approve my application and facilitate the extension of welfare benefits.

Enclosures:
1. Self-attested copy of Aadhaar Card
2. Domicile and Income Certificate copies
3. Bank Passbook photocopy

Yours faithfully,
Name: [Your Name]
Address: [Your Address]
Mobile Number: [Your Mobile Number]`,
    follow_ups: [
      'How to receive PM-KISAN Rs 2,000 installment?',
      'How to link Aadhaar with bank for DBT subsidy?',
      'How to get collateral-free Mudra loan for business?',
      'How to generate Ayushman Bharat Rs 5 Lakh health card?'
    ]
  };
}

// Real-time web search (optional). Set TAVILY_API_KEY on the server to enable.
const LIVE_KEYWORDS = /latest|today|current|now|news|kist|installment|instalment|date|when|kab|aaj|abhi|नई|ताज़ा|आज|अभी|कब|किस्त|2025|2026|deadline|last date/i;

async function searchWeb(query) {
  const key = process.env.TAVILY_API_KEY;
  if (!key || key.includes('your_')) return '';
  try {
    const r = await axios.post(
      'https://api.tavily.com/search',
      {
        api_key: key,
        query: `${query} India government scheme`,
        search_depth: 'basic',
        max_results: 4,
        include_answer: true,
        include_domains: [
          'gov.in', 'nic.in', 'pmkisan.gov.in', 'myscheme.gov.in', 'pib.gov.in',
          'pfms.nic.in', 'scholarships.gov.in', 'pmjay.gov.in', 'india.gov.in'
        ]
      },
      { timeout: 8000 }
    );
    const items = (r.data?.results || [])
      .map(x => `- ${x.title}: ${(x.content || '').slice(0, 400)} (${x.url})`)
      .join('\n');
    return `${r.data?.answer ? `Summary: ${r.data.answer}\n` : ''}${items}`;
  } catch (err) {
    console.warn('Web search failed:', err.response?.data || err.message);
    return '';
  }
}

// Verified Groq models only (llama3-8b-8192 was decommissioned, llama-3.1-8b-instant is unavailable).
const DEFAULT_GROQ_MODELS = [
  'llama-3.3-70b-versatile',
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
  'allam-2-7b'
];
const DEPRECATED_GROQ_MODELS = ['llama3-8b-8192', 'llama-3.1-8b-instant'];
const GROQ_MODELS = Array.from(new Set([
  ...DEFAULT_GROQ_MODELS,
  ...(process.env.GROQ_MODEL && !DEPRECATED_GROQ_MODELS.includes(process.env.GROQ_MODEL) ? [process.env.GROQ_MODEL] : [])
]));

// Conversation context for the AI assistant (last N turns)
const MAX_HISTORY_TURNS = 10;

function buildChatHistory(history, language, message) {
  const msgs = [];
  const incoming = Array.isArray(history) ? history : [];
  for (const h of incoming.slice(-MAX_HISTORY_TURNS)) {
    if (!h) continue;
    const role = (h.role === 'assistant' || h.sender === 'assistant') ? 'assistant' : 'user';
    const content = typeof h.content === 'string' ? h.content : (h.text || '');
    if (content) msgs.push({ role, content });
  }
  msgs.push({
    role: 'user',
    content: `Language requested: ${language === 'hi' ? 'Hindi (Devanagari)' : 'English'}\n\nCitizen Query: ${message}`
  });
  return msgs;
}

// POST /api/ai/chat
router.post('/chat', async (req, res) => {
  const { message, language, history } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message cannot be empty' });
  }

  const lang = language === 'hi' ? 'hi' : 'en';
  const groqKey = process.env.GROQ_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  // Conversation context (history) + grounding context (local verified DB + optional live web search)
  let contextData = buildContextKnowledge(message);
  let usedWeb = false;
  if (LIVE_KEYWORDS.test(message)) {
    const web = await searchWeb(message);
    if (web) {
      usedWeb = true;
      contextData += `\n\nLIVE WEB RESULTS (official sources, fetched just now):\n${web}`;
    }
  }
  const today = new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'long' });
  const systemContent = `${SYSTEM_PROMPT}\n\nToday's date: ${today}.\nIf the question needs very latest info (installment dates, deadlines) and live results are not provided below, say it cannot be verified and point to the official portal.\n\nVERIFIED CONTEXT:\n${contextData}`;

  const messagesPayload = [
    { role: 'system', content: systemContent },
    ...buildChatHistory(history, lang, message).filter(m => m.role !== 'system')
  ];

  // 1. Try Groq (tries each model until one works)
  if (groqKey && !groqKey.includes('your_groq')) {
    for (const model of GROQ_MODELS) {
      try {
        const response = await axios.post(
          'https://api.groq.com/openai/v1/chat/completions',
          {
            model,
            messages: messagesPayload,
            temperature: 0.3,
            max_tokens: 1200
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${groqKey}`
            },
            timeout: 20000
          }
        );

        const reply = response.data?.choices?.[0]?.message?.content;
        if (reply) {
          const structured = diagnoseCivicIssue(message, lang);
          return res.json({
            reply,
            ...structured,
            mode: 'groq-live',
            source: usedWeb ? `Live official web + Groq (${model})` : `Verified Schemes RAG + Groq (${model})`
          });
        }
      } catch (err) {
        console.warn(`Groq call failed (model ${model}):`, err.response?.status, JSON.stringify(err.response?.data || err.message));
      }
    }
  }

  // 2. Try OpenAI if key is set
  if (openaiKey && !openaiKey.includes('your_openai')) {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          messages: messagesPayload,
          temperature: 0.3,
          max_tokens: 1200
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
        const structured = diagnoseCivicIssue(message, lang);
        return res.json({
          reply,
          ...structured,
          mode: 'openai-live',
          source: 'Verified Schemes RAG + OpenAI'
        });
      }
    } catch (err) {
      console.warn('OpenAI call failed, switching to JanSetu Grounded Engine:', err.message);
    }
  }

  // 3. 100% Grounded Civic Diagnostic Engine (Zero-Latency, Real Resolution)
  const structured = diagnoseCivicIssue(message, lang);
  res.json({
    ...structured,
    mode: 'jansetu-grounded-engine',
    source: 'JanSetu Verified Civic Resolution Engine'
  });
});

module.exports = router;
