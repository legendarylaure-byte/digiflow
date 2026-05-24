import * as functions from 'firebase-functions';
import { db } from '../utils/firebase';
import { logAuditEntry } from '../security/audit-logger';

export default async function handleDocumentCreate(
  snap: functions.firestore.QueryDocumentSnapshot,
  _context: functions.EventContext,
): Promise<void> {
  const doc = snap.data();
  functions.logger.info(`Document created: ${snap.id}`, { name: doc.name, type: doc.documentType });

  await db.collection('documents').doc(snap.id).update({
    createdAt: new Date(),
    status: 'draft',
    serialNumber: null,
  });

  const serialNumber = `VOM-${doc.department || 'GEN'}-${String(new Date().getFullYear()).slice(-2)}-${String(snap.id).slice(0, 6).toUpperCase()}`;
  await db.collection('documents').doc(snap.id).update({ serialNumber });

  await logAuditEntry({
    action: 'document.create',
    userId: doc.uploadedBy || 'system',
    userName: doc.uploadedByName || 'System',
    documentId: snap.id,
    ipAddress: '0.0.0.0',
    userAgent: 'system',
    device: 'system',
    beforeState: null,
    afterState: { ...doc, serialNumber },
  });
}
