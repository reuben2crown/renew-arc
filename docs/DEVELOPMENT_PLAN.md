# RenewPilot MVP Development Plan

## Project Overview
- **Product**: RenewPilot (License Renewal Tracker)
- **Phase**: MVP (Phase 1) targeting mental health counselors in CA, TX, NY, FL, IL
- **Stack**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Supabase (Auth + DB + Storage), Google Vision API, Resend (Email), Twilio (SMS), Vercel Cron, Dodo Payments
- **Key Constraints**: Mobile-first PWA, strict RLS security, error-tolerant OCR flow, serverless architecture

---

## Sprint 1: Foundation & Authentication ✅ COMPLETED
**Duration**: Week 1
**Goal**: Project setup, authentication, database schema, basic UI framework

### Tasks:
- [x] Initialize Next.js 14 project with TypeScript
- [x] Configure Tailwind CSS and mobile-first responsive design
- [x] Set up Supabase project and connection
- [x] Implement user authentication (login/signup)
- [x] Create database schema with RLS policies
- [x] Build basic layout components and navigation
- [x] Set up PWA manifest and offline shell
- [x] Configure environment variables template

### Deliverables:
- [x] Complete project directory structure
- [x] Supabase schema.sql with tables, indexes, RLS policies
- [x] Auth forms (login/signup)
- [x] Protected route middleware
- [x] Environment variable template (.env.example)
- [x] Basic UI component library

---

## Sprint 2: License Management ✅ COMPLETED
**Duration**: Week 2
**Goal**: License onboarding, CRUD operations, dashboard foundation

### Tasks:
- [x] Design and implement license setup form with validation
- [x] Build license CRUD API routes/server actions
- [x] Create state and license type seed data
- [x] Implement license list view
- [x] Build dashboard layout with basic metrics
- [x] Add license renewal date tracking
- [x] Implement form validation with Zod schemas

### Deliverables:
- [x] License onboarding form component
- [x] License management API endpoints
- [x] Dashboard page with license overview
- [x] Validation schemas for license data
- [x] Seed scripts for states and license types

---

## Sprint 3: OCR Pipeline ✅ COMPLETED
**Duration**: Week 2-3
**Goal**: CE credit upload, Google Vision integration, confidence handling

### Tasks:
- [x] Integrate Google Vision API for text extraction
- [x] Build CE certificate upload component
- [x] Implement OCR result parsing logic
- [x] Add confidence threshold handling (<60% requires manual review)
- [x] Create manual edit fallback interface
- [x] Store OCR confidence scores in database
- [x] Implement error logging for failed extractions
- [x] Add file upload to Supabase Storage

### Deliverables:
- [x] Google Vision API wrapper service
- [x] CE upload component with drag-and-drop
- [x] OCR processing API endpoint
- [x] Manual override form for low-confidence results
- [x] Error handling and logging system
- [x] Certificate storage in Supabase

---

## Sprint 4: Notifications & Automation ✅ COMPLETED
**Duration**: Week 3
**Goal**: Reminder scheduling, email/SMS notifications, readiness score

### Tasks:
- [x] Calculate readiness score (0-100) based on CE hours vs requirements
- [x] Build notification preferences management
- [x] Integrate Resend for email notifications
- [x] Integrate Twilio for SMS notifications
- [x] Set up Vercel Cron for daily reminder checks
- [x] Implement idempotent webhook to prevent duplicate sends
- [x] Create reminder scheduler logic (30/14/7 days before renewal)
- [x] Add user opt-in/opt-out controls

### Deliverables:
- [x] Readiness score calculation component
- [x] Notification preferences UI
- [x] Email notification service (Resend)
- [x] SMS notification service (Twilio)
- [x] Vercel cron.json configuration
- [x] Scheduled reminder API endpoint
- [x] Idempotency key implementation

---

## Sprint 5: Critical MVP Gaps 🚧 IN PROGRESS
**Duration**: Week 4
**Goal**: Payment integration, reporting, monitoring/analytics, feedback loop

### Tasks:
- [ ] **Payment Integration (Dodo Payments)**
  - [ ] Research and integrate Dodo Payments SDK
  - [ ] Implement subscription plans (Free tier + Premium $9/mo)
  - [ ] Build checkout flow with merchant of record handling
  - [ ] Add webhook handlers for payment events
  - [ ] Create billing portal for subscription management
  - [ ] Implement usage limits based on plan tier
  - [ ] Keep Paddle as backup integration option

- [ ] **Reporting System (Web + PDF)**
  - [ ] Design comprehensive web dashboard reports
  - [ ] Build CE hour summary by category/timeframe
  - [ ] Create compliance status report view
  - [ ] Implement PDF generation for audit reports
  - [ ] Add downloadable certification of completion
  - [ ] Include jurisdiction-specific formatting
  - [ ] Export functionality (PDF, CSV)

- [ ] **Monitoring & Analytics**
  - [ ] Set up Sentry for error tracking
  - [ ] Integrate PostHog for product analytics
  - [ ] Implement custom event tracking (uploads, conversions, etc.)
  - [ ] Create performance monitoring dashboards
  - [ ] Set up uptime monitoring
  - [ ] Configure alerting for critical errors
  - [ ] Add session replay for debugging

- [ ] **User Feedback Loop**
  - [ ] Integrate in-app feedback widget (Crisp/Intercom alternative)
  - [ ] Add NPS survey after key actions
  - [ ] Create support ticket system
  - [ ] Set up dedicated support email channel
  - [ ] Build feature request voting board
  - [ ] Implement bug report form with screenshot capture
  - [ ] Add contextual help tooltips

- [ ] **Jurisdiction Rule Engine (Enhanced)**
  - [ ] Expand state-specific CE requirements database
  - [ ] Implement rule validation engine
  - [ ] Add automatic category mapping
  - [ ] Create approval workflow for edge cases
  - [ ] Build admin interface for rule updates

### Deliverables:
- [ ] Dodo Payments integration with subscription management
- [ ] Web-based reporting dashboard with filters
- [ ] PDF report generation service
- [ ] Sentry error tracking setup
- [ ] PostHog analytics integration
- [ ] In-app feedback widget
- [ ] Support ticket system
- [ ] Enhanced rule engine with state-specific logic
- [ ] Admin panel for rule management

---

## Technical Requirements (All Sprints)

### Security
- [x] RLS enabled on ALL database tables
- [x] No hardcoded secrets (all via environment variables)
- [x] PII protection (no logging of license numbers, emails in console)
- [x] Secure file upload validation
- [ ] Rate limiting on API endpoints
- [ ] CSRF protection on forms

### Code Quality
- [x] TypeScript strict mode (no `any`)
- [x] Comprehensive JSDoc comments
- [x] Unit tests for core utilities
- [x] Integration tests for API routes
- [x] E2E tests for critical user flows
- [ ] 80%+ code coverage

### Performance
- [x] Mobile-first responsive design
- [x] PWA with offline capabilities
- [ ] Image optimization for certificates
- [ ] Database query optimization
- [ ] Lazy loading for non-critical components

### Accessibility
- [ ] WCAG 2.1 AA compliance
- [ ] Screen reader testing
- [ ] Keyboard navigation support
- [ ] Color contrast verification

---

## Deployment Checklist

### Pre-Launch (Sprint 5 Completion)
- [ ] All Sprint 5 tasks completed
- [ ] Payment flow tested end-to-end
- [ ] Reports generated and verified
- [ ] Monitoring dashboards active
- [ ] Feedback channels operational
- [ ] Security audit passed
- [ ] Load testing completed
- [ ] Mobile responsiveness verified on 5+ devices
- [ ] Cross-browser testing (Chrome, Safari, Firefox, Edge)
- [ ] Accessibility audit completed

### Production Deployment
- [ ] Environment variables configured in Vercel
- [ ] Supabase production database migrated
- [ ] SSL certificates verified
- [ ] Custom domain configured
- [ ] Email domain verified (for Resend)
- [ ] SMS sender ID approved (for Twilio)
- [ ] Dodo Payments account verified and live
- [ ] Cron jobs activated
- [ ] Error alerts configured
- [ ] Backup strategy implemented

### Post-Launch (Week 1-2)
- [ ] Monitor error rates via Sentry
- [ ] Track user behavior via PostHog
- [ ] Collect and triage user feedback
- [ ] Respond to support tickets within 24hrs
- [ ] Analyze conversion funnel
- [ ] Iterate on onboarding flow based on drop-off points
- [ ] Plan Sprint 6 based on user requests

---

## Success Metrics (MVP)

### Week 1 Targets
- [ ] 100 beta users onboarded
- [ ] < 2% error rate on OCR processing
- [ ] > 80% completion rate for license setup
- [ ] Average readiness score calculation accuracy > 95%

### Month 1 Targets
- [ ] 500 total registered users
- [ ] 15% conversion to paid tier
- [ ] < 1% churn rate
- [ ] NPS score > 40
- [ ] Average session duration > 5 minutes

### Quarter 1 Targets
- [ ] 2,000 total users across 5 states
- [ ] $5,000 MRR
- [ ] < 0.5% critical bug rate
- [ ] Feature adoption rate > 60%

---

## Risk Mitigation

| Risk | Impact | Probability | Mitigation Strategy |
|------|--------|-------------|---------------------|
| OCR accuracy too low | High | Medium | Manual override flow, confidence thresholds, user training |
| Payment provider issues | High | Low | Dodo primary, Paddle backup ready |
| State regulation changes | Medium | Medium | Modular rule engine, admin update capability |
| Low user retention | High | Medium | Feedback loop, rapid iteration, engagement features |
| Scalability issues | Medium | Low | Serverless architecture, auto-scaling configured |

---

## Team & Responsibilities

- **Product Strategy**: Define roadmap, prioritize features, validate with users
- **Development**: Full-stack implementation, testing, deployment
- **Design**: UI/UX, mobile-first responsive design, accessibility
- **QA**: Testing strategy, bug tracking, regression testing
- **Support**: User onboarding, feedback collection, ticket resolution

---

## Next Steps After MVP Launch

1. **Immediate (Week 1-2)**: Stabilize, monitor, collect feedback
2. **Growth Phase (Month 2-3)**: Marketing push, referral program, content marketing
3. **Expansion Phase (Month 4-6)**: Additional states, new professional verticals
4. **Scale Phase (Month 7-12)**: Team features, enterprise tier, API access

---

*Last Updated: $(date +%Y-%m-%d)*
*Version: 2.0 (Including Sprint 5)*
