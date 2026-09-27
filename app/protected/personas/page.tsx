import { redirect } from "next/navigation";
import { Info } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { PersonasClient } from "@/components/personas/personas-client";
import { Badge } from "@/components/ui/badge";
import { type PersonaRecord } from "@/lib/validations/persona";

export const metadata = {
  title: "Gestión de Personas | SIGEC",
  description: "Administración centralizada de clientes, proveedores y personal",
};

export default async function PersonasPage() {
  const supabase = await createClient();

  // 1. Verificar la sesión activa
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/sign-in");
  }

  // 2. Consultar la tabla personas ordenada por created_at descendente
  let personas: PersonaRecord[] = [];
  let tableNotFound = false;

  try {
    const { data, error } = await supabase
      .from("personas")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Aviso al consultar la tabla personas en Supabase:", error.message);
      if (error.code === "PGRST205") {
        tableNotFound = true;
      }
    } else if (data) {
      personas = data as PersonaRecord[];
    }
  } catch (err) {
    console.error("Error inesperado al consultar personas:", err);
  }

  const totalCount = personas.length;

  return (
    <div className="space-y-6">
      {/* Cabecera de Página */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Gestión de Personas
            </h1>
            <Badge
              variant="secondary"
              className="font-mono text-xs font-semibold px-2 py-0.5 rounded-full"
            >
              {totalCount} {totalCount === 1 ? "registro" : "registros"}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Administración centralizada de clientes, proveedores y personal
          </p>
        </div>
      </div>

      {tableNotFound && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Tabla &quot;personas&quot; pendiente de creación en Supabase</p>
            <p>
              La tabla <code className="bg-amber-500/20 px-1 py-0.5 rounded font-mono text-[11px]">personas</code> aún no existe en el proyecto de Supabase. Puedes crearla ejecutando el script SQL que se encuentra en <code className="bg-amber-500/20 px-1 py-0.5 rounded font-mono text-[11px]">supabase/migrations/20260927_create_personas_table.sql</code> en el editor SQL de Supabase.
            </p>
          </div>
        </div>
      )}

      {/* Componente Cliente con Tabla Densa y Panel Lateral */}
      <PersonasClient initialData={personas} />
    </div>
  );
}
