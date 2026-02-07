"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoadingScreen from '@/components/layout/loading-screen';

export default function LearningHubPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/learning-hub/explore');
  }, [router]);

  return <LoadingScreen />;
}
