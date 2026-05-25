export function generateWorkflowStartedEmail(params: {
  documentName: string;
  documentType: string;
  department: string;
  uploadedBy: string;
}): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:sans-serif;margin:0;padding:0;background:#f3f4f6;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:40px auto;">
<tr><td style="background:linear-gradient(135deg,#7C3FED,#5B21B6);padding:32px 24px;text-align:center;border-radius:12px 12px 0 0;">
<h1 style="color:#fff;margin:0;font-size:24px;">Workflow Started</h1></td></tr>
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
<p style="color:#6b7280;font-size:14px;text-align:center;margin-top:16px;">The document has been submitted for approval. You will be notified when it is reviewed.</p>
</td></tr></table></body></html>`;
}

export function generateApprovedEmail(params: {
  documentName: string;
  approvedBy: string;
  comment: string;
}): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:sans-serif;margin:0;padding:0;background:#f3f4f6;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:40px auto;">
<tr><td style="background:linear-gradient(135deg,#059669,#047857);padding:32px 24px;text-align:center;border-radius:12px 12px 0 0;">
<h1 style="color:#fff;margin:0;font-size:24px;">Document Approved ✓</h1></td></tr>
<tr><td style="background:#fff;padding:32px 24px;border:1px solid #e5e7eb;">
<table width="100%" cellpadding="8">
<tr><td style="color:#6b7280;font-size:14px;width:120px;">Document</td>
<td style="color:#111;font-size:14px;font-weight:600;">${params.documentName}</td></tr>
<tr><td style="color:#6b7280;font-size:14px;">Approved by</td>
<td style="color:#111;font-size:14px;">${params.approvedBy}</td></tr>
</table>
${params.comment ? `<div style="margin-top:16px;padding:12px;background:#f0fdf4;border-radius:8px;"><p style="color:#166534;font-size:14px;margin:0;"><strong>Comment:</strong> ${params.comment}</p></div>` : ''}
<p style="color:#6b7280;font-size:14px;text-align:center;margin-top:16px;">The document has been fully approved.</p>
</td></tr></table></body></html>`;
}

export function generateReturnedEmail(params: {
  documentName: string;
  returnedBy: string;
  reason: string;
}): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:sans-serif;margin:0;padding:0;background:#f3f4f6;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:40px auto;">
<tr><td style="background:linear-gradient(135deg,#dc2626,#991b1b);padding:32px 24px;text-align:center;border-radius:12px 12px 0 0;">
<h1 style="color:#fff;margin:0;font-size:24px;">Document Returned</h1></td></tr>
<tr><td style="background:#fff;padding:32px 24px;border:1px solid #e5e7eb;">
<table width="100%" cellpadding="8">
<tr><td style="color:#6b7280;font-size:14px;width:120px;">Document</td>
<td style="color:#111;font-size:14px;font-weight:600;">${params.documentName}</td></tr>
<tr><td style="color:#6b7280;font-size:14px;">Returned by</td>
<td style="color:#111;font-size:14px;">${params.returnedBy}</td></tr>
</table>
<div style="margin-top:16px;padding:12px;background:#fef2f2;border-radius:8px;">
<p style="color:#991b1b;font-size:14px;margin:0;"><strong>Reason:</strong> ${params.reason}</p></div>
<p style="color:#6b7280;font-size:14px;text-align:center;margin-top:16px;">Please review the feedback and resubmit.</p>
</td></tr></table></body></html>`;
}

export function generateReminderEmail(params: {
  documentName: string;
  assigneeName: string;
  deadline: string;
  approveUrl: string;
  returnUrl: string;
}): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:sans-serif;margin:0;padding:0;background:#f3f4f6;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:40px auto;">
<tr><td style="background:linear-gradient(135deg,#F59E0B,#D97706);padding:32px 24px;text-align:center;border-radius:12px 12px 0 0;">
<h1 style="color:#fff;margin:0;font-size:24px;">Reminder: Action Required</h1></td></tr>
<tr><td style="background:#fff;padding:32px 24px;border:1px solid #e5e7eb;">
<table width="100%" cellpadding="8">
<tr><td style="color:#6b7280;font-size:14px;width:120px;">Document</td>
<td style="color:#111;font-size:14px;font-weight:600;">${params.documentName}</td></tr>
<tr><td style="color:#6b7280;font-size:14px;">Assignee</td>
<td style="color:#111;font-size:14px;">${params.assigneeName}</td></tr>
<tr><td style="color:#6b7280;font-size:14px;">Deadline</td>
<td style="color:#111;font-size:14px;">${params.deadline}</td></tr>
</table>
<p style="color:#6b7280;font-size:14px;text-align:center;margin-top:16px;">This document is awaiting your review.</p>
<div style="text-align:center;margin-top:16px;">
<a href="${params.approveUrl}" style="display:inline-block;background:#059669;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-size:16px;font-weight:600;margin:4px;">Approve</a>
<a href="${params.returnUrl}" style="display:inline-block;background:#dc2626;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-size:16px;font-weight:600;margin:4px;">Return</a>
</div>
</td></tr></table></body></html>`;
}

export function generateEscalationEmail(params: {
  documentName: string;
  documentType: string;
  hoursOverdue: number;
  currentStep: number;
  adminUrl: string;
}): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:sans-serif;margin:0;padding:0;background:#f3f4f6;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:40px auto;">
<tr><td style="background:linear-gradient(135deg,#7C3FED,#5B21B6);padding:32px 24px;text-align:center;border-radius:12px 12px 0 0;">
<h1 style="color:#fff;margin:0;font-size:24px;">SLA Escalation</h1></td></tr>
<tr><td style="background:#fff;padding:32px 24px;border:1px solid #e5e7eb;">
<table width="100%" cellpadding="8">
<tr><td style="color:#6b7280;font-size:14px;width:140px;">Document</td>
<td style="color:#111;font-size:14px;font-weight:600;">${params.documentName}</td></tr>
<tr><td style="color:#6b7280;font-size:14px;">Type</td>
<td style="color:#111;font-size:14px;">${params.documentType}</td></tr>
<tr><td style="color:#6b7280;font-size:14px;">Overdue by</td>
<td style="color:#dc2626;font-size:14px;">${params.hoursOverdue} hours</td></tr>
<tr><td style="color:#6b7280;font-size:14px;">Current Step</td>
<td style="color:#111;font-size:14px;">${params.currentStep}</td></tr>
</table>
<p style="color:#6b7280;font-size:14px;text-align:center;margin-top:16px;">This document has exceeded its SLA deadline and requires admin attention.</p>
<div style="text-align:center;margin-top:16px;">
<a href="${params.adminUrl}" style="display:inline-block;background:#7C3FED;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-size:16px;font-weight:600;">View in Admin Panel</a>
</div>
</td></tr></table></body></html>`;
}
