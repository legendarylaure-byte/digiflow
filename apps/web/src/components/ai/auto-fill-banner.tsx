'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { runAutoFill, type AutoFillResult } from '@/lib/ai/auto-fill';

interface AutoFillBannerProps {
  file: File | null;
  onResults: (results: AutoFillResult) => void;
  disabled?: boolean;
}

export function AutoFillBanner({ file, onResults, disabled }: AutoFillBannerProps) {
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [results, setResults] = useState<AutoFillResult | null>(null);

  const handleAutoFill = async () => {
    if (!file) return;
    setState('loading');
    try {
      const { inferResult } = await runAutoFill(file);
      setResults(inferResult);
      onResults(inferResult);
      setState('done');
    } catch {
      setState('error');
    }
  };

  if (!file) return null;

  return (
    <Card className="border-brand-200 bg-brand-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-brand-800">
          <Sparkles className="h-4 w-4 text-brand-600" />
          AI Auto-Fill
        </CardTitle>
      </CardHeader>
      <CardContent>
        {state === 'idle' && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-brand-700">
              Let AI analyze your document and pre-fill the metadata fields automatically.
            </p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleAutoFill}
              disabled={disabled}
              className="shrink-0 border-brand-300 text-brand-700 hover:bg-brand-100"
            >
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              Analyze Document
            </Button>
          </div>
        )}

        {state === 'loading' && (
          <div className="flex items-center gap-3 text-sm text-brand-700">
            <Loader2 className="h-4 w-4 animate-spin text-brand-600" />
            <span>Analyzing document content...</span>
          </div>
        )}

        {state === 'done' && results && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-green-700">
              <CheckCircle className="h-4 w-4" />
              <span className="font-medium">Fields pre-filled based on analysis</span>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-full border border-gray-200 bg-white px-2.5 py-0.5 text-xs text-gray-700">
                Name: {results.name}
              </span>
              <span className="rounded-full border border-gray-200 bg-white px-2.5 py-0.5 text-xs text-gray-700">
                Type: {results.documentType}
              </span>
              <span className="rounded-full border border-gray-200 bg-white px-2.5 py-0.5 text-xs text-gray-700">
                Dept: {results.department}
              </span>
              <span className="rounded-full border border-gray-200 bg-white px-2.5 py-0.5 text-xs text-gray-700">
                FY: {results.fiscalYear}
              </span>
              {results.isConfidential && (
                <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs text-amber-700">
                  Confidential
                </span>
              )}
            </div>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={handleAutoFill}
              className="text-xs text-brand-600"
            >
              <RefreshCw className="mr-1 h-3 w-3" /> Re-analyze
            </Button>
          </div>
        )}

        {state === 'error' && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span>Analysis failed. Try again or fill manually.</span>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleAutoFill}
              className="shrink-0"
            >
              <RefreshCw className="mr-1 h-3 w-3" /> Retry
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
