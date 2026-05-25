'use client';

import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase/config';

interface RoutingInput {
  documentType?: string;
  department?: string;
  amount?: number;
  isConfidential?: boolean;
  description?: string;
}

interface RoutingResult {
  suggestedRoles: string[];
  explanation: string;
  suggestedApprover: string;
  priority: number;
}

export const aiSuggestRouting = httpsCallable<RoutingInput, RoutingResult>(functions, 'aiSuggestRouting');
