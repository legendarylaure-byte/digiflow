import * as functions from 'firebase-functions';
import { db } from '../utils/firebase';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

interface SmartReplyInput {
  documentId: string;
}

interface SmartReplyResult {
  approveSuggestion: string;
  returnSuggestion: string;
  recommendSuggestion: string;
  analysisPoints: string[];
}

export default async function handleSmartReply(
  data: SmartReplyInput,
  context: functions.https.CallableContext,
): Promise<SmartReplyResult> {
  const { documentId } = data;
  if (!documentId) {
    throw new functions.https.HttpsError('invalid-argument', 'documentId is required');
  }

  const docSnap = await db.collection('documents').doc(documentId).get();
  if (!docSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Document not found');
  }

  const doc = docSnap.data()!;

  const prompt = `You are an AI assistant helping a reviewer evaluate a document in a workflow approval system.

Document Information:
- Name: ${doc.name || 'N/A'}
- Type: ${doc.documentType || 'N/A'}
- Department: ${doc.department || 'N/A'}
- Description: ${doc.description || 'N/A'}
- Amount: ${doc.amount || 'N/A'}
- Priority: ${doc.priority || 'N/A'}
- Tags: ${doc.tags?.join(', ') || 'N/A'}

Based on this document, generate three professional review comments (1-2 sentences each) in this exact JSON format:
{
  "recommendSuggestion": "A comment recommending approval with reasoning",
  "approveSuggestion": "A comment fully approving the document",
  "returnSuggestion": "A constructive comment explaining why it should be returned",
  "analysisPoints": ["Key point 1", "Key point 2", "Key point 3"]
}

Make suggestions specific to the document details provided. Return ONLY valid JSON, no markdown.`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleaned = text.replace(/```(?:json)?\n?/g, '').trim();
    const parsed: SmartReplyResult = JSON.parse(cleaned);
    return parsed;
  } catch (err) {
    functions.logger.error('Smart reply generation failed', err);
    return {
      recommendSuggestion: 'Based on the document content, this appears to be a standard request that meets requirements.',
      approveSuggestion: 'The document is complete and meets all necessary criteria for approval.',
      returnSuggestion: 'Please review the document details carefully and consider providing additional clarification or supporting information before approval.',
      analysisPoints: ['Verify document completeness', 'Check for required signatures', 'Confirm department alignment'],
    };
  }
}
