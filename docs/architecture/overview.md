# Arquitectura general de NYURO Ticket

## Estado del documento

Este documento describe la arquitectura general esperada de NYURO Ticket.

Este documento busca explicar hacia dónde se dirige la arquitectura, qué decisiones se están tomando para el MVP y qué partes se dejarán para fases futuras.

---

## Propósito del sistema

NYURO Ticket será un SaaS tipo plantillas/framework configurable para soporte organizacional.

No se busca construir solamente un sistema de tickets tradicional. La idea es crear una plataforma donde cada cliente pueda modelar su propia estructura interna, configurar organizaciones, áreas, usuarios, agentes de soporte, tickets, IA de contingencia y soporte remoto integrado con RustDesk.

El sistema debe poder adaptarse a distintos tipos de organizaciones, como:

- empresas,
- instituciones educativas,
- universidades,
- colegios,
- instituciones públicas,
- municipalidades,
- grupos empresariales,
- organizaciones con varias sedes o áreas internas.

La arquitectura debe permitir que el producto crezca de forma ordenada, sin convertir el proyecto en un sistema rígido ni en una arquitectura demasiado compleja desde el inicio.

---

## Problema que resuelve NYURO Ticket

Muchas organizaciones tienen problemas de soporte que no se adaptan bien a un sistema de tickets genérico.

Cada organización puede tener estructuras diferentes:

- una empresa puede tener áreas como TI, administración, ventas y operaciones;
- una universidad puede tener áreas centrales y facultades;
- una facultad puede tener sus propios laboratorios, secretarías o unidades internas;
- una institución pública puede tener oficinas, sedes y departamentos;
- un grupo empresarial puede manejar varias empresas dentro de un mismo tenant.

NYURO Ticket debe permitir que el tenant configure su propia estructura, sin obligarlo a usar áreas predeterminadas que no necesita.

El sistema debe ayudar a ordenar:

- quién solicita soporte,
- a qué organización o área pertenece,
- quién atiende el ticket,
- qué intentó resolver la IA,
- cuándo se requiere soporte remoto,
- qué agente intervino,
- qué acciones se realizaron,
- qué quedó registrado para auditoría y seguimiento.

---

# Conceptos principales del dominio

## Tenant

El tenant es el cliente que contrata NYURO Ticket.

Un tenant puede representar una empresa, institución educativa, institución pública, universidad, colegio, municipalidad o grupo empresarial.

El tenant es el límite principal de aislamiento de datos. Los datos de un tenant no deben mezclarse ni exponerse a otros tenants.

---

## Organización

Una organización es una entidad dentro del tenant.

Un tenant puede tener una o varias organizaciones.

Ejemplos:

- Empresa A.
- Empresa B.
- Universidad Principal.
- Centro preuniversitario.
- Sede regional.
- Institución pública.
- Colegio.

La organización permite que un mismo tenant administre varias estructuras internas sin mezclar todo en una sola lista de áreas.

---

## Área o unidad organizacional

Las áreas o unidades organizacionales representan la estructura interna de una organización.

Deben poder organizarse como árbol.

Ejemplo:

```txt
Organización Principal
├── TI
│   ├── Soporte
│   └── Infraestructura
├── Administración
└── Facultad de Ingeniería
    ├── Laboratorios
    └── Secretaría Académica
```

Este modelo permitirá representar empresas, instituciones educativas, instituciones públicas y estructuras más complejas sin hardcodear áreas por defecto.

---

## Usuario final

El usuario final es la persona que crea tickets o solicita soporte.

Puede ser un trabajador, estudiante, docente, administrativo, colaborador o cualquier persona perteneciente al tenant según la configuración de la organización.

El usuario final podrá:

- crear tickets,
- responder comentarios,
- conversar con la IA de contingencia cuando aplique,
- confirmar si la solución funcionó,
- reabrir un ticket según reglas del sistema,
- autorizar o participar en una sesión de soporte remoto cuando corresponda.

---

## Agente de soporte

El agente de soporte es la persona encargada de atender tickets.

El agente podrá:

- revisar tickets asignados,
- ver el contexto del caso,
- leer el resumen o reporte generado por la IA,
- responder al usuario,
- registrar acciones realizadas,
- iniciar o gestionar una sesión de soporte remoto con RustDesk si tiene permiso,
- resolver tickets.

---

## Supervisor o jefe de TI

El supervisor o jefe de TI tiene una vista más amplia de la operación de soporte.

Podrá:

- revisar tickets del tenant, organización o área según permisos,
- asignar tickets a agentes,
- configurar reglas básicas,
- revisar métricas,
- ver auditoría,
- supervisar sesiones remotas,
- revisar actividad general del soporte.

---

## IA de contingencia

La IA de contingencia será un servicio auxiliar que apoyará el flujo de soporte.

No debe reemplazar el sistema de tickets ni convertirse en una dependencia crítica.

La IA podrá ayudar con:

- preguntas iniciales al usuario,
- clasificación del ticket,
- sugerencia de prioridad,
- sugerencia de área responsable,
- resumen del caso,
- sugerencias para el agente,
- registro de lo que se intentó antes de escalar a soporte humano.

Si la IA falla, el ticket debe seguir funcionando.

---

## RustDesk / soporte remoto

RustDesk será la integración de soporte remoto dentro del MVP, pero con alcance controlado.

En el MVP, RustDesk debe permitir:

- asociar una sesión remota a un ticket,
- registrar agente responsable,
- registrar usuario solicitante o autorizado,
- guardar código, enlace o identificador de sesión cuando aplique,
- registrar inicio, cierre y resultado de la sesión,
- mostrar la sesión dentro del historial o timeline del ticket,
- auditar acciones relacionadas,
- validar permisos antes de iniciar soporte remoto.

No se debe mezclar la lógica interna de tickets directamente con detalles técnicos de RustDesk. RustDesk debe tratarse como una integración modular.

---

# Arquitectura inicial

NYURO Ticket empezará como un monorepo modular.

La arquitectura inicial debe permitir avanzar rápido, mantener el código ordenado y dejar abierta la posibilidad de extraer servicios en el futuro si el producto crece.

La decisión inicial es:

```txt
Monorepo modular
+ backend NestJS
+ frontend Next.js
+ PostgreSQL
+ Prisma
+ Redis cuando aplique
+ servicio auxiliar de IA
+ integración modular con RustDesk
```

---

## Estado actual del repositorio

Actualmente el repositorio ya cuenta con una base inicial:

```txt
apps/
  api/         # Backend NestJS scaffold. El módulo auth es scaffold CRUD sin lógica real.
  web/         # Frontend Next.js scaffold mínimo.
  ai-service/  # Servicio FastAPI con skeleton mínimo: endpoint de health y stub de IA con TODO. No es funcional.

packages/
  database/    # Prisma con schema inicial (User, Ticket, enums básicos). Sin Tenant, Organization, OrgUnit ni tenantId.
  config/      # Configuración compartida (scaffold)
  types/       # Tipos compartidos (scaffold). Los tipos actuales no incluyen tenantId.
  ui/          # Componentes UI compartidos (scaffold)
  validators/  # Validadores compartidos (scaffold)
```

El proyecto usa pnpm y turbo como base del monorepo.

Existen módulos NestJS placeholder en `apps/api/src/modules/` (`identity`, `tickets`, `ai-contingency`, `sla`). Todos están vacíos y sin registrar en `AppModule`. Son placeholders para issues futuras, no funcionalidad activa.

El `docker-compose.yml` declara servicios para PostgreSQL, Redis, API y AI service. Los Dockerfiles de `apps/api` y `apps/ai-service` todavía no existen, por lo que no es posible levantar esos servicios con Docker Compose hasta que se creen en una issue específica.

El schema de Prisma no incluye todavía `Tenant`, `Organization`, `OrgUnit` ni `tenantId` en ninguna entidad. El modelo de multi-tenancy se construirá en milestones posteriores.

---

# Arquitectura objetivo para el MVP

La arquitectura objetivo del MVP debe avanzar hacia esta estructura:

```txt
apps/
  web/
  api/
  ai-service/
  remote-support-service/

packages/
  database/
  shared/
  config/
  logger/
  contracts/

docs/
  product/
  architecture/
  security/
  development/
  integrations/
```

Esta estructura debe implementarse progresivamente mediante issues. No se debe crear todo de golpe si todavía no aporta valor.

---

# Backend NestJS

El backend será el núcleo principal del sistema durante el MVP.

Debe iniciar como un monolito modular, no como microservicios.

La idea es separar módulos por dominio del producto:

```txt
apps/api/src/modules/
  tenants/
  organizations/
  org-units/
  identity/
  access-control/
  tickets/
  ticket-messages/
  audit/
  ai-assistant/
  remote-support/
  notifications/
  files/
  platform/
  sla/
```

Estos módulos no tienen que estar completamente implementados desde el inicio, pero la arquitectura debe avanzar hacia esa separación.

---

## Responsabilidad del backend

El backend debe encargarse de:

- validar tenant,
- validar permisos,
- administrar organizaciones y áreas,
- gestionar usuarios,
- gestionar tickets,
- coordinar mensajes,
- registrar auditoría,
- coordinar integración con IA,
- coordinar integración con RustDesk,
- exponer API para el frontend.

---

# Frontend Next.js

El frontend debe permitir que cada tipo de usuario interactúe con el sistema según su rol.

El frontend debe incluir progresivamente módulos para:

- autenticación,
- onboarding del tenant,
- organizaciones,
- áreas tipo árbol,
- usuarios,
- roles y permisos,
- tickets,
- conversación del ticket,
- IA de contingencia,
- soporte remoto,
- auditoría,
- dashboard,
- configuración.

La estructura exacta del frontend se definirá en issues posteriores, pero debe evitarse construir pantallas sueltas sin una separación modular clara.

---

# Base de datos PostgreSQL y Prisma

PostgreSQL será la fuente principal de verdad.

Prisma se usará para modelar entidades, migraciones y acceso a datos.

El modelo actual todavía es inicial. El modelo esperado del MVP debe incluir entidades como:

- Tenant,
- Organization,
- OrganizationDomain,
- OrgUnit,
- User,
- OrganizationUser,
- OrgUnitAssignment,
- Role,
- Permission,
- Ticket,
- TicketMessage,
- TicketAssignment,
- TicketTimeline,
- AuditLog,
- AiInteraction,
- RemoteSupportSession.

No todas estas entidades existen actualmente. Se agregarán en milestones posteriores.

---

# Redis

Redis se usará cuando exista una necesidad real.

Los usos que tendrá son:

- cache,
- rate limiting,
- colas,
- presencia,
- jobs,
- coordinación temporal.

Redis no reemplaza PostgreSQL. PostgreSQL seguirá siendo la fuente de verdad.

---

# Servicio de IA

El servicio de IA será auxiliar.

La opción prevista es usar Python/FastAPI para separar la lógica de IA del backend principal.

La IA no debe bloquear el flujo central del sistema. Si la IA falla, el ticket debe poder crearse, asignarse y atenderse igual.

Responsabilidades esperadas del servicio IA:

- clasificar tickets,
- sugerir prioridad,
- sugerir área responsable,
- generar resumen,
- sugerir pasos de contingencia,
- registrar qué intentó resolver.

La IA debe respetar el aislamiento por tenant. No debe cruzar datos entre tenants.

---

# Soporte remoto con RustDesk

RustDesk será parte del MVP como integración básica y controlada.

La arquitectura debe evitar que el módulo de tickets dependa directamente de RustDesk.

La relación esperada es:

```txt
tickets
  solicita o registra soporte remoto

remote-support
  coordina permisos, ticket, tenant y auditoría

remote-support-service / adapter
  encapsula detalles de RustDesk
```

La implementación avanzada de red, VPN, instalación masiva, NAS o inventario queda fuera del MVP.

---

# Comunicación entre partes

Durante el MVP se recomienda mantener una comunicación simple:

- Frontend a backend mediante API HTTP.
- WebSockets solo cuando se implemente tiempo real.
- Backend a IA mediante contrato interno simple cuando el servicio exista.
- Backend a soporte remoto mediante módulo o servicio auxiliar.
- Jobs o colas solo cuando exista una necesidad real.

No se usará gRPC interno entre módulos durante el MVP.

gRPC puede evaluarse en el futuro si se extraen servicios reales y existe una razón técnica.

---

# Por qué no microservicios todavía

Los microservicios completos no son adecuados para esta etapa por varias razones concretas:

- El dominio del producto todavía está siendo definido. Partir módulos en servicios independientes antes de entender bien sus límites reales suele resultar en una arquitectura difícil de cambiar.
- Los microservicios multiplican la complejidad operacional: necesitan service discovery, comunicación entre servicios, trazabilidad distribuida, despliegue independiente por servicio y manejo de consistencia eventual.
- El equipo y el producto todavía no necesitan escalar partes de forma independiente. No tiene sentido pagar ese costo antes de necesitarlo.
- Un monolito modular bien separado por dominios es más fácil de razonar, depurar y mantener en esta etapa.

La apuesta es empezar con un monolito modular con límites claros entre módulos. Si en el futuro hay razones técnicas reales para extraer servicios (escala, equipos independientes, necesidades de despliegue separado), la modularidad interna habrá hecho ese trabajo más fácil, no más difícil.

---

# Por qué no gRPC interno todavía

gRPC aporta valor real cuando hay comunicación frecuente entre servicios independientes con contratos estrictos y alto volumen. En el MVP no tenemos ese escenario todavía.

Agregar gRPC en esta etapa significaría:

- definir y mantener archivos `.proto` para comunicación entre módulos que están en el mismo proceso,
- agregar complejidad de serialización donde una llamada directa a función o a servicio local es suficiente,
- añadir una capa de infraestructura antes de que exista la necesidad real.

Durante el MVP, los módulos del backend se comunican dentro del mismo proceso NestJS mediante inyección de dependencias. Cuando la arquitectura justifique separar servicios reales con contratos de comunicación, gRPC puede evaluarse en ese momento.

---

# Por qué no Kubernetes todavía

Kubernetes es la respuesta correcta a problemas de orquestación a escala. No es la herramienta correcta para arrancar un producto que todavía no tiene usuarios ni carga real.

El costo de Kubernetes en esta etapa es:

- configuración compleja de despliegue antes de tener algo funcional que desplegar,
- overhead de mantenimiento de manifiestos, ingress, secrets, namespaces y recursos de cluster,
- necesidad de conocimientos de operaciones que distraen del desarrollo del producto,
- costos de infraestructura injustificados para el nivel de carga actual.

Para esta etapa, Docker Compose es suficiente para el entorno local y puede serlo también para un alpha inicial. Kubernetes se evaluará cuando el producto esté validado, haya carga real que justifique orquestación y existan razones técnicas concretas para adoptarlo.

---

# Estado actual: qué existe, qué es scaffold y qué no existe todavía

Es importante no confundir la arquitectura objetivo con el estado actual del repositorio. Este cuadro aclara la situación real:

| Componente | Estado | Descripción |
|---|---|---|
| `apps/api` | Scaffold | NestJS base generado por CLI. El módulo `auth` es scaffold CRUD sin lógica real. |
| `apps/web` | Scaffold mínimo | Next.js base con una página de index, un componente y un hook. Sin UI final. |
| `apps/ai-service` | Skeleton | FastAPI con health check y un stub de IA con `TODO`. Sin lógica funcional. |
| `apps/remote-support-service/` | No existe | Parte de la arquitectura objetivo del MVP, pendiente de crear. |
| `packages/database` | Scaffold inicial | Prisma con schema básico (`User`, `Ticket`, enums). Sin `Tenant`, `Organization`, `OrgUnit` ni `tenantId`. |
| `packages/types` | Scaffold | Tipos básicos de `User` y `Ticket`. Sin tipos multi-tenant. |
| `packages/validators` | Scaffold | Schemas básicos de validación. |
| `packages/ui` | Scaffold | Componente `Button` inicial. |
| `packages/config` | Scaffold | Configuración Tailwind base. |
| `docker-compose.yml` | Parcial | PostgreSQL y Redis funcionan. API y AI service requieren Dockerfiles que todavía no existen. |
| Módulos NestJS (`identity`, `tickets`, `ai-contingency`, `sla`) | Placeholders | Carpetas con archivos de módulo vacíos. No registrados en `AppModule`. |
| Multi-tenancy | No implementado | El schema no tiene `Tenant`, `Organization`, `OrgUnit` ni `tenantId`. |
| Auth real | No implementada | El módulo `auth` es scaffold CRUD generado por CLI. |
| Integración RustDesk | No implementada | No hay módulo ni entidad `RemoteSupportSession`. |
| IA funcional conectada al backend | No implementada | El skeleton existe, pero no hay conexión real entre backend y AI service. |
| Dockerfiles de apps | No existen | `apps/api` y `apps/ai-service` no tienen Dockerfile todavía. |

**Scaffold**: estructura base generada, sin lógica funcional real.
**Skeleton**: estructura mínima funcional para health check o compilación, sin lógica de dominio.
**Placeholder**: archivo o carpeta declarada para reservar el lugar en la arquitectura, sin contenido real.
**No existe**: parte de la arquitectura objetivo que todavía no se ha creado.

---

# Seguridad y privacidad

La seguridad debe considerarse desde el inicio.

Reglas principales:

- Todo dato importante debe estar asociado a un tenant.
- Un usuario de un tenant no debe acceder a datos de otro tenant.
- NYURO debe monitorear salud técnica, no contenido privado del tenant.
- La IA no debe cruzar información entre tenants.
- Las sesiones remotas deben estar autorizadas y auditadas.
- Los logs técnicos no deben guardar información sensible innecesaria.
- Los permisos deben validarse en backend, no solo en frontend.

---

# MVP esperado

El MVP debe incluir:

- Tenant.
- Organización.
- Dominios corporativos.
- Áreas tipo árbol.
- Usuarios.
- Asignación de usuarios a organización y área.
- Roles básicos.
- Tickets.
- Mensajes o comentarios del ticket.
- Auditoría básica.
- IA de contingencia simple.
- Soporte remoto integrado con RustDesk en versión básica.
- Dashboard mínimo para supervisores.

Este MVP debe ser suficiente para demostrar que el producto puede funcionar como una plataforma configurable de soporte organizacional.

---

# Fuera del MVP

No se implementará todavía:

- billing real,
- planes comerciales finales,
- Kubernetes,
- microservicios completos,
- gRPC interno entre módulos,
- automatización avanzada de VPN,
- instalación automática completa de RustDesk,
- integración avanzada con NAS,
- mapas de calor avanzados,
- IA RAG empresarial avanzada,
- SLA avanzado,
- pasarela de pagos.

---

# Por qué no se implementan planes comerciales todavía

Los planes comerciales se definirán después de validar el MVP.

La razón es que todavía necesitamos entender mejor:

- cuánto uso real tendrá cada tenant,
- cuánto consumirá la IA,
- cuánto soporte remoto se usará,
- cuántos agentes necesita cada organización,
- cuántos usuarios finales entran en el flujo,
- cuánto almacenamiento se consume,
- qué funcionalidades generan más valor.

Definir precios demasiado temprano puede hacer que el producto cobre mal, limite mal o pierda clientes por reglas comerciales poco realistas.

Durante el MVP se puede medir uso, pero no es necesario implementar billing completo.

---

# Fases futuras

Después del MVP se podrán evaluar:

- planes comerciales,
- billing,
- automatización avanzada de RustDesk,
- VPN,
- integración NAS,
- IA RAG empresarial,
- reportes avanzados,
- mapas de calor,
- Kubernetes,
- microservicios,
- gRPC,
- observabilidad avanzada.

Estas decisiones se deben tomar con datos reales del producto, no solo por anticipación.

---

# Principios de arquitectura

- Empezar simple, pero con límites claros.
- Modularizar por dominio del producto.
- Evitar microservicios prematuros.
- Proteger siempre el aislamiento entre tenants.
- Mantener PostgreSQL como fuente de verdad.
- Usar Redis solo cuando aporte valor real.
- Tratar IA y RustDesk como servicios auxiliares.
- No acoplar tickets directamente a proveedores externos.
- Auditar acciones sensibles desde temprano.
- Documentar decisiones antes de escalar complejidad.

---

# Resumen

NYURO Ticket empezará como un monorepo modular con backend NestJS, frontend Next.js, PostgreSQL, Prisma y servicios auxiliares para IA y soporte remoto.

El MVP debe demostrar el valor principal del producto: permitir que un tenant configure su estructura organizacional real y gestione soporte con tickets, IA de contingencia y RustDesk básico, manteniendo privacidad, auditoría y aislamiento entre tenants.

La arquitectura debe permitir crecer, pero sin implementar complejidad innecesaria desde el primer día.
