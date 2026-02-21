"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoadingScreen from '@/components/layout/loading-screen';

export default function ForumPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/forum/community');
  }, [router]);

  return <LoadingScreen />;
}
