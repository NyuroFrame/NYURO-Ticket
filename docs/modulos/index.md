# Módulos en NestJS

> **Referencia general:** Este documento explica cómo funcionan los módulos en NestJS como framework. No describe los módulos actuales del proyecto NYURO Ticket. Para ver qué módulos existen en el proyecto, consultar `apps/api/src/modules/`.

Un **módulo** es una clase decorada con `@Module()`. Este decorador proporciona los metadatos que NestJS utiliza para organizar la estructura de la aplicación y resolver el grafo de dependencias.

Cada aplicación tiene al menos un módulo: el **módulo raíz** (`AppModule`). Es el punto de partida que NestJS usa para construir el árbol de la aplicación y descubrir las relaciones entre proveedores y controladores.

> Aunque podrías meter todo en `AppModule`, lo recomendable es dividir la aplicación en varios módulos. Cada módulo encapsula un conjunto de funcionalidades relacionadas (usuarios, autenticación, tickets, etc.), siguiendo principios similares a los de los componentes en arquitecturas modernas.

## Anatomía del decorador `@Module()`

El decorador acepta un objeto con cuatro propiedades:

| Propiedad     | Descripción                                                                                  |
| ------------- | -------------------------------------------------------------------------------------------- |
| `providers`   | Servicios que el inyector de dependencias instanciará y compartirá dentro del módulo.        |
| `controllers` | Controladores que deben ser instanciados por este módulo.                                    |
| `imports`     | Lista de módulos cuyos proveedores exportados estarán disponibles aquí.                      |
| `exports`     | Subconjunto de `providers` (u otros módulos) que se hacen visibles a quien importa el módulo. |

Por defecto, los proveedores son **encapsulados** en su módulo: no pueden inyectarse desde fuera a menos que se exporten explícitamente.

## Módulos de funcionalidad (Feature Modules)

Un módulo de funcionalidad agrupa código relacionado con un dominio concreto. Por ejemplo, un módulo `TicketsModule` que reúne el controlador y el servicio de tickets:

```ts
// tickets/tickets.module.ts
import { Module } from '@nestjs/common';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';

@Module({
  controllers: [TicketsController],
  providers: [TicketsService],
})
export class TicketsModule {}
```

Para activarlo en la aplicación, hay que importarlo desde el módulo raíz:

```ts
// app.module.ts
import { Module } from '@nestjs/common';
import { TicketsModule } from './tickets/tickets.module';

@Module({
  imports: [TicketsModule],
})
export class AppModule {}
```

> Puedes generar un módulo desde la CLI: `nest g module tickets`.

La estructura de carpetas resultante suele verse así:

```
src/
├── tickets/
│   ├── dto/
│   ├── entities/
│   ├── tickets.controller.ts
│   ├── tickets.module.ts
│   └── tickets.service.ts
├── app.module.ts
└── main.ts
```

## Módulos compartidos (Shared Modules)

En NestJS los módulos son **singletons** por defecto. Esto significa que cualquier proveedor exportado puede ser reutilizado en distintos módulos compartiendo la misma instancia.

Para compartir un servicio, hay que exportarlo:

```ts
// tickets/tickets.module.ts
import { Module } from '@nestjs/common';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';

@Module({
  controllers: [TicketsController],
  providers: [TicketsService],
  exports: [TicketsService],
})
export class TicketsModule {}
```

A partir de aquí, cualquier módulo que importe `TicketsModule` puede inyectar `TicketsService` y obtendrá la misma instancia.

## Reexportación de módulos

Un módulo puede reexportar los módulos que importa. Esto resulta útil cuando se quiere agrupar varios módulos relacionados bajo un único punto de entrada:

```ts
// core/core.module.ts
@Module({
  imports: [CommonModule],
  exports: [CommonModule],
})
export class CoreModule {}
```

Quien importe `CoreModule` también tendrá acceso a los proveedores exportados por `CommonModule`.

## Inyección de dependencias en el módulo

Una clase módulo también puede recibir proveedores por inyección, normalmente para tareas de configuración:

```ts
@Module({
  controllers: [TicketsController],
  providers: [TicketsService],
})
export class TicketsModule {
  constructor(private readonly ticketsService: TicketsService) {}
}
```

> Importante: los módulos no pueden inyectarse a sí mismos como proveedores; eso provocaría una dependencia circular.

## Módulos globales

Cuando un proveedor debe estar disponible en toda la aplicación sin necesidad de importarlo en cada módulo, se puede marcar el módulo como **global** con `@Global()`:

```ts
import { Module, Global } from '@nestjs/common';
import { ConfigService } from './config.service';

@Global()
@Module({
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
```

Con `@Global()`, basta con importar `ConfigModule` una sola vez (normalmente en el módulo raíz) y `ConfigService` quedará disponible en cualquier parte.

> Usa módulos globales con moderación. Abusar de ellos diluye los límites entre módulos y dificulta razonar sobre las dependencias. La regla general es exportar lo necesario y dejar que cada módulo declare sus dependencias explícitamente.

## Módulos dinámicos

Los **módulos dinámicos** permiten configurar un módulo en tiempo de ejecución, devolviendo metadatos personalizados. Son la base de paquetes como `@nestjs/typeorm`, `@nestjs/jwt` o `@nestjs/config`.

Un módulo dinámico expone uno o varios métodos estáticos (por convención `forRoot`, `forFeature`, `register`, etc.) que devuelven un objeto `DynamicModule`:

```ts
import { DynamicModule, Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { createConnectionProviders } from './database.providers';

@Module({
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {
  static forRoot(entities: any[], options: Record<string, any>): DynamicModule {
    const providers = createConnectionProviders(entities, options);

    return {
      module: DatabaseModule,
      providers,
      exports: providers,
    };
  }
}
```

Su uso queda así:

```ts
@Module({
  imports: [
    DatabaseModule.forRoot([Ticket, User], {
      host: 'localhost',
      port: 5432,
    }),
  ],
})
export class AppModule {}
```

Si quieres que un módulo dinámico también sea global, agrega `global: true` al objeto retornado:

```ts
return {
  module: DatabaseModule,
  global: true,
  providers,
  exports: providers,
};
```

### Variantes habituales de métodos estáticos

| Método       | Uso típico                                                                 |
| ------------ | -------------------------------------------------------------------------- |
| `forRoot`    | Configuración inicial (una sola vez, normalmente en el módulo raíz).       |
| `forRootAsync` | Igual que `forRoot` pero con configuración asíncrona (factories, inyección). |
| `forFeature`  | Configuración por dominio o entidad (suele importarse en cada feature module). |
| `register`   | Configuración puntual y específica de cada importación.                    |

## Buenas prácticas

- **Un módulo, un dominio**: cada módulo debe tener una responsabilidad clara.
- **Exporta solo lo necesario**: cuanto menor sea la superficie pública, mejor.
- **Evita dependencias circulares** entre módulos. Si aparecen, replantea la división o usa `forwardRef()` con cautela.
- **Prefiere imports explícitos** a `@Global()` salvo casos puntuales (configuración, logging, base de datos).
- **Usa la CLI** (`nest g module`, `nest g resource`) para mantener una estructura consistente.

## Recursos relacionados

- Documentación oficial: <https://docs.nestjs.com/modules>
- Inyección de dependencias: <https://docs.nestjs.com/fundamentals/custom-providers>
- Módulos dinámicos: <https://docs.nestjs.com/fundamentals/dynamic-modules>
