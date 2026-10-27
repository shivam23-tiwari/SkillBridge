import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Profile } from '../types';
import { DataService } from '../services/store';
import { StudentCard } from '../components/students/StudentCard';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Search, Users } from 'lucide-react';

const SKILL_FILTERS = [
  'All',
  'React',
  'TypeScript',
  'Python',
  'UI/UX Design',
  'Machine Learning',
  'Mobile Apps',
  'FastAPI',
  'Figma',
];

export const StudentsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [students, setStudents] = useState<Profile[]>([]);
  const [projectCounts, setProjectCounts] = useState<Record<string, number>>({});
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [selectedSkill, setSelectedSkill] = useState(searchParams.get('skill') || 'All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const s = searchParams.get('skill');
    if (s) setSelectedSkill(s);
    const q = searchParams.get('q');
    if (q !== null) setSearch(q);
  }, [searchParams]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [profileList, allProjects] = await Promise.all([
          DataService.getProfiles({
            search: search.trim() || undefined,
            skill: selectedSkill === 'All' ? undefined : selectedSkill,
          }),
          DataService.getProjects({ visibility: 'all' }),
        ]);

        const counts: Record<string, number> = {};
        allProjects.forEach(p => {
          counts[p.owner_id] = (counts[p.owner_id] || 0) + 1;
        });

        setStudents(profileList);
        setProjectCounts(counts);
      } catch (err) {
        console.error('Failed to load students:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [search, selectedSkill]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-[#F3F4F6]">
      {/* Header */}
      <div className="border-b border-[#202026] pb-6">
        <span className="text-xs font-mono text-[#00A3E0] uppercase tracking-wider block mb-1">
          Directory · {students.length} Verified
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#F3F4F6] tracking-tight">
          Find Student Freelancers
        </h1>
        <p className="text-xs text-[#8E8E9A] mt-1 max-w-2xl">
          Verified university builders and design specialists available for contracts, code audits, and MVP builds.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-[#121215] border border-[#202026] rounded-xl p-4 space-y-3">
        <div className="max-w-xl">
          <Input
            placeholder="Search by student name, college, or expertise..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4 text-[#8E8E9A]" />}
          />
        </div>

        {/* Skill filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2 border-t border-[#202026]">
          <span className="text-xs text-[#8E8E9A] shrink-0 mr-1">Skill:</span>
          {SKILL_FILTERS.map(skill => {
            const isActive = selectedSkill === skill;
            return (
              <button
                key={skill}
                onClick={() => setSelectedSkill(skill)}
                className={`text-xs px-2.5 py-1 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#18181D] text-[#00A3E0] border border-[#202026] font-medium'
                    : 'text-[#8E8E9A] hover:text-[#F3F4F6] hover:bg-[#18181D]'
                }`}
              >
                {skill}
              </button>
            );
          })}
        </div>
      </div>

      {/* Directory Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-64 bg-[#121215] rounded-xl border border-[#202026] animate-pulse" />
          ))}
        </div>
      ) : students.length === 0 ? (
        <div className="bg-[#121215] rounded-xl border border-[#202026] p-12 text-center max-w-md mx-auto space-y-3">
          <Users className="w-10 h-10 text-[#8E8E9A] mx-auto" />
          <h3 className="text-base font-semibold text-[#F3F4F6]">No students matched</h3>
          <p className="text-xs text-[#8E8E9A]">
            Try adjusting your search query or removing the skill filter.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearch('');
              setSelectedSkill('All');
            }}
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map(student => (
            <StudentCard
              key={student.id}
              student={student}
              projectCount={projectCounts[student.id] || 0}
            />
          ))}
        </div>
      )}
    </div>
  );
};
