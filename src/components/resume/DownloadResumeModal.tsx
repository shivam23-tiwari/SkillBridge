import React, { useState, useEffect } from 'react';
import { ResumeData } from '../../types';
import { ResumeService } from '../../services/resumeService';
import { useToast } from '../../context/NotificationContext';
import { usePlan } from '../../context/PlanContext';
import { Button } from '../ui/Button';
import {
  X,
  Download,
  FileText,
  Printer,
  FileCode,
  Check,
  Lock,
  HardDrive,
  Laptop,
  FolderOpen,
} from 'lucide-react';

interface DownloadResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeData: ResumeData;
  onDownloaded?: () => void;
}

export const DownloadResumeModal: React.FC<DownloadResumeModalProps> = ({
  isOpen,
  onClose,
  resumeData,
  onDownloaded,
}) => {
  const { showToast } = useToast();
  const { canExportDocx, isWatermarkRequired, consumeFreeUse, openUpgradeModal } = usePlan();
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);

  const candidateName = resumeData.personal.fullName || 'Resume';
  const defaultFileName = `${candidateName.trim().replace(/\s+/g, '_')}_Resume`;
  const [customFileName, setCustomFileName] = useState(defaultFileName);

  useEffect(() => {
    if (isOpen) {
      const clean = (resumeData.personal.fullName || 'Resume').trim().replace(/\s+/g, '_');
      setCustomFileName(`${clean}_Resume`);
    }
  }, [isOpen, resumeData.personal.fullName]);

  if (!isOpen) return null;

  // Save PDF via OS Folder Finder ("Save As" picker) or direct PC download from the single <ResumeSheet /> renderer
  const handleSavePdfWithFolderPicker = async (useFolderPicker: boolean) => {
    const allowed = consumeFreeUse('PDF download');
    if (!allowed) return;

    const modeKey = useFolderPicker ? 'pdf-picker' : 'pdf-direct';
    setDownloadingFormat(modeKey);

    try {
      const cleanBase =
        customFileName
          .trim()
          .replace(/\.pdf$/i, '')
          .replace(/_Resume$/i, '')
          .replace(/\s+/g, '_') || 'Resume';

      document.title = `${cleanBase}_Resume`;

      const result = await ResumeService.downloadPdfToPc(
        resumeData,
        cleanBase,
        false,
        useFolderPicker
      );

      if (result.method === 'cancelled') {
        setDownloadingFormat(null);
        return;
      }

      showToast(
        'Resume PDF Saved to Computer',
        result.method === 'picker'
          ? `${cleanBase}_Resume.pdf saved to your selected folder.`
          : `${cleanBase}_Resume.pdf downloaded to your computer's Downloads folder.`
      );

      onDownloaded?.();
      setTimeout(() => {
        setDownloadingFormat(null);
        onClose();
      }, 600);
    } catch (err) {
      console.error('Failed to export PDF:', err);
      setDownloadingFormat(null);
      showToast('Download Error', 'Could not save PDF file. Please try again.');
    }
  };

  // Optional Browser Print Dialog ("Save as PDF")
  const handlePrintDialog = async () => {
    const allowed = consumeFreeUse('PDF print');
    if (!allowed) return;

    setDownloadingFormat('print');
    const cleanName = customFileName.trim().replace(/\.pdf$/i, '').replace(/\s+/g, '_');
    document.title = cleanName;
    showToast(
      'Print / Save as PDF',
      'Choose Save as PDF, Margins: None, turn on Background graphics, turn off Headers and footers.'
    );
    await ResumeService.openPrintDialog(candidateName, resumeData, false);
    onDownloaded?.();
    setTimeout(() => {
      setDownloadingFormat(null);
      onClose();
    }, 600);
  };

  const handleDownloadWordFile = () => {
    if (!canExportDocx) {
      openUpgradeModal('Word (.docx) export is available on Basic (₹99) and Premium plans.');
      return;
    }
    setDownloadingFormat('doc');
    const cleanBase = customFileName.trim().replace(/\.(pdf|doc|docx)$/i, '') || 'Resume';
    ResumeService.exportToWord(resumeData, `${cleanBase}.doc`);
    showToast(
      'Word Document Downloaded',
      `${cleanBase}.doc downloaded to your computer.`
    );
    onDownloaded?.();
    setTimeout(() => {
      setDownloadingFormat(null);
      onClose();
    }, 600);
  };

  const handleDownloadTextFile = () => {
    setDownloadingFormat('txt');
    const cleanBase = customFileName.trim().replace(/\.(pdf|txt)$/i, '') || 'Resume';
    ResumeService.downloadText(resumeData, `${cleanBase}.txt`);
    showToast('Text File Downloaded', `${cleanBase}.txt downloaded to your laptop.`);
    setTimeout(() => {
      setDownloadingFormat(null);
      onClose();
    }, 600);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-[#111115] border border-[#26262F] rounded-2xl shadow-2xl overflow-hidden text-[#F3F4F6] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-[#202026] flex items-center justify-between bg-[#141418]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#FF2D95]/15 text-[#FF2D95] border border-[#FF2D95]/30 shadow-inner">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>Save Resume to Your Laptop / PC</span>
                <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
                  True A4 PDF
                </span>
              </h2>
              <p className="text-xs text-[#8E8E9A]">
                Save your complete A4 resume directly from the live React template.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#8E8E9A] hover:text-white rounded-lg hover:bg-[#1E1E24] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 overflow-y-auto max-h-[78vh]">
          {/* Editable File Name Box */}
          <div className="bg-[#16161C] border border-[#262632] rounded-xl p-3.5 space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8E8E9A]">
              File Name to Save on Laptop
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customFileName}
                onChange={e => setCustomFileName(e.target.value)}
                className="w-full bg-[#0E0E12] border border-[#282834] focus:border-[#00A3E0] rounded-lg px-3 py-2 text-sm text-white outline-none transition-colors"
                placeholder="Shivam_Tiwari_Resume"
              />
              <span className="text-xs font-bold text-[#00A3E0] bg-[#00A3E0]/10 border border-[#00A3E0]/25 px-2.5 py-2 rounded-lg shrink-0">
                .pdf
              </span>
            </div>
          </div>

          {/* 1. Primary Option: Save PDF */}
          <div className="p-4 bg-[#16161C] border-2 border-[#00A3E0]/50 rounded-xl space-y-3.5 shadow-lg">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-[#00A3E0]/15 text-[#00A3E0] border border-[#00A3E0]/30 shrink-0 mt-0.5">
                <Laptop className="w-5 h-5" />
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-sm font-bold text-white">
                    Save Full Resume as PDF (.pdf)
                  </h4>
                  <span className="text-[10px] bg-[#00A3E0]/20 text-[#00A3E0] border border-[#00A3E0]/30 px-2 py-0.5 rounded font-semibold">
                    Recommended • 210 × 297 mm
                  </span>
                </div>
                <p className="text-xs text-[#8E8E9A] leading-relaxed">
                  Renders the exact live preview component in true A4 with clickable links, selectable text, and your chosen font.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <Button
                size="md"
                variant="primary"
                disabled={downloadingFormat !== null}
                onClick={() => handleSavePdfWithFolderPicker(true)}
                className="w-full bg-[#00A3E0] hover:bg-[#008fca] text-black font-extrabold text-xs py-2.5 gap-2 shadow cursor-pointer justify-center"
              >
                <FolderOpen className="w-4 h-4 text-black" />
                <span>
                  {downloadingFormat === 'pdf-picker'
                    ? 'Preparing Print View...'
                    : 'Save as PDF'}
                </span>
              </Button>

              <Button
                size="md"
                variant="primary"
                disabled={downloadingFormat !== null}
                onClick={() => handleSavePdfWithFolderPicker(false)}
                className="w-full bg-[#FF2D95] hover:bg-[#e02483] text-white font-extrabold text-xs py-2.5 gap-2 shadow cursor-pointer justify-center"
              >
                <Download className="w-4 h-4 text-white" />
                <span>
                  {downloadingFormat === 'pdf-direct'
                    ? 'Preparing PDF...'
                    : 'Download Resume PDF'}
                </span>
              </Button>
            </div>
          </div>

          {/* 2. Browser Print / Save as PDF */}
          <div
            onClick={handlePrintDialog}
            className="group p-3.5 bg-[#141418] hover:bg-[#18181F] border border-[#202026] hover:border-[#00A3E0]/40 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0 mt-0.5">
                <Printer className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-white group-hover:text-[#00A3E0] transition-colors">
                  Browser Print / Save as PDF Dialog
                </h4>
                <p className="text-[11px] text-[#8E8E9A]">
                  Opens system print dialog (Choose Save as PDF, Margins: None, Background graphics: On).
                </p>
              </div>
            </div>

            <Button
              size="sm"
              variant="outline"
              disabled={downloadingFormat === 'print'}
              className="text-xs shrink-0 gap-1.5 border-[#282834] text-cyan-300 hover:text-white"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print View</span>
            </Button>
          </div>

          {/* 3. Word Document (.doc) */}
          <div
            onClick={handleDownloadWordFile}
            className="group p-3.5 bg-[#141418] hover:bg-[#18181F] border border-[#202026] hover:border-indigo-500/40 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0 mt-0.5">
                <FileText className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                    Microsoft Word (.doc)
                  </h4>
                  {!canExportDocx ? (
                    <span className="text-[10px] bg-amber-500/15 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded font-mono flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" /> Basic / Premium
                    </span>
                  ) : (
                    <span className="text-[10px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded font-mono flex items-center gap-1">
                      <Check className="w-2.5 h-2.5" /> Unlocked
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#8E8E9A]">
                  Editable Word document format for recruiters requesting .doc files.
                </p>
              </div>
            </div>

            <Button
              size="sm"
              variant="outline"
              disabled={downloadingFormat === 'doc'}
              className="text-xs shrink-0 gap-1.5 border-[#282834] text-indigo-300 hover:text-white"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Save .DOC</span>
            </Button>
          </div>

          {/* 4. Plain Text (.txt) */}
          <div
            onClick={handleDownloadTextFile}
            className="group p-3.5 bg-[#141418] hover:bg-[#18181F] border border-[#202026] hover:border-gray-700 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-gray-800 text-gray-300 border border-gray-700 shrink-0 mt-0.5">
                <FileCode className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-white group-hover:text-gray-200 transition-colors">
                    Plain Text (.txt)
                  </h4>
                  <span className="text-[10px] bg-gray-800 text-gray-400 px-1.5 py-0.2 rounded font-mono">
                    Free
                  </span>
                </div>
                <p className="text-[11px] text-[#8E8E9A]">
                  Clean unformatted text for pasting into online job portals.
                </p>
              </div>
            </div>

            <Button
              size="sm"
              variant="outline"
              disabled={downloadingFormat === 'txt'}
              className="text-xs shrink-0 gap-1.5 border-[#282834] text-gray-400 hover:text-white"
            >
              <span>Save .TXT</span>
            </Button>
          </div>
        </div>

        {/* Modal Footer Note */}
        <div className="px-6 py-3.5 bg-[#141418] border-t border-[#202026] flex items-center justify-between text-xs text-[#8E8E9A]">
          <span className="flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-[#00A3E0]" />
            Saves directly to your laptop folder or Downloads directory
          </span>
          <Button variant="secondary" size="sm" onClick={onClose} className="text-xs">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

