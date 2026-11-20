"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Edit2,
  X,
  Filter,
  Shield,
  Users,
} from "lucide-react";

import { type UsuarioRecord } from "@/lib/validations/usuario";
import { UsuarioSheetForm } from "@/components/usuarios/usuario-sheet-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface UsuariosClientProps {
  initialData: UsuarioRecord[];
  roles: Array<{ id: string; name: string }>;
}

export function UsuariosClient({ initialData, roles }: UsuariosClientProps) {
  const [usuarios, setUsuarios] = useState<UsuarioRecord[]>(initialData);
  const [searchQuery, setSearchQuery] = useState("");
  const [estadoFilter, setEstadoFilter] = useState<string>("todos");

  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<UsuarioRecord | null>(null);

  useEffect(() => {
    setUsuarios(initialData);
  }, [initialData]);

  const handleCreate = () => {
    setSelectedUsuario(null);
    setSheetOpen(true);
  };

  const handleEdit = (usuario: UsuarioRecord) => {
    setSelectedUsuario(usuario);
    setSheetOpen(true);
  };

  const handleSuccess = (savedUsuario: UsuarioRecord, isEdit: boolean) => {
    if (isEdit) {
      setUsuarios((prev) =>
        prev.map((item) => (item.id === savedUsuario.id ? savedUsuario : item)),
      );
    } else {
      setUsuarios((prev) => [savedUsuario, ...prev]);
    }
  };

  const filteredUsuarios = useMemo(() => {
    return usuarios.filter((u) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        (u.nombre && u.nombre.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q));

      const matchEstado =
        estadoFilter === "todos" ||
        (u.estado && u.estado.toLowerCase() === estadoFilter.toLowerCase());

      return matchSearch && matchEstado;
    });
  }, [usuarios, searchQuery, estadoFilter]);

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
      case "pendiente":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Pendiente
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

  const getInitials = (nombre: string, email: string) => {
    const name = nombre || email?.split("@")[0] || "U";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="space-y-4">
      <div className="bg-card border rounded-lg p-3 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex flex-1 flex-col sm:flex-row gap-2.5 items-center">
          <div className="relative w-full sm:w-72 md:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar por nombre o email..."
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
              <option value="pendiente">Pendiente</option>
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
            Invitar Usuario
          </Button>
        </div>
      </div>

      <div className="border rounded-lg bg-card shadow-sm overflow-hidden">
        {filteredUsuarios.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b bg-muted/40 text-muted-foreground text-[11px] font-semibold uppercase tracking-wider">
                  <th className="py-2 px-3">Usuario</th>
                  <th className="py-2 px-3">Rol Asignado</th>
                  <th className="py-2 px-3">Estado</th>
                  <th className="py-2 px-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsuarios.map((usuario) => (
                  <tr
                    key={usuario.id}
                    onClick={() => handleEdit(usuario)}
                    className="hover:bg-muted/40 cursor-pointer transition-colors group"
                  >
                    <td className="py-2 px-3 text-xs">
                      <div className="flex items-center gap-2.5 min-w-[200px]">
                        <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[11px] shrink-0">
                          {getInitials(usuario.nombre, usuario.email)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                            {usuario.nombre}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {usuario.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-2 px-3 text-xs">
                      {usuario.rol_nombre ? (
                        <div className="flex items-center gap-1.5 text-foreground">
                          <Shield className="w-3 h-3 text-muted-foreground shrink-0" />
                          <span className="truncate max-w-[150px]">{usuario.rol_nombre}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground/50 italic text-[11px]">
                          Sin rol
                        </span>
                      )}
                    </td>

                    <td className="py-2 px-3 text-xs whitespace-nowrap">
                      {renderEstadoBadge(usuario.estado)}
                    </td>

                    <td className="py-2 px-3 text-xs text-right whitespace-nowrap">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(usuario);
                        }}
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                        title="Editar usuario"
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
                Mostrando {filteredUsuarios.length} de {usuarios.length} usuarios registrados
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
                  No se encontraron usuarios
                </h3>
                <p className="text-xs text-muted-foreground max-w-sm mb-4">
                  No hay usuarios que coincidan con los criterios de búsqueda o filtros seleccionados.
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
                  <Users className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-foreground mb-1">
                  Sin usuarios registrados
                </h3>
                <p className="text-xs text-muted-foreground max-w-sm mb-5">
                  No hay usuarios en tu organización. Comienza invitando al primer miembro del equipo.
                </p>
                <Button
                  type="button"
                  onClick={handleCreate}
                  size="sm"
                  className="text-xs h-9 font-semibold shadow-sm"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Invitar Primer Usuario
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      <UsuarioSheetForm
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        usuarioToEdit={selectedUsuario}
        roles={roles}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
