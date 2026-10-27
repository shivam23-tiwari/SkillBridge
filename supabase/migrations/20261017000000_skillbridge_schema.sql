-- ==============================================================================
-- SkillBridge — Database Schema & Row-Level Security (RLS) Migration
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    college TEXT,
    degree TEXT,
    bio TEXT,
    skills TEXT[] DEFAULT '{}',
    github_url TEXT,
    linkedin_url TEXT,
    portfolio_url TEXT,
    available_for_work BOOLEAN DEFAULT TRUE,
    collaboration_interests TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    technologies TEXT[] DEFAULT '{}',
    cover_image_url TEXT NOT NULL,
    screenshot_urls TEXT[] DEFAULT '{}',
    github_url TEXT,
    live_demo_url TEXT,
    visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. PROJECT LIKES TABLE
CREATE TABLE IF NOT EXISTS public.project_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT unique_project_user_like UNIQUE (project_id, user_id)
);

-- 4. PROJECT BOOKMARKS TABLE
CREATE TABLE IF NOT EXISTS public.project_bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT unique_project_user_bookmark UNIQUE (project_id, user_id)
);

-- 5. JOBS TABLE
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    required_skills TEXT[] DEFAULT '{}',
    budget_min NUMERIC NOT NULL DEFAULT 0,
    budget_max NUMERIC NOT NULL DEFAULT 0,
    job_type TEXT NOT NULL CHECK (job_type IN ('Fixed Price', 'Hourly', 'Milestone', 'Contract')),
    deadline DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'closed')),
    application_instructions TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    applicant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    proposal TEXT NOT NULL,
    relevant_experience TEXT,
    portfolio_links TEXT[] DEFAULT '{}',
    proposed_budget NUMERIC NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Reviewed', 'Shortlisted', 'Accepted', 'Rejected')),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT unique_job_applicant UNIQUE (job_id, applicant_id)
);

-- 7. PROJECT COMMENTS TABLE
CREATE TABLE IF NOT EXISTS public.project_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 8. SAVED JOBS TABLE
CREATE TABLE IF NOT EXISTS public.saved_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT unique_saved_job_user UNIQUE (job_id, user_id)
);

-- 9. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    actor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    related_project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    related_job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- INDEXES FOR HIGH QUERY PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_projects_owner ON public.projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_category ON public.projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_visibility ON public.projects(visibility);
CREATE INDEX IF NOT EXISTS idx_project_likes_project ON public.project_likes(project_id);
CREATE INDEX IF NOT EXISTS idx_project_bookmarks_project ON public.project_bookmarks(project_id);
CREATE INDEX IF NOT EXISTS idx_jobs_owner ON public.jobs(owner_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_applications_job ON public.applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_applicant ON public.applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications(recipient_id);

-- ==============================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER ON AUTH SIGNUP
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Student Developer'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- PROJECTS POLICIES
CREATE POLICY "Public projects are viewable by everyone" 
  ON public.projects FOR SELECT USING (visibility = 'public' OR auth.uid() = owner_id);

CREATE POLICY "Authenticated users can create projects" 
  ON public.projects FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own projects" 
  ON public.projects FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own projects" 
  ON public.projects FOR DELETE USING (auth.uid() = owner_id);

-- PROJECT LIKES POLICIES
CREATE POLICY "Anyone can view project likes" 
  ON public.project_likes FOR SELECT USING (true);

CREATE POLICY "Users can like projects as themselves" 
  ON public.project_likes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own likes" 
  ON public.project_likes FOR DELETE USING (auth.uid() = user_id);

-- PROJECT BOOKMARKS POLICIES
CREATE POLICY "Users can view their own bookmarks" 
  ON public.project_bookmarks FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can bookmark projects as themselves" 
  ON public.project_bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own bookmarks" 
  ON public.project_bookmarks FOR DELETE USING (auth.uid() = user_id);

-- JOBS POLICIES
CREATE POLICY "Open jobs are viewable by everyone" 
  ON public.jobs FOR SELECT USING (true);

CREATE POLICY "Authenticated users can post jobs" 
  ON public.jobs FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Job owners can update their jobs" 
  ON public.jobs FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Job owners can delete their jobs" 
  ON public.jobs FOR DELETE USING (auth.uid() = owner_id);

-- APPLICATIONS POLICIES
CREATE POLICY "Applicants can view their own applications" 
  ON public.applications FOR SELECT USING (
    auth.uid() = applicant_id OR 
    auth.uid() IN (SELECT owner_id FROM public.jobs WHERE id = job_id)
  );

CREATE POLICY "Students can submit job applications as themselves" 
  ON public.applications FOR INSERT WITH CHECK (auth.uid() = applicant_id);

CREATE POLICY "Job owners can update application statuses" 
  ON public.applications FOR UPDATE USING (
    auth.uid() IN (SELECT owner_id FROM public.jobs WHERE id = job_id)
  );

-- COMMENTS POLICIES
CREATE POLICY "Anyone can view comments on public projects" 
  ON public.project_comments FOR SELECT USING (true);

CREATE POLICY "Authenticated users can post comments" 
  ON public.project_comments FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can delete their own comments" 
  ON public.project_comments FOR DELETE USING (auth.uid() = author_id);

-- NOTIFICATIONS POLICIES
CREATE POLICY "Users can view their own notifications" 
  ON public.notifications FOR SELECT USING (auth.uid() = recipient_id);

CREATE POLICY "Users can update their own notifications (mark read)" 
  ON public.notifications FOR UPDATE USING (auth.uid() = recipient_id);

-- STORAGE BUCKET CONFIGURATION (for Supabase Storage 'project-assets')
INSERT INTO storage.buckets (id, name, public) 
VALUES ('project-assets', 'project-assets', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can view project-assets" 
  ON storage.objects FOR SELECT USING (bucket_id = 'project-assets');

CREATE POLICY "Authenticated users can upload project-assets" 
  ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'project-assets' AND auth.role() = 'authenticated'
  );
