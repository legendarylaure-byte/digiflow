import * as functions from 'firebase-functions';
import { GoogleGenerativeAI } from '@google/generative-ai';
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

const SYSTEM_PROMPT = `You are DigiFlow AI, an intelligent assistant for a document approval workflow system. 
You help users find documents, check workflow status, explain processes, and answer questions about the system.

When asked about specific documents, search Firestore for them. 
When the user provides a documentId, you have access to that document's full details.

Keep responses concise, professional, and actionable. Include document IDs, status, and current approver when relevant.
If you don't have enough context, ask clarifying questions.
Respond in the user's locale if specified (e.g., 'ne' for Nepali).`;

export default async function handleChat(
  data: ChatMessage,
  context: functions.https.CallableContext,
): Promise<ChatResponse> {
  const { message, documentId, locale } = data;
  const apiKey = process.env.GEMINI_API_KEY;

  let documentContext = '';
  if (documentId) {
    const doc = await db.collection('documents').doc(documentId).get();
    if (doc.exists) {
      const d = doc.data()!;
      documentContext = `\nCurrent document context:\n- Name: "${d.name}"\n- Type: ${d.documentType || 'N/A'}\n- Status: ${d.status || 'draft'}\n- Department: ${d.department || 'N/A'}\n- Uploaded by: ${d.uploadedByName || 'Unknown'}\n- Description: ${d.description || 'N/A'}\n- Serial: ${d.serialNumber || 'N/A'}\n- Current approver: ${d.currentApprover || 'Not assigned'}\n- Confidential: ${d.isConfidential ? 'Yes' : 'No'}`;
    }
  }

  let searchResults = '';
  try {
    const docsSnap = await db.collection('documents')
      .orderBy('uploadedAt', 'desc')
      .limit(10)
      .get();
    if (!docsSnap.empty) {
      searchResults = '\nRecent documents in the system:\n' + docsSnap.docs.map((d) => {
        const data = d.data();
        return `- ${data.name || 'Untitled'} (${d.id}), Status: ${data.status || 'draft'}, Type: ${data.documentType || 'N/A'}`;
      }).join('\n');
    }
  } catch {}

  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

      const fullPrompt = `${SYSTEM_PROMPT}\n\n${documentContext}${searchResults}\n\nLocale: ${locale || 'en'}
      
User question: "${message}"

Respond helpfully based on the document context provided above. If the user asks about document status, policies, or workflows, use the context.`;

      const result = await model.generateContent(fullPrompt);
      const reply = result.response.text();

      const suggestedActions: string[] = [];
      if (documentId) {
        suggestedActions.push('View document details', 'Check approval status');
      }
      suggestedActions.push('Search documents', 'View dashboard');

      return { reply, sources: documentId ? [documentId] : undefined, suggestedActions };
    } catch (err) {
      functions.logger.error('Gemini API error', err);
      return {
        reply: `I encountered an error processing your request. Please try again later.\n\nRegarding: "${message}"`,
        suggestedActions: ['Try again', 'Contact support'],
      };
    }
  }

  const reply = `I'm running in development mode without a configured Gemini API key. 
  
Regarding your question: "${message}"

To enable full AI capabilities, set the GEMINI_API_KEY environment variable and redeploy.

${documentContext ? `\nDocument context loaded: ${documentContext}` : ''}`;

  return {
    reply,
    suggestedActions: documentId ? ['View document details', 'Check approval status'] : undefined,
  };
}
