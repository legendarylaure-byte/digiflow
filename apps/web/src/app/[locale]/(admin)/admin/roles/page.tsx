'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/hooks/use-auth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ROLES } from '@digiflow/shared';
import { Shield, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const PERMISSION_GROUPS = [
  { key: 'documents', label: 'Documents', perms: ['view', 'create', 'edit', 'delete'] },
  { key: 'users', label: 'Users', perms: ['view', 'create', 'edit', 'delete'] },
  { key: 'workflows', label: 'Workflows', perms: ['view', 'configure'] },
  { key: 'settings', label: 'Settings', perms: ['view', 'edit'] },
  { key: 'analytics', label: 'Analytics', perms: ['view'] },
  { key: 'audit', label: 'Audit Log', perms: ['view'] },
];

const DEFAULT_PERMISSIONS: Record<string, Record<string, Record<string, boolean>>> = {
  admin: { documents: { view: true, create: true, edit: true, delete: true }, users: { view: true, create: true, edit: true, delete: true }, workflows: { view: true, configure: true }, settings: { view: true, edit: true }, analytics: { view: true }, audit: { view: true } },
  approver: { documents: { view: true, create: false, edit: false, delete: false }, users: { view: true, create: false, edit: false, delete: false }, workflows: { view: true, configure: false }, settings: { view: false, edit: false }, analytics: { view: true }, audit: { view: false } },
  recommender: { documents: { view: true, create: false, edit: false, delete: false }, users: { view: true, create: false, edit: false, delete: false }, workflows: { view: true, configure: false }, settings: { view: false, edit: false }, analytics: { view: false }, audit: { view: false } },
  hod: { documents: { view: true, create: true, edit: false, delete: false }, users: { view: true, create: false, edit: false, delete: false }, workflows: { view: true, configure: false }, settings: { view: false, edit: false }, analytics: { view: true }, audit: { view: false } },
  creator: { documents: { view: true, create: true, edit: true, delete: false }, users: { view: false, create: false, edit: false, delete: false }, workflows: { view: true, configure: false }, settings: { view: false, edit: false }, analytics: { view: false }, audit: { view: false } },
  viewer: { documents: { view: true, create: false, edit: false, delete: false }, users: { view: false, create: false, edit: false, delete: false }, workflows: { view: false, configure: false }, settings: { view: false, edit: false }, analytics: { view: false }, audit: { view: false } },
};

export default function AdminRolesPage() {
  const { user } = useAuth();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<Record<string, Record<string, Record<string, boolean>>>>({});
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!user) return;
    const ref = doc(db, 'roles', 'permissions');
    getDoc(ref).then((snap) => {
      if (snap.exists()) {
        setPermissions(snap.data() as Record<string, Record<string, Record<string, boolean>>>);
      } else {
        setPermissions(DEFAULT_PERMISSIONS);
      }
      setLoaded(true);
    });
  }, [user]);

  const togglePerm = (role: string, group: string, perm: string) => {
    if (role === 'admin') return;
    setPermissions((prev) => {
      const updated = { ...prev };
      updated[role] = { ...updated[role], [group]: { ...updated[role]?.[group], [perm]: !updated[role]?.[group]?.[perm] } };
      return updated;
    });
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'roles', 'permissions'), permissions);
      toast.success('Permissions saved');
      setDirty(false);
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const roleInfo = selectedRole ? ROLES.find((r) => r.value === selectedRole) : null;
  const rolePerms = selectedRole ? permissions[selectedRole] : null;

  if (!loaded) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Roles & Permissions</h1><p className="text-gray-400">Define roles and their access permissions</p></div>
        {dirty && <Button onClick={handleSave} disabled={saving}>{saving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : null}Save Changes</Button>}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ROLES.map((role) => (
          <button key={role.value} onClick={() => setSelectedRole(role.value === selectedRole ? null : role.value)}
            className={`rounded-xl border p-6 text-left transition-all ${selectedRole === role.value ? 'border-brand-500 bg-brand-500/10' : 'border-gray-800 bg-gray-900 hover:border-gray-700'}`}>
            <div className="flex items-center gap-3">
              <Shield className={`h-5 w-5 ${selectedRole === role.value ? 'text-brand-400' : 'text-gray-500'}`} />
              <h3 className="text-base font-medium text-white capitalize">{role.label}</h3>
              <Badge variant={role.value as any}>{role.value}</Badge>
            </div>
            <p className="mt-2 text-xs text-gray-500">{role.value === 'admin' ? 'Full system access' : role.value === 'approver' ? 'Can approve documents' : role.value === 'recommender' ? 'Can review and recommend' : role.value === 'hod' ? 'Department oversight' : role.value === 'creator' ? 'Can create and edit documents' : 'Read-only access'}</p>
          </button>
        ))}
      </div>

      {selectedRole && rolePerms && (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-medium text-white capitalize">{roleInfo?.label} Permissions</h3>
            {selectedRole === 'admin' && <Badge variant="default">Admin has all permissions (cannot be modified)</Badge>}
          </div>
          <div className="space-y-4">
            {PERMISSION_GROUPS.map((group) => (
              <div key={group.key}>
                <h4 className="text-sm font-medium text-gray-300 capitalize mb-2">{group.label}</h4>
                <div className="flex flex-wrap gap-3">
                  {group.perms.map((perm) => {
                    const enabled = rolePerms?.[group.key]?.[perm] ?? false;
                    return (
                      <label key={perm}
                        className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${enabled ? 'border-brand-500/30 bg-brand-500/10 text-brand-300' : 'border-gray-700 text-gray-500 hover:border-gray-600'}`}>
                        {enabled ? <CheckCircle2 className="h-3.5 w-3.5 text-brand-400" /> : <XCircle className="h-3.5 w-3.5 text-gray-600" />}
                        <span className="capitalize">{perm}</span>
                        <Switch checked={enabled} onCheckedChange={() => togglePerm(selectedRole, group.key, perm)} disabled={selectedRole === 'admin'} className="ml-1" />
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
