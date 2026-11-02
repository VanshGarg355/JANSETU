import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import {
  Send,
  Bot,
  User,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  ExternalLink,
  Copy,
  Check,
  AlertCircle,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  FileCheck,
  Phone,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  FileText,
  Printer
} from 'lucide-react';

// Local Grounded Fallback Engine for instant client-side resolution
function diagnoseLocally(query, isHindi) {
  const q = (query || '').toLowerCase().trim();

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
सविनय निवेदन है कि प्रार्थी का एक बचत खाता आपकी शाखा में है (खाता संख्या: [यहाँ खाता संख्या लिखें])।
मुझे प्रधानमंत्री किसान सम्मान निधि की किस्त प्राप्त नहीं हो पा रही है, क्योंकि मेरा खाता NPCI मैपर पर DBT हेतु सक्रिय नहीं है।

अतः आपसे करबद्ध निवेदन है कि मेरे उक्त खाते में NPCI आधार सीडिंग (DBT Consent) सक्रिय करने की कृपा करें।

संलग्नक: आधार कार्ड, बैंक पासबुक एवं भरा हुआ NPCI मैंडेट फॉर्म।

प्रार्थी:
नाम: [यहाँ अपना नाम लिखें]
मोबाइल: [यहाँ मोबाइल नंबर लिखें]
आधार संख्या: [XXXX-XXXX-1234]`,
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
I maintain a savings bank account with your branch bearing Account Number [Insert Account Number].
I have been registered under the PM Kisan Samman Nidhi scheme; however, my direct subsidy installments are failing due to the absence of active NPCI/DBT mapping on this account.

I kindly request you to link my Aadhaar number with my savings bank account in the NPCI mapper for Direct Benefit Transfer (DBT) enablement.

Enclosures: Self-attested Aadhaar Card copy, Bank Passbook, and filled NPCI Mandate Form.

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
          'जमा करने के बाद रसीद लें। 48 से 72 घंटे में myaadhaar.uidai.gov.in पर "Bank Seeding Status" चेक करें।'
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
सरकारी योजनाओं का लाभ प्राप्त करने हेतु मेरे खाते का NPCI सर्वर पर आधार से लिंक होना अनिवार्य है। पूर्व में आधार जमा होने के उपरांत भी DBT फ्लैग इनएक्टिव आ रहा है।

अतः श्रीमान जी से सविनय निवेदन है कि मेरे खाते को NPCI DBT मैपर पर तत्काल सक्रिय (Active) करने की कृपा करें।

संलग्नक: आधार कार्ड एवं बैंक पासबुक की प्रति।

प्रार्थी:
नाम: [यहाँ नाम लिखें]
खाता संख्या: [यहाँ खाता संख्या लिखें]
मोबाइल: [यहाँ मोबाइल नंबर लिखें]`,
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
I am entitled to receive government welfare benefits under Direct Benefit Transfer (DBT); however, payments are failing because my account has not been activated on the NPCI APBS mapper.

I request you to kindly update my Aadhaar DBT Mandate in your system and transmit it to the NPCI mapper immediately.

Enclosures: Self-attested copy of Aadhaar Card, copy of Bank Passbook.

Sincerely,
Name: [Your Name]
Account Number: [Your Account Number]
Mobile: [Your Mobile Number]`,
      follow_ups: [
        'Show formal application letter for Bank Manager',
        'How to verify NPCI status on UIDAI portal?',
        'Difference between Aadhaar linking vs Seeding',
        'How to track stuck payments on PFMS?'
      ]
    };
  }

  if (
    q.includes('scholarship') || q.includes('छात्रवृत्ति') || q.includes('student') ||
    q.includes('nsp') || q.includes('college') || q.includes('school') ||
    q.includes('fees') || q.includes('fee') || q.includes('vidyarthi') ||
    q.includes('post-matric') || q.includes('pre-matric')
  ) {
    if (isHindi) {
      return {
        identified_issue: 'छात्रवृत्ति (Scholarship) भुगतान विलंब / कॉलेज व बायोमेट्रिक सत्यापन',
        root_cause: 'छात्रवृत्ति अटकने के प्रमुख कारण: (1) छात्र के बैंक खाते में ₹50,000 की नाबालिग लिमिट होना, (2) कॉलेज नोडल अधिकारी द्वारा बायोमेट्रिक प्रमाणीकरण लंबित होना, या (3) आय प्रमाण पत्र 3 वर्ष से पुराना होना।',
        action_steps: [
          'National Scholarship Portal (scholarships.gov.in) पर OTR लॉगिन करके अपनी एप्लीकेशन का स्टेटस चेक करें।',
          'यदि स्टेटस "Pending at Institute Nodal Officer (INO)" है, तो अपने कॉलेज के छात्रवृत्ति प्रकोष्ठ में मूल दस्तावेजों सहित बायोमेट्रिक हाजिरी लगवाएं।',
          'सुनिश्चित करें कि छात्र का बैंक खाता केवल उसके स्वयं के नाम पर हो (संयुक्त खाता अमान्य) और NPCI DBT एक्टिव हो।',
          'यदि बैंक खाता माइनर है, तो बैंक जाकर खाते को पूर्ण बचत खाते में अपग्रेड कराएं।'
        ],
        documents: [
          'कॉलेज का बोनाफाइड सर्टिफिकेट एवं फीस रसीद (Bonafide & Fee Receipt)',
          'गत वर्ष की अंकतालिका (Previous Year Marksheet)',
          'सक्षम अधिकारी द्वारा निर्गत वैध आय प्रमाण पत्र (Income Certificate)',
          'छात्र का आधार कार्ड एवं बैंक पासबुक (Aadhaar & Passbook)'
        ],
        official_portal: {
          name: 'राष्ट्रीय छात्रवृत्ति पोर्टल (scholarships.gov.in)',
          url: 'https://scholarships.gov.in'
        },
        helpline: 'NSP राष्ट्रीय हेल्पलाइन: 0120-6619540',
        application_letter: `सेवा में,
नोडल अधिकारी (छात्रवृत्ति प्रकोष्ठ),
[कॉलेज / संस्थान का नाम], [शहर का नाम]

विषय: राष्ट्रीय छात्रवृत्ति पोर्टल (NSP) पर बायोमेट्रिक एवं संस्थान सत्यापन पूर्ण करने बाबत।

महोदय,
सविनय निवेदन है कि प्रार्थी [अपना नाम लिखें] आपके संस्थान में [कक्षा/कोर्स का नाम] का नियमित छात्र हूँ।
मैंने NSP पर पोस्ट-मैट्रिक छात्रवृत्ति हेतु ऑनलाइन आवेदन किया है (आवेदन आईडी: [NSP Application ID])। 
पोर्टल पर संस्थान स्तर पर सत्यापन लंबित प्रदर्शित हो रहा है।

अतः श्रीमान जी से निवेदन है कि मेरे अभिलेखों की जांच कर संस्थान स्तर पर मेरा बायोमेट्रिक प्रमाणीकरण एवं छात्रवृत्ति सत्यापन अनुमोदित करने की कृपा करें।

प्रार्थी:
नाम: [अपना नाम लिखें]
अनुक्रमांक: [रोल नंबर]
मोबाइल: [मोबाइल नंबर]`,
        follow_ups: [
          'कॉलेज नोडल अधिकारी के लिए प्रार्थना पत्र दिखाएं',
          'छात्रवृत्ति के लिए बैंक खाते की कौन सी लिमिट हटवानी पड़ती है?',
          'NSP पोर्टल पर OTR रजिस्ट्रेशन कैसे करें?'
        ]
      };
    }

    return {
      identified_issue: 'Scholarship Disbursal Delay / Institute Level Biometric Verification',
      root_cause: 'Scholarships fail to credit primarily due to: (1) Pending Institute/District Nodal Officer biometric authentication, (2) Minor bank account with a restrictive deposit cap (Rs 50k), or (3) Mismatch between Aadhaar name and Marksheet name.',
      action_steps: [
        'Log in to scholarships.gov.in using your OTR credentials and check "Application Status".',
        'If pending at Institute level, visit your college scholarship nodal officer with original documents to complete biometric verification.',
        'Ensure the bank account is solely in the student\'s name and active on NPCI DBT.',
        'Convert minor savings account to regular account by submitting Re-KYC at bank branch.'
      ],
      documents: [
        'Institute Bonafide Certificate & Fee Receipt',
        'Previous qualifying examination marksheet',
        'Valid Income Certificate within 3 years',
        'Student\'s Aadhaar Card and bank passbook'
      ],
      official_portal: {
        name: 'National Scholarship Portal (NSP)',
        url: 'https://scholarships.gov.in'
      },
      helpline: 'NSP Helpdesk: 0120-6619540',
      application_letter: `To,
The Nodal Officer (Scholarships),
[College / University Name], [City]

Subject: Request for Institute-Level Verification and Biometric Authentication on NSP.

Respected Sir/Madam,
I am a bona fide student of [Your Course] at your esteemed institution, holding Roll Number: [Your Roll Number].
I have submitted my application for the Post-Matric Scholarship under Application ID: [Insert NSP Application ID].

I respectfully request you to kindly verify my academic credentials and complete the biometric authorization on the portal at the earliest.

Yours faithfully,
Name: [Your Name]
Roll Number: [Your Roll Number]
Mobile: [Your Mobile Number]`,
      follow_ups: [
        'Show letter format for College Nodal Officer',
        'How to upgrade student bank account limit?',
        'How to complete NSP biometric authentication?'
      ]
    };
  }

  // General fallback
  if (isHindi) {
    return {
      identified_issue: 'जनसेतु एआई नागरिक परामर्श एवं कल्याणकारी योजना मार्गदर्शन',
      root_cause: 'सरकारी योजनाओं, सब्सिडी एवं डीबीटी (DBT) लाभों में पारदर्शिता सुनिश्चित करने हेतु सरकार ने प्रत्यक्ष लाभ अंतरण एवं आधार-आधारित भुगतान प्रणाली लागू की है। सही जानकारी और उचित दस्तावेज़ होने पर कोई भी नागरिक अपने अधिकार से वंचित नहीं रह सकता।',
      action_steps: [
        'अपनी आवश्यकता बताएं (जैसे: किसान सम्मान निधि, छात्रवृत्ति, पेंशन, राशन कार्ड, आवास, मुद्रा ऋण या आधार सीडिंग)।',
        'जनसेतु के "योजना खोजक (Scheme Finder)" टूल से अपनी पात्रता एवं दस्तावेज़ों की सूची 1-क्लिक में जांचें।',
        'यदि कोई किस्त या सरकारी पैसा रुका हुआ है, तो "डीबीटी डिटेक्टिव (DBT Detective)" से त्वरित निदान करें।',
        'किसी भी बैंक या सरकारी कार्यालय में आवेदन करने हेतु तैयार आवेदन पत्र जनसेतु से प्राप्त करें।'
      ],
      documents: [
        'आधार कार्ड (Aadhaar Card)',
        'बैंक पासबुक (Bank Passbook with active DBT)',
        'आय, जाति व निवास प्रमाण पत्र (Income, Caste & Domicile)',
        'राशन कार्ड / भू-अभिलेख खतौनी'
      ],
      official_portal: {
        name: 'राष्ट्रीय योजना खोज पोर्टल (myscheme.gov.in)',
        url: 'https://www.myscheme.gov.in'
      },
      helpline: 'राष्ट्रीय नागरिक सहायता हेल्पलाइन: 1800-115-526 | 1947',
      application_letter: `सेवा में,
सक्षम अधिकारी महोदय,
[कार्यालय / विभाग का नाम], [शहर का नाम]

विषय: सरकारी कल्याणकारी योजना के अंतर्गत लाभ प्रदान करने हेतु आवेदन।

महोदय,
सविनय निवेदन है कि प्रार्थी [अपना नाम लिखें], निवासी [पूरा पता] का स्थायी नागरिक है।
मैं शासन द्वारा संचालित कल्याणकारी योजना के सभी आवश्यक पात्रता मानदंडों को पूर्ण करता हूँ। 

अतः आपसे करबद्ध निवेदन है कि संलग्न प्रमाण पत्रों के आधार पर मुझे योजना का लाभ प्रदान करने की कृपा करें।

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

function AIChat() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const location = useLocation();
  const isHindi = i18n.language === 'hi';

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'assistant',
      text: isHindi
        ? 'नमस्ते! मैं जनसेतु AI सहायक हूँ। मैं एक आधिकारिक सरकारी समस्या-समाधान साथी हूँ।\n\nयदि आपकी पीएम-किसान किस्त रुकी है, आधार-बैंक लिंक नहीं है, छात्रवृत्ति/पेंशन नहीं आई, या बिना गारंटी लोन चाहिए—तो मुझे अपनी समस्या बताएं। मैं आपको मूल कारण, समाधान के चरण, आवश्यक दस्तावेज़ और बैंक/अधिकारी हेतु तैयार प्रार्थना पत्र प्रदान करूँगा।'
        : 'Hello! I am JanSetu AI Sahayak, your civic grievance resolution companion.\n\nWhether your PM-KISAN installment is stopped, Aadhaar-bank account is unseeded, scholarship or pension is delayed, or you need a collateral-free loan—describe your issue below. I will provide root causes, step-by-step action plans, required documents, and official application letters.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      follow_ups: isHindi
        ? [
            'पीएम किसान की ₹2,000 की किस्त रुकने पर क्या करें?',
            'डीबीटी के लिए आधार-बैंक सीडिंग कैसे ठीक करें?',
            'पोस्ट-मैट्रिक छात्रवृत्ति लेट होने पर क्या करें?',
            'बिना गारंटी मुद्रा लोन के लिए कैसे आवेदन करें?'
          ]
        : [
            'How to fix Aadhaar-bank account seeding for DBT?',
            'What to do if PM-KISAN installment is stopped?',
            'What to do if Post-Matric Scholarship is delayed?',
            'How to apply for Mudra Loan without collateral?'
          ]
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [copiedLetterId, setCopiedLetterId] = useState(null);
  const [expandedLetterId, setExpandedLetterId] = useState(null);

  // Audio / Speech State
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState('');
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState(null);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Clean up speech synthesis when component unmounts
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Quick Problem Scenario Chips at Top
  const quickCategories = [
    {
      id: 'kisan',
      icon: '🌾',
      labelHi: 'पीएम किसान किस्त रुकना',
      labelEn: 'PM-Kisan Stopped',
      queryHi: 'मेरी पीएम किसान की ₹2000 की किस्त नहीं आई है, इसे कैसे ठीक करें?',
      queryEn: 'My PM-Kisan Rs 2,000 installment is stopped. How to fix it?'
    },
    {
      id: 'dbt',
      icon: '💳',
      labelHi: 'आधार-बैंक DBT लिंक नहीं',
      labelEn: 'Aadhaar DBT Seeding',
      queryHi: 'बैंक में आधार लिंक है फिर भी DBT का पैसा नहीं आ रहा, NPCI मैपर कैसे ठीक करें?',
      queryEn: 'Bank says Aadhaar linked but DBT money is not coming. How to fix NPCI mapper?'
    },
    {
      id: 'scholarship',
      icon: '🎓',
      labelHi: 'छात्रवृत्ति विलंब / अस्वीकृत',
      labelEn: 'Scholarship Issue',
      queryHi: 'कॉलेज छात्रवृत्ति (NSP) का पैसा अभी तक नहीं आया, स्टेटस कैसे चेक करें?',
      queryEn: 'College NSP scholarship is delayed. How to verify and resolve?'
    },
    {
      id: 'pension',
      icon: '👵',
      labelHi: 'पेंशन बंद / जीवन प्रमाण',
      labelEn: 'Pension Stopped / DLC',
      queryHi: 'वृद्धावस्था/विधवा पेंशन बंद हो गई है, जीवन प्रमाण पत्र कैसे जमा करें?',
      queryEn: 'Monthly social security pension stopped. How to submit Digital Life Certificate?'
    },
    {
      id: 'ayushman',
      icon: '🏥',
      labelHi: 'आयुष्मान ₹5 लाख इलाज',
      labelEn: 'Ayushman Card',
      queryHi: 'आयुष्मान भारत कार्ड कैसे बनाएं और अस्पताल में 5 लाख का मुफ्त इलाज कैसे लें?',
      queryEn: 'How to make Ayushman Card and get Rs 5 Lakh cashless hospital treatment?'
    },
    {
      id: 'awas',
      icon: '🏠',
      labelHi: 'पीएम आवास पक्का मकान',
      labelEn: 'PMAY Housing',
      queryHi: 'पीएम आवास योजना की लिस्ट में नाम कैसे देखें और अगली किस्त कब आएगी?',
      queryEn: 'How to check name in PMAY housing list and release construction installment?'
    },
    {
      id: 'loans',
      icon: '💼',
      labelHi: 'बिना गारंटी मुद्रा लोन',
      labelEn: 'Collateral-Free Loan',
      queryHi: 'बिना गारंटी मुद्रा या स्वनिधि व्यापार लोन के लिए बैंक में आवेदन कैसे करें?',
      queryEn: 'How to apply for collateral-free Mudra loan without bank asking for collateral?'
    },
    {
      id: 'ration',
      icon: '🍚',
      labelHi: 'राशन कार्ड में नाम जोड़ना',
      labelEn: 'Ration Card Name Add',
      queryHi: 'राशन कार्ड में परिवार के नए सदस्य का नाम कैसे जोड़ें और कोटेदार कम राशन दे तो क्या करें?',
      queryEn: 'How to add new family member to Ration Card and what to do if dealer refuses?'
    },
    {
      id: 'grievance',
      icon: '🏛️',
      labelHi: 'सरकारी शिकायत CPGRAMS',
      labelEn: 'File CPGRAMS Grievance',
      queryHi: 'अधिकारी या बैंक कर्मचारी काम नहीं कर रहा तो CPGRAMS पर ऑनलाइन शिकायत कैसे दर्ज करें?',
      queryEn: 'How to lodge an official government grievance on CPGRAMS portal against inaction?'
    }
  ];

  // Speech Recognition (Voice Input)
  const handleToggleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechError(
        isHindi
          ? 'आपके ब्राउज़र में वॉइस इनपुट उपलब्ध नहीं है। कृपया टाइप करें।'
          : 'Voice input is not supported in this browser. Please type your message.'
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
        setInputText(prev => (prev ? prev + ' ' + transcript : transcript));
        setIsListening(false);
      };

      recognition.onerror = (err) => {
        console.warn('Speech recognition error:', err);
        setSpeechError(
          isHindi
            ? 'आवाज़ साफ नहीं सुनाई दी। कृपया दोबारा बोलें या नीचे लिखें।'
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

  // Auto trigger voice if navigated with state { autoVoice: true }
  useEffect(() => {
    if (location.state?.autoVoice) {
      setTimeout(() => {
        handleToggleVoiceInput();
      }, 500);
    }
  }, [location.state]);

  // Text to Speech (Voice Readout)
  const handleSpeakText = (msgId, text) => {
    if (!window.speechSynthesis) return;

    if (currentlySpeakingId === msgId) {
      window.speechSynthesis.cancel();
      setCurrentlySpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    setCurrentlySpeakingId(msgId);

    // Clean markdown symbols for cleaner audio narration
    const cleanSpeech = text
      .replace(/[#*`_~]/g, '')
      .replace(/https?:\/\/\S+/g, 'वेबसाइट पोर्टल')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.lang = isHindi ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.95;

    utterance.onend = () => {
      setCurrentlySpeakingId(null);
    };

    utterance.onerror = () => {
      setCurrentlySpeakingId(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Send Message Handler
  const handleSendMessage = async (textToSend = null) => {
    const text = typeof textToSend === 'string' ? textToSend : inputText;
    if (!text || !text.trim() || loading) return;

    const trimmed = text.trim();

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setSpeechError('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          language: isHindi ? 'hi' : 'en',
          profile_id: user?.id
        })
      });

      if (res.ok) {
        const data = await res.json();
        const assistantMsg = {
          id: Date.now() + 1,
          sender: 'assistant',
          text: data.reply || null,
          identified_issue: data.identified_issue,
          root_cause: data.root_cause,
          action_steps: data.action_steps || [],
          documents: data.documents || [],
          official_portal: data.official_portal || null,
          helpline: data.helpline || null,
          application_letter: data.application_letter || null,
          follow_ups: data.follow_ups || [],
          source: data.source || 'JanSetu Civic Diagnostic Engine',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, assistantMsg]);
        setLoading(false);
        return;
      }

      // If backend responded with error, use resilient local diagnostics
      const localResult = diagnoseLocally(trimmed, isHindi);
      const assistantMsg = {
        id: Date.now() + 1,
        sender: 'assistant',
        ...localResult,
        source: 'JanSetu Verified Diagnostic Engine (Local)',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.warn('Network issue, executed instant local civic resolution:', err);
      const localResult = diagnoseLocally(trimmed, isHindi);
      const assistantMsg = {
        id: Date.now() + 1,
        sender: 'assistant',
        ...localResult,
        source: 'JanSetu Verified Diagnostic Engine (Resilient)',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, assistantMsg]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const copyApplicationLetter = (id, letterText) => {
    navigator.clipboard.writeText(letterText);
    setCopiedLetterId(id);
    setTimeout(() => setCopiedLetterId(null), 2500);
  };

  const handleClearChat = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setCurrentlySpeakingId(null);
    }
    setMessages([
      {
        id: Date.now(),
        sender: 'assistant',
        text: isHindi
          ? 'चैट रीसेट कर दी गई है। मैं आपकी कौन सी सरकारी योजना या डीबीटी समस्या सुलझाने में सहायता करूँ?'
          : 'Conversation cleared. Which government scheme or civic issue can I help you resolve today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        follow_ups: isHindi
          ? ['पीएम किसान किस्त की जांच', 'आधार-बैंक NPCI सीडिंग', 'मुद्रा व्यापार लोन नियम', 'छात्रवृत्ति स्टेटस']
          : ['Check PM-Kisan status', 'Aadhaar-bank NPCI seeding', 'Collateral-free Mudra loan', 'Scholarship verification']
      }
    ]);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4 pb-12 px-2 sm:px-4">
      {/* 1. TOP HEADER & COMPANION STATUS */}
      <div className="bg-white border-2 border-taupe-300 rounded-3xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-taupe-950 via-taupe-900 to-taupe-800 text-taupe-50 flex items-center justify-center shadow-md shrink-0">
            <Bot size={24} className="text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-black text-taupe-950">
                {isHindi ? 'जनसेतु एआई सहायक (AI Sahayak)' : 'JanSetu AI Civic Sahayak'}
              </h1>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                <span>{isHindi ? 'समस्या निवारण सक्रिय' : 'Grounded Issue Resolver'}</span>
              </span>
            </div>
            <p className="text-xs text-taupe-600 mt-0.5">
              {isHindi
                ? 'सरकारी योजनाएं • डीबीटी विफलता निवारण • बैंक आवेदन पत्र • आधिकारिक हेल्पलाइन'
                : 'Verified Civic Counselor • Root Cause Diagnosis • Bank Letters & Official Portals'}
            </p>
          </div>
        </div>

        {/* Top Actions: Print & Reset */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={handlePrint}
            className="px-3 py-1.5 bg-taupe-100 hover:bg-taupe-200 text-taupe-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-taupe-300"
            title={isHindi ? 'सलाह प्रिंट करें' : 'Print Advisory'}
          >
            <Printer size={14} />
            <span className="hidden sm:inline">{isHindi ? 'प्रिंट / सेव' : 'Print'}</span>
          </button>

          <button
            type="button"
            onClick={handleClearChat}
            className="px-3 py-1.5 bg-taupe-100 hover:bg-taupe-200 text-taupe-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-taupe-300"
            title="Reset Chat"
          >
            <RotateCcw size={14} />
            <span>{isHindi ? 'रीसेट' : 'Reset'}</span>
          </button>
        </div>
      </div>

      {/* 2. QUICK PROBLEM SELECTOR CHIPS CAROUSEL */}
      <div className="bg-white border border-taupe-200 rounded-2xl p-3 shadow-2xs space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-taupe-700">
          <span className="flex items-center gap-1.5">
            <Sparkles size={14} className="text-amber-500" />
            <span>{isHindi ? 'प्रमुख नागरिक समस्याएं (Common Problems):' : 'Common Problems (1-Click Diagnosis):'}</span>
          </span>
          <span className="text-[11px] text-taupe-400 font-normal hidden sm:inline">
            {isHindi ? 'क्लिक करके तुरंत समाधान प्राप्त करें' : 'Tap to diagnose issue'}
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
          {quickCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleSendMessage(isHindi ? cat.queryHi : cat.queryEn)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-taupe-50 hover:bg-taupe-100 border border-taupe-200 hover:border-taupe-400 text-taupe-900 rounded-xl text-xs font-medium whitespace-nowrap transition-all shrink-0 hover:shadow-2xs active:scale-95"
            >
              <span>{cat.icon}</span>
              <span className="font-semibold">{isHindi ? cat.labelHi : cat.labelEn}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. MAIN CHAT CONTAINER */}
      <div className="bg-white border-2 border-taupe-300 rounded-3xl p-3 sm:p-6 shadow-sm flex flex-col h-[600px]">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto space-y-5 pr-1 sm:pr-2">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const isSpeaking = currentlySpeakingId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex gap-3 text-xs sm:text-sm ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {/* Assistant Avatar */}
                {!isUser && (
                  <div className="w-9 h-9 rounded-2xl bg-taupe-900 text-taupe-50 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <Bot size={18} className="text-amber-300" />
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={`max-w-[92%] sm:max-w-[82%] rounded-3xl p-4 sm:p-5 space-y-3.5 transition-all ${
                    isUser
                      ? 'bg-taupe-900 text-taupe-50 rounded-tr-none shadow-md'
                      : 'bg-[#FAF9F5] border-2 border-taupe-200/90 text-taupe-950 rounded-tl-none shadow-sm'
                  }`}
                >
                  {/* Top Bar inside Message */}
                  <div className="flex items-center justify-between text-[11px] opacity-75 border-b pb-2 border-taupe-200/40">
                    <span className="font-bold">
                      {isUser ? (user?.name || (isHindi ? 'आप (नागरिक)' : 'Citizen')) : 'JanSetu AI Sahayak'}
                    </span>
                    <span className="text-[10px]">{msg.timestamp}</span>
                  </div>

                  {/* IDENTIFIED ISSUE BADGE */}
                  {msg.identified_issue && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 text-amber-900 border border-amber-300 font-bold text-xs">
                      <span>🎯</span>
                      <span>{msg.identified_issue}</span>
                    </div>
                  )}

                  {/* ROOT CAUSE HIGHLIGHT */}
                  {msg.root_cause && (
                    <div className="p-3.5 bg-white border border-taupe-300 rounded-2xl text-xs space-y-1 shadow-2xs">
                      <div className="font-bold text-taupe-900 flex items-center gap-1 text-[11px] uppercase tracking-wider text-amber-700">
                        <AlertCircle size={13} />
                        <span>{isHindi ? 'मूल कारण (Root Cause):' : 'Identified Root Cause:'}</span>
                      </div>
                      <p className="text-taupe-800 leading-relaxed font-medium">
                        {msg.root_cause}
                      </p>
                    </div>
                  )}

                  {/* PLAIN TEXT / INTRO (IF ANY) */}
                  {msg.text && (
                    <div className="whitespace-pre-line leading-relaxed font-normal text-xs sm:text-sm">
                      {msg.text}
                    </div>
                  )}

                  {/* STEP-BY-STEP ACTION RESOLUTION */}
                  {msg.action_steps && msg.action_steps.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <div className="text-xs font-bold text-taupe-900 flex items-center gap-1">
                        <Check size={14} className="text-emerald-700 font-bold" />
                        <span>{isHindi ? 'समस्या समाधान के चरण (Step-by-Step Action Plan):' : 'Action Plan to Resolve Issue:'}</span>
                      </div>
                      <div className="space-y-2">
                        {msg.action_steps.map((step, sIdx) => (
                          <div
                            key={sIdx}
                            className="flex items-start gap-2.5 p-2.5 bg-white border border-taupe-200 rounded-xl text-xs leading-relaxed shadow-2xs"
                          >
                            <span className="w-5 h-5 rounded-full bg-taupe-900 text-taupe-50 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                              {sIdx + 1}
                            </span>
                            <span className="text-taupe-900 font-medium">{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* REQUIRED DOCUMENTS CHECKLIST */}
                  {msg.documents && msg.documents.length > 0 && (
                    <div className="p-3 bg-taupe-100/70 border border-taupe-200 rounded-2xl space-y-1.5 text-xs">
                      <div className="font-bold text-taupe-900 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                        <FileCheck size={14} className="text-emerald-700" />
                        <span>{isHindi ? 'आवश्यक दस्तावेज़ (Required Documents):' : 'Documents Checklist:'}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {msg.documents.map((doc, dIdx) => (
                          <span
                            key={dIdx}
                            className="inline-flex items-center gap-1 text-[11px] font-medium bg-white text-taupe-850 border border-taupe-300 px-2.5 py-1 rounded-lg shadow-2xs"
                          >
                            <span className="text-emerald-600 font-bold">✓</span>
                            <span>{doc}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* OFFICIAL PORTAL & HELPLINE ROW */}
                  {(msg.official_portal || msg.helpline) && (
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {msg.official_portal && (
                        <a
                          href={msg.official_portal.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-taupe-900 hover:bg-black text-taupe-50 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
                        >
                          <span>{msg.official_portal.name}</span>
                          <ExternalLink size={12} />
                        </a>
                      )}

                      {msg.helpline && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold">
                          <Phone size={12} className="text-emerald-700" />
                          <span>{msg.helpline}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* EXPANDABLE FORMAL APPLICATION LETTER */}
                  {msg.application_letter && (
                    <div className="pt-1">
                      <div className="border border-taupe-300 rounded-2xl overflow-hidden bg-white shadow-2xs">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedLetterId(expandedLetterId === msg.id ? null : msg.id)
                          }
                          className="w-full flex items-center justify-between p-3 bg-taupe-100 hover:bg-taupe-200 text-xs font-bold text-taupe-900 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <FileText size={15} className="text-taupe-700" />
                            <span>
                              {isHindi
                                ? '📄 बैंक / अधिकारी हेतु तैयार प्रार्थना पत्र (Application Letter Draft)'
                                : '📄 Ready Application Letter Draft (Bank / Office)'}
                            </span>
                          </div>
                          {expandedLetterId === msg.id ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          )}
                        </button>

                        {expandedLetterId === msg.id && (
                          <div className="p-4 space-y-3 bg-[#FCFBF7] border-t border-taupe-200">
                            <pre className="font-mono text-[11px] leading-relaxed text-taupe-900 whitespace-pre-wrap bg-white p-3 rounded-xl border border-taupe-200 overflow-x-auto">
                              {msg.application_letter}
                            </pre>
                            <div className="flex justify-end">
                              <button
                                type="button"
                                onClick={() => copyApplicationLetter(msg.id, msg.application_letter)}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-taupe-900 hover:bg-black text-taupe-50 text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95"
                              >
                                {copiedLetterId === msg.id ? (
                                  <>
                                    <Check size={14} className="text-emerald-400" />
                                    <span>{isHindi ? 'प्रार्थना पत्र कॉपी हो गया!' : 'Letter Copied!'}</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy size={14} />
                                    <span>{isHindi ? 'प्रार्थना पत्र कॉपी करें' : 'Copy Application Letter'}</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* INTERACTIVE FOLLOW-UP CHIPS UNDER BOT RESPONSE */}
                  {!isUser && msg.follow_ups && msg.follow_ups.length > 0 && (
                    <div className="pt-2 border-t border-taupe-200/50 space-y-1.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-taupe-500 flex items-center gap-1">
                        <Sparkles size={11} className="text-amber-600" />
                        <span>{isHindi ? 'त्वरित संबंधित प्रश्न (पूछने के लिए क्लिक करें):' : 'Suggested Follow-up Questions:'}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.follow_ups.map((followUp, fIdx) => (
                          <button
                            key={fIdx}
                            type="button"
                            onClick={() => handleSendMessage(followUp)}
                            className="inline-flex items-center gap-1 text-[11px] font-medium bg-white hover:bg-taupe-100 text-taupe-850 border border-taupe-300 hover:border-taupe-500 px-2.5 py-1 rounded-xl transition-all shadow-2xs hover:shadow-xs active:scale-95 text-left"
                          >
                            <span>💬 {followUp}</span>
                            <ArrowRight size={10} className="text-taupe-400" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Message Bottom Action Bar: TTS & Copy */}
                  <div className="flex items-center justify-between pt-2 border-t border-taupe-200/30 text-[11px] opacity-75">
                    <span className="text-[10px]">
                      {msg.source || (isUser ? '' : 'JanSetu Verified')}
                    </span>

                    {!isUser && (
                      <div className="flex items-center gap-3">
                        {/* Audio Listen Button */}
                        <button
                          type="button"
                          onClick={() =>
                            handleSpeakText(
                              msg.id,
                              `${msg.identified_issue || ''}. ${msg.root_cause || ''}. ${
                                msg.action_steps ? msg.action_steps.join('. ') : ''
                              } ${msg.text || ''}`
                            )
                          }
                          className="hover:opacity-100 flex items-center gap-1 font-bold transition-opacity"
                          title={isSpeaking ? 'Stop Audio' : 'Listen with Speech'}
                        >
                          {isSpeaking ? (
                            <>
                              <VolumeX size={13} className="text-rose-600 animate-pulse" />
                              <span className="text-rose-600 font-bold">{isHindi ? 'रोकें' : 'Stop'}</span>
                            </>
                          ) : (
                            <>
                              <Volume2 size={13} />
                              <span>{isHindi ? 'सुनें' : 'Listen'}</span>
                            </>
                          )}
                        </button>

                        {/* Copy Entire Response Button */}
                        <button
                          type="button"
                          onClick={() =>
                            copyToClipboard(
                              msg.id,
                              `${msg.identified_issue ? msg.identified_issue + '\n\n' : ''}${
                                msg.root_cause ? 'कारण: ' + msg.root_cause + '\n\n' : ''
                              }${
                                msg.action_steps
                                  ? 'समाधान चरण:\n' +
                                    msg.action_steps.map((s, i) => `${i + 1}. ${s}`).join('\n') +
                                    '\n\n'
                                  : ''
                              }${msg.text || ''}`
                            )
                          }
                          className="hover:opacity-100 flex items-center gap-1 font-bold transition-opacity"
                          title="Copy text"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check size={12} className="text-emerald-600" />
                              <span className="text-emerald-700">{isHindi ? 'कॉपी हुआ' : 'Copied'}</span>
                            </>
                          ) : (
                            <>
                              <Copy size={12} />
                              <span>{isHindi ? 'कॉपी' : 'Copy'}</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* User Avatar */}
                {isUser && (
                  <div className="w-9 h-9 rounded-2xl bg-taupe-700 text-taupe-50 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs shadow-sm">
                    {user?.name ? user.name.charAt(0) : 'U'}
                  </div>
                )}
              </div>
            );
          })}

          {/* Loading Animation */}
          {loading && (
            <div className="flex gap-3 text-xs justify-start">
              <div className="w-9 h-9 rounded-2xl bg-taupe-900 text-taupe-50 flex items-center justify-center shrink-0 shadow-sm">
                <Bot size={18} className="text-amber-300" />
              </div>
              <div className="bg-white border-2 border-taupe-200 rounded-3xl p-4 text-taupe-700 flex items-center gap-3 shadow-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-taupe-800 animate-bounce" />
                  <span className="w-2.5 h-2.5 rounded-full bg-taupe-800 animate-bounce delay-100" />
                  <span className="w-2.5 h-2.5 rounded-full bg-taupe-800 animate-bounce delay-200" />
                </div>
                <span className="text-xs font-semibold text-taupe-850">
                  {isHindi
                    ? 'जनसेतु एआई समाधान इंजन से सत्यापित जानकारी खोजी जा रही है...'
                    : 'Diagnosing issue and verifying official resolution database...'}
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Speech Error Banner */}
        {speechError && (
          <div className="mt-2 text-xs text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl flex items-center gap-2">
            <AlertCircle size={14} />
            <span>{speechError}</span>
          </div>
        )}

        {/* 4. CHAT INPUT BAR WITH VOICE RECOGNITION */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="pt-3 border-t border-taupe-200 flex items-center gap-2"
        >
          {/* Animated Mic Button for Voice Input */}
          <button
            type="button"
            onClick={handleToggleVoiceInput}
            className={`p-3 rounded-2xl transition-all flex items-center justify-center shrink-0 ${
              isListening
                ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-200 shadow-md'
                : 'bg-taupe-100 hover:bg-taupe-200 text-taupe-900 border border-taupe-300'
            }`}
            title={isListening ? 'Listening... Tap to stop' : 'Tap to speak (Voice Input)'}
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>

          {/* Text Input Field */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              if (speechError) setSpeechError('');
            }}
            placeholder={
              isListening
                ? (isHindi ? 'सुन रहा हूँ... बोलिए' : 'Listening... speak now')
                : (isHindi
                    ? 'अपनी समस्या या सवाल पूछें (जैसे: पीएम किसान की किस्त नहीं आई, या मुद्रा लोन कैसे लें)...'
                    : 'Describe your issue (e.g. PM-Kisan installment stopped, or how to get Mudra loan)...')
            }
            className="flex-1 px-4 py-3 bg-taupe-50 border-2 border-taupe-300 rounded-2xl text-xs sm:text-sm text-taupe-950 placeholder:text-taupe-400 focus:outline-none focus:ring-2 focus:ring-taupe-700"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || loading}
            className="px-5 py-3 bg-taupe-900 hover:bg-black text-taupe-50 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-md disabled:opacity-40 active:scale-95 shrink-0"
          >
            <span>{t('send')}</span>
            <Send size={15} />
          </button>
        </form>
      </div>

      {/* 5. PRIVACY & CIVIC SAFETY NOTICE */}
      <div className="flex items-center justify-center gap-2 text-center text-[11px] text-taupe-500 px-4">
        <ShieldCheck size={14} className="text-emerald-700 shrink-0" />
        <span>
          {isHindi
            ? 'जनसेतु एआई सहायक कभी भी ओटीपी, बैंक पासवर्ड या पूर्ण 12-अंकों का आधार नहीं मांगता है। सभी उत्तर आधिकारिक सरकारी नियमों पर आधारित हैं।'
            : 'JanSetu AI Sahayak never asks for OTP, Bank PIN, or 12-digit Aadhaar. All replies are derived strictly from official government guidelines.'}
        </span>
      </div>
    </div>
  );
}

export default AIChat;
