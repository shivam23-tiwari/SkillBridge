import React, { useState } from 'react';
import { AIService } from '../../services/aiService';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Sparkles, Check, RefreshCw, Wand2 } from 'lucide-react';

interface AISuggestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (objectiveText: string) => void;
  initialRole?: string;
  initialDegree?: string;
  initialCollege?: string;
  technicalSkills?: string[];
}

export const AISuggestModal: React.FC<AISuggestModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  initialRole = 'Software Engineer',
  initialDegree = 'B.S. in Computer Science',
  initialCollege = 'University',
  technicalSkills = [],
}) => {
  const [targetRole, setTargetRole] = useState(initialRole);
  const [degree, setDegree] = useState(initialDegree);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const results = await AIService.generateObjectiveSuggestions({
        role: targetRole,
        degree: degree,
        college: initialCollege,
        technicalSkills: technicalSkills,
      });
      setSuggestions(results);
      setSelectedIdx(0);
    } catch (err) {
      console.warn('AI suggestions error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (isOpen && suggestions.length === 0) {
      handleGenerate();
    }
  }, [isOpen]);

  const handleApply = () => {
    if (selectedIdx !== null && suggestions[selectedIdx]) {
      onSelect(suggestions[selectedIdx]);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AI Career Objective Generator"
      description="Generate crisp, recruiter-tailored 2-3 line summaries crafted for your exact skills and degree."
    >
      <div className="space-y-4">
        {/* Customize input row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-[#18181D] rounded-lg border border-[#202026]">
          <Input
            label="Target Position"
            value={targetRole}
            onChange={e => setTargetRole(e.target.value)}
            placeholder="e.g., Full Stack Engineer, ML Engineer"
          />
          <Input
            label="Degree / Major"
            value={degree}
            onChange={e => setDegree(e.target.value)}
            placeholder="e.g., B.Tech Computer Science"
          />
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold text-[#8E8E9A] uppercase tracking-wider">
            Generated Suggestions
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGenerate}
            disabled={isLoading}
            className="text-xs gap-1.5 text-[#00A3E0] hover:text-[#00A3E0]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Regenerate
          </Button>
        </div>

        {/* Suggestion list */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="py-8 space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-[#18181D] border border-[#202026] rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            suggestions.map((text, idx) => {
              const isSelected = selectedIdx === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedIdx(idx)}
                  className={`p-3.5 rounded-lg border cursor-pointer transition-all space-y-2 relative ${
                    isSelected
                      ? 'bg-[#18181D] border-[#FF2D95] ring-1 ring-[#FF2D95]/40'
                      : 'bg-[#121215] border-[#202026] hover:border-[#2D2D35]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#8E8E9A] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#FF2D95]" />
                      Option {idx + 1}
                    </span>
                    {isSelected && (
                      <span className="text-[11px] font-bold text-[#FF2D95] flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Selected
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#F3F4F6] leading-relaxed">
                    {text}
                  </p>
                </div>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#202026]">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={selectedIdx === null || isLoading}
            onClick={handleApply}
            className="gap-1.5 text-xs"
          >
            <Wand2 className="w-3.5 h-3.5" />
            Apply to Resume
          </Button>
        </div>
      </div>
    </Modal>
  );
};
