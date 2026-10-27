import {
  Profile,
  Project,
  Job,
  JobApplication,
  ProjectComment,
  NotificationItem,
  ApplicationStatus,
  Conversation,
  ChatMessage,
  ConversationStatus,
  LoginRecord,
  ContactMessage,
  UserSubscription,
  SavedResume,
  UserPlan,
  SubscriptionBilling,
} from '../types';
import {
  INITIAL_PROFILES,
  INITIAL_PROJECTS,
  INITIAL_JOBS,
  INITIAL_COMMENTS,
  INITIAL_APPLICATIONS,
  INITIAL_RESUMES,
} from './mockData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { generateId } from '../lib/utils';
import { EmailService } from './emailService';

const STORAGE_KEYS = {
  PROFILES: 'skillbridge_profiles',
  PROJECTS: 'skillbridge_projects',
  JOBS: 'skillbridge_jobs',
  LIKES: 'skillbridge_likes',
  BOOKMARKS: 'skillbridge_bookmarks',
  SAVED_JOBS: 'skillbridge_saved_jobs',
  COMMENTS: 'skillbridge_comments',
  APPLICATIONS: 'skillbridge_applications',
  NOTIFICATIONS: 'skillbridge_notifications',
  CONVERSATIONS: 'skillbridge_conversations',
  MESSAGES: 'skillbridge_messages',
  LOGINS: 'skillbridge_logins',
  CONTACT_MESSAGES: 'skillbridge_contact_messages',
  SUBSCRIPTION: 'skillbridge_user_subscription',
  SAVED_RESUMES: 'skillbridge_saved_resumes',
  RESUME_SENDS: 'skillbridge_resume_sends',
};

// In-memory store fallback so the app NEVER crashes even if localStorage is full or disabled
const memoryStore = new Map<string, any>();

/**
 * Compresses an image file using an off-screen HTML canvas to a compact, high-quality JPEG
 * Constrains dimensions to max 1000px and 0.75 quality, reducing multi-megabyte files by ~98% (to ~40-80KB)
 * so storing projects in browser storage never exceeds quotas.
 */
export async function compressImageFile(file: File, maxDimension = 1000, quality = 0.75): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = event => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.onerror = () => {
        resolve(event.target?.result as string);
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Helper for local storage persistence with memory caching and quota recovery
function getStored<T>(key: string, defaultValue: T): T {
  try {
    if (memoryStore.has(key)) {
      return memoryStore.get(key) as T;
    }
    const item = localStorage.getItem(key);
    if (!item) {
      memoryStore.set(key, defaultValue);
      return defaultValue;
    }
    const parsed = JSON.parse(item);
    memoryStore.set(key, parsed);
    return parsed;
  } catch (err) {
    console.warn(`Error reading ${key} from localStorage, using memory fallback:`, err);
    return memoryStore.get(key) ?? defaultValue;
  }
}

/**
 * Sanitizes projects by stripping or replacing bloated base64 data URLs (>100KB)
 * to prevent browser LocalStorage QuotaExceededError while retaining pristine display.
 */
function sanitizeProjectImages(projects: Project[]): { sanitized: Project[]; changed: boolean } {
  let changed = false;
  const sanitized = projects.map(p => {
    let pChanged = false;
    let cover = p.cover_image_url;
    let screens = p.screenshot_urls || [];

    // If cover is larger than 120KB base64, replace with high-quality curated tech photo
    if (cover && cover.startsWith('data:image/') && cover.length > 120000) {
      cover = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80';
      pChanged = true;
    }

    // Filter or replace screenshots that are bloated data URLs
    if (screens.some(s => s.startsWith('data:image/') && s.length > 100000)) {
      screens = screens.filter(s => !s.startsWith('data:image/') || s.length <= 100000);
      pChanged = true;
    }

    if (p.summary && p.summary.includes('telemetry visualization engine')) {
      pChanged = true;
      p.summary = 'An interactive renewable energy and climate analytics dashboard rendering real-time power grid insights with custom charts and alerts.';
    }

    if (pChanged) {
      changed = true;
      return { ...p, cover_image_url: cover, screenshot_urls: screens };
    }
    return p;
  });

  return { sanitized, changed };
}

function setStored<T>(key: string, value: T): void {
  // Always update in-memory cache first so UI responds instantaneously
  memoryStore.set(key, value);

  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err: any) {
    const isQuota = err?.name === 'QuotaExceededError' || err?.code === 22 || err?.code === 1014;
    if (isQuota) {
      console.warn(`LocalStorage quota reached when saving ${key}. Executing automatic storage recovery...`);
      try {
        // 1. Prune volatile login logs
        localStorage.removeItem(STORAGE_KEYS.LOGINS);

        // 2. If saving projects, sanitize all project images and save
        if (key === STORAGE_KEYS.PROJECTS && Array.isArray(value)) {
          const { sanitized } = sanitizeProjectImages(value as Project[]);
          localStorage.setItem(key, JSON.stringify(sanitized));
          return;
        }

        // 3. Free up space from stored projects if saving another key
        const existingProjects = getStored<Project[]>(STORAGE_KEYS.PROJECTS, []);
        const { sanitized, changed } = sanitizeProjectImages(existingProjects);
        if (changed) {
          localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(sanitized));
        }

        // 4. Retry saving value
        localStorage.setItem(key, JSON.stringify(value));
      } catch (retryErr) {
        // Safe graceful degradation: memoryStore already holds the active data so UI never breaks
        console.warn(`Storage quota recovery complete; continuing in-memory persistence for current session.`, retryErr);
      }
    } else {
      console.warn(`Warning writing ${key} to localStorage:`, err);
    }
  }
}

// Initialize seed data if not present
export function initializeStore(): void {
  if (!localStorage.getItem(STORAGE_KEYS.PROFILES)) {
    setStored(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
  }
  if (!localStorage.getItem(STORAGE_KEYS.PROJECTS)) {
    setStored(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
  }

  // Always proactively sanitize any oversized legacy images in projects on startup
  try {
    const existingProjects = getStored<Project[]>(STORAGE_KEYS.PROJECTS, []);
    const { sanitized, changed } = sanitizeProjectImages(existingProjects);
    if (changed) {
      setStored(STORAGE_KEYS.PROJECTS, sanitized);
    }
  } catch {
    // Ignore initial sanitization errors
  }

  if (!localStorage.getItem(STORAGE_KEYS.JOBS)) {
    setStored(STORAGE_KEYS.JOBS, INITIAL_JOBS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.COMMENTS)) {
    setStored(STORAGE_KEYS.COMMENTS, INITIAL_COMMENTS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.APPLICATIONS)) {
    setStored(STORAGE_KEYS.APPLICATIONS, INITIAL_APPLICATIONS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.LIKES)) {
    // Initial like for demo
    setStored(STORAGE_KEYS.LIKES, [
      { id: 'like-1', project_id: 'proj-ai-chatbot', user_id: 'demo-user-1', created_at: new Date().toISOString() },
    ]);
  }
  if (!localStorage.getItem(STORAGE_KEYS.BOOKMARKS)) {
    setStored(STORAGE_KEYS.BOOKMARKS, [
      { id: 'bm-1', project_id: 'proj-ecommerce', user_id: 'demo-user-1', created_at: new Date().toISOString() },
    ]);
  }
  if (!localStorage.getItem(STORAGE_KEYS.SAVED_JOBS)) {
    setStored(STORAGE_KEYS.SAVED_JOBS, [
      { id: 'sj-1', job_id: 'job-1', user_id: 'demo-user-2', created_at: new Date().toISOString() },
    ]);
  }
  if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
    setStored(STORAGE_KEYS.NOTIFICATIONS, [
      {
        id: 'notif-1',
        recipient_id: 'demo-user-1',
        actor_id: 'demo-user-2',
        type: 'like',
        message: 'liked your project CampusMarket',
        related_project_id: 'proj-ecommerce',
        read_at: null,
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
    ]);
  }
  if (!localStorage.getItem(STORAGE_KEYS.LOGINS)) {
    setStored(STORAGE_KEYS.LOGINS, [
      {
        id: 'login-seed-1',
        user_id: 'user-rahul',
        user_name: 'Rahul Sharma',
        email: 'rahul@email.com',
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        formatted_time: '3:40 PM',
        message: 'Looking to hire two React engineers for our collegiate SaaS project. Please connect me with top builders!',
        user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        status: 'success',
      },
      {
        id: 'login-seed-2',
        user_id: 'demo-user-1',
        user_name: 'Alex Chen',
        email: 'alex.chen@berkeley.edu',
        timestamp: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
        formatted_time: '1:15 PM',
        message: 'Updating open source drone vision system repo.',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        status: 'success',
      },
    ]);
  }
  if (!localStorage.getItem(STORAGE_KEYS.CONTACT_MESSAGES)) {
    setStored(STORAGE_KEYS.CONTACT_MESSAGES, [
      {
        id: 'contact-seed-1',
        name: 'Priya Sharma',
        email: 'priya.sharma@stanford.edu',
        subject: 'Stanford AI Lab Research Feature Inquiry',
        message: 'Hi Shivam, we would love to showcase 3 open source machine learning research projects on the SkillBridge project index.',
        category: 'Hiring & Project',
        timestamp: new Date(Date.now() - 140 * 60 * 1000).toISOString(),
        formatted_time: '2:15 PM',
        read: true,
        replied: false,
      },
    ]);
  }
}

// Reset store to initial demo state
export function resetStore(): void {
  setStored(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
  setStored(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
  setStored(STORAGE_KEYS.JOBS, INITIAL_JOBS);
  setStored(STORAGE_KEYS.COMMENTS, INITIAL_COMMENTS);
  setStored(STORAGE_KEYS.APPLICATIONS, INITIAL_APPLICATIONS);
  setStored(STORAGE_KEYS.LIKES, [
    { id: 'like-1', project_id: 'proj-ai-chatbot', user_id: 'demo-user-1', created_at: new Date().toISOString() },
  ]);
  setStored(STORAGE_KEYS.BOOKMARKS, [
    { id: 'bm-1', project_id: 'proj-ecommerce', user_id: 'demo-user-1', created_at: new Date().toISOString() },
  ]);
  setStored(STORAGE_KEYS.SAVED_JOBS, [
    { id: 'sj-1', job_id: 'job-1', user_id: 'demo-user-2', created_at: new Date().toISOString() },
  ]);
  setStored(STORAGE_KEYS.NOTIFICATIONS, [
    {
      id: 'notif-1',
      recipient_id: 'demo-user-1',
      actor_id: 'demo-user-2',
      type: 'like',
      message: 'liked your project CampusMarket',
      related_project_id: 'proj-ecommerce',
      read_at: null,
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
  ]);
}

// Clear all demo data for clean slate
export function clearStore(): void {
  setStored(STORAGE_KEYS.PROFILES, []);
  setStored(STORAGE_KEYS.PROJECTS, []);
  setStored(STORAGE_KEYS.JOBS, []);
  setStored(STORAGE_KEYS.COMMENTS, []);
  setStored(STORAGE_KEYS.APPLICATIONS, []);
  setStored(STORAGE_KEYS.LIKES, []);
  setStored(STORAGE_KEYS.BOOKMARKS, []);
  setStored(STORAGE_KEYS.SAVED_JOBS, []);
  setStored(STORAGE_KEYS.NOTIFICATIONS, []);
}

export const DataService = {
  // ================= PROFILES =================
  async getProfiles(options?: { search?: string; skill?: string }): Promise<Profile[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from('profiles').select('*');
        if (options?.search) {
          query = query.or(`full_name.ilike.%${options.search}%,college.ilike.%${options.search}%,bio.ilike.%${options.search}%`);
        }
        const { data, error } = await query;
        if (!error && data) return data as Profile[];
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to local storage:', err);
      }
    }

    let profiles = getStored<Profile[]>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
    if (options?.search) {
      const q = options.search.toLowerCase();
      profiles = profiles.filter(
        p =>
          p.full_name.toLowerCase().includes(q) ||
          p.college?.toLowerCase().includes(q) ||
          p.bio?.toLowerCase().includes(q) ||
          p.skills.some(s => s.toLowerCase().includes(q))
      );
    }
    if (options?.skill) {
      const skillFilter = options.skill.toLowerCase();
      profiles = profiles.filter(p =>
        p.skills.some(s => s.toLowerCase() === skillFilter)
      );
    }
    return profiles;
  },

  async getProfileById(id: string): Promise<Profile | null> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single();
        if (!error && data) return data as Profile;
      } catch (err) {
        console.warn('Supabase profile query failed, using local:', err);
      }
    }

    const profiles = getStored<Profile[]>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
    return profiles.find(p => p.id === id) || null;
  },

  async updateProfile(id: string, updates: Partial<Profile>): Promise<Profile> {
    const updatedPayload = { ...updates, updated_at: new Date().toISOString() };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .update(updatedPayload)
          .eq('id', id)
          .select()
          .single();
        if (!error && data) return data as Profile;
      } catch (err) {
        console.warn('Supabase profile update failed, using local:', err);
      }
    }

    const profiles = getStored<Profile[]>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
    const index = profiles.findIndex(p => p.id === id);
    let updatedProfile: Profile;
    if (index >= 0) {
      updatedProfile = { ...profiles[index], ...updatedPayload };
      profiles[index] = updatedProfile;
    } else {
      updatedProfile = {
        id,
        full_name: updates.full_name || 'Anonymous Student',
        skills: updates.skills || [],
        available_for_work: updates.available_for_work ?? true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...updates,
      };
      profiles.push(updatedProfile);
    }
    setStored(STORAGE_KEYS.PROFILES, profiles);
    return updatedProfile;
  },

  // ================= PROJECTS =================
  async getProjects(options?: {
    search?: string;
    category?: string;
    tech?: string;
    sort?: 'newest' | 'most_liked';
    currentUserId?: string;
    ownerId?: string;
    visibility?: 'public' | 'all';
  }): Promise<Project[]> {
    const profiles = await this.getProfiles();
    const profileMap = new Map(profiles.map(p => [p.id, p]));
    const likes = getStored<{ project_id: string; user_id: string }[]>(STORAGE_KEYS.LIKES, []);
    const bookmarks = getStored<{ project_id: string; user_id: string }[]>(STORAGE_KEYS.BOOKMARKS, []);
    const comments = getStored<ProjectComment[]>(STORAGE_KEYS.COMMENTS, []);

    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from('projects').select('*');
        if (options?.visibility !== 'all') {
          query = query.eq('visibility', 'public');
        }
        if (options?.ownerId) {
          query = query.eq('owner_id', options.ownerId);
        }
        if (options?.category && options.category !== 'All') {
          query = query.eq('category', options.category);
        }
        const { data, error } = await query;
        if (!error && data) {
          return data.map((item: any) => ({
            ...item,
            owner: profileMap.get(item.owner_id),
            likes_count: likes.filter(l => l.project_id === item.id).length,
            comments_count: comments.filter(c => c.project_id === item.id).length,
            is_liked: options?.currentUserId ? likes.some(l => l.project_id === item.id && l.user_id === options.currentUserId) : false,
            is_bookmarked: options?.currentUserId ? bookmarks.some(b => b.project_id === item.id && b.user_id === options.currentUserId) : false,
          }));
        }
      } catch (err) {
        console.warn('Supabase projects fetch failed, using local:', err);
      }
    }

    let projects = getStored<Project[]>(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);

    // Filter by visibility: public by default unless owner requests their own
    if (options?.ownerId) {
      projects = projects.filter(p => p.owner_id === options.ownerId);
    } else if (options?.visibility !== 'all') {
      projects = projects.filter(p => p.visibility === 'public');
    }

    if (options?.category && options.category !== 'All') {
      projects = projects.filter(p => p.category === options.category);
    }

    if (options?.tech && options.tech !== 'All') {
      const targetTech = options.tech.toLowerCase();
      projects = projects.filter(p =>
        p.technologies.some(t => t.toLowerCase() === targetTech)
      );
    }

    if (options?.search) {
      const q = options.search.toLowerCase();
      projects = projects.filter(
        p =>
          p.title.toLowerCase().includes(q) ||
          p.summary.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.technologies.some(t => t.toLowerCase().includes(q))
      );
    }

    // Attach computed & owner information
    const enriched = projects.map(p => {
      const projectLikes = likes.filter(l => l.project_id === p.id);
      const projectComments = comments.filter(c => c.project_id === p.id);
      return {
        ...p,
        owner: profileMap.get(p.owner_id),
        likes_count: projectLikes.length + (p.likes_count ? Math.max(0, p.likes_count - 1) : 0),
        comments_count: projectComments.length,
        is_liked: options?.currentUserId ? likes.some(l => l.project_id === p.id && l.user_id === options.currentUserId) : false,
        is_bookmarked: options?.currentUserId ? bookmarks.some(b => b.project_id === p.id && b.user_id === options.currentUserId) : false,
      };
    });

    if (options?.sort === 'most_liked') {
      enriched.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
    } else {
      enriched.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return enriched;
  },

  async getProjectById(id: string, currentUserId?: string): Promise<Project | null> {
    const projects = await this.getProjects({ visibility: 'all', currentUserId });
    const project = projects.find(p => p.id === id);
    if (!project) return null;
    // Security check: private projects visible only to owner
    if (project.visibility === 'private' && project.owner_id !== currentUserId) {
      return null;
    }
    return project;
  },

  async createProject(projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project> {
    let cover_image_url = projectData.cover_image_url;
    if (cover_image_url && cover_image_url.startsWith('data:image/') && cover_image_url.length > 120000) {
      cover_image_url = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80';
    }
    const screenshot_urls = (projectData.screenshot_urls || []).map(s => {
      if (s.startsWith('data:image/') && s.length > 100000) {
        return 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80';
      }
      return s;
    });

    const newProject: Project = {
      ...projectData,
      cover_image_url,
      screenshot_urls,
      id: generateId(),
      likes_count: 0,
      comments_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('projects')
          .insert(newProject)
          .select()
          .single();
        if (!error && data) return data as Project;
      } catch (err) {
        console.warn('Supabase project creation failed, using local:', err);
      }
    }

    const projects = getStored<Project[]>(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
    projects.unshift(newProject);
    setStored(STORAGE_KEYS.PROJECTS, projects);
    return newProject;
  },

  async updateProject(id: string, updates: Partial<Project>, currentUserId: string): Promise<Project> {
    const projects = getStored<Project[]>(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
    const existing = projects.find(p => p.id === id);
    if (!existing) throw new Error('Project not found');
    if (existing.owner_id !== currentUserId) {
      throw new Error('Unauthorized: You can only edit your own project.');
    }

    let cover_image_url = updates.cover_image_url ?? existing.cover_image_url;
    if (cover_image_url && cover_image_url.startsWith('data:image/') && cover_image_url.length > 120000) {
      cover_image_url = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80';
    }

    let screenshot_urls = updates.screenshot_urls ?? existing.screenshot_urls;
    if (screenshot_urls) {
      screenshot_urls = screenshot_urls.map(s => {
        if (s.startsWith('data:image/') && s.length > 100000) {
          return 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80';
        }
        return s;
      });
    }

    const updated = {
      ...existing,
      ...updates,
      cover_image_url,
      screenshot_urls,
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('projects').update(updated).eq('id', id);
      } catch (err) {
        console.warn('Supabase project update failed, using local:', err);
      }
    }

    const index = projects.findIndex(p => p.id === id);
    projects[index] = updated;
    setStored(STORAGE_KEYS.PROJECTS, projects);
    return updated;
  },

  async deleteProject(id: string, currentUserId: string): Promise<void> {
    const projects = getStored<Project[]>(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
    const existing = projects.find(p => p.id === id);
    if (!existing) throw new Error('Project not found');
    if (existing.owner_id !== currentUserId) {
      throw new Error('Unauthorized: You can only delete your own project.');
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('projects').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase delete failed, using local:', err);
      }
    }

    const filtered = projects.filter(p => p.id !== id);
    setStored(STORAGE_KEYS.PROJECTS, filtered);
  },

  async toggleLikeProject(projectId: string, userId: string): Promise<boolean> {
    let likes = getStored<{ id: string; project_id: string; user_id: string; created_at: string }[]>(
      STORAGE_KEYS.LIKES,
      []
    );
    const existingIndex = likes.findIndex(l => l.project_id === projectId && l.user_id === userId);
    let isLiked = false;

    if (existingIndex >= 0) {
      likes.splice(existingIndex, 1);
      isLiked = false;
    } else {
      likes.push({
        id: generateId(),
        project_id: projectId,
        user_id: userId,
        created_at: new Date().toISOString(),
      });
      isLiked = true;

      // Create notification for project owner
      const projects = getStored<Project[]>(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
      const proj = projects.find(p => p.id === projectId);
      if (proj && proj.owner_id !== userId) {
        const actor = await this.getProfileById(userId);
        await this.createNotification(
          proj.owner_id,
          userId,
          'like',
          `${actor?.full_name || 'A student'} liked your project "${proj.title}"`,
          projectId
        );
      }
    }

    setStored(STORAGE_KEYS.LIKES, likes);
    return isLiked;
  },

  async toggleBookmarkProject(projectId: string, userId: string): Promise<boolean> {
    let bookmarks = getStored<{ id: string; project_id: string; user_id: string; created_at: string }[]>(
      STORAGE_KEYS.BOOKMARKS,
      []
    );
    const existingIndex = bookmarks.findIndex(b => b.project_id === projectId && b.user_id === userId);
    let isBookmarked = false;

    if (existingIndex >= 0) {
      bookmarks.splice(existingIndex, 1);
      isBookmarked = false;
    } else {
      bookmarks.push({
        id: generateId(),
        project_id: projectId,
        user_id: userId,
        created_at: new Date().toISOString(),
      });
      isBookmarked = true;
    }

    setStored(STORAGE_KEYS.BOOKMARKS, bookmarks);
    return isBookmarked;
  },

  async getSavedProjects(userId: string): Promise<Project[]> {
    const bookmarks = getStored<{ project_id: string; user_id: string }[]>(STORAGE_KEYS.BOOKMARKS, []);
    const userBookmarks = bookmarks.filter(b => b.user_id === userId);
    const allProjects = await this.getProjects({ visibility: 'all', currentUserId: userId });
    return allProjects.filter(p => userBookmarks.some(b => b.project_id === p.id));
  },

  // ================= COMMENTS =================
  async getProjectComments(projectId: string): Promise<ProjectComment[]> {
    const comments = getStored<ProjectComment[]>(STORAGE_KEYS.COMMENTS, INITIAL_COMMENTS);
    const profiles = await this.getProfiles();
    const profileMap = new Map(profiles.map(p => [p.id, p]));

    return comments
      .filter(c => c.project_id === projectId)
      .map(c => ({
        ...c,
        author: profileMap.get(c.author_id),
      }))
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  },

  async addProjectComment(projectId: string, authorId: string, content: string): Promise<ProjectComment> {
    const newComment: ProjectComment = {
      id: generateId(),
      project_id: projectId,
      author_id: authorId,
      content,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const comments = getStored<ProjectComment[]>(STORAGE_KEYS.COMMENTS, INITIAL_COMMENTS);
    comments.push(newComment);
    setStored(STORAGE_KEYS.COMMENTS, comments);

    // Notify project creator
    const projects = getStored<Project[]>(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
    const proj = projects.find(p => p.id === projectId);
    if (proj && proj.owner_id !== authorId) {
      const actor = await this.getProfileById(authorId);
      await this.createNotification(
        proj.owner_id,
        authorId,
        'comment',
        `${actor?.full_name || 'A student'} commented on "${proj.title}"`,
        projectId
      );
    }

    const author = await this.getProfileById(authorId);
    return { ...newComment, author: author || undefined };
  },

  async deleteProjectComment(commentId: string, currentUserId: string): Promise<void> {
    const comments = getStored<ProjectComment[]>(STORAGE_KEYS.COMMENTS, INITIAL_COMMENTS);
    const target = comments.find(c => c.id === commentId);
    if (!target) throw new Error('Comment not found');
    if (target.author_id !== currentUserId) {
      throw new Error('Unauthorized to delete this comment');
    }
    const filtered = comments.filter(c => c.id !== commentId);
    setStored(STORAGE_KEYS.COMMENTS, filtered);
  },

  // ================= JOBS =================
  async getJobs(options?: {
    search?: string;
    jobType?: string;
    status?: string;
    currentUserId?: string;
    ownerId?: string;
  }): Promise<Job[]> {
    const profiles = await this.getProfiles();
    const profileMap = new Map(profiles.map(p => [p.id, p]));
    const applications = getStored<JobApplication[]>(STORAGE_KEYS.APPLICATIONS, INITIAL_APPLICATIONS);
    const savedJobs = getStored<{ job_id: string; user_id: string }[]>(STORAGE_KEYS.SAVED_JOBS, []);

    let jobs = getStored<Job[]>(STORAGE_KEYS.JOBS, INITIAL_JOBS);

    if (options?.ownerId) {
      jobs = jobs.filter(j => j.owner_id === options.ownerId);
    }

    if (options?.status && options.status !== 'all') {
      jobs = jobs.filter(j => j.status === options.status);
    }

    if (options?.jobType && options.jobType !== 'All') {
      jobs = jobs.filter(j => j.job_type === options.jobType);
    }

    if (options?.search) {
      const q = options.search.toLowerCase();
      jobs = jobs.filter(
        j =>
          j.title.toLowerCase().includes(q) ||
          j.description.toLowerCase().includes(q) ||
          j.required_skills.some(s => s.toLowerCase().includes(q))
      );
    }

    const enriched = jobs.map(j => {
      const jobApps = applications.filter(a => a.job_id === j.id);
      return {
        ...j,
        owner: profileMap.get(j.owner_id),
        applications_count: jobApps.length,
        is_saved: options?.currentUserId ? savedJobs.some(sj => sj.job_id === j.id && sj.user_id === options.currentUserId) : false,
        has_applied: options?.currentUserId ? applications.some(a => a.job_id === j.id && a.applicant_id === options.currentUserId) : false,
      };
    });

    enriched.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return enriched;
  },

  async getJobById(id: string, currentUserId?: string): Promise<Job | null> {
    const jobs = await this.getJobs({ currentUserId });
    return jobs.find(j => j.id === id) || null;
  },

  async createJob(jobData: Omit<Job, 'id' | 'created_at' | 'updated_at'>): Promise<Job> {
    const newJob: Job = {
      ...jobData,
      id: generateId(),
      status: 'open',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const jobs = getStored<Job[]>(STORAGE_KEYS.JOBS, INITIAL_JOBS);
    jobs.unshift(newJob);
    setStored(STORAGE_KEYS.JOBS, jobs);
    return newJob;
  },

  async updateJob(id: string, updates: Partial<Job>, currentUserId: string): Promise<Job> {
    const jobs = getStored<Job[]>(STORAGE_KEYS.JOBS, INITIAL_JOBS);
    const existing = jobs.find(j => j.id === id);
    if (!existing) throw new Error('Job not found');
    if (existing.owner_id !== currentUserId) {
      throw new Error('Unauthorized: You can only edit your own job post.');
    }

    const updated = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const index = jobs.findIndex(j => j.id === id);
    jobs[index] = updated;
    setStored(STORAGE_KEYS.JOBS, jobs);
    return updated;
  },

  async deleteJob(id: string, currentUserId: string): Promise<void> {
    const jobs = getStored<Job[]>(STORAGE_KEYS.JOBS, INITIAL_JOBS);
    const existing = jobs.find(j => j.id === id);
    if (!existing) throw new Error('Job not found');
    if (existing.owner_id !== currentUserId) {
      throw new Error('Unauthorized: You can only delete your own job post.');
    }

    const filtered = jobs.filter(j => j.id !== id);
    setStored(STORAGE_KEYS.JOBS, filtered);
  },

  async toggleSaveJob(jobId: string, userId: string): Promise<boolean> {
    let saved = getStored<{ id: string; job_id: string; user_id: string; created_at: string }[]>(
      STORAGE_KEYS.SAVED_JOBS,
      []
    );
    const index = saved.findIndex(s => s.job_id === jobId && s.user_id === userId);
    let isSaved = false;

    if (index >= 0) {
      saved.splice(index, 1);
      isSaved = false;
    } else {
      saved.push({
        id: generateId(),
        job_id: jobId,
        user_id: userId,
        created_at: new Date().toISOString(),
      });
      isSaved = true;
    }

    setStored(STORAGE_KEYS.SAVED_JOBS, saved);
    return isSaved;
  },

  async getSavedJobs(userId: string): Promise<Job[]> {
    const saved = getStored<{ job_id: string; user_id: string }[]>(STORAGE_KEYS.SAVED_JOBS, []);
    const userSaved = saved.filter(s => s.user_id === userId);
    const allJobs = await this.getJobs({ currentUserId: userId });
    return allJobs.filter(j => userSaved.some(s => s.job_id === j.id));
  },

  // ================= APPLICATIONS =================
  async applyToJob(data: {
    jobId: string;
    applicantId: string;
    proposal: string;
    relevantExperience?: string;
    portfolioLinks?: string[];
    proposedBudget: number;
  }): Promise<JobApplication> {
    const applications = getStored<JobApplication[]>(STORAGE_KEYS.APPLICATIONS, INITIAL_APPLICATIONS);

    // Prevent duplicate applications
    const existing = applications.find(
      a => a.job_id === data.jobId && a.applicant_id === data.applicantId
    );
    if (existing) {
      throw new Error('You have already submitted an application for this job.');
    }

    const newApp: JobApplication = {
      id: generateId(),
      job_id: data.jobId,
      applicant_id: data.applicantId,
      proposal: data.proposal,
      relevant_experience: data.relevantExperience,
      portfolio_links: data.portfolioLinks,
      proposed_budget: data.proposedBudget,
      status: 'Pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    applications.push(newApp);
    setStored(STORAGE_KEYS.APPLICATIONS, applications);

    // Notify job poster
    const jobs = getStored<Job[]>(STORAGE_KEYS.JOBS, INITIAL_JOBS);
    const targetJob = jobs.find(j => j.id === data.jobId);
    if (targetJob) {
      const applicant = await this.getProfileById(data.applicantId);
      await this.createNotification(
        targetJob.owner_id,
        data.applicantId,
        'application',
        `${applicant?.full_name || 'A student'} applied to your job listing "${targetJob.title}"`,
        undefined,
        data.jobId
      );
    }

    return newApp;
  },

  async getApplicationsForJob(jobId: string, currentUserId: string): Promise<JobApplication[]> {
    const jobs = getStored<Job[]>(STORAGE_KEYS.JOBS, INITIAL_JOBS);
    const targetJob = jobs.find(j => j.id === jobId);
    if (!targetJob) throw new Error('Job not found');
    if (targetJob.owner_id !== currentUserId) {
      throw new Error('Unauthorized: Only the job poster can view applications for this listing.');
    }

    const applications = getStored<JobApplication[]>(STORAGE_KEYS.APPLICATIONS, INITIAL_APPLICATIONS);
    const profiles = await this.getProfiles();
    const profileMap = new Map(profiles.map(p => [p.id, p]));

    return applications
      .filter(a => a.job_id === jobId)
      .map(a => ({
        ...a,
        applicant: profileMap.get(a.applicant_id),
      }))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async getApplicationsByStudent(applicantId: string): Promise<JobApplication[]> {
    const applications = getStored<JobApplication[]>(STORAGE_KEYS.APPLICATIONS, INITIAL_APPLICATIONS);
    const jobs = getStored<Job[]>(STORAGE_KEYS.JOBS, INITIAL_JOBS);
    const jobMap = new Map(jobs.map(j => [j.id, j]));

    return applications
      .filter(a => a.applicant_id === applicantId)
      .map(a => ({
        ...a,
        job: jobMap.get(a.job_id),
      }))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async updateApplicationStatus(
    applicationId: string,
    status: ApplicationStatus,
    currentUserId: string
  ): Promise<JobApplication> {
    const applications = getStored<JobApplication[]>(STORAGE_KEYS.APPLICATIONS, INITIAL_APPLICATIONS);
    const appIndex = applications.findIndex(a => a.id === applicationId);
    if (appIndex === -1) throw new Error('Application not found');

    const app = applications[appIndex];
    const jobs = getStored<Job[]>(STORAGE_KEYS.JOBS, INITIAL_JOBS);
    const job = jobs.find(j => j.id === app.job_id);
    if (!job || job.owner_id !== currentUserId) {
      throw new Error('Unauthorized: Only the job poster can update application status.');
    }

    const updatedApp: JobApplication = {
      ...app,
      status,
      updated_at: new Date().toISOString(),
    };
    applications[appIndex] = updatedApp;
    setStored(STORAGE_KEYS.APPLICATIONS, applications);

    // Notify applicant
    await this.createNotification(
      app.applicant_id,
      currentUserId,
      'application_status',
      `Your application for "${job.title}" has been updated to "${status}".`,
      undefined,
      job.id
    );

    return updatedApp;
  },

  // ================= NOTIFICATIONS =================
  async getNotifications(userId: string): Promise<NotificationItem[]> {
    const notifications = getStored<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    const profiles = await this.getProfiles();
    const profileMap = new Map(profiles.map(p => [p.id, p]));

    return notifications
      .filter(n => n.recipient_id === userId)
      .map(n => ({
        ...n,
        actor: profileMap.get(n.actor_id),
      }))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async markNotificationAsRead(notificationId: string): Promise<void> {
    const notifications = getStored<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    const index = notifications.findIndex(n => n.id === notificationId);
    if (index >= 0) {
      notifications[index].read_at = new Date().toISOString();
      setStored(STORAGE_KEYS.NOTIFICATIONS, notifications);
    }
  },

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    const notifications = getStored<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    const updated = notifications.map(n =>
      n.recipient_id === userId ? { ...n, read_at: new Date().toISOString() } : n
    );
    setStored(STORAGE_KEYS.NOTIFICATIONS, updated);
  },

  async createNotification(
    recipientId: string,
    actorId: string,
    type: NotificationItem['type'],
    message: string,
    relatedProjectId?: string,
    relatedJobId?: string,
    relatedConversationId?: string
  ): Promise<void> {
    const notifications = getStored<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    const newNotif: NotificationItem = {
      id: generateId(),
      recipient_id: recipientId,
      actor_id: actorId,
      type,
      message,
      related_project_id: relatedProjectId,
      related_job_id: relatedJobId,
      related_conversation_id: relatedConversationId,
      read_at: null,
      created_at: new Date().toISOString(),
    };
    notifications.unshift(newNotif);
    setStored(STORAGE_KEYS.NOTIFICATIONS, notifications);
  },

  // ================= CHAT & CONVERSATIONS =================
  async getConversations(userId: string): Promise<Conversation[]> {
    const conversations = getStored<Conversation[]>(STORAGE_KEYS.CONVERSATIONS, []);
    const messages = getStored<ChatMessage[]>(STORAGE_KEYS.MESSAGES, []);
    const profiles = await this.getProfiles();
    const profileMap = new Map(profiles.map(p => [p.id, p]));

    return conversations
      .filter(c => c.sender_id === userId || c.recipient_id === userId)
      .map(c => {
        const unreadCount = messages.filter(
          m => m.conversation_id === c.id && m.sender_id !== userId && !m.read_at
        ).length;
        return {
          ...c,
          sender: profileMap.get(c.sender_id),
          recipient: profileMap.get(c.recipient_id),
          unread_count: unreadCount,
        };
      })
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  },

  async getConversation(conversationId: string, currentUserId?: string): Promise<Conversation | null> {
    const conversations = getStored<Conversation[]>(STORAGE_KEYS.CONVERSATIONS, []);
    const conv = conversations.find(c => c.id === conversationId);
    if (!conv) return null;

    const profiles = await this.getProfiles();
    const profileMap = new Map(profiles.map(p => [p.id, p]));

    return {
      ...conv,
      sender: profileMap.get(conv.sender_id),
      recipient: profileMap.get(conv.recipient_id),
    };
  },

  async getConversationBetween(
    senderId: string,
    recipientId: string,
    projectId?: string
  ): Promise<Conversation | null> {
    const conversations = getStored<Conversation[]>(STORAGE_KEYS.CONVERSATIONS, []);
    const match = conversations.find(
      c =>
        ((c.sender_id === senderId && c.recipient_id === recipientId) ||
         (c.sender_id === recipientId && c.recipient_id === senderId)) &&
        (!projectId || c.project_id === projectId)
    );
    if (!match) return null;
    return this.getConversation(match.id);
  },

  async createChatRequest(params: {
    senderId: string;
    recipientId: string;
    projectId?: string;
    projectTitle?: string;
    message: string;
  }): Promise<Conversation> {
    const { senderId, recipientId, projectId, projectTitle, message } = params;
    const conversations = getStored<Conversation[]>(STORAGE_KEYS.CONVERSATIONS, []);
    const messages = getStored<ChatMessage[]>(STORAGE_KEYS.MESSAGES, []);

    // Check if an active or pending conversation already exists between these users for this project
    const existingIndex = conversations.findIndex(
      c =>
        ((c.sender_id === senderId && c.recipient_id === recipientId) ||
         (c.sender_id === recipientId && c.recipient_id === senderId)) &&
        (!projectId || c.project_id === projectId)
    );

    const now = new Date().toISOString();
    let conv: Conversation;

    if (existingIndex >= 0) {
      conv = conversations[existingIndex];
      // If was declined, reactivate to pending
      if (conv.status === 'declined') {
        conv.status = 'pending';
      }
      conv.updated_at = now;
      conv.last_message = message;
      conversations[existingIndex] = conv;
    } else {
      conv = {
        id: generateId(),
        project_id: projectId,
        project_title: projectTitle,
        sender_id: senderId,
        recipient_id: recipientId,
        status: 'pending',
        initial_message: message,
        last_message: message,
        created_at: now,
        updated_at: now,
      };
      conversations.unshift(conv);
    }

    setStored(STORAGE_KEYS.CONVERSATIONS, conversations);

    // Add initial message
    const initialMsg: ChatMessage = {
      id: generateId(),
      conversation_id: conv.id,
      sender_id: senderId,
      content: message,
      created_at: now,
      read_at: null,
    };
    messages.push(initialMsg);
    setStored(STORAGE_KEYS.MESSAGES, messages);

    // Create Notification for recipient with chat_request
    const sender = await this.getProfileById(senderId);
    const senderName = sender?.full_name || 'A student / recruiter';
    const projectSuffix = projectTitle ? ` regarding "${projectTitle}"` : '';

    await this.createNotification(
      recipientId,
      senderId,
      'chat_request',
      `${senderName} wants to talk to you${projectSuffix}: "${message.slice(0, 80)}${message.length > 80 ? '...' : ''}"`,
      projectId,
      undefined,
      conv.id
    );

    return (await this.getConversation(conv.id))!;
  },

  async respondChatRequest(
    conversationId: string,
    responderId: string,
    accept: boolean
  ): Promise<Conversation> {
    const conversations = getStored<Conversation[]>(STORAGE_KEYS.CONVERSATIONS, []);
    const index = conversations.findIndex(c => c.id === conversationId);
    if (index === -1) {
      throw new Error('Conversation not found');
    }

    const conv = conversations[index];
    if (conv.recipient_id !== responderId && conv.sender_id !== responderId) {
      throw new Error('Unauthorized');
    }

    const now = new Date().toISOString();
    conv.status = accept ? 'accepted' : 'declined';
    conv.updated_at = now;
    conversations[index] = conv;
    setStored(STORAGE_KEYS.CONVERSATIONS, conversations);

    const responder = await this.getProfileById(responderId);
    const responderName = responder?.full_name || 'Creator';
    const targetUserId = conv.sender_id === responderId ? conv.recipient_id : conv.sender_id;

    if (accept) {
      const projectSuffix = conv.project_title ? ` to discuss "${conv.project_title}"` : '';
      await this.createNotification(
        targetUserId,
        responderId,
        'chat_accepted',
        `${responderName} accepted your message request${projectSuffix}! You can now chat directly.`,
        conv.project_id,
        undefined,
        conv.id
      );
    }

    return (await this.getConversation(conv.id))!;
  },

  async getConversationMessages(conversationId: string): Promise<ChatMessage[]> {
    const messages = getStored<ChatMessage[]>(STORAGE_KEYS.MESSAGES, []);
    const profiles = await this.getProfiles();
    const profileMap = new Map(profiles.map(p => [p.id, p]));

    return messages
      .filter(m => m.conversation_id === conversationId)
      .map(m => ({
        ...m,
        sender: profileMap.get(m.sender_id),
      }))
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  },

  async sendChatMessage(
    conversationId: string,
    senderId: string,
    content: string
  ): Promise<ChatMessage> {
    const conversations = getStored<Conversation[]>(STORAGE_KEYS.CONVERSATIONS, []);
    const index = conversations.findIndex(c => c.id === conversationId);
    if (index === -1) {
      throw new Error('Conversation not found');
    }

    const conv = conversations[index];
    if (conv.status !== 'accepted') {
      throw new Error('You cannot send messages until the connection request is accepted.');
    }

    const now = new Date().toISOString();
    const messages = getStored<ChatMessage[]>(STORAGE_KEYS.MESSAGES, []);

    const newMsg: ChatMessage = {
      id: generateId(),
      conversation_id: conversationId,
      sender_id: senderId,
      content,
      created_at: now,
      read_at: null,
    };
    messages.push(newMsg);
    setStored(STORAGE_KEYS.MESSAGES, messages);

    // Update conversation
    conv.last_message = content;
    conv.updated_at = now;
    conversations[index] = conv;
    setStored(STORAGE_KEYS.CONVERSATIONS, conversations);

    // Notify recipient
    const recipientId = conv.sender_id === senderId ? conv.recipient_id : conv.sender_id;
    const sender = await this.getProfileById(senderId);
    const senderName = sender?.full_name || 'Someone';

    await this.createNotification(
      recipientId,
      senderId,
      'chat_message',
      `${senderName}: "${content.slice(0, 80)}${content.length > 80 ? '...' : ''}"`,
      conv.project_id,
      undefined,
      conv.id
    );

    return newMsg;
  },

  async markConversationRead(conversationId: string, userId: string): Promise<void> {
    const messages = getStored<ChatMessage[]>(STORAGE_KEYS.MESSAGES, []);
    let modified = false;
    const now = new Date().toISOString();

    const updated = messages.map(m => {
      if (m.conversation_id === conversationId && m.sender_id !== userId && !m.read_at) {
        modified = true;
        return { ...m, read_at: now };
      }
      return m;
    });

    if (modified) {
      setStored(STORAGE_KEYS.MESSAGES, updated);
    }
  },

  // ================= STORAGE / FILE UPLOAD =================
  async uploadImage(file: File): Promise<string> {
    if (isSupabaseConfigured && supabase) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${generateId()}.${fileExt}`;
        const filePath = `uploads/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('project-assets')
          .upload(filePath, file);

        if (!uploadError) {
          const { data } = supabase.storage
            .from('project-assets')
            .getPublicUrl(filePath);
          if (data?.publicUrl) return data.publicUrl;
        }
      } catch (err) {
        console.warn('Supabase storage upload failed, falling back to local data URL:', err);
      }
    }

    // Use canvas compression to keep image compact (~30-50KB) and preserve localStorage quota
    return compressImageFile(file, 800, 0.7);
  },

  // ================= LOGINS & OWNER NOTIFICATIONS =================
  async recordLogin(params: {
    userId: string;
    userName: string;
    email: string;
    message?: string;
    status?: 'success' | 'failed';
    userAgent?: string;
  }): Promise<LoginRecord> {
    const logins = getStored<LoginRecord[]>(STORAGE_KEYS.LOGINS, []);
    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });

    const newRecord: LoginRecord = {
      id: generateId(),
      user_id: params.userId,
      user_name: params.userName,
      email: params.email,
      timestamp: now.toISOString(),
      formatted_time: formattedTime,
      message: params.message?.trim() || undefined,
      user_agent: params.userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown'),
      status: params.status || 'success',
    };

    logins.unshift(newRecord);
    setStored(STORAGE_KEYS.LOGINS, logins);

    // Call sendEmailNotification to deliver notification to owner's Gmail
    EmailService.sendLoginEmailNotification({
      userName: params.userName,
      email: params.email,
      optionalMessage: params.message,
    });

    return newRecord;
  },

  async getLoginHistory(): Promise<LoginRecord[]> {
    return getStored<LoginRecord[]>(STORAGE_KEYS.LOGINS, []);
  },

  // ================= CONTACT / OWNER MESSAGES =================
  async createContactMessage(params: {
    name: string;
    email: string;
    subject: string;
    message: string;
    category?: ContactMessage['category'];
  }): Promise<ContactMessage> {
    const contactMessages = getStored<ContactMessage[]>(STORAGE_KEYS.CONTACT_MESSAGES, []);
    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });

    const newMsg: ContactMessage = {
      id: generateId(),
      name: params.name,
      email: params.email,
      subject: params.subject,
      message: params.message,
      category: params.category || 'General Inquiry',
      timestamp: now.toISOString(),
      formatted_time: formattedTime,
      read: false,
      replied: false,
    };

    contactMessages.unshift(newMsg);
    setStored(STORAGE_KEYS.CONTACT_MESSAGES, contactMessages);

    // Dispatch email notification to owner's Gmail inbox
    EmailService.sendContactEmailNotification({
      name: params.name,
      email: params.email,
      subject: params.subject,
      message: params.message,
      category: params.category,
    });

    return newMsg;
  },

  async getContactMessages(): Promise<ContactMessage[]> {
    return getStored<ContactMessage[]>(STORAGE_KEYS.CONTACT_MESSAGES, []);
  },

  async markContactMessageRead(id: string): Promise<void> {
    const contactMessages = getStored<ContactMessage[]>(STORAGE_KEYS.CONTACT_MESSAGES, []);
    const updated = contactMessages.map(m => (m.id === id ? { ...m, read: true } : m));
    setStored(STORAGE_KEYS.CONTACT_MESSAGES, updated);
  },

  async deleteContactMessage(id: string): Promise<void> {
    const contactMessages = getStored<ContactMessage[]>(STORAGE_KEYS.CONTACT_MESSAGES, []);
    const updated = contactMessages.filter(m => m.id !== id);
    setStored(STORAGE_KEYS.CONTACT_MESSAGES, updated);
  },

  // =========================================================================
  // PRICING, SUBSCRIPTION & RESUME SERVICES
  // NOTE FOR SUPABASE MIGRATION:
  // These subscription and resume methods are centralized here so they can be
  // moved 1:1 to Supabase tables:
  // 1. `subscriptions` (user_id, plan, billing, status, start_date, end_date, razorpay_payment_id)
  // 2. `resumes` (id, user_id, title, template, data, is_public, slug, created_at, updated_at, views_count)
  // 3. `resume_sends` (resume_id, sent_to, sent_at)
  // Row Level Security (RLS) will enforce that users can only select and mutate their own resumes.
  // =========================================================================

  getSubscription(userId?: string): UserSubscription {
    const defaultSub: UserSubscription = {
      userId: userId || 'anonymous',
      plan: 'free',
      billing: 'one-time',
      status: 'active',
      startDate: new Date().toISOString(),
      freeUsesRemaining: 3, // Rule: Resume builder is free 3 times before upgrade is required
      aiUsesRemaining: 0,
      sendsCount: 0,
    };

    const stored = getStored<UserSubscription>(STORAGE_KEYS.SUBSCRIPTION, defaultSub);
    // Ensure freeUsesRemaining is preserved or initialized
    if (typeof stored.freeUsesRemaining !== 'number') {
      stored.freeUsesRemaining = 3;
    }
    return stored;
  },

  saveSubscription(subscription: UserSubscription): void {
    setStored(STORAGE_KEYS.SUBSCRIPTION, subscription);
  },

  getFreeUsesRemaining(): number {
    const sub = this.getSubscription();
    return sub.freeUsesRemaining ?? 3;
  },

  decrementFreeUse(): number {
    const sub = this.getSubscription();
    if (sub.plan === 'free') {
      const remaining = Math.max(0, (sub.freeUsesRemaining ?? 3) - 1);
      sub.freeUsesRemaining = remaining;
      this.saveSubscription(sub);
      return remaining;
    }
    return 999; // Unlimited for paid plans
  },

  getAiUsesRemaining(): number {
    const sub = this.getSubscription();
    if (sub.plan === 'premium') return 9999;
    return sub.aiUsesRemaining ?? (sub.plan === 'basic' ? 5 : 0);
  },

  decrementAiUse(): number {
    const sub = this.getSubscription();
    if (sub.plan === 'premium') return 9999;
    const current = sub.aiUsesRemaining ?? (sub.plan === 'basic' ? 5 : 0);
    const updated = Math.max(0, current - 1);
    sub.aiUsesRemaining = updated;
    this.saveSubscription(sub);
    return updated;
  },

  getSavedResumes(userId?: string): SavedResume[] {
    let all = getStored<SavedResume[]>(STORAGE_KEYS.SAVED_RESUMES, []);
    if (!all || all.length === 0) {
      all = [...INITIAL_RESUMES];
      setStored(STORAGE_KEYS.SAVED_RESUMES, all);
    }
    if (!userId) return all;
    const userResumes = all.filter(r => r.userId === userId);

    if (userResumes.length === 0) {
      try {
        const draftStr = localStorage.getItem('skillbridge_resume_builder_data');
        if (draftStr) {
          const draftData = JSON.parse(draftStr);
          const newResume = this.saveResume({
            id: `resume-${userId}`,
            userId,
            title: `${draftData.personal?.fullName || 'Student'} Resume`,
            template: draftData.formatting?.template || 'modern-tech',
            data: draftData,
            isPublic: true,
          });
          return [newResume];
        }
      } catch (e) {
        // fallback ignore
      }
    }
    return userResumes;
  },

  getResumeById(id: string): SavedResume | null {
    const all = getStored<SavedResume[]>(STORAGE_KEYS.SAVED_RESUMES, []);
    return all.find(r => r.id === id) || null;
  },

  getResumeBySlug(slug: string): SavedResume | null {
    const all = getStored<SavedResume[]>(STORAGE_KEYS.SAVED_RESUMES, []);
    return all.find(r => r.slug === slug || r.id === slug) || null;
  },

  saveResume(resumeInput: Partial<SavedResume> & { data: any }): SavedResume {
    const all = getStored<SavedResume[]>(STORAGE_KEYS.SAVED_RESUMES, []);
    const existingIndex = all.findIndex(r => r.id === resumeInput.id);
    const now = new Date().toISOString();

    if (existingIndex >= 0) {
      const updated: SavedResume = {
        ...all[existingIndex],
        ...resumeInput,
        updatedAt: now,
      };
      all[existingIndex] = updated;
      setStored(STORAGE_KEYS.SAVED_RESUMES, all);
      return updated;
    } else {
      const nameSlug = (resumeInput.data?.personal?.fullName || 'student')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      const uniqueSlug = `${nameSlug || 'resume'}-${generateId().slice(0, 8).toLowerCase()}`;

      const newResume: SavedResume = {
        id: resumeInput.id || generateId(),
        userId: resumeInput.userId || 'guest',
        title: resumeInput.title || `${resumeInput.data?.personal?.fullName || 'My'} Resume`,
        template: resumeInput.template || resumeInput.data?.formatting?.template || 'modern-tech',
        data: resumeInput.data,
        isPublic: resumeInput.isPublic ?? false,
        slug: resumeInput.slug || uniqueSlug,
        createdAt: now,
        updatedAt: now,
        viewsCount: 0,
        sendsCount: 0,
      };
      all.unshift(newResume);
      setStored(STORAGE_KEYS.SAVED_RESUMES, all);
      return newResume;
    }
  },

  deleteResume(id: string): void {
    const all = getStored<SavedResume[]>(STORAGE_KEYS.SAVED_RESUMES, []);
    const updated = all.filter(r => r.id !== id);
    setStored(STORAGE_KEYS.SAVED_RESUMES, updated);
  },

  incrementResumeViews(idOrSlug: string): void {
    const all = getStored<SavedResume[]>(STORAGE_KEYS.SAVED_RESUMES, []);
    const resume = all.find(r => r.id === idOrSlug || r.slug === idOrSlug);
    if (resume) {
      resume.viewsCount = (resume.viewsCount || 0) + 1;
      setStored(STORAGE_KEYS.SAVED_RESUMES, all);
    }
  },

  logResumeSend(resumeId: string, recipientEmail: string): void {
    const sends = getStored<any[]>(STORAGE_KEYS.RESUME_SENDS, []);
    sends.unshift({
      id: generateId(),
      resumeId,
      recipientEmail,
      sentAt: new Date().toISOString(),
    });
    setStored(STORAGE_KEYS.RESUME_SENDS, sends);

    const sub = this.getSubscription();
    sub.sendsCount = (sub.sendsCount || 0) + 1;
    this.saveSubscription(sub);

    const resumes = getStored<SavedResume[]>(STORAGE_KEYS.SAVED_RESUMES, []);
    const resume = resumes.find(r => r.id === resumeId);
    if (resume) {
      resume.sendsCount = (resume.sendsCount || 0) + 1;
      setStored(STORAGE_KEYS.SAVED_RESUMES, resumes);
    }
  },
};

