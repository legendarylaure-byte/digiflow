import * as functions from 'firebase-functions';
import { logAuditEntry } from '../security/audit-logger';

export default async function handleDocumentUpdate(
  change: functions.Change<functions.firestore.QueryDocumentSnapshot>,
  _context: functions.EventContext,
): Promise<void> {
  const before = change.before.data();
  const after = change.after.data();

  if (before.status !== after.status) {
    functions.logger.info(`Document status changed: ${change.after.id} (${before.status} → ${after.status})`);
  }

  await logAuditEntry({
    action: 'document.update',
    userId: after.updatedBy || 'system',
    userName: after.updatedByName || 'System',
    documentId: change.after.id,
    ipAddress: '0.0.0.0',
    userAgent: 'system',
    device: 'system',
    beforeState: before,
    afterState: after,
  });
}
