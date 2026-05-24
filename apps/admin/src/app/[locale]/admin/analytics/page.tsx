'use client';

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Analytics</h1><p className="text-gray-400">System analytics and reporting dashboards</p></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Documents Processed', value: '0', desc: 'Total this month' },
          { label: 'Avg. Approval Time', value: '—', desc: 'Across all workflows' },
          { label: 'Active Users', value: '0', desc: 'Last 30 days' },
          { label: 'SLA Compliance', value: '—', desc: 'Percentage on time' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-gray-800 bg-gray-900 p-6">
            <p className="text-3xl font-bold text-white">{s.value}</p>
            <p className="text-sm font-medium text-gray-300 mt-1">{s.label}</p>
            <p className="text-xs text-gray-500 mt-1">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
