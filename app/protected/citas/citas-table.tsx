"use client";

import React, { useMemo, useState, useTransition } from "react";
import {
  Calendar,
  Clock,
  User,
  Phone,
  Briefcase,
  CheckCircle2,
  CalendarCheck,
  CalendarClock,
  XCircle,
  AlertTriangle,
  MoreVertical,
  Search,
  Loader2,
  DollarSign,
  Filter,
  X,
} from "lucide-react";
import { toast } from "sonner";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  type AppointmentRecord,
  type AppointmentStatus,
} from "./types";
import { updateAppointmentStatus } from "./actions";

interface CitasTableProps {
  initialAppointments: AppointmentRecord[];
  organizationId: string;
  onRefresh?: () => void;
}

const STATUS_CONFIG: Record<
  AppointmentStatus,
  {
    label: string;
    variantClass: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  scheduled: {
    label: "Programada",
    variantClass:
      "bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    icon: CalendarClock,
  },
  confirmed: {
    label: "Confirmada",
    variantClass:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    icon: CalendarCheck,
  },
  completed: {
    label: "Completada",
    variantClass:
      "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
    icon: CheckCircle2,
  },
  canceled: {
    label: "Cancelada",
    variantClass:
      "bg-rose-50 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border-rose-200 dark:border-rose-800",
    icon: XCircle,
  },
  no_show: {
    label: "No asistió",
    variantClass:
      "bg-amber-50 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    icon: AlertTriangle,
  },
};

export function CitasTable({
  initialAppointments,
  organizationId,
  onRefresh,
}: CitasTableProps) {
  const [appointments, setAppointments] =
    useState<AppointmentRecord[]>(initialAppointments);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // Sincronizar si cambia el prop
  React.useEffect(() => {
    setAppointments(initialAppointments);
  }, [initialAppointments]);

  const handleStatusChange = (
    id: string,
    newStatus: AppointmentStatus,
  ) => {
    setUpdatingId(id);
    const target = appointments.find((a) => a.id === id);
    const oldStatus = target?.status;

    // Actualización optimista local
    setAppointments((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app)),
    );

    startTransition(async () => {
      try {
        const result = await updateAppointmentStatus(id, newStatus, organizationId);
        if (!result.success) {
          // Revertir optimismo
          if (oldStatus) {
            setAppointments((prev) =>
              prev.map((app) =>
                app.id === id ? { ...app, status: oldStatus } : app,
              ),
            );
          }
          toast.error("Error al actualizar estado", {
            description: result.error || "No se pudo actualizar la cita.",
          });
        } else {
          toast.success("Estado actualizado", {
            description: `La cita ahora está marcada como ${STATUS_CONFIG[newStatus].label}.`,
          });
          if (onRefresh) {
            onRefresh();
          }
        }
      } catch (err) {
        if (oldStatus) {
          setAppointments((prev) =>
            prev.map((app) =>
              app.id === id ? { ...app, status: oldStatus } : app,
            ),
          );
        }
        toast.error("Error inesperado", {
          description: err instanceof Error ? err.message : "Error al conectar.",
        });
      } finally {
        setUpdatingId(null);
      }
    });
  };

  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      const q = searchQuery.toLowerCase().trim();

      const customerName = appointment.customers?.people
        ? `${appointment.customers.people.first_name} ${appointment.customers.people.last_name}`.toLowerCase()
        : "";
      const customerPhone =
        appointment.customers?.people?.phone?.toLowerCase() || "";
      const serviceName = appointment.services?.name?.toLowerCase() || "";
      const employeeName = appointment.employees?.people
        ? `${appointment.employees.people.first_name} ${appointment.employees.people.last_name}`.toLowerCase()
        : "";
      const notes = appointment.notes?.toLowerCase() || "";

      const matchesSearch =
        !q ||
        customerName.includes(q) ||
        customerPhone.includes(q) ||
        serviceName.includes(q) ||
        employeeName.includes(q) ||
        notes.includes(q);

      const matchesStatus =
        statusFilter === "all" || appointment.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [appointments, searchQuery, statusFilter]);

  const formatDateRange = (startsAtStr: string, endsAtStr: string) => {
    try {
      const start = new Date(startsAtStr);
      const end = new Date(endsAtStr);

      const dateFormatter = new Intl.DateTimeFormat("es-ES", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      });

      const timeFormatter = new Intl.DateTimeFormat("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      return {
        date: dateFormatter.format(start),
        time: `${timeFormatter.format(start)} - ${timeFormatter.format(end)}`,
      };
    } catch {
      return {
        date: startsAtStr,
        time: `${startsAtStr} - ${endsAtStr}`,
      };
    }
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const hasActiveFilters = searchQuery !== "" || statusFilter !== "all";

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
  };

  return (
    <div className="space-y-4">
      {/* Barra de Filtros y Búsqueda */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Input de Búsqueda */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por cliente, servicio, empleado..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs h-9"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                aria-label="Limpiar búsqueda"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filtro de Estado */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs h-9 rounded-md border border-input bg-background px-3 py-1 text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                aria-label="Filtrar por estado"
              >
                <option value="all">Todos los estados</option>
                <option value="scheduled">Programada (Azul)</option>
                <option value="confirmed">Confirmada (Verde)</option>
                <option value="completed">Completada (Gris)</option>
                <option value="canceled">Cancelada (Rojo)</option>
                <option value="no_show">No asistió (Ámbar)</option>
              </select>
            </div>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-xs h-9 px-2.5 text-muted-foreground hover:text-foreground"
              >
                <Filter className="w-3.5 h-3.5 mr-1" />
                Limpiar
              </Button>
            )}
          </div>
        </div>

        <div className="text-xs text-muted-foreground self-end sm:self-center font-mono">
          Mostrando {filteredAppointments.length} de {appointments.length} citas
        </div>
      </div>

      {/* Contenedor de la Tabla */}
      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        {filteredAppointments.length > 0 ? (
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <TableHead className="py-3 px-4">Fecha / Hora</TableHead>
                <TableHead className="py-3 px-4">Cliente</TableHead>
                <TableHead className="py-3 px-4">Servicio</TableHead>
                <TableHead className="py-3 px-4">Empleado</TableHead>
                <TableHead className="py-3 px-4">Estado</TableHead>
                <TableHead className="py-3 px-4 text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border">
              {filteredAppointments.map((cita) => {
                const isItemUpdating = updatingId === cita.id;
                const statusInfo = STATUS_CONFIG[cita.status] || STATUS_CONFIG.scheduled;
                const StatusIcon = statusInfo.icon;
                const { date, time } = formatDateRange(cita.starts_at, cita.ends_at);

                const customerPerson = cita.customers?.people;
                const customerFullName = customerPerson
                  ? `${customerPerson.first_name} ${customerPerson.last_name}`.trim()
                  : "Cliente sin asignar";

                const employeePerson = cita.employees?.people;
                const employeeFullName = employeePerson
                  ? `${employeePerson.first_name} ${employeePerson.last_name}`.trim()
                  : null;

                return (
                  <TableRow
                    key={cita.id}
                    className="hover:bg-muted/30 transition-colors group"
                  >
                    {/* 1. Fecha / Hora */}
                    <TableCell className="py-3 px-4">
                      <div className="flex items-start gap-2.5">
                        <div className="p-1.5 rounded-md bg-primary/10 text-primary mt-0.5 shrink-0">
                          <Calendar className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-foreground capitalize">
                            {date}
                          </p>
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1 font-mono mt-0.5">
                            <Clock className="w-3 h-3 text-muted-foreground/70" />
                            {time}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    {/* 2. Cliente */}
                    <TableCell className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center font-bold text-[11px] text-foreground shrink-0 border">
                          {customerFullName.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">
                            {customerFullName}
                          </p>
                          {customerPerson?.phone ? (
                            <p className="text-[11px] text-muted-foreground flex items-center gap-1 truncate font-mono">
                              <Phone className="w-3 h-3 text-muted-foreground/70" />
                              {customerPerson.phone}
                            </p>
                          ) : (
                            <span className="text-[10px] text-muted-foreground/60 italic">
                              Sin teléfono
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* 3. Servicio */}
                    <TableCell className="py-3 px-4">
                      <div>
                        <p className="text-xs font-semibold text-foreground">
                          {cita.services?.name || "Servicio General"}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground">
                          <span className="inline-flex items-center text-[10px] bg-muted px-1.5 py-0.2 rounded font-mono">
                            {cita.services?.duration_minutes ?? 30} min
                          </span>
                          <span className="font-semibold text-foreground/80 font-mono text-[11px]">
                            {formatPrice(cita.services?.price ?? 0)}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* 4. Empleado */}
                    <TableCell className="py-3 px-4">
                      {employeeFullName ? (
                        <div className="flex items-center gap-1.5 text-xs text-foreground">
                          <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <span className="truncate">{employeeFullName}</span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground/70 italic bg-muted/60 px-2 py-0.5 rounded">
                          <User className="w-3 h-3" />
                          Sin asignar
                        </span>
                      )}
                    </TableCell>

                    {/* 5. Estado (Badges con colores requeridos) */}
                    <TableCell className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border shadow-xs transition-colors ${statusInfo.variantClass}`}
                        >
                          {isItemUpdating ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <StatusIcon className="w-3 h-3" />
                          )}
                          {statusInfo.label}
                        </span>
                      </div>
                      {cita.notes && (
                        <p className="text-[11px] text-muted-foreground/80 mt-1 italic line-clamp-1 max-w-[200px]" title={cita.notes}>
                          &quot;{cita.notes}&quot;
                        </p>
                      )}
                    </TableCell>

                    {/* 6. Acciones (DropdownMenu de cambio de estado) */}
                    <TableCell className="py-3 px-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={isItemUpdating}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                          >
                            <span className="sr-only">Abrir menú</span>
                            {isItemUpdating ? (
                              <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            ) : (
                              <MoreVertical className="h-4 w-4" />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 text-xs">
                          <DropdownMenuLabel className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
                            Cambiar Estado
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            disabled={cita.status === "scheduled" || isItemUpdating}
                            onClick={() => handleStatusChange(cita.id, "scheduled")}
                            className="cursor-pointer gap-2"
                          >
                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                            Programada (Azul)
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            disabled={cita.status === "confirmed" || isItemUpdating}
                            onClick={() => handleStatusChange(cita.id, "confirmed")}
                            className="cursor-pointer gap-2"
                          >
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            Confirmada (Verde)
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            disabled={cita.status === "completed" || isItemUpdating}
                            onClick={() => handleStatusChange(cita.id, "completed")}
                            className="cursor-pointer gap-2"
                          >
                            <span className="w-2 h-2 rounded-full bg-slate-500" />
                            Completada (Gris)
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            disabled={cita.status === "canceled" || isItemUpdating}
                            onClick={() => handleStatusChange(cita.id, "canceled")}
                            className="cursor-pointer gap-2 text-rose-600 dark:text-rose-400 focus:text-rose-600"
                          >
                            <span className="w-2 h-2 rounded-full bg-rose-500" />
                            Cancelada (Rojo)
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            disabled={cita.status === "no_show" || isItemUpdating}
                            onClick={() => handleStatusChange(cita.id, "no_show")}
                            className="cursor-pointer gap-2 text-amber-700 dark:text-amber-400"
                          >
                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                            No asistió (Ámbar)
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="py-12 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-muted/60 text-muted-foreground mx-auto flex items-center justify-center mb-3">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">
              {hasActiveFilters
                ? "No se encontraron citas con los filtros aplicados"
                : "No hay citas programadas"}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              {hasActiveFilters
                ? "Prueba cambiando el criterio de búsqueda o limpiando los filtros para ver más resultados."
                : "Comienza registrando la primera cita haciendo clic en el botón 'Nueva Cita'."}
            </p>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="mt-3 text-xs h-8"
              >
                Limpiar Filtros
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
