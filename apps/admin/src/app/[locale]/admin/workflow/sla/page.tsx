'use client';

export default function AdminSlaPage() {
  const slas = [
    { type: 'Standard', deadline: '7 days', escalation: 'Reminder at 5 days' },
    { type: 'Urgent', deadline: '24 hours', escalation: 'Reminder at 12 hours' },
    { type: 'Critical', deadline: '4 hours', escalation: 'Reminder at 2 hours' },
    { type: 'Budget Review', deadline: '14 days', escalation: 'Reminder at 10 days' },
  ];
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white">SLA Configuration</h1><p className="text-gray-400">Set deadlines and escalation rules for approvals</p></div>
      <div className="grid gap-4 sm:grid-cols-2">
        {slas.map((sla) => (
          <div key={sla.type} className="rounded-xl border border-gray-800 bg-gray-900 p-6">
            <h3 className="text-base font-medium text-white">{sla.type}</h3>
            <p className="mt-1 text-sm text-gray-500">Deadline: {sla.deadline}</p>
            <p className="text-sm text-gray-500">Escalation: {sla.escalation}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
