import * as functions from 'firebase-functions';
import { db } from '../utils/firebase';

interface ChatMessage {
  message: string;
  documentId?: string;
  locale?: string;
}

interface ChatResponse {
  reply: string;
  sources?: string[];
  suggestedActions?: string[];
}

export default async function handleChat(
  data: ChatMessage,
  context: functions.https.CallableContext,
): Promise<ChatResponse> {
  const { message, documentId, locale } = data;

  let documentContext = '';
  if (documentId) {
    const doc = await db.collection('documents').doc(documentId).get();
    if (doc.exists) {
      const d = doc.data()!;
      documentContext = `You are analyzing document "${d.name}" (${d.documentType}, ${d.status}). Description: ${d.description || 'N/A'}`;
    }
  }

  const reply = `[AI Response]\n\n${documentContext ? `${documentContext}\n\n` : ''}Regarding your question: "${message}"\n\nThis document approval system lets you manage, track, and approve documents through an automated workflow. For detailed AI analysis, please configure your Gemini API key in the project settings.`;

  return {
    reply,
    suggestedActions: documentId ? ['View document details', 'Check approval status', 'View audit trail'] : undefined,
  };
}
