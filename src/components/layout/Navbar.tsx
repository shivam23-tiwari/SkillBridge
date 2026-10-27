import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/NotificationContext';
import { useChat } from '../../context/ChatContext';
import { DataService } from '../../services/store';
import { NotificationItem } from '../../types';
import { getInitials } from '../../lib/utils';
import { CreateAccountModal } from '../auth/CreateAccountModal';
import {
  Bell,
  Menu,
  X,
  LogOut,
  User,
  ChevronDown,
  CheckCircle,
  UserPlus,
  Plus,
  MessageSquare,
  ShieldCheck,
  Mail,
  Sun,
  Moon,
  Sparkles,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const Navbar: React.FC = () => {
  const { user, profile, logout, isOwner } = useAuth();
  const { showToast } = useToast();
  const { openChat, unreadMessagesCount, acceptRequest, declineRequest } = useChat();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setNotifDropdownOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    async function loadNotifs() {
      if (user?.id) {
        const list = await DataService.getNotifications(user.id);
        setNotifications(list);
      } else {
        setNotifications([]);
      }
    }
    loadNotifs();
    const interval = setInterval(loadNotifs, 10000);
    return () => clearInterval(interval);
  }, [user?.id]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifDropdownOpen(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read_at).length;

  const handleMarkAllRead = async () => {
    if (user?.id) {
      await DataService.markAllNotificationsAsRead(user.id);
      const list = await DataService.getNotifications(user.id);
      setNotifications(list);
      showToast('Notifications updated', 'All marked as read');
    }
  };

  const navLinks = [
    { label: 'Explore', path: '/projects' },
    { label: 'Freelancers', path: '/students' },
    { label: 'Jobs', path: '/jobs' },
    { label: 'Resume Builder', path: '/resume-builder' },
    { label: 'Pricing', path: '/pricing' },
    ...(user ? [{ label: 'Dashboard', path: '/dashboard' }] : []),
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#0A0A0A]/95 backdrop-blur-sm border-b border-[#202026]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Strict 3-zone contract: Brand — 4-5 links — 1 primary action */}
          <div className="flex items-center justify-between gap-8 h-15">
            {/* Zone 1: Clean Brand Wordmark (Cerulean + Neon Rose like reference image) */}
            <Link
              to="/"
              className="text-base font-bold tracking-tight text-[#F3F4F6] hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-xs bg-[#FF2D95]" />
              <span className="tracking-tight">
                <span className="text-[#00A3E0]">Skill</span>
                <span className="text-[#FF2D95]">Bridge</span>
              </span>
            </Link>

            {/* Zone 2: Clean text navigation links (No pills, no capsule frames) */}
            <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-[#9CA3AF]">
              {navLinks.map(link => {
                const isActive = location.pathname.startsWith(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                      isActive
                        ? 'text-[#F3F4F6] font-semibold border-b border-[#FF2D95]'
                        : 'hover:text-[#F3F4F6]'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Zone 3: 1 Primary Action Point (+ quiet utilities) */}
            <div className="flex items-center gap-3 shrink-0">
              {user ? (
                <>
                  <Link
                    to="/projects/new"
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#FF2D95] hover:bg-[#E61980] border border-[#FF4DA8] rounded-lg transition-colors whitespace-nowrap shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Publish Project
                  </Link>

                  {/* Messages / Chat Icon */}
                  <button
                    onClick={() => openChat()}
                    className="relative p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-[#18181D] transition-colors cursor-pointer"
                    aria-label="Messages"
                    title="SkillBridge Messenger"
                  >
                    <MessageSquare className="w-4 h-4" />
                    {unreadMessagesCount > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-[#00A3E0] rounded-full" />
                    )}
                  </button>

                  {/* Notification Icon */}
                  <div className="relative" ref={notifRef}>
                    <button
                      onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                      className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-[#18181D] transition-colors cursor-pointer"
                      aria-label="Notifications"
                    >
                      <Bell className="w-4 h-4" />
                      {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 w-2 h-2 bg-[#FF2D95] rounded-full" />
                      )}
                    </button>

                    {notifDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-[#121215] border border-[#202026] py-2 z-50 text-[#F3F4F6] shadow-2xl">
                        <div className="flex items-center justify-between px-4 py-2 border-b border-[#202026]">
                          <span className="text-xs font-semibold text-[#F3F4F6]">
                            Notifications
                          </span>
                          {unreadCount > 0 && (
                            <button
                              onClick={handleMarkAllRead}
                              className="text-[11px] text-[#00A3E0] hover:underline cursor-pointer"
                            >
                              Mark read
                            </button>
                          )}
                        </div>

                        <div className="max-h-80 overflow-y-auto divide-y divide-[#18181F]">
                          {notifications.length === 0 ? (
                            <div className="p-6 text-center text-xs text-[#6B7280]">
                              No notifications yet.
                            </div>
                          ) : (
                            notifications.map(n => {
                              const isChatReq = n.type === 'chat_request';
                              const isChatAccept = n.type === 'chat_accepted';
                              const isChatMessage = n.type === 'chat_message';

                              return (
                                <div
                                  key={n.id}
                                  onClick={async () => {
                                    await DataService.markNotificationAsRead(n.id);
                                    setNotifDropdownOpen(false);
                                    if (isChatReq || isChatAccept || isChatMessage) {
                                      openChat(n.related_conversation_id);
                                    } else if (n.related_project_id) {
                                      navigate(`/projects/${n.related_project_id}`);
                                    } else if (n.related_job_id) {
                                      navigate(`/jobs/${n.related_job_id}`);
                                    }
                                  }}
                                  className={`p-3.5 hover:bg-[#18181D] cursor-pointer transition-colors flex items-start gap-2.5 ${
                                    !n.read_at ? 'bg-[#15151A]' : ''
                                  }`}
                                >
                                  <div className="w-6 h-6 rounded-md bg-[#1C1C24] text-[#00A3E0] flex items-center justify-center text-[11px] font-semibold shrink-0 mt-0.5 border border-[#262630]">
                                    {getInitials(n.actor?.full_name)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs text-[#F3F4F6] leading-snug">
                                      {n.message}
                                    </p>
                                    <span className="text-[10px] text-[#6B7280] mt-0.5 block font-mono">
                                      {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>

                                    {/* Action buttons if this is an incoming chat request */}
                                    {isChatReq && n.related_conversation_id && (
                                      <div className="flex items-center gap-2 mt-2 pt-1.5 border-t border-[#202026]">
                                        <button
                                          onClick={async (e) => {
                                            e.stopPropagation();
                                            await acceptRequest(n.related_conversation_id!);
                                            await DataService.markNotificationAsRead(n.id);
                                            setNotifDropdownOpen(false);
                                            showToast('Request Accepted', 'You can now chat together!', 'success');
                                          }}
                                          className="px-2.5 py-1 rounded bg-[#FF2D95] hover:bg-[#E61980] text-white text-[10px] font-bold transition-colors cursor-pointer"
                                        >
                                          Accept & Chat
                                        </button>
                                        <button
                                          onClick={async (e) => {
                                            e.stopPropagation();
                                            await declineRequest(n.related_conversation_id!);
                                            await DataService.markNotificationAsRead(n.id);
                                            setNotifDropdownOpen(false);
                                            showToast('Declined', 'Connection request declined');
                                          }}
                                          className="px-2 py-1 rounded border border-[#202026] hover:bg-[#202026] text-[#8E8E9A] text-[10px] transition-colors cursor-pointer"
                                        >
                                          Decline
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* User Profile dropdown */}
                  <div className="relative" ref={userRef}>
                    <button
                      onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                      className="flex items-center gap-2 p-1 pl-1.5 rounded-lg border border-[#202026] hover:border-[#2E2E38] bg-[#121215] transition-colors cursor-pointer"
                    >
                      {profile?.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt={profile.full_name}
                          className="w-6 h-6 rounded-md object-cover"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-md bg-[#1C1C24] text-[#00A3E0] flex items-center justify-center text-[11px] font-semibold border border-[#262630]">
                          {getInitials(profile?.full_name || user.name)}
                        </div>
                      )}
                      <span className="text-xs text-[#F3F4F6] hidden sm:inline max-w-[90px] truncate">
                        {profile?.full_name || user.name}
                      </span>
                      <ChevronDown className="w-3 h-3 text-[#6B7280]" />
                    </button>

                    {userDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#121215] border border-[#202026] py-2 z-50 text-[#F3F4F6] shadow-2xl">
                        <div className="px-4 py-2 border-b border-[#202026]">
                          <p className="text-xs font-semibold text-[#F3F4F6] truncate">
                            {profile?.full_name || user.name}
                          </p>
                          <p className="text-[11px] text-[#6B7280] truncate">{user.email}</p>
                        </div>

                        <div className="py-1 border-b border-[#202026]">
                          <Link
                            to="/dashboard"
                            className="flex items-center gap-2 px-4 py-1.5 text-xs text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-[#18181D]"
                          >
                            <User className="w-3.5 h-3.5" />
                            Dashboard
                          </Link>
                          <Link
                            to={`/students/${user.id}`}
                            className="flex items-center gap-2 px-4 py-1.5 text-xs text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-[#18181D]"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            My Profile
                          </Link>
                          <Link
                            to="/resumes"
                            className="flex items-center gap-2 px-4 py-1.5 text-xs text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-[#18181D]"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                            My Resumes
                          </Link>
                          {isOwner && (
                            <Link
                              to="/admin"
                              className="flex items-center gap-2 px-4 py-1.5 text-xs text-[#00A3E0] hover:text-white hover:bg-[#18181D]"
                            >
                              <ShieldCheck className="w-3.5 h-3.5 text-[#00A3E0]" />
                              Admin & Gmail Console
                            </Link>
                          )}
                          <Link
                            to="/contact"
                            className="flex items-center gap-2 px-4 py-1.5 text-xs text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-[#18181D]"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            Contact Owner
                          </Link>
                        </div>

                        <div className="pt-1">
                          <button
                            onClick={() => {
                              logout();
                              showToast('Signed out', 'Guest mode active');
                              navigate('/');
                            }}
                            className="w-full flex items-center gap-2 px-4 py-1.5 text-xs text-[#FB7185] hover:bg-[#FB7185]/10 text-left cursor-pointer"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    to="/login"
                    className="text-xs font-medium text-[#9CA3AF] hover:text-[#F3F4F6] transition-colors"
                  >
                    Log In
                  </Link>
                  <button
                    onClick={() => setShowCreateAccountModal(true)}
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#FF2D95] hover:bg-[#E61980] border border-[#FF4DA8] rounded-lg transition-colors whitespace-nowrap cursor-pointer shrink-0"
                  >
                    Get Started
                  </button>
                </div>
              )}

              {/* Theme Toggle Button (Light Minimalist / Warm Paper / Dark) */}
              <button
                onClick={toggleTheme}
                className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-[#18181D] transition-colors cursor-pointer flex items-center gap-1.5 border border-[#202026]"
                title={`Background: ${theme === 'light' ? 'Minimalist Light (Default)' : theme === 'warm' ? 'Warm Paper Minimalist' : 'Dark Studio'}. Click to toggle.`}
                aria-label="Toggle minimalist background"
              >
                {theme === 'light' ? (
                  <Sun className="w-3.5 h-3.5 text-[#F59E0B]" />
                ) : theme === 'warm' ? (
                  <Sparkles className="w-3.5 h-3.5 text-[#00A3E0]" />
                ) : (
                  <Moon className="w-3.5 h-3.5 text-[#9CA3AF]" />
                )}
                <span className="hidden sm:inline text-[11px] font-medium capitalize">
                  {theme}
                </span>
              </button>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-1.5 text-[#9CA3AF] hover:text-[#F3F4F6] cursor-pointer"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#202026] bg-[#0A0A0A] px-4 py-4 space-y-2">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className="block px-3 py-2 text-sm text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-[#121215] rounded-lg"
              >
                {link.label}
              </Link>
            ))}

            <div className="pt-3 border-t border-[#202026] space-y-2">
              {user ? (
                <>
                  <Link
                    to="/projects/new"
                    className="block w-full text-center py-2 text-xs font-medium text-white bg-[#FF2D95] hover:bg-[#E61980] rounded-lg"
                  >
                    Publish Project
                  </Link>
                  <Link
                    to="/jobs/new"
                    className="block w-full text-center py-2 text-xs font-medium text-[#F3F4F6] bg-[#18181D] border border-[#202026] rounded-lg"
                  >
                    Post Freelance Job
                  </Link>
                  {isOwner && (
                    <Link
                      to="/admin"
                      className="block w-full text-center py-2 text-xs font-medium text-[#00A3E0] bg-[#18181D] border border-[#202026] rounded-lg"
                    >
                      Admin & Owner Gmail Console
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                      navigate('/');
                    }}
                    className="block w-full text-center py-2 text-xs text-[#FF2D95]"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="flex gap-2">
                  <Link
                    to="/login"
                    className="flex-1 text-center py-2 text-xs text-[#F3F4F6] bg-[#18181D] border border-[#202026] rounded-lg"
                  >
                    Log In
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setShowCreateAccountModal(true);
                    }}
                    className="flex-1 py-2 text-xs text-white bg-[#FF2D95] hover:bg-[#E61980] rounded-lg cursor-pointer"
                  >
                    Sign Up
                  </button>
                </div>
              )}

              {/* Mobile theme switch row */}
              <div className="pt-2 border-t border-[#202026] flex items-center justify-between text-xs text-[#8E8E9A]">
                <span>Background theme:</span>
                <button
                  onClick={toggleTheme}
                  className="px-2.5 py-1 rounded bg-[#18181D] text-[#F3F4F6] border border-[#202026] flex items-center gap-1.5"
                >
                  {theme === 'light' ? (
                    <Sun className="w-3.5 h-3.5 text-[#F59E0B]" />
                  ) : theme === 'warm' ? (
                    <Sparkles className="w-3.5 h-3.5 text-[#00A3E0]" />
                  ) : (
                    <Moon className="w-3.5 h-3.5 text-[#9CA3AF]" />
                  )}
                  <span className="capitalize">{theme} Minimalist</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Account Creation Modal */}
      <CreateAccountModal
        isOpen={showCreateAccountModal}
        onClose={() => setShowCreateAccountModal(false)}
        onSuccess={() => navigate('/dashboard')}
      />
    </>
  );
};
