# DigiFlow API Documentation

## Overview

DigiFlow uses a hybrid approach:
- **Firebase Client SDKs** for direct Firestore reads (documents, notifications)
- **Firebase Callable Functions** for sensitive operations (workflow, auth, AI)
- **REST API routes** under Next.js `/api/*` for server-side operations
- **Webhooks** for external service integration (Resend, Gemini)

## Authentication

All API calls (except login/register) require a valid Firebase Auth token:

```http
Authorization: Bearer <firebase-auth-token>
```

## Rate Limits

| Endpoint | Limit | Window |
|---|---|---|
| Auth endpoints | 5 req | 15 min |
| Document CRUD | 100 req | 1 min |
| File upload | 10 files | 1 hour |
| AI Chat | 30 req | 1 min |
| Approval actions | 30 req | 1 min |

## Callable Functions

### `startWorkflow`
Initiates the approval workflow for a document.

```typescript
// Request
{
  documentId: string;
  recommenders: Array<{ uid: string; name: string; email: string }>;
  approver: { uid: string; name: string; email: string };
}

// Response
{
  success: boolean;
  workflowId: string;
  currentStep: number;
}
```

### `approveAction`
Process a recommend/approve/return action.

```typescript
// Request
{
  documentId: string;
  action: 'recommend' | 'approve' | 'return';
  comment?: string;
  token?: string; // For one-click email approval
}

// Response
{
  success: boolean;
  nextStep: number | null;
  status: 'in_progress' | 'approved' | 'returned';
}
```

### `aiChat`
Send a message to the AI chatbot.

```typescript
// Request
{
  message: string;
  documentId?: string;
  locale: 'en' | 'ne';
}

// Response
{
  message: string;
  documents?: Array<{ id: string; name: string; status: string; serialNumber: string }>;
  suggestions?: string[];
}
```

### `aiAutoFill`
Extract metadata from an uploaded document.

```typescript
// Request
{
  documentId: string;
}

// Response
{
  name: string;
  documentType: string;
  description: string;
  department: string | null;
  fiscalYear: string;
  confidence: number;
  warnings: string[];
}
```

## Webhooks

### `POST /api/webhooks/resend`
Receives email delivery events from Resend (opens, clicks, bounces).

### `POST /api/webhooks/gemini`
Receives async callbacks from Gemini (future use).
