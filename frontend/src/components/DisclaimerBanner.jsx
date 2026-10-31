import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck } from 'lucide-react';

function DisclaimerBanner() {
  const { t } = useTranslation();

  return (
    <div className="bg-[#151515] text-slate-200 border-b border-slate-800 px-4 py-2 text-xs font-medium">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-center">
        <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
        <span>
          <strong className="text-white">JanSetu Advisory:</strong> {t('disclaimerText')}
        </span>
      </div>
    </div>
  );
}

export default DisclaimerBanner;
