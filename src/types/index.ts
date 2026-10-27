export type ProjectCategory =
  | 'Web Development'
  | 'AI & Machine Learning'
  | 'UI/UX Design'
  | 'Mobile Apps'
  | 'Data Science'
  | 'Game Development'
  | 'Cloud & DevOps'
  | 'Cybersecurity';

export type JobType = 'Fixed Price' | 'Hourly' | 'Milestone' | 'Contract';

export type JobStatus = 'open' | 'in_progress' | 'completed' | 'closed';

export type ApplicationStatus = 'Pending' | 'Reviewed' | 'Shortlisted' | 'Accepted' | 'Rejected';

export interface Profile {
  id: string;
  email?: string;
  full_name: string;
  avatar_url?: string;
  college?: string;
  degree?: string;
  bio?: string;
  skills: string[];
  github_url?: string;
  linkedin_url?: string;
  instagram_url?: string;
  portfolio_url?: string;
  available_for_work: boolean;
  collaboration_interests?: string;
  role?: 'student' | 'client' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  owner_id: string;
  title: string;
  summary: string;
  description: string;
  category: ProjectCategory;
  technologies: string[];
  cover_image_url: string;
  screenshot_urls: string[];
  github_url?: string;
  live_demo_url?: string;
  visibility: 'public' | 'private';
  likes_count?: number;
  comments_count?: number;
  created_at: string;
  updated_at: string;
  // joined fields
  owner?: Profile;
  is_liked?: boolean;
  is_bookmarked?: boolean;
}

export interface ProjectLike {
  id: string;
  project_id: string;
  user_id: string;
  created_at: string;
}

export interface ProjectBookmark {
  id: string;
  project_id: string;
  user_id: string;
  created_at: string;
}

export interface ProjectComment {
  id: string;
  project_id: string;
  author_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  author?: Profile;
}

export type Comment = ProjectComment;

export interface Job {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  required_skills: string[];
  budget_min: number;
  budget_max: number;
  job_type: JobType;
  deadline: string;
  status: JobStatus;
  application_instructions?: string;
  created_at: string;
  updated_at: string;
  // joined fields
  owner?: Profile;
  applications_count?: number;
  is_saved?: boolean;
  has_applied?: boolean;
}

export interface JobApplication {
  id: string;
  job_id: string;
  applicant_id: string;
  proposal: string;
  relevant_experience?: string;
  portfolio_links?: string[];
  proposed_budget: number;
  status: ApplicationStatus;
  created_at: string;
  updated_at: string;
  // joined fields
  applicant?: Profile;
  job?: Job;
}

export interface SavedJob {
  id: string;
  job_id: string;
  user_id: string;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  recipient_id: string;
  actor_id: string;
  type:
    | 'like'
    | 'comment'
    | 'application'
    | 'application_status'
    | 'collaboration_request'
    | 'chat_request'
    | 'chat_accepted'
    | 'chat_message';
  message: string;
  related_project_id?: string;
  related_job_id?: string;
  related_conversation_id?: string;
  read_at: string | null;
  created_at: string;
  actor?: Profile;
}

export type ConversationStatus = 'pending' | 'accepted' | 'declined';

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at?: string | null;
  sender?: Profile;
}

export interface Conversation {
  id: string;
  project_id?: string;
  project_title?: string;
  sender_id: string;
  recipient_id: string;
  status: ConversationStatus;
  initial_message: string;
  last_message?: string;
  created_at: string;
  updated_at: string;
  sender?: Profile;
  recipient?: Profile;
  unread_count?: number;
}

export interface LoginRecord {
  id: string;
  user_id: string;
  user_name: string;
  email: string;
  timestamp: string;
  formatted_time: string;
  message?: string; // Optional message box from login
  user_agent?: string;
  ip_address?: string;
  status: 'success' | 'failed';
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  category: 'General Inquiry' | 'Hiring & Project' | 'Platform Feedback' | 'Partnership';
  timestamp: string;
  formatted_time: string;
  read: boolean;
  replied?: boolean;
}

export interface OwnerGmailEmail {
  id: string;
  to: string; // shivamtiwari18107@gmail.com
  from: string;
  subject: string;
  preview: string;
  body: string;
  timestamp: string;
  formatted_time: string;
  date: string;
  category: 'login' | 'contact' | 'signup' | 'hire';
  read: boolean;
  sender_name?: string;
  sender_email?: string;
  user_message?: string;
}

// ================= RESUME BUILDER TYPES =================
export interface ResumeEducation {
  id: string;
  degree: string;
  institution: string;
  startYear?: string;
  endYear: string;
  scoreType: 'CGPA' | 'Percentage';
  score: string;
  fieldOfStudy?: string;
  city?: string;
}

export interface SchoolEducation {
  schoolName: string;
  boardOrStream: string;
  year: string;
  score: string;
}

export interface ResumeProject {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  importedFromSkillBridge?: boolean;
}

export interface ResumeExperience {
  id: string;
  company: string;
  role: string;
  duration: string;
  location?: string;
  description: string;
  isCurrent?: boolean;
}

export interface ResumeCertification {
  id: string;
  name: string;
  issuer: string;
  year: string;
  certificateLink?: string;
}

export interface ResumeAchievement {
  id: string;
  title: string;
  organization: string;
  year: string;
  description?: string;
}

export interface ResumeExtraSection {
  spokenLanguages?: string;
  volunteering?: string;
  extracurriculars?: string;
  hobbies?: string;
  references?: string;
}

export type ResumeTemplateId =
  | 'modern-tech'
  | 'minimal-classic'
  | 'executive-slate'
  | 'creative-developer';

export type ResumeSectionId =
  | 'summary'
  | 'education'
  | 'skills'
  | 'projects'
  | 'experience'
  | 'certifications'
  | 'achievements'
  | 'extra';

export type ResumeFontFamily = 'calibri' | 'arial' | 'times';

export interface ResumeFormatting {
  template: ResumeTemplateId;
  accentColor: string;
  fontFamily: ResumeFontFamily;
  fontSize: 'small' | 'medium' | 'large';
  spacing: 'compact' | 'normal' | 'relaxed';
  headerAlignment: 'left' | 'center';
  showPhoto: boolean;
  fitToOnePage: boolean;
  sectionOrder: ResumeSectionId[];
  visibleSections: {
    summary: boolean;
    education: boolean;
    skills: boolean;
    projects: boolean;
    experience: boolean;
    certifications: boolean;
    achievements: boolean;
    extra: boolean;
  };
}

export interface ResumeData {
  personal: {
    fullName: string;
    targetRole?: string;
    photoUrl?: string;
    email: string;
    phone: string;
    cityState: string;
    linkedinUrl?: string;
    githubUrl?: string;
    portfolioUrl?: string;
  };
  objective: string;
  education: {
    higherEducation: ResumeEducation[];
    twelfth: SchoolEducation;
    tenth: SchoolEducation;
  };
  skills: {
    technical: string[]; // Languages
    frameworks?: string[]; // Frameworks & Data
    aiLlm?: string[]; // AI / LLM
    cloudDevops?: string[]; // Cloud & DevOps
    tools: string[]; // Tools
    soft: string[];
    languages: string[];
  };
  projects: ResumeProject[];
  experience: ResumeExperience[];
  certifications: ResumeCertification[];
  achievements: ResumeAchievement[];
  extra: ResumeExtraSection;
  formatting: ResumeFormatting;
}


// ================= PRICING & SUBSCRIPTION TYPES =================
export type UserPlan = 'free' | 'basic' | 'premium';
export type SubscriptionBilling = 'one-time' | 'monthly' | 'yearly';

export interface UserSubscription {
  userId: string;
  plan: UserPlan;
  billing: SubscriptionBilling;
  status: 'active' | 'expired';
  startDate: string;
  endDate?: string;
  paymentId?: string;
  freeUsesRemaining: number; // Starts at 3 for free users
  aiUsesRemaining: number;   // Starts at 0 for free, 5 for basic, 9999 for premium
  sendsCount: number;
}

export interface SavedResume {
  id: string;
  userId: string;
  title: string;
  template: ResumeTemplateId;
  data: ResumeData;
  isPublic: boolean;
  slug: string;
  createdAt: string;
  updatedAt: string;
  viewsCount: number;
  sendsCount: number;
}

export interface ATSAnalysisResult {
  matchScore: number; // 0 - 100
  matchedKeywords: string[];
  missingKeywords: string[];
  recommendations: string[];
  jobTitleDetected?: string;
}

export interface ResumePillarScore {
  name: string;
  score: number; // 0 - 100
  status: 'excellent' | 'good' | 'needs-work';
  feedback: string;
}

export interface DetailedResumeAnalysis {
  overallScore: number; // 0 - 100
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C';
  targetRole: string;
  summaryText: string;
  pillars: {
    impactAndMetrics: ResumePillarScore;
    technicalDepth: ResumePillarScore;
    atsStructure: ResumePillarScore;
    actionVerbs: ResumePillarScore;
    contactPresence: ResumePillarScore;
  };
  matchedKeywords: string[];
  missingKeywords: string[];
  strengths: string[];
  criticalFixes: string[];
  recommendations: string[];
  wordCount: number;
  readingTimeMinutes: number;
}


