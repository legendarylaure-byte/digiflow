export function approvalRequestEmail(params: {
  documentName: string;
  documentType: string;
  department: string;
  uploadedBy: string;
  description: string;
  approveUrl: string;
  returnUrl: string;
  locale: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; margin: 40px auto;">
    <tr><td style="background: linear-gradient(135deg, #7C3FED, #5B21B6); padding: 32px 24px; text-align: center; border-radius: 12px 12px 0 0;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Document Approval Request</h1>
    </td></tr>
    <tr><td style="background: #ffffff; padding: 32px 24px; border-left: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb;">
      <p style="color: #374151; font-size: 16px; margin: 0 0 20px;">A document requires your approval:</p>

      <table width="100%" cellpadding="8" style="margin-bottom: 24px;">
        <tr><td style="color: #6b7280; font-size: 14px; width: 120px;">Document</td><td style="color: #111827; font-size: 14px; font-weight: 600;">${params.documentName}</td></tr>
        <tr><td style="color: #6b7280; font-size: 14px;">Type</td><td style="color: #111827; font-size: 14px;">${params.documentType}</td></tr>
        <tr><td style="color: #6b7280; font-size: 14px;">Department</td><td style="color: #111827; font-size: 14px;">${params.department}</td></tr>
        <tr><td style="color: #6b7280; font-size: 14px;">Uploaded by</td><td style="color: #111827; font-size: 14px;">${params.uploadedBy}</td></tr>
        ${params.description ? `<tr><td style="color: #6b7280; font-size: 14px;">Description</td><td style="color: #111827; font-size: 14px;">${params.description}</td></tr>` : ''}
      </table>

      <div style="text-align: center;">
        <a href="${params.approveUrl}" style="display: inline-block; background: #059669; color: #ffffff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: 600; margin: 4px;">Approve</a>
        <a href="${params.returnUrl}" style="display: inline-block; background: #dc2626; color: #ffffff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: 600; margin: 4px;">Return</a>
      </div>

      <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 24px;">This link expires in 7 days. If you did not expect this email, please ignore it.</p>
    </td></tr>
    <tr><td style="background: #f9fafb; padding: 16px 24px; text-align: center; border: 1px solid #e5e7eb; border-radius: 0 0 12px 12px;">
      <p style="color: #9ca3af; font-size: 12px; margin: 0;">DigiFlow &middot; AI-Powered Document Approval</p>
    </td></tr>
  </table>
</body>
</html>`;
}

export function approvalConfirmationEmail(params: {
  documentName: string;
  action: 'approved' | 'returned';
  actionBy: string;
  locale: string;
}): string {
  const color = params.action === 'approved' ? '#059669' : '#dc2626';
  const title = params.action === 'approved' ? 'Document Approved' : 'Document Returned';
  const icon = params.action === 'approved' ? '✅' : '↩️';

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; margin: 40px auto;">
    <tr><td style="background: ${color}; padding: 32px 24px; text-align: center; border-radius: 12px 12px 0 0;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px;">${icon} ${title}</h1>
    </td></tr>
    <tr><td style="background: #ffffff; padding: 32px 24px; border-left: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb;">
      <p style="color: #374151; font-size: 16px; margin: 0 0 12px;">"${params.documentName}" has been <strong style="color: ${color};">${params.action}</strong> by ${params.actionBy}.</p>
      <p style="color: #9ca3af; font-size: 14px;">You can check the document status in your dashboard.</p>
    </td></tr>
    <tr><td style="background: #f9fafb; padding: 16px 24px; text-align: center; border: 1px solid #e5e7eb; border-radius: 0 0 12px 12px;">
      <p style="color: #9ca3af; font-size: 12px; margin: 0;">DigiFlow &middot; AI-Powered Document Approval</p>
    </td></tr>
  </table>
</body>
</html>`;
}
