import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Project, Job, Profile } from '../types';
import { DataService } from '../services/store';
import { ProjectCard } from '../components/projects/ProjectCard';
import { JobCard } from '../components/jobs/JobCard';
import { StudentCard } from '../components/students/StudentCard';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { CreateAccountModal } from '../components/auth/CreateAccountModal';
import {
  ArrowRight,
  Code2,
  Cpu,
  Palette,
  Smartphone,
  BarChart3,
  Gamepad2,
  Search,
  ArrowUpRight,
  Instagram,
  Play,
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  Sparkles,
  ExternalLink,
  Volume2,
  VolumeX,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [topStudents, setTopStudents] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);
  const [activeReelIndex, setActiveReelIndex] = useState(0);
  const [isReelMuted, setIsReelMuted] = useState(true);
  const [likedReels, setLikedReels] = useState<Record<number, boolean>>({ 0: true });

  const instagramReels = [
    {
      id: 0,
      title: 'How SkillBridge Works — Full Platform Tour & Student Builds',
      caption: 'Everything you need to know about SkillBridge! Watch how university builders publish verified projects, build ATS resumes, and land direct freelance contracts. Follow @cinecritiq for all website updates & guides! 🚀 #SkillBridge #cinecritiq #StudentBuilders',
      views: '24.8K',
      likes: 1842,
      comments: 164,
      duration: '0:45',
      tag: 'Platform Guide',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-screen-close-up-1728-large.mp4',
      posterUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=900&q=80',
    },
    {
      id: 1,
      title: 'Top Collegiate Engineering Builds & Resume Tips',
      caption: 'Inside look at verified student engineering portfolios and how to export your ATS-ready resume in one click. Drop a follow on @cinecritiq for more updates and information related to SkillBridge! 💻✨',
      views: '18.3K',
      likes: 1290,
      comments: 98,
      duration: '0:38',
      tag: 'Skill Builds',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-man-working-on-a-computer-4984-large.mp4',
      posterUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=900&q=80',
    },
    {
      id: 2,
      title: 'Direct Client-to-Student Contracts — Zero Platform Cut',
      caption: 'How founders and engineering leads hire top university talent directly on SkillBridge. Stay connected on @cinecritiq for announcements, feature drops & behind-the-scenes reels! 🔥',
      views: '31.2K',
      likes: 2410,
      comments: 215,
      duration: '0:52',
      tag: 'Website Info',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-working-on-her-laptop-at-home-4978-large.mp4',
      posterUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=80',
    },
  ];

  const activeReel = instagramReels[activeReelIndex];

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [projects, jobs, profiles] = await Promise.all([
          DataService.getProjects({ sort: 'most_liked', currentUserId: user?.id }),
          DataService.getJobs({ currentUserId: user?.id }),
          DataService.getProfiles(),
        ]);
        setFeaturedProjects(projects.slice(0, 3));
        setRecentJobs(jobs.slice(0, 3));
        setTopStudents(profiles.slice(0, 3));
      } catch (err) {
        console.error('Error loading home data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, [user?.id]);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (searchCategory) params.set('category', searchCategory);
    navigate(`/projects?${params.toString()}`);
  };

  const categories = [
    {
      name: 'Web Development',
      icon: <Code2 className="w-4 h-4 text-[#00A3E0]" />,
      count: '45 projects',
      avgRate: '$35 - $60/hr',
      tools: 'React · Next.js · TypeScript · Node',
    },
    {
      name: 'AI & Machine Learning',
      icon: <Cpu className="w-4 h-4 text-[#FF2D95]" />,
      count: '32 projects',
      avgRate: '$45 - $75/hr',
      tools: 'PyTorch · LangChain · Python · LLMs',
    },
    {
      name: 'UI/UX Design',
      icon: <Palette className="w-4 h-4 text-[#FF2D95]" />,
      count: '28 projects',
      avgRate: '$30 - $55/hr',
      tools: 'Figma · Design Systems · UX Research',
    },
    {
      name: 'Mobile Apps',
      icon: <Smartphone className="w-4 h-4 text-[#00A3E0]" />,
      count: '21 projects',
      avgRate: '$35 - $65/hr',
      tools: 'React Native · Flutter · Swift · iOS',
    },
    {
      name: 'Data Science',
      icon: <BarChart3 className="w-4 h-4 text-[#00A3E0]" />,
      count: '19 projects',
      avgRate: '$40 - $70/hr',
      tools: 'SQL · Pandas · Visualization · Modeling',
    },
    {
      name: 'Game Development',
      icon: <Gamepad2 className="w-4 h-4 text-[#FF2D95]" />,
      count: '14 projects',
      avgRate: '$35 - $60/hr',
      tools: 'Unity · Godot · Three.js · C#',
    },
  ];

  const testimonials = [
    {
      quote:
        'We hired a UC Berkeley computer science junior to build our startup’s MVP landing page and auth flow. The code quality matched a senior contractor without agency overhead.',
      author: 'David Zhang',
      role: 'Founder, Synapse AI (YC W25)',
      student: 'Alex Chen · UC Berkeley',
      metric: '$2,400 contract delivered',
    },
    {
      quote:
        'SkillBridge allowed me to turn a class machine learning project into a $1,200 contract with a healthcare lab while taking 16 units at Stanford.',
      author: 'Priya Sharma',
      role: 'Student Freelancer',
      student: 'Stanford University ‘26',
      metric: '5 projects shipped',
    },
    {
      quote:
        'Finding trustworthy student designers used to mean posting in random campus Discord channels. Here, every portfolio has verifiable GitHub links and live demos.',
      author: 'Elena Rostova',
      role: 'Product Lead, CampusVentures',
      student: 'Marcus Vance · UI/UX',
      metric: '3 hires made',
    },
  ];

  return (
    <div className="space-y-24 pb-24 bg-[#0A0A0A] text-[#F3F4F6]">
      {/* 1. MINIMALIST HERO SECTION */}
      <section className="pt-12 sm:pt-20 border-b border-[#202026] pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-6">
            <span className="text-xs font-semibold text-[#00A3E0] uppercase tracking-wider block">
              University Freelance & Project Index
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#F3F4F6] leading-[1.08]">
              Where university builders ship real-world software.
            </h1>

            <p className="text-base sm:text-lg text-[#8E8E9A] leading-relaxed">
              Discover verified student developers, designers, and AI creators. Explore production projects, hire collegiate talent, and contract with zero platform fee.
            </p>

            {/* Minimalist Search Bar */}
            <form
              onSubmit={handleHeroSearch}
              className="bg-[#121215] border border-[#202026] focus-within:border-[#FF2D95] rounded-xl p-1.5 flex flex-col sm:flex-row items-center gap-2 max-w-2xl transition-colors"
            >
              <div className="flex-1 flex items-center gap-2.5 px-3 py-2 w-full">
                <Search className="w-4 h-4 text-[#8E8E9A] shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search projects, skills, or gigs (e.g., React, PyTorch, Figma)..."
                  className="w-full text-xs sm:text-sm text-[#F3F4F6] placeholder-[#8E8E9A] focus:outline-hidden bg-transparent"
                />
              </div>

              <div className="hidden sm:block h-6 w-px bg-[#202026]" />

              <div className="w-full sm:w-auto flex items-center gap-2">
                <select
                  value={searchCategory}
                  onChange={e => setSearchCategory(e.target.value)}
                  className="text-xs text-[#8E8E9A] bg-[#18181D] rounded-lg px-3 py-2 border border-[#26262F] focus:outline-hidden cursor-pointer"
                >
                  <option value="">All Disciplines</option>
                  <option value="Web Development">Web Development</option>
                  <option value="AI & Machine Learning">AI & Machine Learning</option>
                  <option value="UI/UX Design">UI/UX Design</option>
                  <option value="Mobile Apps">Mobile Apps</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Game Development">Game Development</option>
                </select>

                <Button type="submit" variant="primary" size="md">
                  Search
                </Button>
              </div>
            </form>

            {/* Quiet Quick Tags */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#8E8E9A] pt-1">
              <span>Popular:</span>
              {['Next.js', 'PyTorch', 'Figma', 'TypeScript', 'Flutter'].map(tool => (
                <button
                  key={tool}
                  type="button"
                  onClick={() => {
                    setSearchQuery(tool);
                    navigate(`/projects?q=${encodeURIComponent(tool)}`);
                  }}
                  className="text-[#8E8E9A] hover:text-[#00A3E0] transition-colors cursor-pointer"
                >
                  {tool}
                </button>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3 pt-2">
              <Link to="/projects">
                <Button variant="primary" size="md">
                  Explore Projects
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
              <Link to="/jobs">
                <Button variant="secondary" size="md">
                  Browse Freelance Jobs
                </Button>
              </Link>
            </div>
          </div>

          {/* 4 Core Quantitative Metrics (Below hero split) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-16 mt-12 border-t border-[#202026]">
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-[#F3F4F6] font-mono tabular-nums tracking-tight">
                $185,000+
              </p>
              <p className="text-xs text-[#8E8E9A] mt-0.5">Paid to student freelancers</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-[#F3F4F6] font-mono tabular-nums tracking-tight">
                1,450+
              </p>
              <p className="text-xs text-[#8E8E9A] mt-0.5">Verified university creators</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-[#F3F4F6] font-mono tabular-nums tracking-tight">
                850+
              </p>
              <p className="text-xs text-[#8E8E9A] mt-0.5">Production repos & demos</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-[#FF2D95] font-mono tabular-nums tracking-tight">
                0% Fee
              </p>
              <p className="text-xs text-[#8E8E9A] mt-0.5">Students keep 100% earnings</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CURATED DISCIPLINES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs text-[#8E8E9A] font-mono uppercase tracking-wider block mb-1">01</span>
            <h2 className="text-xl sm:text-2xl font-bold text-[#F3F4F6] tracking-tight">
              Curated Disciplines
            </h2>
            <p className="text-xs sm:text-sm text-[#8E8E9A] mt-1">
              Collegiate talent specialized in modern software stacks and design systems.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(cat => (
            <Link
              key={cat.name}
              to={`/projects?category=${encodeURIComponent(cat.name)}`}
              className="bg-[#121215] border border-[#202026] hover:border-[#33333D] p-5 rounded-xl flex flex-col justify-between group transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-lg bg-[#18181D] border border-[#26262F] flex items-center justify-center">
                    {cat.icon}
                  </div>
                  <span className="text-xs font-mono tabular-nums text-[#00A3E0]">
                    {cat.avgRate}
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-[#F3F4F6] group-hover:text-white transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-[#8E8E9A] mt-0.5">{cat.count}</p>
                <p className="text-xs text-[#8E8E9A] mt-3 font-mono text-[11px] leading-relaxed">
                  {cat.tools}
                </p>
              </div>

              <div className="pt-3 mt-4 border-t border-[#202026] flex items-center justify-between text-xs text-[#8E8E9A] group-hover:text-[#F3F4F6] transition-colors">
                <span>View directory</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. FEATURED STUDENT PROJECTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs text-[#737D95] font-mono uppercase tracking-wider block mb-1">02</span>
            <h2 className="text-xl sm:text-2xl font-bold text-[#F1F3FA] tracking-tight">
              Selected Student Projects
            </h2>
            <p className="text-xs sm:text-sm text-[#A0A8BD] mt-1">
              Production apps, open-source repositories, and machine learning research.
            </p>
          </div>

          <Link to="/projects">
            <Button variant="outline" size="sm" className="gap-1 text-xs">
              View All
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-72 bg-[#121215] border border-[#202026] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredProjects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </section>

      {/* 4. RECENT FREELANCE OPPORTUNITIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs text-[#8E8E9A] font-mono uppercase tracking-wider block mb-1">03</span>
            <h2 className="text-xl sm:text-2xl font-bold text-[#F3F4F6] tracking-tight">
              Open Freelance Contracts
            </h2>
            <p className="text-xs sm:text-sm text-[#8E8E9A] mt-1">
              Milestone contracts calibrated for university academic calendars.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/jobs/new">
              <Button size="sm" variant="outline">
                Post Job
              </Button>
            </Link>
            <Link to="/jobs">
              <Button variant="secondary" size="sm">
                View All
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recentJobs.map(job => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </section>

      {/* 5. STUDENT FREELANCERS SPOTLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs text-[#8E8E9A] font-mono uppercase tracking-wider block mb-1">04</span>
            <h2 className="text-xl sm:text-2xl font-bold text-[#F3F4F6] tracking-tight">
              Collegiate Talent Spotlight
            </h2>
            <p className="text-xs sm:text-sm text-[#8E8E9A] mt-1">
              Top-rated campus creators available for contract engagements and MVP builds.
            </p>
          </div>

          <Link to="/students">
            <Button variant="outline" size="sm" className="gap-1 text-xs">
              View Directory
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topStudents.map(student => (
            <StudentCard
              key={student.id}
              student={student}
              projectCount={student.id === 'demo-user-1' ? 2 : 1}
            />
          ))}
        </div>
      </section>

      {/* 6. VERIFIED REVIEWS & RESULTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-[#202026] pt-16">
        <div className="mb-10">
          <span className="text-xs text-[#8E8E9A] font-mono uppercase tracking-wider block mb-1">05</span>
          <h2 className="text-xl sm:text-2xl font-bold text-[#F3F4F6] tracking-tight">
            Verified Outcomes
          </h2>
          <p className="text-xs sm:text-sm text-[#8E8E9A] mt-1">
            Real reviews from early-stage founders and collegiate contractors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="bg-[#121215] border border-[#202026] p-6 rounded-xl flex flex-col justify-between space-y-4"
            >
              <p className="text-xs sm:text-sm text-[#8E8E9A] leading-relaxed">
                "{t.quote}"
              </p>

              <div className="pt-4 border-t border-[#202026]">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-[#F3F4F6]">{t.author}</h4>
                    <p className="text-[11px] text-[#8E8E9A]">{t.role}</p>
                    <p className="text-[11px] text-[#00A3E0] mt-0.5">{t.student}</p>
                  </div>
                  <span className="text-[11px] font-mono tabular-nums text-[#00A3E0]">
                    {t.metric}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. CLEAN CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#121215] border border-[#202026] rounded-xl p-8 sm:p-12 text-center">
          <div className="max-w-xl mx-auto space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#F3F4F6] tracking-tight">
              Start building with university talent.
            </h2>
            <p className="text-xs sm:text-sm text-[#8E8E9A] leading-relaxed">
              Publish projects to your verified collegiate portfolio or post a contract for university students.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setShowCreateAccountModal(true)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-[#FF2D95] hover:bg-[#E61980] text-white text-xs sm:text-sm font-medium transition-colors cursor-pointer"
              >
                {user ? '+ Create Another Profile' : 'Create Free Account'}
              </button>
              <Link to="/projects">
                <Button variant="outline" size="md" className="w-full sm:w-auto">
                  Browse All Projects
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 8. OFFICIAL INSTAGRAM REELS & INFORMATION HUB (@cinecritiq) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[#202026] pb-4">
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-[#FF2D95] uppercase tracking-wider flex items-center gap-1.5">
              <Instagram className="w-3.5 h-3.5" />
              06 — Official Instagram & Skill Builds Reels
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-[#F3F4F6]">
              Want Information & Updates About SkillBridge? Follow @cinecritiq
            </h2>
          </div>
          <a
            href="https://www.instagram.com/cinecritiq/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-[#8E8E9A] hover:text-[#FF2D95] flex items-center gap-1.5 transition-colors"
          >
            <span>instagram.com/cinecritiq</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="bg-[#121215] border border-[#202026] rounded-2xl p-5 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left / Center: Interactive Vertical 9:16 Instagram Reel Player */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="relative w-full max-w-[320px] aspect-[9/16] rounded-2xl overflow-hidden border border-[#2A2A35] bg-[#0A0A0A] shadow-2xl group">
                {/* Video Stream */}
                <video
                  key={activeReel.videoUrl}
                  src={activeReel.videoUrl}
                  poster={activeReel.posterUrl}
                  autoPlay
                  loop
                  muted={isReelMuted}
                  playsInline
                  className="w-full h-full object-cover"
                />

                {/* Subtle Top & Bottom Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/90 pointer-events-none" />

                {/* Top Reel Header Bar */}
                <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-10">
                  <a
                    href="https://www.instagram.com/cinecritiq/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 group/profile"
                  >
                    <div className="w-8 h-8 rounded-full p-[1.5px] bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF]">
                      <div className="w-full h-full rounded-full bg-[#121215] flex items-center justify-center">
                        <Instagram className="w-4 h-4 text-[#FF2D95]" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-white group-hover/profile:text-[#FF2D95] transition-colors">
                          cinecritiq
                        </span>
                        <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-[#00A3E0] text-[9px] font-bold text-black">
                          ✓
                        </span>
                      </div>
                      <span className="block text-[10px] text-white/75">
                        Official SkillBridge Reels
                      </span>
                    </div>
                  </a>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIsReelMuted(prev => !prev)}
                      aria-label={isReelMuted ? 'Unmute reel' : 'Mute reel'}
                      className="w-7 h-7 rounded-full bg-black/60 border border-white/15 text-white flex items-center justify-center hover:bg-black/80 transition-colors cursor-pointer"
                    >
                      {isReelMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    </button>
                    <a
                      href="https://www.instagram.com/cinecritiq/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-md bg-[#FF2D95] hover:bg-[#E61980] text-white text-[10px] font-semibold transition-colors"
                    >
                      Follow
                    </a>
                  </div>
                </div>

                {/* Right-side Instagram Reel Action Rail */}
                <div className="absolute right-3 bottom-24 flex flex-col items-center gap-4 z-10">
                  <button
                    type="button"
                    onClick={() =>
                      setLikedReels(prev => ({
                        ...prev,
                        [activeReel.id]: !prev[activeReel.id],
                      }))
                    }
                    className="flex flex-col items-center gap-1 text-white cursor-pointer group/like"
                  >
                    <div className="w-9 h-9 rounded-full bg-black/50 border border-white/15 flex items-center justify-center group-hover/like:scale-110 transition-transform">
                      <Heart
                        className={`w-4 h-4 ${
                          likedReels[activeReel.id]
                            ? 'text-[#FF2D95] fill-[#FF2D95]'
                            : 'text-white'
                        }`}
                      />
                    </div>
                    <span className="text-[10px] font-mono">
                      {activeReel.likes + (likedReels[activeReel.id] ? 1 : 0)}
                    </span>
                  </button>

                  <a
                    href="https://www.instagram.com/cinecritiq/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-1 text-white hover:text-[#00A3E0] transition-colors"
                  >
                    <div className="w-9 h-9 rounded-full bg-black/50 border border-white/15 flex items-center justify-center">
                      <MessageCircle className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono">{activeReel.comments}</span>
                  </a>

                  <a
                    href="https://www.instagram.com/cinecritiq/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-1 text-white hover:text-[#FF2D95] transition-colors"
                  >
                    <div className="w-9 h-9 rounded-full bg-black/50 border border-white/15 flex items-center justify-center">
                      <Send className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono">Share</span>
                  </a>

                  <a
                    href="https://www.instagram.com/cinecritiq/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-1 text-white hover:text-[#00A3E0] transition-colors"
                  >
                    <div className="w-9 h-9 rounded-full bg-black/50 border border-white/15 flex items-center justify-center">
                      <Bookmark className="w-4 h-4" />
                    </div>
                  </a>
                </div>

                {/* Bottom Reel Details & Caption */}
                <div className="absolute bottom-3.5 left-3.5 right-14 z-10 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-[#FF2D95]/90 text-white text-[10px] font-semibold uppercase tracking-wider">
                      {activeReel.tag}
                    </span>
                    <span className="text-[10px] font-mono text-white/80 flex items-center gap-1">
                      <Play className="w-2.5 h-2.5 fill-white" /> {activeReel.views} views
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-white leading-snug">
                    {activeReel.title}
                  </p>
                  <p className="text-[11px] text-white/80 line-clamp-2 leading-relaxed">
                    {activeReel.caption}
                  </p>
                </div>
              </div>

              {/* Reel Selector Tabs */}
              <div className="flex items-center gap-2 mt-4">
                {instagramReels.map((reel, index) => (
                  <button
                    key={reel.id}
                    type="button"
                    onClick={() => setActiveReelIndex(index)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer border ${
                      activeReelIndex === index
                        ? 'bg-[#18181D] text-[#FF2D95] border-[#FF2D95]'
                        : 'bg-[#0A0A0A] text-[#8E8E9A] border-[#202026] hover:text-[#F3F4F6]'
                    }`}
                  >
                    Reel 0{index + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Official Instagram Information & Follow Hub */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#18181D] border border-[#202026] text-xs text-[#FF2D95] font-mono">
                <Sparkles className="w-3.5 h-3.5" />
                <span>OFFICIAL WEBSITE INFORMATION & SKILL BUILDS HUB</span>
              </div>

              <div className="space-y-3">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#F3F4F6] tracking-tight leading-tight">
                  Looking for anything related to this website? Find it all on{' '}
                  <a
                    href="https://www.instagram.com/cinecritiq/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF2D95] to-[#00A3E0] hover:underline"
                  >
                    @cinecritiq
                  </a>
                </h3>
                <p className="text-xs sm:text-sm text-[#8E8E9A] leading-relaxed">
                  Whether you want platform tutorials, student project spotlights, resume builder tips, hiring announcements, or any information related to SkillBridge — we post our latest Reels and updates on our official Instagram account. Anyone who wants to stay connected can follow!
                </p>
              </div>

              {/* Instagram Profile Card */}
              <div className="bg-[#18181D] border border-[#202026] rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] shrink-0">
                    <div className="w-full h-full rounded-full bg-[#121215] flex items-center justify-center">
                      <Instagram className="w-6 h-6 text-[#FF2D95]" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-[#F3F4F6]">@cinecritiq</span>
                      <span className="px-2 py-0.5 text-[10px] font-mono uppercase bg-[#00A3E0]/15 text-[#00A3E0] border border-[#00A3E0]/30 rounded">
                        Official Hub
                      </span>
                    </div>
                    <p className="text-xs text-[#8E8E9A]">
                      SkillBridge Updates · Student Skill Builds · Reels & Website Announcements
                    </p>
                    <p className="text-[11px] font-mono text-[#00A3E0]">
                      https://www.instagram.com/cinecritiq/
                    </p>
                  </div>
                </div>

                <a
                  href="https://www.instagram.com/cinecritiq/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#FF2D95] to-[#DD2A7B] hover:opacity-95 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shrink-0 shadow-lg shadow-[#FF2D95]/20"
                >
                  <Instagram className="w-4 h-4" />
                  <span>Follow @cinecritiq</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Switchable Reel Playlist Cards */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-[#8E8E9A] uppercase tracking-wider">
                    Featured Skill Builds & Website Info Reels
                  </span>
                  <a
                    href="https://www.instagram.com/cinecritiq/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#00A3E0] hover:underline font-medium flex items-center gap-1"
                  >
                    <span>View all on Instagram</span>
                    <ArrowRight className="w-3 h-3" />
                  </a>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {instagramReels.map((reel, idx) => (
                    <button
                      key={reel.id}
                      type="button"
                      onClick={() => setActiveReelIndex(idx)}
                      className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                        activeReelIndex === idx
                          ? 'bg-[#18181D] border-[#FF2D95]'
                          : 'bg-[#0A0A0A] border-[#202026] hover:border-[#2E2E38]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#121215] text-[#FF2D95] border border-[#202026]">
                          {reel.tag}
                        </span>
                        <span className="text-[11px] font-mono text-[#8E8E9A] flex items-center gap-1">
                          <Play className="w-2.5 h-2.5 text-[#00A3E0]" />
                          {reel.views}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-[#F3F4F6] line-clamp-2 leading-snug">
                        {reel.title}
                      </p>
                      <span className="text-[11px] text-[#00A3E0] font-medium flex items-center gap-1">
                        {activeReelIndex === idx ? 'Now Playing Reel' : 'Watch Preview'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <a
                  href="https://www.instagram.com/cinecritiq/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-lg bg-[#FF2D95] hover:bg-[#E61980] text-white text-xs sm:text-sm font-medium inline-flex items-center gap-2 transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                  <span>Open @cinecritiq on Instagram</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
                <a
                  href="https://www.instagram.com/cinecritiq/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-lg bg-[#18181D] hover:bg-[#202026] text-[#F3F4F6] border border-[#202026] text-xs sm:text-sm font-medium inline-flex items-center gap-2 transition-colors"
                >
                  <Play className="w-3.5 h-3.5 text-[#00A3E0]" />
                  <span>Watch Latest Reels & Follow</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Account Creation Modal */}
      <CreateAccountModal
        isOpen={showCreateAccountModal}
        onClose={() => setShowCreateAccountModal(false)}
        onSuccess={() => navigate('/dashboard')}
      />
    </div>
  );
};
