"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  type ActionResult,
  type AppointmentRecord,
  type AppointmentStatus,
  type CitasFormOptions,
  type CreateAppointmentInput,
  type CustomerOption,
  type CustomerRelation,
  type EmployeeOption,
  type EmployeeRelation,
  type PersonRecord,
  type ServiceOption,
  type ServiceRelation,
} from "./types";

const VALID_STATUSES: AppointmentStatus[] = [
  "scheduled",
  "confirmed",
  "completed",
  "canceled",
  "no_show",
];

function extractPersonRecord(raw: unknown): PersonRecord | null {
  if (!raw) return null;
  const target = Array.isArray(raw) ? raw[0] : raw;
  if (!target || typeof target !== "object") return null;
  const obj = target as Record<string, unknown>;

  const firstName =
    typeof obj.first_name === "string"
      ? obj.first_name
      : typeof obj.nombres === "string"
        ? obj.nombres
        : "";
  const lastName =
    typeof obj.last_name === "string"
      ? obj.last_name
      : typeof obj.apellidos === "string"
        ? obj.apellidos
        : "";
  const phone =
    typeof obj.phone === "string"
      ? obj.phone
      : typeof obj.telefono === "string"
        ? obj.telefono
        : null;

  return {
    first_name: firstName,
    last_name: lastName,
    phone,
  };
}

function extractCustomerRelation(raw: unknown): CustomerRelation | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const id = typeof obj.id === "string" ? obj.id : "";
  const people = extractPersonRecord(obj.people);
  return { id, people };
}

function extractServiceRelation(raw: unknown): ServiceRelation | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  return {
    id: typeof obj.id === "string" ? obj.id : "",
    name:
      typeof obj.name === "string"
        ? obj.name
        : typeof obj.nombre === "string"
          ? obj.nombre
          : "Servicio",
    duration_minutes:
      typeof obj.duration_minutes === "number"
        ? obj.duration_minutes
        : typeof obj.duracion_minutos === "number"
          ? obj.duracion_minutos
          : 30,
    price:
      typeof obj.price === "number"
        ? obj.price
        : typeof obj.precio === "number"
          ? obj.precio
          : Number(obj.price ?? obj.precio ?? 0),
  };
}

function extractEmployeeRelation(raw: unknown): EmployeeRelation | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const id = typeof obj.id === "string" ? obj.id : "";
  const person = extractPersonRecord(obj.people);
  return {
    id,
    people: person
      ? { first_name: person.first_name, last_name: person.last_name }
      : null,
  };
}

/**
 * SELECT de appointments con JOINs a customers, services, employees.
 * Filtro obligatorio .eq('organization_id', orgId) ordenado por starts_at ASC.
 */
export async function getAppointments(
  orgId: string,
): Promise<ActionResult<AppointmentRecord[]>> {
  try {
    if (!orgId) {
      return {
        success: false,
        error: "Se requiere un ID de organización válido.",
      };
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("appointments")
      .select(
        `
        id,
        organization_id,
        customer_id,
        employee_id,
        service_id,
        starts_at,
        ends_at,
        status,
        notes,
        created_at,
        updated_at,
        customers (
          id,
          people (
            first_name,
            last_name,
            phone
          )
        ),
        services (
          id,
          name,
          duration_minutes,
          price
        ),
        employees (
          id,
          people (
            first_name,
            last_name
          )
        )
      `,
      )
      .eq("organization_id", orgId)
      .order("starts_at", { ascending: true });

    if (error) {
      console.warn("Aviso al consultar citas en Supabase:", error.message);
      return {
        success: false,
        error: error.message,
      };
    }

    const records: AppointmentRecord[] = (data || []).map((item) => {
      const raw = item as Record<string, unknown>;
      return {
        id: String(raw.id),
        organization_id: String(raw.organization_id),
        customer_id: String(raw.customer_id),
        employee_id: raw.employee_id ? String(raw.employee_id) : null,
        service_id: String(raw.service_id),
        starts_at: String(raw.starts_at),
        ends_at: String(raw.ends_at),
        status: (VALID_STATUSES.includes(raw.status as AppointmentStatus)
          ? raw.status
          : "scheduled") as AppointmentStatus,
        notes: raw.notes ? String(raw.notes) : null,
        created_at: raw.created_at ? String(raw.created_at) : undefined,
        updated_at: raw.updated_at ? String(raw.updated_at) : undefined,
        customers: extractCustomerRelation(raw.customers),
        services: extractServiceRelation(raw.services),
        employees: extractEmployeeRelation(raw.employees),
      };
    });

    return {
      success: true,
      data: records,
    };
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "Error desconocido al obtener citas.";
    console.error("Error en getAppointments:", err);
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * SELECT de customers, services, employees activos para popular Selects del formulario.
 * Filtro obligatorio por organization_id y estado activo.
 */
export async function getCitasFormOptions(
  orgId: string,
): Promise<ActionResult<CitasFormOptions>> {
  try {
    if (!orgId) {
      return {
        success: false,
        error: "Se requiere un ID de organización válido.",
      };
    }

    const supabase = await createClient();

    // 1. Obtener customers activos
    let customersList: CustomerOption[] = [];
    const { data: customersData, error: custError } = await supabase
      .from("customers")
      .select(
        `
        id,
        status,
        people (
          first_name,
          last_name,
          phone
        )
      `,
      )
      .eq("organization_id", orgId)
      .eq("status", "active");

    if (!custError && customersData) {
      customersList = customersData.map((c) => {
        const raw = c as Record<string, unknown>;
        const person = extractPersonRecord(raw.people);
        const name = person
          ? `${person.first_name} ${person.last_name}`.trim()
          : "Cliente sin nombre";
        return {
          id: String(raw.id),
          name: name || "Cliente sin nombre",
          phone: person?.phone || null,
        };
      });
    } else {
      // Fallback a tabla clientes si customers no está poblada
      const { data: clientesData } = await supabase
        .from("clientes")
        .select("id, nombres, apellidos, telefono, estado")
        .eq("organization_id", orgId)
        .eq("estado", "activo");

      if (clientesData && clientesData.length > 0) {
        customersList = clientesData.map((c) => ({
          id: c.id,
          name: `${c.nombres} ${c.apellidos}`.trim(),
          phone: c.telefono || null,
        }));
      }
    }

    // 2. Obtener services activos
    let servicesList: ServiceOption[] = [];
    const { data: servicesData, error: servError } = await supabase
      .from("services")
      .select("id, name, duration_minutes, price, status")
      .eq("organization_id", orgId)
      .eq("status", "active")
      .order("name", { ascending: true });

    if (!servError && servicesData) {
      servicesList = servicesData.map((s) => {
        const raw = s as Record<string, unknown>;
        return {
          id: String(raw.id),
          name: String(raw.name),
          duration_minutes: Number(raw.duration_minutes || 30),
          price: Number(raw.price || 0),
        };
      });
    } else {
      // Fallback a tabla servicios si services no está poblada
      const { data: serviciosData } = await supabase
        .from("servicios")
        .select("id, nombre, duracion_minutos, precio, estado")
        .eq("organization_id", orgId)
        .eq("estado", "activo")
        .order("nombre", { ascending: true });

      if (serviciosData && serviciosData.length > 0) {
        servicesList = serviciosData.map((s) => ({
          id: s.id,
          name: s.nombre,
          duration_minutes: Number(s.duracion_minutos || 30),
          price: Number(s.precio || 0),
        }));
      }
    }

    // 3. Obtener employees activos
    let employeesList: EmployeeOption[] = [];
    const { data: employeesData, error: empError } = await supabase
      .from("employees")
      .select(
        `
        id,
        status,
        people (
          first_name,
          last_name
        )
      `,
      )
      .eq("organization_id", orgId)
      .eq("status", "active");

    if (!empError && employeesData) {
      employeesList = employeesData.map((e) => {
        const raw = e as Record<string, unknown>;
        const person = extractPersonRecord(raw.people);
        const name = person
          ? `${person.first_name} ${person.last_name}`.trim()
          : "Empleado";
        return {
          id: String(raw.id),
          name: name || "Empleado",
        };
      });
    } else {
      // Fallback a tabla empleados si employees no está poblada
      const { data: empleadosData } = await supabase
        .from("empleados")
        .select("id, nombres, apellidos, estado")
        .eq("organization_id", orgId)
        .eq("estado", "activo");

      if (empleadosData && empleadosData.length > 0) {
        employeesList = empleadosData.map((e) => ({
          id: e.id,
          name: `${e.nombres} ${e.apellidos}`.trim(),
        }));
      }
    }

    return {
      success: true,
      data: {
        customers: customersList,
        services: servicesList,
        employees: employeesList,
      },
    };
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "Error desconocido al obtener opciones del formulario.";
    console.error("Error en getCitasFormOptions:", err);
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * INSERT en appointments previa validación (starts_at < ends_at).
 * Ejecuta revalidatePath('/citas').
 */
export async function createAppointment(
  input: CreateAppointmentInput | FormData,
  orgId: string,
): Promise<ActionResult<AppointmentRecord>> {
  try {
    if (!orgId) {
      return {
        success: false,
        error: "Se requiere la organización para crear la cita.",
      };
    }

    // Normalizar entrada de FormData o CreateAppointmentInput
    let customer_id = "";
    let service_id = "";
    let employee_id: string | null = null;
    let starts_at = "";
    let ends_at = "";
    let notes: string | null = null;
    let status: AppointmentStatus = "scheduled";

    if (input instanceof FormData) {
      customer_id = String(input.get("customer_id") || "").trim();
      service_id = String(input.get("service_id") || "").trim();
      const emp = String(input.get("employee_id") || "").trim();
      employee_id = emp && emp !== "unassigned" ? emp : null;
      starts_at = String(input.get("starts_at") || "").trim();
      ends_at = String(input.get("ends_at") || "").trim();
      const n = String(input.get("notes") || "").trim();
      notes = n ? n : null;
      const s = String(input.get("status") || "scheduled").trim();
      if (VALID_STATUSES.includes(s as AppointmentStatus)) {
        status = s as AppointmentStatus;
      }
    } else {
      customer_id = (input.customer_id || "").trim();
      service_id = (input.service_id || "").trim();
      employee_id =
        input.employee_id && input.employee_id !== "unassigned"
          ? input.employee_id.trim()
          : null;
      starts_at = (input.starts_at || "").trim();
      ends_at = (input.ends_at || "").trim();
      notes = input.notes ? input.notes.trim() : null;
      if (
        input.status &&
        VALID_STATUSES.includes(input.status as AppointmentStatus)
      ) {
        status = input.status;
      }
    }

    // 1. Validaciones requeridas
    if (!customer_id) {
      return { success: false, error: "Debes seleccionar un cliente." };
    }
    if (!service_id) {
      return { success: false, error: "Debes seleccionar un servicio." };
    }
    if (!starts_at || !ends_at) {
      return {
        success: false,
        error: "Debes definir tanto la fecha de inicio como la de fin.",
      };
    }

    const startDate = new Date(starts_at);
    const endDate = new Date(ends_at);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return {
        success: false,
        error: "Las fechas y horas ingresadas no tienen un formato válido.",
      };
    }

    // 2. Validación obligatoria starts_at < ends_at
    if (startDate >= endDate) {
      return {
        success: false,
        error:
          "La hora de inicio debe ser estrictamente anterior a la hora de finalización.",
      };
    }

    const supabase = await createClient();

    const insertPayload = {
      organization_id: orgId,
      customer_id,
      service_id,
      employee_id,
      starts_at: startDate.toISOString(),
      ends_at: endDate.toISOString(),
      status,
      notes,
    };

    const { data, error } = await supabase
      .from("appointments")
      .insert(insertPayload)
      .select(
        `
        id,
        organization_id,
        customer_id,
        employee_id,
        service_id,
        starts_at,
        ends_at,
        status,
        notes,
        created_at,
        updated_at,
        customers (
          id,
          people (
            first_name,
            last_name,
            phone
          )
        ),
        services (
          id,
          name,
          duration_minutes,
          price
        ),
        employees (
          id,
          people (
            first_name,
            last_name
          )
        )
      `,
      )
      .single();

    if (error) {
      console.error("Error al insertar cita en Supabase:", error);
      return {
        success: false,
        error: error.message || "Error al registrar la cita en la base de datos.",
      };
    }

    const raw = data as Record<string, unknown>;
    const createdRecord: AppointmentRecord = {
      id: String(raw.id),
      organization_id: String(raw.organization_id),
      customer_id: String(raw.customer_id),
      employee_id: raw.employee_id ? String(raw.employee_id) : null,
      service_id: String(raw.service_id),
      starts_at: String(raw.starts_at),
      ends_at: String(raw.ends_at),
      status: (VALID_STATUSES.includes(raw.status as AppointmentStatus)
        ? raw.status
        : "scheduled") as AppointmentStatus,
      notes: raw.notes ? String(raw.notes) : null,
      created_at: raw.created_at ? String(raw.created_at) : undefined,
      updated_at: raw.updated_at ? String(raw.updated_at) : undefined,
      customers: extractCustomerRelation(raw.customers),
      services: extractServiceRelation(raw.services),
      employees: extractEmployeeRelation(raw.employees),
    };

    // Revalidación requerida
    revalidatePath("/citas");
    revalidatePath("/protected/citas");

    return {
      success: true,
      data: createdRecord,
    };
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "Error inesperado al crear la cita.";
    console.error("Error en createAppointment:", err);
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * UPDATE de status en appointments.
 */
export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus,
  orgId?: string,
): Promise<ActionResult<{ id: string; status: AppointmentStatus }>> {
  try {
    if (!id) {
      return { success: false, error: "ID de cita requerido." };
    }

    if (!VALID_STATUSES.includes(status)) {
      return {
        success: false,
        error: `Estado inválido. Debe ser uno de: ${VALID_STATUSES.join(", ")}`,
      };
    }

    const supabase = await createClient();

    let query = supabase
      .from("appointments")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (orgId) {
      query = query.eq("organization_id", orgId);
    }

    const { error } = await query;

    if (error) {
      console.error("Error al actualizar estado de la cita:", error);
      return {
        success: false,
        error: error.message || "Error al actualizar el estado de la cita.",
      };
    }

    revalidatePath("/citas");
    revalidatePath("/protected/citas");

    return {
      success: true,
      data: { id, status },
    };
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "Error inesperado al actualizar el estado.";
    console.error("Error en updateAppointmentStatus:", err);
    return {
      success: false,
      error: message,
    };
  }
}
