import { test, expect, type Page } from '@playwright/test';

const API = 'http://localhost:3000';

/** Sesión mockeada: evita depender del backend NestJS. */
async function mockSession(page: Page, role = 'AGENT') {
  await page.route(`${API}/auth/me`, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: { id: 'u1', name: 'Luis Paredes', role, tenantId: 't1', organizationId: 'o1', orgUnitId: 'ou-soporte', mustResetPassword: false },
        tenant: { id: 't1', name: 'Tenant Demo', slug: 'demo' },
        organization: { id: 'o1', code: 'ORG', name: 'Principal' },
        orgUnit: { id: 'ou-soporte', name: 'Soporte' },
      }),
    }),
  );
}

test('sin sesión /tickets redirige a /login', async ({ page }) => {
  await page.route(`${API}/auth/me`, (route) =>
    route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'Unauthorized' }) }),
  );
  await page.goto('/tickets');
  await expect(page).toHaveURL(/\/login/);
});

test('página login renderiza formulario', async ({ page }) => {
  await page.goto('/login');
  await expect(page.locator('form, input').first()).toBeVisible();
});

test('con sesión /tickets muestra bandeja con NYU-1042', async ({ page }) => {
  await mockSession(page);
  await page.goto('/tickets');
  await expect(page.getByRole('heading', { name: 'Tickets' })).toBeVisible();
  await expect(page.locator('text=NYU-1042').first()).toBeVisible();
  await expect(page.locator('text=Sin asignar').first()).toBeVisible();
});

test('flujo crear ticket: formulario válido registra referencia', async ({ page }) => {
  await mockSession(page, 'REQUESTER');
  await page.goto('/tickets/nuevo');
  await page.locator('#title').fill('No funciona el correo corporativo');
  await page.locator('#orgUnitId').selectOption('ou-soporte');
  await page.locator('#description').fill('Desde ayer no sincroniza y muestra error 500 al enviar.');
  await page.getByRole('button', { name: 'Registrar ticket' }).click();
  await expect(page.locator('text=registrado').first()).toBeVisible();
  await expect(page.locator('.ref-mono').first()).toBeVisible();
});
