import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DataService } from '../services/store';
import { SavedResume } from '../types';
import { ResumePreview } from '../components/resume/ResumePreview';
import { ResumeService } from '../services/resumeService';
import { Button } from '../components/ui/Button';
import {
  Download,
  Share2,
  Mail,
  ArrowLeft,
  Sparkles,
  Lock,
  Check,
} from 'lucide-react';

export const PublicResumePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [resume, setResume] = useState<SavedResume | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (slug) {
      const found = DataService.getResumeBySlug(slug);
      if (found) {
        setResume(found);
        DataService.incrementResumeViews(slug);
      }
      setLoading(false);
    }
  }, [slug]);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (resume) {
      ResumeService.exportToPdf(
        resume.data?.personal?.fullName || resume.title,
        resume.data,
        false
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] text-gray-400">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!resume || (!resume.isPublic && !window.location.search.includes('preview=true'))) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#0A0A0A] text-gray-200">
        <div className="max-w-md w-full bg-[#111] border border-gray-800 rounded-2xl p-8 text-center space-y-4">
          <div className="w-14 h-14 bg-gray-900 border border-gray-800 rounded-full flex items-center justify-center mx-auto text-amber-400">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-white">Resume Is Private Or Not Found</h1>
          <p className="text-sm text-gray-400">
            The candidate has either marked this resume as private or the link is incorrect.
          </p>
          <Link to="/" className="inline-block pt-2">
            <Button variant="outline" className="border-gray-700 text-gray-300">
              Back to SkillBridge Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-gray-100 pb-16">
      {/* Top Floating Action Bar */}
      <div className="sticky top-0 z-30 bg-black/80 backdrop-blur-md border-b border-gray-800/80 px-4 py-3">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-xs text-gray-400 hover:text-white flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              SkillBridge
            </Link>
            <span className="text-gray-600">|</span>
            <span className="text-sm font-semibold text-white truncate max-w-[220px]">
              {resume.data?.personal?.fullName || resume.title}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg border border-gray-700 hover:border-gray-600 text-xs text-gray-300 flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Share Link'}</span>
            </button>

            {resume.data?.personal?.email && (
              <a
                href={`mailto:${resume.data.personal.email}?subject=Opportunity from SkillBridge`}
                className="px-3 py-1.5 rounded-lg border border-gray-700 hover:border-gray-600 text-xs text-gray-300 flex items-center gap-1.5 transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Contact</span>
              </a>
            )}

            <Button
              size="sm"
              onClick={handleDownload}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-md shadow-blue-600/20"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Centered A4 Resume Canvas */}
      <div className="max-w-4xl mx-auto px-4 pt-8">
        <ResumePreview data={resume.data} isWatermarkRequired={false} />
      </div>
    </div>
  );
};
