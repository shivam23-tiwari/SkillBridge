import { GoogleGenAI } from '@google/genai';

export interface ObjectiveSuggestionParams {
  role?: string;
  degree?: string;
  college?: string;
  technicalSkills?: string[];
  tone?: 'impact' | 'technical' | 'entry-level';
}

export const AIService = {
  /**
   * Generates 3 tailored, professional 2-3 line career objective / summary options.
   * Leverages Gemini 2.5 Flash if API key is configured, with high-quality fallback prompts.
   */
  async generateObjectiveSuggestions(params: ObjectiveSuggestionParams): Promise<string[]> {
    const role = params.role?.trim() || 'Software Engineer';
    const skills = params.technicalSkills?.filter(Boolean).slice(0, 5).join(', ') || 'React, TypeScript, Node.js';
    const degree = params.degree?.trim() || 'Computer Science student';
    const college = params.college?.trim() || 'university';

    const apiKey =
      (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
      (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GEMINI_API_KEY) ||
      '';

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `Write 3 concise, high-impact career objective statements for a university student resume.
Target Role: ${role}
Education / Degree: ${degree} from ${college}
Core Skills: ${skills}

Requirements:
- Each statement must be exactly 2-3 lines long (40-60 words).
- Focus on practical projects, problem-solving ability, and eager readiness to deliver value.
- Avoid clichés like "hardworking individual seeking a challenging position".
- Output ONLY a JSON array of 3 strings, e.g. ["Option 1 text...", "Option 2 text...", "Option 3 text..."] without markdown codeblocks.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
        });

        const text = response.text || '';
        const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        if (Array.isArray(parsed) && parsed.length >= 2) {
          return parsed.slice(0, 3).map(s => String(s).trim());
        }
      } catch (err) {
        console.warn('Gemini AI generation fallback engaged:', err);
      }
    }

    // High quality intelligent template generator
    return [
      `Results-oriented ${degree} specializing in ${role.toLowerCase()} with hands-on experience building web and software applications using ${skills}. Passionate about architecting scalable systems and eager to contribute clean, tested code to high-velocity engineering teams.`,
      `Dedicated builder with a strong foundation in modern computing, algorithm design, and full-stack development with ${skills}. Seeking a ${role} opportunity to solve real-world technical challenges and drive user-centric product innovations.`,
      `Curious and proactive developer experienced in developing full-lifecycle software solutions utilizing ${skills}. Eager to leverage strong technical craftsmanship and collaborative problem-solving skills in an impactful engineering internship or junior role.`
    ];
  },

  /**
   * Generates bullet-point action descriptions for an internship or project
   */
  async polishExperienceBullet(role: string, company: string, rawTasks: string): Promise<string[]> {
    if (!rawTasks.trim()) {
      return [
        `Architected and shipped modular components utilizing best engineering practices, boosting responsiveness and code maintainability.`,
        `Collaborated cross-functionally with team members to deliver core user features under tight sprint deadlines.`,
        `Identified edge-case bottlenecks and refactored key workflows, improving overall runtime stability.`
      ];
    }

    const sentences = rawTasks
      .split('\n')
      .map(s => s.trim().replace(/^[-*•]\s*/, ''))
      .filter(Boolean);

    if (sentences.length > 0) {
      return sentences.map(s => {
        if (/^(Developed|Built|Implemented|Engineered|Architected|Designed|Spearheaded|Optimized|Refactored)/i.test(s)) {
          return s;
        }
        return `Engineered and executed ${s.charAt(0).toLowerCase() + s.slice(1)}`;
      });
    }

    return [
      `Led technical implementation of key requirements for ${role} at ${company}.`,
      `Authored modular, thoroughly-tested application modules meeting strict performance standards.`
    ];
  }
};
