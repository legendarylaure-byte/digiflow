'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, getCountFromServer, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export interface DashboardStats {
  totalUsers: number;
  activeDocuments: number;
  pendingApprovals: number;
  recentActivity: { id: string; action: string; userName: string; timestamp: Date; documentId?: string | null }[];
  documentsByStatus: { draft: number; in_progress: number; approved: number; returned: number };
  usersByRole: Record<string, number>;
  loading: boolean;
  error: string | null;
}

export function useDashboardStats(): DashboardStats {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeDocuments: 0,
    pendingApprovals: 0,
    recentActivity: [],
    documentsByStatus: { draft: 0, in_progress: 0, approved: 0, returned: 0 },
    usersByRole: {},
    loading: true,
    error: null,
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const [usersSnap, activeSnap, pendingSnap, recentSnap, draftSnap, approvedSnap, returnedSnap] =
          await Promise.all([
            getCountFromServer(query(collection(db, 'users'))),
            getCountFromServer(query(collection(db, 'documents'), where('status', '!=', 'draft'))),
            getCountFromServer(query(collection(db, 'documents'), where('status', '==', 'in_progress'))),
            getDocs(query(collection(db, 'audit_logs'), orderBy('timestamp', 'desc'), limit(10))),
            getCountFromServer(query(collection(db, 'documents'), where('status', '==', 'draft'))),
            getCountFromServer(query(collection(db, 'documents'), where('status', '==', 'approved'))),
            getCountFromServer(query(collection(db, 'documents'), where('status', '==', 'returned'))),
          ]);

        const usersSnap2 = await getDocs(query(collection(db, 'users')));
        const roleCounts: Record<string, number> = {};
        usersSnap2.docs.forEach((d) => {
          const role = d.data().role || 'unknown';
          roleCounts[role] = (roleCounts[role] || 0) + 1;
        });

        setStats({
          totalUsers: usersSnap.data().count,
          activeDocuments: activeSnap.data().count,
          pendingApprovals: pendingSnap.data().count,
          recentActivity: recentSnap.docs.map((d) => ({
            id: d.id,
            action: d.data().action || '',
            userName: d.data().userName || d.data().userId || '',
            timestamp: d.data().timestamp?.toDate ? d.data().timestamp.toDate() : new Date(),
            documentId: d.data().documentId,
          })),
          documentsByStatus: {
            draft: draftSnap.data().count,
            in_progress: pendingSnap.data().count,
            approved: approvedSnap.data().count,
            returned: returnedSnap.data().count,
          },
          usersByRole: roleCounts,
          loading: false,
          error: null,
        });
      } catch (err) {
        setStats((prev) => ({ ...prev, loading: false, error: (err as Error).message }));
      }
    }
    fetchStats();
  }, []);

  return stats;
}
