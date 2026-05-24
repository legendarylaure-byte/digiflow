import * as functions from 'firebase-functions';
import { db } from '../utils/firebase';

interface RuleEvalData {
  documentId: string;
  department?: string;
  documentType?: string;
  amount?: number;
  isConfidential?: boolean;
}

interface RoutingRule {
  id: string;
  conditions: Array<{ field: string; operator: string; value: string | number | boolean }>;
  action: 'route' | 'approve' | 'return';
  targetUserId?: string;
  targetRole?: string;
  priority: number;
}

export default async function handleRuleEval(
  data: RuleEvalData,
  context: functions.https.CallableContext,
): Promise<{ matched: boolean; appliedRules: string[]; recommendedAction: string | null }> {
  const rulesSnap = await db.collection('routing_rules')
    .where('active', '==', true)
    .orderBy('priority', 'asc')
    .get();

  if (rulesSnap.empty) {
    return { matched: false, appliedRules: [], recommendedAction: null };
  }

  const rules: RoutingRule[] = rulesSnap.docs.map((d) => ({ id: d.id, ...d.data() } as RoutingRule));
  const appliedRules: string[] = [];
  let recommendedAction: string | null = null;

  for (const rule of rules) {
    const allConditionsMet = rule.conditions.every((condition) => {
      const fieldValue = (data as any)[condition.field];
      switch (condition.operator) {
        case 'equals': return fieldValue === condition.value;
        case 'not_equals': return fieldValue !== condition.value;
        case 'contains': return typeof fieldValue === 'string' && fieldValue.includes(String(condition.value));
        case 'greater_than': return typeof fieldValue === 'number' && fieldValue > Number(condition.value);
        case 'less_than': return typeof fieldValue === 'number' && fieldValue < Number(condition.value);
        default: return false;
      }
    });

    if (allConditionsMet) {
      appliedRules.push(rule.id);
      recommendedAction = rule.action;

      // Apply the rule action
      if (rule.action === 'route' && rule.targetUserId) {
        await db.collection('documents').doc(data.documentId).update({
          currentApprover: rule.targetUserId,
          routingRuleApplied: rule.id,
        });
      }
    }
  }

  return {
    matched: appliedRules.length > 0,
    appliedRules,
    recommendedAction,
  };
}
