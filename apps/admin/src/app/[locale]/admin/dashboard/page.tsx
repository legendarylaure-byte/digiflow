'use client';

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-gray-400">System overview and health monitoring</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Users', value: '0', color: 'bg-blue-500' },
          { label: 'Active Documents', value: '0', color: 'bg-emerald-500' },
          { label: 'Pending Approvals', value: '0', color: 'bg-amber-500' },
          { label: 'System Health', value: 'Online', color: 'bg-green-500' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-gray-800 bg-gray-900 p-6">
            <div className={`mb-3 h-2 w-2 rounded-full ${stat.color}`} />
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-sm text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
