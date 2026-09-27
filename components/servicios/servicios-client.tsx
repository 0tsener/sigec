"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Edit2,
  X,
  Filter,
  Clock,
  Layers,
  Sparkles,
} from "lucide-react";

import { type ServicioRecord } from "@/lib/validations/servicio";
import { ServicioSheetForm } from "@/components/servicios/servicio-sheet-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ServiciosClientProps {
  initialData: ServicioRecord[];
}

export function ServiciosClient({ initialData }: ServiciosClientProps) {
  const [servicios, setServicios] = useState<ServicioRecord[]>(initialData);
  const [searchQuery, setSearchQuery] = useState("");
  const [estadoFilter, setEstadoFilter] = useState<string>("todos");

  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedServicio, setSelectedServicio] = useState<ServicioRecord | null>(null);

  useEffect(() => {
    setServicios(initialData);
  }, [initialData]);

  const handleCreate = () => {
    setSelectedServicio(null);
    setSheetOpen(true);
  };

  const handleEdit = (servicio: ServicioRecord) => {
    setSelectedServicio(servicio);
    setSheetOpen(true);
  };

  const handleSuccess = (savedServicio: ServicioRecord, isEdit: boolean) => {
    if (isEdit) {
      setServicios((prev) =>
        prev.map((item) => (item.id === savedServicio.id ? savedServicio : item)),
      );
    } else {
      setServicios((prev) => [savedServicio, ...prev]);
    }
  };

  const filteredServicios = useMemo(() => {
    return servicios.filter((s) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        (s.nombre && s.nombre.toLowerCase().includes(q)) ||
        (s.codigo && s.codigo.toLowerCase().includes(q)) ||
        (s.categoria && s.categoria.toLowerCase().includes(q));

      const matchEstado =
        estadoFilter === "todos" ||
        (s.estado && s.estado.toLowerCase() === estadoFilter.toLowerCase());

      return matchSearch && matchEstado;
    });
  }, [servicios, searchQuery, estadoFilter]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-DO", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const renderEstadoBadge = (estado: string) => {
    switch (estado?.toLowerCase()) {
      case "activo":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Activo
          </span>
        );
      case "inactivo":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Inactivo
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-muted text-muted-foreground border">
            {estado || "N/A"}
          </span>
        );
    }
  };

  const hasActiveFilters = searchQuery !== "" || estadoFilter !== "todos";

  const clearFilters = () => {
    setSearchQuery("");
    setEstadoFilter("todos");
  };

  return (
    <div className="space-y-4">
      <div className="bg-card border rounded-lg p-3 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex flex-1 flex-col sm:flex-row gap-2.5 items-center">
          <div className="relative w-full sm:w-72 md:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar por nombre, código o categoría..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs h-9 bg-background"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <Filter className="h-3.5 w-3.5 text-muted-foreground hidden sm:block" />
            <select
              value={estadoFilter}
              onChange={(e) => setEstadoFilter(e.target.value)}
              className="text-xs h-9 rounded-md border border-input bg-background px-2.5 py-1 text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring w-full sm:w-auto"
              aria-label="Filtrar por estado"
            >
              <option value="todos">Todos</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>

          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-xs h-9 px-2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5 mr-1" />
              Limpiar
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={handleCreate}
            size="sm"
            className="text-xs h-9 font-semibold shadow-sm w-full md:w-auto"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Nuevo Servicio
          </Button>
        </div>
      </div>

      <div className="border rounded-lg bg-card shadow-sm overflow-hidden">
        {filteredServicios.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b bg-muted/40 text-muted-foreground text-[11px] font-semibold uppercase tracking-wider">
                  <th className="py-2 px-3">Código</th>
                  <th className="py-2 px-3">Nombre / Descripción</th>
                  <th className="py-2 px-3">Categoría</th>
                  <th className="py-2 px-3 text-right">Precio</th>
                  <th className="py-2 px-3 text-center">Duración</th>
                  <th className="py-2 px-3">Estado</th>
                  <th className="py-2 px-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredServicios.map((servicio) => (
                  <tr
                    key={servicio.id}
                    onClick={() => handleEdit(servicio)}
                    className="hover:bg-muted/40 cursor-pointer transition-colors group"
                  >
                    <td className="py-2 px-3 text-xs whitespace-nowrap font-mono text-[11px] text-muted-foreground">
                      {servicio.codigo ? (
                        <span className="font-semibold text-foreground">
                          {servicio.codigo}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/40 italic font-sans">
                          S/C
                        </span>
                      )}
                    </td>

                    <td className="py-2 px-3 text-xs">
                      <div className="flex flex-col gap-0.5 min-w-[200px] max-w-sm">
                        <span className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                          {servicio.nombre}
                        </span>
                        {servicio.descripcion && (
                          <span className="text-[11px] text-muted-foreground line-clamp-1 truncate">
                            {servicio.descripcion}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-2 px-3 text-xs whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-muted text-foreground border border-border">
                        <Layers className="w-3 h-3 text-muted-foreground" />
                        {servicio.categoria || "General"}
                      </span>
                    </td>

                    <td className="py-2 px-3 text-xs text-right whitespace-nowrap font-semibold text-foreground">
                      {formatCurrency(Number(servicio.precio) || 0)}
                    </td>

                    <td className="py-2 px-3 text-xs text-center whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground font-mono">
                        <Clock className="w-3 h-3 text-primary" />
                        {servicio.duracion_minutos} min
                      </span>
                    </td>

                    <td className="py-2 px-3 text-xs whitespace-nowrap">
                      {renderEstadoBadge(servicio.estado)}
                    </td>

                    <td className="py-2 px-3 text-xs text-right whitespace-nowrap">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(servicio);
                        }}
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                        title="Editar servicio"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span className="sr-only">Editar</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="py-2 px-3 border-t bg-muted/20 text-[11px] text-muted-foreground flex items-center justify-between">
              <span>
                Mostrando {filteredServicios.length} de {servicios.length} servicios registrados
              </span>
              {hasActiveFilters && (
                <span className="text-primary font-medium">Filtros aplicados</span>
              )}
            </div>
          </div>
        ) : (
          <div className="py-14 px-4 text-center flex flex-col items-center justify-center">
            {hasActiveFilters ? (
              <>
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3 text-muted-foreground">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1">
                  No se encontraron servicios
                </h3>
                <p className="text-xs text-muted-foreground max-w-sm mb-4">
                  No hay servicios que coincidan con los criterios de búsqueda o filtros seleccionados.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="text-xs h-8"
                >
                  <X className="w-3.5 h-3.5 mr-1" />
                  Restablecer Filtros
                </Button>
              </>
            ) : (
              <>
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-3 text-primary shadow-inner">
                  <Sparkles className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-foreground mb-1">
                  Catálogo de servicios vacío
                </h3>
                <p className="text-xs text-muted-foreground max-w-sm mb-5">
                  Aún no has registrado tarifas, servicios ni tiempos de atención en tu catálogo.
                </p>
                <Button
                  type="button"
                  onClick={handleCreate}
                  size="sm"
                  className="text-xs h-9 font-semibold shadow-sm"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Crear Primer Servicio
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      <ServicioSheetForm
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        servicioToEdit={selectedServicio}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
