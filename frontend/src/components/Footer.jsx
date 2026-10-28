import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ShieldCheck, ExternalLink, Heart } from 'lucide-react';

function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-taupe-900 text-taupe-300 pt-12 pb-8 border-t border-taupe-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-taupe-200 text-taupe-950 font-bold flex items-center justify-center text-base">
                JS
              </div>
              <span className="text-xl font-bold text-taupe-100">{t('appName')}</span>
            </div>
            <p className="text-xs text-taupe-400 leading-relaxed mb-3">
              {t('tagline')}
            </p>
            <span className="inline-block text-[11px] font-semibold tracking-wider uppercase text-taupe-200 bg-taupe-800 px-2.5 py-1 rounded">
              Build for Bharat 2026
            </span>
          </div>

          {/* Core Portals */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-taupe-100 mb-3">
              Core Modules
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/schemes" className="hover:text-taupe-100 transition-colors">
                  Government Scheme Finder
                </Link>
              </li>
              <li>
                <Link to="/dbt" className="hover:text-taupe-100 transition-colors font-medium text-taupe-200">
                  DBT Failure Detective
                </Link>
              </li>
              <li>
                <Link to="/loans" className="hover:text-taupe-100 transition-colors">
                  Formal Loans & Caution
                </Link>
              </li>
              <li>
                <Link to="/chat" className="hover:text-taupe-100 transition-colors">
                  JanSetu AI Sahayak
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-taupe-100 transition-colors">
                  Admin Verification Desk
                </Link>
              </li>
            </ul>
          </div>

          {/* Official Portals */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-taupe-100 mb-3">
              Official Portals
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="https://www.myscheme.gov.in/" target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-taupe-100">
                  myScheme Portal <ExternalLink size={10} />
                </a>
              </li>
              <li>
                <a href="https://pfms.nic.in/" target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-taupe-100">
                  PFMS DBT Tracker <ExternalLink size={10} />
                </a>
              </li>
              <li>
                <a href="https://uidai.gov.in/" target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-taupe-100">
                  UIDAI Aadhaar Seeding <ExternalLink size={10} />
                </a>
              </li>
              <li>
                <a href="https://scholarships.gov.in/" target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-taupe-100">
                  National Scholarship Portal <ExternalLink size={10} />
                </a>
              </li>
            </ul>
          </div>

          {/* Compliance & Disclaimers */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-taupe-100 mb-3 flex items-center gap-1">
              <ShieldCheck size={14} className="text-taupe-300" /> Civic Integrity
            </h4>
            <p className="text-[11px] text-taupe-400 leading-normal mb-2">
              JanSetu operates as an educational and civic assistance bridge. It never stores banking PINs, biometric data, or passwords.
            </p>
            <p className="text-[10px] text-taupe-500">
              Official records must be cross-checked with respective ministry portals.
            </p>
          </div>
        </div>

        <div className="border-t border-taupe-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-taupe-400 gap-2">
          <p>© 2026 JanSetu — Built with passion by Team Bit Warriors.</p>
          <div className="flex items-center gap-4 text-xs">
            <span>Bilingual (Hindi + English)</span>
            <span>•</span>
            <span>Monochromatic Warm Taupe</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
