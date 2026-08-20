# Convenciones de Código y Nomenclatura - SIGEC

## Nomenclatura Básica
- **Componentes de React:** PascalCase (ej: `AppointmentCard.tsx`).
- **Archivos y Carpetas:** kebab-case (ej: `customer-form.tsx`, `/auth-helpers/`).
- **Funciones y Variables:** camelCase (ej: `getAppointmentDetails()`).
- **Base de Datos:** snake_case para tablas y columnas (ej: `organization_id`, `starts_at`).
- **Tablas de base de datos:** Siempre en plural (ej: `organizations`, `appointments`).
- **Llaves primarias:** Siempre se llamarán `id`.
- **Llaves foráneas:** Formato `nombre_tabla_id` (ej: `customer_id`, `organization_id` en singular).

## Calidad de Código Local
Antes de subir cualquier cambio al repositorio (commit), se debe ejecutar localmente:
- `npm run lint` (Para mantener el estilo de código limpio).
- `npm run typecheck` (Para asegurar la integridad de TypeScript).
- `npm test` (Para verificar que los tests unitarios sigan pasando).