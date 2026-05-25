'use client';

import { X, Plus } from 'lucide-react';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import type { RuleAction } from '@digiflow/shared';

const ACTION_OPTIONS = [
  { value: 'add_recommender', label: 'Add Recommender' },
  { value: 'add_approver', label: 'Add Approver' },
  { value: 'remove_recommender', label: 'Remove Recommender' },
  { value: 'skip_step', label: 'Skip Step' },
  { value: 'set_confidential', label: 'Set Confidential' },
  { value: 'set_priority', label: 'Set Priority' },
  { value: 'notify', label: 'Notify' },
  { value: 'block', label: 'Block' },
];

interface ActionRowProps {
  action: RuleAction;
  index: number;
  onChange: (index: number, action: RuleAction) => void;
  onRemove: (index: number) => void;
}

function ActionRow({ action, index, onChange, onRemove }: ActionRowProps) {
  const updateType = (type: string) => {
    const defaults: Record<string, Record<string, unknown>> = {
      add_recommender: { targetUserId: '', stepOrder: 1 },
      add_approver: { targetUserId: '', stepOrder: 1 },
      remove_recommender: { targetUserId: '' },
      skip_step: { stepName: '' },
      set_confidential: { enabled: true },
      set_priority: { priority: 3 },
      notify: { message: '', templateId: '' },
      block: { reason: '' },
    };
    onChange(index, {
      type: type as RuleAction['type'],
      params: defaults[type] || {},
    });
  };

  const updateParam = (key: string, value: unknown) => {
    onChange(index, { ...action, params: { ...action.params, [key]: value } });
  };

  const renderParams = () => {
    switch (action.type) {
      case 'add_recommender':
      case 'add_approver':
        return (
          <div className="flex gap-2 items-center">
            <input
              value={String(action.params.targetUserId || '')}
              onChange={(e) => updateParam('targetUserId', e.target.value)}
              placeholder="User ID"
              className="flex-1 rounded-lg border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <input
              value={String(action.params.stepOrder || 1)}
              onChange={(e) => updateParam('stepOrder', Number(e.target.value))}
              placeholder="Step order"
              type="number"
              className="w-20 rounded-lg border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        );
      case 'remove_recommender':
        return (
          <input
            value={String(action.params.targetUserId || '')}
            onChange={(e) => updateParam('targetUserId', e.target.value)}
            placeholder="User ID"
            className="flex-1 rounded-lg border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        );
      case 'skip_step':
        return (
          <input
            value={String(action.params.stepName || '')}
            onChange={(e) => updateParam('stepName', e.target.value)}
            placeholder="Step name to skip"
            className="flex-1 rounded-lg border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        );
      case 'set_confidential':
        return (
          <label className="flex items-center gap-2 text-sm text-gray-400">
            <input
              type="checkbox"
              checked={action.params.enabled === true}
              onChange={(e) => updateParam('enabled', e.target.checked)}
              className="rounded border-gray-600"
            />
            Mark as confidential
          </label>
        );
      case 'set_priority':
        return (
          <Select
            value={String(action.params.priority || 3)}
            onValueChange={(v) => updateParam('priority', Number(v))}
            options={[
              { value: '1', label: 'Urgent (1)' },
              { value: '2', label: 'High (2)' },
              { value: '3', label: 'Normal (3)' },
              { value: '4', label: 'Low (4)' },
            ]}
            className="w-28"
          />
        );
      case 'notify':
        return (
          <div className="flex gap-2 items-center">
            <input
              value={String(action.params.message || '')}
              onChange={(e) => updateParam('message', e.target.value)}
              placeholder="Notification message"
              className="flex-1 rounded-lg border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <input
              value={String(action.params.templateId || '')}
              onChange={(e) => updateParam('templateId', e.target.value)}
              placeholder="Template ID (optional)"
              className="w-32 rounded-lg border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        );
      case 'block':
        return (
          <input
            value={String(action.params.reason || '')}
            onChange={(e) => updateParam('reason', e.target.value)}
            placeholder="Block reason"
            className="flex-1 rounded-lg border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900/80 p-3 space-y-2 group">
      <div className="flex items-center justify-between">
        <Select
          value={action.type}
          onValueChange={updateType}
          options={ACTION_OPTIONS}
          className="flex-1"
        />
        <button onClick={() => onRemove(index)} className="p-1 text-gray-500 hover:text-rose-400 transition-colors ml-2">
          <X className="h-4 w-4" />
        </button>
      </div>
      {renderParams()}
    </div>
  );
}

interface RuleActionsProps {
  actions: RuleAction[];
  onChange: (actions: RuleAction[]) => void;
}

export function RuleActions({ actions, onChange }: RuleActionsProps) {
  const handleAdd = () => {
    onChange([...actions, { type: 'add_recommender', params: { targetUserId: '', stepOrder: 1 } }]);
  };

  const handleChange = (index: number, action: RuleAction) => {
    onChange(actions.map((a, i) => (i === index ? action : a)));
  };

  const handleRemove = (index: number) => {
    onChange(actions.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-gray-300">Actions</label>
      {actions.length === 0 ? (
        <div className="flex items-center justify-center rounded-lg border border-dashed border-gray-700 bg-gray-900/50 py-8">
          <p className="text-sm text-gray-500">No actions configured. What should happen when conditions match?</p>
        </div>
      ) : (
        <div className="space-y-2">
          {actions.map((action, index) => (
            <ActionRow key={index} action={action} index={index} onChange={handleChange} onRemove={handleRemove} />
          ))}
        </div>
      )}
      <Button variant="outline" size="sm" onClick={handleAdd} className="w-full">
        <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Action
      </Button>
    </div>
  );
}

RuleActions.displayName = 'RuleActions';
