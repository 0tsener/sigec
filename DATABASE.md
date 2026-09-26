# Especificación de Base de Datos - SIGEC V1

## Enfoque Multi-tenant
- El modelo es PostgreSQL relacional y multi-tenant.
- Toda entidad de negocio (clientes, servicios, citas, etc.) DEBE poseer una columna `organization_id` para garantizar el aislamiento estricto de datos.
- **Regla de Oro:** Ninguna organización (Tenant A) puede bajo ninguna circunstancia leer o modificar registros pertenecientes a otra organización (Tenant B).

## Entidades Núcleo de la V1
1. **organizations:** Registro de las empresas o tenants del sistema.
2. **organization_settings:** Configuración específica por organización (módulos activos, etc.).
3. **profiles:** Datos de perfil extendidos de los usuarios autenticados.
4. **organization_members:** Tabla intermedia para asociar usuarios a organizaciones con roles específicos.
5. **roles & permissions:** Tablas para el Control de Acceso Basado en Roles (RBAC).
6. **people (base):** Entidad padre para centralizar datos personales.
7. **customers:** Clientes asociados a la organización (hereda/apunta a personas).
8. **employees:** Empleados asociados a la organización (hereda/apunta a personas).
9. **products & services:** Catálogo de productos y servicios ofrecidos por cada organización.
10. **appointments:** Gestión de citas vinculando cliente, servicio, empleado, fecha/hora y estado.