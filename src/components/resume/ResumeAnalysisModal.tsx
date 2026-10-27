import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ResumeData, DetailedResumeAnalysis } from '../../types';
import { ResumeService } from '../../services/resumeService';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import {
  X,
  Target,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Download,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Award,
  Layers,
  Zap,
  Briefcase,
  Code2,
} from 'lucide-react';

interface ResumeAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeData: ResumeData;
  studentName?: string;
  isOwner?: boolean;
  resumeId?: string;
}

const TARGET_ROLE_OPTIONS = [
  'Full Stack Developer',
  'Frontend Engineer',
  'Backend & Cloud Engineer',
  'AI & Machine Learning Specialist',
  'Mobile App Developer',
  'General Software Engineer',
];

export const ResumeAnalysisModal: React.FC<ResumeAnalysisModalProps> = ({
  isOpen,
  onClose,
  resumeData,
  studentName,
  isOwner = false,
  resumeId,
}) => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('Full Stack Developer');
  const [customJobDescription, setCustomJobDescription] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'pillars' | 'keywords' | 'fixes'>('overview');

  if (!isOpen) return null;

  const analysis: DetailedResumeAnalysis = ResumeService.analyzeResumeDetailed(
    resumeData,
    selectedRole,
    customJobDescription
  );

  const handleCopyAnalysis = () => {
    const report = `
========================================
SKILLBRIDGE RESUME & ATS AUDIT REPORT
Candidate: ${studentName || resumeData.personal.fullName}
Target Role: ${analysis.targetRole}
Overall ATS Score: ${analysis.overallScore}/100 (Grade ${analysis.grade})
Word Count: ~${analysis.wordCount} words (Est. read time: ${analysis.readingTimeMinutes} min)
========================================

EXECUTIVE SUMMARY:
${analysis.summaryText}

PILLAR BREAKDOWN:
• Impact & Metrics: ${analysis.pillars.impactAndMetrics.score}/100 - ${analysis.pillars.impactAndMetrics.feedback}
• Technical Depth: ${analysis.pillars.technicalDepth.score}/100 - ${analysis.pillars.technicalDepth.feedback}
• ATS Structure: ${analysis.pillars.atsStructure.score}/100 - ${analysis.pillars.atsStructure.feedback}
• Action Verbs: ${analysis.pillars.actionVerbs.score}/100 - ${analysis.pillars.actionVerbs.feedback}
• Online Footprint: ${analysis.pillars.contactPresence.score}/100 - ${analysis.pillars.contactPresence.feedback}

MATCHED KEYWORDS (${analysis.matchedKeywords.length}):
${analysis.matchedKeywords.join(', ')}

MISSING RECOMMENDED KEYWORDS (${analysis.missingKeywords.length}):
${analysis.missingKeywords.join(', ') || 'None! Excellent coverage.'}

KEY STRENGTHS:
${analysis.strengths.map(s => `✓ ${s}`).join('\n')}

ACTIONABLE FIXES:
${analysis.criticalFixes.map(f => `→ ${f}`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const scoreColor =
    analysis.overallScore >= 90
      ? 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10'
      : analysis.overallScore >= 80
      ? 'text-[#00A3E0] border-[#00A3E0]/40 bg-[#00A3E0]/10'
      : analysis.overallScore >= 70
      ? 'text-amber-400 border-amber-500/40 bg-amber-500/10'
      : 'text-rose-400 border-rose-500/40 bg-rose-500/10';

  const gradeColor =
    analysis.overallScore >= 90
      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
      : analysis.overallScore >= 80
      ? 'bg-[#00A3E0]/20 text-[#00A3E0] border-[#00A3E0]/30'
      : analysis.overallScore >= 70
      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
      : 'bg-rose-500/20 text-rose-300 border-rose-500/30';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-4xl bg-[#111115] border border-[#26262F] rounded-2xl shadow-2xl overflow-hidden text-[#F3F4F6] flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="px-6 py-5 border-b border-[#202026] flex items-center justify-between bg-[#141418]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#00A3E0]/10 text-[#00A3E0] border border-[#00A3E0]/20 shadow-inner">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Resume & ATS Intelligence Audit
                </h2>
                <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full border ${gradeColor}`}>
                  Grade {analysis.grade}
                </span>
              </div>
              <p className="text-xs text-[#8E8E9A]">
                Candidate: <span className="text-white font-medium">{studentName || resumeData.personal.fullName}</span> · Benchmark analysis for engineering roles
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 text-[#8E8E9A] hover:text-white rounded-lg hover:bg-[#1E1E24] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Role Selector & Custom JD toggle */}
        <div className="px-6 py-3.5 bg-[#16161B] border-b border-[#202026] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[#8E8E9A] font-medium flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-[#00A3E0]" />
              Target Role:
            </span>
            <select
              value={selectedRole}
              onChange={e => setSelectedRole(e.target.value)}
              className="bg-[#1F1F26] border border-[#2B2B36] text-white rounded-lg px-2.5 py-1 font-medium focus:outline-none focus:border-[#00A3E0]"
            >
              {TARGET_ROLE_OPTIONS.map(role => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCustomInput(!showCustomInput)}
              className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors ${
                showCustomInput
                  ? 'bg-[#00A3E0]/15 text-[#00A3E0] border-[#00A3E0]/30'
                  : 'bg-[#1F1F26] text-[#8E8E9A] border-[#2B2B36] hover:text-white'
              }`}
            >
              {showCustomInput ? 'Hide Job Description' : '+ Paste Target Job Description'}
            </button>

            <button
              onClick={handleCopyAnalysis}
              className="px-2.5 py-1 rounded-lg bg-[#1F1F26] border border-[#2B2B36] hover:bg-[#252530] text-[#8E8E9A] hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Report'}</span>
            </button>
          </div>
        </div>

        {/* Optional Custom Job Description Drawer */}
        {showCustomInput && (
          <div className="p-4 bg-[#141418] border-b border-[#202026] animate-in slide-in-from-top-2">
            <label className="text-[11px] font-semibold text-[#8E8E9A] block mb-1.5">
              Paste Job Description from LinkedIn / Portal (Analyzes real keyword density & match score)
            </label>
            <Textarea
              value={customJobDescription}
              onChange={e => setCustomJobDescription(e.target.value)}
              placeholder="Paste responsibilities and requirements from job posting..."
              rows={3}
              className="w-full bg-[#0D0D10] border-[#26262F] text-xs text-gray-200"
            />
          </div>
        )}

        {/* Main Tab Navigation */}
        <div className="px-6 pt-3 border-b border-[#202026] flex items-center gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-[#00A3E0] text-white'
                : 'border-transparent text-[#8E8E9A] hover:text-white'
            }`}
          >
            Audit Overview
          </button>
          <button
            onClick={() => setActiveTab('pillars')}
            className={`pb-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'pillars'
                ? 'border-[#00A3E0] text-white'
                : 'border-transparent text-[#8E8E9A] hover:text-white'
            }`}
          >
            5 Core Pillars
          </button>
          <button
            onClick={() => setActiveTab('keywords')}
            className={`pb-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'keywords'
                ? 'border-[#00A3E0] text-white'
                : 'border-transparent text-[#8E8E9A] hover:text-white'
            }`}
          >
            Keywords Match ({analysis.matchedKeywords.length}/{analysis.matchedKeywords.length + analysis.missingKeywords.length})
          </button>
          <button
            onClick={() => setActiveTab('fixes')}
            className={`pb-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'fixes'
                ? 'border-[#00A3E0] text-white'
                : 'border-transparent text-[#8E8E9A] hover:text-white'
            }`}
          >
            Recruiter Fixes ({analysis.criticalFixes.length})
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in">
              {/* Score Highlight Box */}
              <div className="bg-[#16161C] border border-[#23232C] rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="space-y-2 text-center sm:text-left">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#00A3E0]">
                    ATS & Recruiter Readiness Score
                  </span>
                  <div className="flex items-baseline justify-center sm:justify-start gap-3">
                    <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                      {analysis.overallScore}
                    </span>
                    <span className="text-base text-[#8E8E9A]">/ 100</span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${gradeColor}`}>
                      Grade {analysis.grade}
                    </span>
                  </div>
                  <p className="text-xs text-[#AEAEB8] max-w-lg leading-relaxed pt-1">
                    {analysis.summaryText}
                  </p>
                </div>

                {/* Quick Metrics Badge Column */}
                <div className="grid grid-cols-2 gap-3 w-full sm:w-auto shrink-0">
                  <div className="bg-[#1C1C24] border border-[#262633] rounded-xl p-3 text-center">
                    <span className="text-[10px] text-[#8E8E9A] uppercase font-bold block">Keywords Hit</span>
                    <span className="text-lg font-black text-emerald-400">
                      {analysis.matchedKeywords.length}
                    </span>
                  </div>
                  <div className="bg-[#1C1C24] border border-[#262633] rounded-xl p-3 text-center">
                    <span className="text-[10px] text-[#8E8E9A] uppercase font-bold block">Reading Time</span>
                    <span className="text-lg font-black text-white">
                      {analysis.readingTimeMinutes}m
                    </span>
                  </div>
                  <div className="bg-[#1C1C24] border border-[#262633] rounded-xl p-3 text-center">
                    <span className="text-[10px] text-[#8E8E9A] uppercase font-bold block">Word Count</span>
                    <span className="text-lg font-black text-[#00A3E0]">
                      ~{analysis.wordCount}
                    </span>
                  </div>
                  <div className="bg-[#1C1C24] border border-[#262633] rounded-xl p-3 text-center">
                    <span className="text-[10px] text-[#8E8E9A] uppercase font-bold block">Action Verbs</span>
                    <span className="text-lg font-black text-purple-400">
                      {analysis.pillars.actionVerbs.score >= 80 ? 'High' : 'Medium'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Strengths & Fixes preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-[#141418] border border-[#202026] rounded-xl p-5 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Candidate Strengths</span>
                  </div>
                  <div className="space-y-2 text-xs text-[#AEAEB8]">
                    {analysis.strengths.map((str, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold shrink-0">✓</span>
                        <span>{str}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#141418] border border-[#202026] rounded-xl p-5 space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Top Priority Fixes</span>
                  </div>
                  <div className="space-y-2 text-xs text-[#AEAEB8]">
                    {analysis.criticalFixes.map((fix, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-amber-400 font-bold shrink-0">→</span>
                        <span>{fix}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pillars' && (
            <div className="space-y-4 animate-in fade-in">
              {Object.entries(analysis.pillars).map(([key, pillar]) => {
                const isExcellent = pillar.status === 'excellent';
                const isGood = pillar.status === 'good';
                return (
                  <div
                    key={key}
                    className="bg-[#16161B] border border-[#23232C] rounded-xl p-4 sm:p-5 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-2.5 h-2.5 rounded-full ${
                            isExcellent ? 'bg-emerald-400' : isGood ? 'bg-[#00A3E0]' : 'bg-amber-400'
                          }`}
                        />
                        <h4 className="text-sm font-bold text-white">{pillar.name}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                            isExcellent
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : isGood
                              ? 'bg-[#00A3E0]/15 text-[#00A3E0] border border-[#00A3E0]/30'
                              : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {pillar.score}/100 · {pillar.status.replace('-', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-[#202028] h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isExcellent ? 'bg-emerald-500' : isGood ? 'bg-[#00A3E0]' : 'bg-amber-500'
                        }`}
                        style={{ width: `${pillar.score}%` }}
                      />
                    </div>

                    <p className="text-xs text-[#AEAEB8] leading-relaxed">{pillar.feedback}</p>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'keywords' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Matched Industry Keywords ({analysis.matchedKeywords.length})
                  </h4>
                  <span className="text-[11px] text-[#8E8E9A]">Present in resume</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {analysis.matchedKeywords.length > 0 ? (
                    analysis.matchedKeywords.map((kw, i) => (
                      <span
                        key={i}
                        className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 flex items-center gap-1 font-mono"
                      >
                        <Check className="w-3 h-3 text-emerald-400" />
                        {kw}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-[#8E8E9A]">No primary keywords matched yet.</span>
                  )}
                </div>
              </div>

              <div className="space-y-3 border-t border-[#202026] pt-5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    Missing High-Priority Keywords ({analysis.missingKeywords.length})
                  </h4>
                  <span className="text-[11px] text-[#8E8E9A]">Recommended to add</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {analysis.missingKeywords.length > 0 ? (
                    analysis.missingKeywords.map((kw, i) => (
                      <span
                        key={i}
                        className="text-xs px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/25 flex items-center gap-1 font-mono"
                      >
                        + {kw}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-emerald-400 font-medium">
                      All target keywords found! Excellent job.
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#8E8E9A] leading-relaxed pt-1">
                  Tip: Naturally integrate missing keywords into your Skills section, project descriptions, or bullet points where you have worked with these technologies.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'fixes' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-xl bg-[#16161C] border border-[#262633] space-y-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#00A3E0]" />
                  Recruiter Action Plan
                </h4>
                <p className="text-xs text-[#8E8E9A] leading-relaxed">
                  Executing these recommendations can boost this resume's automated interview callback rate by up to 40% on standard employer ATS platforms.
                </p>
              </div>

              <div className="space-y-3">
                {analysis.recommendations.map((rec, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl bg-[#141418] border border-[#202026] flex items-start gap-3"
                  >
                    <span className="w-5 h-5 rounded-full bg-[#1F1F28] border border-[#2C2C38] text-xs font-mono font-bold text-[#00A3E0] flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-xs text-[#D1D1DB] leading-relaxed">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Actions */}
        <div className="px-6 py-4 bg-[#141418] border-t border-[#202026] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyAnalysis}
              className="text-xs gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Report Copied' : 'Copy Full Analysis'}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => ResumeService.exportToPdf(studentName || resumeData.personal.fullName)}
              className="text-xs gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-[#00A3E0]" />
              <span>Download PDF</span>
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {isOwner && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  onClose();
                  navigate(resumeId ? `/resume-builder?id=${resumeId}` : '/resume-builder');
                }}
                className="text-xs gap-1.5 bg-[#00A3E0] hover:bg-[#0089BC] text-white"
              >
                <span>Edit in Resume Builder</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            )}
            <Button variant="secondary" size="sm" onClick={onClose} className="text-xs">
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
