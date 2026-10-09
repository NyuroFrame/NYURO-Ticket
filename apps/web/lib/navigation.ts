import type { Role } from './repositories';

/**
 * Strategy: navegación por rol (README 5 roles).
 * OCP: añadir un rol = añadir una entrada, sin tocar el shell.
 */
export interface NavItem {
  href: string;
  label: string;
  section: string;
}

const BASE_NAV: Record<Role, NavItem[]> = {
  SUPER_ADMIN: [
    { href: '/admin/tenants', label: 'Tenants', section: 'Plataforma' },
    { href: '/admin/salud', label: 'Salud', section: 'Plataforma' },
    { href: '/admin/proveedores', label: 'Proveedores', section: 'Plataforma' },
  ],
  ACCOUNT_ADMIN: [
    { href: '/org/unidades', label: 'Organización', section: 'Gestionar' },
    { href: '/usuarios', label: 'Usuarios y roles', section: 'Gestionar' },
    { href: '/tickets', label: 'Tickets', section: 'Operar' },
    { href: '/colas', label: 'Colas', section: 'Operar' },
    { href: '/reportes', label: 'Reportes', section: 'Analizar' },
    { href: '/billing/suscripcion', label: 'Suscripción', section: 'Cuenta' },
  ],
  ORG_ADMIN: [
    { href: '/org/unidades', label: 'Mi organización', section: 'Gestionar' },
    { href: '/tickets', label: 'Tickets', section: 'Operar' },
    { href: '/reportes', label: 'Reportes', section: 'Analizar' },
  ],
  AGENT: [
    { href: '/mi-trabajo', label: 'Mi trabajo', section: 'Operar' },
    { href: '/tickets', label: 'Tickets', section: 'Operar' },
    { href: '/colas', label: 'Colas', section: 'Operar' },
    { href: '/kb', label: 'Conocimiento', section: 'Ayuda' },
  ],
  REQUESTER: [
    { href: '/mis-tickets', label: 'Mis tickets', section: 'Mis gestiones' },
    { href: '/catalogo', label: 'Catálogo', section: 'Mis gestiones' },
    { href: '/kb', label: 'Ayuda', section: 'Mis gestiones' },
  ],
};

export function navForRole(role: Role | string | undefined): NavItem[] {
  if (!role) return [];
  return BASE_NAV[role as Role] ?? [];
}

export function sectionsOf(items: NavItem[]): { section: string; items: NavItem[] }[] {
  const order: string[] = [];
  const bySection = new Map<string, NavItem[]>();
  for (const item of items) {
    if (!bySection.has(item.section)) {
      bySection.set(item.section, []);
      order.push(item.section);
    }
    bySection.get(item.section)!.push(item);
  }
  return order.map((section) => ({ section, items: bySection.get(section)! }));
}
