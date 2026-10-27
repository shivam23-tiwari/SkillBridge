import React, { useState } from 'react';
import { ResumeData, ATSAnalysisResult } from '../../types';
import { ResumeService } from '../../services/resumeService';
import { usePlan } from '../../context/PlanContext';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import {
  X,
  Target,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Zap,
  ArrowRight,
  Lock,
} from 'lucide-react';

interface ATSKeywordMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeData: ResumeData;
}

export const ATSKeywordMatchModal: React.FC<ATSKeywordMatchModalProps> = ({
  isOpen,
  onClose,
  resumeData,
}) => {
  const { plan, openUpgradeModal } = usePlan();
  const [jobDescription, setJobDescription] = useState('');
  const [analysis, setAnalysis] = useState<ATSAnalysisResult | null>(null);

  if (!isOpen) return null;

  const handleAnalyze = () => {
    const result = ResumeService.calculateATSKeywordMatch(resumeData, jobDescription);
    setAnalysis(result);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-[#111] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden text-gray-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-gray-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">ATS Keyword Match Checker</h2>
              <p className="text-xs text-gray-400">
                Compare your resume against recruiter job descriptions to optimize ATS parsing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Job Description Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-300 block">
              Paste Target Job Description (Optional but recommended)
            </label>
            <Textarea
              value={jobDescription}
              onChange={e => setJobDescription(e.target.value)}
              placeholder="Paste the job description from LinkedIn, Indeed, or company portal here..."
              className="w-full h-28 bg-gray-950 border-gray-700 text-xs text-gray-200"
            />
            <div className="flex justify-between items-center text-[11px] text-gray-500">
              <span>Leave blank to check against general software engineer benchmarks</span>
              <Button
                size="sm"
                onClick={handleAnalyze}
                className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs px-4"
              >
                Run Match Check
              </Button>
            </div>
          </div>

          {/* Analysis Results */}
          {analysis && (
            <div className="space-y-5 border-t border-gray-800 pt-5 animate-in fade-in">
              {/* Score Indicator */}
              <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                    ATS Keyword Match Rate
                  </span>
                  <div className="text-3xl font-black text-white mt-1 flex items-baseline gap-2">
                    <span
                      className={
                        analysis.matchScore >= 75
                          ? 'text-emerald-400'
                          : analysis.matchScore >= 50
                          ? 'text-amber-400'
                          : 'text-red-400'
                      }
                    >
                      {analysis.matchScore}%
                    </span>
                    <span className="text-xs text-gray-400 font-normal">
                      {analysis.matchScore >= 75
                        ? 'High Interview Probability'
                        : analysis.matchScore >= 50
                        ? 'Moderate Match'
                        : 'Needs Optimization'}
                    </span>
                  </div>
                </div>

                <div className="w-16 h-16 rounded-full border-4 border-gray-800 flex items-center justify-center font-bold text-sm">
                  {analysis.matchedKeywords.length}/{analysis.matchedKeywords.length + analysis.missingKeywords.length}
                </div>
              </div>

              {/* Matched Keywords */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Keywords Found in Your Resume ({analysis.matchedKeywords.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.matchedKeywords.length > 0 ? (
                    analysis.matchedKeywords.map((kw, i) => (
                      <span
                        key={i}
                        className="text-[11px] px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-mono"
                      >
                        {kw}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-500">None detected yet.</span>
                  )}
                </div>
              </div>

              {/* Missing Keywords */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Missing High-Value Keywords ({analysis.missingKeywords.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.missingKeywords.map((kw, i) => (
                    <span
                      key={i}
                      className="text-[11px] px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300 font-mono"
                    >
                      +{kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actionable Recommendations */}
              <div className="space-y-2 bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  Optimization Recommendations
                </span>
                <ul className="text-xs text-gray-300 space-y-1.5 list-disc pl-4">
                  {analysis.recommendations.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>

              {/* Upsell for Full Fix Report on Free/Basic */}
              {plan !== 'premium' && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/40 to-blue-950/30 border border-indigo-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Want automated 1-click bullet point fixes?
                    </span>
                    <span className="text-[11px] text-gray-400">
                      Premium includes full ATS reports with automated rewrites.
                    </span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => openUpgradeModal('Full ATS keyword report and automated rewrites')}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs shrink-0 ml-3"
                  >
                    Upgrade
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
