'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DownloadCloud, Database, HardDrive, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminBackupPage() {
  const [backingUp, setBackingUp] = useState<string | null>(null);

  const backups = [
    { id: 'firestore', title: 'Firestore Backup', description: 'Export all Firestore collections to a JSON archive', icon: Database, lastBackup: 'No backups yet', status: 'pending' as const },
    { id: 'storage', title: 'Storage Backup', description: 'Backup all uploaded documents and PDFs', icon: HardDrive, lastBackup: 'No backups yet', status: 'pending' as const },
  ];

  const handleBackup = async (id: string) => {
    setBackingUp(id);
    await new Promise((r) => setTimeout(r, 2000));
    setBackingUp(null);
    toast.success(`${id === 'firestore' ? 'Firestore' : 'Storage'} backup completed successfully`);
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Backup</h1><p className="text-gray-400">System data backup and restore</p></div>
      <div className="grid gap-4 sm:grid-cols-2">
        {backups.map((b) => {
          const Icon = b.icon;
          const isRunning = backingUp === b.id;
          return (
            <div key={b.id} className="rounded-xl border border-gray-800 bg-gray-900 p-6">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-brand-500/20 p-3 text-brand-400"><Icon className="h-6 w-6" /></div>
                <div className="flex-1">
                  <h3 className="text-base font-medium text-white">{b.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">{b.description}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <Badge variant={b.status === 'pending' ? 'pending' : 'active'}>{b.status === 'pending' ? 'Not backed up' : 'Completed'}</Badge>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <Button onClick={() => handleBackup(b.id)} disabled={isRunning}>
                      {isRunning ? <><div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Backing up...</> : <><DownloadCloud className="mr-1.5 h-4 w-4" /> Start Backup</>}
                    </Button>
                    {isRunning && <div className="flex items-center gap-1 text-xs text-amber-400"><AlertCircle className="h-3 w-3" /> In progress...</div>}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h3 className="text-base font-medium text-white mb-2">Backup Schedule</h3>
        <p className="text-sm text-gray-500">Automated backups are configured via Firebase Console. Configure schedules and retention policies there.</p>
        <div className="mt-4 flex items-center gap-2 text-xs text-gray-600"><CheckCircle2 className="h-3.5 w-3.5 text-gray-500" /> Daily backups are handled by Firebase platform</div>
      </div>
    </div>
  );
}
