'use client';

export default function AdminRolesPage() {
  const roles = ['Admin', 'Approver', 'Recommender', 'Viewer', 'Compliance'];
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Roles & Permissions</h1><p className="text-gray-400">Define roles and their access permissions</p></div>
      <div className="grid gap-4 sm:grid-cols-3">
        {roles.map((role) => (
          <div key={role} className="rounded-xl border border-gray-800 bg-gray-900 p-6">
            <h3 className="text-base font-medium text-white capitalize mb-2">{role}</h3>
            <p className="text-sm text-gray-500">
              {role === 'Admin' ? 'Full system access' : role === 'Approver' ? 'Can approve documents' : role === 'Recommender' ? 'Can review and recommend' : role === 'Viewer' ? 'Read-only access' : 'Compliance monitoring'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
