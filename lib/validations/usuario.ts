import { z } from "zod";

export const usuarioSchema = z.object({
  id: z.string().uuid("ID inválido").optional(),
  email: z
    .string({ required_error: "El correo electrónico es requerido" })
    .email("Formato de correo electrónico no válido"),
  nombre: z
    .string({ required_error: "El nombre es requerido" })
    .min(2, "El nombre debe tener al menos 2 caracteres"),
  rol_id: z.string().uuid("ID de rol inválido").optional(),
  estado: z.enum(["activo", "inactivo", "pendiente"]).default("pendiente"),
});

export type UsuarioFormValues = z.infer<typeof usuarioSchema>;

export interface UsuarioRecord {
  id: string;
  organization_id?: string | null;
  email: string;
  nombre: string;
  rol_id?: string | null;
  rol_nombre?: string | null;
  estado: "activo" | "inactivo" | "pendiente";
  created_at?: string;
  updated_at?: string;
}
