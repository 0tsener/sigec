-- ==============================================================================
-- SIGEC V1 - Migración: Módulo de Gestión de Personas (public.personas)
-- ==============================================================================

-- 1. Crear tabla 'personas'
CREATE TABLE IF NOT EXISTS public.personas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  tipo VARCHAR(20) NOT NULL DEFAULT 'cliente' CHECK (tipo IN ('cliente', 'proveedor', 'empleado')),
  nombre_completo VARCHAR(255) NOT NULL,
  doc_identidad VARCHAR(50),
  email VARCHAR(255),
  telefono VARCHAR(50),
  empresa VARCHAR(255),
  direccion TEXT,
  notas TEXT,
  estado VARCHAR(20) NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'pendiente')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Índices para optimizar búsquedas y filtrados rápidos
CREATE INDEX IF NOT EXISTS idx_personas_org ON public.personas(organization_id);
CREATE INDEX IF NOT EXISTS idx_personas_tipo ON public.personas(tipo);
CREATE INDEX IF NOT EXISTS idx_personas_estado ON public.personas(estado);
CREATE INDEX IF NOT EXISTS idx_personas_nombre ON public.personas(nombre_completo);
CREATE INDEX IF NOT EXISTS idx_personas_email ON public.personas(email);

-- 3. Habilitar Row Level Security (RLS)
ALTER TABLE public.personas ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de Seguridad RLS para Multi-tenant
DROP POLICY IF EXISTS "Personas select policy" ON public.personas;
CREATE POLICY "Personas select policy" ON public.personas
  FOR SELECT TO authenticated
  USING (
    organization_id IS NULL OR 
    organization_id IN (
      SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Personas insert policy" ON public.personas;
CREATE POLICY "Personas insert policy" ON public.personas
  FOR INSERT TO authenticated
  WITH CHECK (
    organization_id IS NULL OR 
    organization_id IN (
      SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Personas update policy" ON public.personas;
CREATE POLICY "Personas update policy" ON public.personas
  FOR UPDATE TO authenticated
  USING (
    organization_id IS NULL OR 
    organization_id IN (
      SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Personas delete policy" ON public.personas;
CREATE POLICY "Personas delete policy" ON public.personas
  FOR DELETE TO authenticated
  USING (
    organization_id IS NULL OR 
    organization_id IN (
      SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
  );
