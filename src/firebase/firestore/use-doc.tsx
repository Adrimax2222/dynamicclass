// src/firebase/firestore/use-doc.tsx
"use client";
import {
  doc,
  onSnapshot,
  type DocumentReference,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useFirestore } from "..";

export const useDoc = <T>(
  pathOrRef: string | DocumentReference | null,
  options: {
    listen?: boolean;
  } = { listen: true }
): {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
} => {
  const firestore = useFirestore();
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!firestore || !pathOrRef) {
      setIsLoading(false);
      return;
    }

    const docRef =
      typeof pathOrRef === "string" ? doc(firestore, pathOrRef) : pathOrRef;

    if (!options.listen) {
      // getDoc not implemented yet
      return;
    }

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setData({ id: snapshot.id, ...snapshot.data() } as T);
        } else {
          setData(null);
        }
        setIsLoading(false);
      },
      (err) => {
        console.error(err);
        setError(err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firestore, pathOrRef, options.listen]);

  return { data, isLoading, error };
};
