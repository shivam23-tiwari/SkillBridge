import { Profile, Project, Job, ProjectComment, JobApplication, SavedResume } from '../types';

export const INITIAL_PROFILES: Profile[] = [
  {
    id: 'demo-user-1',
    email: 'alex.chen@berkeley.edu',
    full_name: 'Alex Chen',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    college: 'UC Berkeley',
    degree: 'B.S. Computer Science (Junior)',
    bio: 'Full-stack developer obsessed with LLM agents, TypeScript, and accessible web architecture. Seeking summer 2027 internship or contract freelance roles.',
    skills: ['React', 'Next.js', 'TypeScript', 'Node.js', 'Python', 'Tailwind CSS', 'PostgreSQL'],
    github_url: 'https://github.com/alexchen-dev',
    linkedin_url: 'https://linkedin.com/in/alexchen',
    portfolio_url: 'https://alexchen.dev',
    available_for_work: true,
    collaboration_interests: 'Open-source developer tooling and AI productivity agents.',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'demo-user-2',
    email: 'priya.sharma@stanford.edu',
    full_name: 'Priya Sharma',
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    college: 'Stanford University',
    degree: 'M.S. Artificial Intelligence',
    bio: 'AI researcher and PyTorch enthusiast. Built RAG pipelines, fine-tuned transformer models, and visual intelligence dashboards.',
    skills: ['Python', 'PyTorch', 'LangChain', 'FastAPI', 'Hugging Face', 'Data Science', 'Docker'],
    github_url: 'https://github.com/priyasharma-ai',
    linkedin_url: 'https://linkedin.com/in/priyasharma',
    portfolio_url: 'https://priyasharma.io',
    available_for_work: true,
    collaboration_interests: 'Multimodal AI applications and healthtech data modeling.',
    created_at: new Date(Date.now() - 45 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'demo-user-3',
    email: 'marcus.vance@mit.edu',
    full_name: 'Marcus Vance',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    college: 'MIT',
    degree: 'B.S. Design & Computation',
    bio: 'Product designer and frontend engineer bridging Figma design systems with polished React & Tailwind components.',
    skills: ['UI/UX Design', 'Figma', 'React', 'Tailwind CSS', 'Motion', 'Design Systems', 'CSS'],
    github_url: 'https://github.com/marcusvance',
    linkedin_url: 'https://linkedin.com/in/marcusvance',
    portfolio_url: 'https://marcus.design',
    available_for_work: true,
    collaboration_interests: 'Fintech and education SaaS products with high design standards.',
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: 'demo-user-4',
    email: 'sarah.lin@cmu.edu',
    full_name: 'Sarah Lin',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    college: 'Carnegie Mellon University',
    degree: 'B.S. Software Engineering',
    bio: 'Mobile & Cloud dev. Built 4 cross-platform Flutter/React Native apps with offline sync and 10k+ downloads on app stores.',
    skills: ['Mobile Apps', 'React Native', 'Flutter', 'Firebase', 'GraphQL', 'AWS', 'Swift'],
    github_url: 'https://github.com/sarahlin-cmu',
    linkedin_url: 'https://linkedin.com/in/sarahlin',
    portfolio_url: 'https://sarahlin.dev',
    available_for_work: false,
    collaboration_interests: 'Peer-to-peer campus marketplace and mobile utilities.',
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

// Required projects covering: AI chatbot, E-commerce website, Student management system, Personal portfolio, Weather application, Data visualization dashboard
export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-ai-chatbot',
    owner_id: 'demo-user-2',
    title: 'CogniMate — Contextual Campus AI Chatbot',
    summary: 'A retrieval-augmented conversational AI assistant that answers university course, syllabus, and campus life queries using localized vector search.',
    description: `CogniMate is an open-source student AI assistant built to solve the frustration of navigating fragmented university documentation, academic handbooks, and faculty office hours.

### Key Highlights
- **Document Chunking & Vector Search**: Implements ChromaDB and OpenAI / Gemini embeddings to ingest campus PDFs and syllabi.
- **Role-Guided Prompting**: Switches between academic tutor mode, course advisor, and campus navigator.
- **Latency & Streaming**: Streamed SSE token responses with average response latency under 450ms.
- **Markdown & Code Rendering**: Native syntax highlighting for CS homework assistance.

### Technologies
Built with Python, FastAPI, React, TypeScript, Tailwind CSS, LangChain, and ChromaDB vector store.`,
    category: 'AI & Machine Learning',
    technologies: ['FastAPI', 'Python', 'React', 'TypeScript', 'LangChain', 'Vector Search', 'Tailwind CSS'],
    cover_image_url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80',
    screenshot_urls: [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80',
    ],
    github_url: 'https://github.com/skillbridge-demo/cognimate-campus-ai',
    live_demo_url: 'https://cognimate-demo.vercel.app',
    visibility: 'public',
    likes_count: 38,
    comments_count: 5,
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'proj-ecommerce',
    owner_id: 'demo-user-1',
    title: 'CampusMarket — Student Gear & Textbook E-Commerce',
    summary: 'A modern, peer-to-peer student marketplace featuring Stripe checkout, instant seller chat, and location-based campus pickup coordinates.',
    description: `CampusMarket enables university students to buy, sell, and trade textbooks, electronics, dorm essentials, and lab gear securely without high platform commissions.

### Core Features
- **Stripe & Escrow Integration**: Secure payments with holds until student confirms physical item receipt.
- **Campus Geo-Fencing**: Filter listings within your immediate university radius or neighboring campuses.
- **Real-Time Bidding & Offers**: Counter-offer system with instant desktop notifications.
- **Image Optimization**: Automatic webp conversion and multi-angle product photo galleries.`,
    category: 'Web Development',
    technologies: ['Next.js', 'React', 'TypeScript', 'Stripe', 'PostgreSQL', 'Tailwind CSS', 'Prisma'],
    cover_image_url: 'https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&w=1200&q=80',
    screenshot_urls: [
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=1000&q=80',
    ],
    github_url: 'https://github.com/skillbridge-demo/campus-market-ecommerce',
    live_demo_url: 'https://campusmarket-preview.vercel.app',
    visibility: 'public',
    likes_count: 47,
    comments_count: 8,
    created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 'proj-student-management',
    owner_id: 'demo-user-4',
    title: 'UniTrack — Student Academic & Attendance Management System',
    summary: 'Comprehensive academic dashboard for course tracking, GPA projection, assignment timelines, and lab attendance via QR codes.',
    description: `UniTrack is an enterprise-grade academic tracker created to replace clunky, outdated university portals with an intuitive, mobile-first workflow.

### Highlights
- **GPA What-If Simulator**: Calculate potential semester outcomes based on projected final exam scores.
- **QR Code Attendance System**: Dynamic, time-expiring QR code tokens to prevent proxy check-ins in lecture halls.
- **Deadlines Calendar**: Bi-directional sync with Google Calendar and Apple iCal feeds.
- **Role Permissions**: Tiered views for Students, Teaching Assistants, and Professors.`,
    category: 'Web Development',
    technologies: ['React', 'TypeScript', 'Node.js', 'Express', 'PostgreSQL', 'Tailwind CSS', 'Chart.js'],
    cover_image_url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80',
    screenshot_urls: [
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1000&q=80',
    ],
    github_url: 'https://github.com/skillbridge-demo/unitrack-student-portal',
    live_demo_url: 'https://unitrack-demo.vercel.app',
    visibility: 'public',
    likes_count: 52,
    comments_count: 6,
    created_at: new Date(Date.now() - 18 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'proj-portfolio',
    owner_id: 'demo-user-3',
    title: 'AuraFolio — High-Performance Personal Developer Portfolio',
    summary: 'A minimalist, typography-focused engineering portfolio template built with React, Motion animations, and a dynamic CMS.',
    description: `AuraFolio gives student developers and designers an elevated, recruiter-friendly personal site that showcases case studies with interactive prototypes.

### Features
- **Fluid Layout & Micro-Interactions**: Smooth scroll physics and magnetic button states powered by Motion.
- **Lighthouse 100/100**: Zero-layout shift, optimized image loaders, and dynamic bundle splitting.
- **Interactive Terminal**: Recruiters can type commands like 'skills', 'experience', or 'hire' in an interactive CLI prompt.
- **Dark/Light Mode Sync**: Auto-detects OS theme preferences.`,
    category: 'UI/UX Design',
    technologies: ['React', 'TypeScript', 'Motion', 'Tailwind CSS', 'Figma', 'Vite'],
    cover_image_url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
    screenshot_urls: [
      'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=1000&q=80',
    ],
    github_url: 'https://github.com/skillbridge-demo/aurafolio-portfolio',
    live_demo_url: 'https://aurafolio.vercel.app',
    visibility: 'public',
    likes_count: 64,
    comments_count: 11,
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'proj-weather-app',
    owner_id: 'demo-user-1',
    title: 'AtmoPulse — Hyperlocal Weather & Air Quality Radar',
    summary: 'Real-time weather station with Doppler radar map layers, air quality index alerts, and storm path predictions for college campuses.',
    description: `AtmoPulse is a hyper-responsive weather application that aggregates meteorological data from OpenWeather and NOAA to provide minute-by-minute precipitation forecasts.

### Features
- **Air Quality Breakdown**: Real-time PM2.5, PM10, and Ozone readings with health impact suggestions for outdoor sports.
- **Interactive Rain Radar**: WebGL-accelerated precipitation radar loop with smooth time scrubber.
- **Offline PWA Support**: Caches 7-day forecast locally so students can check temperatures without cellular reception.`,
    category: 'Mobile Apps',
    technologies: ['React', 'TypeScript', 'OpenWeather API', 'Tailwind CSS', 'Leaflet', 'PWA'],
    cover_image_url: 'https://images.unsplash.com/photo-1592210454359-9043f067919b?auto=format&fit=crop&w=1200&q=80',
    screenshot_urls: [
      'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?auto=format&fit=crop&w=1000&q=80',
    ],
    github_url: 'https://github.com/skillbridge-demo/atmopulse-weather',
    live_demo_url: 'https://atmopulse.vercel.app',
    visibility: 'public',
    likes_count: 29,
    comments_count: 3,
    created_at: new Date(Date.now() - 22 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
  {
    id: 'proj-data-viz',
    owner_id: 'demo-user-2',
    title: 'MetricSphere — Interactive Climate & Energy Analytics Dashboard',
    summary: 'An interactive renewable energy and climate analytics dashboard rendering real-time power grid insights with custom charts and alerts.',
    description: `MetricSphere transforms complex time-series energy metrics into digestible, executive-ready interactive dashboards.

### Technical Highlights
- **Interactive Charting**: Custom SVG & Canvas charts rendering over 50,000 data points without frame drops.
- **Anomaly Detection**: Statistical deviation models highlighting unexpected spikes in power consumption.
- **Multi-Format Export**: One-click reports to PDF, CSV, and high-res vector SVG formats.
- **Filterable Facets**: Slice energy consumption by solar, wind, hydro, and fossil fuel sources across global regions.`,
    category: 'Data Science',
    technologies: ['React', 'TypeScript', 'D3.js', 'Chart.js', 'Python', 'Tailwind CSS', 'DuckDB'],
    cover_image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    screenshot_urls: [
      'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1543286386-713bdd548da4?auto=format&fit=crop&w=1000&q=80',
    ],
    github_url: 'https://github.com/skillbridge-demo/metricsphere-energy-dashboard',
    live_demo_url: 'https://metricsphere.vercel.app',
    visibility: 'public',
    likes_count: 41,
    comments_count: 7,
    created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

export const INITIAL_JOBS: Job[] = [
  {
    id: 'job-1',
    owner_id: 'demo-user-3',
    title: 'Frontend Redesign for University Club Management Portal',
    description: `We are looking for a skilled student frontend engineer to redesign our university entrepreneurship club's event registration and membership portal.

### Responsibilities:
- Convert Figma components into responsive React + Tailwind CSS code.
- Implement an accessible student badge generator.
- Integrate existing REST API endpoints for attendee registration.

### Deliverables:
- 4 responsive page views (Dashboard, Events, Members, Profile).
- Clean GitHub repository with modular component structure.`,
    required_skills: ['React', 'Tailwind CSS', 'TypeScript', 'Figma'],
    budget_min: 400,
    budget_max: 750,
    job_type: 'Fixed Price',
    deadline: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
    status: 'open',
    application_instructions: 'Please include links to 1 or 2 recent React projects you built from scratch.',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'job-2',
    owner_id: 'demo-user-1',
    title: 'Mobile App Developer for Campus Coffee Pre-Order MVP',
    description: `Campus coffee shop cooperative seeking a student developer to build a lightweight cross-platform mobile app (React Native or Flutter) allowing students to order espresso drinks and pastry pickups before class.

### Key Scope:
- Menu catalog with custom modifiers (oat milk, extra shot).
- Simple cart and estimated pickup countdown timer.
- Push notifications when order status changes to "Ready at Counter".`,
    required_skills: ['React Native', 'Mobile Apps', 'Firebase', 'TypeScript'],
    budget_min: 800,
    budget_max: 1400,
    job_type: 'Milestone',
    deadline: new Date(Date.now() + 24 * 86400000).toISOString().split('T')[0],
    status: 'open',
    application_instructions: 'Share your experience with state management and previous mobile apps.',
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'job-3',
    owner_id: 'demo-user-4',
    title: 'AI Prompt Engineering & Evaluation for Legal Tech Lab',
    description: `CMU research lab needs an AI-savvy student to help benchmark LLM prompts on analyzing legal agreements and extracting risk clauses into structured JSON.

### Qualifications:
- Familiarity with Python, LangChain, or direct OpenAI / Gemini SDKs.
- Good understanding of prompt evaluation metrics (BLEU, ROUGE, human evaluation rubric).`,
    required_skills: ['Python', 'AI & Machine Learning', 'Prompt Engineering', 'LangChain'],
    budget_min: 50,
    budget_max: 65,
    job_type: 'Hourly',
    deadline: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
    status: 'open',
    application_instructions: 'Detail your experience working with LLMs or NLP models in class or personal projects.',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'job-4',
    owner_id: 'demo-user-2',
    title: 'UI/UX Design for Sustainable Campus Thrift Marketplace',
    description: `Need an ambitious student designer to craft wireframes and interactive prototypes in Figma for a campus circular economy app. Target audience is university students looking to trade used furniture, textbooks, and bikes.`,
    required_skills: ['UI/UX Design', 'Figma', 'User Research', 'Prototyping'],
    budget_min: 350,
    budget_max: 600,
    job_type: 'Fixed Price',
    deadline: new Date(Date.now() + 18 * 86400000).toISOString().split('T')[0],
    status: 'open',
    application_instructions: 'Drop your Behance, Dribbble, or Figma portfolio link.',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

export const INITIAL_COMMENTS: ProjectComment[] = [
  {
    id: 'comm-1',
    project_id: 'proj-ai-chatbot',
    author_id: 'demo-user-1',
    content: 'Impressive vector search setup! How are you handling PDF table extraction when parsing complex syllabi?',
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 'comm-2',
    project_id: 'proj-ai-chatbot',
    author_id: 'demo-user-2',
    content: 'Thanks Alex! We use PyMuPDF combined with Unstructured to preserve layout tables, then feed them as markdown strings into chunking.',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'comm-3',
    project_id: 'proj-portfolio',
    author_id: 'demo-user-4',
    content: 'The typography and micro-interactions on AuraFolio are gorgeous. Great job on the 100/100 Lighthouse score!',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
];

export const INITIAL_APPLICATIONS: JobApplication[] = [
  {
    id: 'app-demo-1',
    job_id: 'job-1',
    applicant_id: 'demo-user-1',
    proposal: 'Hey Marcus, I have built 5+ responsive React/Tailwind portals including CampusMarket. I can deliver this cleanly within 10 days with modular components and full TypeScript types.',
    relevant_experience: '3 years React/TypeScript experience, built campus marketplace with 500+ active users.',
    portfolio_links: ['https://alexchen.dev', 'https://github.com/alexchen-dev'],
    proposed_budget: 550,
    status: 'Shortlisted',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
];

export const INITIAL_RESUMES: SavedResume[] = [
  {
    id: 'resume-alex-chen-1',
    userId: 'demo-user-1',
    title: 'Alex Chen — Full Stack & LLM Engineer',
    template: 'modern-tech',
    isPublic: true,
    slug: 'alex-chen-swe',
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    viewsCount: 42,
    sendsCount: 5,
    data: {
      personal: {
        fullName: 'Alex Chen',
        photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        email: 'alex.chen@berkeley.edu',
        phone: '+1 (510) 555-0192',
        cityState: 'Berkeley, California',
        linkedinUrl: 'https://linkedin.com/in/alexchen',
        githubUrl: 'https://github.com/alexchen-dev',
        portfolioUrl: 'https://alexchen.dev',
      },
      objective: 'UC Berkeley Computer Science junior specializing in full-stack web applications, TypeScript architecture, and LLM autonomous agents. Seeking software engineering internships where I can ship high-scale, reliable user experiences.',
      education: {
        higherEducation: [
          {
            id: 'edu-alex-1',
            degree: 'B.S. in Computer Science',
            institution: 'UC Berkeley',
            startYear: '2023',
            endYear: '2027',
            scoreType: 'CGPA',
            score: '3.91 / 4.0',
            fieldOfStudy: 'Computer Science',
            city: 'Berkeley, CA',
          },
        ],
        twelfth: {
          schoolName: 'Lowell High School',
          boardOrStream: 'AP Scholar with Distinction',
          year: '2023',
          score: '4.0 GPA',
        },
        tenth: {
          schoolName: 'Lowell High School',
          boardOrStream: 'Standard Curriculum',
          year: '2021',
          score: '4.0 GPA',
        },
      },
      skills: {
        technical: ['TypeScript', 'React', 'Next.js', 'Node.js', 'Python', 'PostgreSQL', 'Tailwind CSS', 'GraphQL'],
        tools: ['Git', 'Docker', 'Vite', 'VS Code', 'Postman', 'Supabase', 'Jest'],
        soft: ['Technical Communication', 'Team Leadership', 'Agile Sprints', 'System Architecture'],
        languages: ['English (Native)', 'Mandarin (Conversational)'],
      },
      projects: [
        {
          id: 'proj-alex-1',
          title: 'CampusMarket — University Peer Marketplace',
          description: 'Engineered a real-time student commerce exchange with instant messaging and escrow verification, supporting 1,200+ active campus buyers.',
          technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Node.js'],
          githubUrl: 'https://github.com/alexchen-dev/campusmarket',
          liveUrl: 'https://campusmarket.dev',
          importedFromSkillBridge: true,
        },
        {
          id: 'proj-alex-2',
          title: 'OmniAgent — Autonomous LLM Research Assistant',
          description: 'Architected a multi-step research agent running vector similarity searches across 50,000+ academic papers with sub-120ms response time.',
          technologies: ['Python', 'FastAPI', 'LangChain', 'Docker'],
          githubUrl: 'https://github.com/alexchen-dev/omniagent',
          liveUrl: 'https://omniagent.io',
          importedFromSkillBridge: true,
        },
      ],
      experience: [
        {
          id: 'exp-alex-1',
          company: 'Berkeley AI Research (BAIR)',
          role: 'Undergraduate Software Fellow',
          duration: 'Jan 2025 – Present',
          location: 'Berkeley, CA',
          description: '• Developed benchmark evaluation pipelines for open-source foundation models.\n• Optimized batch inference throughput reducing GPU memory consumption by 28%.\n• Maintained interactive visualization dashboard utilized by 15 PhD researchers.',
          isCurrent: true,
        },
      ],
      certifications: [
        {
          id: 'cert-alex-1',
          name: 'AWS Certified Cloud Practitioner',
          issuer: 'Amazon Web Services',
          year: '2024',
          certificateLink: 'https://aws.amazon.com',
        },
      ],
      achievements: [
        {
          id: 'ach-alex-1',
          title: '1st Place Winner — CalHacks 2024',
          organization: 'UC Berkeley',
          year: '2024',
          description: 'Built decentralized campus rideshare app with 4 teammates among 2,800 participants.',
        },
      ],
      extra: {
        volunteering: 'Lead Instructor at CS KickStart, teaching Python fundamentals to 60+ incoming freshmen.',
        extracurriculars: 'Berkeley Association for Computing Machinery (ACM) Web Dev Chair.',
        hobbies: 'Open-source web tooling, bouldering, mechanical keyboards.',
        references: 'Available upon request.',
      },
      formatting: {
        template: 'modern-tech',
        accentColor: '#00A3E0',
        fontFamily: 'calibri',
        fontSize: 'medium',
        spacing: 'normal',
        headerAlignment: 'left',
        showPhoto: true,
        fitToOnePage: false,
        sectionOrder: [
          'summary',
          'education',
          'skills',
          'projects',
          'experience',
          'certifications',
          'achievements',
          'extra',
        ],
        visibleSections: {
          summary: true,
          education: true,
          skills: true,
          projects: true,
          experience: true,
          certifications: true,
          achievements: true,
          extra: true,
        },
      },
    },
  },
  {
    id: 'resume-priya-sharma-1',
    userId: 'demo-user-2',
    title: 'Priya Sharma — AI Research & ML Engineer',
    template: 'minimal-classic',
    isPublic: true,
    slug: 'priya-sharma-ai',
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    viewsCount: 68,
    sendsCount: 8,
    data: {
      personal: {
        fullName: 'Priya Sharma',
        photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
        email: 'priya.sharma@stanford.edu',
        phone: '+1 (650) 555-0144',
        cityState: 'Stanford, California',
        linkedinUrl: 'https://linkedin.com/in/priyasharma',
        githubUrl: 'https://github.com/priyasharma-ai',
        portfolioUrl: 'https://priyasharma.io',
      },
      objective: 'Stanford M.S. AI graduate student with published research in multimodal transformers, RAG architectures, and model quantization. Experienced in production PyTorch pipelines, PyMuPDF, and FastAPI microservices.',
      education: {
        higherEducation: [
          {
            id: 'edu-priya-1',
            degree: 'M.S. in Artificial Intelligence',
            institution: 'Stanford University',
            startYear: '2024',
            endYear: '2026',
            scoreType: 'CGPA',
            score: '3.96 / 4.0',
            fieldOfStudy: 'Artificial Intelligence',
            city: 'Stanford, CA',
          },
          {
            id: 'edu-priya-2',
            degree: 'B.Tech in Computer Science',
            institution: 'IIT Delhi',
            startYear: '2020',
            endYear: '2024',
            scoreType: 'CGPA',
            score: '9.4 / 10.0',
            fieldOfStudy: 'Computer Science',
            city: 'New Delhi, India',
          },
        ],
        twelfth: {
          schoolName: 'Delhi Public School, R.K. Puram',
          boardOrStream: 'CBSE Science',
          year: '2020',
          score: '98.2%',
        },
        tenth: {
          schoolName: 'Delhi Public School, R.K. Puram',
          boardOrStream: 'CBSE',
          year: '2018',
          score: '97.8%',
        },
      },
      skills: {
        technical: ['Python', 'PyTorch', 'LangChain', 'FastAPI', 'Hugging Face', 'Data Science', 'Docker', 'PostgreSQL'],
        tools: ['Git', 'Weights & Biases', 'Linux', 'CUDA', 'VS Code', 'Jupyter', 'Postman'],
        soft: ['Research Writing', 'Peer Review', 'Mathematical Rigor', 'Cross-Disciplinary Teamwork'],
        languages: ['English (Fluent)', 'Hindi (Native)'],
      },
      projects: [
        {
          id: 'proj-priya-1',
          title: 'NeuroScribe — Multimodal Academic Document Parser',
          description: 'Engineered a specialized document chunker extracting tables and LaTeX formulas with 98.4% OCR precision across 10,000+ scientific preprints.',
          technologies: ['Python', 'PyTorch', 'FastAPI', 'Docker'],
          githubUrl: 'https://github.com/priyasharma-ai/neuroscribe',
          liveUrl: 'https://neuroscribe.dev',
          importedFromSkillBridge: true,
        },
      ],
      experience: [
        {
          id: 'exp-priya-1',
          company: 'Stanford AI Lab',
          role: 'Graduate Research Assistant',
          duration: 'Sep 2024 – Present',
          location: 'Stanford, CA',
          description: '• Conducted research on parameter-efficient fine-tuning (LoRA / QLoRA) on 70B parameter models.\n• Authored benchmark reports decreasing inference latency by 41%.\n• Collaborated on open-source weights release downloaded 12,000+ times.',
          isCurrent: true,
        },
      ],
      certifications: [
        {
          id: 'cert-priya-1',
          name: 'Deep Learning Specialization',
          issuer: 'DeepLearning.AI',
          year: '2023',
          certificateLink: 'https://coursera.org',
        },
      ],
      achievements: [
        {
          id: 'ach-priya-1',
          title: 'Stanford Graduate Fellowship Honoree',
          organization: 'Stanford School of Engineering',
          year: '2024',
          description: 'Awarded full academic merit scholarship for excellence in engineering research.',
        },
      ],
      extra: {
        volunteering: 'Women in Computer Science (WiCS) Peer Mentor.',
        extracurriculars: 'Stanford Robotics Society, Graduate Student Council.',
        hobbies: 'Violin, astronomy, distance running.',
        references: 'Available upon request.',
      },
      formatting: {
        template: 'minimal-classic',
        accentColor: '#10B981',
        fontFamily: 'times',
        fontSize: 'medium',
        spacing: 'normal',
        headerAlignment: 'center',
        showPhoto: false,
        fitToOnePage: true,
        sectionOrder: [
          'summary',
          'education',
          'skills',
          'projects',
          'experience',
          'certifications',
          'achievements',
          'extra',
        ],
        visibleSections: {
          summary: true,
          education: true,
          skills: true,
          projects: true,
          experience: true,
          certifications: true,
          achievements: true,
          extra: true,
        },
      },
    },
  },
];

