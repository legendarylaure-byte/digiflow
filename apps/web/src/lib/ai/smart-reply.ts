'use client';

import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase/config';

interface SmartReplyInput {
  documentId: string;
}

interface SmartReplyResult {
  approveSuggestion: string;
  returnSuggestion: string;
  recommendSuggestion: string;
  analysisPoints: string[];
}

export const aiSmartReply = httpsCallable<SmartReplyInput, SmartReplyResult>(functions, 'aiSmartReply');
