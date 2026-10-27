import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Project, ProjectCategory } from '../types';
import { DataService } from '../services/store';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/NotificationContext';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import {
  Upload,
  Link as LinkIcon,
  Github,
  Globe,
  Plus,
  X,
  ArrowLeft,
  Image as ImageIcon,
  Check,
} from 'lucide-react';

const CATEGORIES: { value: ProjectCategory; label: string }[] = [
  { value: 'Web Development', label: 'Web Development' },
  { value: 'AI & Machine Learning', label: 'AI & Machine Learning' },
  { value: 'UI/UX Design', label: 'UI/UX Design' },
  { value: 'Mobile Apps', label: 'Mobile Apps' },
  { value: 'Data Science', label: 'Data Science' },
  { value: 'Game Development', label: 'Game Development' },
  { value: 'Cloud & DevOps', label: 'Cloud & DevOps' },
  { value: 'Cybersecurity', label: 'Cybersecurity' },
];

export const ProjectFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ProjectCategory>('Web Development');
  const [technologies, setTechnologies] = useState<string[]>(['React', 'TypeScript']);
  const [newTechInput, setNewTechInput] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [screenshotUrls, setScreenshotUrls] = useState<string[]>([]);
  const [newScreenshotInput, setNewScreenshotInput] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [liveDemoUrl, setLiveDemoUrl] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');

  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) {
      showToast('Login required', 'Please sign in to publish or edit projects.', 'info');
      navigate('/login');
      return;
    }

    if (isEditing && id) {
      async function loadExisting() {
        const p = await DataService.getProjectById(id!, user?.id);
        if (!p) {
          showToast('Not found', 'Project not found.', 'error');
          navigate('/projects');
          return;
        }
        if (p.owner_id !== user?.id) {
          showToast('Unauthorized', 'You can only edit your own projects.', 'error');
          navigate(`/projects/${id}`);
          return;
        }
        setTitle(p.title);
        setSummary(p.summary);
        setDescription(p.description);
        setCategory(p.category);
        setTechnologies(p.technologies || []);
        setCoverImageUrl(p.cover_image_url);
        setScreenshotUrls(p.screenshot_urls || []);
        setGithubUrl(p.github_url || '');
        setLiveDemoUrl(p.live_demo_url || '');
        setVisibility(p.visibility);
      }
      loadExisting();
    }
  }, [id, isEditing, user?.id]);

  const handleAddTech = () => {
    if (newTechInput.trim() && !technologies.includes(newTechInput.trim())) {
      setTechnologies([...technologies, newTechInput.trim()]);
      setNewTechInput('');
    }
  };

  const handleRemoveTech = (tech: string) => {
    setTechnologies(technologies.filter(t => t !== tech));
  };

  const handleAddScreenshotUrl = () => {
    if (newScreenshotInput.trim()) {
      setScreenshotUrls([...screenshotUrls, newScreenshotInput.trim()]);
      setNewScreenshotInput('');
    }
  };

  const handleRemoveScreenshot = (index: number) => {
    setScreenshotUrls(screenshotUrls.filter((_, i) => i !== index));
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isCover = true) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const url = await DataService.uploadImage(file);
      if (isCover) {
        setCoverImageUrl(url);
      } else {
        setScreenshotUrls(prev => [...prev, url]);
      }
      showToast('Image uploaded', 'Screenshot ready for publication.');
    } catch (err: any) {
      showToast('Upload error', err.message, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Project title is required.';
    if (!summary.trim()) errs.summary = 'A short summary is required.';
    if (!description.trim()) errs.description = 'A detailed technical description is required.';
    if (!coverImageUrl.trim()) errs.coverImageUrl = 'A cover image or screenshot is required.';
    if (technologies.length === 0) errs.technologies = 'Please add at least one technology.';

    const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    if (githubUrl && !urlRegex.test(githubUrl)) {
      errs.githubUrl = 'Please provide a valid URL (e.g., https://github.com/user/repo).';
    }
    if (liveDemoUrl && !urlRegex.test(liveDemoUrl)) {
      errs.liveDemoUrl = 'Please provide a valid URL (e.g., https://my-app.vercel.app).';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !user) return;

    try {
      setIsSubmitting(true);
      const payload = {
        title: title.trim(),
        summary: summary.trim(),
        description: description.trim(),
        category,
        technologies,
        cover_image_url: coverImageUrl.trim(),
        screenshot_urls: screenshotUrls,
        github_url: githubUrl.trim() || undefined,
        live_demo_url: liveDemoUrl.trim() || undefined,
        visibility,
        owner_id: user.id,
      };

      if (isEditing && id) {
        await DataService.updateProject(id, payload, user.id);
        showToast('Project updated', 'Your changes have been saved successfully.');
        navigate(`/projects/${id}`);
      } else {
        const created = await DataService.createProject(payload);
        showToast('Project published!', 'Your project is now live on SkillBridge.');
        navigate(`/projects/${created.id}`);
      }
    } catch (err: any) {
      showToast('Error saving project', err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-[#F3F4F6]">
      <div className="flex items-center justify-between border-b border-[#202026] pb-4">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8E8E9A] hover:text-[#00A3E0] mb-2 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <h1 className="text-2xl font-extrabold text-[#F3F4F6] tracking-tight">
            {isEditing ? 'Edit Project' : 'Publish a New Project'}
          </h1>
          <p className="text-xs text-[#8E8E9A] mt-1">
            Showcase your code, design, and live deployment to students and potential recruiters.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Information Card */}
        <div className="bg-[#121215] border border-[#202026] rounded-xl p-6 space-y-5">
          <h2 className="text-sm font-bold text-[#F3F4F6] border-b border-[#202026] pb-2 flex items-center gap-2">
            <span className="w-5 h-5 rounded-md bg-[#18181D] text-[#00A3E0] border border-[#202026] flex items-center justify-center text-xs font-semibold">1</span>
            Project Overview
          </h2>

          <Input
            label="Project Title"
            placeholder="e.g., CampusMarket — Peer-to-Peer Student Marketplace"
            value={title}
            onChange={e => setTitle(e.target.value)}
            error={errors.title}
            required
          />

          <Input
            label="Short Summary"
            placeholder="A single compelling sentence describing what your project accomplishes..."
            value={summary}
            onChange={e => setSummary(e.target.value)}
            error={errors.summary}
            helperText="Appears on project cards in the public gallery (max 140 chars recommended)."
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Primary Category"
              value={category}
              onChange={e => setCategory(e.target.value as ProjectCategory)}
              options={CATEGORIES}
              required
            />

            <Select
              label="Visibility Status"
              value={visibility}
              onChange={e => setVisibility(e.target.value as any)}
              options={[
                { value: 'public', label: 'Public (Discoverable by everyone)' },
                { value: 'private', label: 'Private (Visible only to you)' },
              ]}
              required
            />
          </div>

          <Textarea
            label="Full Technical Description"
            placeholder="Detail your architecture, challenges overcome, API integrations, and how someone can test it..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            error={errors.description}
            rows={6}
            helperText="Markdown formatting is supported."
            required
          />
        </div>

        {/* Tech Stack Card */}
        <div className="bg-[#121215] border border-[#202026] rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-[#F3F4F6] border-b border-[#202026] pb-2 flex items-center gap-2">
            <span className="w-5 h-5 rounded-md bg-[#18181D] text-[#00A3E0] border border-[#202026] flex items-center justify-center text-xs font-semibold">2</span>
            Technologies & Stack
          </h2>

          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="e.g., React, FastAPI, Tailwind CSS, PostgreSQL..."
                value={newTechInput}
                onChange={e => setNewTechInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTech();
                  }
                }}
              />
            </div>
            <Button type="button" variant="secondary" size="md" onClick={handleAddTech} className="shrink-0 hover:border-[#007BA7] hover:text-[#00A3E0]">
              <Plus className="w-4 h-4" />
              Add Tech
            </Button>
          </div>
          {errors.technologies && (
            <p className="text-xs text-[#FF2D95] font-medium">{errors.technologies}</p>
          )}

          <div className="flex flex-wrap gap-2 pt-1">
            {technologies.map(tech => (
              <span
                key={tech}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#18181D] border border-[#202026] text-[#F3F4F6] rounded-md text-xs font-medium"
              >
                {tech}
                <button
                  type="button"
                  onClick={() => handleRemoveTech(tech)}
                  className="text-[#8E8E9A] hover:text-[#FF2D95] transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Media & Screenshots */}
        <div className="bg-[#121215] border border-[#202026] rounded-xl p-6 space-y-5">
          <h2 className="text-sm font-bold text-[#F3F4F6] border-b border-[#202026] pb-2 flex items-center gap-2">
            <span className="w-5 h-5 rounded-md bg-[#18181D] text-[#00A3E0] border border-[#202026] flex items-center justify-center text-xs font-semibold">3</span>
            Project Media & Screenshots
          </h2>

          {/* Cover image input */}
          <div className="space-y-2">
            <Input
              label="Cover Image URL"
              placeholder="https://images.unsplash.com/... or upload below"
              value={coverImageUrl}
              onChange={e => setCoverImageUrl(e.target.value)}
              error={errors.coverImageUrl}
              helperText="This image is displayed on the project card and header."
              required
            />

            <div className="flex items-center gap-3 pt-1">
              <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 border border-[#202026] rounded-lg text-xs font-medium text-[#F3F4F6] bg-[#18181D] hover:bg-[#121215] transition-colors">
                <Upload className="w-4 h-4 text-[#00A3E0]" />
                Upload Cover Photo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => handleImageFileUpload(e, true)}
                  disabled={isUploading}
                />
              </label>

              {coverImageUrl && (
                <div className="flex items-center gap-2 text-xs text-[#00A3E0] font-medium">
                  <Check className="w-4 h-4" />
                  Image Attached
                </div>
              )}
            </div>

            {coverImageUrl && (
              <div className="mt-2 w-48 h-28 rounded-lg overflow-hidden border border-[#202026]">
                <img src={coverImageUrl} alt="Cover Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {/* Additional screenshots */}
          <div className="space-y-3 pt-3 border-t border-[#202026]">
            <label className="block text-xs font-semibold text-[#8E8E9A]">
              Additional Screenshots (Optional)
            </label>
            <div className="flex flex-wrap sm:flex-nowrap gap-2">
              <div className="flex-1 min-w-[200px]">
                <Input
                  placeholder="Paste image URL..."
                  value={newScreenshotInput}
                  onChange={e => setNewScreenshotInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddScreenshotUrl();
                    }
                  }}
                />
              </div>
              <Button type="button" variant="outline" size="md" onClick={handleAddScreenshotUrl} className="shrink-0">
                <Plus className="w-4 h-4" />
                Add URL
              </Button>
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 border border-[#202026] rounded-lg text-xs font-medium text-[#F3F4F6] bg-[#18181D] hover:bg-[#121215] transition-colors shrink-0">
                <Upload className="w-4 h-4 text-[#00A3E0]" />
                Upload File
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => handleImageFileUpload(e, false)}
                  disabled={isUploading}
                />
              </label>
            </div>

            {screenshotUrls.length > 0 && (
              <div className="flex flex-wrap gap-3 pt-2">
                {screenshotUrls.map((url, idx) => (
                  <div key={idx} className="relative w-28 h-20 rounded-lg overflow-hidden border border-[#202026] group">
                    <img src={url} alt={`Screenshot ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveScreenshot(idx)}
                      className="absolute top-1 right-1 p-1 bg-black/70 text-white rounded-md hover:bg-rose-600 transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Links & Repository */}
        <div className="bg-[#121215] border border-[#202026] rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-[#F3F4F6] border-b border-[#202026] pb-2 flex items-center gap-2">
            <span className="w-5 h-5 rounded-md bg-[#18181D] text-[#00A3E0] border border-[#202026] flex items-center justify-center text-xs font-semibold">4</span>
            Live Demo & Source Code
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="GitHub Repository URL"
              placeholder="https://github.com/username/project"
              value={githubUrl}
              onChange={e => setGithubUrl(e.target.value)}
              error={errors.githubUrl}
              icon={<Github className="w-4 h-4" />}
            />

            <Input
              label="Live Demo URL"
              placeholder="https://my-app.vercel.app"
              value={liveDemoUrl}
              onChange={e => setLiveDemoUrl(e.target.value)}
              error={errors.liveDemoUrl}
              icon={<Globe className="w-4 h-4" />}
            />
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#202026]">
          <Button type="button" variant="outline" size="md" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={isSubmitting || isUploading}
            isLoading={isSubmitting}
            className="px-6"
          >
            {isEditing ? 'Save Changes' : 'Publish Project'}
          </Button>
        </div>
      </form>
    </div>
  );
};
