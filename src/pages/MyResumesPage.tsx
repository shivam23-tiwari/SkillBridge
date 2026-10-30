import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePlan } from '../context/PlanContext';
import { useToast } from '../context/NotificationContext';
import { DataService } from '../services/store';
import { SavedResume } from '../types';
import { ResumeService } from '../services/resumeService';
import { DownloadResumeModal } from '../components/resume/DownloadResumeModal';
import { Button } from '../components/ui/Button';
import {
  FileText,
  Plus,
  Trash2,
  Edit3,
  Download,
  Share2,
  ExternalLink,
  Eye,
  Send,
  Sparkles,
  Lock,
  Copy,
  Check,
  Crown,
} from 'lucide-react';

export const MyResumesPage: React.FC = () => {
  const { user } = useAuth();
  const { plan, freeUsesRemaining, isWatermarkRequired, canExportDocx, consumeFreeUse, openUpgradeModal } = usePlan();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [resumes, setResumes] = useState<SavedResume[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedResumeForDownload, setSelectedResumeForDownload] = useState<SavedResume | null>(null);

  const loadResumes = () => {
    const list = DataService.getSavedResumes(user?.id);
    setResumes(list);
  };

  useEffect(() => {
    loadResumes();
  }, [user?.id]);

  const handleCreateNew = () => {
    navigate('/resume-builder');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this resume?')) {
      DataService.deleteResume(id);
      loadResumes();
      showToast('Resume deleted successfully', 'info');
    }
  };

  const handleDownloadPdf = (resume: SavedResume) => {
    setSelectedResumeForDownload(resume);
  };

  const handleExportWord = (resume: SavedResume) => {
    if (!canExportDocx) {
      openUpgradeModal('Word (.docx) export is available on Basic (₹99) and Premium plans.');
      return;
    }
    ResumeService.exportToWord(resume.data, `${resume.title}.doc`);
    showToast('Word document exported successfully!', 'success');
  };

  const handleTogglePublic = (resume: SavedResume) => {
    const updated = DataService.saveResume({
      ...resume,
      isPublic: !resume.isPublic,
    });
    loadResumes();
    showToast(
      updated.isPublic ? 'Resume is now public! Anyone with the link can view it.' : 'Resume is now private.',
      'info'
    );
  };

  const handleCopyLink = (slug: string, id: string) => {
    const publicUrl = `${window.location.origin}/r/${slug}`;
    navigator.clipboard.writeText(publicUrl);
    setCopiedId(id);
    showToast('Public resume link copied to clipboard!', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Top Banner & Stats */}
      <div className="bg-[#111] border border-gray-800 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-white">My Resumes</h1>
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {plan.toUpperCase()} Plan
            </span>
          </div>
          <p className="text-sm text-gray-400">
            Manage your resumes, track views, share public links, and download ATS-ready PDFs.
          </p>
          {plan === 'free' && (
            <div className="flex items-center gap-2 text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg w-fit">
              <span>Free PDF downloads remaining: <strong>{freeUsesRemaining} / 10</strong> (No Watermark)</span>
              <span className="text-gray-500">•</span>
              <Link to="/pricing" className="underline font-semibold hover:text-emerald-200">
                Upgrade for unlimited downloads
              </Link>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleCreateNew}
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Resume</span>
          </Button>
          <Link to="/pricing">
            <Button variant="outline" className="border-gray-700 text-gray-300 hover:text-white rounded-xl">
              <Sparkles className="w-4 h-4 text-blue-400 mr-2" />
              <span>Plans & Pricing</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Resumes Grid */}
      {resumes.length === 0 ? (
        <div className="bg-[#111] border border-gray-800 rounded-2xl p-12 text-center space-y-4 max-w-xl mx-auto">
          <div className="w-16 h-16 bg-gray-900 border border-gray-800 rounded-2xl flex items-center justify-center mx-auto text-gray-400">
            <FileText className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">No Resumes Created Yet</h2>
          <p className="text-sm text-gray-400">
            Build your professional resume in minutes with our 10-step guided builder, AI bullet suggestions, and live preview.
          </p>
          <Link to="/resume-builder" className="inline-block pt-2">
            <Button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-semibold">
              Start Building Now
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes.map(resume => (
            <div
              key={resume.id}
              className="bg-[#111] border border-gray-800 hover:border-gray-700 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-lg transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h2 className="text-base font-bold text-white truncate max-w-[200px]">
                      {resume.title}
                    </h2>
                    <div className="flex items-center gap-2 text-[11px] text-gray-500">
                      <span className="capitalize">{resume.template.replace('-', ' ')}</span>
                      <span>•</span>
                      <span>{new Date(resume.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {resume.isPublic ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Public
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 border border-gray-700">
                      Private
                    </span>
                  )}
                </div>

                {/* Summary preview */}
                <div className="bg-gray-950/80 p-3 rounded-xl border border-gray-900 text-xs text-gray-400 space-y-1">
                  <p className="text-gray-200 font-medium truncate">
                    {resume.data?.personal?.fullName || 'Full Name'}
                  </p>
                  <p className="truncate text-[11px]">
                    {resume.data?.education?.higherEducation?.[0]?.degree || 'Student'}
                  </p>
                  <p className="text-[10px] text-gray-500">
                    {resume.data?.skills?.technical?.slice(0, 4).join(', ') || 'Skills'}
                  </p>
                </div>

                {/* Analytics for Premium */}
                {plan === 'premium' && (
                  <div className="flex items-center justify-between text-xs text-gray-400 pt-1 border-t border-gray-900">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-blue-400" />
                      {resume.viewsCount || 0} views
                    </span>
                    <span className="flex items-center gap-1">
                      <Send className="w-3.5 h-3.5 text-emerald-400" />
                      {resume.sendsCount || 0} sends
                    </span>
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="space-y-2 pt-2 border-t border-gray-900">
                <div className="grid grid-cols-2 gap-2">
                  <Link to={`/resume-builder?id=${resume.id}`} className="w-full">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs border-gray-700 text-gray-300 hover:text-white"
                    >
                      <Edit3 className="w-3.5 h-3.5 mr-1.5" />
                      Edit Form
                    </Button>
                  </Link>

                  <Button
                    size="sm"
                    onClick={() => handleDownloadPdf(resume)}
                    className="w-full text-xs bg-blue-600 hover:bg-blue-500 text-white"
                  >
                    <Download className="w-3.5 h-3.5 mr-1.5" />
                    PDF
                  </Button>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1 text-xs">
                  <button
                    onClick={() => handleExportWord(resume)}
                    className="text-gray-400 hover:text-white flex items-center gap-1 text-[11px]"
                  >
                    <FileText className="w-3.5 h-3.5 text-indigo-400" />
                    Word {canExportDocx ? '(.doc)' : '🔒'}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTogglePublic(resume)}
                      className="text-gray-400 hover:text-white text-[11px] underline"
                    >
                      {resume.isPublic ? 'Make Private' : 'Make Public'}
                    </button>

                    {resume.isPublic && (
                      <button
                        onClick={() => handleCopyLink(resume.slug, resume.id)}
                        className="p-1.5 text-gray-400 hover:text-white rounded-md hover:bg-gray-800"
                        title="Copy Public Link"
                      >
                        {copiedId === resume.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Share2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(resume.id)}
                      className="p-1.5 text-red-400 hover:text-red-300 rounded-md hover:bg-red-500/10"
                      title="Delete Resume"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedResumeForDownload && (
        <DownloadResumeModal
          isOpen={Boolean(selectedResumeForDownload)}
          onClose={() => setSelectedResumeForDownload(null)}
          resumeData={selectedResumeForDownload.data}
        />
      )}
    </div>
  );
};
