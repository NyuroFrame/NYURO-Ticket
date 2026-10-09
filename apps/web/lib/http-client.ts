/**
 * Contrato HTTP (ISP + DIP): la UI depende de la abstracción,
 * no de `fetch`. Permite sustituir por mock/MSW en tests.
 */
export interface HttpRequest {
  path: string;
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
}

export interface HttpClient {
  send<T>(req: HttpRequest): Promise<T>;
}

export class HttpError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/** Implementación fetch con tenant-scoping (M01: tenant primero). */
export class FetchHttpClient implements HttpClient {
  constructor(
    private baseUrl: string,
    private getTenantId: () => string | null,
  ) {}

  async send<T>(req: HttpRequest): Promise<T> {
    const tenantId = this.getTenantId();
    const res = await fetch(`${this.baseUrl}${req.path}`, {
      method: req.method,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(tenantId ? { 'x-tenant-id': tenantId } : {}),
        ...req.headers,
      },
      body: req.body !== undefined ? JSON.stringify(req.body) : undefined,
    });
    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      throw new HttpError(
        (payload as { message?: string }).message ?? `HTTP ${res.status}`,
        res.status,
      );
    }
    return (await res.json()) as T;
  }
}

/** Doble de test (Test Double): repositorio en memoria. OCP para tests. */
export class InMemoryHttpClient implements HttpClient {
  private routes = new Map<string, unknown>();
  on(path: string, payload: unknown): this {
    this.routes.set(path, payload);
    return this;
  }
  async send<T>(req: HttpRequest): Promise<T> {
    if (!this.routes.has(req.path)) throw new HttpError(`No mock for ${req.path}`, 404);
    return this.routes.get(req.path) as T;
  }
}
