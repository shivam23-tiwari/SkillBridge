import React from 'react';
import { Link } from 'react-router-dom';
import { Profile } from '../../types';
import { Button } from '../ui/Button';
import { getInitials } from '../../lib/utils';
import { GraduationCap, ArrowUpRight, FileText } from 'lucide-react';

interface StudentCardProps {
  student: Profile;
  projectCount?: number;
}

export const StudentCard: React.FC<StudentCardProps> = ({ student, projectCount = 0 }) => {
  return (
    <div className="bg-[#121215] border border-[#202026] hover:border-[#33333D] rounded-xl p-5 flex flex-col justify-between transition-colors">
      <div>
        {/* Header with avatar & availability */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            {student.avatar_url ? (
              <img
                src={student.avatar_url}
                alt={student.full_name}
                className="w-11 h-11 rounded-lg object-cover"
              />
            ) : (
              <div className="w-11 h-11 rounded-lg bg-[#18181D] text-[#00A3E0] font-semibold text-sm flex items-center justify-center">
                {getInitials(student.full_name)}
              </div>
            )}
            <div>
              <Link to={`/students/${student.id}`} className="hover:text-white transition-colors">
                <h3 className="font-semibold text-sm text-[#F3F4F6]">{student.full_name}</h3>
              </Link>
              {student.college ? (
                <div className="flex items-center gap-1 text-xs text-[#8E8E9A] mt-0.5">
                  <GraduationCap className="w-3.5 h-3.5 text-[#8E8E9A] shrink-0" />
                  <span className="truncate">{student.college}</span>
                </div>
              ) : (
                <p className="text-xs text-[#8E8E9A]">Student Engineer</p>
              )}
            </div>
          </div>

          <div className="text-[11px] font-medium">
            {student.available_for_work ? (
              <span className="text-[#00A3E0] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00A3E0]" />
                Available
              </span>
            ) : (
              <span className="text-[#8E8E9A]">Busy</span>
            )}
          </div>
        </div>

        {/* Bio */}
        {student.bio && (
          <p className="text-xs text-[#8E8E9A] line-clamp-2 mb-3 leading-relaxed">
            {student.bio}
          </p>
        )}

        {/* Skills */}
        <div className="text-[11px] text-[#8E8E9A] mb-4">
          {student.skills.slice(0, 4).join(' · ')}
          {student.skills.length > 4 && ` · +${student.skills.length - 4}`}
        </div>
      </div>

      {/* Footer with project count & action */}
      <div className="pt-3 border-t border-[#202026] flex items-center justify-between mt-auto gap-2">
        <span className="text-xs text-[#8E8E9A] font-mono tabular-nums">
          {projectCount} {projectCount === 1 ? 'project' : 'projects'}
        </span>

        <div className="flex items-center gap-1.5">
          <Link to={`/students/${student.id}?tab=resume`}>
            <Button variant="outline" size="sm" className="gap-1 text-xs py-1.5 px-2.5 border-[#202026] text-gray-300 hover:text-[#00A3E0] hover:border-[#00A3E0]/40">
              <FileText className="w-3.5 h-3.5 text-[#00A3E0]" />
              <span>Resume</span>
            </Button>
          </Link>
          <Link to={`/students/${student.id}`}>
            <Button variant="secondary" size="sm" className="gap-1 text-xs py-1.5 px-2.5 hover:border-[#007BA7] hover:text-[#00A3E0]">
              <span>Profile</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
