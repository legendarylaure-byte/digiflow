'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Download, Share2, Mail, FileText, ExternalLink } from 'lucide-react';

const MOCK_APPROVED = [
  { id: '1', name: 'Q3 Financial Report', serial: 'VOM00002-2026-12-May', approvedBy: 'Hari Adhikari', date: '12 May 2026', department: 'Finance' },
  { id: '2', name: 'Annual Compliance Report', serial: 'VOM00005-2026-09-May', approvedBy: 'Ram Sharma', date: '9 May 2026', department: 'Legal' },
  { id: '3', name: 'Marketing Budget 2026', serial: 'VOM00007-2026-05-May', approvedBy: 'Sita KC', date: '5 May 2026', department: 'Marketing' },
];

export default function ApprovedDocumentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Approved Documents</h2>
        <p className="text-sm text-gray-500">View, download, and share approved documents</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MOCK_APPROVED.map((doc) => (
          <Card key={doc.id} className="transition-colors hover:border-emerald-300">
            <CardContent className="p-5">
              <div className="mb-3 flex items-center gap-2">
                <div className="rounded-lg bg-emerald-50 p-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                </div>
                <Badge variant="approved">Approved</Badge>
              </div>
              <h3 className="font-medium text-gray-900">{doc.name}</h3>
              <p className="mt-1 text-xs text-gray-500">{doc.serial}</p>
              <div className="mt-3 space-y-1 text-xs text-gray-500">
                <p>Approved by: {doc.approvedBy}</p>
                <p>Date: {doc.date}</p>
                <p>Department: {doc.department}</p>
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Download className="mr-1 h-3 w-3" /> Download
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Share2 className="mr-1 h-3 w-3" /> Share
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Mail className="mr-1 h-3 w-3" /> Email
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {MOCK_APPROVED.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <FileText className="mb-3 h-12 w-12 text-gray-300" />
            <p className="font-medium text-gray-700">No approved documents yet</p>
            <p className="text-sm text-gray-500">Approved documents will appear here</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
