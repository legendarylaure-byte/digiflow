import * as functions from 'firebase-functions';
import { db, storage } from '../utils/firebase';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

interface PdfConversionData {
  sourcePath: string;
  documentId?: string;
}

export async function handlePdfConversion(
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
    await db.collection('documents').doc(documentId).update({
      pdfConversionStatus: 'completed',
      pdfPath: outputPath,
      convertedAt: new Date(),
    });
  }

  return { success: true, outputPath };
}

interface StampInput {
  documentId: string;
  approvedBy: string;
  approvedByName: string;
  approvedAt: string;
}

export async function stampApprovedPdf(
  data: StampInput,
  context: functions.https.CallableContext,
): Promise<{ success: boolean; stampedPath: string }> {
  const { documentId, approvedByName, approvedAt } = data;

  const docSnap = await db.collection('documents').doc(documentId).get();
  if (!docSnap.exists) throw new functions.https.HttpsError('not-found', 'Document not found');
  const docData = docSnap.data()!;
  const sourcePath = docData.filePath;

  if (!sourcePath) throw new functions.https.HttpsError('failed-precondition', 'Document has no file');
  if (!sourcePath.endsWith('.pdf')) {
    functions.logger.info(`Skipping stamp for non-PDF: ${sourcePath}`);
    return { success: false, stampedPath: sourcePath };
  }

  const bucket = storage.bucket();
  const sourceFile = bucket.file(sourcePath);
  const [exists] = await sourceFile.exists();
  if (!exists) throw new functions.https.HttpsError('not-found', 'Source file not found');

  const [pdfBytes] = await sourceFile.download();
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pages = pdfDoc.getPages();

  const stampText = 'APPROVED';
  const dateStr = new Date(approvedAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
  const approverText = `By: ${approvedByName}`;

  for (const page of pages) {
    const { width } = page.getSize();

    page.drawRectangle({
      x: width - 220 - 15,
      y: 30,
      width: 220,
      height: 90,
      borderColor: rgb(0.02, 0.6, 0.38),
      borderWidth: 2,
      color: rgb(1, 1, 1),
      opacity: 0.92,
    });

    page.drawRectangle({
      x: width - 220 - 15 + 2,
      y: 30 + 2,
      width: 220 - 4,
      height: 30,
      color: rgb(0.02, 0.6, 0.38),
      opacity: 0.85,
    });

    page.drawText(stampText, {
      x: width - 220 - 15 + 12,
      y: 30 + 8,
      size: 16,
      font: fontBold,
      color: rgb(1, 1, 1),
    });

    page.drawText(`Date: ${dateStr}`, {
      x: width - 220 - 15 + 12,
      y: 30 + 54,
      size: 8,
      font: fontRegular,
      color: rgb(0.1, 0.1, 0.1),
    });

    page.drawText(approverText, {
      x: width - 220 - 15 + 12,
      y: 30 + 42,
      size: 8,
      font: fontRegular,
      color: rgb(0.1, 0.1, 0.1),
    });
  }

  const stampedBytes = await pdfDoc.save();
  const stampedFileName = sourcePath.replace('uploads/', 'approved/').replace('.pdf', '-stamped.pdf');
  const stampedFile = bucket.file(stampedFileName);

  await stampedFile.save(stampedBytes, {
    metadata: {
      contentType: 'application/pdf',
      metadata: { documentId, approvedBy: data.approvedBy, approvedAt },
    },
  });

  await db.collection('documents').doc(documentId).update({
    stampedFileUrl: `https://storage.googleapis.com/${bucket.name}/${stampedFileName}`,
    stampedPath: stampedFileName,
    stampedAt: new Date(),
  });

  functions.logger.info(`Stamped PDF saved to ${stampedFileName}`);
  return { success: true, stampedPath: stampedFileName };
}
