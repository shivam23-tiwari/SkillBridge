import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Project, ProjectCategory } from '../types';
import { DataService } from '../services/store';
import { ProjectCard } from '../components/projects/ProjectCard';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  LayoutGrid,
  List,
  Plus,
  FolderOpen,
} from 'lucide-react';

const CATEGORIES: ('All' | ProjectCategory)[] = [
  'All',
  'Web Development',
  'AI & Machine Learning',
  'UI/UX Design',
  'Mobile Apps',
  'Data Science',
  'Game Development',
];

const POPULAR_TECHS = [
  'All',
  'React',
  'TypeScript',
  'Python',
  'Next.js',
  'FastAPI',
  'Tailwind CSS',
  'Node.js',
  'D3.js',
  'Figma',
];

export const ProjectsPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || 'All');
  const [selectedTech, setSelectedTech] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'most_liked'>('newest');
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(6);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const list = await DataService.getProjects({
        search: searchQuery,
        category: selectedCategory === 'All' ? undefined : selectedCategory,
        tech: selectedTech === 'All' ? undefined : selectedTech,
        sort: sortBy,
        currentUserId: user?.id,
        visibility: 'public',
      });
      setProjects(list);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [searchQuery, selectedCategory, selectedTech, sortBy, user?.id]);

  // Synchronize state when URL query params change (e.g. from footer discipline links)
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      setSelectedCategory(cat);
    } else {
      setSelectedCategory('All');
    }
    const q = searchParams.get('q');
    if (q !== null) {
      setSearchQuery(q);
    }
  }, [searchParams]);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    const params: Record<string, string> = {};
    if (searchQuery) params.q = searchQuery;
    if (cat && cat !== 'All') params.category = cat;
    setSearchParams(params, { replace: true });
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    const params: Record<string, string> = {};
    if (query) params.q = query;
    if (selectedCategory && selectedCategory !== 'All') params.category = selectedCategory;
    setSearchParams(params, { replace: true });
  };

  const displayedProjects = useMemo(() => {
    return projects.slice(0, visibleCount);
  }, [projects, visibleCount]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-[#F3F4F6]">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#202026] pb-6">
        <div>
          <span className="text-xs font-mono text-[#00A3E0] uppercase tracking-wider block mb-1">
            Index · {projects.length} Published
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F3F4F6] tracking-tight">
            Explore Student Projects
          </h1>
          <p className="text-xs sm:text-sm text-[#8E8E9A] mt-1">
            Production apps, design systems, and machine learning models built by student creators.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/projects/new">
            <Button variant="primary" size="sm" className="gap-1.5 text-xs">
              <Plus className="w-3.5 h-3.5" />
              Publish Project
            </Button>
          </Link>
        </div>
      </div>

      {/* Search and Filters Minimal Toolbar */}
      <div className="bg-[#121215] border border-[#202026] rounded-xl p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Box */}
          <div className="md:col-span-6">
            <Input
              placeholder="Search projects by title, summary, or stack..."
              value={searchQuery}
              onChange={e => handleSearchChange(e.target.value)}
              icon={<Search className="w-4 h-4 text-[#8E8E9A]" />}
            />
          </div>

          {/* Sort Selector */}
          <div className="md:col-span-3">
            <Select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              options={[
                { value: 'newest', label: 'Sort: Newest First' },
                { value: 'most_liked', label: 'Sort: Most Liked' },
              ]}
            />
          </div>

          {/* Grid / List Layout Switcher */}
          <div className="md:col-span-3 flex items-center justify-end gap-2">
            <span className="text-xs text-[#8E8E9A] hidden sm:inline">View:</span>
            <div className="flex items-center bg-[#121215] p-0.5 rounded-lg border border-[#202026]">
              <button
                onClick={() => setLayout('grid')}
                className={`p-1.5 rounded transition-colors cursor-pointer ${
                  layout === 'grid'
                    ? 'bg-[#FF2D95] text-white'
                    : 'text-[#8E8E9A] hover:text-[#F3F4F6]'
                }`}
                title="Grid Layout"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setLayout('list')}
                className={`p-1.5 rounded transition-colors cursor-pointer ${
                  layout === 'list'
                    ? 'bg-[#FF2D95] text-white'
                    : 'text-[#8E8E9A] hover:text-[#F3F4F6]'
                }`}
                title="List Layout"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Categories (Clean segmented controls) */}
        <div className="pt-2 border-t border-[#202026] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-xs text-[#8E8E9A] shrink-0 mr-1">Category:</span>
          {CATEGORIES.map(cat => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`text-xs px-2.5 py-1 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#18181D] text-[#00A3E0] border border-[#202026] font-medium'
                    : 'text-[#8E8E9A] hover:text-[#F3F4F6] hover:bg-[#18181D]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Tech Stack filter */}
        <div className="pt-2 flex items-center gap-1 overflow-x-auto no-scrollbar text-xs">
          <span className="text-[#8E8E9A] shrink-0 mr-1 text-[11px]">Stack:</span>
          {POPULAR_TECHS.map(tech => {
            const isActive = selectedTech === tech;
            return (
              <button
                key={tech}
                onClick={() => setSelectedTech(tech)}
                className={`px-2 py-0.5 rounded text-[11px] transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#007BA7]/20 text-[#00A3E0] font-medium border border-[#007BA7]/40'
                    : 'text-[#8E8E9A] hover:text-[#F3F4F6]'
                }`}
              >
                {tech}
              </button>
            );
          })}
        </div>
      </div>

      {/* Projects Display */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-72 bg-[#121215] rounded-xl border border-[#202026] animate-pulse" />
          ))}
        </div>
      ) : displayedProjects.length === 0 ? (
        <div className="bg-[#121215] rounded-xl border border-[#202026] p-12 text-center max-w-md mx-auto space-y-4">
          <div className="w-10 h-10 rounded-lg bg-[#18181D] text-[#8E8E9A] flex items-center justify-center mx-auto border border-[#202026]">
            <FolderOpen className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-[#F3F4F6]">No projects found</h3>
          <p className="text-xs text-[#8E8E9A] leading-relaxed">
            No projects match your current filters. Clear the search or publish a new project.
          </p>
          <div className="flex justify-center gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedTech('All');
              }}
            >
              Clear Filters
            </Button>
            <Link to="/projects/new">
              <Button variant="primary" size="sm">
                Publish Project
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div
          className={
            layout === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }
        >
          {displayedProjects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              layout={layout}
              onUpdated={fetchProjects}
            />
          ))}
        </div>
      )}

      {/* Load More Pagination */}
      {!loading && projects.length > visibleCount && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            size="md"
            onClick={() => setVisibleCount(prev => prev + 6)}
            className="px-6 text-xs font-mono tabular-nums"
          >
            Load More ({projects.length - visibleCount} remaining)
          </Button>
        </div>
      )}
    </div>
  );
};
