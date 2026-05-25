import * as functions from 'firebase-functions';
import { db } from '../utils/firebase';

interface CreateNotificationInput {
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  documentId?: string;
  link?: string;
}

export async function createNotification(
  input: CreateNotificationInput,
): Promise<void> {
  await db.collection('notifications').add({
    ...input,
    read: false,
    createdAt: new Date(),
  });
}

export async function notifyWorkflowParticipants(params: {
  documentId: string;
  documentName: string;
  action: 'started' | 'completed' | 'returned' | 'step_completed';
  actorName: string;
  targetUserId?: string;
  stepName?: string;
}): Promise<void> {
  const { documentId, documentName, action, actorName, targetUserId, stepName } = params;

  const messages: Record<string, { title: string; message: string; type: CreateNotificationInput['type'] }> = {
    started: {
      title: 'Workflow Started',
      message: `${actorName} started workflow for "${documentName}"`,
      type: 'info',
    },
    completed: {
      title: 'Document Approved',
      message: `"${documentName}" has been fully approved`,
      type: 'success',
    },
    returned: {
      title: 'Document Returned',
      message: `${actorName} returned "${documentName}"${stepName ? ` at step "${stepName}"` : ''}`,
      type: 'warning',
    },
    step_completed: {
      title: 'Step Completed',
      message: `${actorName} completed step "${stepName || 'N/A'}" for "${documentName}"`,
      type: 'success',
    },
  };

  const msg = messages[action];
  if (!msg) return;

  if (targetUserId) {
    await createNotification({
      userId: targetUserId,
      ...msg,
      documentId,
      link: `/documents/${documentId}`,
    });
  }
}

export async function notifyAdmins(params: {
  title: string;
  message: string;
  documentId?: string;
}): Promise<void> {
  const adminSnap = await db.collection('users').where('role', '==', 'admin').get();
  const promises = adminSnap.docs.map((adminDoc) =>
    createNotification({
      userId: adminDoc.id,
      title: params.title,
      message: params.message,
      type: 'info',
      documentId: params.documentId,
      link: params.documentId ? `/documents/${params.documentId}` : undefined,
    }),
  );
  await Promise.allSettled(promises);
}
