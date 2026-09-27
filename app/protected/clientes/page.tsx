import { redirect } from "next/navigation";
import { Info } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { ClientesClient } from "@/components/clientes/clientes-client";
import { Badge } from "@/components/ui/badge";
import { type ClienteRecord } from "@/lib/validations/cliente";

export const metadata = {
  title: "Directorio de Clientes | SIGEC",
  description: "Gestión de datos de contacto y expediente de clientes",
};

export default async function ClientesPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/sign-in");
  }

  let clientes: ClienteRecord[] = [];
  let tableNotFound = false;

  try {
    const { data, error } = await supabase
      .from("clientes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Aviso al consultar la tabla clientes en Supabase:", error.message);
      if (error.code === "PGRST205") {
        tableNotFound = true;
      }
    } else if (data) {
      clientes = data as ClienteRecord[];
    }
  } catch (err) {
    console.error("Error inesperado al consultar clientes:", err);
  }

  const totalCount = clientes.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Directorio de Clientes
            </h1>
            <Badge
              variant="secondary"
              className="font-mono text-xs font-semibold px-2 py-0.5 rounded-full"
            >
              {totalCount} {totalCount === 1 ? "cliente" : "clientes"}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Gestión de datos de contacto y expediente de clientes
          </p>
        </div>
      </div>

      {tableNotFound && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Tabla &quot;clientes&quot; pendiente de creación en Supabase</p>
            <p>
              La tabla{" "}
              <code className="bg-amber-500/20 px-1 py-0.5 rounded font-mono text-[11px]">
                clientes
              </code>{" "}
              aún no existe en el proyecto de Supabase. Puedes crearla ejecutando el script SQL que se encuentra en{" "}
              <code className="bg-amber-500/20 px-1 py-0.5 rounded font-mono text-[11px]">
                supabase/migrations/20260927_create_clientes_table.sql
              </code>{" "}
              en el editor SQL de Supabase.
            </p>
          </div>
        </div>
      )}

      <ClientesClient initialData={clientes || []} />
    </div>
  );
}
