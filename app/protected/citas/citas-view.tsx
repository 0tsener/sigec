"use client";

import React, { useState } from "react";
import { Calendar, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CitaDialog } from "./cita-dialog";
import { CitasTable } from "./citas-table";
import {
  type AppointmentRecord,
  type CitasFormOptions,
} from "./types";

interface CitasViewProps {
  initialAppointments: AppointmentRecord[];
  formOptions: CitasFormOptions;
  organizationId: string;
}

export function CitasView({
  initialAppointments,
  formOptions,
  organizationId,
}: CitasViewProps) {
  const [appointments, setAppointments] =
    useState<AppointmentRecord[]>(initialAppointments);

  const handleAppointmentCreated = (newAppointment: AppointmentRecord) => {
    setAppointments((prev) => [newAppointment, ...prev]);
  };

  const totalCount = appointments.length;

  return (
    <div className="space-y-6">
      {/* Header Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Agenda y Citas
            </h1>
            <Badge
              variant="secondary"
              className="font-mono text-xs font-semibold px-2 py-0.5 rounded-full"
            >
              {totalCount} {totalCount === 1 ? "cita" : "citas"}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Gestión y programación de citas, clientes y asignación de servicios
          </p>
        </div>

        {/* Botón Nueva Cita (Modal Dialog) */}
        <div>
          <CitaDialog
            organizationId={organizationId}
            formOptions={formOptions}
            onAppointmentCreated={handleAppointmentCreated}
          />
        </div>
      </div>

      {/* Tabla de Citas */}
      <CitasTable
        initialAppointments={appointments}
        organizationId={organizationId}
      />
    </div>
  );
}
