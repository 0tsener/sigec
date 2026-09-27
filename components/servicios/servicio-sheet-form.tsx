"use client";

import React, { useEffect, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Tag,
  Clock,
  DollarSign,
  Layers,
  Loader2,
  Save,
  X,
  AlertCircle,
  Hash,
  Sparkles,
} from "lucide-react";

import {
  servicioSchema,
  type ServicioFormValues,
  type ServicioRecord,
} from "@/lib/validations/servicio";
import { createClient } from "@/lib/supabase/client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ServicioSheetFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  servicioToEdit?: ServicioRecord | null;
  onSuccess?: (savedServicio: ServicioRecord, isEdit: boolean) => void;
}

export function ServicioSheetForm({
  open,
  onOpenChange,
  servicioToEdit,
  onSuccess,
}: ServicioSheetFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = Boolean(servicioToEdit?.id);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ServicioFormValues>({
    resolver: zodResolver(servicioSchema) as unknown as Resolver<ServicioFormValues>,
    defaultValues: {
      codigo: "",
      nombre: "",
      descripcion: "",
      precio: 0,
      duracion_minutos: 30,
      categoria: "General",
      estado: "activo",
    },
  });

  useEffect(() => {
    if (open) {
      if (servicioToEdit) {
        reset({
          id: servicioToEdit.id,
          codigo: servicioToEdit.codigo || "",
          nombre: servicioToEdit.nombre || "",
          descripcion: servicioToEdit.descripcion || "",
          precio: Number(servicioToEdit.precio) || 0,
          duracion_minutos: servicioToEdit.duracion_minutos ?? 30,
          categoria: servicioToEdit.categoria || "General",
          estado: servicioToEdit.estado || "activo",
        });
      } else {
        reset({
          codigo: "",
          nombre: "",
          descripcion: "",
          precio: 0,
          duracion_minutos: 30,
          categoria: "General",
          estado: "activo",
        });
      }
    }
  }, [open, servicioToEdit, reset]);

  const onSubmit = async (values: ServicioFormValues) => {
    setIsSubmitting(true);
    const supabase = createClient();

    try {
      const payload = {
        codigo: values.codigo?.trim() || null,
        nombre: values.nombre.trim(),
        descripcion: values.descripcion?.trim() || null,
        precio: Number(values.precio),
        duracion_minutos: Number(values.duracion_minutos),
        categoria: values.categoria?.trim() || "General",
        estado: values.estado,
        updated_at: new Date().toISOString(),
      };

      if (isEditing && servicioToEdit?.id) {
        const { data, error } = await supabase
          .from("servicios")
          .update(payload)
          .eq("id", servicioToEdit.id)
          .select()
          .single();

        if (error) {
          throw new Error(error.message || "Error al actualizar el servicio");
        }

        toast.success("Servicio actualizado correctamente", {
          description: `${payload.nombre} ha sido modificado.`,
        });

        if (data && onSuccess) {
          onSuccess(data as ServicioRecord, true);
        }
      } else {
        let organizationId: string | null = null;
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (user) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("organization_id")
              .eq("id", user.id)
              .maybeSingle();

            if (profile?.organization_id) {
              organizationId = profile.organization_id;
            }
          }
        } catch {
          // Continuar si falla la obtención del perfil
        }

        const insertPayload = {
          ...payload,
          ...(organizationId ? { organization_id: organizationId } : {}),
        };

        const { data, error } = await supabase
          .from("servicios")
          .insert(insertPayload)
          .select()
          .single();

        if (error) {
          throw new Error(error.message || "Error al registrar el servicio");
        }

        toast.success("Servicio creado con éxito", {
          description: `${payload.nombre} fue añadido al catálogo.`,
        });

        if (data && onSuccess) {
          onSuccess(data as ServicioRecord, false);
        }
      }

      router.refresh();
      onOpenChange(false);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Ocurrió un error inesperado";
      toast.error("Error al guardar", {
        description: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl md:max-w-2xl flex flex-col p-0 overflow-hidden"
      >
        <SheetHeader className="px-6 py-5 border-b bg-card/60 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
              {isEditing ? (
                <Tag className="w-5 h-5 text-primary" />
              ) : (
                <Sparkles className="w-5 h-5 text-primary" />
              )}
            </div>
            <div>
              <SheetTitle className="text-lg font-bold text-foreground">
                {isEditing ? "Editar Servicio" : "Nuevo Servicio"}
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground">
                {isEditing
                  ? "Modifica las tarifas, tiempos y especificaciones del servicio."
                  : "Registra un nuevo servicio o paquete dentro de tu catálogo."}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <form
          id="servicio-sheet-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto px-6 py-6 space-y-5"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5 sm:col-span-1">
              <Label
                htmlFor="codigo"
                className="text-xs font-semibold text-foreground"
              >
                Código
              </Label>
              <div className="relative">
                <Hash className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="codigo"
                  placeholder="Ej: SERV-01"
                  className="pl-9 text-xs h-9 uppercase font-mono"
                  {...register("codigo")}
                />
              </div>
              {errors.codigo && (
                <p className="text-xs text-destructive mt-1">
                  {errors.codigo.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label
                htmlFor="nombre"
                className="text-xs font-semibold text-foreground"
              >
                Nombre del Servicio <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Tag className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="nombre"
                  placeholder="Ej: Consulta Especializada / Mantenimiento Pro"
                  className={`pl-9 text-xs h-9 ${
                    errors.nombre ? "border-destructive focus-visible:ring-destructive" : ""
                  }`}
                  {...register("nombre")}
                />
              </div>
              {errors.nombre && (
                <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.nombre.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="categoria"
                className="text-xs font-semibold text-foreground"
              >
                Categoría
              </Label>
              <div className="relative">
                <Layers className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="categoria"
                  placeholder="Ej: General, Belleza, Consultoría"
                  className="pl-9 text-xs h-9"
                  {...register("categoria")}
                />
              </div>
              {errors.categoria && (
                <p className="text-xs text-destructive mt-1">
                  {errors.categoria.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="precio"
                className="text-xs font-semibold text-foreground"
              >
                Precio <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="precio"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className={`pl-9 text-xs h-9 font-medium ${
                    errors.precio ? "border-destructive focus-visible:ring-destructive" : ""
                  }`}
                  {...register("precio")}
                />
              </div>
              {errors.precio && (
                <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.precio.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="duracion_minutos"
                className="text-xs font-semibold text-foreground"
              >
                Duración en Minutos <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="duracion_minutos"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="30"
                  className={`pl-9 text-xs h-9 font-medium ${
                    errors.duracion_minutos
                      ? "border-destructive focus-visible:ring-destructive"
                      : ""
                  }`}
                  {...register("duracion_minutos")}
                />
              </div>
              {errors.duracion_minutos && (
                <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.duracion_minutos.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="estado"
                className="text-xs font-semibold text-foreground"
              >
                Estado
              </Label>
              <select
                id="estado"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                {...register("estado")}
              >
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
              {errors.estado && (
                <p className="text-xs text-destructive mt-1">
                  {errors.estado.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="descripcion"
              className="text-xs font-semibold text-foreground"
            >
              Descripción
            </Label>
            <Textarea
              id="descripcion"
              rows={4}
              placeholder="Detalles sobre lo que incluye el servicio, condiciones o requerimientos previos..."
              className="text-xs resize-none"
              {...register("descripcion")}
            />
            {errors.descripcion && (
              <p className="text-xs text-destructive mt-1">
                {errors.descripcion.message}
              </p>
            )}
          </div>
        </form>

        <SheetFooter className="px-6 py-4 border-t bg-card/60 backdrop-blur-sm flex flex-row items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="text-xs h-9 px-4"
          >
            <X className="w-3.5 h-3.5 mr-1" />
            Cancelar
          </Button>
          <Button
            type="submit"
            form="servicio-sheet-form"
            size="sm"
            disabled={isSubmitting}
            className="text-xs h-9 px-4 font-semibold shadow-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 mr-1.5" />
                {isEditing ? "Actualizar Servicio" : "Guardar Servicio"}
              </>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
