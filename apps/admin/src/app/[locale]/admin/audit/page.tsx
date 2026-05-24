'use client';

import { useState } from 'react';
import { collection, query, orderBy, limit, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCollection } from '@/hooks/use-collection';
import { Filter } from 'lucide-react';

interface AuditEntry {
  id: string;
  action: string;
  userId: string;
  userName: string;
  documentId?: string | null;
  ipAddress?: string;
  userAgent?: string;
  device?: string;
  timestamp?: { toDate?: () => Date } | Date | null;
}

const ACTION_OPTIONS = [
  { value: '', label: 'All Actions' },
  { value: 'upload', label: 'Upload' },
  { value: 'view', label: 'View' },
  { value: 'recommend', label: 'Recommend' },
  { value: 'approve', label: 'Approve' },
  { value: 'return', label: 'Return' },
  { value: 'download', label: 'Download' },
  { value: 'share', label: 'Share' },
  { value: 'login', label: 'Login' },
  { value: 'workflow.start', label: 'Workflow Start' },
];

export default function AdminAuditPage() {
  const [actionFilter, setActionFilter] = useState('');
  const [page, setPage] = useState(0);

  const constraints = actionFilter
    ? [where('action', '==', actionFilter), orderBy('timestamp', 'desc'), limit(50)]
    : [orderBy('timestamp', 'desc'), limit(50)];

  const { data: entries, loading } = useCollection<AuditEntry>('audit_logs', constraints, [actionFilter]);

  const columns: Column<AuditEntry>[] = [
    {
      key: 'action',
      label: 'Action',
      sortable: true,
      render: (e) => (
        <Badge variant={e.action.includes('approve') ? 'approved' : e.action.includes('return') ? 'returned' : e.action.includes('login') ? 'admin' : 'default'}>
          {e.action.replace(/_/g, ' ')}
        </Badge>
      ),
    },
    {
      key: 'userName',
      label: 'User',
      sortable: true,
      render: (e) => (
        <div>
          <p className="text-gray-200">{e.userName || 'Unknown'}</p>
          <p className="text-xs text-gray-500">{e.userId?.slice(0, 8)}</p>
        </div>
      ),
    },
    {
      key: 'documentId',
      label: 'Document',
      sortable: false,
      render: (e) => (
        <span className="text-xs text-gray-500">{e.documentId ? e.documentId.slice(0, 12) + '...' : '—'}</span>
      ),
    },
    {
      key: 'ipAddress',
      label: 'IP Address',
      sortable: false,
      render: (e) => <span className="text-xs text-gray-500">{e.ipAddress || '—'}</span>,
    },
    {
      key: 'device',
      label: 'Device',
      sortable: false,
      render: (e) => <span className="text-xs text-gray-500">{e.device || '—'}</span>,
    },
    {
      key: 'timestamp',
      label: 'Timestamp',
      sortable: true,
      render: (e) => {
        const ts = e.timestamp;
        const date = ts && typeof ts === 'object' && 'toDate' in ts ? (ts as { toDate: () => Date }).toDate() : (ts as Date | null);
        return (
          <span className="text-xs text-gray-400">
            {date instanceof Date ? date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Audit Log</h1>
        <p className="text-gray-400">View system-wide audit trail (append-only)</p>
      </div>

      <div className="flex items-center gap-3">
        <Filter className="h-4 w-4 text-gray-500" />
        <select
          value={actionFilter}
          onChange={(e) => { setActionFilter(e.target.value); setPage(0); }}
          className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          {ACTION_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {actionFilter && (
          <Button variant="ghost" size="sm" onClick={() => setActionFilter('')}>Clear</Button>
        )}
        <span className="text-xs text-gray-500 ml-auto">{entries.length} entries</span>
      </div>

      <DataTable
        columns={columns}
        data={entries}
        loading={loading}
        keyExtractor={(e) => e.id}
        pageSize={15}
        emptyMessage="No audit log entries found"
      />
    </div>
  );
}
