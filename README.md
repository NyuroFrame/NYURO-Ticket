# NYURO Ticket

NYURO Ticket es un proyecto SaaS/framework configurable para soporte organizacional.

La visión del producto es construir una plataforma donde cada cliente pueda modelar su propia organización, configurar áreas internas, administrar usuarios, agentes de soporte, tickets, IA de contingencia y soporte remoto integrado con RustDesk.

Este README separa claramente dos cosas:

1. La visión del software que se quiere construir.
2. El estado actual real del repositorio.

El proyecto todavía está en etapa de fundación. No todo lo descrito en la visión está implementado actualmente.

---

## Visión del software

NYURO Ticket no busca ser solo un sistema de tickets tradicional.

La idea es crear un SaaS flexible para empresas, instituciones educativas, instituciones públicas, universidades, colegios, municipalidades o grupos empresariales que necesitan organizar su soporte de acuerdo con su propia estructura interna.

En el sistema, el cliente que contrata el servicio será un **tenant**.

Un tenant podrá tener una o varias organizaciones. Cada organización podrá configurar sus áreas, sedes, facultades, departamentos, oficinas o equipos internos como un árbol.

Ejemplo:

```txt
Tenant Demo
└── Organización Principal
    ├── TI
    │   ├── Soporte
    │   └── Infraestructura
    ├── Administración
    └── Facultad / Área / Departamento
```

La idea es que el tenant pueda armar su estructura real sin que el sistema lo obligue a usar áreas por defecto que no necesita.

---

## Flujo general esperado del producto

El flujo general que se quiere construir es el siguiente:

1. El cliente contrata NYURO Ticket y se crea su tenant.
2. El tenant configura una o varias organizaciones.
3. Cada organización configura sus dominios corporativos permitidos.
4. Los usuarios podrán iniciar sesión con correos válidos según los dominios configurados.
5. El tenant configura sus áreas o unidades organizacionales en forma de árbol.
6. Los usuarios se asignan a organizaciones y áreas según corresponda.
7. Se definen roles como administradores, supervisores, agentes de soporte y usuarios solicitantes.
8. Los usuarios finales crean tickets según sus necesidades.
9. La IA de contingencia puede apoyar con preguntas iniciales, clasificación, sugerencias o resumen del caso.
10. Si el problema requiere atención humana, un supervisor o el sistema asigna el ticket a un agente.
11. El agente atiende el ticket con el contexto previo, incluyendo lo que la IA intentó o sugirió.
12. Si el caso requiere conexión remota, se podrá asociar una sesión de soporte remoto con RustDesk al ticket.
13. El sistema registra mensajes, cambios de estado, asignaciones, sesiones remotas y acciones importantes en la trazabilidad del ticket.
14. El ticket puede resolverse, cerrarse, reabrirse o valorarse según el flujo definido.
15. Los supervisores podrán revisar reportes, métricas y actividad de soporte sin que NYURO acceda al contenido privado del tenant.

---

## Alcance esperado del MVP

El MVP debe demostrar la base funcional del producto.

El MVP esperado incluirá:

- Gestión de tenants.
- Gestión de organizaciones dentro del tenant.
- Configuración de dominios corporativos permitidos.
- Estructura de áreas o unidades organizacionales tipo árbol.
- Usuarios asociados a organizaciones y áreas.
- Roles y permisos básicos.
- Sistema de tickets funcional.
- Mensajes o comentarios dentro de tickets.
- Asignación de tickets a agentes.
- Auditoría básica de acciones importantes.
- IA de contingencia simple.
- Soporte remoto integrado con RustDesk con alcance controlado.
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
- mostrar la sesión dentro del historial o timeline del ticket,
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

## Estado actual real del repositorio

Actualmente el repositorio se encuentra en etapa inicial de fundación.

Lo que existe actualmente:

- Monorepo con `pnpm` y `turbo`.
- Workspace configurado para `apps/*` y `packages/*`.
- Aplicación backend base en `apps/api` con NestJS. El módulo `auth` fue generado por CLI y es scaffold CRUD sin lógica real de autenticación.
- Aplicación frontend base en `apps/web` con Next.js (scaffold mínimo).
- Servicio auxiliar `apps/ai-service` en FastAPI como skeleton mínimo: tiene un endpoint de health y un stub de IA con TODO. No es funcional todavía.
- Paquete de base de datos en `packages/database` con Prisma.
- Modelo Prisma inicial con `User`, `Ticket` y enums básicos. Aún sin `tenantId`, `Tenant`, `Organization` ni `OrgUnit`.
- Paquetes compartidos en estado scaffold: `packages/config`, `packages/types`, `packages/ui` y `packages/validators`.
- Módulos NestJS placeholder en `apps/api/src/modules/` (`identity`, `tickets`, `ai-contingency`, `sla`). Todos están vacíos y sin registrar en `AppModule`. Son placeholders para issues futuras, no funcionalidad activa.
- `docker-compose.yml` con servicios declarados para PostgreSQL, Redis, API y AI service.
- Scripts raíz para `build`, `dev`, `test`, `lint`, `format` y comandos de base de datos.

Lo que todavía no está implementado:

- Multi-tenancy real.
- Modelo de tenant, organización, dominios y áreas tipo árbol.
- `tenantId` en entidades principales (se agregará al inicio de M1).
- Autenticación real (JWT, login, registro).
- Roles y permisos reales.
- Tickets funcionales conectados al modelo final.
- Auditoría.
- IA de contingencia funcional (el skeleton existe, pero sin lógica de IA real).
- Módulo o servicio real de soporte remoto con RustDesk.
- Dockerfiles para `apps/api` y `apps/ai-service` (referenciados en Docker Compose pero aún no creados).
- Dashboard.
- Billing.
- Kubernetes.

Nota importante: el `docker-compose.yml` ya declara servicios que forman parte de la dirección técnica del proyecto, pero algunas piezas todavía no existen o no están listas. Eso se irá corrigiendo en las siguientes issues del milestone de fundación.

---

## Stack técnico actual y previsto

Actualmente el repositorio ya usa o declara:

- **pnpm** como package manager.
- **Turborepo** para orquestar scripts del monorepo.
- **NestJS** en `apps/api`.
- **Next.js** en `apps/web`.
- **PostgreSQL** como base de datos prevista.
- **Prisma** en `packages/database`.
- **Redis** declarado en Docker Compose para uso futuro.
- **Docker Compose** como base de entorno local.

Previsto para el MVP:

- **Python/FastAPI** en `apps/ai-service` (skeleton inicial disponible, sin funcionalidad real todavía).
- **RustDesk** como integración de soporte remoto.
- Módulos internos para multi-tenancy, organizaciones, áreas, usuarios, permisos, tickets, auditoría, IA y soporte remoto.

Kubernetes, microservicios completos y comunicación interna avanzada quedan para fases posteriores.

---

## Estructura actual del monorepo

Estructura base actual:

```txt
apps/
  api/         # Backend NestJS (scaffold base)
  web/         # Frontend Next.js (scaffold mínimo)
  ai-service/  # Servicio FastAPI (skeleton mínimo, no funcional)

packages/
  database/    # Prisma y paquete de base de datos
  config/      # Configuración compartida (scaffold)
  types/       # Tipos compartidos (scaffold)
  ui/          # Componentes UI compartidos (scaffold)
  validators/  # Validadores compartidos (scaffold)
```

La estructura modular completa todavía se definirá y ajustará en issues posteriores del milestone de fundación.

---

## Requisitos previos

Para trabajar localmente se recomienda tener instalado:

- Node.js 20 o superior.
- pnpm 9 o superior.
- Docker y Docker Compose.
- Git.

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

El proyecto todavía no tiene una guía final de variables de entorno.

Como referencia inicial, el entorno local necesita variables para:

- entorno de ejecución,
- conexión a PostgreSQL,
- conexión a Redis,
- puerto de la API.

El archivo `.env.example` y la guía formal de entorno local se completarán en una issue específica del milestone de fundación.

No se deben subir secretos reales al repositorio.

---

## Cómo levantar el proyecto actualmente

Instalar dependencias:

```bash
pnpm install
```

Levantar servicios base disponibles:

```bash
docker compose up -d postgres redis
```

Levantar backend en modo desarrollo:

```bash
pnpm --filter @nyuro/api dev
```

Levantar frontend en modo desarrollo:

```bash
pnpm --filter @nyuro/web dev
```

También existe el script general:

```bash
pnpm dev
```

Nota: todavía se debe validar y completar el entorno local completo. El Docker Compose actual declara servicios que aún requieren archivos o implementaciones adicionales para funcionar completamente.

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

Roadmap inicial previsto:

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

## Principios importantes del proyecto

Estos principios guiarán el desarrollo:

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

## Metodología de trabajo

El equipo trabajará con este flujo:

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

- No asumir que una parte está lista solo porque aparece en la visión.
- No trabajar funcionalidades grandes sin issue.
- No mezclar lógica de tickets con detalles internos de IA o RustDesk.
- No guardar información sensible en logs técnicos.
- No asumir que NYURO puede ver datos privados del tenant.
- No implementar microservicios, Kubernetes o billing antes de validar el MVP.
- RustDesk entra al MVP, pero como integración controlada, modular y auditada.
- La IA entra al MVP, pero como apoyo inicial, no como dependencia crítica.

---

## Regla central del proyecto

No construiremos todo NYURO Ticket de golpe.

Primero construiremos el camino mínimo para demostrar que NYURO Ticket puede existir de forma profesional, segura, configurable, modular y vendible.
