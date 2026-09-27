"use client";

import React from "react";
import { Clock, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RecentActivityProps {
  recentClientes: Array<{
    id: string;
    nombres: string;
    apellidos: string;
    created_at: string;
  }>;
}

export function RecentActivity({ recentClientes }: RecentActivityProps) {
  if (!recentClientes || recentClientes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
          <Clock className="w-6 h-6 text-muted-foreground" />
        </div>
        <h3 className="text-sm font-semibold text-foreground mb-1">
          Sin actividad reciente
        </h3>
        <p className="text-xs text-muted-foreground max-w-sm">
          No hay registros recientes en el sistema.
        </p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Ahora mismo";
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} h`;
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  };

  return (
    <div className="space-y-3">
      {recentClientes.map((cliente) => (
        <div
          key={cliente.id}
          className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
              {cliente.nombres?.charAt(0)?.toUpperCase() || "C"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {cliente.nombres} {cliente.apellidos}
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDate(cliente.created_at)}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
          >
            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
          </Button>
        </div>
      ))}
    </div>
  );
}
