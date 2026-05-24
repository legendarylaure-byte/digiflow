# DigiFlow Firestore Schema

## Collections Overview

```
companies/          → Company/division configuration
users/              → User profiles and roles
documents/          → Document records and workflow state
  └── comments/     → Threaded comments on documents
audit_logs/         → Append-only audit trail
notifications/      → Push, email, and in-app notifications
routing_rules/      → Conditional routing rules
workflow_config/    → SLA and escalation configuration
ai_feedback/        → AI correction data for model improvement
_rate_limits/       → Rate limit tracking (auto-cleaned)
```

## Detailed Schema

### `users/{uid}`

| Field | Type | Description |
|---|---|---|
| uid | string | Firebase Auth UID |
| email | string | User email |
| name | string | Full name |
| role | string | viewer, creator, hod, recommender, approver, admin |
| company | string | Company/division |
| department | string | Department name |
| division | string | Division name |
| manager | string or null | UID of manager |
| designation | string | Job title |
| phone | string | Phone number |
| language | string | 'en' or 'ne' |
| isActive | boolean | Account active status |
| lastLogin | timestamp | Last login time |
| mfaEnabled | boolean | MFA status |
| deviceFingerprint | string[] | Known device fingerprints |
| delegatedTo | map or null | Out-of-office delegation |
| createdAt | timestamp | Account creation |
| updatedAt | timestamp | Last update |

### `documents/{docId}`

See `packages/shared/src/types/index.ts` for complete Document interface.

### `audit_logs/{docId}`

| Field | Type | Constraints |
|---|---|---|
| action | string | upload, view, recommend, return, approve, download, share |
| userId | string | Actor UID |
| userName | string | Actor name |
| documentId | string or null | Related document |
| ipAddress | string | Client IP |
| userAgent | string | Browser/device |
| device | string | Device info |
| beforeState | map or null | Previous state |
| afterState | map or null | New state |
| timestamp | timestamp | Action time |

**Rules**: CREATE only. No UPDATE or DELETE. Ever.

### `routing_rules/{ruleId}`

| Field | Type | Description |
|---|---|---|
| name | string | Human-readable rule name |
| description | string | Rule purpose |
| enabled | boolean | Active/inactive |
| priority | number | Evaluation order (lower first) |
| conditions | map | Condition operator + rules array |
| actions | array | Actions to execute |
| lastTriggeredAt | timestamp or null | Last execution |
| triggerCount | number | Total trigger count |

## Indexes

Required composite indexes will be defined in `firestore.indexes.json` as needed during development.
