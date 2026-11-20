import { redirect } from "next/navigation";
import { Info } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getAppointments, getCitasFormOptions } from "./actions";
import { CitasView } from "./citas-view";
import {
  type AppointmentRecord,
  type CitasFormOptions,
} from "./types";

export const metadata = {
  title: "Agenda y Citas | SIGEC",
  description: "Módulo de gestión y programación de citas empresariales",
};

export default async function CitasPage() {
  const supabase = await createClient();

  // 1. Verificar autenticación
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/sign-in");
  }

  // 2. Obtener organización del usuario
  let organizationId = "";
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.organization_id) {
      organizationId = profile.organization_id;
    } else {
      // Fallback a membership
      const { data: member } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      if (member?.organization_id) {
        organizationId = member.organization_id;
      } else {
        // Fallback a primera organización disponible
        const { data: org } = await supabase
          .from("organizations")
          .select("id")
          .limit(1)
          .maybeSingle();

        if (org?.id) {
          organizationId = org.id;
        }
      }
    }
  } catch (err) {
    console.error("Error al obtener la organización del usuario:", err);
  }

  // Fallback si no hay organización en DB
  if (!organizationId) {
    organizationId = "00000000-0000-0000-0000-000000000000";
  }

  // 3. Consultar citas y opciones del formulario mediante Server Actions
  let appointments: AppointmentRecord[] = [];
  let formOptions: CitasFormOptions = {
    customers: [],
    services: [],
    employees: [],
  };
  let tableNotFound = false;

  const [appointmentsRes, optionsRes] = await Promise.all([
    getAppointments(organizationId),
    getCitasFormOptions(organizationId),
  ]);

  if (appointmentsRes.success && appointmentsRes.data) {
    appointments = appointmentsRes.data;
  } else if (
    appointmentsRes.error?.includes("PGRST205") ||
    appointmentsRes.error?.includes("relation") ||
    appointmentsRes.error?.includes("appointments")
  ) {
    tableNotFound = true;
  }

  if (optionsRes.success && optionsRes.data) {
    formOptions = optionsRes.data;
  }

  return (
    <div className="space-y-6">
      {tableNotFound && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">
              Tabla &quot;appointments&quot; pendiente de creación en Supabase
            </p>
            <p>
              La tabla{" "}
              <code className="bg-amber-500/20 px-1 py-0.5 rounded font-mono text-[11px]">
                appointments
              </code>{" "}
              o sus relaciones aún no han sido creadas en tu base de datos de Supabase. Puedes crearla ejecutando el script SQL que se encuentra en:{" "}
              <code className="bg-amber-500/20 px-1 py-0.5 rounded font-mono text-[11px]">
                supabase/migrations/20260928_create_appointments_table.sql
              </code>{" "}
              en el editor SQL de tu panel de Supabase.
            </p>
          </div>
        </div>
      )}

      <CitasView
        initialAppointments={appointments}
        formOptions={formOptions}
        organizationId={organizationId}
      />
    </div>
  );
}
