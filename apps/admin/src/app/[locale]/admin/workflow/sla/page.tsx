'use client';

import { useState } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useCollection } from '@/hooks/use-collection';
import { Plus, Pencil, Trash2, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface SLADoc {
  id: string;
  name: string;
  deadlineHours: number;
  escalationHours: number;
  description?: string;
  priority?: string;
}

export default function AdminSlaPage() {
  const { data: slas, loading, refetch } = useCollection<SLADoc>('sla_configs');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SLADoc | null>(null);
  const [form, setForm] = useState({ name: '', deadlineHours: 48, escalationHours: 24, description: '', priority: 'medium' });

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    try {
      if (editing) {
        await updateDoc(doc(db, 'sla_configs', editing.id), form);
        toast.success('SLA updated');
      } else {
        await addDoc(collection(db, 'sla_configs'), { ...form, createdAt: new Date() });
        toast.success('SLA created');
      }
      setDialogOpen(false);
      setEditing(null);
      setForm({ name: '', deadlineHours: 48, escalationHours: 24, description: '', priority: 'medium' });
      refetch();
    } catch { toast.error('Failed to save'); }
  };

  const handleDelete = async (sla: SLADoc) => {
    if (!confirm(`Delete SLA "${sla.name}"?`)) return;
    try { await deleteDoc(doc(db, 'sla_configs', sla.id)); toast.success('Deleted'); refetch(); }
    catch { toast.error('Failed to delete'); }
  };

  const openEdit = (sla: SLADoc) => {
    setEditing(sla);
    setForm({ name: sla.name, deadlineHours: sla.deadlineHours, escalationHours: sla.escalationHours, description: sla.description || '', priority: sla.priority || 'medium' });
    setDialogOpen(true);
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', deadlineHours: 48, escalationHours: 24, description: '', priority: 'medium' });
    setDialogOpen(true);
  };

  const formatHours = (h: number) => h >= 24 ? `${Math.floor(h / 24)}d ${h % 24}h` : `${h}h`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">SLA Configuration</h1>
          <p className="text-gray-400">Set deadlines and escalation rules for approvals</p>
        </div>
        <Button onClick={openCreate}><Plus className="mr-1.5 h-4 w-4" /> Add SLA</Button>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2].map((i) => <div key={i} className="h-32 animate-pulse rounded-xl border border-gray-800 bg-gray-900 p-6" />)}
        </div>
      ) : slas.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-700 bg-gray-900/50 py-16">
          <Clock className="h-10 w-10 text-gray-600 mb-3" />
          <p className="text-sm text-gray-500">No SLA configurations yet</p>
          <Button variant="outline" className="mt-4" onClick={openCreate}>Create SLA</Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {slas.map((sla) => (
            <div key={sla.id} className="group rounded-xl border border-gray-800 bg-gray-900 p-6 transition-colors hover:border-gray-700">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-amber-500/20 p-2 text-amber-400">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-white">{sla.name}</h3>
                    <p className="text-xs text-gray-500">{sla.description || `${sla.name} SLA`}</p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(sla)} className="rounded p-1.5 text-gray-500 hover:bg-gray-800 hover:text-gray-200"><Pencil className="h-3.5 w-3.5" /></button>
                  <button onClick={() => handleDelete(sla)} className="rounded p-1.5 text-gray-500 hover:bg-gray-800 hover:text-rose-400"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-gray-800 p-3">
                  <p className="text-xs text-gray-500">Deadline</p>
                  <p className="text-sm font-medium text-white mt-0.5">{formatHours(sla.deadlineHours)}</p>
                </div>
                <div className="rounded-lg bg-gray-800 p-3">
                  <p className="text-xs text-gray-500">Escalation</p>
                  <p className="text-sm font-medium text-white mt-0.5">{formatHours(sla.escalationHours)}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Badge variant={sla.priority === 'high' ? 'inProgress' : sla.priority === 'critical' ? 'returned' : 'default'}>
                  {sla.priority || 'medium'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTitle>{editing ? 'Edit SLA' : 'Add SLA'}</DialogTitle>
        <DialogDescription>{editing ? 'Update SLA configuration' : 'Create a new SLA for document approvals'}</DialogDescription>
        <div className="mt-4 space-y-4">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="SLA name" className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500" />
          <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Deadline (hours)</label>
              <input type="number" value={form.deadlineHours} onChange={(e) => setForm({ ...form, deadlineHours: Number(e.target.value) })} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Escalation (hours)</label>
              <input type="number" value={form.escalationHours} onChange={(e) => setForm({ ...form, escalationHours: Number(e.target.value) })} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Priority</label>
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setDialogOpen(false)} className="rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">Cancel</button>
            <Button onClick={handleSave}>{editing ? 'Update' : 'Create'}</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
