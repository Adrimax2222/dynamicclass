"use client";
import {
  onSnapshot,
  type Query,
} from "firebase/firestore";
import { useEffect, useState } from "react";

export const useCollection = <T>(
  query: Query | null,
  options: {
    listen?: boolean;
  } = { listen: true }
): {
  data: T[];
  isLoading: boolean;
  error: Error | null;
} => {
  const [data, setData] = useState<T[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // The query object can be null if firestore is not ready yet in the parent component
    if (!query) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);

    if (!options.listen) {
      // Not yet implemented for getDocs
      setIsLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      query,
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
  }, [query, options.listen]);

  return { data, isLoading, error };
};