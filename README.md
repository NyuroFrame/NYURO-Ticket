# NYURO Ticket

NYURO Ticket es un SaaS/framework configurable para soporte organizacional. No queremos construir solamente un sistema de tickets; queremos una plataforma donde cada tenant pueda modelar su propia organización, áreas, usuarios, agentes, reglas de soporte, IA de contingencia y soporte remoto de forma progresiva.

## Visión

El cliente que contrata el sistema será un tenant. Un tenant puede representar una empresa, institución educativa, institución pública o grupo empresarial. Dentro del tenant se podrán crear una o varias organizaciones. Cada organización podrá modelar sus áreas, sedes, facultades, departamentos o equipos como un árbol configurable.

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

El sistema debe permitir que cada tenant arme su estructura real sin llenarlo de áreas por defecto que no necesita.

## MVP

El MVP debe demostrar:

- Tenant y organización.
- Dominios corporativos permitidos.
- Usuarios asociados a organizaciones y áreas.
- Árbol de áreas/unidades organizacionales.
- Roles y permisos básicos.
- Tickets funcionales.
- Mensajes en tickets.
- Asignación manual de agentes.
- Auditoría básica.
- IA de contingencia simple.
- Soporte remoto básico preparado como integración.
- Dashboard mínimo.
- Aislamiento estricto entre tenants.

No construiremos billing final, Kubernetes, gRPC interno, microservicios completos, RAG avanzado, VPN/NAS automatizado ni despliegue automático de RustDesk en el MVP.

## Principios

1. Tenant primero.
2. No fuga entre tenants.
3. La plataforma monitorea salud técnica, no contenido privado del tenant.
4. Monolito modular primero; microservicios solo cuando haya razón real.
5. IA como apoyo, no como dependencia crítica.
6. RustDesk como integración, no como núcleo.
7. Todo cambio debe nacer de un issue claro.

## Arquitectura inicial

```txt
apps/
  web/          # Frontend Next.js
  api/          # Backend NestJS
  ai-service/   # Servicio auxiliar Python/FastAPI

packages/
  database/     # Prisma schema/client
  shared/       # Tipos y utilidades compartidas
  contracts/    # Contratos internos futuros
```

Stack base:

- Next.js
- NestJS
- PostgreSQL
- Prisma
- Redis cuando aplique
- Python/FastAPI para IA
- Docker Compose para desarrollo y primera alpha
- Kubernetes solo cuando exista necesidad real

## Metodología

```txt
Roadmap → Milestones → Issues → Branch → Pull Request → Review → Tests → Merge
```

Cada issue debe explicar objetivo, contexto, alcance, criterios de aceptación, riesgos, validaciones y consideraciones de seguridad/multi-tenancy.

Cada PR debe incluir checklist de validación, especialmente seguridad y aislamiento de tenant.

## Regla del proyecto

No construiremos todo NYURO Ticket de golpe. Primero construiremos el camino mínimo para demostrar que NYURO Ticket puede existir de forma profesional, segura, configurable y vendible.
