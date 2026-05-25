'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, CheckCircle, XCircle, ThumbsUp, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { approveAction } from '@/lib/workflow';
import { aiSmartReply } from '@/lib/ai/smart-reply';

export default function ReviewDocumentPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const docId = params.id as string;
  const [document, setDocument] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<{
    recommendSuggestion: string;
    approveSuggestion: string;
    returnSuggestion: string;
    analysisPoints: string[];
  } | null>(null);

  useEffect(() => {
    async function fetchDoc() {
      if (!docId) return;
      try {
        const ref = doc(db, 'documents', docId);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setDocument({ id: snap.id, ...snap.data() });
        }
      } catch {
        console.error('Failed to load');
      } finally {
        setLoading(false);
      }
    }
    fetchDoc();
  }, [docId]);

  const handleSuggest = async () => {
    setSuggestionLoading(true);
    try {
      const result = await aiSmartReply({ documentId: docId });
      setSuggestions(result.data);
    } catch {
      toast.error('Failed to generate suggestions');
    } finally {
      setSuggestionLoading(false);
    }
  };

  const applySuggestion = (text: string) => {
    setComment(text);
    setSuggestions(null);
  };

  const handleAction = async (action: 'recommend' | 'approve' | 'return') => {
    if (!user) return;
    setActionLoading(action);
    try {
      const result = await approveAction({
        documentId: docId,
        userId: user.uid,
        action,
        comment,
      });
      toast.success(action === 'return' ? 'Document returned' : 'Action recorded');
      router.push('/inbox');
    } catch (err: any) {
      toast.error(err.message || 'Action failed');
    } finally {
      setActionLoading(null);
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
        <Link href="/inbox"><Button variant="outline">Back to Inbox</Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/inbox">
          <Button variant="ghost" size="sm"><ArrowLeft className="mr-1 h-4 w-4" />Back to Inbox</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">{document.name}</CardTitle>
            <Badge variant={document.status === 'in_progress' ? 'inProgress' : 'draft'} className="capitalize">
              {document.status?.replace('_', ' ') || 'draft'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-gray-500">Type:</span> <span className="font-medium">{document.documentType || 'N/A'}</span></div>
            <div><span className="text-gray-500">Department:</span> <span className="font-medium">{document.department || 'N/A'}</span></div>
            <div><span className="text-gray-500">Uploaded by:</span> <span className="font-medium">{document.uploadedByName || 'N/A'}</span></div>
            <div><span className="text-gray-500">Current step:</span> <span className="font-medium">{document.currentApprover || 'N/A'}</span></div>
          </div>

          {document.description && (
            <div>
              <p className="text-sm text-gray-500 mb-1">Description</p>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{document.description}</p>
            </div>
          )}

          {document.fileUrl && (
            <a href={document.fileUrl} target="_blank" rel="noreferrer">
              <Button variant="outline" size="sm"><FileText className="mr-2 h-4 w-4" />View Document</Button>
            </a>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Comment (optional)</label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleSuggest}
                disabled={suggestionLoading}
                className="text-xs text-brand-600 hover:text-brand-700"
              >
                {suggestionLoading ? (
                  <><Loader2 className="mr-1 h-3 w-3 animate-spin" /> Generating...</>
                ) : (
                  <>AI Suggest</>
                )}
              </Button>
            </div>
            {suggestions && (
              <div className="mb-3 space-y-2 rounded-lg border border-brand-200 bg-brand-50 p-3">
                <p className="text-xs font-medium text-brand-700">Suggested comments — click to apply:</p>
                <button
                  type="button"
                  onClick={() => applySuggestion(suggestions.recommendSuggestion)}
                  className="block w-full text-left text-xs text-gray-600 hover:text-brand-700 rounded px-2 py-1 hover:bg-brand-100 transition"
                >
                  👍 {suggestions.recommendSuggestion}
                </button>
                <button
                  type="button"
                  onClick={() => applySuggestion(suggestions.approveSuggestion)}
                  className="block w-full text-left text-xs text-gray-600 hover:text-brand-700 rounded px-2 py-1 hover:bg-brand-100 transition"
                >
                  ✅ {suggestions.approveSuggestion}
                </button>
                <button
                  type="button"
                  onClick={() => applySuggestion(suggestions.returnSuggestion)}
                  className="block w-full text-left text-xs text-gray-600 hover:text-brand-700 rounded px-2 py-1 hover:bg-brand-100 transition"
                >
                  ↩️ {suggestions.returnSuggestion}
                </button>
                {suggestions.analysisPoints.length > 0 && (
                  <div className="mt-2 border-t border-brand-200 pt-2">
                    <p className="text-xs font-medium text-brand-600 mb-1">Analysis points:</p>
                    <ul className="list-disc pl-4 text-xs text-gray-500 space-y-0.5">
                      {suggestions.analysisPoints.map((pt, i) => (
                        <li key={i}>{pt}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment about your decision..."
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              onClick={() => handleAction('recommend')}
              disabled={!!actionLoading}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {actionLoading === 'recommend' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ThumbsUp className="mr-2 h-4 w-4" />}
              Recommend
            </Button>
            <Button
              onClick={() => handleAction('approve')}
              disabled={!!actionLoading}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {actionLoading === 'approve' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
              Approve
            </Button>
            <Button
              onClick={() => handleAction('return')}
              disabled={!!actionLoading}
              variant="destructive"
            >
              {actionLoading === 'return' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
              Return
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
