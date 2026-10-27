import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Project, Job, JobApplication, NotificationItem } from '../types';
import { DataService } from '../services/store';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/NotificationContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Tabs } from '../components/ui/Card';
import { ProjectCard } from '../components/projects/ProjectCard';
import { JobCard } from '../components/jobs/JobCard';
import { formatCurrency, formatDate, formatRelativeTime, getInitials } from '../lib/utils';
import { CreateAccountModal } from '../components/auth/CreateAccountModal';
import {
  FolderGit2,
  Briefcase,
  FileCheck2,
  Bookmark,
  Bell,
  Plus,
  User,
  Edit,
  UserPlus,
  ShieldCheck,
  Mail,
  FileText,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, profile, isOwner } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('projects');
  const [myProjects, setMyProjects] = useState<Project[]>([]);
  const [myJobs, setMyJobs] = useState<Job[]>([]);
  const [myApplications, setMyApplications] = useState<JobApplication[]>([]);
  const [savedProjects, setSavedProjects] = useState<Project[]>([]);
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    async function loadDashboard() {
      try {
        setLoading(true);
        const [projects, jobs, apps, sProjects, sJobs, notifs] = await Promise.all([
          DataService.getProjects({ ownerId: user?.id, visibility: 'all', currentUserId: user?.id }),
          DataService.getJobs({ ownerId: user?.id, currentUserId: user?.id }),
          DataService.getApplicationsByStudent(user!.id),
          DataService.getSavedProjects(user!.id),
          DataService.getSavedJobs(user!.id),
          DataService.getNotifications(user!.id),
        ]);

        setMyProjects(projects);
        setMyJobs(jobs);
        setMyApplications(apps);
        setSavedProjects(sProjects);
        setSavedJobs(sJobs);
        setNotifications(notifs);
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [user]);

  // Profile completion calculation
  const profileCompletion = () => {
    if (!profile) return 0;
    let score = 20; // base signup
    if (profile.college) score += 20;
    if (profile.bio) score += 20;
    if (profile.skills && profile.skills.length > 0) score += 20;
    if (profile.github_url || profile.portfolio_url || profile.linkedin_url || profile.instagram_url) score += 20;
    return score;
  };

  const completionPct = profileCompletion();

  const tabs = [
    { id: 'projects', label: 'My Projects', count: myProjects.length, icon: <FolderGit2 className="w-4 h-4" /> },
    { id: 'jobs', label: 'My Job Posts', count: myJobs.length, icon: <Briefcase className="w-4 h-4" /> },
    { id: 'applications', label: 'My Applications', count: myApplications.length, icon: <FileCheck2 className="w-4 h-4" /> },
    { id: 'saved-projects', label: 'Saved Projects', count: savedProjects.length, icon: <Bookmark className="w-4 h-4" /> },
    { id: 'saved-jobs', label: 'Saved Jobs', count: savedJobs.length, icon: <Bookmark className="w-4 h-4" /> },
    { id: 'notifications', label: 'Activity & Notifications', count: notifications.filter(n => !n.read_at).length, icon: <Bell className="w-4 h-4" /> },
  ];

  const getStatusBadgeVariant = (status: JobApplication['status']) => {
    switch (status) {
      case 'Accepted':
        return 'success';
      case 'Shortlisted':
        return 'primary';
      case 'Reviewed':
        return 'violet';
      case 'Rejected':
        return 'slate';
      default:
        return 'warning';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-[#F1F3FA]">
      {/* Welcome Banner */}
      <div className="bg-[#121215] border border-[#202026] rounded-xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name}
                className="w-14 h-14 rounded-lg object-cover ring-1 ring-[#202026]"
              />
            ) : (
              <div className="w-14 h-14 rounded-lg bg-[#18181D] border border-[#202026] text-[#00A3E0] font-bold text-lg flex items-center justify-center">
                {getInitials(profile?.full_name || user?.name)}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-[#F3F4F6]">
                  Welcome back, {profile?.full_name || user?.name}
                </h1>
                <span className="text-xs font-semibold text-[#00A3E0]">Student Member</span>
              </div>
              <p className="text-xs text-[#8E8E9A] mt-1">
                {profile?.college ? `${profile.college} · ` : ''}Manage your published portfolio, applications, and gigs.
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/projects/new">
              <Button size="sm" variant="primary" className="gap-1.5">
                <Plus className="w-4 h-4" />
                Publish Project
              </Button>
            </Link>
            <Link to="/jobs/new">
              <Button size="sm" variant="outline" className="gap-1.5">
                <Briefcase className="w-4 h-4 text-[#8E8E9A]" />
                Post Job
              </Button>
            </Link>
            <Link to="/resume-builder">
              <Button size="sm" variant="outline" className="gap-1.5 border-[#00A3E0]/40 text-[#00A3E0] hover:bg-[#18181D]">
                <FileText className="w-4 h-4 text-[#00A3E0]" />
                Resume Builder
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="sm" variant="outline" className="gap-1.5 border-[#202026] text-[#8E8E9A] hover:text-[#00A3E0]">
                <Mail className="w-4 h-4 text-[#00A3E0]" />
                Contact Owner
              </Button>
            </Link>
            {isOwner && (
              <Link to="/admin">
                <Button size="sm" variant="outline" className="gap-1.5 border-[#202026] text-[#00A3E0] hover:bg-[#18181D]">
                  <ShieldCheck className="w-4 h-4 text-[#00A3E0]" />
                  Owner Console & Gmail
                </Button>
              </Link>
            )}
            <Link to={`/students/${user?.id}`}>
              <Button size="sm" variant="ghost" className="gap-1.5 text-[#8E8E9A] hover:text-[#F3F4F6]">
                <User className="w-4 h-4" />
                Public View
              </Button>
            </Link>
          </div>
        </div>

        {/* Profile Completion Bar */}
        <div className="pt-5 border-t border-[#202026] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-medium text-[#8E8E9A]">Profile Completion: <span className="tabular-nums font-semibold text-[#F3F4F6]">{completionPct}%</span></span>
            <div className="w-40 sm:w-56 h-1.5 bg-[#18181D] rounded-full overflow-hidden border border-[#202026]">
              <div
                className="h-full bg-[#FF2D95] rounded-full transition-all duration-500"
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>
          {completionPct < 100 && (
            <Link to={`/students/${user?.id}`} className="text-[#00A3E0] hover:underline font-medium">
              Complete your profile for 2x more discovery →
            </Link>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab Panels */}
      <div className="pt-2">
        {/* 1. MY PROJECTS TAB */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#F1F3FA]">
                Your Published & Draft Projects ({myProjects.length})
              </h2>
              <Link to="/projects/new">
                <Button variant="primary" size="sm" className="gap-1.5 text-xs">
                  <Plus className="w-3.5 h-3.5" />
                  Add Project
                </Button>
              </Link>
            </div>

            {myProjects.length === 0 ? (
              <div className="bg-[#121215] border border-[#202026] rounded-xl p-12 text-center max-w-md mx-auto space-y-3">
                <FolderGit2 className="w-10 h-10 text-[#8E8E9A] mx-auto" />
                <h3 className="text-base font-bold text-[#F3F4F6]">No projects yet</h3>
                <p className="text-xs text-[#8E8E9A] leading-relaxed">
                  You haven't published any projects yet. Share your classroom projects, hackathon builds, or side apps.
                </p>
                <Link to="/projects/new">
                  <Button variant="primary" size="sm">
                    Publish Your First Project
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myProjects.map(proj => (
                  <div key={proj.id} className="bg-[#121215] border border-[#202026] hover:border-[#33333D] transition-colors rounded-xl overflow-hidden flex flex-col justify-between group">
                    <div className="relative h-40 bg-[#0A0A0A] overflow-hidden">
                      <img src={proj.cover_image_url} alt={proj.title} className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300" />
                      <div className="absolute top-2 left-2">
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${
                          proj.visibility === 'public'
                            ? 'bg-[#121215] text-[#00A3E0] border-[#202026]'
                            : 'bg-[#121215] text-[#8E8E9A] border-[#202026]'
                        }`}>
                          {proj.visibility}
                        </span>
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-sm text-[#F3F4F6] line-clamp-1 mb-1 group-hover:text-[#00A3E0] transition-colors">
                          {proj.title}
                        </h3>
                        <p className="text-xs text-[#8E8E9A] line-clamp-2 mb-3">
                          {proj.summary}
                        </p>
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {proj.technologies.slice(0, 3).map((t, idx) => (
                            <span key={idx} className="text-[10px] bg-[#18181D] text-[#8E8E9A] border border-[#202026] px-2 py-0.5 rounded-md font-medium">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-[#202026] flex items-center justify-between text-xs">
                        <Link to={`/projects/${proj.id}`} className="text-[#00A3E0] hover:underline font-medium">
                          View details
                        </Link>
                        <Link to={`/projects/${proj.id}/edit`}>
                          <Button variant="outline" size="sm" className="py-1 px-2.5 text-xs gap-1">
                            <Edit className="w-3 h-3" />
                            Edit
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 2. MY JOB POSTS TAB */}
        {activeTab === 'jobs' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#F1F3FA]">
                Jobs Posted by You ({myJobs.length})
              </h2>
              <Link to="/jobs/new">
                <Button variant="primary" size="sm" className="gap-1.5 text-xs">
                  <Plus className="w-3.5 h-3.5" />
                  Post a Job
                </Button>
              </Link>
            </div>

            {myJobs.length === 0 ? (
              <div className="bg-[#121215] border border-[#202026] rounded-xl p-12 text-center max-w-md mx-auto space-y-3">
                <Briefcase className="w-10 h-10 text-[#8E8E9A] mx-auto" />
                <h3 className="text-base font-bold text-[#F3F4F6]">No active job listings</h3>
                <p className="text-xs text-[#8E8E9A] leading-relaxed">
                  Need a collaborator or student engineer? Post a freelance listing with custom budget and milestones.
                </p>
                <Link to="/jobs/new">
                  <Button variant="primary" size="sm">
                    Post a Freelance Gig
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {myJobs.map(job => (
                  <div key={job.id} className="bg-[#121215] border border-[#202026] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1 text-xs">
                        <span className="font-semibold text-[#00A3E0]">{job.job_type}</span>
                        <span className="text-[#33333D]">·</span>
                        <span className={`font-medium ${job.status === 'open' ? 'text-[#00A3E0]' : 'text-[#8E8E9A]'}`}>
                          {job.status}
                        </span>
                        <span className="text-[#33333D]">·</span>
                        <span className="text-[#8E8E9A] tabular-nums">Deadline: {formatDate(job.deadline)}</span>
                      </div>
                      <Link to={`/jobs/${job.id}`}>
                        <h3 className="font-bold text-base text-[#F3F4F6] hover:text-[#00A3E0] transition-colors">
                          {job.title}
                        </h3>
                      </Link>
                      <p className="text-xs text-[#8E8E9A] mt-1 line-clamp-1 tabular-nums">
                        Budget: {formatCurrency(job.budget_min)} - {formatCurrency(job.budget_max)}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <Link to={`/jobs/${job.id}`}>
                        <Button variant="secondary" size="sm" className="text-xs hover:border-[#007BA7] hover:text-[#00A3E0]">
                          Review Applications ({job.applications_count || 0})
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. MY APPLICATIONS TAB */}
        {activeTab === 'applications' && (
          <div className="space-y-6">
            <h2 className="text-base font-bold text-[#F3F4F6]">
              Your Submitted Applications ({myApplications.length})
            </h2>

            {myApplications.length === 0 ? (
              <div className="bg-[#121215] border border-[#202026] rounded-xl p-12 text-center max-w-md mx-auto space-y-3">
                <FileCheck2 className="w-10 h-10 text-[#8E8E9A] mx-auto" />
                <h3 className="text-base font-bold text-[#F3F4F6]">No applications submitted</h3>
                <p className="text-xs text-[#8E8E9A] leading-relaxed">
                  Explore freelance gigs and submit proposals to start earning and building real experience.
                </p>
                <Link to="/jobs">
                  <Button variant="primary" size="sm">
                    Browse Open Jobs
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {myApplications.map(app => (
                  <div key={app.id} className="bg-[#121215] border border-[#202026] rounded-xl p-5 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1 text-xs">
                          <span className={`font-semibold ${
                            app.status === 'Accepted' ? 'text-[#00A3E0]' :
                            app.status === 'Shortlisted' ? 'text-[#FF2D95]' :
                            app.status === 'Reviewed' ? 'text-[#00A3E0]' :
                            app.status === 'Rejected' ? 'text-[#8E8E9A]' :
                            'text-[#FBBF24]'
                          }`}>
                            {app.status}
                          </span>
                          <span className="text-[#33333D]">·</span>
                          <span className="text-[#8E8E9A] tabular-nums">
                            Applied {formatRelativeTime(app.created_at)}
                          </span>
                        </div>
                        {app.job && (
                          <Link to={`/jobs/${app.job_id}`} className="font-bold text-base text-[#F3F4F6] hover:text-[#00A3E0] transition-colors">
                            {app.job.title}
                          </Link>
                        )}
                        <p className="text-xs text-[#8E8E9A] mt-0.5">
                          Proposed Budget: <strong className="text-[#F3F4F6] tabular-nums">{formatCurrency(app.proposed_budget)}</strong>
                        </p>
                      </div>

                      <Link to={`/jobs/${app.job_id}`}>
                        <Button variant="outline" size="sm" className="text-xs">
                          View Job Details
                        </Button>
                      </Link>
                    </div>

                    <div className="p-3 bg-[#18181D] rounded-lg text-xs text-[#8E8E9A] border border-[#202026] leading-relaxed">
                      <p className="font-semibold text-[#F3F4F6] mb-0.5">Your Proposal:</p>
                      {app.proposal}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 4. SAVED PROJECTS TAB */}
        {activeTab === 'saved-projects' && (
          <div className="space-y-6">
            <h2 className="text-base font-bold text-[#F1F3FA]">
              Saved Projects ({savedProjects.length})
            </h2>

            {savedProjects.length === 0 ? (
              <div className="bg-[#121215] border border-[#202026] rounded-xl p-12 text-center max-w-md mx-auto space-y-3">
                <Bookmark className="w-10 h-10 text-[#8E8E9A] mx-auto" />
                <h3 className="text-base font-bold text-[#F3F4F6]">No saved projects</h3>
                <p className="text-xs text-[#8E8E9A] leading-relaxed">
                  Bookmark inspiring peer work from the Explore gallery to review anytime.
                </p>
                <Link to="/projects">
                  <Button variant="outline" size="sm">
                    Explore Projects
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedProjects.map(proj => (
                  <ProjectCard key={proj.id} project={proj} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* 5. SAVED JOBS TAB */}
        {activeTab === 'saved-jobs' && (
          <div className="space-y-6">
            <h2 className="text-base font-bold text-[#F3F4F6]">
              Saved Freelance Jobs ({savedJobs.length})
            </h2>

            {savedJobs.length === 0 ? (
              <div className="bg-[#121215] border border-[#202026] rounded-xl p-12 text-center max-w-md mx-auto space-y-3">
                <Bookmark className="w-10 h-10 text-[#8E8E9A] mx-auto" />
                <h3 className="text-base font-bold text-[#F3F4F6]">No saved jobs</h3>
                <p className="text-xs text-[#8E8E9A] leading-relaxed">
                  Save freelance listings to review requirements or apply later.
                </p>
                <Link to="/jobs">
                  <Button variant="outline" size="sm">
                    Browse Jobs
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedJobs.map(job => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* 6. NOTIFICATIONS TAB */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <h2 className="text-base font-bold text-[#F3F4F6]">
              Activity & Notifications ({notifications.length})
            </h2>

            {notifications.length === 0 ? (
              <div className="bg-[#121215] border border-[#202026] rounded-xl p-12 text-center max-w-md mx-auto space-y-3">
                <Bell className="w-10 h-10 text-[#8E8E9A] mx-auto" />
                <h3 className="text-base font-bold text-[#F3F4F6]">No notifications</h3>
                <p className="text-xs text-[#8E8E9A]">
                  When other students like your work, comment, or send a proposal, you'll see it here.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {notifications.map(n => (
                  <div
                    key={n.id}
                    className={`p-4 rounded-lg flex items-start gap-3.5 transition-colors border ${
                      !n.read_at
                        ? 'border-[#007BA7]/40 bg-[#121215]'
                        : 'border-[#202026] bg-[#18181D]'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#18181D] border border-[#202026] text-[#00A3E0] font-bold text-xs flex items-center justify-center shrink-0">
                      {getInitials(n.actor?.full_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[#F3F4F6] leading-relaxed font-medium">
                        {n.message}
                      </p>
                      <span className="text-[10px] text-[#737D95] mt-1 block tabular-nums">
                        {formatDate(n.created_at)} at {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {n.related_project_id && (
                      <Link to={`/projects/${n.related_project_id}`}>
                        <Button variant="ghost" size="sm" className="text-xs">
                          View Project
                        </Button>
                      </Link>
                    )}
                    {n.related_job_id && (
                      <Link to={`/jobs/${n.related_job_id}`}>
                        <Button variant="ghost" size="sm" className="text-xs">
                          View Job
                        </Button>
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal to create another account */}
      <CreateAccountModal
        isOpen={showCreateAccountModal}
        onClose={() => setShowCreateAccountModal(false)}
      />
    </div>
  );
};
