# Arquitectura Técnica - SIGEC V1

## Stack Tecnológico Congelado
- **Frontend / Backend framework:** Next.js (utilizando App Router, Server Components y Server Actions).
- **Lenguaje:** TypeScript.
- **Estilos:** Tailwind CSS.
- **Componentes UI:** shadcn/ui (basado en Radix UI).
- **Base de Datos / Backend-as-a-Service:** Supabase (PostgreSQL, Supabase Auth, Row Level Security).
- **Manejo de Formularios:** React Hook Form con validación de esquemas mediante Zod.
- **Tablas de datos:** TanStack Table.
- **Gráficos:** Recharts.
- **Manejo de Fechas:** date-fns.
- **Pruebas Unitarias / Componentes:** Vitest + React Testing Library.
- **Pruebas End-to-End (E2E):** Playwright.

## Decisiones Explícitas (PROHIBIDO USAR)
- No utilizar Express como backend separado (Next.js se encarga del backend).
- No utilizar ORMs pesados como Prisma (usaremos el cliente nativo de Supabase y SQL directo).
- No utilizar bases de datos NoSQL como MongoDB o Firebase.