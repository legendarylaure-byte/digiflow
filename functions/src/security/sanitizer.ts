// Zod-based input sanitization for Cloud Functions
import { z } from 'zod';

export const documentCreateSchema = z.object({
  name: z.string().min(1).max(200).transform((s) => s.trim()),
  description: z.string().max(1000).optional().default('').transform((s) => s.trim()),
  documentType: z.string().min(1).max(100),
  department: z.string().min(1).max(100),
  fiscalYear: z.string().min(1).max(20),
  isConfidential: z.boolean().default(false),
  company: z.string().min(1).max(100),
});

export const workflowStartSchema = z.object({
  documentId: z.string().min(1),
  recommenders: z.array(z.object({
    uid: z.string().min(1),
    name: z.string().min(1),
    email: z.string().email(),
  })).min(1),
  approver: z.object({
    uid: z.string().min(1),
    name: z.string().min(1),
    email: z.string().email(),
  }),
});

export const approveActionSchema = z.object({
  documentId: z.string().min(1),
  userId: z.string().min(1),
  action: z.enum(['recommend', 'approve', 'return']),
  comment: z.string().max(2000).optional().default('').transform((s) => s.trim()),
  token: z.string().optional(),
});

export const chatMessageSchema = z.object({
  message: z.string().min(1).max(2000).transform((s) => s.trim()),
  documentId: z.string().optional(),
  locale: z.enum(['en', 'ne']).default('en'),
});

export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

export function sanitizeFirestoreKey(key: string): string {
  return key.replace(/[^a-zA-Z0-9._-]/g, '_');
}
