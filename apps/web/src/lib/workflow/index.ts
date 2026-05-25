'use client';

import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase/config';

interface StartWorkflowInput {
  documentId: string;
  recommenders: Array<{ uid: string; name: string; email: string }>;
  approver: { uid: string; name: string; email: string };
}

interface ApproveActionInput {
  documentId: string;
  userId: string;
  action: 'recommend' | 'approve' | 'return';
  comment: string;
}

export const startWorkflow = httpsCallable<StartWorkflowInput, { success: boolean; workflowId: string }>(functions, 'startWorkflow');

export const approveAction = httpsCallable<ApproveActionInput, { success: boolean; nextStatus: string }>(functions, 'approveAction');
