'use client';

export default function AdminAuditPage() {
  const entries = [
    { action: 'User login', user: 'admin@vyomai.com', time: '2 min ago' },
    { action: 'Document approved', user: 'admin@vyomai.com', time: '15 min ago' },
    { action: 'Workflow started', user: 'user@vyomai.com', time: '1 hour ago' },
    { action: 'Document uploaded', user: 'user@vyomai.com', time: '3 hours ago' },
  ];
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Audit Log</h1><p className="text-gray-400">View system-wide audit trail (append-only)</p></div>
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h3 className="text-base font-medium text-white mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {entries.map((entry, i) => (
            <div key={i} className="flex items-center justify-between border-b border-gray-800 pb-2 last:border-0">
              <div>
                <p className="text-sm text-gray-200">{entry.action}</p>
                <p className="text-xs text-gray-500">{entry.user}</p>
              </div>
              <span className="text-xs text-gray-500">{entry.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
