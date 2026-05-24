# DigiFlow Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                          USERS                                    │
│  (Browser / Mobile / Email)                                       │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                        VERCEL EDGE                                │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐     │
│  │ Auth Check    │  │ Rate Limit    │  │ i18n (en/ne)      │     │
│  │ (Middleware)  │  │ (Middleware)  │  │ Detection          │     │
│  └──────────────┘  └──────────────┘  └────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NEXT.JS APP (apps/web)                         │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Pages: Dashboard, Upload, Inbox, Chat, History, Settings  │  │
│  │  API: /api/chat, /api/documents, /api/upload               │  │
│  │  Components: shadcn/ui + Custom + AI widgets               │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                   FIREBASE BACKEND                                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────┐    │
│  │ Auth      │ │ Firestore│ │ Storage  │ │ Cloud Functions│    │
│  │ (SSO)     │ │ (DB)     │ │ (Files)  │ │ (Business      │    │
│  │           │ │          │ │          │ │  Logic)        │    │
│  └──────────┘ └──────────┘ └──────────┘ └────────────────┘    │
│                                                    │            │
│  ┌─────────────────────────────────────────────────┘            │
│  ▼                                                               │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  CLOUD FUNCTIONS                                        │     │
│  │  ├── triggers/  (Firestore + Storage event handlers)    │     │
│  │  ├── workflow/  (Engine, Transitions, Rules, SLA)      │     │
│  │  ├── email/     (Resend integration, Templates)        │     │
│  │  ├── ai/        (Gemini, Extractor, Classifier, etc.)  │     │
│  │  ├── pdf/       (LibreOffice Converter, Stamper)       │     │
│  │  ├── security/  (Rate Limiter, Sanitizer, Audit)      │     │
│  │  └── notifications/ (FCM Push, In-app)                │     │
│  └────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │ Gemini   │  │ Resend   │  │ Sentry   │  │ Cloud Run     │  │
│  │ (AI)     │  │ (Email)  │  │ (Errors) │  │ (PDF/Scan)    │  │
│  └──────────┘  └──────────┘  └──────────┘  └───────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### Document Upload → Approval Flow

```
Upload → [AI Auto-Fill] → Update Properties → Start Workflow
                                                   │
                                                   ▼
                              ┌──────────────────────────┐
                              │  Conditional Rule Engine  │
                              │  (modifies chain if rule  │
                              │   conditions are met)     │
                              └──────────┬───────────────┘
                                         ▼
                              ┌──────────────────────────┐
                              │  Recommender #1 (email)  │
                              │  [Recommend] [Return]    │
                              └──────────┬───────────────┘
                                         ▼
                              ┌──────────────────────────┐
                              │  Recommender #2 (email)  │
                              │  [Recommend] [Return]    │
                              └──────────┬───────────────┘
                                         ▼
                              ┌──────────────────────────┐
                              │  Approver (email)        │
                              │  [Approve] [Return]      │
                              └──────────┬───────────────┘
                                         ▼
                              ┌──────────────────────────┐
                              │  PDF Conversion           │
                              │  → Stamp signatures       │
                              │  → Store in /approved/   │
                              │  → Notify creator         │
                              └──────────────────────────┘
```

## Core Design Principles

1. **AI-First** — AI enhances every step: upload, routing, approval, analytics
2. **Security by Design** — Rate limiting, sanitization, audit trails from day one
3. **Multi-Tenant** — Single deployment serves multiple companies/divisions
4. **Offline-Resilient** — Firestore offline persistence, email-based actions
5. **Language-Agnostic** — English + Nepali UI, AI responds in user's language
