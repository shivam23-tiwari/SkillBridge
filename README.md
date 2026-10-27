# SkillBridge — Student Freelancer Marketplace & Project Showcase

> **Tagline:** *"Where student talent meets real opportunities."*

SkillBridge is a modern, student-focused freelancer marketplace and engineering project showcase. University students can publish code repositories and design prototypes, discover peer projects, apply for freelance gigs, and connect with fellow student innovators.

---

## 🚀 Key Features

1. **Project Showcase & Discovery (`/projects`, `/projects/:id`)**:
   - Filter by technology stack, category (Web Dev, AI/ML, UI/UX, Mobile, Data Science, Game Dev).
   - Interactive Like, Bookmark, and construct peer feedback review comments.
   - Live demo links, GitHub repositories, and multi-screenshot galleries.

2. **Freelance Gigs Marketplace (`/jobs`, `/jobs/:id`, `/jobs/new`)**:
   - Post freelance opportunities with budgets, job types (Fixed Price, Hourly, Milestone, Contract), and deadlines.
   - Authenticated student application submission with proposals, portfolio links, and proposed budgets.
   - Poster application review panel with real status updates: `Pending` ➔ `Reviewed` ➔ `Shortlisted` ➔ `Accepted` ➔ `Rejected`.

3. **Student Directory & Profiles (`/students`, `/students/:id`)**:
   - Directory filtered by skills and university.
   - Profile with GitHub, LinkedIn, portfolio links, and published works.
   - Direct collaboration & inquiry modal.

4. **Student Dashboard (`/dashboard`)**:
   - Real-time profile completion progress.
   - My Projects, My Job Posts, My Applications with live status badges.
   - Bookmarked projects and saved jobs.
   - Activity notifications.

5. **Authentication & Multi-Role Switching**:
   - Supports Supabase Authentication and Email/Password flows.
   - One-click quick demo switcher to test different roles (e.g. Alex Chen as applicant, Marcus Vance as job poster).

---

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Vite 6
- **Routing:** React Router v7 (`react-router-dom`)
- **Styling:** Tailwind CSS v4, Lucide Icons
- **Animations:** Motion for React
- **Backend & Database:** Supabase Authentication, PostgreSQL Database with Row-Level Security (RLS), and Supabase Storage
- **Resilience:** Dual-engine architecture with reactive local storage persistence when Supabase credentials are not yet configured.

---

## 📦 Setup & Installation

### 1. Clone & Install Dependencies
```bash
git clone <repo-url>
cd skillbridge
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Populate your Supabase Project credentials:
```env
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-public-key"
APP_URL="http://localhost:3000"
```

### 3. Run Database Migrations & Seeds
SkillBridge includes SQL files in `/supabase`:
- `supabase/migrations/20261017000000_skillbridge_schema.sql`: Contains table definitions (`profiles`, `projects`, `project_likes`, `project_bookmarks`, `jobs`, `applications`, `project_comments`, `saved_jobs`, `notifications`), automatic trigger functions, and comprehensive Row Level Security (RLS) policies.
- `supabase/seed.sql`: Seeds initial demo projects (AI chatbot, E-commerce, Student Management, Developer Portfolio, Weather app, and Data visualization dashboard).

Execute these in your Supabase SQL Editor.

### 4. Start Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

---

## 🛡️ Row Level Security (RLS) Summary

- **Profiles:** Anyone can view public student profiles; users can only modify their own profile.
- **Projects:** Public projects are readable by all; private projects are restricted to the author.
- **Applications:** Only the applicant and the respective job poster can view application proposals.
- **Job Status:** Only the job poster can update application statuses (`Reviewed`, `Shortlisted`, `Accepted`, `Rejected`).
