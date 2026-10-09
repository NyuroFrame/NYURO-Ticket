import React from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

/**
 * Template Method simplificado: layout fijo enterprise.
 * Las páginas solo aportan `children`; el shell no cambia por módulo.
 */
export function AppShell({
  role,
  userName,
  onLogout,
  children,
}: {
  role: string | undefined;
  userName?: string;
  onLogout?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar role={role} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar userName={userName} onLogout={onLogout} />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-5">{children}</main>
      </div>
    </div>
  );
}
