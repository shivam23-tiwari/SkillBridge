import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/NotificationContext';
import { DataService } from '../services/store';
import { EmailService, OWNER_EMAIL } from '../services/emailService';
import { Profile, LoginRecord, ContactMessage, OwnerGmailEmail } from '../types';
import { getInitials, formatRelativeTime } from '../lib/utils';
import { Button } from '../components/ui/Button';
import {
  Mail,
  Users,
  LogIn,
  MessageSquare,
  ShieldCheck,
  Search,
  Trash2,
  CheckCircle,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Send,
  RefreshCw,
  Inbox,
  Star,
  CheckCheck,
  ShieldAlert,
  ArrowLeft,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

type AdminTab = 'gmail' | 'users' | 'logins' | 'messages';

export const AdminPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const isOwner = user?.email.toLowerCase() === OWNER_EMAIL.toLowerCase();

  const [activeTab, setActiveTab] = useState<AdminTab>('gmail');
  const [emails, setEmails] = useState<OwnerGmailEmail[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<OwnerGmailEmail | null>(null);
  const [usersList, setUsersList] = useState<Profile[]>([]);
  const [loginsList, setLoginsList] = useState<LoginRecord[]>([]);
  const [messagesList, setMessagesList] = useState<ContactMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [emailFilter, setEmailFilter] = useState<'all' | 'login' | 'contact' | 'signup'>('all');

  const loadData = async () => {
    try {
      const emailList = EmailService.getOwnerEmails();
      setEmails(emailList);
      if (!selectedEmail && emailList.length > 0) {
        setSelectedEmail(emailList[0]);
      }

      const [profiles, logins, contacts] = await Promise.all([
        DataService.getProfiles(),
        DataService.getLoginHistory(),
        DataService.getContactMessages(),
      ]);

      setUsersList(profiles);
      setLoginsList(logins);
      setMessagesList(contacts);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    }
  };

  useEffect(() => {
    if (!isOwner) return;
    loadData();

    const handleEmailUpdate = (e: any) => {
      setEmails(e.detail || EmailService.getOwnerEmails());
    };
    window.addEventListener('owner-emails-updated', handleEmailUpdate);
    const interval = setInterval(loadData, 5000);

    return () => {
      window.removeEventListener('owner-emails-updated', handleEmailUpdate);
      clearInterval(interval);
    };
  }, [isOwner]);

  const handleSelectEmail = (email: OwnerGmailEmail) => {
    setSelectedEmail(email);
    EmailService.markEmailAsRead(email.id);
  };

  const handleSimulateTestLogin = () => {
    const testEmail = EmailService.sendLoginEmailNotification({
      userName: 'Rahul Sharma',
      email: 'rahul@email.com',
      optionalMessage: 'Simulated alert: Looking to contract two senior student engineers!',
    });
    showToast('Simulation Dispatched', `New email arrived in ${OWNER_EMAIL}`);
    loadData();
    setSelectedEmail(testEmail);
    setActiveTab('gmail');
  };

  const handleSimulateTestMessage = () => {
    const testEmail = EmailService.sendContactEmailNotification({
      name: 'Sarah Lin',
      email: 'sarah.lin@cmu.edu',
      subject: 'Inquiry regarding collegiate hackathon sponsorship',
      message: 'Hi Shivam, we are hosting a 500-student hackathon and would love to partner with SkillBridge for student portfolios.',
      category: 'Partnership',
    });
    showToast('Simulation Dispatched', `New message arrived in ${OWNER_EMAIL}`);
    loadData();
    setSelectedEmail(testEmail);
    setActiveTab('gmail');
  };

  const handleClearAllEmails = () => {
    if (window.confirm('Clear all emails from the simulated Gmail inbox?')) {
      EmailService.clearAll();
      setSelectedEmail(null);
      loadData();
      showToast('Inbox Cleared', 'All emails removed.');
    }
  };

  const filteredEmails = emails.filter(e => {
    if (emailFilter !== 'all' && e.category !== emailFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      e.subject.toLowerCase().includes(q) ||
      e.body.toLowerCase().includes(q) ||
      e.from.toLowerCase().includes(q) ||
      (e.sender_name && e.sender_name.toLowerCase().includes(q))
    );
  });

  const unreadEmailCount = emails.filter(e => !e.read).length;

  if (!isOwner) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 text-[#F3F4F6]">
        <div className="max-w-md w-full space-y-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#FF2D95]/10 border border-[#FF2D95]/30 text-[#FF2D95] flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold text-[#F3F4F6] tracking-tight">
              Access Restricted
            </h1>
            <p className="text-xs text-[#8E8E9A] leading-relaxed max-w-sm mx-auto">
              This console is private. Only administrator <strong className="text-[#F3F4F6]">Shivam Tiwari</strong> has permission to view this section.
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/">
              <Button variant="primary" size="md" className="gap-2 w-full sm:w-auto">
                <ArrowLeft className="w-4 h-4" />
                Return to Home Page
              </Button>
            </Link>
            {!user ? (
              <Link to="/login">
                <Button variant="outline" size="md" className="w-full sm:w-auto">
                  Sign In
                </Button>
              </Link>
            ) : (
              <Button
                variant="outline"
                size="md"
                onClick={async () => {
                  await logout();
                  navigate('/login');
                }}
                className="w-full sm:w-auto"
              >
                Sign Out
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-[#F3F4F6]">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#202026] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#00A3E0] uppercase tracking-wider mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00A3E0]" />
            <span>Owner & Administrator Console</span>
            <span className="text-[#8E8E9A]">·</span>
            <span className="text-[#FF2D95] font-semibold">{OWNER_EMAIL}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F3F4F6] tracking-tight">
            Platform Activity & Gmail Notifications
          </h1>
          <p className="text-xs sm:text-sm text-[#8E8E9A] mt-1 max-w-2xl">
            Live monitor of all user accounts, login history with message boxes, contact inquiries, and the owner's Gmail inbox.
          </p>
        </div>

        {/* Quick Simulator Triggers */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSimulateTestLogin}
            className="text-xs gap-1.5"
            title="Simulate a new user login and trigger a Gmail alert"
          >
            <LogIn className="w-3.5 h-3.5 text-[#00A3E0]" />
            Test Login Alert
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSimulateTestMessage}
            className="text-xs gap-1.5"
            title="Simulate a new contact message and trigger a Gmail alert"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#FF2D95]" />
            Test Message Alert
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={loadData}
            className="text-xs p-2 text-[#8E8E9A] hover:text-white"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#121215] border border-[#202026] rounded-xl p-4 space-y-1">
          <span className="text-[10px] font-bold text-[#8E8E9A] uppercase tracking-wider block">
            Owner Gmail Alerts
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-[#F3F4F6] tabular-nums">
              {emails.length}
            </span>
            {unreadEmailCount > 0 && (
              <span className="text-[10px] font-bold text-[#FF2D95] bg-[#FF2D95]/10 px-1.5 py-0.5 rounded border border-[#FF2D95]/30">
                {unreadEmailCount} Unread
              </span>
            )}
          </div>
          <span className="text-[10px] text-[#00A3E0] truncate block">{OWNER_EMAIL}</span>
        </div>

        <div className="bg-[#121215] border border-[#202026] rounded-xl p-4 space-y-1">
          <span className="text-[10px] font-bold text-[#8E8E9A] uppercase tracking-wider block">
            Registered Users
          </span>
          <span className="text-2xl font-extrabold text-[#F3F4F6] tabular-nums">
            {usersList.length}
          </span>
          <span className="text-[10px] text-[#8E8E9A] block">University Builders & Clients</span>
        </div>

        <div className="bg-[#121215] border border-[#202026] rounded-xl p-4 space-y-1">
          <span className="text-[10px] font-bold text-[#8E8E9A] uppercase tracking-wider block">
            Logins Logged
          </span>
          <span className="text-2xl font-extrabold text-[#F3F4F6] tabular-nums">
            {loginsList.length}
          </span>
          <span className="text-[10px] text-[#8E8E9A] block">With Optional Messages</span>
        </div>

        <div className="bg-[#121215] border border-[#202026] rounded-xl p-4 space-y-1">
          <span className="text-[10px] font-bold text-[#8E8E9A] uppercase tracking-wider block">
            Contact Inquiries
          </span>
          <span className="text-2xl font-extrabold text-[#F3F4F6] tabular-nums">
            {messagesList.length}
          </span>
          <span className="text-[10px] text-[#8E8E9A] block">From Website Form</span>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-[#202026] pb-2 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('gmail')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'gmail'
              ? 'bg-[#18181D] text-[#FF2D95] border border-[#202026]'
              : 'text-[#8E8E9A] hover:text-[#F3F4F6]'
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span>Gmail Inbox ({emails.length})</span>
          {unreadEmailCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-[#FF2D95]" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'users'
              ? 'bg-[#18181D] text-[#00A3E0] border border-[#202026]'
              : 'text-[#8E8E9A] hover:text-[#F3F4F6]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>All Users ({usersList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('logins')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'logins'
              ? 'bg-[#18181D] text-[#00A3E0] border border-[#202026]'
              : 'text-[#8E8E9A] hover:text-[#F3F4F6]'
          }`}
        >
          <LogIn className="w-4 h-4" />
          <span>Logins & Message Box ({loginsList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('messages')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'messages'
              ? 'bg-[#18181D] text-[#00A3E0] border border-[#202026]'
              : 'text-[#8E8E9A] hover:text-[#F3F4F6]'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Contact Messages ({messagesList.length})</span>
        </button>
      </div>

      {/* TAB 1: GMAIL INBOX VIEW */}
      {activeTab === 'gmail' && (
        <div className="bg-[#121215] border border-[#202026] rounded-xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-[600px]">
          {/* Email List Left Pane (5 cols) */}
          <div className="w-full md:w-5/12 border-r border-[#202026] flex flex-col bg-[#0E0E12]">
            {/* Inbox Subheader */}
            <div className="p-3 border-b border-[#202026] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#F3F4F6]">
                  <Mail className="w-3.5 h-3.5 text-[#EA4335]" />
                  <span>Gmail · {OWNER_EMAIL}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => EmailService.markAllAsRead()}
                    className="text-[10px] text-[#00A3E0] hover:underline cursor-pointer"
                  >
                    Mark all read
                  </button>
                  <button
                    onClick={handleClearAllEmails}
                    className="text-[10px] text-[#8E8E9A] hover:text-[#FF2D95] cursor-pointer"
                    title="Clear inbox"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1 text-[11px] overflow-x-auto">
                {(['all', 'login', 'contact', 'signup'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setEmailFilter(f)}
                    className={`px-2 py-0.5 rounded capitalize transition-colors cursor-pointer ${
                      emailFilter === f
                        ? 'bg-[#18181D] text-[#FF2D95] border border-[#202026] font-semibold'
                        : 'text-[#8E8E9A] hover:text-[#F3F4F6]'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Email List Scrollable */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#18181F]">
              {filteredEmails.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#8E8E9A] space-y-2">
                  <Inbox className="w-8 h-8 text-[#8E8E9A]/40 mx-auto" />
                  <p>No emails match this filter.</p>
                </div>
              ) : (
                filteredEmails.map(email => {
                  const isSelected = selectedEmail?.id === email.id;
                  const isLogin = email.category === 'login';
                  const isContact = email.category === 'contact';

                  return (
                    <div
                      key={email.id}
                      onClick={() => handleSelectEmail(email)}
                      className={`p-3 transition-colors cursor-pointer flex items-start gap-2.5 ${
                        isSelected
                          ? 'bg-[#18181D] border-l-2 border-l-[#FF2D95]'
                          : !email.read
                          ? 'bg-[#141418]'
                          : 'hover:bg-[#121216]'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        <span
                          className={`w-2 h-2 rounded-full block ${
                            !email.read ? 'bg-[#FF2D95]' : 'bg-transparent'
                          }`}
                        />
                      </div>

                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className={`text-xs truncate ${
                              !email.read ? 'font-bold text-[#F3F4F6]' : 'text-[#8E8E9A]'
                            }`}
                          >
                            {email.sender_name || email.from.split('<')[0]}
                          </span>
                          <span className="text-[10px] text-[#8E8E9A] font-mono shrink-0">
                            {email.formatted_time}
                          </span>
                        </div>

                        <p
                          className={`text-xs truncate ${
                            !email.read ? 'font-semibold text-[#F3F4F6]' : 'text-[#8E8E9A]'
                          }`}
                        >
                          {email.subject}
                        </p>

                        <p className="text-[11px] text-[#8E8E9A]/80 truncate">
                          {email.preview}
                        </p>

                        <div className="flex items-center gap-1.5 pt-0.5">
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.2 rounded ${
                              isLogin
                                ? 'bg-[#00A3E0]/10 text-[#00A3E0] border border-[#00A3E0]/30'
                                : isContact
                                ? 'bg-[#FF2D95]/10 text-[#FF2D95] border border-[#FF2D95]/30'
                                : 'bg-[#18181D] text-[#8E8E9A]'
                            }`}
                          >
                            {email.category.toUpperCase()}
                          </span>
                          {email.user_message && (
                            <span className="text-[9px] text-[#8E8E9A] truncate italic max-w-[150px]">
                              "{email.user_message}"
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Email Preview Right Pane (7 cols) */}
          <div className="w-full md:w-7/12 flex flex-col bg-[#0A0A0A]">
            {selectedEmail ? (
              <div className="flex-1 flex flex-col overflow-y-auto">
                {/* Email Header */}
                <div className="p-6 border-b border-[#202026] space-y-4 bg-[#121215]">
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="text-base sm:text-lg font-bold text-[#F3F4F6] leading-snug">
                      {selectedEmail.subject}
                    </h2>
                    <span className="text-[10px] font-mono text-[#8E8E9A] shrink-0">
                      {selectedEmail.date} · {selectedEmail.formatted_time}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 pt-1 border-t border-[#202026]">
                    <div className="w-8 h-8 rounded-lg bg-[#18181D] text-[#00A3E0] font-bold text-xs flex items-center justify-center border border-[#202026]">
                      {getInitials(selectedEmail.sender_name || 'SB')}
                    </div>
                    <div className="flex-1 min-w-0 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#F3F4F6]">
                          {selectedEmail.sender_name || selectedEmail.from}
                        </span>
                        <span className="text-[11px] text-[#8E8E9A]">&lt;{selectedEmail.sender_email || 'system'}&gt;</span>
                      </div>
                      <p className="text-[11px] text-[#8E8E9A]">
                        To: <span className="text-[#00A3E0] font-mono">{selectedEmail.to}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Email Body */}
                <div className="p-6 flex-1 text-xs sm:text-sm text-[#F3F4F6] leading-relaxed whitespace-pre-line font-mono bg-[#0A0A0A]">
                  {selectedEmail.body}
                </div>

                {/* Quick Reply / Action Bar */}
                <div className="p-4 border-t border-[#202026] bg-[#121215] flex items-center justify-between text-xs">
                  <span className="text-[#8E8E9A] text-[11px]">
                    Logged into system at {new Date(selectedEmail.timestamp).toLocaleString()}
                  </span>
                  {selectedEmail.sender_email && (
                    <a
                      href={`mailto:${selectedEmail.sender_email}?subject=Re: ${encodeURIComponent(selectedEmail.subject)}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF2D95] hover:bg-[#E61980] text-white text-xs font-semibold transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Reply via Email
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-2 text-[#8E8E9A]">
                <Mail className="w-8 h-8 text-[#8E8E9A]/40" />
                <p className="text-xs">Select an email to view full notification details.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ALL USERS */}
      {activeTab === 'users' && (
        <div className="bg-[#121215] border border-[#202026] rounded-xl overflow-hidden shadow-2xl">
          <div className="p-4 border-b border-[#202026] flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#F3F4F6]">
              All Registered Users & Students ({usersList.length})
            </h2>
            <Link to="/students">
              <Button variant="outline" size="sm" className="text-xs">
                View Public Directory
              </Button>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#8E8E9A]">
              <thead className="bg-[#18181D] text-[#F3F4F6] uppercase font-mono text-[10px] tracking-wider border-b border-[#202026]">
                <tr>
                  <th className="p-3.5">User</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">University</th>
                  <th className="p-3.5">Freelance Status</th>
                  <th className="p-3.5">Registered</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#202026]">
                {usersList.map(u => (
                  <tr key={u.id} className="hover:bg-[#18181D]/50 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        {u.avatar_url ? (
                          <img src={u.avatar_url} alt={u.full_name} className="w-7 h-7 rounded-lg object-cover ring-1 ring-[#202026]" />
                        ) : (
                          <div className="w-7 h-7 rounded-lg bg-[#18181D] border border-[#202026] text-[#00A3E0] font-bold text-xs flex items-center justify-center">
                            {getInitials(u.full_name)}
                          </div>
                        )}
                        <span className="font-semibold text-[#F3F4F6]">{u.full_name}</span>
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-[#00A3E0]">{u.email || '—'}</td>
                    <td className="p-3.5 text-[#F3F4F6]">{u.college || 'University Student'}</td>
                    <td className="p-3.5">
                      {u.available_for_work ? (
                        <span className="text-[#00A3E0] flex items-center gap-1 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00A3E0]" />
                          Available
                        </span>
                      ) : (
                        <span className="text-[#8E8E9A]">Busy</span>
                      )}
                    </td>
                    <td className="p-3.5 font-mono tabular-nums text-[11px]">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-3.5 text-right">
                      <Link to={`/students/${u.id}`} className="text-[#00A3E0] hover:underline text-xs">
                        View Profile
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: LOGINS & OPTIONAL MESSAGE BOX */}
      {activeTab === 'logins' && (
        <div className="bg-[#121215] border border-[#202026] rounded-xl overflow-hidden shadow-2xl">
          <div className="p-4 border-b border-[#202026] flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#F3F4F6]">
                Login Session History & Optional Notes ({loginsList.length})
              </h2>
              <p className="text-xs text-[#8E8E9A]">
                Every login is recorded and dispatches an instant notification to {OWNER_EMAIL}.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleSimulateTestLogin} className="text-xs">
              Simulate Login Event
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#8E8E9A]">
              <thead className="bg-[#18181D] text-[#F3F4F6] uppercase font-mono text-[10px] tracking-wider border-b border-[#202026]">
                <tr>
                  <th className="p-3.5">User</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">Optional Message Left at Login</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#202026]">
                {loginsList.map(log => (
                  <tr key={log.id} className="hover:bg-[#18181D]/50 transition-colors">
                    <td className="p-3.5 font-semibold text-[#F3F4F6]">{log.user_name}</td>
                    <td className="p-3.5 font-mono text-[#00A3E0]">{log.email}</td>
                    <td className="p-3.5 font-mono tabular-nums text-[11px] text-[#F3F4F6]">
                      {new Date(log.timestamp).toLocaleDateString()} · {log.formatted_time}
                    </td>
                    <td className="p-3.5">
                      {log.message ? (
                        <div className="p-2 rounded bg-[#18181D] border border-[#202026] text-[#F3F4F6] text-xs max-w-md">
                          "{log.message}"
                        </div>
                      ) : (
                        <span className="text-[#8E8E9A]/60 italic">No message provided</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <span className="text-[#00A3E0] bg-[#00A3E0]/10 border border-[#00A3E0]/30 px-2 py-0.5 rounded text-[10px] font-mono">
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: CONTACT MESSAGES */}
      {activeTab === 'messages' && (
        <div className="bg-[#121215] border border-[#202026] rounded-xl overflow-hidden shadow-2xl">
          <div className="p-4 border-b border-[#202026] flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#F3F4F6]">
                Contact Page Messages & Inquiries ({messagesList.length})
              </h2>
              <p className="text-xs text-[#8E8E9A]">
                Messages submitted through the /contact page, routed to {OWNER_EMAIL}.
              </p>
            </div>
            <Link to="/contact">
              <Button variant="outline" size="sm" className="text-xs">
                Open Contact Form
              </Button>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#8E8E9A]">
              <thead className="bg-[#18181D] text-[#F3F4F6] uppercase font-mono text-[10px] tracking-wider border-b border-[#202026]">
                <tr>
                  <th className="p-3.5">From</th>
                  <th className="p-3.5">Subject</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Message Content</th>
                  <th className="p-3.5">Time</th>
                  <th className="p-3.5 text-right">Reply</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#202026]">
                {messagesList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-xs text-[#8E8E9A]">
                      No contact messages received yet.
                    </td>
                  </tr>
                ) : (
                  messagesList.map(msg => (
                    <tr key={msg.id} className="hover:bg-[#18181D]/50 transition-colors">
                      <td className="p-3.5">
                        <div className="font-semibold text-[#F3F4F6]">{msg.name}</div>
                        <div className="text-[10px] font-mono text-[#00A3E0]">{msg.email}</div>
                      </td>
                      <td className="p-3.5 font-medium text-[#F3F4F6]">{msg.subject}</td>
                      <td className="p-3.5">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#18181D] border border-[#202026] text-[#8E8E9A]">
                          {msg.category}
                        </span>
                      </td>
                      <td className="p-3.5 max-w-sm">
                        <p className="text-xs text-[#F3F4F6] line-clamp-2">{msg.message}</p>
                      </td>
                      <td className="p-3.5 font-mono text-[11px] tabular-nums text-[#8E8E9A]">
                        {msg.formatted_time}
                      </td>
                      <td className="p-3.5 text-right">
                        <a
                          href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}`}
                          className="text-[#FF2D95] hover:underline font-semibold text-xs"
                        >
                          Reply
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
