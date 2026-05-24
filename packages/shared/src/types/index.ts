export interface Company {
  id: string;
  name: string;
  code: string;
  branding: {
    primaryColor: string;
    logo: string;
    documentPrefix: string;
  };
  divisions: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'viewer' | 'creator' | 'hod' | 'recommender' | 'approver' | 'admin';

export interface User {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  company: string;
  department: string;
  division: string;
  manager: string | null;
  designation: string;
  phone: string;
  language: 'en' | 'ne';
  isActive: boolean;
  lastLogin: Date | null;
  mfaEnabled: boolean;
  deviceFingerprint: string[];
  delegatedTo: Delegation | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Delegation {
  uid: string;
  name: string;
  startDate: Date;
  endDate: Date;
}

export type DocumentStatus = 'draft' | 'in_progress' | 'approved' | 'returned';

export interface Document {
  id: string;
  serialNumber: string;
  name: string;
  description: string;
  status: DocumentStatus;
  isConfidential: boolean;

  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  supportingDocs: SupportingDoc[];

  version: number;
  previousVersions: DocumentVersion[];

  company: string;
  division: string;
  department: string;
  documentType: string;
  fiscalYear: string;

  recommenders: Recommender[];
  approver: Approver;
  currentAssignedTo: WorkflowAssignment;
  currentStep: number;
  totalSteps: number;

  aiSummary: string | null;
  aiAutoTag: string | null;
  aiSuggestedRouting: string[] | null;
  aiPriority: 'high' | 'medium' | 'low' | null;
  aiPriorityScore: number | null;
  aiAutoFill: AutoFillSuggestion | null;
  aiComplianceFlags: ComplianceFlag[];
  aiExtractedText: string | null;

  approvedFileUrl: string | null;
  digitalSignature: DigitalSignature | null;

  slaDeadline: Date | null;
  slaBreached: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export interface SupportingDoc {
  name: string;
  url: string;
  size: number;
  uploadedAt: Date;
}

export interface DocumentVersion {
  version: number;
  fileUrl: string;
  changes: string;
  createdAt: Date;
  createdBy: string;
}

export interface Recommender {
  uid: string;
  name: string;
  email: string;
  order: number;
  status: 'pending' | 'recommended' | 'returned';
  respondedAt: Date | null;
  comment: string | null;
}

export interface Approver {
  uid: string;
  name: string;
  email: string;
  status: 'pending' | 'approved' | 'returned';
  respondedAt: Date | null;
  comment: string | null;
}

export interface WorkflowAssignment {
  uid: string;
  name: string;
  role: 'recommender' | 'approver';
}

export interface AutoFillSuggestion {
  suggestedName: string;
  suggestedDocumentType: string;
  suggestedDescription: string;
  suggestedDepartment: string;
  suggestedFiscalYear: string;
  confidence: number;
  warnings: string[];
  accepted: boolean | null;
  filledAt: Date;
}

export interface ComplianceFlag {
  rule: string;
  severity: 'warning' | 'blocker';
  message: string;
  resolved: boolean;
}

export interface DigitalSignature {
  data: string;
  signedAt: Date;
  ipAddress: string;
}

export interface Comment {
  id: string;
  documentId: string;
  userId: string;
  userName: string;
  text: string;
  step: number;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'email' | 'push' | 'in_app';
  title: string;
  body: string;
  documentId: string | null;
  actionUrl: string | null;
  isRead: boolean;
  createdAt: Date;
}

export interface AuditLog {
  id: string;
  action: string;
  userId: string;
  userName: string;
  documentId: string | null;
  ipAddress: string;
  userAgent: string;
  device: string;
  beforeState: Record<string, unknown> | null;
  afterState: Record<string, unknown> | null;
  timestamp: Date;
}

export interface RoutingRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  priority: number;
  conditions: RuleConditions;
  actions: RuleAction[];
  lastTriggeredAt: Date | null;
  triggerCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface RuleConditions {
  operator: 'AND' | 'OR';
  rules: Condition[];
}

export interface Condition {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'in' | 'is_true';
  value: string | number | boolean | string[];
}

export interface RuleAction {
  type:
    | 'add_recommender'
    | 'add_approver'
    | 'remove_recommender'
    | 'skip_step'
    | 'set_confidential'
    | 'set_priority'
    | 'notify'
    | 'block';
  params: Record<string, unknown>;
}

export interface WorkflowConfig {
  id: string;
  company: string;
  documentType: string;
  slaDays: number;
  requiresSignatures: number;
  escalationRules: {
    afterHours: number;
    notifyManager: boolean;
    notifyAdmin: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface AIFeedback {
  id: string;
  documentId: string;
  featureType: 'classification' | 'extraction' | 'summary' | 'routing' | 'chat';
  aiOutput: unknown;
  userCorrection: unknown;
  accepted: boolean;
  timestamp: Date;
}
