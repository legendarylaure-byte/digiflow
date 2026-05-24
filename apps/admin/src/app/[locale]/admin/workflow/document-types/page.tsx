'use client';

export default function AdminDocTypesPage() {
  const types = ['Budget', 'Policy', 'Memo', 'Report', 'Invoice', 'Contract', 'HR', 'Technical', 'Other'];
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Document Types</h1><p className="text-gray-400">Manage document categories and their default workflows</p></div>
      <div className="grid gap-4 sm:grid-cols-3">
        {types.map((t) => (
          <div key={t} className="rounded-xl border border-gray-800 bg-gray-900 p-6">
            <h3 className="text-base font-medium text-white">{t}</h3>
            <p className="mt-1 text-sm text-gray-500">Default workflow: {t === 'Budget' ? '3-level approval' : t === 'Contract' ? 'Legal + Final approval' : 'Standard approval'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
