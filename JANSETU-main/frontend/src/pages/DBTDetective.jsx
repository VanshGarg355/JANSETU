import React, { useState } from 'react';
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
  ClipboardList
} from 'lucide-react';

// Local zero-latency resilient fallback matching engine
function diagnoseDbtProblemLocally(problemText, isHindi, citizenName = 'Citizen Beneficiary') {
  const text = (problemText || '').toLowerCase().trim();
  const historyId = 'DBT-' + Date.now().toString(36).toUpperCase();

  const isKisan = /kisan|farmer|kheti|fasal|crop|2000|kist|installment|land|zameen|bhoomi|patwari|khatauni|किसान|खेती|फसल|किस्त|खतौनी|भूमि/.test(text);
  const isStudent = /scholarship|student|school|college|fee|fees|nsp|marksheet|matric|chhatravritti|छात्र|छात्रा|छात्रवृत्ति|स्कॉलरशिप|कॉलेज|फीस/.test(text);
  const isPension = /pension|elderly|senior|bujurg|vriddha|widow|vidhwa|jeevan|pramaan|life certificate|पेंशन|बुजुर्ग|वृद्धावस्था|विधवा|जीवन प्रमाण/.test(text);
  const isHousing = /awas|pmay|housing|makan|ghar|chhat|pucca|kutcha|geotag|आवास|मकान|घर|छत/.test(text);

  const mentionsEkyc = /ekyc|e-kyc|otp|biometric|ई-केवाईसी|केवाईसी|ओटीपी|बायोमेट्रिक/.test(text);
  const mentionsLand = /land|zameen|bhoomi|khatauni|patwari|lekhpal|जमीन|भूमि|खतौनी|पटवारी|लेखपाल/.test(text);
  const mentionsLimit = /limit|jandhan|100000|1 lakh|small account|dormant|inactive|क्रेडिट सीमा|जनधन|निष्क्रिय|बंद/.test(text);

  let result = null;

  // 1. PM-KISAN
  if (isKisan) {
    if (mentionsEkyc) {
      result = {
        category: isHindi ? 'कृषि (Agriculture)' : 'Agriculture',
        issue_title: isHindi ? 'पीएम-किसान: ई-केवाईसी (e-KYC) सत्यापन अधूरा' : 'PM-KISAN: e-KYC Verification Incomplete',
        cause: isHindi
          ? 'पीएम-किसान पोर्टल पर आधार आधारित बायोमेट्रिक या ओटीपी ई-केवाईसी का सत्यापन लंबित है।'
          : 'Biometric or OTP-based Aadhaar e-KYC is incomplete on the central PM-KISAN portal.',
        severity: 'Critical',
        affected_system: 'PM-KISAN National Portal & UIDAI Auth',
        resolution_sla: '24 Hours (Immediate upon OTP)',
        guidance: isHindi
          ? 'भारत सरकार के दिशा-निर्देशों के अनुसार 13वीं किस्त से सभी किसानों के लिए e-KYC अनिवार्य कर दिया गया है। जब तक ई-केवाईसी पोर्टल पर "YES" नहीं होगा, FTO जनरेट नहीं होगा।'
          : 'Under Government of India norms, e-KYC is strictly mandatory for releasing PM-KISAN benefits. Beneficiaries without verified e-KYC are barred from FTO token generation.',
        action_steps: [
          isHindi ? 'pmkisan.gov.in पोर्टल पर जाएं और होमपेज पर "e-KYC" विकल्प चुनें।' : 'Visit pmkisan.gov.in and click on the "e-KYC" link on the homepage.',
          isHindi ? 'अपना 12 अंकों का आधार नंबर दर्ज करें और आधार से जुड़े मोबाइल नंबर पर प्राप्त OTP डालें।' : 'Enter your 12-digit Aadhaar number and submit the OTP sent to your linked mobile number.',
          isHindi ? 'यदि मोबाइल नंबर आधार से लिंक नहीं है, तो नजदीकी CSC / ग्राहक सेवा केंद्र पर जाकर बायोमेट्रिक (फिंगरप्रिंट) से e-KYC कराएं।' : 'If mobile is not linked, visit your nearest CSC / VLE center for biometric fingerprint e-KYC.',
          isHindi ? 'e-KYC पूर्ण होने के 24-48 घंटे बाद "Beneficiary Status" में जाकर सत्यापन की जांच करें।' : 'Check Beneficiary Status after 24-48 hours to confirm the e-KYC status shows "YES".'
        ],
        required_documents: ['Aadhaar Card (मूल आधार कार्ड)', 'Aadhaar-linked Mobile Number (ओटीपी हेतु)', 'PM-KISAN Registration Number'],
        official_portals: [
          { name: 'PM-KISAN e-KYC Portal', url: 'https://pmkisan.gov.in/aadharekyc.aspx', desc: 'Direct 1-Click eKYC link' },
          { name: 'PM-KISAN Beneficiary Status', url: 'https://pmkisan.gov.in/BeneficiaryStatus_New.aspx', desc: 'Check eligibility & FTO status' }
        ],
        application_letter: `सेवा में,\nश्रीमान कृषि नोडल अधिकारी / उप कृषि निदेशक,\nविकास भवन / ब्लॉक कार्यालय, [जिले का नाम]\n\nविषय: पीएम-किसान सम्मान निधि की रुकी हुई किस्त e-KYC पूर्ण कराने के उपरांत जारी करने हेतु।\n\nमहोदय,\nसविनय निवेदन है कि मैं [किसान का नाम], ग्राम [गांव का नाम], ब्लॉक [ब्लॉक], रजिस्ट्रेशन नंबर [रजिस्ट्रेशन नंबर] का पंजीकृत लाभार्थी किसान हूँ।\n\nमेरी सम्मान निधि की पिछली किस्तें e-KYC लंबित होने के कारण रुक गई थीं। अब मैंने अपना आधार e-KYC सफलतापूर्वक पूर्ण करा लिया है।\n\nअतः श्रीमान जी से विनम्र निवेदन है कि मेरे डेटा को पोर्टल पर सत्यापित कर मेरी रुकी हुई किस्तों का भुगतान मेरे आधार सीडेड बैंक खाते में कराने की कृपा करें।\n\nसधन्यवाद,\nहस्ताक्षर/अंगूठा: [किसान का नाम]\nमोबाइल नंबर: [मोबाइल नंबर]\nसंलग्नक: 1. आधार कार्ड प्रति 2. ई-केवाईसी पावती रसीद 3. खतौनी नकल`,
        escalation_authority: 'PM-KISAN Helpdesk (155261 / 1800115526) / District Agriculture Office',
        escalation_url: 'https://pmkisan.gov.in/'
      };
    } else if (mentionsLand) {
      result = {
        category: isHindi ? 'कृषि (Agriculture)' : 'Agriculture',
        issue_title: isHindi ? 'पीएम-किसान: भू-अभिलेख सत्यापन (Land Seeding) "NO"' : 'PM-KISAN: Land Seeding Status "NO"',
        cause: isHi
          ? 'राजस्व विभाग के भूलेख रिकॉर्ड से किसान के जमीन विवरण का मिलान न होने के कारण Land Seeding "NO" दर्ज है।'
          : 'Land holding records not seeded or verified in state revenue database, marking Land Seeding as "NO".',
        severity: 'Critical',
        affected_system: 'State Bhulekh & PM-KISAN Portal',
        resolution_sla: '7 to 15 Working Days',
        guidance: isHindi
          ? 'पात्र किसान होने के बावजूद यदि आपके स्टेटस में "Land Seeding: NO" आ रहा है, तो कृषि विभाग को आपकी जमीन की खतौनी का सत्यापन लेखपाल/पटवारी से कराना आवश्यक है।'
          : 'If your status displays "Land Seeding: NO", treasury funds cannot be released until local revenue authorities (Patwari/Lekhpal) map your land survey number.',
        action_steps: [
          isHindi ? 'अपनी नवीनतम खतौनी (भू-अभिलेख नकल) तहसील या ऑनलाइन भूलेख पोर्टल से निकालें।' : 'Obtain a certified copy of your land records (Khatauni/ROR) from the revenue portal or tehsil.',
          isHindi ? 'आधार कार्ड, बैंक पासबुक और खतौनी की स्वप्रमाणित फोटोकॉपी संलग्न करें।' : 'Attach self-attested photocopies of your Aadhaar card, bank passbook, and Khatauni.',
          isHindi ? 'अपने क्षेत्र के लेखपाल (पटवारी) या ब्लॉक कृषि नोडल अधिकारी के पास जाकर भौतिक सत्यापन कराएं।' : 'Submit the documents to your local Lekhpal/Patwari or Block Agriculture Officer for manual verification.',
          isHindi ? 'सत्यापन के उपरांत अधिकारी द्वारा राज्य पोर्टल पर Land Seeding को "YES" कर दिया जाएगा।' : 'Once verified, the officer will update your status to "YES" on the PM-KISAN state nodal portal.'
        ],
        required_documents: ['Certified Khatauni / Land Record (खतौनी नकल)', 'Aadhaar Card (आधार कार्ड)', 'Bank Passbook (पासबुक)', 'PM-KISAN Status Printout'],
        official_portals: [
          { name: 'PM-KISAN Portal', url: 'https://pmkisan.gov.in/', desc: 'Check Land Seeding flag status' },
          { name: 'State Bhulekh Land Records', url: 'https://upbhulekh.gov.in/', desc: 'Download certified Khatauni' }
        ],
        application_letter: `सेवा में,\nश्रीमान उप-जिलाधिकारी (SDM) / तहसीलदार महोदय,\nतहसील [तहसील का नाम], जिला [जिले का नाम]\n\nविषय: पीएम-किसान पोर्टल पर भू-अभिलेख (Land Seeding) सत्यापित कर "YES" कराने हेतु प्रार्थना पत्र।\n\nमहोदय,\nसविनय निवेदन है कि प्रार्थी [किसान का नाम], निवासी ग्राम [गांव], ब्लॉक [ब्लॉक] का मूल निवासी है। प्रार्थी के नाम खाता संख्या [खाता संख्या] एवं खसरा संख्या [खसरा संख्या] में कृषि भूमि दर्ज है।\n\nप्रार्थी का पीएम-किसान पंजीकरण संख्या [पंजीकरण संख्या] है। वर्तमान में पोर्टल पर प्रार्थी का Land Seeding स्टेटस "NO" प्रदर्शित हो रहा है, जिस कारण किस्तें रुकी हुई हैं।\n\nअतः श्रीमान जी से विनम्र अनुरोध है कि प्रार्थी के भू-अभिलेखों का सत्यापन कराकर पोर्टल पर Land Seeding "YES" कराने के आदेश देने की कृपा करें।\n\nप्रार्थी: [किसान का नाम]\nमोबाइल: [मोबाइल नंबर]\nसंलग्नक: 1. प्रमाणित खतौनी 2. आधार कार्ड 3. स्टेटस प्रिंटआउट`,
        escalation_authority: 'Tehsildar / Sub-Divisional Magistrate (SDM) / District Magistrate',
        escalation_url: 'https://pmkisan.gov.in/'
      };
    } else {
      result = {
        category: isHindi ? 'कृषि (Agriculture)' : 'Agriculture',
        issue_title: isHindi ? 'पीएम-किसान: एनपीसीआई आधार सीडिंग अथवा स्टॉप पेमेंट' : 'PM-KISAN: Aadhaar Seeding / Stop Payment Resolution',
        cause: isHindi
          ? 'बैंक खाते में एनपीसीआई आधार पेमेंट ब्रिज (DBT Mandate) सक्रिय नहीं है अथवा राज्य सरकार द्वारा सत्यापन रोका गया है।'
          : 'Bank account is not mapped in NPCI DBT Mapper or state clearance is withheld.',
        severity: 'High',
        affected_system: 'NPCI Aadhaar Payment Bridge & PM-KISAN',
        resolution_sla: '48 to 72 Hours',
        guidance: isHindi
          ? 'पीएम-किसान योजना में 100% भुगतान केवल आधार-सीडेड बैंक खाते (NPCI APBS) में ही भेजा जाता है। यदि आपका बैंक खाता आधार से केवल KYC लिंक्ड है और NPCI में सीड नहीं है, तो पैसा कभी नहीं पहुंचेगा।'
          : 'All PM-KISAN disbursements strictly require NPCI Aadhaar Payment Bridge mapping. Standard bank Aadhaar linkage is insufficient; DBT Mandate must be active.',
        action_steps: [
          isHindi ? 'UIDAI या बैंक मैपर पोर्टल पर जांचें कि आपका कौन सा बैंक खाता NPCI से जुड़ा है।' : 'Check which bank account is currently seeded in NPCI mapper via UIDAI or bank portal.',
          isHindi ? 'अपनी बैंक शाखा में जाएं और "NPCI आधार सीडिंग / DBT सहमति पत्र" (Mandate Form) जमा करें।' : 'Visit your primary bank branch and submit the official "Aadhaar Seeding DBT Mandate Form".',
          isHindi ? 'बैंक अधिकारी से कहें कि खाते को NPCI DBT मैपर पर Active करें।' : 'Ask the bank executive specifically to activate the DBT Credit flag on NPCI mapper.',
          isHindi ? 'यदि बैंक में देरी हो तो इंडिया पोस्ट पेमेंट्स बैंक (IPPB) में नया खाता खुलवाएं, जिसमें स्वतः NPCI सीडिंग हो जाती है।' : 'Alternative: Open an India Post Payments Bank (IPPB) account which enables instant NPCI DBT mapping.'
        ],
        required_documents: ['Aadhaar Card (आधार कार्ड)', 'Bank Passbook (बैंक पासबुक)', 'NPCI DBT Mandate Form', 'Passport Size Photo'],
        official_portals: [
          { name: 'UIDAI Bank Seeding Checker', url: 'https://resident.uidai.gov.in/bank-mapper', desc: 'Verify NPCI Mapping Status' },
          { name: 'PM-KISAN Beneficiary Status', url: 'https://pmkisan.gov.in/', desc: 'Check PFMS Acceptance' }
        ],
        application_letter: `सेवा में,\nश्रीमान शाखा प्रबंधक महोदय,\n[बैंक का नाम], शाखा [शाखा का नाम]\n\nविषय: बैंक खाते को NPCI DBT मैपर से आधार सीड करने हेतु आवेदन पत्र।\n\nमहोदय,\nसविनय निवेदन है कि प्रार्थी [किसान का नाम] का एक बचत खाता संख्या [खाता संख्या] आपकी शाखा में संचालित है। प्रार्थी का आधार संख्या [आधार संख्या] है।\n\nप्रार्थी को पीएम-किसान सम्मान निधि एवं अन्य सरकारी योजनाओं की धनराशि प्राप्त करने हेतु इस बैंक खाते को NPCI मैपर में आधार के साथ लिंक/सीड कराना है।\n\nअतः आपसे विनम्र निवेदन है कि प्रार्थी के उक्त खाते को NPCI DBT मैपर में आधार सीडिंग करने की कृपा करें जिससे सरकारी किस्तें निर्बाध रूप से प्राप्त हो सकें।\n\nसधन्यवाद,\nप्रार्थी: [किसान का नाम]\nमोबाइल: [मोबाइल]\nसंलग्नक: आधार कार्ड, पासबुक एवं डीबीटी सहमति पत्र`,
        escalation_authority: 'Bank Branch Manager / Banking Ombudsman (RBI CMS)',
        escalation_url: 'https://cms.rbi.org.in/'
      };
    }
  }

  // 2. Scholarship
  else if (isStudent) {
    if (mentionsLimit) {
      result = {
        category: isHindi ? 'शिक्षा (Education)' : 'Education',
        issue_title: isHindi ? 'छात्रवृत्ति: बैंक खाते की क्रेडिट लिमिट पार (PFMS रिजेक्शन)' : 'Scholarship: Bank Account Credit Limit Exceeded',
        cause: isHindi
          ? 'छात्र का बैंक खाता जनधन / बेसिक बचत खाता (PMJDY) है, जिसमें ₹1,00,000 की वार्षिक क्रेडिट सीमा पार होने के कारण बैंक ने भुगतान रिजेक्ट कर दिया।'
          : 'Scholarship disbursement exceeded the Rs 1,00,000 annual deposit ceiling of basic PMJDY/Small Savings account.',
        severity: 'High',
        affected_system: 'PFMS & Core Banking System (CBS)',
        resolution_sla: '48 Hours (Account Upgrade)',
        guidance: isHindi
          ? 'जब उच्च शिक्षा छात्रवृत्ति या हॉस्टल फीस की राशि जनधन खाते की सीमा से अधिक होती है, तो बैंक कोर बैंकिंग सिस्टम "Credit Limit Exceeded" कोड के साथ PFMS को भुगतान लौटा देता है।'
          : 'When tuition reimbursement exceeds PMJDY ceiling limits, bank systems reject the batch. The account must be converted to Regular Savings.',
        action_steps: [
          isHindi ? 'अपनी बैंक शाखा में जाएं और बैंक प्रबंधक को सूचित करें कि छात्रवृत्ति राशि क्रेडिट सीमा से अधिक है।' : 'Visit your home bank branch and inform the branch manager that scholarship funds exceed the limit.',
          isHindi ? 'पूर्ण बायोमेट्रिक री-केवाईसी (PAN कार्ड या फॉर्म 60) जमा करके खाते को नियमित बचत खाते (Regular Savings) में अपग्रेड कराएं।' : 'Submit full biometric re-KYC (PAN card/Form 60) to upgrade to a Regular Savings Account.',
          isHindi ? 'बैंक से खाता सक्रियता व सीमा विस्तार का प्रमाण पत्र (Status Slip) प्राप्त करें।' : 'Collect an account upgrade confirmation slip with unrestricted credit status.',
          isHindi ? 'छात्रवृत्ति पोर्टल (NSP) पर जाकर PFMS री-ट्रांजेक्शन हेतु अनुरोध दर्ज करें।' : 'Request your institute or NSP portal desk to trigger PFMS re-payment.'
        ],
        required_documents: ['Aadhaar Card', 'PAN Card (or Form 60)', 'College Bonafide Certificate', 'Bank Passbook'],
        official_portals: [
          { name: 'PFMS Track Payments', url: 'https://pfms.nic.in/NewDefaultHome.aspx', desc: 'Track PFMS rejection reason' },
          { name: 'National Scholarship Portal', url: 'https://scholarships.gov.in/', desc: 'NSP Student Dashboard' }
        ],
        application_letter: `सेवा में,\nश्रीमान शाखा प्रबंधक महोदय,\n[बैंक का नाम], शाखा [शाखा का नाम]\n\nविषय: छात्रवृत्ति प्राप्त करने हेतु जनधन/लघु बचत खाते को नियमित बचत खाते में अपग्रेड करने विषयक।\n\nमहोदय,\nसविनय निवेदन है कि प्रार्थी [छात्र का नाम] का बचत खाता संख्या [खाता संख्या] आपकी शाखा में है। प्रार्थी [कॉलेज का नाम] में [कोर्स का नाम] का नियमित छात्र है।\n\nप्रार्थी की राष्ट्रीय छात्रवृत्ति (NSP) स्वीकृत हो चुकी है, किंतु खाते पर अधिकतम जमा सीमा (Credit Limit) होने के कारण PFMS द्वारा भुगतान रोक दिया गया है।\n\nअतः आपसे करबद्ध प्रार्थना है कि प्रार्थी की पूर्ण केवाईसी कर खाते को नियमित बचत खाते में अपग्रेड करने की कृपा करें ताकि छात्रवृत्ति खाते में आ सके।\n\nप्रार्थी: [छात्र का नाम]\nमोबाइल: [मोबाइल]\nसंलग्नक: 1. आधार कार्ड 2. पैन कार्ड 3. कॉलेज आईडी व बोनाफाइड`,
        escalation_authority: 'Bank Branch Manager / PFMS Helpdesk (1800 118 111)',
        escalation_url: 'https://pfms.nic.in/'
      };
    } else {
      result = {
        category: isHindi ? 'शिक्षा (Education)' : 'Education',
        issue_title: isHindi ? 'छात्रवृत्ति: एनपीसीआई आधार मैपिंग अथवा संस्थान सत्यापन लंबित' : 'Scholarship: NPCI Seeding or Institute Verification Pending',
        cause: isHindi
          ? 'छात्रवृत्ति पोर्टल पर कॉलेज नोडल अधिकारी द्वारा सत्यापन लंबित है अथवा एनपीसीआई आधार पेमेंट ब्रिज मैपर सक्रिय नहीं है।'
          : 'Scholarship release stalled due to pending Institute Nodal verification or inactive NPCI DBT mapping.',
        severity: 'High',
        affected_system: 'National Scholarship Portal (NSP) & PFMS',
        resolution_sla: '3 to 5 Working Days',
        guidance: isHindi
          ? 'NSP पोर्टल पर छात्रवृत्ति स्वीकृत होने के बाद PFMS द्वारा आधार-सीडेड खाते में ही भुगतान भेजा जाता है। यदि कॉलेज ने समय पर मेरिट लिस्ट में नाम सत्यापित नहीं किया या खाता एनपीसीआई से मैप नहीं है तो किस्त रुक जाती है।'
          : 'NSP scholarships route exclusively through Aadhaar Payment Bridge. Ensure your institute verifies your dossier and your bank account is mapped in the central NPCI registry.',
        action_steps: [
          isHindi ? 'NSP पोर्टल पर लॉगिन करके अपनी आवेदन स्थिति (Application Status) देखें कि पेंडिंग कहाँ है।' : 'Log in to scholarships.gov.in to check if the status shows "Pending at Institute Nodal Officer".',
          isHindi ? 'यदि कॉलेज स्तर पर लंबित है: अपने कॉलेज के छात्रवृत्ति प्रभारी से संपर्क कर तुरंत सत्यापन कराएं।' : 'If pending at college: Contact your college Scholarship In-charge/Registrar to verify documents immediately.',
          isHindi ? 'यदि "Push to PFMS Failed" दिख रहा है: बैंक जाकर NPCI आधार सीडिंग फॉर्म जमा करें।' : 'If status shows "PFMS Validation Failed": Submit Aadhaar Seeding form at your bank.',
          isHindi ? 'PFMS पोर्टल पर "Track NSP Payments" में जाकर ट्रांजेक्शन स्थिति ट्रैक करें।' : 'Track payment clearance via PFMS portal using your Application ID.'
        ],
        required_documents: ['10th/12th Marksheet', 'Scholarship Application Acknowledgement', 'College Fee Receipt & Bonafide', 'Aadhaar Card & Passbook'],
        official_portals: [
          { name: 'National Scholarship Portal', url: 'https://scholarships.gov.in/', desc: 'Student Login & Verification Tracking' },
          { name: 'PFMS Track NSP Payments', url: 'https://pfms.nic.in/NewDefaultHome.aspx', desc: 'Live Treasury Status' }
        ],
        application_letter: `सेवा में,\nश्रीमान संस्थान नोडल अधिकारी (छात्रवृत्ति प्रकोष्ठ),\n[कॉलेज / संस्थान का नाम], [शहर का नाम]\n\nविषय: छात्रवृत्ति आवेदन का सत्यापन NSP पोर्टल पर अग्रसारित करने हेतु।\n\nमहोदय,\nसविनय निवेदन है कि प्रार्थी [छात्र का नाम], आपके महाविद्यालय में [कक्षा/विभाग], रोल नंबर [रोल नंबर] का छात्र है। प्रार्थी का NSP एप्लीकेशन आईडी [एप्लीकेशन आईडी] है।\n\nप्रार्थी के आवेदन के सभी मूल दस्तावेज संलग्न हैं, किंतु पोर्टल पर अभी तक "Pending with Institute Nodal Officer" प्रदर्शित हो रहा है, जिसकी अंतिम तिथि निकट है।\n\nअतः आपसे सादर अनुरोध है कि प्रार्थी के अभिलेखों का सत्यापन कर आवेदन को राज्य/मंत्रालय स्तर पर अग्रसारित करने की कृपा करें।\n\nप्रार्थी: [छात्र का नाम]\nमोबाइल: [मोबाइल]`,
        escalation_authority: 'Institute Nodal Officer (INO) / District Welfare Officer (DWO)',
        escalation_url: 'https://scholarships.gov.in/'
      };
    }
  }

  // 3. Pension
  else if (isPension) {
    result = {
      category: isHindi ? 'पेंशन (Pension)' : 'Pension',
      issue_title: isHindi ? 'पेंशन: वार्षिक डिजिटल जीवन प्रमाण पत्र (Jeevan Pramaan) अथवा IFSC त्रुटि' : 'Pension: Digital Life Certificate (DLC) or IFSC Invalidation',
      cause: isHindi
        ? 'वार्षिक जीवन प्रमाण पत्र का समय पर नवीनीकरण न होना अथवा बैंक विलय के बाद पुराना IFSC कोड अमान्य होना।'
        : 'Lapse in submitting annual Digital Life Certificate (Jeevan Pramaan) or invalid IFSC post bank merger.',
      severity: 'Critical',
      affected_system: 'State Social Security Pension Portal & Jeevan Pramaan',
      resolution_sla: '48 to 72 Hours',
      guidance: isHindi
        ? 'वरिष्ठ नागरिक, वृद्धावस्था या विधवा पेंशन जारी रखने के लिए प्रतिवर्ष जीवन प्रमाण पत्र प्रस्तुत करना अनिवार्य है। इसके अभाव में समाज कल्याण विभाग स्वतः पेंशन रोक देता है।'
        : 'State pension directorates strictly freeze pension accounts if the annual Digital Life Certificate is not submitted. A simple biometric DLC instantly reactivates the pension.',
      action_steps: [
        isHindi ? 'डाकघर के डाकिया (IPPB Doorstep Service), CSC केंद्र या बैंक जाकर बायोमेट्रिक / फेस ऑथेंटिकेशन से जीवन प्रमाण पत्र जमा करें।' : 'Submit your Digital Life Certificate via your local postman (IPPB doorstep service), CSC center, or bank.',
        isHindi ? 'जीवन प्रमाण पत्र की पावती रसीद (Pramaan ID) सुरक्षित रखें।' : 'Retain the generated Pramaan ID receipt for department records.',
        isHindi ? 'यदि बैंक विलय हुआ है (जैसे PNB, Canara, BoB): नई पासबुक की प्रति विकास भवन में समाज कल्याण विभाग को दें।' : 'If bank merged: Submit an updated passbook copy with the new IFSC code to the Social Welfare Department.',
        isHindi ? 'राज्य पेंशन पोर्टल पर जाकर पेंशनर स्टेटस में नवीनीकरण की पुष्टि करें।' : 'Verify your active status on your State Social Security Pension portal.'
      ],
      required_documents: ['Pensioner PPO / Registration Number', 'Aadhaar Card', 'Pension Bank Account Passbook', 'Mobile Phone for OTP'],
      official_portals: [
        { name: 'Jeevan Pramaan Portal', url: 'https://jeevanpramaan.gov.in/', desc: 'Digital Life Certificate Portal' },
        { name: 'India Post Doorstep DLC', url: 'https://ippbonline.com/', desc: 'Request Postman at home' }
      ],
      application_letter: `सेवा में,\nश्रीमान जिला समाज कल्याण अधिकारी महोदय,\nविकास भवन, [जिले का नाम]\n\nविषय: जीवन प्रमाण पत्र प्रस्तुत करने के उपरांत रुकी हुई वृद्धावस्था/विधवा पेंशन बहाल करने हेतु।\n\nमहोदय,\nसविनय निवेदन है कि प्रार्थी/प्रार्थिया [पेंशनभोगी का नाम], निवासी [गांव/वार्ड], पेंशन रजिस्ट्रेशन/PPO संख्या [PPO संख्या] का पंजीकृत लाभार्थी है।\n\nमेरी मासिक पेंशन विगत कुछ माह से जीवन प्रमाण पत्र के अभाव में रुक गई थी। मैंने दिनांक [तारीख] को अपना डिजिटल जीवन प्रमाण पत्र (Pramaan ID: [प्रमाण आईडी]) सफलतापूर्वक दर्ज करा दिया है।\n\nअतः आपसे विनम्र प्रार्थना है कि प्रार्थी की रुकी हुई पेंशन राशि का बकाया सहित भुगतान पुनः शुरू कराने की कृपा करें।\n\nप्रार्थी/प्रार्थिया: [नाम]\nमोबाइल: [मोबाइल]\nसंलग्नक: 1. आधार कार्ड 2. जीवन प्रमाण पावती 3. बैंक पासबुक`,
      escalation_authority: 'District Social Welfare Officer (जिला समाज कल्याण अधिकारी) / Sub-Divisional Magistrate',
      escalation_url: 'https://jeevanpramaan.gov.in/'
    };
  }

  // 4. Housing
  else if (isHousing) {
    result = {
      category: isHindi ? 'आवास (Housing)' : 'Housing',
      issue_title: isHindi ? 'पीएम आवास योजना: जियो-टैगिंग (Geo-tagging) निरीक्षण लंबित' : 'PMAY: Construction Stage Geo-Tagging Verification Pending',
      cause: isHindi
        ? 'आवास निर्माण के अगले चरण (नींव/लिंटेल) का जियो-टैगिंग फोटो सत्यापन AwaasSoft पोर्टल पर अपलोड नहीं हुआ है।'
        : 'Next installment withheld pending field geo-tagging photo verification on the central AwaasSoft portal.',
      severity: 'Medium',
      affected_system: 'Ministry of Rural Development (AwaasSoft)',
      resolution_sla: '7 Working Days',
      guidance: isHindi
        ? 'प्रधानमंत्री आवास योजना में दूसरी या तीसरी किस्त तभी जारी होती है जब ग्राम विकास अधिकारी (VDO) निर्माण स्थल पर जाकर आवासऐप से जियो-टैग्ड फोटो अपलोड करता है।'
        : 'PMAY funds are released in strict milestones. Release of next tranche requires geo-tagged physical progress upload by the Block Development Officer / Awaas Mitra.',
      action_steps: [
        isHindi ? 'अपने ग्राम विकास अधिकारी (VDO) या आवास मित्र से संपर्क कर निर्माण स्थल के निरीक्षण का अनुरोध करें।' : 'Contact your Gram Panchayat Secretary (VDO) or Awaas Mitra for on-site inspection.',
        isHindi ? 'अधिकारी द्वारा AwaasApp के माध्यम से निर्माण के वर्तमान स्तर का फोटो खींचकर अपलोड कराया जाएगा।' : 'The officer will capture and upload geo-tagged coordinates of current construction.',
        isHindi ? 'AwaasSoft पोर्टल (rhreporting.nic.in) पर FTO (Fund Transfer Order) बनने की स्थिति जांचें।' : 'Track FTO generation status on the official rhreporting.nic.in portal.',
        isHindi ? 'ब्लॉक से अनुमोदन के 7-10 दिनों में धनराशि आधार-सीडेड खाते में जमा हो जाएगी।' : 'Funds will be transferred directly to your Aadhaar-seeded bank account within 7-10 days of approval.'
      ],
      required_documents: ['PMAY Beneficiary Registration ID', 'Aadhaar Card', 'Bank Passbook', 'Construction Site Photographs'],
      official_portals: [
        { name: 'PMAY AwaasSoft Status', url: 'https://rhreporting.nic.in/', desc: 'Check Geo-tagging & FTO Status' },
        { name: 'PMAY Urban Portal', url: 'https://pmaymis.gov.in/', desc: 'Urban Housing Status Tracking' }
      ],
      application_letter: `सेवा में,\nश्रीमान खंड विकास अधिकारी (BDO) महोदय,\nब्लॉक कार्यालय [ब्लॉक का नाम], जिला [जिले का नाम]\n\nविषय: प्रधानमंत्री आवास योजना (ग्रामीण) के अंतर्गत निर्माण स्थल का जियो-टैग सत्यापन कराकर अगली किस्त जारी करने हेतु।\n\nमहोदय,\nसविनय निवेदन है कि प्रार्थी [लाभार्थी का नाम], ग्राम [गांव], का पीएम आवास योजना पंजीकरण संख्या [पंजीकरण संख्या] है।\n\nप्रार्थी ने प्रथम किस्त की सहायता से नींव/लिंटेल स्तर तक का निर्माण पूर्ण करा लिया है। अगली किस्त के लिए जियो-टैगिंग सत्यापन अभी तक पोर्टल पर लंबित है।\n\nअतः आपसे विनम्र निवेदन है कि प्रार्थी के आवास का स्थलीय निरीक्षण कराकर जियो-टैग फोटो अपलोड कराने के आदेश देने की कृपा करें जिससे अगली किस्त प्राप्त हो सके।\n\nप्रार्थी: [नाम]\nमोबाइल: [मोबाइल]`,
      escalation_authority: 'Block Development Officer (BDO) / Chief Development Officer (CDO)',
      escalation_url: 'https://rhreporting.nic.in/'
    };
  }

  // 5. Default NPCI Seeding
  else {
    result = {
      category: isHindi ? 'बैंकिंग व पहचान (Banking)' : 'Banking & Identity',
      issue_title: isHindi ? 'आधार-बैंक सीडिंग एवं एनपीसीआई मैपर (DBT Mandate) विफलता' : 'Aadhaar-Bank Seeding & NPCI Mapper Failure',
      cause: isHindi
        ? 'आधार बैंक खाते में केवल KYC हेतु लिंक है, किंतु NPCI आधार पेमेंट ब्रिज (DBT मैपर) में सक्रिय नहीं है।'
        : 'Aadhaar is linked for KYC but the NPCI Aadhaar Payment Bridge (APB) DBT Credit Mandate is inactive.',
      severity: 'Critical',
      affected_system: 'NPCI Bharat Aadhaar Seeding Enabler (BASE) & PFMS',
      resolution_sla: '48 Hours',
      guidance: isHindi
        ? 'भारत में 80% से अधिक सरकारी किस्तों की विफलता का मुख्य कारण यह है कि नागरिक समझते हैं "आधार लिंक है मतलब पैसा आएगा"। वास्तविकता यह है कि बैंक को विशेष रूप से "DBT Mandate" सक्रिय करना पड़ता है।'
        : 'Over 80% of DBT failures in India stem from confounding "Aadhaar Linking (KYC)" with "NPCI DBT Seeding (Credit)". You must submit a specific DBT Mandate Form at your bank branch.',
      action_steps: [
        isHindi ? 'UIDAI या बैंक पोर्टल पर तुरंत जांचें कि आपका कौन सा बैंक खाता NPCI मैपर में सक्रिय है।' : 'Check which bank account is active on the NPCI central mapper using UIDAI portal.',
        isHindi ? 'अपनी बैंक शाखा में जाएं और नीचे दिया गया औपचारिक आवेदन पत्र और NPCI DBT Mandate फॉर्म जमा करें।' : 'Visit your bank branch with the pre-filled application letter below and official DBT Mandate Form.',
        isHindi ? 'बैंक अधिकारी से रिसीविंग पावती अवश्य लें और सुनिश्चित करें कि वे NPCI APBS मैपर पर Active करें।' : 'Insist on a stamped acknowledgment slip and verify status on PFMS after 48 hours.',
        isHindi ? 'यदि 5 दिनों में समस्या हल न हो, तो आरबीआई बैंकिंग लोकपाल (Banking Ombudsman) पोर्टल पर ऑनलाइन शिकायत दर्ज करें।' : 'If unresolved within 5 days, escalate to the RBI Banking Ombudsman portal (cms.rbi.org.in).'
      ],
      required_documents: ['Original Aadhaar Card (मूल आधार कार्ड)', 'Self-Attested Aadhaar Photocopy', 'Bank Passbook Photocopy', 'NPCI Mandate Consent Form'],
      official_portals: [
        { name: 'UIDAI Resident Bank Mapper', url: 'https://resident.uidai.gov.in/bank-mapper', desc: 'Direct NPCI Verification Portal' },
        { name: 'NPCI Bharat Aadhaar Seeding', url: 'https://www.npci.org.in/', desc: 'National Payments Corporation Portal' },
        { name: 'RBI Banking Ombudsman', url: 'https://cms.rbi.org.in/', desc: 'Escalate Unresolved Bank Grievance' }
      ],
      application_letter: `सेवा में,\nश्रीमान शाखा प्रबंधक महोदय,\n[बैंक का नाम], शाखा [शाखा का नाम]\n\nविषय: बचत खाते को NPCI DBT मैपर से आधार सीड/मैप करने हेतु प्रार्थना पत्र।\n\nमहोदय,\nसविनय निवेदन है कि प्रार्थी [नागरिक का नाम] का एक बचत खाता संख्या [खाता संख्या] आपकी शाखा में संचालित है। प्रार्थी का आधार संख्या [आधार संख्या] है।\n\nप्रार्थी को केंद्र एवं राज्य सरकार की प्रत्यक्ष लाभ अंतरण (DBT) योजनाओं का लाभ इसी बैंक खाते में प्राप्त करना है। वर्तमान में NPCI Aadhaar Payment Bridge में यह खाता सीड न होने के कारण सरकारी किस्तें अस्वीकृत (Rejected by Bank) हो रही हैं।\n\nअतः आपसे विनम्र प्रार्थना है कि प्रार्थी के उक्त खाते को NPCI मैपर में आधार के साथ लिंक/सीड करने की कृपा करें तथा पावती प्रदान करें।\n\nसधन्यवाद,\nप्रार्थी: [नाम]\nमोबाइल: [मोबाइल]\nसंलग्नक: 1. आधार कार्ड प्रति 2. बैंक पासबुक प्रति 3. NPCI DBT सहमति पत्र`,
      escalation_authority: 'Bank Branch Manager / RBI Banking Ombudsman',
      escalation_url: 'https://cms.rbi.org.in/'
    };
  }

  return {
    history_id: historyId,
    citizen_name: citizenName,
    diagnosed_at: new Date().toISOString(),
    analyzed_text: problemText,
    ...result
  };
}

export const DBT_PERSONA_TABS = [
  { key: 'farmer', labelEn: '🌾 Farmer DBT Issues', labelHi: '🌾 किसान DBT समस्याएं' },
  { key: 'student', labelEn: '🎓 Student Scholarship DBT', labelHi: '🎓 छात्र स्कॉलरशिप DBT' },
  { key: 'senior', labelEn: '👴 Pension DBT Failures', labelHi: '👴 पेंशन DBT विफलताएं' },
  { key: 'entrepreneur', labelEn: '💼 Business & Vendor DBT', labelHi: '💼 स्वनिधि व व्यवसाय DBT' }
];

export const PERSONA_DBT_PROBLEMS = {
  farmer: [
    {
      icon: '🌾',
      labelEn: 'PM-KISAN Installment Stopped (eKYC / Land Seeding)',
      labelHi: 'पीएम किसान की किस्त नहीं आई (e-KYC / लैंड सीडिंग)',
      textEn: 'My PM-KISAN installment was stopped. Status shows eKYC pending or Land Seeding NO in the portal.',
      textHi: 'मेरी पीएम-किसान की किस्त नहीं आई है। पोर्टल पर ई-केवाईसी या लैंड सीडिंग NO दिखा रहा है।'
    },
    {
      icon: '💳',
      labelEn: 'Aadhaar Linked but DBT Money not Credited (NPCI Mapping)',
      labelHi: 'आधार लिंक है फिर भी बैंक में DBT का पैसा नहीं आया (NPCI एरर)',
      textEn: 'My bank account is linked with Aadhaar, but government scheme money is not coming. Bank says active but PFMS says rejected by bank.',
      textHi: 'मेरा बैंक खाता आधार से लिंक है, लेकिन सरकारी योजनाओं का पैसा नहीं आ रहा। बैंक वाले कह रहे हैं आधार लिंक है फिर भी पैसा नहीं आया।'
    },
    {
      icon: '🛡️',
      labelEn: 'Crop Insurance Compensation Rejected on PFMS',
      labelHi: 'फसल बीमा क्लेम बैंक द्वारा निरस्त (PFMS रिजेक्शन)',
      textEn: 'My crop loss insurance claim under PMFBY was sanctioned by portal but PFMS says rejected due to account name mismatch.',
      textHi: 'मेरी फसल बीमा क्षतिपूर्ति स्वीकृत हो चुकी है लेकिन बैंक खाते में पैसा नहीं आया। पीएफएमएस पर नाम मिसमैच का एरर आ रहा है।'
    },
    {
      icon: '☀️',
      labelEn: 'Solar Pump / Kusum Subsidy Release Pending',
      labelHi: 'सोलर पंप / कुसुम सब्सिडी खाते में लंबित (ट्रेजरी सत्यापन)',
      textEn: 'I installed solar pump under PM Kusum, but state capital subsidy reimbursement has not been credited to my bank account.',
      textHi: 'पीएम कुसुम योजना में सोलर पंप लगाने के बाद सरकारी अनुदान की शेष राशि बैंक खाते में नहीं पहुंची है।'
    },
    {
      icon: '🚜',
      labelEn: 'SMAM Tractor Subsidy DBT Failure',
      labelHi: 'कृषि यंत्र सब्सिडी भुगतान अटका (DBT Mandate)',
      textEn: 'I purchased a rotavator under SMAM subsidy. The portal shows bill verified but DBT money is not credited.',
      textHi: 'मैंने कृषि यंत्रीकरण योजना में रोटावेटर खरीदा था, बिल अप्रूव हो गया है फिर भी सब्सिडी खाते में नहीं आई।'
    }
  ],
  student: [
    {
      icon: '🎓',
      labelEn: 'College Scholarship Payment Delayed / Credit Limit',
      labelHi: 'कॉलेज छात्रवृत्ति का भुगतान नहीं आया (NSP / लिमिट एरर)',
      textEn: 'I applied for college scholarship on NSP. It was sanctioned but payment failed in PFMS due to account limit or verification.',
      textHi: 'मेरी कॉलेज छात्रवृत्ति स्वीकृत हो चुकी है लेकिन बैंक खाते में पैसा नहीं आया। पीएफएमएस पर पेमेंट फेल्ड दिख रहा है।'
    },
    {
      icon: '💳',
      labelEn: 'DBT Payment Sent to Dormant / Inactive Account',
      labelHi: 'स्कॉलरशिप पुराने या बंद खाते में चली गई (APBS मैपर)',
      textEn: 'My scholarship payment was credited into an old dormant school bank account instead of my active college bank account.',
      textHi: 'मेरी स्कॉलरशिप का पैसा मेरे नए एक्टिव बैंक खाते के बदले पुराने बंद पड़े खाते में ट्रांसफर हो गया है।'
    },
    {
      icon: '⚠️',
      labelEn: 'Post-Matric Scholarship Bank Name Mismatch',
      labelHi: 'आधार व बैंक पासबुक नाम मिसमैच (Bank Rejection)',
      textEn: 'NSP scholarship disbursement failed with error: Beneficiary name does not match bank account records.',
      textHi: 'आधार कार्ड और बैंक खाते के नाम में अंतर होने की वजह से स्कॉलरशिप का डीबीटी ट्रांजैक्शन बैंक ने रिजेक्ट कर दिया।'
    },
    {
      icon: '🏛️',
      labelEn: 'State e-Kalyan / Fee Reimbursement Pending',
      labelHi: 'फीस प्रतिपूर्ति वजीफा ट्रेजरी स्तर पर लंबित',
      textEn: 'My university fee reimbursement scholarship has been verified at institute level but pending treasury clearance.',
      textHi: 'कॉलेज फीस प्रतिपूर्ति छात्रवृत्ति संस्थान से सत्यापित हो चुकी है लेकिन कोषागार से डीबीटी भुगतान नहीं हुआ।'
    }
  ],
  senior: [
    {
      icon: '👴',
      labelEn: 'Old Age / Widow Pension Disbursal Interrupted',
      labelHi: 'वृद्धावस्था / विधवा पेंशन बंद हो गई (जीवन प्रमाण पत्र)',
      textEn: 'My father old age pension has stopped for the last 3 months. Bank says pension not received from treasury.',
      textHi: 'मेरे पिताजी की वृद्धावस्था पेंशन पिछले 3 महीने से नहीं आई है। बैंक में पूछा तो बोले पेंशन नहीं आई।'
    },
    {
      icon: '📜',
      labelEn: 'Digital Life Certificate (Jeevan Pramaan) Pending',
      labelHi: 'डिजिटल जीवन प्रमाण पत्र अस्वीकृत या लंबित',
      textEn: 'I submitted biometric Jeevan Pramaan at CSC but treasury portal still shows life certificate pending and pension is on hold.',
      textHi: 'मैंने सीएससी से जीवन प्रमाण पत्र जमा किया था फिर भी पेंशन पोर्टल पर पेंडिंग दिख रहा है और पेंशन रुकी हुई है।'
    },
    {
      icon: '💰',
      labelEn: 'Atal Pension Yojana (APY) Monthly Deduction Discrepancy',
      labelHi: 'अटल पेंशन योजना ऑटो-डेबिट विफलता व पेनल्टी',
      textEn: 'My bank deducted auto-debit penalty for Atal Pension Yojana due to low balance, now my APY PRAN status shows regularized issue.',
      textHi: 'अटल पेंशन योजना की मासिक कटौती खाते में बैलेंस कम होने से फेल हो गई और अब पेंशन स्टेटस पर एरर दिखा रहा है।'
    },
    {
      icon: '🏥',
      labelEn: 'Ayushman Bharat Senior Reimbursement Stuck',
      labelHi: 'वरिष्ठ नागरिक अस्पताल प्रतिपूर्ति डीबीटी अटका',
      textEn: 'Hospital emergency treatment reimbursement claim under Senior Citizen healthcare has been pending payment order.',
      textHi: 'वरिष्ठ नागरिक के अस्पताल इलाज का क्लेम अप्रूव होने के बाद भी बैंक खाते में पैसा ट्रांसफर नहीं हुआ है।'
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
    },
    {
      icon: '🔨',
      labelEn: 'PM Vishwakarma ₹15,000 Toolkit e-Voucher Not Received',
      labelHi: 'पीएम विश्वकर्मा ₹15,000 टूलकिट ई-वाउचर नहीं मिला',
      textEn: 'I completed basic skill training under PM Vishwakarma scheme, but the Rs 15,000 digital e-RUPI toolkit voucher has not been issued to my mobile.',
      textHi: 'मैंने पीएम विश्वकर्मा की ट्रेनिंग पूरी कर ली है लेकिन टूलकिट खरीदने हेतु ₹15,000 का ई-वाउचर मोबाइल पर नहीं आया।'
    },
    {
      icon: '👩‍💼',
      labelEn: 'Mahila SHG Revolving Fund Subsidy Credit Failed',
      labelHi: 'महिला स्वयं सहायता समूह रिवॉल्विंग फंड डीबीटी विलंब',
      textEn: 'Our women SHG group revolving fund sanctioned under NRLM was not credited to our joint bank account.',
      textHi: 'हमारे महिला स्वयं सहायता समूह को मिलने वाला रिवॉल्विंग फंड और ब्याज छूट बैंक खाते में नहीं पहुंची है।'
    }
  ]
};

const COMMON_REAL_PROBLEMS = PERSONA_DBT_PROBLEMS.farmer;

const detectDbtPersona = (u) => {
  if (!u) return 'farmer';
  const text = ((u.role || '') + ' ' + (u.occupation || '') + ' ' + (u.name || '')).toLowerCase();
  if (text.includes('student') || text.includes('aarav') || text.includes('scholar') || text.includes('study') || text.includes('college')) return 'student';
  if (text.includes('senior') || text.includes('pension') || text.includes('kamla') || text.includes('bujurg') || text.includes('homemaker')) return 'senior';
  if (text.includes('artisan') || text.includes('shg') || text.includes('vendor') || text.includes('sunita') || text.includes('business') || text.includes('self-employed')) return 'entrepreneur';
  if (text.includes('farmer') || text.includes('kisan') || text.includes('krishi') || text.includes('rajesh') || text.includes('kheti')) return 'farmer';
  return 'farmer';
};

function DBTDetective() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const isHindi = i18n.language === 'hi';

  const activePersona = detectDbtPersona(user);

  const [problemText, setProblemText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState('');
  const [loading, setLoading] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState(null);
  const [copiedLetter, setCopiedLetter] = useState(false);

  // Voice Input (Web Speech API)
  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechError(
        isHindi
          ? 'आपके ब्राउज़र में वॉइस इनपुट समर्थित नहीं है। कृपया समस्या लिखकर बताएं।'
          : 'Voice input is not supported in this browser. Please type your problem.'
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
        const updated = problemText ? problemText + ' ' + transcript : transcript;
        setProblemText(updated);
        setIsListening(false);
      };

      recognition.onerror = (err) => {
        console.warn('Speech recognition error:', err);
        setSpeechError(
          isHindi
            ? 'ध्वनि स्पष्ट नहीं सुनी जा सकी। कृपया पुनः बोलें अथवा नीचे टाइप करें।'
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

  // Run Diagnosis
  const handleRunDiagnosis = async (textToAnalyze = null) => {
    const query = typeof textToAnalyze === 'string' ? textToAnalyze : problemText;

    if (!query.trim()) {
      setSpeechError(
        isHindi
          ? 'कृपया अपनी समस्या लिखें या माइक बटन दबाकर बोलें।'
          : 'Please describe your DBT failure problem or tap the microphone to speak.'
      );
      return;
    }

    setLoading(true);
    setSpeechError('');

    try {
      const res = await fetch('/api/dbt/analyze-problem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problem: query,
          language: isHindi ? 'hi' : 'en',
          citizen_name: user?.name || (isHindi ? 'नागरिक लाभार्थी' : 'Citizen Beneficiary')
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setDiagnosisResult(data);
          setLoading(false);
          return;
        }
      }
      // Resilient local analyzer
      const localRes = diagnoseDbtProblemLocally(query, isHindi, user?.name);
      setDiagnosisResult(localRes);
    } catch (err) {
      console.warn('Backend unavailable, running local real DBT diagnostic engine:', err);
      const localRes = diagnoseDbtProblemLocally(query, isHindi, user?.name);
      setDiagnosisResult(localRes);
    } finally {
      setLoading(false);
    }
  };

  const applyPreset = (preset) => {
    const txt = isHindi ? preset.textHi : preset.textEn;
    setProblemText(txt);
    setSpeechError('');
    // Notice: Does NOT auto-run; user clicks "समस्या का समाधान खोजें"
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
    setProblemText('');
    setDiagnosisResult(null);
    setSpeechError('');
    setCopiedLetter(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16 px-4 sm:px-6">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-950 text-xs font-semibold border border-amber-300">
          <AlertCircle size={14} className="text-amber-800" />
          <span>{isHindi ? 'डीबीटी विफलता जासूस • वास्तविक सरकारी समाधान' : 'DBT Failure Detective • Real Government Resolution'}</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-taupe-950">
          {isHindi ? 'रुकी हुई सरकारी किस्त का समाधान खोजें' : 'Diagnose & Resolve Stalled DBT Payments'}
        </h1>
        <p className="text-xs sm:text-sm text-taupe-600 leading-relaxed">
          {isHindi
            ? 'पीएम-किसान, छात्रवृत्ति, वृद्धावस्था पेंशन या आवास योजना का पैसा खाते में नहीं आया? अपनी समस्या बोलें या लिखें। जनसेतु वास्तविक कारण, आवश्यक दस्तावेज़ और बैंक हेतु तैयार आवेदन पत्र देगा।'
            : 'Payment stopped for PM-KISAN, Scholarship, Pension, or PMAY? Speak or type your problem. JanSetu diagnoses the root cause, extracts documents, and generates bank resolution letters.'}
        </p>
      </div>

      {/* Main Input Card: Voice & Text */}
      <div className="bg-white border-2 border-taupe-300 rounded-3xl p-5 sm:p-8 shadow-sm space-y-6">
        
        {/* Quick Common Problem Pills - Strictly Profile-Adaptive */}
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-taupe-700 mb-2.5 flex items-center gap-1.5">
            <Sparkles size={14} className="text-amber-600" />
            <span>
              {isHindi ? 'आपकी प्रोफ़ाइल अनुसार प्रमुख समस्याएं (Common Problems):' : 'Common Problems for Your Profile (DBT Issues):'}
            </span>
            {user && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                {user.avatar || '👤'} {user.occupation || user.role}
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {(PERSONA_DBT_PROBLEMS[activePersona] || PERSONA_DBT_PROBLEMS.farmer).map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(item)}
                className="p-3 bg-taupe-50 hover:bg-taupe-100 border border-taupe-200 hover:border-taupe-400 rounded-2xl text-left transition-all group hover:shadow-sm"
              >
                <div className="text-base mb-1">{item.icon}</div>
                <div className="text-xs font-bold text-taupe-900 group-hover:text-taupe-950 leading-snug">
                  {isHindi ? item.labelHi : item.labelEn}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Voice and Text Area */}
        <div className="pt-3 border-t border-taupe-200 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <label className="text-sm font-bold text-taupe-950 flex items-center gap-2">
              <ClipboardList size={18} className="text-taupe-800" />
              <span>
                {isHindi
                  ? 'अपनी समस्या बताएं (माइक पर बोलें या नीचे विस्तार से लिखें)'
                  : 'Describe the DBT Failure (Tap Mic to Speak or Type below)'}
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
                  <span>{isHindi ? 'माइक पर बोलें (Voice Input)' : 'Speak Problem (Voice)'}</span>
                </>
              )}
            </button>
          </div>

          <textarea
            rows={3}
            value={problemText}
            onChange={(e) => {
              setProblemText(e.target.value);
              if (speechError) setSpeechError('');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleRunDiagnosis();
              }
            }}
            placeholder={
              isHindi
                ? 'जैसे: "मेरी पीएम किसान की 16वीं किस्त नहीं आई, बैंक में पूछा तो बोले आधार लिंक है फिर भी नहीं आया..." अथवा "कॉलेज स्कॉलरशिप पीएफएमएस पर रिजेक्ट हो गई..." (टाइप करके "समस्या का समाधान खोजें" दबाएं)'
                : 'e.g. "My PM-KISAN installment stopped showing eKYC or Land Seeding pending..." or "Scholarship payment failed on PFMS due to account limit..." (Type & click "Analyze & Diagnose Failure")'
            }
            className="w-full p-4 bg-taupe-50 rounded-2xl border border-taupe-300 text-sm text-taupe-950 focus:outline-none focus:ring-2 focus:ring-taupe-700 leading-relaxed placeholder-taupe-400"
          />

          {speechError && (
            <div className="text-xs text-rose-600 flex items-center gap-1.5 font-medium">
              <AlertCircle size={14} />
              <span>{speechError}</span>
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={resetAll}
            className="text-xs font-semibold text-taupe-500 hover:text-taupe-800 flex items-center gap-1"
          >
            <RotateCcw size={13} />
            <span>{isHindi ? 'साफ़ करें' : 'Clear'}</span>
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => handleRunDiagnosis()}
            className="px-6 py-3 bg-taupe-900 hover:bg-black text-taupe-50 text-xs sm:text-sm font-bold rounded-xl flex items-center gap-2 shadow-md transition-all disabled:opacity-50 hover:shadow-lg active:scale-95"
          >
            <Sparkles size={16} className="text-amber-300" />
            <span>
              {loading
                ? (isHindi ? 'नियमों व पोर्टलों की जांच हो रही है...' : 'Diagnosing Failure...')
                : (isHindi ? 'समस्या का समाधान खोजें' : 'Analyze & Diagnose Failure')}
            </span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>

      {/* STATE 1: INITIAL READY GUIDE */}
      {!diagnosisResult && !loading && (
        <div className="bg-white border-2 border-dashed border-taupe-300 rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-2xs">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center text-3xl shadow-inner">
            🔍
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="text-base sm:text-lg font-extrabold text-taupe-950">
              {isHindi ? 'अपनी समस्या बताएं और 100% वास्तविक समाधान पाएं' : 'Describe Your Problem for Real Government Resolution'}
            </h3>
            <p className="text-xs text-taupe-600 leading-relaxed">
              {isHindi
                ? 'ऊपर बॉक्स में अपनी रुकी हुई किस्त की स्थिति लिखें या बोलें, फिर "समस्या का समाधान खोजें" पर क्लिक करें। वास्तविक कारण, पोर्टल लिंक और बैंक शाखा हेतु आवेदन पत्र तुरंत तैयार होगा।'
                : 'Type or speak your stalled payment situation above, then click "Analyze & Diagnose Failure". Get exact root cause, action steps, official portal links, and ready-to-use bank letters.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto pt-3 text-left">
            <div className="p-3 bg-taupe-50 rounded-2xl border border-taupe-200">
              <span className="text-[10px] font-bold text-taupe-500 uppercase tracking-wider block">चरण 1</span>
              <span className="text-xs font-bold text-taupe-900 block mt-0.5">समस्या बोलें या लिखें</span>
              <span className="text-[11px] text-taupe-600 block mt-0.5">पीएम-किसान, छात्रवृत्ति, पेंशन या आवास</span>
            </div>
            <div className="p-3 bg-taupe-50 rounded-2xl border border-taupe-200">
              <span className="text-[10px] font-bold text-taupe-500 uppercase tracking-wider block">चरण 2</span>
              <span className="text-xs font-bold text-taupe-900 block mt-0.5">बटन पर क्लिक करें</span>
              <span className="text-[11px] text-taupe-600 block mt-0.5">"समस्या का समाधान खोजें"</span>
            </div>
            <div className="p-3 bg-taupe-50 rounded-2xl border border-taupe-200">
              <span className="text-[10px] font-bold text-taupe-500 uppercase tracking-wider block">चरण 3</span>
              <span className="text-xs font-bold text-taupe-900 block mt-0.5">समाधान व बैंक पत्र लें</span>
              <span className="text-[11px] text-taupe-600 block mt-0.5">दस्तावेज़ सूची व तैयार आवेदन पत्र</span>
            </div>
          </div>
        </div>
      )}

      {/* STATE 2: LOADING */}
      {loading && (
        <div className="bg-white border-2 border-taupe-200 rounded-3xl p-10 sm:p-14 text-center space-y-4 shadow-sm animate-pulse">
          <div className="w-14 h-14 mx-auto rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-2xl animate-spin">
            <Sparkles size={26} />
          </div>
          <h3 className="text-base font-extrabold text-taupe-950">
            {isHindi ? 'PFMS, NPCI व सरकारी नियमों के आधार पर जांच जारी...' : 'Analyzing PFMS, NPCI & Government Treasury rules...'}
          </h3>
          <p className="text-xs text-taupe-600 max-w-sm mx-auto">
            {isHindi
              ? 'कृपया प्रतीक्षा करें, जनसेतु आपकी समस्या के सटीक कारण और बैंक हेतु समाधान की रूपरेखा तैयार कर रहा है।'
              : 'Please wait, JanSetu is detecting the rejection code and drafting an official bank resolution dossier.'}
          </p>
        </div>
      )}

      {/* STATE 3: RESULTS (REAL ACTIONABLE SOLUTIONS) */}
      {diagnosisResult && !loading && (
        <div className="bg-white border-2 border-taupe-200 rounded-3xl p-6 sm:p-10 shadow-lg space-y-8 animate-fade-in">
          
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
                {diagnosisResult.issue_title}
              </h2>
              <div className="text-xs font-semibold text-taupe-500 mt-0.5">
                {isHindi ? 'प्रभावित प्रणाली:' : 'Affected System:'} {diagnosisResult.affected_system || 'NPCI & PFMS'}
              </div>
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

          {/* Root Cause Card */}
          <div className="bg-amber-50/80 border border-amber-300 rounded-2xl p-6 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
              <AlertCircle size={16} /> {isHindi ? 'पहचाना गया वास्तविक कारण (Root Cause):' : 'Identified Root Cause:'}
            </span>
            <h3 className="text-lg font-bold text-taupe-950">
              {diagnosisResult.cause}
            </h3>
            <p className="text-xs sm:text-sm text-taupe-800 leading-relaxed pt-1">
              {diagnosisResult.guidance}
            </p>
          </div>

          {/* Action Steps */}
          {diagnosisResult.action_steps && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-taupe-950 uppercase tracking-wide flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-700" />
                <span>{isHindi ? 'कदम-दर-कदम आधिकारिक समाधान (Action Steps):' : 'Step-by-Step Resolution Steps:'}</span>
              </h3>
              <div className="space-y-2.5">
                {diagnosisResult.action_steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-taupe-50 border border-taupe-200 rounded-2xl flex items-start gap-3 shadow-2xs"
                  >
                    <span className="w-6 h-6 rounded-full bg-taupe-900 text-taupe-50 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-xs sm:text-sm text-taupe-900 leading-relaxed font-medium">
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Required Documents Checklist */}
          {diagnosisResult.required_documents && (
            <div className="bg-taupe-100/60 border border-taupe-200 rounded-2xl p-5 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wide text-taupe-900 flex items-center gap-1.5">
                <ClipboardList size={15} className="text-taupe-700" />
                <span>{isHindi ? 'बैंक या सीएससी ले जाने हेतु आवश्यक दस्तावेज़:' : 'Documents You Need to Carry to Bank / CSC:'}</span>
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

          {/* Official Government Direct Links */}
          {diagnosisResult.official_portals && diagnosisResult.official_portals.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-taupe-950 uppercase tracking-wide flex items-center gap-2">
                <ExternalLink size={16} className="text-taupe-700" />
                <span>{isHindi ? 'आधिकारिक सरकारी पोर्टल व सीधी लिंक:' : 'Official Government Portals & Direct Links:'}</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {diagnosisResult.official_portals.map((portal, pIdx) => (
                  <a
                    key={pIdx}
                    href={portal.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-4 bg-white border border-taupe-300 hover:border-taupe-600 rounded-2xl flex items-center justify-between gap-3 transition-all shadow-xs group"
                  >
                    <div>
                      <div className="text-xs font-bold text-taupe-950 group-hover:text-black flex items-center gap-1.5">
                        <span>{portal.name}</span>
                        <ExternalLink size={12} className="text-taupe-500 group-hover:text-black" />
                      </div>
                      <div className="text-[11px] text-taupe-500 mt-0.5">
                        {portal.desc}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-taupe-800 shrink-0 bg-taupe-100 group-hover:bg-taupe-200 px-3 py-1.5 rounded-xl">
                      {isHindi ? 'खोलें' : 'Open'}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Formal Bank Application Letter (Pre-Filled) */}
          {diagnosisResult.application_letter && (
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-sm font-bold text-taupe-950 uppercase tracking-wide flex items-center gap-2">
                  <FileText size={16} className="text-amber-700" />
                  <span>{isHindi ? 'बैंक शाखा प्रबंधक हेतु तैयार प्रार्थना पत्र:' : 'Pre-Filled Bank Branch Application Letter:'}</span>
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
                  ? '* सुझाव: आप ऊपर दिए गए पत्र को कॉपी करके सादे कागज पर लिख सकते हैं या प्रिंट निकालकर हस्ताक्षर सहित अपनी बैंक शाखा में जमा कर सकते हैं।'
                  : '* Tip: Copy this pre-filled application, sign, and submit directly to your home branch manager.'}
              </p>
            </div>
          )}

          {/* Official Designated Escalation Section */}
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
