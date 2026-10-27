import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Job, JobApplication, ApplicationStatus } from '../types';
import { DataService } from '../services/store';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/NotificationContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { formatCurrency, formatDate, formatRelativeTime, getInitials } from '../lib/utils';
import {
  Calendar,
  Clock,
  Bookmark,
  ArrowLeft,
  CheckCircle,
  Users,
  Send,
  AlertCircle,
  GraduationCap,
  ExternalLink,
} from 'lucide-react';

export const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);

  // Apply modal
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [proposal, setProposal] = useState('');
  const [experience, setExperience] = useState('');
  const [portfolioLink, setPortfolioLink] = useState('');
  const [proposedBudget, setProposedBudget] = useState<number>(0);
  const [isSubmittingApp, setIsSubmittingApp] = useState(false);

  // Save state
  const [isSaved, setIsSaved] = useState(false);

  const loadJobData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await DataService.getJobById(id, user?.id);
      if (!data) {
        setJob(null);
        return;
      }
      setJob(data);
      setIsSaved(Boolean(data.is_saved));
      setProposedBudget(data.budget_min);

      // If user is owner, load received applications
      if (user?.id && data.owner_id === user.id) {
        const apps = await DataService.getApplicationsForJob(id, user.id);
        setApplications(apps);
      }
    } catch (err) {
      console.error('Failed to load job details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobData();
  }, [id, user?.id]);

  const handleToggleSave = async () => {
    if (!user) {
      showToast('Authentication required', 'Please sign in to save jobs.', 'info');
      return;
    }
    if (!job) return;
    try {
      const newStatus = await DataService.toggleSaveJob(job.id, user.id);
      setIsSaved(newStatus);
      showToast(newStatus ? 'Job saved' : 'Job removed from saved list');
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast('Login required', 'Please sign in to apply for this job.', 'info');
      setApplyModalOpen(false);
      navigate('/login');
      return;
    }
    if (!proposal.trim() || !job) return;

    try {
      setIsSubmittingApp(true);
      const portLinks = portfolioLink.trim() ? [portfolioLink.trim()] : [];
      await DataService.applyToJob({
        jobId: job.id,
        applicantId: user.id,
        proposal: proposal.trim(),
        proposedBudget: proposedBudget || job.budget_min,
        relevantExperience: experience.trim() || undefined,
        portfolioLinks: portLinks,
      });
      showToast('Application submitted!', 'The job poster has received your proposal.');
      setApplyModalOpen(false);
      setProposal('');
      setExperience('');
      setPortfolioLink('');
      loadJobData();
    } catch (err: any) {
      showToast('Application failed', err.message, 'error');
    } finally {
      setIsSubmittingApp(false);
    }
  };

  const handleStatusChange = async (applicationId: string, newStatus: ApplicationStatus) => {
    if (!user || !job || user.id !== job.owner_id) return;
    try {
      await DataService.updateApplicationStatus(applicationId, newStatus, user.id);
      showToast('Status updated', `Candidate status is now "${newStatus}"`);
      const updated = await DataService.getApplicationsForJob(job.id, user.id);
      setApplications(updated);
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 space-y-6 text-[#F3F4F6]">
        <div className="h-8 bg-[#121215] border border-[#202026] rounded-lg w-48 animate-pulse" />
        <div className="h-64 bg-[#121215] border border-[#202026] rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4 text-[#F3F4F6]">
        <div className="bg-[#121215] border border-[#202026] p-8 rounded-xl space-y-3">
          <h2 className="text-xl font-bold text-[#F3F4F6]">Job Listing Not Found</h2>
          <p className="text-xs text-[#8E8E9A]">
            This freelance listing may have been closed or removed by the author.
          </p>
          <div className="pt-2">
            <Link to="/jobs">
              <Button variant="outline" size="sm">Back to Jobs</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === job.owner_id;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-[#F3F4F6]">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8E8E9A] hover:text-[#00A3E0] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to listings
        </button>

        <div className="flex items-center gap-2">
          <Button
            variant={isSaved ? 'secondary' : 'outline'}
            size="sm"
            onClick={handleToggleSave}
            className="gap-1.5 text-xs hover:border-[#007BA7] hover:text-[#00A3E0]"
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-[#00A3E0] text-[#00A3E0]' : ''}`} />
            {isSaved ? 'Saved' : 'Save Job'}
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols): Description, Requirements, Applications */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-[#121215] border border-[#202026] rounded-xl p-6 sm:p-8 space-y-6">
            {/* Header */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-semibold text-[#00A3E0]">{job.job_type}</span>
                <span className="text-[#33333D]">·</span>
                <span className={`font-medium ${job.status === 'open' ? 'text-[#00A3E0]' : 'text-[#8E8E9A]'}`}>
                  {job.status === 'open' ? 'Active Listing' : 'Closed'}
                </span>
                <span className="text-[#33333D]">·</span>
                <span className="text-[#8E8E9A] tabular-nums flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Posted {formatRelativeTime(job.created_at)}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F3F4F6] tracking-tight leading-tight">
                {job.title}
              </h1>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-lg bg-[#18181D] border border-[#202026] tabular-nums">
              <div>
                <span className="text-[10px] font-bold text-[#8E8E9A] uppercase tracking-wider block">
                  Budget
                </span>
                <span className="text-base font-extrabold text-[#F3F4F6]">
                  {job.budget_min === job.budget_max
                    ? formatCurrency(job.budget_min)
                    : `${formatCurrency(job.budget_min)} - ${formatCurrency(job.budget_max)}`}
                  {job.job_type === 'Hourly' && <span className="text-xs font-normal text-[#8E8E9A]">/hr</span>}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-[#8E8E9A] uppercase tracking-wider block">
                  Deadline
                </span>
                <span className="text-sm font-bold text-[#F3F4F6] flex items-center gap-1 mt-0.5">
                  <Calendar className="w-4 h-4 text-[#00A3E0]" />
                  {formatDate(job.deadline)}
                </span>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <span className="text-[10px] font-bold text-[#8E8E9A] uppercase tracking-wider block">
                  Applications
                </span>
                <span className="text-sm font-bold text-[#F3F4F6] flex items-center gap-1 mt-0.5">
                  <Users className="w-4 h-4 text-[#FF2D95]" />
                  {applications.length || job.applications_count || 0} Submitted
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-[#F3F4F6] uppercase tracking-wider border-b border-[#202026] pb-2">
                Project & Role Description
              </h2>
              <div className="text-sm text-[#8E8E9A] leading-relaxed whitespace-pre-line">
                {job.description}
              </div>
            </div>

            {/* Required Skills */}
            <div className="space-y-2.5 pt-2">
              <h3 className="text-xs font-bold text-[#8E8E9A] uppercase tracking-wider">
                Required Technical Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {job.required_skills.map((skill, i) => (
                  <span
                    key={i}
                    className="text-xs px-2.5 py-1 rounded-md bg-[#18181D] text-[#8E8E9A] border border-[#202026] font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Application Instructions */}
            {job.application_instructions && (
              <div className="p-4 rounded-lg bg-[#18181D] border border-[#FBBF24]/30 space-y-1">
                <h4 className="text-xs font-bold text-[#FBBF24] flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-[#FBBF24]" />
                  Special Instructions from Poster
                </h4>
                <p className="text-xs text-[#8E8E9A] leading-relaxed">
                  {job.application_instructions}
                </p>
              </div>
            )}
          </div>

          {/* Job Posters Review Panel (Owner View) */}
          {isOwner && (
            <div className="bg-[#121215] border border-[#202026] rounded-xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-[#202026] pb-4">
                <div>
                  <h3 className="text-base font-bold text-[#F3F4F6]">
                    Received Applications ({applications.length})
                  </h3>
                  <p className="text-xs text-[#8E8E9A]">
                    Review candidate proposals, verify student credentials, and manage statuses.
                  </p>
                </div>
                <span className="text-xs font-semibold text-[#00A3E0]">Poster Console</span>
              </div>

              {applications.length === 0 ? (
                <div className="text-center py-8 text-xs text-[#8E8E9A]">
                  No student applications received yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.map(app => (
                    <div
                      key={app.id}
                      className="p-5 rounded-lg border border-[#202026] bg-[#18181D] space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {app.applicant?.avatar_url ? (
                            <img
                              src={app.applicant.avatar_url}
                              alt={app.applicant.full_name}
                              className="w-10 h-10 rounded-lg object-cover ring-1 ring-[#202026]"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-[#18181D] border border-[#202026] text-[#00A3E0] font-bold flex items-center justify-center text-sm">
                              {getInitials(app.applicant?.full_name)}
                            </div>
                          )}
                          <div>
                            <Link to={`/students/${app.applicant_id}`} className="font-bold text-sm text-[#F3F4F6] hover:text-[#00A3E0] transition-colors">
                              {app.applicant?.full_name || 'Applicant'}
                            </Link>
                            <p className="text-xs text-[#8E8E9A]">
                              {app.applicant?.college} · Proposed Budget: <span className="font-bold text-[#F3F4F6] tabular-nums">{formatCurrency(app.proposed_budget)}</span>
                            </p>
                          </div>
                        </div>

                        {/* Status dropdown */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#8E8E9A] font-medium">Status:</span>
                          <select
                            value={app.status}
                            onChange={e => handleStatusChange(app.id, e.target.value as ApplicationStatus)}
                            className="text-xs font-medium rounded-md border border-[#26262F] bg-[#121215] px-3 py-1.5 text-[#F3F4F6] cursor-pointer focus:outline-hidden focus:border-[#FF2D95]"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Reviewed">Reviewed</option>
                            <option value="Shortlisted">Shortlisted</option>
                            <option value="Accepted">Accepted</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </div>
                      </div>

                      <div className="bg-[#121215] p-3.5 rounded-lg text-xs text-[#8E8E9A] leading-relaxed whitespace-pre-line border border-[#202026]">
                        <p className="font-semibold text-[#F3F4F6] mb-1">Proposal:</p>
                        {app.proposal}
                      </div>

                      {app.relevant_experience && (
                        <p className="text-xs text-[#8E8E9A]">
                          <strong className="text-[#F3F4F6]">Experience:</strong> {app.relevant_experience}
                        </p>
                      )}

                      {app.portfolio_links && app.portfolio_links.length > 0 && (
                        <div className="flex flex-wrap gap-2 text-xs">
                          {app.portfolio_links.map((link, idx) => (
                            <a
                              key={idx}
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#00A3E0] hover:underline flex items-center gap-1"
                            >
                              <ExternalLink className="w-3 h-3" />
                              {link}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Sidebar (4 cols): Poster Profile, Apply CTA */}
        <div className="lg:col-span-4 space-y-6">
          {/* Apply CTA Card */}
          <div className="bg-[#121215] border border-[#202026] rounded-xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-[#F3F4F6]">Ready to take on this gig?</h3>
            <p className="text-xs text-[#8E8E9A] leading-relaxed">
              Submit your proposal with your proposed budget, past student projects, and estimated turnaround.
            </p>

            {job.has_applied ? (
              <div className="p-3.5 rounded-lg bg-[#18181D] border border-[#34D399]/30 flex items-center gap-2.5 text-xs text-[#34D399] font-medium">
                <CheckCircle className="w-4 h-4 text-[#34D399] shrink-0" />
                <span>You have already applied for this job listing.</span>
              </div>
            ) : isOwner ? (
              <div className="p-3.5 rounded-lg bg-[#18181D] border border-[#202026] text-xs text-[#8E8E9A]">
                You created this job post. You can view all received applications below.
              </div>
            ) : (
              <Button
                variant="primary"
                size="lg"
                onClick={() => {
                  if (!user) {
                    showToast('Login required', 'Please sign in to apply for this job.', 'info');
                    navigate('/login');
                    return;
                  }
                  setApplyModalOpen(true);
                }}
                className="w-full gap-2 text-sm"
              >
                <Send className="w-4 h-4" />
                Apply for this Position
              </Button>
            )}
          </div>

          {/* Job Poster Card */}
          {job.owner && (
            <div className="bg-[#121215] border border-[#202026] rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#202026] pb-3">
                <span className="text-xs font-bold text-[#8E8E9A] uppercase tracking-wider">
                  Posted By
                </span>
                <span className="text-xs text-[#8E8E9A]">Client</span>
              </div>

              <div className="flex items-center gap-3.5">
                {job.owner.avatar_url ? (
                  <img
                    src={job.owner.avatar_url}
                    alt={job.owner.full_name}
                    className="w-12 h-12 rounded-lg object-cover ring-1 ring-[#202026]"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-[#18181D] border border-[#202026] text-[#00A3E0] font-bold text-base flex items-center justify-center">
                    {getInitials(job.owner.full_name)}
                  </div>
                )}
                <div>
                  <Link to={`/students/${job.owner.id}`} className="font-bold text-sm text-[#F3F4F6] hover:text-[#00A3E0] transition-colors">
                    {job.owner.full_name}
                  </Link>
                  {job.owner.college && (
                    <div className="flex items-center gap-1 text-xs text-[#8E8E9A] mt-0.5">
                      <GraduationCap className="w-3.5 h-3.5 text-[#00A3E0]" />
                      <span>{job.owner.college}</span>
                    </div>
                  )}
                </div>
              </div>

              {job.owner.bio && (
                <p className="text-xs text-[#8E8E9A] leading-relaxed">
                  {job.owner.bio}
                </p>
              )}

              <Link to={`/students/${job.owner.id}`} className="block pt-1">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  View Client Profile
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Application Submission Modal */}
      <Modal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        title="Submit Job Application"
        description={`Applying for "${job.title}"`}
        maxWidth="lg"
      >
        <form onSubmit={handleApply} className="space-y-4">
          <Input
            label="Your Proposed Budget ($ USD)"
            type="number"
            value={proposedBudget}
            onChange={e => setProposedBudget(Number(e.target.value))}
            helperText={`Budget guide: ${formatCurrency(job.budget_min)} - ${formatCurrency(job.budget_max)}`}
            required
          />

          <Textarea
            label="Proposal & Pitch"
            placeholder="Explain why you are the ideal student for this project, how you will solve their problem, and your delivery timeline..."
            value={proposal}
            onChange={e => setProposal(e.target.value)}
            rows={4}
            required
          />

          <Textarea
            label="Relevant Past Experience"
            placeholder="Mention relevant coursework, previous gigs, or hackathon awards..."
            value={experience}
            onChange={e => setExperience(e.target.value)}
            rows={2}
          />

          <Input
            label="Portfolio or GitHub Link"
            placeholder="https://github.com/my-profile or https://myportfolio.dev"
            value={portfolioLink}
            onChange={e => setPortfolioLink(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-white/[0.08]">
            <Button type="button" variant="outline" size="sm" onClick={() => setApplyModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmittingApp}
              isLoading={isSubmittingApp}
              className="gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              Submit Application
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
