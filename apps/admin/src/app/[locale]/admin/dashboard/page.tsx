'use client';

import { Users, FileText, Clock, Activity } from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';
import { Badge } from '@/components/ui/badge';
import { useDashboardStats } from '@/hooks/use-dashboard-stats';

export default function AdminDashboardPage() {
  const stats = useDashboardStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-gray-400">System overview and health monitoring</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Users"
          value={stats.loading ? '...' : stats.totalUsers}
          icon={<Users className="h-5 w-5" />}
          color="violet"
        />
        <StatCard
          label="Active Documents"
          value={stats.loading ? '...' : stats.activeDocuments}
          icon={<FileText className="h-5 w-5" />}
          color="emerald"
        />
        <StatCard
          label="Pending Approvals"
          value={stats.loading ? '...' : stats.pendingApprovals}
          icon={<Clock className="h-5 w-5" />}
          color="amber"
        />
        <StatCard
          label="System Health"
          value={stats.error ? 'Error' : 'Online'}
          icon={<Activity className="h-5 w-5" />}
          color={stats.error ? 'rose' : 'emerald'}
          description="All services operational"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <h3 className="text-base font-medium text-white mb-4">Documents by Status</h3>
          {stats.loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-8 animate-pulse rounded bg-gray-800" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {[
                { label: 'Draft', count: stats.documentsByStatus.draft, color: 'bg-gray-500', badge: 'draft' as const },
                { label: 'In Progress', count: stats.documentsByStatus.in_progress, color: 'bg-amber-500', badge: 'inProgress' as const },
                { label: 'Approved', count: stats.documentsByStatus.approved, color: 'bg-emerald-500', badge: 'approved' as const },
                { label: 'Returned', count: stats.documentsByStatus.returned, color: 'bg-rose-500', badge: 'returned' as const },
              ].map((item) => {
                const total = Object.values(stats.documentsByStatus).reduce((a, b) => a + b, 0) || 1;
                const pct = Math.round((item.count / total) * 100);
                return (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${item.color}`} />
                        <span className="text-sm text-gray-300">{item.label}</span>
                      </div>
                      <Badge variant={item.badge}>{item.count}</Badge>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-800">
                      <div className={`h-full rounded-full ${item.color} transition-all duration-500`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <h3 className="text-base font-medium text-white mb-4">Users by Role</h3>
          {stats.loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-8 animate-pulse rounded bg-gray-800" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(stats.usersByRole)
                .sort(([, a], [, b]) => b - a)
                .map(([role, count]) => {
                  const total = Object.values(stats.usersByRole).reduce((a, b) => a + b, 0) || 1;
                  const pct = Math.round((count / total) * 100);
                  return (
                    <div key={role}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm capitalize text-gray-300">{role}</span>
                        <span className="text-xs text-gray-500">{pct}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-800">
                        <div className="h-full rounded-full bg-brand-600 transition-all duration-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h3 className="text-base font-medium text-white mb-4">Recent Activity</h3>
        {stats.loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="h-4 w-48 animate-pulse rounded bg-gray-800" />
                <div className="h-3 w-20 animate-pulse rounded bg-gray-800" />
              </div>
            ))}
          </div>
        ) : stats.recentActivity.length === 0 ? (
          <p className="text-sm text-gray-500 py-4 text-center">No recent activity</p>
        ) : (
          <div className="space-y-2">
            {stats.recentActivity.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between rounded-lg border border-gray-800 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-brand-500" />
                  <div>
                    <p className="text-sm text-gray-200 capitalize">{entry.action.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-gray-500">{entry.userName}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">
                  {entry.timestamp instanceof Date
                    ? entry.timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                    : ''}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
