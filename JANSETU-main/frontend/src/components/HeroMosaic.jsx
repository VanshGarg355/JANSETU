import React, { useMemo } from 'react';
import {
  AlertCircle,
  Compass,
  MessageSquare,
  ShieldCheck,
  GraduationCap,
  Wheat,
  Home,
  HeartPulse,
  Landmark,
  Briefcase,
  Languages,
  FileText
} from 'lucide-react';

/*
 * Infinite vertical mosaic (3 columns, alternating direction).
 * Each column renders its 5 cells twice; the CSS keyframes translate the
 * column by -50% so the loop is seamless. See .mosaic-* in index.css.
 */
const COLUMNS = [
  // c1 — scrolls down
  [
    { tone: 'blue', icon: Compass, label: '25+', sub: 'Verified schemes', labelHi: '25+', subHi: 'सत्यापित योजनाएं' },
    { tone: 'cream', icon: GraduationCap, label: 'NSP', sub: 'Scholarships', labelHi: 'NSP', subHi: 'छात्रवृत्ति' },
    { tone: 'navy', icon: AlertCircle, label: 'DBT', sub: 'Failure Detective', labelHi: 'DBT', subHi: 'विफलता जासूस' },
    { tone: 'saffron', icon: Wheat, label: 'PM-KISAN', sub: 'Farmer support', labelHi: 'PM-KISAN', subHi: 'किसान सहायता' },
    { tone: 'green', icon: Home, label: 'PMAY', sub: 'Housing for all', labelHi: 'PMAY', subHi: 'सबके लिए आवास' }
  ],
  // c2 — scrolls up
  [
    { tone: 'amber', icon: MessageSquare, label: 'AI', sub: 'Sahayak assistant', labelHi: 'AI', subHi: 'सहायक' },
    { tone: 'navy', icon: Languages, label: 'हिं / EN', sub: 'Bilingual', labelHi: 'हिं / EN', subHi: 'द्विभाषी' },
    { tone: 'cream', icon: HeartPulse, label: 'PM-JAY', sub: 'Ayushman Bharat', labelHi: 'PM-JAY', subHi: 'आयुष्मान भारत' },
    { tone: 'blue', icon: ShieldCheck, label: 'Safe', sub: 'Fraud awareness', labelHi: 'सुरक्षित', subHi: 'धोखाधड़ी जागरूकता' },
    { tone: 'saffron', icon: Landmark, label: 'Pension', sub: 'NSAP · APY', labelHi: 'पेंशन', subHi: 'NSAP · APY' }
  ],
  // c3 — scrolls down
  [
    { tone: 'green', icon: Briefcase, label: 'Mudra', sub: 'Collateral-free loans', labelHi: 'मुद्रा', subHi: 'बिना गारंटी ऋण' },
    { tone: 'cream', icon: FileText, label: 'PDF', sub: 'Diagnostic report', labelHi: 'PDF', subHi: 'निदान रिपोर्ट' },
    { tone: 'navy', icon: Compass, label: '100%', sub: 'Grounded guidance', labelHi: '100%', subHi: 'प्रमाणित मार्गदर्शन' },
    { tone: 'amber', icon: Wheat, label: 'KCC', sub: 'Kisan Credit Card', labelHi: 'KCC', subHi: 'किसान क्रेडिट कार्ड' },
    { tone: 'blue', icon: GraduationCap, label: 'PM-USP', sub: 'Higher education', labelHi: 'PM-USP', subHi: 'उच्च शिक्षा' }
  ]
];

function Cell({ cell, isHindi }) {
  const Icon = cell.icon;
  return (
    <div className={`mosaic-cell mosaic-${cell.tone}`}>
      <Icon size={22} strokeWidth={2} className="mosaic-icon" />
      <div className="mosaic-text">
        <div className="mosaic-label">{isHindi ? cell.labelHi : cell.label}</div>
        <div className="mosaic-sub">{isHindi ? cell.subHi : cell.sub}</div>
      </div>
    </div>
  );
}

export default function HeroMosaic({ isHindi = false }) {
  // Duplicate each column's cells once so translateY(-50%) loops seamlessly.
  const columns = useMemo(() => COLUMNS.map((c) => [...c, ...c]), []);

  return (
    <div className="mosaic" aria-hidden="true">
      {columns.map((cells, ci) => (
        <div key={ci} className={`mosaic-col mosaic-c${ci + 1}`}>
          {cells.map((cell, i) => (
            <Cell key={i} cell={cell} isHindi={isHindi} />
          ))}
        </div>
      ))}
    </div>
  );
}
