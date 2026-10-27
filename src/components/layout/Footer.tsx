import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PlatformStandardsModal } from '../modals/PlatformStandardsModal';
import { ShieldCheck, Instagram, ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  const [standardsModalOpen, setStandardsModalOpen] = useState(false);
  const [activeStandardTopic, setActiveStandardTopic] = useState<string>('verification');

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openStandards = (topic: string) => {
    setActiveStandardTopic(topic);
    setStandardsModalOpen(true);
  };

  return (
    <>
      <footer className="mt-24 border-t border-[#202026] bg-[#0A0A0A] text-[#9CA3AF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            {/* Brand */}
            <div className="md:col-span-1 space-y-2.5">
              <Link
                to="/"
                onClick={scrollToTop}
                className="text-base font-bold text-[#F3F4F6] flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-xs bg-[#FF2D95]" />
                <span className="tracking-tight">
                  <span className="text-[#00A3E0]">Skill</span>
                  <span className="text-[#FF2D95]">Bridge</span>
                </span>
              </Link>
              <p className="text-xs text-[#8E8E9A] leading-relaxed">
                University freelancer directory and engineering project index. Discover student builders, verified portfolios, and contract opportunities.
              </p>
              <div className="pt-2">
                <a
                  href="https://www.instagram.com/cinecritiq/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#121215] border border-[#202026] hover:border-[#FF2D95] text-xs text-[#F3F4F6] hover:text-[#FF2D95] transition-colors"
                >
                  <Instagram className="w-3.5 h-3.5 text-[#FF2D95]" />
                  <span>Follow @cinecritiq</span>
                  <ArrowUpRight className="w-3 h-3 text-[#8E8E9A]" />
                </a>
              </div>
            </div>

            {/* Navigation / Directory */}
            <div>
              <h4 className="text-xs font-semibold text-[#F3F4F6] mb-3 uppercase tracking-wider">
                Directory
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link
                    to="/projects"
                    onClick={scrollToTop}
                    className="text-[#8E8E9A] hover:text-[#00A3E0] transition-colors"
                  >
                    Explore Projects
                  </Link>
                </li>
                <li>
                  <Link
                    to="/students"
                    onClick={scrollToTop}
                    className="text-[#8E8E9A] hover:text-[#00A3E0] transition-colors"
                  >
                    Find Student Freelancers
                  </Link>
                </li>
                <li>
                  <Link
                    to="/jobs"
                    onClick={scrollToTop}
                    className="text-[#8E8E9A] hover:text-[#00A3E0] transition-colors"
                  >
                    Browse Freelance Jobs
                  </Link>
                </li>
                <li>
                  <Link
                    to="/projects/new"
                    onClick={scrollToTop}
                    className="text-[#8E8E9A] hover:text-[#FF2D95] transition-colors"
                  >
                    Submit Project Post
                  </Link>
                </li>
                <li>
                  <Link
                    to="/jobs/new"
                    onClick={scrollToTop}
                    className="text-[#8E8E9A] hover:text-[#FF2D95] transition-colors"
                  >
                    Post Job
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    onClick={scrollToTop}
                    className="text-[#8E8E9A] hover:text-[#00A3E0] transition-colors"
                  >
                    Contact Owner
                  </Link>
                </li>
              </ul>
            </div>

            {/* Disciplines */}
            <div>
              <h4 className="text-xs font-semibold text-[#F3F4F6] mb-3 uppercase tracking-wider">
                Disciplines
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link
                    to="/projects?category=Web+Development"
                    onClick={scrollToTop}
                    className="text-[#8E8E9A] hover:text-[#00A3E0] transition-colors"
                  >
                    Web Development
                  </Link>
                </li>
                <li>
                  <Link
                    to="/projects?category=AI+%26+Machine+Learning"
                    onClick={scrollToTop}
                    className="text-[#8E8E9A] hover:text-[#00A3E0] transition-colors"
                  >
                    AI & Machine Learning
                  </Link>
                </li>
                <li>
                  <Link
                    to="/projects?category=UI%2FUX+Design"
                    onClick={scrollToTop}
                    className="text-[#8E8E9A] hover:text-[#00A3E0] transition-colors"
                  >
                    UI/UX Design
                  </Link>
                </li>
                <li>
                  <Link
                    to="/projects?category=Mobile+Apps"
                    onClick={scrollToTop}
                    className="text-[#8E8E9A] hover:text-[#00A3E0] transition-colors"
                  >
                    Mobile Applications
                  </Link>
                </li>
                <li>
                  <Link
                    to="/projects?category=Data+Science"
                    onClick={scrollToTop}
                    className="text-[#8E8E9A] hover:text-[#00A3E0] transition-colors"
                  >
                    Data Science
                  </Link>
                </li>
              </ul>
            </div>

            {/* Standards */}
            <div>
              <div className="flex items-center gap-1.5 mb-3">
                <ShieldCheck className="w-3.5 h-3.5 text-[#00A3E0]" />
                <h4 className="text-xs font-semibold text-[#F3F4F6] uppercase tracking-wider">
                  Platform Standards
                </h4>
              </div>
              <ul className="space-y-2 text-xs">
                <li>
                  <button
                    onClick={() => openStandards('verification')}
                    className="text-[#8E8E9A] hover:text-[#00A3E0] transition-colors text-left cursor-pointer flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00A3E0]" />
                    Verified student status
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => openStandards('contracts')}
                    className="text-[#8E8E9A] hover:text-[#00A3E0] transition-colors text-left cursor-pointer flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00A3E0]" />
                    Direct client-to-freelancer contracts
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => openStandards('zero_fee')}
                    className="text-[#8E8E9A] hover:text-[#FF2D95] transition-colors text-left cursor-pointer flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF2D95]" />
                    Zero platform take rate on student earnings
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => openStandards('code')}
                    className="text-[#8E8E9A] hover:text-[#00A3E0] transition-colors text-left cursor-pointer flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00A3E0]" />
                    Open portfolio code verification
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Official Instagram Lower Strip */}
          <div className="mb-8 p-4 rounded-xl bg-[#121215] border border-[#202026] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] p-[1.5px] shrink-0">
                <div className="w-full h-full rounded-[7px] bg-[#0A0A0A] flex items-center justify-center">
                  <Instagram className="w-4 h-4 text-[#FF2D95]" />
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-[#F3F4F6]">
                  Want information, reels, and updates related to SkillBridge?
                </p>
                <p className="text-[11px] text-[#8E8E9A]">
                  Find all website guides, student skill builds, and announcements on our Instagram{' '}
                  <a
                    href="https://www.instagram.com/cinecritiq/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#00A3E0] hover:underline font-mono"
                  >
                    @cinecritiq
                  </a>
                  . Anyone who wants to can follow!
                </p>
              </div>
            </div>
            <a
              href="https://www.instagram.com/cinecritiq/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg bg-[#FF2D95] hover:bg-[#E61980] text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shrink-0"
            >
              <Instagram className="w-3.5 h-3.5" />
              <span>Follow @cinecritiq</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="pt-6 border-t border-[#202026] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8E8E9A]">
            <p>© {new Date().getFullYear()} SkillBridge. All rights reserved.</p>
            <div className="flex flex-wrap items-center gap-4 text-[#8E8E9A]">
              <a
                href="https://www.instagram.com/cinecritiq/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#FF2D95] transition-colors inline-flex items-center gap-1 font-medium text-[#F3F4F6]"
              >
                <Instagram className="w-3.5 h-3.5 text-[#FF2D95]" />
                <span>@cinecritiq</span>
              </a>
              <span>·</span>
              <span>Direct student hire exchange</span>
              <span>·</span>
              <button
                onClick={() => openStandards('verification')}
                className="hover:text-[#00A3E0] transition-colors cursor-pointer"
              >
                Verification Standards
              </button>
            </div>
          </div>
        </div>
      </footer>

      <PlatformStandardsModal
        isOpen={standardsModalOpen}
        onClose={() => setStandardsModalOpen(false)}
        activeTopic={activeStandardTopic}
      />
    </>
  );
};
