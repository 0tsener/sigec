"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Edit2,
  Users,
  Filter,
  X,
  Mail,
  Phone,
  Building2,
} from "lucide-react";

import { type PersonaRecord } from "@/lib/validations/persona";
import { PersonaSheetForm } from "@/components/personas/persona-sheet-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PersonasClientProps {
  initialData: PersonaRecord[];
}

export function PersonasClient({ initialData }: PersonasClientProps) {
  const [personas, setPersonas] = useState<PersonaRecord[]>(initialData);
  const [searchQuery, setSearchQuery] = useState("");
  const [tipoFilter, setTipoFilter] = useState<string>("todos");
  const [estadoFilter, setEstadoFilter] = useState<string>("todos");

  // Estados para el Sheet lateral
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<PersonaRecord | null>(null);

  // Abrir Sheet en modo creación
  const handleCreate = () => {
    setSelectedPersona(null);
    setSheetOpen(true);
  };

  // Abrir Sheet en modo edición
  const handleEdit = (persona: PersonaRecord) => {
    setSelectedPersona(persona);
    setSheetOpen(true);
  };

  // Callback al guardar o editar en el Sheet
  const handleSuccess = (savedPersona: PersonaRecord, isEdit: boolean) => {
    if (isEdit) {
      setPersonas((prev) =>
        prev.map((item) => (item.id === savedPersona.id ? savedPersona : item))
      );
    } else {
      setPersonas((prev) => [savedPersona, ...prev]);
    }
  };

  // Filtrado reactivo en tiempo real
  const filteredPersonas = useMemo(() => {
    return personas.filter((p) => {
      // Filtro de búsqueda
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        (p.nombre_completo && p.nombre_completo.toLowerCase().includes(q)) ||
        (p.empresa && p.empresa.toLowerCase().includes(q)) ||
        (p.email && p.email.toLowerCase().includes(q)) ||
        (p.doc_identidad && p.doc_identidad.toLowerCase().includes(q));

      // Filtro de tipo
      const matchTipo =
        tipoFilter === "todos" ||
        (p.tipo && p.tipo.toLowerCase() === tipoFilter.toLowerCase());

      // Filtro de estado
      const matchEstado =
        estadoFilter === "todos" ||
        (p.estado && p.estado.toLowerCase() === estadoFilter.toLowerCase());

      return matchSearch && matchTipo && matchEstado;
    });
  }, [personas, searchQuery, tipoFilter, estadoFilter]);

  // Helpers para renderizado de badges de tipo y estado
  const renderTipoBadge = (tipo: string) => {
    switch (tipo?.toLowerCase()) {
      case "cliente":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
            Cliente
          </span>
        );
      case "proveedor":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-900">
            Proveedor
          </span>
        );
      case "empleado":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
            Empleado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-muted text-muted-foreground border">
            {tipo || "N/A"}
          </span>
        );
    }
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
      case "pendiente":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Pendiente
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

  const hasActiveFilters =
    searchQuery !== "" || tipoFilter !== "todos" || estadoFilter !== "todos";

  const clearFilters = () => {
    setSearchQuery("");
    setTipoFilter("todos");
    setEstadoFilter("todos");
  };

  return (
    <div className="space-y-4">
      {/* Barra de herramientas superior */}
      <div className="bg-card border rounded-lg p-3 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex flex-1 flex-col sm:flex-row gap-2.5 items-center">
          {/* Input de búsqueda en tiempo real */}
          <div className="relative w-full sm:w-72 md:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar por nombre, empresa o email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs h-9 bg-background"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Filtro por Tipo */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <Filter className="h-3.5 w-3.5 text-muted-foreground hidden sm:block" />
            <select
              value={tipoFilter}
              onChange={(e) => setTipoFilter(e.target.value)}
              className="text-xs h-9 rounded-md border border-input bg-background px-2.5 py-1 text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring w-full sm:w-auto"
            >
              <option value="todos">Todos los Tipos</option>
              <option value="cliente">Cliente</option>
              <option value="proveedor">Proveedor</option>
              <option value="empleado">Empleado</option>
            </select>
          </div>

          {/* Filtro por Estado */}
          <div className="w-full sm:w-auto">
            <select
              value={estadoFilter}
              onChange={(e) => setEstadoFilter(e.target.value)}
              className="text-xs h-9 rounded-md border border-input bg-background px-2.5 py-1 text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring w-full sm:w-auto"
            >
              <option value="todos">Todos los Estados</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
              <option value="pendiente">Pendiente</option>
            </select>
          </div>

          {/* Botón para limpiar filtros */}
          {hasActiveFilters && (
            <Button
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

        {/* Botón primario de acción: + Nueva Persona */}
        <div className="flex items-center gap-2">
          <Button
            onClick={handleCreate}
            size="sm"
            className="text-xs h-9 font-semibold shadow-sm w-full md:w-auto"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Nueva Persona
          </Button>
        </div>
      </div>

      {/* Contenedor de la Tabla Densa */}
      <div className="border rounded-lg bg-card shadow-sm overflow-hidden">
        {filteredPersonas.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b bg-muted/40 text-muted-foreground text-[11px] font-semibold uppercase tracking-wider">
                  <th className="py-2.5 px-3">Nombre / Empresa</th>
                  <th className="py-2.5 px-3">Tipo</th>
                  <th className="py-2.5 px-3">Documento</th>
                  <th className="py-2.5 px-3">Contacto</th>
                  <th className="py-2.5 px-3">Estado</th>
                  <th className="py-2.5 px-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredPersonas.map((persona) => (
                  <tr
                    key={persona.id}
                    onClick={() => handleEdit(persona)}
                    className="hover:bg-muted/40 cursor-pointer transition-colors group"
                  >
                    {/* Nombre y Empresa */}
                    <td className="py-2 px-3 text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                          {persona.nombre_completo
                            ? persona.nombre_completo.charAt(0).toUpperCase()
                            : "P"}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                            {persona.nombre_completo}
                          </p>
                          {persona.empresa && (
                            <p className="text-[11px] text-muted-foreground flex items-center gap-1 truncate">
                              <Building2 className="w-3 h-3 shrink-0" />
                              {persona.empresa}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Tipo */}
                    <td className="py-2 px-3 text-xs whitespace-nowrap">
                      {renderTipoBadge(persona.tipo)}
                    </td>

                    {/* Documento de Identidad */}
                    <td className="py-2 px-3 text-xs text-muted-foreground whitespace-nowrap font-mono text-[11px]">
                      {persona.doc_identidad || (
                        <span className="text-muted-foreground/50 italic font-sans">
                          Sin doc.
                        </span>
                      )}
                    </td>

                    {/* Contacto (Email y Teléfono) */}
                    <td className="py-2 px-3 text-xs">
                      <div className="flex flex-col gap-0.5">
                        {persona.email ? (
                          <div className="flex items-center gap-1.5 text-foreground truncate max-w-[200px]">
                            <Mail className="w-3 h-3 text-muted-foreground shrink-0" />
                            <span className="truncate">{persona.email}</span>
                          </div>
                        ) : null}
                        {persona.telefono ? (
                          <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] truncate max-w-[200px]">
                            <Phone className="w-3 h-3 text-muted-foreground shrink-0" />
                            <span>{persona.telefono}</span>
                          </div>
                        ) : null}
                        {!persona.email && !persona.telefono && (
                          <span className="text-muted-foreground/50 italic text-[11px]">
                            Sin contacto
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Estado */}
                    <td className="py-2 px-3 text-xs whitespace-nowrap">
                      {renderEstadoBadge(persona.estado)}
                    </td>

                    {/* Acciones */}
                    <td className="py-2 px-3 text-xs text-right whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(persona);
                        }}
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                        title="Editar persona"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span className="sr-only">Editar</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Resumen inferior de la tabla */}
            <div className="py-2 px-3 border-t bg-muted/20 text-[11px] text-muted-foreground flex items-center justify-between">
              <span>
                Mostrando {filteredPersonas.length} de {personas.length} personas registradas
              </span>
              {hasActiveFilters && (
                <span className="text-primary font-medium">
                  Filtros activos aplicados
                </span>
              )}
            </div>
          </div>
        ) : (
          /* Estado Vacío (Empty State) */
          <div className="py-14 px-4 text-center flex flex-col items-center justify-center">
            {hasActiveFilters ? (
              <>
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3 text-muted-foreground">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1">
                  No se encontraron resultados
                </h3>
                <p className="text-xs text-muted-foreground max-w-sm mb-4">
                  No hay personas que coincidan con los filtros o el término de búsqueda ingresado.
                </p>
                <Button
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
                  <Users className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-foreground mb-1">
                  Sin personas registradas
                </h3>
                <p className="text-xs text-muted-foreground max-w-sm mb-5">
                  Aún no tienes clientes, proveedores o empleados dados de alta en tu organización.
                </p>
                <Button
                  onClick={handleCreate}
                  size="sm"
                  className="text-xs h-9 font-semibold shadow-sm"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Crear Primera Persona
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Formulario Modal Lateral (Sheet) */}
      <PersonaSheetForm
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        personaToEdit={selectedPersona}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
