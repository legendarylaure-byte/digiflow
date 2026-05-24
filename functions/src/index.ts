import * as functions from 'firebase-functions';
import { db, storage } from './utils/firebase';
import { checkRateLimit } from './security/rate-limiter';
import { logAuditEntry } from './security/audit-logger';
import { approveActionSchema, chatMessageSchema, documentCreateSchema, workflowStartSchema } from './security/sanitizer';

// ─────────────────────────────────────────────
// Document Triggers
// ─────────────────────────────────────────────

export const onDocumentCreated = functions.firestore
  .document('documents/{docId}')
  .onCreate(async (snap, context) => {
    const { default: handleDocumentCreate } = await import('./triggers/document-create');
    await handleDocumentCreate(snap, context);
  });

export const onDocumentUpdated = functions.firestore
  .document('documents/{docId}')
  .onUpdate(async (change, context) => {
    const { default: handleDocumentUpdate } = await import('./triggers/document-update');
    await handleDocumentUpdate(change, context);
  });

export const onDocumentApproved = functions.firestore
  .document('documents/{docId}')
  .onUpdate(async (change, context) => {
    const { default: handleDocumentApprove } = await import('./triggers/document-approve');
    await handleDocumentApprove(change, context);
  });

// ─────────────────────────────────────────────
// File Upload Trigger
// ─────────────────────────────────────────────

export const onFileUploaded = functions.storage
  .object()
  .onFinalize(async (object) => {
    const { default: handleFileUpload } = await import('./triggers/document-upload');
    await handleFileUpload(object);
  });

// ─────────────────────────────────────────────
// Workflow Engine
// ─────────────────────────────────────────────

export const startWorkflow = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
  }

  const rateCheck = await checkRateLimit(context.auth.uid, 'start_workflow', {
    window: 60 * 1000,
    max: 30,
  });
  if (!rateCheck.allowed) {
    throw new functions.https.HttpsError('resource-exhausted', 'Rate limit exceeded. Try again later.');
  }

  const { default: handleStartWorkflow } = await import('./workflow/engine');
  return handleStartWorkflow(data, context);
});

export const approveAction = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
  }

  const validated = approveActionSchema.parse(data);

  const rateCheck = await checkRateLimit(context.auth.uid, 'approve_action', {
    window: 60 * 1000,
    max: 30,
  });
  if (!rateCheck.allowed) {
    throw new functions.https.HttpsError('resource-exhausted', 'Rate limit exceeded. Try again later.');
  }

  const { default: handleApproveAction } = await import('./workflow/transitions');
  return handleApproveAction(validated, context);
});

// ─────────────────────────────────────────────
// AI Features
// ─────────────────────────────────────────────

export const aiChat = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
  }

  const validated = chatMessageSchema.parse(data);

  const rateCheck = await checkRateLimit(context.auth.uid, 'ai_chat', {
    window: 60 * 1000,
    max: 30,
  });
  if (!rateCheck.allowed) {
    throw new functions.https.HttpsError('resource-exhausted', 'Rate limit exceeded.');
  }

  const { default: handleChat } = await import('./ai/orchestrator');
  return handleChat(validated, context);
});

export const aiAutoFill = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
  }

  const { default: handleAutoFill } = await import('./ai/extractor');
  return handleAutoFill(data, context);
});

export const aiSummarize = functions.storage
  .object()
  .onFinalize(async (object) => {
    const { default: handleSummarize } = await import('./ai/auto-summarize');
    await handleSummarize(object);
  });

export const scheduledAnomalyDetection = functions.pubsub
  .schedule('every 1 hours')
  .onRun(async (context) => {
    const { default: handleAnomaly } = await import('./ai/anomaly-detection');
    await handleAnomaly(context);
  });

// ─────────────────────────────────────────────
// Email Notifications
// ─────────────────────────────────────────────

export const sendEmail = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
  }

  const { handleSendEmail } = await import('./email/send');
  return handleSendEmail(data, context);
});

// ─────────────────────────────────────────────
// Scheduled Tasks
// ─────────────────────────────────────────────

export const scheduledSlaCheck = functions.pubsub
  .schedule('every 6 hours')
  .onRun(async (context) => {
    const { default: handleSla } = await import('./workflow/sla');
    await handleSla(context);
  });

export const scheduledCleanup = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    const { cleanupRateLimits } = await import('./security/rate-limiter');
    await cleanupRateLimits();
  });

// ─────────────────────────────────────────────
// Resend Webhook (for email tracking)
// ─────────────────────────────────────────────

export const resendWebhook = functions.https.onRequest(async (req, res) => {
  const { default: handleResendWebhook } = await import('./email/send');
  await handleResendWebhook(req, res);
});

// ─────────────────────────────────────────────
// PDF Conversion (Cloud Run trigger)
// ─────────────────────────────────────────────

export const convertToPdf = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
  }

  const { default: handlePdfConversion } = await import('./pdf/converter');
  return handlePdfConversion(data, context);
});

// ─────────────────────────────────────────────
// Rule Engine
// ─────────────────────────────────────────────

export const evaluateRules = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
  }

  const { default: handleRuleEval } = await import('./workflow/rule-engine');
  return handleRuleEval(data, context);
});
