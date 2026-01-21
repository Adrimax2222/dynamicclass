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
  data: T[];
  isLoading: boolean;
  error: Error | null;
} => {
  const firestore = useFirestore();
  const [data, setData] = useState<T[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!firestore || !pathOrQuery) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);

    const isPathString = typeof pathOrQuery === "string";
    const queryToExecute = isPathString
      ? query(collection(firestore, pathOrQuery))
      : pathOrQuery;

    if (!options.listen) {
      // Not yet implemented for getDocs
      setIsLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      queryToExecute,
      (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({
          uid: doc.id, // Use uid to be consistent with useDoc
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firestore, pathOrQuery, options.listen]);

  return { data, isLoading, error };
};

    