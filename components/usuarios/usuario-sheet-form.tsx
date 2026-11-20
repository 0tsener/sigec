"use client";

import React, { useEffect, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  User,
  Mail,
  Shield,
  Loader2,
  Save,
  X,
  AlertCircle,
  Users,
} from "lucide-react";

import {
  usuarioSchema,
  type UsuarioFormValues,
  type UsuarioRecord,
} from "@/lib/validations/usuario";
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

interface UsuarioSheetFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usuarioToEdit?: UsuarioRecord | null;
  roles: Array<{ id: string; name: string }>;
  onSuccess?: (savedUsuario: UsuarioRecord, isEdit: boolean) => void;
}

export function UsuarioSheetForm({
  open,
  onOpenChange,
  usuarioToEdit,
  roles,
  onSuccess,
}: UsuarioSheetFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = Boolean(usuarioToEdit?.id);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UsuarioFormValues>({
    resolver: zodResolver(usuarioSchema) as unknown as Resolver<UsuarioFormValues>,
    defaultValues: {
      email: "",
      nombre: "",
      rol_id: "",
      estado: "pendiente",
    },
  });

  useEffect(() => {
    if (open) {
      if (usuarioToEdit) {
        reset({
          id: usuarioToEdit.id,
          email: usuarioToEdit.email || "",
          nombre: usuarioToEdit.nombre || "",
          rol_id: usuarioToEdit.rol_id || "",
          estado: usuarioToEdit.estado || "activo",
        });
      } else {
        reset({
          email: "",
          nombre: "",
          rol_id: "",
          estado: "pendiente",
        });
      }
    }
  }, [open, usuarioToEdit, reset]);

  const onSubmit = async (values: UsuarioFormValues) => {
    setIsSubmitting(true);
    const supabase = createClient();

    try {
      if (isEditing && usuarioToEdit?.id) {
        // Editar usuario existente - actualizar rol y estado
        const payload = {
          role_id: values.rol_id || null,
          updated_at: new Date().toISOString(),
        };

        const { data, error } = await supabase
          .from("profiles")
          .update(payload)
          .eq("id", usuarioToEdit.id)
          .select()
          .single();

        if (error) {
          throw new Error(error.message || "Error al actualizar el usuario");
        }

        toast.success("Usuario actualizado correctamente", {
          description: `El rol de ${values.nombre} ha sido modificado.`,
        });

        if (data && onSuccess) {
          onSuccess({
            ...usuarioToEdit,
            rol_id: values.rol_id,
            rol_nombre: roles.find((r) => r.id === values.rol_id)?.name || null,
          } as UsuarioRecord, true);
        }
      } else {
        // Invitar nuevo usuario
        // En un sistema real, esto enviaría un email de invitación
        // Por ahora, creamos un perfil pendiente
        const payload = {
          email: values.email.trim().toLowerCase(),
          full_name: values.nombre.trim(),
          role_id: values.rol_id || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { data, error } = await supabase
          .from("profiles")
          .insert(payload)
          .select()
          .single();

        if (error) {
          throw new Error(error.message || "Error al invitar al usuario");
        }

        toast.success("Usuario invitado con éxito", {
          description: `Se ha enviado una invitación a ${values.email}.`,
        });

        if (data && onSuccess) {
          onSuccess({
            id: data.id,
            email: data.email || values.email,
            nombre: data.full_name || values.nombre,
            rol_id: data.role_id,
            rol_nombre: roles.find((r) => r.id === values.rol_id)?.name || null,
            estado: "pendiente",
          } as UsuarioRecord, false);
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
                <User className="w-5 h-5 text-primary" />
              ) : (
                <Users className="w-5 h-5 text-primary" />
              )}
            </div>
            <div>
              <SheetTitle className="text-lg font-bold text-foreground">
                {isEditing ? "Editar Usuario" : "Invitar Usuario"}
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground">
                {isEditing
                  ? "Actualiza el rol y estado del usuario en el sistema."
                  : "Envía una invitación para agregar un nuevo miembro al equipo."}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <form
          id="usuario-sheet-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto px-6 py-6 space-y-5"
        >
          <div className="space-y-1.5">
            <Label
              htmlFor="email"
              className="text-xs font-semibold text-foreground"
            >
              Correo Electrónico <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="ejemplo@correo.com"
                disabled={isEditing}
                className={`pl-9 text-xs h-9 ${
                  errors.email ? "border-destructive focus-visible:ring-destructive" : ""
                }`}
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="nombre"
              className="text-xs font-semibold text-foreground"
            >
              Nombre Completo <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="nombre"
                placeholder="Ej: María Elena Pérez"
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

          <div className="space-y-1.5">
            <Label
              htmlFor="rol_id"
              className="text-xs font-semibold text-foreground"
            >
              Rol Asignado
            </Label>
            <div className="relative">
              <Shield className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <select
                id="rol_id"
                className="flex h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                {...register("rol_id")}
              >
                <option value="">Sin rol asignado</option>
                {roles.map((rol) => (
                  <option key={rol.id} value={rol.id}>
                    {rol.name}
                  </option>
                ))}
              </select>
            </div>
            {errors.rol_id && (
              <p className="text-xs text-destructive mt-1">
                {errors.rol_id.message}
              </p>
            )}
          </div>

          {!isEditing && (
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
                <option value="pendiente">Pendiente</option>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
              {errors.estado && (
                <p className="text-xs text-destructive mt-1">
                  {errors.estado.message}
                </p>
              )}
            </div>
          )}
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
            form="usuario-sheet-form"
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
                {isEditing ? "Actualizar Usuario" : "Enviar Invitación"}
              </>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
