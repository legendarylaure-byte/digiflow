'use client';

import Link from 'next/link';

export default function AdminWorkflowPage() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Workflows</h1><p className="text-gray-400">Configure approval workflows and routing</p></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/admin/workflow/document-types" className="rounded-xl border border-gray-800 bg-gray-900 p-6 hover:border-brand-500 transition-colors">
          <h3 className="text-base font-medium text-white">Document Types</h3>
          <p className="mt-1 text-sm text-gray-500">Manage document type categories and their default workflows</p>
        </Link>
        <Link href="/admin/workflow/sla" className="rounded-xl border border-gray-800 bg-gray-900 p-6 hover:border-brand-500 transition-colors">
          <h3 className="text-base font-medium text-white">SLA Configuration</h3>
          <p className="mt-1 text-sm text-gray-500">Set service level agreements for approval deadlines</p>
        </Link>
      </div>
    </div>
  );
}
