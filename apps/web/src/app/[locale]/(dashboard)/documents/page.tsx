'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FileText, Search, Filter, Plus } from 'lucide-react';

const MOCK_DOCS = [
  { id: '1', name: 'IT Budget Proposal 2026', serial: 'VOM00001-2026-13-May', status: 'in_progress', department: 'IT', updatedAt: '2 hours ago' },
  { id: '2', name: 'Q3 Financial Report', serial: 'VOM00002-2026-12-May', status: 'approved', department: 'Finance', updatedAt: '1 day ago' },
  { id: '3', name: 'HR Policy Update', serial: 'VOM00003-2026-11-May', status: 'draft', department: 'HR', updatedAt: '3 days ago' },
  { id: '4', name: 'Project Proposal - ERP', serial: 'VOM00004-2026-10-May', status: 'returned', department: 'IT', updatedAt: '5 days ago' },
  { id: '5', name: 'Annual Compliance Report', serial: 'VOM00005-2026-09-May', status: 'approved', department: 'Legal', updatedAt: '1 week ago' },
  { id: '6', name: 'Marketing Budget 2026', serial: 'VOM00006-2026-08-May', status: 'in_progress', department: 'Marketing', updatedAt: '1 week ago' },
];

function getStatusVariant(status: string) {
  switch (status) {
    case 'approved': return 'approved' as const;
    case 'in_progress': return 'inProgress' as const;
    case 'returned': return 'returned' as const;
    case 'draft': return 'draft' as const;
    default: return 'default' as const;
  }
}

export default function DocumentsPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = MOCK_DOCS.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(search.toLowerCase()) || doc.serial.includes(search);
    const matchesFilter = filter === 'all' || doc.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">All Documents</h2>
        <a href="/documents/upload">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Upload Document
          </Button>
        </a>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name or serial number..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              {['all', 'draft', 'in_progress', 'approved', 'returned'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    filter === f
                      ? 'bg-brand-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {f === 'in_progress' ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <FileText className="mb-3 h-12 w-12 text-gray-300" />
              <p className="text-gray-500">No documents found</p>
              <p className="text-sm text-gray-400">Try a different search or filter</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((doc) => (
                <a
                  key={doc.id}
                  href={`/documents/${doc.id}`}
                  className="flex items-center justify-between rounded-lg border border-gray-100 p-4 transition-colors hover:border-brand-200 hover:bg-brand-50/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-brand-50 p-2">
                      <FileText className="h-5 w-5 text-brand-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{doc.name}</p>
                      <p className="text-xs text-gray-500">{doc.serial} &middot; {doc.department} &middot; {doc.updatedAt}</p>
                    </div>
                  </div>
                  <Badge variant={getStatusVariant(doc.status)} className="capitalize">
                    {doc.status.replace('_', ' ')}
                  </Badge>
                </a>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
