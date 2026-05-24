import * as functions from 'firebase-functions';
import { db } from '../utils/firebase';
import { logAuditEntry } from '../security/audit-logger';
import { handleSendEmail, generateApprovalEmail } from '../email/send';
import crypto from 'crypto';

interface ApproveActionInput {
  documentId: string;
  userId: string;
  action: 'recommend' | 'approve' | 'return';
  comment: string;
  token?: string;
}

export default async function handleApproveAction(
  data: ApproveActionInput,
  context: functions.https.CallableContext,
): Promise<{ success: boolean; nextStatus: string }> {
  const { documentId, userId, action, comment } = data;

  const docRef = db.collection('documents').doc(documentId);
  const doc = await docRef.get();
  if (!doc.exists) throw new functions.https.HttpsError('not-found', 'Document not found');

  const workflowRef = db.collection('workflows').doc(doc.data()?.workflowId);
  const workflow = await workflowRef.get();
  if (!workflow.exists) throw new functions.https.HttpsError('not-found', 'Workflow not found');

  const workflowData = workflow.data()!;
  const currentStepIndex = workflowData.currentStep;
  const steps = workflowData.steps;

  if (steps[currentStepIndex]?.userId !== userId) {
    throw new functions.https.HttpsError('permission-denied', 'Not your turn in the workflow');
  }

  if (action === 'return') {
    await docRef.update({
      status: 'returned',
      returnedBy: userId,
      returnComment: comment,
      returnedAt: new Date(),
    });
    await workflowRef.update({
      status: 'returned',
      [`steps.${currentStepIndex}.status`]: 'returned',
      [`steps.${currentStepIndex}.completedAt`]: new Date(),
      [`steps.${currentStepIndex}.comment`]: comment,
    });
    return { success: true, nextStatus: 'returned' };
  }

  const isLastStep = currentStepIndex >= steps.length - 1;

  if (isLastStep) {
    await docRef.update({
      status: 'approved',
      approvedBy: userId,
      approvedByName: context.auth?.token?.name || 'Unknown',
      approvedAt: new Date(),
      approvedComment: comment,
      nextApprover: null,
    });
    await workflowRef.update({
      status: 'completed',
      [`steps.${currentStepIndex}.status`]: 'approved',
      [`steps.${currentStepIndex}.completedAt`]: new Date(),
      [`steps.${currentStepIndex}.comment`]: comment,
    });
  } else {
    const nextStep = currentStepIndex + 1;
    const nextUserId = steps[nextStep].userId;
    const nextStepData = steps[nextStep];
    const token = crypto.randomBytes(32).toString('hex');
    const baseUrl = process.env.APP_URL || 'https://digiflow.vercel.app';

    await db.collection('action_tokens').doc(token).set({
      token,
      documentId,
      userId: nextStepData.userId,
      userEmail: nextStepData.email,
      action: 'approve',
      status: 'pending',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    try {
      await handleSendEmail(
        {
          to: nextStepData.email,
          subject: `Approval Required: ${doc.data()?.name}`,
          html: generateApprovalEmail({
            documentName: doc.data()?.name || 'Document',
            documentType: doc.data()?.documentType || 'Document',
            department: doc.data()?.department || 'General',
            uploadedBy: doc.data()?.uploadedByName || 'Unknown',
            description: doc.data()?.description || '',
            approveUrl: `${baseUrl}/en/approve/${token}`,
            returnUrl: `${baseUrl}/en/return/${token}`,
          }),
        },
        context,
      );
    } catch (err) {
      functions.logger.warn('Failed to send email to next approver', err);
    }

    await docRef.update({
      status: 'in_progress',
      currentApprover: nextUserId,
    });
    await workflowRef.update({
      currentStep: nextStep,
      [`steps.${currentStepIndex}.status`]: 'recommended',
      [`steps.${currentStepIndex}.completedAt`]: new Date(),
      [`steps.${currentStepIndex}.comment`]: comment,
    });
  }

  await logAuditEntry({
    action: `workflow.${action}`,
    userId,
    userName: context.auth?.token?.name || 'Unknown',
    documentId,
    ipAddress: context.rawRequest?.ip || '0.0.0.0',
    userAgent: context.rawRequest?.headers['user-agent'] || 'unknown',
    device: 'unknown',
    beforeState: doc.data() as Record<string, unknown> | null,
    afterState: { status: isLastStep ? 'approved' : 'forwarded' },
  });

  return { success: true, nextStatus: isLastStep ? 'approved' : 'forwarded' };
}
