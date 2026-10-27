import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/NotificationContext';
import { DataService } from '../services/store';
import { OWNER_EMAIL } from '../services/emailService';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import {
  Mail,
  Send,
  MessageSquare,
  ShieldCheck,
  CheckCircle,
  Sparkles,
  ArrowRight,
  Clock,
  User,
  Instagram,
  ArrowUpRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const ContactPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<'General Inquiry' | 'Hiring & Project' | 'Platform Feedback' | 'Partnership'>('General Inquiry');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      showToast('Validation error', 'Please fill in all required fields.', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      await DataService.createContactMessage({
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim() || 'General Inquiry',
        category,
        message: message.trim(),
      });

      setIsSubmitted(true);
      showToast('Message Delivered', `Your message was delivered to the owner's Gmail inbox (${OWNER_EMAIL}).`, 'success');
      setMessage('');
      setSubject('');
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 text-[#F3F4F6]">
      {/* Header Banner */}
      <div className="border-b border-[#202026] pb-6 space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono text-[#00A3E0] uppercase tracking-wider">
          <Mail className="w-3.5 h-3.5" />
          <span>Direct Owner Communications · Dispatch</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[#F3F4F6] tracking-tight">
          Send a Message to the Platform Owner
        </h1>
        <p className="text-xs sm:text-sm text-[#8E8E9A] max-w-2xl leading-relaxed">
          Have an inquiry, project proposal, partnership request, or feedback? Every message is routed directly to <strong className="text-[#F3F4F6]">{OWNER_EMAIL}</strong> and logged in the owner console.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Form (7 cols) */}
        <div className="md:col-span-7 space-y-6">
          <div className="bg-[#121215] border border-[#202026] rounded-xl p-6 space-y-5">
            {isSubmitted ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-12 h-12 rounded-xl bg-[#00A3E0]/10 border border-[#00A3E0]/30 text-[#00A3E0] flex items-center justify-center mx-auto">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#F3F4F6]">
                    Message Sent to Owner's Gmail
                  </h3>
                  <p className="text-xs text-[#8E8E9A] max-w-sm mx-auto leading-relaxed">
                    Thank you! Your note has been delivered to <span className="text-[#00A3E0]">{OWNER_EMAIL}</span>. We will review your message promptly.
                  </p>
                </div>
                <div className="pt-2 flex justify-center gap-3">
                  <Button variant="outline" size="sm" onClick={() => setIsSubmitted(false)}>
                    Send Another Message
                  </Button>
                  <Link to="/projects">
                    <Button variant="primary" size="sm" className="gap-1.5">
                      Explore Projects <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Your Full Name"
                    placeholder="e.g., Alex Johnson"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    icon={<User className="w-4 h-4" />}
                    required
                  />
                  <Input
                    label="Your Email Address"
                    type="email"
                    placeholder="e.g., alex@university.edu"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    icon={<Mail className="w-4 h-4" />}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#8E8E9A]">
                    Topic / Category
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(['General Inquiry', 'Hiring & Project', 'Platform Feedback', 'Partnership'] as const).map(cat => (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`text-xs px-2.5 py-1.5 rounded-lg border text-center transition-colors cursor-pointer ${
                          category === cat
                            ? 'bg-[#18181D] text-[#FF2D95] border-[#FF2D95]'
                            : 'bg-[#121215] text-[#8E8E9A] border-[#202026] hover:text-[#F3F4F6]'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <Input
                  label="Subject"
                  placeholder="e.g., Project Collaboration / Question regarding contract rates"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  required
                />

                <Textarea
                  label="Message Content"
                  placeholder="Type your message, project specifications, or feedback here..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={5}
                  required
                />

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-[#8E8E9A] flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#00A3E0]" />
                    Routed to {OWNER_EMAIL}
                  </span>

                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={isSubmitting}
                    isLoading={isSubmitting}
                    className="gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Send Message
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Right Info Box (5 cols) */}
        <div className="md:col-span-5 space-y-4">
          <div className="bg-[#121215] border border-[#202026] rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-[#F3F4F6] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#FF2D95]" />
              Owner Notification Guarantee
            </h3>
            <p className="text-xs text-[#8E8E9A] leading-relaxed">
              When you submit this form, our automated system generates an immediate notification to the site administrator's Gmail inbox with your timestamp, contact details, and message.
            </p>

            <div className="p-3.5 rounded-lg bg-[#18181D] border border-[#202026] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#8E8E9A]">Recipient Inbox:</span>
                <span className="font-mono text-[#00A3E0] text-[11px] font-semibold">{OWNER_EMAIL}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8E8E9A]">Delivery Mode:</span>
                <span className="text-[#F3F4F6]">Direct Notification Relay</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8E8E9A]">Average Response:</span>
                <span className="text-[#F3F4F6]">&lt; 24 Hours</span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#202026] text-[11px] text-[#8E8E9A]">
              Direct communication line to platform administration.
            </div>
          </div>

          <div className="bg-[#121215] border border-[#202026] rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-[#F3F4F6] uppercase tracking-wider flex items-center gap-1.5">
              <Instagram className="w-3.5 h-3.5 text-[#FF2D95]" />
              Official Website Information on Instagram
            </h3>
            <p className="text-xs text-[#8E8E9A] leading-relaxed">
              Want reels, tutorials, and anything related to SkillBridge? Find all updates on our official Instagram account <strong className="text-[#F3F4F6]">@cinecritiq</strong>. Anyone who wants to can follow!
            </p>
            <a
              href="https://www.instagram.com/cinecritiq/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 rounded-lg bg-[#18181D] hover:bg-[#202026] border border-[#202026] hover:border-[#FF2D95] text-xs font-semibold text-[#F3F4F6] flex items-center justify-center gap-2 transition-colors"
            >
              <Instagram className="w-4 h-4 text-[#FF2D95]" />
              <span>Follow @cinecritiq on Instagram</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#00A3E0]" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
