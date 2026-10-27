import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle,
  GraduationCap,
  Percent,
  Code2,
  FileText,
  Lock,
  ArrowRight,
} from 'lucide-react';

interface PlatformStandardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTopic?: string;
}

export const PlatformStandardsModal: React.FC<PlatformStandardsModalProps> = ({
  isOpen,
  onClose,
  activeTopic,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="SkillBridge Platform Standards & Verification"
      description="Transparent, institutional-grade engineering standards protecting both student freelancers and hiring clients."
      maxWidth="xl"
    >
      <div className="space-y-6 text-[#F3F4F6] text-xs">
        {/* Intro Banner */}
        <div className="p-4 rounded-xl bg-[#121215] border border-[#202026] flex items-start gap-3">
          <div className="p-2 rounded-lg bg-[#FF2D95]/10 border border-[#FF2D95]/30 text-[#FF2D95] shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-[#F3F4F6] text-sm">
              The Collegiate Engineering Trust Protocol
            </h4>
            <p className="text-[#8E8E9A] leading-relaxed">
              SkillBridge connects verified university developers directly with founders, research labs, and tech teams. We enforce zero platform fees on student earnings while requiring open source verification.
            </p>
          </div>
        </div>

        {/* 4 Core Standards Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Pillar 1 */}
          <div className={`p-4 rounded-xl border space-y-2 transition-all ${
            activeTopic === 'verification' || activeTopic === 'student status'
              ? 'bg-[#18181D] border-[#00A3E0]'
              : 'bg-[#121215] border-[#202026]'
          }`}>
            <div className="flex items-center gap-2 text-[#00A3E0] font-bold">
              <GraduationCap className="w-4 h-4" />
              <span>1. Verified Student Status</span>
            </div>
            <p className="text-[#8E8E9A] leading-relaxed">
              Every student profile requires validation through institutional <code className="text-[#00A3E0]">.edu</code> or university email addresses, enrollment verification, and GitHub collegiate developer pack authentication.
            </p>
            <div className="pt-2">
              <Link to="/students" onClick={onClose} className="text-[#00A3E0] hover:underline font-semibold flex items-center gap-1 text-[11px]">
                Browse Verified Students <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className={`p-4 rounded-xl border space-y-2 transition-all ${
            activeTopic === 'contracts'
              ? 'bg-[#18181D] border-[#00A3E0]'
              : 'bg-[#121215] border-[#202026]'
          }`}>
            <div className="flex items-center gap-2 text-[#00A3E0] font-bold">
              <FileText className="w-4 h-4" />
              <span>2. Direct Client Contracts</span>
            </div>
            <p className="text-[#8E8E9A] leading-relaxed">
              Clients contract directly with student developers. No algorithmic lockouts, opaque intermediaries, or captive communication walls. Transparent milestone scopes and fixed deliveries.
            </p>
            <div className="pt-2">
              <Link to="/jobs" onClick={onClose} className="text-[#00A3E0] hover:underline font-semibold flex items-center gap-1 text-[11px]">
                Browse Open Contracts <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className={`p-4 rounded-xl border space-y-2 transition-all ${
            activeTopic === 'zero_fee'
              ? 'bg-[#18181D] border-[#FF2D95]'
              : 'bg-[#121215] border-[#202026]'
          }`}>
            <div className="flex items-center gap-2 text-[#FF2D95] font-bold">
              <Percent className="w-4 h-4" />
              <span>3. 0% Student Platform Fee</span>
            </div>
            <p className="text-[#8E8E9A] leading-relaxed">
              Unlike traditional freelance platforms taking 20% from student payouts, SkillBridge takes <strong className="text-white">0% take rate</strong> from student earnings. 100% of agreed budget goes to the student builder.
            </p>
            <div className="pt-2">
              <span className="text-[10px] font-mono text-[#FF2D95] font-semibold">
                Guaranteed: 100% Student Payout
              </span>
            </div>
          </div>

          {/* Pillar 4 */}
          <div className={`p-4 rounded-xl border space-y-2 transition-all ${
            activeTopic === 'code'
              ? 'bg-[#18181D] border-[#00A3E0]'
              : 'bg-[#121215] border-[#202026]'
          }`}>
            <div className="flex items-center gap-2 text-[#00A3E0] font-bold">
              <Code2 className="w-4 h-4" />
              <span>4. Open Portfolio Code</span>
            </div>
            <p className="text-[#8E8E9A] leading-relaxed">
              Every showcased project includes links to open source repositories (GitHub) and live production demos. Clients can inspect commit velocity, architectural clean code, and actual functional prototypes.
            </p>
            <div className="pt-2">
              <Link to="/projects" onClick={onClose} className="text-[#00A3E0] hover:underline font-semibold flex items-center gap-1 text-[11px]">
                Explore Verified Codebases <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-3 border-t border-[#202026]">
          <Button variant="primary" size="sm" onClick={onClose}>
            Got it, continue
          </Button>
        </div>
      </div>
    </Modal>
  );
};
