import React, { useState } from 'react';
import { usePlan } from '../context/PlanContext';
import { Button } from '../components/ui/Button';
import {
  Check,
  X,
  Sparkles,
  Zap,
  Crown,
  ShieldCheck,
  HelpCircle,
  Clock,
  ArrowRight,
  FileText,
  Lock,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const PricingPage: React.FC = () => {
  const { plan: currentPlan, openCheckoutModal } = usePlan();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
          <Sparkles className="w-3.5 h-3.5" />
          Transparent Student Plans
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
          Simple, Affordable Plans for Every Student
        </h1>
        <p className="text-base sm:text-lg text-gray-400">
          Start building free. Upgrade for watermark-free PDFs, Word export, AI bullet points, and ATS Keyword Match reports to land more interviews.
        </p>

        {/* Instant UPI Activation Badge */}
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/25 px-4 py-2 rounded-xl text-xs text-emerald-300 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Instant plan activation via PhonePe / UPI QR Scan</span>
        </div>
      </div>

      {/* Monthly / Yearly Toggle for Premium */}
      <div className="flex items-center justify-center gap-4 mb-12">
        <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-white' : 'text-gray-400'}`}>
          Monthly Billing
        </span>
        <button
          onClick={() => setBillingCycle(prev => (prev === 'monthly' ? 'yearly' : 'monthly'))}
          className="w-14 h-8 bg-gray-800 rounded-full p-1 relative border border-gray-700 transition-colors cursor-pointer"
        >
          <div
            className={`w-6 h-6 rounded-full bg-blue-500 shadow-md transition-transform duration-200 ${
              billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-0'
            }`}
          />
        </button>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-white' : 'text-gray-400'}`}>
            Yearly Billing
          </span>
          <span className="bg-emerald-500/20 text-emerald-400 text-[11px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
            Save 58%
          </span>
        </div>
      </div>

      {/* 3 Main Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mb-20">
        {/* 1. Free Tier */}
        <div className="bg-[#111] border border-gray-800 rounded-3xl p-7 flex flex-col justify-between hover:border-gray-700 transition-all">
          <div className="space-y-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 px-2.5 py-1 rounded-md bg-gray-800 border border-gray-700">
                Free Student
              </span>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white">₹0</span>
                <span className="text-xs text-gray-400">/ forever</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Create your first resume. Free for up to 3 downloads or sends.
              </p>
            </div>

            <div className="border-t border-gray-800/80 pt-5 space-y-3 text-xs text-gray-300">
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong>1 Resume</strong> saved to account</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong>2 Simple Templates</strong> (Tech & Classic)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>PDF Download (with SkillBridge watermark)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Auto-fill from SkillBridge projects</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong>3 Email sends</strong> / job applications</span>
              </div>
              <div className="flex items-center gap-2.5 text-gray-500">
                <X className="w-4 h-4 text-gray-600 shrink-0" />
                <span>No Word (.docx) download</span>
              </div>
              <div className="flex items-center gap-2.5 text-gray-500">
                <X className="w-4 h-4 text-gray-600 shrink-0" />
                <span>No AI summary writing</span>
              </div>
              <div className="flex items-center gap-2.5 text-gray-500">
                <X className="w-4 h-4 text-gray-600 shrink-0" />
                <span>No ATS Keyword Match report</span>
              </div>
            </div>
          </div>

          <div className="pt-8">
            <Link to="/resume-builder">
              <Button
                variant="outline"
                className="w-full py-3 rounded-xl border-gray-700 text-gray-300 hover:text-white"
              >
                {currentPlan === 'free' ? 'Current Plan' : 'Use Free Plan'}
              </Button>
            </Link>
          </div>
        </div>

        {/* 2. Basic Plan */}
        <div className="bg-[#111] border border-blue-500/40 rounded-3xl p-7 flex flex-col justify-between hover:border-blue-500/70 transition-all relative shadow-xl shadow-blue-500/5">
          <div className="space-y-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400 px-2.5 py-1 rounded-md bg-blue-500/10 border border-blue-500/20">
                Basic Plan
              </span>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white">₹99</span>
                <span className="text-xs text-gray-400">/ one-time</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Affordable one-time student investment with no recurring fees.
              </p>
            </div>

            <div className="border-t border-gray-800/80 pt-5 space-y-3 text-xs text-gray-300">
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong>3 Resumes</strong> saved to account</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong>10 Templates</strong> included</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong>No watermark</strong> on PDF downloads</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong>Word (.docx)</strong> download enabled</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Public resume shareable link</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong>20 Email sends</strong> to recruiters</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong>5 AI Summary</strong> generation uses</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Basic <strong>ATS Keyword Match</strong> score</span>
              </div>
            </div>
          </div>

          <div className="pt-8">
            <Button
              onClick={() => openCheckoutModal('basic', 'one-time')}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2"
            >
              <span>{currentPlan === 'basic' ? 'Current Plan' : 'Get Basic (₹99)'}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* 3. Premium Plan */}
        <div className="bg-gradient-to-b from-indigo-950/30 via-[#111] to-purple-950/20 border-2 border-indigo-500/70 rounded-3xl p-7 flex flex-col justify-between hover:border-indigo-400 transition-all relative shadow-2xl shadow-indigo-500/15">
          <div className="absolute -top-3.5 right-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-bold px-3.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
            Best Value
          </div>

          <div className="space-y-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 px-2.5 py-1 rounded-md bg-indigo-500/20 border border-indigo-500/30 inline-flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                Premium Plan
              </span>
              <div className="mt-4 flex items-baseline gap-1.5">
                <span className="text-4xl font-extrabold text-white">
                  {billingCycle === 'yearly' ? '₹1,499' : '₹299'}
                </span>
                <span className="text-xs text-gray-400">
                  {billingCycle === 'yearly' ? '/ year' : '/ month'}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {billingCycle === 'yearly'
                  ? '₹125/month effective price. Full suite for active placements.'
                  : 'Flexible monthly plan. Cancel anytime.'}
              </p>
            </div>

            <div className="border-t border-gray-800/80 pt-5 space-y-3 text-xs text-gray-200">
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong>Unlimited Resumes</strong></span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong>30+ Templates</strong> (Creative & ATS-optimized)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>No watermark + PDF & Word (.docx) export</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Custom URL public portfolio</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong>Unlimited</strong> email sends & job applies</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong>Unlimited AI</strong> bullet & objective writer</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong>Full ATS Keyword Match</strong> report with fixes</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Cover letter builder & View analytics</span>
              </div>

              {/* Labeled Coming Soon as requested */}
              <div className="flex items-center justify-between text-gray-400 pt-1">
                <span className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-gray-500" />
                  Resume review by expert
                </span>
                <span className="text-[10px] uppercase font-bold text-amber-400/90 bg-amber-400/10 px-2 py-0.5 rounded-sm">Coming Soon</span>
              </div>
              <div className="flex items-center justify-between text-gray-400">
                <span className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-gray-500" />
                  Profile boost (shown first)
                </span>
                <span className="text-[10px] uppercase font-bold text-amber-400/90 bg-amber-400/10 px-2 py-0.5 rounded-sm">Coming Soon</span>
              </div>
            </div>
          </div>

          <div className="pt-8">
            <Button
              onClick={() => openCheckoutModal('premium', billingCycle)}
              className="w-full py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25"
            >
              <span>{currentPlan === 'premium' ? 'Current Plan' : 'Get Premium'}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Comprehensive Feature Comparison Matrix */}
      <div className="bg-[#111] border border-gray-800 rounded-3xl p-6 sm:p-10 mb-20 overflow-x-auto">
        <h2 className="text-2xl font-bold text-white mb-2">Detailed Plan Comparison</h2>
        <p className="text-sm text-gray-400 mb-8">
          Compare every feature to choose the best option for your academic and career goals.
        </p>

        <table className="w-full text-left text-xs sm:text-sm text-gray-300 min-w-[620px]">
          <thead>
            <tr className="border-b border-gray-800 text-gray-400">
              <th className="pb-4 font-semibold w-1/3">Feature</th>
              <th className="pb-4 font-semibold text-center w-1/5">Free</th>
              <th className="pb-4 font-semibold text-center w-1/5 text-blue-400">Basic (₹99)</th>
              <th className="pb-4 font-semibold text-center w-1/4 text-indigo-400">Premium</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60">
            <tr>
              <td className="py-3.5 font-medium text-gray-200">Resume count</td>
              <td className="py-3.5 text-center text-gray-400">1</td>
              <td className="py-3.5 text-center font-semibold text-white">3</td>
              <td className="py-3.5 text-center font-bold text-indigo-400">Unlimited</td>
            </tr>
            <tr>
              <td className="py-3.5 font-medium text-gray-200">Templates</td>
              <td className="py-3.5 text-center text-gray-400">2 simple</td>
              <td className="py-3.5 text-center font-semibold text-white">10</td>
              <td className="py-3.5 text-center font-bold text-indigo-400">30+ (Creative & ATS)</td>
            </tr>
            <tr>
              <td className="py-3.5 font-medium text-gray-200">PDF download</td>
              <td className="py-3.5 text-center text-amber-400/90">Yes, with watermark</td>
              <td className="py-3.5 text-center font-semibold text-emerald-400">No watermark</td>
              <td className="py-3.5 text-center font-bold text-emerald-400">No watermark</td>
            </tr>
            <tr>
              <td className="py-3.5 font-medium text-gray-200">Word (.docx) download</td>
              <td className="py-3.5 text-center text-gray-600">—</td>
              <td className="py-3.5 text-center text-emerald-400 font-semibold">Yes</td>
              <td className="py-3.5 text-center text-emerald-400 font-bold">Yes</td>
            </tr>
            <tr>
              <td className="py-3.5 font-medium text-gray-200">Public resume link</td>
              <td className="py-3.5 text-center text-gray-600">—</td>
              <td className="py-3.5 text-center text-emerald-400 font-semibold">Yes</td>
              <td className="py-3.5 text-center text-emerald-400 font-bold">Yes, custom URL</td>
            </tr>
            <tr>
              <td className="py-3.5 font-medium text-gray-200">Send to email / apply</td>
              <td className="py-3.5 text-center text-gray-400">3 sends</td>
              <td className="py-3.5 text-center text-white font-semibold">20 sends</td>
              <td className="py-3.5 text-center text-indigo-400 font-bold">Unlimited</td>
            </tr>
            <tr>
              <td className="py-3.5 font-medium text-gray-200">Auto-fill from SkillBridge</td>
              <td className="py-3.5 text-center text-emerald-400">Yes</td>
              <td className="py-3.5 text-center text-emerald-400 font-semibold">Yes</td>
              <td className="py-3.5 text-center text-emerald-400 font-bold">Yes</td>
            </tr>
            <tr>
              <td className="py-3.5 font-medium text-gray-200">AI summary & bullet writing</td>
              <td className="py-3.5 text-center text-gray-600">—</td>
              <td className="py-3.5 text-center text-white font-semibold">5 uses</td>
              <td className="py-3.5 text-center text-indigo-400 font-bold">Unlimited</td>
            </tr>
            <tr>
              <td className="py-3.5 font-medium text-gray-200">ATS Keyword Match</td>
              <td className="py-3.5 text-center text-gray-400">Basic check</td>
              <td className="py-3.5 text-center text-white font-semibold">Basic score</td>
              <td className="py-3.5 text-center text-indigo-400 font-bold">Full report with fixes</td>
            </tr>
            <tr>
              <td className="py-3.5 font-medium text-gray-200">Cover letter builder</td>
              <td className="py-3.5 text-center text-gray-600">—</td>
              <td className="py-3.5 text-center text-gray-600">—</td>
              <td className="py-3.5 text-center text-emerald-400 font-bold">Yes</td>
            </tr>
            <tr>
              <td className="py-3.5 font-medium text-gray-200">Resume review by expert</td>
              <td className="py-3.5 text-center text-gray-600">—</td>
              <td className="py-3.5 text-center text-gray-600">—</td>
              <td className="py-3.5 text-center text-amber-400 text-xs font-semibold">Coming soon</td>
            </tr>
            <tr>
              <td className="py-3.5 font-medium text-gray-200">Profile boost to recruiters</td>
              <td className="py-3.5 text-center text-gray-600">—</td>
              <td className="py-3.5 text-center text-gray-600">—</td>
              <td className="py-3.5 text-center text-amber-400 text-xs font-semibold">Coming soon</td>
            </tr>
            <tr>
              <td className="py-3.5 font-medium text-gray-200">Resume views & analytics</td>
              <td className="py-3.5 text-center text-gray-600">—</td>
              <td className="py-3.5 text-center text-gray-600">—</td>
              <td className="py-3.5 text-center text-emerald-400 font-bold">Yes</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* FAQ & Terms Notice for Razorpay compliance */}
      <div className="max-w-3xl mx-auto space-y-6 text-xs text-gray-400 border-t border-gray-800 pt-10">
        <h3 className="text-sm font-bold text-gray-200">Student Guarantee & Terms</h3>
        <p>
          Students are price-sensitive: Basic is strictly under ₹100 with zero auto-renewals. Premium plans can be cancelled anytime with a single click. In accordance with Razorpay merchant requirements, full refunds are honored within 7 days if you are unsatisfied with resume exports.
        </p>
      </div>
    </div>
  );
};
