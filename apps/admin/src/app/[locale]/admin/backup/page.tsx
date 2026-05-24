'use client';

import { DownloadCloud } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminBackupPage() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Backup</h1><p className="text-gray-400">System data backup and restore</p></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <h3 className="text-base font-medium text-white">Firestore Backup</h3>
          <p className="mt-1 text-sm text-gray-500">Export all Firestore collections to a JSON archive</p>
          <button
            onClick={() => toast.success('Backup initiated (simulated)')}
            className="mt-3 flex items-center gap-2 rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:border-brand-500 hover:text-white transition-colors"
          >
            <DownloadCloud className="h-4 w-4" /> Export Data
          </button>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <h3 className="text-base font-medium text-white">Storage Backup</h3>
          <p className="mt-1 text-sm text-gray-500">Backup all uploaded documents and PDFs</p>
          <button
            onClick={() => toast.success('Storage backup initiated (simulated)')}
            className="mt-3 flex items-center gap-2 rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:border-brand-500 hover:text-white transition-colors"
          >
            <DownloadCloud className="h-4 w-4" /> Backup Storage
          </button>
        </div>
      </div>
    </div>
  );
}
