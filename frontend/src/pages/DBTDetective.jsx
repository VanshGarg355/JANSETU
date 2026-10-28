import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import DemoScenarioSelector from '../components/DemoScenarioSelector';
import {
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  FileDown,
  ExternalLink,
  ArrowRight,
  RotateCcw,
  ShieldAlert,
  ArrowLeft,
  Sparkles,
  Building,
  Check
} from 'lucide-react';

function DBTDetective() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const isHindi = i18n.language === 'hi';

  const [issues, setIssues] = useState([]);
  const [scenarios, setScenarios] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [diagnosisResult, setDiagnosisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeScenarioId, setActiveScenarioId] = useState(null);

  useEffect(() => {
    fetchIssues();
    fetchScenarios();
  }, []);

  const fetchIssues = async () => {
    try {
      const res = await fetch('/api/dbt/issues');
      const data = await res.json();
      setIssues(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchScenarios = async () => {
    try {
      const res = await fetch('/api/dbt/scenarios');
      const data = await res.json();
      setScenarios(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectIssue = async (issue) => {
    setSelectedIssue(issue);
    setAnswers({});
    setCurrentStep(0);
    setDiagnosisResult(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/dbt/issues/${issue.id}/questions`);
      const qData = await res.json();
      setQuestions(Array.isArray(qData) ? qData : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectScenario = async (sc) => {
    setActiveScenarioId(sc.id);
    const targetIssue = issues.find(i => i.id === sc.issue_id) || issues[0];
    if (targetIssue) {
      setSelectedIssue(targetIssue);
      setLoading(true);
      try {
        const res = await fetch(`/api/dbt/issues/${targetIssue.id}/questions`);
        const qData = await res.json();
        setQuestions(qData);
        // Pre-fill answers from scenario!
        setAnswers(sc.simulated_answers || {});
        setCurrentStep(qData.length); // ready to diagnose!
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAnswerChange = (questionId, option) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const handleNextStep = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      runDiagnosis();
    }
  };

  const runDiagnosis = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/dbt/issues/${selectedIssue.id}/diagnose`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers,
          citizen_name: user?.name || 'Citizen Beneficiary',
          language: isHindi ? 'hi' : 'en'
        })
      });
      const data = await res.json();
      setDiagnosisResult(data);
    } catch (e) {
      console.error('Diagnosis failed:', e);
    } finally {
      setLoading(false);
    }
  };

  const resetWorkflow = () => {
    setSelectedIssue(null);
    setQuestions([]);
    setAnswers({});
    setCurrentStep(0);
    setDiagnosisResult(null);
    setActiveScenarioId(null);
  };

  const downloadPdfReport = () => {
    if (!diagnosisResult?.history_id) return;
    window.open(`/api/dbt/history/${diagnosisResult.history_id}/report`, '_blank');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16 px-4 sm:px-6">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold border border-amber-200">
          <AlertCircle size={14} className="text-amber-800" />
          <span>Identify • Diagnose • Resolve • Escalate</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-taupe-950">
          {t('dbtHeroHeading')}
        </h1>
        <p className="text-xs sm:text-sm text-taupe-600">
          {t('dbtHeroDesc')}
        </p>
      </div>

      {/* 1-Click Hackathon Scenarios Picker */}
      <DemoScenarioSelector
        scenarios={scenarios}
        onSelectScenario={handleSelectScenario}
        activeScenarioId={activeScenarioId}
      />

      {/* Step 1: Select DBT Issue (if not yet selected) */}
      {!selectedIssue && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-taupe-800">
            {t('selectDbtIssuePrompt')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {issues.map((issue) => (
              <div
                key={issue.id}
                onClick={() => handleSelectIssue(issue)}
                className="bg-white border border-taupe-300 hover:border-taupe-500 rounded-2xl p-6 shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-taupe-100 text-taupe-800 px-2.5 py-0.5 rounded-full border border-taupe-200">
                    {issue.category || 'General'}
                  </span>
                  <h3 className="text-base font-bold text-taupe-950 mt-2 mb-1.5 group-hover:text-taupe-850">
                    {isHindi ? issue.title_hi : issue.title}
                  </h3>
                  <p className="text-xs text-taupe-600 leading-relaxed">
                    {isHindi ? issue.description_hi : issue.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-taupe-100 flex items-center justify-between text-xs font-bold text-taupe-900 group-hover:underline">
                  <span>{t('diagnoseDbtIssue')}</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Interactive Diagnostic Questions */}
      {selectedIssue && !diagnosisResult && (
        <div className="bg-white border border-taupe-300 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-taupe-200">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-taupe-500">
                Current Diagnostic Case
              </span>
              <h2 className="text-base sm:text-lg font-bold text-taupe-950">
                {isHindi ? selectedIssue.title_hi : selectedIssue.title}
              </h2>
            </div>
            <button
              onClick={resetWorkflow}
              className="text-xs font-semibold text-taupe-600 hover:text-taupe-950 flex items-center gap-1"
            >
              <RotateCcw size={13} /> Change Issue
            </button>
          </div>

          {/* Progress bar */}
          <div>
            <div className="flex justify-between text-xs text-taupe-600 font-semibold mb-1.5">
              <span>{t('questionStep')} {Math.min(currentStep + 1, questions.length)} of {questions.length}</span>
              <span>{Math.round((Object.keys(answers).length / questions.length) * 100)}% Answered</span>
            </div>
            <div className="w-full bg-taupe-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-taupe-850 h-full transition-all duration-300 rounded-full"
                style={{ width: `${(Object.keys(answers).length / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question List or Single Step View */}
          {questions.length > 0 && (
            <div className="space-y-6 py-2">
              {questions.map((q, idx) => {
                const currentAnswer = answers[q.id];
                return (
                  <div
                    key={q.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      idx === currentStep
                        ? 'bg-taupe-50 border-taupe-400 ring-2 ring-taupe-700/20 shadow-sm'
                        : currentAnswer
                        ? 'bg-white border-taupe-200'
                        : 'bg-taupe-50/50 border-taupe-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <span className="w-6 h-6 rounded-full bg-taupe-850 text-taupe-50 flex items-center justify-center text-xs font-bold shrink-0">
                        {idx + 1}
                      </span>
                      <h3 className="text-sm font-bold text-taupe-950">
                        {isHindi ? q.question_hi : q.question}
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pl-9">
                      {q.options.map((opt) => {
                        const isSelected = currentAnswer === opt;
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => {
                              handleAnswerChange(q.id, opt);
                              if (idx === currentStep && currentStep < questions.length - 1) {
                                setCurrentStep(idx + 1);
                              }
                            }}
                            className={`text-left px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all flex items-center justify-between ${
                              isSelected
                                ? 'bg-taupe-850 text-taupe-50 border-taupe-950 shadow-sm'
                                : 'bg-white text-taupe-800 border-taupe-300 hover:bg-taupe-100 hover:border-taupe-400'
                            }`}
                          >
                            <span>{opt}</span>
                            {isSelected && <Check size={14} className="text-taupe-200 ml-1 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Actions */}
          <div className="pt-4 border-t border-taupe-200 flex items-center justify-between">
            <button
              onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
              disabled={currentStep === 0}
              className="px-4 py-2 text-xs font-semibold text-taupe-700 hover:text-taupe-950 disabled:opacity-40"
            >
              Previous
            </button>

            <button
              onClick={runDiagnosis}
              disabled={Object.keys(answers).length === 0 || loading}
              className="px-6 py-3 bg-taupe-850 hover:bg-taupe-950 text-taupe-50 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? 'Analyzing Rules...' : t('submitDiagnosis')}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Diagnostic Result & Resolution Guidance */}
      {diagnosisResult && (
        <div className="bg-white border border-taupe-300 rounded-3xl p-6 sm:p-10 shadow-lg space-y-8 animate-fade-in">
          {/* Header Result Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-taupe-200">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-taupe-100 text-taupe-800 px-2.5 py-0.5 rounded-full">
                  Case Ref: {diagnosisResult.history_id}
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                  diagnosisResult.severity === 'Critical'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  Severity: {diagnosisResult.severity || 'High'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-taupe-950">
                {diagnosisResult.issue_title}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={downloadPdfReport}
                className="px-4 py-2.5 bg-taupe-850 hover:bg-taupe-950 text-taupe-50 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md transition-all"
              >
                <FileDown size={15} />
                <span>Download Official PDF</span>
              </button>
              <button
                onClick={resetWorkflow}
                className="p-2.5 text-taupe-600 hover:text-taupe-950 border border-taupe-300 rounded-xl hover:bg-taupe-100"
                title="Start New Diagnosis"
              >
                <RotateCcw size={16} />
              </button>
            </div>
          </div>

          {/* Root Cause Card */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-6 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
              <AlertCircle size={16} /> {t('rootCause')}:
            </span>
            <h3 className="text-lg font-bold text-taupe-950">
              {diagnosisResult.cause}
            </h3>
            <p className="text-xs sm:text-sm text-taupe-800 leading-relaxed pt-1">
              {diagnosisResult.guidance}
            </p>
          </div>

          {/* Action Steps */}
          {diagnosisResult.action_steps && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-taupe-950 uppercase tracking-wide">
                {t('recommendedAction')} (Step-by-Step)
              </h3>
              <div className="space-y-2.5">
                {diagnosisResult.action_steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-taupe-50 border border-taupe-200 rounded-xl flex items-start gap-3"
                  >
                    <span className="w-5 h-5 rounded-full bg-taupe-850 text-taupe-50 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-xs sm:text-sm text-taupe-850 leading-relaxed font-medium">
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Official Escalation Links */}
          <div className="p-6 bg-taupe-100/70 border border-taupe-300 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-taupe-600 block">
                Official Designated Authority
              </span>
              <span className="text-sm font-bold text-taupe-950 block mt-0.5">
                {diagnosisResult.escalation_authority || 'Bank Branch Manager / PFMS Helpdesk'}
              </span>
            </div>

            {diagnosisResult.escalation_url && (
              <a
                href={diagnosisResult.escalation_url}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 bg-taupe-850 hover:bg-taupe-950 text-taupe-50 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
              >
                <span>{t('escalationLink')}</span>
                <ExternalLink size={13} />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default DBTDetective;
