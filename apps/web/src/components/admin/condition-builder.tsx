'use client';

import React, { useState } from 'react';
import { GripVertical, X, Plus } from 'lucide-react';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import type { Condition, RuleConditions } from '@digiflow/shared';

const FIELD_OPTIONS = [
  { value: 'department', label: 'Department' },
  { value: 'documentType', label: 'Document Type' },
  { value: 'amount', label: 'Amount' },
  { value: 'isConfidential', label: 'Is Confidential' },
  { value: 'uploaderRole', label: 'Uploader Role' },
  { value: 'priority', label: 'Priority' },
];

const OPERATOR_OPTIONS: Record<string, { value: string; label: string }[]> = {
  string: [
    { value: 'eq', label: 'Equals' },
    { value: 'neq', label: 'Not equals' },
    { value: 'contains', label: 'Contains' },
  ],
  number: [
    { value: 'eq', label: '=' },
    { value: 'neq', label: '≠' },
    { value: 'gt', label: '>' },
    { value: 'gte', label: '≥' },
    { value: 'lt', label: '<' },
    { value: 'lte', label: '≤' },
  ],
  boolean: [
    { value: 'is_true', label: 'Is true' },
  ],
};

function getFieldType(field: string): 'string' | 'number' | 'boolean' {
  switch (field) {
    case 'amount':
    case 'priority':
      return 'number';
    case 'isConfidential':
      return 'boolean';
    default:
      return 'string';
  }
}

function getOperatorOptions(field: string) {
  return OPERATOR_OPTIONS[getFieldType(field)] || OPERATOR_OPTIONS.string;
}

function getDefaultValue(field: string, operator: string): string | number | boolean {
  if (operator === 'is_true') return true;
  if (getFieldType(field) === 'number') return 0;
  return '';
}

interface ConditionRowProps {
  condition: Condition;
  index: number;
  onChange: (index: number, condition: Condition) => void;
  onRemove: (index: number) => void;
  onDragStart: (index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (index: number) => void;
}

function ConditionRow({ condition, index, onChange, onRemove, onDragStart, onDragOver, onDrop }: ConditionRowProps) {
  const fieldType = getFieldType(condition.field);
  const opOptions = getOperatorOptions(condition.field);

  const updateField = (field: string) => {
    const newOp = getOperatorOptions(field)[0]?.value || 'eq';
    onChange(index, {
      field: field as Condition['field'],
      operator: newOp as Condition['operator'],
      value: getDefaultValue(field, newOp),
    });
  };

  const updateOperator = (operator: string) => {
    onChange(index, {
      ...condition,
      operator: operator as Condition['operator'],
      value: operator === 'is_true' ? true : condition.value,
    });
  };

  const updateValue = (value: string) => {
    const parsed: string | number = fieldType === 'number' ? Number(value) : value;
    onChange(index, { ...condition, value: parsed });
  };

  const renderValueInput = () => {
    if (condition.operator === 'is_true') return <div className="text-sm text-gray-400 italic px-2">true</div>;

    if (fieldType === 'boolean') return null;

    if (condition.operator === 'in') {
      const arr = Array.isArray(condition.value) ? condition.value : [];
      return (
        <input
          value={arr.join(', ')}
          onChange={(e) => onChange(index, { ...condition, value: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
          placeholder="Comma-separated values"
          className="flex-1 rounded-lg border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 min-w-[120px]"
        />
      );
    }

    return (
      <input
        value={String(condition.value ?? '')}
        onChange={(e) => updateValue(e.target.value)}
        placeholder="Value"
        type={fieldType === 'number' ? 'number' : 'text'}
        className="flex-1 rounded-lg border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 min-w-[120px]"
      />
    );
  };

  return (
    <div
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={() => onDrop(index)}
      className="flex items-center gap-2 rounded-lg border border-gray-800 bg-gray-900/80 p-2 group"
    >
      <button className="cursor-grab active:cursor-grabbing text-gray-600 hover:text-gray-400">
        <GripVertical className="h-4 w-4" />
      </button>
      <Select
        value={condition.field}
        onValueChange={updateField}
        options={FIELD_OPTIONS}
        className="flex-1 min-w-[120px]"
      />
      <Select
        value={condition.operator}
        onValueChange={updateOperator}
        options={opOptions}
        className="flex-1 min-w-[100px]"
      />
      {renderValueInput()}
      <button onClick={() => onRemove(index)} className="p-1 text-gray-500 hover:text-rose-400 transition-colors">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

interface ConditionBuilderProps {
  conditions: RuleConditions;
  onChange: (conditions: RuleConditions) => void;
}

export function ConditionBuilder({ conditions, onChange }: ConditionBuilderProps) {
  const handleAddCondition = () => {
    const firstField = FIELD_OPTIONS[0].value;
    const newCondition: Condition = {
      field: firstField as Condition['field'],
      operator: 'eq',
      value: '',
    };
    onChange({
      ...conditions,
      rules: [...conditions.rules, newCondition],
    });
  };

  const handleRemoveCondition = (index: number) => {
    const newRules = conditions.rules.filter((_, i) => i !== index);
    onChange({ ...conditions, rules: newRules });
  };

  const handleChangeCondition = (index: number, condition: Condition) => {
    const newRules = conditions.rules.map((r, i) => (i === index ? condition : r));
    onChange({ ...conditions, rules: newRules });
  };

  const [dragIndex, setDragIndex] = React.useState<number | null>(null);

  const handleDragStart = (index: number) => setDragIndex(index);
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    const newRules = [...conditions.rules];
    const [moved] = newRules.splice(dragIndex, 1);
    newRules.splice(index, 0, moved);
    onChange({ ...conditions, rules: newRules });
    setDragIndex(index);
  };
  const handleDrop = () => setDragIndex(null);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-300">Conditions</label>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Match</span>
          <Select
            value={conditions.operator}
            onValueChange={(v) => onChange({ ...conditions, operator: v as 'AND' | 'OR' })}
            options={[
              { value: 'AND', label: 'All (AND)' },
              { value: 'OR', label: 'Any (OR)' },
            ]}
            className="w-28"
          />
        </div>
      </div>
      {conditions.rules.length === 0 ? (
        <div className="flex items-center justify-center rounded-lg border border-dashed border-gray-700 bg-gray-900/50 py-8">
          <p className="text-sm text-gray-500">No conditions yet. Add a condition to start.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {conditions.rules.map((cond, index) => (
            <ConditionRow
              key={index}
              condition={cond}
              index={index}
              onChange={handleChangeCondition}
              onRemove={handleRemoveCondition}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            />
          ))}
        </div>
      )}
      <Button variant="outline" size="sm" onClick={handleAddCondition} className="w-full">
        <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Condition
      </Button>
    </div>
  );
}

ConditionRow.displayName = 'ConditionRow';
ConditionBuilder.displayName = 'ConditionBuilder';
