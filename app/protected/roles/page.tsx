import { redirect } from "next/navigation";
import { Info } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { RolesClient } from "@/components/roles/roles-client";
import { Badge } from "@/components/ui/badge";
import { type RolWithPermissions } from "@/lib/validations/rol";

export const metadata = {
  title: "Roles y Permisos | SIGEC",
  description: "Gestión de roles y permisos del sistema",
};

export default async function RolesPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/sign-in");
  }

  let roles: RolWithPermissions[] = [];
  let tableNotFound = false;

  try {
    const { data: rolesData, error: rolesError } = await supabase
      .from("roles")
      .select("*")
      .order("name");

    if (rolesError) {
      console.warn("Aviso al consultar la tabla roles en Supabase:", rolesError.message);
      if (rolesError.code === "PGRST205") {
        tableNotFound = true;
      }
    } else if (rolesData) {
      // Get permissions for each role
      const rolesWithPermissions = await Promise.all(
        rolesData.map(async (rol) => {
          const { data: permissionsData } = await supabase
            .from("role_permissions")
            .select("permission")
            .eq("role_id", rol.id);

          return {
            ...rol,
            permissions: permissionsData?.map((p) => p.permission) || [],
          } as RolWithPermissions;
        })
      );

      roles = rolesWithPermissions;
    }
  } catch (err) {
    console.error("Error inesperado al consultar roles:", err);
  }

  const totalCount = roles.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Roles y Permisos
            </h1>
            <Badge
              variant="secondary"
              className="font-mono text-xs font-semibold px-2 py-0.5 rounded-full"
            >
              {totalCount} {totalCount === 1 ? "rol" : "roles"}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Gestión de roles y permisos del sistema
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
                roles
              </code>{" "}
              y{" "}
              <code className="bg-amber-500/20 px-1 py-0.5 rounded font-mono text-[11px]">
                role_permissions
              </code>{" "}
              deben estar configuradas en Supabase.
            </p>
          </div>
        </div>
      )}

      <RolesClient initialData={roles || []} />
    </div>
  );
}
