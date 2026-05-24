import * as functions from 'firebase-functions';
import { db } from '../utils/firebase';
import { logAuditEntry } from '../security/audit-logger';
import { handleSendEmail, generateApprovalEmail } from '../email/send';
import crypto from 'crypto';

interface StartWorkflowData {
  documentId: string;
  recommenders: Array<{ uid: string; name: string; email: string }>;
  approver: { uid: string; name: string; email: string };
}

export default async function handleStartWorkflow(
  data: StartWorkflowData,
  context: functions.https.CallableContext,
): Promise<{ success: boolean; workflowId: string }> {
  const { documentId, recommenders, approver } = data;
  const userId = context.auth!.uid;

  const doc = await db.collection('documents').doc(documentId).get();
  if (!doc.exists) throw new functions.https.HttpsError('not-found', 'Document not found');
  const docData = doc.data()!;

  const steps = [
    ...recommenders.map((r, i) => ({
      type: 'recommender' as const,
      userId: r.uid,
      userName: r.name,
      email: r.email,
      order: i,
      status: 'pending' as const,
      completedAt: null,
    })),
    {
      type: 'approver' as const,
      userId: approver.uid,
      userName: approver.name,
      email: approver.email,
      order: recommenders.length,
      status: 'pending' as const,
      completedAt: null,
    },
  ];

  const workflowRef = await db.collection('workflows').add({
    documentId,
    documentName: docData.name,
    status: 'in_progress',
    currentStep: 0,
    steps,
    startedBy: userId,
    startedAt: new Date(),
    slaDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  await db.collection('documents').doc(documentId).update({
    status: 'in_progress',
    workflowId: workflowRef.id,
    currentApprover: steps[0].userId,
  });

  // Generate token and send email to first approver
  const firstStep = steps[0];
  const token = crypto.randomBytes(32).toString('hex');
  const baseUrl = process.env.APP_URL || 'https://digiflow.vercel.app';

  await db.collection('action_tokens').doc(token).set({
    token,
    documentId,
    userId: firstStep.userId,
    userEmail: firstStep.email,
    action: 'approve',
    status: 'pending',
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  const approveUrl = `${baseUrl}/en/approve/${token}`;
  const returnUrl = `${baseUrl}/en/return/${token}`;

  try {
    await handleSendEmail(
      {
        to: firstStep.email,
        subject: `Approval Required: ${docData.name}`,
        html: generateApprovalEmail({
          documentName: docData.name,
          documentType: docData.documentType || 'Document',
          department: docData.department || 'General',
          uploadedBy: docData.uploadedByName || 'Unknown',
          description: docData.description || '',
          approveUrl,
          returnUrl,
        }),
      },
      context,
    );
  } catch (err) {
    functions.logger.warn('Failed to send initial email', err);
  }

  await logAuditEntry({
    action: 'workflow.start',
    userId,
    userName: context.auth?.token?.name || 'Unknown',
    documentId,
    ipAddress: context.rawRequest?.ip || '0.0.0.0',
    userAgent: context.rawRequest?.headers['user-agent'] || 'unknown',
    device: 'unknown',
    beforeState: null,
    afterState: { workflowId: workflowRef.id, steps: steps.length },
  });

  return { success: true, workflowId: workflowRef.id };
}
