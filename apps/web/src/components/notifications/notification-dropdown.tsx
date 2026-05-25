'use client';

import { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, where, onSnapshot, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/hooks/use-auth';
import { Bell, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: Timestamp;
  documentId?: string;
  link?: string;
  actorName?: string;
}

export function NotificationDropdown() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
    );
    const unsub = onSnapshot(q, (snap) => {
      setNotifications(snap.docs.map((d) => ({ id: d.id, ...d.data() } as NotificationItem)));
      setLoading(false);
    });
    return unsub;
  }, [user]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markRead = async (notificationId: string) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), { read: true });
    } catch {}
  };

  const markAllRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    await Promise.all(unread.map((n) => markRead(n.id)));
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-emerald-400 bg-emerald-500/10';
      case 'warning': return 'text-amber-400 bg-amber-500/10';
      case 'error': return 'text-rose-400 bg-rose-500/10';
      default: return 'text-brand-400 bg-brand-500/10';
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-xl border border-gray-200 bg-white shadow-lg z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-brand-600 hover:text-brand-700 font-medium">
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center">
                <Bell className="mx-auto h-6 w-6 text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <a
                  key={n.id}
                  href={n.link || '#'}
                  onClick={() => { if (!n.read) markRead(n.id); setOpen(false); }}
                  className={cn(
                    'flex items-start gap-3 px-4 py-3 transition-colors hover:bg-gray-50 border-b border-gray-50 last:border-0',
                    !n.read && 'bg-brand-50/50',
                  )}
                >
                  <div className={cn('shrink-0 rounded-lg p-1.5 mt-0.5', getTypeColor(n.type))}>
                    <Bell className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-sm', !n.read ? 'font-semibold text-gray-900' : 'text-gray-700')}>{n.title}</p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{n.message}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {n.createdAt?.toMillis ? timeAgo(n.createdAt.toMillis()) : ''}
                    </p>
                  </div>
                  {!n.read && (
                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); markRead(n.id); }} className="shrink-0 p-1 text-gray-400 hover:text-gray-600">
                      <Check className="h-3.5 w-3.5" />
                    </button>
                  )}
                </a>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}
