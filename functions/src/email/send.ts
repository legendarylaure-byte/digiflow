import * as functions from 'firebase-functions';

interface EmailData {
  to: string;
  subject: string;
  html: string;
}

export async function handleSendEmail(
  data: EmailData,
  _context: functions.https.CallableContext,
): Promise<{ success: boolean; messageId?: string }> {
  const { to, subject, html } = data;
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    functions.logger.warn('RESEND_API_KEY not configured');
    return { success: false };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || 'noreply@digiflow.app',
        to,
        subject,
        html,
      }),
    });

    const result: any = await res.json();
    if (!res.ok) {
      functions.logger.error('Resend API error', result);
      return { success: false };
    }

    functions.logger.info(`Email sent to ${to}: ${result.id}`);
    return { success: true, messageId: result.id };
  } catch (error) {
    functions.logger.error('Failed to send email', error);
    return { success: false };
  }
}

export function generateApprovalEmail(params: {
  documentName: string;
  documentType: string;
  department: string;
  uploadedBy: string;
  description: string;
  approveUrl: string;
  returnUrl: string;
}): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:sans-serif;margin:0;padding:0;background:#f3f4f6;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:40px auto;">
<tr><td style="background:linear-gradient(135deg,#7C3FED,#5B21B6);padding:32px 24px;text-align:center;border-radius:12px 12px 0 0;">
<h1 style="color:#fff;margin:0;font-size:24px;">Document Approval Request</h1></td></tr>
<tr><td style="background:#fff;padding:32px 24px;border:1px solid #e5e7eb;">
<table width="100%" cellpadding="8">
<tr><td style="color:#6b7280;font-size:14px;width:120px;">Document</td>
<td style="color:#111;font-size:14px;font-weight:600;">${params.documentName}</td></tr>
<tr><td style="color:#6b7280;font-size:14px;">Type</td>
<td style="color:#111;font-size:14px;">${params.documentType}</td></tr>
<tr><td style="color:#6b7280;font-size:14px;">Department</td>
<td style="color:#111;font-size:14px;">${params.department}</td></tr>
<tr><td style="color:#6b7280;font-size:14px;">Uploaded by</td>
<td style="color:#111;font-size:14px;">${params.uploadedBy}</td></tr>
</table>
<div style="text-align:center;margin-top:24px;">
<a href="${params.approveUrl}" style="display:inline-block;background:#059669;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-size:16px;font-weight:600;margin:4px;">Approve</a>
<a href="${params.returnUrl}" style="display:inline-block;background:#dc2626;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-size:16px;font-weight:600;margin:4px;">Return</a>
</div>
<p style="color:#9ca3af;font-size:12px;text-align:center;margin-top:24px;">This link expires in 7 days.</p>
</td></tr></table></body></html>`;
}

export default async function handleResendWebhook(
  req: functions.https.Request,
  res: functions.Response,
): Promise<void> {
  const payload = req.body;
  functions.logger.info('Resend webhook received', payload);
  res.status(200).json({ received: true });
}
