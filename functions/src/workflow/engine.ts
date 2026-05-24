import * as functions from 'firebase-functions';
import { db } from '../utils/firebase';
import { logAuditEntry } from '../security/audit-logger';

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

  const workflowRef = await db.collection('workflows').add({
    documentId,
    documentName: doc.data()?.name,
    status: 'in_progress',
    currentStep: 0,
    steps: [
      ...recommenders.map((r, i) => ({
        type: 'recommender',
        userId: r.uid,
        userName: r.name,
        email: r.email,
        order: i,
        status: 'pending',
        completedAt: null,
      })),
      {
        type: 'approver',
        userId: approver.uid,
        userName: approver.name,
        email: approver.email,
        order: recommenders.length,
        status: 'pending',
        completedAt: null,
      },
    ],
    startedBy: userId,
    startedAt: new Date(),
    slaDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  await db.collection('documents').doc(documentId).update({
    status: 'in_progress',
    workflowId: workflowRef.id,
    currentApprover: recommenders[0]?.uid || approver.uid,
  });

  await logAuditEntry({
    action: 'workflow.start',
    userId,
    userName: context.auth?.token?.name || 'Unknown',
    documentId,
    ipAddress: context.rawRequest?.ip || '0.0.0.0',
    userAgent: context.rawRequest?.headers['user-agent'] || 'unknown',
    device: 'unknown',
    beforeState: null,
    afterState: { workflowId: workflowRef.id, recommenders, approver },
  });

  return { success: true, workflowId: workflowRef.id };
}
