import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Profile, Project, SavedResume } from '../types';
import { DataService } from '../services/store';
import { ResumeService } from '../services/resumeService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/NotificationContext';
import { useChat } from '../context/ChatContext';
import { ProjectCard } from '../components/projects/ProjectCard';
import { ResumePreview } from '../components/resume/ResumePreview';
import { ResumeAnalysisModal } from '../components/resume/ResumeAnalysisModal';
import { DownloadResumeModal } from '../components/resume/DownloadResumeModal';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { getInitials } from '../lib/utils';
import {
  GraduationCap,
  Github,
  Linkedin,
  Instagram,
  Globe,
  Mail,
  Edit,
  FolderGit2,
  CheckCircle,
  Briefcase,
  Sparkles,
  ArrowLeft,
  Send,
  Upload,
  Camera,
  MessageSquare,
  FileText,
  Download,
  Share2,
  Check,
  Eye,
  ZoomIn,
  ZoomOut,
  Target,
  Plus,
} from 'lucide-react';

export const StudentProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, profile: authProfile, updateCurrentProfile } = useAuth();
  const { showToast } = useToast();
  const { openChat, startChatWithUser } = useChat();

  const [student, setStudent] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [resumes, setResumes] = useState<SavedResume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'projects' | 'resume'>(
    searchParams.get('tab') === 'resume' ? 'resume' : 'projects'
  );
  const [analysisModalOpen, setAnalysisModalOpen] = useState(false);
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [previewScale, setPreviewScale] = useState(0.85);
  const [copiedLink, setCopiedLink] = useState(false);
  const [loading, setLoading] = useState(true);

  // Edit profile state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editCollege, setEditCollege] = useState('');
  const [editDegree, setEditDegree] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editSkills, setEditSkills] = useState('');
  const [editGithub, setEditGithub] = useState('');
  const [editLinkedin, setEditLinkedin] = useState('');
  const [editInstagram, setEditInstagram] = useState('');
  const [editPortfolio, setEditPortfolio] = useState('');
  const [editCollab, setEditCollab] = useState('');
  const [editAvailable, setEditAvailable] = useState(true);
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingDirectAvatar, setIsUploadingDirectAvatar] = useState(false);

  // Contact modal
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const isOwner = user?.id === id;

  const loadProfile = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [profileData, userProjects, userResumes] = await Promise.all([
        DataService.getProfileById(id),
        DataService.getProjects({
          ownerId: id,
          currentUserId: user?.id,
          visibility: isOwner ? 'all' : 'public',
        }),
        Promise.resolve(DataService.getSavedResumes(id)),
      ]);
      setStudent(profileData);
      setProjects(userProjects);
      setResumes(userResumes);
      if (userResumes.length > 0) {
        setSelectedResumeId(prev => prev || userResumes[0].id);
      }

      if (profileData) {
        setEditName(profileData.full_name);
        setEditCollege(profileData.college || '');
        setEditDegree(profileData.degree || '');
        setEditBio(profileData.bio || '');
        setEditSkills((profileData.skills || []).join(', '));
        setEditGithub(profileData.github_url || '');
        setEditLinkedin(profileData.linkedin_url || '');
        setEditInstagram(profileData.instagram_url || '');
        setEditPortfolio(profileData.portfolio_url || '');
        setEditCollab(profileData.collaboration_interests || '');
        setEditAvailable(profileData.available_for_work);
        setEditAvatarUrl(profileData.avatar_url || '');
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [id, user?.id]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwner || !user) return;

    try {
      setIsSavingProfile(true);
      const skillsArray = editSkills
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const updated = await updateCurrentProfile({
        full_name: editName.trim(),
        college: editCollege.trim(),
        degree: editDegree.trim(),
        bio: editBio.trim(),
        skills: skillsArray,
        github_url: editGithub.trim() || undefined,
        linkedin_url: editLinkedin.trim() || undefined,
        instagram_url: editInstagram.trim() || undefined,
        portfolio_url: editPortfolio.trim() || undefined,
        collaboration_interests: editCollab.trim() || undefined,
        available_for_work: editAvailable,
        avatar_url: editAvatarUrl.trim() || undefined,
      });

      setStudent(updated);
      setEditModalOpen(false);
      showToast('Profile updated', 'Your student profile has been saved.');
    } catch (err: any) {
      showToast('Error saving profile', err.message, 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await DataService.uploadImage(file);
      setEditAvatarUrl(url);
      showToast('Avatar uploaded', 'Preview ready.');
    } catch (err: any) {
      showToast('Upload error', err.message, 'error');
    }
  };

  const handleDirectAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    try {
      setIsUploadingDirectAvatar(true);
      const url = await DataService.uploadImage(file);
      setEditAvatarUrl(url);
      const updated = await updateCurrentProfile({ avatar_url: url });
      setStudent(updated);
      showToast('Photo updated!', 'Your profile photo has been refreshed.');
    } catch (err: any) {
      showToast('Upload error', err.message, 'error');
    } finally {
      setIsUploadingDirectAvatar(false);
    }
  };

  const handleSendMessage = async () => {
    if (!user) {
      showToast('Login required', 'Please sign in to message this student.', 'info');
      setContactModalOpen(false);
      navigate('/login');
      return;
    }
    if (!contactMessage.trim() || !student) return;

    try {
      setIsSendingMessage(true);
      await startChatWithUser({
        recipientId: student.id,
        initialMessage: contactMessage.trim(),
      });
      showToast(
        'Message Request Sent!',
        `${student.full_name} received a notification to accept your conversation request.`,
        'success'
      );
      setContactModalOpen(false);
      setContactMessage('');
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    } finally {
      setIsSendingMessage(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-6">
        <div className="h-44 bg-[#121215] border border-[#202026] rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-[#121215] border border-[#202026] rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="bg-[#121215] border border-[#202026] p-8 rounded-xl text-center space-y-3">
          <h2 className="text-xl font-bold text-[#F3F4F6]">Student Profile Not Found</h2>
          <p className="text-xs text-[#8E8E9A]">
            The requested student account could not be found.
          </p>
          <div className="pt-2">
            <Link to="/students">
              <Button variant="outline" size="sm">Back to Student Directory</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-[#F3F4F6]">
      {/* Top Banner & Profile Header */}
      <div className="bg-[#121215] border border-[#202026] rounded-xl p-6 sm:p-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-6">
          {/* Avatar and Main Info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-start gap-5">
            <div className="relative group shrink-0">
              {student.avatar_url ? (
                <img
                  src={student.avatar_url}
                  alt={student.full_name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover ring-1 ring-[#202026] bg-[#0A0A0A]"
                />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-[#18181D] border border-[#202026] text-[#00A3E0] font-extrabold text-2xl flex items-center justify-center">
                  {getInitials(student.full_name)}
                </div>
              )}

              {/* Direct photo upload trigger for profile owner */}
              {isOwner && (
                <label
                  title="Upload profile photo"
                  className="absolute -bottom-2 -right-2 p-2 bg-[#FF2D95] hover:bg-[#E61980] text-white rounded-lg shadow-lg cursor-pointer transition-transform hover:scale-110 flex items-center justify-center ring-2 ring-[#121215]"
                >
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleDirectAvatarUpload}
                    disabled={isUploadingDirectAvatar}
                  />
                </label>
              )}
            </div>

            {/* Shifted upper name and profile details */}
            <div className="space-y-1.5 pt-0.5 sm:pt-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F3F4F6] tracking-tight">
                  {student.full_name}
                </h1>
                {student.available_for_work ? (
                  <span className="text-xs font-medium text-[#00A3E0] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00A3E0]" />
                    Available for Work
                  </span>
                ) : (
                  <span className="text-xs text-[#8E8E9A]">Not Taking Gigs</span>
                )}
              </div>

              {student.college && (
                <div className="flex items-center gap-1.5 text-xs text-[#8E8E9A] font-medium">
                  <GraduationCap className="w-4 h-4 text-[#00A3E0] shrink-0" />
                  <span>{student.college}</span>
                  {student.degree && <span className="text-[#8E8E9A]">· {student.degree}</span>}
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5 self-stretch sm:self-auto pt-1">
            <Button
              variant="outline"
              size="md"
              onClick={() => {
                setActiveTab('resume');
                const anchor = document.getElementById('profile-tabs-anchor');
                if (anchor) anchor.scrollIntoView({ behavior: 'smooth' });
              }}
              className="gap-2 text-xs border-[#00A3E0]/30 text-[#00A3E0] hover:text-white hover:bg-[#00A3E0]/15"
            >
              <FileText className="w-4 h-4 text-[#00A3E0]" />
              <span>Resume</span>
              {resumes.length > 0 && (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono font-bold px-1.5 py-0.2 rounded-full border border-emerald-500/30">
                  ATS Ready
                </span>
              )}
            </Button>

            {resumes.length > 0 && (
              <Button
                variant="primary"
                size="md"
                onClick={() => setAnalysisModalOpen(true)}
                className="gap-1.5 text-xs bg-gradient-to-r from-[#00A3E0] to-[#007BA7] hover:brightness-110 text-white font-semibold shadow-md"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Analyze Resume</span>
              </Button>
            )}

            {isOwner ? (
              <Button
                variant="outline"
                size="md"
                onClick={() => setEditModalOpen(true)}
                className="gap-2 text-xs flex-1 sm:flex-initial"
              >
                <Edit className="w-4 h-4" />
                Edit Profile
              </Button>
            ) : (
              <Button
                variant="primary"
                size="md"
                onClick={() => setContactModalOpen(true)}
                className="gap-2 text-xs flex-1 sm:flex-initial"
              >
                <Mail className="w-4 h-4" />
                Contact Student
              </Button>
            )}
          </div>
        </div>

        {/* Bio, Skills, and External Links */}
        <div className="pt-6 border-t border-[#202026] grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-5">
            <div>
              <h3 className="text-xs font-bold text-[#8E8E9A] uppercase tracking-wider mb-2">
                About
              </h3>
              <p className="text-sm text-[#8E8E9A] leading-relaxed">
                {student.bio || 'No bio provided yet.'}
              </p>
            </div>

            {student.collaboration_interests && (
              <div className="p-4 bg-[#18181D] rounded-lg border border-[#202026]">
                <h4 className="text-xs font-bold text-[#FF2D95] mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#FF2D95]" />
                  Collaboration Interests
                </h4>
                <p className="text-xs text-[#F3F4F6] leading-relaxed">
                  {student.collaboration_interests}
                </p>
              </div>
            )}

            <div>
              <h3 className="text-xs font-bold text-[#8E8E9A] uppercase tracking-wider mb-2">
                Technical Skills
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {student.skills.map((skill, i) => (
                  <span
                    key={i}
                    className="text-xs px-2.5 py-1 rounded-md bg-[#18181D] text-[#8E8E9A] border border-[#202026] font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <h3 className="text-xs font-bold text-[#8E8E9A] uppercase tracking-wider mb-2">
              Verified Profiles & Links
            </h3>
            <div className="space-y-2">
              {student.github_url && (
                <a
                  href={student.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 p-2.5 rounded-lg border border-[#202026] bg-[#18181D] hover:bg-[#121215] text-xs font-medium text-[#8E8E9A] hover:text-[#F3F4F6] transition-colors"
                >
                  <Github className="w-4 h-4 text-[#F3F4F6]" />
                  GitHub Repository
                </a>
              )}
              {student.linkedin_url && (
                <a
                  href={student.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 p-2.5 rounded-lg border border-[#202026] bg-[#18181D] hover:bg-[#121215] text-xs font-medium text-[#8E8E9A] hover:text-[#00A3E0] transition-colors"
                >
                  <Linkedin className="w-4 h-4 text-[#00A3E0]" />
                  LinkedIn Profile
                </a>
              )}
              {student.instagram_url && (
                <a
                  href={student.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 p-2.5 rounded-lg border border-[#202026] bg-[#18181D] hover:bg-[#121215] text-xs font-medium text-[#8E8E9A] hover:text-[#FF2D95] transition-colors"
                >
                  <Instagram className="w-4 h-4 text-[#FF2D95]" />
                  Instagram Profile
                </a>
              )}
              {student.portfolio_url && (
                <a
                  href={student.portfolio_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 p-2.5 rounded-lg border border-[#202026] bg-[#18181D] hover:bg-[#121215] text-xs font-medium text-[#8E8E9A] hover:text-[#00A3E0] transition-colors"
                >
                  <Globe className="w-4 h-4 text-[#00A3E0]" />
                  Personal Website
                </a>
              )}
              {!student.github_url && !student.linkedin_url && !student.instagram_url && !student.portfolio_url && (
                <p className="text-xs text-[#8E8E9A]">No public links listed yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation: Projects vs Resume */}
      <div id="profile-tabs-anchor" className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#202026] pb-3 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('projects')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'projects'
                  ? 'bg-[#18181D] text-[#00A3E0] border border-[#262633] shadow-md'
                  : 'text-[#8E8E9A] hover:text-white hover:bg-[#141418]'
              }`}
            >
              <FolderGit2 className="w-4 h-4" />
              <span>Published Projects ({projects.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('resume')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'resume'
                  ? 'bg-[#18181D] text-[#00A3E0] border border-[#262633] shadow-md'
                  : 'text-[#8E8E9A] hover:text-white hover:bg-[#141418]'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Resume</span>
              {resumes.length > 0 ? (
                <span className="text-[10px] bg-[#00A3E0]/15 text-[#00A3E0] border border-[#00A3E0]/30 px-2 py-0.5 rounded-full font-mono font-semibold">
                  {resumes.length} Available
                </span>
              ) : (
                <span className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full font-mono">
                  {isOwner ? 'Draft' : 'None'}
                </span>
              )}
            </button>
          </div>

          {activeTab === 'projects' && isOwner && (
            <Link to="/projects/new">
              <Button variant="primary" size="sm" className="gap-1.5 text-xs">
                + Add Project
              </Button>
            </Link>
          )}

          {activeTab === 'resume' && isOwner && (
            <Link to="/resume-builder">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs border-[#202026] text-white hover:border-[#00A3E0]">
                <Plus className="w-3.5 h-3.5 text-[#00A3E0]" />
                <span>Resume Builder</span>
              </Button>
            </Link>
          )}
        </div>

        {/* Tab 1: Published Projects */}
        {activeTab === 'projects' && (
          <div>
            {projects.length === 0 ? (
              <div className="bg-[#121215] border border-[#202026] rounded-xl p-12 text-center max-w-md mx-auto space-y-3">
                <FolderGit2 className="w-10 h-10 text-[#8E8E9A] mx-auto" />
                <h3 className="text-base font-bold text-[#F3F4F6]">No projects published yet</h3>
                <p className="text-xs text-[#8E8E9A]">
                  {isOwner
                    ? 'Publish your first project to showcase your technical capabilities to the community.'
                    : 'This student has not yet published any public projects.'}
                </p>
                {isOwner && (
                  <Link to="/projects/new">
                    <Button variant="primary" size="sm">
                      Publish Your First Project
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map(project => (
                  <ProjectCard key={project.id} project={project} onUpdated={loadProfile} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Resume & ATS Analysis */}
        {activeTab === 'resume' && (
          <div className="space-y-6">
            {resumes.length > 0 ? (
              (() => {
                const activeResume =
                  resumes.find(r => r.id === selectedResumeId) || resumes[0];
                const audit = ResumeService.analyzeResumeDetailed(activeResume.data);

                return (
                  <div className="space-y-6">
                    {/* Resume Header & Actions Bar */}
                    <div className="bg-[#121215] border border-[#202026] rounded-xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-bold text-white flex items-center gap-2">
                            <FileText className="w-4 h-4 text-[#00A3E0]" />
                            <span>{activeResume.title || `${student.full_name}'s Resume`}</span>
                          </h3>
                          {activeResume.isPublic ? (
                            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded-full font-mono flex items-center gap-1">
                              <Check className="w-3 h-3" /> Public on Profile
                            </span>
                          ) : (
                            <span className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full font-mono">
                              Private
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#8E8E9A]">
                          Template: <span className="text-[#AEAEB8] font-medium capitalize">{activeResume.template.replace('-', ' ')}</span> · Format: Fixed A4 Vector Print
                        </p>

                        {/* Resume Switcher if user has multiple resumes */}
                        {resumes.length > 1 && (
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            <span className="text-[11px] text-[#8E8E9A] mr-1">Switch:</span>
                            {resumes.map(r => (
                              <button
                                key={r.id}
                                onClick={() => setSelectedResumeId(r.id)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                                  activeResume.id === r.id
                                    ? 'bg-[#00A3E0]/20 text-[#00A3E0] border border-[#00A3E0]/40'
                                    : 'bg-[#18181D] text-[#8E8E9A] border border-[#202026] hover:text-white'
                                }`}
                              >
                                {r.title}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Actions: Analyze, Download, Share, Edit */}
                      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                        {/* High-priority Analyze Resume CTA */}
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => setAnalysisModalOpen(true)}
                          className="gap-1.5 text-xs bg-gradient-to-r from-[#00A3E0] to-[#007BA7] hover:brightness-110 text-white font-bold shadow-lg"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Analyze Resume</span>
                        </Button>

                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            showToast(
                              'Print / Save as PDF',
                              'Choose Save as PDF, Margins: None, turn on Background graphics, turn off Headers and footers.'
                            );
                            ResumeService.exportToPdf(activeResume.data.personal?.fullName || student.full_name, activeResume.data);
                          }}
                          className="gap-1 text-xs bg-[#00A3E0] hover:bg-[#008fca] text-black font-bold shadow-sm cursor-pointer"
                          title="Choose Save as PDF, Margins: None, turn on Background graphics, turn off Headers and footers."
                        >
                          <Download className="w-3.5 h-3.5 text-black" />
                          <span>Download PDF</span>
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDownloadModalOpen(true)}
                          className="gap-1 text-xs border-[#202026] text-gray-300 hover:text-white"
                          title="More PC download options (PDF, Print, Word, Text)"
                        >
                          <span>PC Options ▾</span>
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            ResumeService.exportToWord(activeResume.data, `${activeResume.title}.doc`);
                            showToast('Word export', 'Resume downloaded in .doc format.');
                          }}
                          className="gap-1 text-xs border-[#202026] text-[#8E8E9A] hover:text-white hover:bg-[#18181D]"
                        >
                          <span>Word (.docx)</span>
                        </Button>

                        {activeResume.slug && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const url = `${window.location.origin}/r/${activeResume.slug}`;
                              navigator.clipboard.writeText(url);
                              setCopiedLink(true);
                              setTimeout(() => setCopiedLink(false), 2000);
                              showToast('Link copied', 'Shareable resume URL copied to clipboard.');
                            }}
                            className="gap-1 text-xs border-[#202026] text-[#8E8E9A] hover:text-white hover:bg-[#18181D]"
                          >
                            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-[#00A3E0]" />}
                            <span>{copiedLink ? 'Copied' : 'Share Link'}</span>
                          </Button>
                        )}

                        {isOwner && (
                          <Link to={`/resume-builder?id=${activeResume.id}`}>
                            <Button
                              variant="secondary"
                              size="sm"
                              className="gap-1 text-xs"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>Edit in Builder</span>
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>

                    {/* ATS Intelligence & Recruiter Card */}
                    <div className="bg-[#141418] border border-[#202026] rounded-xl p-5 space-y-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-[#1C1C24] border border-[#2B2B38] flex flex-col items-center justify-center font-black">
                            <span className="text-xs text-[#8E8E9A] font-medium leading-none">ATS</span>
                            <span className="text-base text-emerald-400 leading-tight">
                              {audit.overallScore}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-white">ATS & Recruiter Health Score</h4>
                              <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.2 rounded-full font-bold">
                                Grade {audit.grade}
                              </span>
                            </div>
                            <p className="text-xs text-[#8E8E9A]">
                              {audit.summaryText}
                            </p>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setAnalysisModalOpen(true)}
                          className="text-xs gap-1.5 border-[#00A3E0]/30 text-[#00A3E0] hover:bg-[#00A3E0]/15 shrink-0"
                        >
                          <Target className="w-3.5 h-3.5" />
                          <span>View Full Breakdown</span>
                        </Button>
                      </div>

                      {/* Fast Pillars Progress */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-[#1F1F26]">
                        {Object.values(audit.pillars).slice(0, 4).map((p, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-[#8E8E9A] truncate">{p.name}</span>
                              <span className="font-mono font-bold text-white">{p.score}%</span>
                            </div>
                            <div className="h-1 bg-[#1F1F28] rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  p.score >= 90 ? 'bg-emerald-400' : p.score >= 75 ? 'bg-[#00A3E0]' : 'bg-amber-400'
                                }`}
                                style={{ width: `${p.score}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* White A4 Paper Sheet Preview Canvas */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-[#8E8E9A] px-1">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Eye className="w-3.5 h-3.5 text-[#00A3E0]" />
                          Authentic A4 Paper View (210×297mm)
                        </span>

                        <div className="flex items-center gap-1.5 bg-[#121215] border border-[#202026] px-2 py-1 rounded-lg">
                          <button
                            onClick={() => setPreviewScale(p => Math.max(0.5, parseFloat((p - 0.05).toFixed(2))))}
                            className="p-0.5 text-gray-400 hover:text-white cursor-pointer"
                            title="Zoom out"
                          >
                            <ZoomOut className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-[11px] font-mono px-1 text-gray-300">
                            {Math.round(previewScale * 100)}%
                          </span>
                          <button
                            onClick={() => setPreviewScale(p => Math.min(1.2, parseFloat((p + 0.05).toFixed(2))))}
                            className="p-0.5 text-gray-400 hover:text-white cursor-pointer"
                            title="Zoom in"
                          >
                            <ZoomIn className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setPreviewScale(0.85)}
                            className="text-[10px] text-gray-400 hover:text-[#00A3E0] ml-1 pl-1 border-l border-gray-800 cursor-pointer"
                          >
                            Reset
                          </button>
                        </div>
                      </div>

                      {/* Canvas Container */}
                      <div className="bg-[#16161B] border border-[#202026] rounded-2xl p-4 sm:p-6 overflow-x-auto flex justify-center shadow-inner min-h-[500px]">
                        <div className="w-full max-w-[800px] flex justify-center">
                          <ResumePreview
                            data={activeResume.data}
                            scale={previewScale}
                            isWatermarkRequired={false}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="bg-[#121215] border border-[#202026] rounded-xl p-12 text-center max-w-lg mx-auto space-y-4">
                <div className="w-12 h-12 rounded-xl bg-[#1C1C24] border border-[#262633] text-[#00A3E0] flex items-center justify-center mx-auto">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">
                    {isOwner ? 'No Resume on Your Profile Yet' : 'No Public Resume Published'}
                  </h3>
                  <p className="text-xs text-[#8E8E9A] max-w-sm mx-auto leading-relaxed">
                    {isOwner
                      ? 'Create an ATS-optimized student resume with our drag-and-drop builder. Auto-import your verified projects and analyze keyword readiness in real time.'
                      : `${student.full_name} has not yet published an interactive resume on their profile. You can reach out directly to request their CV.`}
                  </p>
                </div>

                {isOwner ? (
                  <Link to="/resume-builder">
                    <Button variant="primary" size="md" className="gap-2 text-xs">
                      <Sparkles className="w-4 h-4" />
                      <span>Build Resume with SkillBridge</span>
                    </Button>
                  </Link>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setContactModalOpen(true)}
                    className="gap-2 text-xs"
                  >
                    <Mail className="w-4 h-4 text-[#00A3E0]" />
                    <span>Message Student</span>
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Your Student Profile"
        description="Update your credentials, portfolio links, and freelance availability."
        maxWidth="xl"
      >
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={editName}
              onChange={e => setEditName(e.target.value)}
              required
            />
            <Input
              label="College / University"
              value={editCollege}
              onChange={e => setEditCollege(e.target.value)}
              placeholder="e.g., Stanford University"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Degree / Major & Year"
              value={editDegree}
              onChange={e => setEditDegree(e.target.value)}
              placeholder="e.g., B.S. Computer Science (Junior)"
            />
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#8E8E9A]">
                Freelance Status
              </label>
              <div className="flex items-center gap-4 pt-2">
                <label className="inline-flex items-center gap-2 text-xs font-medium text-[#F3F4F6] cursor-pointer">
                  <input
                    type="radio"
                    name="availability"
                    checked={editAvailable}
                    onChange={() => setEditAvailable(true)}
                    className="accent-[#FF2D95]"
                  />
                  Available for Gigs
                </label>
                <label className="inline-flex items-center gap-2 text-xs font-medium text-[#8E8E9A] cursor-pointer">
                  <input
                    type="radio"
                    name="availability"
                    checked={!editAvailable}
                    onChange={() => setEditAvailable(false)}
                    className="accent-[#FF2D95]"
                  />
                  Not Taking Work
                </label>
              </div>
            </div>
          </div>

          <Textarea
            label="Bio & Engineering Focus"
            value={editBio}
            onChange={e => setEditBio(e.target.value)}
            rows={3}
            placeholder="Tell fellow students and recruiters what you build, your passions, and tools you love..."
          />

          <Input
            label="Skills (comma separated)"
            value={editSkills}
            onChange={e => setEditSkills(e.target.value)}
            placeholder="React, TypeScript, Python, Tailwind CSS, PostgreSQL"
          />

          <div className="space-y-2">
            <Input
              label="Avatar Image URL"
              value={editAvatarUrl}
              onChange={e => setEditAvatarUrl(e.target.value)}
              placeholder="https://..."
            />
            <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#202026] rounded-lg text-xs font-medium text-[#F3F4F6] bg-[#18181D] hover:bg-[#121215] transition-colors">
              <Upload className="w-4 h-4 text-[#00A3E0]" />
              Upload Profile Photo
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="GitHub URL"
              value={editGithub}
              onChange={e => setEditGithub(e.target.value)}
              placeholder="https://github.com/your-username"
            />
            <Input
              label="LinkedIn URL"
              value={editLinkedin}
              onChange={e => setEditLinkedin(e.target.value)}
              placeholder="https://linkedin.com/in/your-profile"
            />
            <Input
              label="Instagram URL"
              value={editInstagram}
              onChange={e => setEditInstagram(e.target.value)}
              placeholder="https://instagram.com/your-handle"
            />
            <Input
              label="Personal Website URL"
              value={editPortfolio}
              onChange={e => setEditPortfolio(e.target.value)}
              placeholder="https://yourwebsite.com"
            />
          </div>

          <Input
            label="Collaboration Interests"
            value={editCollab}
            onChange={e => setEditCollab(e.target.value)}
            placeholder="e.g., Hackathon projects, open source developer tools..."
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-[#202026]">
            <Button type="button" variant="outline" size="sm" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSavingProfile}
              isLoading={isSavingProfile}
            >
              Save Profile
            </Button>
          </div>
        </form>
      </Modal>

      {/* Contact Student Modal */}
      <Modal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        title={`Message ${student.full_name}`}
        description={`Send a direct project collaboration or freelance inquiry to ${student.full_name}.`}
      >
        <div className="space-y-4">
          <Textarea
            label="Your Inquiry Message"
            placeholder="Describe your project, timeline, and how you would like to work together..."
            value={contactMessage}
            onChange={e => setContactMessage(e.target.value)}
            rows={4}
            required
          />
          <div className="flex justify-end gap-2 pt-2 border-t border-[#202026]">
            <Button variant="outline" size="sm" onClick={() => setContactModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSendMessage}
              disabled={!contactMessage.trim() || isSendingMessage}
              isLoading={isSendingMessage}
              className="gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              Send Message
            </Button>
          </div>
        </div>
      </Modal>

      {/* Resume Analysis Intelligence Modal */}
      {(() => {
        const activeResume =
          resumes.find(r => r.id === selectedResumeId) || (resumes.length > 0 ? resumes[0] : null);
        if (!activeResume) return null;
        return (
          <>
            <ResumeAnalysisModal
              isOpen={analysisModalOpen}
              onClose={() => setAnalysisModalOpen(false)}
              resumeData={activeResume.data}
              studentName={student.full_name}
              isOwner={isOwner}
              resumeId={activeResume.id}
            />

            <DownloadResumeModal
              isOpen={downloadModalOpen}
              onClose={() => setDownloadModalOpen(false)}
              resumeData={activeResume.data}
            />
          </>
        );
      })()}
    </div>
  );
};
