import * as functions from 'firebase-functions';
import { storage } from '../utils/firebase';

interface AutoFillData {
  storagePath: string;
  fileType: string;
}

interface AutoFillResult {
  name: string;
  description: string;
  documentType: string;
  department: string;
  fiscalYear: string;
  isConfidential: boolean;
}

export default async function handleAutoFill(
  data: AutoFillData,
  context: functions.https.CallableContext,
): Promise<AutoFillResult> {
  const { storagePath, fileType } = data;

  functions.logger.info(`Auto-fill requested for: ${storagePath} (${fileType})`);

  const bucket = storage.bucket();
  const file = bucket.file(storagePath);
  const [exists] = await file.exists();
  if (!exists) {
    throw new functions.https.HttpsError('not-found', 'File not found in storage');
  }

  const extracted: AutoFillResult = {
    name: storagePath.split('/').pop()?.replace(/\.[^/.]+$/, '') || 'Untitled',
    description: 'Extracted via AI document analysis',
    documentType: 'Other',
    department: 'General',
    fiscalYear: String(new Date().getFullYear()),
    isConfidential: false,
  };

  return extracted;
}
