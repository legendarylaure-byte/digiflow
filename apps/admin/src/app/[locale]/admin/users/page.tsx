'use client';

import { useState } from 'react';
import { collection, query, orderBy, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Badge, type BadgeVariant } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select } from '@/components/ui/select';
import { useCollection } from '@/hooks/use-collection';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { ROLES } from '@digiflow/shared';

interface UserDoc {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  isActive: boolean;
  lastLogin?: { toDate?: () => Date } | Date | null;
  designation?: string;
  phone?: string;
}

export default function AdminUsersPage() {
  const { data: users, loading, refetch } = useCollection<UserDoc>('users', [orderBy('name', 'asc')]);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserDoc | null>(null);
  const [form, setForm] = useState({ name: '', email: '', role: 'viewer', department: '' });

  const filtered = users.filter((u) =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSave = async () => {
    if (!form.name || !form.email) {
      toast.error('Name and email are required');
      return;
    }
    try {
      if (editingUser) {
        await updateDoc(doc(db, 'users', editingUser.id), { ...form });
        toast.success('User updated');
      } else {
        await addDoc(collection(db, 'users'), { ...form, isActive: true, createdAt: new Date(), updatedAt: new Date() });
        toast.success('User created');
      }
      setDialogOpen(false);
      setEditingUser(null);
      setForm({ name: '', email: '', role: 'viewer', department: '' });
      refetch();
    } catch {
      toast.error('Failed to save user');
    }
  };

  const handleToggleActive = async (user: UserDoc) => {
    try {
      await updateDoc(doc(db, 'users', user.id), { isActive: !user.isActive });
      toast.success(user.isActive ? 'User deactivated' : 'User activated');
      refetch();
    } catch {
      toast.error('Failed to update user');
    }
  };

  const handleDelete = async (user: UserDoc) => {
    if (!confirm(`Delete user "${user.name}"? This cannot be undone.`)) return;
    try {
      await deleteDoc(doc(db, 'users', user.id));
      toast.success('User deleted');
      refetch();
    } catch {
      toast.error('Failed to delete user');
    }
  };

  const openEdit = (user: UserDoc) => {
    setEditingUser(user);
    setForm({ name: user.name, email: user.email, role: user.role, department: user.department || '' });
    setDialogOpen(true);
  };

  const openCreate = () => {
    setEditingUser(null);
    setForm({ name: '', email: '', role: 'viewer', department: '' });
    setDialogOpen(true);
  };

  const columns: Column<UserDoc>[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (u) => <Badge variant={(u.role as BadgeVariant) || 'viewer'}>{u.role}</Badge>,
    },
    { key: 'department', label: 'Department', sortable: true },
    {
      key: 'isActive',
      label: 'Status',
      sortable: true,
      render: (u) => <Badge variant={u.isActive ? 'active' : 'inactive'}>{u.isActive ? 'Active' : 'Inactive'}</Badge>,
    },
    {
      key: 'lastLogin',
      label: 'Last Login',
      sortable: false,
      render: (u) => {
        const ll = u.lastLogin;
        const date = ll && typeof ll === 'object' && 'toDate' in ll ? (ll as { toDate: () => Date }).toDate() : (ll as Date | null);
        return (
          <span className="text-xs text-gray-500">
            {date instanceof Date ? date.toLocaleDateString() : 'Never'}
          </span>
        );
      },
    },
    {
      key: 'actions' as string,
      label: 'Actions',
      sortable: false,
      render: (u) => (
        <div className="flex items-center gap-1">
          <button onClick={() => openEdit(u)} className="rounded p-1.5 text-gray-500 hover:bg-gray-800 hover:text-gray-200 transition-colors">
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => handleToggleActive(u)} className="rounded p-1.5 text-gray-500 hover:bg-gray-800 hover:text-gray-200 transition-colors">
            {u.isActive ? '🔴' : '🟢'}
          </button>
          <button onClick={() => handleDelete(u)} className="rounded p-1.5 text-gray-500 hover:bg-gray-800 hover:text-rose-400 transition-colors">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="text-gray-400">Manage system users and their roles</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-1.5 h-4 w-4" /> Add User
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-gray-700 bg-gray-800 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        />
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        keyExtractor={(u) => u.id}
        emptyMessage="No users found"
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTitle>{editingUser ? 'Edit User' : 'Add User'}</DialogTitle>
        <DialogDescription>{editingUser ? 'Update user details' : 'Create a new user account'}</DialogDescription>
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Email</label>
            <input
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Email address"
              type="email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Role</label>
            <Select
              value={form.role}
              onValueChange={(v) => setForm({ ...form, role: v })}
              options={ROLES.map((r) => ({ value: r.value, label: r.label }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Department</label>
            <input
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Department"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setDialogOpen(false)}
              className="rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <Button onClick={handleSave}>{editingUser ? 'Update' : 'Create'}</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
