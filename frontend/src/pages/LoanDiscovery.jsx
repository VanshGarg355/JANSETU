import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ShieldAlert,
  ShieldCheck,
  Banknote,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  Lock,
  PhoneCall
} from 'lucide-react';

function LoanDiscovery() {
  const { t, i18n } = useTranslation();
  const isHindi = i18n.language === 'hi';

  const [loans, setLoans] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'formal', 'suspicious'

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      const res = await fetch('/api/loans');
      const data = await res.json();
      setLoans(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
  };

  const filteredLoans = activeTab === 'all'
    ? loans
    : loans.filter(l => l.type === activeTab);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16 px-4 sm:px-6">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-taupe-200 text-taupe-950 text-xs font-semibold">
          <Banknote size={14} className="text-taupe-800" />
          <span>Financial Literacy & Fraud Prevention</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-taupe-950">
          {isHindi ? 'संस्थागत ऋण एवं धोखाधड़ी से सुरक्षा' : 'Formal Loans & Fraud Prevention'}
        </h1>
        <p className="text-xs sm:text-sm text-taupe-600">
          {isHindi
            ? 'सत्यापित सरकारी ऋण योजनाओं की खोज करें और अवैध इंस्टेंट लोन ऐप्स व व्हाट्सएप घोटालों से सावधान रहें।'
            : 'Explore genuine government-backed collateral-free loans while staying protected from predatory loan app scams.'}
        </p>
      </div>

      {/* Cybercrime Warning Alert Banner */}
      <div className="bg-amber-50 border border-amber-300 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-100 text-amber-900 rounded-xl mt-0.5">
            <ShieldAlert size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-amber-950">
              {isHindi ? 'सावधानी: सरकारी ऋण के नाम पर कभी अग्रिम शुल्क न दें!' : 'Warning: Never Pay Advance Fees for Government Loans!'}
            </h3>
            <p className="text-xs text-amber-800 leading-relaxed mt-1">
              {isHindi
                ? 'मुद्रा, स्वनिधि या किसी भी सरकारी योजना में कोई फाइल चार्ज, जीएसटी या बीमा शुल्क पहले नहीं मांगा जाता। अवैध लोन ऐप्स से बचें।'
                : 'The Government of India never charges processing fees or file verification charges via WhatsApp, Telegram, or UPI.'}
            </p>
          </div>
        </div>

        <a
          href="https://cybercrime.gov.in/"
          target="_blank"
          rel="noreferrer"
          className="px-4 py-2 bg-amber-900 hover:bg-amber-950 text-amber-50 text-xs font-bold rounded-xl whitespace-nowrap flex items-center gap-1.5 transition-colors shrink-0"
        >
          <span>Report Cyber Fraud</span>
          <ExternalLink size={12} />
        </a>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'all'
              ? 'bg-taupe-850 text-taupe-50 shadow-sm'
              : 'bg-white text-taupe-700 hover:bg-taupe-100 border border-taupe-300'
          }`}
        >
          {isHindi ? 'सभी देखें' : 'All Schemes'}
        </button>
        <button
          onClick={() => setActiveTab('formal')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'formal'
              ? 'bg-emerald-850 text-white shadow-sm'
              : 'bg-white text-taupe-700 hover:bg-taupe-100 border border-taupe-300'
          }`}
        >
          <ShieldCheck size={14} className="text-emerald-600" />
          <span>{t('formalLoans')}</span>
        </button>
        <button
          onClick={() => setActiveTab('suspicious')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'suspicious'
              ? 'bg-red-900 text-white shadow-sm'
              : 'bg-white text-taupe-700 hover:bg-taupe-100 border border-taupe-300'
          }`}
        >
          <AlertTriangle size={14} className="text-red-600" />
          <span>{t('suspiciousLoans')}</span>
        </button>
      </div>

      {/* Loan Scheme Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredLoans.map((loan) => {
          const isSuspicious = loan.type === 'suspicious';
          return (
            <div
              key={loan.id}
              className={`rounded-2xl p-6 border shadow-sm flex flex-col justify-between transition-all ${
                isSuspicious
                  ? 'bg-red-50/70 border-red-200'
                  : 'bg-white border-taupe-200 hover:border-taupe-400'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    isSuspicious
                      ? 'bg-red-100 text-red-900 border border-red-300'
                      : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  }`}>
                    {isSuspicious ? 'Scam Alert' : 'Formal Government Loan'}
                  </span>

                  {loan.max_amount && (
                    <span className="text-xs font-bold text-taupe-850">
                      Limit: Up to ₹{(loan.max_amount).toLocaleString('en-IN')}
                    </span>
                  )}
                </div>

                <h3 className={`text-base font-bold mb-2 ${isSuspicious ? 'text-red-950' : 'text-taupe-950'}`}>
                  {isHindi && loan.name_hi ? loan.name_hi : loan.name}
                </h3>

                <p className="text-xs text-taupe-700 leading-relaxed mb-4">
                  {isHindi && loan.description_hi ? loan.description_hi : loan.description}
                </p>

                {loan.warning && (
                  <div className="p-3 bg-red-100/80 border border-red-300 rounded-xl text-xs text-red-900 mb-4 font-semibold">
                    {loan.warning}
                  </div>
                )}

                <div className="text-xs space-y-1 text-taupe-600 border-t border-taupe-100 pt-3">
                  <div><strong>Interest Rate:</strong> {loan.interest_rate}</div>
                  <div><strong>Lending Body:</strong> {loan.institution}</div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-taupe-200 flex items-center justify-between">
                {isSuspicious ? (
                  <a
                    href="https://cybercrime.gov.in/"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full text-center py-2 bg-red-800 hover:bg-red-900 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Report Fraud to Police (1930)</span>
                    <ExternalLink size={12} />
                  </a>
                ) : (
                  <a
                    href={loan.official_url}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full text-center py-2 bg-taupe-850 hover:bg-taupe-950 text-taupe-50 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <span>Apply via Official Portal</span>
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Red Flags Checklist for Citizens */}
      <div className="bg-white border border-taupe-300 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-taupe-950 flex items-center gap-2">
          <ShieldAlert size={20} className="text-amber-800" />
          <span>{isHindi ? 'अवैध लोन की पहचान करने के 4 मुख्य लक्षण (Red Flags)' : '4 Red Flags of Predatory Fake Loans'}</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-taupe-800">
          <div className="p-4 bg-taupe-50 rounded-xl border border-taupe-200">
            <strong>1. Demanding Contacts & Gallery Access:</strong> Legitimate banks never ask for personal phone contacts or photo gallery permissions.
          </div>
          <div className="p-4 bg-taupe-50 rounded-xl border border-taupe-200">
            <strong>2. Demanding Advance Money / Processing Fee:</strong> Fraudsters ask for Rs 1,500 to Rs 5,000 as "file charge" before disbursing loan.
          </div>
          <div className="p-4 bg-taupe-50 rounded-xl border border-taupe-200">
            <strong>3. Short 7-Day Repayment Periods:</strong> Fake instant loan apps enforce predatory 7-day deadlines with abusive harassment.
          </div>
          <div className="p-4 bg-taupe-50 rounded-xl border border-taupe-200">
            <strong>4. Not Listed on RBI Sachet Portal:</strong> Always check if the lender is an RBI-registered NBFC on sachet.rbi.org.in.
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoanDiscovery;
