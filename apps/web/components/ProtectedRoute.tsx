'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/auth-context';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
          <p className="text-[13px] text-ink-500">Cargando sesión…</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
