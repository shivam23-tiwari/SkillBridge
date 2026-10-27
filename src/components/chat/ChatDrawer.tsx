import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/NotificationContext';
import { DataService } from '../../services/store';
import { ChatMessage, Conversation } from '../../types';
import { getInitials, formatRelativeTime } from '../../lib/utils';
import {
  X,
  Send,
  MessageSquare,
  CheckCircle,
  XCircle,
  ExternalLink,
  ChevronLeft,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const ChatDrawer: React.FC = () => {
  const {
    isChatOpen,
    closeChat,
    conversations,
    activeConversationId,
    setActiveConversationId,
    acceptRequest,
    declineRequest,
    refreshConversations,
  } = useChat();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isResponding, setIsResponding] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  // Load messages whenever active conversation changes
  useEffect(() => {
    async function loadMessages() {
      if (activeConversationId) {
        try {
          const list = await DataService.getConversationMessages(activeConversationId);
          setMessages(list);
          if (user?.id) {
            await DataService.markConversationRead(activeConversationId, user.id);
          }
        } catch (err) {
          console.error('Failed to load messages:', err);
        }
      } else {
        setMessages([]);
      }
    }
    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [activeConversationId, user?.id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  if (!isChatOpen) return null;

  const otherUser = activeConversation
    ? activeConversation.sender_id === user?.id
      ? activeConversation.recipient
      : activeConversation.sender
    : null;

  const isCurrentUserRecipient = activeConversation?.recipient_id === user?.id;
  const isPending = activeConversation?.status === 'pending';
  const isAccepted = activeConversation?.status === 'accepted';
  const isDeclined = activeConversation?.status === 'declined';

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activeConversationId || !user?.id || isSending) return;
    if (!isAccepted) return;

    try {
      setIsSending(true);
      const newMsg = await DataService.sendChatMessage(
        activeConversationId,
        user.id,
        inputText.trim()
      );
      setMessages(prev => [...prev, newMsg]);
      setInputText('');
      await refreshConversations();
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAccept = async () => {
    if (!activeConversationId) return;
    try {
      setIsResponding(true);
      await acceptRequest(activeConversationId);
      showToast('Request Accepted', 'You can now chat directly!', 'success');
      // reload messages
      const list = await DataService.getConversationMessages(activeConversationId);
      setMessages(list);
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    } finally {
      setIsResponding(false);
    }
  };

  const handleDecline = async () => {
    if (!activeConversationId) return;
    try {
      setIsResponding(true);
      await declineRequest(activeConversationId);
      showToast('Request Declined', 'You declined this connection request.');
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    } finally {
      setIsResponding(false);
    }
  };

  const filteredConversations = conversations.filter(c => {
    if (!searchFilter.trim()) return true;
    const other = c.sender_id === user?.id ? c.recipient : c.sender;
    const name = other?.full_name?.toLowerCase() || '';
    const proj = c.project_title?.toLowerCase() || '';
    return name.includes(searchFilter.toLowerCase()) || proj.includes(searchFilter.toLowerCase());
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center sm:justify-end sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full sm:w-[780px] h-full sm:h-[620px] bg-[#0A0A0A] border border-[#202026] sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden text-[#F3F4F6]">
        {/* Top Master Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#202026] bg-[#121215]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FF2D95]" />
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#F3F4F6]">
              SkillBridge Messenger
            </h2>
            <span className="text-xs text-[#8E8E9A]">· Direct Collaboration & Hiring</span>
          </div>

          <button
            onClick={closeChat}
            className="p-1 rounded-lg hover:bg-[#18181D] text-[#8E8E9A] hover:text-[#F3F4F6] transition-colors cursor-pointer"
            aria-label="Close Messenger"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Master Body Grid: Sidebar (Conversations) + Chat Pane */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar: Conversation List */}
          <div
            className={`w-full sm:w-72 border-r border-[#202026] bg-[#0E0E12] flex flex-col ${
              activeConversationId ? 'hidden sm:flex' : 'flex'
            }`}
          >
            {/* Search Input */}
            <div className="p-3 border-b border-[#202026]">
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-[#18181D] border border-[#202026] rounded-lg text-[#F3F4F6] placeholder-[#8E8E9A] focus:outline-hidden focus:border-[#FF2D95]"
              />
            </div>

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#18181F]">
              {filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#8E8E9A] space-y-2">
                  <MessageSquare className="w-8 h-8 text-[#8E8E9A]/40 mx-auto" />
                  <p>No conversations yet.</p>
                  <p className="text-[11px] text-[#8E8E9A]/70">
                    Visit any published project to message the student creator!
                  </p>
                </div>
              ) : (
                filteredConversations.map(conv => {
                  const other = conv.sender_id === user?.id ? conv.recipient : conv.sender;
                  const isSelected = conv.id === activeConversationId;
                  const unread = conv.unread_count || 0;
                  const isWaitingMyAccept = conv.status === 'pending' && conv.recipient_id === user?.id;

                  return (
                    <button
                      key={conv.id}
                      onClick={() => setActiveConversationId(conv.id)}
                      className={`w-full text-left p-3.5 transition-colors cursor-pointer flex items-start gap-3 ${
                        isSelected
                          ? 'bg-[#18181D] border-l-2 border-l-[#FF2D95]'
                          : 'hover:bg-[#121216]'
                      }`}
                    >
                      <div className="relative shrink-0">
                        {other?.avatar_url ? (
                          <img
                            src={other.avatar_url}
                            alt={other.full_name}
                            className="w-9 h-9 rounded-lg object-cover ring-1 ring-[#202026]"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-[#18181D] border border-[#202026] text-[#00A3E0] font-bold text-xs flex items-center justify-center">
                            {getInitials(other?.full_name)}
                          </div>
                        )}
                        {unread > 0 && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FF2D95] text-white text-[9px] font-bold flex items-center justify-center">
                            {unread}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-semibold text-[#F3F4F6] truncate">
                            {other?.full_name || 'User'}
                          </span>
                          <span className="text-[10px] text-[#8E8E9A] shrink-0 font-mono">
                            {formatRelativeTime(conv.updated_at)}
                          </span>
                        </div>

                        {conv.project_title && (
                          <span className="text-[10px] text-[#00A3E0] truncate block font-medium">
                            Re: {conv.project_title}
                          </span>
                        )}

                        <p className="text-[11px] text-[#8E8E9A] truncate mt-0.5">
                          {conv.last_message || 'Started a conversation'}
                        </p>

                        <div className="mt-1 flex items-center gap-1.5 text-[9px]">
                          {conv.status === 'pending' && (
                            <span
                              className={`px-1.5 py-0.5 rounded font-mono ${
                                isWaitingMyAccept
                                  ? 'bg-[#FF2D95]/20 text-[#FF2D95] border border-[#FF2D95]/40 font-bold animate-pulse'
                                  : 'bg-[#FBBF24]/10 text-[#FBBF24] border border-[#FBBF24]/30'
                              }`}
                            >
                              {isWaitingMyAccept ? 'Action: Accept Request' : 'Pending Creator Approval'}
                            </span>
                          )}
                          {conv.status === 'accepted' && (
                            <span className="text-[#00A3E0] flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#00A3E0]" />
                              Connected
                            </span>
                          )}
                          {conv.status === 'declined' && (
                            <span className="text-[#8E8E9A]">Declined</span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Pane: Message Thread */}
          <div
            className={`flex-1 flex flex-col bg-[#0A0A0A] ${
              !activeConversationId ? 'hidden sm:flex' : 'flex'
            }`}
          >
            {activeConversation && otherUser ? (
              <>
                {/* Active Header */}
                <div className="px-4 py-3 border-b border-[#202026] bg-[#121215] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setActiveConversationId(null)}
                      className="sm:hidden p-1 text-[#8E8E9A] hover:text-[#F3F4F6]"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    {otherUser.avatar_url ? (
                      <img
                        src={otherUser.avatar_url}
                        alt={otherUser.full_name}
                        className="w-8 h-8 rounded-lg object-cover ring-1 ring-[#202026]"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-[#18181D] text-[#00A3E0] font-bold text-xs flex items-center justify-center border border-[#202026]">
                        {getInitials(otherUser.full_name)}
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#F3F4F6]">
                          {otherUser.full_name}
                        </span>
                        {otherUser.available_for_work && (
                          <span className="text-[10px] text-[#00A3E0] font-medium">
                            · Available for work
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-[#8E8E9A]">
                        {otherUser.college && <span>{otherUser.college}</span>}
                        {activeConversation.project_id && activeConversation.project_title && (
                          <>
                            <span>·</span>
                            <Link
                              to={`/projects/${activeConversation.project_id}`}
                              onClick={closeChat}
                              className="text-[#00A3E0] hover:underline flex items-center gap-0.5 truncate max-w-[200px]"
                            >
                              <span>{activeConversation.project_title}</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </Link>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                        isAccepted
                          ? 'bg-[#00A3E0]/10 text-[#00A3E0] border border-[#00A3E0]/30'
                          : isPending
                          ? 'bg-[#FBBF24]/10 text-[#FBBF24] border border-[#FBBF24]/30'
                          : 'bg-[#18181D] text-[#8E8E9A]'
                      }`}
                    >
                      {isAccepted ? 'Active Chat' : isPending ? 'Pending Request' : 'Declined'}
                    </span>
                  </div>
                </div>

                {/* Acceptance Banner when request is pending */}
                {isPending && isCurrentUserRecipient && (
                  <div className="p-4 bg-[#18181D] border-b border-[#FF2D95]/30 space-y-3">
                    <div className="flex items-start gap-2.5">
                      <Sparkles className="w-4 h-4 text-[#FF2D95] shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-[#F3F4F6]">
                          Connection & Chat Request Received
                        </h4>
                        <p className="text-xs text-[#8E8E9A] leading-relaxed mt-0.5">
                          <strong className="text-[#F3F4F6]">{otherUser.full_name}</strong> wants to
                          discuss your project{' '}
                          {activeConversation.project_title && (
                            <span className="text-[#00A3E0]">"{activeConversation.project_title}"</span>
                          )}
                          . Accept this invitation to unlock two-way real-time messaging.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1 pl-6.5">
                      <button
                        onClick={handleAccept}
                        disabled={isResponding}
                        className="px-3.5 py-1.5 rounded-lg bg-[#FF2D95] hover:bg-[#E61980] border border-[#FF4DA8] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Accept & Start Chatting
                      </button>
                      <button
                        onClick={handleDecline}
                        disabled={isResponding}
                        className="px-3 py-1.5 rounded-lg border border-[#202026] hover:bg-[#18181D] text-xs text-[#8E8E9A] hover:text-[#F3F4F6] transition-colors cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5 inline mr-1" />
                        Decline
                      </button>
                    </div>
                  </div>
                )}

                {/* Informational banner when sender is waiting for creator's acceptance */}
                {isPending && !isCurrentUserRecipient && (
                  <div className="p-3 bg-[#121215] border-b border-[#202026] flex items-center gap-2 text-xs text-[#8E8E9A]">
                    <Clock className="w-4 h-4 text-[#FBBF24] shrink-0" />
                    <span>
                      Message request sent. Waiting for <strong className="text-[#F3F4F6]">{otherUser.full_name}</strong> to accept your inquiry.
                    </span>
                  </div>
                )}

                {/* Message Thread */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  <div className="text-center py-4">
                    <span className="text-[10px] text-[#8E8E9A] font-mono px-3 py-1 rounded-full bg-[#121215] border border-[#202026]">
                      End-to-end collegiate messaging · {new Date(activeConversation.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {messages.map(msg => {
                    const isMe = msg.sender_id === user?.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-xl px-3.5 py-2 text-xs leading-relaxed ${
                            isMe
                              ? 'bg-[#FF2D95] text-white border border-[#FF4DA8]'
                              : 'bg-[#18181D] text-[#F3F4F6] border border-[#202026]'
                          }`}
                        >
                          <p className="whitespace-pre-line">{msg.content}</p>
                        </div>
                        <span className="text-[9px] text-[#8E8E9A] mt-1 font-mono px-1">
                          {new Date(msg.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input Footer */}
                <div className="p-3 border-t border-[#202026] bg-[#121215] space-y-2">
                  {/* Topic suggestion pills when accepted */}
                  {isAccepted && (
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] text-[#8E8E9A]">
                      <button
                        onClick={() => setInputText('Hi! I love your project architecture. Are you available for a freelance contract?')}
                        className="px-2 py-0.5 rounded border border-[#202026] hover:border-[#007BA7] hover:text-[#00A3E0] whitespace-nowrap transition-colors"
                      >
                        💼 Discuss Freelance Contract
                      </button>
                      <button
                        onClick={() => setInputText('Could you explain how you designed the data schema and API flow?')}
                        className="px-2 py-0.5 rounded border border-[#202026] hover:border-[#007BA7] hover:text-[#00A3E0] whitespace-nowrap transition-colors"
                      >
                        💻 Tech Architecture Q&A
                      </button>
                      <button
                        onClick={() => setInputText('We have an immediate opening on our engineering team. Let us schedule a call!')}
                        className="px-2 py-0.5 rounded border border-[#202026] hover:border-[#007BA7] hover:text-[#00A3E0] whitespace-nowrap transition-colors"
                      >
                        🚀 Schedule Call
                      </button>
                    </div>
                  )}

                  <div className="flex items-end gap-2">
                    <textarea
                      ref={inputRef}
                      value={inputText}
                      onChange={e => setInputText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      disabled={!isAccepted || isSending}
                      placeholder={
                        isAccepted
                          ? 'Type your message... (Press Enter to send)'
                          : isPending && isCurrentUserRecipient
                          ? 'Accept the request above to respond...'
                          : 'Waiting for connection acceptance before you can send further messages...'
                      }
                      rows={2}
                      className="flex-1 resize-none px-3 py-2 text-xs bg-[#18181D] border border-[#202026] rounded-xl text-[#F3F4F6] placeholder-[#8E8E9A] focus:outline-hidden focus:border-[#FF2D95] disabled:opacity-50 disabled:cursor-not-allowed"
                    />

                    <button
                      onClick={() => handleSendMessage()}
                      disabled={!isAccepted || !inputText.trim() || isSending}
                      className="px-3.5 py-2.5 rounded-xl bg-[#FF2D95] hover:bg-[#E61980] border border-[#FF4DA8] text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center shrink-0"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3 text-[#8E8E9A]">
                <div className="w-12 h-12 rounded-xl bg-[#18181D] border border-[#202026] flex items-center justify-center text-[#00A3E0]">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-[#F3F4F6]">Select a Conversation</h3>
                <p className="text-xs max-w-xs leading-relaxed">
                  Choose a chat from the sidebar, or message any creator directly from their published projects.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
