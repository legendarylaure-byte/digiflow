import * as functions from 'firebase-functions';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from '../utils/firebase';

interface RoutingSuggestionInput {
  documentType?: string;
  department?: string;
  amount?: number;
  isConfidential?: boolean;
  description?: string;
}

interface RoutingSuggestionResult {
  suggestedRoles: string[];
  explanation: string;
  suggestedApprover: string;
  priority: number;
}

export default async function handleRoutingSuggestion(
  data: RoutingSuggestionInput,
  context: functions.https.CallableContext,
): Promise<RoutingSuggestionResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  const dept = data.department || 'General';
  const docType = data.documentType || 'Document';

  if (!apiKey) {
    // Fallback: assign based on document type
    const roleMap: Record<string, string[]> = {
      Budget: ['Finance Manager', 'CFO'],
      Invoice: ['Accounts Payable', 'Finance Director'],
      Contract: ['Legal Counsel', 'Contracts Manager'],
      Policy: ['HR Director', 'Compliance Officer'],
      Report: ['Department Head', 'Executive Director'],
      HR: ['HR Manager', 'HR Director'],
      Technical: ['Tech Lead', 'CTO'],
      Memo: ['Department Head'],
    };
    const roles = roleMap[docType] || ['Department Head', 'Director'];
    return {
      suggestedRoles: roles,
      explanation: `Based on "${docType}" type in "${dept}" department.`,
      suggestedApprover: roles[roles.length - 1],
      priority: data.amount && data.amount > 10000 ? 1 : data.isConfidential ? 2 : 3,
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `You are a document routing advisor. Based on the document metadata below, suggest an optimal approval routing chain.

Document details:
- Type: ${docType}
- Department: ${dept}
- Amount: ${data.amount ? `$${data.amount.toLocaleString()}` : 'Not specified'}
- Confidential: ${data.isConfidential ? 'Yes' : 'No'}
- Description: ${data.description || 'N/A'}

Respond with JSON only, no markdown:
{
  "suggestedRoles": ["role1", "role2"],
  "explanation": "brief reason for this routing",
  "suggestedApprover": "final approver role",
  "priority": 1|2|3
}

Priority: 1=urgent, 2=high, 3=normal. High amounts or confidential docs should be higher priority.
Keep roles concise (2-3 roles max).`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = JSON.parse(text.replace(/```json\n?/g, '').replace(/```\n?/g, ''));

    return {
      suggestedRoles: parsed.suggestedRoles || [],
      explanation: parsed.explanation || 'AI-generated routing suggestion',
      suggestedApprover: parsed.suggestedApprover || '',
      priority: parsed.priority || 3,
    };
  } catch (err) {
    functions.logger.error('Gemini routing error', err);
    return {
      suggestedRoles: ['Department Head'],
      explanation: 'Default routing (AI unavailable)',
      suggestedApprover: 'Department Head',
      priority: 3,
    };
  }
}
