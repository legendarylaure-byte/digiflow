'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Inbox, FileText, ChevronRight } from 'lucide-react';

const MOCK_INBOX = [
  { id: '1', name: 'IT Budget Proposal', from: 'Ram Sharma', type: 'recommend', arrived: '2 hours ago', step: 1 },
  { id: '2', name: 'HR Policy Update', from: 'Sita KC', type: 'recommend', arrived: '5 hours ago', step: 1 },
  { id: '3', name: 'Q3 Financial Report', from: 'Hari Adhikari', type: 'approve', arrived: '1 day ago', step: 2 },
];

function getTypeVariant(type: string) {
  return type === 'approve' ? 'approved' as const : 'inProgress' as const;
}

export default function InboxPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Inbox</h2>
        <p className="text-sm text-gray-500">Documents waiting for your response</p>
      </div>

      {MOCK_INBOX.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <Inbox className="mb-3 h-12 w-12 text-gray-300" />
            <p className="font-medium text-gray-700">All caught up!</p>
            <p className="text-sm text-gray-500">No documents waiting for your review</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {MOCK_INBOX.map((item) => (
            <Card key={item.id} className="transition-colors hover:border-brand-300 cursor-pointer">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className={`rounded-lg p-2 ${item.type === 'approve' ? 'bg-emerald-50' : 'bg-amber-50'}`}>
                    <FileText className={`h-5 w-5 ${item.type === 'approve' ? 'text-emerald-600' : 'text-amber-600'}`} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-500">
                      From: {item.from} &middot; {item.arrived} &middot; Step {item.step}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={getTypeVariant(item.type)}>
                    {item.type === 'approve' ? 'Approve' : 'Recommend'}
                  </Badge>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
