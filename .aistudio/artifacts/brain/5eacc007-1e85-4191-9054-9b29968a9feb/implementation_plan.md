# Revised Implementation Plan: Resume Builder & Pricing Architecture

Incorporate the user's revisions into the Resume Builder and Pricing system: Demo mode checkout ready for Razorpay, centralized subscription/usage state in `store.ts`, a fixed A4 (210×297mm) preview canvas with page count and "Fit to one page" scaling, ATS Keyword Match, 2-line Professional Summary, bug fixes, and modular architecture.

---

## 1. Plan Comparison Matrix & Adjustments

| Feature | Free (3 Free Uses) | Basic: ₹99 (One-Time) | Premium: ₹299/mo or ₹1,499/yr |
| :--- | :--- | :--- | :--- |
| **Resume Count** | 1 | 3 | Unlimited |
| **Templates** | 2 simple (Classic & Modern) | 10 styles & colorways | 30+ including creative & ATS |
| **PDF Download** | Faint diagonal watermark | Clean (No watermark) | Clean (No watermark) |
| **Word (.docx) Export** | ❌ Locked | ✅ Included | ✅ Included |
| **Public Resume Link** | ❌ Locked | ✅ Included (`/r/:slug`) | ✅ Included with custom slug |
| **Send to Email / Recruiter** | 3 sends | 20 sends | Unlimited sends |
| **Auto-Fill from Projects** | ✅ Included | ✅ Included | ✅ Included |
| **AI Summary & Bullets** | ❌ Locked | 5 uses | Unlimited uses |
| **ATS Keyword Match** | ❌ Locked | Basic match % | Full report with keyword fixes |
| **Cover Letter Builder** | ❌ Locked | ❌ Locked | ✅ Included |
| **Expert Resume Review** | ❌ Locked | ❌ Locked | *Coming soon* |
| **Profile Boost** | ❌ Locked | ❌ Locked | *Coming soon* |
| **Resume Analytics & Views** | ❌ Locked | ❌ Locked | ✅ Included |

---

## 2. Core Architecture & Refinements

### A. Modular File Structure
```
src/
├── pages/
│   ├── ResumeBuilderPage.tsx     (multi-step form + fixed A4 live preview)
│   ├── MyResumesPage.tsx         (list, duplicate, edit, delete resumes)
│   ├── PricingPage.tsx           (Free / Basic / Premium cards with toggle)
│   └── PublicResumePage.tsx      (shareable /r/:slug resume view with consent check)
├── components/resume/
│   ├── StepPersonal.tsx          (personal details, capitalized city, photo)
│   ├── StepEducation.tsx         (degrees, capitalized college, 12th & 10th)
│   ├── StepSkills.tsx            (technical, tools, soft skills, languages)
│   ├── StepProjects.tsx          (import from SkillBridge + custom)
│   ├── StepExperience.tsx        (internships & work with bullet formatting)
│   ├── StepCertifications.tsx    (certifications & achievements)
│   ├── TemplatePicker.tsx        (template cards, color picker, font styles)
│   ├── ResumePreview.tsx         (fixed 210×297mm A4 container, pagination, watermark)
│   ├── templates/
│   │   ├── ClassicTemplate.tsx   (Harvard ATS single-column)
│   │   ├── ModernTemplate.tsx    (clean Cerulean/Rose header)
│   │   ├── SlateTemplate.tsx     (executive two-column)
│   │   └── CreativeTemplate.tsx  (developer cards)
│   └── UpgradeModal.tsx          (triggered on locked features or after 3 free uses)
├── services/
│   ├── resumeService.ts          (save, load, docx export, selectable PDF print)
│   ├── paymentService.ts         (Razorpay order + verify interface, Demo mode engine)
│   └── store.ts                  (centralized subscription & free-use state for future Supabase migration)
├── context/
│   └── PlanContext.tsx           (plan state, 3-use counter, limit enforcement)
└── pages/legal/
    ├── TermsPage.tsx             (terms of service required by Razorpay)
    └── RefundPolicyPage.tsx      (refund policy required by Razorpay)
```

### B. Payment Engine & Demo Mode (`paymentService.ts`)
- **Demo Mode Banner**: Clear notice: *"Demo mode - no real payment will be charged. Do not enter real card numbers."*
- **Interface Structure**: Structured identically to Razorpay's API:
  - `createOrder({ amount, currency, planId, billingCycle })`
  - `verifyPayment({ razorpay_order_id, razorpay_payment_id, razorpay_signature })`
- **Simulated Methods**:
  - UPI ID / QR code (Google Pay, PhonePe, Paytm).
  - Test Card (mock prefilled numbers like `4111 2222 3333 4444`, mock CVV).
- **Backend-Ready Hooks**: Ready to switch to real Razorpay Web Service / Supabase Edge Function without rewriting frontend components.

### C. State Centralization in `store.ts` (Supabase Migration Ready)
- Manages:
  - User active plan (`free`, `basic`, `premium`).
  - Free uses counter (initial count = 3, decrements on download/send).
  - Saved resumes storage (`resumes` collection).
  - Resume sends count (`resume_sends`).
- Includes clear inline documentation: `// NOTE: This state structure maps 1:1 to Supabase tables 'subscriptions', 'resumes', and 'resume_sends'`.

### D. Fixed A4 Resume Preview Engine (`ResumePreview.tsx`)
- **Fixed Physical Dimensions**: Fixed A4 aspect ratio ($210\text{mm} \times 297\text{mm}$, equivalent to $794\text{px} \times 1123\text{px}$ at 96 DPI).
- **Page Indicators**: "Page 1 of 1" or "Page 1 of 2" badge showing pagination.
- **"Fit to One Page" Action**: Automatically calculates content density, applies a compact layout modifier (tightens padding and line-heights) to guarantee single-page fitting for campus hiring.
- **Selectable Text Print PDF**: Pure CSS `@media print` with exact A4 dimensions and vector text preservation (no rasterization or blurry text).
- **Diagonal Watermark**: Translucent diagonal watermark on Free tier: *"Generated with SkillBridge Free Student Plan • Upgrade to Remove Watermark"*.

### E. Bug Fixes & Content Rules
1. **Full Name in Header**: Binds to `personal.fullName` (defaults to user's registered name, never an email or username).
2. **Capitalization**: Helper `toTitleCase` automatically formats city names (e.g. "san francisco" -> "San Francisco") and college/institution names.
3. **Consistent Theme Tokens**: Accent color and typography selection (Sans, Serif, Mono) dynamically applied to **every** template.
4. **Single Primary Download Button**: Only one primary "Download as PDF" button in the action bar, preventing UI confusion.
5. **2-Line Professional Summary**: Placed right beneath the header across all templates, above education/experience.

### F. Privacy & Public Sharing Consent
- When generating a public link (`/r/:slug`), prompt the user with explicit consent confirmation regarding public visibility of email and education.

---

## 3. Implementation Steps

1. **Plan & Subscription State** (`store.ts` & `src/context/PlanContext.tsx`):
   - Implement `UserPlan`, 3-use free tracker, and upgrade callbacks.
2. **Payment Service & Checkout Modal** (`src/services/paymentService.ts` & `src/components/pricing/CheckoutModal.tsx`):
   - Demo mode checkout with UPI and card options, Razorpay-compatible signatures.
3. **Fixed A4 Preview & Templates** (`src/components/resume/ResumePreview.tsx` & `templates/`):
   - Implement $210 \times 297\,\text{mm}$ canvas, diagonal watermark for Free tier, "Fit to one page" toggle, selectable print styles, and 2-line Professional Summary.
4. **Multi-Step Form Refinement** (`src/pages/ResumeBuilderPage.tsx`):
   - Refactor steps into modular components, apply capitalization helpers, single primary download button, and ATS Keyword Match check.
5. **My Resumes & Public View** (`MyResumesPage.tsx`, `PublicResumePage.tsx`, `PricingPage.tsx`):
   - Resume management, shareable public link with consent modal, and transparent pricing cards.
6. **Verification**:
   - Verify 3 free downloads with diagonal watermark, upgrade to Basic/Premium in demo mode, watermark removal, Word export, and clean TypeScript compilation.
