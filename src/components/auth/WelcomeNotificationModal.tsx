import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  FolderGit2,
  Briefcase,
  FileText,
  Mail,
  X,
} from 'lucide-react';

export const WelcomeNotificationModal: React.FC = () => {
  const { user, isOwner, welcomeModalOpen, dismissWelcomeModal } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user || !welcomeModalOpen) return null;

  const handleGetStarted = () => {
    dismissWelcomeModal();
    const targetRoute = isOwner ? '/admin' : '/dashboard';
    if (location.pathname !== targetRoute) {
      navigate(targetRoute);
    }
  };

  return (
    <AnimatePresence>
      {welcomeModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="welcome-modal-title"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="relative w-full max-w-md bg-[#121215] border border-[#202026] rounded-2xl shadow-2xl overflow-hidden text-[#F3F4F6]"
          >
            {/* Top Accent Bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-[#00A3E0] via-[#FF2D95] to-[#00A3E0]" />

            {/* Close button */}
            <button
              type="button"
              onClick={dismissWelcomeModal}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-[#8E8E9A] hover:text-[#F3F4F6] hover:bg-[#18181D] transition-colors cursor-pointer"
              aria-label="Dismiss welcome notification"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-6 sm:p-8 space-y-6">
              {/* Icon & Headline */}
              <div className="text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-[#FF2D95]/10 border border-[#FF2D95]/30 flex items-center justify-center mx-auto text-[#FF2D95] shadow-inner">
                  <Sparkles className="w-7 h-7" />
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00A3E0]/10 border border-[#00A3E0]/30 text-[#00A3E0] text-[11px] font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Account Created Successfully</span>
                </div>

                <h2
                  id="welcome-modal-title"
                  className="text-xl sm:text-2xl font-extrabold text-[#F3F4F6] tracking-tight pt-1"
                >
                  🎉 Welcome to SkillBridge!
                </h2>

                <p className="text-xs sm:text-sm text-[#D1D5DB] leading-relaxed">
                  Your account has been created successfully. We&apos;re excited to have you here,{' '}
                  <span className="font-semibold text-white">{user.name}</span>.
                </p>
                <p className="text-xs text-[#8E8E9A] leading-relaxed">
                  Explore the platform and get started!
                </p>
              </div>

              {/* Quick Feature Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <div className="p-3 rounded-xl bg-[#18181D] border border-[#202026] flex sm:flex-col items-center sm:text-center gap-2.5 sm:gap-1.5">
                  <FolderGit2 className="w-4 h-4 text-[#00A3E0] shrink-0" />
                  <span className="text-[11px] font-medium text-[#D1D5DB]">Publish Projects</span>
                </div>
                <div className="p-3 rounded-xl bg-[#18181D] border border-[#202026] flex sm:flex-col items-center sm:text-center gap-2.5 sm:gap-1.5">
                  <Briefcase className="w-4 h-4 text-[#FF2D95] shrink-0" />
                  <span className="text-[11px] font-medium text-[#D1D5DB]">Freelance Jobs</span>
                </div>
                <div className="p-3 rounded-xl bg-[#18181D] border border-[#202026] flex sm:flex-col items-center sm:text-center gap-2.5 sm:gap-1.5">
                  <FileText className="w-4 h-4 text-[#00A3E0] shrink-0" />
                  <span className="text-[11px] font-medium text-[#D1D5DB]">Resume Builder</span>
                </div>
              </div>

              {/* Welcome Email Notice */}
              <div className="p-3 rounded-xl bg-[#0A0A0A] border border-[#202026] flex items-center gap-2.5 text-left">
                <Mail className="w-4 h-4 text-[#00A3E0] shrink-0" />
                <p className="text-[11px] text-[#8E8E9A] leading-snug">
                  A welcome confirmation email has been sent to{' '}
                  <span className="text-[#F3F4F6] font-medium break-all">{user.email}</span>.
                </p>
              </div>

              {/* Get Started Action */}
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleGetStarted}
                className="w-full gap-2 justify-center py-2.5 text-sm font-bold"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
