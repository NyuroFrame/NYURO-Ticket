'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/auth-context';

export function AgentRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
    if (!loading && user && user.role !== 'AGENT') {
      router.replace('/');
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'AGENT') return null;

  return <>{children}</>;
}
