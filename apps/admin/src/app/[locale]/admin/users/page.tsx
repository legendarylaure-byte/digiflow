'use client';

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Users</h1><p className="text-gray-400">Manage system users and their roles</p></div>
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h3 className="text-base font-medium text-white mb-2">All Users</h3>
        <p className="text-sm text-gray-500">User list will load from Firestore. Admin CRUD operations here.</p>
      </div>
    </div>
  );
}
