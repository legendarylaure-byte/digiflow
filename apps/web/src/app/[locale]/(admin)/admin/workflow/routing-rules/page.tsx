'use client';

import { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Dialog, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useCollection } from '@/hooks/use-collection';
import { ConditionBuilder } from '@/components/admin/condition-builder';
import { RuleActions } from '@/components/admin/rule-actions';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, GitBranch } from 'lucide-react';
import { toast } from 'sonner';
import type { RoutingRule, RuleConditions, RuleAction } from '@digiflow/shared';

type RuleDoc = Omit<RoutingRule, 'createdAt' | 'updatedAt'> & {
  createdAt?: Date;
  updatedAt?: Date;
};

const defaultConditions: RuleConditions = {
  operator: 'AND',
  rules: [],
};

const defaultActions: RuleAction[] = [];

export default function AdminRoutingRulesPage() {
  const { data: rules, loading, refetch } = useCollection<RuleDoc>('routing_rules');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<RuleDoc | null>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    enabled: true,
    priority: 100,
    conditions: defaultConditions,
    actions: defaultActions,
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', description: '', enabled: true, priority: 100, conditions: defaultConditions, actions: defaultActions });
    setDialogOpen(true);
  };

  const openEdit = (rule: RuleDoc) => {
    setEditing(rule);
    setForm({
      name: rule.name,
      description: rule.description || '',
      enabled: rule.enabled,
      priority: rule.priority ?? 100,
      conditions: rule.conditions || defaultConditions,
      actions: rule.actions || defaultActions,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    if (!form.conditions?.rules?.length) { toast.error('At least one condition is required'); return; }
    if (!form.actions?.length) { toast.error('At least one action is required'); return; }
    try {
      const data = {
        name: form.name.trim(),
        description: form.description.trim(),
        enabled: form.enabled,
        priority: form.priority,
        conditions: form.conditions,
        actions: form.actions,
        updatedAt: new Date(),
      };
      if (editing) {
        await updateDoc(doc(db, 'routing_rules', editing.id), data);
        toast.success('Routing rule updated');
      } else {
        await addDoc(collection(db, 'routing_rules'), {
          ...data,
          createdAt: new Date(),
          triggerCount: 0,
          lastTriggeredAt: null,
        });
        toast.success('Routing rule created');
      }
      setDialogOpen(false);
      setEditing(null);
      refetch();
    } catch {
      toast.error('Failed to save routing rule');
    }
  };

  const handleDelete = async (rule: RuleDoc) => {
    if (!confirm(`Delete rule "${rule.name}"?`)) return;
    try {
      await deleteDoc(doc(db, 'routing_rules', rule.id));
      toast.success('Rule deleted');
      refetch();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const toggleEnabled = async (rule: RuleDoc) => {
    try {
      await updateDoc(doc(db, 'routing_rules', rule.id), { enabled: !rule.enabled });
      refetch();
    } catch {
      toast.error('Failed to toggle');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Routing Rules</h1>
          <p className="text-gray-400">Define conditional rules for intelligent document routing and automation</p>
        </div>
        <Button onClick={openCreate}><Plus className="mr-1.5 h-4 w-4" /> Create Rule</Button>
      </div>

      {loading ? (
        <div className="grid gap-4">{[1, 2, 3].map((i) => <div key={i} className="h-24 animate-pulse rounded-xl border border-gray-800 bg-gray-900 p-6" />)}</div>
      ) : rules.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-700 bg-gray-900/50 py-16">
          <GitBranch className="h-10 w-10 text-gray-600 mb-3" />
          <p className="text-sm text-gray-500">No routing rules configured</p>
          <p className="text-xs text-gray-600 mt-1">Define rules to automatically route, prioritize, and process documents</p>
          <Button variant="outline" className="mt-4" onClick={openCreate}>Create Routing Rule</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {rules.map((rule) => (
            <div key={rule.id} className="group rounded-xl border border-gray-800 bg-gray-900 p-5 transition-colors hover:border-gray-700">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-medium text-white truncate">{rule.name}</h3>
                    <Badge variant={rule.enabled ? 'active' : 'inactive'}>{rule.enabled ? 'Enabled' : 'Disabled'}</Badge>
                    <Badge variant="default">Priority {rule.priority}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">{rule.description || `${rule.conditions?.rules?.length || 0} condition(s) → ${rule.actions?.length || 0} action(s)`}</p>
                </div>
                <div className="flex gap-1 ml-3">
                  <button onClick={() => toggleEnabled(rule)} className="rounded p-1.5 text-gray-500 hover:bg-gray-800 hover:text-gray-200" title={rule.enabled ? 'Disable' : 'Enable'}>
                    {rule.enabled ? <ToggleRight className="h-4 w-4 text-emerald-400" /> : <ToggleLeft className="h-4 w-4" />}
                  </button>
                  <button onClick={() => openEdit(rule)} className="rounded p-1.5 text-gray-500 hover:bg-gray-800 hover:text-gray-200"><Pencil className="h-3.5 w-3.5" /></button>
                  <button onClick={() => handleDelete(rule)} className="rounded p-1.5 text-gray-500 hover:bg-gray-800 hover:text-rose-400"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="default">
                  {rule.conditions?.operator || 'AND'} ({rule.conditions?.rules?.length || 0} condition{(rule.conditions?.rules?.length || 0) !== 1 ? 's' : ''})
                </Badge>
                <Badge variant="default">
                  {rule.actions?.length || 0} action{(rule.actions?.length || 0) !== 1 ? 's' : ''}
                </Badge>
                {rule.triggerCount > 0 && (
                  <Badge variant="default">Triggered {rule.triggerCount} time{(rule.triggerCount || 0) !== 1 ? 's' : ''}</Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) { setEditing(null); } setDialogOpen(open); }}>
        <div className="max-h-[80vh] overflow-y-auto space-y-6 pr-1">
          <DialogTitle>{editing ? 'Edit Routing Rule' : 'Create Routing Rule'}</DialogTitle>
          <DialogDescription>
            {editing ? 'Modify the rule conditions and actions' : 'Define conditions and actions for automated document routing'}
          </DialogDescription>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Rule Name *</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. High-Value Invoice → Director Approval"
                className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="When should this rule apply?"
                rows={2}
                className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Priority</label>
                <input
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })}
                  type="number"
                  min={0}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <p className="mt-0.5 text-xs text-gray-500">Lower numbers run first</p>
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 text-sm text-gray-400">
                  <input
                    type="checkbox"
                    checked={form.enabled}
                    onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
                    className="rounded border-gray-600"
                  />
                  Enabled
                </label>
              </div>
            </div>
          </div>

          <ConditionBuilder
            conditions={form.conditions}
            onChange={(conditions) => setForm({ ...form, conditions })}
          />

          <RuleActions
            actions={form.actions}
            onChange={(actions) => setForm({ ...form, actions })}
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-800">
            <button
              onClick={() => { setDialogOpen(false); setEditing(null); }}
              className="rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <Button onClick={handleSave}>{editing ? 'Update Rule' : 'Create Rule'}</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
