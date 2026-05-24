# DigiFlow Security Model

## Overview
DigiFlow is designed with a **defense-in-depth** security approach. Every layer — from the frontend to the database to infrastructure — has multiple security controls.

## Authentication & Authorization

| Control | Implementation |
|---|---|
| **Authentication** | Firebase Auth (email/password + Google SSO) |
| **MFA** | Mandatory for approver and admin roles |
| **Session Management** | 30-minute inactivity timeout (configurable per role) |
| **Device Fingerprinting** | New device logins flagged for confirmation |
| **Biometric Auth** | Firebase App Check + Face ID/Fingerprint on mobile |
| **Edge Enforcement** | Vercel Middleware checks auth on every route |

## Data Security

| Control | Implementation |
|---|---|
| **Encryption at Rest** | Firestore AES-256, Storage AES-256 (Firebase default) |
| **Encryption in Transit** | TLS 1.3 for all API calls |
| **Row-Level Security** | Firestore Security Rules enforce document-level access |
| **Confidential Documents** | Separate Storage bucket, signed URLs (15-min expiry) |
| **Signed URLs** | All file access via short-lived signed URLs |
| **Virus Scanning** | ClamAV on every file upload before storage commit |

## API & Endpoint Security

| Endpoint | Rate Limit | Auth Required |
|---|---|---|
| POST /auth/login | 5 req / 15 min per IP | No |
| POST /auth/register | 3 req / 60 min per IP | No |
| GET /documents/list | 100 req / min per user | Yes |
| POST /documents/upload | 10 files / hour per user | Yes |
| POST /api/chat | 30 req / min per user | Yes |
| POST /api/approve | 30 req / min per user | Yes |

## Firestore Security Rules

- **Audit logs**: Append-only, never deletable or updatable
- **Documents**: Users can only access documents they are part of (creator, recommender, approver)
- **Users**: Read own profile only (admin reads all)
- **Routing rules**: Admin-only access

## Environment Variables

All secrets are stored in Vercel Environment Variables or Firebase Cloud Functions `.env.yaml`:
- Firebase Admin SDK keys
- Gemini API key
- Resend API key
- Sentry DSN
- Encryption keys

**Never commit `.env.local`, `.env`, or `.env.yaml` files to git.**

## Admin Panel Security

- **Separate deployment** on different Vercel project + domain
- **IP allowlisting** — only accessible from office network or VPN
- **MFA required** for all admin accounts
- **4-Eyes Principle** — destructive operations require 2 admins to confirm
- **Full audit logging** with before/after state for every admin action

## Security Checklist

- [ ] Rate limiting on all endpoints
- [ ] No hardcoded secrets in codebase (gitleaks scan)
- [ ] All secrets in environment variables
- [ ] Input sanitization on all user inputs
- [ ] Firestore Security Rules tested
- [ ] Storage Security Rules tested
- [ ] CSP headers configured
- [ ] CORS restricted to known origins
- [ ] Firebase App Check enforced
- [ ] Session timeout configured
- [ ] MFA enforced for approver/admin
- [ ] Admin IP allowlisting
- [ ] 4-eyes principle for destructive actions
- [ ] Audit log append-only enforced
- [ ] Signed URLs for file access
- [ ] Virus scanning on upload
- [ ] npm audit passed
- [ ] OWASP Top 10 checklist completed
