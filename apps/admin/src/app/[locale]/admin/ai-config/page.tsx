'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { AI_FEATURES } from '@digiflow/shared';
import { Cpu, Sparkles, Brain, FileSearch, Tag, Route, AlertTriangle, FileText, MessageSquare, GitCompare, BarChart3, Stars } from 'lucide-react';

const FEATURE_ICONS: Record<string, React.ReactNode> = {
  chatbot: <MessageSquare className="h-5 w-5" />,
  auto_summarize: <FileText className="h-5 w-5" />,
  auto_tag: <Tag className="h-5 w-5" />,
  smart_routing: <Route className="h-5 w-5" />,
  anomaly_detection: <AlertTriangle className="h-5 w-5" />,
  auto_fill: <Sparkles className="h-5 w-5" />,
  compliance_check: <FileSearch className="h-5 w-5" />,
  priority_scoring: <BarChart3 className="h-5 w-5" />,
  smart_reply: <MessageSquare className="h-5 w-5" />,
  document_comparison: <GitCompare className="h-5 w-5" />,
  analytics_insights: <BarChart3 className="h-5 w-5" />,
};

const FEATURE_DESCRIPTIONS: Record<string, string> = {
  chatbot: 'AI-powered Q&A assistant for document inquiries',
  auto_summarize: 'Generate concise summaries of document content',
  auto_tag: 'Automatically extract keywords and tags from documents',
  smart_routing: 'AI suggests optimal approval routing based on content',
  anomaly_detection: 'Flag unusual approval patterns and potential fraud',
  auto_fill: 'Extract metadata from uploaded documents automatically',
  compliance_check: 'Validate documents against regulatory requirements',
  priority_scoring: 'Compute urgency scores for pending documents',
  smart_reply: 'AI-suggested responses for approval/return comments',
  document_comparison: 'Diff and compare document versions side-by-side',
  analytics_insights: 'Generate natural-language insights from analytics data',
};

export default function AdminAiConfigPage() {
  const [enabledFeatures, setEnabledFeatures] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(AI_FEATURES.map((f) => [f, true])),
  );

  const toggle = (feature: string) => {
    setEnabledFeatures((prev) => ({ ...prev, [feature]: !prev[feature] }));
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-brand-400" />
          <h1 className="text-2xl font-bold text-white">AI Configuration</h1>
        </div>
        <p className="text-gray-400 mt-1">Configure AI features and Gemini API settings</p>
      </div>

      <div className="flex items-center gap-2 rounded-lg border border-gray-800 bg-gray-900 px-4 py-3">
        <Stars className="h-4 w-4 text-amber-400" />
        <span className="text-sm text-gray-300">
          Using Gemini AI — {Object.values(enabledFeatures).filter(Boolean).length} of {AI_FEATURES.length} features enabled
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {AI_FEATURES.map((feature) => {
          const enabled = enabledFeatures[feature] ?? true;
          return (
            <div
              key={feature}
              className={`rounded-xl border p-6 transition-colors ${
                enabled ? 'border-gray-700 bg-gray-900' : 'border-gray-800 bg-gray-900/50 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`rounded-lg p-2 ${enabled ? 'bg-brand-500/20 text-brand-400' : 'bg-gray-800 text-gray-500'}`}>
                    {FEATURE_ICONS[feature] || <Cpu className="h-5 w-5" />}
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-white capitalize">
                      {feature.replace(/_/g, ' ')}
                    </h3>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {FEATURE_DESCRIPTIONS[feature] || ''}
                    </p>
                  </div>
                </div>
                <Switch checked={enabled} onCheckedChange={() => toggle(feature)} />
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Badge variant={enabled ? 'enabled' : 'disabled'}>
                  {enabled ? 'Enabled' : 'Disabled'}
                </Badge>
                {feature === 'auto_fill' && <Badge variant="default">Default</Badge>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
