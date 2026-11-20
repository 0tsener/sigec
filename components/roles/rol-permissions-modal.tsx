"use client";

import React, { useEffect, useState } from "react";
import { Shield, Loader2, Save, X, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { type RolWithPermissions } from "@/lib/validations/rol";

interface RolPermissionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rol: RolWithPermissions | null;
  onSave: (updatedRol: RolWithPermissions) => void;
}

const permissionGroups = {
  "Personas / Clientes": [
    { id: "personas.ver", label: "Ver" },
    { id: "personas.crear", label: "Crear" },
    { id: "personas.editar", label: "Editar" },
    { id: "personas.eliminar", label: "Eliminar" },
  ],
  "Servicios": [
    { id: "servicios.ver", label: "Ver" },
    { id: "servicios.crear", label: "Crear" },
    { id: "servicios.editar", label: "Editar" },
    { id: "servicios.eliminar", label: "Eliminar" },
  ],
  "Usuarios y Roles": [
    { id: "usuarios.ver", label: "Ver" },
    { id: "usuarios.editar", label: "Editar" },
  ],
  "Configuración": [
    { id: "configuracion.ver", label: "Ver" },
    { id: "configuracion.editar", label: "Editar" },
  ],
};

export function RolPermissionsModal({
  open,
  onOpenChange,
  rol,
  onSave,
}: RolPermissionsModalProps) {
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open && rol) {
      setSelectedPermissions(rol.permissions || []);
    }
  }, [open, rol]);

  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((p) => p !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSelectAllInGroup = (groupPermissions: string[]) => {
    const allSelected = groupPermissions.every((p) => selectedPermissions.includes(p));
    if (allSelected) {
      setSelectedPermissions((prev) =>
        prev.filter((p) => !groupPermissions.includes(p))
      );
    } else {
      setSelectedPermissions((prev) => [
        ...prev.filter((p) => !groupPermissions.includes(p)),
        ...groupPermissions,
      ]);
    }
  };

  const onSubmit = async () => {
    if (!rol) return;

    setIsSubmitting(true);
    const supabase = createClient();

    try {
      // Delete existing permissions for this role
      const { error: deleteError } = await supabase
        .from("role_permissions")
        .delete()
        .eq("role_id", rol.id);

      if (deleteError) {
        throw new Error(deleteError.message || "Error al eliminar permisos existentes");
      }

      // Insert new permissions
      if (selectedPermissions.length > 0) {
        const permissionsToInsert = selectedPermissions.map((permission) => ({
          role_id: rol.id,
          permission,
        }));

        const { error: insertError } = await supabase
          .from("role_permissions")
          .insert(permissionsToInsert);

        if (insertError) {
          throw new Error(insertError.message || "Error al guardar permisos");
        }
      }

      toast.success("Permisos actualizados correctamente", {
        description: `Los permisos del rol "${rol.name}" han sido actualizados.`,
      });

      onSave({
        ...rol,
        permissions: selectedPermissions,
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Ocurrió un error inesperado";
      toast.error("Error al guardar permisos", {
        description: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">
                Editar Permisos: {rol?.name}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Selecciona los permisos que deseas asignar a este rol
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {Object.entries(permissionGroups).map(([groupName, permissions]) => {
            const groupPermissionIds = permissions.map((p) => p.id);
            const allSelected = groupPermissionIds.every((p) =>
              selectedPermissions.includes(p)
            );
            const someSelected = groupPermissionIds.some((p) =>
              selectedPermissions.includes(p)
            );

            return (
              <div key={groupName} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">
                    {groupName}
                  </h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSelectAllInGroup(groupPermissionIds)}
                    className="text-xs h-7 px-2"
                  >
                    {allSelected ? (
                      <>
                        <X className="w-3.5 h-3.5 mr-1" />
                        Deseleccionar todo
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5 mr-1" />
                        {someSelected ? "Seleccionar todo" : "Seleccionar todo"}
                      </>
                    )}
                  </Button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {permissions.map((permission) => (
                    <div
                      key={permission.id}
                      className="flex items-center space-x-2 p-2 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <Checkbox
                        id={permission.id}
                        checked={selectedPermissions.includes(permission.id)}
                        onCheckedChange={() => handlePermissionToggle(permission.id)}
                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <Label
                        htmlFor={permission.id}
                        className="text-xs font-medium cursor-pointer flex-1"
                      >
                        {permission.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <DialogFooter className="flex-row items-center justify-end gap-2">
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
            type="button"
            onClick={onSubmit}
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
                Guardar Permisos
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
