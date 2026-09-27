"use client";

import React, { useEffect, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  User,
  FileText,
  Phone,
  Mail,
  MapPin,
  Loader2,
  Save,
  X,
  AlertCircle,
  Users,
} from "lucide-react";

import {
  clienteSchema,
  type ClienteFormValues,
  type ClienteRecord,
} from "@/lib/validations/cliente";
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

interface ClienteSheetFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clienteToEdit?: ClienteRecord | null;
  onSuccess?: (savedCliente: ClienteRecord, isEdit: boolean) => void;
}

export function ClienteSheetForm({
  open,
  onOpenChange,
  clienteToEdit,
  onSuccess,
}: ClienteSheetFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = Boolean(clienteToEdit?.id);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClienteFormValues>({
    resolver: zodResolver(clienteSchema) as unknown as Resolver<ClienteFormValues>,
    defaultValues: {
      nombres: "",
      apellidos: "",
      documento_identidad: "",
      telefono: "",
      email: "",
      direccion: "",
      estado: "activo",
    },
  });

  useEffect(() => {
    if (open) {
      if (clienteToEdit) {
        reset({
          id: clienteToEdit.id,
          nombres: clienteToEdit.nombres || "",
          apellidos: clienteToEdit.apellidos || "",
          documento_identidad: clienteToEdit.documento_identidad || "",
          telefono: clienteToEdit.telefono || "",
          email: clienteToEdit.email || "",
          direccion: clienteToEdit.direccion || "",
          estado: clienteToEdit.estado || "activo",
        });
      } else {
        reset({
          nombres: "",
          apellidos: "",
          documento_identidad: "",
          telefono: "",
          email: "",
          direccion: "",
          estado: "activo",
        });
      }
    }
  }, [open, clienteToEdit, reset]);

  const onSubmit = async (values: ClienteFormValues) => {
    setIsSubmitting(true);
    const supabase = createClient();

    try {
      const payload = {
        nombres: values.nombres.trim(),
        apellidos: values.apellidos.trim(),
        documento_identidad: values.documento_identidad?.trim() || null,
        telefono: values.telefono?.trim() || null,
        email: values.email?.trim().toLowerCase() || null,
        direccion: values.direccion?.trim() || null,
        estado: values.estado,
        updated_at: new Date().toISOString(),
      };

      const fullName = `${payload.nombres} ${payload.apellidos}`.trim();

      if (isEditing && clienteToEdit?.id) {
        const { data, error } = await supabase
          .from("clientes")
          .update(payload)
          .eq("id", clienteToEdit.id)
          .select()
          .single();

        if (error) {
          throw new Error(error.message || "Error al actualizar el cliente");
        }

        toast.success("Cliente actualizado correctamente", {
          description: `${fullName} ha sido modificado.`,
        });

        if (data && onSuccess) {
          onSuccess(data as ClienteRecord, true);
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
          .from("clientes")
          .insert(insertPayload)
          .select()
          .single();

        if (error) {
          throw new Error(error.message || "Error al registrar el cliente");
        }

        toast.success("Cliente creado con éxito", {
          description: `${fullName} fue añadido al directorio.`,
        });

        if (data && onSuccess) {
          onSuccess(data as ClienteRecord, false);
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
                {isEditing ? "Editar Cliente" : "Nuevo Cliente"}
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground">
                {isEditing
                  ? "Actualiza los datos de contacto y el expediente del cliente."
                  : "Registra un nuevo cliente en el directorio de tu organización."}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <form
          id="cliente-sheet-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto px-6 py-6 space-y-5"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="nombres"
                className="text-xs font-semibold text-foreground"
              >
                Nombres <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="nombres"
                  placeholder="Ej: María Elena"
                  className={`pl-9 text-xs h-9 ${
                    errors.nombres ? "border-destructive focus-visible:ring-destructive" : ""
                  }`}
                  {...register("nombres")}
                />
              </div>
              {errors.nombres && (
                <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.nombres.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="apellidos"
                className="text-xs font-semibold text-foreground"
              >
                Apellidos <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="apellidos"
                  placeholder="Ej: Pérez Morales"
                  className={`pl-9 text-xs h-9 ${
                    errors.apellidos ? "border-destructive focus-visible:ring-destructive" : ""
                  }`}
                  {...register("apellidos")}
                />
              </div>
              {errors.apellidos && (
                <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.apellidos.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="documento_identidad"
                className="text-xs font-semibold text-foreground"
              >
                Documento de Identidad
              </Label>
              <div className="relative">
                <FileText className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="documento_identidad"
                  placeholder="CI, DNI o NIT"
                  className="pl-9 text-xs h-9"
                  {...register("documento_identidad")}
                />
              </div>
              {errors.documento_identidad && (
                <p className="text-xs text-destructive mt-1">
                  {errors.documento_identidad.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="telefono"
                className="text-xs font-semibold text-foreground"
              >
                Teléfono
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="telefono"
                  type="tel"
                  placeholder="Ej: +1 809 555 0199"
                  className="pl-9 text-xs h-9"
                  {...register("telefono")}
                />
              </div>
              {errors.telefono && (
                <p className="text-xs text-destructive mt-1">
                  {errors.telefono.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="email"
                className="text-xs font-semibold text-foreground"
              >
                Correo Electrónico
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="ejemplo@correo.com"
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
                htmlFor="direccion"
                className="text-xs font-semibold text-foreground"
              >
                Dirección
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="direccion"
                  placeholder="Calle, número, ciudad"
                  className="pl-9 text-xs h-9"
                  {...register("direccion")}
                />
              </div>
              {errors.direccion && (
                <p className="text-xs text-destructive mt-1">
                  {errors.direccion.message}
                </p>
              )}
            </div>
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
            form="cliente-sheet-form"
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
                {isEditing ? "Actualizar Cliente" : "Guardar Cliente"}
              </>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
