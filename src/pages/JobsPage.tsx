import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Job, JobType } from '../types';
import { DataService } from '../services/store';
import { JobCard } from '../components/jobs/JobCard';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { Search, Briefcase, Plus } from 'lucide-react';

const JOB_TYPES: ('All' | JobType)[] = ['All', 'Fixed Price', 'Hourly', 'Milestone', 'Contract'];

export const JobsPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [selectedType, setSelectedType] = useState<string>(searchParams.get('type') || 'All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = searchParams.get('type');
    if (t) setSelectedType(t);
    const q = searchParams.get('q');
    if (q !== null) setSearch(q);
  }, [searchParams]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const list = await DataService.getJobs({
        search: search.trim() || undefined,
        jobType: selectedType === 'All' ? undefined : selectedType,
        status: 'open',
        currentUserId: user?.id,
      });
      setJobs(list);
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, [search, selectedType, user?.id]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-[#F3F4F6]">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#202026] pb-6">
        <div>
          <span className="text-xs font-mono text-[#00A3E0] uppercase tracking-wider block mb-1">
            Exchange · {jobs.length} Active Listings
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F3F4F6] tracking-tight">
            Browse Freelance Contracts
          </h1>
          <p className="text-xs sm:text-sm text-[#8E8E9A] mt-1 max-w-2xl">
            Contracts posted by collegiate startups, research labs, student founders, and early-stage companies.
          </p>
        </div>

        <Link to="/jobs/new">
          <Button variant="primary" size="sm" className="gap-1.5 text-xs">
            <Plus className="w-3.5 h-3.5" />
            Post Freelance Listing
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#121215] border border-[#202026] rounded-xl p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-8">
            <Input
              placeholder="Search by role title, description, or required skills..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              icon={<Search className="w-4 h-4 text-[#8E8E9A]" />}
            />
          </div>

          <div className="md:col-span-4">
            <Select
              label=""
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              options={JOB_TYPES.map(t => ({ value: t, label: t === 'All' ? 'All Contract Types' : t }))}
            />
          </div>
        </div>

        {/* Quick type pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2 border-t border-[#202026]">
          <span className="text-xs text-[#8E8E9A] shrink-0 mr-1">Type:</span>
          {JOB_TYPES.map(t => {
            const isActive = selectedType === t;
            return (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`text-xs px-2.5 py-1 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#18181D] text-[#00A3E0] border border-[#202026] font-medium'
                    : 'text-[#8E8E9A] hover:text-[#F3F4F6] hover:bg-[#18181D]'
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-64 bg-[#121215] rounded-xl border border-[#202026] animate-pulse" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-[#121215] rounded-xl border border-[#202026] p-12 text-center max-w-md mx-auto space-y-3">
          <Briefcase className="w-10 h-10 text-[#8E8E9A] mx-auto" />
          <h3 className="text-base font-semibold text-[#F3F4F6]">No open jobs found</h3>
          <p className="text-xs text-[#8E8E9A]">
            No active jobs match your search or filters. Check back soon or post a new contract.
          </p>
          <div className="flex justify-center gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch('');
                setSelectedType('All');
              }}
            >
              Clear Filters
            </Button>
            <Link to="/jobs/new">
              <Button variant="primary" size="sm">
                Post Job
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map(job => (
            <JobCard key={job.id} job={job} onUpdated={loadJobs} />
          ))}
        </div>
      )}
    </div>
  );
};
