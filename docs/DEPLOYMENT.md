# DigiFlow Deployment Guide

## Prerequisites

- Node.js >= 18
- pnpm >= 9
- Firebase CLI (`npm install -g firebase-tools`)
- Vercel CLI (`npm install -g vercel`)
- A Firebase project (create at console.firebase.google.com)
- A Vercel account (vercel.com)
- A Resend account (resend.com)
- A Gemini API key (aistudio.google.com)
- A Sentry account (sentry.io)

## Environment Setup

### 1. Firebase Project

```bash
firebase login
firebase projects:list
firebase use <project-id>
```

### 2. Vercel Projects

Create two Vercel projects:
- `digiflow-web` — Main application
- `digiflow-admin` — Admin panel

### 3. Resend

```bash
# Verify domain
# Create API key
# Add to environment variables
```

### 4. Environment Variables

Copy `.env.example` and fill in all values:

```bash
cp apps/web/.env.example apps/web/.env.local
cp apps/admin/.env.example apps/admin/.env.local
cp functions/.env.yaml.example functions/.env.yaml
```

## Local Development

```bash
# Start all apps
pnpm dev

# Start Firebase emulators
cd functions && npm run serve

# Web app: http://localhost:3000
# Admin app: http://localhost:3001
# Emulator UI: http://localhost:4000
```

## Production Deployment

### Deploy Firebase

```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage:rules

# Deploy Cloud Functions
cd functions && npm run deploy
```

### Deploy Web App (Vercel)

```bash
cd apps/web
vercel --prod
```

### Deploy Admin Panel (Vercel)

```bash
cd apps/admin
vercel --prod --env NEXT_PUBLIC_ADMIN_URL=https://admin.yourdomain.com
```

### Deploy Docker Containers (Cloud Run)

```bash
# PDF Converter
gcloud builds submit --tag gcr.io/$PROJECT_ID/pdf-converter docker/pdf-converter/
gcloud run deploy pdf-converter --image gcr.io/$PROJECT_ID/pdf-converter

# Virus Scanner
gcloud builds submit --tag gcr.io/$PROJECT_ID/virus-scanner docker/virus-scanner/
gcloud run deploy virus-scanner --image gcr.io/$PROJECT_ID/virus-scanner
```

## Domain Setup

- Main app: `digiflow.com` → Vercel
- Admin panel: `admin.digiflow.com` → Vercel (separate project)
- Email: `noreply@digiflow.com` → Resend

## Monitoring

- **Sentry**: Error tracking for both frontend and backend
- **Firebase Analytics**: User behavior tracking
- **GA4**: Marketing and acquisition analytics
- **Firebase Crashlytics**: Mobile crash reporting (future)

## Backup & Recovery

- Daily automated Firestore exports to separate GCP project
- 90-day retention for backups
- One-click restore from admin panel
- Storage files backed up with Firestore exports
