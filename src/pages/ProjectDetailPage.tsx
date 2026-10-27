import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Project, Comment, Conversation } from '../types';
import { DataService } from '../services/store';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/NotificationContext';
import { useChat } from '../context/ChatContext';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Textarea } from '../components/ui/Textarea';
import { formatDate, formatRelativeTime, getInitials } from '../lib/utils';
import {
  Heart,
  Bookmark,
  Share2,
  ExternalLink,
  Github,
  Calendar,
  MessageSquare,
  ArrowLeft,
  Mail,
  Edit,
  Trash2,
  Send,
  GraduationCap,
  Lock,
  ShieldCheck,
  Clock,
  Sparkles,
  CheckCircle,
} from 'lucide-react';

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { openChat, startChatWithUser } = useChat();

  const [project, setProject] = useState<Project | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isActionPending, setIsActionPending] = useState(false);

  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const [existingConversation, setExistingConversation] = useState<Conversation | null>(null);
  const [hireModalOpen, setHireModalOpen] = useState(false);
  const [hireMessage, setHireMessage] = useState('');
  const [isSubmittingHire, setIsSubmittingHire] = useState(false);

  const loadProjectData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await DataService.getProjectById(id, user?.id);
      if (!data) {
        setProject(null);
        return;
      }
      setProject(data);
      setSelectedImage(data.cover_image_url);
      setIsLiked(Boolean(data.is_liked));
      setLikesCount(data.likes_count || 0);
      setIsBookmarked(Boolean(data.is_bookmarked));

      const cmts = await DataService.getProjectComments(id);
      setComments(cmts);

      if (user?.id && data.owner_id) {
        const conv = await DataService.getConversationBetween(user.id, data.owner_id, data.id);
        setExistingConversation(conv);
      }
    } catch (err) {
      console.error('Failed to load project details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjectData();
  }, [id, user?.id]);

  const handleToggleLike = async () => {
    if (!user) {
      showToast('Authentication required', 'Please sign in to like projects.', 'info');
      return;
    }
    if (!project || isActionPending) return;

    try {
      setIsActionPending(true);
      const newStatus = await DataService.toggleLikeProject(project.id, user.id);
      setIsLiked(newStatus);
      setLikesCount(prev => (newStatus ? prev + 1 : Math.max(0, prev - 1)));
      showToast(newStatus ? 'Project liked' : 'Like removed');
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    } finally {
      setIsActionPending(false);
    }
  };

  const handleToggleBookmark = async () => {
    if (!user) {
      showToast('Authentication required', 'Please sign in to save projects.', 'info');
      return;
    }
    if (!project || isActionPending) return;

    try {
      setIsActionPending(true);
      const newStatus = await DataService.toggleBookmarkProject(project.id, user.id);
      setIsBookmarked(newStatus);
      showToast(newStatus ? 'Saved to bookmarks' : 'Removed from bookmarks');
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    } finally {
      setIsActionPending(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: project?.title,
        text: project?.summary,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link copied', 'Project URL copied to clipboard');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast('Authentication required', 'Please sign in to post feedback.', 'info');
      return;
    }
    if (!commentText.trim() || !project) return;

    try {
      setIsSubmittingComment(true);
      const newCmt = await DataService.addProjectComment(project.id, user.id, commentText.trim());
      setComments([newCmt, ...comments]);
      setCommentText('');
      showToast('Comment posted', 'Your feedback was shared with the creator.');
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleOpenHireModal = () => {
    if (!user) {
      showToast('Login required', 'Please sign in to message and hire student builders.', 'info');
      navigate('/login');
      return;
    }
    if (project?.owner) {
      setHireMessage(`Hi ${project.owner.full_name}, I saw your work on "${project.title}" and would like to discuss hiring you for a freelance engineering contract.`);
    }
    setHireModalOpen(true);
  };

  const handleSendHireRequest = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user) {
      showToast('Login required', 'Please sign in to message and hire students.', 'info');
      navigate('/login');
      return;
    }
    if (!project || !hireMessage.trim()) return;

    try {
      setIsSubmittingHire(true);
      const conv = await startChatWithUser({
        recipientId: project.owner_id,
        projectId: project.id,
        projectTitle: project.title,
        initialMessage: hireMessage.trim(),
      });
      setExistingConversation(conv);
      setHireModalOpen(false);
      setHireMessage('');
      showToast(
        'Message Request Sent!',
        `${project.owner?.full_name || 'Creator'} received a notification to accept your conversation request.`,
        'success'
      );
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    } finally {
      setIsSubmittingHire(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!project || !user || user.id !== project.owner_id) return;
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await DataService.deleteProject(project.id, user.id);
        showToast('Project deleted', 'Your project has been removed.');
        navigate('/projects');
      } catch (err: any) {
        showToast('Error', err.message, 'error');
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 space-y-6 animate-pulse text-[#F3F4F6]">
        <div className="h-6 bg-[#18181D] rounded w-32" />
        <div className="h-96 bg-[#121215] rounded-xl border border-[#202026]" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4 text-[#F1F3FA]">
        <div className="w-10 h-10 rounded-lg bg-[#161B29] border border-[#222738] flex items-center justify-center mx-auto text-[#737D95]">
          <Lock className="w-5 h-5" />
        </div>
        <h2 className="text-lg font-semibold text-[#F1F3FA]">Project Not Found or Private</h2>
        <p className="text-xs text-[#A0A8BD]">
          This project may have been removed or is marked private.
        </p>
        <Link to="/projects">
          <Button variant="outline" size="sm">
            Back to Projects
          </Button>
        </Link>
      </div>
    );
  }

  const isOwner = user?.id === project.owner_id;
  const allImages = [project.cover_image_url, ...(project.screenshot_urls || [])].filter(Boolean);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-[#F1F3FA]">
      {/* Back button & Owner actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs text-[#A0A8BD] hover:text-[#F1F3FA] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to gallery
        </button>

        {isOwner && (
          <div className="flex items-center gap-2">
            <Link to={`/projects/${project.id}/edit`}>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <Edit className="w-3.5 h-3.5" />
                Edit Project
              </Button>
            </Link>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteProject}
              className="gap-1.5 text-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols): Title, Images, Overview, Comments */}
        <div className="lg:col-span-8 space-y-6">
          {/* Header Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-[#8E8E9A]">
              <span className="text-[#00A3E0] font-medium">{project.category}</span>
              <span aria-hidden="true">·</span>
              <span>Published {formatDate(project.created_at)}</span>
              {project.visibility === 'private' && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-[#FF2D95]">Private</span>
                </>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-[#F3F4F6] tracking-tight leading-snug">
              {project.title}
            </h1>

            <p className="text-xs sm:text-sm text-[#8E8E9A] leading-relaxed">
              {project.summary}
            </p>
          </div>

          {/* Screenshot Gallery */}
          <div className="space-y-3">
            <div className="rounded-xl overflow-hidden border border-[#202026] bg-[#0A0A0A] aspect-video relative">
              <img
                src={selectedImage}
                alt={project.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail list if multiple images */}
            {allImages.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`relative w-20 h-14 rounded-lg overflow-hidden border shrink-0 transition-colors cursor-pointer ${
                      selectedImage === img
                        ? 'border-[#FF2D95]'
                        : 'border-[#202026] opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Screenshot ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Interactive Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#121215] border border-[#202026] rounded-xl">
            <div className="flex items-center gap-2">
              <Button
                variant={isLiked ? 'primary' : 'outline'}
                size="sm"
                onClick={handleToggleLike}
                className="gap-1.5 text-xs font-mono tabular-nums"
              >
                <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-white' : ''}`} />
                <span>{likesCount} Likes</span>
              </Button>

              <Button
                variant={isBookmarked ? 'secondary' : 'outline'}
                size="sm"
                onClick={handleToggleBookmark}
                className="gap-1.5 text-xs hover:border-[#007BA7] hover:text-[#00A3E0]"
              >
                <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-[#00A3E0] text-[#00A3E0]' : ''}`} />
                <span>{isBookmarked ? 'Saved' : 'Save'}</span>
              </Button>

              <Button variant="ghost" size="sm" onClick={handleShare} className="gap-1.5 text-xs hover:text-[#00A3E0]">
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </Button>
            </div>

            <div className="flex items-center gap-2">
              {project.github_url && (
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#202026] hover:border-[#007BA7] text-xs font-medium text-[#F3F4F6] bg-[#18181D] hover:bg-[#121215] transition-colors"
                >
                  <Github className="w-3.5 h-3.5" />
                  Source Code
                </a>
              )}
              {project.live_demo_url && (
                <a
                  href={project.live_demo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium text-white bg-[#FF2D95] hover:bg-[#E61980] border border-[#FF4DA8] transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Live Demo
                </a>
              )}
            </div>
          </div>

          {/* Hire / Direct Message Creator Section (Right after Source Code) */}
          {project.owner && (
            <div className="bg-[#121215] border border-[#202026] rounded-xl p-5 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#202026] pb-4">
                <div className="flex items-center gap-3">
                  {project.owner.avatar_url ? (
                    <img
                      src={project.owner.avatar_url}
                      alt={project.owner.full_name}
                      className="w-11 h-11 rounded-lg object-cover ring-1 ring-[#202026]"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-lg bg-[#18181D] text-[#00A3E0] font-bold text-sm flex items-center justify-center border border-[#202026]">
                      {getInitials(project.owner.full_name)}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/students/${project.owner.id}`}
                        className="font-bold text-sm text-[#F3F4F6] hover:text-[#00A3E0] transition-colors"
                      >
                        {project.owner.full_name}
                      </Link>
                      <span className="text-[10px] font-mono text-[#00A3E0] px-1.5 py-0.5 rounded bg-[#00A3E0]/10 border border-[#00A3E0]/30 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        Verified Student
                      </span>
                    </div>
                    <p className="text-xs text-[#8E8E9A] mt-0.5">
                      {project.owner.college || 'University Builder'}
                      {project.owner.degree && ` · ${project.owner.degree}`}
                    </p>
                  </div>
                </div>

                <div>
                  {project.owner.available_for_work ? (
                    <span className="text-xs font-semibold text-[#00A3E0] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#00A3E0]" />
                      Available for Contract / Hire
                    </span>
                  ) : (
                    <span className="text-xs text-[#8E8E9A]">Not Taking Gigs</span>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1 max-w-lg">
                  <h3 className="text-xs font-bold text-[#F3F4F6] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#FF2D95]" />
                    Interested in hiring or discussing this project?
                  </h3>
                  <p className="text-xs text-[#8E8E9A] leading-relaxed">
                    Message {project.owner.full_name} directly after reviewing their source code. They will receive an instant notification to accept and talk with you.
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {isOwner ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openChat()}
                      className="gap-1.5 text-xs text-[#00A3E0] border-[#007BA7]/40"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      View Inquiries
                    </Button>
                  ) : existingConversation?.status === 'accepted' ? (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => openChat(existingConversation.id)}
                      className="gap-1.5 text-xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Open Active Chat
                    </Button>
                  ) : existingConversation?.status === 'pending' ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => openChat(existingConversation.id)}
                      className="gap-1.5 text-xs text-[#FBBF24] border-[#FBBF24]/30"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      Request Pending (View)
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleOpenHireModal}
                      className="gap-1.5 text-xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Message Creator to Hire / Talk
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Technical Overview */}
          <div className="bg-[#121215] border border-[#202026] rounded-xl p-6 space-y-4">
            <h2 className="text-base font-semibold text-[#F3F4F6] border-b border-[#202026] pb-3">
              Technical Overview & Architecture
            </h2>
            <div className="text-xs sm:text-sm text-[#A0A8BD] leading-relaxed whitespace-pre-line">
              {project.description}
            </div>

            <div className="pt-3 border-t border-[#1C2132]">
              <span className="text-xs text-[#737D95] block mb-2">Technologies used:</span>
              <div className="text-xs text-[#F1F3FA] font-mono">
                {project.technologies.join(' · ')}
              </div>
            </div>
          </div>

          {/* Feedback & Discussions */}
          <div className="bg-[#121215] border border-[#202026] rounded-xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#202026] pb-3">
              <h3 className="text-sm font-semibold text-[#F3F4F6]">
                Peer Feedback & Discussion ({comments.length})
              </h3>
              <span className="text-xs text-[#8E8E9A]">Constructive collegiate reviews</span>
            </div>

            {/* Post comment form */}
            <form onSubmit={handleAddComment} className="space-y-3">
              <Textarea
                placeholder={
                  user
                    ? 'Leave technical feedback, ask questions regarding architecture, or suggest an enhancement...'
                    : 'Please sign in to leave constructive peer feedback.'
                }
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                disabled={!user || isSubmittingComment}
                rows={3}
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  size="sm"
                  disabled={!user || !commentText.trim() || isSubmittingComment}
                  isLoading={isSubmittingComment}
                  className="gap-1.5 text-xs"
                >
                  <Send className="w-3 h-3" />
                  Post Feedback
                </Button>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-3 pt-2 divide-y divide-[#1C2132]">
              {comments.length === 0 ? (
                <div className="text-center py-6 text-xs text-[#737D95]">
                  No comments yet. Be the first to review this student build.
                </div>
              ) : (
                comments.map(c => (
                  <div key={c.id} className="pt-3 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        {c.author?.avatar_url ? (
                          <img
                            src={c.author.avatar_url}
                            alt={c.author.full_name}
                            className="w-5 h-5 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-[#1C2132] text-[#A5B4FC] font-semibold text-[10px] flex items-center justify-center">
                            {getInitials(c.author?.full_name)}
                          </div>
                        )}
                        <span className="font-medium text-[#F1F3FA]">
                          {c.author?.full_name || 'Student'}
                        </span>
                        {c.author?.college && (
                          <span className="text-[#737D95]">· {c.author.college}</span>
                        )}
                      </div>
                      <span className="text-[11px] text-[#737D95] font-mono tabular-nums">
                        {formatRelativeTime(c.created_at)}
                      </span>
                    </div>
                    <p className="text-xs text-[#A0A8BD] leading-relaxed pl-7">
                      {c.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar (4 cols): Creator Card, Specs */}
        <div className="lg:col-span-4 space-y-5">
          {/* Creator Profile Card */}
          {project.owner && (
            <div className="bg-[#121215] border border-[#202026] rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#202026] pb-3">
                <span className="text-xs text-[#8E8E9A]">Author</span>
                <span className="text-xs text-[#00A3E0]">
                  {project.owner.available_for_work ? 'Available for work' : 'Busy'}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {project.owner.avatar_url ? (
                  <img
                    src={project.owner.avatar_url}
                    alt={project.owner.full_name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-[#18181D] text-[#00A3E0] font-semibold text-sm flex items-center justify-center">
                    {getInitials(project.owner.full_name)}
                  </div>
                )}
                <div>
                  <Link to={`/students/${project.owner.id}`}>
                    <h3 className="font-semibold text-sm text-[#F1F3FA] hover:text-white transition-colors">
                      {project.owner.full_name}
                    </h3>
                  </Link>
                  {project.owner.college && (
                    <div className="flex items-center gap-1 text-xs text-[#737D95] mt-0.5">
                      <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                      <span>{project.owner.college}</span>
                    </div>
                  )}
                </div>
              </div>

              {project.owner.bio && (
                <p className="text-xs text-[#A0A8BD] leading-relaxed">
                  {project.owner.bio}
                </p>
              )}

              <div className="pt-2 space-y-2">
                {isOwner ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openChat()}
                    className="w-full gap-1.5 text-xs text-[#00A3E0] border-[#007BA7]/40"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    View Inquiries in Chat
                  </Button>
                ) : existingConversation?.status === 'accepted' ? (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => openChat(existingConversation.id)}
                    className="w-full gap-1.5 text-xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Open Active Chat
                  </Button>
                ) : existingConversation?.status === 'pending' ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => openChat(existingConversation.id)}
                    className="w-full gap-1.5 text-xs text-[#FBBF24] border-[#FBBF24]/30"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    Request Pending (View)
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleOpenHireModal}
                    className="w-full gap-1.5 text-xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Message & Hire Creator
                  </Button>
                )}

                <Link to={`/students/${project.owner.id}`} className="block">
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    View Full Profile
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Quick specs */}
          <div className="bg-[#121215] border border-[#202026] rounded-xl p-5 space-y-3">
            <h4 className="text-xs font-semibold text-[#F3F4F6]">
              Project Details
            </h4>
            <div className="space-y-2 text-xs text-[#8E8E9A] divide-y divide-[#202026]">
              <div className="flex justify-between pt-1">
                <span className="text-[#8E8E9A]">Category:</span>
                <span className="text-[#F3F4F6]">{project.category}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-[#737D95]">Visibility:</span>
                <span className="text-[#F1F3FA] capitalize">{project.visibility}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-[#737D95]">Likes:</span>
                <span className="text-[#F1F3FA] font-mono tabular-nums">{likesCount}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-[#737D95]">Created:</span>
                <span className="text-[#F1F3FA] font-mono tabular-nums">{formatDate(project.created_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hire & Direct Message Request Modal */}
      <Modal
        isOpen={hireModalOpen}
        onClose={() => setHireModalOpen(false)}
        title={`Message ${project.owner?.full_name || 'Creator'}`}
        description={`Send a direct project collaboration inquiry regarding "${project.title}". They will receive a notification to accept and talk with you.`}
        maxWidth="lg"
      >
        <form onSubmit={handleSendHireRequest} className="space-y-4">
          <div className="space-y-1.5">
            <span className="text-xs text-[#8E8E9A]">Suggested conversation starters:</span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setHireMessage(`Hi ${project.owner?.full_name || 'there'}, I love your work on "${project.title}" and would like to hire you for a paid freelance contract.`)}
                className="text-[11px] px-2.5 py-1 rounded-md bg-[#18181D] hover:bg-[#202026] border border-[#202026] text-[#00A3E0] transition-colors cursor-pointer text-left"
              >
                💼 Paid Freelance Contract
              </button>
              <button
                type="button"
                onClick={() => setHireMessage(`Hi ${project.owner?.full_name || 'there'}, are you currently open to part-time engineering roles or student internships?`)}
                className="text-[11px] px-2.5 py-1 rounded-md bg-[#18181D] hover:bg-[#202026] border border-[#202026] text-[#00A3E0] transition-colors cursor-pointer text-left"
              >
                🎓 Part-Time / Internship
              </button>
              <button
                type="button"
                onClick={() => setHireMessage(`Hi ${project.owner?.full_name || 'there'}, could you explain how you architected "${project.title}"? Would love to collaborate on a similar project.`)}
                className="text-[11px] px-2.5 py-1 rounded-md bg-[#18181D] hover:bg-[#202026] border border-[#202026] text-[#00A3E0] transition-colors cursor-pointer text-left"
              >
                💻 Architecture & Collaboration
              </button>
            </div>
          </div>

          <Textarea
            label="Your Inquiry & Project Pitch"
            placeholder="Describe your project, required deliverables, estimated budget, or questions..."
            value={hireMessage}
            onChange={e => setHireMessage(e.target.value)}
            rows={4}
            required
          />

          <div className="p-3 rounded-lg bg-[#18181D] border border-[#202026] text-[11px] text-[#8E8E9A] flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-[#00A3E0] shrink-0 mt-0.5" />
            <span>
              Once sent, <strong className="text-[#F3F4F6]">{project.owner?.full_name}</strong> will receive an instant notification. Once they accept, your SkillBridge Messenger will unlock for real-time discussion.
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#202026]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setHireModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={!hireMessage.trim() || isSubmittingHire}
              isLoading={isSubmittingHire}
              className="gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              Send Message Request
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
