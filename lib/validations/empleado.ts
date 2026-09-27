import { z } from "zod";

export const empleadoSchema = z.object({
  id: z.string().uuid("ID inválido").optional(),
  nombres: z
    .string({ required_error: "Los nombres son requeridos" })
    .min(2, "Los nombres deben tener al menos 2 caracteres"),
  apellidos: z
    .string({ required_error: "Los apellidos son requeridos" })
    .min(2, "Los apellidos deben tener al menos 2 caracteres"),
  documento_identidad: z.string().optional().or(z.literal("")),
  cargo: z.string().optional().or(z.literal("")).default("Personal"),
  telefono: z.string().optional().or(z.literal("")),
  email: z
    .string()
    .email("Formato de correo electrónico no válido")
    .optional()
    .or(z.literal("")),
  estado: z.enum(["activo", "inactivo"]).default("activo"),
});

export type EmpleadoFormValues = z.infer<typeof empleadoSchema>;

export interface EmpleadoRecord {
  id: string;
  organization_id?: string | null;
  nombres: string;
  apellidos: string;
  documento_identidad?: string | null;
  cargo?: string | null;
  telefono?: string | null;
  email?: string | null;
  estado: "activo" | "inactivo";
  created_at?: string;
  updated_at?: string;
}
