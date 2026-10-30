import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/NotificationContext';
import { usePlan } from '../context/PlanContext';
import { DataService } from '../services/store';
import { ResumeService } from '../services/resumeService';
import {
  ResumeData,
  ResumeEducation,
  ResumeProject,
  ResumeExperience,
  ResumeCertification,
  ResumeAchievement,
  ResumeTemplateId,
} from '../types';
import { ResumePreview, toTitleCase, normalizeResumeFontKey } from '../components/resume/ResumePreview';
import { TemplatePicker } from '../components/resume/TemplatePicker';
import { AISuggestModal } from '../components/resume/AISuggestModal';
import { AutoImportModal } from '../components/resume/AutoImportModal';
import { SendResumeModal } from '../components/resume/SendResumeModal';
import { ATSKeywordMatchModal } from '../components/resume/ATSKeywordMatchModal';
import { DownloadResumeModal } from '../components/resume/DownloadResumeModal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Download,
  Share2,
  FolderGit2,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Check,
  Upload,
  RefreshCw,
  Palette,
  FileText,
  User,
  GraduationCap,
  Code2,
  Briefcase,
  Award,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Copy,
  Target,
  Save,
  Crown,
  Lock,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Sliders,
  AlignLeft,
  AlignCenter,
  RotateCcw,
} from 'lucide-react';

const STORAGE_KEY = 'skillbridge_resume_builder_data';

const DEFAULT_RESUME_DATA: ResumeData = {
  personal: {
    fullName: 'Shivam Tiwari',
    photoUrl: '',
    email: 'shivam.tiwari@university.edu',
    phone: '+91 98765 43210',
    cityState: 'Surat, Gujarat',
    linkedinUrl: 'https://linkedin.com/in/shivam-tiwari',
    githubUrl: 'https://github.com/shivamtiwari',
    portfolioUrl: 'https://shivamtiwari.dev',
  },
  objective:
    'Detail-oriented Computer Science student with a strong foundation in Full-Stack Web Development, Data Structures, and Cloud Architecture. Proven track record of building scalable web applications and collaborating in agile engineering teams. Seeking a Software Engineering Internship to deliver high-impact product features.',
  education: {
    higherEducation: [
      {
        id: 'edu-1',
        degree: 'B.Tech in Computer Science & Engineering',
        institution: 'BML Munjal University (BMU)',
        startYear: '2023',
        endYear: '2027',
        scoreType: 'CGPA',
        score: '8.85 / 10.0',
        fieldOfStudy: 'Computer Science',
        city: 'Gurugram, Haryana',
      },
    ],
    twelfth: {
      schoolName: 'St. Xavier Senior Secondary School',
      boardOrStream: 'CBSE (Science PCM)',
      year: '2023',
      score: '94.6%',
    },
    tenth: {
      schoolName: 'St. Xavier High School',
      boardOrStream: 'CBSE',
      year: '2021',
      score: '96.2%',
    },
  },
  skills: {
    technical: [
      'TypeScript',
      'React.js',
      'Node.js',
      'Python',
      'SQL (PostgreSQL)',
      'Tailwind CSS',
      'REST APIs',
      'Git & GitHub',
    ],
    tools: ['VS Code', 'Docker', 'Postman', 'Figma', 'Linux', 'Vite', 'Vercel'],
    soft: ['Problem Solving', 'Team Collaboration', 'Agile Development', 'Technical Writing'],
    languages: ['English (Fluent)', 'Hindi (Native)'],
  },
  projects: [
    {
      id: 'proj-1',
      title: 'EcoTelemetry — Real-Time Grid Analytics',
      description:
        'Engineered a real-time power grid telemetry dashboard processing live sensor streams with sub-50ms latency, automated anomaly detection alerts, and interactive visual analytics.',
      technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Node.js', 'WebSockets'],
      githubUrl: 'https://github.com/shivamtiwari/ecotelemetry',
      liveUrl: 'https://ecotelemetry.dev',
      importedFromSkillBridge: true,
    },
    {
      id: 'proj-2',
      title: 'SkillBridge — Student Portfolio & Freelance Platform',
      description:
        'Built a full-stack university talent platform featuring project showcases, real-time messaging, and an ATS-optimized resume builder serving 500+ student developers.',
      technologies: ['React', 'TypeScript', 'Supabase', 'Tailwind CSS'],
      githubUrl: 'https://github.com/shivamtiwari/skillbridge',
      liveUrl: 'https://skillbridge.dev',
      importedFromSkillBridge: true,
    },
  ],
  experience: [
    {
      id: 'exp-1',
      company: '(Example) TechNovation Labs',
      role: 'Frontend Software Engineering Intern',
      duration: 'May 2025 – Aug 2025',
      location: 'Remote',
      description:
        '• Developed 12+ reusable React & TypeScript UI components, reducing page load time by 28%.\n• Integrated RESTful APIs and collaborated with backend engineers on authentication workflows.\n• Participated in daily agile standups and peer code reviews.',
      isCurrent: false,
    },
  ],
  certifications: [
    {
      id: 'cert-1',
      name: 'AWS Certified Cloud Practitioner',
      issuer: 'Amazon Web Services',
      year: '2025',
      certificateLink: 'https://aws.amazon.com/verification',
    },
  ],
  achievements: [
    {
      id: 'ach-1',
      title: '(Example) 1st Place Winner — National Hackathon',
      organization: 'TechSummit University Chapter',
      year: '2025',
      description: 'Built an AI accessibility tool in 36 hours among 120+ competing teams.',
    },
    {
      id: 'ach-2',
      title: 'Dean’s Honor Academic List',
      organization: 'School of Engineering & Technology',
      year: '2024',
      description: 'Awarded for maintaining top 5% academic standing in Computer Science.',
    },
  ],
  extra: {
    volunteering: 'Open-Source Mentor at University Coding Club (guided 40+ freshmen in Git & React).',
    extracurriculars: 'Lead Organizer, Annual TechFest Hackathon.',
    hobbies: 'Competitive Programming, Chess, Technical Blogging.',
    references: 'Available upon request.',
  },
  formatting: {
    template: 'modern-tech',
    accentColor: '#FF2D95',
    fontFamily: 'calibri',
    fontSize: 'medium',
    spacing: 'normal',
    headerAlignment: 'left',
    showPhoto: false,
    fitToOnePage: true,
    sectionOrder: [
      'summary',
      'education',
      'skills',
      'projects',
      'experience',
      'certifications',
      'achievements',
      'extra',
    ],
    visibleSections: {
      summary: true,
      education: true,
      skills: true,
      projects: true,
      experience: true,
      certifications: true,
      achievements: true,
      extra: false,
    },
  },
};

const STEPS = [
  { id: 1, title: 'Personal Details', icon: User, desc: 'Contact info & links' },
  { id: 2, title: 'Career Objective', icon: Sparkles, desc: 'AI-powered summary' },
  { id: 3, title: 'Education', icon: GraduationCap, desc: 'Degrees, 12th & 10th' },
  { id: 4, title: 'Skills', icon: Code2, desc: 'Technical & soft skills' },
  { id: 5, title: 'Projects', icon: FolderGit2, desc: 'Auto-import or custom' },
  { id: 6, title: 'Experience', icon: Briefcase, desc: 'Internships & roles' },
  { id: 7, title: 'Certifications', icon: Award, desc: 'Courses & credentials' },
  { id: 8, title: 'Achievements', icon: Award, desc: 'Hackathons & honors' },
  { id: 9, title: 'Additional Info', icon: Layers, desc: 'Volunteering & hobbies' },
  { id: 10, title: 'Template & PDF', icon: Palette, desc: 'Fonts, colors & export' },
];

export const ResumeBuilderPage: React.FC = () => {
  const { user, profile } = useAuth();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const resumeId = searchParams.get('id');

  const {
    plan,
    freeUsesRemaining,
    isWatermarkRequired,
    canExportDocx,
    consumeFreeUse,
    openUpgradeModal,
  } = usePlan();

  const [currentStep, setCurrentStep] = useState(1);
  const [resumeData, setResumeData] = useState<ResumeData>(() => {
    let loaded: ResumeData | null = null;
    if (resumeId) {
      const existing = DataService.getResumeById(resumeId);
      if (existing && existing.data) loaded = existing.data;
    }
    if (!loaded) {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) loaded = JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to load saved resume draft:', e);
      }
    }
    const base = loaded || DEFAULT_RESUME_DATA;
    const savedAccent = base.formatting?.accentColor;
    // Restore Neon Rose (#FF2D95) if saved draft had the navy (#1F2A44) polish default
    const restoredAccent =
      !savedAccent || savedAccent === '#1F2A44' || savedAccent === '#00A3E0'
        ? '#FF2D95'
        : savedAccent;
    const savedFont = base.formatting?.fontFamily;
    const restoredFont = normalizeResumeFontKey(savedFont);
    const savedTemplate = base.formatting?.template;
    const restoredTemplate =
      !savedTemplate || savedTemplate === 'minimal-classic' ? 'modern-tech' : savedTemplate;

    const mergedTechnical = Array.from(
      new Set([
        ...(base.skills?.technical || DEFAULT_RESUME_DATA.skills.technical),
        ...(base.skills?.frameworks || []),
        ...(base.skills?.aiLlm || []),
        ...(base.skills?.cloudDevops || []),
      ])
    );

    return {
      ...base,
      personal: {
        ...DEFAULT_RESUME_DATA.personal,
        ...base.personal,
        photoUrl: '',
      },
      objective: base.objective || DEFAULT_RESUME_DATA.objective,
      education: {
        ...DEFAULT_RESUME_DATA.education,
        ...base.education,
        higherEducation: (
          base.education?.higherEducation || DEFAULT_RESUME_DATA.education.higherEducation
        ).map(e => ({
          ...e,
          degree: toTitleCase(e.degree),
          institution: toTitleCase(e.institution),
          city: e.city ? toTitleCase(e.city) : e.city,
        })),
        twelfth: {
          ...DEFAULT_RESUME_DATA.education.twelfth,
          ...(base.education?.twelfth || {}),
          schoolName: toTitleCase(
            base.education?.twelfth?.schoolName || DEFAULT_RESUME_DATA.education.twelfth.schoolName
          ),
          boardOrStream: toTitleCase(
            base.education?.twelfth?.boardOrStream ||
              DEFAULT_RESUME_DATA.education.twelfth.boardOrStream
          ),
        },
        tenth: {
          ...DEFAULT_RESUME_DATA.education.tenth,
          ...(base.education?.tenth || {}),
          schoolName: toTitleCase(
            base.education?.tenth?.schoolName || DEFAULT_RESUME_DATA.education.tenth.schoolName
          ),
          boardOrStream: toTitleCase(
            base.education?.tenth?.boardOrStream ||
              DEFAULT_RESUME_DATA.education.tenth.boardOrStream
          ),
        },
      },
      skills: {
        technical: mergedTechnical.length > 0 ? mergedTechnical : DEFAULT_RESUME_DATA.skills.technical,
        tools: base.skills?.tools?.length ? base.skills.tools : DEFAULT_RESUME_DATA.skills.tools,
        soft: base.skills?.soft?.length ? base.skills.soft : DEFAULT_RESUME_DATA.skills.soft,
        languages: base.skills?.languages?.length
          ? base.skills.languages
          : DEFAULT_RESUME_DATA.skills.languages,
      },
      experience:
        base.experience && base.experience.length > 0
          ? base.experience
          : DEFAULT_RESUME_DATA.experience,
      extra: {
        ...DEFAULT_RESUME_DATA.extra,
        ...base.extra,
      },
      formatting: {
        ...DEFAULT_RESUME_DATA.formatting,
        ...base.formatting,
        template: restoredTemplate,
        accentColor: restoredAccent,
        fontFamily: restoredFont,
        headerAlignment: 'left',
        showPhoto: false,
        fitToOnePage: base.formatting?.fitToOnePage ?? true,
        sectionOrder: DEFAULT_RESUME_DATA.formatting.sectionOrder,
        visibleSections: {
          ...DEFAULT_RESUME_DATA.formatting.visibleSections,
          ...(base.formatting?.visibleSections || {}),
          extra: false,
        },
      },
    };
  });

  // UI state
  const [showLivePreview, setShowLivePreview] = useState(true);
  const [previewScale, setPreviewScale] = useState(0.85);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const previewScrollRef = React.useRef<HTMLDivElement>(null);
  const [showAISuggestModal, setShowAISuggestModal] = useState(false);
  const [showAutoImportModal, setShowAutoImportModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showATSModal, setShowATSModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [dismissedWarning, setDismissedWarning] = useState(false);

  const handlePreviewScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    const a4HeightScaled = 1123 * previewScale;
    const current = Math.min(totalPages, Math.max(1, Math.floor(scrollTop / a4HeightScaled) + 1));
    setCurrentPage(current);
  };

  const handleFitToOnePage = () => {
    const willBeFit = !resumeData.formatting.fitToOnePage;
    setResumeData(prev => ({
      ...prev,
      formatting: {
        ...prev.formatting,
        fitToOnePage: willBeFit,
        fontSize: willBeFit ? 'small' : 'medium',
        spacing: willBeFit ? 'compact' : 'normal',
      },
    }));
    showToast(
      willBeFit ? 'Fit to one page enabled' : 'Standard spacing restored',
      willBeFit
        ? 'Applied compact 15mm margins and 9.5pt typography to fit on a single A4 page.'
        : 'Restored standard 18mm margins and 10.5pt typography.'
    );
  };

  // Auto-fit scale on mount and window resize to fit preview panel
  useEffect(() => {
    const computeScale = () => {
      const containerWidth = previewScrollRef.current?.parentElement?.clientWidth || 500;
      const ideal = Math.min(1, Math.max(0.5, (containerWidth - 32) / 794));
      setPreviewScale(parseFloat(ideal.toFixed(2)));
    };
    computeScale();
    window.addEventListener('resize', computeScale);
    return () => window.removeEventListener('resize', computeScale);
  }, [showLivePreview]);

  // New item inputs for skills
  const [techInput, setTechInput] = useState('');
  const [toolInput, setToolInput] = useState('');
  const [softInput, setSoftInput] = useState('');
  const [langInput, setLangInput] = useState('');

  // Sample or placeholder project data detection
  const hasPlaceholderProject = resumeData.projects.some(
    p => p.title.trim().toLowerCase() === 'new engineering project'
  );
  const hasSampleData =
    hasPlaceholderProject ||
    resumeData.experience.some(e => e.company.includes('(Example)')) ||
    resumeData.achievements.some(a => a.title.includes('(Example)')) ||
    resumeData.projects.some(p => p.title.includes('(Example)'));

  const handleClearSampleData = () => {
    setResumeData(prev => ({
      ...prev,
      experience: [],
      achievements: [],
      projects: [],
    }));
    showToast('Example data cleared', 'You can now enter your own verified experience & projects.');
  };

  // Autosave to localStorage and automatically sync to user's profile
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(resumeData));
      if (user?.id) {
        DataService.saveResume({
          id: resumeId || `resume-${user.id}`,
          userId: user.id,
          title: `${resumeData.personal.fullName || 'Student'} Resume`,
          template: resumeData.formatting.template,
          data: resumeData,
          isPublic: true,
        });
      }
    } catch (err) {
      console.warn('Failed to autosave resume draft:', err);
    }
  }, [resumeData, user?.id, resumeId]);

  // Pre-fill from current user profile on first load with real full name, never username
  useEffect(() => {
    if (user && !resumeId) {
      const preferredName =
        profile?.full_name?.trim() ||
        (user.name && !['shivii', 'user', 'student', 'admin'].includes(user.name.toLowerCase())
          ? user.name
          : 'Shivam Tiwari');

      setResumeData(prev => ({
        ...prev,
        personal: {
          ...prev.personal,
          fullName:
            prev.personal.fullName &&
            prev.personal.fullName.toLowerCase() !== 'shivii' &&
            prev.personal.fullName.toLowerCase() !== 'user'
              ? prev.personal.fullName
              : preferredName,
          photoUrl: '',
          email: prev.personal.email || user.email || 'shivam.tiwari@university.edu',
          phone: prev.personal.phone || '+91 98765 43210',
          cityState: prev.personal.cityState || 'Surat, Gujarat',
          linkedinUrl: prev.personal.linkedinUrl || profile?.linkedin_url || 'https://linkedin.com/in/shivam-tiwari',
          githubUrl: prev.personal.githubUrl || profile?.github_url || 'https://github.com/shivamtiwari',
          portfolioUrl: prev.personal.portfolioUrl || profile?.portfolio_url || 'https://shivamtiwari.dev',
        },
        education: {
          ...prev.education,
          higherEducation: prev.education.higherEducation.map(e => ({
            ...e,
            degree: profile?.degree || e.degree,
            institution: profile?.college || e.institution,
          })),
        },
      }));
    }
  }, [user, profile, resumeId]);

  const handleNextStep = () => {
    if (currentStep < STEPS.length) setCurrentStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  // Primary Download PDF action: checks the 10 free downloads limit, then downloads <FullName>_Resume.pdf
  // without any watermark to the user's computer and opens the Save/Export modal.
  const handleDownloadPDF = async () => {
    const allowed = consumeFreeUse('PDF download');
    if (!allowed) return;

    setShowDownloadModal(true);
    const fullName = (resumeData.personal.fullName || 'Resume').trim();
    const safeFileName = `${fullName.replace(/[^a-zA-Z0-9_-]+/g, '_')}_Resume`;
    document.title = safeFileName;

    try {
      await ResumeService.downloadPdfToPc(
        resumeData,
        fullName,
        false,
        false
      );
      showToast(
        'Resume PDF Downloaded',
        `${safeFileName}.pdf has been downloaded to your computer (Watermark-Free).`
      );
    } catch (err) {
      console.error('PDF download error:', err);
    }
  };

  const handleDownloadWord = () => {
    if (!canExportDocx) {
      openUpgradeModal('Word (.docx) export is available on Basic (₹99) and Premium plans.');
      return;
    }
    ResumeService.exportToWord(resumeData, `${resumeData.personal.fullName || 'Resume'}.doc`);
    showToast('Word export complete', 'File downloaded successfully.');
  };

  const handleSaveToProfile = () => {
    const saved = DataService.saveResume({
      id: resumeId || undefined,
      userId: user?.id || 'guest',
      title: `${resumeData.personal.fullName || 'My'} Resume`,
      template: resumeData.formatting.template,
      data: resumeData,
    });
    showToast('Resume saved', 'Saved to your profile resumes.');
  };

  const handleCopyText = () => {
    const textSummary = `
========================================
${resumeData.personal.fullName}
${resumeData.personal.email} | ${resumeData.personal.phone} | ${resumeData.personal.cityState}
LinkedIn: ${resumeData.personal.linkedinUrl || 'N/A'}
GitHub: ${resumeData.personal.githubUrl || 'N/A'}
========================================

PROFESSIONAL SUMMARY:
${resumeData.objective}

EDUCATION:
${resumeData.education.higherEducation.map(e => `${e.degree} - ${e.institution} (${e.endYear}) | ${e.score}`).join('\n')}

SKILLS:
Technical: ${resumeData.skills.technical.join(', ')}
Tools: ${resumeData.skills.tools.join(', ')}
Soft Skills: ${resumeData.skills.soft.join(', ')}

PROJECTS:
${resumeData.projects.map(p => `* ${p.title} (${p.technologies.join(', ')})\n  ${p.description}\n  Code: ${p.githubUrl || 'N/A'}`).join('\n\n')}

EXPERIENCE:
${resumeData.experience.map(exp => `* ${exp.role} @ ${exp.company} (${exp.duration})\n  ${exp.description}`).join('\n\n')}
    `.trim();

    navigator.clipboard.writeText(textSummary);
    showToast('Copied to clipboard', 'Resume text ready to paste.');
  };

  const handleResetToDefault = () => {
    if (confirm('Reset resume form with standard university template?')) {
      setResumeData(DEFAULT_RESUME_DATA);
      showToast('Reset completed', 'Sample resume data loaded.');
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 text-[#F3F4F6]">
      {/* Top Header & Action Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#121215] border border-[#202026] p-4 sm:p-5 rounded-xl print:hidden">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#F3F4F6] tracking-tight">
              AI Student Resume Builder
            </h1>
            {/* Plan Tier Badge */}
            {plan === 'free' ? (
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 font-semibold border border-emerald-500/20">
                Free Plan: {freeUsesRemaining} of 10 free downloads left (No Watermark)
              </span>
            ) : (
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-semibold border border-blue-500/20 flex items-center gap-1">
                <Crown className="w-3 h-3 text-amber-400" />
                {plan.toUpperCase()} Plan (Unlimited Downloads)
              </span>
            )}
          </div>
          <p className="text-xs text-[#8E8E9A]">
            Step-by-step form with live A4 preview, 1-click project auto-import, and ATS Keyword Match optimization.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* ATS Keyword Match Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowATSModal(true)}
            className="text-xs gap-1.5 border-blue-500/30 text-blue-400 hover:text-white hover:bg-blue-500/10"
          >
            <Target className="w-3.5 h-3.5 text-blue-400" />
            <span>ATS Keyword Match</span>
          </Button>

          {/* Toggle Live Preview */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowLivePreview(prev => !prev)}
            className="text-xs gap-1.5"
          >
            {showLivePreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showLivePreview ? 'Hide Preview' : 'Show Preview'}</span>
          </Button>

          {/* Save Draft / Resume */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveToProfile}
            className="text-xs gap-1.5 border-[#202026] text-gray-300 hover:text-white"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save to Profile</span>
          </Button>

          {/* View on Profile */}
          {user?.id && (
            <Link to={`/students/${user.id}?tab=resume`}>
              <Button
                variant="outline"
                size="sm"
                className="text-xs gap-1.5 border-[#00A3E0]/30 text-[#00A3E0] hover:bg-[#00A3E0]/15"
                title="View how your resume appears on your student profile"
              >
                <User className="w-3.5 h-3.5 text-[#00A3E0]" />
                <span>View on Profile</span>
              </Button>
            </Link>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSendModal(true)}
            className="text-xs gap-1.5 border-[#202026] text-[#8E8E9A] hover:text-[#00A3E0]"
          >
            <Share2 className="w-3.5 h-3.5 text-[#00A3E0]" />
            <span>Send Directly</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleDownloadPDF}
            className="text-xs gap-1.5 bg-[#00A3E0] hover:bg-[#008fca] text-black font-bold"
            title="Choose Save as PDF, Margins: None, turn on Background graphics, turn off Headers and footers."
          >
            <Download className="w-3.5 h-3.5 text-black" />
            <span>Download PDF</span>
          </Button>
        </div>
      </div>

      {/* Honest Content Warning Banner */}
      {hasSampleData && !dismissedWarning && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-200 text-xs print:hidden animate-in fade-in">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-300">
                Notice: Example Placeholder Content Detected
              </p>
              <p className="text-amber-200/80 mt-0.5">
                The role &quot;(Example) TechNovation Labs&quot; and hackathon award are template examples. Recruiters verify backgrounds thoroughly — be sure to replace them with your real projects and credentials.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearSampleData}
              className="text-xs border-amber-500/40 text-amber-300 hover:bg-amber-500/20"
            >
              Clear Example Data
            </Button>
            <button
              onClick={() => setDismissedWarning(true)}
              className="text-amber-400/70 hover:text-amber-300 text-xs px-2 py-1 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Progress Bar & Step Navigation */}
      <div className="bg-[#121215] border border-[#202026] p-4 rounded-xl space-y-4 print:hidden">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[#F3F4F6] flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-[#FF2D95]/20 text-[#FF2D95] font-mono font-bold">
              Step {currentStep} of {STEPS.length}
            </span>
            <span className="text-[#8E8E9A]">|</span>
            <span>{STEPS[currentStep - 1]?.title || 'Template & PDF'}</span>
          </span>
          <span className="text-xs text-[#8E8E9A] tabular-nums font-semibold">
            {Math.round((currentStep / STEPS.length) * 100)}% Complete
          </span>
        </div>

        {/* Visual Progress Line */}
        <div className="w-full h-1.5 bg-[#18181D] rounded-full overflow-hidden border border-[#202026]">
          <div
            className="h-full bg-linear-to-r from-[#00A3E0] to-[#FF2D95] transition-all duration-300"
            style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
          />
        </div>

        {/* Step Navigation Tabs / Breadcrumbs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {STEPS.map(step => {
            const isCurrent = currentStep === step.id;
            const isDone = currentStep > step.id;
            const StepIcon = step.icon;

            return (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-[#FF2D95] text-white shadow-xs font-bold'
                    : isDone
                    ? 'bg-[#18181D] text-[#00A3E0] border border-[#202026] hover:bg-[#202026]'
                    : 'bg-[#121215] text-[#8E8E9A] border border-[#202026] hover:text-[#F3F4F6]'
                }`}
              >
                {isDone ? (
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                ) : (
                  <StepIcon className="w-3.5 h-3.5" />
                )}
                <span>{step.id}. {step.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Workspace: Step Form on Left + Live Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Container (7 cols if preview open, 12 cols if hidden) */}
        <div className={`${showLivePreview ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-6 print:hidden`}>
          <div className="bg-[#121215] border border-[#202026] rounded-xl p-6 sm:p-7 space-y-6">
            {/* Step 1: Personal Details */}
            {currentStep === 1 && (
              <div className="space-y-5">
                <div className="border-b border-[#202026] pb-3">
                  <h2 className="text-base font-bold text-[#F3F4F6]">1. Personal & Contact Details</h2>
                  <p className="text-xs text-[#8E8E9A]">Recruiters need verified, direct contact channels to reach you for internships and gigs.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Full Name *"
                    required
                    value={resumeData.personal.fullName}
                    onChange={e => setResumeData(prev => ({ ...prev, personal: { ...prev.personal, fullName: e.target.value } }))}
                    placeholder="e.g. Shivam Tiwari"
                  />
                  <Input
                    label="Email Address *"
                    type="email"
                    required
                    value={resumeData.personal.email}
                    onChange={e => setResumeData(prev => ({ ...prev, personal: { ...prev.personal, email: e.target.value } }))}
                    placeholder="shivam.tiwari@university.edu"
                  />
                  <Input
                    label="Phone Number"
                    value={resumeData.personal.phone}
                    onChange={e => setResumeData(prev => ({ ...prev, personal: { ...prev.personal, phone: e.target.value } }))}
                    placeholder="+91 98765 43210"
                  />
                  <Input
                    label="City, State / Country"
                    value={resumeData.personal.cityState}
                    onChange={e => setResumeData(prev => ({ ...prev, personal: { ...prev.personal, cityState: e.target.value } }))}
                    placeholder="Surat, Gujarat"
                  />
                </div>

                {/* Social & Portfolio Links */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Input
                    label="LinkedIn URL"
                    value={resumeData.personal.linkedinUrl}
                    onChange={e => setResumeData(prev => ({ ...prev, personal: { ...prev.personal, linkedinUrl: e.target.value } }))}
                    placeholder="linkedin.com/in/..."
                  />
                  <Input
                    label="GitHub URL"
                    value={resumeData.personal.githubUrl}
                    onChange={e => setResumeData(prev => ({ ...prev, personal: { ...prev.personal, githubUrl: e.target.value } }))}
                    placeholder="github.com/..."
                  />
                  <Input
                    label="Portfolio / Website"
                    value={resumeData.personal.portfolioUrl}
                    onChange={e => setResumeData(prev => ({ ...prev, personal: { ...prev.personal, portfolioUrl: e.target.value } }))}
                    placeholder="https://mysite.dev"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Career Objective */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="border-b border-[#202026] pb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-[#F3F4F6]">2. Career Objective / Summary</h2>
                    <p className="text-xs text-[#8E8E9A]">Write a 2–3 sentence summary highlighting your specialization and career goals.</p>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setShowAISuggestModal(true)}
                    className="gap-1.5 text-xs bg-[#00A3E0] hover:bg-[#008fca] text-black font-bold"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    AI Suggest
                  </Button>
                </div>

                <Textarea
                  label="Professional Summary"
                  rows={4}
                  value={resumeData.objective}
                  onChange={e => setResumeData(prev => ({ ...prev, objective: e.target.value }))}
                  placeholder="Detail-oriented Computer Science student with a strong foundation in Full-Stack Web Development..."
                />

                <div className="p-3 bg-[#18181D] rounded-lg border border-[#202026] text-xs text-[#8E8E9A] flex items-center justify-between">
                  <span>Need inspiration? Click the <strong>AI Suggest</strong> button above to auto-generate customized summaries.</span>
                </div>
              </div>
            )}

            {/* Step 3: Education */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="border-b border-[#202026] pb-3">
                  <h2 className="text-base font-bold text-[#F3F4F6]">3. Education</h2>
                  <p className="text-xs text-[#8E8E9A]">Higher education degrees along with Class XII and Class X academic foundations.</p>
                </div>

                {/* Higher education list */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#00A3E0] uppercase tracking-wider">
                      University / College Degree
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newEdu: ResumeEducation = {
                          id: `edu-${Date.now()}`,
                          degree: 'B.S. in Computer Science',
                          institution: 'University',
                          startYear: '2023',
                          endYear: '2027',
                          scoreType: 'CGPA',
                          score: '3.8 / 4.0',
                        };
                        setResumeData(prev => ({
                          ...prev,
                          education: {
                            ...prev.education,
                            higherEducation: [...prev.education.higherEducation, newEdu],
                          },
                        }));
                      }}
                      className="text-xs gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Degree
                    </Button>
                  </div>

                  {resumeData.education.higherEducation.map((edu, idx) => (
                    <div key={edu.id} className="p-4 bg-[#18181D] rounded-lg border border-[#202026] space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-[#F3F4F6]">Degree #{idx + 1}</span>
                        {resumeData.education.higherEducation.length > 1 && (
                          <button
                            onClick={() => {
                              setResumeData(prev => ({
                                ...prev,
                                education: {
                                  ...prev.education,
                                  higherEducation: prev.education.higherEducation.filter(e => e.id !== edu.id),
                                },
                              }));
                            }}
                            className="text-[#FF2D95] hover:underline flex items-center gap-1 text-[11px]"
                          >
                            <Trash2 className="w-3 h-3" /> Remove
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                          label="Degree / Major"
                          value={edu.degree}
                          onChange={e => {
                            const val = e.target.value;
                            setResumeData(prev => ({
                              ...prev,
                              education: {
                                ...prev.education,
                                higherEducation: prev.education.higherEducation.map(item =>
                                  item.id === edu.id ? { ...item, degree: val } : item
                                ),
                              },
                            }));
                          }}
                          placeholder="B.Tech in Computer Science & Engineering"
                        />
                        <Input
                          label="College / University Name (shown exactly as typed)"
                          value={edu.institution}
                          onChange={e => {
                            const val = e.target.value;
                            setResumeData(prev => ({
                              ...prev,
                              education: {
                                ...prev.education,
                                higherEducation: prev.education.higherEducation.map(item =>
                                  item.id === edu.id ? { ...item, institution: val } : item
                                ),
                              },
                            }));
                          }}
                          placeholder="BML Munjal University (BMU)"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            label="Start Year"
                            value={edu.startYear || ''}
                            onChange={e => {
                              const val = e.target.value;
                              setResumeData(prev => ({
                                ...prev,
                                education: {
                                  ...prev.education,
                                  higherEducation: prev.education.higherEducation.map(item =>
                                    item.id === edu.id ? { ...item, startYear: val } : item
                                  ),
                                },
                              }));
                            }}
                            placeholder="2023"
                          />
                          <Input
                            label="Graduation Year"
                            value={edu.endYear}
                            onChange={e => {
                              const val = e.target.value;
                              setResumeData(prev => ({
                                ...prev,
                                education: {
                                  ...prev.education,
                                  higherEducation: prev.education.higherEducation.map(item =>
                                    item.id === edu.id ? { ...item, endYear: val } : item
                                  ),
                                },
                              }));
                            }}
                            placeholder="2027"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="block text-xs font-semibold text-[#8E8E9A]">Score Type</label>
                            <select
                              value={edu.scoreType}
                              onChange={e => {
                                const val = e.target.value as 'CGPA' | 'Percentage';
                                setResumeData(prev => ({
                                  ...prev,
                                  education: {
                                    ...prev.education,
                                    higherEducation: prev.education.higherEducation.map(item =>
                                      item.id === edu.id ? { ...item, scoreType: val } : item
                                    ),
                                  },
                                }));
                              }}
                              className="w-full bg-[#121215] border border-[#202026] rounded-lg px-2.5 py-1.5 text-xs text-[#F3F4F6]"
                            >
                              <option value="CGPA">CGPA</option>
                              <option value="Percentage">Percentage (%)</option>
                            </select>
                          </div>
                          <Input
                            label="Score"
                            value={edu.score}
                            onChange={e => {
                              const val = e.target.value;
                              setResumeData(prev => ({
                                ...prev,
                                education: {
                                  ...prev.education,
                                  higherEducation: prev.education.higherEducation.map(item =>
                                    item.id === edu.id ? { ...item, score: val } : item
                                  ),
                                },
                              }));
                            }}
                            placeholder="8.9 / 10 or 3.8 / 4.0"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Class 12th & Class 10th Sections */}
                <div className="space-y-4 pt-3 border-t border-[#202026]">
                  <h3 className="text-xs font-bold text-[#00A3E0] uppercase tracking-wider">
                    Schooling Details (Class XII & Class X)
                  </h3>

                  {/* 12th */}
                  <div className="p-4 bg-[#18181D] rounded-lg border border-[#202026] space-y-3">
                    <p className="text-xs font-bold text-[#F3F4F6]">Class XII / Senior Secondary</p>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div className="sm:col-span-2">
                        <Input
                          label="School Name"
                          value={resumeData.education.twelfth.schoolName}
                          onChange={e => {
                            const val = e.target.value;
                            setResumeData(prev => ({
                              ...prev,
                              education: { ...prev.education, twelfth: { ...prev.education.twelfth, schoolName: val } },
                            }));
                          }}
                          placeholder="e.g. St. Xavier High School"
                        />
                      </div>
                      <Input
                        label="Board / Stream"
                        value={resumeData.education.twelfth.boardOrStream}
                        onChange={e => {
                          const val = e.target.value;
                          setResumeData(prev => ({
                            ...prev,
                            education: { ...prev.education, twelfth: { ...prev.education.twelfth, boardOrStream: val } },
                          }));
                        }}
                        placeholder="CBSE / Science (PCM)"
                      />
                      <Input
                        label="Year & Percentage"
                        value={resumeData.education.twelfth.score}
                        onChange={e => {
                          const val = e.target.value;
                          setResumeData(prev => ({
                            ...prev,
                            education: { ...prev.education, twelfth: { ...prev.education.twelfth, score: val } },
                          }));
                        }}
                        placeholder="94.2%"
                      />
                    </div>
                  </div>

                  {/* 10th */}
                  <div className="p-4 bg-[#18181D] rounded-lg border border-[#202026] space-y-3">
                    <p className="text-xs font-bold text-[#F3F4F6]">Class X / Secondary School</p>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div className="sm:col-span-2">
                        <Input
                          label="School Name"
                          value={resumeData.education.tenth.schoolName}
                          onChange={e => {
                            const val = e.target.value;
                            setResumeData(prev => ({
                              ...prev,
                              education: { ...prev.education, tenth: { ...prev.education.tenth, schoolName: val } },
                            }));
                          }}
                          placeholder="e.g. St. Xavier High School"
                        />
                      </div>
                      <Input
                        label="Board"
                        value={resumeData.education.tenth.boardOrStream}
                        onChange={e => {
                          const val = e.target.value;
                          setResumeData(prev => ({
                            ...prev,
                            education: { ...prev.education, tenth: { ...prev.education.tenth, boardOrStream: val } },
                          }));
                        }}
                        placeholder="CBSE / ICSE / State"
                      />
                      <Input
                        label="Year & Percentage"
                        value={resumeData.education.tenth.score}
                        onChange={e => {
                          const val = e.target.value;
                          setResumeData(prev => ({
                            ...prev,
                            education: { ...prev.education, tenth: { ...prev.education.tenth, score: val } },
                          }));
                        }}
                        placeholder="96.5%"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Technical & Soft Skills */}
            {currentStep === 4 && (
              <div className="space-y-5">
                <div className="border-b border-[#202026] pb-3">
                  <h2 className="text-base font-bold text-[#F3F4F6]">4. Technical & Soft Skills</h2>
                  <p className="text-xs text-[#8E8E9A]">
                    Add your programming languages, developer tools, soft skills, and spoken languages.
                  </p>
                </div>

                {/* 1. Programming Languages & Frameworks */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#00A3E0] uppercase tracking-wider">
                    1. Programming Languages & Frameworks
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={techInput}
                      onChange={e => setTechInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && techInput.trim()) {
                          e.preventDefault();
                          setResumeData(prev => ({
                            ...prev,
                            skills: { ...prev.skills, technical: [...prev.skills.technical, techInput.trim()] },
                          }));
                          setTechInput('');
                        }
                      }}
                      placeholder="e.g. TypeScript, React.js, Node.js, Python, SQL..."
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (techInput.trim()) {
                          setResumeData(prev => ({
                            ...prev,
                            skills: { ...prev.skills, technical: [...prev.skills.technical, techInput.trim()] },
                          }));
                          setTechInput('');
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {resumeData.skills.technical.map((sk, idx) => (
                      <span key={idx} className="text-xs px-2.5 py-1 rounded-md bg-[#18181D] text-[#F3F4F6] border border-[#202026] flex items-center gap-1.5">
                        {sk}
                        <button
                          onClick={() => setResumeData(prev => ({
                            ...prev,
                            skills: { ...prev.skills, technical: prev.skills.technical.filter((_, i) => i !== idx) },
                          }))}
                          className="hover:text-red-400 cursor-pointer"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* 2. Developer Tools & Platforms */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#00A3E0] uppercase tracking-wider">
                    2. Developer Tools & Platforms
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={toolInput}
                      onChange={e => setToolInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && toolInput.trim()) {
                          e.preventDefault();
                          setResumeData(prev => ({
                            ...prev,
                            skills: { ...prev.skills, tools: [...prev.skills.tools, toolInput.trim()] },
                          }));
                          setToolInput('');
                        }
                      }}
                      placeholder="e.g. VS Code, Docker, Postman, Figma, Linux, Vite..."
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (toolInput.trim()) {
                          setResumeData(prev => ({
                            ...prev,
                            skills: { ...prev.skills, tools: [...prev.skills.tools, toolInput.trim()] },
                          }));
                          setToolInput('');
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {resumeData.skills.tools.map((tl, idx) => (
                      <span key={idx} className="text-xs px-2.5 py-1 rounded-md bg-[#18181D] text-[#F3F4F6] border border-[#202026] flex items-center gap-1.5">
                        {tl}
                        <button
                          onClick={() => setResumeData(prev => ({
                            ...prev,
                            skills: { ...prev.skills, tools: prev.skills.tools.filter((_, i) => i !== idx) },
                          }))}
                          className="hover:text-red-400 cursor-pointer"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* 3. Soft Skills & Core Competencies */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#00A3E0] uppercase tracking-wider">
                    3. Soft Skills & Core Competencies
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={softInput}
                      onChange={e => setSoftInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && softInput.trim()) {
                          e.preventDefault();
                          setResumeData(prev => ({
                            ...prev,
                            skills: { ...prev.skills, soft: [...prev.skills.soft, softInput.trim()] },
                          }));
                          setSoftInput('');
                        }
                      }}
                      placeholder="e.g. Problem Solving, Team Collaboration, Agile Development..."
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (softInput.trim()) {
                          setResumeData(prev => ({
                            ...prev,
                            skills: { ...prev.skills, soft: [...prev.skills.soft, softInput.trim()] },
                          }));
                          setSoftInput('');
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {resumeData.skills.soft.map((sf, idx) => (
                      <span key={idx} className="text-xs px-2.5 py-1 rounded-md bg-[#18181D] text-[#F3F4F6] border border-[#202026] flex items-center gap-1.5">
                        {sf}
                        <button
                          onClick={() => setResumeData(prev => ({
                            ...prev,
                            skills: { ...prev.skills, soft: prev.skills.soft.filter((_, i) => i !== idx) },
                          }))}
                          className="hover:text-red-400 cursor-pointer"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* 4. Spoken Languages */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#00A3E0] uppercase tracking-wider">
                    4. Spoken Languages
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={langInput}
                      onChange={e => setLangInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && langInput.trim()) {
                          e.preventDefault();
                          setResumeData(prev => ({
                            ...prev,
                            skills: { ...prev.skills, languages: [...(prev.skills.languages || []), langInput.trim()] },
                          }));
                          setLangInput('');
                        }
                      }}
                      placeholder="e.g. English (Fluent), Hindi (Native)..."
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (langInput.trim()) {
                          setResumeData(prev => ({
                            ...prev,
                            skills: { ...prev.skills, languages: [...(prev.skills.languages || []), langInput.trim()] },
                          }));
                          setLangInput('');
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(resumeData.skills.languages || []).map((lg, idx) => (
                      <span key={idx} className="text-xs px-2.5 py-1 rounded-md bg-[#18181D] text-[#F3F4F6] border border-[#202026] flex items-center gap-1.5">
                        {lg}
                        <button
                          onClick={() => setResumeData(prev => ({
                            ...prev,
                            skills: {
                              ...prev.skills,
                              languages: (prev.skills.languages || []).filter((_, i) => i !== idx),
                            },
                          }))}
                          className="hover:text-red-400 cursor-pointer"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Projects */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="border-b border-[#202026] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-bold text-[#F3F4F6]">5. Key Projects</h2>
                    <p className="text-xs text-[#8E8E9A]">Highlight engineering accomplishments, architecture, and live deployment links.</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setShowAutoImportModal(true)}
                      className="gap-1.5 text-xs bg-[#00A3E0] hover:bg-[#0092c8] text-black font-bold"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Auto-Import from SkillBridge
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newP: ResumeProject = {
                          id: `proj-${Date.now()}`,
                          title: 'New Engineering Project',
                          description: 'Engineered full-stack feature set with clean code and tested architecture.',
                          technologies: ['React', 'TypeScript'],
                        };
                        setResumeData(prev => ({
                          ...prev,
                          projects: [...prev.projects, newP],
                        }));
                      }}
                      className="text-xs gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Project
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {resumeData.projects.map((proj, idx) => {
                    const isPlaceholderTitle =
                      proj.title.trim().toLowerCase() === 'new engineering project';
                    return (
                      <div key={proj.id} className="p-4 bg-[#18181D] rounded-lg border border-[#202026] space-y-3">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-[#F3F4F6]">Project #{idx + 1}</span>
                          <button
                            onClick={() => {
                              setResumeData(prev => ({
                                ...prev,
                                projects: prev.projects.filter(p => p.id !== proj.id),
                              }));
                            }}
                            className="text-red-400 hover:underline flex items-center gap-1 text-[11px]"
                          >
                            <Trash2 className="w-3 h-3" /> Remove
                          </button>
                        </div>

                        {isPlaceholderTitle && (
                          <div className="p-2.5 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                            <span>
                              <strong>Placeholder title detected:</strong> Please replace &quot;New Engineering Project&quot; with your actual project title.
                            </span>
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <Input
                            label="Project Title *"
                            value={proj.title}
                            onChange={e => {
                              const val = e.target.value;
                              setResumeData(prev => ({
                                ...prev,
                                projects: prev.projects.map(p => p.id === proj.id ? { ...p, title: val } : p),
                              }));
                            }}
                            placeholder="e.g. AI-Powered Medical Diagnosis"
                          />
                          <Input
                            label="Tech Stack (shown on italic line)"
                            value={proj.technologies.join(', ')}
                            onChange={e => {
                              const val = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                              setResumeData(prev => ({
                                ...prev,
                                projects: prev.projects.map(p => p.id === proj.id ? { ...p, technologies: val } : p),
                              }));
                            }}
                            placeholder="React, Node.js, PostgreSQL"
                          />
                        </div>

                        <Textarea
                          label="Key Highlights (2 bullets max, one per line)"
                          rows={2}
                          value={proj.description}
                          onChange={e => {
                            const val = e.target.value;
                            setResumeData(prev => ({
                              ...prev,
                              projects: prev.projects.map(p => p.id === proj.id ? { ...p, description: val } : p),
                            }));
                          }}
                          placeholder="• Engineered full-stack feature set with sub-50ms latency.\n• Deployed automated CI/CD pipeline serving 500+ users."
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <Input
                            label="Live URL (renders as 'Live' link)"
                            value={proj.liveUrl || ''}
                            onChange={e => {
                              const val = e.target.value;
                              setResumeData(prev => ({
                                ...prev,
                                projects: prev.projects.map(p => p.id === proj.id ? { ...p, liveUrl: val } : p),
                              }));
                            }}
                            placeholder="https://myproject.vercel.app"
                          />
                          <Input
                            label="GitHub URL (renders as 'GitHub' link)"
                            value={proj.githubUrl || ''}
                            onChange={e => {
                              const val = e.target.value;
                              setResumeData(prev => ({
                                ...prev,
                                projects: prev.projects.map(p => p.id === proj.id ? { ...p, githubUrl: val } : p),
                              }));
                            }}
                            placeholder="https://github.com/user/repo"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 6: Experience / Internships */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <div className="border-b border-[#202026] pb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-[#F3F4F6]">6. Experience & Internships</h2>
                    <p className="text-xs text-[#8E8E9A]">Previous roles, freelance projects, teaching assistantships, or research work.</p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newExp: ResumeExperience = {
                        id: `exp-${Date.now()}`,
                        company: 'Company / Lab',
                        role: 'Software Intern',
                        duration: 'Summer 2025',
                        description: '• Implemented core features and resolved high-priority tickets.\n• Collaborated on team retrospectives and design reviews.',
                      };
                      setResumeData(prev => ({
                        ...prev,
                        experience: [...prev.experience, newExp],
                      }));
                    }}
                    className="text-xs gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Role
                  </Button>
                </div>

                <div className="space-y-4">
                  {resumeData.experience.map((exp, idx) => (
                    <div key={exp.id} className="p-4 bg-[#18181D] rounded-lg border border-[#202026] space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-[#F3F4F6]">Role #{idx + 1}</span>
                        <button
                          onClick={() => {
                            setResumeData(prev => ({
                              ...prev,
                              experience: prev.experience.filter(e => e.id !== exp.id),
                            }));
                          }}
                          className="text-[#FF2D95] hover:underline flex items-center gap-1 text-[11px]"
                        >
                          <Trash2 className="w-3 h-3" /> Remove
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Input
                          label="Job Role / Title *"
                          value={exp.role}
                          onChange={e => {
                            const val = e.target.value;
                            setResumeData(prev => ({
                              ...prev,
                              experience: prev.experience.map(item => item.id === exp.id ? { ...item, role: val } : item),
                            }));
                          }}
                          placeholder="e.g. Frontend Engineering Intern"
                        />
                        <Input
                          label="Company / Organization *"
                          value={exp.company}
                          onChange={e => {
                            const val = e.target.value;
                            setResumeData(prev => ({
                              ...prev,
                              experience: prev.experience.map(item => item.id === exp.id ? { ...item, company: val } : item),
                            }));
                          }}
                          placeholder="e.g. Acme Tech"
                        />
                        <Input
                          label="Duration / Dates *"
                          value={exp.duration}
                          onChange={e => {
                            const val = e.target.value;
                            setResumeData(prev => ({
                              ...prev,
                              experience: prev.experience.map(item => item.id === exp.id ? { ...item, duration: val } : item),
                            }));
                          }}
                          placeholder="e.g. May 2025 – Aug 2025"
                        />
                      </div>

                      <Textarea
                        label="What you did (use bullet points with • or -)"
                        rows={3}
                        value={exp.description}
                        onChange={e => {
                          const val = e.target.value;
                          setResumeData(prev => ({
                            ...prev,
                            experience: prev.experience.map(item => item.id === exp.id ? { ...item, description: val } : item),
                          }));
                        }}
                        placeholder="• Built and optimized backend queries...\n• Authored user documentation..."
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 7: Certifications */}
            {currentStep === 7 && (
              <div className="space-y-6">
                <div className="border-b border-[#202026] pb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-[#F3F4F6]">7. Certifications & Courses</h2>
                    <p className="text-xs text-[#8E8E9A]">Credentials, online specializations (Coursera, AWS, Google, Meta).</p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newCert: ResumeCertification = {
                        id: `cert-${Date.now()}`,
                        name: 'Meta Front-End Developer Professional Certificate',
                        issuer: 'Meta & Coursera',
                        year: '2025',
                      };
                      setResumeData(prev => ({
                        ...prev,
                        certifications: [...prev.certifications, newCert],
                      }));
                    }}
                    className="text-xs gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Certificate
                  </Button>
                </div>

                <div className="space-y-3">
                  {resumeData.certifications.map((cert, idx) => (
                    <div key={cert.id} className="p-3 bg-[#18181D] rounded-lg border border-[#202026] space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-[#F3F4F6]">Certification #{idx + 1}</span>
                        <button
                          onClick={() => {
                            setResumeData(prev => ({
                              ...prev,
                              certifications: prev.certifications.filter(c => c.id !== cert.id),
                            }));
                          }}
                          className="text-[#FF2D95] hover:underline flex items-center gap-1 text-[11px]"
                        >
                          <Trash2 className="w-3 h-3" /> Remove
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <Input
                          label="Certificate Name"
                          value={cert.name}
                          onChange={e => {
                            const val = e.target.value;
                            setResumeData(prev => ({
                              ...prev,
                              certifications: prev.certifications.map(c => c.id === cert.id ? { ...c, name: val } : c),
                            }));
                          }}
                          placeholder="e.g. AWS Certified Developer"
                        />
                        <Input
                          label="Issuing Organization"
                          value={cert.issuer}
                          onChange={e => {
                            const val = e.target.value;
                            setResumeData(prev => ({
                              ...prev,
                              certifications: prev.certifications.map(c => c.id === cert.id ? { ...c, issuer: val } : c),
                            }));
                          }}
                          placeholder="e.g. Amazon Web Services"
                        />
                        <Input
                          label="Year"
                          value={cert.year}
                          onChange={e => {
                            const val = e.target.value;
                            setResumeData(prev => ({
                              ...prev,
                              certifications: prev.certifications.map(c => c.id === cert.id ? { ...c, year: val } : c),
                            }));
                          }}
                          placeholder="2025"
                        />
                        <Input
                          label="Certificate URL (optional)"
                          value={cert.certificateLink || ''}
                          onChange={e => {
                            const val = e.target.value;
                            setResumeData(prev => ({
                              ...prev,
                              certifications: prev.certifications.map(c => c.id === cert.id ? { ...c, certificateLink: val } : c),
                            }));
                          }}
                          placeholder="https://aws.amazon.com/verification"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 8: Achievements */}
            {currentStep === 8 && (
              <div className="space-y-6">
                <div className="border-b border-[#202026] pb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-[#F3F4F6]">8. Achievements & Awards</h2>
                    <p className="text-xs text-[#8E8E9A]">Hackathon placements, scholarships, algorithmic competitions, or dean's list recognition.</p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newAch: ResumeAchievement = {
                        id: `ach-${Date.now()}`,
                        title: 'Hackathon Finalist',
                        organization: 'University Hackathon',
                        year: '2025',
                        description: 'Top 10 finish among 80 teams.',
                      };
                      setResumeData(prev => ({
                        ...prev,
                        achievements: [...prev.achievements, newAch],
                      }));
                    }}
                    className="text-xs gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Award
                  </Button>
                </div>

                <div className="space-y-3">
                  {resumeData.achievements.map((ach, idx) => (
                    <div key={ach.id} className="p-3 bg-[#18181D] rounded-lg border border-[#202026] space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-[#F3F4F6]">Award #{idx + 1}</span>
                        <button
                          onClick={() => {
                            setResumeData(prev => ({
                              ...prev,
                              achievements: prev.achievements.filter(a => a.id !== ach.id),
                            }));
                          }}
                          className="text-[#FF2D95] hover:underline flex items-center gap-1 text-[11px]"
                        >
                          <Trash2 className="w-3 h-3" /> Remove
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Input
                          label="Award / Competition Name"
                          value={ach.title}
                          onChange={e => {
                            const val = e.target.value;
                            setResumeData(prev => ({
                              ...prev,
                              achievements: prev.achievements.map(a => a.id === ach.id ? { ...a, title: val } : a),
                            }));
                          }}
                          placeholder="e.g. 1st Place - DevHacks"
                        />
                        <Input
                          label="Host Organization / Event"
                          value={ach.organization}
                          onChange={e => {
                            const val = e.target.value;
                            setResumeData(prev => ({
                              ...prev,
                              achievements: prev.achievements.map(a => a.id === ach.id ? { ...a, organization: val } : a),
                            }));
                          }}
                          placeholder="e.g. IEEE Chapter"
                        />
                        <Input
                          label="Year"
                          value={ach.year}
                          onChange={e => {
                            const val = e.target.value;
                            setResumeData(prev => ({
                              ...prev,
                              achievements: prev.achievements.map(a => a.id === ach.id ? { ...a, year: val } : a),
                            }));
                          }}
                          placeholder="2025"
                        />
                      </div>
                      <Input
                        label="Description (optional)"
                        value={ach.description || ''}
                        onChange={e => {
                          const val = e.target.value;
                          setResumeData(prev => ({
                            ...prev,
                            achievements: prev.achievements.map(a => a.id === ach.id ? { ...a, description: val } : a),
                          }));
                        }}
                        placeholder="e.g. Built a real-time smart IoT assistant in 24 hours."
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 9: Additional Information */}
            {currentStep === 9 && (
              <div className="space-y-5">
                <div className="border-b border-[#202026] pb-3">
                  <h2 className="text-base font-bold text-[#F3F4F6]">9. Additional Information</h2>
                  <p className="text-xs text-[#8E8E9A]">Volunteering, leadership, extracurricular activities, hobbies, and references.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Volunteering & Community"
                    value={resumeData.extra.volunteering || ''}
                    onChange={e => setResumeData(prev => ({ ...prev, extra: { ...prev.extra, volunteering: e.target.value } }))}
                    placeholder="e.g. Open-Source Mentor at College Coding Club"
                  />
                  <Input
                    label="Extracurriculars & Leadership"
                    value={resumeData.extra.extracurriculars || ''}
                    onChange={e => setResumeData(prev => ({ ...prev, extra: { ...prev.extra, extracurriculars: e.target.value } }))}
                    placeholder="e.g. Lead Organizer, Annual TechFest"
                  />
                  <Input
                    label="Hobbies & Interests"
                    value={resumeData.extra.hobbies || ''}
                    onChange={e => setResumeData(prev => ({ ...prev, extra: { ...prev.extra, hobbies: e.target.value } }))}
                    placeholder="e.g. Competitive Programming, Chess, Blogging"
                  />
                  <Input
                    label="References"
                    value={resumeData.extra.references || ''}
                    onChange={e => setResumeData(prev => ({ ...prev, extra: { ...prev.extra, references: e.target.value } }))}
                    placeholder="e.g. Available upon request"
                  />
                </div>
              </div>
            )}

            {/* Step 10: Template & PDF */}
            {currentStep === 10 && (
              <div className="space-y-6">
                <div className="border-b border-[#202026] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="text-base font-bold text-[#F3F4F6]">10. Template, Styling & PDF Export</h2>
                    <p className="text-xs text-[#8E8E9A]">Customize layout template, font family, accent color, spacing, and section order.</p>
                  </div>
                </div>

                <TemplatePicker
                  formatting={resumeData.formatting}
                  onChange={newFormatting => setResumeData(prev => ({ ...prev, formatting: newFormatting }))}
                />
              </div>
            )}

            {/* Print Hint & Lower Navigation Bar */}
            <div className="pt-4 border-t border-[#202026] space-y-3">
              <div className="bg-[#18181D] border border-[#00A3E0]/30 rounded-lg px-3.5 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-gray-200">
                <span className="text-[11px] text-gray-300">
                  <strong className="text-[#00A3E0]">PDF Export Tip:</strong> Choose Save as PDF, Margins: None, turn on Background graphics, turn off Headers and footers.
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevStep}
                    disabled={currentStep === 1}
                    className="gap-1.5 text-xs"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous Step
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResetToDefault}
                    className="text-xs text-[#8E8E9A] hover:text-[#FF2D95]"
                  >
                    Reset Form
                  </Button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {currentStep < STEPS.length && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleNextStep}
                      className="gap-1.5 text-xs font-semibold"
                    >
                      <span>Next: {STEPS[currentStep].title}</span>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  )}

                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleDownloadPDF}
                    className="gap-2 text-xs bg-[#00A3E0] hover:bg-[#008fca] text-black font-extrabold px-5 py-2.5 shadow-lg cursor-pointer"
                    title="Choose Save as PDF, Margins: None, turn on Background graphics, turn off Headers and footers."
                  >
                    <Download className="w-4 h-4 text-black" />
                    <span>Download PDF</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Preview Panel (5 cols) - Fixed A4 Dimensions & Fit to one page toggle */}
        <div className={showLivePreview ? 'lg:col-span-5 space-y-3 sticky top-20' : 'hidden'}>
          <div className="flex items-center justify-between bg-[#121215] border border-[#202026] px-3.5 py-2 rounded-lg text-xs print:hidden">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#F3F4F6] flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[#00A3E0]" />
                A4 Preview
              </span>
              <span className="text-[10px] bg-gray-800 text-gray-300 px-2 py-0.5 rounded font-mono font-semibold">
                Page {currentPage} of {totalPages}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Fit to one page toggle */}
              <button
                onClick={handleFitToOnePage}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1.5 border transition-colors cursor-pointer ${
                  resumeData.formatting.fitToOnePage
                    ? 'bg-[#00A3E0]/20 text-[#00A3E0] border-[#00A3E0]/40 shadow-sm'
                    : 'bg-[#18181D] text-gray-300 border-[#202026] hover:text-white hover:border-gray-700'
                }`}
                title="Adjust margins (15mm) and typography to fit onto a single A4 page"
              >
                <Maximize2 className="w-3 h-3" />
                <span>Fit to one page {resumeData.formatting.fitToOnePage ? '✓' : ''}</span>
              </button>

              <div className="flex items-center gap-0.5 border-l border-gray-800 pl-1.5">
                <button
                  onClick={() => setPreviewScale(p => Math.max(0.5, parseFloat((p - 0.05).toFixed(2))))}
                  className="p-1 text-[#8E8E9A] hover:text-[#F3F4F6] rounded hover:bg-[#18181D]"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] text-[#8E8E9A] font-mono px-1">
                  {Math.round(previewScale * 100)}%
                </span>
                <button
                  onClick={() => setPreviewScale(p => Math.min(1.2, parseFloat((p + 0.05).toFixed(2))))}
                  className="p-1 text-[#8E8E9A] hover:text-[#F3F4F6] rounded hover:bg-[#18181D]"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Scrollable Container with White A4 Canvas */}
          <div
            ref={previewScrollRef}
            onScroll={handlePreviewScroll}
            className="bg-[#18181D] border border-[#202026] rounded-xl p-3 sm:p-4 max-h-[820px] overflow-y-auto overflow-x-hidden shadow-inner flex justify-center"
          >
            <div className="w-full max-w-[800px]">
              <ResumePreview
                data={resumeData}
                scale={previewScale}
                isWatermarkRequired={false}
                onPageCountChange={pages => setTotalPages(pages)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* AISuggestModal */}
      <AISuggestModal
        isOpen={showAISuggestModal}
        onClose={() => setShowAISuggestModal(false)}
        initialRole={resumeData.education.higherEducation[0]?.fieldOfStudy || 'Software Engineer'}
        initialDegree={resumeData.education.higherEducation[0]?.degree || 'Computer Science'}
        initialCollege={resumeData.education.higherEducation[0]?.institution || 'University'}
        technicalSkills={resumeData.skills.technical}
        onSelect={chosenObjective => {
          setResumeData(prev => ({ ...prev, objective: chosenObjective }));
          showToast('Objective applied', 'Added to your career summary.');
        }}
      />

      {/* AutoImportModal for SkillBridge Projects */}
      <AutoImportModal
        isOpen={showAutoImportModal}
        onClose={() => setShowAutoImportModal(false)}
        onImport={importedProjects => {
          setResumeData(prev => ({
            ...prev,
            projects: [...prev.projects, ...importedProjects],
          }));
          showToast('Projects imported', `${importedProjects.length} projects imported from SkillBridge.`);
        }}
      />

      {/* SendResumeModal */}
      <SendResumeModal
        isOpen={showSendModal}
        onClose={() => setShowSendModal(false)}
        resumeData={resumeData}
      />

      {/* ATSKeywordMatchModal */}
      <ATSKeywordMatchModal
        isOpen={showATSModal}
        onClose={() => setShowATSModal(false)}
        resumeData={resumeData}
      />

      {/* DownloadResumeModal */}
      <DownloadResumeModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        resumeData={resumeData}
      />
    </div>
  );
};

