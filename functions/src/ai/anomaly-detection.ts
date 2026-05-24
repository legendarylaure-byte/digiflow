import * as functions from 'firebase-functions';
import { db } from '../utils/firebase';

export default async function handleAnomaly(context: functions.EventContext): Promise<void> {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const rapidApprovals = await db.collection('audit_logs')
    .where('action', '==', 'workflow.approve')
    .where('timestamp', '>', oneDayAgo)
    .get();

  const userActionCounts: Record<string, number> = {};
  rapidApprovals.forEach((doc) => {
    const userId = doc.data().userId;
    userActionCounts[userId] = (userActionCounts[userId] || 0) + 1;
  });

  const anomalies: Array<{ userId: string; count: number; reason: string }> = [];
  for (const [userId, count] of Object.entries(userActionCounts)) {
    if (count > 50) {
      anomalies.push({
        userId,
        count,
        reason: `Unusual approval activity: ${count} approvals in 24 hours`,
      });
    }
  }

  if (anomalies.length > 0) {
    const batch = db.batch();
    for (const anomaly of anomalies) {
      const ref = db.collection('anomaly_alerts').doc();
      batch.set(ref, {
        ...anomaly,
        detectedAt: new Date(),
        resolved: false,
      });
    }
    await batch.commit();
    functions.logger.warn(`Anomalies detected: ${anomalies.length}`, anomalies);
  } else {
    functions.logger.info('No anomalies detected');
  }
}
