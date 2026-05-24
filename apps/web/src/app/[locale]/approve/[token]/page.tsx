'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function ApproveActionPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  const [state, setState] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function process() {
      try {
        const res = await fetch('/api/workflow/action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, action: 'approve', comment: 'Approved via email' }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setState('success');
          setMessage(`"${data.documentName || 'Document'}" has been approved.`);
        } else {
          setState('error');
          setMessage(data.error || 'Failed to process approval');
        }
      } catch {
        setState('error');
        setMessage('Connection error. Please try again.');
      }
    }
    if (token) process();
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg text-center">
        {state === 'processing' && (
          <div className="space-y-4">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
            <h2 className="text-lg font-semibold text-gray-900">Processing approval...</h2>
          </div>
        )}
        {state === 'success' && (
          <div className="space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Approved!</h2>
            <p className="text-gray-500">{message}</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="mt-4 rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
            >
              Go to Dashboard
            </button>
          </div>
        )}
        {state === 'error' && (
          <div className="space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Action Failed</h2>
            <p className="text-gray-500">{message || 'The link may have expired or already been used.'}</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="mt-4 rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
