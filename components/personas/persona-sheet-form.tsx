"use client";

import React, { useEffect, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  User,
  Building,
  Mail,
  Phone,
  FileText,
  MapPin,
  Briefcase,
  Loader2,
  Save,
  X,
  AlertCircle,
} from "lucide-react";

import {
  personaSchema,
  type PersonaFormValues,
  type PersonaRecord,
} from "@/lib/validations/persona";
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

interface PersonaSheetFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personaToEdit?: PersonaRecord | null;
  onSuccess?: (savedPersona: PersonaRecord, isEdit: boolean) => void;
}

export function PersonaSheetForm({
  open,
  onOpenChange,
  personaToEdit,
  onSuccess,
}: PersonaSheetFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = Boolean(personaToEdit?.id);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PersonaFormValues>({
    resolver: zodResolver(personaSchema) as unknown as Resolver<PersonaFormValues>,
    defaultValues: {
      tipo: "cliente",
      nombre_completo: "",
      doc_identidad: "",
      email: "",
      telefono: "",
      empresa: "",
      direccion: "",
      notas: "",
      estado: "activo",
    },
  });

  const currentTipo = watch("tipo");
  const currentEstado = watch("estado");

  // Sincronizar formulario al abrir o cambiar la persona seleccionada
  useEffect(() => {
    if (open) {
      if (personaToEdit) {
        reset({
          id: personaToEdit.id,
          tipo: personaToEdit.tipo || "cliente",
          nombre_completo: personaToEdit.nombre_completo || "",
          doc_identidad: personaToEdit.doc_identidad || "",
          email: personaToEdit.email || "",
          telefono: personaToEdit.telefono || "",
          empresa: personaToEdit.empresa || "",
          direccion: personaToEdit.direccion || "",
          notas: personaToEdit.notas || "",
          estado: personaToEdit.estado || "activo",
        });
      } else {
        reset({
          tipo: "cliente",
          nombre_completo: "",
          doc_identidad: "",
          email: "",
          telefono: "",
          empresa: "",
          direccion: "",
          notas: "",
          estado: "activo",
        });
      }
    }
  }, [open, personaToEdit, reset]);

  const onSubmit = async (values: PersonaFormValues) => {
    setIsSubmitting(true);
    const supabase = createClient();

    try {
      // Normalizar datos vacíos a null para Supabase
      const payload = {
        tipo: values.tipo,
        nombre_completo: values.nombre_completo.trim(),
        doc_identidad: values.doc_identidad?.trim() || null,
        email: values.email?.trim().toLowerCase() || null,
        telefono: values.telefono?.trim() || null,
        empresa: values.empresa?.trim() || null,
        direccion: values.direccion?.trim() || null,
        notas: values.notas?.trim() || null,
        estado: values.estado,
        updated_at: new Date().toISOString(),
      };

      if (isEditing && personaToEdit?.id) {
        // Modo Edición: Actualizar registro existente
        const { data, error } = await supabase
          .from("personas")
          .update(payload)
          .eq("id", personaToEdit.id)
          .select()
          .single();

        if (error) {
          throw new Error(error.message || "Error al actualizar la persona");
        }

        toast.success("Persona actualizada correctamente", {
          description: `${payload.nombre_completo} ha sido actualizado.`,
        });

        if (data && onSuccess) {
          onSuccess(data as PersonaRecord, true);
        }
      } else {
        // Modo Creación: Obtener organization_id del usuario actual si existe
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
          // Continuar si no se pudo obtener
        }

        const insertPayload = {
          ...payload,
          ...(organizationId ? { organization_id: organizationId } : {}),
        };

        const { data, error } = await supabase
          .from("personas")
          .insert(insertPayload)
          .select()
          .single();

        if (error) {
          throw new Error(error.message || "Error al registrar la persona");
        }

        toast.success("Persona creada con éxito", {
          description: `${payload.nombre_completo} fue agregado a la lista.`,
        });

        if (data && onSuccess) {
          onSuccess(data as PersonaRecord, false);
        }
      }

      // Refrescar datos en el servidor, cerrar el panel
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
        {/* Cabecera del Sheet */}
        <SheetHeader className="px-6 py-5 border-b bg-card/60 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
              {isEditing ? (
                <User className="w-5 h-5 text-primary" />
              ) : (
                <Briefcase className="w-5 h-5 text-primary" />
              )}
            </div>
            <div>
              <SheetTitle className="text-lg font-bold text-foreground">
                {isEditing ? "Editar Persona" : "Nueva Persona"}
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground">
                {isEditing
                  ? "Actualiza los datos del contacto en el sistema."
                  : "Completa la información para registrar un cliente, proveedor o empleado."}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Cuerpo del formulario con Scroll */}
        <form
          id="persona-sheet-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto px-6 py-6 space-y-6"
        >
          {/* Selector de Tipo (Botones estilizados) */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Tipo de Persona <span className="text-destructive">*</span>
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: "cliente", label: "Cliente", desc: "Comprador de servicios" },
                  { id: "proveedor", label: "Proveedor", desc: "Suministra insumos" },
                  { id: "empleado", label: "Empleado", desc: "Personal de equipo" },
                ] as const
              ).map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setValue("tipo", option.id, { shouldValidate: true })}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-center transition-all ${
                    currentTipo === option.id
                      ? "border-primary bg-primary/5 text-primary font-medium ring-1 ring-primary shadow-sm"
                      : "border-input bg-card hover:bg-accent hover:text-accent-foreground text-muted-foreground"
                  }`}
                >
                  <span className="text-xs font-semibold">{option.label}</span>
                  <span className="text-[10px] opacity-80">{option.desc}</span>
                </button>
              ))}
            </div>
            {errors.tipo && (
              <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.tipo.message}
              </p>
            )}
          </div>

          {/* Campos en 2 columnas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nombre Completo */}
            <div className="space-y-1.5 sm:col-span-2">
              <Label
                htmlFor="nombre_completo"
                className="text-xs font-semibold text-foreground"
              >
                Nombre Completo <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="nombre_completo"
                  placeholder="Ej: Juan Pérez Morales"
                  className={`pl-9 text-xs h-9 ${
                    errors.nombre_completo ? "border-destructive focus-visible:ring-destructive" : ""
                  }`}
                  {...register("nombre_completo")}
                />
              </div>
              {errors.nombre_completo && (
                <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.nombre_completo.message}
                </p>
              )}
            </div>

            {/* Documento de Identidad */}
            <div className="space-y-1.5">
              <Label
                htmlFor="doc_identidad"
                className="text-xs font-semibold text-foreground"
              >
                Documento de Identidad (DNI / RUC / Pasaporte)
              </Label>
              <div className="relative">
                <FileText className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="doc_identidad"
                  placeholder="Ej: 001-1234567-8"
                  className="pl-9 text-xs h-9"
                  {...register("doc_identidad")}
                />
              </div>
              {errors.doc_identidad && (
                <p className="text-xs text-destructive mt-1">
                  {errors.doc_identidad.message}
                </p>
              )}
            </div>

            {/* Empresa */}
            <div className="space-y-1.5">
              <Label
                htmlFor="empresa"
                className="text-xs font-semibold text-foreground"
              >
                Empresa / Razón Social
              </Label>
              <div className="relative">
                <Building className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="empresa"
                  placeholder="Ej: Inversiones Globales S.A."
                  className="pl-9 text-xs h-9"
                  {...register("empresa")}
                />
              </div>
              {errors.empresa && (
                <p className="text-xs text-destructive mt-1">
                  {errors.empresa.message}
                </p>
              )}
            </div>

            {/* Correo Electrónico */}
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

            {/* Teléfono */}
            <div className="space-y-1.5">
              <Label
                htmlFor="telefono"
                className="text-xs font-semibold text-foreground"
              >
                Teléfono de Contacto
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

            {/* Estado */}
            <div className="space-y-1.5 sm:col-span-2">
              <Label
                htmlFor="estado"
                className="text-xs font-semibold text-foreground"
              >
                Estado en el Sistema <span className="text-destructive">*</span>
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    {
                      id: "activo",
                      label: "Activo",
                      dotColor: "bg-emerald-500",
                      borderColor: "peer-checked:border-emerald-500",
                    },
                    {
                      id: "pendiente",
                      label: "Pendiente",
                      dotColor: "bg-amber-500",
                      borderColor: "peer-checked:border-amber-500",
                    },
                    {
                      id: "inactivo",
                      label: "Inactivo",
                      dotColor: "bg-rose-500",
                      borderColor: "peer-checked:border-rose-500",
                    },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      setValue("estado", item.id, { shouldValidate: true })
                    }
                    className={`flex items-center justify-center gap-2 p-2 rounded-md border text-xs transition-all ${
                      currentEstado === item.id
                        ? "border-primary bg-primary/5 text-foreground font-medium ring-1 ring-primary"
                        : "border-input bg-card text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${item.dotColor}`}
                    />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
              {errors.estado && (
                <p className="text-xs text-destructive mt-1">
                  {errors.estado.message}
                </p>
              )}
            </div>

            {/* Dirección */}
            <div className="space-y-1.5 sm:col-span-2">
              <Label
                htmlFor="direccion"
                className="text-xs font-semibold text-foreground"
              >
                Dirección Física
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="direccion"
                  placeholder="Ej: Av. 27 de Febrero #123, Edificio Plaza, Santo Domingo"
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

            {/* Notas / Observaciones */}
            <div className="space-y-1.5 sm:col-span-2">
              <Label
                htmlFor="notas"
                className="text-xs font-semibold text-foreground"
              >
                Notas y Observaciones
              </Label>
              <Textarea
                id="notas"
                rows={3}
                placeholder="Detalles adicionales, preferencias de contacto, términos acordados..."
                className="text-xs resize-none"
                {...register("notas")}
              />
              {errors.notas && (
                <p className="text-xs text-destructive mt-1">
                  {errors.notas.message}
                </p>
              )}
            </div>
          </div>
        </form>

        {/* Pie del Sheet con Acciones */}
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
            form="persona-sheet-form"
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
                {isEditing ? "Actualizar Persona" : "Guardar Persona"}
              </>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
