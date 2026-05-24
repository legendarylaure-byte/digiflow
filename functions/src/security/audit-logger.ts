import { db } from '../utils/firebase';
import * as functions from 'firebase-functions';

export interface AuditLogEntry {
  action: string;
  userId: string;
  userName: string;
  documentId: string | null;
  ipAddress: string;
  userAgent: string;
  device: string;
  beforeState: Record<string, unknown> | null;
  afterState: Record<string, unknown> | null;
}

export async function logAuditEntry(entry: AuditLogEntry): Promise<void> {
  try {
    await db.collection('audit_logs').add({
      ...entry,
      timestamp: new Date(),
    });
  } catch (error) {
    // Never throw - audit logging must never break the main flow
    functions.logger.error('Failed to write audit log', error);
  }
}
