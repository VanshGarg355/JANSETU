import React, { useState, useRef, useEffect } from 'react';
import PortalStepText from '../components/PortalStepText';
import { apiUrl } from '../api.js';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import {
  AlertCircle,
  CheckCircle2,
  FileDown,
  ExternalLink,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Building,
  Check,
  Mic,
  MicOff,
  Copy,
  FileText,
  ShieldCheck,
  Clock,
  ClipboardList,
  Send,
  MessageSquare,
  Bot,
  User as UserIcon,
  HelpCircle,
  ChevronRight,
  Info,
  Flame,
  Search,
  CheckSquare
} from 'lucide-react';

// Profile-Adaptive Real DBT Problems for Fast Testing
const PERSONA_DBT_PROBLEMS = {
  farmer: [
    {
      icon: '🌾',
      labelEn: 'PM-KISAN 16th Installment Stopped (e-KYC Pending)',
      labelHi: 'पीएम-किसान 16वीं किस्त रुकी (e-KYC अधूरा)',
      textEn: 'My PM-KISAN Rs 2,000 installment stopped coming. The status shows e-KYC pending or incomplete on the portal.',
      textHi: 'मेरी पीएम-किसान की 16वीं किस्त नहीं आई। पोर्टल पर स्टेटस में e-KYC लंबित (Pending) दिख रहा है।'
    },
    {
      icon: '🚜',
      labelEn: 'PM-KISAN Land Seeding Showing "NO"',
      labelHi: 'पीएम-किसान भू-अभिलेख अंकन (Land Seeding) "NO" प्रदर्शित',
      textEn: 'My PM-KISAN installment stopped because Land Seeding is marked as NO, even though I have land records in my name.',
      textHi: 'पीएम-किसान सम्मान निधि में मेरा Land Seeding स्टेटस "NO" आ रहा है, जबकि मेरे नाम खतौनी और कृषि भूमि दर्ज है।'
    },
    {
      icon: '🏛️',
      labelEn: 'Bank Account Not Seeded in NPCI DBT Mapper',
      labelHi: 'बैंक खाता आधार से लिंक है पर NPCI DBT मैपर में सक्रिय नहीं',
      textEn: 'The bank branch manager says Aadhaar is linked, but government subsidies and PM-KISAN are bouncing with Aadhaar Seeding error.',
      textHi: 'बैंक शाखा में आधार लिंक है फिर भी सरकारी किस्तें और पीएम-किसान आधार सीडिंग एरर के कारण वापस लौट रहे हैं।'
    },
    {
      icon: '🌧️',
      labelEn: 'PM Fasal Bima Yojana Claim Subsidy Not Credited',
      labelHi: 'पीएम फसल बीमा योजना का मुआवजा बैंक में नहीं पहुंचा',
      textEn: 'My crop insurance compensation was sanctioned under PMFBY after hail damage, but the money has not reflected in my bank passbook.',
      textHi: 'ओलावृष्टि के बाद मेरा फसल बीमा क्लेम पास हो गया था लेकिन अभी तक बीमा कंपनी या सरकार से खाते में पैसा नहीं आया।'
    }
  ],
  student: [
    {
      icon: '🎓',
      labelEn: 'Post-Matric Scholarship: Bank Credit Limit Exceeded (PFMS Rejection)',
      labelHi: 'छात्रवृत्ति: बैंक खाते की क्रेडिट लिमिट पार (PFMS रिजेक्शन)',
      textEn: 'My college tuition scholarship was sanctioned on NSP, but PFMS rejected payment because of deposit limits on my Jan Dhan account.',
      textHi: 'मेरी कॉलेज छात्रवृत्ति NSP पर पास हो गई है लेकिन जनधन खाते की ₹1 लाख सीमा पार होने से PFMS पर पेमेंट रिजेक्ट हो गया है।'
    },
    {
      icon: '🏫',
      labelEn: 'NSP Scholarship: Pending at Institute Nodal Officer',
      labelHi: 'राष्ट्रीय छात्रवृत्ति: कॉलेज नोडल अधिकारी द्वारा सत्यापन लंबित',
      textEn: 'My National Scholarship application is stuck at "Pending with Institute Nodal Officer (INO)" and the deadline is approaching.',
      textHi: 'मेरा स्कॉलरशिप फॉर्म कॉलेज लेवल पर INO सत्यापन के लिए कई हफ़्तों से पेंडिंग पड़ा हुआ है।'
    },
    {
      icon: '💳',
      labelEn: 'NSP Push to PFMS Failed / Aadhaar Not Seeded',
      labelHi: 'छात्रवृत्ति में Push to PFMS Failed (आधार सीडिंग त्रुटि)',
      textEn: 'My NSP scholarship application status displays "Push to PFMS Failed" due to Aadhaar-bank account mismatch.',
      textHi: 'स्कॉलरशिप पोर्टल पर "Push to PFMS Failed" लिखा आ रहा है क्योंकि बैंक खाता आधार से डीबीटी हेतु मैप नहीं है।'
    }
  ],
  senior: [
    {
      icon: '👵',
      labelEn: 'Old-Age / Widow Pension Stopped (Life Certificate Expired)',
      labelHi: 'वृद्धावस्था/विधवा पेंशन बंद (जीवन प्रमाण पत्र लंबित)',
      textEn: 'My monthly old-age pension stopped credited for 3 months because the annual Digital Life Certificate (Jeevan Pramaan) was not renewed.',
      textHi: 'मेरी मासिक वृद्धावस्था पेंशन पिछले 3 महीने से नहीं आई है क्योंकि मेरा वार्षिक डिजिटल जीवन प्रमाण पत्र रिन्यू नहीं हुआ था।'
    },
    {
      icon: '🏦',
      labelEn: 'Pension Bounced Post Bank Merger (Old IFSC Invalidated)',
      labelHi: 'बैंक विलय (Merger) के बाद पुराना IFSC अमान्य होने से पेंशन रुकी',
      textEn: 'My bank was merged into Punjab National Bank and the old IFSC code became invalid, causing the social security department transfer to bounce.',
      textHi: 'ओरिएंटल बैंक ऑफ कॉमर्स का पीएनबी में विलय होने से पुराना आईएफएससी अमान्य हो गया और पेंशन कोषागार से वापस लौट गई।'
    }
  ],
  entrepreneur: [
    {
      icon: '🛒',
      labelEn: 'PM SVANidhi 7% Interest Subsidy Cashback Delayed',
      labelHi: 'पीएम स्वनिधि 7% ब्याज कैशबैक सब्सिडी नहीं आई',
      textEn: 'I am repaying my PM SVANidhi street vendor loan on time via digital QR codes, but the 7% quarterly interest cashback has not arrived.',
      textHi: 'मैं स्वनिधि लोन की किस्तें समय पर ऑनलाइन भर रहा हूँ, लेकिन 7% ब्याज सब्सिडी कैशबैक खाते में नहीं आया।'
    },
    {
      icon: '🏭',
      labelEn: 'PMEGP 35% Margin Money Subsidy Locked in TDR',
      labelHi: 'PMEGP मार्जिन मनी सब्सिडी बैंक खाते में समायोजित नहीं हुई',
      textEn: 'My PMEGP 35% government subsidy was credited into 3-year Term Deposit (TDR) but bank has not adjusted it after physical verification.',
      textHi: 'मेरी PMEGP 35% सरकारी सब्सिडी बैंक में टीडीआर में पड़ी है और बैंक अधिकारी उसे लोन खाते में एडजस्ट नहीं कर रहे हैं।'
    }
  ]
};

const detectDbtPersona = (u) => {
  if (!u) return 'farmer';
  const text = ((u.role || '') + ' ' + (u.occupation || '') + ' ' + (u.name || '')).toLowerCase();
  if (text.includes('student') || text.includes('aarav') || text.includes('scholar') || text.includes('study') || text.includes('college')) return 'student';
  if (text.includes('senior') || text.includes('pension') || text.includes('kamla') || text.includes('bujurg') || text.includes('homemaker')) return 'senior';
  if (text.includes('artisan') || text.includes('shg') || text.includes('vendor') || text.includes('sunita') || text.includes('business') || text.includes('self-employed')) return 'entrepreneur';
  return 'farmer';
};

// Helper: Normalize Question Objects for Resilient UI Rendering
function normalizeQuestion(q, isHi) {
  if (!q) return null;
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

  if (typeof q === 'string') {
    return { text: q, options: defaultOptions };
  }

  const text = q.text || q.question || q.prompt || '';
  let options = defaultOptions;

  if (Array.isArray(q.options) && q.options.length > 0) {
    options = q.options.map(opt => {
      if (typeof opt === 'string') return { label: opt, value: opt };
      return {
        label: opt.label || opt.text || opt.value || 'Option',
        value: opt.value || opt.label || opt.text || 'Option'
      };
    });
  }

  return { text, options };
}

// Client-side Grounded Multi-Cause Diagnosis Compiler
function compileLocalDiagnosis(schemeKey, isHi, citizenName, allUserText, flags) {
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
        : 'Based on citizen testimony, the failure is analyzed across multiple suspected causes ranked by likelihood, with verification instructions for each:',
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
            isHi ? 'यदि पोर्टल "eKYC is already done" कहता है तो यह कारण खारिज है, अन्यथा ओटीपी डालकर पूरा करें।' : 'If it displays "eKYC is already done", this cause is eliminated; otherwise complete via OTP.'
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
            : 'Standard Aadhaar bank linking (KYC) is legally distinct from NPCI Aadhaar Payment Bridge (APBS) DBT Credit Seeding.',
          likelihood: flags.mentionsNpciNo ? 'High' : (flags.mentionsNpciYes ? 'Low' : 'Medium'),
          evidence: isHi
            ? (flags.mentionsNpciNo ? 'नागरिक ने बताया कि बैंक में NPCI DBT सीडिंग सक्रिय नहीं है।' : 'यदि e-KYC और Land Seeding दोनों YES हैं, तो 95% मामलों में NPCI बैंक मैपिंग ही किस्त रुकने का कारण होती है।')
            : (flags.mentionsNpciNo ? 'Citizen indicated NPCI DBT mandate is not seeded.' : 'If e-KYC and Land Seeding are both YES, unmapped bank APBS mandate is the primary failure cause.'),
          verification_steps: [
            isHi ? 'UIDAI के "Bank Seeding Status" पोर्टल पर जाएं और जांचें कि आपका कौन सा बैंक खाता सक्रिय (Active) है।' : 'Visit UIDAI resident portal to verify mapped bank account in NPCI APBS.'
          ],
          resolution_steps: [
            isHi ? 'अपनी बैंक शाखा में जाकर नीचे दिया गया "NPCI DBT Seeding Application Letter" और आधार कार्ड जमा करें।' : 'Visit bank branch with the pre-filled application letter below and DBT mandate consent form.',
            isHi ? 'यदि बैंक में देरी हो तो इंडिया पोस्ट पेमेंट्स बैंक (IPPB) में नया खाता खुलवाएं जिसमें स्वतः 24 घंटे में NPCI मैपिंग हो जाती है।' : 'Alternatively open an IPPB account for automated 24-hour NPCI APBS activation.'
          ],
          official_portals: [
            { name: 'UIDAI Resident Bank Mapper', url: 'https://resident.uidai.gov.in/bank-mapper', desc: 'Check Aadhaar Bank Seeding Status' },
            { name: 'NPCI Consumer Portal', url: 'https://www.npci.org.in/', desc: 'National Payments Corporation APBS' }
          ]
        }
      ],
      required_documents: [
        'नवीनतम प्रमाणित खतौनी (Certified Land Khatauni/ROR)',
        'आधार कार्ड की स्वप्रमाणित प्रति (Aadhaar Card Copy)',
        'बैंक पासबुक की फोटोकॉपी (Bank Passbook Copy)',
        'पीएम-किसान रजिस्ट्रेशन नंबर (PM-KISAN Registration Number)'
      ],
      application_letter: `सेवा में,\nश्रीमान कृषि उप-निदेशक / ब्लॉक कृषि नोडल अधिकारी महोदय,\nविकास भवन, [तहसील/जिले का नाम]\n\nविषय: पीएम-किसान सम्मान निधि योजना में भू-अभिलेख अंकन (Land Seeding) एवं e-KYC अद्यतन करने हेतु।\n\nमहोदय,\nसविनय निवेदन है कि प्रार्थी [${citizenName}], ग्राम [गांव का नाम], ब्लॉक [ब्लॉक का नाम] का पंजीकृत किसान है। प्रार्थी का पीएम-किसान रजिस्ट्रेशन नंबर [रजिस्ट्रेशन नंबर] और आधार नंबर [आधार नंबर] है।\n\nविगत किस्तों में मुझे योजना का लाभ प्राप्त हुआ था, परंतु वर्तमान में पोर्टल पर जांच करने पर "Land Seeding: NO" प्रदर्शित होने के कारण मेरी किस्त रोक दी गई है। प्रार्थी के नाम प्रमाणित कृषि भूमि (खतौनी खाता संख्या [खाता संख्या]) दर्ज है।\n\nअतः श्रीमान जी से विनम्र निवेदन है कि संलग्न खतौनी और आधार कार्ड के आधार पर पोर्टल पर प्रार्थी का भू-अभिलेख अंकन (Land Seeding: YES) कराने की कृपा करें जिससे रुकी हुई किस्त प्राप्त हो सके।\n\nप्रार्थी: [${citizenName}]\nमोबाइल: [मोबाइल नंबर]\nसंलग्नक: 1. प्रमाणित खतौनी प्रति 2. आधार कार्ड प्रति 3. बैंक पासबुक प्रति`,
      escalation_authority: 'District Agriculture Officer (जिला कृषि अधिकारी / उप कृषि निदेशक)',
      escalation_url: 'https://pmkisan.gov.in/Grievance.aspx'
    };
  } else if (schemeKey === 'scholarship') {
    const isLimitHigh = flags.mentionsLimitYes || !flags.mentionsLimitNo;
    diag = {
      case_title: isHi ? 'राष्ट्रीय/राज्य छात्रवृत्ति: भुगतान विफलता का बहु-कारणीय एआई निदान' : 'National/State Scholarship PFMS Disbursal Multi-Cause Diagnostic Assessment',
      category: isHi ? 'शिक्षा व छात्रवृत्ति (Education)' : 'Education',
      detected_scheme: 'Scholarship (NSP)',
      severity: 'Critical',
      resolution_sla: '72 Hours to 7 Working Days',
      affected_systems: 'Public Financial Management System (PFMS), National Scholarship Portal (NSP)',
      summary: isHi
        ? 'छात्रवृत्ति भुगतान रुकने के 3 संभावित कारण सामने आए हैं, जिन्हें संभावना (Likelihood) के अनुसार क्रमबद्ध किया गया है:'
        : 'Based on citizen testimony, 3 suspected failure causes are identified and ranked by likelihood:',
      possible_causes: [
        {
          id: 'scholarship-cause-1',
          title: isHi ? 'बैंक खाते में जमा सीमा (Credit Ceiling / Jan Dhan Account Bar)' : 'Bank Account Credit Ceiling Exceeded (Jan Dhan ₹1 Lakh Limit)',
          explanation: isHi
            ? 'पीएम जनधन (PMJDY) या बेसिक बचत बैंक जमा (BSBD) खातों पर ₹1,00,000 की वार्षिक जमा सीमा होती है। छात्रवृत्ति की बड़ी राशि आने पर PFMS द्वारा क्रेडिट अस्वीकृत कर दिया जाता है।'
            : 'Basic Savings / Jan Dhan accounts impose a strict ₹1,00,000 annual deposit ceiling. When tuition scholarship exceeds this limit, core banking systems auto-reject treasury credit.',
          likelihood: isLimitHigh ? 'High' : 'Low',
          evidence: isHi
            ? (flags.mentionsLimitYes ? 'नागरिक ने बताया कि खाता जनधन/जीरो बैलेंस खाता है।' : 'छात्रवृत्ति अस्वीकृति का सबसे प्रमुख कारण क्रेडिट सीमा बाधा होता है।')
            : (flags.mentionsLimitYes ? 'Citizen reported using a Jan Dhan account.' : 'Account credit ceiling limits frequently reject bulk educational stipends.'),
          verification_steps: [
            isHi ? 'PFMS पोर्टल "Track NSP Payments" पर जाकर जांचें कि क्या रिजेक्शन में "Credit Limit Exceeded" या "Account Barred" लिखा है।' : 'Check PFMS Track NSP Payments for rejection code "Credit Limit Exceeded / Account Blocked".'
          ],
          resolution_steps: [
            isHi ? 'अपनी बैंक शाखा में जाकर पूरा केवाईसी फॉर्म भरें और जनधन खाते को सामान्य रेगुलर बचत खाते (Regular Savings Account) में अपग्रेड कराएं।' : 'Submit full KYC dossier at your bank branch to upgrade Jan Dhan account into a regular savings account.',
            isHi ? 'अपग्रेड के पश्चात बैंक से "Non-Restricted Account Certificate" प्राप्त करें।' : 'Obtain confirmation receipt of account status upgrade from branch manager.'
          ],
          official_portals: [
            { name: 'PFMS Track NSP Payments', url: 'https://pfms.nic.in/static/NewLayout_TrackNSPpayments.aspx', desc: 'Check Exact PFMS Rejection Reason' },
            { name: 'National Scholarship Portal', url: 'https://scholarships.gov.in/', desc: 'Official NSP Portal' }
          ]
        },
        {
          id: 'scholarship-cause-2',
          title: isHi ? 'संस्थान नोडल अधिकारी (INO) द्वारा बायोमेट्रिक सत्यापन लंबित' : 'Pending Institute Nodal Officer (INO) Biometric Verification',
          explanation: isHi
            ? 'केंद्र सरकार ने छात्रवृत्ति में फर्जीवाड़ा रोकने हेतु कॉलेज स्तर पर INO द्वारा बायोमेट्रिक आधार सत्यापन अनिवार्य किया है।'
            : 'Central ministries mandate dual-level biometric authentication by Institute and District Nodal Officers before treasury push.',
          likelihood: flags.mentionsCollegeYes ? 'Low' : 'Medium',
          evidence: isHi
            ? (flags.mentionsCollegeYes ? 'नागरिक ने पुष्टि की कि कॉलेज स्तर पर सत्यापन पूर्ण है।' : 'पोर्टल पर कॉलेज या जिला स्तर पर सत्यापन अटका होना संभव है।')
            : (flags.mentionsCollegeYes ? 'Citizen confirmed institute verification is completed.' : 'Verification at institution nodal officer level requires confirmation.'),
          verification_steps: [
            isHi ? 'scholarships.gov.in पर छात्र लॉगिन करें और आवेदन स्थिति देखें कि "Application verified by Institute" है या नहीं।' : 'Login on scholarships.gov.in and check Application Status timeline.'
          ],
          resolution_steps: [
            isHi ? 'अपने कॉलेज के छात्रवृत्ति प्रभारी (Nodal Officer) से संपर्क कर पोर्टल पर तुरंत बायोमेट्रिक सत्यापन पूरा कराएं।' : 'Meet your College Scholarship In-Charge (INO) and request immediate biometric sign-off on portal.'
          ],
          official_portals: [
            { name: 'NSP Student Login Portal', url: 'https://scholarships.gov.in/', desc: 'Check Institute Verification Status' }
          ]
        },
        {
          id: 'scholarship-cause-3',
          title: isHi ? 'बैंक खाते में NPCI आधार सीडिंग / DBT Mandate न होना' : 'Aadhaar Not Seeded on NPCI APBS for Scholarship DBT',
          explanation: isHi
            ? 'PFMS द्वारा केवल उन्हीं खातों में छात्रवृत्ति भेजी जा सकती है जो NPCI आधार पेमेंट ब्रिज में सक्रिय रूप से मैप हों।'
            : 'Scholarship amounts disbursed via PFMS route strictly via NPCI APBS mandate; inactive accounts fail clearing.',
          likelihood: 'Medium',
          evidence: isHi ? 'पीएफएमएस पर "Rejected by Bank due to Aadhaar unmapped" एक सामान्य त्रुटि है।' : 'PFMS transaction rejects indicate missing NPCI DBT mandate.',
          verification_steps: [
            isHi ? 'UIDAI बैंक सीडिंग पोर्टल पर जांचें कि कौन सा बैंक खाता NPCI में Active है।' : 'Verify active seeded bank account on UIDAI resident portal.'
          ],
          resolution_steps: [
            isHi ? 'बैंक शाखा में जाकर आधार सीडिंग फॉर्म जमा करें।' : 'Submit Aadhaar Seeding Form at bank branch.'
          ],
          official_portals: [
            { name: 'UIDAI Resident Bank Mapper', url: 'https://resident.uidai.gov.in/bank-mapper', desc: 'Verify NPCI DBT Mapping' }
          ]
        }
      ],
      required_documents: [
        'कॉलेज फीस रसीद एवं बोनाफाइड प्रमाण पत्र (Fee Receipt & Bonafide Certificate)',
        'नवीनतम अंकतालिका (Marksheet of Previous Year)',
        'आधार कार्ड (Aadhaar Card)',
        'बैंक पासबुक की फोटोकॉपी (Bank Passbook)'
      ],
      application_letter: `सेवा में,\nश्रीमान शाखा प्रबंधक महोदय,\n[बैंक का नाम], शाखा [शाखा का नाम]\n\nविषय: छात्रवृत्ति प्राप्त करने हेतु जनधन खाते की जमा सीमा हटाने एवं रेगुलर बचत खाते में परिवर्तित करने हेतु।\n\nमहोदय,\nसविनय निवेदन है कि प्रार्थी [${citizenName}], छात्र/छात्रा [कॉलेज/विश्वविद्यालय का नाम] का अध्ययनरत विद्यार्थी है। प्रार्थी का बचत खाता संख्या [खाता संख्या] आपकी शाखा में है।\n\nमेरी उच्च शिक्षा छात्रवृत्ति राशि PFMS के माध्यम से केंद्र/राज्य सरकार द्वारा भेजी जानी है, परंतु खाते पर जनधन ₹1,00,000 की वार्षिक क्रेडिट सीमा होने के कारण छात्रवृत्ति राशि क्रेडिट नहीं हो पा रही है।\n\nअतः विनम्र प्रार्थना है कि प्रार्थी के पूर्ण KYC दस्तावेज (आधार कार्ड व पैन कार्ड प्रति) स्वीकार कर इस खाते की जमा सीमा हटाने एवं इसे सामान्य बचत खाते में परिवर्तित करने की कृपा करें।\n\nप्रार्थी: [${citizenName}]\nमोबाइल: [मोबाइल]\nसंलग्नक: 1. आधार कार्ड प्रति 2. पैन कार्ड प्रति 3. कॉलेज बोनाफाइड प्रमाण पत्र`,
      escalation_authority: 'District Backward Class / Minority Welfare Officer (जिला समाज कल्याण अधिकारी)',
      escalation_url: 'https://scholarships.gov.in/'
    };
  } else if (schemeKey === 'pension') {
    const isLifeCertHigh = flags.mentionsLifeCertNo || !flags.mentionsLifeCertYes;
    diag = {
      case_title: isHi ? 'वृद्धावस्था/विधवा/दिव्यांग पेंशन: विफलता का बहु-कारणीय एआई निदान' : 'Social Security Pension Disbursal Multi-Cause Diagnostic Assessment',
      category: isHi ? 'सामाजिक सुरक्षा व पेंशन (Social Welfare)' : 'Social Welfare',
      detected_scheme: 'Social Security Pension',
      severity: isLifeCertHigh ? 'Critical' : 'High',
      resolution_sla: '48 Hours to 10 Working Days',
      affected_systems: 'State Social Welfare Treasury Portal, Jeevan Pramaan (DLC), PFMS',
      summary: isHi
        ? 'पेंशन रुकने के 2 प्रमुख संभावित कारणों का विश्लेषण नीचे संभावना (Likelihood) के आधार पर किया गया है:'
        : 'Based on citizen testimony, 2 primary suspected causes for pension suspension are isolated:',
      possible_causes: [
        {
          id: 'pension-cause-1',
          title: isHi ? 'डिजिटल जीवन प्रमाण पत्र (Jeevan Pramaan / DLC) की समय-सीमा समाप्त या लंबित होना' : 'Digital Life Certificate (Jeevan Pramaan) Expired or Pending',
          explanation: isHi
            ? 'नियमों के अनुसार प्रत्येक पेंशनभोगी को प्रतिवर्ष अपना जीवन प्रमाण पत्र जमा करना अनिवार्य होता है। इसके अभाव में ट्रेजरी स्वतः पेंशन रोक देती है।'
            : 'Treasury rules mandate annual digital life certificate renewal. Unrenewed pensions are auto-suspended to prevent fraud.',
          likelihood: isLifeCertHigh ? 'High' : 'Low',
          evidence: isHi
            ? (flags.mentionsLifeCertNo ? 'नागरिक ने बताया कि जीवन प्रमाण पत्र हाल ही में जमा नहीं कराया गया है।' : 'जीवन प्रमाण पत्र की स्थिति सत्यापित होनी चाहिए।')
            : (flags.mentionsLifeCertNo ? 'Citizen reported life certificate has not been submitted recently.' : 'DLC status verification confirmed.'),
          verification_steps: [
            isHi ? 'jeevanpramaan.gov.in पर जाएं या नजदीकी CSC केंद्र पर जाकर अपनी पिछली पावती तिथि जांचें।' : 'Check previous submission status on jeevanpramaan.gov.in or nearest CSC.'
          ],
          resolution_steps: [
            isHi ? 'स्मार्टफोन पर "Jeevan Pramaan Face App" और "Aadhaar FaceRD App" डाउनलोड कर घर बैठे चेहरे से जीवन प्रमाण पत्र बनाएं।' : 'Download Jeevan Pramaan Face App on Android smartphone and complete biometric face authentication.',
            isHi ? 'अथवा नजदीकी ग्राहक सेवा केंद्र (CSC) या डाकघर (डाकिया) की मदद से बायोमेट्रिक अंगूठा लगाकर तुरंत जीवन प्रमाण पत्र जमा करें।' : 'Or visit any nearby CSC / Post Office for fingerprint DLC submission.',
            isHi ? 'प्रमाण आईडी (Pramaan ID) प्राप्त होने के 48 घंटे में कोषागार में स्वतः पेंशन बहाल हो जाती है।' : 'Treasury records auto-resume disbursements within 48 hours of DLC submission.'
          ],
          official_portals: [
            { name: 'Jeevan Pramaan Portal', url: 'https://jeevanpramaan.gov.in/', desc: 'Submit Digital Life Certificate' },
            { name: 'State Social Welfare Portal', url: 'https://sspy-up.gov.in/', desc: 'Track Pension Payment Status' }
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

  return {
    status: 'completed',
    reply: isHi
      ? `आपकी स्थिति का विस्तृत विश्लेषण पूर्ण हो गया है। सरकारी नियमों व आपके उत्तरों के आधार पर संभावित कारणों को प्राथमिकता क्रम (Likelihood: High / Medium / Low) में नीचे प्रस्तुत किया गया है। साथ ही सत्यापन व समाधान के चरण दिए गए हैं:`
      : `Your diagnostic assessment is complete. Based on government treasury rules and your responses, suspected causes are ranked by likelihood (High / Medium / Low) with verification and step-by-step resolution instructions below:`,
    diagnosis: {
      history_id: historyId,
      citizen_name: citizenName,
      diagnosed_at: new Date().toISOString(),
      analyzed_text: allUserText,
      issue_title: diag.possible_causes?.[0]?.title || diag.case_title,
      cause: diag.possible_causes?.[0]?.explanation || 'Suspected DBT mapping or verification roadblock',
      why_it_happened: diag.possible_causes?.[0]?.explanation || 'Treasury clearance suspended pending mandatory verification.',
      action_steps: diag.possible_causes?.[0]?.resolution_steps || [],
      official_portals: diag.possible_causes?.[0]?.official_portals || [],
      ...diag
    }
  };
}

// Client-side Grounded Adaptive Diagnostic Engine
function runLocalAdaptiveDiagnosis(messages, isHi, citizenName = 'Citizen Beneficiary') {
  const userMessages = (messages || []).filter(m => m.role === 'user');
  const userTurns = userMessages.length;
  const allUserText = userMessages.map(m => m.content).join(' ').toLowerCase();

  // Contextual signals from last turn
  const lastUserMsg = (userMessages[userMessages.length - 1]?.content || '').toLowerCase();
  const lastAssistantQ = (messages.filter(m => m.role === 'assistant').pop()?.question?.text || '').toLowerCase();
  const isAffirmative = /हाँ|yes|done|complete|पूर्ण|सत्यापित|हो गया|सक्रिय|active/.test(lastUserMsg);
  const isNegative = /नहीं|no|lambi|pending|लंबित|अधूरा|पेंडिंग|inactive|निष्क्रिय/.test(lastUserMsg);

  const isKisan = /kisan|farmer|kheti|fasal|crop|2000|kist|installment|land|zameen|bhoomi|patwari|khatauni|pmkisan|किसान|खेती|फसल|किस्त|खतौनी|भूमि/.test(allUserText);
  const isStudent = /scholarship|student|school|college|fee|fees|nsp|marksheet|matric|chhatravritti|छात्र|छात्रा|छात्रवृत्ति|स्कॉलरशिप|कॉलेज|फीस/.test(allUserText);
  const isPension = /pension|elderly|senior|bujurg|vriddha|widow|vidhwa|jeevan|pramaan|life certificate|पेंशन|बुजुर्ग|वृद्धावस्था|विधवा|जीवन प्रमाण/.test(allUserText);

  // Sub-symptoms
  let mentionsEkycNo = /e-?kyc.*(no|lambi|pend|nhi|nahi|अधूरा|लंबित|नहीं)|(no|lambi|pend|nhi|nahi|अधूरा|लंबित|नहीं).*e-?kyc|ई-?केवाईसी.*(लंबित|नहीं)|नहीं.*e-?kyc|no.*e-?kyc/.test(allUserText);
  let mentionsEkycYes = /e-?kyc.*(yes|done|complete|ho gaya|pura|पूर्ण|हो गया|सत्यापित)|(yes|done|complete|पूर्ण|हो गया|सत्यापित).*e-?kyc|ई-?केवाईसी.*(पूर्ण|हाँ|हो चुकी)|हाँ.*e-?kyc|yes.*e-?kyc/.test(allUserText);
  let mentionsLandNo = /land.*(no|nahi|nhi|lambi|पेंडिंग|नहीं)|(no|nahi|nhi|लंबित|नहीं).*land|bhoomi.*no|भू-?अंकन.*(no|नहीं)|भूलेख.*नहीं|नहीं.*land|no.*land/.test(allUserText);
  let mentionsLandYes = /land.*(yes|done|complete|हाँ|पूर्ण)|(yes|done|हाँ|पूर्ण).*land|भू-?अंकन.*(yes|हाँ|पूर्ण)|हाँ.*land|yes.*land/.test(allUserText);
  let mentionsLimitYes = /limit|jandhan|100000|1 lakh|small account|क्रेडिट सीमा|जनधन|लिमिट|zero balance|जीरो बैलेंस/.test(allUserText);
  let mentionsLimitNo = /regular|normal|सामान्य|लिमिट नहीं|सेविंग्स|savings account/.test(allUserText);
  let mentionsCollegeYes = /verified by institute|verified by college|कॉलेज से सत्यापित|संस्थान द्वारा सत्यापित|ino verified|हाँ.*कॉलेज|college.*yes/.test(allUserText);
  let mentionsCollegeNo = /pending at institute|pending at college|कॉलेज स्तर पर पेंडिंग|संस्थान सत्यापन लंबित|college.*no|नहीं.*कॉलेज/.test(allUserText);
  let mentionsLifeCertNo = /jeevan.*(no|nahi|expired|lambi|नहीं|लंबित)|life cert.*(no|expired)|प्रमाण पत्र.*नहीं|नहीं.*जीवन प्रमाण/.test(allUserText);
  let mentionsLifeCertYes = /jeevan.*(yes|done|जमा|हाँ)|life cert.*(yes|done)|प्रमाण पत्र.*(हाँ|जमा)|dlc.*(yes|done)|हाँ.*जीवन प्रमाण/.test(allUserText);
  let mentionsMergerYes = /merge|विलय|ifsc बदला|ifsc changed|हाँ.*विलय/.test(allUserText);
  let mentionsMergerNo = /no merge|विलय नहीं|same bank|वही खाता|नहीं.*विलय/.test(allUserText);
  let mentionsNpciYes = /npci.*(yes|active|seeded|सक्रिय|हाँ)|(yes|active|सक्रिय).*npci|डीबीटी मैंडेट.*(सक्रिय|हाँ)|aadhaar.*seeded/.test(allUserText);
  let mentionsNpciNo = /npci.*(no|inactive|not seeded|निष्क्रिय|नहीं)|(no|inactive|नहीं).*npci|मैंडेट.*(नहीं|निष्क्रिय)|not seeded/.test(allUserText);

  // If last question was about specific topic, connect answer
  if (/kyc/i.test(lastAssistantQ)) {
    if (isAffirmative) mentionsEkycYes = true;
    if (isNegative) mentionsEkycNo = true;
  }
  if (/land|भू-?अंकन/i.test(lastAssistantQ)) {
    if (isAffirmative) mentionsLandYes = true;
    if (isNegative) mentionsLandNo = true;
  }
  if (/जनधन|limit|ceiling/i.test(lastAssistantQ)) {
    if (isAffirmative) mentionsLimitYes = true;
    if (isNegative) mentionsLimitNo = true;
  }
  if (/institute|college|ino/i.test(lastAssistantQ)) {
    if (isAffirmative) mentionsCollegeYes = true;
    if (isNegative) mentionsCollegeNo = true;
  }
  if (/jeevan|life certificate|प्रमाण पत्र/i.test(lastAssistantQ)) {
    if (isAffirmative) mentionsLifeCertYes = true;
    if (isNegative) mentionsLifeCertNo = true;
  }
  if (/विलय|merge|ifsc/i.test(lastAssistantQ)) {
    if (isAffirmative) mentionsMergerYes = true;
    if (isNegative) mentionsMergerNo = true;
  }
  if (/npci/i.test(lastAssistantQ)) {
    if (isAffirmative) mentionsNpciYes = true;
    if (isNegative) mentionsNpciNo = true;
  }

  // 1. PM-KISAN
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
        }
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
        }
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
        }
      };
    }

    return compileLocalDiagnosis('pm_kisan', isHi, citizenName, allUserText, { mentionsEkycNo, mentionsEkycYes, mentionsLandNo, mentionsLandYes, mentionsNpciNo, mentionsNpciYes });
  }

  // 2. SCHOLARSHIP
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
        }
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
        }
      };
    }

    return compileLocalDiagnosis('scholarship', isHi, citizenName, allUserText, { mentionsLimitYes, mentionsLimitNo, mentionsCollegeYes, mentionsCollegeNo });
  }

  // 3. PENSION
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
        }
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
        }
      };
    }

    return compileLocalDiagnosis('pension', isHi, citizenName, allUserText, { mentionsLifeCertNo, mentionsLifeCertYes, mentionsMergerYes, mentionsMergerNo });
  }

  // 4. GENERAL
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
      }
    };
  }

  return compileLocalDiagnosis('general', isHi, citizenName, allUserText, { mentionsNpciYes, mentionsNpciNo });
}

function DBTDetective() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const isHindi = i18n.language === 'hi';

  const activePersona = detectDbtPersona(user);

  // Core Conversation & Diagnosis State
  const [problemInput, setProblemInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [diagnosisResult, setDiagnosisResult] = useState(null);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);

  // Audio / Speech State
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState('');
  const [copiedLetter, setCopiedLetter] = useState(false);

  const messagesEndRef = useRef(null);
  const reportRef = useRef(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatStarted) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isDiagnosing]);

  // Scroll to report once completed
  useEffect(() => {
    if (diagnosisResult) {
      setTimeout(() => {
        reportRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 350);
    }
  }, [diagnosisResult]);

  // Voice Input (Web Speech API)
  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechError(
        isHindi
          ? 'आपके ब्राउज़र में वॉइस इनपुट समर्थित नहीं है। कृपया समस्या लिखकर बताएं।'
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
        const updated = problemInput ? problemInput + ' ' + transcript : transcript;
        setProblemInput(updated);
        setIsListening(false);
      };

      recognition.onerror = (err) => {
        console.warn('Speech recognition error:', err);
        setSpeechError(
          isHindi
            ? 'ध्वनि स्पष्ट नहीं सुनी जा सकी। कृपया पुनः बोलें अथवा टाइप करें।'
            : 'Could not hear clearly. Please try speaking again or type.'
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

  // Start Diagnostic Session with Initial Problem
  const handleStartDiagnosis = async (initialQuery = null) => {
    const query = typeof initialQuery === 'string' ? initialQuery : problemInput;

    if (!query.trim()) {
      setSpeechError(
        isHindi
          ? 'कृपया अपनी समस्या लिखें या माइक बटन दबाकर बोलें।'
          : 'Please describe your DBT failure problem or tap the microphone to speak.'
      );
      return;
    }

    setSpeechError('');
    setChatStarted(true);
    setIsDiagnosing(true);
    setDiagnosisResult(null);

    const initialUserMessage = { role: 'user', content: query };
    const newMessages = [initialUserMessage];
    setMessages(newMessages);
    setProblemInput('');

    await sendToDiagnosticApi(newMessages);
  };

  // Submit User Answer to Follow-up Question
  const handleSendAnswer = async (answerText) => {
    if (!answerText || !answerText.trim()) return;

    setSpeechError('');
    setIsDiagnosing(true);
    setCurrentQuestion(null);

    const userMessage = { role: 'user', content: answerText.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setProblemInput('');

    await sendToDiagnosticApi(newMessages);
  };

  // Orchestrate backend chat-diagnose call with guaranteed instant local fallback
  const sendToDiagnosticApi = async (conversationMessages) => {
    const citizenName = user?.name || (isHindi ? 'नागरिक लाभार्थी' : 'Citizen Beneficiary');

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const res = await fetch(apiUrl('/api/dbt/chat-diagnose'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: conversationMessages,
          language: isHindi ? 'hi' : 'en',
          citizen_name: citizenName
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();

        if (data.status === 'questioning') {
          const normQ = normalizeQuestion(data.question, isHindi);
          setMessages(prev => [
            ...prev,
            {
              role: 'assistant',
              content: data.reply || (isHindi ? 'कृपया इस प्रश्न का उत्तर दें:' : 'Please clarify this point:'),
              question: normQ
            }
          ]);
          setCurrentQuestion(normQ);
          setIsDiagnosing(false);
          return;
        }

        if (data.status === 'completed' && data.diagnosis) {
          setMessages(prev => [
            ...prev,
            {
              role: 'assistant',
              content: data.reply || (isHindi ? 'आपकी स्थिति का बहु-कारणीय विश्लेषण पूर्ण हो गया है। नीचे संभावित कारण व समाधान प्रस्तुत हैं:' : 'Your multi-cause diagnostic assessment is complete. The potential causes and resolution actions are presented below:')
            }
          ]);
          setDiagnosisResult(data.diagnosis);
          setCurrentQuestion(null);
          setIsDiagnosing(false);
          return;
        }
      }

      throw new Error(`Diagnostic API returned status: ${res.status}`);
    } catch (err) {
      console.warn('Backend unavailable or timed out, executing instant local adaptive diagnostic engine:', err);

      // Resilient local fallback engine guarantees AI never stays silent
      const localResult = runLocalAdaptiveDiagnosis(conversationMessages, isHindi, citizenName);

      if (localResult.status === 'questioning') {
        const normQ = normalizeQuestion(localResult.question, isHindi);
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: localResult.reply || (isHindi ? 'कृपया इस प्रश्न का उत्तर दें:' : 'Please clarify this point:'),
            question: normQ
          }
        ]);
        setCurrentQuestion(normQ);
        setIsDiagnosing(false);
        return;
      }

      if (localResult.status === 'completed' && localResult.diagnosis) {
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: localResult.reply || (isHindi ? 'आपकी स्थिति का बहु-कारणीय विश्लेषण पूर्ण हो गया है। नीचे संभावित कारण व समाधान प्रस्तुत हैं:' : 'Your multi-cause diagnostic assessment is complete. The potential causes and resolution actions are presented below:')
          }
        ]);
        setDiagnosisResult(localResult.diagnosis);
        setCurrentQuestion(null);
        setIsDiagnosing(false);

        // Best effort sync to backend for PDF report generation
        try {
          fetch(apiUrl('/api/dbt/history/sync'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ diagnosis: localResult.diagnosis })
          }).catch(() => {});
        } catch (e) {}

        return;
      }

      setIsDiagnosing(false);
    }
  };

  const applyPreset = (preset) => {
    const txt = isHindi ? preset.textHi : preset.textEn;
    setProblemInput(txt);
    setSpeechError('');
    handleStartDiagnosis(txt);
  };

  const handleCopyLetter = () => {
    if (!diagnosisResult?.application_letter) return;
    navigator.clipboard.writeText(diagnosisResult.application_letter);
    setCopiedLetter(true);
    setTimeout(() => setCopiedLetter(false), 3000);
  };

  const downloadPdfReport = () => {
    if (!diagnosisResult?.history_id) return;
    window.open(apiUrl(`/api/dbt/history/${diagnosisResult.history_id}/report`), '_blank');
  };

  const resetAll = () => {
    setProblemInput('');
    setMessages([]);
    setCurrentQuestion(null);
    setDiagnosisResult(null);
    setIsDiagnosing(false);
    setChatStarted(false);
    setSpeechError('');
    setCopiedLetter(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16 px-4 sm:px-6">
      {/* 1. Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-950 text-xs font-semibold border border-amber-300">
          <AlertCircle size={14} className="text-amber-800" />
          <span>
            {isHindi
              ? 'डीबीटी विफलता जासूस • AI पर्सनलाइज़्ड डायग्नोस्टिक असिस्टेंट'
              : 'DBT Failure Detective • AI Multi-Cause Diagnostic Assistant'}
          </span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-taupe-950">
          {isHindi ? 'रुकी हुई सरकारी किस्त का बहु-कारणीय एआई निदान' : 'AI-Powered DBT Payment Diagnostic Assistant'}
        </h1>
        <p className="text-xs sm:text-sm text-taupe-600 leading-relaxed">
          {isHindi
            ? 'पीएम-किसान, छात्रवृत्ति, पेंशन या आवास योजना का पैसा खाते में नहीं आया? अपनी समस्या स्वाभाविक रूप से बताएं। जनसेतु एआई स्थिति अनुसार 1-2 प्रश्न पूछकर संभावित कारणों (Likelihood: High/Medium/Low), सत्यापन के तरीकों और बैंक हेतु तैयार समाधान प्रस्तुत करेगा।'
            : 'Payment stopped for PM-KISAN, Scholarship, Pension, or Housing? Describe your problem naturally. JanSetu AI asks adaptive follow-up questions to identify all potential failure causes ranked by likelihood, with verification steps and resolution dossiers.'}
        </p>
      </div>

      {/* 2. Profile-Adaptive Common Problem Presets */}
      {!chatStarted && (
        <div className="bg-white border-2 border-taupe-300 rounded-3xl p-5 sm:p-7 shadow-sm space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-taupe-700 flex items-center justify-between flex-wrap gap-2">
            <span className="flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-600" />
              <span>
                {isHindi ? 'आपकी प्रोफ़ाइल अनुसार प्रमुख समस्याएं (1-Click Test):' : 'Common Problems for Your Profile (1-Click Test):'}
              </span>
            </span>
            {user && (
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                {user.avatar || '👤'} {user.occupation || user.role} ({user.name})
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3">
            {(PERSONA_DBT_PROBLEMS[activePersona] || PERSONA_DBT_PROBLEMS.farmer).map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(item)}
                className="p-3.5 bg-taupe-50 hover:bg-amber-50/70 border border-taupe-200 hover:border-amber-400 rounded-2xl text-left transition-all group hover:shadow-sm flex items-start gap-3"
              >
                <div className="text-xl p-1 bg-white rounded-xl border border-taupe-200 shrink-0">{item.icon}</div>
                <div>
                  <div className="text-xs font-bold text-taupe-900 group-hover:text-amber-950 leading-snug">
                    {isHindi ? item.labelHi : item.labelEn}
                  </div>
                  <div className="text-[11px] text-taupe-500 mt-1 line-clamp-2">
                    {isHindi ? item.textHi : item.textEn}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. Initial Input Box (When chat has not yet started) */}
      {!chatStarted && (
        <div className="bg-white border-2 border-taupe-300 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <label className="text-sm font-bold text-taupe-950 flex items-center gap-2">
              <ClipboardList size={18} className="text-taupe-800" />
              <span>
                {isHindi
                  ? 'अपनी समस्या हिंदी या अंग्रेज़ी में बताएं (माइक पर बोलें या लिखें):'
                  : 'Describe your DBT problem in Hindi or English (Speak or Type):'}
              </span>
            </label>

            {/* Mic Button */}
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
                  <span>{isHindi ? 'माइक पर बोलें (Voice)' : 'Speak Problem (Voice)'}</span>
                </>
              )}
            </button>
          </div>

          <textarea
            rows={3}
            value={problemInput}
            onChange={(e) => {
              setProblemInput(e.target.value);
              if (speechError) setSpeechError('');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleStartDiagnosis();
              }
            }}
            placeholder={
              isHindi
                ? 'जैसे: "मेरी पीएम किसान की 16वीं किस्त नहीं आई, बैंक में पूछा तो बोले आधार लिंक है फिर भी नहीं आया..." अथवा "कॉलेज स्कॉलरशिप पीएफएमएस पर रिजेक्ट हो गई..." (टाइप करके "एआई निदान शुरू करें" दबाएं)'
                : 'e.g. "My PM-KISAN installment stopped showing eKYC or Land Seeding pending..." or "Scholarship payment failed on PFMS due to account limit..."'
            }
            className="w-full p-4 bg-taupe-50 rounded-2xl border border-taupe-300 text-sm text-taupe-950 focus:outline-none focus:ring-2 focus:ring-taupe-700 leading-relaxed placeholder-taupe-400"
          />

          {speechError && (
            <div className="text-xs text-rose-600 flex items-center gap-1.5 font-medium">
              <AlertCircle size={14} />
              <span>{speechError}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-taupe-500 font-medium flex items-center gap-1">
              <ShieldCheck size={13} className="text-emerald-700" />
              <span>
                {isHindi
                  ? 'गोपनीयता सुरक्षित: कभी भी अपना ओटीपी, पासवर्ड या पूरा आधार नंबर न बताएं।'
                  : 'Privacy safe: Never share OTP, password, or full Aadhaar details.'}
              </span>
            </span>

            <button
              type="button"
              disabled={isDiagnosing}
              onClick={() => handleStartDiagnosis()}
              className="px-6 py-3 bg-taupe-900 hover:bg-black text-taupe-50 text-xs sm:text-sm font-bold rounded-2xl flex items-center gap-2 shadow-md transition-all disabled:opacity-50 hover:shadow-lg active:scale-95"
            >
              <Sparkles size={16} className="text-amber-300" />
              <span>{isHindi ? 'एआई निदान शुरू करें' : 'Start AI Diagnosis'}</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* 4. Active Interactive AI Diagnostic Chat Session */}
      {chatStarted && (
        <div className="bg-white border-2 border-taupe-300 rounded-3xl shadow-md overflow-hidden">
          {/* Chat Header Bar */}
          <div className="px-5 py-3.5 bg-taupe-900 text-taupe-50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center">
                <Bot size={18} />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-white">
                  {isHindi ? 'जनसेतु एआई डीबीटी जासूस' : 'JanSetu AI DBT Detective'}
                </h3>
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>
                    {diagnosisResult
                      ? (isHindi ? 'निदान पूर्ण (Multi-Cause Diagnosis Ready)' : 'Multi-Cause Diagnosis Ready')
                      : (isHindi ? 'जांच जारी (Adaptive Questioning)' : 'Adaptive Questioning Active')}
                  </span>
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={resetAll}
              className="px-3 py-1.5 text-xs text-taupe-200 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition-all flex items-center gap-1.5"
            >
              <RotateCcw size={13} />
              <span>{isHindi ? 'नई समस्या' : 'New Case'}</span>
            </button>
          </div>

          {/* Chat Messages Feed */}
          <div className="p-4 sm:p-6 space-y-4 max-h-[500px] overflow-y-auto bg-taupe-50/50">
            {messages.map((msg, idx) => {
              const isAssistant = msg.role === 'assistant';
              return (
                <div
                  key={idx}
                  className={`flex items-start gap-3 ${isAssistant ? 'justify-start' : 'justify-end'}`}
                >
                  {isAssistant && (
                    <div className="w-8 h-8 rounded-xl bg-taupe-900 text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-xs">
                      AI
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-xs ${
                      isAssistant
                        ? 'bg-white border border-taupe-200 text-taupe-950 font-medium'
                        : 'bg-taupe-900 text-white font-medium ml-auto'
                    }`}
                  >
                    <div className="whitespace-pre-line">{msg.content}</div>

                    {/* Question Callout inside Assistant Message */}
                    {msg.question && !diagnosisResult && (
                      <div className="mt-3 pt-3 border-t border-taupe-200 font-bold text-taupe-950 flex items-start gap-2">
                        <HelpCircle size={16} className="text-amber-700 shrink-0 mt-0.5" />
                        <span>{msg.question.text || (typeof msg.question === 'string' ? msg.question : '')}</span>
                      </div>
                    )}
                  </div>

                  {!isAssistant && (
                    <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-xs">
                      {user?.avatar || '👤'}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isDiagnosing && (
              <div className="flex items-start gap-3 justify-start animate-fade-in">
                <div className="w-8 h-8 rounded-xl bg-taupe-900 text-white flex items-center justify-center shrink-0 text-xs font-bold">
                  AI
                </div>
                <div className="bg-white border border-taupe-200 rounded-2xl p-3.5 shadow-xs flex items-center gap-2 text-xs text-taupe-600 font-medium">
                  <span className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-600 animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-amber-600 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2 h-2 rounded-full bg-amber-600 animate-bounce [animation-delay:0.4s]" />
                  </span>
                  <span>
                    {isHindi
                      ? 'जनसेतु एआई नियमों व कोषागार रिकॉर्ड्स का विश्लेषण कर रहा है...'
                      : 'JanSetu AI is analyzing treasury rules & previous answers...'}
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Interactive Button Choices (Adaptive) */}
          {currentQuestion && !isDiagnosing && !diagnosisResult && (
            <div className="p-4 bg-amber-50/60 border-t border-amber-200/80 space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1">
                <Sparkles size={13} className="text-amber-700" />
                <span>{isHindi ? '1-टैप में उत्तर चुनें (Quick Choice):' : 'Select Quick Response:'}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {currentQuestion.options && currentQuestion.options.length > 0 ? (
                  currentQuestion.options.map((opt, oIdx) => {
                    const label = typeof opt === 'string' ? opt : (opt.label || opt.text || opt.value || 'Option');
                    const val = typeof opt === 'string' ? opt : (opt.value || opt.label || opt.text || 'Option');
                    return (
                      <button
                        key={oIdx}
                        type="button"
                        onClick={() => handleSendAnswer(val)}
                        className="px-4 py-2.5 bg-white hover:bg-amber-100/80 border border-amber-300 hover:border-amber-500 rounded-xl text-xs font-bold text-taupe-950 transition-all shadow-2xs hover:shadow-xs active:scale-95 flex items-center gap-1.5"
                      >
                        <CheckCircle2 size={14} className="text-amber-700 shrink-0" />
                        <span>{label}</span>
                      </button>
                    );
                  })
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => handleSendAnswer(isHindi ? 'हाँ' : 'Yes')}
                      className="px-4 py-2 bg-white hover:bg-amber-100 border border-amber-300 rounded-xl text-xs font-bold text-taupe-900 active:scale-95"
                    >
                      {isHindi ? '✅ हाँ (YES)' : '✅ Yes'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendAnswer(isHindi ? 'नहीं' : 'No')}
                      className="px-4 py-2 bg-white hover:bg-amber-100 border border-amber-300 rounded-xl text-xs font-bold text-taupe-900 active:scale-95"
                    >
                      {isHindi ? '❌ नहीं (NO)' : '❌ No'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendAnswer(isHindi ? 'पता नहीं' : 'Not sure')}
                      className="px-4 py-2 bg-white hover:bg-amber-100 border border-amber-300 rounded-xl text-xs font-bold text-taupe-900 active:scale-95"
                    >
                      {isHindi ? '❓ पता नहीं (NOT SURE)' : '❓ Not Sure'}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Bottom Chat Input Bar */}
          {!diagnosisResult && (
            <div className="p-3 sm:p-4 bg-white border-t border-taupe-200 flex items-center gap-2">
              <button
                type="button"
                onClick={handleVoiceInput}
                className={`p-2.5 rounded-xl border transition-all ${
                  isListening
                    ? 'bg-rose-600 text-white animate-pulse border-rose-600'
                    : 'bg-taupe-100 hover:bg-taupe-200 text-taupe-700 border-taupe-300'
                }`}
                title={isHindi ? 'माइक पर बोलें' : 'Speak'}
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>

              <input
                type="text"
                value={problemInput}
                onChange={(e) => setProblemInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (problemInput.trim()) handleSendAnswer(problemInput);
                  }
                }}
                disabled={isDiagnosing}
                placeholder={
                  isHindi
                    ? 'अपना उत्तर टाइप करें या ऊपर बटन दबाएं...'
                    : 'Type custom response or choose a button above...'
                }
                className="flex-1 px-4 py-2.5 bg-taupe-50 rounded-xl border border-taupe-300 text-xs sm:text-sm text-taupe-950 focus:outline-none focus:ring-2 focus:ring-taupe-700 placeholder-taupe-400"
              />

              <button
                type="button"
                disabled={!problemInput.trim() || isDiagnosing}
                onClick={() => handleSendAnswer(problemInput)}
                className="px-4 py-2.5 bg-taupe-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all shadow-sm disabled:opacity-40 flex items-center gap-1.5 active:scale-95"
              >
                <span>{isHindi ? 'भेजें' : 'Send'}</span>
                <Send size={14} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* 5. Complete Final Diagnostic Resolution Package with Multiple Causes */}
      {diagnosisResult && (
        <div ref={reportRef} className="bg-white border-2 border-taupe-300 rounded-3xl p-6 sm:p-10 shadow-xl space-y-8 animate-fade-in">
          
          {/* Result Header & Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-taupe-200">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-taupe-100 text-taupe-800 px-2.5 py-0.5 rounded-full border border-taupe-200">
                  Case ID: {diagnosisResult.history_id}
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                  diagnosisResult.severity === 'Critical'
                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}>
                  {isHindi ? 'गंभीरता:' : 'Severity:'} {diagnosisResult.severity || 'High'}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                  <Clock size={11} />
                  <span>SLA: {diagnosisResult.resolution_sla || '48 Hours'}</span>
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-taupe-950">
                {diagnosisResult.case_title || diagnosisResult.issue_title}
              </h2>
              {diagnosisResult.affected_systems && (
                <div className="text-xs font-semibold text-taupe-500 mt-0.5">
                  {isHindi ? 'प्रभावित प्रणालियाँ:' : 'Affected Systems:'} {diagnosisResult.affected_systems}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={downloadPdfReport}
                className="px-4 py-2.5 bg-taupe-900 hover:bg-black text-taupe-50 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md transition-all active:scale-95"
              >
                <FileDown size={15} />
                <span>{isHindi ? 'आधिकारिक पीडीएफ रिपोर्ट' : 'Official PDF Report'}</span>
              </button>
              <button
                onClick={resetAll}
                className="p-2.5 text-taupe-600 hover:text-taupe-950 border border-taupe-300 rounded-xl hover:bg-taupe-100"
                title={isHindi ? 'नई समस्या जांचें' : 'Start New Diagnosis'}
              >
                <RotateCcw size={16} />
              </button>
            </div>
          </div>

          {/* Diagnostic Integrity Disclaimer */}
          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
            <Info size={16} className="text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-amber-950">
                {isHindi ? 'जांच व संभावना विश्लेषण (Probabilistic Assessment):' : 'Probabilistic Assessment Notice:'}
              </span>
              <span>
                {isHindi
                  ? 'सरकारी भुगतान रुकने के एक से अधिक तकनीकी कारण हो सकते हैं। नीचे दिए गए संभावित कारणों को प्राथमिकता (Likelihood) के अनुसार क्रमबद्ध किया गया है। प्रत्येक कारण के नीचे दिए गए "सत्यापन चरण" अवश्य देखें ताकि आप निश्चित हो सकें।'
                  : 'DBT failures frequently involve multiple technical bottlenecks. The causes below are ranked by likelihood based on your answers. Please review the verification steps for each cause to confirm the exact roadblock.'}
              </span>
            </div>
          </div>

          {/* 3. MULTI-CAUSE BREAKDOWN CARDS */}
          <div className="space-y-6">
            <h3 className="text-base font-extrabold text-taupe-950 flex items-center gap-2">
              <Search size={18} className="text-taupe-700" />
              <span>
                {isHindi
                  ? 'पहचाने गए संभावित कारण एवं उनका सत्यापन व समाधान:'
                  : 'Identified Potential Causes, Verification & Resolution:'}
              </span>
            </h3>

            {(diagnosisResult.possible_causes && diagnosisResult.possible_causes.length > 0
              ? diagnosisResult.possible_causes
              : [
                  {
                    title: diagnosisResult.issue_title || diagnosisResult.cause,
                    explanation: diagnosisResult.why_it_happened || diagnosisResult.guidance,
                    likelihood: 'High',
                    evidence: isHindi ? 'नागरिक द्वारा दी गई जानकारी' : 'Beneficiary reported situation',
                    verification_steps: [isHindi ? 'आधिकारिक पोर्टल पर लॉगिन करके स्थिति जांचें।' : 'Check status on official portal.'],
                    resolution_steps: diagnosisResult.action_steps || [],
                    official_portals: diagnosisResult.official_portals || []
                  }
                ]
            ).map((cause, cIdx) => {
              const likelihood = (cause.likelihood || 'Medium').toLowerCase();
              return (
                <div
                  key={cIdx}
                  className="bg-white border-2 border-taupe-200 rounded-2xl p-5 sm:p-7 shadow-xs space-y-5 hover:border-taupe-400 transition-all"
                >
                  {/* Cause Title & Likelihood Badge */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-taupe-200">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-taupe-900 text-white text-xs font-bold flex items-center justify-center shrink-0">
                        {cIdx + 1}
                      </span>
                      <h4 className="text-sm sm:text-base font-bold text-taupe-950">
                        {cause.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <span className="text-[11px] font-semibold text-taupe-500 uppercase tracking-wider">
                        {isHindi ? 'संभावना:' : 'Likelihood:'}
                      </span>
                      <span
                        className={`text-xs font-extrabold uppercase px-3 py-1 rounded-full border flex items-center gap-1 ${
                          likelihood === 'high'
                            ? 'bg-rose-100 text-rose-800 border-rose-300'
                            : likelihood === 'medium'
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : 'bg-slate-100 text-slate-800 border-slate-300'
                        }`}
                      >
                        {likelihood === 'high' && <Flame size={12} className="text-rose-600" />}
                        <span>{cause.likelihood || 'Medium'}</span>
                      </span>
                    </div>
                  </div>

                  {/* Explanation */}
                  <p className="text-xs sm:text-sm text-taupe-700 leading-relaxed font-medium">
                    {cause.explanation}
                  </p>

                  {/* Evidence Pill */}
                  {cause.evidence && (
                    <div className="p-3 bg-taupe-50 rounded-xl border border-taupe-200 text-xs text-taupe-800 flex items-start gap-2">
                      <span className="font-bold text-taupe-950 shrink-0">
                        {isHindi ? '📌 आपके उत्तरों से साक्ष्य:' : '📌 Evidence from your answers:'}
                      </span>
                      <span className="italic">{cause.evidence}</span>
                    </div>
                  )}

                  {/* How to Verify Section */}
                  {cause.verification_steps && cause.verification_steps.length > 0 && (
                    <div className="p-4 bg-sky-50/70 border border-sky-200 rounded-xl space-y-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-sky-950 flex items-center gap-1.5">
                        <CheckSquare size={14} className="text-sky-700" />
                        <span>
                          {isHindi
                            ? 'जांचें कि क्या यही वास्तविक कारण है (How to Verify):'
                            : 'How to Verify if this is the actual cause:'}
                        </span>
                      </span>
                      <ul className="space-y-1.5 pl-1">
                        {cause.verification_steps.map((vStep, vIdx) => (
                          <li key={vIdx} className="text-xs text-sky-900 flex items-start gap-2">
                            <span className="text-sky-600 font-bold">•</span>
                            <span>{vStep}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Step-by-Step Resolution */}
                  {cause.resolution_steps && cause.resolution_steps.length > 0 && (
                    <div className="space-y-2.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                        <CheckCircle2 size={15} className="text-emerald-700" />
                        <span>
                          {isHindi
                            ? 'इस कारण का समाधान कैसे करें (Resolution Steps):'
                            : 'How to Resolve this cause (Action Steps):'}
                        </span>
                      </span>
                      <div className="space-y-2">
                        {cause.resolution_steps.map((rStep, rIdx) => (
                          <div
                            key={rIdx}
                            className="p-3 bg-taupe-50 border border-taupe-200 rounded-xl flex items-start gap-2.5 text-xs text-taupe-900"
                          >
                            <span className="font-bold text-taupe-700 shrink-0">{rIdx + 1}.</span>
                            <div className="flex-1">
                              <PortalStepText text={rStep} isHindi={isHindi} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Official Direct Portal Links for this Cause */}
                  {cause.official_portals && cause.official_portals.length > 0 && (
                    <div className="pt-2 flex flex-wrap gap-2">
                      {cause.official_portals.map((portal, pIdx) => (
                        <a
                          key={pIdx}
                          href={portal.url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3.5 py-2 bg-white hover:bg-taupe-100 border border-taupe-300 hover:border-taupe-600 rounded-xl text-xs font-bold text-taupe-900 transition-all flex items-center gap-1.5 shadow-2xs group"
                        >
                          <span>{portal.name}</span>
                          <ExternalLink size={12} className="text-taupe-500 group-hover:text-black" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 4. Required Documents Checklist */}
          {diagnosisResult.required_documents && (
            <div className="bg-taupe-100/60 border border-taupe-200 rounded-2xl p-5 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wide text-taupe-900 flex items-center gap-1.5">
                <ClipboardList size={15} className="text-taupe-700" />
                <span>
                  {isHindi
                    ? 'बैंक या संबंधित कार्यालय ले जाने हेतु आवश्यक दस्तावेज़:'
                    : 'Required Documents Checklist to Carry to Bank / Department:'}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {diagnosisResult.required_documents.map((doc, dIdx) => (
                  <div
                    key={dIdx}
                    className="p-3 bg-white border border-taupe-300 rounded-xl text-xs font-semibold text-taupe-900 flex items-center gap-2 shadow-2xs"
                  >
                    <ShieldCheck size={14} className="text-emerald-700 shrink-0" />
                    <span>{doc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. Pre-Filled Formal Application Letter */}
          {diagnosisResult.application_letter && (
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-sm font-bold text-taupe-950 uppercase tracking-wide flex items-center gap-2">
                  <FileText size={16} className="text-amber-700" />
                  <span>
                    {isHindi
                      ? 'बैंक शाखा अथवा सक्षम अधिकारी हेतु तैयार प्रार्थना पत्र:'
                      : 'Pre-Filled Formal Application Letter for Bank / Office:'}
                  </span>
                </h3>
                <button
                  type="button"
                  onClick={handleCopyLetter}
                  className="px-3.5 py-1.5 bg-taupe-100 hover:bg-taupe-200 text-taupe-900 border border-taupe-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs active:scale-95"
                >
                  {copiedLetter ? (
                    <>
                      <Check size={14} className="text-emerald-700" />
                      <span className="text-emerald-700">{isHindi ? 'कॉपी हो गया!' : 'Copied!'}</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>{isHindi ? 'पत्र कॉपी करें' : 'Copy Application'}</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-5 bg-taupe-50 rounded-2xl border border-taupe-300 font-mono text-xs text-taupe-900 whitespace-pre-line leading-relaxed shadow-inner">
                {diagnosisResult.application_letter}
              </div>
              <p className="text-[11px] text-taupe-500 italic">
                {isHindi
                  ? '* सुझाव: इस पत्र को कॉपी कर सादे कागज पर लिखें या प्रिंट निकालें, हस्ताक्षर करें और अपनी बैंक शाखा अथवा संबंधित अधिकारी को प्रस्तुत करें।'
                  : '* Tip: Copy this pre-filled application, sign it, and submit directly to your home branch manager or nodal office.'}
              </p>
            </div>
          )}

          {/* 6. Designated Escalation Authority */}
          <div className="p-6 bg-taupe-100/70 border border-taupe-300 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-taupe-600 block">
                {isHindi ? 'शिकायत निवारण एवं उच्च अधिकारी:' : 'Designated Escalation Authority:'}
              </span>
              <span className="text-sm font-bold text-taupe-950 block mt-0.5">
                {diagnosisResult.escalation_authority || 'Bank Branch Manager / Banking Ombudsman (RBI CMS)'}
              </span>
            </div>

            {diagnosisResult.escalation_url && (
              <a
                href={diagnosisResult.escalation_url}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 bg-taupe-900 hover:bg-black text-taupe-50 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
              >
                <span>{isHindi ? 'ऑनलाइन शिकायत दर्ज करें' : 'Lodge Escalation'}</span>
                <ExternalLink size={13} />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default DBTDetective;
