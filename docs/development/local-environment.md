# Entorno local de desarrollo

Esta guía explica cómo instalar dependencias, configurar variables de entorno y levantar NYURO Ticket localmente.

El proyecto está en etapa de fundación. No todo está completo todavía. Esta guía explica qué funciona hoy y qué todavía no funciona, para que nadie pierda tiempo intentando levantar algo que todavía no existe.

---

## Requisitos previos

Para trabajar localmente necesitamos tener instalado:

- **Node.js 20** o superior
- **pnpm 9** o superior
- **Docker** y **Docker Compose** (para PostgreSQL y Redis)
- **Git**
- **Python 3.11** o superior (opcional, solo si se quiere levantar `apps/ai-service` manualmente)

Verificar versiones instaladas:

```bash
node --version
pnpm --version
docker --version
python3 --version
```

---

## Clonar el repositorio

```bash
git clone https://github.com/NyuroFrame/Nyuro-Ticket.git
cd Nyuro-Ticket
```

---

## Instalar dependencias

```bash
pnpm install
```

Esto instalará las dependencias de todos los paquetes del monorepo (`apps/*` y `packages/*`).

---

## Variables de entorno

El archivo `.env.example` contiene las variables mínimas para el entorno local.

Copiar a `.env` antes de levantar cualquier servicio:

```bash
cp .env.example .env
```

En Windows con PowerShell:

```powershell
Copy-Item .env.example .env
```

Variables incluidas en `.env.example`:

| Variable | Descripción | Estado actual |
|---|---|---|
| `DATABASE_URL` | URL de conexión a PostgreSQL | En uso |
| `POSTGRES_USER` | Usuario de PostgreSQL | En uso |
| `POSTGRES_PASSWORD` | Contraseña de PostgreSQL | En uso |
| `POSTGRES_DB` | Nombre de la base de datos | En uso |
| `REDIS_URL` | URL de conexión a Redis | Declarada, uso futuro |
| `PORT` | Puerto de la API (por defecto 3000) | En uso |
| `NODE_ENV` | Entorno de ejecución | En uso |
| `JWT_SECRET` | Secreto para JWT | Declarado, auth no implementada todavía |
| `AI_SERVICE_URL` | URL del servicio IA | Declarada, sin conexión real al backend todavía |
| `OPENAI_API_KEY` | Clave del proveedor LLM | Declarada vacía, para fase siguiente |

Las variables de PostgreSQL (`POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`) son usadas directamente por Docker Compose para configurar el contenedor.

`JWT_SECRET` y `OPENAI_API_KEY` están declaradas porque forman parte de la dirección técnica del proyecto, pero sus funcionalidades todavía no están implementadas.

**Importante:** no se deben subir secretos reales al repositorio. El archivo `.env` está en `.gitignore`.

---

## Levantar servicios base con Docker Compose

El `docker-compose.yml` declara servicios para PostgreSQL, Redis, API y AI service.

Actualmente solo PostgreSQL y Redis se pueden levantar con Docker Compose. Los Dockerfiles de `apps/api` y `apps/ai-service` todavía no existen, por lo que no es posible levantar esos servicios desde Docker en esta etapa.

Levantar PostgreSQL y Redis:

```bash
docker compose up -d postgres redis
```

Verificar estado y healthchecks:

```bash
docker compose ps
```

Ambos servicios tienen healthcheck configurado. Deben aparecer como `healthy` antes de intentar conectar la API.

### Problema conocido: Docker Compose completo

Si se intenta levantar todos los servicios a la vez:

```bash
docker compose up
```

Fallará para `api` y `ai-service` porque sus Dockerfiles no existen todavía. Esto es esperado y no significa que algo esté roto. Los Dockerfiles se crearán en issues posteriores del milestone de fundación.

---

## Levantar la API en modo desarrollo

Una vez que PostgreSQL esté saludable, levantar la API:

```bash
pnpm --filter @nyuro/api dev
```

La API arrancará en el puerto indicado por la variable `PORT` (por defecto `3000`).

**Estado actual:** la API es scaffold base de NestJS. El módulo `auth` fue generado por CLI y es scaffold CRUD sin lógica real de autenticación. Los módulos en `apps/api/src/modules/` (`identity`, `tickets`, `ai-contingency`, `sla`) son placeholders vacíos, no registrados en `AppModule`. La API no está conectada funcionalmente al modelo multi-tenant final ni a Prisma de forma completa.

---

## Levantar el frontend en modo desarrollo

```bash
pnpm --filter @nyuro/web dev
```

El frontend arrancará en el puerto por defecto de Next.js (`3000` o `3001` si el primero está ocupado por la API).

**Estado actual:** el frontend es scaffold mínimo de Next.js. Contiene una página de index, un componente `TicketCard` básico y un hook `useTickets`. No representa la UI final del producto ni está conectado a endpoints reales.

---

## Levantar el servicio IA manualmente (opcional)

Si se quiere explorar `apps/ai-service` sin Docker:

```bash
cd apps/ai-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

En Windows:

```powershell
cd apps/ai-service
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

El servicio arrancará en `http://localhost:8001`.

**Estado actual:** `apps/ai-service` es un skeleton mínimo con un endpoint de health check y un stub de IA con `TODO`. No tiene lógica de IA funcional. No está conectado al backend. Es un placeholder para la fase de IA del MVP.

---

## Migraciones de base de datos

Una vez que PostgreSQL esté levantado, se puede ejecutar la migración inicial:

```bash
pnpm db:generate
pnpm db:migrate
```

También está disponible Prisma Studio para explorar la base de datos visualmente:

```bash
pnpm db:studio
```

**Estado actual del schema:** el schema Prisma incluye solo `User`, `Ticket` y enums básicos (`UserRole`, `TicketStatus`, `TicketPriority`). No incluye `Tenant`, `Organization`, `OrgUnit` ni `tenantId`. El modelo multi-tenant se construirá en milestones posteriores.

---

## Scripts disponibles

Desde la raíz del monorepo:

```bash
pnpm dev          # Levanta todos los servicios en modo desarrollo (turbo)
pnpm build        # Compila paquetes y aplicaciones
pnpm test         # Ejecuta tests configurados
pnpm lint         # Ejecuta lint
pnpm format       # Formatea archivos compatibles
```

Scripts de base de datos:

```bash
pnpm db:generate  # Genera Prisma Client
pnpm db:migrate   # Ejecuta migraciones en desarrollo
pnpm db:studio    # Abre Prisma Studio
```

Scripts por aplicación específica:

```bash
pnpm --filter @nyuro/api dev
pnpm --filter @nyuro/api test
pnpm --filter @nyuro/web dev
pnpm --filter @nyuro/web build
```

---

## Estado del entorno actual

Resumen de qué está disponible hoy:

| Componente | Estado |
|---|---|
| PostgreSQL (Docker) | Funciona con `docker compose up -d postgres` |
| Redis (Docker) | Funciona con `docker compose up -d redis` |
| API NestJS (dev local) | Levanta. Scaffold base sin lógica funcional real. |
| Frontend Next.js (dev local) | Levanta. Scaffold mínimo sin UI final. |
| AI service (dev local manual) | Levanta. Skeleton sin IA funcional. |
| Docker Compose completo | Parcial. Falta Dockerfile de API y AI service. |
| Soporte remoto RustDesk | No implementado. `apps/remote-support-service/` no existe. |
| Multi-tenancy | No implementado. Schema sin `Tenant`, `Organization` ni `OrgUnit`. |
| Auth real | No implementada. Módulo auth es scaffold CRUD generado por CLI. |

---

## Validación básica del entorno

Para confirmar que el entorno básico funciona:

1. Ejecutar `pnpm install` sin errores.
2. Copiar `.env.example` a `.env`.
3. Levantar PostgreSQL y Redis: `docker compose up -d postgres redis`.
4. Verificar healthchecks: `docker compose ps` — ambos deben aparecer como `healthy`.
5. Ejecutar `pnpm db:generate` y `pnpm db:migrate` para crear el schema inicial.
6. Levantar la API: `pnpm --filter @nyuro/api dev` y confirmar que arranca sin errores.
7. Levantar el frontend: `pnpm --filter @nyuro/web dev` y confirmar que arranca.

Si alguno de estos pasos falla, revisar que los requisitos previos estén instalados y que el `.env` esté configurado correctamente.

---

## RustDesk y soporte remoto

RustDesk sí forma parte del MVP, pero no se implementa en esta etapa de fundación.

`apps/remote-support-service/` todavía no existe. La integración con RustDesk se trabajará en una fase posterior del MVP, después de que la base de tickets, usuarios, organizaciones y auditoría estén implementadas.

---

## Problemas conocidos

- `docker compose up` falla para `api` y `ai-service` porque sus Dockerfiles no existen todavía. Solo levantar `docker compose up -d postgres redis`.
- El módulo `auth` del backend es scaffold CRUD generado por CLI, sin autenticación real.
- Los módulos `identity`, `tickets`, `ai-contingency` y `sla` en `apps/api/src/modules/` son placeholders vacíos sin registrar en `AppModule`.
- `apps/ai-service` existe como skeleton pero no tiene lógica de IA funcional ni conexión al backend.
- El schema Prisma no tiene `Tenant`, `Organization`, `OrgUnit` ni `tenantId`. Las migraciones actuales no incluyen multi-tenancy.
- `pnpm dev` desde la raíz intentará levantar todos los servicios a la vez usando turbo. Si alguno falla por configuración incompleta, levantar cada servicio por separado con `--filter`.
