-- ==============================================================================
-- SIGEC V1 - Migración: Módulo de Gestión de Clientes (public.clientes)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  nombres VARCHAR(150) NOT NULL,
  apellidos VARCHAR(150) NOT NULL,
  documento_identidad VARCHAR(50),
  telefono VARCHAR(50),
  email VARCHAR(255),
  direccion TEXT,
  estado VARCHAR(20) NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_clientes_org ON public.clientes(organization_id);
CREATE INDEX IF NOT EXISTS idx_clientes_estado ON public.clientes(estado);
CREATE INDEX IF NOT EXISTS idx_clientes_nombres ON public.clientes(nombres);
CREATE INDEX IF NOT EXISTS idx_clientes_apellidos ON public.clientes(apellidos);
CREATE INDEX IF NOT EXISTS idx_clientes_documento ON public.clientes(documento_identidad);

ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Clientes select policy" ON public.clientes;
CREATE POLICY "Clientes select policy" ON public.clientes
  FOR SELECT TO authenticated
  USING (
    organization_id IS NULL OR
    organization_id IN (
      SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Clientes insert policy" ON public.clientes;
CREATE POLICY "Clientes insert policy" ON public.clientes
  FOR INSERT TO authenticated
  WITH CHECK (
    organization_id IS NULL OR
    organization_id IN (
      SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Clientes update policy" ON public.clientes;
CREATE POLICY "Clientes update policy" ON public.clientes
  FOR UPDATE TO authenticated
  USING (
    organization_id IS NULL OR
    organization_id IN (
      SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Clientes delete policy" ON public.clientes;
CREATE POLICY "Clientes delete policy" ON public.clientes
  FOR DELETE TO authenticated
  USING (
    organization_id IS NULL OR
    organization_id IN (
      SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
  );
