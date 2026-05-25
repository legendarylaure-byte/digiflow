'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCollection } from '@/hooks/use-collection';
import { collection, doc, updateDoc, orderBy, where, query, getCountFromServer } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { AlertTriangle, CheckCircle2, Loader2, User, Clock, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

interface AnomalyAlert {
  id: string;
  userId: string;
  count: number;
  reason: string;
  detectedAt: { toMillis: () => number } | string;
  resolved: boolean;
}

export default function AdminAnomaliesPage() {
  const { data: anomalies, loading, refetch } = useCollection<AnomalyAlert>('anomaly_alerts', [
    orderBy('detectedAt', 'desc'),
  ]);

  const unresolved = anomalies.filter((a) => !a.resolved);

  const handleResolve = async (id: string) => {
    try {
      await updateDoc(doc(db, 'anomaly_alerts', id), { resolved: true });
      toast.success('Anomaly resolved');
      refetch();
    } catch {
      toast.error('Failed to resolve');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-6 w-6 text-rose-400" />
          <h1 className="text-2xl font-bold text-white">Anomaly Alerts</h1>
          {unresolved.length > 0 && (
            <Badge variant="inProgress">{unresolved.length} unresolved</Badge>
          )}
        </div>
      </div>
      <p className="text-gray-400">Automatically detected unusual activity patterns</p>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      ) : anomalies.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-700 bg-gray-900/50 py-16">
          <CheckCircle2 className="h-10 w-10 text-emerald-500 mb-3" />
          <p className="text-sm text-gray-500">No anomalies detected</p>
          <p className="text-xs text-gray-600 mt-1">The system checks hourly for unusual activity</p>
        </div>
      ) : (
        <div className="space-y-3">
          {anomalies.map((alert) => (
            <div
              key={alert.id}
              className={`rounded-xl border p-5 transition-colors ${alert.resolved ? 'border-gray-800 bg-gray-900/50 opacity-60' : 'border-rose-800/40 bg-rose-900/10'}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`rounded-lg p-2 mt-0.5 ${alert.resolved ? 'bg-gray-800 text-gray-500' : 'bg-rose-500/20 text-rose-400'}`}>
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium text-white">{alert.reason}</h3>
                      <Badge variant={alert.resolved ? 'inactive' : 'inProgress'}>
                        {alert.resolved ? 'Resolved' : 'Active'}
                      </Badge>
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><User className="h-3 w-3" /> {alert.userId}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {alert.detectedAt?.toMillis ? new Date(alert.detectedAt.toMillis()).toLocaleString() : 'N/A'}
                      </span>
                      <span>{alert.count} approvals in 24h</span>
                    </div>
                  </div>
                </div>
                {!alert.resolved && (
                  <Button size="sm" variant="outline" onClick={() => handleResolve(alert.id)}>
                    <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Resolve
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
