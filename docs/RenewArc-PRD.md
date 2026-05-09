# 📄 PRD: License Renewal Tracker for Solo Licensed Professionals (MVP Phase 1)

| Metadata | Detail |
|----------|--------|
| **Product Name** | RenewArc (working title) |
| **Version** | 1.0 (MVP) |
| **Target Launch** | 8 weeks from kickoff |
| **Primary Vertical** | Mental Health Counselors & Therapists |
| **Pilot Jurisdictions** | CA, TX, NY, FL, IL |
| **Monetization** | $19/year (manual upgrade v1) |
| **Success Metrics** | 70% onboarding completion, 90%+ OCR accuracy, <20% annual churn, 5K paying users Y1 |

---

## 1. Executive Summary
A mobile-first PWA that helps solo licensed professionals track renewal deadlines, log CE hours via OCR, and receive jurisdiction-specific, automated reminders. MVP focuses on mental health counselors in 5 high-volume states to validate rule-engine accuracy, OCR reliability, and user retention before scaling to real estate, contractors, and cosmetology.

---

## 2. Problem & Data-Backed Rationale
- **Pain Point**: Solo practitioners rely on spreadsheets/calendars, leading to missed deadlines that halt income ($500–$2,000/week loss) and incur fines ($500–$10,000) [[25]].
- **Market Gap**: Enterprise tools (CE Broker, Course Counter) target clinics/agencies; no affordable, mobile-first solution for solo operators with automated CE logging and dynamic state rule updates.
- **Opportunity**: ~600K licensed mental health professionals (65% solo). High renewal cadence (1–2 years) creates predictable, high-retention SaaS behavior.

---

## 3. Target Audience & Persona
| Persona | Role | Tech Comfort | Primary Need |
|---------|------|--------------|--------------|
| **Dr. Elena M.** | Licensed Clinical Social Worker (CA) | Moderate (uses phone for admin) | "Tell me exactly what I need, when, so I don't lose income" |
| **Marcus T.** | Marriage & Family Therapist (TX) | Low-Moderate | "Scan my CE certificate and auto-track hours so I don't use spreadsheets" |

---

## 4. Scope
### ✅ In Scope (MVP)
- Mobile-first PWA with responsive UI
- User auth + license setup (profession + state + license # + expiry)
- CE certificate photo upload → Google Vision OCR → auto-extract hours/course/date
- Jurisdiction rule engine (static JSON v1, 5 states)
- Automated reminders (90/60/30/7 days) via Email + SMS
- Dashboard: license status, CE progress, next deadline, readiness score (0–100)
- Plans and Subscriptions with Payment gateway integration (Choose platform with Merchant of Record)
- Audit report generation (Web & PDF)

### ❌ Out of Scope (v1)
- Multi-state expansion beyond pilot
- CE provider API integrations
- Team/multi-user features

---

## 5. Core Features & User Stories
| ID | Feature | User Story | Acceptance Criteria |
|----|---------|------------|---------------------|
| F1 | Onboarding & License Setup | As a user, I want to enter my profession, state, license #, and expiry date so I can start tracking. | Validates state/license format; saves to DB; shows dashboard within 3 clicks. |
| F2 | CE Scanner & OCR | As a user, I want to photograph/upload a CE certificate so hours are auto-logged. | OCR extracts ≥4 fields (provider, hours, title, date); confidence score shown; manual edit fallback. |
| F3 | Jurisdiction Rule Engine | As a user, I want to see my state's exact CE requirements (core, ethics, total hours). | Rules load from JSON; UI highlights gaps vs logged hours. |
| F4 | Smart Reminders | As a user, I want SMS/email at 90/60/30/7 days with direct renewal links. | Triggers via cron; respects timezone; opt-in/opt-out compliant; logs delivery status. |
| F5 | Dashboard & Readiness Score | As a user, I want a visual timeline + compliance score so I know my renewal health. | Score updates in real-time; color-coded status (Green/Yellow/Red); exportable summary. |

---

## 6. Technical Architecture & Stack
| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Frontend** | Next.js 14 (App Router) + Tailwind CSS + PWA manifest | Mobile-first, fast deploy, offline-capable shell |
| **Backend** | Next.js API Routes + Server Actions | Unified codebase, reduced infra complexity |
| **Database & Auth** | Supabase (PostgreSQL + Auth + Storage) | RLS, row-level security, built-in auth, cheap scaling |
| **OCR** | Google Cloud Vision API (Document Text Detection) | 95%+ accuracy on certificates, pay-per-use |
| **Notifications** | Resend (Email) + Twilio (SMS) + Vercel Cron | Reliable delivery, serverless scheduling |
| **Hosting** | Vercel | CI/CD, edge functions, cron, analytics |

---

## 7. Data Model (Supabase)
```sql
users (id, email, created_at, phone, timezone, opt_in_sms)
licenses (id, user_id, profession, state, license_number, expiry_date, status, required_hours_total, required_hours_ethics)
ce_credits (id, user_id, license_id, provider_name, course_title, hours, category, completion_date, ocr_confidence, image_url)
reminders (id, user_id, license_id, trigger_days, sent_at, channel, status)
state_rules (id, state, profession_json, last_updated)
```
- **Security**: All tables enable RLS. Users can only access their own rows. License numbers encrypted at rest via Supabase Vault or column-level encryption.

---

## 8. UX/UI Guidelines
- **Layout**: Single-column mobile-first, thumb-friendly CTAs, bottom nav (Dashboard, Add CE, Reminders, Settings)
- **States**: Loading skeletons, OCR confidence badges, error fallbacks with manual edit
- **Accessibility**: WCAG 2.1 AA, high contrast, screen-reader labels
- **Branding**: Clean, clinical/trustworthy palette (navy/white/teal), professional typography

---

## 9. Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| OCR misreads fields | High confidence drop | Manual edit fallback + confidence threshold (<70% triggers review) |
| State rule changes | Compliance inaccuracy | Quarterly manual audit + user flagging UI (stored in DB for v2) |
| SMS costs scale | Budget overrun | Email-first default; SMS opt-in; usage caps in v1 |
| Data privacy concerns | Trust/churn | Explicit privacy policy, RLS, no data resale, encryption at rest |
