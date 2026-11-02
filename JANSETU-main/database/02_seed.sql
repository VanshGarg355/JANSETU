-- ====================================================================
-- JANSETU DATABASE SEED DATA
-- Verified government sources, 25 verified schemes, and DBT rules
-- ====================================================================

-- 1. Verified Government Sources
INSERT INTO government_sources (name, url, description, is_verified) VALUES
('myScheme Portal', 'https://www.myscheme.gov.in/', 'National Platform for Citizen Schemes Discovery', true),
('Public Financial Management System (PFMS)', 'https://pfms.nic.in/', 'Central Portal for Tracking DBT Payments & Subsidies', true),
('DBT Bharat', 'https://dbtbharat.gov.in/', 'Direct Benefit Transfer Official Portal of Government of India', true),
('UIDAI Aadhaar Portal', 'https://uidai.gov.in/', 'Unique Identification Authority of India (Aadhaar Seeding & Verification)', true),
('National Portal of India', 'https://www.india.gov.in/', 'Official Portal of the Government of India', true),
('National Scholarship Portal (NSP)', 'https://scholarships.gov.in/', 'Unified Portal for Central & State Scholarships', true),
('PM-KISAN Portal', 'https://pmkisan.gov.in/', 'Pradhan Mantri Kisan Samman Nidhi Official Portal', true),
('Ayushman Bharat PM-JAY', 'https://pmjay.gov.in/', 'National Health Authority Health Insurance Scheme', true),
('PM Awas Yojana (Gramin)', 'https://pmayg.nic.in/', 'Rural Housing Assistance Portal', true),
('National Cyber Crime Reporting Portal', 'https://cybercrime.gov.in/', 'Official Portal for Reporting Fraud & Cyber Incidents', true)
ON CONFLICT DO NOTHING;

-- 2. Initial Sample Verified Schemes
INSERT INTO schemes (name, name_hi, category, description, description_hi, benefits, benefits_hi, eligibility_criteria, eligibility_criteria_hi, required_documents, application_process, official_url, source_url, status) VALUES
(
  'PM Kisan Samman Nidhi (PM-KISAN)',
  'प्रधानमंत्री किसान सम्मान निधि',
  'Agriculture',
  'Income support scheme providing direct cash assistance of Rs 6,000 per year in three equal installments to eligible farmer families.',
  'पात्र किसान परिवारों को प्रति वर्ष 6,000 रुपये की प्रत्यक्ष आर्थिक सहायता तीन समान किस्तों में प्रदान करने वाली योजना।',
  'Rs 6,000 annually credited directly into bank accounts via DBT.',
  'प्रति वर्ष ₹6,000 सीधे बैंक खाते में DBT के माध्यम से।',
  'Small and marginal landholding farmer families having cultivable land in their names.',
  'कृषि योग्य भूमि रखने वाले छोटे और सीमांत किसान परिवार।',
  'Aadhaar Card, Land ownership papers, Bank account linked with Aadhaar.',
  'Apply through pmkisan.gov.in or visit the nearest Common Service Centre (CSC).',
  'https://pmkisan.gov.in/',
  'https://www.myscheme.gov.in/schemes/pm-kisan',
  'verified'
),
(
  'Ayushman Bharat PM-JAY',
  'आयुष्मान भारत प्रधानमंत्री जन आरोग्य योजना',
  'Healthcare',
  'World largest government-funded healthcare assurance scheme offering health cover of Rs 5 lakh per family per year for secondary and tertiary care hospitalization.',
  'द्वितीयक और तृतीयक स्तर के अस्पताल में भर्ती के लिए प्रति परिवार प्रति वर्ष 5 लाख रुपये का स्वास्थ्य कवर प्रदान करने वाली दुनिया की सबसे बड़ी योजना।',
  'Cashless health cover up to Rs 5,00,000 per eligible family per year across empaneled hospitals.',
  'प्रति वर्ष प्रति परिवार ₹5,00,000 तक का कैशलेस स्वास्थ्य उपचार।',
  'Families identified based on SECC 2011 criteria or state-approved health registries.',
  'SECC 2011 और राज्य द्वारा स्वीकृत वंचित श्रेणियों के परिवार।',
  'Aadhaar Card, Ration Card, Valid ID proof.',
  'Check eligibility on pmjay.gov.in and generate Ayushman Card at any empaneled hospital or CSC.',
  'https://pmjay.gov.in/',
  'https://www.myscheme.gov.in/schemes/pmjay',
  'verified'
),
(
  'Pradhan Mantri Awas Yojana - Gramin (PMAY-G)',
  'प्रधानमंत्री आवास योजना - ग्रामीण',
  'Housing',
  'Assistance to rural families without pucca houses to construct durable houses with basic amenities.',
  'ग्रामीण क्षेत्रों में बेघर या कच्चे मकानों में रहने वाले परिवारों को पक्का मकान बनाने हेतु आर्थिक सहायता।',
  'Financial assistance of Rs 1.20 lakh in plains and Rs 1.30 lakh in hilly/difficult areas with toilet assistance.',
  'मैदानी क्षेत्रों में ₹1.20 लाख और पहाड़ी क्षेत्रों में ₹1.30 लाख की प्रत्यक्ष सहायता।',
  'Rural households without a pucca house as per the SECC list and Gram Sabha verification.',
  'SECC सूची और ग्राम सभा द्वारा सत्यापित कच्चे घर या आवासहीन ग्रामीण परिवार।',
  'Aadhaar card, Bank passbook, Job card number, Swachh Bharat Mission registration.',
  'Identified via Gram Sabha and registered by Block Development Office on PMAY-G portal.',
  'https://pmayg.nic.in/',
  'https://www.myscheme.gov.in/schemes/pmay-g',
  'verified'
),
(
  'Atal Pension Yojana (APY)',
  'अटल पेंशन योजना',
  'Pension',
  'Government-backed pension scheme aimed at unorganized sector workers ensuring guaranteed monthly pension post age 60.',
  'असंगठित क्षेत्र के कामगारों के लिए 60 वर्ष की आयु के बाद निश्चित मासिक पेंशन प्रदान करने वाली सरकारी योजना।',
  'Guaranteed monthly pension between Rs 1,000 and Rs 5,000 based on age and contribution.',
  'योगदान और आयु के आधार पर 60 वर्ष के बाद ₹1,000 से ₹5,000 प्रतिमाह गारंटीकृत पेंशन।',
  'Indian citizens aged 18 to 40 with a savings bank account (non-taxpayers).',
  '18 से 40 वर्ष के भारतीय नागरिक जिनके पास बचत बैंक खाता है (गैर-आयकर दाता)।',
  'Savings Bank Account details, Aadhaar Card, Mobile number.',
  'Apply through your bank branch or internet banking portal.',
  'https://www.npscra.nsdl.co.in/scheme-details.php',
  'https://www.myscheme.gov.in/schemes/apy',
  'verified'
),
(
  'Pradhan Mantri Mudra Yojana (PMMY)',
  'प्रधानमंत्री मुद्रा योजना',
  'Financial Assistance',
  'Provides collateral-free loans up to Rs 10 lakh to non-corporate, non-farm small/micro enterprises.',
  'गैर-कॉर्पोरेट और गैर-कृषि लघु और सूक्ष्म उद्यमों को ₹10 लाख तक का बिना गारंटी ऋण।',
  'Loans categorized into Shishu (up to Rs 50K), Kishore (Rs 50K-5L), and Tarun (Rs 5L-10L) with no collateral required.',
  'शिशु (₹50,000 तक), किशोर (₹5 लाख तक), और तरुण (₹10 लाख तक) ऋण बिना किसी संपत्ति गारंटी के।',
  'Micro/small enterprise founders, traders, artisans, small shopkeepers.',
  'सूक्ष्म उद्यमी, व्यापारी, कारीगर और छोटे दुकानदार।',
  'Proof of identity, address proof, business plan, bank statement.',
  'Apply via Udyamimitra portal (udyamimitra.in) or visit commercial/RRB banks.',
  'https://www.mudra.org.in/',
  'https://www.myscheme.gov.in/schemes/pmmy',
  'verified'
);
