import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

const PORT = 3000;
const WEBSITE_NAME = 'SkillBridge';
const DEFAULT_ADMIN_EMAIL = 'shivamtiwari18107@gmail.com';

// Server-side idempotency & audit log store
interface NotificationAuditRecord {
  id: string;
  userId: string;
  name: string;
  email: string;
  college?: string;
  registrationMethod: string;
  registeredAt: string;
  adminEmailTo: string;
  adminEmailSubject: string;
  adminEmailBody: string;
  welcomeEmailTo: string;
  welcomeEmailSubject: string;
  welcomeEmailBody: string;
  provider: 'resend' | 'smtp' | 'server-log-queue';
  adminDeliveryStatus: 'sent' | 'queued' | 'failed';
  welcomeDeliveryStatus: 'sent' | 'queued' | 'failed';
  errorDetails?: string;
}

const notifiedEmails = new Set<string>();
const notifiedKeys = new Set<string>();
const notificationHistory: NotificationAuditRecord[] = [];

// Rate limiting per IP to prevent abuse of notification endpoint
const ipRateLimits = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 20;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = ipRateLimits.get(ip);
  if (!entry || now > entry.resetAt) {
    ipRateLimits.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }
  entry.count += 1;
  return true;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function dispatchEmailViaProvider(params: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<{ status: 'sent' | 'queued' | 'failed'; provider: 'resend' | 'smtp' | 'server-log-queue'; error?: string }> {
  const resendApiKey = process.env.RESEND_API_KEY?.trim();
  const smtpHost = process.env.SMTP_HOST?.trim();
  const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
  const smtpUser = process.env.SMTP_USER?.trim();
  const smtpPass = process.env.SMTP_PASS?.trim();
  const fromAddress =
    process.env.EMAIL_FROM?.trim() || `${WEBSITE_NAME} Notifications <onboarding@resend.dev>`;

  // 1. Try Resend HTTP API if RESEND_API_KEY is configured
  if (resendApiKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [params.to],
          subject: params.subject,
          text: params.text,
          html: params.html,
        }),
      });

      if (!response.ok) {
        const errBody = await response.text();
        console.error(`[EmailNotificationError] Resend API error (${response.status}) for ${params.to}:`, errBody);
        return {
          status: 'failed',
          provider: 'resend',
          error: `Resend HTTP ${response.status}: ${errBody}`,
        };
      }

      return { status: 'sent', provider: 'resend' };
    } catch (err: any) {
      console.error(`[EmailNotificationError] Resend network failure for ${params.to}:`, err?.message || err);
      return {
        status: 'failed',
        provider: 'resend',
        error: err?.message || 'Resend request failed',
      };
    }
  }

  // 2. Try Nodemailer SMTP if SMTP credentials are configured
  if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: process.env.EMAIL_FROM?.trim() || `"${WEBSITE_NAME}" <${smtpUser}>`,
        to: params.to,
        subject: params.subject,
        text: params.text,
        html: params.html,
      });

      return { status: 'sent', provider: 'smtp' };
    } catch (err: any) {
      console.error(`[EmailNotificationError] SMTP delivery failure for ${params.to}:`, err?.message || err);
      return {
        status: 'failed',
        provider: 'smtp',
        error: err?.message || 'SMTP sendMail failed',
      };
    }
  }

  // 3. Safe Server Queue fallback when external provider credentials are not yet configured
  console.info(
    `[EmailService] External email credentials (RESEND_API_KEY or SMTP_HOST/SMTP_USER/SMTP_PASS) not configured. Queued server-side email to <${params.to}> | Subject: "${params.subject}"`
  );
  return {
    status: 'queued',
    provider: 'server-log-queue',
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '100kb' }));

  // Health & Provider Configuration Status endpoint (never exposes secrets)
  app.get('/api/notifications/status', (_req: Request, res: Response) => {
    const hasResend = Boolean(process.env.RESEND_API_KEY?.trim());
    const hasSmtp = Boolean(
      process.env.SMTP_HOST?.trim() &&
        process.env.SMTP_USER?.trim() &&
        process.env.SMTP_PASS?.trim()
    );
    res.json({
      ok: true,
      providerConfigured: hasResend || hasSmtp,
      activeProvider: hasResend ? 'resend' : hasSmtp ? 'smtp' : 'server-log-queue',
      adminRecipientConfigured: Boolean(process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL),
      totalProcessedSignups: notificationHistory.length,
    });
  });

  // Admin Notification Audit endpoint
  app.get('/api/notifications/signup-history', (_req: Request, res: Response) => {
    res.json({
      ok: true,
      records: notificationHistory.slice(0, 50),
    });
  });

  // New User Registration Notification Endpoint (Admin Email + User Welcome Email)
  app.post('/api/notifications/signup', async (req: Request, res: Response) => {
    try {
      const clientIp =
        (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
        req.socket.remoteAddress ||
        'unknown';

      if (!checkRateLimit(clientIp)) {
        res.status(429).json({
          ok: false,
          error: 'Too many notification requests from this IP. Please try again later.',
        });
        return;
      }

      // Strictly extract only safe public profile fields (never accept or log passwords/tokens)
      const rawName = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
      const rawEmail = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
      const rawUserId = typeof req.body?.userId === 'string' ? req.body.userId.trim() : '';
      const rawCollege = typeof req.body?.college === 'string' ? req.body.college.trim() : '';
      const rawMethod =
        typeof req.body?.registrationMethod === 'string' && req.body.registrationMethod.trim()
          ? req.body.registrationMethod.trim()
          : 'Email / Password';
      const idempotencyKey =
        typeof req.body?.idempotencyKey === 'string' && req.body.idempotencyKey.trim()
          ? req.body.idempotencyKey.trim()
          : `signup:${rawEmail}`;

      if (!rawEmail || !isValidEmail(rawEmail)) {
        res.status(400).json({
          ok: false,
          error: 'A valid user email address is required.',
        });
        return;
      }

      const displayName = rawName || rawEmail.split('@')[0];

      // Idempotency protection: prevent duplicate notifications on retries for the same user registration
      if (notifiedEmails.has(rawEmail) || notifiedKeys.has(idempotencyKey)) {
        res.status(200).json({
          ok: true,
          duplicate: true,
          message: 'Registration notification already dispatched for this account.',
        });
        return;
      }

      notifiedEmails.add(rawEmail);
      notifiedKeys.add(idempotencyKey);

      const now = new Date();
      const registeredAtFormatted = now.toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });

      const appBaseUrl = (
        process.env.APP_URL ||
        (req.headers.origin as string) ||
        `http://localhost:${PORT}`
      ).replace(/\/+$/, '');
      const adminDashboardUrl = `${appBaseUrl}/admin`;
      const contactPageUrl = `${appBaseUrl}/contact`;
      const adminEmail = (process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL).trim();

      // 1. Construct Admin Email Notification
      const adminSubject = '🎉 New User Registered on Your Website';
      const adminText = `Hello Admin,

A new user has successfully registered on your website.

Name: ${displayName}
Email: ${rawEmail}
Registration Method: ${rawMethod}
Registered At: ${registeredAtFormatted}${rawCollege ? `\nInstitution: ${rawCollege}` : ''}

You can review this user in your admin dashboard:
${adminDashboardUrl}

— Your Website Notification System`;

      const adminHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #0A0A0A; color: #F3F4F6; border-radius: 12px; border: 1px solid #202026;">
          <h2 style="margin-top: 0; color: #F3F4F6; font-size: 20px;">🎉 New User Registered on Your Website</h2>
          <p style="color: #D1D5DB; font-size: 14px; line-height: 1.6;">Hello Admin,</p>
          <p style="color: #D1D5DB; font-size: 14px; line-height: 1.6;">A new user has successfully registered on your website.</p>
          <div style="background-color: #121215; border: 1px solid #202026; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <p style="margin: 6px 0; font-size: 14px; color: #F3F4F6;"><strong>Name:</strong> ${escapeHtml(displayName)}</p>
            <p style="margin: 6px 0; font-size: 14px; color: #F3F4F6;"><strong>Email:</strong> ${escapeHtml(rawEmail)}</p>
            <p style="margin: 6px 0; font-size: 14px; color: #F3F4F6;"><strong>Registration Method:</strong> ${escapeHtml(rawMethod)}</p>
            <p style="margin: 6px 0; font-size: 14px; color: #F3F4F6;"><strong>Registered At:</strong> ${escapeHtml(registeredAtFormatted)}</p>
            ${rawCollege ? `<p style="margin: 6px 0; font-size: 14px; color: #F3F4F6;"><strong>Institution:</strong> ${escapeHtml(rawCollege)}</p>` : ''}
          </div>
          <p style="color: #D1D5DB; font-size: 14px; line-height: 1.6;">
            You can review this user in your admin dashboard:<br/>
            <a href="${escapeHtml(adminDashboardUrl)}" style="color: #00A3E0; text-decoration: underline;">${escapeHtml(adminDashboardUrl)}</a>
          </p>
          <hr style="border: none; border-top: 1px solid #202026; margin: 24px 0;" />
          <p style="color: #8E8E9A; font-size: 12px; margin-bottom: 0;">— Your Website Notification System (${WEBSITE_NAME})</p>
        </div>
      `;

      // 2. Construct Welcome Email for the New User
      const welcomeSubject = `Welcome to ${WEBSITE_NAME}!`;
      const welcomeText = `Hi ${displayName},

Welcome to ${WEBSITE_NAME}!

Your account has been successfully created, and you're now ready to explore everything our platform has to offer.

If you need any help, feel free to contact us via ${contactPageUrl} or reach out to our platform administrator at ${DEFAULT_ADMIN_EMAIL}.

Best regards,
${WEBSITE_NAME} Team`;

      const welcomeHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #0A0A0A; color: #F3F4F6; border-radius: 12px; border: 1px solid #202026;">
          <h2 style="margin-top: 0; color: #F3F4F6; font-size: 20px;">🎉 Welcome to ${WEBSITE_NAME}!</h2>
          <p style="color: #D1D5DB; font-size: 14px; line-height: 1.6;">Hi ${escapeHtml(displayName)},</p>
          <p style="color: #D1D5DB; font-size: 14px; line-height: 1.6;">Welcome to <strong>${WEBSITE_NAME}</strong>!</p>
          <p style="color: #D1D5DB; font-size: 14px; line-height: 1.6;">
            Your account has been successfully created, and you're now ready to explore everything our platform has to offer.
          </p>
          <div style="margin: 24px 0;">
            <a href="${escapeHtml(`${appBaseUrl}/dashboard`)}" style="display: inline-block; background-color: #FF2D95; color: #FFFFFF; font-weight: 600; font-size: 14px; padding: 10px 20px; border-radius: 8px; text-decoration: none;">
              Explore ${WEBSITE_NAME} &amp; Get Started
            </a>
          </div>
          <p style="color: #D1D5DB; font-size: 14px; line-height: 1.6;">
            If you need any help, feel free to contact us via our <a href="${escapeHtml(contactPageUrl)}" style="color: #00A3E0; text-decoration: underline;">Contact page</a> or reach out to our platform administrator at <a href="mailto:${DEFAULT_ADMIN_EMAIL}" style="color: #00A3E0; text-decoration: underline;">${DEFAULT_ADMIN_EMAIL}</a>.
          </p>
          <hr style="border: none; border-top: 1px solid #202026; margin: 24px 0;" />
          <p style="color: #8E8E9A; font-size: 12px; margin-bottom: 0;">Best regards,<br/><strong>${WEBSITE_NAME} Team</strong></p>
        </div>
      `;

      // Dispatch both emails concurrently and safely
      const [adminResult, welcomeResult] = await Promise.all([
        dispatchEmailViaProvider({
          to: adminEmail,
          subject: adminSubject,
          text: adminText,
          html: adminHtml,
        }),
        dispatchEmailViaProvider({
          to: rawEmail,
          subject: welcomeSubject,
          text: welcomeText,
          html: welcomeHtml,
        }),
      ]);

      const record: NotificationAuditRecord = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        userId: rawUserId || `user-${Date.now()}`,
        name: displayName,
        email: rawEmail,
        college: rawCollege || undefined,
        registrationMethod: rawMethod,
        registeredAt: now.toISOString(),
        adminEmailTo: adminEmail,
        adminEmailSubject: adminSubject,
        adminEmailBody: adminText,
        welcomeEmailTo: rawEmail,
        welcomeEmailSubject: welcomeSubject,
        welcomeEmailBody: welcomeText,
        provider: adminResult.provider,
        adminDeliveryStatus: adminResult.status,
        welcomeDeliveryStatus: welcomeResult.status,
        errorDetails:
          [adminResult.error, welcomeResult.error].filter(Boolean).join(' | ') || undefined,
      };

      notificationHistory.unshift(record);

      res.status(200).json({
        ok: true,
        duplicate: false,
        provider: adminResult.provider,
        adminDeliveryStatus: adminResult.status,
        welcomeDeliveryStatus: welcomeResult.status,
        adminEmailSubject: adminSubject,
        welcomeEmailSubject: welcomeSubject,
        registeredAt: registeredAtFormatted,
      });
    } catch (err: any) {
      console.error('[EmailNotificationError] Unexpected error in /api/notifications/signup:', err);
      // Return 200 with error flag so client signup flow is never blocked
      res.status(200).json({
        ok: false,
        error: 'Notification service encountered a temporary error, but your account was created.',
      });
    }
  });

  // Vite middleware for development vs static serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*all', (_req: Request, res: Response) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
