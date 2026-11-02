const express = require('express');
const router = express.Router();
const { supabase } = require('../supabaseClient');
const demoIssues = require('../data/demoDbtIssues.json');
const demoScenarios = require('../data/demoScenarios.json');
const PDFDocument = require('pdfkit');

// In-memory diagnostic sessions for PDF generation
const inMemoryHistory = {};

// Helper: Intelligent Natural Language DBT Problem Analyzer
function analyzeDbtProblem(problemText, language = 'en', citizenName = 'Citizen Beneficiary') {
  const text = (problemText || '').toLowerCase().trim();
  const isHi = language === 'hi';
  const historyId = 'DBT-' + Date.now().toString(36).toUpperCase();

  // Keyword flags
  const isKisan = /kisan|farmer|kheti|fasal|crop|2000|kist|installment|land|zameen|bhoomi|patwari|khatauni|किसान|खेती|फसल|किस्त|खतौनी|भूमि/.test(text);
  const isStudent = /scholarship|student|school|college|fee|fees|nsp|marksheet|matric|chhatravritti|छात्र|छात्रा|छात्रवृत्ति|स्कॉलरशिप|कॉलेज|फीस/.test(text);
  const isPension = /pension|elderly|senior|bujurg|vriddha|widow|vidhwa|jeevan|pramaan|life certificate|पेंशन|बुजुर्ग|वृद्धावस्था|विधवा|जीवन प्रमाण/.test(text);
  const isHousing = /awas|pmay|housing|makan|ghar|chhat|pucca|kutcha|geotag|आवास|मकान|घर|छत/.test(text);
  
  // Specific sub-condition flags
  const mentionsEkyc = /ekyc|e-kyc|otp|biometric|ई-केवाईसी|केवाईसी|ओटीपी|बायोमेट्रिक/.test(text);
  const mentionsLand = /land|zameen|bhoomi|khatauni|patwari|lekhpal|जमीन|भूमि|खतौनी|पटवारी|लेखपाल/.test(text);
  const mentionsLimit = /limit|jandhan|100000|1 lakh|small account|dormant|inactive|क्रेडिट सीमा|जनधन|निष्क्रिय|बंद/.test(text);
  const mentionsLifeCert = /jeevan|pramaan|life certificate|expired|november|जीवित|जीवन प्रमाण/.test(text);

  let result = null;

  // 1. PM-KISAN Scenarios
  if (isKisan) {
    if (mentionsEkyc) {
      result = {
        category: 'Agriculture (कृषि)',
        issue_title: isHi ? 'पीएम-किसान: ई-केवाईसी (e-KYC) सत्यापन अधूरा' : 'PM-KISAN: e-KYC Verification Incomplete',
        cause: isHi
          ? 'पीएम-किसान पोर्टल पर आधार आधारित बायोमेट्रिक या ओटीपी ई-केवाईसी का सत्यापन लंबित है।'
          : 'Biometric or OTP-based Aadhaar e-KYC is incomplete on the central PM-KISAN portal.',
        severity: 'Critical',
        affected_system: 'PM-KISAN National Portal & UIDAI Auth',
        resolution_sla: '24 Hours (Immediate upon OTP)',
        guidance: isHi
          ? 'भारत सरकार के दिशा-निर्देशों के अनुसार 13वीं किस्त से सभी किसानों के लिए e-KYC अनिवार्य कर दिया गया है। जब तक ई-केवाईसी पोर्टल पर "YES" नहीं होगा, FTO जनरेट नहीं होगा।'
          : 'Under Government of India norms, e-KYC is strictly mandatory for releasing PM-KISAN benefits. Beneficiaries without verified e-KYC are barred from FTO token generation.',
        action_steps: [
          isHi ? 'pmkisan.gov.in पोर्टल पर जाएं और होमपेज पर "e-KYC" विकल्प चुनें।' : 'Visit pmkisan.gov.in and click on the "e-KYC" link on the homepage.',
          isHi ? 'अपना 12 अंकों का आधार नंबर दर्ज करें और आधार से जुड़े मोबाइल नंबर पर प्राप्त OTP डालें।' : 'Enter your 12-digit Aadhaar number and submit the OTP sent to your linked mobile number.',
          isHi ? 'यदि मोबाइल नंबर आधार से लिंक नहीं है, तो नजदीकी CSC / ग्राहक सेवा केंद्र पर जाकर बायोमेट्रिक (फिंगरप्रिंट) से e-KYC कराएं।' : 'If mobile is not linked, visit your nearest CSC / VLE center for biometric fingerprint e-KYC.',
          isHi ? 'e-KYC पूर्ण होने के 24-48 घंटे बाद "Beneficiary Status" में जाकर सत्यापन की जांच करें।' : 'Check Beneficiary Status after 24-48 hours to confirm the e-KYC status shows "YES".'
        ],
        required_documents: ['Aadhaar Card (आधार कार्ड)', 'Aadhaar-linked Mobile Number (ओटीपी हेतु)', 'PM-KISAN Registration ID'],
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
        category: 'Agriculture (कृषि)',
        issue_title: isHi ? 'पीएम-किसान: भू-अभिलेख सत्यापन (Land Seeding) "NO"' : 'PM-KISAN: Land Seeding Status "NO"',
        cause: isHi
          ? 'राजस्व विभाग के भूलेख रिकॉर्ड से किसान के जमीन विवरण का मिलान न होने के कारण Land Seeding "NO" दर्ज है।'
          : 'Land holding records not seeded or verified in state revenue database, marking Land Seeding as "NO".',
        severity: 'Critical',
        affected_system: 'State Bhulekh & PM-KISAN Portal',
        resolution_sla: '7 to 15 Working Days',
        guidance: isHi
          ? 'पात्र किसान होने के बावजूद यदि आपके स्टेटस में "Land Seeding: NO" आ रहा है, तो कृषि विभाग को आपकी जमीन की खतौनी का सत्यापन लेखपाल/पटवारी से कराना आवश्यक है।'
          : 'If your status displays "Land Seeding: NO", treasury funds cannot be released until local revenue authorities (Patwari/Lekhpal) map your land survey number.',
        action_steps: [
          isHi ? 'अपनी नवीनतम खतौनी (भू-अभिलेख नकल) तहसील या ऑनलाइन भूलेख पोर्टल से निकालें।' : 'Obtain a certified copy of your land records (Khatauni/ROR) from the revenue portal or tehsil.',
          isHi ? 'आधार कार्ड, बैंक पासबुक और खतौनी की स्वप्रमाणित फोटोकॉपी संलग्न करें।' : 'Attach self-attested photocopies of your Aadhaar card, bank passbook, and Khatauni.',
          isHi ? 'अपने क्षेत्र के लेखपाल (पटवारी) या ब्लॉक कृषि नोडल अधिकारी के पास जाकर भौतिक सत्यापन कराएं।' : 'Submit the documents to your local Lekhpal/Patwari or Block Agriculture Officer for manual verification.',
          isHi ? 'सत्यापन के उपरांत अधिकारी द्वारा राज्य पोर्टल पर Land Seeding को "YES" कर दिया जाएगा।' : 'Once verified, the officer will update your status to "YES" on the PM-KISAN state nodal portal.'
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
        category: 'Agriculture (कृषि)',
        issue_title: isHi ? 'पीएम-किसान: एनपीसीआई आधार सीडिंग अथवा स्टॉप पेमेंट' : 'PM-KISAN: Aadhaar Seeding / Stop Payment Resolution',
        cause: isHi
          ? 'बैंक खाते में एनपीसीआई आधार पेमेंट ब्रिज (DBT Mandate) सक्रिय नहीं है अथवा राज्य सरकार द्वारा सत्यापन रोका गया है।'
          : 'Bank account is not mapped in NPCI DBT Mapper or state clearance is withheld.',
        severity: 'High',
        affected_system: 'NPCI Aadhaar Payment Bridge & PM-KISAN',
        resolution_sla: '48 to 72 Hours',
        guidance: isHi
          ? 'पीएम-किसान योजना में 100% भुगतान केवल आधार-सीडेड बैंक खाते (NPCI APBS) में ही भेजा जाता है। यदि आपका बैंक खाता आधार से केवल KYC लिंक्ड है और NPCI में सीड नहीं है, तो पैसा कभी नहीं पहुंचेगा।'
          : 'All PM-KISAN disbursements strictly require NPCI Aadhaar Payment Bridge mapping. Standard bank Aadhaar linkage is insufficient; DBT Mandate must be active.',
        action_steps: [
          isHi ? 'UIDAI या बैंक मैपर पोर्टल पर जांचें कि आपका कौन सा बैंक खाता NPCI से जुड़ा है।' : 'Check which bank account is currently seeded in NPCI mapper via UIDAI or bank portal.',
          isHi ? 'अपनी बैंक शाखा में जाएं और "NPCI आधार सीडिंग / DBT सहमति पत्र" (Mandate Form) जमा करें।' : 'Visit your primary bank branch and submit the official "Aadhaar Seeding DBT Mandate Form".',
          isHi ? 'बैंक अधिकारी से कहें कि खाते को NPCI DBT मैपर पर Active करें।' : 'Ask the bank executive specifically to activate the DBT Credit flag on NPCI mapper.',
          isHi ? 'यदि बैंक में देरी हो तो इंडिया पोस्ट पेमेंट्स बैंक (IPPB) में नया खाता खुलवाएं, जिसमें स्वतः NPCI सीडिंग हो जाती है।' : 'Alternative: Open an India Post Payments Bank (IPPB) account which enables instant NPCI DBT mapping.'
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

  // 2. Scholarship Scenarios
  else if (isStudent) {
    if (mentionsLimit) {
      result = {
        category: 'Education (शिक्षा)',
        issue_title: isHi ? 'छात्रवृत्ति: बैंक खाते की क्रेडिट लिमिट पार (PFMS रिजेक्शन)' : 'Scholarship: Bank Account Credit Limit Exceeded',
        cause: isHi
          ? 'छात्र का बैंक खाता जनधन / बेसिक बचत खाता (PMJDY) है, जिसमें ₹1,00,000 की वार्षिक क्रेडिट सीमा पार होने के कारण बैंक ने भुगतान रिजेक्ट कर दिया।'
          : 'Scholarship disbursement exceeded the Rs 1,00,000 annual deposit ceiling of basic PMJDY/Small Savings account.',
        severity: 'High',
        affected_system: 'PFMS & Core Banking System (CBS)',
        resolution_sla: '48 Hours (Account Upgrade)',
        guidance: isHi
          ? 'जब उच्च शिक्षा छात्रवृत्ति या हॉस्टल फीस की राशि जनधन खाते की सीमा से अधिक होती है, तो बैंक कोर बैंकिंग सिस्टम "Credit Limit Exceeded" कोड के साथ PFMS को भुगतान लौटा देता है।'
          : 'When tuition reimbursement exceeds PMJDY ceiling limits, bank systems reject the batch. The account must be converted to Regular Savings.',
        action_steps: [
          isHi ? 'अपनी बैंक शाखा में जाएं और बैंक प्रबंधक को सूचित करें कि छात्रवृत्ति राशि क्रेडिट सीमा से अधिक है।' : 'Visit your home bank branch and inform the branch manager that scholarship funds exceed the limit.',
          isHi ? 'पूर्ण बायोमेट्रिक री-केवाईसी (PAN कार्ड या फॉर्म 60) जमा करके खाते को नियमित बचत खाते (Regular Savings) में अपग्रेड कराएं।' : 'Submit full biometric re-KYC (PAN card/Form 60) to upgrade to a Regular Savings Account.',
          isHi ? 'बैंक से खाता सक्रियता व सीमा विस्तार का प्रमाण पत्र (Status Slip) प्राप्त करें।' : 'Collect an account upgrade confirmation slip with unrestricted credit status.',
          isHi ? 'छात्रवृत्ति पोर्टल (NSP) पर जाकर PFMS री-ट्रांजेक्शन हेतु अनुरोध दर्ज करें।' : 'Request your institute or NSP portal desk to trigger PFMS re-payment.'
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
        category: 'Education (शिक्षा)',
        issue_title: isHi ? 'छात्रवृत्ति: एनपीसीआई आधार मैपिंग अथवा संस्थान सत्यापन लंबित' : 'Scholarship: NPCI Seeding or Institute Verification Pending',
        cause: isHi
          ? 'छात्रवृत्ति पोर्टल पर कॉलेज नोडल अधिकारी द्वारा सत्यापन लंबित है अथवा एनपीसीआई आधार पेमेंट ब्रिज मैपर सक्रिय नहीं है।'
          : 'Scholarship release stalled due to pending Institute Nodal verification or inactive NPCI DBT mapping.',
        severity: 'High',
        affected_system: 'National Scholarship Portal (NSP) & PFMS',
        resolution_sla: '3 to 5 Working Days',
        guidance: isHi
          ? 'NSP पोर्टल पर छात्रवृत्ति स्वीकृत होने के बाद PFMS द्वारा आधार-सीडेड खाते में ही भुगतान भेजा जाता है। यदि कॉलेज ने समय पर मेरिट लिस्ट में नाम सत्यापित नहीं किया या खाता एनपीसीआई से मैप नहीं है तो किस्त रुक जाती है।'
          : 'NSP scholarships route exclusively through Aadhaar Payment Bridge. Ensure your institute verifies your dossier and your bank account is mapped in the central NPCI registry.',
        action_steps: [
          isHi ? 'NSP पोर्टल पर लॉगिन करके अपनी आवेदन स्थिति (Application Status) देखें कि पेंडिंग कहाँ है।' : 'Log in to scholarships.gov.in to check if the status shows "Pending at Institute Nodal Officer".',
          isHi ? 'यदि कॉलेज स्तर पर लंबित है: अपने कॉलेज के छात्रवृत्ति प्रभारी से संपर्क कर तुरंत सत्यापन कराएं।' : 'If pending at college: Contact your college Scholarship In-charge/Registrar to verify documents immediately.',
          isHi ? 'यदि "Push to PFMS Failed" दिख रहा है: बैंक जाकर NPCI आधार सीडिंग फॉर्म जमा करें।' : 'If status shows "PFMS Validation Failed": Submit Aadhaar Seeding form at your bank.',
          isHi ? 'PFMS पोर्टल पर "Track NSP Payments" में जाकर ट्रांजेक्शन स्थिति ट्रैक करें।' : 'Track payment clearance via PFMS portal using your Application ID.'
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

  // 3. Pension Scenarios
  else if (isPension) {
    result = {
      category: 'Pension (पेंशन)',
      issue_title: isHi ? 'पेंशन: वार्षिक डिजिटल जीवन प्रमाण पत्र (Jeevan Pramaan) अथवा IFSC त्रुटि' : 'Pension: Digital Life Certificate (DLC) or IFSC Invalidation',
      cause: isHi
        ? 'वार्षिक जीवन प्रमाण पत्र का समय पर नवीनीकरण न होना अथवा बैंक विलय के बाद पुराना IFSC कोड अमान्य होना।'
        : 'Lapse in submitting annual Digital Life Certificate (Jeevan Pramaan) or invalid IFSC post bank merger.',
      severity: 'Critical',
      affected_system: 'State Social Security Pension Portal & Jeevan Pramaan',
      resolution_sla: '48 to 72 Hours',
      guidance: isHi
        ? 'वरिष्ठ नागरिक, वृद्धावस्था या विधवा पेंशन जारी रखने के लिए प्रतिवर्ष जीवन प्रमाण पत्र प्रस्तुत करना अनिवार्य है। इसके अभाव में समाज कल्याण विभाग स्वतः पेंशन रोक देता है।'
        : 'State pension directorates strictly freeze pension accounts if the annual Digital Life Certificate is not submitted. A simple biometric DLC instantly reactivates the pension.',
      action_steps: [
        isHi ? 'डाकघर के डाकिया (IPPB Doorstep Service), CSC केंद्र या बैंक जाकर बायोमेट्रिक / फेस ऑथेंटिकेशन से जीवन प्रमाण पत्र जमा करें।' : 'Submit your Digital Life Certificate via your local postman (IPPB doorstep service), CSC center, or bank.',
        isHi ? 'जीवन प्रमाण पत्र की पावती रसीद (Pramaan ID) सुरक्षित रखें।' : 'Retain the generated Pramaan ID receipt for department records.',
        isHi ? 'यदि बैंक विलय हुआ है (जैसे PNB, Canara, BoB): नई पासबुक की प्रति विकास भवन में समाज कल्याण विभाग को दें।' : 'If bank merged: Submit an updated passbook copy with the new IFSC code to the Social Welfare Department.',
        isHi ? 'राज्य पेंशन पोर्टल पर जाकर पेंशनर स्टेटस में नवीनीकरण की पुष्टि करें।' : 'Verify your active status on your State Social Security Pension portal.'
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

  // 4. Housing / PMAY Scenarios
  else if (isHousing) {
    result = {
      category: 'Housing (आवास)',
      issue_title: isHi ? 'पीएम आवास योजना: जियो-टैगिंग (Geo-tagging) निरीक्षण लंबित' : 'PMAY: Construction Stage Geo-Tagging Verification Pending',
      cause: isHi
        ? 'आवास निर्माण के अगले चरण (नींव/लिंटेल) का जियो-टैगिंग फोटो सत्यापन AwaasSoft पोर्टल पर अपलोड नहीं हुआ है।'
        : 'Next installment withheld pending field geo-tagging photo verification on the central AwaasSoft portal.',
      severity: 'Medium',
      affected_system: 'Ministry of Rural Development (AwaasSoft)',
      resolution_sla: '7 Working Days',
      guidance: isHi
        ? 'प्रधानमंत्री आवास योजना में दूसरी या तीसरी किस्त तभी जारी होती है जब ग्राम विकास अधिकारी (VDO) निर्माण स्थल पर जाकर आवासऐप से जियो-टैग्ड फोटो अपलोड करता है।'
        : 'PMAY funds are released in strict milestones. Release of next tranche requires geo-tagged physical progress upload by the Block Development Officer / Awaas Mitra.',
      action_steps: [
        isHi ? 'अपने ग्राम विकास अधिकारी (VDO) या आवास मित्र से संपर्क कर निर्माण स्थल के निरीक्षण का अनुरोध करें।' : 'Contact your Gram Panchayat Secretary (VDO) or Awaas Mitra for on-site inspection.',
        isHi ? 'अधिकारी द्वारा AwaasApp के माध्यम से निर्माण के वर्तमान स्तर का फोटो खींचकर अपलोड कराया जाएगा।' : 'The officer will capture and upload geo-tagged coordinates of current construction.',
        isHi ? 'AwaasSoft पोर्टल (rhreporting.nic.in) पर FTO (Fund Transfer Order) बनने की स्थिति जांचें।' : 'Track FTO generation status on the official rhreporting.nic.in portal.',
        isHi ? 'ब्लॉक से अनुमोदन के 7-10 दिनों में धनराशि आधार-सीडेड खाते में जमा हो जाएगी।' : 'Funds will be transferred directly to your Aadhaar-seeded bank account within 7-10 days of approval.'
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

  // 5. Default General / NPCI Failure Scenario
  else {
    result = {
      category: 'Banking & Identity (बैंकिंग व पहचान)',
      issue_title: isHi ? 'आधार-बैंक सीडिंग एवं एनपीसीआई मैपर (DBT Mandate) विफलता' : 'Aadhaar-Bank Seeding & NPCI Mapper Failure',
      cause: isHi
        ? 'आधार बैंक खाते में केवल KYC हेतु लिंक है, किंतु NPCI आधार पेमेंट ब्रिज (DBT मैपर) में सक्रिय नहीं है।'
        : 'Aadhaar is linked for KYC but the NPCI Aadhaar Payment Bridge (APB) DBT Credit Mandate is inactive.',
      severity: 'Critical',
      affected_system: 'NPCI Bharat Aadhaar Seeding Enabler (BASE) & PFMS',
      resolution_sla: '48 Hours',
      guidance: isHi
        ? 'भारत में 80% से अधिक सरकारी किस्तों की विफलता का मुख्य कारण यह है कि नागरिक समझते हैं "आधार लिंक है मतलब पैसा आएगा"। वास्तविकता यह है कि बैंक को विशेष रूप से "DBT Mandate" सक्रिय करना पड़ता है।'
        : 'Over 80% of DBT failures in India stem from confounding "Aadhaar Linking (KYC)" with "NPCI DBT Seeding (Credit)". You must submit a specific DBT Mandate Form at your bank branch.',
      action_steps: [
        isHi ? 'UIDAI या बैंक पोर्टल पर तुरंत जांचें कि आपका कौन सा बैंक खाता NPCI मैपर में सक्रिय है।' : 'Check which bank account is active on the NPCI central mapper using UIDAI portal.',
        isHi ? 'अपनी बैंक शाखा में जाएं और नीचे दिया गया औपचारिक आवेदन पत्र और NPCI DBT Mandate फॉर्म जमा करें।' : 'Visit your bank branch with the pre-filled application letter below and official DBT Mandate Form.',
        isHi ? 'बैंक अधिकारी से रिसीविंग पावती अवश्य लें और सुनिश्चित करें कि वे NPCI APBS मैपर पर Active करें।' : 'Insist on a stamped acknowledgment slip and verify status on PFMS after 48 hours.',
        isHi ? 'यदि 5 दिनों में समस्या हल न हो, तो आरबीआई बैंकिंग लोकपाल (Banking Ombudsman) पोर्टल पर ऑनलाइन शिकायत दर्ज करें।' : 'If unresolved within 5 days, escalate to the RBI Banking Ombudsman portal (cms.rbi.org.in).'
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

  const finalResult = {
    history_id: historyId,
    citizen_name: citizenName,
    diagnosed_at: new Date().toISOString(),
    analyzed_text: problemText,
    ...result
  };

  // Cache in memory for instant PDF download
  inMemoryHistory[historyId] = finalResult;

  return finalResult;
}

// 1. List all DBT issue types
router.get('/issues', (req, res) => {
  res.json(demoIssues);
});

// 2. Natural Language Problem Diagnosis (Text or Speech Input)
router.post('/analyze-problem', (req, res) => {
  try {
    const { problem = '', language = 'en', citizen_name = 'Citizen Beneficiary' } = req.body;
    if (!problem.trim()) {
      return res.status(400).json({ error: 'Please describe your DBT failure problem.' });
    }
    const result = analyzeDbtProblem(problem, language, citizen_name);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('Error analyzing DBT problem:', err);
    res.status(500).json({ error: 'Diagnosis failed: ' + err.message });
  }
});

// 3. Get questions for an issue
router.get('/issues/:id/questions', (req, res) => {
  const { id } = req.params;
  const issue = demoIssues.find(i => String(i.id) === String(id));
  if (!issue) return res.status(404).json({ error: 'Issue not found' });
  res.json(issue.questions);
});

// 4. Diagnose an issue based on citizen's answers
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

// 5. Generate and download PDF Diagnostic Report
router.get('/history/:hid/report', (req, res) => {
  const { hid } = req.params;
  const data = inMemoryHistory[hid] || {
    history_id: hid,
    issue_title: 'DBT Payment Disbursal Diagnosis',
    citizen_name: 'Verified Citizen',
    diagnosed_at: new Date().toISOString(),
    cause: 'NPCI Aadhaar-Bank Seeding or e-KYC Requirement',
    severity: 'High',
    guidance: 'Direct Benefit Transfer requires mapping your primary bank account in the NPCI central mapper with Aadhaar seeding.',
    action_steps: [
      'Visit your bank branch with original Aadhaar Card and Passbook.',
      'Submit the Aadhaar Seeding / Mandate Consent form for DBT.',
      'Verify status on resident.uidai.gov.in.'
    ],
    escalation_authority: 'Bank Branch Manager / UIDAI / PFMS',
    escalation_url: 'https://pfms.nic.in/'
  };

  try {
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="JanSetu_DBT_Resolution_${hid}.pdf"`);

    doc.pipe(res);

    // Header
    doc.rect(0, 0, 612, 90).fill('#3F3A37');
    doc.fillColor('#D3C3B9').fontSize(22).text('JANSETU - DBT FAILURE DETECTIVE', 50, 25, { bold: true });
    doc.fillColor('#BDAFA6').fontSize(11).text('Official Direct Benefit Transfer Diagnostic & Resolution Package', 50, 52);

    doc.moveDown(3);

    // Report Meta Box
    doc.fillColor('#2A2725').fontSize(14).text(`Case Reference ID: ${data.history_id}`, 50, 110, { bold: true });
    doc.fontSize(10).fillColor('#69615C');
    doc.text(`Generated On: ${new Date(data.diagnosed_at).toLocaleString('en-IN')}`);
    doc.text(`Beneficiary Name: ${data.citizen_name}`);
    doc.text(`Category: ${data.category || data.issue_title}`);
    if (data.affected_system) doc.text(`Affected System: ${data.affected_system}`);

    doc.moveDown();
    doc.rect(50, 185, 512, 1).fill('#BDAFA6');
    doc.moveDown(1.5);

    // Primary Diagnosis
    doc.fillColor('#2A2725').fontSize(14).text('Root Cause Identified:', 50, 205, { bold: true });
    doc.fillColor('#3F3A37').fontSize(12).text(data.cause);
    doc.fontSize(10).fillColor('#7E756F').text(`Severity: ${data.severity || 'High'} | Resolution SLA: ${data.resolution_sla || '48-72 Hours'}`);

    doc.moveDown();

    // Guidance
    doc.fillColor('#2A2725').fontSize(13).text('Official Government Guidance:', 50, 265, { bold: true });
    doc.fontSize(10).fillColor('#3F3A37').text(data.guidance, { width: 512, align: 'justify' });

    doc.moveDown();

    // Action Steps
    if (data.action_steps && data.action_steps.length > 0) {
      doc.fillColor('#2A2725').fontSize(12).text('Step-by-Step Resolution Actions:', { bold: true });
      doc.moveDown(0.5);
      data.action_steps.forEach((step, idx) => {
        doc.fillColor('#3F3A37').fontSize(10).text(`${idx + 1}. ${step}`, { indent: 15 });
        doc.moveDown(0.3);
      });
    }

    doc.moveDown();

    // Required Documents
    if (data.required_documents && data.required_documents.length > 0) {
      doc.fillColor('#2A2725').fontSize(12).text('Required Documents Checklist:', { bold: true });
      doc.moveDown(0.5);
      data.required_documents.forEach((docName, idx) => {
        doc.fillColor('#3F3A37').fontSize(10).text(`[ ] ${docName}`, { indent: 15 });
        doc.moveDown(0.2);
      });
    }

    doc.moveDown();

    // Escalation Section
    doc.fillColor('#2A2725').fontSize(12).text('Designated Authority & Escalation:', { bold: true });
    doc.fillColor('#544E4A').fontSize(10).text(`Authority: ${data.escalation_authority || 'Bank Branch Manager / PFMS Helpdesk'}`);
    if (data.escalation_url) {
      doc.fillColor('#2A2725').text(`Official URL: ${data.escalation_url}`);
    }

    // Disclaimer Footer
    doc.rect(50, 690, 512, 60).fill('#F5F2EF');
    doc.fillColor('#69615C').fontSize(8).text(
      'DISCLAIMER: JanSetu provides automated diagnosis grounded in official Government of India (PFMS, NPCI, UIDAI) circulars. Take this document along with your original Aadhaar card and passbook to your bank branch or CSC center.',
      60,
      700,
      { width: 492, align: 'center' }
    );

    doc.end();
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate PDF report: ' + err.message });
  }
});

module.exports = router;
