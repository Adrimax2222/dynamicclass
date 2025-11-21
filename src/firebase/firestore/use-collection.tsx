// src/firebase/firestore/use-collection.tsx
"use client";
import {
  collection,
  onSnapshot,
  query,
  type CollectionReference,
  type Query,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useFirestore } from "..";

export const useCollection = <T>(
  pathOrQuery: string | Query | null,
  options: {
    listen?: boolean;
  } = { listen: true }
): {
  data: T[] | null;
  isLoading: boolean;
  error: Error | null;
} => {
  const firestore = useFirestore();
  const [data, setData] = useState<T[] | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!firestore || !pathOrQuery) {
      setIsLoading(false);
      return;
    }

    const isPathString = typeof pathOrQuery === "string";
    const queryToExecute = isPathString
      ? query(collection(firestore, pathOrQuery))
      : pathOrQuery;

    if (!options.listen) {
      // Not yet implemented for getDocs
      return;
    }

    const unsubscribe = onSnapshot(
      queryToExecute,
      (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as T[];
        setData(docs);
        setIsLoading(false);
      },
      (err) => {
        console.error(err);
        setError(err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firestore, pathOrQuery, options.listen]);

  return { data, isLoading, error };
};
