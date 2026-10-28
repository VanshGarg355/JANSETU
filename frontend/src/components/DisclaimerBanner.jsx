import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldAlert } from 'lucide-react';

function DisclaimerBanner() {
  const { t } = useTranslation();

  return (
    <div className="bg-taupe-200/90 border-b border-taupe-300 text-taupe-850 px-4 py-2 text-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-center">
        <ShieldAlert size={14} className="text-taupe-700 shrink-0" />
        <span>
          <strong>Build for Bharat 2026:</strong> {t('disclaimerText')}
        </span>
      </div>
    </div>
  );
}

export default DisclaimerBanner;
