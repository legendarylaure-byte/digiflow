'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase/config';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, FileText, Clock, User, Building2, Play, History, UploadCloud, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { startWorkflow } from '@/lib/workflow';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function DocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const docId = params.id as string;
  const [document, setDocument] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [uploadingVersion, setUploadingVersion] = useState(false);
  const [versionComment, setVersionComment] = useState('');

  const fetchDoc = useCallback(async () => {
    if (!docId) return;
    try {
      const ref = doc(db, 'documents', docId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setDocument({ id: snap.id, ...snap.data() });
      }
    } catch (err) {
      console.error('Failed to load document', err);
    } finally {
      setLoading(false);
    }
  }, [docId]);

  useEffect(() => { fetchDoc(); }, [fetchDoc]);

  const handleVersionUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploadingVersion(true);
    try {
      const newVersion = (document.version || 0) + 1;
      const storageRef = ref(storage, `documents/${docId}/versions/v${newVersion}_${file.name}`);
      const snap = await uploadBytes(storageRef, file);
      const fileUrl = await getDownloadURL(snap.ref);
      const now = new Date();
      await updateDoc(doc(db, 'documents', docId), {
        version: newVersion,
        previousVersions: arrayUnion({
          version: newVersion,
          fileUrl,
          changes: versionComment || `Version ${newVersion}`,
          createdAt: now,
          createdBy: user.uid,
        }),
        fileUrl,
        fileName: file.name,
        updatedAt: now,
      });
      toast.success(`Version ${newVersion} uploaded`);
      setVersionComment('');
      await fetchDoc();
    } catch {
      toast.error('Failed to upload version');
    } finally {
      setUploadingVersion(false);
    }
  };

  const handleStartWorkflow = async () => {
    if (!user) return;
    setStarting(true);
    try {
      const recFields = ['recommender1', 'recommender2', 'recommender3'];
      const recommenders = recFields
        .map((f) => {
          const val = document[f];
          if (!val) return null;
          if (typeof val === 'object') return { uid: val.uid || '', name: val.name || '', email: val.email || '' };
          return { uid: '', name: val, email: '' };
        })
        .filter((r): r is { uid: string; name: string; email: string } => r !== null);
      const approverVal = document.approver;
      const approver = approverVal
        ? typeof approverVal === 'object'
          ? { uid: approverVal.uid || '', name: approverVal.name || '', email: approverVal.email || '' }
          : { uid: '', name: approverVal, email: '' }
        : { uid: '', name: '', email: '' };

      await startWorkflow({ documentId: docId, recommenders, approver });
      toast.success('Workflow started');
      await fetchDoc();
    } catch (err: any) {
      toast.error(err.message || 'Failed to start workflow');
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  if (!document) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <FileText className="h-12 w-12 text-gray-300" />
        <h2 className="text-lg font-semibold text-gray-900">Document not found</h2>
        <Link href="/documents">
          <Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" />Back to Documents</Button>
        </Link>
      </div>
    );
  }

  const statusVariant: Record<string, 'draft' | 'inProgress' | 'approved' | 'returned' | 'default'> = {
    draft: 'draft',
    in_progress: 'inProgress',
    approved: 'approved',
    returned: 'returned',
  };

  const isOwner = user?.uid === document.uploadedBy;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Link href="/documents">
          <Button variant="ghost" size="sm"><ArrowLeft className="mr-1 h-4 w-4" />Back</Button>
        </Link>
        {document.status === 'in_progress' && (
          <Link href={`/documents/${docId}/review`}>
            <Button variant="coral">Review & Take Action</Button>
          </Link>
        )}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="text-xl">{document.name}</CardTitle>
            <p className="mt-1 text-sm text-gray-500">
              {document.serialNumber || 'No serial'} &middot; Created {new Date(document.uploadedAt?.toMillis?.() || Date.now()).toLocaleDateString()}
            </p>
          </div>
          <Badge variant={statusVariant[document.status] || 'default'} className="capitalize text-sm px-3 py-1">
            {document.status?.replace('_', ' ') || 'draft'}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-500"><FileText className="h-4 w-4" /> Type</div>
              <p className="font-medium">{document.documentType || 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-500"><Building2 className="h-4 w-4" /> Department</div>
              <p className="font-medium">{document.department || 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-500"><Clock className="h-4 w-4" /> Fiscal Year</div>
              <p className="font-medium">{document.fiscalYear || 'N/A'}</p>
            </div>
          </div>

          {document.description && (
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Description</p>
              <p className="text-sm text-gray-700">{document.description}</p>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-500"><User className="h-4 w-4" /> Uploaded by</div>
              <p className="font-medium">{document.uploadedByName || document.uploadedBy || 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-500">Current Approver</div>
              <p className="font-medium">{document.currentApprover || 'Not assigned'}</p>
            </div>
          </div>

          {document.aiSummary && (
            <div className="rounded-lg bg-brand-50 p-4">
              <p className="text-sm font-medium text-brand-800">AI Summary</p>
              <p className="mt-1 text-sm text-brand-700">{document.aiSummary}</p>
            </div>
          )}

          <div className="flex gap-3">
            {document.fileUrl && (
              <a href={document.fileUrl} target="_blank" rel="noreferrer">
                <Button variant="outline"><Download className="mr-2 h-4 w-4" />Download</Button>
              </a>
            )}
            {document.status === 'draft' && isOwner && (
              <Button onClick={handleStartWorkflow} disabled={starting} className="bg-emerald-600 hover:bg-emerald-700">
                {starting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                Start Workflow
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Version History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-gray-500" />
              <CardTitle className="text-lg">Version History</CardTitle>
              <Badge variant="outline" className="text-xs">v{document.version || 1}</Badge>
            </div>
            {isOwner && (
              <label className="cursor-pointer">
                <Button variant="outline" size="sm" disabled={uploadingVersion} asChild>
                  <span>
                    {uploadingVersion ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-1 h-4 w-4" />}
                    Upload New Version
                  </span>
                </Button>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.docx,.xlsx,.txt,.png,.jpg"
                  onChange={handleVersionUpload}
                  disabled={uploadingVersion}
                />
              </label>
            )}
          </div>
          {isOwner && (
            <div className="mt-3">
              <input
                value={versionComment}
                onChange={(e) => setVersionComment(e.target.value)}
                placeholder="What changed in this version?"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          )}
        </CardHeader>
        <CardContent>
          {(!document.previousVersions || document.previousVersions.length === 0) ? (
            <p className="py-4 text-center text-sm text-gray-400">No previous versions</p>
          ) : (
            <div className="space-y-3">
              {[...(document.previousVersions || [])].reverse().map((v: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                      v{v.version}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{v.changes || `Version ${v.version}`}</p>
                      <p className="text-xs text-gray-500">
                        {v.createdAt?.toMillis ? new Date(v.createdAt.toMillis()).toLocaleString() : 'N/A'}
                        {v.createdBy && ` · by ${v.createdBy}`}
                      </p>
                    </div>
                  </div>
                  {v.fileUrl && (
                    <a href={v.fileUrl} target="_blank" rel="noreferrer">
                      <Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button>
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
