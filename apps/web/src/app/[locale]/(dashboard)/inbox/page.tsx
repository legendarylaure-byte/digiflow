'use client';

import { collection, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/hooks/use-auth';
import { useCollection } from '@/hooks/use-collection';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Inbox, FileText, ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface InboxDoc {
  id: string;
  name: string;
  documentType: string;
  uploadedByName: string;
  uploadedAt: { toMillis: () => number } | string;
  status: string;
  currentApprover: string;
  recommenders?: Array<{ uid: string }>;
  approvers?: Array<{ uid: string }>;
}

export default function InboxPage() {
  const { user } = useAuth();
  const { data: documents, loading } = useCollection<InboxDoc>('documents', [
    where('status', '==', 'in_progress'),
    orderBy('uploadedAt', 'desc'),
  ]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  const pendingDocs = documents.filter((doc) => {
    if (!user) return false;
    const userId = user.uid;
    const isCurrentApprover = doc.currentApprover === userId;
    const isRecommender = doc.recommenders?.some((r) => r.uid === userId);
    const isApprover = doc.approvers?.some((a) => a.uid === userId);
    return isCurrentApprover || isRecommender || isApprover;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Inbox</h2>
        <p className="text-sm text-gray-500">Documents waiting for your response</p>
      </div>

      {pendingDocs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <Inbox className="mb-3 h-12 w-12 text-gray-300" />
            <p className="font-medium text-gray-700">All caught up!</p>
            <p className="text-sm text-gray-500">No documents waiting for your review</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {pendingDocs.map((item) => {
            const isApprover = item.currentApprover === user?.uid;
            return (
              <Link key={item.id} href={`/documents/${item.id}/review`}>
                <Card className="transition-colors hover:border-brand-300 cursor-pointer">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className={`rounded-lg p-2 ${isApprover ? 'bg-emerald-50' : 'bg-amber-50'}`}>
                        <FileText className={`h-5 w-5 ${isApprover ? 'text-emerald-600' : 'text-amber-600'}`} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-500">
                          From: {item.uploadedByName || 'Unknown'} &middot; {item.documentType || 'Document'} &middot; {isApprover ? 'Approve' : 'Recommend'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={isApprover ? 'approved' : 'inProgress'}>
                        {isApprover ? 'Approve' : 'Recommend'}
                      </Badge>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
