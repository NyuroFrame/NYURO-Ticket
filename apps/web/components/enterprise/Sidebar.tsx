import Link from 'next/link';
import { useRouter } from 'next/router';
import { navForRole, sectionsOf } from '../../lib/navigation';

/**
 * Sidebar por rol (Strategy). SRP: render; la decisión vive en `navigation.ts`.
 * Diseño sobrio: secciones en mayúsculas 11px, item activo con fondo slate-100.
 */
export function Sidebar({ role }: { role: string | undefined }) {
  const router = useRouter();
  const sections = sectionsOf(navForRole(role));

  return (
    <aside className="hidden w-60 shrink-0 border-r border-line bg-white md:block">
      <div className="flex h-14 items-center border-b border-line px-4">
        <span className="text-sm font-semibold text-ink-900">NYURO Ticket</span>
        <span className="ml-2 rounded border border-line bg-slate-50 px-1.5 py-0.5 text-[11px] text-ink-500">
          {role ?? '—'}
        </span>
      </div>
      <nav className="space-y-5 overflow-y-auto p-3">
        {sections.map(({ section, items }) => (
          <div key={section}>
            <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-ink-400">
              {section}
            </p>
            <ul className="space-y-0.5">
              {items.map((item) => {
                const active = router.pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={`block rounded-md px-2.5 py-1.5 text-[13px] ${
                        active
                          ? 'bg-slate-100 font-medium text-ink-900'
                          : 'text-ink-700 hover:bg-slate-50'
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
