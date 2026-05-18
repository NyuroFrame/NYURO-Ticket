# Privacidad, seguridad operativa y límites de plataforma

Este documento explica qué información es privada de cada tenant, qué puede monitorear NYURO como plataforma, qué reglas deben cumplir los logs técnicos, la IA, RustDesk y la auditoría, y cuáles son los límites de NYURO como operador de la plataforma.

No describe arquitectura general ni cómo levantar el entorno local. Para eso existen [`docs/architecture/overview.md`](../architecture/overview.md) y [`docs/development/local-environment.md`](../development/local-environment.md).

---

## Por qué este documento existe

NYURO Ticket manejará información sensible de organizaciones reales: tickets de soporte, usuarios internos, estructura organizacional, conversaciones con IA y sesiones de soporte remoto.

Una de las reglas principales del producto es que NYURO puede operar y monitorear la plataforma sin necesidad de revisar el contenido privado de los tenants.

Esto no es solo un principio de diseño. Es un compromiso con los clientes que van a confiar su estructura organizacional, sus problemas internos y sus conversaciones de soporte a esta plataforma.

Si no dejamos esto claro desde el inicio, es fácil que decisiones técnicas aparentemente inocentes (logs, trazas, prompts de IA, integraciones con RustDesk) terminen exponiendo lo que no deben.

---

## Datos privados del tenant

Los siguientes datos pertenecen exclusivamente al tenant y no deben estar disponibles para NYURO salvo que exista un mecanismo futuro muy claro, autorizado y auditado:

- tickets y su contenido,
- mensajes y comentarios dentro de tickets,
- archivos adjuntos,
- reportes internos,
- usuarios internos del tenant y su información,
- estructura organizacional del tenant,
- áreas o unidades organizacionales configuradas,
- conversaciones con la IA de contingencia,
- resúmenes generados por IA,
- documentos o contexto usado por la IA,
- sesiones de soporte remoto,
- información de red o equipos internos del tenant,
- información técnica sensible de la organización,
- historial de acciones internas del tenant.

Estos datos son del tenant. NYURO es la plataforma que los almacena, no la dueña de esa información.

---

## Qué puede monitorear NYURO

NYURO sí puede monitorear información técnica o agregada para mantener la plataforma funcionando correctamente.

Esto incluye:

- estado de servicios y contenedores,
- errores técnicos del sistema sin contenido privado,
- latencia y tiempos de respuesta,
- uso agregado (por ejemplo, cantidad de tickets sin su contenido, cantidad de usuarios sin datos sensibles),
- consumo de recursos por tenant sin acceder a contenido,
- consumo de IA sin acceder a prompts ni respuestas privadas,
- estado de integraciones y jobs,
- salud de base de datos y Redis,
- métricas de infraestructura,
- fallos técnicos y alertas de rendimiento,
- eventos técnicos que no incluyan contenido privado.

La plataforma debe ser observable sin necesidad de exponer lo que los tenants guardan en ella.

---

## Qué no debe ver NYURO

NYURO no debe:

- leer el contenido de tickets ni sus mensajes,
- descargar archivos privados del tenant,
- revisar documentos usados por la IA de un tenant,
- leer conversaciones entre usuarios y la IA,
- acceder a la estructura organizacional del tenant con fines distintos al mantenimiento técnico autorizado,
- iniciar sesiones de soporte remoto dentro de un tenant sin autorización explícita,
- cruzar datos de un tenant para usarlos en otro,
- entrenar modelos propios con datos privados de un tenant sin su consentimiento documentado.

---

## Reglas para logs técnicos

Los logs técnicos son necesarios para depurar el sistema, detectar errores y monitorear el rendimiento. Sin embargo, deben cumplir estas reglas:

- no deben guardar el contenido completo de tickets,
- no deben guardar mensajes privados,
- no deben guardar archivos ni contenido de documentos internos,
- no deben guardar credenciales ni tokens de acceso,
- no deben guardar códigos sensibles de sesiones remotas,
- no deben guardar prompts completos si contienen información sensible del tenant,
- deben usar identificadores técnicos (IDs) en lugar de contenido cuando sea posible,
- deben incluir `tenantId` cuando el modelo multi-tenant esté implementado, para poder filtrar sin acceder a contenido,
- deben ser útiles para depurar sin filtrar datos privados.

Si un log necesita describir qué ocurrió en un ticket, debe decir algo como `ticket_id=abc123 action=status_changed` y no incluir el título, descripción ni mensajes del ticket.

---

## Reglas para la IA de contingencia

La IA de contingencia manejará información sensible de los tenants. Deben respetarse estas reglas desde que se implemente:

- la IA no debe cruzar datos entre tenants bajo ninguna circunstancia,
- la IA no debe entrenarse con datos privados del tenant sin consentimiento explícito y documentado,
- todas las interacciones de IA deben quedar asociadas al tenant correcto,
- los documentos de un tenant no deben estar disponibles en el contexto de otro tenant,
- si la IA falla, el ticket debe seguir funcionando; la IA es apoyo, no dependencia crítica,
- los resultados generados por IA deben tratarse como datos privados del tenant,
- los prompts, respuestas y resúmenes generados pueden contener datos sensibles y deben protegerse como tal.

Actualmente `apps/ai-service` existe como skeleton mínimo sin lógica de IA real. Estas reglas aplican cuando se implemente la funcionalidad real.

---

## Reglas para soporte remoto con RustDesk

El soporte remoto implica acceso directo a equipos de usuarios. Es una de las áreas con mayor riesgo de privacidad. Las reglas son:

- toda sesión remota debe pertenecer a un tenant identificado,
- toda sesión remota debe estar asociada a un ticket activo,
- solo usuarios autorizados pueden iniciar o gestionar soporte remoto,
- toda sesión remota debe quedar auditada con registro claro de quién la inició, cuándo y con qué propósito,
- el usuario debe solicitar o autorizar explícitamente la atención remota según el flujo definido,
- NYURO no debe iniciar sesiones remotas dentro de un tenant sin autorización explícita del tenant o del usuario afectado,
- no se deben guardar credenciales sensibles en texto plano en logs ni en base de datos,
- no se debe registrar información privada de red o equipos del tenant en logs técnicos de la plataforma,
- la integración con RustDesk debe mantenerse aislada, modular y auditada.

Actualmente `apps/remote-support-service/` no existe todavía. Estas reglas aplican cuando se implemente la integración real con RustDesk.

---

## Auditoría

La auditoría no es lo mismo que el logging técnico.

**El logging técnico** sirve para que NYURO mantenga y depure la plataforma. Los logs técnicos deben ayudar a detectar errores de sistema sin exponer contenido privado.

**La auditoría** sirve para que el tenant tenga trazabilidad de las acciones importantes dentro de su organización. Los registros de auditoría pertenecen al tenant y están pensados para que supervisores, administradores o auditores del tenant puedan revisar qué ocurrió en su sistema.

Ejemplos de acciones que deben registrarse en auditoría:

- creación de tickets,
- cambio de estado de tickets,
- asignación de tickets a agentes,
- respuestas o comentarios importantes,
- uso de la IA de contingencia,
- inicio o cierre de sesiones de soporte remoto,
- cambios de roles y permisos,
- asignación o remoción de usuarios de organizaciones o áreas,
- intentos de acceso denegado.

La auditoría debe servir para la trazabilidad interna del tenant. No es para que NYURO inspeccione el contenido de lo que hacen los tenants.

---

## Límites de NYURO como plataforma

NYURO puede y debe:

- mantener la infraestructura de la plataforma,
- revisar errores técnicos del sistema,
- revisar métricas agregadas de uso,
- revisar el estado de servicios e integraciones,
- detectar y atender fallos de rendimiento,
- operar backups o restauraciones según política futura acordada con el tenant,
- dar soporte técnico de plataforma cuando el tenant lo solicite.

NYURO no debe:

- leer el contenido de tickets ni mensajes del tenant,
- descargar archivos privados,
- revisar documentos usados por la IA de un tenant,
- iniciar sesiones remotas dentro de un tenant sin autorización explícita,
- usar los datos de un tenant para beneficiar a otro,
- entrenar modelos con datos del tenant sin consentimiento documentado.

---

## Principios de privacidad y operación

Estos principios deben guiar las decisiones técnicas y operativas del proyecto:

1. **Tenant primero**: todo dato operativo importante pertenece a un tenant. Si no hay tenant claro, el dato no debería existir.
2. **No fuga entre tenants**: los datos de un tenant no deben ser visibles ni inferibles desde otro tenant, ni por diseño ni por error.
3. **Privacidad del tenant por defecto**: si hay duda sobre si algo es privado, asumimos que sí lo es.
4. **Mínimo acceso necesario**: NYURO solo debe poder ver lo que necesita para operar la plataforma. Nada más.
5. **IA aislada por tenant**: cada interacción con IA debe estar completamente separada por tenant.
6. **Soporte remoto autorizado y auditado**: ninguna sesión remota puede iniciarse sin que el tenant o usuario la haya autorizado explícitamente.
7. **Logs técnicos sin contenido privado**: los logs de la plataforma no son el lugar para guardar títulos de tickets, mensajes ni documentos de usuarios.
8. **Auditoría para trazabilidad, no para espionaje**: la auditoría existe para que el tenant tenga control sobre su propio historial, no para que NYURO lo monitoree.
9. **Plataforma observable sin exposición de datos privados**: necesitamos poder monitorear que la plataforma funciona bien, pero eso no requiere leer lo que los tenants guardan en ella.
10. **Seguridad validada en backend**: ocultar botones en el frontend no es suficiente. Toda acción sensible debe validarse en el backend antes de ejecutarse.

---

## Riesgos que debemos evitar

Estos riesgos están identificados desde el inicio para no construir una plataforma insegura:

- Guardar contenido sensible en logs técnicos por error o descuido.
- Que la IA use datos de un tenant en el contexto de otro tenant.
- Implementar soporte remoto sin auditoría ni validación de permisos.
- Que NYURO acumule permisos excesivos sobre los datos del tenant.
- Confundir auditoría con monitoreo técnico y terminar registrando contenido privado.
- Guardar credenciales o códigos sensibles en texto plano.
- Permitir acceso entre tenants por errores de diseño en queries o manejo de contexto.
- Construir la integración con RustDesk sin validar permisos ni dejar trazabilidad.
- Incluir datos del tenant en errores o excepciones que se envían a sistemas externos de logging.
