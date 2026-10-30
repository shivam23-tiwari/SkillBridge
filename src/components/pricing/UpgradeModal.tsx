import React from 'react';
import { usePlan } from '../../context/PlanContext';
import { Button } from '../ui/Button';
import {
  X,
  Check,
  Sparkles,
  Zap,
  Crown,
  FileCheck,
  Shield,
  ArrowRight,
  Clock,
} from 'lucide-react';

export const UpgradeModal: React.FC = () => {
  const {
    isUpgradeModalOpen,
    closeUpgradeModal,
    upgradeFeaturePrompt,
    openCheckoutModal,
    freeUsesRemaining,
  } = usePlan();

  if (!isUpgradeModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-4xl bg-[#111] border border-gray-800 rounded-3xl shadow-2xl overflow-hidden text-gray-100 flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="p-6 sm:p-8 border-b border-gray-800/80 flex items-start justify-between relative bg-gradient-to-b from-blue-950/20 to-transparent">
          <div className="space-y-1 pr-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Student Friendly Pricing
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Unlock More Resume Power
            </h2>
            <p className="text-sm text-gray-400 max-w-xl">
              {upgradeFeaturePrompt ||
                `Resume creation is 100% free with 10 free watermark-free PDF downloads. You currently have ${freeUsesRemaining} of 10 free downloads left. Upgrade for unlimited downloads and ATS tools.`}
            </p>
          </div>
          <button
            onClick={closeUpgradeModal}
            className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-gray-800 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pricing Cards Comparison */}
        <div className="p-6 sm:p-8 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1. Basic Plan */}
          <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6 flex flex-col justify-between hover:border-blue-500/40 transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400 px-2.5 py-1 rounded-md bg-blue-500/10 border border-blue-500/20">
                  Basic Plan
                </span>
                <span className="text-xs text-gray-400 font-medium">One-Time Fee</span>
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">₹99</span>
                  <span className="text-xs text-gray-400">/ lifetime</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Pocket-friendly for students applying for first internships.
                </p>
              </div>

              <div className="border-t border-gray-800/80 pt-4 space-y-2.5 text-xs text-gray-300">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>3 Resumes</strong> saved to your profile</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>10 Templates</strong> (Clean & Modern)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>No watermark</strong> on PDF downloads</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Word (.docx)</strong> export included</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Public shareable resume link</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>20 Email sends</strong> to recruiters</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>5 AI Summary</strong> generation credits</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Basic <strong>ATS Keyword Match</strong> score</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <Button
                onClick={() => openCheckoutModal('basic', 'one-time')}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2"
              >
                <span>Get Basic for ₹99</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* 2. Premium Plan */}
          <div className="rounded-2xl border-2 border-indigo-500/60 bg-gradient-to-b from-indigo-950/20 via-gray-900/80 to-purple-950/20 p-6 flex flex-col justify-between relative shadow-xl shadow-indigo-500/10">
            <div className="absolute -top-3 right-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
              Most Popular
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 px-2.5 py-1 rounded-md bg-indigo-500/15 border border-indigo-500/30 flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  Premium Plan
                </span>
                <span className="text-xs text-indigo-300 font-medium">Monthly / Yearly</span>
              </div>
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl font-black text-white">₹299</span>
                  <span className="text-xs text-gray-400">/ month</span>
                  <span className="text-xs text-emerald-400 ml-2 font-medium">or ₹1,499/year (Save 58%)</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Full suite for active job seekers and engineering graduates.
                </p>
              </div>

              <div className="border-t border-gray-800/80 pt-4 space-y-2.5 text-xs text-gray-200">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Unlimited Resumes</strong> saved to your profile</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>30+ Templates</strong> (Creative & ATS-Optimized)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>No watermark + PDF & Word (.docx) export</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Custom URL public portfolio (skillbridge.me/yourname)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Unlimited</strong> email sends & job applications</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Unlimited AI</strong> summary & bullet writer</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Full ATS Keyword Match</strong> report with fixes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Interactive <strong>Cover Letter Builder</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Resume views & download analytics</span>
                </div>
                {/* User instructed: Label Expert Review and Profile Boost "Coming soon" */}
                <div className="flex items-center justify-between text-gray-400 pt-1">
                  <span className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-gray-500" />
                    Expert Resume Review
                  </span>
                  <span className="text-[10px] uppercase font-bold text-amber-400/90 bg-amber-400/10 px-2 py-0.5 rounded-sm">Coming Soon</span>
                </div>
                <div className="flex items-center justify-between text-gray-400">
                  <span className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-gray-500" />
                    Profile Boost to Recruiters
                  </span>
                  <span className="text-[10px] uppercase font-bold text-amber-400/90 bg-amber-400/10 px-2 py-0.5 rounded-sm">Coming Soon</span>
                </div>
              </div>
            </div>

            <div className="pt-6 space-y-2">
              <Button
                onClick={() => openCheckoutModal('premium', 'monthly')}
                className="w-full py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25"
              >
                <span>Upgrade to Premium (₹299/mo)</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
              <button
                onClick={() => openCheckoutModal('premium', 'yearly')}
                className="w-full text-center text-xs text-indigo-300 hover:underline pt-1 block"
              >
                Or pay ₹1,499 yearly (Save 58%)
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:px-8 border-t border-gray-800 bg-gray-950/70 flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-400" />
            <span>Instant UPI &amp; PhonePe QR Checkout • 100% Student Satisfaction Guarantee.</span>
          </div>
          <button
            onClick={closeUpgradeModal}
            className="text-gray-400 hover:text-white underline underline-offset-2"
          >
            Continue with Free Plan (No Watermark)
          </button>
        </div>
      </div>
    </div>
  );
};
