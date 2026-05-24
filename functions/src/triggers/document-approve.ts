import * as functions from 'firebase-functions';
import { db } from '../utils/firebase';
import { logAuditEntry } from '../security/audit-logger';

export default async function handleDocumentApprove(
  change: functions.Change<functions.firestore.QueryDocumentSnapshot>,
  context: functions.EventContext,
): Promise<void> {
  const after = change.after.data();
  if (after.status !== 'approved' && after.status !== 'returned') return;

  const approverName = after.approvedByName || 'Unknown';
  const action = after.status === 'approved' ? 'document.approved' : 'document.returned';

  functions.logger.info(`Document ${action}: ${change.after.id} by ${approverName}`);

  if (after.status === 'approved' && after.nextApprover) {
    await db.collection('notifications').add({
      type: 'approval_request',
      documentId: change.after.id,
      documentName: after.name,
      userId: after.nextApprover,
      read: false,
      createdAt: new Date(),
    });
  }

  await logAuditEntry({
    action,
    userId: after.approvedBy || 'system',
    userName: approverName,
    documentId: change.after.id,
    ipAddress: '0.0.0.0',
    userAgent: 'system',
    device: 'system',
    beforeState: change.before.data() as Record<string, unknown> | null,
    afterState: after,
  });
}
