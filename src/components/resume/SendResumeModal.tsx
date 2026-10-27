import React, { useState } from 'react';
import { ResumeData } from '../../types';
import { EmailService, OWNER_EMAIL } from '../../services/emailService';
import { useToast } from '../../context/NotificationContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Send, Mail, CheckCircle2 } from 'lucide-react';

interface SendResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeData: ResumeData;
}

export const SendResumeModal: React.FC<SendResumeModalProps> = ({ isOpen, onClose, resumeData }) => {
  const { showToast } = useToast();
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [subject, setSubject] = useState(`Resume & Portfolio - ${resumeData.personal.fullName || 'Student Applicant'}`);
  const [coverNote, setCoverNote] = useState(
    `Dear Hiring Team,\n\nPlease find attached my engineering resume and project portfolio. I would welcome the opportunity to discuss how my skill set aligns with your open opportunities.\n\nBest regards,\n${resumeData.personal.fullName}`
  );
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail.trim()) {
      showToast('Recipient required', 'Please provide a valid recipient email address.', 'error');
      return;
    }

    setIsSending(true);
    try {
      // Send dispatch notification through EmailService
      EmailService.sendContactEmailNotification({
        name: `${resumeData.personal.fullName} (via SkillBridge Resume Dispatch)`,
        email: resumeData.personal.email || 'student@skillbridge.edu',
        subject: `[Resume Sent] ${subject} to ${recipientEmail}`,
        message: `Recipient: ${recipientName || recipientEmail}\n\nNote:\n${coverNote}\n\nCandidate Skills: ${resumeData.skills.technical.join(', ')}\nEducation: ${resumeData.education.higherEducation[0]?.degree || 'N/A'}`,
        category: 'Hiring & Project',
      });

      setIsSent(true);
      showToast('Resume dispatched!', `Your resume was sent to ${recipientEmail}.`, 'success');
      setTimeout(() => {
        setIsSent(false);
        onClose();
      }, 1800);
    } catch (err: any) {
      showToast('Error sending resume', err.message, 'error');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Send Resume Directly"
      description="Send your ATS-ready resume profile and custom cover note directly to recruiters, mentors, or companies."
    >
      {isSent ? (
        <div className="py-8 text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-[#10B981] mx-auto animate-bounce" />
          <h3 className="text-base font-bold text-[#F3F4F6]">Resume Successfully Dispatched</h3>
          <p className="text-xs text-[#8E8E9A]">
            A copy has also been indexed to your application records.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSend} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Recipient Name / Company"
              value={recipientName}
              onChange={e => setRecipientName(e.target.value)}
              placeholder="e.g. Acme Tech Hiring Team"
            />
            <Input
              label="Recipient Email"
              type="email"
              required
              value={recipientEmail}
              onChange={e => setRecipientEmail(e.target.value)}
              placeholder="recruiter@company.com"
            />
          </div>

          <Input
            label="Subject"
            required
            value={subject}
            onChange={e => setSubject(e.target.value)}
          />

          <Textarea
            label="Cover Message / Note"
            rows={4}
            value={coverNote}
            onChange={e => setCoverNote(e.target.value)}
          />

          <div className="p-3 bg-[#18181D] rounded-lg border border-[#202026] text-[11px] text-[#8E8E9A] flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#00A3E0] shrink-0" />
            <span>
              Your formatted resume ({resumeData.formatting.template}) will be transmitted with verified project and profile links.
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#202026]">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSending}
              isLoading={isSending}
              className="gap-1.5 text-xs"
            >
              <Send className="w-3.5 h-3.5" />
              Send Resume
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
