import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || 'en';

  const toggleLanguage = () => {
    const nextLang = currentLang === 'hi' ? 'en' : 'hi';
    i18n.changeLanguage(nextLang);
    localStorage.setItem('jansetu_lang', nextLang);
  };

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      title="Switch Language / भाषा बदलें"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-950 text-xs font-bold transition-all shadow-2xs"
    >
      <Globe size={14} className="text-blue-700" />
      <span>{currentLang === 'hi' ? 'हिन्दी' : 'English'}</span>
    </button>
  );
}

export default LanguageSwitcher;
