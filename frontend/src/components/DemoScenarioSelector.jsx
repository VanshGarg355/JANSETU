import React from 'react';
import { useTranslation } from 'react-i18next';
import { UserCheck, Sparkles, ArrowRight } from 'lucide-react';

function DemoScenarioSelector({ scenarios, onSelectScenario, activeScenarioId }) {
  const { t, i18n } = useTranslation();
  const isHindi = i18n.language === 'hi';

  if (!scenarios || scenarios.length === 0) return null;

  return (
    <div className="bg-taupe-100/90 border border-taupe-300 rounded-2xl p-5 mb-8 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-taupe-850" />
          <h3 className="text-sm font-bold text-taupe-950 uppercase tracking-wide">
            {t('hackathonDemoScenarios')}
          </h3>
        </div>
        <span className="text-[11px] font-semibold bg-taupe-200 text-taupe-800 px-2 py-0.5 rounded-full">
          1-Click Live Test
        </span>
      </div>
      <p className="text-xs text-taupe-700 mb-4">
        {t('testPersonaPrompt')}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {scenarios.map((sc) => {
          const isSelected = activeScenarioId === sc.id;
          return (
            <button
              key={sc.id}
              onClick={() => onSelectScenario(sc)}
              className={`text-left p-3.5 rounded-xl border transition-all duration-200 flex flex-col justify-between ${
                isSelected
                  ? 'bg-taupe-850 text-taupe-50 border-taupe-950 shadow-md scale-[1.02]'
                  : 'bg-taupe-50 text-taupe-900 border-taupe-300 hover:border-taupe-500 hover:bg-taupe-200/50'
              }`}
            >
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <UserCheck size={14} className={isSelected ? 'text-taupe-200' : 'text-taupe-700'} />
                  <span className="text-xs font-bold truncate">
                    {isHindi ? sc.persona_hi : sc.persona}
                  </span>
                </div>
                <h4 className={`text-xs font-medium leading-snug line-clamp-2 ${isSelected ? 'text-taupe-200' : 'text-taupe-800'}`}>
                  {isHindi ? sc.scenario_title_hi : sc.scenario_title}
                </h4>
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] font-semibold pt-2 border-t border-taupe-200/40">
                <span>{sc.user_details.category}</span>
                <ArrowRight size={12} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default DemoScenarioSelector;
