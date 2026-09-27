-- ==============================================================================
-- SIGEC V1 - Migración: Módulo de Gestión de Servicios (public.servicios)
-- ==============================================================================

-- 1. Crear tabla 'servicios'
CREATE TABLE IF NOT EXISTS public.servicios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  codigo VARCHAR(50),
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  precio NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (precio >= 0),
  duracion_minutos INTEGER NOT NULL DEFAULT 30 CHECK (duracion_minutos >= 1),
  categoria VARCHAR(100) NOT NULL DEFAULT 'General',
  estado VARCHAR(20) NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Índices para optimizar búsquedas y filtrados
CREATE INDEX IF NOT EXISTS idx_servicios_org ON public.servicios(organization_id);
CREATE INDEX IF NOT EXISTS idx_servicios_estado ON public.servicios(estado);
CREATE INDEX IF NOT EXISTS idx_servicios_categoria ON public.servicios(categoria);
CREATE INDEX IF NOT EXISTS idx_servicios_nombre ON public.servicios(nombre);
CREATE INDEX IF NOT EXISTS idx_servicios_codigo ON public.servicios(codigo);

-- 3. Habilitar Row Level Security (RLS)
ALTER TABLE public.servicios ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de Seguridad RLS para Multi-tenant
DROP POLICY IF EXISTS "Servicios select policy" ON public.servicios;
CREATE POLICY "Servicios select policy" ON public.servicios
  FOR SELECT TO authenticated
  USING (
    organization_id IS NULL OR 
    organization_id IN (
      SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Servicios insert policy" ON public.servicios;
CREATE POLICY "Servicios insert policy" ON public.servicios
  FOR INSERT TO authenticated
  WITH CHECK (
    organization_id IS NULL OR 
    organization_id IN (
      SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Servicios update policy" ON public.servicios;
CREATE POLICY "Servicios update policy" ON public.servicios
  FOR UPDATE TO authenticated
  USING (
    organization_id IS NULL OR 
    organization_id IN (
      SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Servicios delete policy" ON public.servicios;
CREATE POLICY "Servicios delete policy" ON public.servicios
  FOR DELETE TO authenticated
  USING (
    organization_id IS NULL OR 
    organization_id IN (
      SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
  );
