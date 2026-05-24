import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';

export async function POST(req: NextRequest) {
  try {
    const { token, action, comment } = await req.json();
    if (!token || !action) {
      return NextResponse.json({ error: 'Missing token or action' }, { status: 400 });
    }

    const db = getAdminDb();
    const tokenRef = db.collection('action_tokens').doc(token);
    const tokenSnap = await tokenRef.get();

    if (!tokenSnap.exists) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 404 });
    }

    const tokenData = tokenSnap.data()!;
    if (tokenData.status !== 'pending') {
      return NextResponse.json({ error: 'Token already used' }, { status: 400 });
    }

    const now = new Date();
    const expiresAt = tokenData.expiresAt?.toDate?.() || new Date(tokenData.expiresAt);
    if (expiresAt < now) {
      await tokenRef.update({ status: 'expired' });
      return NextResponse.json({ error: 'Token expired' }, { status: 400 });
    }

    const documentId = tokenData.documentId;
    const userId = tokenData.userId;

    const docRef = db.collection('documents').doc(documentId);
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const docData = docSnap.data()!;
    const workflowRef = db.collection('workflows').doc(docData.workflowId);
    const workflowSnap = await workflowRef.get();
    if (!workflowSnap.exists) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    const workflowData = workflowSnap.data()!;
    const currentStep = workflowData.currentStep;
    const steps = workflowData.steps;

    if (steps?.[currentStep]?.userId !== userId) {
      return NextResponse.json({ error: 'Not your turn in the workflow' }, { status: 403 });
    }

    if (action === 'return') {
      await docRef.update({
        status: 'returned',
        returnedBy: userId,
        returnComment: comment || '',
        returnedAt: new Date(),
      });
      await workflowRef.update({
        status: 'returned',
        [`steps.${currentStep}.status`]: 'returned',
        [`steps.${currentStep}.completedAt`]: new Date(),
        [`steps.${currentStep}.comment`]: comment || '',
      });
    } else {
      const isLastStep = currentStep >= steps.length - 1;
      if (isLastStep) {
        await docRef.update({
          status: 'approved',
          approvedBy: userId,
          approvedAt: new Date(),
          approvedComment: comment || '',
          nextApprover: null,
        });
        await workflowRef.update({ status: 'completed', [`steps.${currentStep}.status`]: 'approved', [`steps.${currentStep}.completedAt`]: new Date(), [`steps.${currentStep}.comment`]: comment || '' });
      } else {
        const nextStep = currentStep + 1;
        await docRef.update({ status: 'in_progress', currentApprover: steps[nextStep].userId });
        await workflowRef.update({ currentStep: nextStep, [`steps.${currentStep}.status`]: 'recommended', [`steps.${currentStep}.completedAt`]: new Date(), [`steps.${currentStep}.comment`]: comment || '' });
      }
    }

    await tokenRef.update({ status: 'used' });

    await db.collection('audit_logs').add({
      action: `workflow.${action}`,
      userId,
      userName: tokenData.userEmail || 'Unknown',
      documentId,
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '0.0.0.0',
      userAgent: req.headers.get('user-agent') || 'unknown',
      device: 'email',
      beforeState: { status: docData.status },
      afterState: { status: action === 'approve' ? 'approved' : 'returned' },
      timestamp: new Date(),
    });

    return NextResponse.json({ success: true, action, documentName: docData.name });
  } catch (error) {
    console.error('Action processing failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
