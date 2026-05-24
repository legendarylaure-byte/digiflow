import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  company: z.string().min(1, 'Company is required'),
  department: z.string().min(1, 'Department is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const documentUploadSchema = z.object({
  name: z.string().min(1, 'Document name is required').max(200),
  description: z.string().max(1000).optional(),
  documentType: z.string().min(1, 'Document type is required'),
  department: z.string().min(1, 'Department is required'),
  fiscalYear: z.string().min(1, 'Fiscal year is required'),
  isConfidential: z.boolean().default(false),
  recommenders: z.array(z.object({
    uid: z.string(),
    name: z.string(),
    email: z.string().email(),
  })).min(1, 'At least one recommender is required'),
  approver: z.object({
    uid: z.string(),
    name: z.string(),
    email: z.string().email(),
  }),
});

export const updatePropertiesSchema = z.object({
  description: z.string().max(1000).optional(),
  documentType: z.string().min(1),
  fiscalYear: z.string().min(1),
  isConfidential: z.boolean(),
  company: z.string().min(1),
  department: z.string().min(1),
  recommenders: z.array(z.object({
    uid: z.string(),
    name: z.string(),
    email: z.string().email(),
  })).min(1),
  approver: z.object({
    uid: z.string(),
    name: z.string(),
    email: z.string().email(),
  }),
});

export const approveActionSchema = z.object({
  documentId: z.string(),
  token: z.string().optional(),
  comment: z.string().max(2000).optional(),
  action: z.enum(['recommend', 'approve', 'return']),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type DocumentUploadInput = z.infer<typeof documentUploadSchema>;
export type UpdatePropertiesInput = z.infer<typeof updatePropertiesSchema>;
export type ApproveActionInput = z.infer<typeof approveActionSchema>;
