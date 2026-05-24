import * as functions from 'firebase-functions';

interface EmailData {
  to: string;
  subject: string;
  html: string;
  documentId?: string;
  token?: string;
}

export async function handleSendEmail(
  data: EmailData,
  context: functions.https.CallableContext,
): Promise<{ success: boolean; messageId?: string }> {
  const { to, subject, html } = data;

  functions.logger.info(`Sending email to ${to}: "${subject}"`);

  // Resend integration placeholder
  functions.logger.info(`Email queued for ${to}: ${subject}`);

  return { success: true, messageId: `placeholder-${Date.now()}` };
}

export default async function handleResendWebhook(
  req: functions.https.Request,
  res: functions.Response,
): Promise<void> {
  const payload = req.body;
  functions.logger.info('Resend webhook received', payload);

  res.status(200).json({ received: true });
}
