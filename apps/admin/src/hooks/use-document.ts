'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, onSnapshot, type DocumentData, type FirestoreError } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

interface UseDocumentOptions {
  realtime?: boolean;
}

export function useDocument<T = DocumentData>(
  collectionName: string,
  docId: string | null,
  options: UseDocumentOptions = {},
) {
  const { realtime = false } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  useEffect(() => {
    if (!docId) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const ref = doc(db, collectionName, docId);

    if (realtime) {
      const unsub = onSnapshot(
        ref,
        (snap) => {
          setData(snap.exists() ? ({ id: snap.id, ...snap.data() } as T) : null);
          setLoading(false);
        },
        (err) => {
          setError(err);
          setLoading(false);
        },
      );
      return () => unsub();
    }

    getDoc(ref)
      .then((snap) => {
        setData(snap.exists() ? ({ id: snap.id, ...snap.data() } as T) : null);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, [collectionName, docId, realtime]);

  return { data, loading, error };
}
