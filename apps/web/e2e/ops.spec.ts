import { test, expect, type Page } from '@playwright/test';

const API = 'http://localhost:3000';

async function mockSession(page: Page, role = 'ACCOUNT_ADMIN') {
  await page.route(`${API}/auth/me`, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: { id: 'u1', name: 'Admin Cuenta', role, tenantId: 't1', organizationId: 'o1', orgUnitId: 'ou-ti', mustResetPassword: false },
        tenant: { id: 't1', name: 'Tenant Demo', slug: 'demo' },
        organization: { id: 'o1', code: 'ORG', name: 'Principal' },
        orgUnit: { id: 'ou-ti', name: 'Tecnología' },
      }),
    }),
  );
}

test('M01 /org/unidades muestra árbol con Soporte', async ({ page }) => {
  await mockSession(page);
  await page.goto('/org/unidades');
  await expect(page.getByRole('heading', { name: 'Organización' })).toBeVisible();
  await expect(page.locator('text=Soporte').first()).toBeVisible();
  await expect(page.locator('text=inactiva').first()).toBeVisible();
});

test('M05 /colas separa sin responsable y en atención', async ({ page }) => {
  await mockSession(page, 'AGENT');
  await page.goto('/colas');
  await expect(page.getByRole('heading', { name: 'Colas y operación' })).toBeVisible();
  await expect(page.locator('text=Nivel 1 — General')).toBeVisible();
  await expect(page.locator('text=Sin responsable').first()).toBeVisible();
});

test('M06 /sla ordena vencido primero con badge', async ({ page }) => {
  await mockSession(page);
  await page.goto('/sla');
  await expect(page.getByRole('heading', { name: 'SLA y escalamientos' })).toBeVisible();
  const firstRef = page.locator('tbody tr').first();
  await expect(firstRef.locator('text=vencido')).toBeVisible();
});

test('M08/M03/M07 /operacion sin duplicados + catálogo + aprobaciones', async ({ page }) => {
  await mockSession(page);
  await page.goto('/operacion');
  await expect(page.getByRole('heading', { name: 'Operación diaria' })).toBeVisible();
  // Deduplicado: el texto duplicado aparece una sola vez
  await expect(page.locator('text=Duplicado que debe colapsar')).toHaveCount(0);
  await expect(page.locator('text=Acceso VPN').first()).toBeVisible();
  await expect(page.locator('text=Aprobaciones pendientes')).toBeVisible();
});

test('M10/M16/M17 /reportes y M11/M12 /kb y M18/M19 billing renderizan', async ({ page }) => {
  await mockSession(page);
  await page.goto('/reportes');
  await expect(page.getByRole('heading', { name: 'Gobierno y análisis' })).toBeVisible();
  await page.goto('/kb');
  await expect(page.getByRole('heading', { name: 'Soporte técnico' })).toBeVisible();
  await page.goto('/billing/suscripcion');
  await expect(page.getByRole('heading', { name: 'Cuenta y plataforma' })).toBeVisible();
});
