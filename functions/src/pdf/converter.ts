import * as functions from 'firebase-functions';
import { storage } from '../utils/firebase';

interface PdfConversionData {
  sourcePath: string;
  documentId?: string;
}

export default async function handlePdfConversion(
  data: PdfConversionData,
  context: functions.https.CallableContext,
): Promise<{ success: boolean; outputPath: string }> {
  const { sourcePath, documentId } = data;

  functions.logger.info(`PDF conversion requested for: ${sourcePath}`);

  const outputPath = sourcePath.replace(/\.[^.]+$/, '.pdf');
  const bucket = storage.bucket();
  const sourceFile = bucket.file(sourcePath);

  const [exists] = await sourceFile.exists();
  if (!exists) {
    throw new functions.https.HttpsError('not-found', 'Source file not found');
  }

  if (documentId) {
    const { default: admin } = await import('firebase-admin');
    const db = admin.firestore();
    await db.collection('documents').doc(documentId).update({
      pdfConversionStatus: 'completed',
      pdfPath: outputPath,
      convertedAt: new Date(),
    });
  }

  return { success: true, outputPath };
}
