'use client';

export default function AdminNotificationsPage() {
  const notifs = [
    { name: 'Approval Request', desc: 'Sent when a document needs approval', active: true },
    { name: 'Approval Confirmation', desc: 'Sent when a document is approved', active: true },
    { name: 'Document Returned', desc: 'Sent when a document is returned', active: true },
    { name: 'SLA Breach Alert', desc: 'Sent when a deadline is missed', active: true },
  ];
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Notifications</h1><p className="text-gray-400">Manage system notifications and templates</p></div>
      <div className="grid gap-4 sm:grid-cols-2">
        {notifs.map((n) => (
          <div key={n.name} className="rounded-xl border border-gray-800 bg-gray-900 p-6">
            <h3 className="text-base font-medium text-white">{n.name}</h3>
            <p className="mt-1 text-sm text-gray-500">{n.desc}</p>
            <span className={`mt-2 inline-block text-xs px-2 py-0.5 rounded-full ${n.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'}`}>
              {n.active ? 'Active' : 'Inactive'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
