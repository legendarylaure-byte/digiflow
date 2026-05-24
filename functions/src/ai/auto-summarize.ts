import * as functions from 'firebase-functions';
import { db } from '../utils/firebase';

import type { ObjectMetadata } from 'firebase-functions/v1/storage';

type StorageObject = ObjectMetadata;

export default async function handleSummarize(object: StorageObject): Promise<void> {
  if (!object.name) return;

  const documentId = object.metadata?.documentId;
  if (!documentId) {
    functions.logger.info('No documentId in metadata, skipping summarization');
    return;
  }

  functions.logger.info(`Summarizing document: ${documentId} (${object.name})`);

  const fileSize = Number(object.size) || 0;
  const summary = `Auto-generated summary of ${object.name}. Document type: ${object.contentType}, size: ${fileSize / 1024} KB.`;

  await db.collection('documents').doc(documentId).update({
    aiSummary: summary,
    summarizedAt: new Date(),
  });
}
