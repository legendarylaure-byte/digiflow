'use client';

import { useState } from 'react';
import { collection, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useCollection } from '@/hooks/use-collection';
import { Bell, Mail, Smartphone } from 'lucide-react';
import { toast } from 'sonner';

interface NotificationTemplate {
  id: string;
  name: string;
  description: string;
  subject: string;
  body: string;
  channels: string[];
  active: boolean;
}

const CHANNEL_ICONS: Record<string, React.ReactNode> = {
  email: <Mail className="h-3.5 w-3.5" />,
  push: <Smartphone className="h-3.5 w-3.5" />,
  in_app: <Bell className="h-3.5 w-3.5" />,
};

export default function AdminNotificationsPage() {
  const { data: templates, loading, refetch } = useCollection<NotificationTemplate>('notification_templates');

  const handleToggle = async (tmpl: NotificationTemplate) => {
    try {
      await updateDoc(doc(db, 'notification_templates', tmpl.id), { active: !tmpl.active });
      toast.success(`${tmpl.name} ${tmpl.active ? 'disabled' : 'enabled'}`);
      refetch();
    } catch {
      toast.error('Failed to update template');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Notifications</h1>
        <p className="text-gray-400">Manage system notifications and templates</p>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-36 animate-pulse rounded-xl border border-gray-800 bg-gray-900 p-6" />
          ))}
        </div>
      ) : templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-700 bg-gray-900/50 py-16">
          <Bell className="h-10 w-10 text-gray-600 mb-3" />
          <p className="text-sm text-gray-500">No notification templates configured</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {templates.map((tmpl) => (
            <div key={tmpl.id} className="rounded-xl border border-gray-800 bg-gray-900 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-medium text-white">{tmpl.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">{tmpl.description}</p>
                </div>
                <Switch checked={tmpl.active} onCheckedChange={() => handleToggle(tmpl)} />
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Badge variant={tmpl.active ? 'enabled' : 'disabled'}>
                  {tmpl.active ? 'Active' : 'Inactive'}
                </Badge>
                {tmpl.channels?.map((ch) => (
                  <span key={ch} className="flex items-center gap-1 rounded-full bg-gray-800 px-2 py-0.5 text-xs text-gray-400">
                    {CHANNEL_ICONS[ch] || null}
                    {ch}
                  </span>
                ))}
              </div>
              {tmpl.subject && (
                <p className="mt-2 text-xs text-gray-600">Subject: {tmpl.subject}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
