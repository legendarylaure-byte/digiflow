'use client';

export default function AdminAiConfigPage() {
  const features = [
    { name: 'Auto-Fill', desc: 'Extract metadata from uploaded documents', enabled: true },
    { name: 'Smart Summarization', desc: 'Generate AI summaries for documents', enabled: true },
    { name: 'Anomaly Detection', desc: 'Detect unusual approval patterns', enabled: true },
    { name: 'AI Chat Assistant', desc: 'Answer user questions about documents', enabled: false },
  ];
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white">AI Configuration</h1><p className="text-gray-400">Configure AI features and Gemini API settings</p></div>
      <div className="grid gap-4 sm:grid-cols-2">
        {features.map((f) => (
          <div key={f.name} className="rounded-xl border border-gray-800 bg-gray-900 p-6">
            <h3 className="text-base font-medium text-white">{f.name}</h3>
            <p className="mt-1 text-sm text-gray-500">{f.desc}</p>
            <span className={`mt-2 inline-block text-xs px-2 py-0.5 rounded-full ${f.enabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'}`}>
              {f.enabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
