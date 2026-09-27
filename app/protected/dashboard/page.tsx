import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export const metadata = {
  title: "Dashboard | SIGEC",
  description: "Panel principal de gestión empresarial",
};

interface DashboardMetrics {
  totalClientes: number;
  totalEmpleados: number;
  totalServicios: number;
  recentClientes: Array<{
    id: string;
    nombres: string;
    apellidos: string;
    created_at: string;
  }>;
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/sign-in");
  }

  // Ejecutar consultas en paralelo para obtener KPIs
  const [clientesResult, empleadosResult, serviciosResult, recentClientesResult] =
    await Promise.allSettled([
      supabase.from("clientes").select("id", { count: "exact", head: true }),
      supabase.from("empleados").select("id", { count: "exact", head: true }),
      supabase.from("servicios").select("id", { count: "exact", head: true }),
      supabase
        .from("clientes")
        .select("id, nombres, apellidos, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  const metrics: DashboardMetrics = {
    totalClientes:
      clientesResult.status === "fulfilled" && clientesResult.value.data
        ? clientesResult.value.count || 0
        : 0,
    totalEmpleados:
      empleadosResult.status === "fulfilled" && empleadosResult.value.data
        ? empleadosResult.value.count || 0
        : 0,
    totalServicios:
      serviciosResult.status === "fulfilled" && serviciosResult.value.data
        ? serviciosResult.value.count || 0
        : 0,
    recentClientes:
      recentClientesResult.status === "fulfilled" && recentClientesResult.value.data
        ? recentClientesResult.value.data
        : [],
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Bienvenido de nuevo, {user.user_metadata?.full_name || user.email?.split("@")[0] || "Usuario"}
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString("es-ES", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      <DashboardClient metrics={metrics} />
    </div>
  );
}
