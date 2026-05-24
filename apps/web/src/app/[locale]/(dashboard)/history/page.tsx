'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { History, FileText, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';

const MOCK_HISTORY = [
  { action: 'Approved', doc: 'Q3 Financial Report', by: 'Hari Adhikari', date: '12 May 2026', time: '14:30', status: 'approved' },
  { action: 'Returned', doc: 'Project Proposal - ERP', by: 'Ram Sharma', date: '10 May 2026', time: '09:15', status: 'returned', reason: 'Missing financial projections' },
  { action: 'Recommended', doc: 'IT Budget Proposal', by: 'Shyam Thapa', date: '8 May 2026', time: '11:00', status: 'in_progress' },
  { action: 'Uploaded', doc: 'Annual Compliance Report', by: 'You', date: '5 May 2026', time: '16:45', status: 'approved' },
  { action: 'Approved', doc: 'Marketing Budget 2026', by: 'Sita KC', date: '5 May 2026', time: '10:20', status: 'approved' },
];

function getStatusVariant(status: string) {
  switch (status) {
    case 'approved': return 'approved' as const;
    case 'in_progress': return 'inProgress' as const;
    case 'returned': return 'returned' as const;
    default: return 'default' as const;
  }
}

function getActionIcon(action: string) {
  switch (action) {
    case 'Approved': return CheckCircle2;
    case 'Returned': return AlertTriangle;
    case 'Recommended': return Clock;
    default: return FileText;
  }
}

export default function HistoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Approval History</h2>
        <p className="text-sm text-gray-500">Complete audit trail of all document actions</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-100">
            {MOCK_HISTORY.map((item, i) => {
              const Icon = getActionIcon(item.action);
              return (
                <div key={i} className="flex items-start gap-4 p-4">
                  <div className={`rounded-full p-1.5 ${
                    item.status === 'approved' ? 'bg-emerald-50 text-emerald-600' :
                    item.status === 'returned' ? 'bg-red-50 text-red-600' :
                    'bg-amber-50 text-amber-600'
                  }`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900">
                        <span className="capitalize">{item.action.toLowerCase()}</span> &mdash; {item.doc}
                      </p>
                      <Badge variant={getStatusVariant(item.status)} className="text-[10px] px-1.5 py-0">
                        {item.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-gray-500">
                      By {item.by} &middot; {item.date} at {item.time}
                      {item.reason && <span> &middot; Reason: {item.reason}</span>}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
