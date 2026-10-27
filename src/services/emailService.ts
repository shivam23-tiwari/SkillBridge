import { OwnerGmailEmail } from '../types';
import { generateId } from '../lib/utils';

export const OWNER_EMAIL = 'shivamtiwari18107@gmail.com';
const STORAGE_KEY_GMAIL = 'skillbridge_owner_gmail_inbox';

function getFormattedTime(date: Date = new Date()): string {
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
}

function getFormattedDate(date: Date = new Date()): string {
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

const INITIAL_OWNER_EMAILS: OwnerGmailEmail[] = [
  {
    id: 'email-seed-1',
    to: OWNER_EMAIL,
    from: 'SkillBridge Security <alerts@skillbridge.edu>',
    subject: 'New login: rahul@email.com at 3:40 PM',
    preview: 'Rahul Sharma logged in from Chrome / Desktop. User left a note: "Looking to hire two React engineers for collegiate project."',
    body: `Hello Shivam,

A new user login has just occurred on your SkillBridge platform:

Account Details:
• Name: Rahul Sharma
• Email: rahul@email.com
• Time: 3:40 PM (Oct 23, 2026)
• Device: Chrome / macOS
• Location: Stanford Campus Network

Optional Message from User at Login:
"Looking to hire two React engineers for our collegiate SaaS project. Please connect me with top builders!"

---------------------------------------------------
SkillBridge Automated Notification Dispatcher
Sent to: ${OWNER_EMAIL}`,
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    formatted_time: '3:40 PM',
    date: getFormattedDate(),
    category: 'login',
    read: false,
    sender_name: 'Rahul Sharma',
    sender_email: 'rahul@email.com',
    user_message: 'Looking to hire two React engineers for our collegiate SaaS project.',
  },
  {
    id: 'email-seed-2',
    to: OWNER_EMAIL,
    from: 'Priya Sharma <priya.sharma@stanford.edu>',
    subject: 'New message from Priya Sharma: Machine Learning Collaboration Inquiry',
    preview: 'Hi Shivam, we would love to feature our Stanford AI lab research projects on the SkillBridge directory...',
    body: `Hi Shivam,

I am reaching out regarding university partnerships for our Stanford AI Research Lab. We would love to showcase 3 machine learning open source projects on the SkillBridge project directory.

Are there verification requirements for research groups? Looking forward to hearing from you!

Best regards,
Priya Sharma
Stanford University · M.S. AI`,
    timestamp: new Date(Date.now() - 140 * 60 * 1000).toISOString(),
    formatted_time: '2:15 PM',
    date: getFormattedDate(),
    category: 'contact',
    read: true,
    sender_name: 'Priya Sharma',
    sender_email: 'priya.sharma@stanford.edu',
  },
  {
    id: 'email-seed-3',
    to: OWNER_EMAIL,
    from: 'SkillBridge Notification System <notifications@skillbridge.edu>',
    subject: '🎉 New User Registered on Your Website',
    preview: 'A new user (Alex Chen · alex.chen@berkeley.edu) registered via Email / Password.',
    body: `Hello Admin,

A new user has successfully registered on your website.

Name: Alex Chen
Email: alex.chen@berkeley.edu
Registration Method: Email / Password
Registered At: ${getFormattedDate()} at 11:20 AM
Institution: UC Berkeley

You can review this user in your admin dashboard:
/admin

— Your Website Notification System`,
    timestamp: new Date(Date.now() - 360 * 60 * 1000).toISOString(),
    formatted_time: '11:20 AM',
    date: getFormattedDate(),
    category: 'signup',
    read: true,
    sender_name: 'Alex Chen',
    sender_email: 'alex.chen@berkeley.edu',
  },
];

export const EmailService = {
  getOwnerEmails(): OwnerGmailEmail[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_GMAIL);
      if (stored) {
        return JSON.parse(stored);
      }
      localStorage.setItem(STORAGE_KEY_GMAIL, JSON.stringify(INITIAL_OWNER_EMAILS));
      return INITIAL_OWNER_EMAILS;
    } catch {
      return INITIAL_OWNER_EMAILS;
    }
  },

  saveOwnerEmails(emails: OwnerGmailEmail[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_GMAIL, JSON.stringify(emails));
      window.dispatchEvent(new CustomEvent('owner-emails-updated', { detail: emails }));
    } catch (err) {
      console.error('Failed to save owner emails:', err);
    }
  },

  sendLoginEmailNotification(params: {
    userName: string;
    email: string;
    optionalMessage?: string;
  }): OwnerGmailEmail {
    const now = new Date();
    const formattedTime = getFormattedTime(now);
    const formattedDate = getFormattedDate(now);

    const subject = `New login: ${params.email} at ${formattedTime}`;
    const userNoteSection = params.optionalMessage?.trim()
      ? `\nOptional Message from Login Box:\n"${params.optionalMessage.trim()}"`
      : '\nOptional Message: (None left during login)';

    const body = `Hello Shivam,

A new user login has just occurred on your SkillBridge platform:

Account Information:
• Name: ${params.userName}
• Email: ${params.email}
• Time: ${formattedTime}
• Date: ${formattedDate}
• Browser Agent: ${navigator.userAgent.slice(0, 70)}...
${userNoteSection}

---------------------------------------------------
SkillBridge Automated Notification Dispatcher
Destination Inbox: ${OWNER_EMAIL}`;

    const newEmail: OwnerGmailEmail = {
      id: generateId(),
      to: OWNER_EMAIL,
      from: `SkillBridge Security <alerts@skillbridge.edu>`,
      subject,
      preview: params.optionalMessage?.trim()
        ? `${params.userName} logged in. Note: "${params.optionalMessage.slice(0, 60)}..."`
        : `${params.userName} (${params.email}) logged in successfully.`,
      body,
      timestamp: now.toISOString(),
      formatted_time: formattedTime,
      date: formattedDate,
      category: 'login',
      read: false,
      sender_name: params.userName,
      sender_email: params.email,
      user_message: params.optionalMessage?.trim(),
    };

    const current = this.getOwnerEmails();
    const updated = [newEmail, ...current];
    this.saveOwnerEmails(updated);
    return newEmail;
  },

  sendContactEmailNotification(params: {
    name: string;
    email: string;
    subject: string;
    message: string;
    category?: string;
  }): OwnerGmailEmail {
    const now = new Date();
    const formattedTime = getFormattedTime(now);
    const formattedDate = getFormattedDate(now);

    const emailSubject = `New message from ${params.name}: ${params.subject || 'Website Inquiry'}`;
    const body = `Hi Shivam,

You received a new inquiry from the SkillBridge Contact Page:

From: ${params.name} (${params.email})
Category: ${params.category || 'General Inquiry'}
Time: ${formattedTime} on ${formattedDate}

Subject: ${params.subject}

Message:
"${params.message}"

---------------------------------------------------
You can reply directly to this user via their email: ${params.email}
SkillBridge Owner Notification Relay to ${OWNER_EMAIL}`;

    const newEmail: OwnerGmailEmail = {
      id: generateId(),
      to: OWNER_EMAIL,
      from: `${params.name} <${params.email}>`,
      subject: emailSubject,
      preview: `${params.message.slice(0, 90)}...`,
      body,
      timestamp: now.toISOString(),
      formatted_time: formattedTime,
      date: formattedDate,
      category: 'contact',
      read: false,
      sender_name: params.name,
      sender_email: params.email,
      user_message: params.message,
    };

    const current = this.getOwnerEmails();
    const updated = [newEmail, ...current];
    this.saveOwnerEmails(updated);
    return newEmail;
  },

  sendSignupEmailNotification(params: {
    userId?: string;
    name: string;
    email: string;
    college?: string;
    registrationMethod?: string;
    idempotencyKey?: string;
  }): OwnerGmailEmail | null {
    const normalizedEmail = params.email.trim().toLowerCase();
    const dedupeStorageKey = 'skillbridge_signup_notified_emails';
    const dedupeKey = params.idempotencyKey || `signup:${normalizedEmail}`;

    // Idempotency check: prevent duplicate signup notifications if retried
    try {
      const notifiedRaw = localStorage.getItem(dedupeStorageKey);
      const notifiedList: string[] = notifiedRaw ? JSON.parse(notifiedRaw) : [];
      if (notifiedList.includes(dedupeKey) || notifiedList.includes(normalizedEmail)) {
        const existing = this.getOwnerEmails().find(
          e => e.category === 'signup' && e.sender_email?.toLowerCase() === normalizedEmail
        );
        return existing || null;
      }
      notifiedList.push(dedupeKey, normalizedEmail);
      localStorage.setItem(dedupeStorageKey, JSON.stringify(notifiedList));
    } catch {
      // Safe fallback if localStorage is restricted
    }

    const now = new Date();
    const formattedTime = getFormattedTime(now);
    const formattedDate = getFormattedDate(now);
    const registeredAtFull = `${formattedDate} at ${formattedTime}`;
    const method = params.registrationMethod || 'Email / Password';
    const adminDashboardUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}/admin`
        : 'http://localhost:3000/admin';

    const subject = '🎉 New User Registered on Your Website';
    const body = `Hello Admin,

A new user has successfully registered on your website.

Name: ${params.name || 'Not Provided'}
Email: ${params.email}
Registration Method: ${method}
Registered At: ${registeredAtFull}${params.college ? `\nInstitution: ${params.college}` : ''}

You can review this user in your admin dashboard:
${adminDashboardUrl}

— Your Website Notification System`;

    const newEmail: OwnerGmailEmail = {
      id: generateId(),
      to: OWNER_EMAIL,
      from: 'SkillBridge Notification System <notifications@skillbridge.edu>',
      subject,
      preview: `A new user (${params.name} · ${params.email}) registered via ${method} on ${registeredAtFull}.`,
      body,
      timestamp: now.toISOString(),
      formatted_time: formattedTime,
      date: formattedDate,
      category: 'signup',
      read: false,
      sender_name: params.name,
      sender_email: params.email,
    };

    const current = this.getOwnerEmails();
    const updated = [newEmail, ...current];
    this.saveOwnerEmails(updated);

    // Non-blocking server-side email dispatch (sends Admin Notification Email + New User Welcome Email)
    if (typeof window !== 'undefined' && typeof fetch !== 'undefined') {
      fetch('/api/notifications/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: params.userId,
          name: params.name,
          email: params.email,
          college: params.college,
          registrationMethod: method,
          idempotencyKey: dedupeKey,
        }),
      })
        .then(async res => {
          if (!res.ok) {
            const text = await res.text();
            console.warn('[EmailService] Server notification endpoint returned non-OK:', text);
          }
        })
        .catch(err => {
          console.warn('[EmailService] Non-blocking email notification error:', err);
        });
    }

    return newEmail;
  },

  markEmailAsRead(id: string): void {
    const current = this.getOwnerEmails();
    const updated = current.map(e => (e.id === id ? { ...e, read: true } : e));
    this.saveOwnerEmails(updated);
  },

  markAllAsRead(): void {
    const current = this.getOwnerEmails();
    const updated = current.map(e => ({ ...e, read: true }));
    this.saveOwnerEmails(updated);
  },

  deleteEmail(id: string): void {
    const current = this.getOwnerEmails();
    const updated = current.filter(e => e.id !== id);
    this.saveOwnerEmails(updated);
  },

  clearAll(): void {
    this.saveOwnerEmails([]);
  },
};
