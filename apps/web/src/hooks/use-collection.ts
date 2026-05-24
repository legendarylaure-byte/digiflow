'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  collection, query, getDocs, onSnapshot, type QueryConstraint, type DocumentData, type FirestoreError, type Query,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export function useCollection<T = DocumentData>(
  collectionName: string,
  constraints: QueryConstraint[] = [],
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const q = query(collection(db, collectionName), ...constraints) as Query<T>;
    getDocs(q)
      .then((snap) => {
        setData(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as T[]);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, [collectionName]);

  return { data, loading, error, refetch: () => {} };
}
