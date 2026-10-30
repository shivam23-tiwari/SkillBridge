import React from 'react';
import { createPortal } from 'react-dom';
import {
  ResumeData,
  ResumeSectionId,
  ResumeTemplateId,
} from '../../types';
import {
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Globe,
  ExternalLink,
  Award,
  Briefcase,
  GraduationCap,
  Code2,
  FolderGit2,
  User,
  Layers,
} from 'lucide-react';

const DEFAULT_ACCENT_COLOR = '#FF2D95';

const SMALL_WORDS = new Set([
  'in',
  'of',
  'and',
  'for',
  'on',
  'at',
  'to',
  'with',
  'by',
  'from',
  'the',
  'a',
  'an',
  'vs',
  'or',
]);

const KNOWN_ACRONYMS: Record<string, string> = {
  bml: 'BML',
  bmu: 'BMU',
  cbse: 'CBSE',
  icse: 'ICSE',
  pcm: 'PCM',
  pcb: 'PCB',
  cs: 'CS',
  cse: 'CSE',
  it: 'IT',
  ece: 'ECE',
  eee: 'EEE',
  ai: 'AI',
  ml: 'ML',
  dl: 'DL',
  nlp: 'NLP',
  llm: 'LLM',
  llms: 'LLMs',
  rag: 'RAG',
  iot: 'IoT',
  ui: 'UI',
  ux: 'UX',
  'ui/ux': 'UI/UX',
  api: 'API',
  apis: 'APIs',
  rest: 'REST',
  graphql: 'GraphQL',
  sql: 'SQL',
  nosql: 'NoSQL',
  aws: 'AWS',
  gcp: 'GCP',
  ci: 'CI',
  cd: 'CD',
  'ci/cd': 'CI/CD',
  iit: 'IIT',
  nit: 'NIT',
  iiit: 'IIIT',
  bits: 'BITS',
  mit: 'MIT',
  ieee: 'IEEE',
  acm: 'ACM',
  cgpa: 'CGPA',
  gpa: 'GPA',
  phd: 'Ph.D.',
  'ph.d': 'Ph.D.',
  'b.tech': 'B.Tech',
  'b-tech': 'B.Tech',
  btech: 'B.Tech',
  'm.tech': 'M.Tech',
  'm-tech': 'M.Tech',
  mtech: 'M.Tech',
  'b.e': 'B.E.',
  'b.e.': 'B.E.',
  'b.sc': 'B.Sc',
  bsc: 'B.Sc',
  'm.sc': 'M.Sc',
  msc: 'M.Sc',
  bca: 'BCA',
  mca: 'MCA',
  mba: 'MBA',
  bba: 'BBA',
};

/**
 * Preserves user-typed capitalization while repairing acronyms ("BML", "BMU", "CBSE", "B.Tech")
 * and small words ("in", "of", "and").
 */
export function preserveAcronymsAndSmallWords(str?: string): string {
  if (!str) return '';
  const trimmed = str.trim();
  if (!trimmed) return '';

  const tokens = trimmed.split(/(\s+)/);
  let wordIndex = 0;

  return tokens
    .map(token => {
      if (/^\s+$/.test(token)) return token;

      const currentIdx = wordIndex++;
      const match = token.match(/^([^a-zA-Z0-9]*)([a-zA-Z0-9.\-/&]+)([^a-zA-Z0-9]*)$/);
      if (!match) return token;

      const [, prefix, core, suffix] = match;
      const coreLow = core.toLowerCase();

      if (KNOWN_ACRONYMS[coreLow]) {
        return `${prefix}${KNOWN_ACRONYMS[coreLow]}${suffix}`;
      }

      if (currentIdx > 0 && SMALL_WORDS.has(coreLow) && !prefix) {
        return `${prefix}${coreLow}${suffix}`;
      }

      return token;
    })
    .join('');
}

export function toTitleCase(str?: string): string {
  return preserveAcronymsAndSmallWords(str);
}

/**
 * Ensures every link href is a valid absolute URL (adds https:// if missing).
 */
export function ensureAbsoluteUrl(url?: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (/^(https?:\/\/|mailto:|tel:)/i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

/**
 * Short URL formatter for display & print:
 * - Trims LinkedIn URLs (including extra paths like `/details/featured`) to `linkedin.com/in/<handle>`
 * - Removes `https://`, `http://`, `www.`, query params, and trailing slashes from GitHub/Portfolio links
 */
export function formatShortUrl(url?: string): string {
  if (!url) return '';
  const cleaned = url
    .trim()
    .replace(/^https?:\/\/(www\.)?/i, '')
    .replace(/[?#].*$/, '')
    .replace(/\/+$/, '');

  const linkedinMatch = cleaned.match(/^(?:[a-z0-9-]+\.)?linkedin\.com\/in\/([^\/?#]+)/i);
  if (linkedinMatch) {
    return `linkedin.com/in/${linkedinMatch[1]}`;
  }

  return cleaned;
}

export const DEFAULT_SECTION_ORDER: ResumeSectionId[] = [
  'summary',
  'education',
  'skills',
  'projects',
  'experience',
  'certifications',
  'achievements',
  'extra',
];

function getOrderedSections(configured?: ResumeSectionId[]): ResumeSectionId[] {
  const base = configured && configured.length > 0 ? [...configured] : [...DEFAULT_SECTION_ORDER];
  DEFAULT_SECTION_ORDER.forEach(sec => {
    if (!base.includes(sec)) base.push(sec);
  });
  return base;
}

function getOrCreatePrintRoot(): HTMLElement | null {
  if (typeof document === 'undefined') return null;
  let el = document.getElementById('resume-print-root');
  if (!el) {
    el = document.createElement('div');
    el.id = 'resume-print-root';
    el.setAttribute('aria-hidden', 'true');
    document.body.appendChild(el);
  }
  return el;
}

export function normalizeResumeFontKey(raw?: string): 'calibri' | 'arial' | 'times' {
  const val = (raw || 'calibri').toLowerCase();
  if (val === 'arial' || val === 'helvetica' || val === 'arimo' || val === 'lato') {
    return 'arial';
  }
  if (val === 'times' || val === 'tinos' || val === 'garamond' || val === 'serif') {
    return 'times';
  }
  return 'calibri';
}

export function resolveResumeFontConfig(raw?: string): {
  key: 'calibri' | 'arial' | 'times';
  googleFontName: 'Carlito' | 'Arimo' | 'Tinos';
  fontFamilyCss: string;
  baseFontSizePt: number;
} {
  const key = normalizeResumeFontKey(raw);
  if (key === 'arial') {
    return {
      key: 'arial',
      googleFontName: 'Arimo',
      fontFamilyCss: "'Arimo', Arial, Helvetica, sans-serif",
      baseFontSizePt: 10,
    };
  }
  if (key === 'times') {
    return {
      key: 'times',
      googleFontName: 'Tinos',
      fontFamilyCss: "'Tinos', 'Times New Roman', serif",
      baseFontSizePt: 11,
    };
  }
  return {
    key: 'calibri',
    googleFontName: 'Carlito',
    fontFamilyCss: "'Carlito', Calibri, Arial, sans-serif",
    baseFontSizePt: 10.5,
  };
}

/**
 * Removes accidental repeated degree tokens like "B.Tech - B.Tech" or "B.Tech — B.Tech".
 */
export function deduplicateDegreeText(raw?: string): string {
  if (!raw) return '';
  const formatted = preserveAcronymsAndSmallWords(raw);
  // Collapse exact duplicate halves separated by -, –, —, or |
  const parts = formatted
    .split(/\s*[-–—|]\s*/)
    .map(p => p.trim())
    .filter(Boolean);
  const dedupedParts: string[] = [];
  for (const part of parts) {
    if (
      dedupedParts.length === 0 ||
      dedupedParts[dedupedParts.length - 1].toLowerCase() !== part.toLowerCase()
    ) {
      dedupedParts.push(part);
    }
  }
  return dedupedParts
    .join(' — ')
    .replace(/\b(B\.?Tech|M\.?Tech|B\.?E\.?|B\.?Sc|M\.?Sc|BCA|MCA|MBA|BBA)\s*[-–—]\s*\1\b/gi, '$1');
}

export interface ResumeSheetProps {
  data: ResumeData;
  scale?: number;
  isWatermarkRequired?: boolean;
  isPrintMode?: boolean;
  pageCount?: number;
  sheetRef?: React.RefObject<HTMLDivElement | null>;
}

/**
 * Single Source of Truth A4 Resume Sheet (`210mm x 297mm` / `794px x 1123px` with `15–18mm` padding).
 * Used identically for both the live preview and the dedicated print-only PDF view.
 */
export const ResumeSheet: React.FC<ResumeSheetProps> = ({
  data,
  scale = 1,
  isWatermarkRequired = false,
  isPrintMode = false,
  pageCount = 1,
  sheetRef,
}) => {
  const { formatting } = data;
  const accentColor = formatting.accentColor || DEFAULT_ACCENT_COLOR;
  const fitToOnePage = formatting.fitToOnePage ?? true;
  const spacing = fitToOnePage ? 'compact' : formatting.spacing || 'normal';
  const fontSize = formatting.fontSize || 'medium';
  const fontConfig = resolveResumeFontConfig(formatting.fontFamily);

  // True A4 padding: 15-18mm
  const paddingVal =
    spacing === 'compact'
      ? '15mm'
      : spacing === 'relaxed'
      ? '18mm'
      : '16mm';

  // Use the selected font's standard point size (10.5pt Carlito, 10pt Arimo, 11pt Tinos),
  // adjusting slightly only if the user explicitly picked small or large.
  const computedPt =
    fontSize === 'small'
      ? Math.max(9.5, fontConfig.baseFontSizePt - 0.5)
      : fontSize === 'large'
      ? fontConfig.baseFontSizePt + 0.5
      : fontConfig.baseFontSizePt;

  const bodyFontSize = `${computedPt}pt`;

  return (
    <div
      ref={sheetRef}
      id={isPrintMode ? 'printable-resume-sheet' : 'printable-resume'}
      className={`resume-page resume-a4-sheet relative bg-white text-gray-900 select-text ${
        isPrintMode ? '' : 'shadow-2xl rounded-xs transition-all duration-200'
      }`}
      style={{
        fontFamily: fontConfig.fontFamilyCss,
        width: isPrintMode ? '210mm' : '794px',
        minHeight: isPrintMode ? '297mm' : '1123px',
        padding: paddingVal,
        fontSize: bodyFontSize,
        lineHeight: spacing === 'compact' ? 1.25 : 1.35,
        transform: isPrintMode ? 'none' : `scale(${scale})`,
        transformOrigin: 'top left',
        boxSizing: 'border-box',
        WebkitPrintColorAdjust: 'exact',
        printColorAdjust: 'exact',
      }}
    >
      {/* Screen-only Page Break Boundary Markers when content exceeds 1 A4 page */}
      {!isPrintMode &&
        pageCount > 1 &&
        [...Array(pageCount - 1)].map((_, i) => (
          <div
            key={i}
            className="absolute left-0 right-0 border-b-2 border-dashed border-red-400 pointer-events-none flex items-center justify-center print:hidden z-30"
            style={{ top: `${(i + 1) * 1123}px` }}
          >
            <span className="bg-white text-red-600 border border-red-300 text-[10px] font-bold px-2 py-0.5 rounded-sm shadow-xs uppercase tracking-wider">
              Page {i + 1} End / Page {i + 2} Start (A4 297mm Boundary)
            </span>
          </div>
        ))}

      {/* Single Source of Truth Template Content (Watermark-Free) */}
      <div className="relative z-20">
        {formatting.template === 'minimal-classic' ? (
          <MinimalClassicView data={data} accentColor={accentColor} spacing={spacing} />
        ) : formatting.template === 'executive-slate' ? (
          <ExecutiveSlateView data={data} accentColor={accentColor} spacing={spacing} />
        ) : formatting.template === 'creative-developer' ? (
          <CreativeDeveloperView data={data} accentColor={accentColor} spacing={spacing} />
        ) : (
          <ModernTechView data={data} accentColor={accentColor} spacing={spacing} />
        )}
      </div>
    </div>
  );
};

interface ResumePreviewProps {
  data: ResumeData;
  scale?: number;
  isWatermarkRequired?: boolean;
  onPageCountChange?: (pages: number) => void;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({
  data,
  scale = 1,
  isWatermarkRequired = false,
  onPageCountChange,
}) => {
  const resumeRef = React.useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = React.useState(1123);
  const [pageCount, setPageCount] = React.useState(1);
  const [printRoot, setPrintRoot] = React.useState<HTMLElement | null>(null);

  React.useEffect(() => {
    setPrintRoot(getOrCreatePrintRoot());
  }, []);

  React.useEffect(() => {
    if (!resumeRef.current) return;
    const updateSize = () => {
      if (!resumeRef.current) return;
      const height = resumeRef.current.scrollHeight;
      setContentHeight(height);
      const pages = Math.max(1, Math.ceil((height - 4) / 1123));
      setPageCount(pages);
      onPageCountChange?.(pages);
    };

    updateSize();
    const observer = new ResizeObserver(() => updateSize());
    observer.observe(resumeRef.current);
    return () => observer.disconnect();
  }, [data, scale, onPageCountChange]);

  return (
    <>
      <div className="relative flex flex-col items-center w-full select-none">
        {/* Scaled Wrapper: scales proportional A4 canvas via CSS transform for screen display only */}
        <div
          id="printable-resume-wrapper"
          className="relative transition-all duration-150 origin-top"
          style={{
            width: `${794 * scale}px`,
            height: `${contentHeight * scale}px`,
          }}
        >
          <ResumeSheet
            sheetRef={resumeRef}
            data={data}
            scale={scale}
            isWatermarkRequired={isWatermarkRequired}
            isPrintMode={false}
            pageCount={pageCount}
          />
        </div>
      </div>

      {/* Dedicated Print-Only View Portal: renders the exact same React component at real A4 size (transform: none) */}
      {printRoot &&
        createPortal(
          <ResumeSheet
            data={data}
            scale={1}
            isWatermarkRequired={isWatermarkRequired}
            isPrintMode={true}
            pageCount={pageCount}
          />,
          printRoot
        )}
    </>
  );
};

// =========================================================================
// TWO-LINE CONTACT BAR WITH ICONS (All items are clickable links in accentColor)
// Line 1: Location, Phone, Email
// Line 2: LinkedIn, GitHub, Portfolio
// =========================================================================
const ContactLinksBar: React.FC<{
  personal: ResumeData['personal'];
  accentColor: string;
  align?: 'left' | 'center';
  lightMode?: boolean;
}> = ({ personal, accentColor, align = 'left', lightMode = false }) => {
  const linkColor = lightMode ? '#FFFFFF' : accentColor;
  const iconColor = lightMode ? '#FFFFFF' : accentColor;
  const alignClass = align === 'center' ? 'justify-center text-center' : 'justify-start text-left';

  const line1: React.ReactNode[] = [];
  const line2: React.ReactNode[] = [];

  if (personal.cityState && personal.cityState.trim()) {
    const loc = preserveAcronymsAndSmallWords(personal.cityState);
    line1.push(
      <a
        key="loc"
        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 underline font-medium max-w-full break-all"
        style={{ color: linkColor, textDecoration: 'underline', overflowWrap: 'anywhere' }}
      >
        <MapPin className="w-3 h-3 shrink-0" style={{ color: iconColor }} />
        <span>{loc}</span>
      </a>
    );
  }

  if (personal.phone && personal.phone.trim()) {
    const telHref = `tel:${personal.phone.replace(/[^\d+]/g, '')}`;
    line1.push(
      <a
        key="phone"
        href={telHref}
        className="inline-flex items-center gap-1 underline font-medium max-w-full"
        style={{ color: linkColor, textDecoration: 'underline' }}
      >
        <Phone className="w-3 h-3 shrink-0" style={{ color: iconColor }} />
        <span>{personal.phone.trim()}</span>
      </a>
    );
  }

  if (personal.email && personal.email.trim()) {
    line1.push(
      <a
        key="email"
        href={`mailto:${personal.email.trim()}`}
        className="inline-flex items-center gap-1 underline font-medium max-w-full break-all"
        style={{ color: linkColor, textDecoration: 'underline', overflowWrap: 'anywhere' }}
      >
        <Mail className="w-3 h-3 shrink-0" style={{ color: iconColor }} />
        <span>{personal.email.trim()}</span>
      </a>
    );
  }

  if (personal.linkedinUrl && personal.linkedinUrl.trim()) {
    line2.push(
      <a
        key="linkedin"
        href={ensureAbsoluteUrl(personal.linkedinUrl)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 underline font-medium max-w-full break-all"
        style={{ color: linkColor, textDecoration: 'underline', overflowWrap: 'anywhere' }}
      >
        <Linkedin className="w-3 h-3 shrink-0" style={{ color: iconColor }} />
        <span>{formatShortUrl(personal.linkedinUrl)}</span>
      </a>
    );
  }

  if (personal.githubUrl && personal.githubUrl.trim()) {
    line2.push(
      <a
        key="github"
        href={ensureAbsoluteUrl(personal.githubUrl)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 underline font-medium max-w-full break-all"
        style={{ color: linkColor, textDecoration: 'underline', overflowWrap: 'anywhere' }}
      >
        <Github className="w-3 h-3 shrink-0" style={{ color: iconColor }} />
        <span>{formatShortUrl(personal.githubUrl)}</span>
      </a>
    );
  }

  if (personal.portfolioUrl && personal.portfolioUrl.trim()) {
    line2.push(
      <a
        key="portfolio"
        href={ensureAbsoluteUrl(personal.portfolioUrl)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 underline font-medium max-w-full break-all"
        style={{ color: linkColor, textDecoration: 'underline', overflowWrap: 'anywhere' }}
      >
        <Globe className="w-3 h-3 shrink-0" style={{ color: iconColor }} />
        <span>{formatShortUrl(personal.portfolioUrl)}</span>
      </a>
    );
  }

  return (
    <div className="space-y-1 text-[9pt] leading-snug w-full max-w-full break-words pt-1">
      {line1.length > 0 && (
        <div
          className={`flex flex-wrap items-center gap-x-4 gap-y-1 w-full max-w-full ${alignClass}`}
          style={{ display: 'flex', flexWrap: 'wrap' }}
        >
          {line1}
        </div>
      )}
      {line2.length > 0 && (
        <div
          className={`flex flex-wrap items-center gap-x-4 gap-y-1 w-full max-w-full ${alignClass}`}
          style={{ display: 'flex', flexWrap: 'wrap' }}
        >
          {line2}
        </div>
      )}
    </div>
  );
};

// =========================================================================
// HELPER: Dynamic Section Renderer with Section Icons & Thin Accent Line
// =========================================================================
interface SectionRendererProps {
  sectionId: ResumeSectionId;
  data: ResumeData;
  accentColor: string;
  template: ResumeTemplateId;
}

const RenderSectionBlock: React.FC<SectionRendererProps> = ({
  sectionId,
  data,
  accentColor,
}) => {
  const { objective, education, skills, projects, experience, certifications, achievements, extra } = data;

  const SectionHeading: React.FC<{ icon: React.ReactNode; title: string }> = ({ icon, title }) => (
    <h2
      className="text-[10.5pt] font-bold uppercase tracking-wider text-gray-900 border-b pb-0.5 mb-1.5 flex items-center gap-1.5"
      style={{ borderColor: accentColor }}
    >
      <span style={{ color: accentColor }} className="inline-flex items-center shrink-0">
        {icon}
      </span>
      <span>{title}</span>
    </h2>
  );

  switch (sectionId) {
    case 'summary':
      if (!objective || !objective.trim()) return null;
      return (
        <section className="resume-entry page-break-inside-avoid">
          <SectionHeading
            icon={<User className="w-3.5 h-3.5" />}
            title="Professional Summary"
          />
          <p
            className="text-gray-800 leading-snug text-justify whitespace-pre-line break-words overflow-visible"
            style={{
              display: 'block',
              overflow: 'visible',
              textOverflow: 'clip',
              WebkitLineClamp: 'unset',
            }}
          >
            {objective.trim()}
          </p>
        </section>
      );

    case 'education': {
      const validHigher = (education.higherEducation || []).filter(
        e => (e.degree && e.degree.trim()) || (e.institution && e.institution.trim())
      );
      const hasTwelfth = Boolean(education.twelfth?.schoolName?.trim());
      const hasTenth = Boolean(education.tenth?.schoolName?.trim());

      if (validHigher.length === 0 && !hasTwelfth && !hasTenth) return null;

      return (
        <section>
          <SectionHeading
            icon={<GraduationCap className="w-3.5 h-3.5" />}
            title="Education"
          />
          <div className="space-y-2">
            {validHigher.map(edu => {
              const cleanDegree = deduplicateDegreeText(edu.degree);
              const rawInst = preserveAcronymsAndSmallWords(edu.institution);
              // Prevent "B.Tech — B.Tech" if institution or fieldOfStudy duplicates degree
              const showInstitution =
                rawInst &&
                rawInst.toLowerCase() !== cleanDegree.toLowerCase() &&
                !cleanDegree.toLowerCase().endsWith(rawInst.toLowerCase());

              return (
                <div
                  key={edu.id}
                  className="flex justify-between items-baseline gap-3 resume-entry page-break-inside-avoid"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    gap: '12px',
                  }}
                >
                  <div className="min-w-0 flex-1 break-words">
                    <span className="font-bold text-gray-900">{cleanDegree}</span>
                    {showInstitution && (
                      <span className="text-gray-700"> — {rawInst}</span>
                    )}
                    {edu.city?.trim() && (
                      <span className="text-gray-600 text-[9pt]">
                        , {preserveAcronymsAndSmallWords(edu.city)}
                      </span>
                    )}
                    {edu.score?.trim() && (
                      <span className="ml-2 text-[9pt] font-bold text-gray-800">
                        • {edu.scoreType}: {edu.score}
                      </span>
                    )}
                  </div>
                  <div
                    className="text-[9pt] text-gray-700 font-semibold whitespace-nowrap shrink-0 text-right"
                    style={{ flexShrink: 0 }}
                  >
                    {edu.startYear ? `${edu.startYear} – ` : ''}
                    {edu.endYear}
                  </div>
                </div>
              );
            })}

            {(hasTwelfth || hasTenth) && (
              <div className="pt-1 space-y-0.5 text-[9.5pt] text-gray-700 resume-entry page-break-inside-avoid">
                {hasTwelfth && (
                  <div
                    className="flex justify-between items-baseline gap-3"
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      gap: '12px',
                    }}
                  >
                    <span className="min-w-0 flex-1 break-words">
                      <strong className="text-gray-900">
                        Class XII ({preserveAcronymsAndSmallWords(education.twelfth.boardOrStream)}):
                      </strong>{' '}
                      {preserveAcronymsAndSmallWords(education.twelfth.schoolName)}
                      {education.twelfth.score ? ` (${education.twelfth.score})` : ''}
                    </span>
                    <span className="font-medium text-gray-700 whitespace-nowrap shrink-0">
                      {education.twelfth.year}
                    </span>
                  </div>
                )}
                {hasTenth && (
                  <div
                    className="flex justify-between items-baseline gap-3"
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      gap: '12px',
                    }}
                  >
                    <span className="min-w-0 flex-1 break-words">
                      <strong className="text-gray-900">
                        Class X ({preserveAcronymsAndSmallWords(education.tenth.boardOrStream)}):
                      </strong>{' '}
                      {preserveAcronymsAndSmallWords(education.tenth.schoolName)}
                      {education.tenth.score ? ` (${education.tenth.score})` : ''}
                    </span>
                    <span className="font-medium text-gray-700 whitespace-nowrap shrink-0">
                      {education.tenth.year}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      );
    }

    case 'skills': {
      const mergedTech = [
        ...(skills.technical || []),
        ...(skills.frameworks || []),
        ...(skills.aiLlm || []),
        ...(skills.cloudDevops || []),
      ]
        .map(s => s.trim())
        .filter(Boolean);
      const uniqueTech = Array.from(new Set(mergedTech));
      const toolsList = Array.from(new Set((skills.tools || []).map(s => s.trim()).filter(Boolean)));
      const softList = Array.from(new Set((skills.soft || []).map(s => s.trim()).filter(Boolean)));
      const langList = Array.from(new Set((skills.languages || []).map(s => s.trim()).filter(Boolean)));

      if (
        uniqueTech.length === 0 &&
        toolsList.length === 0 &&
        softList.length === 0 &&
        langList.length === 0
      ) {
        return null;
      }

      return (
        <section className="resume-entry page-break-inside-avoid">
          <SectionHeading
            icon={<Code2 className="w-3.5 h-3.5" />}
            title="Skills Summary"
          />
          <div className="space-y-1">
            {uniqueTech.length > 0 && (
              <div>
                <span className="font-bold text-gray-900">Languages & Frameworks: </span>
                <span className="text-gray-800">{uniqueTech.join(', ')}</span>
              </div>
            )}
            {toolsList.length > 0 && (
              <div>
                <span className="font-bold text-gray-900">Tools & Platforms: </span>
                <span className="text-gray-800">{toolsList.join(', ')}</span>
              </div>
            )}
            {softList.length > 0 && (
              <div>
                <span className="font-bold text-gray-900">Soft Skills: </span>
                <span className="text-gray-800">{softList.join(', ')}</span>
              </div>
            )}
            {langList.length > 0 && (
              <div>
                <span className="font-bold text-gray-900">Languages: </span>
                <span className="text-gray-800">{langList.join(', ')}</span>
              </div>
            )}
          </div>
        </section>
      );
    }

    case 'projects': {
      const validProjects = (projects || []).filter(
        p => (p.title && p.title.trim()) || (p.description && p.description.trim())
      );
      if (validProjects.length === 0) return null;

      return (
        <section>
          <SectionHeading
            icon={<FolderGit2 className="w-3.5 h-3.5" />}
            title="Key Projects"
          />
          <div className="space-y-2.5">
            {validProjects.map(p => (
              <div key={p.id} className="space-y-0.5 resume-entry page-break-inside-avoid">
                <div
                  className="flex justify-between items-baseline gap-3"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    gap: '12px',
                  }}
                >
                  <div className="flex items-baseline gap-2 flex-wrap min-w-0 flex-1">
                    <span className="font-bold text-gray-900">{p.title}</span>
                    {p.title.includes('(Example)') && (
                      <span className="text-[8pt] font-bold text-amber-700 bg-amber-100 border border-amber-300 px-1 py-0.2 rounded print:hidden">
                        Example
                      </span>
                    )}
                    {p.technologies.length > 0 && (
                      <span
                        className="text-[9pt] font-semibold"
                        style={{ color: accentColor }}
                      >
                        [{p.technologies.join(', ')}]
                      </span>
                    )}
                  </div>
                  <div
                    className="flex items-center gap-2.5 text-[9pt] whitespace-nowrap shrink-0"
                    style={{ flexShrink: 0 }}
                  >
                    {p.githubUrl && p.githubUrl.trim() && (
                      <a
                        href={ensureAbsoluteUrl(p.githubUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-0.5 underline font-medium"
                        style={{ color: accentColor, textDecoration: 'underline' }}
                      >
                        <Github className="w-2.5 h-2.5 shrink-0" style={{ color: accentColor }} />
                        <span>{formatShortUrl(p.githubUrl)}</span>
                      </a>
                    )}
                    {p.liveUrl && p.liveUrl.trim() && (
                      <a
                        href={ensureAbsoluteUrl(p.liveUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-0.5 underline font-medium"
                        style={{ color: accentColor, textDecoration: 'underline' }}
                      >
                        <ExternalLink className="w-2.5 h-2.5 shrink-0" style={{ color: accentColor }} />
                        <span>Demo</span>
                      </a>
                    )}
                  </div>
                </div>
                <p className="text-gray-800 leading-snug whitespace-pre-line break-words">
                  {p.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      );
    }

    case 'experience': {
      const validExp = (experience || []).filter(
        exp => (exp.role && exp.role.trim()) || (exp.company && exp.company.trim())
      );
      if (validExp.length === 0) return null;

      return (
        <section>
          <SectionHeading
            icon={<Briefcase className="w-3.5 h-3.5" />}
            title="Experience & Internships"
          />
          <div className="space-y-2.5">
            {validExp.map(exp => (
              <div key={exp.id} className="space-y-0.5 resume-entry page-break-inside-avoid">
                <div
                  className="flex justify-between items-baseline gap-3 w-full"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    gap: '12px',
                  }}
                >
                  <div className="min-w-0 flex-1 break-words">
                    <span className="font-bold text-gray-900">
                      {preserveAcronymsAndSmallWords(exp.role)}
                    </span>
                    {exp.company && exp.company.trim() && (
                      <span className="text-gray-800 font-medium">
                        {' '}| {preserveAcronymsAndSmallWords(exp.company)}
                      </span>
                    )}
                    {exp.company.includes('(Example)') && (
                      <span className="ml-1.5 text-[8pt] font-bold text-amber-700 bg-amber-100 border border-amber-300 px-1 py-0.2 rounded print:hidden">
                        Example
                      </span>
                    )}
                    {exp.location && exp.location.trim() && (
                      <span className="text-gray-600 text-[9pt]">
                        {' '}({preserveAcronymsAndSmallWords(exp.location)})
                      </span>
                    )}
                  </div>
                  {exp.duration && exp.duration.trim() && (
                    <span
                      className="text-[9pt] font-semibold whitespace-nowrap shrink-0 text-right"
                      style={{ color: accentColor, flexShrink: 0 }}
                    >
                      {exp.duration}
                    </span>
                  )}
                </div>
                <div className="text-gray-800 leading-snug whitespace-pre-line break-words">
                  {exp.description}
                </div>
              </div>
            ))}
          </div>
        </section>
      );
    }

    case 'certifications': {
      const seenCertKeys = new Set<string>();
      const validCerts = (certifications || []).filter(c => {
        const cleanName = (c.name || '').trim();
        if (!cleanName) return false;
        const dedupeKey = `${cleanName.toLowerCase()}|${(c.issuer || '').trim().toLowerCase()}`;
        if (seenCertKeys.has(dedupeKey)) return false;
        seenCertKeys.add(dedupeKey);
        return true;
      });
      if (validCerts.length === 0) return null;

      return (
        <section className="resume-entry page-break-inside-avoid">
          <SectionHeading
            icon={<Award className="w-3.5 h-3.5" />}
            title="Certifications & Courses"
          />
          <ul className="list-disc list-inside space-y-0.5 text-gray-800">
            {validCerts.map(c => (
              <li key={c.id} className="break-words">
                {c.certificateLink && c.certificateLink.trim() ? (
                  <a
                    href={ensureAbsoluteUrl(c.certificateLink)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold underline"
                    style={{ color: accentColor, textDecoration: 'underline' }}
                  >
                    {c.name.trim()}
                  </a>
                ) : (
                  <span className="font-semibold text-gray-900">{c.name.trim()}</span>
                )}
                {c.issuer && c.issuer.trim() && (
                  <span> — {preserveAcronymsAndSmallWords(c.issuer)}</span>
                )}
                {c.year && c.year.trim() && (
                  <span className="text-gray-600 text-[9pt]"> ({c.year.trim()})</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      );
    }

    case 'achievements': {
      const seenAchKeys = new Set<string>();
      const validAch = (achievements || []).filter(a => {
        const cleanTitle = (a.title || '').trim();
        if (!cleanTitle) return false;
        const dedupeKey = `${cleanTitle.toLowerCase()}|${(a.organization || '').trim().toLowerCase()}`;
        if (seenAchKeys.has(dedupeKey)) return false;
        seenAchKeys.add(dedupeKey);
        return true;
      });
      if (validAch.length === 0) return null;

      return (
        <section className="resume-entry page-break-inside-avoid">
          <SectionHeading
            icon={<Award className="w-3.5 h-3.5" />}
            title="Achievements & Honors"
          />
          <ul className="list-disc list-inside space-y-0.5 text-gray-800">
            {validAch.map(a => (
              <li key={a.id} className="break-words">
                <span className="font-semibold text-gray-900">{a.title}</span>
                {a.title.includes('(Example)') && (
                  <span className="ml-1.5 text-[8pt] font-bold text-amber-700 bg-amber-100 border border-amber-300 px-1 py-0.2 rounded print:hidden">
                    Example
                  </span>
                )}
                {a.organization && <span>, {preserveAcronymsAndSmallWords(a.organization)}</span>}
                {a.year && <span className="text-gray-600 text-[9pt]"> ({a.year})</span>}
                {a.description && <span> — {a.description}</span>}
              </li>
            ))}
          </ul>
        </section>
      );
    }

    case 'extra':
      if (
        !extra?.volunteering &&
        !extra?.extracurriculars &&
        !extra?.hobbies &&
        !extra?.references &&
        !extra?.spokenLanguages
      ) {
        return null;
      }
      return (
        <section className="resume-entry page-break-inside-avoid">
          <SectionHeading
            icon={<Layers className="w-3.5 h-3.5" />}
            title="Additional Information"
          />
          <div className="space-y-0.5 text-gray-800">
            {extra.spokenLanguages && (
              <div>
                <strong className="text-gray-900">Spoken Languages:</strong> {extra.spokenLanguages}
              </div>
            )}
            {extra.volunteering && (
              <div>
                <strong className="text-gray-900">Volunteering:</strong> {extra.volunteering}
              </div>
            )}
            {extra.extracurriculars && (
              <div>
                <strong className="text-gray-900">Extracurriculars:</strong> {extra.extracurriculars}
              </div>
            )}
            {extra.hobbies && (
              <div>
                <strong className="text-gray-900">Interests:</strong> {extra.hobbies}
              </div>
            )}
            {extra.references && (
              <div>
                <strong className="text-gray-900">References:</strong> {extra.references}
              </div>
            )}
          </div>
        </section>
      );

    default:
      return null;
  }
};

// =========================================================================
// 1. MODERN TECH TEMPLATE (Left-aligned header with degree line, 2-line contact bar with icons)
// =========================================================================
const ModernTechView: React.FC<{
  data: ResumeData;
  accentColor: string;
  spacing: 'compact' | 'normal' | 'relaxed';
}> = ({ data, accentColor, spacing }) => {
  const { personal, education, formatting } = data;
  const headerAlign = formatting.headerAlignment || 'left';
  const gapClass =
    spacing === 'compact' ? 'space-y-2.5' : spacing === 'relaxed' ? 'space-y-5' : 'space-y-3.5';

  const sectionOrder = getOrderedSections(formatting.sectionOrder);
  const visible = formatting.visibleSections || {
    summary: true,
    education: true,
    skills: true,
    projects: true,
    experience: true,
    certifications: true,
    achievements: true,
    extra: false,
  };

  return (
    <div className={gapClass}>
      {/* Header Block (div instead of header to avoid global print CSS conflicts) */}
      <div
        role="region"
        aria-label="Candidate Header"
        className={`resume-header border-b-2 pb-2.5 ${
          headerAlign === 'center' ? 'text-center' : 'text-left'
        }`}
        style={{ borderColor: accentColor }}
      >
        <div className="space-y-0.5">
          <h1
            className="text-2xl font-extrabold tracking-tight uppercase"
            style={{ color: accentColor }}
          >
            {personal.fullName || 'Shivam Tiwari'}
          </h1>
          {education.higherEducation[0]?.degree && (
            <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              {deduplicateDegreeText(education.higherEducation[0].degree)}
            </p>
          )}
        </div>

        <ContactLinksBar
          personal={personal}
          accentColor={accentColor}
          align={headerAlign}
        />
      </div>

      {/* Dynamic Sections */}
      {sectionOrder.map(secId => {
        if (visible[secId] === false) return null;
        return (
          <RenderSectionBlock
            key={secId}
            sectionId={secId}
            data={data}
            accentColor={accentColor}
            template="modern-tech"
          />
        );
      })}
    </div>
  );
};

// =========================================================================
// 2. MINIMAL CLASSIC TEMPLATE
// =========================================================================
const MinimalClassicView: React.FC<{
  data: ResumeData;
  accentColor: string;
  spacing: 'compact' | 'normal' | 'relaxed';
}> = ({ data, accentColor, spacing }) => {
  const { personal, education, formatting } = data;
  const headerAlign = formatting.headerAlignment || 'left';
  const gapClass =
    spacing === 'compact' ? 'space-y-2.5' : spacing === 'relaxed' ? 'space-y-4.5' : 'space-y-3.5';

  const sectionOrder = getOrderedSections(formatting.sectionOrder);
  const visible = formatting.visibleSections || {
    summary: true,
    education: true,
    skills: true,
    projects: true,
    experience: true,
    certifications: true,
    achievements: true,
    extra: false,
  };

  return (
    <div className={gapClass}>
      <div
        role="region"
        aria-label="Candidate Header"
        className={`resume-header border-b-2 pb-2.5 ${
          headerAlign === 'center' ? 'text-center' : 'text-left'
        }`}
        style={{ borderColor: accentColor }}
      >
        <div className="space-y-0.5">
          <h1
            className="text-2xl font-bold tracking-wide uppercase"
            style={{ color: accentColor }}
          >
            {personal.fullName || 'Shivam Tiwari'}
          </h1>
          {education.higherEducation[0]?.degree && (
            <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              {deduplicateDegreeText(education.higherEducation[0].degree)}
            </p>
          )}
        </div>

        <ContactLinksBar
          personal={personal}
          accentColor={accentColor}
          align={headerAlign}
        />
      </div>

      {sectionOrder.map(secId => {
        if (visible[secId] === false) return null;
        return (
          <RenderSectionBlock
            key={secId}
            sectionId={secId}
            data={data}
            accentColor={accentColor}
            template="minimal-classic"
          />
        );
      })}
    </div>
  );
};

// =========================================================================
// 3. EXECUTIVE SLATE TEMPLATE
// =========================================================================
const ExecutiveSlateView: React.FC<{
  data: ResumeData;
  accentColor: string;
  spacing: 'compact' | 'normal' | 'relaxed';
}> = ({ data, accentColor, spacing }) => {
  const { personal, education, formatting } = data;
  const headerAlign = formatting.headerAlignment || 'left';
  const gapClass =
    spacing === 'compact' ? 'space-y-2.5' : spacing === 'relaxed' ? 'space-y-4.5' : 'space-y-3.5';

  const sectionOrder = getOrderedSections(formatting.sectionOrder);
  const visible = formatting.visibleSections || {
    summary: true,
    education: true,
    skills: true,
    projects: true,
    experience: true,
    certifications: true,
    achievements: true,
    extra: false,
  };

  return (
    <div className={gapClass}>
      <div
        role="region"
        aria-label="Candidate Header"
        className={`resume-header p-3.5 rounded-sm text-white ${
          headerAlign === 'center' ? 'text-center' : 'text-left'
        }`}
        style={{ backgroundColor: accentColor }}
      >
        <div className="space-y-0.5">
          <h1 className="text-2xl font-extrabold tracking-tight uppercase">
            {personal.fullName || 'Shivam Tiwari'}
          </h1>
          {education.higherEducation[0]?.degree && (
            <p className="text-xs font-medium opacity-90 uppercase tracking-wider">
              {deduplicateDegreeText(education.higherEducation[0].degree)}
            </p>
          )}
        </div>

        <ContactLinksBar
          personal={personal}
          accentColor={accentColor}
          align={headerAlign}
          lightMode={true}
        />
      </div>

      {sectionOrder.map(secId => {
        if (visible[secId] === false) return null;
        return (
          <RenderSectionBlock
            key={secId}
            sectionId={secId}
            data={data}
            accentColor={accentColor}
            template="executive-slate"
          />
        );
      })}
    </div>
  );
};

// =========================================================================
// 4. CREATIVE DEVELOPER TEMPLATE
// =========================================================================
const CreativeDeveloperView: React.FC<{
  data: ResumeData;
  accentColor: string;
  spacing: 'compact' | 'normal' | 'relaxed';
}> = ({ data, accentColor, spacing }) => {
  const { personal, education, formatting } = data;
  const headerAlign = formatting.headerAlignment || 'left';
  const gapClass =
    spacing === 'compact' ? 'space-y-2.5' : spacing === 'relaxed' ? 'space-y-4.5' : 'space-y-3.5';

  const sectionOrder = getOrderedSections(formatting.sectionOrder);
  const visible = formatting.visibleSections || {
    summary: true,
    education: true,
    skills: true,
    projects: true,
    experience: true,
    certifications: true,
    achievements: true,
    extra: false,
  };

  return (
    <div className={gapClass}>
      <div
        role="region"
        aria-label="Candidate Header"
        className={`resume-header bg-gray-950 text-white p-3.5 rounded-md border-l-4 ${
          headerAlign === 'center' ? 'text-center' : 'text-left'
        }`}
        style={{ borderLeftColor: accentColor }}
      >
        <div className="space-y-0.5">
          <div
            className="text-[8pt] uppercase tracking-widest opacity-75 font-semibold"
            style={{ color: accentColor }}
          >
            &lt;developer_profile /&gt;
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            {personal.fullName || 'Shivam Tiwari'}
          </h1>
          {education.higherEducation[0]?.degree && (
            <p className="text-[9.5pt] text-gray-300 font-medium">
              {deduplicateDegreeText(education.higherEducation[0].degree)}
            </p>
          )}
        </div>

        <ContactLinksBar
          personal={personal}
          accentColor={accentColor}
          align={headerAlign}
          lightMode={true}
        />
      </div>

      {sectionOrder.map(secId => {
        if (visible[secId] === false) return null;
        return (
          <RenderSectionBlock
            key={secId}
            sectionId={secId}
            data={data}
            accentColor={accentColor}
            template="creative-developer"
          />
        );
      })}
    </div>
  );
};
