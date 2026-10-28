import React from 'react';
import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';

function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const toggleLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('jansetu_lang', lang);
  };

  return (
    <div className="inline-flex items-center bg-taupe-100/80 backdrop-blur rounded-full p-1 border border-taupe-300 shadow-sm text-xs font-semibold">
      <Languages size={14} className="ml-2 text-taupe-700" />
      <button
        onClick={() => toggleLanguage('en')}
        className={`px-3 py-1 rounded-full transition-all duration-200 ${
          i18n.language === 'en'
            ? 'bg-taupe-850 text-taupe-50 shadow-sm'
            : 'text-taupe-700 hover:text-taupe-950'
        }`}
      >
        English
      </button>
      <button
        onClick={() => toggleLanguage('hi')}
        className={`px-3 py-1 rounded-full transition-all duration-200 ${
          i18n.language === 'hi'
            ? 'bg-taupe-850 text-taupe-50 shadow-sm'
            : 'text-taupe-700 hover:text-taupe-950'
        }`}
      >
        हिन्दी
      </button>
    </div>
  );
}

export default LanguageSwitcher;
