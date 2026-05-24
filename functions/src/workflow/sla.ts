import * as functions from 'firebase-functions';
import { db } from '../utils/firebase';

export default async function handleSla(context: functions.EventContext): Promise<void> {
  const now = new Date();
  const overdue = await db.collection('workflows')
    .where('status', '==', 'in_progress')
    .where('slaDeadline', '<', now)
    .get();

  if (overdue.empty) {
    functions.logger.info('No SLA breaches found');
    return;
  }

  const batch = db.batch();
  let count = 0;

  overdue.forEach((doc) => {
    const workflow = doc.data();
    const currentStep = workflow.steps[workflow.currentStep];
    batch.update(doc.ref, { slaBreached: true });

    if (currentStep) {
      const notifRef = db.collection('notifications').doc();
      batch.set(notifRef, {
        type: 'sla_breach',
        documentId: workflow.documentId,
        documentName: workflow.documentName,
        userId: currentStep.userId,
        message: `SLA deadline passed for "${workflow.documentName}"`,
        read: false,
        createdAt: now,
      });
    }
    count++;
  });

  await batch.commit();
  functions.logger.info(`SLA check complete: ${count} breaches found`);
}
