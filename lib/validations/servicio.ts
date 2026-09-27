import { z } from "zod";

const toNonNegativeNumber = (val: unknown) => {
  if (val === "" || val === null || val === undefined) return undefined;
  const parsed = typeof val === "number" ? val : Number(val);
  return Number.isFinite(parsed) ? parsed : val;
};

const toDurationMinutes = (val: unknown) => {
  if (val === "" || val === null || val === undefined) return 30;
  const parsed = typeof val === "number" ? val : Number(val);
  return Number.isFinite(parsed) ? parsed : val;
};

export const servicioSchema = z.object({
  id: z.string().uuid("ID inválido").optional(),
  codigo: z.string().optional(),
  nombre: z
    .string({ required_error: "El nombre del servicio es requerido" })
    .min(2, "El nombre debe tener al menos 2 caracteres"),
  descripcion: z.string().optional(),
  precio: z.preprocess(
    toNonNegativeNumber,
    z
      .number({
        required_error: "El precio es requerido",
        invalid_type_error: "El precio debe ser un número válido",
      })
      .min(0, "El precio debe ser mayor o igual a 0"),
  ),
  duracion_minutos: z.preprocess(
    toDurationMinutes,
    z
      .number({
        invalid_type_error: "La duración debe ser un número válido",
      })
      .min(1, "La duración mínima debe ser al menos 1 minuto"),
  ),
  categoria: z.string().optional().default("General"),
  estado: z.enum(["activo", "inactivo"]).default("activo"),
});

export type ServicioFormValues = z.infer<typeof servicioSchema>;

export interface ServicioRecord {
  id: string;
  organization_id?: string | null;
  codigo?: string | null;
  nombre: string;
  descripcion?: string | null;
  precio: number;
  duracion_minutos: number;
  categoria?: string | null;
  estado: "activo" | "inactivo";
  created_at?: string;
  updated_at?: string;
}
