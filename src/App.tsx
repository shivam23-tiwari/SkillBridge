import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ChatProvider } from './context/ChatContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ChatDrawer } from './components/chat/ChatDrawer';

// Pages
import { HomePage } from './pages/HomePage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { ProjectFormPage } from './pages/ProjectFormPage';
import { StudentsPage } from './pages/StudentsPage';
import { StudentProfilePage } from './pages/StudentProfilePage';
import { JobsPage } from './pages/JobsPage';
import { JobDetailPage } from './pages/JobDetailPage';
import { JobFormPage } from './pages/JobFormPage';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ContactPage } from './pages/ContactPage';
import { AdminPage } from './pages/AdminPage';
import { ResumeBuilderPage } from './pages/ResumeBuilderPage';
import { PricingPage } from './pages/PricingPage';
import { MyResumesPage } from './pages/MyResumesPage';
import { PublicResumePage } from './pages/PublicResumePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { PlanProvider } from './context/PlanContext';
import { UpgradeModal } from './components/pricing/UpgradeModal';
import { CheckoutModal } from './components/pricing/CheckoutModal';
import { WelcomeNotificationModal } from './components/auth/WelcomeNotificationModal';

// Scroll to top helper on route transition or query param changes
function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname, search]);

  return null;
}

function AppLayout() {
  const { theme } = useTheme();

  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0A] text-[#F3F4F6] relative transition-colors duration-200">
      {/* Minimalist Micro Grid Pattern */}
      <div
        className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-300"
        style={{
          backgroundImage:
            theme === 'dark'
              ? `radial-gradient(rgba(255, 255, 255, 0.6) 1px, transparent 1px)`
              : theme === 'warm'
              ? `radial-gradient(rgba(140, 110, 80, 0.08) 1px, transparent 1px)`
              : `radial-gradient(rgba(0, 0, 0, 0.055) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
          opacity: theme === 'dark' ? 0.025 : 0.85,
        }}
      />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/new" element={<ProjectFormPage />} />
            <Route path="/projects/:id" element={<ProjectDetailPage />} />
            <Route path="/projects/:id/edit" element={<ProjectFormPage />} />
            <Route path="/students" element={<StudentsPage />} />
            <Route path="/students/:id" element={<StudentProfilePage />} />
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="/jobs/new" element={<JobFormPage />} />
            <Route path="/jobs/:id" element={<JobDetailPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/resume-builder" element={<ResumeBuilderPage />} />
            <Route path="/resumes" element={<MyResumesPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/r/:slug" element={<PublicResumePage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
        <ChatDrawer />
        <UpgradeModal />
        <CheckoutModal />
        <WelcomeNotificationModal />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <NotificationProvider>
          <AuthProvider>
            <PlanProvider>
              <ChatProvider>
                <ScrollToTop />
                <AppLayout />
              </ChatProvider>
            </PlanProvider>
          </AuthProvider>
        </NotificationProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
