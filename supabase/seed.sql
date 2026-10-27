-- ==============================================================================
-- SkillBridge — Demo Data Seed Script
-- Clearly identified demo accounts & projects for testing
-- ==============================================================================

-- 1. Insert Demo Profiles
INSERT INTO public.profiles (id, full_name, avatar_url, college, degree, bio, skills, github_url, linkedin_url, portfolio_url, available_for_work, collaboration_interests)
VALUES 
(
  '00000000-0000-0000-0000-000000000001',
  'Alex Chen',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  'UC Berkeley',
  'B.S. Computer Science (Junior)',
  'Full-stack developer obsessed with LLM agents, TypeScript, and accessible web architecture.',
  ARRAY['React', 'Next.js', 'TypeScript', 'Node.js', 'Python', 'Tailwind CSS', 'PostgreSQL'],
  'https://github.com/alexchen-dev',
  'https://linkedin.com/in/alexchen',
  'https://alexchen.dev',
  TRUE,
  'Open-source developer tooling and AI productivity agents.'
),
(
  '00000000-0000-0000-0000-000000000002',
  'Priya Sharma',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
  'Stanford University',
  'M.S. Artificial Intelligence',
  'AI researcher and PyTorch enthusiast. Built RAG pipelines, fine-tuned transformer models, and visual intelligence dashboards.',
  ARRAY['Python', 'PyTorch', 'LangChain', 'FastAPI', 'Hugging Face', 'Data Science', 'Docker'],
  'https://github.com/priyasharma-ai',
  'https://linkedin.com/in/priyasharma',
  'https://priyasharma.io',
  TRUE,
  'Multimodal AI applications and healthtech data modeling.'
),
(
  '00000000-0000-0000-0000-000000000003',
  'Marcus Vance',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  'MIT',
  'B.S. Design & Computation',
  'Product designer and frontend engineer bridging Figma design systems with polished React & Tailwind components.',
  ARRAY['UI/UX Design', 'Figma', 'React', 'Tailwind CSS', 'Motion', 'Design Systems'],
  'https://github.com/marcusvance',
  'https://linkedin.com/in/marcusvance',
  'https://marcus.design',
  TRUE,
  'Fintech and education SaaS products with high design standards.'
)
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Demo Projects (AI chatbot, E-commerce website, Student management, Portfolio, Weather app, Data visualization)
INSERT INTO public.projects (id, owner_id, title, summary, description, category, technologies, cover_image_url, github_url, live_demo_url, visibility)
VALUES
(
  '10000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  'CogniMate — Contextual Campus AI Chatbot',
  'A retrieval-augmented conversational AI assistant that answers university course, syllabus, and campus life queries using localized vector search.',
  'CogniMate is an open-source student AI assistant built to solve the frustration of navigating fragmented university documentation, academic handbooks, and faculty office hours. Built with Python, FastAPI, React, and LangChain.',
  'AI & Machine Learning',
  ARRAY['FastAPI', 'Python', 'React', 'TypeScript', 'LangChain', 'Vector Search'],
  'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80',
  'https://github.com/skillbridge-demo/cognimate-campus-ai',
  'https://cognimate-demo.vercel.app',
  'public'
),
(
  '10000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  'CampusMarket — Student Gear & Textbook E-Commerce',
  'A modern, peer-to-peer student marketplace featuring Stripe checkout, instant seller chat, and location-based campus pickup coordinates.',
  'CampusMarket enables university students to buy, sell, and trade textbooks, electronics, and dorm essentials securely without high platform fees.',
  'Web Development',
  ARRAY['Next.js', 'React', 'TypeScript', 'Stripe', 'PostgreSQL', 'Tailwind CSS'],
  'https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&w=1200&q=80',
  'https://github.com/skillbridge-demo/campus-market-ecommerce',
  'https://campusmarket-preview.vercel.app',
  'public'
),
(
  '10000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000003',
  'UniTrack — Student Academic & Attendance Management System',
  'Comprehensive academic dashboard for course tracking, GPA projection, assignment timelines, and lab attendance via QR codes.',
  'UniTrack replaces outdated academic portals with GPA simulation, attendance QR scans, and calendar sync.',
  'Web Development',
  ARRAY['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
  'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80',
  'https://github.com/skillbridge-demo/unitrack-student-portal',
  'https://unitrack-demo.vercel.app',
  'public'
),
(
  '10000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000003',
  'AuraFolio — High-Performance Personal Developer Portfolio',
  'A minimalist, typography-focused engineering portfolio template built with React, Motion animations, and a dynamic CMS.',
  'AuraFolio gives student developers an elevated, recruiter-friendly personal site with 100/100 Lighthouse performance.',
  'UI/UX Design',
  ARRAY['React', 'TypeScript', 'Motion', 'Tailwind CSS', 'Figma'],
  'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
  'https://github.com/skillbridge-demo/aurafolio-portfolio',
  'https://aurafolio.vercel.app',
  'public'
),
(
  '10000000-0000-0000-0000-000000000005',
  '00000000-0000-0000-0000-000000000001',
  'AtmoPulse — Hyperlocal Weather & Air Quality Radar',
  'Real-time weather station with Doppler radar map layers, air quality index alerts, and storm path predictions for college campuses.',
  'AtmoPulse is a hyper-responsive weather application aggregating OpenWeather and NOAA data for students.',
  'Mobile Apps',
  ARRAY['React', 'TypeScript', 'OpenWeather API', 'Tailwind CSS', 'PWA'],
  'https://images.unsplash.com/photo-1592210454359-9043f067919b?auto=format&fit=crop&w=1200&q=80',
  'https://github.com/skillbridge-demo/atmopulse-weather',
  'https://atmopulse.vercel.app',
  'public'
),
(
  '10000000-0000-0000-0000-000000000006',
  '00000000-0000-0000-0000-000000000002',
  'MetricSphere — Interactive Climate & Energy Analytics Dashboard',
  'A high-throughput telemetry visualization engine rendering real-time renewable energy grid data with custom charts and anomaly alerts.',
  'MetricSphere transforms complex time-series energy metrics into digestible, executive-ready interactive dashboards.',
  'Data Science',
  ARRAY['React', 'TypeScript', 'D3.js', 'Chart.js', 'Tailwind CSS'],
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
  'https://github.com/skillbridge-demo/metricsphere-energy-dashboard',
  'https://metricsphere.vercel.app',
  'public'
)
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Demo Jobs
INSERT INTO public.jobs (id, owner_id, title, description, required_skills, budget_min, budget_max, job_type, deadline, status)
VALUES
(
  '20000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000003',
  'Frontend Redesign for University Club Management Portal',
  'Looking for a skilled student frontend engineer to redesign our university entrepreneurship club portal with React + Tailwind CSS.',
  ARRAY['React', 'Tailwind CSS', 'TypeScript', 'Figma'],
  400,
  750,
  'Fixed Price',
  CURRENT_DATE + INTERVAL '15 days',
  'open'
),
(
  '20000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  'Mobile App Developer for Campus Coffee Pre-Order MVP',
  'Campus coffee shop seeking student mobile app developer for React Native ordering app.',
  ARRAY['React Native', 'Mobile Apps', 'Firebase', 'TypeScript'],
  800,
  1400,
  'Milestone',
  CURRENT_DATE + INTERVAL '24 days',
  'open'
)
ON CONFLICT (id) DO NOTHING;
