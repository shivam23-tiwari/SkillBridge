import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { JobType } from '../types';
import { DataService } from '../services/store';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/NotificationContext';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ArrowLeft, Plus, X, Briefcase, Calendar, DollarSign } from 'lucide-react';

const JOB_TYPES: { value: JobType; label: string }[] = [
  { value: 'Fixed Price', label: 'Fixed Price (One-time lump sum)' },
  { value: 'Hourly', label: 'Hourly Rate' },
  { value: 'Milestone', label: 'Milestone-based' },
  { value: 'Contract', label: 'Semester / Multi-week Contract' },
];

export const JobFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState<string[]>(['React', 'Tailwind CSS']);
  const [skillInput, setSkillInput] = useState('');
  const [budgetMin, setBudgetMin] = useState<number>(300);
  const [budgetMax, setBudgetMax] = useState<number>(600);
  const [jobType, setJobType] = useState<JobType>('Fixed Price');
  const [deadline, setDeadline] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  );
  const [instructions, setInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) {
      showToast('Login required', 'Please sign in to post a freelance job.', 'info');
      navigate('/login');
    }
  }, [user]);

  const handleAddSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Job title is required.';
    if (!description.trim()) errs.description = 'Job description is required.';
    if (skills.length === 0) errs.skills = 'Add at least one required skill.';
    if (budgetMin < 0) errs.budgetMin = 'Budget cannot be negative.';
    if (budgetMax < budgetMin) errs.budgetMax = 'Max budget cannot be less than min budget.';
    if (!deadline) errs.deadline = 'Please specify a deadline date.';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !user) return;

    try {
      setIsSubmitting(true);
      const newJob = await DataService.createJob({
        owner_id: user.id,
        title: title.trim(),
        description: description.trim(),
        required_skills: skills,
        budget_min: Number(budgetMin),
        budget_max: Number(budgetMax),
        job_type: jobType,
        deadline,
        status: 'open',
        application_instructions: instructions.trim() || undefined,
      });

      showToast('Job listing published!', 'Student freelancers can now apply.');
      navigate(`/jobs/${newJob.id}`);
    } catch (err: any) {
      showToast('Error posting job', err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-[#F3F4F6]">
      <div className="border-b border-[#202026] pb-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8E8E9A] hover:text-[#00A3E0] mb-2 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <h1 className="text-2xl font-extrabold text-[#F3F4F6] tracking-tight">
          Post a Freelance Opportunity
        </h1>
        <p className="text-xs text-[#8E8E9A] mt-1">
          Hire university student developers, designers, and AI creators for your gig or startup MVP.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-[#121215] border border-[#202026] rounded-xl p-6 sm:p-8 space-y-5">
          <Input
            label="Listing Title"
            placeholder="e.g., Full-Stack Next.js Developer for Campus Thrift Store"
            value={title}
            onChange={e => setTitle(e.target.value)}
            error={errors.title}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Job Type"
              value={jobType}
              onChange={e => setJobType(e.target.value as JobType)}
              options={JOB_TYPES}
              required
            />

            <Input
              label="Application Deadline"
              type="date"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              error={errors.deadline}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Minimum Budget ($ USD)"
              type="number"
              value={budgetMin}
              onChange={e => setBudgetMin(Number(e.target.value))}
              error={errors.budgetMin}
              required
            />

            <Input
              label="Maximum Budget ($ USD)"
              type="number"
              value={budgetMax}
              onChange={e => setBudgetMax(Number(e.target.value))}
              error={errors.budgetMax}
              required
            />
          </div>

          <Textarea
            label="Detailed Scope of Work & Deliverables"
            placeholder="Describe what needs to be built, preferred frameworks, milestones, and how you plan to review student submissions..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            error={errors.description}
            rows={5}
            required
          />

          {/* Required Skills input */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#8E8E9A]">
              Required Technical Skills
            </label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="e.g., React, Python, Figma, Tailwind CSS..."
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                />
              </div>
              <Button type="button" variant="secondary" size="md" onClick={handleAddSkill} className="shrink-0 hover:border-[#007BA7] hover:text-[#00A3E0]">
                <Plus className="w-4 h-4" />
                Add Skill
              </Button>
            </div>
            {errors.skills && <p className="text-xs text-[#FF2D95] font-medium">{errors.skills}</p>}

            <div className="flex flex-wrap gap-1.5 pt-1">
              {skills.map(s => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#18181D] border border-[#202026] text-[#F3F4F6] rounded-md text-xs font-medium"
                >
                  {s}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(s)}
                    className="text-[#8E8E9A] hover:text-[#FF2D95] transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <Textarea
            label="Application Instructions (Optional)"
            placeholder="e.g., Please provide a link to your GitHub and 1 recent React project you deployed..."
            value={instructions}
            onChange={e => setInstructions(e.target.value)}
            rows={2}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#202026]">
          <Button type="button" variant="outline" size="md" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={isSubmitting}
            isLoading={isSubmitting}
            className="px-6"
          >
            Publish Job Listing
          </Button>
        </div>
      </form>
    </div>
  );
};
