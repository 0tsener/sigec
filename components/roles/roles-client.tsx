"use client";

import React, { useState } from "react";
import {
  Shield,
  ShieldCheck,
  Settings,
  Plus,
  Lock,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type RolWithPermissions } from "@/lib/validations/rol";
import { RolPermissionsModal } from "@/components/roles/rol-permissions-modal";

interface RolesClientProps {
  initialData: RolWithPermissions[];
}

const permissionGroups = {
  "Personas / Clientes": ["personas.ver", "personas.crear", "personas.editar", "personas.eliminar"],
  "Servicios": ["servicios.ver", "servicios.crear", "servicios.editar", "servicios.eliminar"],
  "Usuarios y Roles": ["usuarios.ver", "usuarios.editar"],
  "Configuración": ["configuracion.ver", "configuracion.editar"],
};

export function RolesClient({ initialData }: RolesClientProps) {
  const [roles, setRoles] = useState<RolWithPermissions[]>(initialData);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRol, setSelectedRol] = useState<RolWithPermissions | null>(null);

  const handleEditPermissions = (rol: RolWithPermissions) => {
    setSelectedRol(rol);
    setModalOpen(true);
  };

  const handlePermissionsSave = (updatedRol: RolWithPermissions) => {
    setRoles((prev) =>
      prev.map((r) => (r.id === updatedRol.id ? updatedRol : r))
    );
    setModalOpen(false);
    setSelectedRol(null);
  };

  const getRoleIcon = (roleName: string) => {
    const name = roleName.toLowerCase();
    if (name.includes("admin")) return ShieldCheck;
    if (name.includes("recepcion")) return Shield;
    if (name.includes("config") || name.includes("admin")) return Settings;
    return Shield;
  };

  const getRoleColor = (roleName: string) => {
    const name = roleName.toLowerCase();
    if (name.includes("admin")) return "bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900";
    if (name.includes("recepcion")) return "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900";
    if (name.includes("personal")) return "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900";
    return "bg-gray-50 dark:bg-gray-950/60 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-900";
  };

  const getPermissionSummary = (permissions: string[]) => {
    const summary: Record<string, number> = {};
    Object.entries(permissionGroups).forEach(([group, perms]) => {
      const count = permissions.filter((p) => perms.includes(p)).length;
      if (count > 0) {
        summary[group] = count;
      }
    });
    return summary;
  };

  if (roles.length === 0) {
    return (
      <div className="py-14 px-4 text-center flex flex-col items-center justify-center">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-3 text-primary shadow-inner">
          <Lock className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-foreground mb-1">
          Sin roles configurados
        </h3>
        <p className="text-xs text-muted-foreground max-w-sm mb-5">
          No hay roles definidos en el sistema. Comienza creando el primer rol.
        </p>
        <Button size="sm" className="text-xs h-9 font-semibold shadow-sm">
          <Plus className="w-4 h-4 mr-1.5" />
          Crear Primer Rol
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((rol) => {
          const Icon = getRoleIcon(rol.name);
          const colorClass = getRoleColor(rol.name);
          const permissionSummary = getPermissionSummary(rol.permissions);

          return (
            <Card key={rol.id} className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className={`w-10 h-10 rounded-lg ${colorClass} flex items-center justify-center`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {rol.permissions.length} permisos
                  </Badge>
                </div>
                <CardTitle className="text-base font-semibold mt-3">
                  {rol.name}
                </CardTitle>
                {rol.description && (
                  <CardDescription className="text-xs">
                    {rol.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  {Object.entries(permissionSummary).map(([group, count]) => (
                    <div key={group} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{group}</span>
                      <div className="flex items-center gap-1 text-foreground">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        <span className="font-medium">{count}</span>
                      </div>
                    </div>
                  ))}
                  {Object.keys(permissionSummary).length === 0 && (
                    <p className="text-xs text-muted-foreground italic">
                      Sin permisos asignados
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditPermissions(rol)}
                  className="w-full text-xs h-8"
                >
                  <Settings className="w-3.5 h-3.5 mr-1.5" />
                  Editar Permisos
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <RolPermissionsModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        rol={selectedRol}
        onSave={handlePermissionsSave}
      />
    </div>
  );
}
