import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Project } from '../../types';
import { Card } from '../ui/Card';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/NotificationContext';
import { DataService } from '../../services/store';
import { getInitials } from '../../lib/utils';
import { Heart, Bookmark, MessageSquare } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  layout?: 'grid' | 'list';
  onUpdated?: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, layout = 'grid', onUpdated }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [isLiked, setIsLiked] = useState(Boolean(project.is_liked));
  const [likesCount, setLikesCount] = useState(project.likes_count || 0);
  const [isBookmarked, setIsBookmarked] = useState(Boolean(project.is_bookmarked));
  const [isActionPending, setIsActionPending] = useState(false);

  const handleToggleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      showToast('Authentication required', 'Please log in to like projects.', 'info');
      return;
    }
    if (isActionPending) return;

    try {
      setIsActionPending(true);
      const newStatus = await DataService.toggleLikeProject(project.id, user.id);
      setIsLiked(newStatus);
      setLikesCount(prev => (newStatus ? prev + 1 : Math.max(0, prev - 1)));
      showToast(newStatus ? 'Project liked' : 'Like removed');
      onUpdated?.();
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    } finally {
      setIsActionPending(false);
    }
  };

  const handleToggleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      showToast('Authentication required', 'Please log in to save projects.', 'info');
      return;
    }
    if (isActionPending) return;

    try {
      setIsActionPending(true);
      const newStatus = await DataService.toggleBookmarkProject(project.id, user.id);
      setIsBookmarked(newStatus);
      showToast(newStatus ? 'Saved to bookmarks' : 'Removed from bookmarks');
      onUpdated?.();
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    } finally {
      setIsActionPending(false);
    }
  };

  if (layout === 'list') {
    return (
      <div className="bg-[#121215] border border-[#202026] hover:border-[#33333D] rounded-xl overflow-hidden group transition-colors">
        <div className="flex flex-col md:flex-row items-stretch">
          <Link to={`/projects/${project.id}`} className="md:w-72 h-48 md:h-auto shrink-0 relative overflow-hidden bg-[#0A0A0A] block">
            <img
              src={project.cover_image_url}
              alt={project.title}
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-200"
              loading="lazy"
            />
          </Link>

          <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-3 mb-1.5">
                <div>
                  <div className="flex items-center gap-2 text-xs text-[#8E8E9A] mb-1">
                    <span className="text-[#00A3E0] font-medium">{project.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{project.technologies.slice(0, 3).join(', ')}</span>
                  </div>
                  <Link to={`/projects/${project.id}`}>
                    <h3 className="font-semibold text-base text-[#F3F4F6] group-hover:text-white transition-colors line-clamp-1">
                      {project.title}
                    </h3>
                  </Link>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={handleToggleLike}
                    disabled={isActionPending}
                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                      isLiked
                        ? 'bg-[#FF2D95]/15 border-[#FF2D95]/40 text-[#FF2D95]'
                        : 'border-[#26262F] text-[#8E8E9A] hover:text-[#FF2D95] hover:bg-[#18181D]'
                    }`}
                    title={isLiked ? 'Unlike' : 'Like'}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-[#FF2D95]' : ''}`} />
                  </button>
                  <button
                    onClick={handleToggleBookmark}
                    disabled={isActionPending}
                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                      isBookmarked
                        ? 'bg-[#007BA7]/15 border-[#007BA7]/40 text-[#00A3E0]'
                        : 'border-[#26262F] text-[#8E8E9A] hover:text-[#00A3E0] hover:bg-[#18181D]'
                    }`}
                    title={isBookmarked ? 'Saved' : 'Bookmark'}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-[#00A3E0]' : ''}`} />
                  </button>
                </div>
              </div>

              <p className="text-xs text-[#8E8E9A] line-clamp-2 mb-3 leading-relaxed">
                {project.summary}
              </p>
            </div>

            <div className="pt-3 border-t border-[#202026] flex items-center justify-between">
              {project.owner ? (
                <Link
                  to={`/students/${project.owner.id}`}
                  className="flex items-center gap-2 group/author hover:opacity-90"
                >
                  {project.owner.avatar_url ? (
                    <img
                      src={project.owner.avatar_url}
                      alt={project.owner.full_name}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-[#18181D] text-[#00A3E0] font-semibold text-[10px] flex items-center justify-center">
                      {getInitials(project.owner.full_name)}
                    </div>
                  )}
                  <span className="text-xs text-[#F3F4F6] group-hover/author:text-white transition-colors">
                    {project.owner.full_name}
                  </span>
                  {project.owner.college && (
                    <span className="text-[11px] text-[#8E8E9A] hidden sm:inline">
                      · {project.owner.college}
                    </span>
                  )}
                </Link>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-3 text-xs text-[#8E8E9A] font-mono tabular-nums">
                <span className="flex items-center gap-1">
                  <Heart className={`w-3 h-3 ${isLiked ? 'text-[#FF2D95] fill-[#FF2D95]' : 'text-[#8E8E9A]'}`} />
                  {likesCount}
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3 text-[#8E8E9A]" />
                  {project.comments_count || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid layout (default)
  return (
    <div className="bg-[#121215] border border-[#202026] hover:border-[#33333D] rounded-xl overflow-hidden group flex flex-col h-full transition-colors">
      <Link to={`/projects/${project.id}`} className="relative h-44 w-full overflow-hidden bg-[#0A0A0A] block">
        <img
          src={project.cover_image_url}
          alt={project.title}
          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-200"
          loading="lazy"
        />
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
          <button
            onClick={handleToggleLike}
            disabled={isActionPending}
            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
              isLiked
                ? 'bg-[#FF2D95] text-white'
                : 'bg-[#0A0A0A]/85 text-[#8E8E9A] hover:text-[#FF2D95]'
            }`}
            title={isLiked ? 'Liked' : 'Like project'}
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-white' : ''}`} />
          </button>
          <button
            onClick={handleToggleBookmark}
            disabled={isActionPending}
            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
              isBookmarked
                ? 'bg-[#007BA7] text-white'
                : 'bg-[#0A0A0A]/85 text-[#8E8E9A] hover:text-[#00A3E0]'
            }`}
            title={isBookmarked ? 'Bookmarked' : 'Save project'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-white' : ''}`} />
          </button>
        </div>
      </Link>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-[#00A3E0] font-medium mb-1">
            <span>{project.category}</span>
          </div>

          <Link to={`/projects/${project.id}`}>
            <h3 className="font-semibold text-sm text-[#F3F4F6] group-hover:text-white transition-colors line-clamp-1 mb-1">
              {project.title}
            </h3>
          </Link>
          <p className="text-xs text-[#8E8E9A] line-clamp-2 mb-3 leading-relaxed">
            {project.summary}
          </p>

          <div className="text-[11px] text-[#8E8E9A] mb-4">
            {project.technologies.slice(0, 3).join(' · ')}
            {project.technologies.length > 3 && ` · +${project.technologies.length - 3}`}
          </div>
        </div>

        <div className="pt-3 border-t border-[#202026] flex items-center justify-between">
          {project.owner ? (
            <Link
              to={`/students/${project.owner.id}`}
              className="flex items-center gap-2 group/author hover:opacity-90 min-w-0"
            >
              {project.owner.avatar_url ? (
                <img
                  src={project.owner.avatar_url}
                  alt={project.owner.full_name}
                  className="w-5 h-5 rounded-full object-cover shrink-0"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-[#18181D] text-[#00A3E0] font-semibold text-[10px] flex items-center justify-center shrink-0">
                  {getInitials(project.owner.full_name)}
                </div>
              )}
              <span className="text-xs text-[#F3F4F6] truncate block group-hover/author:text-white transition-colors">
                {project.owner.full_name}
              </span>
            </Link>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2 text-xs text-[#8E8E9A] font-mono tabular-nums shrink-0">
            <span className="flex items-center gap-1">
              <Heart className={`w-3 h-3 ${isLiked ? 'text-[#FF2D95] fill-[#FF2D95]' : 'text-[#8E8E9A]'}`} />
              {likesCount}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3 text-[#8E8E9A]" />
              {project.comments_count || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
