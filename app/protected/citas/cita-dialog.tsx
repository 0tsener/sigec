"use client";

import React, { useState, useTransition } from "react";
import {
  Calendar,
  Clock,
  User,
  Tag,
  Briefcase,
  FileText,
  Loader2,
  Plus,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  type AppointmentRecord,
  type CitasFormOptions,
  type CreateAppointmentInput,
} from "./types";
import { createAppointment } from "./actions";

interface CitaDialogProps {
  organizationId: string;
  formOptions: CitasFormOptions;
  onAppointmentCreated?: (newAppointment: AppointmentRecord) => void;
  triggerButton?: React.ReactNode;
}

export function CitaDialog({
  organizationId,
  formOptions,
  onAppointmentCreated,
  triggerButton,
}: CitaDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Estados del Formulario
  const [customerId, setCustomerId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [notes, setNotes] = useState("");

  // Error de validación local
  const [validationError, setValidationError] = useState<string | null>(null);

  // Inicializar fecha y hora con el momento actual redondeado al siguiente intervalo
  const initializeDefaults = () => {
    const now = new Date();
    // Redondear a los siguientes 30 min
    const minutes = now.getMinutes();
    const roundedMinutes = minutes <= 30 ? 30 : 60;
    now.setMinutes(roundedMinutes, 0, 0);

    const pad = (n: number) => String(n).padStart(2, "0");
    const year = now.getFullYear();
    const month = pad(now.getMonth() + 1);
    const day = pad(now.getDate());
    const hours = pad(now.getHours());
    const mins = pad(now.getMinutes());

    const defaultStartsAt = `${year}-${month}-${day}T${hours}:${mins}`;
    setStartsAt(defaultStartsAt);

    // Default +30 min
    const end = new Date(now.getTime() + 30 * 60000);
    const endYear = end.getFullYear();
    const endMonth = pad(end.getMonth() + 1);
    const endDay = pad(end.getDate());
    const endHours = pad(end.getHours());
    const endMins = pad(end.getMinutes());
    setEndsAt(`${endYear}-${endMonth}-${endDay}T${endHours}:${endMins}`);

    setCustomerId("");
    setServiceId("");
    setEmployeeId("");
    setNotes("");
    setValidationError(null);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      initializeDefaults();
    }
    setOpen(isOpen);
  };

  // Helper para recalcular hora de fin según la duración del servicio
  const handleServiceChange = (selectedServiceId: string) => {
    setServiceId(selectedServiceId);

    const selectedService = formOptions.services.find(
      (s) => s.id === selectedServiceId,
    );
    if (selectedService && startsAt) {
      try {
        const start = new Date(startsAt);
        if (!isNaN(start.getTime())) {
          const duration = selectedService.duration_minutes || 30;
          const end = new Date(start.getTime() + duration * 60000);

          const pad = (n: number) => String(n).padStart(2, "0");
          const endStr = `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(
            end.getDate(),
          )}T${pad(end.getHours())}:${pad(end.getMinutes())}`;

          setEndsAt(endStr);
        }
      } catch {
        // Ignorar fallo de parseo
      }
    }
  };

  // Helper cuando cambia la hora de inicio para sugerir hora de fin
  const handleStartsAtChange = (newStartsAt: string) => {
    setStartsAt(newStartsAt);

    if (serviceId) {
      const selectedService = formOptions.services.find(
        (s) => s.id === serviceId,
      );
      if (selectedService) {
        try {
          const start = new Date(newStartsAt);
          if (!isNaN(start.getTime())) {
            const duration = selectedService.duration_minutes || 30;
            const end = new Date(start.getTime() + duration * 60000);

            const pad = (n: number) => String(n).padStart(2, "0");
            const endStr = `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(
              end.getDate(),
            )}T${pad(end.getHours())}:${pad(end.getMinutes())}`;

            setEndsAt(endStr);
          }
        } catch {
          // Ignorar fallo de parseo
        }
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validaciones
    if (!customerId) {
      setValidationError("Debes seleccionar un cliente para la cita.");
      return;
    }
    if (!serviceId) {
      setValidationError("Debes seleccionar un servicio.");
      return;
    }
    if (!startsAt || !endsAt) {
      setValidationError("Por favor ingresa la fecha y hora de inicio y fin.");
      return;
    }

    const start = new Date(startsAt);
    const end = new Date(endsAt);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      setValidationError("Las fechas ingresadas no son válidas.");
      return;
    }

    if (start >= end) {
      setValidationError(
        "La hora de inicio debe ser anterior a la hora de finalización.",
      );
      return;
    }

    const payload: CreateAppointmentInput = {
      customer_id: customerId,
      service_id: serviceId,
      employee_id: employeeId || null,
      starts_at: startsAt,
      ends_at: endsAt,
      notes: notes || null,
      status: "scheduled",
    };

    startTransition(async () => {
      try {
        const result = await createAppointment(payload, organizationId);

        if (!result.success) {
          toast.error("Error al agendar cita", {
            description: result.error || "Verifica los datos e intenta nuevamente.",
          });
          setValidationError(result.error || "No se pudo guardar la cita.");
          return;
        }

        toast.success("¡Cita agendada con éxito!", {
          description: "La cita ha sido programada y registrada en el sistema.",
        });

        if (result.data && onAppointmentCreated) {
          onAppointmentCreated(result.data);
        }

        setOpen(false);
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message
            : "Error inesperado al crear la cita.";
        toast.error("Error", { description: msg });
        setValidationError(msg);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button size="sm" className="gap-1.5 h-9 text-xs font-semibold shadow-sm">
            <Plus className="w-4 h-4" />
            Nueva Cita
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <Calendar className="w-5 h-5" />
            <DialogTitle className="text-base font-bold text-foreground">
              Agendar Nueva Cita
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Completa los detalles para programar una cita con el cliente y asignar el servicio correspondiente.
          </DialogDescription>
        </DialogHeader>

        {validationError && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="font-medium">{validationError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* 1. Selección de Cliente */}
          <div className="space-y-1.5">
            <Label htmlFor="customer_id" className="text-xs font-semibold flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-muted-foreground" />
              Cliente <span className="text-destructive">*</span>
            </Label>
            <select
              id="customer_id"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              required
            >
              <option value="">Selecciona un cliente...</option>
              {formOptions.customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.phone ? `(${c.phone})` : ""}
                </option>
              ))}
            </select>
            {formOptions.customers.length === 0 && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400">
                Aviso: No hay clientes activos registrados en esta organización.
              </p>
            )}
          </div>

          {/* 2. Selección de Servicio */}
          <div className="space-y-1.5">
            <Label htmlFor="service_id" className="text-xs font-semibold flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-muted-foreground" />
              Servicio <span className="text-destructive">*</span>
            </Label>
            <select
              id="service_id"
              value={serviceId}
              onChange={(e) => handleServiceChange(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              required
            >
              <option value="">Selecciona un servicio...</option>
              {formOptions.services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} - {s.duration_minutes} min (${s.price.toFixed(2)})
                </option>
              ))}
            </select>
            {formOptions.services.length === 0 && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400">
                Aviso: No hay servicios activos en el catálogo.
              </p>
            )}
          </div>

          {/* 3. Selección de Empleado (Opcional) */}
          <div className="space-y-1.5">
            <Label htmlFor="employee_id" className="text-xs font-semibold flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-muted-foreground" />
              Empleado / Especialista <span className="text-muted-foreground font-normal text-[11px]">(Opcional)</span>
            </Label>
            <select
              id="employee_id"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Sin asignar / Cualquier profesional</option>
              {formOptions.employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Fechas y Horarios: starts_at y ends_at */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="starts_at" className="text-xs font-semibold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                Fecha y Hora de Inicio <span className="text-destructive">*</span>
              </Label>
              <Input
                id="starts_at"
                type="datetime-local"
                value={startsAt}
                onChange={(e) => handleStartsAtChange(e.target.value)}
                className="text-xs h-9"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ends_at" className="text-xs font-semibold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                Fecha y Hora de Fin <span className="text-destructive">*</span>
              </Label>
              <Input
                id="ends_at"
                type="datetime-local"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                className="text-xs h-9"
                required
              />
            </div>
          </div>

          {/* 5. Notas / Observaciones */}
          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-xs font-semibold flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-muted-foreground" />
              Notas u Observaciones <span className="text-muted-foreground font-normal text-[11px]">(Opcional)</span>
            </Label>
            <Textarea
              id="notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Instrucciones especiales, preferencias del cliente o detalles del servicio..."
              className="text-xs resize-none"
            />
          </div>

          <DialogFooter className="pt-3 border-t flex flex-row items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={() => setOpen(false)}
              className="text-xs h-9"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending}
              className="text-xs h-9 font-semibold gap-1.5"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Calendar className="w-3.5 h-3.5" />
                  Agendar Cita
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
