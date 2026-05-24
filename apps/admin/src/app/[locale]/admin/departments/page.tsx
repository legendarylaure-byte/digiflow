'use client';

export default function AdminDepartmentsPage() {
  const depts = ['Finance', 'HR', 'IT', 'Marketing', 'Legal', 'Operations', 'Sales', 'Administration'];
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Departments</h1><p className="text-gray-400">Manage organizational departments</p></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {depts.map((d) => (
          <div key={d} className="rounded-xl border border-gray-800 bg-gray-900 p-6">
            <h3 className="text-base font-medium text-white">{d}</h3>
            <p className="mt-1 text-sm text-gray-500">Active department with standard routing</p>
          </div>
        ))}
      </div>
    </div>
  );
}
