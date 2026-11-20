import { z } from "zod";

export const rolSchema = z.object({
  id: z.string().uuid("ID inválido").optional(),
  name: z
    .string({ required_error: "El nombre del rol es requerido" })
    .min(2, "El nombre debe tener al menos 2 caracteres"),
  description: z.string().optional(),
  permissions: z.array(z.string()).default([]),
});

export type RolFormValues = z.infer<typeof rolSchema>;

export interface RolRecord {
  id: string;
  organization_id?: string | null;
  name: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface RolePermissionRecord {
  id: string;
  role_id: string;
  permission: string;
  created_at?: string;
}

export interface RolWithPermissions extends RolRecord {
  permissions: string[];
}
