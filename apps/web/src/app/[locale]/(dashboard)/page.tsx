'use client';

import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Users,
  ArrowUpRight,
} from 'lucide-react';

export default function DashboardPage() {
  const t = useTranslations('nav');
  const { user, profile } = useAuth();

  const stats = [
    {
      label: 'Pending Actions',
      value: '3',
      icon: Clock,
      color: 'text-amber-600 bg-amber-50',
      trend: '+2 from yesterday',
    },
    {
      label: 'In Progress',
      value: '12',
      icon: FileText,
      color: 'text-blue-600 bg-blue-50',
      trend: '4 need attention',
    },
    {
      label: 'Approved This Month',
      value: '28',
      icon: CheckCircle2,
      color: 'text-emerald-600 bg-emerald-50',
      trend: '+15% vs last month',
    },
    {
      label: 'SLA Breaches',
      value: '1',
      icon: AlertTriangle,
      color: 'text-red-600 bg-red-50',
      trend: 'Needs review',
    },
  ];

  const recentActivity = [
    { action: 'Budget Proposal 2026', status: 'approved', user: 'Ram Sharma', time: '2 hours ago' },
    { action: 'IT Policy Update', status: 'in_progress', user: 'Shyam Thapa', time: '4 hours ago' },
    { action: 'Q3 Financial Report', status: 'returned', user: 'Hari Adhikari', time: '1 day ago' },
    { action: 'HR Memo #42', status: 'approved', user: 'Sita KC', time: '2 days ago' },
    { action: 'Project Proposal - ERP', status: 'draft', user: 'You', time: '3 days ago' },
  ];

  function getStatusVariant(status: string) {
    switch (status) {
      case 'approved': return 'approved' as const;
      case 'in_progress': return 'inProgress' as const;
      case 'returned': return 'returned' as const;
      case 'draft': return 'draft' as const;
      default: return 'default' as const;
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="rounded-xl bg-gradient-to-r from-brand-600 to-brand-800 p-6 text-white">
        <h2 className="text-2xl font-bold">
          Welcome back, {user?.displayName?.split(' ')[0] || 'User'} 👋
        </h2>
        <p className="mt-1 text-brand-100">
          You have <span className="font-semibold text-white">3 pending actions</span> that need your attention.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={cn('rounded-lg p-2', stat.color)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-gray-400" />
                </div>
                <p className="mt-3 text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="mt-1 text-xs text-gray-400">{stat.trend}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{item.action}</p>
                  <p className="text-xs text-gray-500">
                    {item.user} &middot; {item.time}
                  </p>
                </div>
                <Badge variant={getStatusVariant(item.status)} className="capitalize">
                  {item.status.replace('_', ' ')}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions + Insights Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <a
              href="/documents/upload"
              className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 text-sm hover:border-brand-500 hover:bg-brand-50 transition-colors"
            >
              <Upload className="h-5 w-5 text-brand-600" />
              <span>Upload a new document</span>
            </a>
            <a
              href="/inbox"
              className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 text-sm hover:border-brand-500 hover:bg-brand-50 transition-colors"
            >
              <Inbox className="h-5 w-5 text-brand-600" />
              <span>Review pending approvals</span>
            </a>
            <a
              href="/documents"
              className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 text-sm hover:border-brand-500 hover:bg-brand-50 transition-colors"
            >
              <Search className="h-5 w-5 text-brand-600" />
              <span>Search documents</span>
            </a>
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-brand-600" />
              AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg bg-brand-50 p-3">
              <p className="text-sm text-brand-800">
                <strong>💡 Smart Suggestion:</strong> Finance department documents take 3 days longer than average. Consider a pre-submission checklist.
              </p>
            </div>
            <div className="rounded-lg bg-amber-50 p-3">
              <p className="text-sm text-amber-800">
                <strong>⚠️ Anomaly Detected:</strong> "IT Budget Proposal" has been with Recommender #1 for 52 hours. Consider escalation.
              </p>
            </div>
            <div className="rounded-lg bg-emerald-50 p-3">
              <p className="text-sm text-emerald-800">
                <strong>🏆 Hall of Fame:</strong> Sita KC was the fastest approver this week (avg. 4.2 hours).
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Helper for classnames
function cn(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}
function Upload(props: React.SVGProps<SVGSVGElement>) { return <svg {...props} /* lucide upload */><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>; }
function Inbox(props: React.SVGProps<SVGSVGElement>) { return <svg {...props} /* lucide inbox */><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>; }
function Search(props: React.SVGProps<SVGSVGElement>) { return <svg {...props} /* lucide search */><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>; }
