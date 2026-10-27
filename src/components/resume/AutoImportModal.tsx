import React, { useState, useEffect } from 'react';
import { Project, ResumeProject } from '../../types';
import { DataService } from '../../services/store';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { FolderGit2, Check, Sparkles, ExternalLink, Github } from 'lucide-react';

interface AutoImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (importedProjects: ResumeProject[]) => void;
}

export const AutoImportModal: React.FC<AutoImportModalProps> = ({ isOpen, onClose, onImport }) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      async function loadUserProjects() {
        setLoading(true);
        try {
          const list = await DataService.getProjects({
            ownerId: user?.id,
            visibility: 'all',
          });
          setProjects(list);
          // By default select all
          setSelectedIds(new Set(list.map(p => p.id)));
        } catch (err) {
          console.warn('Failed to load user projects for resume import:', err);
        } finally {
          setLoading(false);
        }
      }
      loadUserProjects();
    }
  }, [isOpen, user?.id]);

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleConfirmImport = () => {
    const selected = projects.filter(p => selectedIds.has(p.id));
    const converted: ResumeProject[] = selected.map(p => ({
      id: `imported-${p.id}`,
      title: p.title,
      description: p.summary || p.description?.slice(0, 200) || '',
      technologies: p.technologies || [],
      githubUrl: p.github_url,
      liveUrl: p.live_demo_url,
      importedFromSkillBridge: true,
    }));

    onImport(converted);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Import Projects from SkillBridge"
      description="Select which of your published SkillBridge engineering projects to pull directly into your resume."
    >
      <div className="space-y-4">
        {loading ? (
          <div className="py-8 text-center text-xs text-[#8E8E9A] animate-pulse">
            Loading your SkillBridge projects...
          </div>
        ) : projects.length === 0 ? (
          <div className="py-8 text-center space-y-3 bg-[#18181D] rounded-lg border border-[#202026] p-4">
            <FolderGit2 className="w-8 h-8 text-[#8E8E9A] mx-auto" />
            <p className="text-xs text-[#8E8E9A]">
              You don't have any published projects on SkillBridge yet.
            </p>
            <p className="text-xs text-[#00A3E0]">
              You can still manually type your projects in Step 5 of the resume builder!
            </p>
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
            {projects.map(p => {
              const isSelected = selectedIds.has(p.id);
              return (
                <div
                  key={p.id}
                  onClick={() => toggleSelect(p.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start gap-3 ${
                    isSelected
                      ? 'bg-[#18181D] border-[#00A3E0]/70'
                      : 'bg-[#121215] border-[#202026] opacity-75 hover:opacity-100'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border ${
                      isSelected
                        ? 'bg-[#00A3E0] border-[#00A3E0] text-black font-bold'
                        : 'border-[#2D2D35] bg-[#0A0A0A]'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>

                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-[#F3F4F6] truncate">{p.title}</p>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#202026] text-[#8E8E9A]">
                        {p.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#8E8E9A] line-clamp-2 leading-relaxed">
                      {p.summary || p.description}
                    </p>
                    {p.technologies && p.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {p.technologies.slice(0, 4).map((tech, i) => (
                          <span key={i} className="text-[10px] px-1.5 py-0.2 rounded bg-[#0A0A0A] border border-[#202026] text-[#9CA3AF]">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-[#202026]">
          <span className="text-xs text-[#8E8E9A]">
            {selectedIds.size} of {projects.length} selected
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={selectedIds.size === 0}
              onClick={handleConfirmImport}
              className="gap-1.5 text-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Import ({selectedIds.size}) Projects
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
