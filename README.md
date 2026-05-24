# DigiFlow

**AI-Powered Document Approval Workflow System**

Built for **VyomAi Cloud Pvt. Ltd.** — a SaaS platform for digitalizing document approval workflows across 300–500+ users.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Firebase Auth, Firestore, Cloud Functions, Firebase Storage |
| AI | Google Gemini API |
| Email | Resend |
| Hosting | Vercel (Web), Firebase (Backend) |
| Monitoring | Sentry |
| Analytics | Firebase Analytics + GA4 |

## Project Structure

```
digiflow/
├── apps/
│   ├── web/          # Main Next.js application
│   └── admin/        # Admin panel (separate deployment)
├── packages/
│   └── shared/       # Shared types, validations, constants
├── functions/        # Firebase Cloud Functions
├── docker/
│   ├── pdf-converter/ # LibreOffice headless PDF conversion
│   └── virus-scanner/ # ClamAV file scanning
└── docs/             # Documentation
```

## Getting Started

```bash
# Install dependencies
pnpm install

# Start development
pnpm dev

# Build for production
pnpm build
```

## Environment Variables

Copy `.env.example` to `.env.local` in each app and fill in the values.

Never commit `.env.local` files to git.

## Key Features

- **Document Upload** with AI auto-fill metadata
- **Sequential Workflow** (Recommenders → Approver)
- **One-Click Email Approval** via Resend
- **AI Chatbot** powered by Gemini
- **PDF Conversion** with digital stamps
- **Conditional Routing** engine
- **Multi-Language** (English + Nepali)
- **Out-of-Office Delegation**
- **Version Control** with diff comparison
- **Audit Trail** (append-only, tamper-proof)

## Security

- Rate limiting on all endpoints
- Firestore row-level security
- Signed URLs (15-min expiry for confidential docs)
- CSP headers, XSS protection
- Input sanitization on all inputs
- Virus scanning on upload
- MFA for admin/approver roles
- Separate admin panel with IP allowlisting

## License

Proprietary — VyomAi Cloud Pvt. Ltd.
