import React from 'react';
import {
  ResumeFormatting,
  ResumeTemplateId,
  ResumeSectionId,
} from '../../types';
import {
  Palette,
  Type,
  Sliders,
  AlignLeft,
  AlignCenter,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Check,
  Crown,
  Lock,
  GripVertical,
} from 'lucide-react';
import { usePlan } from '../../context/PlanContext';

interface TemplatePickerProps {
  formatting: ResumeFormatting;
  onChange: (formatting: ResumeFormatting) => void;
}

export const TemplatePicker: React.FC<TemplatePickerProps> = ({
  formatting,
  onChange,
}) => {
  const { plan, openUpgradeModal } = usePlan();

  const templates: {
    id: ResumeTemplateId;
    name: string;
    tagline: string;
    badge?: string;
    isPremiumOnly?: boolean;
    renderThumbnail: (accent: string) => React.ReactNode;
  }[] = [
    {
      id: 'modern-tech',
      name: 'Modern Tech',
      tagline: 'Recruiter-approved with clean accent bars and skill tags.',
      badge: 'Most Popular',
      renderThumbnail: (accent: string) => (
        <div className="w-full h-24 bg-white border border-gray-200 rounded p-2 flex flex-col justify-between overflow-hidden shadow-2xs">
          <div className="border-b-2 pb-1 flex justify-between items-center" style={{ borderColor: accent }}>
            <div className="space-y-0.5">
              <div className="w-12 h-1.5 rounded-xs" style={{ backgroundColor: accent }} />
              <div className="w-16 h-1 bg-gray-300 rounded-xs" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="w-20 h-1 bg-gray-400 rounded-xs" />
            <div className="w-full h-0.5 bg-gray-200" />
            <div className="w-full h-0.5 bg-gray-200" />
          </div>
          <div className="flex gap-1">
            <div className="w-6 h-1.5 rounded-xs bg-gray-100 border border-gray-200" />
            <div className="w-6 h-1.5 rounded-xs bg-gray-100 border border-gray-200" />
            <div className="w-6 h-1.5 rounded-xs bg-gray-100 border border-gray-200" />
          </div>
        </div>
      ),
    },
    {
      id: 'minimal-classic',
      name: 'Minimal Classic',
      tagline: 'Harvard / Ivy League ATS standard with full accent styling.',
      badge: 'ATS Favorite',
      renderThumbnail: (accent: string) => (
        <div className="w-full h-24 bg-white border border-gray-200 rounded p-2 flex flex-col justify-between overflow-hidden shadow-2xs">
          <div className="text-center space-y-0.5 border-b pb-1" style={{ borderColor: accent }}>
            <div className="w-16 h-1.5 mx-auto rounded-xs font-bold" style={{ backgroundColor: accent }} />
            <div className="w-20 h-0.5 mx-auto bg-gray-400 rounded-xs" />
          </div>
          <div className="space-y-1">
            <div className="w-10 h-1 rounded-xs" style={{ backgroundColor: accent }} />
            <div className="w-full h-0.5 bg-gray-300" />
            <div className="w-5/6 h-0.5 bg-gray-200" />
          </div>
          <div className="space-y-0.5">
            <div className="w-8 h-1 rounded-xs" style={{ backgroundColor: accent }} />
            <div className="w-full h-0.5 bg-gray-300" />
          </div>
        </div>
      ),
    },
    {
      id: 'executive-slate',
      name: 'Executive Slate',
      tagline: 'Structured two-column layout with bold colored banner.',
      isPremiumOnly: plan === 'free',
      renderThumbnail: (accent: string) => (
        <div className="w-full h-24 bg-white border border-gray-200 rounded overflow-hidden shadow-2xs flex flex-col">
          <div className="h-5 p-1 text-white flex items-center justify-between" style={{ backgroundColor: accent }}>
            <div className="w-10 h-1.5 bg-white/90 rounded-xs" />
            <div className="w-6 h-1 bg-white/70 rounded-xs" />
          </div>
          <div className="flex-1 grid grid-cols-12 p-1.5 gap-1">
            <div className="col-span-4 border-r border-gray-200 pr-1 space-y-1">
              <div className="w-6 h-1 rounded-xs" style={{ backgroundColor: accent }} />
              <div className="w-full h-0.5 bg-gray-300" />
              <div className="w-full h-0.5 bg-gray-200" />
            </div>
            <div className="col-span-8 space-y-1">
              <div className="w-10 h-1 rounded-xs" style={{ backgroundColor: accent }} />
              <div className="w-full h-0.5 bg-gray-300" />
              <div className="w-4/5 h-0.5 bg-gray-200" />
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'creative-developer',
      name: 'Creative Developer',
      tagline: 'Terminal and code-block aesthetic with repo & demo links.',
      isPremiumOnly: plan === 'free',
      renderThumbnail: (accent: string) => (
        <div className="w-full h-24 bg-white border border-gray-200 rounded p-1.5 flex flex-col justify-between overflow-hidden shadow-2xs">
          <div className="bg-gray-950 p-1.5 rounded-xs flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="w-10 h-1.5 rounded-xs" style={{ backgroundColor: accent }} />
              <div className="w-14 h-0.5 bg-gray-400" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1">
            <div className="p-1 rounded bg-gray-50 border border-gray-200 space-y-0.5">
              <div className="w-8 h-1 bg-gray-700 rounded-xs" />
              <div className="w-full h-0.5 bg-gray-300" />
            </div>
            <div className="p-1 rounded bg-gray-50 border border-gray-200 space-y-0.5">
              <div className="w-8 h-1 bg-gray-700 rounded-xs" />
              <div className="w-full h-0.5 bg-gray-300" />
            </div>
          </div>
        </div>
      ),
    },
  ];

  const fonts: { id: ResumeFormatting['fontFamily']; label: string; preview: string; description: string }[] = [
    {
      id: 'calibri',
      label: 'Calibri style (Default)',
      preview: 'Carlito • 10.5pt Sans-Serif',
      description: "'Carlito', Calibri, Arial, sans-serif (10.5pt)",
    },
    {
      id: 'arial',
      label: 'Arial / Helvetica style',
      preview: 'Arimo • 10pt Sans-Serif',
      description: "'Arimo', Arial, Helvetica, sans-serif (10pt)",
    },
    {
      id: 'times',
      label: 'Times New Roman style',
      preview: 'Tinos • 11pt Serif',
      description: "'Tinos', 'Times New Roman', serif (11pt)",
    },
  ];

  const presetColors = [
    { name: 'Neon Rose', hex: '#FF2D95' },
    { name: 'Electric Blue', hex: '#00A3E0' },
    { name: 'Royal Blue', hex: '#2563EB' },
    { name: 'Deep Navy', hex: '#1E3A8A' },
    { name: 'Emerald', hex: '#059669' },
    { name: 'Purple', hex: '#7C3AED' },
    { name: 'Slate Charcoal', hex: '#1F2937' },
  ];

  const sectionLabels: Record<ResumeSectionId, string> = {
    summary: 'Professional Summary',
    education: 'Education',
    skills: 'Technical & Soft Skills',
    projects: 'Projects',
    experience: 'Work & Internships',
    certifications: 'Certifications',
    achievements: 'Achievements',
    extra: 'Additional Information',
  };

  const [draggedIdx, setDraggedIdx] = React.useState<number | null>(null);

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...formatting.sectionOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;

    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;

    onChange({ ...formatting, sectionOrder: newOrder });
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, _index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === dropIndex) return;
    const newOrder = [...formatting.sectionOrder];
    const [moved] = newOrder.splice(draggedIdx, 1);
    newOrder.splice(dropIndex, 0, moved);
    onChange({ ...formatting, sectionOrder: newOrder });
    setDraggedIdx(null);
  };

  const handleToggleSectionVisibility = (secId: ResumeSectionId) => {
    onChange({
      ...formatting,
      visibleSections: {
        ...formatting.visibleSections,
        [secId]: !formatting.visibleSections[secId],
      },
    });
  };

  return (
    <div className="space-y-7">
      {/* 1. Visual Template Selector with Thumbnails */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-[#00A3E0] uppercase tracking-wider flex items-center gap-2">
            <Palette className="w-3.5 h-3.5" />
            1. Layout Template
          </label>
          <span className="text-[11px] text-[#8E8E9A]">
            {templates.length} recruiter-approved formats
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {templates.map(tpl => {
            const isSelected = formatting.template === tpl.id;
            return (
              <div
                key={tpl.id}
                onClick={() => {
                  if (tpl.isPremiumOnly) {
                    openUpgradeModal(`The ${tpl.name} template is available with the Basic Plan (₹99) and Premium.`);
                    return;
                  }
                  onChange({ ...formatting, template: tpl.id });
                }}
                className={`p-3 rounded-xl border cursor-pointer transition-all space-y-2 relative ${
                  isSelected
                    ? 'bg-[#18181D] border-[#00A3E0] ring-2 ring-[#00A3E0]/40 shadow-lg'
                    : 'bg-[#121215] border-[#202026] hover:border-[#2D2D35]'
                }`}
              >
                {/* Visual Schematic Thumbnail */}
                {tpl.renderThumbnail(formatting.accentColor)}

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-[#F3F4F6]">{tpl.name}</span>
                    {tpl.badge && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-blue-500/10 text-blue-400 font-semibold border border-blue-500/20">
                        {tpl.badge}
                      </span>
                    )}
                  </div>
                  {tpl.isPremiumOnly ? (
                    <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Basic
                    </span>
                  ) : isSelected ? (
                    <span className="text-[10px] font-bold text-[#00A3E0] flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Selected
                    </span>
                  ) : null}
                </div>
                <p className="text-[11px] text-[#8E8E9A] leading-relaxed">{tpl.tagline}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Typography Font Picker (6 Real Recruiter Fonts) */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-[#00A3E0] uppercase tracking-wider flex items-center gap-2">
          <Type className="w-3.5 h-3.5" />
          2. Typography & Font Family
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {fonts.map(f => {
            const isSelected = formatting.fontFamily === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => onChange({ ...formatting, fontFamily: f.id })}
                className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#18181D] border-[#00A3E0] text-white shadow-xs'
                    : 'bg-[#121215] border-[#202026] text-[#8E8E9A] hover:text-[#F3F4F6]'
                }`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-bold text-[#F3F4F6]">{f.label}</span>
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#00A3E0]" />}
                </div>
                <span className="text-[10px] text-[#00A3E0] font-medium block">{f.preview}</span>
                <span className="text-[10px] text-[#6B7280] line-clamp-1 mt-0.5">{f.description}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Font Size & Spacing Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 bg-[#18181D] p-4 rounded-xl border border-[#202026]">
        {/* Font Size Slider */}
        <div className="space-y-2.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-[#F3F4F6] flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-[#00A3E0]" />
              Font Size Slider
            </span>
            <span className="text-blue-400 font-semibold capitalize">
              {formatting.fontSize === 'small' ? 'Small (9.5pt)' : formatting.fontSize === 'large' ? 'Large (11.5pt)' : 'Medium (10.5pt)'}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="2"
            step="1"
            value={formatting.fontSize === 'small' ? 0 : formatting.fontSize === 'large' ? 2 : 1}
            onChange={e => {
              const val = parseInt(e.target.value);
              onChange({
                ...formatting,
                fontSize: val === 0 ? 'small' : val === 2 ? 'large' : 'medium',
              });
            }}
            className="w-full accent-[#00A3E0] cursor-pointer h-1.5 bg-gray-800 rounded-lg"
          />
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: 'small', label: 'Small (9.5pt)' },
              { id: 'medium', label: 'Medium (10.5pt)' },
              { id: 'large', label: 'Large (11.5pt)' },
            ].map(opt => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onChange({ ...formatting, fontSize: opt.id as any })}
                className={`py-1.5 rounded text-[11px] font-semibold border transition-all cursor-pointer ${
                  formatting.fontSize === opt.id
                    ? 'bg-[#00A3E0] text-black font-bold border-[#00A3E0]'
                    : 'bg-[#121215] border-[#202026] text-gray-400 hover:text-white'
                }`}
              >
                {opt.label.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Spacing / Margins Control */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-[#F3F4F6]">Spacing & Margins</span>
            <span className="text-gray-400 capitalize">{formatting.spacing}</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: 'compact', label: 'Compact (15mm)' },
              { id: 'normal', label: 'Standard (18mm)' },
              { id: 'relaxed', label: 'Relaxed (18mm)' },
            ].map(opt => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onChange({ ...formatting, spacing: opt.id as any })}
                className={`py-1.5 rounded text-[11px] font-semibold border transition-all ${
                  formatting.spacing === opt.id
                    ? 'bg-[#00A3E0] text-black font-bold border-[#00A3E0]'
                    : 'bg-[#121215] border-[#202026] text-gray-400 hover:text-white'
                }`}
              >
                {opt.label.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Accent Color Swatches + Custom Hex Input */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold text-[#00A3E0] uppercase tracking-wider flex items-center justify-between">
          <span>4. Accent Color</span>
          <span className="text-[10px] text-gray-400">Name, links, tags, section rules & icons</span>
        </label>
        <div className="flex flex-wrap items-center gap-2.5">
          {presetColors.map(c => {
            const isSelected = formatting.accentColor.toLowerCase() === c.hex.toLowerCase();
            return (
              <button
                key={c.hex}
                type="button"
                onClick={() => onChange({ ...formatting, accentColor: c.hex })}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[#18181D] border-white text-white font-bold'
                    : 'bg-[#121215] border-[#202026] text-[#8E8E9A] hover:text-[#F3F4F6]'
                }`}
              >
                <span className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: c.hex }} />
                <span>{c.name}</span>
              </button>
            );
          })}

          {/* Custom Hex Color Picker */}
          <div className="flex items-center gap-1.5 bg-[#121215] border border-[#202026] rounded-lg px-2 py-1">
            <input
              type="color"
              value={formatting.accentColor}
              onChange={e => onChange({ ...formatting, accentColor: e.target.value })}
              className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
              title="Pick custom hex color"
            />
            <input
              type="text"
              value={formatting.accentColor}
              onChange={e => onChange({ ...formatting, accentColor: e.target.value })}
              placeholder="#FF2D95"
              className="w-20 bg-transparent text-xs text-gray-200 focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* 5. Header Alignment */}
      <div className="bg-[#18181D] p-3.5 rounded-xl border border-[#202026] flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-[#F3F4F6] block">5. Header Style</span>
          <span className="text-[11px] text-gray-400">Align candidate name & two-line contact bar</span>
        </div>
        <div className="flex items-center gap-1 bg-[#121215] p-1 rounded-lg border border-[#202026]">
          <button
            type="button"
            onClick={() => onChange({ ...formatting, headerAlignment: 'left' })}
            className={`p-1.5 rounded text-xs flex items-center gap-1 cursor-pointer ${
              formatting.headerAlignment === 'left'
                ? 'bg-[#00A3E0] text-black font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <AlignLeft className="w-3.5 h-3.5" />
            Left
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...formatting, headerAlignment: 'center' })}
            className={`p-1.5 rounded text-xs flex items-center gap-1 cursor-pointer ${
              formatting.headerAlignment === 'center'
                ? 'bg-[#00A3E0] text-black font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <AlignCenter className="w-3.5 h-3.5" />
            Center
          </button>
        </div>
      </div>

      {/* 6. Section Reordering & Visibility Toggles */}
      <div className="bg-[#18181D] p-4 rounded-xl border border-[#202026] space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#F3F4F6] uppercase tracking-wider block">
              6. Section Order & Visibility
            </span>
            <span className="text-[11px] text-gray-400">
              Move sections up or down (e.g. put Projects above Education for freshers).
            </span>
          </div>
        </div>

        <div className="space-y-2">
          {formatting.sectionOrder.map((secId, idx) => {
            const isVisible = formatting.visibleSections[secId];
            const isDragging = draggedIdx === idx;
            return (
              <div
                key={secId}
                draggable
                onDragStart={e => handleDragStart(e, idx)}
                onDragOver={e => handleDragOver(e, idx)}
                onDrop={e => handleDrop(e, idx)}
                className={`flex items-center justify-between p-2.5 rounded-lg border text-xs transition-all cursor-grab active:cursor-grabbing ${
                  isDragging
                    ? 'opacity-40 border-blue-500 bg-blue-500/10'
                    : isVisible
                    ? 'bg-[#121215] border-[#202026] text-gray-200 hover:border-gray-700'
                    : 'bg-[#121215]/50 border-dashed border-[#202026] text-gray-500'
                }`}
                title="Drag to reorder section, or use up/down buttons"
              >
                <div className="flex items-center gap-2.5">
                  <GripVertical className="w-3.5 h-3.5 text-gray-500 hover:text-gray-300" />
                  <span className="w-5 h-5 rounded-full bg-gray-800 text-gray-400 text-[10px] flex items-center justify-center font-bold">
                    {idx + 1}
                  </span>
                  <span className={`font-semibold ${isVisible ? 'text-white' : 'line-through text-gray-500'}`}>
                    {sectionLabels[secId]}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Visibility Button */}
                  <button
                    type="button"
                    onClick={() => handleToggleSectionVisibility(secId)}
                    className="p-1 text-gray-400 hover:text-white rounded hover:bg-gray-800 cursor-pointer"
                    title={isVisible ? 'Hide Section' : 'Show Section'}
                  >
                    {isVisible ? <Eye className="w-3.5 h-3.5 text-blue-400" /> : <EyeOff className="w-3.5 h-3.5 text-gray-500" />}
                  </button>

                  {/* Move Up */}
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMoveSection(idx, 'up')}
                    className="p-1 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded hover:bg-gray-800 cursor-pointer"
                    title="Move Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>

                  {/* Move Down */}
                  <button
                    type="button"
                    disabled={idx === formatting.sectionOrder.length - 1}
                    onClick={() => handleMoveSection(idx, 'down')}
                    className="p-1 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded hover:bg-gray-800 cursor-pointer"
                    title="Move Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
