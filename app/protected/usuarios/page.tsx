import { redirect } from "next/navigation";
import { Info } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { UsuariosClient } from "@/components/usuarios/usuarios-client";
import { Badge } from "@/components/ui/badge";
import { type UsuarioRecord } from "@/lib/validations/usuario";

export const metadata = {
  title: "Usuarios | SIGEC",
  description: "Gestión de usuarios y roles de la organización",
};

export default async function UsuariosPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/sign-in");
  }

  let usuarios: UsuarioRecord[] = [];
  let roles: Array<{ id: string; name: string }> = [];
  const tableNotFound = false;

  try {
    const [usuariosResult, rolesResult] = await Promise.allSettled([
      supabase
        .from("profiles")
        .select("id, email, full_name, role_id, created_at, updated_at")
        .order("created_at", { ascending: false }),
      supabase.from("roles").select("id, name").order("name"),
    ]);

    if (usuariosResult.status === "fulfilled" && usuariosResult.value.data) {
      usuarios = usuariosResult.value.data.map((u) => ({
        id: u.id,
        email: u.email || "",
        nombre: u.full_name || u.email?.split("@")[0] || "Usuario",
        rol_id: u.role_id,
        estado: "activo", // Default since profiles doesn't have estado
        created_at: u.created_at,
        updated_at: u.updated_at,
      })) as UsuarioRecord[];
    }

    if (rolesResult.status === "fulfilled" && rolesResult.value.data) {
      roles = rolesResult.value.data;
    }

    // Add role names to usuarios
    usuarios = usuarios.map((u) => ({
      ...u,
      rol_nombre: roles.find((r) => r.id === u.rol_id)?.name || null,
    }));
  } catch (err) {
    console.error("Error inesperado al consultar usuarios:", err);
  }

  const totalCount = usuarios.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Usuarios
            </h1>
            <Badge
              variant="secondary"
              className="font-mono text-xs font-semibold px-2 py-0.5 rounded-full"
            >
              {totalCount} {totalCount === 1 ? "usuario" : "usuarios"}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Gestión de usuarios y roles de la organización
          </p>
        </div>
      </div>

      {tableNotFound && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Tablas pendientes de creación en Supabase</p>
            <p>
              Las tablas{" "}
              <code className="bg-amber-500/20 px-1 py-0.5 rounded font-mono text-[11px]">
                profiles
              </code>{" "}
              y{" "}
              <code className="bg-amber-500/20 px-1 py-0.5 rounded font-mono text-[11px]">
                roles
              </code>{" "}
              deben estar configuradas en Supabase.
            </p>
          </div>
        </div>
      )}

      <UsuariosClient initialData={usuarios || []} roles={roles} />
    </div>
  );
}
