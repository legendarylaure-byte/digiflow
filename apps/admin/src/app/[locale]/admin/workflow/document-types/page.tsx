'use client';

import { useState } from 'react';
import { collection, addDoc, deleteDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useCollection } from '@/hooks/use-collection';
import { Plus, Pencil, Trash2, GitBranch } from 'lucide-react';
import { toast } from 'sonner';

interface DocTypeDoc {
  id: string;
  name: string;
  description?: string;
  defaultWorkflow?: string;
  isActive?: boolean;
}

export default function AdminDocTypesPage() {
  const { data: docTypes, loading, refetch } = useCollection<DocTypeDoc>('document_types');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<DocTypeDoc | null>(null);
  const [form, setForm] = useState({ name: '', description: '', defaultWorkflow: '' });

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    try {
      if (editing) {
        await updateDoc(doc(db, 'document_types', editing.id), form);
        toast.success('Document type updated');
      } else {
        await addDoc(collection(db, 'document_types'), { ...form, isActive: true, createdAt: new Date() });
        toast.success('Document type created');
      }
      setDialogOpen(false);
      setEditing(null);
      setForm({ name: '', description: '', defaultWorkflow: '' });
      refetch();
    } catch { toast.error('Failed to save'); }
  };

  const handleDelete = async (dt: DocTypeDoc) => {
    if (!confirm(`Delete "${dt.name}"?`)) return;
    try { await deleteDoc(doc(db, 'document_types', dt.id)); toast.success('Deleted'); refetch(); }
    catch { toast.error('Failed to delete'); }
  };

  const openEdit = (dt: DocTypeDoc) => {
    setEditing(dt);
    setForm({ name: dt.name, description: dt.description || '', defaultWorkflow: dt.defaultWorkflow || '' });
    setDialogOpen(true);
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', description: '', defaultWorkflow: '' });
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Document Types</h1>
          <p className="text-gray-400">Manage document categories and their default workflows</p>
        </div>
        <Button onClick={openCreate}><Plus className="mr-1.5 h-4 w-4" /> Add Type</Button>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-28 animate-pulse rounded-xl border border-gray-800 bg-gray-900 p-6" />)}
        </div>
      ) : docTypes.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-700 bg-gray-900/50 py-16">
          <GitBranch className="h-10 w-10 text-gray-600 mb-3" />
          <p className="text-sm text-gray-500">No document types configured</p>
          <Button variant="outline" className="mt-4" onClick={openCreate}>Create Document Type</Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {docTypes.map((dt) => (
            <div key={dt.id} className="group rounded-xl border border-gray-800 bg-gray-900 p-6 transition-colors hover:border-gray-700">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-medium text-white">{dt.name}</h3>
                  <p className="mt-1 text-xs text-gray-500">{dt.description || `${dt.name} document type`}</p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(dt)} className="rounded p-1.5 text-gray-500 hover:bg-gray-800 hover:text-gray-200"><Pencil className="h-3.5 w-3.5" /></button>
                  <button onClick={() => handleDelete(dt)} className="rounded p-1.5 text-gray-500 hover:bg-gray-800 hover:text-rose-400"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
              {dt.defaultWorkflow && (
                <div className="mt-3 flex items-center gap-2">
                  <Badge variant="default">{dt.defaultWorkflow}</Badge>
                </div>
              )}
              <Badge variant={dt.isActive !== false ? 'active' : 'inactive'} className="mt-2">
                {dt.isActive !== false ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTitle>{editing ? 'Edit Document Type' : 'Add Document Type'}</DialogTitle>
        <DialogDescription>{editing ? 'Update document type details' : 'Create a new document category'}</DialogDescription>
        <div className="mt-4 space-y-4">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name (e.g. Invoice)" className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500" />
          <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500" />
          <input value={form.defaultWorkflow} onChange={(e) => setForm({ ...form, defaultWorkflow: e.target.value })} placeholder="Default workflow (e.g. 3-level approval)" className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500" />
          <div className="flex justify-end gap-2">
            <button onClick={() => setDialogOpen(false)} className="rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">Cancel</button>
            <Button onClick={handleSave}>{editing ? 'Update' : 'Create'}</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
