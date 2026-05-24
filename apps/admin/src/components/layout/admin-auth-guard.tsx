'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.replace('/admin/login');
        return;
      }
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        const role = snap.data()?.role;
        if (role === 'admin') {
          setAuthorized(true);
        } else {
          router.replace('/admin/login');
        }
      } catch {
        setAuthorized(true);
      }
    });
    return () => unsub();
  }, [router]);

  if (!authorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
