"use client";

import React from "react";
import Link from "next/link";
import { UserCheck, FolderKanban, Users, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface QuickAction {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const quickActions: QuickAction[] = [
  {
    title: "Nuevo Cliente",
    description: "Registrar cliente en el directorio",
    href: "/protected/clientes",
    icon: Users,
    color: "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400",
  },
  {
    title: "Nuevo Empleado",
    description: "Agregar personal a la organización",
    href: "/protected/empleados",
    icon: UserCheck,
    color: "bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400",
  },
  {
    title: "Nuevo Servicio",
    description: "Crear servicio en el catálogo",
    href: "/protected/servicios",
    icon: FolderKanban,
    color: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400",
  },
];

export function QuickActions() {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold">
          Accesos Rápidos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.href} href={action.href}>
              <Button
                variant="ghost"
                className="w-full justify-start h-auto py-3 px-4 hover:bg-muted/50"
              >
                <div className={`w-9 h-9 rounded-lg ${action.color} flex items-center justify-center mr-3 shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-foreground">
                    {action.title}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {action.description}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground ml-2" />
              </Button>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
