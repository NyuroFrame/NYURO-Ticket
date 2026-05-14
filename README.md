# NYURO Ticket

NYURO Ticket es un SaaS/framework configurable para soporte organizacional.

La idea no es construir solamente un sistema de tickets tradicional. El objetivo es crear una plataforma donde cada cliente pueda modelar su propia organización, configurar sus áreas internas, administrar usuarios, agentes de soporte, tickets, IA de contingencia y soporte remoto integrado con RustDesk de forma progresiva.

Este proyecto está pensado para empresas, instituciones educativas, instituciones públicas y organizaciones que no tienen todas la misma estructura interna. Por eso, el sistema debe ser flexible desde su base.

---

## Visión del producto

En NYURO Ticket, el cliente que contrata el sistema será un **tenant**.

Un tenant puede representar:

- una empresa,
- una institución educativa,
- una institución pública,
- una universidad,
- un colegio,
- una municipalidad,
- o un grupo empresarial con varias organizaciones internas.

Dentro de cada tenant se podrán crear una o varias organizaciones. Cada organización podrá configurar sus áreas, sedes, facultades, departamentos, oficinas o equipos internos en forma de árbol.

Ejemplo simple:

```txt
Tenant Demo
└── Organización Principal
    ├── TI
    │   ├── Soporte
    │   └── Infraestructura
    ├── Administración
    └── Facultad / Área / Departamento
```

La idea es que el tenant arme su estructura real según cómo funciona su organización, sin llenarlo de áreas por defecto que no necesita.

---

## Alcance del MVP

El MVP debe demostrar que NYURO Ticket puede funcionar como una base profesional, segura y configurable.

El MVP debe incluir:

- Gestión de tenants.
- Gestión de organizaciones dentro del tenant.
- Configuración de dominios corporativos permitidos.
- Estructura de áreas o unidades organizacionales tipo árbol.
- Usuarios asociados a organizaciones y áreas.
- Roles y permisos básicos.
- Sistema de tickets funcional.
- Mensajes o comentarios dentro de tickets.
- Asignación manual de tickets a agentes.
- Auditoría básica de acciones importantes.
- IA de contingencia simple para apoyar el flujo inicial de soporte.
- Soporte remoto integrado con RustDesk, con alcance controlado para el MVP.
- Dashboard mínimo para supervisión.
- Aislamiento estricto entre tenants.

### RustDesk dentro del MVP

RustDesk sí forma parte del MVP, pero con una integración inicial controlada.

En el MVP se busca:

- asociar sesiones remotas a tickets,
- registrar qué agente inició o gestionó la sesión,
- registrar qué usuario solicitó o autorizó la atención,
- guardar código, enlace o identificador de sesión cuando aplique,
- registrar inicio, cierre y resultado de la sesión,
- mostrar la sesión dentro del timeline del ticket,
- auditar las acciones relacionadas al soporte remoto,
- validar permisos antes de permitir soporte remoto.

No se busca todavía una automatización enterprise completa de red, VPN, NAS, despliegue masivo de RustDesk o inventario avanzado de dispositivos.

---

## Fuera del MVP inicial

Para mantener el proyecto alcanzable, estas partes quedan para fases posteriores:

- planes comerciales definitivos,
- billing final con pasarela de pago,
- Kubernetes,
- microservicios completos,
- gRPC interno obligatorio,
- IA RAG avanzada,
- automatización avanzada de VPN,
- integración avanzada con NAS,
- instalación masiva automática avanzada de RustDesk,
- mapas de calor avanzados,
- reportería enterprise completa,
- inventario automático de hardware/software,
- mobile app.

Los planes comerciales se definirán después de validar el MVP con pruebas reales, para no limitar mal el producto ni cobrar sin conocer todavía el uso real de los tenants.

---

## Stack técnico inicial

El stack base del proyecto es:

- **Next.js** para el frontend.
- **NestJS** para el backend principal.
- **PostgreSQL** como base de datos principal.
- **Prisma** para el modelo de datos y acceso a base de datos.
- **Redis** para uso futuro en cache, colas, rate limiting o presencia.
- **Python/FastAPI** para el servicio auxiliar de IA.
- **RustDesk** como integración de soporte remoto.
- **Docker Compose** para entorno local y primera base de despliegue.
- **Turborepo + pnpm** para trabajar el monorepo.

Kubernetes, microservicios y comunicación interna avanzada quedan para fases posteriores, cuando exista una necesidad real.

---

## Arquitectura inicial

NYURO Ticket empezará como un **monorepo modular**.

La idea inicial es trabajar con un backend principal como monolito modular, un frontend modular, un servicio auxiliar de IA y una integración modular de soporte remoto con RustDesk.

Estructura actual/base del proyecto:

```txt
apps/
  api/          # Backend principal en NestJS
  web/          # Frontend principal en Next.js

packages/
  database/     # Prisma, schema y cliente de base de datos
```

Estructura objetivo progresiva:

```txt
apps/
  web/                    # Frontend Next.js
  api/                    # Backend NestJS como monolito modular
  ai-service/             # Servicio auxiliar Python/FastAPI para IA
  remote-support-service/ # Servicio/capa auxiliar para RustDesk

packages/
  database/               # Prisma schema, migraciones y cliente
  shared/                 # Tipos, constantes y utilidades compartidas
  config/                 # Configuración compartida
  logger/                 # Logging estructurado
  contracts/              # Contratos entre frontend, backend, IA y soporte remoto

infra/
  docker/
  scripts/

docs/
  producto/
  arquitectura/
  seguridad/
  desarrollo/
  integraciones/
```

La estructura objetivo se irá completando mediante issues del milestone de fundación y los siguientes milestones del MVP.

---

## Principios importantes del proyecto

Estos principios deben guiar las decisiones técnicas del equipo:

1. **Tenant primero**: todo dato operativo importante debe estar asociado a un tenant.
2. **No fuga entre tenants**: un usuario de un tenant no debe ver, modificar ni inferir datos de otro tenant.
3. **Privacidad del tenant**: NYURO debe monitorear salud técnica del SaaS, no contenido privado de los tenants.
4. **Monolito modular primero**: el MVP no debe empezar como microservicios completos.
5. **IA como apoyo**: si la IA falla, el ticket debe seguir funcionando.
6. **RustDesk como integración modular**: soporte remoto debe estar aislado y auditado, no mezclado directamente con el núcleo de tickets.
7. **PostgreSQL como fuente de verdad**: Redis no reemplaza la persistencia principal.
8. **Seguridad en backend**: no basta con ocultar botones en frontend; toda acción sensible debe validarse en backend.
9. **Auditoría desde temprano**: acciones importantes deben dejar trazabilidad.
10. **Simplicidad antes que sobreingeniería**: no implementar infraestructura compleja antes de necesitarla.

---

## Requisitos previos

Para trabajar localmente se recomienda tener instalado:

- Node.js 20 o superior.
- pnpm 9 o superior.
- Docker y Docker Compose.
- Git.

El proyecto usa pnpm como package manager.

---

## Instalación

Clonar el repositorio:

```bash
git clone https://github.com/NyuroFrame/Nyuro-Ticket.git
cd Nyuro-Ticket
```

Instalar dependencias:

```bash
pnpm install
```

---

## Variables de entorno

El proyecto debe contar con un archivo `.env` local. Mientras se termina de formalizar `.env.example`, estas son las variables base que se usan o se usarán en el entorno local:

```env
NODE_ENV=development

POSTGRES_USER=nyuro
POSTGRES_PASSWORD=nyuro_pass
POSTGRES_DB=nyuro_tickets
DATABASE_URL=postgresql://nyuro:nyuro_pass@localhost:5432/nyuro_tickets

REDIS_URL=redis://localhost:6379

API_PORT=3000
WEB_PORT=3001
AI_SERVICE_URL=http://localhost:8001
```

No se deben subir secretos reales al repositorio.

---

## Cómo levantar el proyecto localmente

Levantar servicios base con Docker Compose:

```bash
docker compose up -d postgres redis
```

Levantar el backend en modo desarrollo:

```bash
pnpm --filter @nyuro/api dev
```

Levantar el frontend en modo desarrollo:

```bash
pnpm --filter @nyuro/web dev
```

También se puede usar el script global del monorepo:

```bash
pnpm dev
```

Nota: el entorno local todavía está en etapa de fundación. Algunas piezas como IA, RustDesk y scripts finales de entorno se completarán mediante issues específicos del roadmap.

---

## Scripts disponibles

Desde la raíz del proyecto:

```bash
pnpm dev          # Ejecuta el entorno de desarrollo usando turbo
pnpm build        # Compila los paquetes y aplicaciones
pnpm test         # Ejecuta tests configurados
pnpm lint         # Ejecuta lint configurado
pnpm format       # Formatea archivos compatibles
```

Scripts de base de datos:

```bash
pnpm db:generate  # Genera Prisma Client
pnpm db:migrate   # Ejecuta migraciones en desarrollo
pnpm db:studio    # Abre Prisma Studio
```

Scripts específicos por app:

```bash
pnpm --filter @nyuro/api dev
pnpm --filter @nyuro/api test
pnpm --filter @nyuro/web dev
pnpm --filter @nyuro/web build
```

---

## Roadmap resumido del MVP

Roadmap inicial:

```txt
M0 - Fundación del proyecto
M1 - Modelo organizacional y multi-tenant
M2 - Autenticación, usuarios y permisos
M3 - Organizaciones, áreas y estructura tipo árbol
M4 - Tickets funcionales
M5 - Auditoría y trazabilidad
M6 - IA de contingencia
M7 - Chat y comunicación en tiempo real
M8 - Soporte remoto integrado con RustDesk
M9 - Dashboard, métricas y preparación del MVP
M10 - MVP funcional para prueba piloto
```

El milestone actual de fundación busca ordenar el proyecto antes de construir funcionalidades grandes.

---

## Estado actual del proyecto

Estado actual:

- El repositorio ya está organizado como monorepo con `apps/*` y `packages/*`.
- Existe una aplicación backend base en `apps/api`.
- Existe una aplicación frontend base en `apps/web`.
- Existe un paquete de base de datos en `packages/database`.
- Existe configuración inicial para PostgreSQL y Redis mediante Docker Compose.
- El modelo de datos actual todavía es inicial y será rediseñado para soportar multi-tenancy, organizaciones, áreas, auditoría, IA y soporte remoto.
- El backend todavía está en etapa temprana y será reorganizado por módulos reales del producto.
- La documentación se completará progresivamente mediante issues del milestone de fundación.

---

## Metodología de trabajo

El equipo trabajará con el siguiente flujo:

```txt
Milestone → Issue → Rama → Desarrollo → Pull Request → Revisión → Validación → Merge
```

Cada issue debe explicar:

- objetivo,
- contexto,
- alcance,
- criterios de aceptación,
- validación,
- riesgos,
- consideraciones de seguridad y multi-tenancy cuando aplique.

Cada pull request debe explicar:

- qué cambió,
- qué issue resuelve,
- qué validaciones se ejecutaron,
- qué riesgos existen,
- si afecta datos de tenant, IA, RustDesk, auditoría o seguridad.

La regla principal es no implementar fases completas en una sola tarea. Cada avance debe ser pequeño, trazable y revisable.

---

## Notas para el equipo

- No se debe trabajar directo sobre funcionalidades grandes sin issue.
- No se debe mezclar lógica de tickets con detalles internos de IA o RustDesk.
- No se debe guardar información sensible en logs técnicos.
- No se debe asumir que NYURO puede ver datos privados del tenant.
- No se deben implementar microservicios, Kubernetes o billing antes de validar el MVP.
- RustDesk sí entra al MVP, pero como integración controlada, modular y auditada.
- La IA sí entra al MVP, pero como apoyo inicial, no como dependencia crítica.

---

## Regla central del proyecto

No construiremos todo NYURO Ticket de golpe.

Primero construiremos el camino mínimo para demostrar que NYURO Ticket puede existir de forma profesional, segura, configurable, modular y vendible.
