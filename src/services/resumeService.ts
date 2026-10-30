import React from 'react';
import { flushSync } from 'react-dom';
import { createRoot, Root } from 'react-dom/client';
import { jsPDF } from 'jspdf';
import {
  ResumeData,
  ATSAnalysisResult,
  DetailedResumeAnalysis,
} from '../types';
import {
  ResumeSheet,
  toTitleCase,
  formatShortUrl,
  resolveResumeFontConfig,
  normalizeResumeFontKey,
} from '../components/resume/ResumePreview';

let standalonePrintRoot: Root | null = null;

const GOOGLE_FONTS_HREF =
  'https://fonts.googleapis.com/css2?family=Arimo:ital,wght@0,400..700;1,400..700&family=Carlito:ital,wght@0,400;0,700;1,400;1,700&family=Tinos:ital,wght@0,400;0,700;1,400;1,700&display=swap';

// Optional TrueType font cache so jsPDF embeds the exact Carlito / Arimo / Tinos font
const fontBase64Cache: Record<string, string> = {};

const TTF_FONT_URLS: Record<
  'calibri' | 'arial' | 'times',
  { normal: string; bold: string; italic: string }
> = {
  calibri: {
    normal: 'https://cdn.jsdelivr.net/gh/googlefonts/carlito@main/fonts/ttf/Carlito-Regular.ttf',
    bold: 'https://cdn.jsdelivr.net/gh/googlefonts/carlito@main/fonts/ttf/Carlito-Bold.ttf',
    italic: 'https://cdn.jsdelivr.net/gh/googlefonts/carlito@main/fonts/ttf/Carlito-Italic.ttf',
  },
  arial: {
    normal: 'https://cdn.jsdelivr.net/gh/googlefonts/carlito@main/fonts/ttf/Carlito-Regular.ttf',
    bold: 'https://cdn.jsdelivr.net/gh/googlefonts/carlito@main/fonts/ttf/Carlito-Bold.ttf',
    italic: 'https://cdn.jsdelivr.net/gh/googlefonts/carlito@main/fonts/ttf/Carlito-Italic.ttf',
  },
  times: {
    normal: 'https://cdn.jsdelivr.net/gh/google/fonts@main/apache/tinos/Tinos-Regular.ttf',
    bold: 'https://cdn.jsdelivr.net/gh/google/fonts@main/apache/tinos/Tinos-Bold.ttf',
    italic: 'https://cdn.jsdelivr.net/gh/google/fonts@main/apache/tinos/Tinos-Italic.ttf',
  },
};

async function fetchFontAsBase64(url: string): Promise<string | null> {
  if (fontBase64Cache[url]) return fontBase64Cache[url];
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2200);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    const bytes = new Uint8Array(buf);
    let binary = '';
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
    }
    const b64 = btoa(binary);
    fontBase64Cache[url] = b64;
    return b64;
  } catch {
    return null;
  }
}

async function registerPdfFonts(
  doc: jsPDF,
  fontKey: 'calibri' | 'arial' | 'times'
): Promise<{ pdfFontName: string; isUnicodeTtf: boolean }> {
  // For Arial / Helvetica and Times New Roman, PDF viewers have built-in metric-identical vector fonts,
  // while for Calibri (Carlito) we load Carlito TTF so the metrics match 100%.
  const urls = TTF_FONT_URLS[fontKey];
  if (urls) {
    const [normalB64, boldB64, italicB64] = await Promise.all([
      fetchFontAsBase64(urls.normal),
      fetchFontAsBase64(urls.bold),
      fetchFontAsBase64(urls.italic),
    ]);
    if (normalB64 && boldB64) {
      const familyName = `ResumeFont_${fontKey}`;
      doc.addFileToVFS(`${familyName}-Regular.ttf`, normalB64);
      doc.addFont(`${familyName}-Regular.ttf`, familyName, 'normal');
      doc.addFileToVFS(`${familyName}-Bold.ttf`, boldB64);
      doc.addFont(`${familyName}-Bold.ttf`, familyName, 'bold');
      if (italicB64) {
        doc.addFileToVFS(`${familyName}-Italic.ttf`, italicB64);
        doc.addFont(`${familyName}-Italic.ttf`, familyName, 'italic');
        doc.addFont(`${familyName}-Bold.ttf`, familyName, 'bolditalic');
      } else {
        doc.addFont(`${familyName}-Regular.ttf`, familyName, 'italic');
        doc.addFont(`${familyName}-Bold.ttf`, familyName, 'bolditalic');
      }
      return { pdfFontName: familyName, isUnicodeTtf: true };
    }
  }

  // Built-in vector fallback (never courier/monospace)
  return {
    pdfFontName: fontKey === 'times' ? 'times' : 'helvetica',
    isUnicodeTtf: false,
  };
}

async function waitForFontLoad(doc: Document, fontName: string): Promise<void> {
  if (!('fonts' in doc) || !doc.fonts) return;
  const loadPromise = (async () => {
    try {
      await doc.fonts.load(`400 12px "${fontName}"`);
      await doc.fonts.load(`700 12px "${fontName}"`);
      await doc.fonts.ready;
    } catch {
      // Ignore font load errors and proceed
    }
  })();

  const timeoutPromise = new Promise<void>(resolve => {
    setTimeout(resolve, 2500);
  });

  await Promise.race([loadPromise, timeoutPromise]);
}

interface ParsedColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

function parseCssColor(
  cssColor: string | null | undefined,
  bgR = 255,
  bgG = 255,
  bgB = 255
): ParsedColor {
  if (!cssColor || cssColor === 'transparent') {
    return { r: bgR, g: bgG, b: bgB, a: 0 };
  }
  const rgbaMatch = cssColor.match(
    /rgba?\(\s*(\d+(?:\.\d+)?)\s*[\s,]\s*(\d+(?:\.\d+)?)\s*[\s,]\s*(\d+(?:\.\d+)?)(?:\s*[,/]\s*(\d+(?:\.\d+)?))?\s*\)/i
  );
  if (rgbaMatch) {
    const rawR = Number(rgbaMatch[1]);
    const rawG = Number(rgbaMatch[2]);
    const rawB = Number(rgbaMatch[3]);
    const a = rgbaMatch[4] !== undefined ? Number(rgbaMatch[4]) : 1;
    if (a <= 0.005) return { r: bgR, g: bgG, b: bgB, a: 0 };
    // Alpha-blend over the background color so pastel tints (e.g. rgba(255,45,149,0.08)) match the live preview
    return {
      r: Math.round(rawR * a + bgR * (1 - a)),
      g: Math.round(rawG * a + bgG * (1 - a)),
      b: Math.round(rawB * a + bgB * (1 - a)),
      a,
    };
  }
  if (cssColor.startsWith('#')) {
    const clean = cssColor.replace('#', '');
    const full =
      clean.length === 3
        ? clean
            .split('')
            .map(c => c + c)
            .join('')
        : clean.padEnd(6, '0').slice(0, 6);
    const num = parseInt(full, 16);
    if (!Number.isNaN(num)) {
      return {
        r: (num >> 16) & 255,
        g: (num >> 8) & 255,
        b: num & 255,
        a: 1,
      };
    }
  }
  return { r: 17, g: 24, b: 39, a: 1 };
}

function sanitizeForWinAnsi(text: string, isUnicodeTtf: boolean): string {
  const replaced = text
    .replace(/\u25B8|\u25B6|\u25AA|\u25CF/g, '•')
    .replace(/\u20B9/g, isUnicodeTtf ? '₹' : 'Rs.');
  if (isUnicodeTtf) return replaced;
  return replaced
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"');
}

async function renderSvgToPngDataUrl(
  svgEl: SVGSVGElement,
  strokeColorCss: string
): Promise<string | null> {
  try {
    const rect = svgEl.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;
    const cloned = svgEl.cloneNode(true) as SVGSVGElement;
    cloned.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    cloned.setAttribute('width', '64');
    cloned.setAttribute('height', '64');
    cloned.style.color = strokeColorCss;
    cloned.setAttribute('stroke', strokeColorCss);
    cloned.querySelectorAll('*').forEach(child => {
      const strokeAttr = child.getAttribute('stroke');
      if (!strokeAttr || strokeAttr === 'currentColor') {
        child.setAttribute('stroke', strokeColorCss);
      }
    });

    const xml = new XMLSerializer().serializeToString(cloned);
    const svgBlob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    return await new Promise<string | null>(resolve => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, 64, 64);
          URL.revokeObjectURL(url);
          resolve(canvas.toDataURL('image/png'));
        } else {
          URL.revokeObjectURL(url);
          resolve(null);
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(null);
      };
      img.src = url;
    });
  } catch {
    return null;
  }
}

function isHiddenOrIgnored(el: Element | null): boolean {
  let curr: Element | null = el;
  while (curr && curr.id !== 'resume-print-root') {
    if (curr instanceof HTMLElement || curr instanceof SVGElement) {
      if (
        curr.classList.contains('print:hidden') ||
        curr.classList.contains('resume-watermark-overlay')
      ) {
        return true;
      }
      const style = window.getComputedStyle(curr);
      if (
        style.display === 'none' ||
        style.visibility === 'hidden' ||
        parseFloat(style.opacity || '1') === 0
      ) {
        return true;
      }
    }
    curr = curr.parentElement;
  }
  return false;
}

/**
 * Ensures `#resume-print-root` contains the up-to-date rendered `<ResumeSheet />`
 * at exact 1:1 A4 size (794px x 1123px) and returns the `.resume-page` element.
 */
function ensureRenderedResumePageElement(
  data: ResumeData,
  isWatermarkRequired: boolean
): HTMLElement | null {
  let printContainer = document.getElementById('resume-print-root');
  if (!printContainer) {
    printContainer = document.createElement('div');
    printContainer.id = 'resume-print-root';
    printContainer.setAttribute('aria-hidden', 'true');
    document.body.appendChild(printContainer);
  }

  // Always mount or update our dedicated off-screen render node so it is guaranteed
  // to have the latest `data` even on pages where <ResumePreview /> isn't mounted.
  let fallbackMount = document.getElementById('resume-print-fallback-mount');
  if (!fallbackMount) {
    fallbackMount = document.createElement('div');
    fallbackMount.id = 'resume-print-fallback-mount';
    printContainer.appendChild(fallbackMount);
    standalonePrintRoot = createRoot(fallbackMount);
  }

  if (standalonePrintRoot) {
    flushSync(() => {
      standalonePrintRoot?.render(
        React.createElement(ResumeSheet, {
          data,
          scale: 1,
          isWatermarkRequired,
          isPrintMode: true,
          pageCount: 1,
        })
      );
    });
  }

  const fallbackSheet = fallbackMount?.querySelector('.resume-page') as HTMLElement | null;
  if (fallbackSheet) return fallbackSheet;

  return printContainer.querySelector('.resume-page') as HTMLElement | null;
}

/**
 * Builds a true-A4 vector PDF directly from the live rendered `<ResumeSheet />` DOM element
 * (`.resume-page`). Every background, border, icon, wrapped text line, and clickable `<a href>`
 * link is read directly from the browser's computed layout of `<ResumeSheet />`.
 */
async function generatePdfBlobFromResumeDom(
  data: ResumeData,
  isWatermarkRequired = false
): Promise<Blob> {
  const fontKey = normalizeResumeFontKey(data.formatting?.fontFamily);
  const fontConfig = resolveResumeFontConfig(fontKey);

  // Wait for Google Fonts (Carlito / Arimo / Tinos) in the browser DOM first
  await waitForFontLoad(document, fontConfig.googleFontName);

  const resumePageEl = ensureRenderedResumePageElement(data, isWatermarkRequired);
  if (!resumePageEl) {
    throw new Error('Could not find rendered .resume-page element.');
  }

  const rootRect = resumePageEl.getBoundingClientRect();
  const rootWidthPx = rootRect.width || 794;
  const pxToMmX = 210 / rootWidthPx;
  const pxToMmY = 297 / 1123;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const { pdfFontName, isUnicodeTtf } = await registerPdfFonts(doc, fontKey);

  const ensurePageForY = (yMm: number): { pageNum: number; localY: number } => {
    const pageNum = data.formatting?.fitToOnePage
      ? 1
      : Math.max(1, Math.floor(Math.max(0, yMm - 0.5) / 297) + 1);
    while (doc.getNumberOfPages() < pageNum) {
      doc.addPage('a4', 'portrait');
    }
    doc.setPage(pageNum);
    const localY = pageNum === 1 ? yMm : yMm - (pageNum - 1) * 297;
    return { pageNum, localY };
  };

  // 1. Walk all HTMLElements inside .resume-page to draw backgrounds and borders
  const allElements = Array.from(resumePageEl.querySelectorAll('*'));
  for (const el of allElements) {
    if (!(el instanceof HTMLElement)) continue;
    if (isHiddenOrIgnored(el)) continue;

    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) continue;

    const style = window.getComputedStyle(el);
    const x = (rect.left - rootRect.left) * pxToMmX;
    const y = (rect.top - rootRect.top) * pxToMmY;
    const w = rect.width * pxToMmX;
    const h = rect.height * pxToMmY;
    const { localY } = ensurePageForY(y);
    const radiusMm = Math.min(
      w / 2,
      h / 2,
      (parseFloat(style.borderTopLeftRadius) || 0) * pxToMmX
    );

    // Draw background if non-transparent and not pure white
    const bg = parseCssColor(style.backgroundColor);
    if (bg.a > 0.01 && !(bg.r === 255 && bg.g === 255 && bg.b === 255)) {
      doc.setFillColor(bg.r, bg.g, bg.b);
      if (radiusMm > 0.2) {
        doc.roundedRect(x, localY, w, h, radiusMm, radiusMm, 'F');
      } else {
        doc.rect(x, localY, w, h, 'F');
      }
    }

    // Draw borders
    const bt = parseFloat(style.borderTopWidth) || 0;
    const bb = parseFloat(style.borderBottomWidth) || 0;
    const bl = parseFloat(style.borderLeftWidth) || 0;
    const br = parseFloat(style.borderRightWidth) || 0;

    const hasTop = bt > 0 && style.borderTopStyle !== 'none';
    const hasBottom = bb > 0 && style.borderBottomStyle !== 'none';
    const hasLeft = bl > 0 && style.borderLeftStyle !== 'none';
    const hasRight = br > 0 && style.borderRightStyle !== 'none';

    if (hasTop && hasBottom && hasLeft && hasRight && bt === bb && bt === bl && bt === br) {
      const bc = parseCssColor(style.borderTopColor);
      if (bc.a > 0.01) {
        doc.setDrawColor(bc.r, bc.g, bc.b);
        doc.setLineWidth(Math.max(0.15, bt * pxToMmX));
        if (radiusMm > 0.2) {
          doc.roundedRect(x, localY, w, h, radiusMm, radiusMm, 'S');
        } else {
          doc.rect(x, localY, w, h, 'S');
        }
      }
    } else {
      if (hasTop) {
        const bc = parseCssColor(style.borderTopColor);
        if (bc.a > 0.01) {
          doc.setDrawColor(bc.r, bc.g, bc.b);
          doc.setLineWidth(Math.max(0.2, bt * pxToMmX));
          doc.line(x, localY, x + w, localY);
        }
      }
      if (hasBottom) {
        const bc = parseCssColor(style.borderBottomColor);
        if (bc.a > 0.01) {
          doc.setDrawColor(bc.r, bc.g, bc.b);
          doc.setLineWidth(Math.max(0.2, bb * pxToMmX));
          doc.line(x, localY + h, x + w, localY + h);
        }
      }
      if (hasLeft) {
        const bc = parseCssColor(style.borderLeftColor);
        if (bc.a > 0.01) {
          doc.setDrawColor(bc.r, bc.g, bc.b);
          doc.setLineWidth(Math.max(0.25, bl * pxToMmX));
          doc.line(x, localY, x, localY + h);
        }
      }
      if (hasRight) {
        const bc = parseCssColor(style.borderRightColor);
        if (bc.a > 0.01) {
          doc.setDrawColor(bc.r, bc.g, bc.b);
          doc.setLineWidth(Math.max(0.2, br * pxToMmX));
          doc.line(x + w, localY, x + w, localY + h);
        }
      }
    }
  }

  // 2. Render SVG icons in their exact computed stroke colors
  const svgElements = Array.from(resumePageEl.querySelectorAll('svg'));
  for (const svgEl of svgElements) {
    if (isHiddenOrIgnored(svgEl)) continue;
    const rect = svgEl.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) continue;
    const style = window.getComputedStyle(svgEl);
    const pngDataUrl = await renderSvgToPngDataUrl(svgEl, style.color || '#FF2D95');
    if (pngDataUrl) {
      const x = (rect.left - rootRect.left) * pxToMmX;
      const y = (rect.top - rootRect.top) * pxToMmY;
      const w = rect.width * pxToMmX;
      const h = rect.height * pxToMmY;
      const { localY } = ensurePageForY(y);
      doc.addImage(pngDataUrl, 'PNG', x, localY, w, h);
    }
  }

  // 3. Walk all Text nodes and extract exact browser-wrapped visual lines via Range.getBoundingClientRect()
  const treeWalker = document.createTreeWalker(resumePageEl, NodeFilter.SHOW_TEXT);
  const textRange = document.createRange();

  let currentNode = treeWalker.nextNode();
  while (currentNode) {
    const textNode = currentNode as Text;
    currentNode = treeWalker.nextNode();

    const parentEl = textNode.parentElement;
    if (!parentEl) continue;
    if (parentEl.closest('svg, script, style')) continue;
    if (isHiddenOrIgnored(parentEl)) continue;

    const rawValue = textNode.nodeValue || '';
    if (!rawValue.trim()) continue;

    const style = window.getComputedStyle(parentEl);
    const fontSizePx = parseFloat(style.fontSize) || 13.33;
    const fontSizePt = fontSizePx * 0.75;
    const weightNum = parseInt(style.fontWeight || '400', 10);
    const isBold =
      weightNum >= 600 || style.fontWeight === 'bold' || style.fontWeight === 'bolder';
    const isItalic = style.fontStyle === 'italic' || style.fontStyle === 'oblique';
    const fontVariant: 'normal' | 'bold' | 'italic' | 'bolditalic' =
      isBold && isItalic
        ? 'bolditalic'
        : isBold
        ? 'bold'
        : isItalic
        ? 'italic'
        : 'normal';

    const textColor = parseCssColor(style.color);
    const isUnderlined =
      style.textDecorationLine.includes('underline') || Boolean(parentEl.closest('a'));

    // Tokenize words with character offsets so we can group words into exact browser-wrapped lines
    const tokens: { start: number; end: number; rect: DOMRect }[] = [];
    const wordRegex = /\S+/g;
    let match: RegExpExecArray | null;
    while ((match = wordRegex.exec(rawValue)) !== null) {
      const start = match.index;
      const end = start + match[0].length;
      textRange.setStart(textNode, start);
      textRange.setEnd(textNode, end);
      const rect = textRange.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        tokens.push({ start, end, rect });
      }
    }

    if (tokens.length === 0) continue;

    // Group tokens by visual line (same top coordinate within 3.5px)
    const visualLines: {
      start: number;
      end: number;
      leftPx: number;
      rightPx: number;
      topPx: number;
      heightPx: number;
    }[] = [];

    for (const tok of tokens) {
      const prev = visualLines[visualLines.length - 1];
      if (!prev || Math.abs(tok.rect.top - prev.topPx) > 3.5) {
        visualLines.push({
          start: tok.start,
          end: tok.end,
          leftPx: tok.rect.left,
          rightPx: tok.rect.right,
          topPx: tok.rect.top,
          heightPx: tok.rect.height,
        });
      } else {
        prev.end = tok.end;
        prev.leftPx = Math.min(prev.leftPx, tok.rect.left);
        prev.rightPx = Math.max(prev.rightPx, tok.rect.right);
      }
    }

    doc.setFont(pdfFontName, fontVariant);
    doc.setFontSize(fontSizePt);
    doc.setTextColor(textColor.r, textColor.g, textColor.b);

    for (const line of visualLines) {
      let lineStr = rawValue.slice(line.start, line.end).replace(/\s+/g, ' ').trim();
      if (!lineStr) continue;
      if (style.textTransform === 'uppercase') {
        lineStr = lineStr.toUpperCase();
      }
      lineStr = sanitizeForWinAnsi(lineStr, isUnicodeTtf);

      const xLeftMm = (line.leftPx - rootRect.left) * pxToMmX;
      const xRightMm = (line.rightPx - rootRect.left) * pxToMmX;
      const yTopMm = (line.topPx - rootRect.top) * pxToMmY;
      const baselineOffsetMm = fontSizePx * 0.8 * pxToMmY;
      const { localY } = ensurePageForY(yTopMm + baselineOffsetMm);

      // Preserve exact right-alignment for right-side flex items (e.g. dates, right-aligned links)
      const isRightSideItem =
        style.textAlign === 'right' ||
        (visualLines.length === 1 &&
          xRightMm > 175 &&
          parentEl.parentElement &&
          window.getComputedStyle(parentEl.parentElement).justifyContent === 'space-between' &&
          parentEl === parentEl.parentElement.lastElementChild);

      const isCenteredItem =
        style.textAlign === 'center' && xLeftMm > 25 && 210 - xRightMm > 25;

      let drawnStartX = xLeftMm;
      const textWidthMm = doc.getTextWidth(lineStr);

      if (isRightSideItem) {
        doc.text(lineStr, xRightMm, localY, { align: 'right' });
        drawnStartX = xRightMm - textWidthMm;
      } else if (isCenteredItem) {
        const centerMm = (xLeftMm + xRightMm) / 2;
        doc.text(lineStr, centerMm, localY, { align: 'center' });
        drawnStartX = centerMm - textWidthMm / 2;
      } else {
        doc.text(lineStr, xLeftMm, localY);
        drawnStartX = xLeftMm;
      }

      if (isUnderlined) {
        doc.setDrawColor(textColor.r, textColor.g, textColor.b);
        doc.setLineWidth(0.2);
        const underlineY = localY + 0.55;
        doc.line(drawnStartX, underlineY, drawnStartX + textWidthMm, underlineY);
      }
    }
  }

  // 4. Add interactive clickable link annotations for every <a href> in .resume-page
  const anchorElements = Array.from(resumePageEl.querySelectorAll('a[href]'));
  for (const aEl of anchorElements) {
    if (!(aEl instanceof HTMLAnchorElement)) continue;
    if (isHiddenOrIgnored(aEl)) continue;
    const href = aEl.getAttribute('href');
    if (!href) continue;

    const clientRects = Array.from(aEl.getClientRects());
    for (const r of clientRects) {
      if (r.width <= 0 || r.height <= 0) continue;
      const x = (r.left - rootRect.left) * pxToMmX;
      const y = (r.top - rootRect.top) * pxToMmY;
      const w = r.width * pxToMmX;
      const h = r.height * pxToMmY;
      const { localY } = ensurePageForY(y);
      doc.link(x, localY, w, h, { url: href });
    }
  }

  return doc.output('blob');
}

function triggerBrowserBlobDownload(blob: Blob, pdfFileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = pdfFileName;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    if (link.parentNode) link.parentNode.removeChild(link);
    URL.revokeObjectURL(url);
  }, 3000);
}

/**
 * Service for single-renderer A4 PDF export, Word (.doc) export,
 * plain text export, and ATS Keyword Match analysis.
 */
export const ResumeService = {
  /**
   * Generates a true-A4 PDF directly from the live React `<ResumeSheet />` DOM element
   * and downloads `<FullName>_Resume.pdf` directly to the user's computer.
   */
  async exportToPdf(
    resumeTitle = 'Resume',
    data?: ResumeData,
    isWatermarkRequired = false
  ): Promise<void> {
    const rawName = (data?.personal?.fullName || resumeTitle || 'Resume')
      .trim()
      .replace(/\s+/g, ' ');
    const cleanFileName =
      rawName
        .replace(/_Resume$/i, '')
        .replace(/\.pdf$/i, '')
        .trim()
        .replace(/\s+/g, '_')
        .replace(/[^a-zA-Z0-9_\-]/g, '') || 'Resume';
    const pdfDocumentTitle = `${cleanFileName}_Resume`;
    document.title = pdfDocumentTitle;

    if (data) {
      const blob = await generatePdfBlobFromResumeDom(data, isWatermarkRequired);
      triggerBrowserBlobDownload(blob, `${pdfDocumentTitle}.pdf`);
      return;
    }

    window.print();
  },

  /**
   * Opens the browser's native print dialog on the rendered `<ResumeSheet />` component.
   */
  async openPrintDialog(
    resumeTitle = 'Resume',
    data?: ResumeData,
    isWatermarkRequired = false
  ): Promise<void> {
    const rawName = (data?.personal?.fullName || resumeTitle || 'Resume')
      .trim()
      .replace(/\s+/g, ' ');
    const cleanFileName =
      rawName
        .replace(/_Resume$/i, '')
        .replace(/\.pdf$/i, '')
        .trim()
        .replace(/\s+/g, '_')
        .replace(/[^a-zA-Z0-9_\-]/g, '') || 'Resume';
    const pdfDocumentTitle = `${cleanFileName}_Resume`;
    const originalTitle = document.title;
    document.title = pdfDocumentTitle;

    if (data) {
      const fontConfig = resolveResumeFontConfig(data.formatting?.fontFamily);
      await waitForFontLoad(document, fontConfig.googleFontName);
      ensureRenderedResumePageElement(data, isWatermarkRequired);
    }

    const restoreTitle = () => {
      document.title = originalTitle;
      window.removeEventListener('afterprint', restoreTitle);
    };
    window.addEventListener('afterprint', restoreTitle, { once: true });
    window.print();
  },

  /**
   * Saves `<FullName>_Resume.pdf` (generated from the single `<ResumeSheet />` DOM renderer)
   * to the user's laptop via OS Folder Finder (`showSaveFilePicker`) or direct browser download.
   */
  async downloadPdfToPc(
    data: ResumeData,
    filename?: string,
    isWatermarkRequired = false,
    useFolderPicker = false
  ): Promise<{ saved: boolean; method: 'picker' | 'download' | 'cancelled' }> {
    const rawBase = (filename || data.personal.fullName || 'Resume')
      .trim()
      .replace(/\.pdf$/i, '')
      .replace(/_Resume$/i, '')
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9_\-]/g, '') || 'Resume';
    const finalPdfName = `${rawBase}_Resume.pdf`;
    document.title = `${rawBase}_Resume`;

    const blob = await generatePdfBlobFromResumeDom(data, isWatermarkRequired);

    if (useFolderPicker && typeof (window as any).showSaveFilePicker === 'function') {
      try {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: finalPdfName,
          types: [
            {
              description: 'PDF Document',
              accept: { 'application/pdf': ['.pdf'] },
            },
          ],
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        return { saved: true, method: 'picker' };
      } catch (err: any) {
        if (err?.name === 'AbortError') {
          return { saved: false, method: 'cancelled' };
        }
        // In cross-origin preview iframes where showSaveFilePicker throws SecurityError,
        // automatically fall back to direct browser download so the user always gets their PDF.
      }
    }

    triggerBrowserBlobDownload(blob, finalPdfName);
    return { saved: true, method: 'download' };
  },

  /**
   * Generates and downloads a complete plain text (.txt) file directly to the user's PC.
   */
  downloadText(data: ResumeData, filename?: string): void {
    const { personal, objective, education, skills, projects, experience, certifications, achievements, extra } = data;

    const lines: string[] = [
      '========================================================================',
      personal.fullName || 'Student Resume',
      personal.targetRole || '',
      [personal.cityState, personal.phone, personal.email]
        .filter(Boolean)
        .join(' · '),
      [
        personal.linkedinUrl ? formatShortUrl(personal.linkedinUrl) : '',
        personal.githubUrl ? formatShortUrl(personal.githubUrl) : '',
        personal.portfolioUrl ? formatShortUrl(personal.portfolioUrl) : '',
      ]
        .filter(Boolean)
        .join(' · '),
      '========================================================================',
    ];

    if (objective) {
      lines.push('\nPROFESSIONAL SUMMARY:', objective);
    }

    const skillLines = [
      skills.technical?.length ? `Languages: ${skills.technical.join(', ')}` : '',
      skills.frameworks?.length ? `Frameworks & Data: ${skills.frameworks.join(', ')}` : '',
      skills.aiLlm?.length ? `AI / LLM: ${skills.aiLlm.join(', ')}` : '',
      skills.cloudDevops?.length ? `Cloud & DevOps: ${skills.cloudDevops.join(', ')}` : '',
      skills.tools?.length ? `Tools: ${skills.tools.join(', ')}` : '',
    ].filter(Boolean);

    if (skillLines.length > 0) {
      lines.push('\nSKILLS:', ...skillLines);
    }

    if (projects.length > 0) {
      lines.push('\nPROJECTS:');
      projects.forEach(p => {
        lines.push(
          `* ${p.title}${p.technologies.length ? ` (${p.technologies.join(', ')})` : ''}`,
          `  ${p.description}`,
          [p.liveUrl ? `  Live: ${formatShortUrl(p.liveUrl)}` : '', p.githubUrl ? `GitHub: ${formatShortUrl(p.githubUrl)}` : '']
            .filter(Boolean)
            .join(' | ')
        );
      });
    }

    if (education.higherEducation.length > 0 || education.twelfth?.schoolName || education.tenth?.schoolName) {
      lines.push('\nEDUCATION:');
      education.higherEducation.forEach(e => {
        lines.push(
          `* ${e.degree} — ${e.institution}${e.city ? `, ${e.city}` : ''} (${e.startYear ? `${e.startYear} – ` : ''}${e.endYear}) · ${e.scoreType}: ${e.score}`
        );
      });
      if (education.twelfth?.schoolName) {
        lines.push(
          `* Class XII (${education.twelfth.boardOrStream}): ${education.twelfth.schoolName} (${education.twelfth.score}) — ${education.twelfth.year}`
        );
      }
      if (education.tenth?.schoolName) {
        lines.push(
          `* Class X (${education.tenth.boardOrStream}): ${education.tenth.schoolName} (${education.tenth.score}) — ${education.tenth.year}`
        );
      }
    }

    if (experience.length > 0) {
      lines.push('\nEXPERIENCE:');
      experience.forEach(exp => {
        lines.push(
          `* ${exp.role} — ${exp.company}${exp.location ? ` (${exp.location})` : ''} [${exp.duration}]`,
          `  ${exp.description}`
        );
      });
    }

    if (certifications.length > 0) {
      lines.push('\nCERTIFICATIONS:');
      certifications.forEach(c => {
        lines.push(`* ${[c.name, c.issuer, c.year].filter(Boolean).join(', ')}`);
      });
    }

    if (achievements.length > 0) {
      lines.push('\nACHIEVEMENTS:');
      achievements.forEach(a => {
        lines.push(`* ${[a.title, a.organization, a.year].filter(Boolean).join(', ')}`);
      });
    }

    if (extra.spokenLanguages || extra.volunteering || extra.extracurriculars || extra.hobbies || extra.references) {
      lines.push('\nADDITIONAL INFORMATION:');
      if (extra.spokenLanguages) lines.push(`Languages: ${extra.spokenLanguages}`);
      if (extra.volunteering) lines.push(`Volunteering: ${extra.volunteering}`);
      if (extra.extracurriculars) lines.push(`Leadership & Activities: ${extra.extracurriculars}`);
      if (extra.hobbies) lines.push(`Interests: ${extra.hobbies}`);
      if (extra.references) lines.push(`References: ${extra.references}`);
    }

    const textSummary = lines.filter(l => l !== '').join('\n');
    const blob = new Blob([textSummary], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const cleanName = (personal.fullName || 'Resume').trim().replace(/[^a-zA-Z0-9_\-]/g, '_');
    link.download = filename || `${cleanName}_Resume.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  /**
   * Generates and downloads a complete Word-compatible .doc file using formatted HTML.
   */
  exportToWord(data: ResumeData, filename = 'Resume.doc'): void {
    const { personal, objective, education, skills, projects, experience, certifications, achievements, extra, formatting } = data;
    const accentColor = formatting?.accentColor || '#FF2D95';

    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${personal.fullName}</title>
        <style>
          body { font-family: Calibri, Arial, sans-serif; font-size: 10.5pt; line-height: 1.25; color: #111827; margin: 16mm; }
          h1 { font-size: 22pt; text-transform: uppercase; margin: 0 0 4pt 0; color: ${accentColor}; text-align: center; }
          h2 { font-size: 11pt; text-transform: uppercase; border-bottom: 1pt solid ${accentColor}; padding-bottom: 2pt; margin-top: 10pt; margin-bottom: 5pt; color: #111827; }
          p { margin: 2pt 0; }
          .contact { font-size: 9.5pt; color: #374151; margin-bottom: 8pt; text-align: center; border-bottom: 1.5pt solid ${accentColor}; padding-bottom: 6pt; }
          .tech { color: ${accentColor}; font-weight: bold; font-size: 9.5pt; }
        </style>
      </head>
      <body>
        <h1>${personal.fullName || 'Student Resume'}</h1>
        <div class="contact">
          ${[
            personal.cityState ? toTitleCase(personal.cityState) : '',
            personal.phone,
            personal.email,
            personal.linkedinUrl ? formatShortUrl(personal.linkedinUrl) : '',
            personal.githubUrl ? formatShortUrl(personal.githubUrl) : '',
            personal.portfolioUrl ? formatShortUrl(personal.portfolioUrl) : '',
          ]
            .filter(Boolean)
            .join(' • ')}
        </div>

        ${objective ? `<h2>Professional Summary</h2><p>${objective}</p>` : ''}

        ${
          education.higherEducation.length > 0 || education.twelfth?.schoolName || education.tenth?.schoolName
            ? `<h2>Education</h2>
              ${education.higherEducation
                .map(
                  e =>
                    `<div style="margin-bottom: 5pt;">
                      <strong>${toTitleCase(e.degree)}</strong> — <span style="float:right;">${e.startYear ? `${e.startYear} – ` : ''}${e.endYear}</span><br/>
                      ${toTitleCase(e.institution)}${e.city ? `, ${toTitleCase(e.city)}` : ''} ${e.score ? `• <strong>${e.scoreType}: ${e.score}</strong>` : ''}
                    </div>`
                )
                .join('')}
              ${
                education.twelfth?.schoolName
                  ? `<p><strong>Class XII (${education.twelfth.boardOrStream}):</strong> ${toTitleCase(education.twelfth.schoolName)} (${education.twelfth.score}) — ${education.twelfth.year}</p>`
                  : ''
              }
              ${
                education.tenth?.schoolName
                  ? `<p><strong>Class X (${education.tenth.boardOrStream}):</strong> ${toTitleCase(education.tenth.schoolName)} (${education.tenth.score}) — ${education.tenth.year}</p>`
                  : ''
              }`
            : ''
        }

        <h2>Skills Summary</h2>
        ${skills.technical.length > 0 ? `<p><strong>Languages & Frameworks:</strong> ${skills.technical.join(', ')}</p>` : ''}
        ${skills.tools.length > 0 ? `<p><strong>Tools & Platforms:</strong> ${skills.tools.join(', ')}</p>` : ''}
        ${skills.soft.length > 0 ? `<p><strong>Soft Skills:</strong> ${skills.soft.join(', ')}</p>` : ''}
        ${skills.languages && skills.languages.length > 0 ? `<p><strong>Spoken Languages:</strong> ${skills.languages.join(', ')}</p>` : ''}

        ${
          projects.length > 0
            ? `<h2>Key Projects</h2>${projects
                .map(
                  p =>
                    `<div style="margin-bottom: 6pt;">
                      <strong>${p.title}</strong> <span class="tech">[${p.technologies.join(', ')}]</span>
                      ${p.githubUrl ? ` — <span>${formatShortUrl(p.githubUrl)}</span>` : ''}
                      ${p.liveUrl ? ` | <span>Demo</span>` : ''}
                      <p>${p.description}</p>
                    </div>`
                )
                .join('')}`
            : ''
        }

        ${
          experience.length > 0
            ? `<h2>Experience & Internships</h2>${experience
                .map(
                  exp =>
                    `<div style="margin-bottom: 6pt;">
                      <strong>${toTitleCase(exp.role)}</strong> | ${toTitleCase(exp.company)}${exp.location ? ` (${toTitleCase(exp.location)})` : ''} — <span>${exp.duration}</span>
                      <p style="white-space: pre-line;">${exp.description}</p>
                    </div>`
                )
                .join('')}`
            : ''
        }

        ${
          certifications.length > 0
            ? `<h2>Certifications & Courses</h2>${certifications
                .map(c => `<p><strong>${c.name}</strong> — ${toTitleCase(c.issuer)} (${c.year})</p>`)
                .join('')}`
            : ''
        }

        ${
          achievements.length > 0
            ? `<h2>Achievements & Honors</h2>${achievements
                .map(
                  a =>
                    `<p><strong>${a.title}</strong>, ${toTitleCase(a.organization)} (${a.year})${
                      a.description ? ` — ${a.description}` : ''
                    }</p>`
                )
                .join('')}`
            : ''
        }

        ${
          extra.volunteering || extra.extracurriculars || extra.hobbies || extra.references
            ? `<h2>Additional Information</h2>
              ${extra.volunteering ? `<p><strong>Volunteering:</strong> ${extra.volunteering}</p>` : ''}
              ${extra.extracurriculars ? `<p><strong>Extracurriculars:</strong> ${extra.extracurriculars}</p>` : ''}
              ${extra.hobbies ? `<p><strong>Hobbies:</strong> ${extra.hobbies}</p>` : ''}
              ${extra.references ? `<p><strong>References:</strong> ${extra.references}</p>` : ''}`
            : ''
        }
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', htmlContent], {
      type: 'application/msword',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  /**
   * Analyzes resume text against a Job Description or target role keywords.
   * Renamed from 'ATS Score' to 'ATS Keyword Match' as requested.
   */
  calculateATSKeywordMatch(resumeData: ResumeData, jobDescription: string): ATSAnalysisResult {
    const resumeText = [
      resumeData.personal.fullName,
      resumeData.personal.targetRole || '',
      resumeData.objective,
      ...resumeData.education.higherEducation.map(e => `${e.degree} ${e.institution} ${e.fieldOfStudy}`),
      ...resumeData.skills.technical,
      ...(resumeData.skills.frameworks || []),
      ...(resumeData.skills.aiLlm || []),
      ...(resumeData.skills.cloudDevops || []),
      ...resumeData.skills.tools,
      ...resumeData.projects.map(p => `${p.title} ${p.description} ${p.technologies.join(' ')}`),
      ...resumeData.experience.map(e => `${e.role} ${e.company} ${e.description}`),
      ...resumeData.certifications.map(c => `${c.name} ${c.issuer}`),
      ...resumeData.achievements.map(a => `${a.title} ${a.organization} ${a.description}`),
    ]
      .join(' ')
      .toLowerCase();

    // Common tech & engineering industry keywords to detect
    const commonKeywords = [
      'react', 'typescript', 'javascript', 'python', 'java', 'c++', 'c#', 'node.js',
      'express', 'sql', 'postgresql', 'mongodb', 'docker', 'kubernetes', 'aws',
      'gcp', 'azure', 'git', 'github', 'ci/cd', 'rest api', 'graphql', 'html',
      'css', 'tailwind', 'redux', 'next.js', 'vite', 'linux', 'testing', 'jest',
      'agile', 'scrum', 'data structures', 'algorithms', 'system design',
      'object-oriented', 'problem solving', 'microservices', 'leadership', 'communication',
    ];

    // Extract keywords from job description if provided
    const targetKeywords = jobDescription.trim().length > 20
      ? Array.from(
          new Set(
            commonKeywords.filter(k => jobDescription.toLowerCase().includes(k))
          )
        )
      : ['react', 'typescript', 'git', 'rest api', 'sql', 'problem solving', 'agile'];

    const matchedKeywords: string[] = [];
    const missingKeywords: string[] = [];

    targetKeywords.forEach(kw => {
      if (resumeText.includes(kw)) {
        matchedKeywords.push(kw);
      } else {
        missingKeywords.push(kw);
      }
    });

    const total = targetKeywords.length || 1;
    const matchScore = Math.round((matchedKeywords.length / total) * 100);

    const recommendations: string[] = [];
    if (missingKeywords.length > 0) {
      recommendations.push(`Incorporate high-frequency skills: ${missingKeywords.slice(0, 4).join(', ')} in your Skills or Project bullet points.`);
    }
    if (!resumeData.objective || resumeData.objective.length < 50) {
      recommendations.push('Add a concise 2-3 line Professional Summary under your header emphasizing your core specialization.');
    }
    if (resumeData.projects.length < 2) {
      recommendations.push('Include at least 2 distinct software projects with live links or GitHub repositories.');
    }
    if (matchScore >= 80) {
      recommendations.push('Strong ATS formatting! Your profile matches key automated parsing filters.');
    }

    return {
      matchScore,
      matchedKeywords,
      missingKeywords,
      recommendations,
    };
  },

  /**
   * Deep multi-pillar ATS and recruiter readiness audit for a student's resume.
   * Analyzes impact metrics, technical depth, section completeness, action verbs,
   * online presence, and keyword fit for target engineering roles.
   */
  analyzeResumeDetailed(
    resumeData: ResumeData,
    targetRole = 'Full Stack Developer',
    customJobDescription?: string
  ): DetailedResumeAnalysis {
    const allText = [
      resumeData.personal.fullName,
      resumeData.personal.targetRole,
      resumeData.objective,
      ...resumeData.education.higherEducation.map(e => `${e.degree} ${e.institution} ${e.fieldOfStudy} ${e.score}`),
      ...resumeData.skills.technical,
      ...(resumeData.skills.frameworks || []),
      ...(resumeData.skills.aiLlm || []),
      ...(resumeData.skills.cloudDevops || []),
      ...resumeData.skills.tools,
      ...resumeData.projects.map(p => `${p.title} ${p.description} ${p.technologies.join(' ')}`),
      ...resumeData.experience.map(e => `${e.role} ${e.company} ${e.description}`),
      ...resumeData.certifications.map(c => `${c.name} ${c.issuer}`),
      ...resumeData.achievements.map(a => `${a.title} ${a.organization} ${a.description}`),
      resumeData.extra.spokenLanguages,
      resumeData.extra.volunteering,
      resumeData.extra.extracurriculars,
      resumeData.extra.hobbies,
    ]
      .filter(Boolean)
      .join(' ');

    const lowerText = allText.toLowerCase();
    const words = allText.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const readingTimeMinutes = Math.max(1, parseFloat((wordCount / 200).toFixed(1)));

    // 1. Pillar: Impact and Quantified Metrics
    const metricMatches = allText.match(/\b\d+(\.\d+)?%|\b\d+ms\b|\b\d+\+\b|\b\d+\s*(users|teams|stars|downloads|clients|calls|modules|requests|projects|hours)\b|sub-\d+/gi) || [];
    const metricCount = metricMatches.length;
    const impactScore = metricCount >= 4 ? 96 : metricCount >= 2 ? 84 : metricCount === 1 ? 68 : 45;
    const impactStatus = impactScore >= 90 ? 'excellent' : impactScore >= 75 ? 'good' : 'needs-work';
    const impactFeedback =
      metricCount >= 4
        ? `Superb quantifiable impact with ${metricCount} detected data points and performance metrics.`
        : metricCount >= 2
        ? `Found ${metricCount} metrics. Adding 1-2 more percentage improvements or numbers in project bullets will elevate recruiter interest.`
        : 'Lacks measurable metrics. Quantify impact (e.g., "reduced latency by 35%", "serving 500+ users").';

    // 2. Pillar: Technical Depth
    const totalSkillsCount =
      resumeData.skills.technical.length +
      (resumeData.skills.frameworks?.length || 0) +
      (resumeData.skills.aiLlm?.length || 0) +
      (resumeData.skills.cloudDevops?.length || 0) +
      resumeData.skills.tools.length;
    const techScore = totalSkillsCount >= 14 ? 95 : totalSkillsCount >= 9 ? 85 : 62;
    const techStatus = techScore >= 90 ? 'excellent' : techScore >= 75 ? 'good' : 'needs-work';
    const techFeedback =
      totalSkillsCount >= 14
        ? `Strong technical catalog (${totalSkillsCount} categorized skills across Languages, Frameworks, AI/LLM, Cloud & Tools).`
        : `Covers ${totalSkillsCount} skills. Expand frameworks and cloud technologies to boost search indexability.`;

    // 3. Pillar: ATS Structure & Section Balance
    const hasObjective = resumeData.objective && resumeData.objective.trim().length >= 40;
    const hasEducation = resumeData.education.higherEducation.length > 0;
    const hasProjects = resumeData.projects.length >= 2;
    const hasExperience = resumeData.experience.length >= 1;
    let structurePoints = 0;
    if (hasObjective) structurePoints += 25;
    if (hasEducation) structurePoints += 25;
    if (hasProjects) structurePoints += 25;
    if (hasExperience) structurePoints += 25;
    const atsScore = Math.max(50, structurePoints);
    const atsStatus = atsScore >= 90 ? 'excellent' : atsScore >= 75 ? 'good' : 'needs-work';
    const atsFeedback =
      atsScore === 100
        ? 'Well-balanced chronological sections adhering to standard single/two-page ATS parsing rules.'
        : !hasObjective
        ? 'Missing a 2-line Professional Summary under header to frame candidate specialization.'
        : !hasProjects
        ? 'Less than 2 software projects detected. Add distinct GitHub/live deployed builds.'
        : 'Consider adding verifiable internship or freelance experience to strengthen chronology.';

    // 4. Pillar: Action Verbs
    const powerVerbs = [
      'engineered', 'architected', 'developed', 'optimized', 'implemented',
      'spearheaded', 'designed', 'built', 'deployed', 'automated', 'integrated',
      'collaborated', 'scaled', 'refactored', 'reduced', 'accelerated', 'authored',
    ];
    const detectedVerbs = powerVerbs.filter(verb => lowerText.includes(verb));
    const verbScore = detectedVerbs.length >= 6 ? 96 : detectedVerbs.length >= 3 ? 82 : 55;
    const verbStatus = verbScore >= 90 ? 'excellent' : verbScore >= 75 ? 'good' : 'needs-work';
    const verbFeedback =
      detectedVerbs.length >= 6
        ? `Strong active voice using power verbs: ${detectedVerbs.slice(0, 4).join(', ')}.`
        : `Detected ${detectedVerbs.length} action verbs. Start bullet points with dynamic verbs (e.g. "Engineered", "Automated").`;

    // 5. Pillar: Contact & Online Footprint
    const hasEmail = Boolean(resumeData.personal.email);
    const hasPhone = Boolean(resumeData.personal.phone);
    const hasLinkedin = Boolean(resumeData.personal.linkedinUrl);
    const hasGithub = Boolean(resumeData.personal.githubUrl);
    const hasPortfolio = Boolean(resumeData.personal.portfolioUrl);
    let contactCount = 0;
    if (hasEmail) contactCount++;
    if (hasPhone) contactCount++;
    if (hasLinkedin) contactCount++;
    if (hasGithub) contactCount++;
    if (hasPortfolio) contactCount++;
    const contactScore = contactCount === 5 ? 100 : contactCount >= 4 ? 88 : 65;
    const contactStatus = contactScore >= 90 ? 'excellent' : contactScore >= 75 ? 'good' : 'needs-work';
    const contactFeedback =
      contactCount === 5
        ? 'Full digital footprint present with verified GitHub, LinkedIn, portfolio, email and phone.'
        : !hasGithub
        ? 'GitHub URL missing. Software recruiters prioritize inspecting live commit history and repositories.'
        : 'Ensure both LinkedIn and portfolio links are populated with direct URLs.';

    // Target Role Keywords Definition
    const roleKeywordMap: Record<string, string[]> = {
      'Full Stack Developer': [
        'react', 'typescript', 'javascript', 'node.js', 'sql', 'postgresql',
        'rest api', 'git', 'docker', 'tailwind', 'html', 'css', 'next.js',
      ],
      'Frontend Engineer': [
        'react', 'typescript', 'javascript', 'tailwind', 'css', 'html',
        'responsive design', 'vite', 'ui/ux', 'performance', 'git', 'next.js',
      ],
      'Backend & Cloud Engineer': [
        'python', 'node.js', 'sql', 'postgresql', 'docker', 'aws', 'rest api',
        'redis', 'microservices', 'linux', 'git', 'system design',
      ],
      'AI & Machine Learning Specialist': [
        'python', 'pytorch', 'machine learning', 'nlp', 'llm', 'data science',
        'fastapi', 'docker', 'git', 'pandas', 'hugging face',
      ],
      'Mobile App Developer': [
        'react native', 'flutter', 'typescript', 'javascript', 'mobile ui',
        'rest api', 'git', 'ios', 'android', 'state management',
      ],
      'General Software Engineer': [
        'algorithms', 'data structures', 'git', 'python', 'javascript',
        'problem solving', 'testing', 'object-oriented', 'rest api',
      ],
    };

    const targetKeywords =
      customJobDescription && customJobDescription.trim().length > 20
        ? Array.from(
            new Set([
              ...roleKeywordMap[targetRole] || roleKeywordMap['Full Stack Developer'],
              ...customJobDescription
                .toLowerCase()
                .match(/[a-z0-9+#.-]{3,}/g) || [],
            ])
          ).filter(k => (roleKeywordMap['Full Stack Developer'] || []).includes(k))
        : roleKeywordMap[targetRole] || roleKeywordMap['Full Stack Developer'];

    const matchedKeywords: string[] = [];
    const missingKeywords: string[] = [];

    targetKeywords.forEach(kw => {
      if (lowerText.includes(kw.toLowerCase())) {
        matchedKeywords.push(kw);
      } else {
        missingKeywords.push(kw);
      }
    });

    // Weighted Overall Score
    const overallScore = Math.round(
      impactScore * 0.25 +
      techScore * 0.25 +
      atsScore * 0.2 +
      verbScore * 0.15 +
      contactScore * 0.15
    );

    const grade: DetailedResumeAnalysis['grade'] =
      overallScore >= 92 ? 'A+' : overallScore >= 82 ? 'A' : overallScore >= 72 ? 'B+' : overallScore >= 60 ? 'B' : 'C';

    const summaryText =
      overallScore >= 90
        ? `Outstanding recruiter readiness! Your resume matches ${matchedKeywords.length} key automated ATS filters for ${targetRole} with high technical density.`
        : overallScore >= 80
        ? `Competitive resume for ${targetRole}. Incorporating missing keywords like ${missingKeywords.slice(0, 2).join(', ')} and 1-2 quantified metrics will put you in the top 5% of applicants.`
        : `Resume needs enhancement before applying to competitive ${targetRole} postings. Follow the critical fixes below.`;

    // Strengths
    const strengths: string[] = [];
    if (metricCount >= 2) strengths.push(`Quantified impact detected (${metricMatches.slice(0, 3).join(', ')}).`);
    if (techScore >= 85) strengths.push(`Comprehensive tech stack coverage with ${resumeData.skills.technical.length} programming tools.`);
    if (hasLinkedin && hasGithub) strengths.push('Both GitHub repository and LinkedIn profile links are present.');
    if (detectedVerbs.length >= 4) strengths.push(`Action-oriented bullet points using verbs like "${detectedVerbs.slice(0, 3).join('", "')}".`);
    if (hasObjective) strengths.push('Clean Professional Summary established directly beneath the contact header.');

    // Critical Fixes
    const criticalFixes: string[] = [];
    if (missingKeywords.length > 0) {
      criticalFixes.push(`Integrate high-frequency keywords: ${missingKeywords.slice(0, 4).join(', ')}.`);
    }
    if (metricCount < 2) {
      criticalFixes.push('Add numerical achievements in bullet points (e.g. latency reduced by X%, X active users, sub-50ms).');
    }
    if (!hasGithub) {
      criticalFixes.push('Include your active GitHub profile URL.');
    }
    if (resumeData.projects.length < 2) {
      criticalFixes.push('Add a second featured software project with technical architecture details.');
    }

    // General Recommendations
    const recommendations: string[] = [
      ...criticalFixes,
      'Ensure standard single-page A4 layout margins (18mm) are preserved during PDF export.',
      'Maintain consistent past-tense action verbs for previous roles and present-tense for current positions.',
    ];

    return {
      overallScore,
      grade,
      targetRole,
      summaryText,
      pillars: {
        impactAndMetrics: {
          name: 'Impact & Quantified Metrics',
          score: impactScore,
          status: impactStatus,
          feedback: impactFeedback,
        },
        technicalDepth: {
          name: 'Technical & Tools Depth',
          score: techScore,
          status: techStatus,
          feedback: techFeedback,
        },
        atsStructure: {
          name: 'ATS Structure & Sections',
          score: atsScore,
          status: atsStatus,
          feedback: atsFeedback,
        },
        actionVerbs: {
          name: 'Action Verbs & Voice',
          score: verbScore,
          status: verbStatus,
          feedback: verbFeedback,
        },
        contactPresence: {
          name: 'Contact & Online Footprint',
          score: contactScore,
          status: contactStatus,
          feedback: contactFeedback,
        },
      },
      matchedKeywords,
      missingKeywords,
      strengths,
      criticalFixes,
      recommendations,
      wordCount,
      readingTimeMinutes,
    };
  },
};

