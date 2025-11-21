// src/firebase/hooks.ts
"use client";
import { useMemo } from "react";

/**
 * A hook to memoize a Firestore query or document reference.
 * This is crucial to prevent infinite loops when using `useCollection` or `useDoc`
 * with dynamically generated queries.
 *
 * @param factory A function that returns a Firestore Query or DocumentReference.
 * @param deps The dependency array for the useMemo hook.
 * @returns The memoized query or reference.
 */
export function useMemoFirebase<T>(factory: () => T, deps: React.DependencyList): T {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return useMemo(factory, deps);
}
