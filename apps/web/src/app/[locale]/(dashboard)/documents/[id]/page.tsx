'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, FileText, Clock, User, Building2 } from 'lucide-react';
import Link from 'next/link';

export default function DocumentDetailPage() {
  const params = useParams();
  const docId = params.id as string;
  const [document, setDocument] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDoc() {
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
    }
    fetchDoc();
  }, [docId]);

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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/documents">
          <Button variant="ghost" size="sm"><ArrowLeft className="mr-1 h-4 w-4" />Back</Button>
        </Link>
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
