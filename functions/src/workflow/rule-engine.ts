import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { db } from '../utils/firebase';

interface Condition {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'in' | 'is_true';
  value: string | number | boolean | string[];
}

interface RuleConditions {
  operator: 'AND' | 'OR';
  rules: Condition[];
}

interface RuleAction {
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

interface RoutingRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  priority: number;
  conditions: RuleConditions;
  actions: RuleAction[];
  triggerCount: number;
  lastTriggeredAt: FirebaseFirestore.Timestamp | null;
}

interface RuleEvalData {
  documentId: string;
  department?: string;
  documentType?: string;
  amount?: number;
  isConfidential?: boolean;
  [key: string]: unknown;
}

export default async function handleRuleEval(
  data: RuleEvalData,
  context: functions.https.CallableContext,
): Promise<{ matched: boolean; appliedRules: string[]; actions: RuleAction[] }> {
  const rulesSnap = await db.collection('routing_rules')
    .where('enabled', '==', true)
    .orderBy('priority', 'asc')
    .get();

  if (rulesSnap.empty) {
    return { matched: false, appliedRules: [], actions: [] };
  }

  const rules: RoutingRule[] = rulesSnap.docs.map((d) => {
    const data = d.data();
    return { id: d.id, ...data } as RoutingRule;
  });

  const appliedRules: string[] = [];
  let allActions: RuleAction[] = [];

  for (const rule of rules) {
    const matched = evaluateConditions(rule.conditions, data);
    if (matched) {
      appliedRules.push(rule.id);
      allActions = [...allActions, ...rule.actions];

      await db.collection('routing_rules').doc(rule.id).update({
        lastTriggeredAt: admin.firestore.FieldValue.serverTimestamp(),
        triggerCount: admin.firestore.FieldValue.increment(1),
      });

      for (const action of rule.actions) {
        await executeAction(action, data.documentId);
      }
    }
  }

  return {
    matched: appliedRules.length > 0,
    appliedRules,
    actions: allActions,
  };
}

function evaluateConditions(conditions: RuleConditions, data: RuleEvalData): boolean {
  if (!conditions?.rules?.length) return true;

  const results = conditions.rules.map((cond) => evaluateCondition(cond, data));

  return conditions.operator === 'AND'
    ? results.every(Boolean)
    : results.some(Boolean);
}

function evaluateCondition(cond: Condition, data: RuleEvalData): boolean {
  const fieldValue = data[cond.field];

  switch (cond.operator) {
    case 'eq':
      return fieldValue === cond.value;
    case 'neq':
      return fieldValue !== cond.value;
    case 'gt':
      return typeof fieldValue === 'number' && typeof cond.value === 'number' && fieldValue > cond.value;
    case 'gte':
      return typeof fieldValue === 'number' && typeof cond.value === 'number' && fieldValue >= cond.value;
    case 'lt':
      return typeof fieldValue === 'number' && typeof cond.value === 'number' && fieldValue < cond.value;
    case 'lte':
      return typeof fieldValue === 'number' && typeof cond.value === 'number' && fieldValue <= cond.value;
    case 'contains':
      return typeof fieldValue === 'string' && typeof cond.value === 'string' && fieldValue.includes(cond.value);
    case 'in':
      return Array.isArray(cond.value) && cond.value.includes(fieldValue as never);
    case 'is_true':
      return fieldValue === true;
    default:
      return false;
  }
}

async function executeAction(action: RuleAction, documentId: string): Promise<void> {
  switch (action.type) {
    case 'add_recommender':
    case 'add_approver': {
      const params = action.params as Record<string, unknown>;
      const { targetUserId, stepOrder } = params;
      if (targetUserId && typeof targetUserId === 'string') {
        const assignment: Record<string, unknown> = {
          uid: targetUserId,
          role: action.type === 'add_recommender' ? 'recommender' : 'approver',
          order: typeof stepOrder === 'number' ? stepOrder : 1,
          status: 'pending',
          respondedAt: null,
          comment: null,
        };
        await db.collection('documents').doc(documentId).update({
          [action.type === 'add_recommender' ? 'recommenders' : 'approvers']: admin.firestore.FieldValue.arrayUnion(assignment),
        });
      }
      break;
    }
    case 'remove_recommender': {
      const params = action.params as Record<string, unknown>;
      const { targetUserId } = params;
      if (typeof targetUserId === 'string') {
        const docRef = await db.collection('documents').doc(documentId).get();
        const docData = docRef.data();
        const recommenders: Record<string, unknown>[] = docData?.recommenders || [];
        const filtered = recommenders.filter((r) => r.uid !== targetUserId);
        await db.collection('documents').doc(documentId).update({ recommenders: filtered });
      }
      break;
    }
    case 'set_priority': {
      const { priority } = action.params as Record<string, unknown>;
      if (typeof priority === 'number') {
        await db.collection('documents').doc(documentId).update({ priority });
      }
      break;
    }
    case 'set_confidential': {
      const { enabled } = action.params as Record<string, unknown>;
      await db.collection('documents').doc(documentId).update({ isConfidential: enabled === true });
      break;
    }
    case 'skip_step': {
      const { stepName } = action.params as Record<string, unknown>;
      if (typeof stepName === 'string') {
        await db.collection('documents').doc(documentId).update({
          skippedSteps: admin.firestore.FieldValue.arrayUnion(stepName),
        });
      }
      break;
    }
    case 'block': {
      const { reason } = action.params as Record<string, unknown>;
      await db.collection('documents').doc(documentId).update({
        blocked: true,
        blockReason: typeof reason === 'string' ? reason : 'Blocked by routing rule',
      });
      break;
    }
    default:
      break;
  }
}
