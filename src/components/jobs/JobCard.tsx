import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Job } from '../../types';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/NotificationContext';
import { DataService } from '../../services/store';
import { formatCurrency, formatRelativeTime, formatDate } from '../../lib/utils';
import { Bookmark, ArrowRight } from 'lucide-react';

interface JobCardProps {
  job: Job;
  onUpdated?: () => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onUpdated }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [isSaved, setIsSaved] = useState(Boolean(job.is_saved));
  const [isActionPending, setIsActionPending] = useState(false);

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      showToast('Authentication required', 'Please log in to save jobs.', 'info');
      return;
    }
    if (isActionPending) return;

    try {
      setIsActionPending(true);
      const newStatus = await DataService.toggleSaveJob(job.id, user.id);
      setIsSaved(newStatus);
      showToast(newStatus ? 'Job saved' : 'Job removed from saved list');
      onUpdated?.();
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    } finally {
      setIsActionPending(false);
    }
  };

  return (
    <div className="bg-[#121215] border border-[#202026] hover:border-[#33333D] rounded-xl p-5 flex flex-col justify-between transition-colors">
      <div>
        {/* Top meta row */}
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2 text-xs text-[#8E8E9A]">
            <span className="text-[#00A3E0] font-medium">{job.job_type}</span>
            <span aria-hidden="true">·</span>
            <span>{formatRelativeTime(job.created_at)}</span>
          </div>

          <button
            onClick={handleToggleSave}
            disabled={isActionPending}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              isSaved
                ? 'bg-[#007BA7]/15 border-[#007BA7]/40 text-[#00A3E0]'
                : 'border-[#26262F] text-[#8E8E9A] hover:text-[#00A3E0] hover:bg-[#18181D]'
            }`}
            title={isSaved ? 'Saved' : 'Save job'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-[#00A3E0]' : ''}`} />
          </button>
        </div>

        {/* Title */}
        <Link to={`/jobs/${job.id}`}>
          <h3 className="text-sm sm:text-base font-semibold text-[#F3F4F6] hover:text-white transition-colors line-clamp-1 mb-1.5">
            {job.title}
          </h3>
        </Link>

        {/* Description snippet */}
        <p className="text-xs text-[#8E8E9A] line-clamp-2 mb-3 leading-relaxed">
          {job.description}
        </p>

        {/* Skills */}
        <div className="text-[11px] text-[#8E8E9A] mb-4">
          {job.required_skills.slice(0, 4).join(' · ')}
          {job.required_skills.length > 4 && ` · +${job.required_skills.length - 4}`}
        </div>
      </div>

      {/* Footer with budget, deadline, and view action */}
      <div className="pt-3 border-t border-[#202026] flex items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-[10px] text-[#8E8E9A] uppercase tracking-wider block">
              Budget
            </span>
            <span className="text-xs sm:text-sm font-semibold text-[#F3F4F6] font-mono tabular-nums">
              {job.budget_min === job.budget_max
                ? formatCurrency(job.budget_min)
                : `${formatCurrency(job.budget_min)} - ${formatCurrency(job.budget_max)}`}
              {job.job_type === 'Hourly' && <span className="text-xs font-normal text-[#8E8E9A]">/hr</span>}
            </span>
          </div>

          <div className="border-l border-[#202026] pl-3">
            <span className="text-[10px] text-[#8E8E9A] uppercase tracking-wider block">
              Due
            </span>
            <span className="text-xs text-[#8E8E9A] font-mono tabular-nums">
              {formatDate(job.deadline)}
            </span>
          </div>
        </div>

        <Link to={`/jobs/${job.id}`}>
          <Button variant="secondary" size="sm" className="gap-1 text-xs py-1.5 px-3 hover:border-[#FF2D95] hover:text-[#FF2D95]">
            {job.has_applied ? 'Applied' : 'Details'}
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
};
