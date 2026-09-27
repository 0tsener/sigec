import { z } from "zod";

export const personaSchema = z.object({
  id: z.string().uuid("ID inválido").optional(),
  tipo: z.enum(["cliente", "proveedor", "empleado"]).default("cliente"),
  nombre_completo: z
    .string()
    .min(2, "El nombre completo debe tener al menos 2 caracteres"),
  doc_identidad: z.string().optional().or(z.literal("")),
  email: z
    .string()
    .email("Formato de correo electrónico no válido")
    .optional()
    .or(z.literal("")),
  telefono: z.string().optional().or(z.literal("")),
  empresa: z.string().optional().or(z.literal("")),
  direccion: z.string().optional().or(z.literal("")),
  notas: z.string().optional().or(z.literal("")),
  estado: z.enum(["activo", "inactivo", "pendiente"]).default("activo"),
});

export type PersonaFormValues = z.infer<typeof personaSchema>;

export interface PersonaRecord {
  id: string;
  organization_id?: string | null;
  tipo: "cliente" | "proveedor" | "empleado";
  nombre_completo: string;
  doc_identidad?: string | null;
  email?: string | null;
  telefono?: string | null;
  empresa?: string | null;
  direccion?: string | null;
  notas?: string | null;
  estado: "activo" | "inactivo" | "pendiente";
  created_at?: string;
  updated_at?: string;
}
