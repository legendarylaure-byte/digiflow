export const ROLES = [
  { value: 'viewer', label: 'Viewer' },
  { value: 'creator', label: 'Creator' },
  { value: 'hod', label: 'Head of Department' },
  { value: 'recommender', label: 'Recommender' },
  { value: 'approver', label: 'Approver' },
  { value: 'admin', label: 'Admin' },
] as const;

export const DOCUMENT_STATUSES = [
  { value: 'draft', label: 'Draft', color: '#6B7280' },
  { value: 'in_progress', label: 'In Progress', color: '#F59E0B' },
  { value: 'approved', label: 'Approved', color: '#10B981' },
  { value: 'returned', label: 'Returned', color: '#EF4444' },
] as const;

export const DOCUMENT_TYPES = [
  'Budget',
  'Policy',
  'Memo',
  'Report',
  'Invoice',
  'Contract',
  'HR',
  'Technical',
  'Other',
] as const;

export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-powerpoint',
  'image/png',
  'image/jpeg',
  'text/plain',
] as const;

export const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
export const MAX_SUPPORTING_DOCS = 10;

export const SERIAL_PREFIX = 'VOM';

export const RATE_LIMITS = {
  AUTH_LOGIN: { window: 15 * 60 * 1000, max: 5 },
  AUTH_REGISTER: { window: 60 * 60 * 1000, max: 3 },
  DOCUMENT_LIST: { window: 60 * 1000, max: 100 },
  DOCUMENT_UPLOAD: { window: 60 * 60 * 1000, max: 10 },
  CHAT: { window: 60 * 1000, max: 30 },
  APPROVE: { window: 60 * 1000, max: 30 },
} as const;

export const LOCALES = [
  { value: 'en', label: 'English', flag: '🇬🇧' },
  { value: 'ne', label: 'नेपाली', flag: '🇳🇵' },
] as const;

export const AI_FEATURES = [
  'chatbot',
  'auto_summarize',
  'auto_tag',
  'smart_routing',
  'anomaly_detection',
  'auto_fill',
  'compliance_check',
  'priority_scoring',
  'smart_reply',
  'document_comparison',
  'analytics_insights',
] as const;
