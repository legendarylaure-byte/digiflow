'use client';

import { useState } from 'react';
import { collection, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useCollection } from '@/hooks/use-collection';
import { Plus, Trash2, Building2 } from 'lucide-react';
import { toast } from 'sonner';

interface DepartmentDoc {
  id: string;
  name: string;
  description?: string;
  headCount?: number;
  isActive?: boolean;
}

export default function AdminDepartmentsPage() {
  const { data: departments, loading, refetch } = useCollection<DepartmentDoc>('departments');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');

  const handleAdd = async () => {
    if (!newName.trim()) return;
    try {
      await addDoc(collection(db, 'departments'), {
        name: newName.trim(),
        description: `${newName.trim()} department`,
        isActive: true,
        createdAt: new Date(),
      });
      toast.success('Department created');
      setNewName('');
      setDialogOpen(false);
      refetch();
    } catch {
      toast.error('Failed to create department');
    }
  };

  const handleDelete = async (dept: DepartmentDoc) => {
    if (!confirm(`Delete "${dept.name}"?`)) return;
    try {
      await deleteDoc(doc(db, 'departments', dept.id));
      toast.success('Department deleted');
      refetch();
    } catch {
      toast.error('Failed to delete department');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Departments</h1>
          <p className="text-gray-400">Manage organizational departments</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" /> Add Department
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl border border-gray-800 bg-gray-900 p-6" />
          ))}
        </div>
      ) : departments.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-700 bg-gray-900/50 py-16">
          <Building2 className="h-10 w-10 text-gray-600 mb-3" />
          <p className="text-sm text-gray-500">No departments yet</p>
          <Button variant="outline" className="mt-4" onClick={() => setDialogOpen(true)}>Create Department</Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {departments.map((dept) => (
            <div key={dept.id} className="group rounded-xl border border-gray-800 bg-gray-900 p-6 transition-colors hover:border-gray-700">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-gray-500" />
                  <h3 className="text-base font-medium text-white">{dept.name}</h3>
                </div>
                <button
                  onClick={() => handleDelete(dept)}
                  className="rounded p-1 text-gray-600 opacity-0 transition-all hover:text-rose-400 group-hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">{dept.description || `${dept.name} department`}</p>
              {dept.headCount !== undefined && (
                <div className="mt-3 flex items-center gap-2">
                  <Badge variant="default">{dept.headCount} members</Badge>
                  <Badge variant={dept.isActive !== false ? 'active' : 'inactive'}>
                    {dept.isActive !== false ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTitle>Add Department</DialogTitle>
        <DialogDescription>Create a new organizational department</DialogDescription>
        <div className="mt-4 space-y-4">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Department name"
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <div className="flex justify-end gap-2">
            <button onClick={() => setDialogOpen(false)} className="rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">Cancel</button>
            <Button onClick={handleAdd}>Create</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
